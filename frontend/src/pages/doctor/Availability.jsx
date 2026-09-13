import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { BackButton } from '../../components/Shared';

const WEEKDAYS = [
  { key: 1, label: 'Segunda-feira' },
  { key: 2, label: 'Terça-feira' },
  { key: 3, label: 'Quarta-feira' },
  { key: 4, label: 'Quinta-feira' },
  { key: 5, label: 'Sexta-feira' },
  { key: 6, label: 'Sábado' },
  { key: 0, label: 'Domingo' },
];

// Grade padrão = template do backend (todos os dias, 08:00–16:30, a cada 30 min).
function templateSlots() {
  const out = [];
  for (let t = 8 * 60; t <= 16 * 60 + 30; t += 30) {
    const h = String(Math.floor(t / 60)).padStart(2, '0');
    const m = String(t % 60).padStart(2, '0');
    out.push(`${h}:${m}`);
  }
  return out;
}

// Data (YYYY-MM-DD) do dia da semana nesta semana (usando a data real de hoje).
function dateKeyOfWeekday(weekday) {
  const now = new Date();
  const diff = (weekday - now.getDay() + 7) % 7;
  const d = new Date(now);
  d.setDate(d.getDate() + diff);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export default function Availability() {
  const navigate = useNavigate();
  const { appointments } = useApp();

  // data -> { "HH:MM": status }
  const bookedByDate = useMemo(() => {
    const map = {};
    appointments
      .filter((a) => ['agendada', 'confirmada', 'em_andamento'].includes(a.status))
      .forEach((a) => {
        if (!map[a.date]) map[a.date] = {};
        map[a.date][a.time] = a.status;
      });
    return map;
  }, [appointments]);

  return (
    <>
      <BackButton label="Início" onClick={() => navigate('/doctor/dashboard')} />
      <h1 className="page-title">Disponibilidade</h1>
      <div className="page-sub">
        Visão semanal dos seus horários. Horários com consulta aparecem como{' '}
        <b>ocupados</b>.
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {WEEKDAYS.map(({ key, label }) => {
          const slots = templateSlots();
          const dateKey = dateKeyOfWeekday(key);
          const booked = bookedByDate[dateKey] || {};

          return (
            <div key={key} className="card" style={{ padding: 16 }}>
              <div className="row-between" style={{ flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
                <div>
                  <div style={{ fontWeight: 500 }}>{label}</div>
                  <div className="small muted">{dateKey}</div>
                </div>
                <div className="small muted">
                  {slots.length ? `${slots.length} horários na grade` : 'Sem atendimento'}
                </div>
              </div>

              {slots.length === 0 ? (
                <div className="small muted">Sem atendimento neste dia.</div>
              ) : (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {slots.map((t) => {
                    const status = booked[t];
                    return status ? (
                      <span key={t} className="badge badge-warning" title={`Ocupado (${status})`}>
                        {t} · ocupado
                      </span>
                    ) : (
                      <span key={t} className="badge badge-success">{t}</span>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="small muted" style={{ marginTop: 20 }}>
        Os horários livres seguem a grade padrão (todos os dias, 08:00–16:30) menos as
        consultas já marcadas.
      </div>
    </>
  );
}
