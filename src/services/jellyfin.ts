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
      playStatus: string;
      favoriteStatus: string;
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
    if (filters.playStatus === 'Unplayed') params.IsPlayed = false;
    if (filters.playStatus === 'Played') params.IsPlayed = true;
    if (filters.favoriteStatus === 'Favorites') params.IsFavorite = true;
    if (filters.favoriteStatus === 'NonFavorites') params.IsFavorite = false;

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

  getStreamUrl: (itemId: string, container?: string) => {
    const baseUrl = getBaseUrl();
    const token = useStore.getState().user?.AccessToken;
    const ext = container ? `.${container}` : '';
    return `${baseUrl}/Videos/${itemId}/stream${ext}?static=true&api_key=${token}`;
  },

  getHlsUrl: (itemId: string, mediaSourceId?: string) => {
    const baseUrl = getBaseUrl();
    const state = useStore.getState();
    const token = state.user?.AccessToken;
    const bitrate = state.bitrate || 100000000;

    const params = new URLSearchParams({
      MediaSourceId: mediaSourceId || itemId,
      PlaySessionId: Date.now().toString(),
      api_key: token || '',
      VideoCodec: 'h264',
      AudioCodec: 'aac',
      TranscodingContainer: 'ts',
      SegmentContainer: 'ts',
      AllowVideoStreamCopy: 'true',
      AllowAudioStreamCopy: 'true',
      VideoBitrate: bitrate.toString(),
    });
    return `${baseUrl}/Videos/${itemId}/master.m3u8?${params.toString()}`;
  },
};
