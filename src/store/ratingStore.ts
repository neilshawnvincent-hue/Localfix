import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

type RatingState = {
  // Map of jobId -> star rating (1..5) the customer left.
  ratings: Record<string, number>;

  // True once the persisted ratings have been read back from storage.
  hasHydrated: boolean;

  setRating: (jobId: string, stars: number) => void;
  getRating: (jobId: string) => number;
  setHasHydrated: (value: boolean) => void;
};

export const useRatingStore = create<RatingState>()(
  persist(
    (set, get) => ({
      ratings: {},
      hasHydrated: false,

      setRating: (jobId, stars) =>
        set((state) => ({
          ratings: { ...state.ratings, [jobId]: stars },
        })),

      getRating: (jobId) => get().ratings[jobId] ?? 0,

      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: 'localfix-ratings',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ ratings: state.ratings }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
