import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Icon } from '../../lib/icons';
import { Avatar } from '../../components/Shared';

function apptDateLabel(a) {
  const d = new Date(a.date + 'T00:00:00');
  return `${d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} · ${a.time}`;
}

export default function PatientProfile() {
  const navigate = useNavigate();
  const { name } = useParams();
  const { patientName, appointments } = useApp();
  const isMain = decodeURIComponent(name) === patientName;
  const list = isMain ? appointments.filter((a) => a.status === 'concluida') : [];

  return (
    <>
      <button className="btn-ghost btn-sm" style={{ marginBottom: 8 }} onClick={() => navigate('/doctor/patients')}>
        <Icon name="arrowLeft" /> Voltar
      </button>
      <div className="flex-center" style={{ marginBottom: 20 }}>
        <Avatar name={decodeURIComponent(name)} size={52} />
        <div>
          <div style={{ fontWeight: 600, fontSize: 17 }}>{decodeURIComponent(name)}</div>
          <div className="small muted">Paciente</div>
        </div>
      </div>
      <div className="section-title">Histórico de consultas</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {list.map((a) => (
          <div key={a.id} className="card small muted">{apptDateLabel(a)} — resumo e documentos disponíveis</div>
        ))}
        {!list.length && <div className="card muted small">Nenhuma consulta registrada ainda.</div>}
      </div>
    </>
  );
}