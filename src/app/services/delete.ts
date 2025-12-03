import { ApiResponse, InventoryItem, User, InventoryFormData, BASE_URL } from '../globalvariables'
import { postFormData } from './post'

export const deleteInventoryItem = async (id: string, token: string): Promise<void> => {
  const response = await fetch(`${BASE_URL}?token=${token}&id=${id}`, {
    method: 'DELETE'
  })

  const json = await response.json()
  const data = json.data
  return data
}