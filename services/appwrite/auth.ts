import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { OAuthProvider, Query } from "react-native-appwrite";

import useAuthStore from "@/store/auth.store";
import type { CreateUserParams, SignInParams, User } from "@/types";
import { account, appwriteConfig, ID, tablesDB } from "@/services/appwrite/config";

export const refreshAuthStore = async () => {
  try {
    const authStore = (await import("@/store/auth.store")).default;
    await authStore.getState().fetchAuthenticatedUser();
    return true;
  } catch (error) {
    console.error("refreshAuthStore error", error);
    return false;
  }
};

export const clearAuthStore = async () => {
  try {
    const authStore = (await import("@/store/auth.store")).default;
    authStore.getState().setIsAuthenticated(false);
    authStore.getState().setUser(null);
  } catch (error) {
    console.error("clearAuthStore error", error);
  }
};

export const createUser = async ({
  email,
  password,
  name,
  institution,
  phone,
  isStudent,
}: CreateUserParams) => {
  try {
    const { setUser, setIsAuthenticated } = useAuthStore.getState();

    const newAccount = await account.create({
      userId: ID.unique(),
      email,
      password,
      name,
    });

    if (!newAccount) {
      throw new Error("Failed to create account");
    }

    await SignIn({ email, password });

    const createdUser = await tablesDB.createRow({
      databaseId: appwriteConfig.databaseId,
      tableId: appwriteConfig.userCollectionId,
      rowId: ID.unique(),
      data: {
        accountId: newAccount.$id,
        email,
        name,
        institution,
        phone,
        isStudent,
        points: 0,
      },
    });

    if (!createdUser) {
      throw new Error("Failed to create user profile");
    }

    const userData: User = {
      ...createdUser,
      points: createdUser.points ?? 0,
      $collectionId: appwriteConfig.userCollectionId,
    };

    setUser(userData);
    setIsAuthenticated(true);

    return createdUser;
  } catch (error: any) {
    throw new Error(error?.message || "Something went wrong");
  }
};

export const SignIn = async ({ email, password }: SignInParams) => {
  try {
    await account.createEmailPasswordSession({ email, password });
    await refreshAuthStore();
    return true;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : "Failed to sign in");
  }
};

export const OAuthSignIn = async () => {
  try {
    const redirectUri = Linking.createURL("/");
    const loginUrl = await account.createOAuth2Token({
      provider: OAuthProvider.Google,
      success: redirectUri,
    });

    if (!loginUrl) throw new Error("Failed to login");

    const result = await WebBrowser.openAuthSessionAsync(`${loginUrl}`, redirectUri);

    if (result.type !== "success" || !result.url) {
      throw new Error("Failed to login");
    }

    const url = new URL(result.url);
    const secret = url.searchParams.get("secret")?.toString();
    const userId = url.searchParams.get("userId")?.toString();

    if (!secret || !userId) throw new Error("Failed to login");

    const session = await account.createSession({ userId, secret });

    if (!session) throw new Error("Failed to create session");

    await refreshAuthStore();
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

export const signOut = async () => {
  try {
    await account.deleteSession({ sessionId: "current" });
    await clearAuthStore();
    return true;
  } catch (error) {
    console.error("Sign Out Error:", error);
    return false;
  }
};

export const getCurrentUser = async () => {
  try {
    const currentAccount = await account.get();

    if (!currentAccount) {
      throw new Error("No authenticated account found");
    }

    const currentUser = await tablesDB.listRows({
      databaseId: appwriteConfig.databaseId,
      tableId: appwriteConfig.userCollectionId,
      queries: [Query.equal("accountId", currentAccount.$id)],
    });

    return currentUser.rows[0] ?? null;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : "Failed to fetch current user");
  }
};
