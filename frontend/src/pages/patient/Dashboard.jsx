import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Icon } from '../../lib/icons';
import { Avatar, NotifRow, QuickAction, StatusBadge } from '../../components/Shared';

function apptDateLabel(a) {
  const d = new Date(a.date + 'T00:00:00');
  return `${d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} · ${a.time}`;
}

export default function PatientDashboard() {
  const navigate = useNavigate();
  const { patientName, nextPatientAppt, doctorById, specialtyById, notifications } = useApp();
  const next = nextPatientAppt();
  const canJoin = next && next.status === 'em_andamento';
  const doc = next ? doctorById(next.doctorId) : null;
  const spec = doc ? specialtyById(doc.specialty) : null;

  return (
    <>
      <h1 className="page-title">Olá, {patientName.split(' ')[0]}</h1>
      <div className="page-sub">Aqui está um resumo da sua próxima consulta e das suas atividades recentes.</div>

      {next ? (
        <div
          className={`card card-hero ${canJoin ? 'pulse' : ''}`}
          style={{
            background: 'linear-gradient(135deg, rgba(0,159,255,0.10), rgba(38,42,49,0.6))',
            borderColor: canJoin ? 'var(--c600)' : 'var(--g700)',
            marginBottom: 24,
          }}
        >
          <div className="row-between" style={{ alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
            <div className="flex-center">
              <Avatar name={doc.name} size={56} />
              <div>
                <div style={{ fontWeight: 600, fontSize: 16 }}>{doc.name}</div>
                <div className="small muted">{spec.name}</div>
                <div style={{ marginTop: 8 }}><StatusBadge status={next.status} /></div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="small muted">Próxima consulta</div>
              <div className="num" style={{ fontSize: 19, fontWeight: 600 }}>{apptDateLabel(next)}</div>
            </div>
          </div>
          <hr className="divider" />
          <div className="row-between">
            <div className={`small ${canJoin ? '' : 'muted'}`}>
              {canJoin ? 'Seu médico já está na sala.' : 'O botão para entrar será liberado próximo do horário.'}
            </div>
            <button
              className={`btn ${canJoin ? 'btn-primary' : 'btn-secondary'}`}
              disabled={!canJoin}
              onClick={() => navigate('/patient/preroom')}
            >
              <Icon name="video" /> Entrar na consulta
            </button>
          </div>
        </div>
      ) : (
        <div className="card card-hero" style={{ textAlign: 'center', padding: '40px 20px', marginBottom: 24 }}>
          <div style={{ color: 'var(--g500)', marginBottom: 10 }}><Icon name="calendar" size={30} /></div>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>Nenhuma consulta agendada</div>
          <div className="small muted" style={{ marginBottom: 18 }}>Agende sua próxima teleconsulta em poucos passos.</div>
          <button className="btn btn-primary" style={{ margin: '0 auto' }} onClick={() => navigate('/patient/schedule/specialty')}>
            Agendar consulta
          </button>
        </div>
      )}

      <div className="section-title">Ações rápidas</div>
      <div className="grid-3" style={{ marginBottom: 28 }}>
        <QuickAction icon="plusCalendar" label="Agendar consulta" onClick={() => navigate('/patient/schedule/specialty')} />
        <QuickAction icon="calendar" label="Ver minhas consultas" onClick={() => navigate('/patient/appointments')} />
        <QuickAction icon="history" label="Ver histórico" onClick={() => navigate('/patient/history')} />
      </div>

      <div className="row-between" style={{ marginBottom: 14 }}>
        <div className="section-title" style={{ margin: 0 }}>Notificações recentes</div>
        <a className="small" style={{ color: 'var(--c400)', cursor: 'pointer' }} onClick={() => navigate('/patient/notifications')}>Ver todas</a>
      </div>
      <div className="card" style={{ padding: 8 }}>
        {notifications.slice(0, 4).map((n, i) => (
          <div key={n.id}>
            <NotifRow n={n} />
            {i < Math.min(notifications.length, 4) - 1 && <hr className="divider" style={{ margin: 0 }} />}
          </div>
        ))}
      </div>
    </>
  );
}