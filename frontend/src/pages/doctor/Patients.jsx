import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Icon } from '../../lib/icons';
import { Avatar, BackButton } from '../../components/Shared';

export default function Patients() {
  const navigate = useNavigate();
  const { patientName, patientSearch, setPatientSearch } = useApp();
  const q = (patientSearch || '').toLowerCase();
  const list = [patientName, 'Marcos Aurélio Lima'].filter((n) =>
    n.toLowerCase().includes(q),
  );

  return (
    <>
      <BackButton label="Início" onClick={() => navigate('/doctor/dashboard')} />
      <h1 className="page-title">Pacientes</h1>
      <div className="page-sub">Pacientes atendidos por você.</div>
      <input
        className="input"
        placeholder="Buscar paciente"
        style={{ maxWidth: 320, marginBottom: 20 }}
        value={patientSearch}
        onChange={(e) => setPatientSearch(e.target.value)}
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {list.map((n) => (
          <div
            key={n}
            className="card row-between clickable"
            onClick={() => navigate(`/doctor/patients/${encodeURIComponent(n)}`)}
          >
            <div className="flex-center">
              <Avatar name={n} size={42} fontSize={14} />
              <div style={{ fontWeight: 500 }}>{n}</div>
            </div>
            <Icon name="chevronRight" style={{ color: 'var(--texto-3)' }} />
          </div>
        ))}
        {!list.length && (
          <div className="card muted small" style={{ textAlign: 'center', padding: 30 }}>
            Nenhum paciente encontrado.
          </div>
        )}
      </div>
    </>
  );
}