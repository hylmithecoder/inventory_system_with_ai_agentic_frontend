import "dotenv/config"

export interface InventoryItem {
  ID: string;
  created_at: string;
  name: string;
  stock: string;
  price: string;
  created_by: string;
}

export interface ApiResponse {
  status: string;
  data: InventoryItem | InventoryItem[];
}

export interface User {
  ID: string;
  created_at: string;
  username: string;
  isAdmin: string;
  token?: string;
  session_token: string;
}

export interface InventoryFormData {
  name: string;
  stock: string;
  price: string;
}

export interface HandlerRequestData {
  action: string;
  request: string;
  response: string
  sql_script: string;
  token: string;
}

export interface HandleGetUserData {
  auth: boolean;
  user: {
    exp: number;
    iat: number;
    isAdmin: string;
    session_token: string;
    username: string;
  }
}

export const BASE_URL = process.env.NEXT_PUBLIC_API_SERVER;
export const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY as any || "";
