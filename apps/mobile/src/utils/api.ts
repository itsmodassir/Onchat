import axios from 'axios';

// Replace with your local IP for physical device testing
const BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
});

export const authApi = {
  signup: (data: any) => api.post('/auth/signup', data),
  login: (data: any) => api.post('/auth/login', data),
  me: (token: string) => api.get('/auth/me', { headers: { Authorization: `Bearer ${token}` } }),
};

export const roomApi = {
  getRooms: () => api.get('/rooms'),
  createRoom: (token: string, data: any) => api.post('/rooms', data, { headers: { Authorization: `Bearer ${token}` } }),
  getRoomById: (id: string) => api.get(`/rooms/${id}`),
  joinRoom: (token: string, id: string) => api.post(`/rooms/${id}/join`, {}, { headers: { Authorization: `Bearer ${token}` } }),
};

export default api;
