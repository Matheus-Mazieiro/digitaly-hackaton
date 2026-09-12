import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { Icon } from '../../lib/icons';
import { Avatar } from '../../components/Shared';
import { fmtDateFull, fmtDateFullLong } from '../../lib/utils';

export default function DoctorHistory() {
  const navigate = useNavigate();
  const { appointments, patientName } = useApp();
  const { toast } = useToast();

  const [openSummary, setOpenSummary] = useState(null);

  const past = appointments
    .filter((a) => a.status === 'concluida')
    .sort((a, b) => b.date.localeCompare(a.date));

  // documentos emitidos (laudos/receitas anexados às consultas concluídas)
  const archivedDocs = appointments
    .filter((a) => a.documents?.length)
    .flatMap((a) =>
      a.documents.map((d) => ({
        ...d,
        apptDate: a.date,
        apptId: a.id,
      })),
    );

  // documentos recebidos dos pacientes (mock local)
  const [pendingDocs, setPendingDocs] = useState([
    {
      id: 1,
      name: 'Exame de sangue — Laboratório Vida',
      type: 'Exame',
      from: patientName,
      date: new Date().toISOString().slice(0, 10),
    },
  ]);

  const toggleSummary = (id) =>
    setOpenSummary((cur) => (cur === id ? null : id));

  const archiveDoc = (id) => {
    setPendingDocs((p) => p.filter((d) => d.id !== id));
    toast('Documento arquivado.', 'check', 'var(--success)');
  };

  return (
    <>
      <button
        className="btn-ghost btn-sm"
        style={{ marginBottom: 8 }}
        onClick={() => navigate('/doctor/dashboard')}
      >
        <Icon name="arrowLeft" /> Início
      </button>
      <h1 className="page-title">Histórico e documentos</h1>
      <div className="page-sub">
        Consultas anteriores, documentos recebidos e arquivados.
      </div>

      {/* ===================== CONSULTAS ===================== */}
      <div className="section-title">Consultas realizadas</div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          marginBottom: 32,
        }}
      >
        {past.map((a) => {
          const isOpen = openSummary === a.id;
          return (
            <div
              key={a.id}
              className="card"
              style={{ padding: 0, overflow: 'hidden' }}
            >
              <div
                className="clickable"
                onClick={() => toggleSummary(a.id)}
                style={{
                  padding: 20,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 10,
                  cursor: 'pointer',
                }}
              >
                <div className="flex-center">
                  <Avatar name={patientName} size={40} fontSize={13} />
                  <div>
                    <div style={{ fontWeight: 500 }}>{patientName}</div>
                    <div className="small muted">
                      {fmtDateFull(a.date)} · {a.time} ·{' '}
                      {a.reason || 'Consulta'}
                    </div>
                  </div>
                </div>
                <div className="flex-center" style={{ gap: 8 }}>
                  {a.hasSummary && (
                    <span className="badge badge-info">
                      <Icon name="sparkle" size={12} /> Resumo por IA
                    </span>
                  )}
                  <Icon
                    name="chevronRight"
                    size={18}
                    style={{
                      color: 'var(--g400)',
                      transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                      transition: 'transform .2s',
                    }}
                  />
                </div>
              </div>

              {isOpen && a.summary && (
                <div
                  className="fade-in"
                  style={{
                    padding: '0 20px 20px 20px',
                    borderTop: '1px solid var(--g700)',
                  }}
                >
                  <div className="small muted" style={{ marginTop: 12 }}>
                    {fmtDateFullLong(a.date)}
                  </div>
                  <div
                    className="badge badge-info"
                    style={{ marginTop: 10, marginBottom: 14 }}
                  >
                    <Icon name="sparkle" size={12} /> Resumo gerado por IA
                  </div>

                  <div
                    style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
                  >
                    <div>
                      <div className="section-title">Motivo da consulta</div>
                      <div
                        className="small"
                        style={{ color: 'var(--g200)', lineHeight: 1.6 }}
                      >
                        {a.summary.motivo}
                      </div>
                    </div>
                    <div>
                      <div className="section-title">
                        Principais pontos discutidos
                      </div>
                      <div
                        className="small"
                        style={{ color: 'var(--g200)', lineHeight: 1.6 }}
                      >
                        {a.summary.pontos}
                      </div>
                    </div>
                    <div>
                      <div className="section-title">Orientações</div>
                      <div
                        className="small"
                        style={{ color: 'var(--g200)', lineHeight: 1.6 }}
                      >
                        {a.summary.orientacoes}
                      </div>
                    </div>
                    <div>
                      <div className="section-title">Próximos passos</div>
                      <div
                        className="small"
                        style={{ color: 'var(--g200)', lineHeight: 1.6 }}
                      >
                        {a.summary.proximos}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {!past.length && (
          <div
            className="card muted small"
            style={{ textAlign: 'center', padding: 30 }}
          >
            Nenhuma consulta concluída ainda.
          </div>
        )}
      </div>

      {/* ===================== DOCS A ARQUIVAR ===================== */}
      <div className="section-title">Documentos a arquivar</div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          marginBottom: 32,
        }}
      >
        {pendingDocs.map((d) => (
          <div
            key={d.id}
            className="card row-between"
            style={{ flexWrap: 'wrap', gap: 10 }}
          >
            <div className="flex-center">
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: 'rgba(245,158,11,0.15)',
                  color: '#FBBF24',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon name="file" size={18} />
              </div>
              <div>
                <div style={{ fontWeight: 500, fontSize: 13.5 }}>{d.name}</div>
                <div className="small muted">
                  {d.type} · Enviado por {d.from} · {fmtDateFull(d.date)}
                </div>
              </div>
            </div>
            <div className="flex-center" style={{ gap: 8 }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => toast('Documento baixado.', 'download', 'var(--c400)')}
              >
                <Icon name="download" size={14} /> Baixar
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => archiveDoc(d.id)}
              >
                <Icon name="check" size={14} /> Arquivar
              </button>
            </div>
          </div>
        ))}
        {!pendingDocs.length && (
          <div
            className="card muted small"
            style={{ textAlign: 'center', padding: 20 }}
          >
            Nenhum documento pendente de arquivamento.
          </div>
        )}
      </div>

      {/* ===================== DOCS ARQUIVADOS ===================== */}
      <div className="section-title">Documentos arquivados</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {archivedDocs.map((d, i) => (
          <div
            key={i}
            className="card row-between"
            style={{
              borderLeft: '4px solid var(--c500)',
              background: 'rgba(0,159,255,0.05)',
              flexWrap: 'wrap',
              gap: 10,
            }}
          >
            <div className="flex-center">
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: 'var(--c600)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                }}
              >
                <Icon name="file" size={20} />
              </div>
              <div>
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: 14,
                    color: 'var(--g50)',
                  }}
                >
                  {d.name}
                </div>
                <div className="small muted">
                  {d.type} · Emitido para {patientName} · {fmtDateFull(d.apptDate)}
                </div>
              </div>
            </div>
            <div className="flex-center" style={{ gap: 8 }}>
              <span className="badge badge-success">
                <Icon name="check" size={12} /> Arquivado
              </span>
              <button className="btn btn-primary btn-sm">
                <Icon name="download" size={14} /> Baixar
              </button>
            </div>
          </div>
        ))}
        {!archivedDocs.length && (
          <div
            className="card muted small"
            style={{ textAlign: 'center', padding: 20 }}
          >
            Nenhum documento arquivado ainda.
          </div>
        )}
      </div>
    </>
  );
}