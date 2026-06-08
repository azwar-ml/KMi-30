import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

const BASE_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

/**
 * Create Axios instance with JWT interceptor
 * Automatically injects Authorization header from localStorage
 */
const api: AxiosInstance = axios.create({
  baseURL: BASE_API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor: Inject JWT token
 */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('jwt_token') : null;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

/**
 * Response interceptor: Handle 401 errors
 */
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // If 401 Unauthorized, clear token and redirect to login
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('jwt_token');
        // TODO: Implement login redirect
        // window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  },
);

export default api;

/**
 * Type-safe API methods
 */
export interface ApiResponse<T = any> {
  data: T;
  status: number;
  message?: string;
}

export interface ApiErrorResponse {
  statusCode: number;
  message: string;
  error: string;
}

// Stock endpoints
export const stocksAPI = {
  getKMI30: () => api.get('/stocks/kmi-30'),
  getStockDetails: (symbol: string) => api.get(`/stocks/${symbol}`),
  getMemo: (symbol: string) => api.get(`/stocks/${symbol}/memo`),
  getAllCompanies: (skip: number = 0, take: number = 20, search: string = '') =>
    api.get('/stocks/all/paginated', { params: { skip, take, search } }),
  getMarketNews: () => api.get('/stocks/market/news'),
  getMacroIndicators: () => api.get('/stocks/market/macro'),
  getShariaStatus: () => api.get('/stocks/shariah/summary'),
  getNonCompliant: () => api.get('/stocks/shariah/non-compliant'),
};

// Admin endpoints
export const adminAPI = {
  syncLivePrices: () => api.post('/stocks/sync/live'),
  syncHistorical: (symbols?: string[]) => api.post('/stocks/sync/historical', { symbols }),
  syncPSXHeader: () => api.post('/stocks/sync/psx-header'),
  auditShariah: () => api.post('/stocks/audit/shariah'),
  getScraperLogs: () => api.get('/stocks/admin/logs/scraper'),
  getLatencyLogs: () => api.get('/stocks/admin/logs/latency'),
};

// Health endpoints
export const healthAPI = {
  getHealth: () => api.get('/health'),
  pingGemini: () => api.get('/health/gemini-ping'),
};
