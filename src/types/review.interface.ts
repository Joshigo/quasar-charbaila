export interface ReviewVisibilityResponse {
  success: boolean;
  code: number;
  message: string;
  data: ReviewVisibilityData;
}

export interface ReviewVisibilityData {
  id: number;
  name: string;
  email: string;
  comment: string;
  rating: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: null;
}
export interface ReviewResponse {
  success: boolean;
  code: number;
  message: string;
  data: Data;
}

export interface Data {
  current_page: number;
  data: Datum[];
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

export interface Datum {
  id: number;
  name: string;
  email: string;
  comment: string;
  rating: number;
  is_visible: number;
  created_at: Date;
  updated_at: Date;
  deleted_at: null | Date;
}

export interface Link {
  url: null | string;
  label: string;
  active: boolean;
}
