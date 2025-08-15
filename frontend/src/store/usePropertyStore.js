// store/usePropertyStore.js
import { create } from "zustand";
import axios from '../utils/axiosInstance'; // axiosInstance should already have withCredentials: true

const usePropertyStore = create((set) => ({
  property: null,
  loading: false,
  error: null,

  // Fetch property information (cookie-based auth)
  fetchProperty: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get('/api/property', { withCredentials: true });
      set({ property: response.data, loading: false, error: null });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch property:', error);
      set({
        loading: false,
        error: error.response?.data?.message || 'Failed to fetch property information'
      });
      throw error;
    }
  },

  // Update property information
  updateProperty: async (updateData) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.put('/api/property', updateData, {
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' },
      });
      set({ property: response.data, loading: false, error: null });
      return response.data;
    } catch (error) {
      console.error('Failed to update property:', error);
      set({
        loading: false,
        error: error.response?.data?.message || 'Failed to update property information'
      });
      throw error;
    }
  },

  // Upload property logo
  uploadLogo: async (formData) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post('/api/property/logo', formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      set({ property: response.data.property, loading: false, error: null });
      return response.data;
    } catch (error) {
      console.error('Failed to upload logo:', error);
      set({
        loading: false,
        error: error.response?.data?.message || 'Failed to upload logo'
      });
      throw error;
    }
  },

  // Delete property logo
  deleteLogo: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.delete('/api/property/logo', { withCredentials: true });
      set({ property: response.data.property, loading: false, error: null });
      return response.data;
    } catch (error) {
      console.error('Failed to delete logo:', error);
      set({
        loading: false,
        error: error.response?.data?.message || 'Failed to delete logo'
      });
      throw error;
    }
  },

  // Clear property data
  clearProperty: () => {
    set({ property: null, loading: false, error: null });
  }
}));

export default usePropertyStore;
