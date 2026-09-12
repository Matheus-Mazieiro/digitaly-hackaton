import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { StatusBadge, BackButton } from '../../components/Shared';
import { fmtDateFullLong, dateKey } from '../../lib/utils';
import { TODAY } from '../../lib/mock';

const TODAY_KEY = dateKey(TODAY);

export default function Agenda() {
  const navigate = useNavigate();
  const { appointments, patientName } = useApp();

  const groups = useMemo(() => {
    const map = new Map();
    appointments
      .filter((a) => a.status !== 'cancelada')
      .forEach((a) => {
        if (!map.has(a.date)) map.set(a.date, []);
        map.get(a.date).push(a);
      });
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, list]) => ({
        date,
        items: [...list].sort((x, y) => x.time.localeCompare(y.time)),
      }));
  }, [appointments]);

  return (
    <>
      <BackButton label="Início" onClick={() => navigate('/doctor/dashboard')} />
      <h1 className="page-title">Agenda</h1>
      <div className="page-sub">
        Todas as consultas organizadas por data — de hoje em diante.
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {groups.map(({ date, items }) => {
          const isToday = date === TODAY_KEY;
          return (
            <div key={date}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
                <div className="section-title" style={{ margin: 0, textTransform: 'capitalize' }}>
                  {fmtDateFullLong(date)}
                </div>
                {isToday && <span className="badge badge-info">Hoje</span>}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {items.map((a) => (
                  <div
                    key={a.id}
                    className="card row-between clickable"
                    style={{ flexWrap: 'wrap', gap: 12 }}
                    onClick={() => navigate(`/doctor/consultas/${a.id}`)}
                  >
                    <div className="flex-center">
                      <div className="num" style={{ fontWeight: 500, width: 52, fontSize: 15 }}>
                        {a.time}
                      </div>
                      <div>
                        <div style={{ fontWeight: 500 }}>{patientName}</div>
                        <div className="small muted">{a.reason || 'Consulta'}</div>
                      </div>
                    </div>
                    <StatusBadge status={a.status} />
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {!groups.length && (
          <div className="card muted small" style={{ textAlign: 'center', padding: 30 }}>
            Nenhuma consulta agendada.
          </div>
        )}
      </div>
    </>
  );
}