// client/src/pages/ListingsMap.tsx

import React, { useState } from "react";
import { MapView } from "@/components/Map/MapView";
import { ListingForm } from "@/components/Property/ListingForm";
import { BucketPanel } from "@/components/Bucket/BucketPanel";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

export default function ListingsMap() {
  const { isLoggedIn, openAuthModal } = useAuth();
  const [listingFormOpen, setListingFormOpen] = useState(false);
  const [bucketOpen,      setBucketOpen]      = useState(false);
  const [bucketCount,     setBucketCount]      = useState(0);

  return (
    <div className="relative w-full" style={{ height: "calc(100vh - 64px)" }}>

      {/* Map */}
      <MapView onLoginRequired={openAuthModal} />

      {/* Top-right toolbar */}
      <div className="absolute top-4 right-4 z-30 flex items-center gap-2">

        {/* Shortlist */}
        <button
          onClick={() => isLoggedIn ? setBucketOpen(true) : openAuthModal()}
          className="bg-white dark:bg-zinc-900 shadow-md rounded-lg px-3 py-2 text-sm
            font-medium flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M5 5h14l-1.5 9H6.5L5 5zM3 3h2M9 21h.01M15 21h.01"/>
          </svg>
          Shortlist
          {bucketCount > 0 && (
            <span className="bg-primary text-primary-foreground text-xs
              rounded-full w-5 h-5 flex items-center justify-center">
              {bucketCount}
            </span>
          )}
        </button>

        {/* List property */}
        <Button size="sm"
          onClick={() => isLoggedIn ? setListingFormOpen(true) : openAuthModal()}>
          + List property
        </Button>
      </div>

      {/* Listing form */}
      {listingFormOpen && (
        <ListingForm open={listingFormOpen} onClose={() => setListingFormOpen(false)} />
      )}

      {/* Bucket panel */}
      {bucketOpen && (
        <BucketPanel open={bucketOpen} onClose={() => setBucketOpen(false)}
          onCountChange={setBucketCount} />
      )}
    </div>
  );
}