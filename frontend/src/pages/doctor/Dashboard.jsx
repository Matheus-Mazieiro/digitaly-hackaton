import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Icon } from '../../lib/icons';
import { Avatar, QuickAction, StatusBadge } from '../../components/Shared';
import { api } from '../../lib/api';

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const {
    doctorById,
    doctorId,
    appointments,
    patientName,
    patchAppointment,
    pushNotification,
    setActiveApptId,
  } = useApp();

  const doc = doctorById(doctorId);

  const upcoming = appointments
    .filter((a) => ['agendada', 'confirmada', 'em_andamento'].includes(a.status))
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));

  const startCall = async (id) => {
    setActiveApptId(id);
    try { await api.startAppointment(id); } catch (e) { console.warn('start', e); }
    patchAppointment(id, { status: 'em_andamento' });
    pushNotification('Seu médico entrou na sala.', 'started');
    navigate(`/doctor/call?room=${id}`);
  };

  return (
    <>
      <h1 className="page-title">Olá, {doc.name}</h1>
      <div className="page-sub">
        Suas próximas consultas — inicie a teleconsulta quando quiser.
      </div>

      <div className="section-title">Próximas consultas</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {upcoming.map((a, idx) => (
          <div
            key={a.id}
            className={`card ${idx === 0 ? 'card-hero' : ''}`}
            style={
              idx === 0
                ? {
                    borderColor: 'var(--celeste-600)',
                    background:
                      'linear-gradient(135deg, rgba(0,159,255,0.08), rgba(38,42,49,0.6))',
                  }
                : undefined
            }
          >
            <div className="row-between" style={{ flexWrap: 'wrap', gap: 12 }}>
              <div className="flex-center">
                <Avatar name={patientName} size={44} />
                <div>
                  <div style={{ fontWeight: 500 }}>{patientName}</div>
                  <div className="small muted">
                    {a.time} · {a.reason || 'Consulta'} · Sala #{a.id}
                  </div>
                </div>
              </div>
              <div className="flex-center">
                <StatusBadge status={a.status} />
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => navigate(`/doctor/consultas/${a.id}`)}
                >
                  Ver consulta
                </button>
                {idx === 0 && (
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => startCall(a.id)}
                  >
                    <Icon name="video" /> Iniciar teleatendimento
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {!upcoming.length && (
          <div className="card" style={{ textAlign: 'center', padding: 40 }}>
            <div style={{ color: 'var(--texto-3)', marginBottom: 10 }}>
              <Icon name="calendar" size={30} />
            </div>
            <div style={{ fontWeight: 500, marginBottom: 4 }}>
              Nenhuma consulta agendada
            </div>
            <div className="small muted" style={{ marginBottom: 18 }}>
              Aproveite para revisar sua agenda das próximas semanas.
            </div>
            <button
              className="btn btn-primary"
              style={{ margin: '0 auto' }}
              onClick={() => navigate('/doctor/agenda')}
            >
              Ver agenda completa
            </button>
          </div>
        )}
      </div>

      <div className="section-title" style={{ marginTop: 28 }}>
        Ações rápidas
      </div>
      <div className="grid-3" style={{ marginBottom: 28 }}>
        <QuickAction
          icon="calendar"
          label="Ver agenda completa"
          onClick={() => navigate('/doctor/agenda')}
        />
        <QuickAction
          icon="clock"
          label="Configurar disponibilidade"
          onClick={() => navigate('/doctor/availability')}
        />
        <QuickAction
          icon="users"
          label="Meus pacientes"
          onClick={() => navigate('/doctor/patients')}
        />
      </div>
    </>
  );
}