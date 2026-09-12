import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Icon } from '../../lib/icons';
import { Avatar } from '../../components/Shared';
import { fmtDateFull } from '../../lib/utils';
import {
  appointmentAccessInfo,
  humanizeTimeUntil,
  fmtHM,
} from '../../lib/mock';

export default function Preroom() {
  const navigate = useNavigate();
  const { nextPatientAppt, doctorById, specialtyById, patientName } = useApp();
  const [mic, setMic] = useState(true);
  const [cam, setCam] = useState(true);

  const a = nextPatientAppt();
  if (!a) {
    return (
      <div
        className="card"
        style={{ textAlign: 'center', padding: 40, maxWidth: 480, margin: '40px auto 0' }}
      >
        <div style={{ color: 'var(--g500)', marginBottom: 10 }}>
          <Icon name="calendar" size={28} />
        </div>
        <div style={{ fontWeight: 600, marginBottom: 6 }}>
          Nenhuma consulta para entrar
        </div>
        <div className="small muted" style={{ marginBottom: 18 }}>
          Agende uma consulta para acessar a sala.
        </div>
        <button
          className="btn btn-primary"
          style={{ margin: '0 auto' }}
          onClick={() => navigate('/patient/appointments')}
        >
          Ver minhas consultas
        </button>
      </div>
    );
  }

  const doc = doctorById(a.doctorId);
  const spec = specialtyById(doc.specialty);
  const access = appointmentAccessInfo(a);
  const canEnter = access.canJoin;

  let statusBadge;
  if (access.reason === 'live') {
    statusBadge = (
      <span className="badge badge-success">
        <Icon name="check" size={12} /> Sala aberta
      </span>
    );
  } else if (access.reason === 'window') {
    statusBadge = (
      <span className="badge badge-success">
        <Icon name="check" size={12} /> Sala liberada
      </span>
    );
  } else if (access.reason === 'too_early') {
    statusBadge = (
      <span className="badge badge-warning">
        <Icon name="clock" size={12} /> Abre às {fmtHM(access.opensAt)}
      </span>
    );
  } else {
    statusBadge = (
      <span className="badge badge-neutral">Sala indisponível</span>
    );
  }

  return (
    <div style={{ maxWidth: 520, margin: '10px auto 0', textAlign: 'center' }}>
      <h1 className="page-title" style={{ fontSize: 22 }}>
        Prepare-se para sua consulta
      </h1>
      <div className="page-sub">
        {canEnter
          ? 'Sua sala já está disponível. Quando estiver pronto, entre para iniciar seu atendimento.'
          : 'Você poderá entrar assim que a sala for liberada — abre 15 minutos antes do horário.'}
      </div>

      <div className="card card-hero" style={{ padding: 0, overflow: 'hidden' }}>
        <div
          style={{
            height: 220,
            background: 'linear-gradient(160deg,#141821,#0B0D10)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          <div className="avatar big-avatar">
            {patientName
              .split(' ')
              .map((w) => w[0])
              .slice(0, 2)
              .join('')}
          </div>

          {!canEnter && access.reason === 'too_early' && (
            <div
              className="glass"
              style={{
                position: 'absolute',
                bottom: 16,
                left: 16,
                right: 16,
                padding: '10px 14px',
                borderRadius: 999,
                fontSize: 13,
              }}
            >
              <Icon
                name="clock"
                size={14}
                style={{ verticalAlign: -2, marginRight: 6 }}
              />
              Falta {humanizeTimeUntil(access.msUntil)} para a consulta
            </div>
          )}
        </div>

        <div style={{ padding: 18 }}>
          <div className="row-between" style={{ flexWrap: 'wrap', gap: 10 }}>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 600 }}>{doc.name}</div>
              <div className="small muted">
                {spec.name} · {fmtDateFull(a.date)} · {a.time}
              </div>
            </div>
            {statusBadge}
          </div>

          <hr className="divider" />

          <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
            <button
              className={`ctrl-btn ${mic ? 'active' : ''}`}
              onClick={() => setMic((v) => !v)}
            >
              <Icon name="mic" />
            </button>
            <button
              className={`ctrl-btn ${cam ? 'active' : ''}`}
              onClick={() => setCam((v) => !v)}
            >
              <Icon name="video" />
            </button>
          </div>
        </div>
      </div>

      <button
        className="btn btn-primary btn-block"
        style={{ marginTop: 20 }}
        disabled={!canEnter}
        onClick={() => navigate('/patient/call')}
      >
        <Icon name="video" /> Entrar na consulta
      </button>

      {!canEnter && access.reason === 'too_early' && (
        <div className="small muted" style={{ marginTop: 10 }}>
          A sala abre automaticamente às {fmtHM(access.opensAt)} — você não
          precisa recarregar a página.
        </div>
      )}
    </div>
  );
}