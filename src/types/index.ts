export interface User {
  Id: string;
  Name: string;
  AccessToken?: string;
}

export interface ServerConfig {
  url: string;
}

export interface Library {
  Id: string;
  Name: string;
  CollectionType?: string;
}

export interface MediaItem {
  Id: string;
  Name: string;
  Type: string;
  RunTimeTicks?: number;
  ProductionYear?: number;
  SeriesName?: string;
  ImageTags?: {
    Primary?: string;
  };
  UserData?: {
    IsFavorite: boolean;
    Played: boolean;
    PlaybackPositionTicks: number;
  };
}

export interface AppSettings {
  serverUrl: string;
  user?: User;
  selectedLibraryId?: string;
  filters: {
    playStatus: 'All' | 'Unplayed' | 'Played';
    favoriteStatus: 'All' | 'Favorites' | 'NonFavorites';
    sorting: 'Shuffle' | 'DateDesc' | 'DateAsc';
  };
}
