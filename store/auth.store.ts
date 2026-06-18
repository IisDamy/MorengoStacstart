import { getCurrentUser } from "@/lib/appwrite";
import { User } from "@/types";
import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { persist, createJSONStorage } from "zustand/middleware";


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
     (set, get) => ({
  isAuthenticated: false,
  user: null,
  isLoading: true,

  setIsAuthenticated: (value) => set({ isAuthenticated: value }),
  setUser: (user) => set({ user: user }),
  setIsLoading: (value) => set({ isLoading: value }),


  fetchAuthenticatedUser: async () => {
    
    set({ isLoading: true });
    
    try {
      
    
      const user = await getCurrentUser();
      if (user ) set({ isAuthenticated: true, user: user as User});
      else set({ isAuthenticated: false, user: null });
    } catch (e) {
      console.log("fetchAuthenticatedUser error", e);
      set({ isAuthenticated: false, user: null });
    } finally {
      set({ isLoading: false });
    }
  },
}),
{
  name:'user',
  storage: createJSONStorage(()=> AsyncStorage)

}
  )
 );

export default useAuthStore;
