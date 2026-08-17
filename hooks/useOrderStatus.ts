import { subscribeToOrders } from "@/lib/appwrite";
import { useEffect, useState } from "react";


export const useOrderStatus = (
  orderId: string | null,
  currentUserId: string | null,
  initialStatus: string | null = null
) => {
  const [status, setStatus] = useState<string | null>(initialStatus);

  useEffect(() => {
    setStatus(initialStatus);
  }, [initialStatus]);

  useEffect(() => {
    if (!orderId || !currentUserId) return;

    const unsubscribe = subscribeToOrders(
      (updatedOrder) => {
        if (updatedOrder?.$id !== orderId) return;
        if (updatedOrder.status) setStatus(updatedOrder.status);
      },
      () => {
        // deliveryOffers updates - not relevant here
      },
      currentUserId
    );

    return () => {
      unsubscribe();
    };
  }, [orderId, currentUserId]);

  return status;
};