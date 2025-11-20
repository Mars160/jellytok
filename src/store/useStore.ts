import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppSettings, User } from '../types';

interface AppState extends AppSettings {
  setServerUrl: (url: string) => void;
  setUser: (user: User) => void;
  setSelectedLibraryId: (id: string) => void;
  setBitrate: (bitrate: number) => void;
  setFilter: (key: keyof AppSettings['filters'], value: string) => void;
  reset: () => void;
}

const initialState: AppSettings = {
  serverUrl: '',
  user: undefined,
  selectedLibraryId: undefined,
  bitrate: 100000000, // Default 100 Mbps
  filters: {
    playStatus: 'All',
    favoriteStatus: 'All',
    sorting: 'Shuffle',
  },
};

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      ...initialState,
      setServerUrl: (url) => set({ serverUrl: url }),
      setUser: (user) => set({ user }),
      setSelectedLibraryId: (id) => set({ selectedLibraryId: id }),
      setBitrate: (bitrate) => set({ bitrate }),
      setFilter: (key, value) =>
        set((state) => ({
          filters: { ...state.filters, [key]: value },
        })),
      reset: () => set(initialState),
    }),
    {
      name: 'jellytok-storage',
    }
  )
);
