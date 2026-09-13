// Cliente real da API (substitui o mock). Contrato em camelCase — ver spec §6.

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
const TOKEN_KEY = 'digitaly_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
};

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = {};
  const isForm = typeof FormData !== 'undefined' && body instanceof FormData;
  if (!isForm) headers['Content-Type'] = 'application/json';

  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body == null ? undefined : isForm ? body : JSON.stringify(body),
  });

  if (!res.ok) {
    let message = res.statusText;
    try {
      const data = await res.json();
      if (typeof data === 'string') message = data;
      else if (data && data.error) message = data.error;
    } catch {
      /* mantém statusText */
    }
    const err = new Error(message);
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
    return request(`/api/doctors?${q.toString()}`, { auth: false });
  },
  listDoctorSlots: (id, date) => request(`/api/doctors/${id}/slots?date=${date}`, { auth: false }),
  listMyAppointments: () => request('/api/doctors/me/appointments'),

  // Consultas
  listAppointments: () => request('/api/appointments'),
  getAppointment: (id) => request(`/api/appointments/${id}`),
  createAppointment: (payload) => request('/api/appointments', { method: 'POST', body: payload }),
  confirmAppointment: (id, code) => request(`/api/appointments/${id}/confirm`, { method: 'POST', body: { code } }),
  startAppointment: (id) => request(`/api/appointments/${id}/start`, { method: 'POST' }),
  uploadAudio: (id, formData) => request(`/api/appointments/${id}/audio`, { method: 'POST', body: formData }),
  createReceita: (id, payload) => request(`/api/appointments/${id}/receita`, { method: 'POST', body: payload }),
  review: (id, stars) => request(`/api/appointments/${id}/review`, { method: 'POST', body: { stars } }),

  // PDFs (links diretos para download)
  prontuarioPdfUrl: (id) => `${BASE_URL}/api/appointments/${id}/prontuario.pdf`,
  receitaPdfUrl: (id) => `${BASE_URL}/api/appointments/${id}/receita.pdf`,

  // Notificações
  listNotifications: () => request('/api/notifications'),
  markNotificationRead: (id) => request(`/api/notifications/${id}/read`, { method: 'PATCH' }),
};

export default api;
