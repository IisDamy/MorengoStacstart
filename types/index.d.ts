import { Models } from "react-native-appwrite";

export interface MenuItem extends Models.Document {
    name: string;
    price: number;
    image: string;
    rating: number;
    type: string;
    vendors:Vendor;
    isAvailable:boolean;
    
}

declare module '*.mp4'
declare module '*.png, *.jpeg'

export interface Category extends Models.Document {
    name: string;
    description: string;
}

export interface Address extends Models.Document{
  coords:number[] | [];
  name: string;
  isDefault?: boolean; 
  accountId: string;      
  // optional, default could be false
  // add any other fields your table has (e.g., label, lat, lng)
}




export interface Vendor {
    name?:string;
    description?:string;
    coords?:number[];
    imageUrl?:string;
    rating?:number;
    open?:string;
    closes?:string;
    category?:string;
    ownerId:string;
    verified?:boolean;
    menu?:MenuItem[];
}

export interface User extends Models.Document {
    name?: string | undefined;
    email?: string | undefined;
    avatar?: string | undefined;
    role?: 'admin' | 'rider' | 'customer' | 'vendor' ;
    phone?:string | undefined;
    institution?:string;
    PhotoUrl?:string;
    points:number;
    accountId?:string;
    isStudent?:boolean;
    pushToken?:string;
    status?:string;
    paystackCustomerCode?:string;
    phoneVerified?:boolean;
}


export interface ModifierOptions{
    name: string;
    price: number;
    $id: string;
    qty: number;
    
    
}




export interface CartItemType extends Models.Document {
    name: string;
    price: number;
    image: string;
    quantity: number;
    modifierOptions?: ModifierOptions[];
    vendors:Vendor;
}

export interface CartStore {
    items: CartItem[];
    addItem: (item: Omit<CartItem, "quantity">) => void;
    removeItem: (id: string, customizations: ModifierOptions[]) => void;
    increaseQty: (id: string, customizations: ModifierOptions[]) => void;
    decreaseQty: (id: string, customizations: ModifierOptions[]) => void;
    clearCart: () => void;
    getTotalItems: () => number;
    getTotalPrice: () => number;
}

interface TabBarIconProps {
    focused: boolean;
    icon: ImageSourcePropType;
    title: string;
    position:number | null
}

interface PaymentInfoStripeProps {
    label: string;
    value: string;
    labelStyle?: string;
    valueStyle?: string;
}

interface CustomButtonProps {
    onPress?: () => void;
    title?: string;
    style?: React.CSSProperties | string;
    leftIcon?: React.ReactNode;
    textStyle?: string;
    isLoading?: boolean;
    disabled?:boolean;
}

interface CustomHeaderProps {
    title?: string;
}

interface CustomInputProps {
    placeholder?: string;
    maxLength?:number | undefined;
    value?: string;
    onChangeText?: (text: string) => void;
    label: string;
    secureTextEntry?: boolean;
    keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
    autoFocus?:false,
    style?:string,
    multiline:boolean,
    plain?: boolean; // no background / border — just the text
    fill?: boolean; // grow to fill whatever space its parent gives it
}

interface ProfileFieldProps {
    label: string;
    value: string;
    icon: ImageSourcePropType;
}

interface CreateUserParams {
    email: string;
    password: string;
    name: string;
    institution:string;
    phone:string;
    isStudent:boolean;
}

interface SignInParams {
    email: string;
    password: string;
}

interface GetItemParams {
    vendors?: string;
    query?: string;
    isFavourite?: string;
    category?: string;
}

interface GetVendorParams {
    category?: Array<string>;
    query?: string;
    categories?: Array<string>;
  
}

interface ManifestoProps {
    whatIs: boolean;
    openDashboard: () => void
}
// Roles

interface CustomComponentProps {
    value: string;
    onValueChange: (value: { name: string ,coords: number[] }) => void;
}

// interface Order extends Models.Document {
//   accountId: string;
//   userAddress: string;
//   totalAmount: number;
//   status: string;
//   items: OrderItem[];
//   time: string;
//   paidAt?:string;
//   deliveredAt:string;

// }

interface Location{
    coords:number[],
    label?:string,
    description:string
}

interface CoordsStore{
 location:Location | {},
 locations: Location[] | [],
 saveLocation: (loc: Location) => void;
 setCurrentLocation: (loc:Location) => void;
 deleteLocation: (loc:Location) => void;

}

interface NotificationViewerProps {
  open: boolean,
  onClose?: () => void;
}

interface MenuItemDraft {
  id: string
  name: string
  price: string
  imageUri: string | null
  imageId: string | null
}

interface Order extends Models.Document {
customerId:string,
riderId: string,
customerName:string,
riderName:string,
status: string,
paymentReference?: string,
paystackRefence?:string,
deliveredAt?:string,
setteledAt?: string?,
settlementBatchId?:string,
disputeId?:string,
metadata?: string,
userAddress: string,
total: number,
subtotal: number,
deliveryFee: number,
platformFee:number,
currency: string,
items: any[],
}

interface DeliveryOpts extends Models.Document {
    riderId:string;
    orderId:string;
    riderName:string;
    deliveryFee:number;
    expectedTimeDelivery:number;
    lat:number;
    lng:number;
    status:string;
    active:boolean;
}