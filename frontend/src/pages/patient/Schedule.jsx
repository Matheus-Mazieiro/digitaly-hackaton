import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { Icon } from '../../lib/icons';
import { addDays } from '../../lib/mock';
import { dateKey } from '../../lib/utils';
import { Avatar, StepTrack, BackButton } from '../../components/Shared';
import { api } from '../../lib/api';

/* ---------- SPECIALTY ---------- */
export function ScheduleSpecialty() {
  const navigate = useNavigate();
  const { setBooking } = useApp();
  const [specialties, setSpecialties] = useState([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.listSpecialties().then(setSpecialties).catch(console.warn).finally(() => setLoading(false));
  }, []);

  const pick = (id) => {
    setBooking((b) => ({ ...b, specialty: id }));
    navigate('/patient/schedule/date');
  };

  const filtered = specialties.filter((s) => s.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <>
      <BackButton label="Início" onClick={() => navigate('/patient/dashboard')} />
      <StepTrack step={1} total={4} />
      <h1 className="page-title" style={{ fontSize: 24 }}>Qual especialidade você precisa?</h1>
      <div className="page-sub">Escolha a área médica para ver os profissionais disponíveis.</div>
      <input className="input" placeholder="Buscar especialidade" style={{ maxWidth: 320, marginBottom: 20 }}
        value={q} onChange={(e) => setQ(e.target.value)} />
      {loading ? (
        <div className="card muted small" style={{ textAlign: 'center', padding: 30 }}>Carregando especialidades...</div>
      ) : (
        <div className="grid-3">
          {filtered.map((sp) => (
            <button key={sp.id} className="card clickable" onClick={() => pick(sp.id)}
              style={{ textAlign: 'left', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 38, height: 38, borderRadius: 11, background: 'rgba(0,159,255,0.1)', color: 'var(--celeste-400)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name={sp.icon} />
              </div>
              <div style={{ fontWeight: 500, fontSize: 14 }}>{sp.name}</div>
            </button>
          ))}
        </div>
      )}
    </>
  );
}

/* ---------- DATE ---------- */
export function ScheduleDate() {
  const navigate = useNavigate();
  const { booking, setBooking, specialtyById } = useApp();
  const days = Array.from({ length: 10 }).map((_, i) => addDays(i));

  const pick = (key) => {
    setBooking((b) => ({ ...b, date: key }));
    navigate('/patient/schedule/doctor');
  };

  return (
    <>
      <BackButton onClick={() => navigate('/patient/schedule/specialty')} />
      <StepTrack step={2} total={4} />
      <h1 className="page-title" style={{ fontSize: 24 }}>Escolha uma data</h1>
      <div className="page-sub">
        Especialidade: <b style={{ color: 'var(--texto)' }}>{specialtyById(booking.specialty)?.name}</b>
      </div>
      <div className="grid-3" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
        {days.map((d) => {
          const key = dateKey(d);
          return (
            <button key={key} className="card clickable" onClick={() => pick(key)}>
              <div className="small muted">{d.toLocaleDateString('pt-BR', { weekday: 'short' })}</div>
              <div className="num" style={{ fontSize: 20, fontWeight: 500, margin: '4px 0' }}>{d.getDate()}</div>
              <div className="small muted">{d.toLocaleDateString('pt-BR', { month: 'short' })}</div>
            </button>
          );
        })}
      </div>
      <div className="small muted" style={{ marginTop: 14 }}>
        <Icon name="info" size={13} style={{ verticalAlign: -2, marginRight: 4 }} />
        Selecione uma data para ver os médicos e horários disponíveis.
      </div>
    </>
  );
}

/* ---------- DOCTOR ---------- */
export function ScheduleDoctor() {
  const navigate = useNavigate();
  const { booking, setBooking, specialtyById } = useApp();
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.listDoctors(booking.specialty, booking.date)
      .then(setDocs)
      .catch(console.warn)
      .finally(() => setLoading(false));
  }, [booking.specialty, booking.date]);

  let sorted = [...docs];
  if (booking.sort === 'rating') sorted = sorted.sort((a, z) => z.rating - a.rating);
  if (booking.sort === 'slots') sorted = sorted.sort((a, z) => (z.slots?.length || 0) - (a.slots?.length || 0));
  if (booking.sort === 'name') sorted = sorted.sort((a, z) => a.name.localeCompare(z.name));

  const pickSlot = (doc, time) => {
    setBooking((b) => ({ ...b, doctorId: doc.id, time, doctor: doc }));
    navigate('/patient/schedule/confirm');
  };

  return (
    <>
      <BackButton onClick={() => navigate('/patient/schedule/date')} />
      <StepTrack step={3} total={4} />
      <div className="row-between" style={{ flexWrap: 'wrap', gap: 10, marginBottom: 6 }}>
        <h1 className="page-title" style={{ fontSize: 24, marginBottom: 0 }}>Médicos disponíveis</h1>
        <select className="input" style={{ width: 'auto', padding: '9px 18px' }} value={booking.sort}
          onChange={(e) => setBooking((b) => ({ ...b, sort: e.target.value }))}>
          <option value="rating">Melhor avaliação</option>
          <option value="slots">Mais horários disponíveis</option>
          <option value="name">Nome</option>
        </select>
      </div>
      <div className="page-sub">
        {new Date(booking.date + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
      </div>

      {loading ? (
        <div className="card muted small" style={{ textAlign: 'center', padding: 30 }}>Carregando médicos...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {sorted.map((doc) => (
            <div key={doc.id} className="card">
              <div className="flex-center" style={{ alignItems: 'flex-start' }}>
                <Avatar name={doc.name} size={52} />
                <div>
                  <div style={{ fontWeight: 500 }}>{doc.name}</div>
                  <div className="small muted">{specialtyById(doc.specialty)?.name}</div>
                  <div className="flex-center" style={{ marginTop: 6, gap: 6 }}>
                    <span style={{ color: 'var(--celeste-400)', display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Icon name="star" size={13} style={{ fill: 'currentColor' }} />
                      <b className="num" style={{ fontSize: 13 }}>{(doc.rating ?? 0).toFixed(1)}</b>
                    </span>
                    <span className="small muted">· {doc.reviews ?? 0} avaliações</span>
                  </div>
                  <div style={{ marginTop: 6 }}>
                    <span className="badge badge-success"><Icon name="check" size={12} /> CRM verificado</span>
                  </div>
                </div>
              </div>
              <div className="small muted" style={{ margin: '12px 0' }}>{doc.bio}</div>
              <div className="small" style={{ color: 'var(--texto-2)', marginBottom: 8 }}>Horários disponíveis</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {(doc.slots || []).map((t) => (
                  <button key={t} className="btn btn-secondary btn-sm" onClick={() => pickSlot(doc, t)}>{t}</button>
                ))}
                {!(doc.slots || []).length && <span className="small muted">Sem horários nesta data.</span>}
              </div>
            </div>
          ))}
          {!sorted.length && (
            <div className="card muted small" style={{ textAlign: 'center', padding: 30 }}>
              Nenhum médico disponível nesta data para a especialidade escolhida.
            </div>
          )}
        </div>
      )}
    </>
  );
}

/* ---------- CONFIRM ---------- */
export function ScheduleConfirm() {
  const navigate = useNavigate();
  const { booking, setBooking, specialtyById } = useApp();
  const { toast } = useToast();
  const [motivo, setMotivo] = useState('');
  const [loading, setLoading] = useState(false);

  const doc = booking.doctor;

  const onConfirm = async () => {
    setLoading(true);
    try {
      const { id } = await api.createAppointment({
        doctorId: booking.doctorId,
        date: booking.date,
        time: booking.time,
        motivo: motivo.trim() || 'Consulta agendada pelo paciente',
      });
      setBooking((b) => ({ ...b, apptId: id, reason: motivo.trim() || 'Consulta agendada pelo paciente' }));
      navigate('/patient/schedule/code');
    } catch (err) {
      toast(err.message || 'Não foi possível agendar.', 'alert', 'var(--danger)');
    } finally {
      setLoading(false);
    }
  };

  if (!doc) {
    return <div className="card" style={{ marginTop: 20 }}>Nenhum médico selecionado.</div>;
  }

  return (
    <>
      <BackButton onClick={() => navigate('/patient/schedule/doctor')} />
      <StepTrack step={4} total={4} />
      <h1 className="page-title" style={{ fontSize: 24 }}>Confirmar consulta</h1>
      <div className="page-sub">Revise os detalhes antes de confirmar.</div>
      <div className="card card-hero">
        <div className="flex-center">
          <Avatar name={doc.name} size={52} />
          <div>
            <div style={{ fontWeight: 500 }}>{doc.name}</div>
            <div className="small muted">{specialtyById(doc.specialty)?.name}</div>
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
          <div>
            <div className="small muted">Horário</div>
            <div className="num" style={{ fontWeight: 500 }}>{booking.time}</div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="section-title">Informações para o médico (Pré-consulta)</div>
        <textarea className="input" placeholder="Descreva brevemente os sintomas ou o motivo da consulta para ajudar no diagnóstico..."
          style={{ minHeight: 80 }} value={motivo} onChange={(e) => setMotivo(e.target.value)} />
      </div>

      <button className="btn btn-primary btn-block" style={{ marginTop: 20 }} onClick={onConfirm} disabled={loading}>
        {loading ? 'Agendando...' : 'Confirmar consulta'}
      </button>
    </>
  );
}

/* ---------- CODE ---------- */
export function ScheduleCode() {
  const navigate = useNavigate();
  const { booking, resetBooking, refresh } = useApp();
  const { toast } = useToast();
  const [values, setValues] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);

  const onInput = (i, v) => {
    const next = [...values];
    next[i] = v.slice(0, 1);
    setValues(next);
    if (v && i < 5) document.querySelectorAll('.codeDigit')[i + 1]?.focus();
  };

  const onFinish = async () => {
    const code = values.join('');
    if (code.length < 6) return toast('Digite os 6 dígitos.', 'alert', 'var(--warning)');
    if (!booking.apptId) return toast('Consulta não encontrada.', 'alert', 'var(--danger)');

    setLoading(true);
    try {
      await api.confirmAppointment(booking.apptId, code);
      resetBooking();
      await refresh();
      navigate('/patient/dashboard');
      toast('Consulta confirmada e adicionada à sua agenda.', 'check', 'var(--success)');
    } catch (err) {
      toast(err.message || 'Código inválido.', 'alert', 'var(--danger)');
      setValues(['', '', '', '', '', '']);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '20px auto 0', textAlign: 'center' }}>
      <div style={{ width: 52, height: 52, borderRadius: 16, background: 'rgba(0,159,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px', color: 'var(--celeste-400)' }}>
        <Icon name="shield" size={24} />
      </div>
      <div style={{ fontSize: 18, fontWeight: 500 }}>Confirme sua consulta</div>
      <div className="small muted" style={{ marginTop: 6 }}>Enviamos um código de confirmação para o seu e-mail.</div>
      <div className="code-inputs" style={{ marginTop: 16 }}>
        {values.map((v, i) => (
          <input key={i} maxLength={1} className="code-box codeDigit" value={v} onChange={(e) => onInput(i, e.target.value)} disabled={loading} placeholder="0" />
        ))}
      </div>
      <button className="btn btn-primary btn-block" style={{ marginTop: 18 }} onClick={onFinish} disabled={loading}>
        {loading ? 'Confirmando...' : 'Confirmar código'}
      </button>
    </div>
  );
}
