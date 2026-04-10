import { z } from "zod";

// Property types for Dubai real estate
export const propertyTypes = [
  "apartment",
  "villa",
  "townhouse",
  "penthouse",
  "studio",
] as const;
export type PropertyType = (typeof propertyTypes)[number];

// Dubai areas
export const dubaiAreas = [
  "Dubai Marina",
  "Downtown Dubai",
  "Palm Jumeirah",
  "Business Bay",
  "Jumeirah Beach Residence",
  "Dubai Hills Estate",
  "Arabian Ranches",
  "DIFC",
  "Jumeirah Village Circle",
  "Dubai Silicon Oasis",
  "Abu Hayl",
  "Academic City",
  "Ad Daghayah",
  "Al Bada",
  "Al Baharna",
  "Al Balush",
  "Al Baraha",
  "Al Barsha",
  "Al Barsha First",
  "Al Barsha Second",
  "Al Barsha Third",
  "Al Buteen",
  "Al Esbij",
  "Al Furjan",
  "Al Futais",
  "Al Hadd",
  "Al Hamriya",
  "Al Hodheifa",
  "Al Hudaiba",
  "Al Jaddaf",
  "Al Jafiliya",
  "Al Karama",
  "Al Khabaisi",
  "Al Khail Gate",
  "Al Kifaf",
  "Al Mamzar",
  "Al Manara",
  "Al Mankhool",
  "Al Marabea' First",
  "Al Mina",
  "Al Mizhar First",
  "Al Muraqqabat",
  "Al Murar",
  "Al Mushrif",
  "Al Mutina",
  "Al Nahda First",
  "Al Nahda Second",
  "Al Nasr",
  "Al Quoz First",
  "Al Quoz Industrial First",
  "Al Quoz Industrial Second",
  "Al Quoz Industrial Third",
  "Al Quoz Industrial Fourth",
  "Al Quoz Second",
  "Al Quoz Third",
  "Al Quoz Fourth",
  "Al Qusais First",
  "Al Qusais Industrial First",
  "Al Qusais Industrial Second",
  "Al Qusais Industrial Third",
  "Al Qusais Industrial Fourth",
  "Al Qusais Industrial Fifth",
  "Al Qusais Second",
  "Al Qusais Third",
  "Al Rigga",
  "Al Sabkha",
  "Al Safa First",
  "Al Safa Second",
  "Al Satwa",
  "Al Shindagha",
  "Al Souq Al Kabeer",
  "Al Sufouh First",
  "Al Sufouh Second",
  "Al Twar First",
  "Al Twar Second",
  "Al Twar Third",
  "Al Warqa'a First",
  "Al Warqa'a Second",
  "Al Warqa'a Third",
  "Al Warqa'a Fourth",
  "Al Wasl",
  "Al Waheda",
  "Discovery Gardens",
  "Dubai Investment Park First",
  "Dubai Investment Park Second",
  "Emirates Hill First",
  "Emirates Hill Second",
  "Emirates Hill Third",
  "Eyal Nasir",
  "Festival City",
  "Hadaeq Sheikh Mohammed Bin Rashid",
  "Hor Al Anz",
  "Hor Al Anz East",
  "International City",
  "Jebel Ali Industrial First",
  "Jumeirah First",
  "Jumeirah Second",
  "Jumeirah Third",
  "Jumeirah Village Triangle",
  "Mirdif",
  "Muhaisnah First",
  "Muhaisnah Second",
  "Muhaisnah Third",
  "Muhaisnah Fourth",
  "Nad Al Hamar",
  "Nad Al Sheba First",
  "Nad Al Sheba Second",
  "Nad Al Sheba Third",
  "Nad Al Sheba Fourth",
  "Nad Shamma",
  "Naif",
  "Oud Al Muteena First",
  "Oud Al Muteena Second",
  "Oud Metha",
  "Port Saeed",
  "Ras Al Khor",
  "Ras Al Khor Industrial First",
  "Ras Al Khor Industrial Second",
  "Ras Al Khor Industrial Third",
  "Rigga Al Buteen",
  "Trade Centre First",
  "Trade Centre Second",
  "Umm Hurair First",
  "Umm Hurair Second",
  "Umm Ramool",
  "Umm Suqeim First",
  "Umm Suqeim Second",
  "Umm Suqeim Third",
  "Wadi Al Amardi",
  "Warsan First",
  "Warsan Second",
  "Za'abeel First",
  "Za'abeel Second",
] as const;
export type DubaiArea = (typeof dubaiAreas)[number];

// Property schema
export const propertySchema = z.object({
  id: z.string(),
  title: z.string(),
  type: z.enum(propertyTypes),
  area: z.enum(dubaiAreas),
  price: z.number(),
  pricePerSqft: z.number(),
  bedrooms: z.number(),
  bathrooms: z.number(),
  sqft: z.number(),
  imageUrl: z.string(),
  yoyGrowth: z.number(),
  qoqGrowth: z.number(),
  futureValue12m: z.number(),
  futureValue24m: z.number(),
  futureValue36m: z.number(),
});

export type Property = z.infer<typeof propertySchema>;

// Historical data point for charts
export const historicalDataPointSchema = z.object({
  date: z.string(),
  value: z.number(),
});

export type HistoricalDataPoint = z.infer<typeof historicalDataPointSchema>;

// Area statistics
export const areaStatsSchema = z.object({
  area: z.enum(dubaiAreas),
  avgPrice: z.number(),
  avgPricePerSqft: z.number(),
  totalListings: z.number(),
  yoyGrowth: z.number(),
  qoqGrowth: z.number(),
  heatmapIntensity: z.number(),
  risk: z.string().optional(),
});

export type AreaStats = z.infer<typeof areaStatsSchema>;

// Market overview stats
export const marketOverviewSchema = z.object({
  totalListings: z.number(),
  avgPrice: z.number(),
  avgPricePerSqft: z.number(),
  yoyGrowth: z.number(),
  qoqGrowth: z.number(),
  transactionVolume: z.number(),
});

export type MarketOverview = z.infer<typeof marketOverviewSchema>;

// Future value prediction
export const futureValuePredictionSchema = z.object({
  currentValue: z.number(),
  predictions: z.array(
    z.object({
      months: z.number(),
      value: z.number(),
      growthPercent: z.number(),
    })
  ),
});

export type FutureValuePrediction = z.infer<typeof futureValuePredictionSchema>;

// Search filters
export const searchFiltersSchema = z.object({
  area: z.enum(dubaiAreas).optional(),
  propertyType: z.enum(propertyTypes).optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  minBedrooms: z.number().optional(),
  maxBedrooms: z.number().optional(),
});

export type SearchFilters = z.infer<typeof searchFiltersSchema>;

// Valuation request
export const valuationRequestSchema = z.object({
  area: z.enum(dubaiAreas),
  propertyType: z.enum(propertyTypes),
  bedrooms: z.number(),
  bathrooms: z.number(),
  sqft: z.number(),
});

export type ValuationRequest = z.infer<typeof valuationRequestSchema>;

// Valuation result
export const valuationResultSchema = z.object({
  estimatedValue: z.number(),
  pricePerSqft: z.number(),
  confidenceScore: z.number(),
  yoyGrowth: z.number(),
  qoqGrowth: z.number(),
  futureValue12m: z.number(),
  futureValue24m: z.number(),
  futureValue36m: z.number(),
  comparableProperties: z.array(propertySchema),
});

export type ValuationResult = z.infer<typeof valuationResultSchema>;


// ============================================================
//  APPEND these to the bottom of shared/schema.ts
// ============================================================

import { z } from "zod";

// ── Listing property types (matches backend ENUM) ────────────────────────────
export const listingPropertyTypes = [
  "Residential",
  "Commercial",
  "Land",
  "Villa",
  "Office Space",
  "Showroom",
  "Coworking Space",
  "Warehouse",
  "Other",
] as const;
export type ListingPropertyType = (typeof listingPropertyTypes)[number];

export const listingTypes = ["sale", "rent"] as const;
export type ListingType = (typeof listingTypes)[number];

export const priceUnits = ["total", "per_sqft", "per_month", "per_year"] as const;
export type PriceUnit = (typeof priceUnits)[number];

export const listingStatuses = [
  "active",
  "inactive",
  "sold",
  "rented",
  "under_review",
] as const;
export type ListingStatus = (typeof listingStatuses)[number];

// ── User ─────────────────────────────────────────────────────────────────────
export const userSchema = z.object({
  id:         z.number(),
  full_name:  z.string(),
  email:      z.string().email(),
  phone:      z.string().nullable().optional(),
  role:       z.enum(["buyer", "seller", "both", "admin"]),
  created_at: z.string().optional(),
});
export type User = z.infer<typeof userSchema>;

// ── Auth ─────────────────────────────────────────────────────────────────────
export const signupPayloadSchema = z.object({
  full_name: z.string().min(2, "Name is required"),
  email:     z.string().email("Invalid email"),
  phone:     z.string().optional(),
  password:  z.string().min(6, "Minimum 6 characters"),
  role:      z.enum(["buyer", "seller", "both"]).default("buyer"),
  consent:   z.boolean().refine((v: any) => v === true, "You must accept terms"),
});
export type SignupPayload = z.infer<typeof signupPayloadSchema>;

export const loginPayloadSchema = z.object({
  email:    z.string().email("Invalid email"),
  password: z.string().min(1, "Password required"),
});
export type LoginPayload = z.infer<typeof loginPayloadSchema>;

export const tokenResponseSchema = z.object({
  access_token: z.string(),
  token_type:   z.string(),
  user_id:      z.number(),
  full_name:    z.string(),
  role:         z.string(),
});
export type TokenResponse = z.infer<typeof tokenResponseSchema>;

// ── Listing photo ─────────────────────────────────────────────────────────────
export const listingPhotoSchema = z.object({
  id:         z.number(),
  file_path:  z.string(),
  is_primary: z.number(),   // 0 | 1
  sort_order: z.number(),
});
export type ListingPhoto = z.infer<typeof listingPhotoSchema>;

// ── Listing (map pin / card) ──────────────────────────────────────────────────
export const listingSchema = z.object({
  id:                z.number(),
  user_id:           z.number(),
  listing_type:      z.enum(listingTypes),
  property_type:     z.enum(listingPropertyTypes),
  sub_property_type: z.string().nullable().optional(),
  title:             z.string(),
  description:       z.string().nullable().optional(),
  price:             z.number(),
  price_unit:        z.enum(priceUnits),
  area_sqft:         z.number().nullable().optional(),
  bedrooms:          z.number().nullable().optional(),
  bathrooms:         z.number().nullable().optional(),
  latitude:          z.number(),
  longitude:         z.number(),
  address_line:      z.string().nullable().optional(),
  locality:          z.string().nullable().optional(),
  city:              z.string().nullable().optional(),
  state:             z.string().nullable().optional(),
  country:           z.string(),
  pincode:           z.string().nullable().optional(),
  status:            z.enum(listingStatuses),
  is_featured:       z.number(),
  created_at:        z.string(),
  updated_at:        z.string(),
  // Joined fields
  primary_photo:     z.string().nullable().optional(),
  photos:            z.array(listingPhotoSchema).optional(),
  // Contact (only present for logged-in users)
  owner_name:        z.string().nullable().optional(),
  owner_phone:       z.string().nullable().optional(),
  owner_email:       z.string().nullable().optional(),
  contact_visible:   z.boolean().optional(),
});
export type Listing = z.infer<typeof listingSchema>;

// ── Map pin (lightweight, returned by /api/listings/map) ─────────────────────
export const mapPinSchema = z.object({
  id:            z.number(),
  title:         z.string(),
  property_type: z.enum(listingPropertyTypes),
  listing_type:  z.enum(listingTypes),
  price:         z.number(),
  price_unit:    z.enum(priceUnits),
  latitude:      z.number(),
  longitude:     z.number(),
  locality:      z.string().nullable().optional(),
  city:          z.string().nullable().optional(),
  status:        z.enum(listingStatuses),
  primary_photo: z.string().nullable().optional(),
});
export type MapPin = z.infer<typeof mapPinSchema>;

// ── Bucket item ───────────────────────────────────────────────────────────────
export const bucketItemSchema = listingSchema.pick({
  id: true, title: true, property_type: true, listing_type: true,
  price: true, price_unit: true, area_sqft: true,
  bedrooms: true, bathrooms: true,
  locality: true, city: true, latitude: true, longitude: true,
  primary_photo: true,
}).extend({
  saved_at: z.string(),
});
export type BucketItem = z.infer<typeof bucketItemSchema>;

// ── Create listing payload ────────────────────────────────────────────────────
export const createListingSchema = z.object({
  listing_type:      z.enum(listingTypes),
  property_type:     z.enum(listingPropertyTypes),
  sub_property_type: z.string().optional(),
  title:             z.string().min(5, "Title must be at least 5 characters"),
  description:       z.string().optional(),
  price:             z.number().positive("Price must be positive"),
  price_unit:        z.enum(priceUnits).default("total"),
  area_sqft:         z.number().optional(),
  bedrooms:          z.number().optional(),
  bathrooms:         z.number().optional(),
  latitude:          z.number(),
  longitude:         z.number(),
  address_line:      z.string().optional(),
  locality:          z.string().optional(),
  city:              z.string().optional(),
  state:             z.string().optional(),
  country:           z.string().default("India"),
  pincode:           z.string().optional(),
});
export type CreateListingPayload = z.infer<typeof createListingSchema>;

// ── Map filter state ──────────────────────────────────────────────────────────
export const mapFiltersSchema = z.object({
  listing_type:  z.enum(listingTypes).optional(),
  property_type: z.enum(listingPropertyTypes).optional(),
  min_price:     z.number().optional(),
  max_price:     z.number().optional(),
});
export type MapFilters = z.infer<typeof mapFiltersSchema>;