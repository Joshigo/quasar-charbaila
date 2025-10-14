export interface GalleryResponse {
  success: boolean;
  code: number;
  message: string;
  data: Data;
}

export interface Data {
  current_page: number;
  data: GalleryData[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: Link[];
  next_page_url: null;
  path: string;
  per_page: number;
  prev_page_url: null;
  to: number;
  total: number;
}

export interface GalleryData {
  id: number;
  category_id: number;
  is_pinned: number;
  is_visible: number;
  type: string;
  src: string;
  alt: null;
  title: string;
  description: null;
  duration: string;
  participants: number;
  likes: null;
  views: null;
  created_at: Date;
  updated_at: Date;
  category: Category;
}

export interface Category {
  id: number;
  name: string;
  created_at: Date;
  updated_at: Date;
}

export interface Link {
  url: null | string;
  label: string;
  active: boolean;
}

export interface CreateGalleryPayload {
  category_id: number;
  is_pinned: number;
  is_visible: number;
  type: 'image';
  title: string;
  description?: string | null;
  duration: string;
  participants?: number;
  image: File | Blob;
}

export interface UpdateGalleriePayload {
  category_id?: number;
  is_pinned?: number;
  is_visible?: number;
  type?: string;
  src?: string;
  title?: string;
  description?: string | null;
  duration?: string;
  participants?: number;
}
