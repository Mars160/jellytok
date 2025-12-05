import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppSettings, User, ItemFilter } from '../types';

interface AppState extends AppSettings {
  setServerUrl: (url: string) => void;
  setUser: (user: User) => void;
  setSelectedLibraryId: (id: string) => void;
  setBitrate: (bitrate: number) => void;
  setDirectPlayFirst: (enabled: boolean) => void;
  toggleFilter: (filter: ItemFilter) => void;
  setSorting: (sorting: AppSettings['filters']['sorting']) => void;
  reset: () => void;
}

const initialState: AppSettings = {
  serverUrl: '',
  user: undefined,
  selectedLibraryId: undefined,
  bitrate: 100000000, // Default 100 Mbps
  directPlayFirst: false,
  filters: {
    selected: [],
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
      setDirectPlayFirst: (enabled) => set({ directPlayFirst: enabled }),
      toggleFilter: (filter) =>
        set((state) => {
          const currentSelected = state.filters.selected || [];
          const selected = currentSelected.includes(filter)
            ? currentSelected.filter((f) => f !== filter)
            : [...currentSelected, filter];
          return { filters: { ...state.filters, selected } };
        }),
      setSorting: (sorting) =>
        set((state) => ({
          filters: { ...state.filters, sorting },
        })),
      reset: () => set(initialState),
    }),
    {
      name: 'jellytok-storage',
      version: 1,
      migrate: (persistedState: any, version) => {
        if (version === 0) {
          return {
            ...persistedState,
            filters: {
              selected: [],
              sorting: persistedState.filters?.sorting || 'Shuffle',
            },
          };
        }
        return persistedState as AppState;
      },
    }
  )
);
