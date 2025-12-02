import { BASE_URL, ApiResponse, InventoryItem, User, InventoryFormData } from "../globalvariables"

export const postFormData = async (url: string, data: Record<string, any>) => {
  const formData = new FormData()
  Object.keys(data).forEach(key => formData.append(key, data[key]))

  const response = await fetch(url, { method: 'POST', body: formData });
  const text = await response.text();
  console.log("Raw response:", text);
  try {
    return JSON.parse(text);
  } catch (e) {
    throw new Error("Response is not valid JSON: " + text);
  }
}

export const loginUser = async (username: string, password: string): Promise<User> => {
  try {
    const response = await postFormData(`${BASE_URL}accounts/`, {
      username,
      password,
      _method: 'POST' // explicitly stating for the PHP switch
    })

    if (response.status === 'success') {
      return response.data
    } else {
      throw new Error(response.message || 'Login failed')
    }
  } catch (error) {
    console.error("Login Error:", error)
    throw error
  }
}

export const addInventoryItem = async (item: InventoryFormData, createdBy: string): Promise<void> => {
  const response = await postFormData(`${BASE_URL}`, {
    ...item,
    created_by: createdBy,
    action: 'create' // Or however the PHP expects it, adding a flag usually helps
  })

  if (response.status !== 'success') throw new Error(response.message || 'Failed to add item')
}

export const updateInventoryItem = async (id: string, item: InventoryFormData, created_by: string): Promise<void> => {
  // Simulating PUT via POST
  const response = await postFormData(`${BASE_URL}`, {
    ...item,
    id: id,
    created_by: created_by,
    _method: 'PUT'
  })

  if (response.status !== 'success') throw new Error(response.message || 'Failed to update item')
}