import { useToast } from '../context/ToastContext';
import { Icon } from '../lib/icons';

export default function ToastHost() {
  const { toasts } = useToast();
  return (
    <div className="toast-wrap">
      {toasts.map((t) => (
        <div key={t.id} className="toast glass" style={{ borderLeft: `3px solid ${t.color}` }}>
          <div style={{ color: t.color }}>
            <Icon name={t.icon} size={18} />
          </div>
          <div style={{ fontSize: 13, lineHeight: 1.4, color: 'var(--g100)' }}>{t.text}</div>
        </div>
      ))}
    </div>
  );
}