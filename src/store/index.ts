import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SidebarState } from '../types/store';
// Zustand store with persistence using localStorage
export const useSidebarStore = create(
  persist<SidebarState>(
    (set) => ({
      components: false,
      utilities: false,
      pages: false,
      toggleSection: (section) =>
        set((state) => ({
          ...state,
          [section]: !state[section],
        })),
    }),
    {
      name: 'sidebarOpenState', // Name of the key in localStorage
    },
  ),
);
