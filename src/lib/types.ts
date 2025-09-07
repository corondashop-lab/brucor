
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  stock: number;
  featured?: boolean;
  reviews: Review[];
}

export interface Advertisement {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  type: 'advertisement';
}

export interface AboutData {
  id: string;
  title: string;
  text: string;
  imageUrl: string;
  imageHint: string;
  highlight: string;
}

export type SliderItem = Product | Advertisement;

export interface Category {
  id: string;
  name:string;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  comment: string;
  date: string;
}

export interface CartItem extends Product {
  quantity: number;
  imageUrl: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  isVerified?: boolean;
}

export interface StoredUser extends User {
    hashedPassword?: string;
    saleIds?: string[];
    isVerified?: boolean;
}

export interface CustomerInfo {
    userId?: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    zip: string;
}

export interface Sale {
    id: string;
    customerInfo: CustomerInfo;
    date: string;
    total: number;
    status: "Completado" | "Procesando" | "Cancelado";
    items: Omit<CartItem, 'description' | 'stock' | 'featured' | 'reviews'>[];
}
