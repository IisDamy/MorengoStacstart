import { getDeliveryOffers, subscribeToOrders } from "@/lib/appwrite";
import { useEffect, useState } from "react";

/**
 * Watches a rider's live position for a given order.
 *  1. Fetches the current delivery record(s) for this order on mount, so
 *     coordinates already sitting in the DB show up immediately - realtime
 *     only reports *future* changes, so without this, a rider who started
 *     broadcasting before this screen opened would show as null until
 *     their next GPS tick.
 *  2. subscribeToOrders' onDeliveryUpdate keeps it live after that.
 */
export const useTrackRiderLocation = (
  orderId: string | null,
  currentUserId: string
) => {
  const [riderCoords, setRiderCoords] = useState<[number, number] | null>(
    null
  );
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(null);

  // 1. initial fetch
  useEffect(() => {
    if (!orderId) return;
    let isMounted = true;

    getDeliveryOffers(orderId)
      .then((deliveries: any[]) => {
        if (!isMounted || !deliveries) return;

        // the confirmed delivery is whichever record already has coords -
        // adjust this if you have a status field to key off instead
        const withCoords = deliveries.find(
          (d) => typeof d.lat === "number" && typeof d.lng === "number"
        );

        if (withCoords) {
          setRiderCoords([withCoords.lng, withCoords.lat]);
          if (withCoords.$updatedAt) setLastUpdatedAt(withCoords.$updatedAt);
        }
      })
      .catch((error: unknown) => {
        console.error("Error fetching delivery record:", error);
      });

    return () => {
      isMounted = false;
    };
  }, [orderId]);

  // 2. realtime updates
  useEffect(() => {
    if (!orderId || !currentUserId) return;

    const unsubscribe = subscribeToOrders(
      () => {
        // order-level updates handled elsewhere (useActiveOrder)
      },
      (updatedDelivery) => {
        if (updatedDelivery?.orderId !== orderId) return;

        if (
          typeof updatedDelivery.lat === "number" &&
          typeof updatedDelivery.lng === "number"
        ) {
          setRiderCoords([updatedDelivery.lng, updatedDelivery.lat]);
        }

        if (updatedDelivery.$updatedAt) {
          setLastUpdatedAt(updatedDelivery.$updatedAt);
        }
      },
       // payout
      ()=>{},
      currentUserId
    );

    return () => {
      unsubscribe();
    };
  }, [orderId, currentUserId]);

  return { riderCoords, lastUpdatedAt };
};