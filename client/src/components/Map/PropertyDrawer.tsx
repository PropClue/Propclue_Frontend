// client/src/components/Map/PropertyDrawer.tsx

import React from "react";
import type { Listing } from "@shared/schema";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { VITE_BASE_URL } from "@/Utils/urls";

interface PropertyDrawerProps {
  open:            boolean;
  listing:         Listing | null;
  isInBucket:      boolean;
  onClose:         () => void;
  onBucketToggle:  () => void;
  onLoginRequired: () => void;
}

export function PropertyDrawer({
  open, listing, isInBucket, onClose, onBucketToggle, onLoginRequired,
}: PropertyDrawerProps) {
  const { isLoggedIn } = useAuth();
  const [photoIdx, setPhotoIdx] = React.useState(0);

  React.useEffect(() => { setPhotoIdx(0); }, [listing?.id]);

  React.useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  const photos       = listing?.photos ?? [];
  const primaryPhoto = photos[photoIdx]?.file_path ?? listing?.primary_photo ?? null;

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 top-16 z-20 bg-black/20 md:hidden"
          onClick={onClose}
        />
      )}

      <div
        className={`absolute top-0 right-0 h-full z-20 w-80 md:w-96
          bg-white dark:bg-zinc-900 shadow-xl flex flex-col
          transition-transform duration-300
          ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Arrow tab on left edge */}
        {open && (
          <button
            onClick={onClose}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full
              bg-white dark:bg-zinc-900 shadow-md rounded-l-lg px-1.5 py-4
              hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors z-10
              border border-r-0 border-border"
          >
            <svg className="w-4 h-4 text-muted-foreground" fill="none"
              stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round"
                strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}

        {/* Loading skeleton */}
        {open && !listing && (
          <div className="flex-1 p-4 space-y-4 animate-pulse">
            <div className="w-full h-48 bg-muted rounded-lg" />
            <div className="h-5 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-1/2" />
            <div className="h-4 bg-muted rounded w-1/3" />
          </div>
        )}

        {listing && (
          <div className="flex-1 overflow-y-auto">

            {/* Photo section */}
            <div className="relative w-full h-52 bg-muted">
              {primaryPhoto ? (
                <img
                  src={`${VITE_BASE_URL}/${primaryPhoto}`}
                  alt={listing.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center
                  text-muted-foreground text-sm">
                  No photo
                </div>
              )}

              {/* Photo navigation arrows */}
              {photos.length > 1 && (
                <div className="absolute bottom-2 left-0 right-0 flex items-center justify-center gap-2">
                  <button
                    onClick={() => setPhotoIdx((i) => Math.max(0, i - 1))}
                    className="bg-black/50 text-white rounded-full w-7 h-7
                      flex items-center justify-center text-lg leading-none
                      hover:bg-black/70 transition-colors"
                  >
                    ‹
                  </button>
                  <span className="text-white text-xs bg-black/50 px-2 py-0.5 rounded-full">
                    {photoIdx + 1} / {photos.length}
                  </span>
                  <button
                    onClick={() => setPhotoIdx((i) => Math.min(photos.length - 1, i + 1))}
                    className="bg-black/50 text-white rounded-full w-7 h-7
                      flex items-center justify-center text-lg leading-none
                      hover:bg-black/70 transition-colors"
                  >
                    ›
                  </button>
                </div>
              )}

              {/* Sale / Rent badge */}
              <span className={`absolute top-3 left-3 text-xs font-semibold
                px-2 py-0.5 rounded-full ${
                  listing.listing_type === "rent"
                    ? "bg-blue-600 text-white"
                    : "bg-green-600 text-white"
                }`}>
                {listing.listing_type === "rent" ? "For Rent" : "For Sale"}
              </span>
            </div>

            {/* Details */}
            <div className="p-4 space-y-4">

              <div>
                <h2 className="font-semibold text-base leading-snug">{listing.title}</h2>
                <p className="text-primary font-bold text-lg mt-0.5">
                  {formatPrice(listing.price, listing.price_unit)}
                </p>
                {listing.locality && (
                  <p className="text-muted-foreground text-sm mt-0.5">
                    📍 {listing.locality}{listing.city ? `, ${listing.city}` : ""}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-1.5">
                <Chip>{listing.property_type}</Chip>
                {listing.sub_property_type && <Chip>{listing.sub_property_type}</Chip>}
                {listing.area_sqft  && <Chip>{listing.area_sqft} sqft</Chip>}
                {listing.bedrooms   && <Chip>{listing.bedrooms} bed</Chip>}
                {listing.bathrooms  && <Chip>{listing.bathrooms} bath</Chip>}
              </div>

              {listing.description && (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {listing.description}
                </p>
              )}

              {/* Contact — gated */}
              <div className="border rounded-lg p-3 space-y-2">
                <p className="text-sm font-medium">Contact details</p>
                {listing.contact_visible ? (
                  <div className="space-y-1 text-sm">
                    {listing.owner_name && <p>👤 {listing.owner_name}</p>}
                    {listing.owner_phone && (
                      <p>📞{" "}
                        <a href={`tel:${listing.owner_phone}`} className="text-primary underline">
                          {listing.owner_phone}
                        </a>
                      </p>
                    )}
                    {listing.owner_email && (
                      <p>✉️{" "}
                        <a href={`mailto:${listing.owner_email}`} className="text-primary underline">
                          {listing.owner_email}
                        </a>
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="space-y-1 text-sm text-muted-foreground
                      blur-sm select-none pointer-events-none">
                      <p>👤 ••••• •••••</p>
                      <p>📞 +91 •••• ••••••</p>
                      <p>✉️ ••••@••••.com</p>
                    </div>
                    <Button size="sm" className="w-full" onClick={onLoginRequired}>
                      Log in to view contact
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {listing && (
          <div className="px-4 py-3 border-t">
            <Button
              variant={isInBucket ? "outline" : "default"}
              className="w-full"
              onClick={isLoggedIn ? onBucketToggle : onLoginRequired}
            >
              {isInBucket ? "✓ In shortlist" : "+ Add to shortlist"}
            </Button>
          </div>
        )}
      </div>
    </>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
      {children}
    </span>
  );
}

function formatPrice(price: number, unit: string): string {
  const fmt = new Intl.NumberFormat("en-IN", {
    style: "currency", currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
  const labels: Record<string, string> = {
    total: "", per_sqft: "/sqft", per_month: "/mo", per_year: "/yr",
  };
  return `${fmt}${labels[unit] ?? ""}`;
}