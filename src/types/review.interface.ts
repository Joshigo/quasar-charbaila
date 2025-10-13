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
  deleted_at: string | null;
}
export interface ReviewResponse {
  success: boolean;
  code: number;
  message: string;
  data: Data;
}

export interface Data {
  current_page: number;
  data: ReviewVisibilityData[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: Link[];
  next_page_url: string | null;
  path: string;
  rowsPerPage: number;
  prev_page_url: string | null;
  to: number;
  rowsNumber: number;
}

export interface Link {
  url: null | string;
  label: string;
  active: boolean;
}
