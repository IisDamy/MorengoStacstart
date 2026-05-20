import { ModifierOptions, CartStore, CartItemType } from "@/types";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchOrders } from "@/lib/appwrite";



function aremodifierOptionsEqual(
    a: ModifierOptions[] = [],
    b: ModifierOptions[] = []
): boolean {
    if (a.length !== b.length) return false;

    const aSorted = [...a].sort((x, y) => x.$id.localeCompare(y.$id));
    const bSorted = [...b].sort((x, y) => x.$id.localeCompare(y.$id));

    return aSorted.every((item, idx) => item.$id === bSorted[idx].$id);
}

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
    items: [], 
    
    addItem: ({item, qty}) => {
        const modifierOptions = item.modifierOptions ?? [];

        const existing = get().items.find(
            (i) =>
                i.id === item.id 
            &&
                aremodifierOptionsEqual(i.modifierOptions ?? [], modifierOptions)
        );

        if (existing) {
            set({
                items: get().items.map((i) =>
                    i.id === item.id &&
                    aremodifierOptionsEqual(i.modifierOptions ?? [], modifierOptions)
                        ? { ...i, quantity: i.quantity + 1 }
                        : i
                ),
            });



        } else {
            set({
                items: [...get().items, { ...item, quantity: qty ?? 1, modifierOptions }],
            });
        }
    },

    removeItem: (id, modifierOptions = []) => {
        set({
            items: get().items.filter(
                (i) =>
                    !(
                        i.id === id &&
                        aremodifierOptionsEqual(i.modifierOptions ?? [], modifierOptions)
                    )
            ),
        });
    },

    increaseQty: (id, modifierOptions = []) => {
        set({
            items: get().items.map((i) =>
                i.id === id &&
                aremodifierOptionsEqual(i.modifierOptions ?? [], modifierOptions)
                    ? { ...i, quantity: i.quantity + 1 }
                    : i
            ),
        });
    },

    decreaseQty: (id, modifierOptions = []) => {
        set({
            items: get()
                .items.map((i) =>
                    i.id === id &&
                    aremodifierOptionsEqual(i.modifierOptions ?? [], modifierOptions)
                        ? { ...i, quantity: i.quantity - 1 }
                        : i
                )
                .filter((i) => i.quantity > 0),
        });
    },

    clearCart: () => set({ items: [] }),

    getTotalItems: () =>
        get().items.reduce((total, item) => total + item.quantity, 0),

    getTotalPrice: () =>
        get().items.reduce((total, item) => {
            const base = item.price;
            const customPrice =
                item.modifierOptions?.reduce(
                    (s: number, c: ModifierOptions) => s + (c.price * c.qty),
                    0
                ) ?? 0;
            return total + item.quantity * (base + customPrice);
        }, 0)
}),
    {
    name: "morengo-cart",
    storage: createJSONStorage(() => AsyncStorage),
        }
    ))