import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Icon } from '../../lib/icons';
import { BackButton } from '../../components/Shared';
import { TODAY } from '../../lib/mock';

const WEEKDAYS = [
  { key: 1, label: 'Segunda-feira' },
  { key: 2, label: 'Terça-feira' },
  { key: 3, label: 'Quarta-feira' },
  { key: 4, label: 'Quinta-feira' },
  { key: 5, label: 'Sexta-feira' },
  { key: 6, label: 'Sábado' },
  { key: 0, label: 'Domingo' },
];

const QUICK_SLOTS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
];

function nextDateForWeekday(targetDay) {
  const t = new Date(TODAY);
  const diff = (targetDay - t.getDay() + 7) % 7;
  const d = new Date(t);
  d.setDate(d.getDate() + diff);
  return d;
}

function fmtAvailDate(d) {
  const day = d.getDate();
  const month = d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
  const wd = d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
  return `${day} ${month} - ${wd}`;
}

export default function Availability() {
  const navigate = useNavigate();
  const { availability, setAvailability } = useApp();
  const [openPicker, setOpenPicker] = useState(null);

  const addSlot = (day, time) => {
    if (!time) return;
    if ((availability[day] || []).includes(time)) return;
    setAvailability((prev) => ({
      ...prev,
      [day]: [...(prev[day] || []), time].sort(),
    }));
  };

  const removeSlot = (day, time) => {
    setAvailability((prev) => ({
      ...prev,
      [day]: (prev[day] || []).filter((t) => t !== time),
    }));
  };

  const clearDay = (day) => {
    setAvailability((prev) => ({ ...prev, [day]: [] }));
  };

  const totalSlots = Object.values(availability).reduce((s, arr) => s + arr.length, 0);

  return (
    <>
      <BackButton label="Início" onClick={() => navigate('/doctor/dashboard')} />

      <h1 className="page-title">Disponibilidade</h1>
      <div className="page-sub">
        Configure os dias e horários em que você aceita teleconsultas. Esses slots
        aparecem para o paciente na hora de agendar.
      </div>

      <div
        className="card"
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 20,
          background: 'linear-gradient(135deg, rgba(0,159,255,0.08), rgba(38,42,49,0.6))',
          borderColor: 'var(--borda)',
        }}
      >
        <div className="flex-center">
          <div
            style={{
              width: 40, height: 40, borderRadius: 12,
              background: 'rgba(0,159,255,0.15)', color: 'var(--celeste-400)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Icon name="calendar" />
          </div>
          <div>
            <div className="small muted">Slots ativos na semana</div>
            <div className="num" style={{ fontSize: 22, fontWeight: 500 }}>{totalSlots}</div>
          </div>
        </div>
        <div className="small muted" style={{ textAlign: 'right', maxWidth: 260 }}>
          O paciente só vê horários que estiverem aqui.
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {WEEKDAYS.map(({ key, label }) => {
          const slots = availability[key] || [];
          const isOpen = openPicker === key;
          const nextDate = nextDateForWeekday(key);
          return (
            <div key={key} className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div className="row-between" style={{ padding: '16px 20px', flexWrap: 'wrap', gap: 10 }}>
                <div className="flex-center">
                  <div
                    className="num"
                    style={{
                      width: 56, height: 56, borderRadius: 12,
                      background: slots.length ? 'rgba(0,159,255,0.12)' : 'var(--grafite-700)',
                      color: slots.length ? 'var(--celeste-400)' : 'var(--texto-3)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 500, fontSize: 18,
                    }}
                  >
                    {nextDate.getDate()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 500 }}>{label}</div>
                    <div className="small muted">
                      {fmtAvailDate(nextDate)} ·{' '}
                      {slots.length === 0
                        ? 'Sem horários'
                        : `${slots.length} horário${slots.length > 1 ? 's' : ''} disponíve${slots.length > 1 ? 'is' : 'l'}`}
                    </div>
                  </div>
                </div>

                <div className="flex-center" style={{ gap: 8 }}>
                  {slots.length > 0 && (
                    <button className="btn-ghost btn-sm" onClick={() => clearDay(key)}>
                      Limpar
                    </button>
                  )}
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setOpenPicker(isOpen ? null : key)}
                  >
                    <Icon name={isOpen ? 'x' : 'plus'} size={14} />
                    {isOpen ? 'Fechar' : 'Adicionar horário'}
                  </button>
                </div>
              </div>

              {slots.length > 0 && (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', padding: '0 20px 16px 20px' }}>
                  {slots.map((t) => (
                    <span
                      key={t}
                      className="badge badge-info"
                      style={{ padding: '6px 10px 6px 12px', fontSize: 12.5, gap: 8 }}
                    >
                      <span className="num">{t}</span>
                      <button
                        onClick={() => removeSlot(key, t)}
                        title="Remover horário"
                        style={{
                          background: 'none', border: 'none', color: 'inherit',
                          cursor: 'pointer', display: 'flex', alignItems: 'center', opacity: 0.75,
                        }}
                      >
                        <Icon name="x" size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {isOpen && (
                <div
                  className="fade-in"
                  style={{
                    padding: '16px 20px 20px 20px',
                    borderTop: '1px solid var(--borda)',
                    background: 'rgba(0,0,0,0.15)',
                  }}
                >
                  <div className="small muted" style={{ marginBottom: 10 }}>Clique para adicionar:</div>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(72px, 1fr))',
                      gap: 8,
                    }}
                  >
                    {QUICK_SLOTS.map((t) => {
                      const already = slots.includes(t);
                      return (
                        <button
                          key={t}
                          disabled={already}
                          onClick={() => addSlot(key, t)}
                          className={`btn btn-sm ${already ? 'btn-secondary' : 'btn-primary'}`}
                          style={{ padding: '8px 0', opacity: already ? 0.35 : 1, fontSize: 13 }}
                        >
                          {t}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="small muted" style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 6 }}>
        <Icon name="info" size={13} />
        As alterações valem imediatamente para novos agendamentos.
      </div>
    </>
  );
}