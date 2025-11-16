import axios from 'axios';
import { API_BASE_URL } from '../constants/config';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config) => {
    // You can add auth token here if needed
    // const token = await StorageService.getAuthToken();
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      // Server responded with error
      console.error('API Error:', error.response.data);
      return Promise.reject(error.response.data);
    } else if (error.request) {
      // Request made but no response
      console.error('Network Error:', error.message);
      return Promise.reject({ error: 'Network error. Please check your connection.' });
    } else {
      // Something else happened
      console.error('Error:', error.message);
      return Promise.reject({ error: error.message });
    }
  }
);

export const ApiService = {
  // Auth endpoints
  signup: async (userData) => {
    return await apiClient.post('/auth/signup', userData);
  },

  login: async (credentials) => {
    return await apiClient.post('/auth/login', credentials);
  },

  // Location/Explore endpoints
  getLocationInfo: async (destination) => {
    return await apiClient.get('/location/info', { params: { query: destination } });
  },

  // Trip planner endpoints
  generateTrip: async (tripData) => {
    return await apiClient.post('/trip/generate', tripData);
  },

  // Civic dashboard endpoints
  submitReport: async (reportData) => {
    return await apiClient.post('/report/submit', reportData);
  },

  getReports: async (userId) => {
    return await apiClient.get('/report/list', { params: { userId } });
  },

  // Translation endpoints
  translateText: async (translationData) => {
    return await apiClient.post('/translate/text', translationData);
  },

  translateVoice: async (voiceData) => {
    return await apiClient.post('/translate/voice', voiceData);
  },

  // Health check
  healthCheck: async () => {
    return await apiClient.get('/health');
  },
};

export default ApiService;
