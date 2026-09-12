import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Icon } from '../../lib/icons';
import { Avatar, QuickAction, StatusBadge } from '../../components/Shared';

function apptDateLabel(a) {
  const d = new Date(a.date + 'T00:00:00');
  return `${d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} · ${a.time}`;
}

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const { doctorById, doctorId, appointments, patientName, patchAppointment, pushNotification, specialtyById } = useApp();
  const doc = doctorById(doctorId);
  const list = appointments
    .filter((a) => ['agendada', 'confirmada', 'em_andamento'].includes(a.status))
    .sort((a, b) => a.date.localeCompare(b.date));

  const startCall = (id) => {
    patchAppointment(id, { status: 'em_andamento' });
    pushNotification('Seu médico entrou na sala.', 'started');
    navigate('/doctor/call');
  };

  return (
    <>
      <h1 className="page-title">Olá, {doc.name}</h1>
      <div className="page-sub">Veja sua agenda de hoje e inicie seus atendimentos.</div>
      <div className="section-title">Próximas consultas</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {list.map((a, idx) => (
          <div
            key={a.id}
            className={`card ${idx === 0 ? 'card-hero' : ''}`}
            style={idx === 0 ? { borderColor: 'var(--c600)', background: 'linear-gradient(135deg, rgba(0,159,255,0.08), rgba(38,42,49,0.6))' } : undefined}
          >
            <div className="row-between" style={{ flexWrap: 'wrap', gap: 12 }}>
              <div className="flex-center">
                <Avatar name={patientName} size={44} />
                <div>
                  <div style={{ fontWeight: 500 }}>{patientName}</div>
                  <div className="small muted">{specialtyById(doc.specialty).name} · {apptDateLabel(a)}</div>
                </div>
              </div>
              <div className="flex-center">
                <StatusBadge status={a.status} />
                <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/doctor/appointments/${a.id}`)}>Ver consulta</button>
                {idx === 0 && (
                  <button className="btn btn-primary btn-sm" onClick={() => startCall(a.id)}>
                    <Icon name="video" /> Iniciar teleatendimento
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        {!list.length && <div className="card muted small" style={{ textAlign: 'center', padding: 30 }}>Nenhuma consulta na agenda.</div>}
      </div>
      <div className="section-title" style={{ marginTop: 28 }}>Ações rápidas</div>
      <div className="grid-3" style={{ marginBottom: 28 }}>
        <QuickAction icon="calendar" label="Ver agenda completa" onClick={() => navigate('/doctor/agenda')} />
        <QuickAction icon="users" label="Meus pacientes" onClick={() => navigate('/doctor/patients')} />
        <QuickAction icon="history" label="Histórico de atendimentos" onClick={() => navigate('/doctor/history')} />
      </div>
    </>
  );
}
