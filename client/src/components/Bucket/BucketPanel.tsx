// ============================================================
//  client/src/components/Bucket/BucketPanel.tsx
//  Shortlist drawer + side-by-side compare overlay
// ============================================================

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { fetchBucket, removeFromBucket } from "@/Api/bucket";
import type { BucketItem } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { VITE_BASE_URL } from "@/Utils/urls";

interface BucketPanelProps {
  open:          boolean;
  onClose:       () => void;
  onCountChange: (n: number) => void;
}

export function BucketPanel({ open, onClose, onCountChange }: BucketPanelProps) {
  const { token } = useAuth();
  const { toast } = useToast();

  const [items,       setItems]       = useState<BucketItem[]>([]);
  const [loading,     setLoading]     = useState(false);
  const [compareIds,  setCompareIds]  = useState<Set<number>>(new Set());
  const [comparing,   setComparing]   = useState(false);

  // ── Load bucket ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!open || !token) return;
    const load = async () => {
      setLoading(true);
      const data = await fetchBucket(token);
      setItems(data);
      onCountChange(data.length);
      setLoading(false);
    };
    load();
  }, [open, token]);

  // ── Remove from bucket ───────────────────────────────────────────────────
  const handleRemove = async (id: number) => {
    try {
      await removeFromBucket(id, token!);
      const updated = items.filter((i) => i.id !== id);
      setItems(updated);
      onCountChange(updated.length);
      setCompareIds((prev) => { const s = new Set(prev); s.delete(id); return s; });
      toast({ title: "Removed from shortlist" });
    } catch {
      toast({ title: "Failed to remove", variant: "destructive" });
    }
  };

  // ── Toggle compare selection ─────────────────────────────────────────────
  const toggleCompare = (id: number) => {
    setCompareIds((prev) => {
      const s = new Set(prev);
      if (s.has(id)) { s.delete(id); }
      else if (s.size < 3) { s.add(id); }
      else { toast({ title: "Compare up to 3 properties at a time" }); }
      return s;
    });
  };

  const compareItems = items.filter((i) => compareIds.has(i.id));

  return (
    <>
      {/* Backdrop */}
      {open && (
<div className="fixed inset-0 top-16 z-30 bg-black/30" onClick={onClose} />      )}

      {/* Panel */}
      <div className={`fixed top-16 right-0 h-[calc(100vh-4rem)] z-40 w-80 md:w-96
      bg-white dark:bg-zinc-900 shadow-2xl flex flex-col
      transition-transform duration-300
      ${open ? "translate-x-0" : "translate-x-full"}`}>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div>
            <h2 className="font-semibold text-sm">My Shortlist</h2>
            <p className="text-xs text-muted-foreground">{items.length} propert{items.length === 1 ? "y" : "ies"}</p>
          </div>
          <div className="flex items-center gap-2">
            {compareIds.size >= 2 && (
              <Button size="sm" onClick={() => setComparing(true)}>
                Compare ({compareIds.size})
              </Button>
            )}
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Compare hint */}
        {items.length >= 2 && !comparing && (
          <div className="px-4 py-2 bg-muted/50 text-xs text-muted-foreground">
            Select 2–3 properties to compare side by side
          </div>
        )}

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {loading && (
            <div className="p-4 space-y-3">
              {[1,2,3].map((i) => (
                <div key={i} className="animate-pulse flex gap-3">
                  <div className="w-20 h-16 bg-muted rounded-md flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                    <div className="h-3 bg-muted rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && items.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full
              text-center p-6 text-muted-foreground">
              <svg className="w-12 h-12 mb-3 opacity-30" fill="none"
                stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M5 5h14l-1.5 9H6.5L5 5zM3 3h2M9 21h.01M15 21h.01"/>
              </svg>
              <p className="text-sm">Your shortlist is empty</p>
              <p className="text-xs mt-1">Click + on any property to add it here</p>
            </div>
          )}

          {!loading && items.map((item) => (
            <BucketCard
              key={item.id}
              item={item}
              selected={compareIds.has(item.id)}
              onToggleCompare={() => toggleCompare(item.id)}
              onRemove={() => handleRemove(item.id)}
            />
          ))}
        </div>
      </div>

      {/* ── Compare overlay ── */}
      {comparing && compareItems.length >= 2 && (
        <CompareOverlay
          items={compareItems}
          onClose={() => setComparing(false)}
        />
      )}
    </>
  );
}

// ── Bucket card ───────────────────────────────────────────────────────────────
function BucketCard({
  item, selected, onToggleCompare, onRemove,
}: {
  item: BucketItem;
  selected: boolean;
  onToggleCompare: () => void;
  onRemove: () => void;
}) {
  return (
    <div className={`flex gap-3 p-3 border-b hover:bg-muted/30 transition-colors
      ${selected ? "bg-primary/5 border-l-2 border-l-primary" : ""}`}>

      {/* Thumbnail */}
      <div className="w-20 h-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
        {item.primary_photo ? (
          <img
            src={`${VITE_BASE_URL}/${item.primary_photo}`}
            alt={item.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs
            text-muted-foreground">No photo</div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{item.title}</p>
        <p className="text-xs text-primary font-semibold mt-0.5">
          {formatPrice(item.price, item.price_unit)}
        </p>
        <p className="text-xs text-muted-foreground truncate">
          {item.locality}{item.city ? `, ${item.city}` : ""}
        </p>
        <div className="flex gap-1 mt-1.5">
          {item.area_sqft && (
            <span className="text-xs bg-muted px-1.5 py-0.5 rounded">
              {item.area_sqft} sqft
            </span>
          )}
          {item.bedrooms && (
            <span className="text-xs bg-muted px-1.5 py-0.5 rounded">
              {item.bedrooms} bed
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <button
          onClick={onRemove}
          className="text-muted-foreground hover:text-destructive text-xs"
          title="Remove">
          ✕
        </button>
        <button
          onClick={onToggleCompare}
          className={`text-xs px-1.5 py-0.5 rounded border transition-colors ${
            selected
              ? "bg-primary text-primary-foreground border-primary"
              : "border-border hover:border-primary"
          }`}>
          {selected ? "✓" : "Compare"}
        </button>
      </div>
    </div>
  );
}

// ── Compare overlay ───────────────────────────────────────────────────────────
function CompareOverlay({
  items, onClose,
}: { items: BucketItem[]; onClose: () => void }) {

  const fields: { label: string; key: keyof BucketItem }[] = [
    { label: "Price",         key: "price" },
    { label: "Type",          key: "property_type" },
    { label: "Listing",       key: "listing_type" },
    { label: "Area (sqft)",   key: "area_sqft" },
    { label: "Bedrooms",      key: "bedrooms" },
    { label: "Bathrooms",     key: "bathrooms" },
    { label: "City",          key: "city" },
    { label: "Locality",      key: "locality" },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl
        w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="font-semibold">Compare properties</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left px-4 py-3 text-muted-foreground font-medium
                  text-xs uppercase w-28">Field</th>
                {items.map((item) => (
                  <th key={item.id} className="px-4 py-3 text-left">
                    <div className="space-y-1">
                      {item.primary_photo && (
                        <img
                          src={`${VITE_BASE_URL}/${item.primary_photo}`}
                          alt={item.title}
                          className="w-full h-24 object-cover rounded-md"
                        />
                      )}
                      <p className="font-medium text-sm leading-tight">{item.title}</p>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {fields.map(({ label, key }) => (
                <tr key={key} className="border-b hover:bg-muted/30">
                  <td className="px-4 py-2.5 text-xs text-muted-foreground font-medium">
                    {label}
                  </td>
                  {items.map((item) => {
                    const val = item[key];
                    const display =
                      key === "price"
                        ? formatPrice(item.price, item.price_unit)
                        : key === "listing_type"
                        ? val === "rent" ? "For Rent" : "For Sale"
                        : val ?? "—";
                    return (
                      <td key={item.id} className="px-4 py-2.5 font-medium">
                        {String(display)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Helper ────────────────────────────────────────────────────────────────────
function formatPrice(price: number, unit: string): string {
  const fmt = new Intl.NumberFormat("en-IN", {
    style: "currency", currency: "INR", maximumFractionDigits: 0,
  }).format(price);
  const labels: Record<string, string> = {
    total: "", per_sqft: "/sqft", per_month: "/mo", per_year: "/yr",
  };
  return `${fmt}${labels[unit] ?? ""}`;
}