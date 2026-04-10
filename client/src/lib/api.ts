import { AreaStats, MarketOverview } from "@shared/schema";
import { VITE_BASE_URL } from "@/Utils/urls";

// Define the shape of the raw API response for location details
interface LocationDetail {
  Locality: string;
  Avg_Projected: string;
  YOY_Growth_Percent: string;
  QOQ_Growth_Percent: string;
  Risk: string;
  [key: string]: any;
}

export const api = {
  fetchAreaStats: async (
    subPropertyType: string = "Land",
    city: string = "Dubai",
    country: string = "UAE",
    propertyType: string = "Residential",
    year?: string,
  ): Promise<AreaStats[]> => {
    try {
      const response = await fetch(`${VITE_BASE_URL}/geomap`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Property_Type: propertyType,
          sub_property_type: subPropertyType,
          City: city,
          Country: country,
          quarter: "Jan-Mar",
          year: year || new Date().getFullYear().toString(),
        }),
      });

      const details = await response.json();

      if (!Array.isArray(details)) {
        console.error("Invalid geomap response format:", details);
        return [];
      }

      return details.map((latestData: LocationDetail) => {
        return {
          area: latestData.Locality || "Unknown",
          avgPrice: parseFloat(latestData.Avg_Projected || "0") * 1000,
          avgPricePerSqft: parseFloat(latestData.Avg_Projected || "0"),
          totalListings: 100, // Placeholder
          yoyGrowth: parseFloat(latestData.YOY_Growth_Percent || "0"),
          qoqGrowth: parseFloat(latestData.QOQ_Growth_Percent || "0"),
          heatmapIntensity: Math.min(
            parseFloat(latestData.YOY_Growth_Percent || "0") / 15,
            1,
          ),
          risk: latestData.Risk || "Unknown",
        } as AreaStats;
      });
    } catch (error) {
      console.error("Error fetching area stats via geomap:", error);
      throw new Error("Failed to fetch area stats");
    }
  },

  fetchHomepageMetadata: async (
    city: string = "Dubai",
    country: string = "UAE",
    propertyType: string = "Residential", // Defaulting as user API suggests
  ) => {
    const response = await fetch(
      `${VITE_BASE_URL}/homepage_metadata?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&property_type=${encodeURIComponent(propertyType)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`External API responded with status: ${response.status}`);
    }

    return response.json();
  },

  // Helper to calculate market overview from stats
  calculateMarketOverview: (areaStats: AreaStats[]): MarketOverview => {
    if (!areaStats.length) {
      return {
        totalListings: 0,
        avgPrice: 0,
        avgPricePerSqft: 0,
        yoyGrowth: 0,
        qoqGrowth: 0,
        transactionVolume: 0,
      };
    }

    const totalListings = areaStats.reduce(
      (sum, a) => sum + a.totalListings,
      0,
    );
    const avgPrice = Math.round(
      areaStats.reduce((sum, a) => sum + a.avgPrice, 0) / areaStats.length,
    );
    const avgPricePerSqft = Math.round(
      areaStats.reduce((sum, a) => sum + a.avgPricePerSqft, 0) /
        areaStats.length,
    );
    const yoyGrowth = parseFloat(
      (
        areaStats.reduce((sum, a) => sum + a.yoyGrowth, 0) / areaStats.length
      ).toFixed(1),
    );
    const qoqGrowth = parseFloat(
      (
        areaStats.reduce((sum, a) => sum + a.qoqGrowth, 0) / areaStats.length
      ).toFixed(1),
    );

    return {
      totalListings,
      avgPrice,
      avgPricePerSqft,
      yoyGrowth,
      qoqGrowth,
      transactionVolume: 45000000000, // Placeholder
    };
  },
};
