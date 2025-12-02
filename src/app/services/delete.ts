import { ApiResponse, InventoryItem, User, InventoryFormData, BASE_URL } from '../globalvariables';
import { postFormData } from './post';

export const deleteInventoryItem = async (id: string): Promise<void> => {
  const response = await postFormData(`${BASE_URL}`, {
    id: id,
    _method: 'DELETE'
  });

  if (response.status !== 'success') throw new Error(response.message || 'Failed to delete item');
};