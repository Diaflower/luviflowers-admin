import api from '@/lib/api';
import { Order, OrderStatus, OrderHandler, OrdersResponse, Coupon } from '@/types/types';

export const fetchOrders = async (
  page: number, 
  pageSize: number, 
  token: string, 
  sortField: 'createdAt' | 'total' | 'coupon' = 'createdAt', 
  sortDirection: 'asc' | 'desc' = 'desc',
  filterStatus: OrderStatus | 'ALL' = 'ALL',
  selectedCoupon: string = 'ALL',
  dateFilter: string = 'all',
  customStartDate?: Date,
  customEndDate?: Date
): Promise<OrdersResponse> => {
  try {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    const response = await api.get<OrdersResponse>(`/orders/all`, {
      params: { 
        page, 
        pageSize, 
        sortField, 
        sortDirection, 
        filterStatus, 
        selectedCoupon, 
        dateFilter,
        customStartDate: customStartDate?.toISOString(),
        customEndDate: customEndDate?.toISOString()
      }
    });
    return response.data;
  } catch(error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};



export const fetchCoupons = async (token: string): Promise<Coupon[]> => {
  try {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    const response = await api.get<Coupon[]>(`/coupons`);
    console.log("we we we",response)
    return response.data;
  } catch(error) {
    console.error('Error fetching coupons:', error);
    return [];
  }
};

export const getOrderById = async (id: string, token: string): Promise<Order> => {
  try {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    const response = await api.get<Order>(`/orders/getById/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching order:', error);
    throw error;
  }
};

export const updateOrderStatus = async (
  id: number, 
  status: OrderStatus, 
  processedBy: OrderHandler | undefined, 
  token: string
): Promise<Order> => {
  try {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    const payload = { status, processedBy };
    const response = await api.patch<Order>(`/orders/${id}/status`, payload);
    return response.data;
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};