import AsyncStorage from '@react-native-async-storage/async-storage';

// URL base por defecto: deploy (puedes cambiar a localhost o 10.0.2.2 para pruebas locales)
export const API_URL = 'https://grupo3-backend-g3.onrender.com';

async function getToken() {
  try {
    return await AsyncStorage.getItem('token');
  } catch (e) {
    return null;
  }
}

export async function apiFetch(path, options = {}) {
  const token = await getToken();
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  const text = await res.text();
  try {
    return { ok: res.ok, status: res.status, data: JSON.parse(text || '{}') };
  } catch (e) {
    return { ok: res.ok, status: res.status, data: text };
  }
}

export async function postFormData(path, formData, method = 'POST') {
  const token = await getToken();
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const res = await fetch(`${API_URL}${path}`, { method, headers, body: formData });
  return { ok: res.ok, status: res.status, data: await res.json() };
}

export function fullUrl(path) {
  if (!path) return null;
  if (typeof path !== 'string') return null;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  if (path.startsWith('/')) return `${API_URL}${path}`;
  return `${API_URL}/${path}`;
}

export default { API_URL, apiFetch, postFormData };
