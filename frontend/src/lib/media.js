/**
 * Gerenciador compartilhado do stream local (câmera + microfone).
 * Permite que Preroom adquira o stream, mostre preview, e o Call
 * reaproveite o MESMO stream sem pedir permissão de novo.
 *
 * Regra: quem adquire também libera. Preroom NÃO libera se está
 * navegando pra Call (o Call assume a posse).
 */

const CONSTRAINTS = {
  video: {
    width: { ideal: 1280 },
    height: { ideal: 720 },
    facingMode: 'user',
  },
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
  },
};

let _stream = null;
let _pending = null;

export async function acquireStream() {
  // devolve stream vivo em cache
  if (_stream && _stream.getTracks().every((t) => t.readyState === 'live')) {
    return _stream;
  }
  // se já há requisição em andamento, aguarda a mesma
  if (_pending) return _pending;

  if (!window.isSecureContext) {
    throw new Error(
      'WebRTC exige contexto seguro (HTTPS ou localhost). Abra via http://localhost.',
    );
  }
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error('Este navegador não suporta captura de mídia.');
  }

  _pending = navigator.mediaDevices
    .getUserMedia(CONSTRAINTS)
    .then((s) => {
      _stream = s;
      _pending = null;
      return s;
    })
    .catch((e) => {
      _pending = null;
      throw e;
    });

  return _pending;
}

export function releaseStream() {
  if (_stream) {
    try {
      _stream.getTracks().forEach((t) => t.stop());
    } catch {
      /* ignore */
    }
    _stream = null;
  }
}

export function peekStream() {
  return _stream;
}