import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Icon } from '../../lib/icons';
import { Avatar } from '../../components/Shared';

function apptDateLabel(a) {
  const d = new Date(a.date + 'T00:00:00');
  return `${d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} · ${a.time}`;
}

export default function History() {
  const navigate = useNavigate();
  const { appointments, doctorById, specialtyById } = useApp();
  const past = appointments.filter((a) => a.status === 'concluida').sort((a, b) => b.date.localeCompare(a.date));

  return (
    <>
      <button className="btn-ghost btn-sm" style={{ marginBottom: 8 }} onClick={() => navigate('/patient/dashboard')}>
        <Icon name="arrowLeft" /> Início
      </button>
      <h1 className="page-title">Histórico</h1>
      <div className="page-sub">Suas consultas já realizadas, com resumos e laudos.</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {past.map((a) => {
          const doc = doctorById(a.doctorId);
          return (
            <div key={a.id} className="card clickable" onClick={() => navigate(`/patient/summary/${a.id}`)}>
              <div className="row-between" style={{ flexWrap: 'wrap', gap: 10 }}>
                <div className="flex-center">
                  <Avatar name={doc.name} size={40} fontSize={13} />
                  <div>
                    <div style={{ fontWeight: 500 }}>{doc.name}</div>
                    <div className="small muted">{specialtyById(doc.specialty).name} · {apptDateLabel(a)}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {a.hasSummary && <span className="badge badge-info"><Icon name="sparkle" size={12} /> Resumo</span>}
                  {a.hasReport && <span className="badge badge-success"><Icon name="file" size={12} /> Laudo</span>}
                </div>
              </div>
            </div>
          );
        })}
        {!past.length && <div className="card muted small" style={{ textAlign: 'center', padding: 30 }}>Nenhuma consulta concluída ainda.</div>}
      </div>
    </>
  );
}