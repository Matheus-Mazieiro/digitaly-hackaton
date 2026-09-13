import { Navigate, Route, Routes } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { ToastProvider } from './context/ToastContext';
import ToastHost from './components/ToastHost';
import { AppShell } from './components/Layout';

// auth (Se você dividir os arquivos no futuro, atualize estes imports)
import {
  Login,
  SignupPatient,
  SignupDoctor,
  TwoFA,
} from './pages/auth/AuthScreens';

// patient
import PatientDashboard from './pages/patient/Dashboard';
import {
  ScheduleSpecialty,
  ScheduleDate,
  ScheduleDoctor,
  ScheduleConfirm,
  ScheduleCode,
} from './pages/patient/Schedule';
import Appointments from './pages/patient/Appointments';
import AppointmentDetail from './pages/patient/AppointmentDetail';
import Preroom from './pages/patient/Preroom';
import PatientCall from './pages/patient/Call';
import Review from './pages/patient/Review';
import Profile from './pages/patient/Profile';
import PatientNotifications from './pages/patient/Notifications';

// doctor
import DoctorDashboard from './pages/doctor/Dashboard';
import Agenda from './pages/doctor/Agenda';
import Availability from './pages/doctor/Availability';
import Consultas from './pages/doctor/Consultas';
import ConsultaDetail from './pages/doctor/ConsultaDetail';
import DoctorCall from './pages/doctor/Call';
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
        <Route path="review/:id" element={<Review />} />
        <Route path="profile" element={<Profile />} />
        <Route path="notifications" element={<PatientNotifications />} />

        {/* rotas antigas → redirect */}
        <Route
          path="history"
          element={<Navigate to="/patient/appointments" replace />}
        />
        <Route
          path="documents"
          element={<Navigate to="/patient/appointments" replace />}
        />
        <Route
          path="summary/:id"
          element={<Navigate to="/patient/appointments" replace />}
        />
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
        <Route path="availability" element={<Availability />} />
        <Route path="consultas" element={<Consultas />} />
        <Route path="consultas/:id" element={<ConsultaDetail />} />
        <Route path="call" element={<DoctorCall />} />
        <Route path="patients" element={<Patients />} />
        <Route path="patients/:name" element={<PatientProfile />} />
        <Route path="profile" element={<DoctorProfile />} />
        <Route path="notifications" element={<DoctorNotifications />} />

        {/* rotas antigas → redirect */}
        <Route
          path="history"
          element={<Navigate to="/doctor/consultas" replace />}
        />
        <Route
          path="appointments/:id"
          element={<Navigate to="/doctor/consultas" replace />}
        />
      </Route>

      {/* raiz */}
      <Route
        path="/"
        element={<Navigate to={role ? `/${role}/dashboard` : '/login'} replace />}
      />
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