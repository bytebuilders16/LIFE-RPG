// API Client for LIFE RPG
const API_BASE = '/api';

export const TOKEN_KEY = 'liferpg_auth_token';

export const getStoredToken = () => localStorage.getItem(TOKEN_KEY);
export const setStoredToken = (token) => {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
};

async function request(endpoint, options = {}) {
  const token = getStoredToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  };

  const config = {
    ...options,
    headers
  };

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, config);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      if (response.status === 401 && !endpoint.includes('/auth/login')) {
        // Expired or invalid session
        setStoredToken(null);
        window.dispatchEvent(new CustomEvent('liferpg_auth_expired'));
      }
      const error = new Error(data.message || data.error || 'Server request failed');
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    throw err;
  }
}

export const api = {
  // Auth
  register: (payload) => request('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  login: (payload) => request('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  logout: () => {
    setStoredToken(null);
    return request('/auth/logout', { method: 'POST' }).catch(() => {});
  },
  getMe: () => request('/auth/me'),

  // Tasks / Quests
  getQuests: (params = {}) => {
    const query = new URLSearchParams();
    if (params.status) query.append('status', params.status);
    if (params.category) query.append('category', params.category);
    if (params.is_boss !== undefined) query.append('is_boss', params.is_boss);
    if (params.chain_id) query.append('chain_id', params.chain_id);
    const qs = query.toString();
    return request(`/tasks${qs ? `?${qs}` : ''}`);
  },
  getQuest: (id) => request(`/tasks/${id}`),
  createQuest: (payload) => request('/tasks', { method: 'POST', body: JSON.stringify(payload) }),
  updateQuest: (id, payload) => request(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteQuest: (id) => request(`/tasks/${id}`, { method: 'DELETE' }),
  completeQuest: (id, localDate) => request(`/tasks/${id}/complete`, {
    method: 'POST',
    body: JSON.stringify({ localDate: localDate || new Date().toISOString().split('T')[0] })
  }),

  // Character
  getCharacter: () => request('/character'),
  equipItem: (payload) => request('/character/equip', { method: 'POST', body: JSON.stringify(payload) }),

  // Shop & Inventory
  getShop: () => request('/shop'),
  purchaseShopItem: (id) => request(`/shop/${id}/purchase`, { method: 'POST' }),
  getInventory: () => request('/inventory'),

  // Achievements
  getAchievements: () => request('/achievements'),

  // Activity Timeline
  getActivity: (limit = 30) => request(`/activity?limit=${limit}`),

  // Analytics
  getAnalytics: () => request('/analytics'),

  // AI Game Master
  chatGameMaster: (message) => request('/ai/game-master', { method: 'POST', body: JSON.stringify({ message }) }),
  generateQuestFromAI: (prompt) => request('/ai/generate-quest', { method: 'POST', body: JSON.stringify({ prompt }) }),
  getCoachInsights: () => request('/ai/coach-insights'),
  acceptAiPlan: (plan) => request('/ai/accept-plan', { method: 'POST', body: JSON.stringify({ plan }) }),

  // Judge Demo Quick Start
  startDemo: () => request('/demo/start', { method: 'POST' })
};

export default api;
