const BASE = 'https://globaltrotters-backend.onrender.com/api';

function getToken() {
  return localStorage.getItem('gt_token');
}

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'Something went wrong. Please try again.');
  }
  return data;
}

export const api = {
  signup: (payload) => request('/auth/signup', { method: 'POST', body: payload, auth: false }),
  login: (payload) => request('/auth/login', { method: 'POST', body: payload, auth: false }),
  getMe: () => request('/auth/me'),
  updateProfile: (payload) => request('/auth/me', { method: 'PATCH', body: payload }),
  changePassword: (payload) => request('/auth/change-password', { method: 'POST', body: payload }),

  listTrips: () => request('/trips'),
  createTrip: (payload) => request('/trips', { method: 'POST', body: payload }),
  getTrip: (id) => request(`/trips/${id}`),
  updateTrip: (id, payload) => request(`/trips/${id}`, { method: 'PATCH', body: payload }),
  deleteTrip: (id) => request(`/trips/${id}`, { method: 'DELETE' }),
  getBudget: (id) => request(`/trips/${id}/budget`),

  addCity: (tripId, payload) => request(`/trips/${tripId}/cities`, { method: 'POST', body: payload }),
  removeCity: (tripId, cityId) => request(`/trips/${tripId}/cities/${cityId}`, { method: 'DELETE' }),

  addActivity: (cityId, payload) => request(`/cities/${cityId}/activities`, { method: 'POST', body: payload }),
  removeActivity: (activityId) => request(`/activities/${activityId}`, { method: 'DELETE' }),

  search: (q) => request(`/search?q=${encodeURIComponent(q || '')}`, { auth: false }),
};