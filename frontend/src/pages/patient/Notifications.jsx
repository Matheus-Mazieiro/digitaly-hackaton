import { useApp } from '../../context/AppContext';
import { NotifRow } from '../../components/Shared';

export default function Notifications() {
  const { notifications } = useApp();
  return (
    <>
      <h1 className="page-title">Notificações</h1>
      <div className="card" style={{ padding: 8 }}>
        {notifications.map((n, i) => (
          <div key={n.id}>
            <NotifRow n={n} />
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