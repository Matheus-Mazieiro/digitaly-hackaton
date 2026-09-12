import { Icon } from '../lib/icons';
import { initials } from '../lib/utils';

export const LOGO_WHITE =
  'https://digitaly.tech/wp-content/uploads/2026/06/logo_digitaly_branca-scaled.png';
export const LOGO_GRAY =
  'https://digitaly.tech/wp-content/uploads/2026/06/logo_digitaly_cinza-scaled.png';

/* ---------- Logo oficial ---------- */
export function Logo({ variant = 'white', height = 34, style, className }) {
  const src = variant === 'gray' ? LOGO_GRAY : LOGO_WHITE;
  return (
    <img
      src={src}
      alt="Digitaly Technology"
      className={className}
      style={{ height, width: 'auto', display: 'block', objectFit: 'contain', ...style }}
    />
  );
}

/* ---------- Back button (glass pill) ---------- */
export function BackButton({ label = 'Voltar', onClick, style }) {
  return (
    <button type="button" className="btn-back" onClick={onClick} style={style}>
      <span className="btn-back-icon">
        <Icon name="arrowLeft" />
      </span>
      <span className="btn-back-label">{label}</span>
    </button>
  );
}

const STATUS_MAP = {
  agendada: ['neutral', 'Aguardando confirmação'],
  confirmada: ['info', 'Confirmada'],
  em_breve: ['warning', 'Em breve'],
  em_andamento: ['success', 'Em andamento'],
  concluida: ['neutral', 'Concluída'],
  cancelada: ['error', 'Cancelada'],
};

export function StatusBadge({ status }) {
  const [cls, label] = STATUS_MAP[status] || ['neutral', status];
  return <span className={`badge badge-${cls}`}>{label}</span>;
}

export function Avatar({ name, size = 44, fontSize }) {
  return (
    <div
      className="avatar"
      style={{ width: size, height: size, fontSize: fontSize || size * 0.32 }}
    >
      {initials(name)}
    </div>
  );
}

export function StepTrack({ step, total }) {
  return (
    <div className="step-track">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className={`step-dot ${i < step ? 'done' : ''}`} />
      ))}
    </div>
  );
}

const NOTIF_ICONS = {
  doc: 'file', confirm: 'check', report: 'file', started: 'video',
  cancel: 'x', reschedule: 'calendar', info: 'bell', alert: 'alert',
};

export function NotifRow({ n }) {
  return (
    <div className="flex-center" style={{ padding: '12px 8px' }}>
      <div
        style={{
          width: 34, height: 34, borderRadius: 10,
          background: 'var(--grafite-700)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--texto-2)', flexShrink: 0,
        }}
      >
        <Icon name={NOTIF_ICONS[n.type] || 'bell'} size={15} />
      </div>
      <div style={{ flex: 1 }}>
        <div className="small" style={{ color: 'var(--texto)' }}>{n.text}</div>
        <div className="small muted">{n.time}</div>
      </div>
      {!n.read && (
        <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--celeste-500)' }} />
      )}
    </div>
  );
}

export function QuickAction({ icon, label, onClick }) {
  return (
    <button
      className="card clickable"
      onClick={onClick}
      style={{
        textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 14,
        border: '1px solid var(--borda)', background: 'var(--bg-elev-2)',
        color: 'var(--texto)',
      }}
    >
      <div
        style={{
          width: 36, height: 36, borderRadius: 11,
          background: 'rgba(0,159,255,0.1)', color: 'var(--celeste-400)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <Icon name={icon} size={18} />
      </div>
      <div style={{ fontWeight: 500, fontSize: 14, color: 'var(--texto)' }}>{label}</div>
    </button>
  );
}