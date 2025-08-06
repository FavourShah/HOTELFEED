// store/usePropertyStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from 'axios';

// Use environment variable or fallback to localhost
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const usePropertyStore = create(
  persist(
    (set, get) => ({
      property: null,
      loading: false,
      error: null,

      // Fetch property information
      fetchProperty: async (token) => {
        set({ loading: true, error: null });
        
        try {
          const response = await axios.get(`${API_BASE_URL}/property`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          
          set({ 
            property: response.data,
            loading: false,
            error: null
          });
          
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
      updateProperty: async (token, updateData) => {
        set({ loading: true, error: null });
        
        try {
          const response = await axios.put(`${API_BASE_URL}/property`, updateData, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          set({ 
            property: response.data,
            loading: false,
            error: null
          });
          
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
      uploadLogo: async (token, formData) => {
        set({ loading: true, error: null });
        
        try {
          const response = await axios.post(`${API_BASE_URL}/property/logo`, formData, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          });
          
          set({ 
            property: response.data.property,
            loading: false,
            error: null
          });
          
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
      deleteLogo: async (token) => {
        set({ loading: true, error: null });
        
        try {
          const response = await axios.delete(`${API_BASE_URL}/property/logo`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          
          set({ 
            property: response.data.property,
            loading: false,
            error: null
          });
          
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

      // Clear property data (useful for logout)
      clearProperty: () => {
        set({ 
          property: null,
          loading: false,
          error: null
        });
      }
    }),
    {
      name: "property-store",
      getStorage: () => localStorage,
      // Only persist the property data, not loading states
      partialize: (state) => ({ 
        property: state.property 
      }),
    }
  )
);

export default usePropertyStore;