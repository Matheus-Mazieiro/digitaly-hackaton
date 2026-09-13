/**
 * Cliente HTTP para o backend Go.
 *
 * Regra: SEMPRE tenta o backend real primeiro. Só cai em mock
 * se a requisição falhar (timeout, 500, rede). Nada é cacheado.
 * Quando usa mock, marca `mocked: true` pra UI mostrar aviso.
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8085';

console.log('[aiApi] API_URL =', API_URL);

async function jfetch(path, options = {}) {
  const url = `${API_URL}${path}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} ${path}: ${text.slice(0, 200)}`);
  }
  return res.json();
}

/**
 * Envolve uma chamada real com fallback para mock.
 * Devolve `{ data, mocked }` — `mocked` indica se foi usado mock.
 */
async function withFallback(name, realCall, mockFactory) {
  try {
    const data = await realCall();
    console.log(`[aiApi] ${name} ok (backend)`);
    return { data, mocked: false };
  } catch (err) {
    console.warn(`[aiApi] ${name} falhou — usando mock.`, err?.message || err);
    return { data: mockFactory(), mocked: true };
  }
}

/* ---------------- MOCKS (fallback se backend offline) ---------------- */
const MOCK_INSIGHTS = [
  { kind: 'info', text: 'Paciente relata dor de cabeça recorrente há semanas.' },
  { kind: 'attention', text: 'Uso de medicação por conta própria mencionado.' },
  { kind: 'suggestion', text: 'Considere investigar gatilhos e padrão de sono.' },
];

const MOCK_SUMMARY = {
  motivo: 'Dor de cabeça recorrente relatada nas últimas semanas.',
  pontos:
    'Paciente relatou episódios quase diários, predominantemente à tarde, sem alterações visuais ou náusea associadas. Uso recente de analgésico por conta própria.',
  orientacoes:
    'Ajustar rotina de sono, manter boa hidratação e reduzir exposição a telas antes de dormir.',
  proximos: 'Reavaliação em 30 dias caso os sintomas persistam ou se intensifiquem.',
};

export const aiApi = {
  /** Insights do copiloto */
  async insights(transcript, context) {
    return withFallback(
      'insights',
      () =>
        jfetch('/api/ai/insights', {
          method: 'POST',
          body: JSON.stringify({ transcript, context }),
        }),
      () => {
        const idx = (transcript?.length || 0) % MOCK_INSIGHTS.length;
        return { insights: [MOCK_INSIGHTS[idx]] };
      },
    );
  },

  /** Resumo final — recebe a transcrição completa */
  async summary(transcript, context) {
    return withFallback(
      'summary',
      () =>
        jfetch('/api/ai/summary', {
          method: 'POST',
          body: JSON.stringify({ transcript, context }),
        }),
      () => MOCK_SUMMARY,
    );
  },

  /** Upload da gravação */
  async uploadRecording(apptId, role, blob) {
    return withFallback(
      'upload',
      async () => {
        const fd = new FormData();
        const ext = blob.type.includes('webm') ? 'webm' : 'bin';
        fd.append('audio', blob, `recording.${ext}`);
        const url = `${API_URL}/api/recordings?apptId=${apptId}&role=${role}`;
        const res = await fetch(url, { method: 'POST', body: fd });
        if (!res.ok) throw new Error(`upload falhou: ${res.status}`);
        return res.json();
      },
      () => ({ ok: true, file: null }),
    );
  },

  /** Expõe a URL que está sendo usada (útil pra debug) */
  getApiUrl: () => API_URL,
};