import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Icon } from '../../lib/icons';
import { Avatar } from '../../components/Shared';

function apptDateLabel(a) {
  const d = new Date(a.date + 'T00:00:00');
  return `${d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} · ${a.time}`;
}

export default function DoctorHistory() {
  const navigate = useNavigate();
  const { appointments, patientName } = useApp();
  const past = appointments.filter((a) => a.status === 'concluida').sort((a, b) => b.date.localeCompare(a.date));

  return (
    <>
      <button className="btn-ghost btn-sm" style={{ marginBottom: 8 }} onClick={() => navigate('/doctor/dashboard')}>
        <Icon name="arrowLeft" /> Início
      </button>
      <h1 className="page-title">Histórico</h1>
      <div className="page-sub">Consultas já realizadas.</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {past.map((a) => (
          <div key={a.id} className="card clickable" onClick={() => navigate(`/doctor/history/${a.id}`)}>
            <div className="row-between" style={{ flexWrap: 'wrap', gap: 10 }}>
              <div className="flex-center">
                <Avatar name={patientName} size={40} fontSize={13} />
                <div>
                  <div style={{ fontWeight: 500 }}>{patientName}</div>
                  <div className="small muted">{apptDateLabel(a)}</div>
                </div>
              </div>
              {a.hasSummary && <span className="badge badge-info"><Icon name="sparkle" size={12} /> Resumo por IA</span>}
            </div>
          </div>
        ))}
        {!past.length && <div className="card muted small" style={{ textAlign: 'center', padding: 30 }}>Nenhuma consulta concluída ainda.</div>}
      </div>
    </>
  );
}