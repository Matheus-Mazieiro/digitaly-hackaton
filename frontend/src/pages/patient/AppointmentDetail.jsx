import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Icon } from '../../lib/icons';
import { Avatar, StatusBadge, BackButton } from '../../components/Shared';
import { fmtDateFullLong } from '../../lib/utils';
import { api } from '../../lib/api';

export default function AppointmentDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { doctorById, specialtyById } = useApp();
  const [a, setA] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.getAppointment(id).then(setA).catch(console.warn).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="card" style={{ marginTop: 20 }}>Carregando...</div>;
  if (!a) return <div className="card" style={{ marginTop: 20 }}>Consulta não encontrada.</div>;

  const doc = doctorById(a.doctorId);
  const spec = doc ? specialtyById(doc.specialty) : null;
  const isPast = a.status === 'concluida';
  const docs = a.documents || [];

  return (
    <>
      <BackButton onClick={() => navigate('/patient/appointments')} />
      <h1 className="page-title" style={{ fontSize: 24 }}>Detalhes da consulta</h1>

      <div className="card card-hero">
        <div className="flex-center">
          <Avatar name={doc?.name || ''} size={52} />
          <div>
            <div style={{ fontWeight: 500 }}>{doc?.name || 'Médico'}</div>
            <div className="small muted">{spec?.name || ''}</div>
          </div>
        </div>
        <hr className="divider" />
        <div className="grid-2">
          <div><div className="small muted">Data</div><div style={{ fontWeight: 500 }}>{fmtDateFullLong(a.date)}</div></div>
          <div><div className="small muted">Horário</div><div className="num" style={{ fontWeight: 500 }}>{a.time}</div></div>
          <div><div className="small muted">Status</div><StatusBadge status={a.status} /></div>
          <div><div className="small muted">Motivo</div><div style={{ fontWeight: 500 }}>{a.reason || '—'}</div></div>
        </div>
      </div>

      {isPast && a.hasSummary && a.summary && (
        <div className="card" style={{ marginTop: 20 }}>
          <div className="badge badge-info" style={{ marginBottom: 14 }}>
            <Icon name="sparkle" size={12} /> Resumo gerado por IA
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div><div className="section-title">Motivo da consulta</div><div className="small" style={{ color: 'var(--texto-2)', lineHeight: 1.6 }}>{a.summary.motivo}</div></div>
            <div><div className="section-title">Principais pontos discutidos</div><div className="small" style={{ color: 'var(--texto-2)', lineHeight: 1.6 }}>{a.summary.pontos}</div></div>
            <div><div className="section-title">Orientações</div><div className="small" style={{ color: 'var(--texto-2)', lineHeight: 1.6 }}>{a.summary.orientacoes}</div></div>
            <div><div className="section-title">Próximos passos</div><div className="small" style={{ color: 'var(--texto-2)', lineHeight: 1.6 }}>{a.summary.proximos}</div></div>
          </div>
        </div>
      )}

      <div style={{ marginTop: 24 }}>
        <div className="section-title" style={{ marginBottom: 14 }}>Documentos e laudos</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {docs.map((d, i) => (
            <div key={i} className="card row-between" style={{ flexWrap: 'wrap', gap: 10 }}>
              <div className="flex-center">
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--celeste-500)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="file" size={18} />
                </div>
                <div>
                  <div style={{ fontWeight: 500, fontSize: 13.5 }}>{d.name}</div>
                  <div className="small muted">{d.type} · Enviado por {d.from}</div>
                </div>
              </div>
            </div>
          ))}
          {!docs.length && (
            <div className="card muted small" style={{ textAlign: 'center', padding: 20 }}>Nenhum documento nesta consulta.</div>
          )}
        </div>
      </div>
    </>
  );
}
