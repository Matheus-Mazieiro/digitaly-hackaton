import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Icon } from '../lib/icons';
import { Avatar, Logo } from './Shared';

const PATIENT_NAV = [
  { to: '/patient/dashboard', label: 'Início', icon: 'home' },
  { to: '/patient/appointments', label: 'Minhas consultas', icon: 'calendar' },
  { to: '/patient/schedule/specialty', label: 'Agendar consulta', icon: 'plusCalendar' },
  { to: '/patient/notifications', label: 'Notificações', icon: 'bell' },
  { to: '/patient/profile', label: 'Perfil e configurações', icon: 'settings' },
];

const DOCTOR_NAV = [
  { to: '/doctor/dashboard', label: 'Início', icon: 'home' },
  { to: '/doctor/agenda', label: 'Agenda', icon: 'calendar' },
  { to: '/doctor/availability', label: 'Disponibilidade', icon: 'clock' },
  { to: '/doctor/consultas', label: 'Consultas', icon: 'history' },
  { to: '/doctor/patients', label: 'Pacientes', icon: 'users' },
  { to: '/doctor/notifications', label: 'Notificações', icon: 'bell' },
  { to: '/doctor/profile', label: 'Perfil e configurações', icon: 'settings' },
];

function Sidebar({ nav, role, userName }) {
  const { logout } = useApp();
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <Logo height={34} />
      </div>
      <div className="nav-group">
        {nav.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <Icon name={n.icon} />
            <span>{n.label}</span>
          </NavLink>
        ))}
      </div>
      <div className="sidebar-foot">
        <div className="flex-center" style={{ padding: '8px 12px' }}>
          <Avatar name={userName} size={36} />
          <div style={{ overflow: 'hidden' }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 500,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {userName}
            </div>
            <div className="small muted">
              {role === 'patient' ? 'Paciente' : 'Médico(a)'}
            </div>
          </div>
        </div>
        <button className="nav-item" onClick={onLogout}>
          <Icon name="logout" />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
}

function Topbar({ title, unreadCount, notifTo }) {
  const navigate = useNavigate();
  return (
    <div className="topbar">
      <div className="topbar-title">{title}</div>
      <div className="topbar-right">
        <button className="icon-btn" onClick={() => navigate(notifTo)}>
          <Icon name="bell" />
          {unreadCount > 0 && <span className="dot" />}
        </button>
      </div>
    </div>
  );
}

function BottomNav({ nav }) {
  return (
    <nav className="bottom-nav">
      {nav.slice(0, 5).map((n) => (
        <NavLink
          key={n.to}
          to={n.to}
          className={({ isActive }) => (isActive ? 'active' : '')}
        >
          <Icon name={n.icon} size={20} />
        </NavLink>
      ))}
    </nav>
  );
}

const TITLES = {
  dashboard: 'Início',
  appointments: 'Minhas consultas',
  notifications: 'Notificações',
  profile: 'Perfil e configurações',
  schedule: 'Agendar consulta',
  preroom: 'Pré-sala',
  call: 'Consulta em andamento',
  summary: 'Resumo da consulta',
  review: 'Avaliar médico',
  agenda: 'Agenda',
  availability: 'Disponibilidade',
  consultas: 'Consultas',
  patients: 'Pacientes',
};

export function AppShell() {
  const { role, patientName, doctorById, doctorId, unreadCount } = useApp();
  const location = useLocation();

  const nav = role === 'patient' ? PATIENT_NAV : DOCTOR_NAV;
  const isCall = location.pathname.endsWith('/call');
  const userName =
    role === 'patient' ? patientName : doctorById(doctorId)?.name || 'Médico(a)';

  const segment = location.pathname.split('/')[2] || 'dashboard';
  const title = TITLES[segment] || 'Digitaly Hub';
  const notifTo = role === 'patient' ? '/patient/notifications' : '/doctor/notifications';

  return (
    <div className="app-shell">
      <Sidebar nav={nav} role={role} userName={userName} />
      <div className="main-col">
        {!isCall && (
          <Topbar title={title} unreadCount={unreadCount} notifTo={notifTo} />
        )}
        <div
          className="content"
          style={isCall ? { maxWidth: 1400, padding: '20px 28px' } : undefined}
        >
          <Outlet />
        </div>
      </div>
      <BottomNav nav={nav} />
    </div>
  );
}