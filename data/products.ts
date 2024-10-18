// data/products.ts
import api from '@/lib/api';
import { Product } from '@/types/types';


// Addon functions
export const fetchAddons = async (page: number, pageSize: number, token: string) => {
  try {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    const response = await api.get(`/addons/getAll`, {
      params: { page, pageSize }
    });
    return response.data;
  } catch(error) {
    console.error(error);
    return [];
  }
};

export const fetchAddonById = async (id: number, token: string) => {
  try {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    const response = await api.get(`/addons/getById/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching addon:', error);
    throw error;
  }
}

export const createAddon = async (data: FormData, token: string) => {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  const response = await api.postFormData('/addons/create', data);
  console.log("here is the response",response.data)
  return response.data;
};

export const updateAddon = async (id: number, data: FormData, token: string) => {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  const response = await api.putFormData(`/addons/update/${id}`, data);
  return response.data;
};

export const deleteAddon = async (id: number, token: string) => {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  await api.delete(`/addons/delete/${id}`);
};




export const fetchProducts = async (page: number, pageSize: number, token: string) => {
  try {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    const response = await api.get(`/products/getAll`, {
      params: { page, pageSize }
    });
    return response.data;
  } catch(error) {
    console.error(error);
    return [];
  }
};

export const getProductById = async (id: number, token: string) => {
  try {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    const response = await api.get(`/products/getById/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching product:', error);
    throw error;
  }
};

export const createProduct = async (data: FormData, token: string) => {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  const response = await api.postFormData('/products/create', data);
  return response.data;
};


export const updateProduct = async (id: number, data: FormData, token: string) => {
  console.log('Updating product with ID:', id);
  console.log('Update data:', Object.fromEntries(data));
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  const response = await api.putFormData(`/products/update/${id}`, data);
  console.log('Update response:', response);
  return response.data;
};

export const deleteProduct = async (id: number, token: string, forceDelete: boolean) => {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  await api.delete(`/products/delete/${id}`, { params: {force:forceDelete } });
};


export const prepareProductFormData = (product: Partial<Product>, mainImage: File | null, variationImages: Record<number, File>) => {
  console.log('Preparing form data for product:', product);
  const formData = new FormData();

  // Add basic product information
  Object.entries(product).forEach(([key, value]) => {
    if (key !== 'variations' && key !== 'tags' && key !== 'addons' && value !== undefined) {
      formData.append(key, value.toString());
    }
  });

  // Add variations
  if (product.variations) {
    formData.append('variations', JSON.stringify(product.variations));
    product.variations.forEach((variation, index) => {
      if (variationImages[index]) {
        formData.append(`variationImage`, variationImages[index]);
      }
    });
  }

  // Add tags and addons
  if (product.tags) formData.append('tagIds', JSON.stringify(product.tags));
  if (product.addons) formData.append('addonIds', JSON.stringify(product.addons));

  // Add main image
  if (mainImage) {
    formData.append('mainImage', mainImage);
  }

  console.log('Prepared form data:', Object.fromEntries(formData));
  return formData;
};