import { useEffect, useRef, useState } from 'react';
import { createSignaling } from '../lib/signaling';
import { acquireStream, releaseStream } from '../lib/media';

const RTC_CONFIG = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ],
  iceCandidatePoolSize: 4,
};

export function useCall({ roomId, role }) {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const pcRef = useRef(null);
  const signalingRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const pendingRemoteCandidatesRef = useRef([]);
  const remoteDescSetRef = useRef(false);
  const negotiatedRef = useRef(false);

  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);
  const [peerPresent, setPeerPresent] = useState(false);
  const [remoteActive, setRemoteActive] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);

  // debug exposto pra tela
  const [debug, setDebug] = useState({
    signaling: 'idle',
    ice: 'new',
    connection: 'new',
    sent: 0,
    received: 0,
    queued: 0,
  });

  useEffect(() => {
    if (!roomId) return;
    let cancelled = false;
    const isInitiator = role === 'doctor';

    async function init() {
      setStatus('requesting-media');
      setDebug((d) => ({ ...d, signaling: 'getting media' }));

      let stream;
      try {
        stream = await acquireStream();
      } catch (err) {
        if (!cancelled) {
          setError(err);
          setStatus('failed');
        }
        return;
      }

      if (cancelled) return;

      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      const at = stream.getAudioTracks()[0];
      const vt = stream.getVideoTracks()[0];
      if (at) setMicOn(at.enabled);
      if (vt) setCamOn(vt.enabled);

      setStatus('connecting');
      setDebug((d) => ({ ...d, signaling: 'connecting' }));

      const pc = new RTCPeerConnection(RTC_CONFIG);
      pcRef.current = pc;
      pendingRemoteCandidatesRef.current = [];
      remoteDescSetRef.current = false;
      negotiatedRef.current = false;

      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      const remoteStream = new MediaStream();
      remoteStreamRef.current = remoteStream;
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream;

      pc.ontrack = (ev) => {
        const incoming = ev.streams?.length
          ? ev.streams
          : [new MediaStream([ev.track])];
        incoming.forEach((s) => {
          s.getTracks().forEach((track) => {
            if (!remoteStream.getTracks().find((t) => t.id === track.id)) {
              remoteStream.addTrack(track);
            }
          });
        });
        setRemoteActive(true);
      };

      pc.onconnectionstatechange = () => {
        setDebug((d) => ({ ...d, connection: pc.connectionState }));
        if (pc.connectionState === 'connected') setStatus('connected');
        else if (pc.connectionState === 'failed') setStatus('failed');
        else if (
          pc.connectionState === 'disconnected' ||
          pc.connectionState === 'closed'
        )
          setStatus('ended');
      };

      pc.oniceconnectionstatechange = () => {
        setDebug((d) => ({ ...d, ice: pc.iceConnectionState }));
      };

      const signaling = createSignaling({ room: roomId, role });
      signalingRef.current = signaling;

      // ===== CORREÇÃO CHAVE =====
      // Sempre enviamos as candidates locais, imediatamente.
      // O lado que receber empilha se ainda não tiver remote description.
      pc.onicecandidate = ({ candidate }) => {
        if (!candidate) return;
        signaling.send({ type: 'candidate', candidate });
        setDebug((d) => ({ ...d, sent: d.sent + 1 }));
      };

      async function flushRemoteCandidates() {
        const list = pendingRemoteCandidatesRef.current;
        pendingRemoteCandidatesRef.current = [];
        setDebug((d) => ({ ...d, queued: 0 }));
        for (const c of list) {
          try {
            await pc.addIceCandidate(c);
          } catch (err) {
            console.warn('[call] erro ao adicionar candidate da fila', err);
          }
        }
      }

      signaling.onMessage(async (msg) => {
        setDebug((d) => ({ ...d, received: d.received + 1 }));
        console.log('[call] <<', msg.type);
        try {
          if (msg.type === 'peer-joined') {
            setPeerPresent(true);
            if (
              isInitiator &&
              !negotiatedRef.current &&
              pc.signalingState === 'stable'
            ) {
              negotiatedRef.current = true;
              const offer = await pc.createOffer();
              await pc.setLocalDescription(offer);
              signaling.send({
                type: 'description',
                description: pc.localDescription,
              });
              console.log('[call] >> offer');
            }
          } else if (msg.type === 'peer-left') {
            setPeerPresent(false);
            setRemoteActive(false);
            setStatus('ended');
          } else if (msg.type === 'description') {
            if (msg.description.type === 'offer') {
              if (negotiatedRef.current && pc.signalingState === 'stable') {
                console.warn('[call] offer ignorada (já negociado)');
                return;
              }
              await pc.setRemoteDescription(msg.description);
              remoteDescSetRef.current = true;
              await flushRemoteCandidates();

              const answer = await pc.createAnswer();
              await pc.setLocalDescription(answer);
              signaling.send({
                type: 'description',
                description: pc.localDescription,
              });
              console.log('[call] >> answer');
            } else if (msg.description.type === 'answer') {
              await pc.setRemoteDescription(msg.description);
              remoteDescSetRef.current = true;
              await flushRemoteCandidates();
              console.log('[call] remote description = answer');
            }
          } else if (msg.type === 'candidate' && msg.candidate) {
            if (!remoteDescSetRef.current) {
              pendingRemoteCandidatesRef.current.push(msg.candidate);
              setDebug((d) => ({ ...d, queued: d.queued + 1 }));
              console.log('[call] candidate empilhada (aguardando remote desc)');
            } else {
              try {
                await pc.addIceCandidate(msg.candidate);
              } catch (err) {
                console.warn('[call] erro addIceCandidate', err);
              }
            }
          }
        } catch (err) {
          console.error('[call] erro na sinalização', err);
        }
      });

      await signaling.connect();
      console.log('[call] signaling conectado');
    }

    init();

    return () => {
      cancelled = true;
      try { pcRef.current?.close(); } catch {}
      try { signalingRef.current?.close(); } catch {}
      pcRef.current = null;
      signalingRef.current = null;
      remoteStreamRef.current = null;
      pendingRemoteCandidatesRef.current = [];
      remoteDescSetRef.current = false;
      negotiatedRef.current = false;
      releaseStream();
    };
  }, [roomId, role]);

  const toggleMic = () => {
    const s = localVideoRef.current?.srcObject;
    const t = s?.getAudioTracks?.()[0];
    if (!t) return;
    t.enabled = !t.enabled;
    setMicOn(t.enabled);
  };

  const toggleCam = () => {
    const s = localVideoRef.current?.srcObject;
    const t = s?.getVideoTracks?.()[0];
    if (!t) return;
    t.enabled = !t.enabled;
    setCamOn(t.enabled);
  };

  const end = () => {
    try { pcRef.current?.close(); } catch {}
    try { signalingRef.current?.close(); } catch {}
    releaseStream();
    setStatus('ended');
  };

  return {
    localVideoRef,
    remoteVideoRef,
    status,
    error,
    peerPresent,
    remoteActive,
    micOn,
    camOn,
    toggleMic,
    toggleCam,
    end,
    debug,
  };
}