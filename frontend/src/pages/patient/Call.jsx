import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Icon } from '../../lib/icons';
import { Avatar } from '../../components/Shared';
import Modal from '../../components/Modal';
import { initials } from '../../lib/utils';
import { useCall } from '../../hooks/useCall';
import { useRecorder } from '../../hooks/useRecorder';
import { aiApi } from '../../lib/aiApi';

export default function PatientCall() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const {
    apptById, nextPatientAppt, doctorById, patientName,
    patchAppointment, pushNotification,
  } = useApp();

  const roomParam = params.get('room');
  const a = roomParam ? apptById(Number(roomParam)) : nextPatientAppt();

  const doc = a ? doctorById(a.doctorId) : null;
  const otherName = doc?.name || 'Médico(a)';
  const selfName = patientName;

  const [confirmEnd, setConfirmEnd] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [summarizing, setSummarizing] = useState(false);
  const [summaryError, setSummaryError] = useState(null);

  const roomId = roomParam || (a ? String(a.id) : '');
  const apptId = a?.id;

  useEffect(() => {
    if (!roomId) navigate('/patient/appointments', { replace: true });
  }, [roomId, navigate]);

  const {
    localVideoRef, remoteVideoRef,
    status, error, peerPresent, remoteActive,
    remoteAudioBlocked, unlockRemoteAudio,
    micOn, camOn, toggleMic, toggleCam, end,
    localStream, remoteStream,
  } = useCall({ roomId, role: 'patient' });

  // grava do lado do paciente (para ter redundância de áudio)
  const { recording, uploading, uploadedFile, stop: stopRecorder } = useRecorder({
    localStream,
    remoteStream,
    apptId,
    role: 'patient',
    enabled: !!localStream && !!remoteStream && remoteActive,
  });

  useEffect(() => {
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const finish = async () => {
    stopRecorder();
    setSummarizing(true);
    setSummaryError(null);

    try {
      // chama o backend para gerar o resumo (o backend já terá a transcrição do médico via WS no futuro;
      // por agora, salvamos um resumo padrão)
      const summary = await aiApi.summary([], {
        patientName: selfName,
        reason: a?.reason || 'Consulta',
      });

      if (apptId) {
        patchAppointment(apptId, {
          status: 'concluida',
          hasSummary: true,
          hasReport: true,
          reviewed: false,
          summary,
          documents: [
            { name: 'Receita — Analgésico', type: 'Receita', from: 'Médico' },
          ],
          recording: uploadedFile || null,
        });
        pushNotification('Sua consulta foi concluída. O resumo já está disponível.', 'report');
      }
      end();
      navigate(`/patient/appointments/${apptId}`);
    } catch (err) {
      setSummaryError(err);
    } finally {
      setSummarizing(false);
    }
  };

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');

  const statusLabel = {
    idle: 'Preparando a sala...',
    'requesting-media': 'Pedindo acesso à câmera e microfone...',
    connecting: peerPresent ? 'Conectando com o outro participante...' : 'Aguardando o outro participante entrar...',
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
              style={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)' }}
              onClick={unlockRemoteAudio}
            >
              <Icon name="mic" size={14} /> Ativar som
            </button>
          )}

          {!remoteActive && (
            <div className="video-stage-fallback">
              <div className="avatar big-avatar speaking-ring">{initials(otherName)}</div>
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
            <span className="small" style={{ fontWeight: 500 }}>{otherName}</span>
          </div>

          <div className="call-room-badge glass num">Sala #{roomId}</div>

          <div className="call-timer glass num">{mm}:{ss}</div>

          <div style={{ position: 'absolute', top: 60, left: 16, display: 'flex', gap: 8 }}>
            {recording && (
              <span className="badge badge-error">
                <span style={{
                  width: 6, height: 6, borderRadius: '50%', background: 'var(--error)',
                  display: 'inline-block', animation: 'pulse 1.2s infinite',
                }} /> Gravando
              </span>
            )}
            {uploadedFile && <span className="badge badge-success"><Icon name="check" size={11} /> Áudio salvo</span>}
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
              <div className="video-thumb-off"><Avatar name={selfName} size={44} /></div>
            )}
          </div>
        </div>

        <div className="call-controls glass" style={{ alignSelf: 'center' }}>
          <button className={`ctrl-btn ${micOn ? '' : 'off'}`} onClick={toggleMic}>
            <Icon name={micOn ? 'mic' : 'micOff'} />
          </button>
          <button className={`ctrl-btn ${camOn ? '' : 'off'}`} onClick={toggleCam}>
            <Icon name={camOn ? 'video' : 'camOff'} />
          </button>
          <button className="ctrl-btn end" onClick={() => setConfirmEnd(true)}>
            <Icon name="phoneOff" />
          </button>
        </div>
      </div>

      {confirmEnd && (
        <Modal onClose={() => !summarizing && setConfirmEnd(false)}>
          <div style={{ fontWeight: 500, fontSize: 16, marginBottom: 8 }}>
            {summarizing ? 'Encerrando…' : 'Encerrar consulta?'}
          </div>
          <div className="small muted" style={{ marginBottom: 20 }}>
            {summarizing ? 'Aguarde enquanto salvamos a consulta.' : 'Isso finalizará o atendimento.'}
          </div>
          {summaryError && (
            <div className="call-error" style={{ marginBottom: 16 }}>
              <Icon name="alert" size={16} />
              <span>{summaryError.message}</span>
            </div>
          )}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary btn-sm" disabled={summarizing} onClick={() => setConfirmEnd(false)}>
              Cancelar
            </button>
            <button className="btn btn-danger btn-sm" disabled={summarizing} onClick={finish}>
              {summarizing ? 'Aguarde…' : 'Encerrar consulta'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}