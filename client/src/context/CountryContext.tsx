import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { VITE_BASE_URL } from "@/Utils/urls";

// Currency map: country → currency symbol
export const CURRENCY_MAP: Record<string, string> = {
  UAE: "AED",
  India: "INR",
};

// Default center coordinates per country (for map centering)
export const COUNTRY_MAP_CENTERS: Record<
  string,
  { lat: number; lng: number; zoom: number }
> = {
  UAE: { lat: 25.2048, lng: 55.2708, zoom: 11 },
  India: { lat: 20.5937, lng: 78.9629, zoom: 5 },
};

interface CountryContextValue {
  selectedCountry: string;
  selectedCity: string;
  countries: string[];
  cities: string[];
  currency: string;
  setSelectedCountry: (country: string) => void;
  setSelectedCity: (city: string) => void;
  isLoadingCountries: boolean;
  isLoadingCities: boolean;
}

const CountryContext = createContext<CountryContextValue>({
  selectedCountry: "UAE",
  selectedCity: "Dubai",
  countries: [],
  cities: [],
  currency: "AED",
  setSelectedCountry: () => {},
  setSelectedCity: () => {},
  isLoadingCountries: false,
  isLoadingCities: false,
});

const LS_COUNTRY_KEY = "propclue_country";
const LS_CITY_KEY = "propclue_city";

export function CountryProvider({ children }: { children: React.ReactNode }) {
  const [countries, setCountries] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [isLoadingCountries, setIsLoadingCountries] = useState(false);
  const [isLoadingCities, setIsLoadingCities] = useState(false);

  // Initialize from localStorage or defaults
  const [selectedCountry, setSelectedCountryState] = useState<string>(() => {
    return localStorage.getItem(LS_COUNTRY_KEY) || "UAE";
  });
  const [selectedCity, setSelectedCityState] = useState<string>(() => {
    return localStorage.getItem(LS_CITY_KEY) || "Dubai";
  });

  const currency = CURRENCY_MAP[selectedCountry] || "AED";

  // Fetch countries on mount
  useEffect(() => {
    const fetchCountries = async () => {
      setIsLoadingCountries(true);
      try {
        const res = await fetch(`${VITE_BASE_URL}/countries`);
        const data = await res.json();
        if (data?.countries && Array.isArray(data.countries)) {
          setCountries(data.countries);
        }
      } catch (err) {
        console.error("Failed to fetch countries:", err);
        setCountries(["UAE", "India"]); // Fallback
      } finally {
        setIsLoadingCountries(false);
      }
    };
    fetchCountries();
  }, []);

  // Fetch cities whenever country changes
  useEffect(() => {
    const fetchCities = async () => {
      setIsLoadingCities(true);
      try {
        const res = await fetch(
          `${VITE_BASE_URL}/cities?country=${encodeURIComponent(selectedCountry)}`,
        );
        const data = await res.json();
        if (data?.cities && Array.isArray(data.cities)) {
          setCities(data.cities);
          // Only reset city if the current city is not in the new list
          const storedCity = localStorage.getItem(LS_CITY_KEY) || "";
          if (!data.cities.includes(storedCity)) {
            setSelectedCityState(data.cities[0] || "");
            localStorage.setItem(LS_CITY_KEY, data.cities[0] || "");
          }
        }
      } catch (err) {
        console.error("Failed to fetch cities:", err);
        // Fallback cities per country
        const fallback: Record<string, string[]> = {
          UAE: ["Dubai", "Abu Dhabi", "Sharjah"],
          India: ["Mumbai", "Delhi", "Bangalore", "Hyderabad"],
        };
        const fallbackList = fallback[selectedCountry] || [];
        setCities(fallbackList);
      } finally {
        setIsLoadingCities(false);
      }
    };
    fetchCities();
  }, [selectedCountry]);

  const setSelectedCountry = useCallback((country: string) => {
    setSelectedCountryState(country);
    localStorage.setItem(LS_COUNTRY_KEY, country);
    // City will be reset by the cities useEffect above
  }, []);

  const setSelectedCity = useCallback((city: string) => {
    setSelectedCityState(city);
    localStorage.setItem(LS_CITY_KEY, city);
  }, []);

  return (
    <CountryContext.Provider
      value={{
        selectedCountry,
        selectedCity,
        countries,
        cities,
        currency,
        setSelectedCountry,
        setSelectedCity,
        isLoadingCountries,
        isLoadingCities,
      }}
    >
      {children}
    </CountryContext.Provider>
  );
}

export function useCountry() {
  return useContext(CountryContext);
}
