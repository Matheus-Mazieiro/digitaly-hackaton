import { createContext, useContext, useMemo, useState, useCallback } from 'react';
import {
  DOCTORS,
  SPECIALTIES,
  APPOINTMENTS_SEED,
  NOTIFICATIONS_SEED,
  REVIEWS_SEED,
} from '../lib/mock';

const AppContext = createContext(null);
export const useApp = () => useContext(AppContext);

const EMPTY_BOOKING = {
  specialty: null, date: null, doctorId: null, time: null, sort: 'rating', reason: null,
};

export function AppProvider({ children }) {
  const [role, setRole] = useState(null);              // 'patient' | 'doctor' | null
  const [pendingRole, setPendingRole] = useState(null);
  const [patientName] = useState('Nathalia Souza');
  const [doctorId] = useState('d3');

  const [doctors, setDoctors] = useState(DOCTORS);
  const [appointments, setAppointments] = useState(APPOINTMENTS_SEED);
  const [notifications, setNotifications] = useState(NOTIFICATIONS_SEED);
  const [reviews, setReviews] = useState(REVIEWS_SEED);

  const [booking, setBooking] = useState(EMPTY_BOOKING);
  const [activeApptId, setActiveApptId] = useState(null);
  const [copilotTab, setCopilotTab] = useState('transcript');
  const [transcript, setTranscript] = useState([]);
  const [insights, setInsights] = useState([]);
  const [apptTab, setApptTab] = useState('proximas');
  const [patientSearch, setPatientSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);

  // --- derivados ---
  const doctorById = useCallback((id) => doctors.find((d) => d.id === id), [doctors]);
  const specialtyById = useCallback((id) => SPECIALTIES.find((s) => s.id === id), []);
  const apptById = useCallback((id) => appointments.find((a) => a.id === id), [appointments]);

  const nextPatientAppt = useCallback(
    () =>
      appointments
        .filter((a) => ['agendada', 'confirmada', 'em_andamento'].includes(a.status))
        .sort((a, b) => a.date.localeCompare(b.date))[0],
    [appointments],
  );

  const unreadCount = notifications.filter((n) => !n.read).length;

  // --- mutadores ---
  const pushNotification = useCallback((text, type = 'info') => {
    setNotifications((prev) => [
      { id: Date.now() + Math.random(), type, text, time: 'agora', read: false },
      ...prev,
    ]);
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
    setDoctors((prev) =>
      prev.map((d) =>
        d.id === docId
          ? {
              ...d,
              rating: Math.round(((d.rating * d.reviews) + stars) / (d.reviews + 1) * 100) / 100,
              reviews: d.reviews + 1,
            }
          : d,
      ),
    );
  }, []);

  const resetBooking = useCallback(() => setBooking(EMPTY_BOOKING), []);

  const logout = useCallback(() => {
    setRole(null);
    setPendingRole(null);
    setTranscript([]);
    setInsights([]);
    setBooking(EMPTY_BOOKING);
  }, []);

  const value = useMemo(
    () => ({
      // auth / role
      role, setRole, pendingRole, setPendingRole, logout,
      // perfil
      patientName, doctorId,
      // dados
      doctors, doctorById, specialtyById,
      appointments, apptById, patchAppointment, addAppointment,
      notifications, pushNotification, unreadCount,
      reviews, addReview,
      // agendamento
      booking, setBooking, resetBooking,
      // call / copiloto
      activeApptId, setActiveApptId,
      copilotTab, setCopilotTab, transcript, setTranscript, insights, setInsights,
      // filtros / UI
      apptTab, setApptTab, patientSearch, setPatientSearch,
      selectedPatient, setSelectedPatient,
      // helpers
      nextPatientAppt,
    }),
    [
      role, pendingRole, patientName, doctorId, doctors, doctorById, specialtyById,
      appointments, apptById, patchAppointment, addAppointment, notifications,
      pushNotification, unreadCount, reviews, addReview, booking, resetBooking,
      activeApptId, copilotTab, transcript, insights, apptTab, patientSearch,
      selectedPatient, nextPatientAppt, logout,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}