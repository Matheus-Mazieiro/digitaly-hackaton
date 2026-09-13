import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Icon } from '../../lib/icons';
import { Avatar } from '../../components/Shared';
import Modal from '../../components/Modal';
import { initials } from '../../lib/utils';
import { useCall } from '../../hooks/useCall';

export default function PatientCall() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const {
    apptById,
    nextPatientAppt,
    doctorById,
    patientName,
    patchAppointment,
    pushNotification,
  } = useApp();

  // Resolve a consulta prioritariamente pelo room da URL
  const roomParam = params.get('room');
  const a = roomParam ? apptById(Number(roomParam)) : nextPatientAppt();

  const doc = a ? doctorById(a.doctorId) : null;
  const otherName = doc?.name || 'Médico(a)';
  const selfName = patientName;

  const [confirmEnd, setConfirmEnd] = useState(false);
  const [seconds, setSeconds] = useState(0);

  const roomId = roomParam || (a ? String(a.id) : '');

  // se não há sala válida, volta pra lista
  useEffect(() => {
    if (!roomId) {
      navigate('/patient/appointments', { replace: true });
    }
  }, [roomId, navigate]);

  const {
    localVideoRef,
    remoteVideoRef,
    status,
    error,
    peerPresent,
    remoteActive,
    remoteAudioBlocked,
    unlockRemoteAudio,
    micOn,
    camOn,
    toggleMic,
    toggleCam,
    end,
  } = useCall({ roomId, role: 'patient' });

  useEffect(() => {
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const finish = () => {
    end();
    if (a) {
      patchAppointment(a.id, {
        status: 'concluida',
        hasSummary: true,
        hasReport: true,
        reviewed: false,
        summary: {
          motivo: 'Dor de cabeça recorrente relatada nas últimas semanas.',
          pontos:
            'Paciente relatou episódios quase diários, predominantemente à tarde, sem alterações visuais.',
          orientacoes:
            'Ajustar rotina de sono, manter boa hidratação e reduzir exposição a telas antes de dormir.',
          proximos: 'Reavaliação em 30 dias caso os sintomas persistam.',
        },
        documents: [
          { name: 'Receita — Analgésico', type: 'Receita', from: 'Médico' },
        ],
      });
      pushNotification(
        'Sua consulta foi concluída. O resumo já está disponível.',
        'report',
      );
      navigate(`/patient/appointments/${a.id}`);
    } else {
      navigate('/patient/appointments');
    }
  };

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');

  const statusLabel =
    {
      idle: 'Preparando a sala...',
      'requesting-media': 'Pedindo acesso à câmera e microfone...',
      connecting: peerPresent
        ? 'Conectando com o outro participante...'
        : 'Aguardando o outro participante entrar...',
      connected: 'Conectado',
      failed: 'Falha na conexão',
      ended: 'Chamada encerrada',
    }[status] || status;

  if (!roomId) return null;

  return (
    <div className="call-wrap">
      <div className="call-main">
        <div className="video-stage">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="remote-video"
            style={{ display: remoteActive ? 'block' : 'none' }}
          />

          {remoteActive && remoteAudioBlocked && (
            <button
              className="btn btn-primary btn-sm glass"
              style={{
                position: 'absolute',
                bottom: 16,
                left: '50%',
                transform: 'translateX(-50%)',
              }}
              onClick={unlockRemoteAudio}
            >
              <Icon name="mic" size={14} /> Ativar som
            </button>
          )}

          {!remoteActive && (
            <div className="video-stage-fallback">
              <div className="avatar big-avatar speaking-ring">
                {initials(otherName)}
              </div>
              <div className="call-status glass">{statusLabel}</div>
              {error && (
                <div className="call-error" style={{ maxWidth: 380 }}>
                  <Icon name="alert" size={16} />
                  <span>
                    {error.name === 'NotAllowedError'
                      ? 'Permissão de câmera/microfone negada. Habilite no navegador e recarregue.'
                      : error.message || 'Não foi possível iniciar a chamada.'}
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="call-topinfo glass">
            <Avatar name={otherName} size={22} fontSize={10} />
            <span className="small" style={{ fontWeight: 500 }}>
              {otherName}
            </span>
          </div>

          <div className="call-room-badge glass num">Sala #{roomId}</div>

          <div className="call-timer glass num">
            {mm}:{ss}
          </div>

          <div className="video-thumb">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="local-video"
              style={{ display: camOn ? 'block' : 'none' }}
            />
            {!camOn && (
              <div className="video-thumb-off">
                <Avatar name={selfName} size={44} />
              </div>
            )}
          </div>
        </div>

        <div className="call-controls glass" style={{ alignSelf: 'center' }}>
          <button
            className={`ctrl-btn ${micOn ? '' : 'off'}`}
            onClick={toggleMic}
            title={micOn ? 'Mutar microfone' : 'Ativar microfone'}
          >
            <Icon name={micOn ? 'mic' : 'micOff'} />
          </button>
          <button
            className={`ctrl-btn ${camOn ? '' : 'off'}`}
            onClick={toggleCam}
            title={camOn ? 'Desligar câmera' : 'Ligar câmera'}
          >
            <Icon name={camOn ? 'video' : 'camOff'} />
          </button>
          <button
            className="ctrl-btn end"
            onClick={() => setConfirmEnd(true)}
            title="Encerrar consulta"
          >
            <Icon name="phoneOff" />
          </button>
        </div>
      </div>

      {confirmEnd && (
        <Modal onClose={() => setConfirmEnd(false)}>
          <div style={{ fontWeight: 500, fontSize: 16, marginBottom: 8 }}>
            Encerrar consulta?
          </div>
          <div className="small muted" style={{ marginBottom: 20 }}>
            Isso finalizará o atendimento.
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setConfirmEnd(false)}
            >
              Cancelar
            </button>
            <button className="btn btn-danger btn-sm" onClick={finish}>
              Encerrar consulta
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}