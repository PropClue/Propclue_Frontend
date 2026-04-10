
// ============================================================
//  client/src/Api/bucket.ts
// ============================================================
 
import { VITE_BASE_URL } from "@/Utils/urls";
import type { BucketItem } from "@shared/schema";
 
export const fetchBucket = async (token: string): Promise<BucketItem[]> => {
  try {
    const res = await fetch(`${VITE_BASE_URL}/api/bucket`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to fetch bucket");
    return res.json();
  } catch (err) {
    console.error("Error fetching bucket:", err);
    return [];
  }
};
 
export const addToBucket = async (
  listingId: number,
  token: string,
): Promise<void> => {
  const res = await fetch(`${VITE_BASE_URL}/api/bucket/${listingId}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Already in bucket");
  }
};
 
export const removeFromBucket = async (
  listingId: number,
  token: string,
): Promise<void> => {
  const res = await fetch(`${VITE_BASE_URL}/api/bucket/${listingId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to remove from bucket");
};
 