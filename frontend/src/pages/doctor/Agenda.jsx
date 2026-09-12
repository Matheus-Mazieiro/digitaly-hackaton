import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Icon } from '../../lib/icons';
import { StatusBadge } from '../../components/Shared';

function apptDateLabel(a) {
  const d = new Date(a.date + 'T00:00:00');
  return `${d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} · ${a.time}`;
}

export default function Agenda() {
  const navigate = useNavigate();
  const { appointments, patientName } = useApp();
  const list = appointments
    .filter((a) => a.status !== 'cancelada')
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));

  return (
    <>
      <button className="btn-ghost btn-sm" style={{ marginBottom: 8 }} onClick={() => navigate('/doctor/dashboard')}>
        <Icon name="arrowLeft" /> Início
      </button>
      <h1 className="page-title">Agenda</h1>
      <div className="page-sub">Suas consultas organizadas por horário.</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {list.map((a) => (
          <div
            key={a.id}
            className="card row-between clickable"
            style={{ flexWrap: 'wrap', gap: 12 }}
            onClick={() => navigate(`/doctor/appointments/${a.id}`)}
          >
            <div className="flex-center">
              <div className="num" style={{ fontWeight: 600, width: 52 }}>{a.time}</div>
              <div>
                <div style={{ fontWeight: 500 }}>{patientName}</div>
                <div className="small muted">{apptDateLabel(a)}</div>
              </div>
            </div>
            <StatusBadge status={a.status} />
          </div>
        ))}
      </div>
    </>
  );
}