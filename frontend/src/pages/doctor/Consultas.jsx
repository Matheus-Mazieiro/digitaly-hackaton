import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../../components/Shared';
import { fmtDateFull } from '../../lib/utils';

export default function Consultas() {
  const navigate = useNavigate();
  const { appointments, loadAppointments } = useApp();
  const [tab, setTab] = useState('proximas');

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  const upcoming = appointments.filter((a) => ['agendada', 'confirmada', 'em_andamento'].includes(a.status));
  const past = appointments.filter((a) => ['concluida', 'cancelada'].includes(a.status));
  const list = tab === 'proximas' ? upcoming : past;

  return (
    <>
      <h1 className="page-title">Consultas</h1>
      <div className="page-sub">Acompanhe suas consultas futuras e anteriores.</div>

      <div className="role-toggle" style={{ maxWidth: 280, marginBottom: 20 }}>
        <button className={tab === 'proximas' ? 'active' : ''} onClick={() => setTab('proximas')}>Próximas</button>
        <button className={tab === 'anteriores' ? 'active' : ''} onClick={() => setTab('anteriores')}>Anteriores</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {list.map((a) => (
          <div
            key={a.id}
            className="card row-between"
            style={{ flexWrap: 'wrap', gap: 12, cursor: 'pointer' }}
            onClick={() => navigate(`/doctor/consultas/${a.id}`)}
          >
            <div>
              <div style={{ fontWeight: 500 }}>{a.reason || 'Consulta'}</div>
              <div className="small muted">{fmtDateFull(a.date)} · {a.time}</div>
            </div>
            <StatusBadge status={a.status} />
          </div>
        ))}
        {!list.length && (
          <div className="card muted small" style={{ textAlign: 'center', padding: 30 }}>
            Nenhuma consulta aqui ainda.
          </div>
        )}
      </div>
    </>
  );
}
