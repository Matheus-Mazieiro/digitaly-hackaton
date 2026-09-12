import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Avatar, BackButton } from '../../components/Shared';
import { fmtDateFull } from '../../lib/utils';

function apptDateLabel(a) {
  return `${fmtDateFull(a.date)} · ${a.time}`;
}

export default function PatientProfile() {
  const navigate = useNavigate();
  const { name } = useParams();
  const { patientName, appointments } = useApp();
  const isMain = decodeURIComponent(name) === patientName;
  const list = isMain ? appointments.filter((a) => a.status === 'concluida') : [];

  return (
    <>
      <BackButton onClick={() => navigate('/doctor/patients')} />
      <div className="flex-center" style={{ marginBottom: 20 }}>
        <Avatar name={decodeURIComponent(name)} size={52} />
        <div>
          <div style={{ fontWeight: 500, fontSize: 17 }}>
            {decodeURIComponent(name)}
          </div>
          <div className="small muted">Paciente</div>
        </div>
      </div>
      <div className="section-title">Histórico de consultas</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {list.map((a) => (
          <div key={a.id} className="card small muted">
            {apptDateLabel(a)} — resumo e documentos disponíveis
          </div>
        ))}
        {!list.length && (
          <div className="card muted small">Nenhuma consulta registrada ainda.</div>
        )}
      </div>
    </>
  );
}