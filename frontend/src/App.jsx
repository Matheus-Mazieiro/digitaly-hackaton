import { Navigate, Route, Routes } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { ToastProvider } from './context/ToastContext';
import ToastHost from './components/ToastHost';
import { AppShell } from './components/Layout';

// auth
import { Login, SignupPatient, SignupDoctor, CrmValidating, TwoFA } from './pages/auth/AuthScreens';

// patient
import PatientDashboard from './pages/patient/Dashboard';
import {
  ScheduleSpecialty, ScheduleDate, ScheduleDoctor, ScheduleConfirm, ScheduleCode,
} from './pages/patient/Schedule';
import Appointments from './pages/patient/Appointments';
import AppointmentDetail from './pages/patient/AppointmentDetail';
import Preroom from './pages/patient/Preroom';
import PatientCall from './pages/patient/Call';
import History from './pages/patient/History';
import Summary from './pages/patient/Summary';
import Documents from './pages/patient/Documents';
import Review from './pages/patient/Review';
import Profile from './pages/patient/Profile';
import PatientNotifications from './pages/patient/Notifications';

// doctor
import DoctorDashboard from './pages/doctor/Dashboard';
import Agenda from './pages/doctor/Agenda';
import DoctorAppointmentDetail from './pages/doctor/AppointmentDetail';
import DoctorCall from './pages/doctor/Call';
import DoctorHistory from './pages/doctor/History';
import DoctorHistoryDetail from './pages/doctor/HistoryDetail';
import Patients from './pages/doctor/Patients';
import PatientProfile from './pages/doctor/PatientProfile';
import DoctorProfile from './pages/doctor/Profile';
import DoctorNotifications from './pages/doctor/Notifications';

function RequireRole({ role, children }) {
  const { role: current } = useApp();
  if (!current) return <Navigate to="/login" replace />;
  if (current !== role) return <Navigate to={`/${current}/dashboard`} replace />;
  return children;
}

function AppRoutes() {
  const { role } = useApp();
  return (
    <Routes>
      {/* públicas */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup/patient" element={<SignupPatient />} />
      <Route path="/signup/doctor" element={<SignupDoctor />} />
      <Route path="/crm-validating" element={<CrmValidating />} />
      <Route path="/2fa" element={<TwoFA />} />

      {/* paciente */}
      <Route
        path="/patient"
        element={
          <RequireRole role="patient">
            <AppShell />
          </RequireRole>
        }
      >
        <Route index element={<Navigate to="/patient/dashboard" replace />} />
        <Route path="dashboard" element={<PatientDashboard />} />
        <Route path="schedule/specialty" element={<ScheduleSpecialty />} />
        <Route path="schedule/date" element={<ScheduleDate />} />
        <Route path="schedule/doctor" element={<ScheduleDoctor />} />
        <Route path="schedule/confirm" element={<ScheduleConfirm />} />
        <Route path="schedule/code" element={<ScheduleCode />} />
        <Route path="appointments" element={<Appointments />} />
        <Route path="appointments/:id" element={<AppointmentDetail />} />
        <Route path="preroom" element={<Preroom />} />
        <Route path="call" element={<PatientCall />} />
        <Route path="history" element={<History />} />
        <Route path="summary/:id" element={<Summary />} />
        <Route path="documents" element={<Documents />} />
        <Route path="review/:id" element={<Review />} />
        <Route path="profile" element={<Profile />} />
        <Route path="notifications" element={<PatientNotifications />} />
      </Route>

      {/* médico */}
      <Route
        path="/doctor"
        element={
          <RequireRole role="doctor">
            <AppShell />
          </RequireRole>
        }
      >
        <Route index element={<Navigate to="/doctor/dashboard" replace />} />
        <Route path="dashboard" element={<DoctorDashboard />} />
        <Route path="agenda" element={<Agenda />} />
        <Route path="appointments/:id" element={<DoctorAppointmentDetail />} />
        <Route path="call" element={<DoctorCall />} />
        <Route path="history" element={<DoctorHistory />} />
        <Route path="history/:id" element={<DoctorHistoryDetail />} />
        <Route path="patients" element={<Patients />} />
        <Route path="patients/:name" element={<PatientProfile />} />
        <Route path="profile" element={<DoctorProfile />} />
        <Route path="notifications" element={<DoctorNotifications />} />
      </Route>

      {/* raiz */}
      <Route path="/" element={<Navigate to={role ? `/${role}/dashboard` : '/login'} replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AppProvider>
      <ToastProvider>
        <AppRoutes />
        <ToastHost />
      </ToastProvider>
    </AppProvider>
  );
}