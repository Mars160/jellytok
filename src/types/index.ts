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
  MediaSources?: {
    Id: string;
    Container: string;
    SupportsDirectStream: boolean;
    SupportsTranscoding: boolean;
  }[];
  UserData?: {
    IsFavorite: boolean;
    Played: boolean;
    PlaybackPositionTicks: number;
  };
}

export type ItemFilter = 
  | 'IsUnplayed' 
  | 'IsPlayed' 
  | 'IsFavorite' 
  | 'IsResumable' 
  | 'Likes' 
  | 'Dislikes';

export interface AppSettings {
  serverUrl: string;
  user?: User;
  selectedLibraryId?: string;
  bitrate: number;
  directPlayFirst: boolean;
  filters: {
    selected: ItemFilter[];
    sorting: 'Shuffle' | 'DateDesc' | 'DateAsc';
  };
}
