// src/data/user.ts
import axios from 'axios';
import { API_URL } from '@/lib/staticData';


export const fetchUserData = async (token: string) => {
  try {
    const response = await axios.get(`${API_URL}/users/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw error;
  }
};