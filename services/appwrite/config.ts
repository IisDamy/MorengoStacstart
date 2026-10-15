import {
  Account,
  Client,
  Databases,
  Functions,
  Messaging,
  Storage,
  TablesDB,
} from "react-native-appwrite";

export const appwriteConfig = {
  endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT || "https://fra.cloud.appwrite.io/v1",
  projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT || "",
  databaseId: "69736bf7000636aa3743",
  bucketId: "69dfa5e5000d8cf8677f",
  functionId: "6a3d43d6000f11832aab",
  userCollectionId: "user",
  cartCollectionId: "",
  vendorsCollectionId: "",
  ordersCollectionId: "",
  paymentsCollectionId: "",
  reviewsCollectionId: "",
  menuCollectionId: "",
};

export const client = new Client();

client
  .setEndpoint(appwriteConfig.endpoint)
  .setProject(appwriteConfig.projectId)
  .setPlatform("com.Morengo.DeliverU");

export const account = new Account(client);
export const databases = new Databases(client);
export const tablesDB = new TablesDB(client);
export const storage = new Storage(client);
export const messaging = new Messaging(client);
export const functions = new Functions(client);

export { ID } from "react-native-appwrite";
