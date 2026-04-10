// Switch between local and production by changing VITE_BASE_URL in .env
// Local:      VITE_BASE_URL=http://localhost:5000
// Production: VITE_BASE_URL=https://api-sandbox.propclue.com

export const VITE_BASE_URL =
  import.meta.env.VITE_BASE_URL || "http://localhost:5000";

export const VITE_ALML_API_URL = VITE_BASE_URL;
export const VITE_PROPCLUE_API_URL = VITE_BASE_URL;




// old_production:
// export const VITE_ALML_API_URL = "https://api-sandbox.propclue.com";
// export const VITE_PROPCLUE_API_URL = "https://api-sandbox.propclue.com";
// export const VITE_BASE_URL =
//   import.meta.env.VITE_BASE_URL || "https://api-sandbox.propclue.com";

// export const VITE_LISTINGS_API_URL =
//   import.meta.env.VITE_LISTINGS_API_URL || "http://localhost:5000";

