// Cliente real da API (backend Go). Substitui o mock.
// Contrato em camelCase — ver docs/superpowers/specs e relatórios BB.

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8085';
const TOKEN_KEY = 'digitaly_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
};

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    let msg = res.statusText;
    try {
      const data = await res.json();
      if (typeof data === 'string') msg = data;
      else if (data && (data.error || data.message)) msg = data.error || data.message;
      else msg = JSON.stringify(data);
    } catch {
      /* mantém statusText */
    }
    // tira o prefixo dos erros do backend (ex.: "validation: ...")
    msg = String(msg).replace(/^(validation|conflict|unauthorized|not found):\s*/i, '');
    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }

  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  setToken,
  getToken,

  // Auth
  signup: (payload) => request('/api/auth/signup', { method: 'POST', body: payload, auth: false }),
  login: (payload) => request('/api/auth/login', { method: 'POST', body: payload, auth: false }),
  verify: (payload) => request('/api/auth/verify', { method: 'POST', body: payload, auth: false }),
  resend: (payload) => request('/api/auth/resend', { method: 'POST', body: payload, auth: false }),
  me: () => request('/api/auth/me'),

  // Especialidades e médicos
  listSpecialties: () => request('/api/specialties', { auth: false }),
  listDoctors: (specialty, date) => {
    const q = new URLSearchParams();
    if (specialty) q.set('specialty', specialty);
    if (date) q.set('date', date);
    const qs = q.toString();
    return request(`/api/doctors${qs ? `?${qs}` : ''}`, { auth: false });
  },
  listDoctorSlots: (id, date) => request(`/api/doctors/${id}/slots?date=${date}`, { auth: false }),

  // Consultas
  listAppointments: () => request('/api/appointments'),
  getAppointment: (id) => request(`/api/appointments/${id}`),
  createAppointment: (payload) => request('/api/appointments', { method: 'POST', body: payload }),
  confirmAppointment: (id, code) => request(`/api/appointments/${id}/confirm`, { method: 'POST', body: { code } }),
  startAppointment: (id) => request(`/api/appointments/${id}/start`, { method: 'POST' }),

  // Notificações
  listNotifications: () => request('/api/notifications'),
  markNotificationRead: (id) => request(`/api/notifications/${id}/read`, { method: 'PATCH' }),
};

export default api;
