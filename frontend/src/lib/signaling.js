/**
 * Camada de sinalização WebRTC.
 *
 * - Se VITE_SIGNALING_URL estiver definida → conecta no backend Go via WebSocket.
 * - Caso contrário → usa BroadcastChannel (2 abas do mesmo navegador).
 *
 * Protocolo (backend Go precisa implementar — ver SIGNALING.md):
 *   → { type:'join',        room, role }
 *   → { type:'description', room, role, description }
 *   → { type:'candidate',   room, role, candidate }
 *   → { type:'leave',       room, role }
 *   ← { type:'peer-joined' }
 *   ← { type:'peer-left'  }
 *   ← { type:'description', description }
 *   ← { type:'candidate',   candidate }
 */

const SIGNALING_URL = import.meta.env.VITE_SIGNALING_URL || '';

/* ============================ WebSocket ============================ */
class WebSocketSignaling {
  constructor({ room, role }) {
    this.room = room;
    this.role = role;
    this.handlers = new Set();
    this.ws = null;
  }

  connect() {
    return new Promise((resolve, reject) => {
      const base = SIGNALING_URL;
      const url = `${base}${
        base.includes('?') ? '&' : '?'
      }room=${encodeURIComponent(this.room)}&role=${encodeURIComponent(this.role)}`;
      const ws = new WebSocket(url);
      ws.onopen = () => {
        this.ws = ws;
        resolve();
      };
      ws.onerror = (e) => reject(e);
      ws.onmessage = (ev) => {
        try {
          const msg = JSON.parse(ev.data);
          this.handlers.forEach((h) => h(msg));
        } catch {
          /* ignore */
        }
      };
    });
  }

  send(msg) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ ...msg, room: this.room, role: this.role }));
    }
  }

  onMessage(cb) {
    this.handlers.add(cb);
    return () => this.handlers.delete(cb);
  }

  close() {
    this.send({ type: 'leave' });
    try {
      this.ws?.close();
    } catch {
      /* ignore */
    }
    this.ws = null;
  }
}

/* ======================= BroadcastChannel (local) ======================= */
class LocalSignaling {
  constructor({ room, role }) {
    this.room = room;
    this.role = role;
    this.handlers = new Set();
    this.channel = null;
    this.knownPeers = new Set();
    this.announce = null;
  }

  connect() {
    return new Promise((resolve) => {
      this.channel = new BroadcastChannel(`digitaly-call-${this.room}`);

      this.channel.onmessage = (ev) => {
        const msg = ev.data;
        if (!msg || msg.role === this.role) return;

        if (msg.type === 'join' || msg.type === 'join-ack') {
          if (!this.knownPeers.has(msg.role)) {
            this.knownPeers.add(msg.role);
            this.handlers.forEach((h) => h({ type: 'peer-joined' }));
          }
          if (msg.type === 'join') {
            // responde pra o recém-chegado saber que já estamos aqui
            this.channel.postMessage({ type: 'join-ack', role: this.role });
          }
        } else if (msg.type === 'leave') {
          if (this.knownPeers.delete(msg.role)) {
            this.handlers.forEach((h) => h({ type: 'peer-left' }));
          }
        } else {
          // description / candidate → repassa como veio
          this.handlers.forEach((h) => h(msg));
        }
      };

      // anúncio inicial
      this.channel.postMessage({ type: 'join', role: this.role });
      // re-anúncio a cada 2s (cobre o caso do outro já estar presente)
      this.announce = setInterval(() => {
        this.channel?.postMessage({ type: 'join', role: this.role });
      }, 2000);

      resolve();
    });
  }

  send(msg) {
    this.channel?.postMessage({ ...msg, room: this.room, role: this.role });
  }

  onMessage(cb) {
    this.handlers.add(cb);
    return () => this.handlers.delete(cb);
  }

  close() {
    try {
      this.send({ type: 'leave' });
    } catch {
      /* ignore */
    }
    if (this.announce) clearInterval(this.announce);
    try {
      this.channel?.close();
    } catch {
      /* ignore */
    }
    this.channel = null;
  }
}

export function createSignaling({ room, role }) {
  if (SIGNALING_URL) return new WebSocketSignaling({ room, role });
  return new LocalSignaling({ room, role });
}

export const usingWebSocketSignaling = Boolean(SIGNALING_URL);