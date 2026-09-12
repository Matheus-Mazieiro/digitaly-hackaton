import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Icon } from '../../lib/icons';
import { Avatar, StatusBadge } from '../../components/Shared';
import { fmtDateFull } from '../../lib/utils';

export default function Consultas() {
  const navigate = useNavigate();
  const { appointments, patientName } = useApp();
  const [tab, setTab] = useState('proximas');

  const upcoming = appointments.filter((a) =>
    ['agendada', 'confirmada', 'em_andamento'].includes(a.status),
  );
  const past = appointments.filter((a) =>
    ['concluida', 'cancelada'].includes(a.status),
  );

  const list = tab === 'proximas' ? upcoming : past;
  const sorted = [...list].sort((a, b) =>
    tab === 'proximas'
      ? a.date.localeCompare(b.date)
      : b.date.localeCompare(a.date),
  );

  return (
    <>
      <h1 className="page-title">Consultas</h1>
      <div className="page-sub">
        Acompanhe suas consultas futuras e anteriores.
      </div>

      <div className="role-toggle" style={{ maxWidth: 280, marginBottom: 20 }}>
        <button
          className={tab === 'proximas' ? 'active' : ''}
          onClick={() => setTab('proximas')}
        >
          Próximas
        </button>
        <button
          className={tab === 'anteriores' ? 'active' : ''}
          onClick={() => setTab('anteriores')}
        >
          Anteriores
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {sorted.map((a) => (
          <div
            key={a.id}
            className="card row-between"
            style={{ flexWrap: 'wrap', gap: 12 }}
          >
            <div className="flex-center">
              <Avatar name={patientName} size={44} />
              <div>
                <div style={{ fontWeight: 500 }}>{patientName}</div>
                <div className="small muted">
                  {fmtDateFull(a.date)} · {a.time} · {a.reason || 'Consulta'}
                </div>
              </div>
            </div>
            <div className="flex-center">
              <StatusBadge status={a.status} />
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => navigate(`/doctor/consultas/${a.id}`)}
              >
                Ver detalhes
              </button>
            </div>
          </div>
        ))}

        {!sorted.length && (
          <div
            className="card muted small"
            style={{ textAlign: 'center', padding: 30 }}
          >
            Nenhuma consulta {tab === 'proximas' ? 'futura' : 'anterior'}.
          </div>
        )}
      </div>
    </>
  );
}