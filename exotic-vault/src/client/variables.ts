// === Environment Variables Configuration ===
// This file centralizes all environment variable access for the thirdweb client

export const THIRDWEB_CLIENT_ID = import.meta.env.VITE_THIRDWEB_CLIENT_ID;
export const THIRDWEB_CLIENT_SECRET = import.meta.env.VITE_THIRDWEB_CLIENT_SECRET;

// Validation to ensure required environment variables are set
if (!THIRDWEB_CLIENT_ID) {
  console.warn('VITE_THIRDWEB_CLIENT_ID is not set in environment variables');
}

if (!THIRDWEB_CLIENT_SECRET) {
  console.warn('VITE_THIRDWEB_CLIENT_SECRET is not set in environment variables');
}
