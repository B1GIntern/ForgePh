import axios from 'axios';

// Define the types
export interface FlashPromo {
  _id: string;
  name: string;
  startDate: string;
  endDate: string;
  maxParticipants: number;
  currentParticipants: number;
  multiplier: number;
  isActive: boolean;
  prize: string;
  createdAt: string;
  updatedAt: string;
  participants: Array<{
    userId: string;
    joinedAt: string;
  }>;
  status?: string; // Used for display purposes
  entries?: number; // Used for display purposes
}

export interface NewFlashPromo {
  name: string;
  startDate: string;
  endDate: string;
  maxParticipants: number;
  multiplier: number;
  prize: string;
  isActive: boolean;
}

// Get all flash promos
export const getAllFlashPromos = async () => {
  try {
    const response = await axios.get('/api/flash-promos');
    return response.data;
  } catch (error) {
    console.error('Error fetching flash promos:', error);
    throw error;
  }
};

// Get a specific flash promo
export const getFlashPromoById = async (id: string) => {
  try {
    const response = await axios.get(`/api/flash-promos/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching flash promo with ID ${id}:`, error);
    throw error;
  }
};

// Create a new flash promo
export const createFlashPromo = async (flashPromo: NewFlashPromo) => {
  try {
    const response = await axios.post('/api/flash-promos', flashPromo);
    return response.data;
  } catch (error) {
    console.error('Error creating flash promo:', error);
    throw error;
  }
};

// Update flash promo status
export const updateFlashPromoStatus = async (id: string, isActive: boolean) => {
  try {
    const response = await axios.patch(`/api/flash-promos/${id}/status`, { isActive });
    return response.data;
  } catch (error) {
    console.error(`Error updating flash promo status with ID ${id}:`, error);
    throw error;
  }
};

// Delete a flash promo
export const deleteFlashPromo = async (id: string) => {
  try {
    const response = await axios.delete(`/api/flash-promos/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting flash promo with ID ${id}:`, error);
    throw error;
  }
};

// Join a flash promo
export const joinFlashPromo = async (id: string, userId: string) => {
  try {
    const response = await axios.post(`/api/flash-promos/${id}/join`, { userId });
    return response.data;
  } catch (error) {
    console.error(`Error joining flash promo with ID ${id}:`, error);
    throw error;
  }
};

// Get active flash promos
export const getActiveFlashPromos = async () => {
  try {
    const response = await axios.get('/api/flash-promos');
    // Filter only active promos
    return response.data.filter((promo: FlashPromo) => 
      promo.isActive && 
      new Date(promo.startDate) <= new Date() && 
      new Date(promo.endDate) >= new Date()
    );
  } catch (error) {
    console.error('Error fetching active flash promos:', error);
    return []; // Return empty array rather than throwing
  }
}; 