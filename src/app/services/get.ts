import { ApiResponse, InventoryItem, User } from '../globalvariables';
import { BASE_URL } from '../globalvariables';

export const fetchInventoryData = async (user: string): Promise<InventoryItem[]> => {
  try {
    const response = await fetch(BASE_URL);

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const json: ApiResponse = await response.json();

    if (json.status !== 'success') {
      throw new Error('API returned non-success status');
    }
    // Handle both single object and array responses to be robust
    if (Array.isArray(json.data)) {
      return json.data;
    } else if (json.data) {
      return [json.data];
    }

    return [];
  } catch (error) {
    console.error("Failed to fetch inventory:", error);
    throw error;
  }
};

export const getUserAuth = async (): Promise<{ user?: User } | User | null> => {
  const response = await fetch("/v1/api/auth/me");
  if (!response.ok) return null;
  const data = await response.json();
  return data as { user?: User } | User;
}