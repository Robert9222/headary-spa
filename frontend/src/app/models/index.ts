export interface Service {
  id: number;
  /** Może być stringiem (legacy) albo obiektem tłumaczeń { pl, en, fi }. */
  name: string | { [lang: string]: string };
  category: string;
  description: string | { [lang: string]: string };
  price: number;
  duration_minutes: number;
  image_url: string;
  is_active: boolean;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface GalleryItem {
  id: number;
  title: string;
  description: string;
  image_url: string;
  service_id: number | null;
  order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Employee {
  id: number;
  name: string;
  email: string;
  phone: string;
  specialization: string;
  avatar_url: string;
  bio: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface Setting {
  id: number;
  key: string;
  value: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: number;
  client_name: string;
  client_email: string;
  service_id: number;
  rating: number;
  content: string | { [key: string]: string };
  language: string;
  is_approved: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export * from './page-section';

