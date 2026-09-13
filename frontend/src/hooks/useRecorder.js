import { useEffect, useRef, useState } from 'react';
import { aiApi } from '../lib/aiApi';

/**
 * Mixa local + remoto num único MediaStream e grava com MediaRecorder.
 * Ao parar, faz upload automático para o backend Go.
 */
export function useRecorder({ localStream, remoteStream, apptId, role, enabled }) {
  const audioCtxRef = useRef(null);
  const destRef = useRef(null);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const localSrcRef = useRef(null);
  const remoteSrcRef = useRef(null);

  const [recording, setRecording] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!enabled || !localStream || !remoteStream || !apptId) return;
    let cancelled = false;

    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    audioCtxRef.current = audioCtx;
    const dest = audioCtx.createMediaStreamDestination();
    destRef.current = dest;

    // conecta mic local
    const localSrc = audioCtx.createMediaStreamSource(localStream);
    localSrcRef.current = localSrc;
    localSrc.connect(dest);

    // conecta áudio remoto
    const remoteSrc = audioCtx.createMediaStreamSource(remoteStream);
    remoteSrcRef.current = remoteSrc;
    remoteSrc.connect(dest);

    // MediaRecorder
    const mime = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
      ? 'audio/webm;codecs=opus'
      : 'audio/webm';
    const recorder = new MediaRecorder(dest.stream, { mimeType: mime });
    recorderRef.current = recorder;
    chunksRef.current = [];

    recorder.ondataavailable = (ev) => {
      if (ev.data && ev.data.size > 0) chunksRef.current.push(ev.data);
    };

    recorder.onstop = async () => {
      if (cancelled) return;
      const blob = new Blob(chunksRef.current, { type: mime });
      chunksRef.current = [];

      if (blob.size < 1024) {
        console.warn('[recorder] blob muito pequeno, ignorando');
        return;
      }

      try {
        setUploading(true);
        const res = await aiApi.uploadRecording(apptId, role, blob);
        if (!cancelled) setUploadedFile(res.file);
        console.log('[recorder] upload ok:', res.file);
      } catch (err) {
        if (!cancelled) setError(err);
        console.error('[recorder] upload falhou', err);
      } finally {
        if (!cancelled) setUploading(false);
      }
    };

    // evita o "gravação morre em 5min" em alguns navegadores
    recorder.start(1000); // timeslice de 1s
    setRecording(true);
    console.log('[recorder] gravando…');

    return () => {
      cancelled = true;
      try {
        if (recorder.state !== 'inactive') recorder.stop();
      } catch {}
      try { localSrc.disconnect(); } catch {}
      try { remoteSrc.disconnect(); } catch {}
      try { audioCtx.close(); } catch {}
      audioCtxRef.current = null;
      destRef.current = null;
      recorderRef.current = null;
      localSrcRef.current = null;
      remoteSrcRef.current = null;
      setRecording(false);
    };
  }, [localStream, remoteStream, apptId, role, enabled]);

  const stop = () => {
    try {
      if (recorderRef.current?.state !== 'inactive') {
        recorderRef.current.stop();
      }
    } catch {}
  };

  return { recording, uploading, uploadedFile, error, stop };
}