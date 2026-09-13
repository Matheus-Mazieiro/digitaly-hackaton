import { useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { NotifRow } from '../../components/Shared';

function fmtTime(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  } catch {
    return iso;
  }
}

export default function Notifications() {
  const { notifications, loadNotifications, markNotificationRead } = useApp();

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  return (
    <>
      <h1 className="page-title">Notificações</h1>
      <div className="card" style={{ padding: 8 }}>
        {notifications.map((n, i) => (
          <div
            key={n.id}
            onClick={() => !n.read && markNotificationRead(n.id)}
            style={{ cursor: !n.read ? 'pointer' : 'default' }}
          >
            <NotifRow n={{ ...n, time: fmtTime(n.time) }} />
            {i < notifications.length - 1 && <hr className="divider" style={{ margin: 0 }} />}
          </div>
        ))}
        {!notifications.length && (
          <div className="small muted" style={{ padding: 20, textAlign: 'center' }}>Sem notificações.</div>
        )}
      </div>
    </>
  );
}
