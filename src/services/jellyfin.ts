import axios from 'axios';
import { useStore } from '../store/useStore';
import type { MediaItem, User, Library } from '../types';

const getBaseUrl = () => {
  const url = useStore.getState().serverUrl;
  return url.endsWith('/') ? url.slice(0, -1) : url;
};

const getAuthHeader = () => {
  const token = useStore.getState().user?.AccessToken;
  return token ? { 'X-Emby-Token': token } : {};
};

const getClientHeaders = () => ({
  'X-Emby-Authorization': 'MediaBrowser Client="JellyTok", Device="Web", DeviceId="jellytok-web", Version="1.0.0"',
});

export const jellyfinApi = {
  authenticate: async (username: string, pw: string): Promise<User> => {
    const baseUrl = getBaseUrl();
    const response = await axios.post(
      `${baseUrl}/Users/AuthenticateByName`,
      { Username: username, Pw: pw },
      { headers: { ...getClientHeaders() } }
    );
    return {
      Id: response.data.User.Id,
      Name: response.data.User.Name,
      AccessToken: response.data.AccessToken,
    };
  },

  getViews: async (userId: string): Promise<Library[]> => {
    const baseUrl = getBaseUrl();
    const response = await axios.get(`${baseUrl}/Users/${userId}/Views`, {
      headers: { ...getAuthHeader() },
    });
    return response.data.Items;
  },

  getItems: async (
    userId: string,
    parentId: string,
    filters: {
      selected: string[];
      sorting: string;
    },
    startIndex = 0,
    limit = 20
  ): Promise<MediaItem[]> => {
    const baseUrl = getBaseUrl();
    const params: any = {
      ParentId: parentId,
      IncludeItemTypes: 'Movie,Video,Episode,MusicVideo',
      Recursive: true,
      Fields: 'Path,MediaSources,RunTimeTicks,ProductionYear,SeriesName,UserData',
      Limit: limit,
      StartIndex: startIndex,
      ImageTypeLimit: 1,
    };

    // Apply Filters
    if (filters.selected && filters.selected.length > 0) {
      params.Filters = filters.selected.join(',');
    }

    // Apply Sorting
    if (filters.sorting === 'Shuffle') {
      params.SortBy = 'Random';
    } else if (filters.sorting === 'DateDesc') {
      params.SortBy = 'DateCreated';
      params.SortOrder = 'Descending';
    } else if (filters.sorting === 'DateAsc') {
      params.SortBy = 'DateCreated';
      params.SortOrder = 'Ascending';
    }

    const response = await axios.get(`${baseUrl}/Users/${userId}/Items`, {
      params,
      headers: { ...getAuthHeader() },
    });
    return response.data.Items;
  },

  toggleFavorite: async (userId: string, itemId: string, isFavorite: boolean) => {
    const baseUrl = getBaseUrl();
    const method = isFavorite ? 'DELETE' : 'POST';
    await axios({
      method,
      url: `${baseUrl}/Users/${userId}/FavoriteItems/${itemId}`,
      headers: { ...getAuthHeader() },
    });
  },

  getImageUrl: (itemId: string, tag?: string) => {
    const baseUrl = getBaseUrl();
    if (!tag) return '';
    return `${baseUrl}/Items/${itemId}/Images/Primary?tag=${tag}&quality=90`;
  },

  // 获取直接播放地址 (Direct Play)
  getStreamUrl: (itemId: string, container?: string) => {
    // const baseUrl = getBaseUrl();
    // const token = useStore.getState().user?.AccessToken;
    // 
    // // static=true 告诉 Jellyfin 我们想要静态文件，不要任何处理
    // 
    const baseUrl = getBaseUrl();
    const state = useStore.getState();
    const ext = container ? `.${container}` : '';

    // 修改：移除 VideoCodec 和 AudioCodec 的强制指定
    // 允许 Jellyfin 根据服务器分析来决定是否 Direct Stream (Copy)
    const params = new URLSearchParams({
      MediaSourceId: itemId,
      PlaySessionId: Date.now().toString(),
      api_key: state.user?.AccessToken || '',
      // VideoCodec: 'h264', // 移除：不要强制转码
      AudioCodec: 'aac',  // 移除：不要强制转码
      TranscodingContainer: 'ts',
      SegmentContainer: 'ts',
      EnableAutoStreamCopy: 'true', // 关键：启用自动流复制
      AllowVideoStreamCopy: 'true', // 关键：允许直接复制视频流
      AllowAudioStreamCopy: 'true', // 关键：允许直接复制音频流
      static: 'true'
    });
    //return `${baseUrl}/Videos/${itemId}/master.m3u8?`;
    return `${baseUrl}/Videos/${itemId}/stream${ext}?${params.toString()}`;
  },

  // 获取 HLS 地址 (用于回退或转码)
  getHlsUrl: (itemId: string, mediaSourceId?: string) => {
    const baseUrl = getBaseUrl();
    const state = useStore.getState();
    const bitrate = (state.bitrate || 100000000);

    // 修改：移除 VideoCodec 和 AudioCodec 的强制指定
    // 允许 Jellyfin 根据服务器分析来决定是否 Direct Stream (Copy)
    const params = new URLSearchParams({
      MediaSourceId: mediaSourceId || itemId,
      PlaySessionId: Date.now().toString(),
      api_key: state.user?.AccessToken || '',
      VideoCodec: 'h264', // 移除：不要强制转码
      AudioCodec: 'aac',  // 移除：不要强制转码
      TranscodingContainer: 'ts',
      SegmentContainer: 'ts',
      EnableAutoStreamCopy: 'true', // 关键：启用自动流复制
      AllowVideoStreamCopy: 'true', // 关键：允许直接复制视频流
      AllowAudioStreamCopy: 'true', // 关键：允许直接复制音频流
      VideoBitRate: bitrate.toString(),
    });
    return `${baseUrl}/Videos/${itemId}/master.m3u8?${params.toString()}`;
  },

  reportPlaybackProgress: async (itemId: string, mediaSourceId: string, ticks: number, isPaused: boolean) => {
    const baseUrl = getBaseUrl();
    
    await axios.post(
      `${baseUrl}/Sessions/Playing/Progress`,
      {
        ItemId: itemId,
        MediaSourceId: mediaSourceId,
        PositionTicks: ticks,
        IsPaused: isPaused,
        EventName: 'TimeUpdate'
      },
      { headers: { ...getAuthHeader() } }
    );
  },
};