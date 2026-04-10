// ============================================================
//  client/src/components/Property/ListingForm.tsx
//  Multi-step form: Details → Location → Photos → Done
// ============================================================

import React, { useState, useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useAuth } from "@/context/AuthContext";
import { createListing, uploadListingPhotos } from "@/Api/listings";
import type { CreateListingPayload } from "@shared/schema";
import { listingPropertyTypes } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

// // Fix leaflet icons
// import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
// import markerIcon   from "leaflet/dist/images/marker-icon.png";
// import markerShadow from "leaflet/dist/images/marker-shadow.png";
// Delete the broken default
delete (L.Icon.Default.prototype as any)._getIconUrl;

// Point directly to the CDN instead of local assets
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface ListingFormProps {
  open:    boolean;
  onClose: () => void;
}

const STEPS = ["Details", "Location", "Photos", "Done"];

const EMPTY_FORM: Omit<CreateListingPayload, "latitude" | "longitude"> & {
  latitude?: number; longitude?: number;
} = {
  listing_type:      "sale",
  property_type:     "Residential",
  sub_property_type: "",
  title:             "",
  description:       "",
  price:             0,
  price_unit:        "total",
  area_sqft:         undefined,
  bedrooms:          undefined,
  bathrooms:         undefined,
  address_line:      "",
  locality:          "",
  city:              "",
  state:             "",
  country:           "India",
  pincode:           "",
  latitude:          undefined,
  longitude:         undefined,
};

export function ListingForm({ open, onClose }: ListingFormProps) {
  const { token } = useAuth();
  const { toast } = useToast();

  const [step,        setStep]        = useState(0);
  const [form,        setForm]        = useState({ ...EMPTY_FORM });
  const [photos,      setPhotos]      = useState<File[]>([]);
  const [previews,    setPreviews]    = useState<string[]>([]);
  const [submitting,  setSubmitting]  = useState(false);
  const [createdId,   setCreatedId]   = useState<number | null>(null);

  const mapRef       = useRef<L.Map | null>(null);
  const markerRef    = useRef<L.Marker | null>(null);
  const mapContainer = useRef<HTMLDivElement>(null);

  const set = (patch: Partial<typeof form>) =>
    setForm((prev) => ({ ...prev, ...patch }));

  // ── Reset on open ────────────────────────────────────────────────────────
  useEffect(() => {
    if (open) {
      setStep(0);
      setForm({ ...EMPTY_FORM });
      setPhotos([]);
      setPreviews([]);
      setCreatedId(null);
    }
  }, [open]);

  // ── Init location pick map (step 1) ──────────────────────────────────────
  useEffect(() => {
    if (step !== 1 || !mapContainer.current) return;

    // Small delay so the dialog has rendered
    const timer = setTimeout(() => {
      if (mapRef.current) return;

      const map = L.map(mapContainer.current!, {
        center: [20.5937, 78.9629],
        zoom: 5,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
        maxZoom: 19,
      }).addTo(map);

      // If coords already set, show marker
      if (form.latitude && form.longitude) {
        const m = L.marker([form.latitude, form.longitude], { draggable: true }).addTo(map);
        markerRef.current = m;
        map.setView([form.latitude, form.longitude], 14);
        m.on("dragend", () => {
          const p = m.getLatLng();
          set({ latitude: p.lat, longitude: p.lng });
        });
      }

      // Click to place / move marker
      map.on("click", (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        set({ latitude: lat, longitude: lng });

        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
        } else {
          const m = L.marker([lat, lng], { draggable: true }).addTo(map);
          markerRef.current = m;
          m.on("dragend", () => {
            const p = m.getLatLng();
            set({ latitude: p.lat, longitude: p.lng });
          });
        }
      });

      mapRef.current = map;
    }, 100);

    return () => {
      clearTimeout(timer);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current  = null;
        markerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  // ── GPS locate ───────────────────────────────────────────────────────────
  const useMyLocation = () => {
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const { latitude, longitude } = coords;
        set({ latitude, longitude });
        if (mapRef.current) {
          mapRef.current.setView([latitude, longitude], 16);
          if (markerRef.current) {
            markerRef.current.setLatLng([latitude, longitude]);
          } else {
            const m = L.marker([latitude, longitude], { draggable: true })
              .addTo(mapRef.current!);
            markerRef.current = m;
            m.on("dragend", () => {
              const p = m.getLatLng();
              set({ latitude: p.lat, longitude: p.lng });
            });
          }
        }
      },
      () => toast({ title: "Could not get location", variant: "destructive" }),
    );
  };

  // ── Photo selection ──────────────────────────────────────────────────────
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    setPhotos((prev) => [...prev, ...files]);
    const newPreviews = files.map((f) => URL.createObjectURL(f));
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removePhoto = (i: number) => {
    setPhotos((prev)    => prev.filter((_, idx) => idx !== i));
    setPreviews((prev)  => prev.filter((_, idx) => idx !== i));
  };

  // ── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!form.latitude || !form.longitude) {
      toast({ title: "Please pin a location on the map", variant: "destructive" });
      setStep(1);
      return;
    }
    setSubmitting(true);
    try {
      const payload: CreateListingPayload = {
        ...(form as CreateListingPayload),
        latitude:  form.latitude,
        longitude: form.longitude,
      };
      const res = await createListing(payload, token!);
      setCreatedId(res.listing_id);

      if (photos.length > 0) {
        await uploadListingPhotos(res.listing_id, photos, token!);
      }

      setStep(3);
    } catch (err: any) {
      toast({ title: "Failed to create listing", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  // ── Validation per step ──────────────────────────────────────────────────
  const canProceed = () => {
    if (step === 0) return form.title.length >= 5 && form.price > 0;
    if (step === 1) return !!form.latitude && !!form.longitude;
    return true;
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col overflow-hidden p-0">
        <DialogHeader className="px-6 pt-6 pb-0">
          <DialogTitle>List your property</DialogTitle>
        </DialogHeader>

        {/* Step indicator */}
        <div className="flex items-center px-6 py-3 gap-0">
          {STEPS.map((s, i) => (
            <React.Fragment key={s}>
              <div className="flex items-center gap-1.5">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium
                  transition-colors ${i <= step
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"}`}>
                  {i < step ? "✓" : i + 1}
                </div>
                <span className={`text-xs hidden sm:block ${
                  i === step ? "text-foreground font-medium" : "text-muted-foreground"
                }`}>{s}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-px mx-2 ${i < step ? "bg-primary" : "bg-border"}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step content */}
        <div className="flex-1 overflow-y-auto px-6 pb-4">

          {/* ── STEP 0: Property details ── */}
          {step === 0 && (
            <div className="space-y-4">

              {/* Sale / Rent */}
              <div className="space-y-1.5">
                <Label>Listing type</Label>
                <div className="flex gap-2">
                  {(["sale", "rent"] as const).map((t) => (
                    <button key={t}
                      onClick={() => set({ listing_type: t })}
                      className={`flex-1 py-2 rounded-md text-sm border capitalize transition-colors ${
                        form.listing_type === t
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border hover:border-primary"
                      }`}>
                      {t === "sale" ? "For Sale" : "For Rent"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Property type */}
              <div className="space-y-1.5">
                <Label>Property type</Label>
                <div className="flex flex-wrap gap-1.5">
                  {listingPropertyTypes.map((pt) => (
                    <button key={pt}
                      onClick={() => set({ property_type: pt })}
                      className={`px-2.5 py-1 rounded-full text-xs border transition-colors ${
                        form.property_type === pt
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border hover:border-primary"
                      }`}>
                      {pt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div className="space-y-1.5">
                <Label htmlFor="title">Title <span className="text-destructive">*</span></Label>
                <Input id="title" placeholder="e.g. 3BHK Flat in Koramangala"
                  value={form.title}
                  onChange={(e) => set({ title: e.target.value })} />
              </div>

              {/* Price */}
              <div className="space-y-1.5">
                <Label>Price <span className="text-destructive">*</span></Label>
                <div className="flex gap-2">
                  <Input type="number" placeholder="Amount"
                    value={form.price || ""}
                    onChange={(e) => set({ price: Number(e.target.value) })}
                    className="flex-1" />
                  <select
                    value={form.price_unit}
                    onChange={(e) => set({ price_unit: e.target.value as any })}
                    className="border rounded-md px-2 text-sm bg-background">
                    <option value="total">Total</option>
                    <option value="per_sqft">/ sqft</option>
                    <option value="per_month">/ month</option>
                    <option value="per_year">/ year</option>
                  </select>
                </div>
              </div>

              {/* Area + Beds + Baths */}
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1.5">
                  <Label className="text-xs">Area (sqft)</Label>
                  <Input type="number" placeholder="1200"
                    value={form.area_sqft || ""}
                    onChange={(e) => set({ area_sqft: Number(e.target.value) || undefined })} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Bedrooms</Label>
                  <Input type="number" placeholder="3"
                    value={form.bedrooms || ""}
                    onChange={(e) => set({ bedrooms: Number(e.target.value) || undefined })} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Bathrooms</Label>
                  <Input type="number" placeholder="2"
                    value={form.bathrooms || ""}
                    onChange={(e) => set({ bathrooms: Number(e.target.value) || undefined })} />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <Label htmlFor="desc">Description</Label>
                <textarea
                  id="desc"
                  rows={3}
                  placeholder="Describe the property…"
                  value={form.description ?? ""}
                  onChange={(e) => set({ description: e.target.value })}
                  className="w-full border rounded-md px-3 py-2 text-sm bg-background
                    resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
          )}

          {/* ── STEP 1: Location ── */}
          {step === 1 && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Click on the map to pin your property location, or use your device GPS.
              </p>

              {/* GPS button */}
              <Button variant="outline" size="sm" onClick={useMyLocation} type="button">
                📍 Use my current location
              </Button>

              {/* Coordinates display */}
              {form.latitude && form.longitude && (
                <p className="text-xs text-muted-foreground">
                  Pinned: {form.latitude.toFixed(5)}, {form.longitude.toFixed(5)}
                </p>
              )}

              {/* Map */}
              <div
                ref={mapContainer}
                className="w-full rounded-lg border overflow-hidden"
                style={{ height: 280 }}
              />

              {/* Address fields */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1 col-span-2">
                  <Label className="text-xs">Address</Label>
                  <Input placeholder="Street address"
                    value={form.address_line ?? ""}
                    onChange={(e) => set({ address_line: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Locality</Label>
                  <Input placeholder="Koramangala"
                    value={form.locality ?? ""}
                    onChange={(e) => set({ locality: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">City</Label>
                  <Input placeholder="Bengaluru"
                    value={form.city ?? ""}
                    onChange={(e) => set({ city: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">State</Label>
                  <Input placeholder="Karnataka"
                    value={form.state ?? ""}
                    onChange={(e) => set({ state: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Pincode</Label>
                  <Input placeholder="560034"
                    value={form.pincode ?? ""}
                    onChange={(e) => set({ pincode: e.target.value })} />
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 2: Photos ── */}
          {step === 2 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Add photos of your property. The first photo will be the cover image.
              </p>

              {/* Upload area */}
              <label className="flex flex-col items-center justify-center w-full h-32
                border-2 border-dashed rounded-lg cursor-pointer
                hover:border-primary hover:bg-muted/30 transition-colors">
                <svg className="w-8 h-8 text-muted-foreground mb-1" fill="none"
                  stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M12 16V8m0 0l-3 3m3-3l3 3M20 16.5A3.5 3.5 0 0016.5 13H15a5 5 0 10-9.9 1"/>
                </svg>
                <span className="text-sm text-muted-foreground">Click to upload photos</span>
                <span className="text-xs text-muted-foreground">JPG, PNG, WEBP</span>
                <input type="file" multiple accept="image/*"
                  className="hidden" onChange={handlePhotoSelect} />
              </label>

              {/* Previews */}
              {previews.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {previews.map((src, i) => (
                    <div key={i} className="relative aspect-square rounded-md overflow-hidden">
                      <img src={src} alt="" className="w-full h-full object-cover" />
                      {i === 0 && (
                        <span className="absolute top-1 left-1 text-xs bg-primary
                          text-primary-foreground px-1.5 py-0.5 rounded">Cover</span>
                      )}
                      <button
                        onClick={() => removePhoto(i)}
                        className="absolute top-1 right-1 bg-black/60 text-white
                          rounded-full w-5 h-5 flex items-center justify-center text-xs">
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── STEP 3: Done ── */}
          {step === 3 && (
            <div className="flex flex-col items-center justify-center py-8 space-y-3 text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900
                flex items-center justify-center text-3xl">
                ✓
              </div>
              <h3 className="font-semibold text-lg">Listing submitted!</h3>
              <p className="text-sm text-muted-foreground">
                Your property has been listed and will appear on the map shortly.
              </p>
              <Button onClick={onClose}>Close</Button>
            </div>
          )}
        </div>

        {/* Footer nav */}
        {step < 3 && (
          <div className="flex justify-between items-center px-6 py-4 border-t">
            <Button
              variant="outline"
              onClick={() => step === 0 ? onClose() : setStep((s) => s - 1)}
            >
              {step === 0 ? "Cancel" : "Back"}
            </Button>

            {step < 2 ? (
              <Button
                onClick={() => setStep((s) => s + 1)}
                disabled={!canProceed()}
              >
                Next
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={submitting}>
                {submitting ? "Submitting…" : "Submit listing"}
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}