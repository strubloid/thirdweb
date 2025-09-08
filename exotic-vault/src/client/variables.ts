// === Environment Variables Configuration ===
// This file centralizes all environment variable access for the thirdweb client

const THIRDWEB_CLIENT_ID = import.meta.env.VITE_THIRDWEB_CLIENT_ID;

if (!THIRDWEB_CLIENT_ID) {
  console.warn('VITE_THIRDWEB_CLIENT_ID is not set in environment variables');
}

const THIRDWEB_CLIENT_SECRET = import.meta.env.VITE_THIRDWEB_CLIENT_SECRET;
if (!THIRDWEB_CLIENT_SECRET) {
  console.warn('VITE_THIRDWEB_CLIENT_SECRET is not set in environment variables');
}

const THIRDWEB_PROJECT_ID = import.meta.env.VITE_THIRDWEB_PROJECT_ID;
if (!THIRDWEB_PROJECT_ID) {
  console.warn('VITE_THIRDWEB_PROJECT_ID is not set in environment variables');
}

const THIRDWEB_SERVER_WALLET_ADDRESS = import.meta.env.VITE_THIRDWEB_SERVER_WALLET_ADDRESS;
if (!THIRDWEB_SERVER_WALLET_ADDRESS) {
  console.warn('VITE_THIRDWEB_SERVER_WALLET_ADDRESS is not set in environment variables');
}

const THIRDWEB_CHAIN = import.meta.env.VITE_THIRDWEB_CHAIN || "avalanche-fuji";
if (!THIRDWEB_CHAIN) {
  console.warn('VITE_THIRDWEB_CHAIN is not set in environment variables, defaulting to "avalanche-fuji"');
}

// Export all variables at the end
export {
  THIRDWEB_CLIENT_ID,
  THIRDWEB_CLIENT_SECRET,
  THIRDWEB_PROJECT_ID,
  THIRDWEB_SERVER_WALLET_ADDRESS,
  THIRDWEB_CHAIN
};