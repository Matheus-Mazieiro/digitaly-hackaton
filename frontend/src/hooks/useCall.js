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
  const [remoteAudioBlocked, setRemoteAudioBlocked] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);

  // streams expostos para gravação e transcrição
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  const [debug, setDebug] = useState({
    signaling: 'idle', ice: 'new', connection: 'new', sent: 0, received: 0, queued: 0,
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
        if (!cancelled) { setError(err); setStatus('failed'); }
        return;
      }
      if (cancelled) return;

      setLocalStream(stream);

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

      const rStream = new MediaStream();
      remoteStreamRef.current = rStream;
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = rStream;

      async function playRemote() {
        const el = remoteVideoRef.current;
        if (!el) return;
        try {
          el.muted = false;
          await el.play();
          setRemoteAudioBlocked(false);
        } catch {
          try { el.muted = true; await el.play(); } catch {}
          setRemoteAudioBlocked(true);
        }
      }

      pc.ontrack = (ev) => {
        const incoming = ev.streams?.length ? ev.streams : [new MediaStream([ev.track])];
        incoming.forEach((s) => {
          s.getTracks().forEach((track) => {
            if (!rStream.getTracks().find((t) => t.id === track.id)) {
              rStream.addTrack(track);
            }
          });
        });
        setRemoteActive(true);
        setRemoteStream(rStream); // expõe pra useRecorder
        playRemote();
      };

      pc.onconnectionstatechange = () => {
        setDebug((d) => ({ ...d, connection: pc.connectionState }));
        if (pc.connectionState === 'connected') setStatus('connected');
        else if (pc.connectionState === 'failed') setStatus('failed');
        else if (pc.connectionState === 'disconnected' || pc.connectionState === 'closed') setStatus('ended');
      };

      pc.oniceconnectionstatechange = () => {
        setDebug((d) => ({ ...d, ice: pc.iceConnectionState }));
      };

      const signaling = createSignaling({ room: roomId, role });
      signalingRef.current = signaling;

      pc.onicecandidate = ({ candidate }) => {
        if (!candidate) return;
        signaling.send({ type: 'candidate', candidate: candidate.toJSON() });
        setDebug((d) => ({ ...d, sent: d.sent + 1 }));
      };

      async function flushRemoteCandidates() {
        const list = pendingRemoteCandidatesRef.current;
        pendingRemoteCandidatesRef.current = [];
        setDebug((d) => ({ ...d, queued: 0 }));
        for (const c of list) {
          try { await pc.addIceCandidate(c); } catch (err) { console.warn('[call] addIceCandidate', err); }
        }
      }

      signaling.onMessage(async (msg) => {
        setDebug((d) => ({ ...d, received: d.received + 1 }));
        try {
          if (msg.type === 'peer-joined') {
            setPeerPresent(true);
            if (isInitiator && !negotiatedRef.current && pc.signalingState === 'stable') {
              negotiatedRef.current = true;
              const offer = await pc.createOffer();
              await pc.setLocalDescription(offer);
              signaling.send({
                type: 'description',
                description: { type: pc.localDescription.type, sdp: pc.localDescription.sdp },
              });
            }
          } else if (msg.type === 'peer-left') {
            setPeerPresent(false); setRemoteActive(false); setStatus('ended');
          } else if (msg.type === 'description') {
            if (msg.description.type === 'offer') {
              if (negotiatedRef.current && pc.signalingState === 'stable') return;
              await pc.setRemoteDescription(msg.description);
              remoteDescSetRef.current = true;
              await flushRemoteCandidates();
              const answer = await pc.createAnswer();
              await pc.setLocalDescription(answer);
              signaling.send({
                type: 'description',
                description: { type: pc.localDescription.type, sdp: pc.localDescription.sdp },
              });
            } else if (msg.description.type === 'answer') {
              await pc.setRemoteDescription(msg.description);
              remoteDescSetRef.current = true;
              await flushRemoteCandidates();
            }
          } else if (msg.type === 'candidate' && msg.candidate) {
            if (!remoteDescSetRef.current) {
              pendingRemoteCandidatesRef.current.push(msg.candidate);
              setDebug((d) => ({ ...d, queued: d.queued + 1 }));
            } else {
              try { await pc.addIceCandidate(msg.candidate); } catch (err) { console.warn('[call] addIceCandidate', err); }
            }
          }
        } catch (err) {
          console.error('[call] signaling error', err);
        }
      });

      await signaling.connect();
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

  const unlockRemoteAudio = async () => {
    const el = remoteVideoRef.current;
    if (!el) return;
    try {
      el.muted = false;
      await el.play();
      setRemoteAudioBlocked(false);
    } catch (err) {
      console.warn('[call] unlock falhou', err);
    }
  };

  return {
    localVideoRef, remoteVideoRef,
    status, error, peerPresent, remoteActive, remoteAudioBlocked, unlockRemoteAudio,
    micOn, camOn, toggleMic, toggleCam, end,
    debug,
    localStream, remoteStream, // <-- NOVO
  };
}