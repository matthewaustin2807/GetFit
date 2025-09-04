// src/config/apiConfig.ts
const API_CONFIG = {
  // Change this one value to update all services
  BASE_URL: 'http://10.0.0.17',
  
  // Optional: Define service-specific paths
  ENDPOINTS: {
    AUTH: '/api/auth',
    NUTRITION: '/api',
    USER: '/api/users',
    // Add other service endpoints as needed
  }
};

export default API_CONFIG;