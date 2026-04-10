import { VITE_BASE_URL } from "@/Utils/urls";

// ─── Country / City list APIs ──────────────────────────────────────────────

export const fetchCountries = async (): Promise<string[]> => {
  try {
    const res = await fetch(`${VITE_BASE_URL}/countries`);
    const data = await res.json();
    return data?.countries || [];
  } catch (err) {
    console.error("Error fetching countries:", err);
    return [];
  }
};

export const fetchCities = async (country: string): Promise<string[]> => {
  try {
    const res = await fetch(
      `${VITE_BASE_URL}/cities?country=${encodeURIComponent(country)}`,
    );
    const data = await res.json();
    return data?.cities || [];
  } catch (err) {
    console.error("Error fetching cities:", err);
    return [];
  }
};

// ─── Localities ────────────────────────────────────────────────────────────

export const fetchALMLLocations = async (
  setAreaLoading: (loading: boolean) => void,
  accessToken: string | undefined,
  setProjectionLocation: (data: any) => void,
  propertyType: string,
  city: string = "Dubai",
  country: string = "UAE",
) => {
  setAreaLoading(true);
  try {
    const response = await fetch(`${VITE_BASE_URL}/get_localities`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        city,
        country,
        property_type: propertyType || "Residential",
      }),
    });
    const data = await response.json();
    if (data?.Localities) {
      setProjectionLocation(data.Localities);
    }
  } catch (error) {
    console.error("Error fetching locations:", error);
  } finally {
    setAreaLoading(false);
  }
};

export const fetchSubPropertyTypes = async (
  city: string,
  propertyType: string,
  setSubPropertyTypes: (types: string[]) => void,
  setLocalityOptions: (locs: string[]) => void,
  country: string = "UAE",
) => {
  try {
    const response = await fetch(`${VITE_BASE_URL}/get_localities`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        city,
        country,
        property_type: propertyType || "Residential",
      }),
    });
    const data = await response.json();
    if (data?.Localities) {
      const subTypes = Object.keys(data.Localities);
      setSubPropertyTypes(subTypes);
      if (subTypes.length > 0) {
        setLocalityOptions(data.Localities[subTypes[0]]);
      }
    }
  } catch (error) {
    console.error("Error fetching sub property types:", error);
  }
};

// ─── Location Details ───────────────────────────────────────────────────────

export const getPredictedData = async (
  payload: any,
  priceRange: string,
  setPredictResult: (data: any) => void,
  setLoading: (loading: boolean) => void,
  mainCity: string,
  setErr: (err: boolean) => void,
  propertyType: string,
  subPropertyType: string,
  country: string = "UAE",
) => {
  setLoading(true);
  setErr(false);
  try {
    const response = await fetch(`${VITE_BASE_URL}/get_location_details`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        locality: payload[0]?.location || "",
        city: mainCity,
        country,
        property_type: propertyType || "Residential",
        sub_property_type: subPropertyType || "Land",
      }),
    });
    const data = await response.json();
    setPredictResult(data);
  } catch (error) {
    console.error("Error fetching prediction:", error);
    setErr(true);
  } finally {
    setLoading(false);
  }
};

export const fetchLocationDetails = async (
  locality: string,
  propertyType: string,
  subPropertyType: string,
  city: string = "Dubai",
  country: string = "UAE",
  year: string = "2026",
) => {
  try {
    const response = await fetch(`${VITE_BASE_URL}/get_location_details`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        locality,
        city,
        country,
        property_type: propertyType || "Residential",
        sub_property_type: subPropertyType || "Land",
        year,
      }),
    });
    return await response.json();
  } catch (error) {
    console.error("Error fetching location details:", error);
    return null;
  }
};

export const TrackLocationAvailability = (
  token: string | undefined,
  search: string,
) => {
  //   console.log("Tracking location:", search);
};
