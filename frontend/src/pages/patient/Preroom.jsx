import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Icon } from '../../lib/icons';
import { Avatar, BackButton } from '../../components/Shared';
import { fmtDateFull } from '../../lib/utils';
import { appointmentAccessInfo, humanizeTimeUntil, fmtHM } from '../../lib/mock';
import { acquireStream, releaseStream, peekStream } from '../../lib/media';

export default function Preroom() {
  const navigate = useNavigate();
  const { nextPatientAppt, doctorById, specialtyById, patientName } = useApp();

  const videoRef = useRef(null);
  const enteredCallRef = useRef(false);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [mediaReady, setMediaReady] = useState(false);
  const [mediaError, setMediaError] = useState(null);

  const a = nextPatientAppt();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const stream = await acquireStream();
        if (cancelled) return;
        if (videoRef.current) videoRef.current.srcObject = stream;

        const at = stream.getAudioTracks()[0];
        const vt = stream.getVideoTracks()[0];
        if (at) setMicOn(at.enabled);
        if (vt) setCamOn(vt.enabled);

        setMediaReady(true);
      } catch (err) {
        if (!cancelled) setMediaError(err);
      }
    })();

    return () => {
      cancelled = true;
      if (!enteredCallRef.current) {
        releaseStream();
      }
    };
  }, []);

  if (!a) {
    return (
      <div
        className="card"
        style={{
          textAlign: 'center',
          padding: 40,
          maxWidth: 480,
          margin: '40px auto 0',
        }}
      >
        <div style={{ color: 'var(--texto-3)', marginBottom: 10 }}>
          <Icon name="calendar" size={28} />
        </div>
        <div style={{ fontWeight: 500, marginBottom: 6 }}>
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
    statusBadge = <span className="badge badge-neutral">Sala indisponível</span>;
  }

  const toggleMic = () => {
    const s = peekStream();
    const t = s?.getAudioTracks()[0];
    if (!t) return;
    t.enabled = !t.enabled;
    setMicOn(t.enabled);
  };

  const toggleCam = () => {
    const s = peekStream();
    const t = s?.getVideoTracks()[0];
    if (!t) return;
    t.enabled = !t.enabled;
    setCamOn(t.enabled);
  };

  const enterCall = () => {
    enteredCallRef.current = true;
    navigate(`/patient/call?room=${a.id}`);
  };

  return (
    <div style={{ maxWidth: 560, margin: '10px auto 0', textAlign: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
        <BackButton onClick={() => navigate('/patient/dashboard')} />
      </div>

      <h1 className="page-title" style={{ fontSize: 22 }}>
        Prepare-se para sua consulta
      </h1>
      <div className="page-sub">
        {canEnter
          ? 'Sua sala já está disponível. Revise câmera e microfone e entre quando quiser.'
          : 'Você poderá entrar assim que a sala for liberada — abre 15 minutos antes do horário.'}
      </div>

      <div className="card card-hero" style={{ padding: 0, overflow: 'hidden' }}>
        <div
          style={{
            height: 300,
            background: '#0B0D10',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="local-video"
            style={{ display: camOn && mediaReady ? 'block' : 'none' }}
          />

          {(!mediaReady || !camOn) && (
            <div
              className="video-thumb-off"
              style={{ position: 'absolute', inset: 0 }}
            >
              {mediaError ? (
                <div className="call-error" style={{ maxWidth: 380 }}>
                  <Icon name="alert" size={16} />
                  <span>
                    {mediaError.name === 'NotAllowedError'
                      ? 'Permissão de câmera/microfone negada. Habilite no navegador e recarregue.'
                      : mediaError.message}
                  </span>
                </div>
              ) : (
                <Avatar name={patientName} size={96} fontSize={32} />
              )}
            </div>
          )}

          {!mediaReady && !mediaError && (
            <div
              className="glass"
              style={{
                position: 'absolute',
                bottom: 16,
                left: '50%',
                transform: 'translateX(-50%)',
                padding: '8px 16px',
                borderRadius: 999,
                fontSize: 12.5,
                color: 'var(--texto-2)',
              }}
            >
              Solicitando acesso à câmera e microfone...
            </div>
          )}

          {!canEnter && access.reason === 'too_early' && (
            <div
              className="glass"
              style={{
                position: 'absolute',
                top: 16,
                left: '50%',
                transform: 'translateX(-50%)',
                padding: '8px 16px',
                borderRadius: 999,
                fontSize: 12.5,
              }}
            >
              <Icon
                name="clock"
                size={13}
                style={{ verticalAlign: -2, marginRight: 6 }}
              />
              Falta {humanizeTimeUntil(access.msUntil)} para a consulta
            </div>
          )}
        </div>

        <div style={{ padding: 18 }}>
          <div className="row-between" style={{ flexWrap: 'wrap', gap: 10 }}>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 500 }}>{doc.name}</div>
              <div className="small muted">
                {spec.name} · {fmtDateFull(a.date)} · {a.time} · Sala #{a.id}
              </div>
            </div>
            {statusBadge}
          </div>

          <hr className="divider" />

          <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
            <button
              className={`ctrl-btn ${micOn ? '' : 'off'}`}
              onClick={toggleMic}
              disabled={!mediaReady}
              title={micOn ? 'Mutar microfone' : 'Ativar microfone'}
            >
              <Icon name={micOn ? 'mic' : 'micOff'} />
            </button>
            <button
              className={`ctrl-btn ${camOn ? '' : 'off'}`}
              onClick={toggleCam}
              disabled={!mediaReady}
              title={camOn ? 'Desligar câmera' : 'Ligar câmera'}
            >
              <Icon name={camOn ? 'video' : 'camOff'} />
            </button>
          </div>
        </div>
      </div>

      <button
        className="btn btn-primary btn-block"
        style={{ marginTop: 20 }}
        disabled={!canEnter || !mediaReady}
        onClick={enterCall}
      >
        <Icon name="video" /> Entrar na consulta
      </button>

      {!canEnter && access.reason === 'too_early' && (
        <div className="small muted" style={{ marginTop: 10 }}>
          A sala abre automaticamente às {fmtHM(access.opensAt)}.
        </div>
      )}
    </div>
  );
}