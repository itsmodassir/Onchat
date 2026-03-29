import axios from 'axios';

// Replace with your local IP for physical device testing
const BASE_URL = 'https://api.onchat.fun/api';

const api = axios.create({
  baseURL: BASE_URL,
});

export const authApi = {
  sendOtp: (email: string, purpose: string) => api.post('/auth/send-otp', { email, purpose }),
  signup: (data: any) => api.post('/auth/signup', data),
  login: (data: any) => api.post('/auth/login', data),
  resetPassword: (data: any) => api.post('/auth/reset-password', data),
  updateProfile: (token: string, data: any) => api.patch('/auth/update', data, { headers: { Authorization: `Bearer ${token}` } }),
  savePushToken: (token: string, pushToken: string) => api.patch('/auth/push-token', { token: pushToken }, { headers: { Authorization: `Bearer ${token}` } }),
  me: (token: string) => api.get('/auth/me', { headers: { Authorization: `Bearer ${token}` } }),
};

export const roomApi = {
  getRooms: () => api.get('/rooms'),
  createRoom: (token: string, data: any) => api.post('/rooms', data, { headers: { Authorization: `Bearer ${token}` } }),
  getRoomById: (id: string) => api.get(`/rooms/${id}`),
  getUpcomingRooms: () => api.get('/rooms/upcoming'),
  getRecommendedRooms: (token: string) => api.get('/social/recommended-rooms', { headers: { Authorization: `Bearer ${token}` } }),
  startScheduledRoom: (token: string, roomId: string) => api.post(`/rooms/${roomId}/start`, {}, { headers: { Authorization: `Bearer ${token}` } }),
  joinRoom: (token: string, id: string) => api.post(`/rooms/${id}/join`, {}, { headers: { Authorization: `Bearer ${token}` } }),
  approveJoin: (token: string, roomId: string, userId: string) => api.post(`/rooms/${roomId}/approve/${userId}`, {}, { headers: { Authorization: `Bearer ${token}` } }),
  rejectJoin: (token: string, roomId: string, userId: string) => api.post(`/rooms/${roomId}/reject/${userId}`, {}, { headers: { Authorization: `Bearer ${token}` } }),
};

export const monetizationApi = {
  getCreatorStats: (token: string) => api.get('/monetization/creator-stats', { headers: { Authorization: `Bearer ${token}` } }),
  requestWithdrawal: (token: string, data: { amount: number; method: string; details: string }) =>
    api.post('/monetization/withdraw', data, { headers: { Authorization: `Bearer ${token}` } }),
};

export const socialApi = {
  getProfile: (token: string, userId: string) => api.get(`/social/profile/${userId}`, { headers: { Authorization: `Bearer ${token}` } }),
  follow: (token: string, userId: string) => api.post(`/social/follow/${userId}`, {}, { headers: { Authorization: `Bearer ${token}` } }),
  unfollow: (token: string, userId: string) => api.post(`/social/unfollow/${userId}`, {}, { headers: { Authorization: `Bearer ${token}` } }),
  getFollowers: (token: string) => api.get('/social/followers', { headers: { Authorization: `Bearer ${token}` } }),
  updateInterests: (token: string, interests: string[]) => api.patch('/social/interests', { interests }, { headers: { Authorization: `Bearer ${token}` } }),
};

export const storeApi = {
  getItems: (category?: string) => api.get('/shop/items', { params: { category } }),
  buyItem: (token: string, itemId: string) => api.post(`/shop/buy/${itemId}`, {}, { headers: { Authorization: `Bearer ${token}` } }),
  getMyAssets: (token: string) => api.get('/shop/assets', { headers: { Authorization: `Bearer ${token}` } }),
  equipAsset: (token: string, assetId: string) => api.post(`/shop/equip/${assetId}`, {}, { headers: { Authorization: `Bearer ${token}` } }),
};

export const gameApi = {
  getLeaderboard: (token: string, type = 'COINS') =>
    api.get('/game/leaderboard', { params: { type }, headers: { Authorization: `Bearer ${token}` } }),
  getDailyReward: (token: string) =>
    api.get('/game/daily-reward', { headers: { Authorization: `Bearer ${token}` } }),
  claimDailyReward: (token: string) =>
    api.post('/game/daily-reward', {}, { headers: { Authorization: `Bearer ${token}` } }),
  getBadges: (token: string, userId: string) =>
    api.get(`/game/badges/${userId}`, { headers: { Authorization: `Bearer ${token}` } }),
};

export const moderationApi = {
  reportUser: (token: string, targetUserId: string, reason: string) =>
    api.post('/moderation/report', { targetUserId, reason }, { headers: { Authorization: `Bearer ${token}` } }),
  kickUser: (token: string, targetUserId: string, roomId: string) =>
    api.post('/moderation/kick', { targetUserId, roomId }, { headers: { Authorization: `Bearer ${token}` } }),
};

export default api;
