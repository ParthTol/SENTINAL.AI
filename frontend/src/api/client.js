import axios from 'axios';

// Backend API client — Vite exposes env vars via import.meta.env
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 60000, // 60s — YOLO inference can be slow
});

// Request logger
api.interceptors.request.use((config) => {
  console.log(`🔵 API Request: ${config.method.toUpperCase()} ${config.url}`);
  return config;
});

// Response logger + error handler
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status}`);
    return response;
  },
  (error) => {
    console.error(`❌ API Error: ${error.message}`);
    return Promise.reject(error);
  }
);

// ── Health ──────────────────────────────────────────────
export const healthCheck = () => api.get('/health');

// ── Image Analysis ───────────────────────────────────────
/**
 * Upload an image for infrastructure analysis.
 * @param {File} imageFile
 * @param {{ asset_id, asset_type, location, latitude?, longitude? }} assetData
 */
export const analyzeImage = async (imageFile, assetData) => {
  const formData = new FormData();
  formData.append('file', imageFile);
  formData.append('asset_id', assetData.asset_id);
  formData.append('asset_type', assetData.asset_type);
  formData.append('location', assetData.location);
  if (assetData.latitude != null)  formData.append('latitude',  assetData.latitude);
  if (assetData.longitude != null) formData.append('longitude', assetData.longitude);

  return api.post('/api/analyze', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

// ── Dashboard & Reports ───────────────────────────────────
export const getDashboardData = ()          => api.get('/api/dashboard');
export const getAssets        = ()          => api.get('/api/assets');
export const getAsset         = (assetId)   => api.get(`/api/assets/${assetId}`);
export const getAnalyses      = (limit = 20)=> api.get(`/api/analyses?limit=${limit}`);

export default api;
