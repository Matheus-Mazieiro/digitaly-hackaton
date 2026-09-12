import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Icon } from '../../lib/icons';

function apptDateLabel(a) {
  const d = new Date(a.date + 'T00:00:00');
  return `${d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} · ${a.time}`;
}

export default function DoctorHistoryDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { apptById, patientName } = useApp();
  const a = apptById(Number(id)) || apptById(1);
  if (!a || !a.summary) return <div className="card">Resumo não encontrado.</div>;

  return (
    <>
      <button className="btn-ghost btn-sm" style={{ marginBottom: 8 }} onClick={() => navigate('/doctor/history')}>
        <Icon name="arrowLeft" /> Voltar
      </button>
      <h1 className="page-title" style={{ fontSize: 24 }}>Resumo da consulta</h1>
      <div className="page-sub">{patientName} · {apptDateLabel(a)}</div>
      <div className="badge badge-info" style={{ marginBottom: 18 }}>
        <Icon name="sparkle" size={12} /> Gerado por IA
      </div>
      <div className="card" style={{ marginBottom: 14 }}>
        <div className="section-title">Motivo da consulta</div>
        <div className="small" style={{ color: 'var(--g200)', lineHeight: 1.6 }}>{a.summary.motivo}</div>
      </div>
      <div className="card" style={{ marginBottom: 14 }}>
        <div className="section-title">Principais pontos discutidos</div>
        <div className="small" style={{ color: 'var(--g200)', lineHeight: 1.6 }}>{a.summary.pontos}</div>
      </div>
      <div className="card" style={{ marginBottom: 14 }}>
        <div className="section-title">Orientações</div>
        <div className="small" style={{ color: 'var(--g200)', lineHeight: 1.6 }}>{a.summary.orientacoes}</div>
      </div>
      <div className="card">
        <div className="section-title">Próximos passos</div>
        <div className="small" style={{ color: 'var(--g200)', lineHeight: 1.6 }}>{a.summary.proximos}</div>
      </div>
      <div style={{ marginTop: 20 }}>
        <div className="section-title">Histórico do paciente</div>
        <div className="card small muted">2 consultas anteriores registradas.</div>
      </div>
    </>
  );
}