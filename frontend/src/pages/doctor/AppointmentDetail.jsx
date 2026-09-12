import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Icon } from '../../lib/icons';
import { StatusBadge } from '../../components/Shared';

function apptDateLabel(a) {
  const d = new Date(a.date + 'T00:00:00');
  return `${d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} · ${a.time}`;
}

export default function DoctorAppointmentDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { apptById, appointments, patientName, patchAppointment, pushNotification } = useApp();
  const a = apptById(Number(id));
  if (!a) return <div className="card">Consulta não encontrada.</div>;

  const past = appointments.filter((x) => x.status === 'concluida');

  const startCall = () => {
    patchAppointment(a.id, { status: 'em_andamento' });
    pushNotification('Seu médico entrou na sala.', 'started');
    navigate('/doctor/call');
  };

  return (
    <>
      <button className="btn-ghost btn-sm" style={{ marginBottom: 8 }} onClick={() => navigate('/doctor/dashboard')}>
        <Icon name="arrowLeft" /> Voltar
      </button>
      <h1 className="page-title" style={{ fontSize: 24 }}>Consulta com {patientName}</h1>
      <div className="page-sub">{apptDateLabel(a)} · <StatusBadge status={a.status} /></div>
      <div className="grid-2">
        <div className="card">
          <div className="section-title">Dados do paciente</div>
          <div className="small" style={{ lineHeight: 2 }}>
            Nome: <b style={{ color: 'var(--g100)' }}>{patientName}</b><br />
            Idade: <b style={{ color: 'var(--g100)' }}>27 anos</b><br />
            Convênio: <b style={{ color: 'var(--g100)' }}>Particular</b>
          </div>
        </div>
        <div className="card">
          <div className="section-title">Pré-consulta</div>
          <div className="small" style={{ lineHeight: 1.8 }}>
            <b style={{ color: 'var(--g100)' }}>Motivo:</b> {a.reason || 'Consulta de rotina'}<br />
            <b style={{ color: 'var(--g100)' }}>Sintomas:</b> Relatados no formulário de pré-atendimento.<br />
            <b style={{ color: 'var(--g100)' }}>Observações:</b> Nenhuma alergia conhecida.
          </div>
        </div>
        <div className="card">
          <div className="section-title">Histórico</div>
          {past.length
            ? past.map((p) => (
                <div key={p.id} className="small muted" style={{ padding: '6px 0' }}>
                  {apptDateLabel(p)} — resumo disponível
                </div>
              ))
            : <div className="small muted">Sem consultas anteriores.</div>}
        </div>
        <div className="card">
          <div className="section-title">Documentos</div>
          {past.flatMap((p) => p.documents || []).map((d, i) => (
            <div key={i} className="small muted" style={{ padding: '6px 0' }}>{d.name}</div>
          ))}
          {!past.some((p) => p.documents?.length) && <div className="small muted">Nenhum documento anterior.</div>}
        </div>
      </div>
      <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={startCall}>
        <Icon name="video" /> Iniciar teleatendimento
      </button>
    </>
  );
}