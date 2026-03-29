import axios from 'axios';
import { useAuthStore } from '../store/authStore';

// Replace with your local IP for physical device testing
const BASE_URL = 'http://13.126.135.253/api';

const api = axios.create({
  baseURL: BASE_URL,
});

// Add interceptor to automatically attach token on EVERY request if it exists
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers = config.headers || {};
    if (typeof config.headers.set === 'function') {
      config.headers.set('Authorization', `Bearer ${token}`);
    } else {
      (config.headers as any).Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export const authApi = {
  sendOtp: (email: string, purpose: string) => api.post('/auth/send-otp', { email, purpose }),
  signup: (data: any) => api.post('/auth/signup', data),
  login: (data: any) => api.post('/auth/login', data),
  resetPassword: (data: any) => api.post('/auth/reset-password', data),
  updateProfile: (data: any) => api.patch('/auth/update', data),
  savePushToken: (pushToken: string) => api.patch('/auth/push-token', { token: pushToken }),
  me: () => api.get('/auth/me'),
};

export const roomApi = {
  getRooms: () => api.get('/rooms'),
  createRoom: (data: any) => api.post('/rooms', data),
  getRoomById: (id: string) => api.get(`/rooms/${id}`),
  getUpcomingRooms: () => api.get('/rooms/upcoming'),
  getRecommendedRooms: () => api.get('/social/recommended-rooms'),
  startScheduledRoom: (roomId: string) => api.post(`/rooms/${roomId}/start`, {}),
  joinRoom: (id: string) => api.post(`/rooms/${id}/join`, {}),
  approveJoin: (roomId: string, userId: string) => api.post(`/rooms/${roomId}/approve/${userId}`, {}),
  rejectJoin: (roomId: string, userId: string) => api.post(`/rooms/${roomId}/reject/${userId}`, {}),
  sendGift: (data: { roomId: string; giftId: string; quantity: number; targetUserId: string }) => 
    api.post('/shop/gift', data),
};

export const monetizationApi = {
  getCreatorStats: () => api.get('/monetization/creator-stats'),
  requestWithdrawal: (data: { amount: number; method: string; details: string }) =>
    api.post('/monetization/withdraw', data),
};

export const socialApi = {
  getProfile: (userId: string) => api.get(`/social/profile/${userId}`),
  follow: (userId: string) => api.post('/social/follow', { userId }),
  unfollow: (userId: string) => api.delete(`/social/unfollow/${userId}`),
  getFollowers: (userId: string) => api.get(`/social/followers/${userId}`),
  updateInterests: (interests: string[]) => api.patch('/social/interests', { interests }),
};

export const storeApi = {
  getItems: (category?: string) => api.get('/shop/store', { params: { category } }),
  buyItem: (itemId: string) => api.post('/shop/store/buy', { itemId }),
  getMyAssets: () => api.get('/shop/assets'),
  equipAsset: (assetId: string) => api.post(`/shop/equip/${assetId}`, {}),
};

export const gameApi = {
  getLeaderboard: (type = 'COINS') =>
    api.get('/game/leaderboard', { params: { type } }),
  getDailyReward: () =>
    api.get('/game/daily-reward'),
  claimDailyReward: () =>
    api.post('/game/daily-reward', {}),
  getBadges: (userId: string) =>
    api.get(`/game/badges/${userId}`),
  playGriddy: (betAmount: number) =>
    api.post('/luck/griddy/play', { betAmount }),
};

export const moderationApi = {
  reportUser: (targetUserId: string, reason: string) =>
    api.post('/moderation/report', { targetUserId, reason }),
  kickUser: (targetUserId: string, roomId: string) =>
    api.post('/moderation/kick', { targetUserId, roomId }),
};

export const storageApi = {
  upload: (file: any) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/storage/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  getMedia: () => api.get('/storage/media'),
  deleteMedia: (id: string) => api.delete(`/storage/media/${id}`),
  getStats: () => api.get('/storage/stats'),
};

export default api;
