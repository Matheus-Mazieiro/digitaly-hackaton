import { createContext, useContext, useMemo, useState, useCallback, useEffect } from 'react';
import { SPECIALTIES } from '../lib/mock';
import { api, getToken, setToken } from '../lib/api';

const AppContext = createContext(null);
export const useApp = () => useContext(AppContext);

const EMPTY_BOOKING = {
  specialty: null, date: null, doctorId: null, time: null, sort: 'rating',
  reason: null, doctor: null, apptId: null,
};

// Disponibilidade padrão do médico (mantida para telas ainda não integradas)
const DEFAULT_AVAILABILITY = {
  1: ['08:00', '08:30', '09:00', '10:00', '14:00', '15:00'],
  2: ['08:00', '09:00', '10:00', '14:00', '15:00'],
  3: ['08:00', '08:30', '09:00', '10:00', '14:00', '15:00'],
  4: ['08:00', '09:00', '14:00', '15:00'],
  5: ['08:00', '09:00', '10:00'],
  6: [],
  0: [],
};

export function AppProvider({ children }) {
  const [role, setRole] = useState(null);
  const [token, setTokenState] = useState(getToken());
  const [user, setUser] = useState(null);
  const [pendingRole, setPendingRole] = useState(null);
  const [pendingToken, setPendingToken] = useState(null);

  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [reviews, setReviews] = useState({});
  const [availability, setAvailability] = useState(DEFAULT_AVAILABILITY);

  const [booking, setBooking] = useState(EMPTY_BOOKING);
  const [activeApptId, setActiveApptId] = useState(null);
  const [copilotTab, setCopilotTab] = useState('transcript');
  const [transcript, setTranscript] = useState([]);
  const [insights, setInsights] = useState([]);
  const [apptTab, setApptTab] = useState('proximas');
  const [patientSearch, setPatientSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);

  // identidade derivada do usuário logado
  const patientName = user?.nome || '';
  const doctorId = user?.id || '';

  // --- derivados ---
  const doctorById = useCallback((id) => doctors.find((d) => d.id === id), [doctors]);
  const specialtyById = useCallback((id) => SPECIALTIES.find((s) => s.id === id), []);
  const apptById = useCallback((id) => appointments.find((a) => a.id === id), [appointments]);

  const nextPatientAppt = useCallback(
    () =>
      appointments
        .filter((a) => ['agendada', 'confirmada', 'em_andamento'].includes(a.status))
        .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))[0],
    [appointments],
  );

  const unreadCount = notifications.filter((n) => !n.read).length;

  // --- loaders (backend real) ---
  const loadDoctors = useCallback(async () => {
    try {
      setDoctors(await api.listDoctors());
    } catch (e) {
      console.warn('[AppContext] loadDoctors', e);
    }
  }, []);

  const loadAppointments = useCallback(async () => {
    try {
      setAppointments(await api.listAppointments());
    } catch (e) {
      console.warn('[AppContext] loadAppointments', e);
    }
  }, []);

  const loadNotifications = useCallback(async () => {
    try {
      setNotifications(await api.listNotifications());
    } catch (e) {
      console.warn('[AppContext] loadNotifications', e);
    }
  }, []);

  const refresh = useCallback(async () => {
    await Promise.all([loadDoctors(), loadAppointments(), loadNotifications()]);
  }, [loadDoctors, loadAppointments, loadNotifications]);

  const setSession = useCallback(
    async (t) => {
      setToken(t);
      setTokenState(t);
      if (!t) {
        setRole(null);
        setUser(null);
        return;
      }
      const u = await api.me();
      setUser(u);
      setRole(u.role);
      await refresh();
    },
    [refresh],
  );

  const logout = useCallback(() => {
    setToken(null);
    setTokenState(null);
    setRole(null);
    setUser(null);
    setPendingRole(null);
    setPendingToken(null);
    setTranscript([]);
    setInsights([]);
    setBooking(EMPTY_BOOKING);
    setDoctors([]);
    setAppointments([]);
    setNotifications([]);
  }, []);

  // Se a página recarregar com token válido, restaura a sessão.
  useEffect(() => {
    if (token && !user) {
      setSession(token).catch(() => logout());
    }
  }, [token, user, setSession, logout]);

  // --- mutadores ---
  const pushNotification = useCallback((text, type = 'info') => {
    setNotifications((prev) => [
      { id: Date.now() + Math.random(), type, text, time: 'agora', read: false },
      ...prev,
    ]);
  }, []);

  const markNotificationRead = useCallback(async (id) => {
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    } catch (e) {
      console.warn('[AppContext] markNotificationRead', e);
    }
  }, []);

  const patchAppointment = useCallback((id, patch) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...(typeof patch === 'function' ? patch(a) : patch) } : a)),
    );
  }, []);

  const addAppointment = useCallback((appt) => {
    setAppointments((prev) => [...prev, appt]);
  }, []);

  const addReview = useCallback((docId, stars, text) => {
    setReviews((prev) => ({ ...prev, [docId]: [...(prev[docId] || []), { stars, text }] }));
  }, []);

  const resetBooking = useCallback(() => setBooking(EMPTY_BOOKING), []);

  const value = useMemo(
    () => ({
      role, setRole, token, user, setSession, logout,
      pendingRole, setPendingRole, pendingToken, setPendingToken,
      patientName, doctorId,
      doctors, doctorById, specialtyById,
      appointments, apptById, patchAppointment, addAppointment, loadAppointments, refresh,
      notifications, pushNotification, unreadCount, loadNotifications, markNotificationRead,
      reviews, addReview,
      availability, setAvailability,
      booking, setBooking, resetBooking,
      activeApptId, setActiveApptId,
      copilotTab, setCopilotTab, transcript, setTranscript, insights, setInsights,
      apptTab, setApptTab, patientSearch, setPatientSearch,
      selectedPatient, setSelectedPatient,
      nextPatientAppt,
    }),
    [
      role, token, user, setSession, logout, pendingRole, pendingToken,
      patientName, doctorId, doctors, doctorById, specialtyById,
      appointments, apptById, patchAppointment, addAppointment, loadAppointments, refresh,
      notifications, pushNotification, unreadCount, loadNotifications, markNotificationRead,
      reviews, addReview, availability, booking, resetBooking, activeApptId, copilotTab,
      transcript, insights, apptTab, patientSearch, selectedPatient, nextPatientAppt,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
