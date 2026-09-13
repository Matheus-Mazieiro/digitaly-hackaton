export function initials(name = '') {
  return name
    .split(' ')
    .filter((w) => w.length > 1 || /[A-Za-zÀ-ÿ]/.test(w))
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

export function dateKey(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// 12/09/2026
export function fmtDateFull(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

// sexta-feira, 12 de setembro de 2026
export function fmtDateFullLong(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

// 12/09 · 09:00
export function fmtDateShortTime(dateStr, time) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${day}/${month} · ${time}`;
}

export function appointmentAccessInfoNova(consulta) {
  if (!consulta) return { canJoin: false, reason: 'not_found' };

  if (consulta.status === 'em_andamento') return { canJoin: true, reason: 'live' };
  if (consulta.status === 'concluida') return { canJoin: false, reason: 'finished' };
  if (consulta.status === 'cancelada') return { canJoin: false, reason: 'cancelled' };

  const dataConsulta = new Date(consulta.hora);
  const msUntil = dataConsulta.getTime() - new Date().getTime();
  const JOIN_WINDOW_MS = 15 * 60 * 1000; // 15 minutos
  const ONE_HOUR = 60 * 60 * 1000;

  if (msUntil <= JOIN_WINDOW_MS && msUntil > -ONE_HOUR) {
    return { canJoin: true, reason: 'window', msUntil };
  }

  return { canJoin: false, reason: 'too_early' };
}

// Extrai a hora de uma data (Ex: "14:30")
export function extractTime(dateString) {
  return new Date(dateString).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}