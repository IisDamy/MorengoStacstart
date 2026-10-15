import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { getCurrentUser } from "@/services/appwrite/auth";
import type { User } from "@/types";

type AuthState = {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;

  setIsAuthenticated: (value: boolean) => void;
  setUser: (user: User | null) => void;
  setIsLoading: (loading: boolean) => void;
  fetchAuthenticatedUser: () => Promise<void>;
};

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      isLoading: true,

      setIsAuthenticated: (value) => set({ isAuthenticated: value }),
      setUser: (user) => set({ user }),
      setIsLoading: (value) => set({ isLoading: value }),

      fetchAuthenticatedUser: async () => {
        set({ isLoading: true });

        try {
          const user = await getCurrentUser();
          set({
            isAuthenticated: Boolean(user),
            user: (user as User) ?? null,
          });
        } catch (error) {
          console.log("fetchAuthenticatedUser error", error);
          set({ isAuthenticated: false, user: null });
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: "user",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useAuthStore;
