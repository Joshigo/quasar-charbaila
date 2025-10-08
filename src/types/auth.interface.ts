export interface LoginResponse {
  success: boolean;
  code: number;
  message: string;
  data: Data;
}

export interface Data {
  user: User;
  token: string;
  token_type: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at: null;
  created_at: Date;
  updated_at: Date;
}
