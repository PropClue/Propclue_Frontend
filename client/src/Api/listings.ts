
// ============================================================
//  client/src/Api/listings.ts
// ============================================================
 
import { VITE_BASE_URL } from "@/Utils/urls";
import type {
  MapPin, Listing, CreateListingPayload, MapFilters,
} from "@shared/schema";
 
export const fetchMapPins = async (
  bounds: { min_lat: number; max_lat: number; min_lng: number; max_lng: number },
  filters: MapFilters = {},
): Promise<MapPin[]> => {
  const params = new URLSearchParams({
    min_lat: String(bounds.min_lat),
    max_lat: String(bounds.max_lat),
    min_lng: String(bounds.min_lng),
    max_lng: String(bounds.max_lng),
    ...(filters.listing_type  ? { listing_type:  filters.listing_type }  : {}),
    ...(filters.property_type ? { property_type: filters.property_type } : {}),
    ...(filters.min_price != null ? { min_price: String(filters.min_price) } : {}),
    ...(filters.max_price != null ? { max_price: String(filters.max_price) } : {}),
  });
  try {
    const res = await fetch(`${VITE_BASE_URL}/api/listings/map?${params}`);
    if (!res.ok) throw new Error("Failed to fetch map pins");
    return res.json();
  } catch (err) {
    console.error("Error fetching map pins:", err);
    return [];
  }
};
 
export const fetchListingDetail = async (
  id: number,
  token?: string | null,
): Promise<Listing | null> => {
  try {
    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await fetch(`${VITE_BASE_URL}/api/listings/${id}`, { headers });
    if (!res.ok) throw new Error("Listing not found");
    return res.json();
  } catch (err) {
    console.error("Error fetching listing detail:", err);
    return null;
  }
};
 
export const createListing = async (
  payload: CreateListingPayload,
  token: string,
): Promise<{ listing_id: number; message: string }> => {
  const res = await fetch(`${VITE_BASE_URL}/api/listings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Failed to create listing");
  }
  return res.json();
};
 
export const updateListing = async (
  id: number,
  payload: Partial<CreateListingPayload> & { status?: string },
  token: string,
): Promise<void> => {
  const res = await fetch(`${VITE_BASE_URL}/api/listings/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Failed to update listing");
  }
};
 
export const deleteListing = async (id: number, token: string): Promise<void> => {
  const res = await fetch(`${VITE_BASE_URL}/api/listings/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to delete listing");
};
 
export const fetchMyListings = async (token: string): Promise<Listing[]> => {
  try {
    const res = await fetch(`${VITE_BASE_URL}/api/listings/my/all`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to fetch your listings");
    return res.json();
  } catch (err) {
    console.error("Error fetching my listings:", err);
    return [];
  }
};
 
export const uploadListingPhotos = async (
  listingId: number,
  files: File[],
  token: string,
): Promise<{ uploaded: string[] }> => {
  const formData = new FormData();
  files.forEach((f) => formData.append("files", f));
  const res = await fetch(`${VITE_BASE_URL}/api/listings/${listingId}/photos`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  if (!res.ok) throw new Error("Photo upload failed");
  return res.json();
};
 
 