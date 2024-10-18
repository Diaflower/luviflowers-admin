// src/lib/api.ts
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { API_URL } from './staticData';

// const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_URL,
});

export const setAuthToken = (token: string) => {
  axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

// Create a custom API object that extends AxiosInstance
interface CustomApi extends AxiosInstance {
  postFormData: (url: string, data: FormData, config?: AxiosRequestConfig) => Promise<any>;
  putFormData: (url: string, data: FormData, config?: AxiosRequestConfig) => Promise<any>;
}

const api: CustomApi = axiosInstance as CustomApi;

// Add the custom postFormData method
api.postFormData = (url: string, data: FormData, config?: AxiosRequestConfig) => {
  return axiosInstance.post(url, data, {
    ...config,
    headers: {
      ...config?.headers,
      'Content-Type': 'multipart/form-data',
    },
  });
};

// Add the custom putFormData method
api.putFormData = (url: string, data: FormData, config?: AxiosRequestConfig) => {
  return axiosInstance.put(url, data, {
    ...config,
    headers: {
      ...config?.headers,
      'Content-Type': 'multipart/form-data',
    },
  });
};

// Export the custom API object
export default api;