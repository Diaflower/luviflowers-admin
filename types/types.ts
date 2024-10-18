// types/index.ts
export interface Image {
  id: number;
  url: string;
  altText_en?: string;
  altText_ar?: string;
}

export interface Item {
  id: number;
  name_en?: string;
  name_ar?: string;
  altText_en?: string;
  altText_ar?: string;
  color?: string;
  image?: Image;
  status?: string;
  category?: {
    name_en: string
  }
}

export interface Product {
  id: number;
  code?: string;
  name_en: string;
  name_ar: string;
  slug: string;
  shortDescription_en: string;
  shortDescription_ar: string;
  longDescription_en: string;
  longDescription_ar: string;
  metaTitle_en?: string;
  metaTitle_ar?: string;
  metaDescription_en?: string;
  metaDescription_ar?: string;
  featured: boolean;
  status: ProductStatus;
  productType: ProductType;
  categoryId: number;
  category: {
    name_en: string;
  };
  mainImage: Image;
  variations: ProductVariation[];
  tags: number[]; // Changed from Array<{ id: number; name_en: string }> to number[]
  addons: number[]; // Changed from Array<{ id: number; name_en: string }> to number[]
}

export enum ProductStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED'
}

export enum ProductType {
  LONG_LIFE = 'LONG_LIFE',
  BOUQUET = 'BOUQUET',
  ARRANGEMENT = 'ARRANGEMENT',
  ACRYLIC_BOX = 'ACRYLIC_BOX'
}

export interface ProductVariation {
  id?: number;
  sku: string;
  barcode?: string;
  price: number;
  previousPrice?: number;
  inStock: boolean;
  weight?: number;
  sizeId?: number;
  infinityColorId?: number;
  boxColorId?: number;
  wrappingColorId?: number;
  isDefault: boolean;
  image?: Image;
}

export interface Coupon {
  maxUses: string;
  isSpecial: boolean;
  specialCustomer?: string;
  specialEmail?: string;
  specialPhone?: string;
  id: number;
  name: string;
  code: string;
  discount: number;
  expiryDate: string;
}

export type ItemType = 'categories' | 'tags' | 'wrappingColors' | 'productSizes' | 'infinityColors' | 'boxColors' | 'products' | 'addons' | 'addonSizes' |'coupons';

export enum OrderStatus {
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  PAID = 'PAID',
  PROCESSING = 'PROCESSING',
  ON_DELIVERY = 'ON_DELIVERY',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  CASH_PAYMENT= 'CASH_PAYMENT'
}

export enum OrderHandler {
  HIND = 'HIND',
  RUKAIYA = 'RUKAIYA',
  KRIS = 'KRIS',
  FATIMA = 'FATIMA'
}

export interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    id: number;
    name_en: string;
    name_ar: string;
    category: {
      name_en: string;
      name_ar: string;
    };
    mainImage?: {
      url: string;
    };
  };
  productVariation: {
    size?: {
      name_en: string;
      name_ar: string;
    };
    infinityColor?: {
      name_en: string;
      name_ar: string;
    };
    boxColor?: {
      name_en: string;
      name_ar: string;
    };
    wrappingColor?: {
      name_en: string;
      name_ar: string;
    };
  };
  addons?: OrderItemAddon[];
}

export interface OrderItemAddon {
  id: string;
  quantity: number;
  price: number;
  addon: {
    name_en: string;
    name_ar: string;
  };
  addonVariation: {
    size?: {
      name_en: string;
      name_ar: string;
    };
  };
}
export interface Order {
  id: number;
  createdAt: string;
  updatedAt: string;
  status: OrderStatus;
  processedBy?: OrderHandler; // New field
  total: number;
  subtotal: number;
  taxInfo: number;
  shippingCost: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: {
    addressLine1: string;
    state: string;
    country: string;
    postalCode: string;
    phone:string;
    firstName?:string;
    lastName?:string; 
  };
  items: OrderItem[];
  coupon?: {
    discount: number;
    code?:string;
  };
  cardMessage?: string;
}

export interface OrdersResponse {
  items: Order[];
  totalPages: number;
  totalCount: number;
  currentPage: number;
}








// products related:


export interface Category {
  id: number
  name_en: string
  name_ar: string
}

export interface ProductSize {
  id: number
  name_en: string
  name_ar: string
}

export interface InfinityColor {
  id: number
  name_en: string
  name_ar: string
  color?: string
}

export interface BoxColor {
  id: number
  name_en: string
  name_ar: string
  color?: string
}

export interface WrappingColor {
  id: number
  name_en: string
  name_ar: string
  color?: string
}

export interface ProductTag {
  id: number
  name_en: string
  name_ar: string
}

export interface Addon {
  id: number
  name_en: string
  name_ar: string
}