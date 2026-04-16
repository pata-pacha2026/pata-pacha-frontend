export interface Product {
  id: number;
  nameZh: string;
  nameEn: string;
  nameEs: string;
  nameFr: string;
  nameDe: string;
  descZh: string;
  descEn: string;
  descEs: string;
  descFr: string;
  descDe: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: string;
  rating: number;
  stock: number;
  isHot: boolean;
  isNew: boolean;
  createdAt: string;
}

export interface Category {
  id: number;
  slug: string;
  nameZh: string;
  nameEn: string;
  nameEs: string;
  nameFr: string;
  nameDe: string;
  icon: string;
  image: string;
  sortOrder: number;
}

export interface Promotion {
  id: number;
  titleZh: string;
  titleEn: string;
  titleEs: string;
  titleFr: string;
  titleDe: string;
  subtitleZh: string;
  subtitleEn: string;
  subtitleEs: string;
  subtitleFr: string;
  subtitleDe: string;
  type: 'flash' | 'bundle' | 'seasonal';
  discount: number;
  image: string;
  bgColor: string;
}

export interface CartItem {
  productId: number;
  quantity: number;
}

export interface Order {
  id: number;
  email: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  items: { productId: number; quantity: number; price: number }[];
  totalAmount: number;
  status: string;
  createdAt: string;
}

export type Locale = 'zh' | 'en' | 'es' | 'fr' | 'de';
