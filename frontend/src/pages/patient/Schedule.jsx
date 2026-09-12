import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { Icon } from '../../lib/icons';
import { SPECIALTIES, DOCTORS, addDays } from '../../lib/mock';
import { dateKey } from '../../lib/utils';
import { Avatar, StepTrack } from '../../components/Shared';

/* ---------- SPECIALTY ---------- */
export function ScheduleSpecialty() {
  const navigate = useNavigate();
  const { setBooking } = useApp();
  const [q, setQ] = useState('');

  const pick = (id) => {
    setBooking((b) => ({ ...b, specialty: id }));
    navigate('/patient/schedule/date');
  };

  const filtered = SPECIALTIES.filter((s) => s.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <>
      <button className="btn-ghost btn-sm" style={{ marginBottom: 8 }} onClick={() => navigate('/patient/dashboard')}>
        <Icon name="arrowLeft" /> Início
      </button>
      <StepTrack step={1} total={4} />
      <h1 className="page-title" style={{ fontSize: 24 }}>Qual especialidade você precisa?</h1>
      <div className="page-sub">Escolha a área médica para ver os profissionais disponíveis.</div>
      <input className="input" placeholder="Buscar especialidade" style={{ maxWidth: 320, marginBottom: 20 }} value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="grid-3">
        {filtered.map((sp) => (
          <button
            key={sp.id}
            className="card clickable"
            onClick={() => pick(sp.id)}
            style={{ textAlign: 'left', display: 'flex', alignItems: 'center', gap: 14 }}
          >
            <div style={{
              width: 38, height: 38, borderRadius: 11, background: 'rgba(0,159,255,0.1)',
              color: 'var(--c400)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Icon name={sp.icon} />
            </div>
            <div style={{ fontWeight: 500, fontSize: 14 }}>{sp.name}</div>
          </button>
        ))}
      </div>
    </>
  );
}

/* ---------- DATE ---------- */
export function ScheduleDate() {
  const navigate = useNavigate();
  const { booking, setBooking, specialtyById } = useApp();
  const days = Array.from({ length: 10 }).map((_, i) => addDays(i));

  const pick = (key, disabled) => {
    if (disabled) return;
    setBooking((b) => ({ ...b, date: key }));
    navigate('/patient/schedule/doctor');
  };

  return (
    <>
      <button className="btn-ghost btn-sm" style={{ marginBottom: 8 }} onClick={() => navigate('/patient/schedule/specialty')}>
        <Icon name="arrowLeft" /> Voltar
      </button>
      <StepTrack step={2} total={4} />
      <h1 className="page-title" style={{ fontSize: 24 }}>Escolha uma data</h1>
      <div className="page-sub">Especialidade: <b style={{ color: 'var(--g100)' }}>{specialtyById(booking.specialty)?.name}</b></div>
      <div className="grid-3" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
        {days.map((d) => {
          const key = dateKey(d);
          const hasAvail = DOCTORS.some((doc) => doc.specialty === booking.specialty && doc.slots[key]);
          return (
            <button
              key={key}
              className="card clickable"
              disabled={!hasAvail}
              onClick={() => pick(key, !hasAvail)}
              style={{ opacity: hasAvail ? 1 : 0.35, cursor: hasAvail ? 'pointer' : 'not-allowed' }}
            >
              <div className="small muted">{d.toLocaleDateString('pt-BR', { weekday: 'short' })}</div>
              <div className="num" style={{ fontSize: 20, fontWeight: 600, margin: '4px 0' }}>{d.getDate()}</div>
              <div className="small muted">{d.toLocaleDateString('pt-BR', { month: 'short' })}</div>
              {hasAvail && <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--c500)', margin: '6px auto 0' }} />}
            </button>
          );
        })}
      </div>
      <div className="small muted" style={{ marginTop: 14 }}>
        <Icon name="info" size={13} style={{ verticalAlign: -2, marginRight: 4 }} />
        Dias com o indicador celeste têm horários disponíveis.
      </div>
    </>
  );
}

/* ---------- DOCTOR ---------- */
export function ScheduleDoctor() {
  const navigate = useNavigate();
  const { booking, setBooking, specialtyById } = useApp();

  let docs = DOCTORS.filter((d) => d.specialty === booking.specialty && d.slots[booking.date]);
  if (booking.sort === 'rating') docs = [...docs].sort((a, z) => z.rating - a.rating);
  if (booking.sort === 'slots') docs = [...docs].sort((a, z) => z.slots[booking.date].length - a.slots[booking.date].length);
  if (booking.sort === 'name') docs = [...docs].sort((a, z) => a.name.localeCompare(z.name));

  const pickSlot = (docId, time) => {
    setBooking((b) => ({ ...b, doctorId: docId, time }));
    navigate('/patient/schedule/confirm');
  };

  return (
    <>
      <button className="btn-ghost btn-sm" style={{ marginBottom: 8 }} onClick={() => navigate('/patient/schedule/date')}>
        <Icon name="arrowLeft" /> Voltar
      </button>
      <StepTrack step={3} total={4} />
      <div className="row-between" style={{ flexWrap: 'wrap', gap: 10, marginBottom: 6 }}>
        <h1 className="page-title" style={{ fontSize: 24, marginBottom: 0 }}>Médicos disponíveis</h1>
        <select
          className="input"
          style={{ width: 'auto', padding: '9px 18px' }}
          value={booking.sort}
          onChange={(e) => setBooking((b) => ({ ...b, sort: e.target.value }))}
        >
          <option value="rating">Melhor avaliação</option>
          <option value="slots">Mais horários disponíveis</option>
          <option value="name">Nome</option>
        </select>
      </div>
      <div className="page-sub">
        {new Date(booking.date + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {docs.map((doc) => (
          <div key={doc.id} className="card">
            <div className="flex-center" style={{ alignItems: 'flex-start' }}>
              <Avatar name={doc.name} size={52} />
              <div>
                <div style={{ fontWeight: 600 }}>{doc.name}</div>
                <div className="small muted">{specialtyById(doc.specialty).name}</div>
                <div className="flex-center" style={{ marginTop: 6, gap: 6 }}>
                  <span style={{ color: 'var(--c400)', display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Icon name="star" size={13} style={{ fill: 'currentColor' }} />
                    <b className="num" style={{ fontSize: 13 }}>{doc.rating.toFixed(1)}</b>
                  </span>
                  <span className="small muted">· {doc.reviews} avaliações</span>
                </div>
                <div style={{ marginTop: 6 }}>
                  <span className="badge badge-success"><Icon name="check" size={12} /> CRM verificado</span>
                </div>
              </div>
            </div>
            <div className="small muted" style={{ margin: '12px 0' }}>{doc.bio}</div>
            <div className="small" style={{ color: 'var(--g300)', marginBottom: 8 }}>Horários disponíveis</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {doc.slots[booking.date].map((t) => (
                <button key={t} className="btn btn-secondary btn-sm" onClick={() => pickSlot(doc.id, t)}>
                  {t}
                </button>
              ))}
            </div>
          </div>
        ))}
        {!docs.length && (
          <div className="card muted small" style={{ textAlign: 'center', padding: 30 }}>
            Nenhum médico disponível nesta data para a especialidade escolhida.
          </div>
        )}
      </div>
    </>
  );
}

/* ---------- CONFIRM ---------- */
export function ScheduleConfirm() {
  const navigate = useNavigate();
  const { booking, setBooking, doctorById, specialtyById } = useApp();
  const [motivo, setMotivo] = useState('');
  const doc = doctorById(booking.doctorId);

  const onConfirm = () => {
    setBooking((b) => ({ ...b, reason: motivo.trim() || 'Consulta agendada pelo paciente' }));
    navigate('/patient/schedule/code');
  };

  return (
    <>
      <button className="btn-ghost btn-sm" style={{ marginBottom: 8 }} onClick={() => navigate('/patient/schedule/doctor')}>
        <Icon name="arrowLeft" /> Voltar
      </button>
      <StepTrack step={4} total={4} />
      <h1 className="page-title" style={{ fontSize: 24 }}>Confirmar consulta</h1>
      <div className="page-sub">Revise os detalhes antes de confirmar.</div>
      <div className="card card-hero">
        <div className="flex-center">
          <Avatar name={doc.name} size={52} />
          <div>
            <div style={{ fontWeight: 600 }}>{doc.name}</div>
            <div className="small muted">{specialtyById(doc.specialty).name}</div>
          </div>
        </div>
        <hr className="divider" />
        <div className="grid-2">
          <div>
            <div className="small muted">Data</div>
            <div className="num" style={{ fontWeight: 500 }}>
              {new Date(booking.date + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}
            </div>
          </div>
          <div><div className="small muted">Horário</div><div className="num" style={{ fontWeight: 500 }}>{booking.time}</div></div>
          <div><div className="small muted">Valor</div><div className="num" style={{ fontWeight: 500 }}>R$ 180,00</div></div>
          <div><div className="small muted">Forma de pagamento</div><div style={{ fontWeight: 500 }}>Carteira Digitaly Hub</div></div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="section-title">Informações para o médico (Pré-consulta)</div>
        <textarea
          className="input"
          placeholder="Descreva brevemente os sintomas ou o motivo da consulta para ajudar no diagnóstico..."
          style={{ minHeight: 80 }}
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
        />
      </div>

      <button className="btn btn-primary btn-block" style={{ marginTop: 20 }} onClick={onConfirm}>
        Confirmar consulta
      </button>
    </>
  );
}

/* ---------- CODE ---------- */
export function ScheduleCode() {
  const navigate = useNavigate();
  const { booking, addAppointment, resetBooking, pushNotification, doctorById } = useApp();
  const { toast } = useToast();

  const onFinish = () => {
    const newAppt = {
      id: Date.now(),
      doctorId: booking.doctorId,
      date: booking.date,
      time: booking.time,
      status: 'confirmada',
      reason: booking.reason || 'Consulta agendada pelo paciente',
    };
    addAppointment(newAppt);

    const d = new Date(newAppt.date + 'T00:00:00');
    pushNotification(
      `Consulta com ${doctorById(newAppt.doctorId).name} confirmada para ${d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} · ${newAppt.time}.`,
      'confirm',
    );
    resetBooking();
    navigate('/patient/dashboard');
    toast('Consulta confirmada e adicionada à sua agenda.', 'check', 'var(--success)');
  };

  return (
    <div style={{ maxWidth: 400, margin: '20px auto 0', textAlign: 'center' }}>
      <div style={{
        width: 52, height: 52, borderRadius: 16, background: 'rgba(0,159,255,0.12)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 18px', color: 'var(--c400)',
      }}>
        <Icon name="shield" size={24} />
      </div>
      <div style={{ fontSize: 18, fontWeight: 600 }}>Confirme sua consulta</div>
      <div className="small muted" style={{ marginTop: 6 }}>Enviamos um código de confirmação para o seu e-mail.</div>
      <div className="code-inputs">
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <input key={n} maxLength={1} className="code-box" defaultValue={n} />
        ))}
      </div>
      <button className="btn btn-primary btn-block" onClick={onFinish}>Confirmar código</button>
    </div>
  );
}