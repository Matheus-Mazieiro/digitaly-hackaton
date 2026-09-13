import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Icon } from '../../lib/icons';
import { Avatar, StatusBadge } from '../../components/Shared';
import { fmtDateFull } from '../../lib/utils';

function canJoin(a) {
  if (!a) return false;
  if (a.status === 'em_andamento') return true;
  if (['concluida', 'cancelada'].includes(a.status)) return false;
  const dt = new Date(`${a.date}T${a.time}:00`);
  const ms = dt.getTime() - Date.now();
  return ms <= 15 * 60 * 1000 && ms > -60 * 60 * 1000;
}

export default function Appointments() {
  const navigate = useNavigate();
  const { appointments, doctorById, specialtyById, apptTab, setApptTab, loadAppointments } = useApp();

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  const upcoming = appointments.filter((a) => ['agendada', 'confirmada', 'em_andamento'].includes(a.status));
  const past = appointments.filter((a) => ['concluida', 'cancelada'].includes(a.status));
  const list = apptTab === 'proximas' ? upcoming : past;

  return (
    <>
      <h1 className="page-title">Minhas consultas</h1>
      <div className="page-sub">Acompanhe suas consultas futuras e anteriores.</div>

      <div className="role-toggle" style={{ maxWidth: 280, marginBottom: 20 }}>
        <button className={apptTab === 'proximas' ? 'active' : ''} onClick={() => setApptTab('proximas')}>Próximas</button>
        <button className={apptTab === 'anteriores' ? 'active' : ''} onClick={() => setApptTab('anteriores')}>Anteriores</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {list.map((a) => {
          const doc = doctorById(a.doctorId);
          return (
            <div key={a.id} className="card row-between" style={{ flexWrap: 'wrap', gap: 14 }}>
              <div className="flex-center">
                <Avatar name={doc?.name || ''} size={44} />
                <div>
                  <div style={{ fontWeight: 500 }}>{doc?.name || 'Médico'}</div>
                  <div className="small muted">
                    {specialtyById(doc?.specialty)?.name || ''} · {fmtDateFull(a.date)} · {a.time}
                  </div>
                </div>
              </div>
              <div className="flex-center">
                <StatusBadge status={a.status} />
                {canJoin(a) && (
                  <button className="btn btn-primary btn-sm" onClick={() => navigate('/patient/preroom')}>
                    <Icon name="video" /> Entrar
                  </button>
                )}
                <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/patient/appointments/${a.id}`)}>
                  Detalhes
                </button>
              </div>
            </div>
          );
        })}

        {!list.length && (
          <div className="card muted small" style={{ textAlign: 'center', padding: 30 }}>
            Nenhuma consulta aqui ainda.
          </div>
        )}
      </div>
    </>
  );
}
