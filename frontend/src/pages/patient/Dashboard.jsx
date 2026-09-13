import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Icon } from '../../lib/icons';
import { Avatar, NotifRow, QuickAction, StatusBadge } from '../../components/Shared';
import { fmtDateFull } from '../../lib/utils';

export default function PatientDashboard() {
  const navigate = useNavigate();
  const {
    patientName,
    nextPatientAppt,
    doctorById,
    specialtyById,
    notifications,
  } = useApp();

  const next = nextPatientAppt();
  const doc = next ? doctorById(next.doctorId) : null;
  const spec = doc ? specialtyById(doc.specialty) : null;

  const canJoin = Boolean(next);
  const helperText = next
    ? next.status === 'em_andamento'
      ? 'Seu médico já está na sala.'
      : 'Sala liberada. Você já pode entrar.'
    : '';

  return (
    <>
      <h1 className="page-title">Olá, {patientName.split(' ')[0]}</h1>
      <div className="page-sub">
        Aqui está um resumo da sua próxima consulta e das suas atividades recentes.
      </div>

      {next ? (
        <div
          className={`card card-hero ${canJoin ? 'pulse' : ''}`}
          style={{
            background:
              'linear-gradient(135deg, rgba(0,159,255,0.10), rgba(38,42,49,0.6))',
            borderColor: canJoin ? 'var(--celeste-600)' : 'var(--borda)',
            marginBottom: 24,
          }}
        >
          <div
            className="row-between"
            style={{ alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}
          >
            <div className="flex-center">
              <Avatar name={doc.name} size={56} />
              <div>
                <div style={{ fontWeight: 500, fontSize: 16 }}>{doc.name}</div>
                <div className="small muted">{spec.name}</div>
                <div style={{ marginTop: 8 }}>
                  <StatusBadge status={next.status} />
                  {canJoin && (
                    <span className="badge badge-success" style={{ marginLeft: 8 }}>
                      <Icon name="video" size={12} /> Sala liberada
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="small muted">Próxima consulta</div>
              <div className="num" style={{ fontSize: 19, fontWeight: 500 }}>
                {fmtDateFull(next.date)} · {next.time}
              </div>
            </div>
          </div>

          <hr className="divider" />

          <div className="row-between" style={{ flexWrap: 'wrap', gap: 12 }}>
            <div
              className={`small ${canJoin ? '' : 'muted'}`}
              style={{ flex: 1, minWidth: 200 }}
            >
              {helperText}
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
        <div
          className="card card-hero"
          style={{ textAlign: 'center', padding: '40px 20px', marginBottom: 24 }}
        >
          <div style={{ color: 'var(--texto-3)', marginBottom: 10 }}>
            <Icon name="calendar" size={30} />
          </div>
          <div style={{ fontWeight: 500, marginBottom: 4 }}>
            Nenhuma consulta agendada
          </div>
          <div className="small muted" style={{ marginBottom: 18 }}>
            Agende sua próxima teleconsulta em poucos passos.
          </div>
          <button
            className="btn btn-primary"
            style={{ margin: '0 auto' }}
            onClick={() => navigate('/patient/schedule/specialty')}
          >
            Agendar consulta
          </button>
        </div>
      )}

      <div className="section-title">Ações rápidas</div>
      <div
        className="grid-2"
        style={{ marginBottom: 28, gridTemplateColumns: 'repeat(2, 1fr)' }}
      >
        <QuickAction
          icon="plusCalendar"
          label="Agendar consulta"
          onClick={() => navigate('/patient/schedule/specialty')}
        />
        <QuickAction
          icon="calendar"
          label="Ver minhas consultas"
          onClick={() => navigate('/patient/appointments')}
        />
      </div>

      <div className="row-between" style={{ marginBottom: 14 }}>
        <div className="section-title" style={{ margin: 0 }}>
          Notificações recentes
        </div>
        <a
          className="small"
          style={{ color: 'var(--celeste-400)', cursor: 'pointer' }}
          onClick={() => navigate('/patient/notifications')}
        >
          Ver todas
        </a>
      </div>
      <div className="card" style={{ padding: 8 }}>
        {notifications.slice(0, 4).map((n, i) => (
          <div key={n.id}>
            <NotifRow n={n} />
            {i < Math.min(notifications.length, 4) - 1 && (
              <hr className="divider" style={{ margin: 0 }} />
            )}
          </div>
        ))}
      </div>
    </>
  );
}