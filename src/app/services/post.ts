import { BASE_URL, ApiResponse, HandlerRequestData, User, InventoryFormData } from "../globalvariables";

export const postFormData = async (url: string, data: Record<string, any>) => {
  const formData = new FormData()
  Object.keys(data).forEach(key => formData.append(key, data[key]))

  const response = await fetch(url, { method: 'POST', body: formData });
  const text = await response.text();
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
  const response = await postFormData(`${BASE_URL}`, {
    ...item,
    id: id,
    created_by: created_by,
    _method: 'PUT'
  })

  if (response.status !== 'success') throw new Error(response.message || 'Failed to update item')
}

export const handlerRequestSqlFromAi = async (data: HandlerRequestData) => {
  const response = await postFormData(`${BASE_URL}handler_request/`, {
    ...data
  })

  if (response.status !== 'success') throw new Error(response.message || 'Failed to update with ai reponse')
}

export const getAllInformDatabase = async (type: string, token: string) => {
  const response = await postFormData(`${BASE_URL}get_allinform_database/`, {
    type: type,
    token: token
  })

  if (response.status !== 'success') throw new Error(response.message || 'Failed to get history chat')
  return response
}

// Update user password using the accounts endpoint supporting _method=PUT
export const updateUserPassword = async (
  currentUsername: string,
  currentPassword: string,
  newPassword: string,
  newUsername?: string
) => {
  // PHP expects current_username, current_password, new_password and optional username (new)
  const payload: Record<string, any> = {
    current_username: currentUsername,
    current_password: currentPassword,
    new_password: newPassword,
    _method: 'PUT'
  }

  if (newUsername && newUsername.trim() !== "") {
    payload.username = newUsername.trim();
  }

  const response = await postFormData(`${BASE_URL}accounts/`, payload)

  if (response.status !== 'success') throw new Error(response.message || 'Failed to update password')
  return response
}
