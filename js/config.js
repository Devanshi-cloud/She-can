/**
 * config.js - MongoDB / Express Backend Configuration
 * Used by frontend files to route API fetch requests to the server.
 */

const API_CONFIG = {
  BASE_URL: "/api"
};

// Freeze the config to prevent accidental mutations
Object.freeze(API_CONFIG);
