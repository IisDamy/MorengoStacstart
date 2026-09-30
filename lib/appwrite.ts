import { Address, BookingPayload, CartItemType, CreateUserParams, GetItemParams, GetVendorParams, MenuItem, Order, SignInParams, Vendor} from "@/types";
import { makeRedirectUri } from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import * as Linking from 'expo-linking';
import {
  Account,
  Avatars,
  Client,
  Databases,
  ID,
  Messaging,
  Storage,
  OAuthProvider,
  Query,
  TablesDB,
  Functions
} from "react-native-appwrite";
import useAuthStore from "@/store/auth.store";
import User from '@/types';
import { EventPayload } from "@/types";
import { calcPlatformFee, nairaToKobo } from "@/constants/utils";
import { Q } from "@nozbe/watermelondb";
import {  Permission, Role } from "appwrite"; 
// # dont forget to delete this and add complete eas build for secrets before launch
// # use eas secret:list to get already created secrets

// # use this to replace keys
// # import Constants from 'expo-constants';
// # const { appwriteDatabaseId, appwriteProjectId } = Constants.expoConfig.extra;
export {ID}

export const appwriteConfig = {

  // # dont forget to delete this and add complete eas build before launch


  endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1',
  projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT || '',
  databaseId: "69736bf7000636aa3743",
  bucketId:"69dfa5e5000d8cf8677f",
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
export const functions = new Functions(client)

export const createUser = async ({
  email,
  password,
  name,
  institution,
  phone,
  isStudent,
}: CreateUserParams) => {
  try {
    const { setUser, setIsAuthenticated } =
      useAuthStore.getState();

    // Create auth account
    const newAccount = await account.create({
      userId: ID.unique(),
      email,
      password,
      name,
    });

    if (!newAccount) {
      throw new Error("Failed to create account");
    }

    // Sign in
    await SignIn({ email, password });

    // Create profile row
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

  // required fields for your User interface
  points: createdUser.points ?? 0,

  // if Models.Document expects this
  $collectionId: appwriteConfig.userCollectionId,
};


    setUser(userData);

    setIsAuthenticated(true);

    return createdUser;
  } catch (e: any) {
    throw new Error(e.message || "Something went wrong");
  }
};

export const SignIn = async ({ email, password }: SignInParams) => {
  try {
    const session = await account.createEmailPasswordSession({
      email,
      password,
    });
     await refreshAuthStore(); 
  } catch (e) {
    throw new Error(e as string);
  }
};


export const OAuthSignIn = async () => {
  try {
    const redirectUri = Linking.createURL('/') 

    const loginUrl = await account.createOAuth2Token({
    provider: OAuthProvider.Google,
    success:redirectUri
});
  if(!loginUrl) throw new Error('Failed to login')

const result = await WebBrowser.openAuthSessionAsync(`${loginUrl}`, redirectUri);

if (result.type !== 'success' || !result.url) {
    throw new Error('Failed to login');
}

const url = new URL(result.url);
const secret = url.searchParams.get('secret')?.toString();
const userId = url.searchParams.get('userId')?.toString();

if(!secret || !userId) throw new Error('Failed to login')
// Create session with OAuth credentials
const session = await account.createSession({
    userId,
    secret
});

if (!session) throw new Error('Failed to create session')
await refreshAuthStore(); 
return true

  } catch (e) {
    console.error(e)
    return false
  }
};



export const signOut = async () => {
  try {
     await account.deleteSession({ sessionId: "current" });
      await clearAuthStore();
     return true
  } catch (error) {
    console.error("Sign Out Error:", error);
    return false
  }
};

export const getCurrentUser = async () => {
  try {
    const currentAccount = await account.get();
    
    if (!currentAccount) throw Error;

    const currentUser = await tablesDB.listRows({
      databaseId: appwriteConfig.databaseId,
      tableId: appwriteConfig.userCollectionId,
      queries: [
        Query.equal("accountId", currentAccount.$id),

      
      ]
        
    });

    if (!currentAccount) throw Error;
    return currentUser.rows[0];
  } catch (e) {
    throw new Error(e as string);
  }
};



export const getMenuItems = async ({ isFavourite, query, vendors}: GetItemParams) => {
  try {
    const queries = [];

    queries.push(
      Query.select([
        '*',
        'vendors.name',
        'vendors.$id',
        'vendors.open',
        'vendors.closes',
        'vendors.rating',
      ])
    )
    if (vendors) queries.push(Query.equal('vendors', vendors));
    if (isFavourite) queries.push(Query.equal("isFavourite", true));
    if (query) queries.push(Query.search("name", query));
    // if (category) queries.push(Query.contains("category", [category]));

    // change listdocuments
    const menus = await tablesDB.listRows(
    {  
      databaseId:appwriteConfig.databaseId,
      tableId:'menu',
      queries,
    }
    );

    return menus.rows;
  } catch (e) {
    throw new Error(e as string);
  }
};


export const  createMenuItem = async (
  vendorId:string,
  name:string,
  price:number,
  image:string

) => {
 try{
    const res = await tablesDB.createRow({
      databaseId:appwriteConfig.databaseId,
      tableId:'vendors',
      rowId:ID.unique(),
      data:{
        vendors: vendorId,
        name:name,
        price:price,
        image:image
      }
    })
    if (res) return true
  }
  catch(e){
    // return false
    throw new Error(e as string)
  }
}



// update this,i just coppied getmenu, make changes


export const recoverPassword = async (email:string)=>{
  try{

    const redirectUri = Linking.createURL('/') 
     await account.createRecovery({
      email,
      url:redirectUri
    })

    return { success: true };

  }
catch(e:any){
  console.error(e)
  return {
      success: false,
      message: e?.message || "Failed to initiate password recovery",
    };
}
}






// can make this general function for updating where we set tableid, pass accountid and pass data
// finish ts

export const updateUser = async ({
  name,
  institution,
  phone,
  userId,
  email,
  avatar,
  defaultAddress
}: {
  name: string | undefined;
  institution: string | undefined;
  phone: string | undefined;
  userId: string | undefined;
  email: string | undefined;
  avatar: string | undefined;
  defaultAddress?: Address | undefined;
}) => {
  try {
    const { setUser, user: currentUser } =
      useAuthStore.getState();

    // Fetch current DB user
    const userRes = await tablesDB.listRows({
      databaseId: appwriteConfig.databaseId,
      tableId: appwriteConfig.userCollectionId,
      queries: [Query.equal("$id", userId)],
    });

    const existingUser = userRes.rows[0];

    if (!existingUser) {
      throw new Error("User not found");
    }

    // Delete old avatar only if replacing it
    if (
      avatar &&
      existingUser.avatar &&
      avatar !== existingUser.avatar
    ) {
      await storage.deleteFile({
        bucketId: appwriteConfig.bucketId,
        fileId: existingUser.avatar,
      });
    }

    // Update DB
    const updatedUser = await tablesDB.updateRow({
      databaseId: appwriteConfig.databaseId,
      tableId: appwriteConfig.userCollectionId,
      rowId: userId!,
      data: {
        name,
        institution,
        phone,
        email,
        avatar,
        defaultAddress,
      },
    });

    // Update Zustand → automatically updates AsyncStorage
    setUser({
      ...currentUser,
      ...updatedUser,
    });

    return true;

  } catch (e: any) {
    throw new Error(e.message || "Failed to update user");
  }
};



export const getVendors = async ({ categories, query, }: GetVendorParams) => {
    try {
        const queries: string[] = [];

        if(categories) queries.push(Query.equal('categories', categories));
        if(query) queries.push(Query.search('name', query));

        const vendors = await tablesDB.listRows(
           { databaseId: appwriteConfig.databaseId,
            tableId: 'vendors',
            queries }
        )

        return vendors.rows;
    } catch (e) {
          console.error('getVendors error:', e);
  return [];
    }
}

export const getVendorSuggestions = async (query) => {
  if (!query?.trim()) return [];

  try {
    const result = await tablesDB.listRows({
      databaseId: appwriteConfig.databaseId,
      tableId: 'vendors',
      queries: [
        Query.search('name', query),
        Query.limit(5),
        Query.select(['name', '$id']), // only pull what the dropdown needs
      ],
    });

    return result.rows;
  } catch (e) {
    console.error('getVendorSuggestions error:', e);
    return [];
  }
};

// don't forgrt ownerid
export const createVendor = async (data:Vendor)=>{
  try{
    const res = await tablesDB.createRow({
      databaseId:appwriteConfig.databaseId,
      tableId:'vendors',
      rowId:ID.unique(),
      data:data
    })
    if (res) return true
  }
  catch(e){
    // return false
    throw new Error(e as string)
  }
}






export const updateVendor = async ({
  name,
  description,
  imageUrl,
  open,
  closes,
  coords,
  verified,
  ownerId

}:Vendor) => {
  try{

    const res = await tablesDB.listRows({
      databaseId:appwriteConfig.databaseId,
      tableId:'vendors',
      queries:[Query.equal('ownerId', ownerId)]
    })

    if (!res.rows.length) {
  throw new Error('Vendor not found');
}

const vendor = res.rows[0];

    await tablesDB.updateRow({
       databaseId:appwriteConfig.databaseId,
      tableId:'vendors',
      rowId:vendor.$id,
      data:{
        name,
        description,
        imageUrl,
        open,
        closes,
        coords,
        verified
      }
    })
    return true
  }
  catch(e){
     throw new Error('Error encountered while updating your shop')
   
   
    
  }
}


export const refreshAuthStore = async () => {
  try {
    const useAuthStore = (await import('@/store/auth.store')).default;
    await useAuthStore.getState().fetchAuthenticatedUser();
    return true
  } catch (e) {
    console.error('refreshAuthStore error', e);
    return false
  }
};

export const clearAuthStore = async () => {
  try {
    const useAuthStore = (await import('@/store/auth.store')).default;
    useAuthStore.getState().setIsAuthenticated(false);
    useAuthStore.getState().setUser(null);
  } catch (e) {
    console.error('clearAuthStore error', e);
  }
};



// seperate field
export const getUserAddresses = async (accountId:string) => {
  try {
    const res = await tablesDB.listRows({
      databaseId: appwriteConfig.databaseId,
      tableId: "addresses",
      queries: [
        Query.equal("accountId", accountId)
      ],
    });

    return res.rows;

  } catch (e: any) {
    throw new Error(e.message || "Failed to fetch addresses");
  }
};




export const updateUserAddress = async ({
  selectedName,
  selectedId,
  addresses,
}: {
  selectedName: string;
  selectedId: string;
  addresses: Address[];
}) => {
  try {
    await Promise.all(
      addresses
        .filter(addr => addr.accountId === selectedId)
        .map((addr) => {
          if (!addr?.$id) {
            throw new Error('Missing address ID');
          }

          return tablesDB.updateRow({
            databaseId: appwriteConfig.databaseId,
            tableId: 'addresses',
            rowId: addr.$id,
            data: {
              isDefault: addr.name === selectedName,
            },
          });
        })
    );

    return true;
  } catch (e: any) {
    console.error('setDefaultAddress error:', e);
    throw new Error(e.message || 'Failed to update default address');
  }
};




export const createAddress = async ({
  name,
  coords,
  isDefault,
}: {
  name: string;
  coords: number[];
  isDefault?: boolean;
  // accountId: string;
}) => {
  try {
    const currentAccount = await account.get();

    await tablesDB.createRow({
      databaseId: appwriteConfig.databaseId,
      tableId: "addresses",
      rowId: ID.unique(),
      data: {
        name,
        coords,
        isDefault: isDefault ?? false,
        accountId: currentAccount.$id
      }
    });

    return true;

  } catch (e: any) {
    throw new Error(e.message || "Failed to create address");
  }
};


export const getAdminId = async () => {
  try{
        const res = await tablesDB.listRows({
      databaseId: appwriteConfig.databaseId,
      tableId: "user",
      queries: [
        Query.equal("role", "admin")
      ],
    });

    return res.rows[0].$id;
    
  }
  catch(e:any){
    throw new Error(e.message || "Failed to fetch admin");
  }

}


export const getModifierOptions = async ({query}: {query: string}) => {
  try{
    if (query){
        const res = await tablesDB.listRows({
      databaseId: appwriteConfig.databaseId,
      tableId: "modifier-options",
      queries: [
       Query.or([
    Query.equal("vendors", query),
    Query.isNull("vendors")
    ]) 
      ]
    });
    return res.rows;
    }
    return []
  } catch (e: any) {
    throw new Error(e.message || "Failed to fetch modifier options");
  }
};


export const uploadImage = async (uri: string) => {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();

 

    const res = await storage.createFile(
       { 
        bucketId: '69dfa5e5000d8cf8677f',
        fileId: ID.unique(),
        file: {
          name: `avatar_${Date.now()}_${uri.split('/').pop()}`,
          uri: uri,
          size: blob.size/1024,
          type: blob.type,
      }
    }
    );
    if (!res) console.error('Failed to upload image: No response from storage.createFile');


    console.log("UPLOAD SUCCESS:", res);

    return res.$id;
  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    throw err;
  }
};

export const displayImage =  (imageId: string) => {
  const imageUrl = storage.getFilePreview(
     {
    bucketId: appwriteConfig.bucketId,
    fileId: imageId}
   );
  return imageUrl;
}


export const fetchOrders = async (accountId: string): Promise<Order[]> => {
  const res = await tablesDB.listRows({
    databaseId: appwriteConfig.databaseId,
    tableId: 'orders',
    queries: [
      Query.equal('customerId', accountId),
      Query.orderDesc('$createdAt'),
    ],
  })
    // if (!res) return false;

  return res.rows.map((row: any) => ({
    ...row,
    items: JSON.parse(row.items),
  }))
}


// live in api not here, as well as accept order
// export const getAllCustomersOrders = async (status:string) => {

 
//   if (user.role !== 'rider' || user.role !== 'admin') throw new Error('unauthorized access')
//     const res = await tablesDB.listRows({
//     databaseId: appwriteConfig.databaseId,
//     tableId: 'orders',
//     queries:[ Query.equal('status',status)]
//   })
 
//   return res.rows.map((row: any) => ({
//     ...row,
//     items: JSON.parse(row.items),
//   }))
// }

export const deleteOrder = async (rowId: string) => {
  await tablesDB.deleteRow({
    databaseId: appwriteConfig.databaseId,
    tableId: 'orders',
    rowId,
  })
}

// 

export async function confirmDeliveryOffer({
  orderId,
  riderId,
  riderName,
  deliveryFee,
  offerId
}: {
  orderId: string
  riderId: string
  riderName: string
  deliveryFee: number,
  offerId: number
}) {
  const user = await getCurrentUser()

  const order = await tablesDB.getRow({
    databaseId: appwriteConfig.databaseId,
    tableId: 'orders',
    rowId: orderId,
  })

  // only the customer who owns this order can confirm a rider
  if (order.customerId !== user.$id) throw new Error('unauthorized access')
  if (order.status !== 'pending') throw new Error('Order already has a rider')

  const platformFee = calcPlatformFee(order.subtotal + deliveryFee)
  const total = platformFee + order.subtotal + deliveryFee

  const updated = await tablesDB.updateRow({
    databaseId: appwriteConfig.databaseId,
    tableId: 'orders',
    rowId: orderId,
    data: {
      status: 'accepted',
      deliveryFee,
      platformFee,
      total,
      riderId,
      riderName,
    },
  })

  // clean up the other offers for this order — they're no longer relevant
  const offers = await tablesDB.listRows({
    databaseId: appwriteConfig.databaseId,
    tableId: 'delivery',
    queries: [
      Query.equal('orderId', orderId),
      Query.notEqual('$id', offerId)

    ],
  })

  

  await Promise.all(
    offers.rows.map((row) =>
      tablesDB.deleteRow({
        databaseId: appwriteConfig.databaseId,
        tableId: 'delivery',
        rowId: row.$id,
      })
    )
  )

  return updated
}



export const createOrder = async ({
  customerId,
  userAddress,
  subtotal,
  items,
  customerName
}: Order) => {
  try {
  
    const row = await tablesDB.createRow({
      databaseId: appwriteConfig.databaseId,
      tableId:'orders',
      rowId: ID.unique(),
      data: {
        customerId,
        userAddress,
        customerName,
        // platform fee is dependent on subscription level, currently it's 0
        subtotal,
        status: "pending",
        items: JSON.stringify(items)
      },
    });

    return row;
  } catch (e: any) {
    throw new Error(e.message || "Failed to create order");
  }
};

export const getAdditionalFee = async () => {
  const fee = await tablesDB.listRows({
    databaseId:appwriteConfig.databaseId,
    tableId:'additionalFee', 
  })
  return fee.rows[0].rate
}


export function subscribeToOrders(
  onOrderUpdate: (order: any) => void,
  onDeliveryUpdate: (delivery: any) => void,
  onPayoutUpdate: (payout:any) => void,
  currentUserId: string,
  orderId?: string
) {
  const unsubscribe = client.subscribe(
    [
      `databases.${appwriteConfig.databaseId}.collections.orders.documents`,
      `databases.${appwriteConfig.databaseId}.collections.delivery.documents`,
      `databases.${appwriteConfig.databaseId}.collection.payouts.documents`
    ],
    (response) => {
      const isRelevant = response.events.some(
        (e) => e.includes('.update') || e.includes('.create') || e.includes('.delete')
      )
      if (!isRelevant) return

      const isOrderEvent = response.events.some((e) => e.includes('.collections.orders.'))
      const isDeliveryEvent = response.events.some((e) => e.includes('.collections.delivery.'))
      const isPayoutEvent = response.events.some((e) => e.includes('.collections.payouts.'))

      if (isOrderEvent) {
        const updatedOrder = { ...response.payload, items: JSON.parse(response.payload.items) }
        const isOwner = updatedOrder?.customerId === currentUserId || updatedOrder?.riderId === currentUserId
        
        if (!isOwner) return
        onOrderUpdate(updatedOrder)
      }

      if (isDeliveryEvent) {
        if (!orderId) return
        
        if ( response.payload.orderId === orderId) {
            onDeliveryUpdate(response.payload)
        }
      }
      if(isPayoutEvent){
        if (orderId){
          if (response.payload.orderId === orderId){
            onPayoutUpdate(response.payload)
          }
        }

      }


    }
  )

  return unsubscribe
}



export const RunPaystackAction = async (action, body) => {
  try {
    const execution = await functions.createExecution({
      functionId: appwriteConfig.functionId,
      body: JSON.stringify({ action, ...body }),
    });

    const parsed = JSON.parse(execution.responseBody);

    if (parsed?.success === false) return { error: parsed.error || "Request failed" };
    return parsed?.data ?? parsed; // callers now get the inner payload directly
  } catch (e) {
    console.error(e);
    return { error: e.message };
  }
};

export const createDeliveryOffer = async ({
  orderId,
  riderId,
  riderName,
  deliveryFee,
  expectedTimeDelivery,
  lat,
  lng
}:{
  orderId:string,
  riderId:string,
  riderName:string,
  deliveryFee:number,
  expectedTimeDelivery:number,
  lat:number,
  lng:number
}) => {
  try {
    await tablesDB.createRow({
      databaseId:appwriteConfig.databaseId,
      tableId:'delivery',
      rowId: ID.unique(),
      data: {
        riderId,
        orderId,
        riderName,
        deliveryFee,
        expectedTimeDelivery,
        lat,
        lng
      }
    })
  }
  catch(e){
    console.error(e)
  }
}


export const getDeliveryOffers = async (orderId:string) => {
  try {
    const charges = await tablesDB.listRows({
      databaseId:appwriteConfig.databaseId,
      tableId:'delivery',
      queries:[Query.equal('orderId', orderId)]
    })

    return charges.rows
  }
  catch(e){
    console.error(e)
  }
}


export const updateRiderLocation = async (
  orderId: string,
  coords: [number, number] // [lon, lat]
) => {
  const [lng, lat] = coords;
 
  return tablesDB.updateRow(
   { 
    databaseId: appwriteConfig.databaseId,
    tableId:'order',
    rowId:orderId,
    data:{
      lat: lat,
      lng: lng,
      status: "online",
    }
  }
  );
};


export const createEvent = async (data: EventPayload) => {
  try {

    const res = await tablesDB.createRow({
      databaseId: appwriteConfig.databaseId,
      tableId: "event",
      rowId: ID.unique(),
      data: data,
    });
    if (res) return true;
  } catch (e) {
    throw new Error(e as string);
  }
};

export const getEvents = async () => {
  try{
    const events = await tablesDB.listRows({
      databaseId:appwriteConfig.databaseId,
      tableId:'event'
    })

    return events.rows
  }
  catch(e){
    throw new Error(e as string)
  }
}

export const addBooking = async (data:BookingPayload) => {
  try{
    const res = await tablesDB.createRow({
      databaseId:appwriteConfig.databaseId,
      tableId:'bookings',
      rowId:ID.unique(),
      data:data,
         

    })

    return res 
  }
  catch(e){
    throw new Error(e as string);
  }
}

export const getBookings = async (userId:string) => {
  try{
    const bookings = await tablesDB.listRows({
      databaseId:appwriteConfig.databaseId,
      tableId:'bookings',
      queries:[Query.equal('customerId', userId)]
    })
    return bookings.rows
  }

  catch(e){
    throw new Error(e as string)
  }
}


export const findActiveBookingForSlot = async (
  customerId: string,
  eventId: string,
  scheduledAt: string
) => {
  const res = await tablesDB.listRows({
    databaseId: appwriteConfig.databaseId,
    tableId: "bookings",
    queries: [
      Query.equal("customerId", customerId),
      Query.equal("eventId", eventId),
      Query.equal("scheduledAt", scheduledAt),
      Query.equal("status", ["pending_payment", "paid"]), // active — not cancelled/refunded/settled
      Query.limit(1),
    ],
  });
  return res.rows?.[0] ?? null;
};


export const deleteBooking = async (bookingId: string) => {
  try {
    await tablesDB.deleteRow({
      databaseId: appwriteConfig.databaseId,
      tableId: "bookings",
      rowId: bookingId,
    });
  } catch (e) {
    // best-effort — don't let cleanup failure mask the original error to the user
    console.error("Failed to delete orphaned booking:", e);
  }
};
