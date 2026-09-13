import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { Icon } from '../../lib/icons';
import { Avatar } from '../../components/Shared';
import Modal from '../../components/Modal';
import { initials } from '../../lib/utils';
import { useCall } from '../../hooks/useCall';
import { useWebSpeechTranscription } from '../../hooks/useWebSpeechTranscription';
import { useRecorder } from '../../hooks/useRecorder';
import { aiApi } from '../../lib/aiApi';

export default function DoctorCall() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { toast } = useToast();
  const {
    apptById,
    nextPatientAppt,
    activeApptId,
    patientName,
    doctorById,
    doctorId,
    transcript,
    setTranscript,
    patchAppointment,
    pushNotification,
  } = useApp();

  const roomParam = params.get('room');
  const a = roomParam
    ? apptById(roomParam)
    : activeApptId
      ? apptById(activeApptId)
      : nextPatientAppt();

  const doc = doctorById(doctorId);
  const selfName = doc?.name || 'Médico(a)';
  const otherName = patientName;

  const [confirmEnd, setConfirmEnd] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [summarizing, setSummarizing] = useState(false);
  const [summaryError, setSummaryError] = useState(null);

  const transcriptEndRef = useRef(null);

  const roomId = roomParam || (a ? String(a.id) : '');
  const apptId = a?.id;

  useEffect(() => {
    if (!roomId) navigate('/doctor/consultas', { replace: true });
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
    localStream,
    remoteStream,
  } = useCall({ roomId, role: 'doctor' });

  // Transcrição nativa via Web Speech API
  const {
    connected: transcriptionConnected,
    error: transcriptionError,
    supported: transcriptionSupported,
    onTranscript,
  } = useWebSpeechTranscription({
    role: 'Médico',
    enabled: !!localStream && remoteActive,
  });

  // Gravação do áudio mixado
  const {
    recording,
    uploading,
    uploadedFile,
    stop: stopRecorder,
  } = useRecorder({
    localStream,
    remoteStream,
    apptId,
    role: 'doctor',
    enabled: !!localStream && !!remoteStream && remoteActive,
  });

  // Registra callback de transcrição — acumula tudo no estado
  useEffect(() => {
    onTranscript(({ who, text }) => {
      setTranscript((prev) => [...prev, { who, text }]);
    });
  }, [onTranscript, setTranscript]);

  // Timer
  useEffect(() => {
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  // Auto-scroll da transcrição
  useEffect(() => {
    if (transcriptEndRef.current) {
      transcriptEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [transcript]);

  const finish = async () => {
    stopRecorder();
    setSummarizing(true);
    setSummaryError(null);

    try {
      // Envia TODA a transcrição acumulada para a IA gerar o resumo
      const { data: summary, mocked } = await aiApi.summary(transcript, {
        patientName: otherName,
        reason: a?.reason || 'Consulta',
      });

      if (apptId) {
        patchAppointment(apptId, {
          status: 'concluida',
          hasSummary: true,
          hasReport: true,
          reviewed: false,
          summary,
          transcript,
          summaryMocked: mocked, // guarda pra UI mostrar aviso
          documents: [
            { name: 'Receita — Analgésico', type: 'Receita', from: 'Médico' },
          ],
          recording: uploadedFile || null,
        });
        pushNotification(
          'Sua consulta foi concluída. O resumo já está disponível.',
          'report',
        );
      }

      if (mocked) {
        toast(
          'Backend offline — resumo de demonstração usado.',
          'alert',
          'var(--warning)',
        );
      } else {
        toast('Resumo gerado com IA.', 'sparkle', 'var(--celeste-400)');
      }

      end();
      navigate(`/doctor/consultas/${apptId}`, { replace: true });
    } catch (err) {
      setSummaryError(err);
      toast(
        'Não foi possível gerar o resumo. Tente novamente.',
        'alert',
        'var(--error)',
      );
    } finally {
      setSummarizing(false);
    }
  };

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');

  const statusLabel =
    {
      idle: 'Preparando a sala...',
      'requesting-media': 'Pedindo acesso à câmera e microfone...',
      connecting: peerPresent
        ? 'Conectando com o paciente...'
        : 'Aguardando o paciente entrar...',
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

          {/* Badges de status */}
          <div
            style={{
              position: 'absolute',
              top: 60,
              left: 16,
              display: 'flex',
              gap: 8,
              flexWrap: 'wrap',
              maxWidth: 'calc(100% - 32px)',
            }}
          >
            {transcriptionConnected && (
              <span className="badge badge-info">
                <Icon name="sparkle" size={11} /> Transcrição ativa
              </span>
            )}
            {!transcriptionSupported && (
              <span className="badge badge-warning">
                <Icon name="alert" size={11} /> Navegador sem suporte a voz
              </span>
            )}
            {transcriptionError && transcriptionSupported && (
              <span className="badge badge-warning">
                <Icon name="alert" size={11} /> {transcriptionError.message}
              </span>
            )}
            {recording && (
              <span className="badge badge-error">
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: 'var(--error)',
                    display: 'inline-block',
                    animation: 'pulse 1.2s infinite',
                  }}
                />{' '}
                Gravando
              </span>
            )}
            {uploading && (
              <span className="badge badge-warning">Enviando gravação…</span>
            )}
            {uploadedFile && (
              <span className="badge badge-success">
                <Icon name="check" size={11} /> Áudio salvo
              </span>
            )}
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

      {/* Painel de transcrição */}
      <div className="copilot-panel card glass" style={{ padding: 0 }}>
        <div className="copilot-head">
          <span style={{ color: 'var(--celeste-400)' }}>
            <Icon name="msg" size={18} />
          </span>
          <span style={{ fontWeight: 600, fontSize: 14 }}>
            Transcrição da consulta
          </span>
          {transcriptionConnected && (
            <span
              className="badge badge-info"
              style={{ marginLeft: 'auto', fontSize: 10 }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: 'var(--celeste-400)',
                  display: 'inline-block',
                  animation: 'pulse 1.2s infinite',
                }}
              />
              &nbsp;ao vivo
            </span>
          )}
        </div>

        <div className="copilot-body" style={{ paddingTop: 18 }}>
          {transcript.length ? (
            <>
              {transcript.map((t, i) => (
                <div key={i} className="transcript-line">
                  <span className="who">{t.who}</span>
                  {t.text}
                </div>
              ))}
              <div ref={transcriptEndRef} />
            </>
          ) : (
            <div
              className="small muted"
              style={{ textAlign: 'center', padding: '40px 20px' }}
            >
              <Icon
                name="mic"
                size={22}
                style={{ color: 'var(--texto-3)', marginBottom: 10 }}
              />
              <div>
                A transcrição aparecerá aqui conforme a consulta avança.
              </div>
              <div style={{ marginTop: 6, fontSize: 11.5 }}>
                Fale no microfone para começar.
              </div>
            </div>
          )}
        </div>

        <div
          style={{
            padding: '10px 18px',
            borderTop: '1px solid var(--borda)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
          className="small muted"
        >
          <span>
            {transcript.length} {transcript.length === 1 ? 'linha' : 'linhas'}
          </span>
          {transcript.length > 0 && (
            <button
              className="btn-ghost btn-sm"
              style={{ padding: '4px 10px', fontSize: 11.5 }}
              onClick={() => {
                if (confirm('Limpar toda a transcrição desta consulta?')) {
                  setTranscript([]);
                }
              }}
            >
              Limpar
            </button>
          )}
        </div>
      </div>

      {confirmEnd && (
        <Modal onClose={() => !summarizing && setConfirmEnd(false)}>
          <div style={{ fontWeight: 500, fontSize: 16, marginBottom: 8 }}>
            {summarizing ? 'Gerando resumo…' : 'Encerrar consulta?'}
          </div>
          <div className="small muted" style={{ marginBottom: 20 }}>
            {summarizing
              ? 'Aguarde enquanto a IA organiza o resumo da consulta.'
              : `A IA vai gerar um resumo a partir das ${transcript.length} linhas de transcrição.`}
          </div>
          {summaryError && (
            <div className="call-error" style={{ marginBottom: 16 }}>
              <Icon name="alert" size={16} />
              <span>{summaryError.message}</span>
            </div>
          )}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button
              className="btn btn-secondary btn-sm"
              disabled={summarizing}
              onClick={() => setConfirmEnd(false)}
            >
              Cancelar
            </button>
            <button
              className="btn btn-danger btn-sm"
              disabled={summarizing}
              onClick={finish}
            >
              {summarizing ? 'Gerando…' : 'Encerrar consulta'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}