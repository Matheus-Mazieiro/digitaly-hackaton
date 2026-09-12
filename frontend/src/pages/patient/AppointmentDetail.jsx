import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Icon } from '../../lib/icons';
import { Avatar, StatusBadge } from '../../components/Shared';

function apptDateLabel(a) {
  const d = new Date(a.date + 'T00:00:00');
  return `${d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} · ${a.time}`;
}

export default function AppointmentDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { apptById, doctorById, specialtyById } = useApp();
  const a = apptById(Number(id));
  if (!a) return <div className="card">Consulta não encontrada.</div>;

  const doc = doctorById(a.doctorId);
  const future = ['agendada', 'confirmada', 'em_andamento'].includes(a.status);

  return (
    <>
      <button className="btn-ghost btn-sm" style={{ marginBottom: 8 }} onClick={() => navigate('/patient/appointments')}>
        <Icon name="arrowLeft" /> Voltar
      </button>
      <h1 className="page-title" style={{ fontSize: 24 }}>Detalhes da consulta</h1>
      <div className="card card-hero">
        <div className="flex-center">
          <Avatar name={doc.name} size={52} />
          <div>
            <div style={{ fontWeight: 600 }}>{doc.name}</div>
            <div className="small muted">{specialtyById(doc.specialty).name}</div>
          </div>
        </div>
        <hr className="divider" />
        <div className="grid-2">
          <div><div className="small muted">Data</div><div style={{ fontWeight: 500 }}>{apptDateLabel(a)}</div></div>
          <div><div className="small muted">Status</div><StatusBadge status={a.status} /></div>
          <div><div className="small muted">Duração</div><div style={{ fontWeight: 500 }}>{a.status === 'concluida' ? '22 min' : '—'}</div></div>
          <div><div className="small muted">Sala</div><div style={{ fontWeight: 500 }}>{future ? 'Disponível no horário' : 'Encerrada'}</div></div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 20 }}>
        {future && (
          <button className="btn btn-primary" onClick={() => navigate('/patient/preroom')}>
            <Icon name="video" /> Entrar na consulta
          </button>
        )}
        {a.hasSummary && (
          <button className="btn btn-secondary" onClick={() => navigate(`/patient/summary/${a.id}`)}>
            <Icon name="sparkle" /> Ver resumo
          </button>
        )}
        {a.hasReport && (
          <button className="btn btn-secondary" onClick={() => navigate('/patient/documents')}>
            <Icon name="file" /> Ver laudos
          </button>
        )}
        {a.status === 'concluida' && !a.reviewed && (
          <button className="btn btn-secondary" onClick={() => navigate(`/patient/review/${a.id}`)}>
            <Icon name="star" /> Avaliar médico
          </button>
        )}
      </div>
    </>
  );
}