import { useEffect, useRef, useState } from 'react';
import { aiApi } from '../lib/aiApi';

/**
 * Conecta na OpenAI Realtime API via WebRTC e emite eventos de
 * transcrição em tempo real. O áudio NÃO passa pelo backend — só o
 * token efêmero é gerado lá.
 *
 * Recebe um MediaStream (do useCall) e:
 *  - abre um RTCPeerConnection com a OpenAI
 *  - envia a track de áudio
 *  - escuta eventos no DataChannel `oai-events`
 *  - emite `onTranscript({ who, text })` a cada turno completo
 */
export function useTranscription({ audioStream, role, enabled }) {
  const pcRef = useRef(null);
  const dcRef = useRef(null);
  const streamRef = useRef(null);

  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);

  const onTranscriptRef = useRef(null);

  useEffect(() => {
    if (!enabled || !audioStream) return;
    let cancelled = false;

    async function init() {
      try {
        // 1) Pede token efêmero ao backend Go
        const session = await aiApi.createRealtimeSession();
        const token = session?.client_secret?.value;
        if (!token) throw new Error('token efêmero ausente');

        if (cancelled) return;

        // 2) Cria peer connection com a OpenAI
        const pc = new RTCPeerConnection();
        pcRef.current = pc;

        // 3) Anexa SÓ o áudio do mic local (não o remoto)
        const audioOnly = new MediaStream(audioStream.getAudioTracks());
        streamRef.current = audioOnly;
        audioOnly.getTracks().forEach((t) => pc.addTrack(t, audioOnly));

        // 4) Data channel para eventos
        const dc = pc.createDataChannel('oai-events');
        dcRef.current = dc;

        dc.onmessage = (ev) => {
          try {
            const event = JSON.parse(ev.data);

            // Turno completo: { type:'conversation.item.input_audio_transcription.completed', transcript, ... }
            if (
              event.type ===
              'conversation.item.input_audio_transcription.completed'
            ) {
              const text = (event.transcript || '').trim();
              if (text && onTranscriptRef.current) {
                onTranscriptRef.current({ who: role, text });
              }
            }

            // Se quiser transcrição parcial em tempo real (digitando),
            // use event.type === '...transcription.delta' e event.delta.
          } catch (err) {
            console.warn('[transcription] parse error', err);
          }
        };

        dc.onopen = () => {
          console.log('[transcription] data channel aberto');
          setConnected(true);
        };

        // 5) Oferta SDP
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        // 6) Envia SDP para OpenAI
        const sdpRes = await fetch('https://api.openai.com/v1/realtime', {
          method: 'POST',
          body: pc.localDescription.sdp,
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/sdp',
          },
        });

        if (!sdpRes.ok) {
          throw new Error(
            `OpenAI SDP falhou: ${sdpRes.status} ${await sdpRes.text()}`,
          );
        }

        // 7) Seta a resposta
        const answerSdp = await sdpRes.text();
        await pc.setRemoteDescription({ type: 'answer', sdp: answerSdp });

        console.log('[transcription] conectado à OpenAI');
      } catch (err) {
        if (!cancelled) {
          console.error('[transcription] erro', err);
          setError(err);
        }
      }
    }

    init();

    return () => {
      cancelled = true;
      try {
        dcRef.current?.close();
      } catch {}
      try {
        pcRef.current?.close();
      } catch {}
      pcRef.current = null;
      dcRef.current = null;
      streamRef.current = null;
      setConnected(false);
    };
  }, [audioStream, role, enabled]);

  const onTranscript = (cb) => {
    onTranscriptRef.current = cb;
  };

  return { connected, error, onTranscript };
}