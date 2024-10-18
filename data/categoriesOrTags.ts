import api from '@/lib/api';


export interface CreateCouponDTO {
  name: string;
  code: string;
  discount: number;
  expiryDate?: string | null;
  maxUses?: number;
  isSpecial?: boolean;
  specialCustomer?: string;
  specialEmail?: string;
  specialPhone?: string;
}

export interface UpdateCouponDTO extends Partial<CreateCouponDTO> {}

export const fetchItems = async (itemType: string, page: number, pageSize: number, token: string) => {
  try {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    const response = await api.get(`/${itemType}/getAll`, {
      params: { page, pageSize }
    });
    console.log("response",response)
    if(itemType === 'coupons') return response.data.items
    return response.data;
  } catch(error) {
    console.error(error);
    return [];
  }
};

export const addItem = async (itemType: string, data: any, token: string) => {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  
  if (itemType === 'infinityColors' || itemType === 'boxColors') {
    // Use the custom postFormData method for these item types
    const response = await api.postFormData(`/${itemType}/add-item`, data);
    return response.data;
  } else {
    // Use the regular post method for other item types
    const response = await api.post(`/${itemType}/add-item`, data);
    return response.data;
  }
};

export const updateItem = async (itemType: string, id: number, data: any, token: string) => {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  const response = await api.put(`/${itemType}/updateOne/${id}`, data);
  return response.data;
};

export const deleteItem = async (itemType: string, id: number, token: string) => {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  await api.delete(`/${itemType}/deleteOne/${id}`);
};



export const addCoupon = async (data: CreateCouponDTO, token: string) => {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  const response = await api.post('/coupons/create', data);
  return response.data;
};

export const updateCoupon = async (id: number, data: UpdateCouponDTO, token: string) => {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  const response = await api.patch(`/coupons/update/${id}`, data);
  return response.data;
};

export const deleteCoupon = async (id: string, token: string) => {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  await api.delete(`/coupons/delete/${id}`);
};