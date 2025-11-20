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

  getStreamUrl: (itemId: string) => {
    const baseUrl = getBaseUrl();
    // Using static=true for direct play as per requirements, but HLS is recommended.
    // For simplicity in this MVP, we'll try direct stream first or HLS if needed.
    // Let's stick to the requirement's "Direct Play" example for now, or HLS.
    // HLS is better for compatibility.
    // {BASE_URL}/Videos/{ItemId}/master.m3u8?MediaSourceId={...}&PlaySessionId={...}
    // For now, let's use a simple video stream endpoint which Jellyfin often redirects or handles.
    // Or the "stream" endpoint.
    return `${baseUrl}/Videos/${itemId}/stream?static=true`;
  },
};
