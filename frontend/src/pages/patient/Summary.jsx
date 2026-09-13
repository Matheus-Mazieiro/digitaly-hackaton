import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Icon } from '../../lib/icons';
import { fmtDateFull } from '../../lib/utils';

export default function Summary() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { apptById, doctorById } = useApp();
  const a = apptById(id);
  if (!a || !a.summary) return <div className="card">Resumo não encontrado.</div>;
  const doc = doctorById(a.doctorId);

  return (
    <>
      <button
        className="btn-ghost btn-sm"
        style={{ marginBottom: 8 }}
        onClick={() => navigate('/patient/history')}
      >
        <Icon name="arrowLeft" /> Voltar
      </button>
      <h1 className="page-title" style={{ fontSize: 24 }}>
        Resumo da consulta
      </h1>
      <div className="page-sub">
        {doc.name} · {fmtDateFull(a.date)} · {a.time}
      </div>
      <div className="badge badge-info" style={{ marginBottom: 18 }}>
        <Icon name="sparkle" size={12} /> Gerado por IA
      </div>
      <div className="card" style={{ marginBottom: 14 }}>
        <div className="section-title">Motivo da consulta</div>
        <div className="small" style={{ color: 'var(--g200)', lineHeight: 1.6 }}>
          {a.summary.motivo}
        </div>
      </div>
      <div className="card" style={{ marginBottom: 14 }}>
        <div className="section-title">Principais pontos discutidos</div>
        <div className="small" style={{ color: 'var(--g200)', lineHeight: 1.6 }}>
          {a.summary.pontos}
        </div>
      </div>
      <div className="card" style={{ marginBottom: 14 }}>
        <div className="section-title">Orientações</div>
        <div className="small" style={{ color: 'var(--g200)', lineHeight: 1.6 }}>
          {a.summary.orientacoes}
        </div>
      </div>
      <div className="card">
        <div className="section-title">Próximos passos</div>
        <div className="small" style={{ color: 'var(--g200)', lineHeight: 1.6 }}>
          {a.summary.proximos}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
        <button
          className="btn btn-secondary"
          onClick={() => navigate('/patient/history')}
        >
          <Icon name="file" /> Ver documentos
        </button>
        {!a.reviewed && (
          <button
            className="btn btn-primary"
            onClick={() => navigate(`/patient/review/${a.id}`)}
          >
            <Icon name="star" /> Avaliar médico
          </button>
        )}
      </div>
    </>
  );
}