import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { Icon } from '../../lib/icons';
import { Avatar } from '../../components/Shared';
import { fmtDateFull, fmtDateFullLong } from '../../lib/utils';

export default function History() {
  const navigate = useNavigate();
  const { appointments, doctorById, specialtyById } = useApp();
  const { toast } = useToast();

  const [openSummary, setOpenSummary] = useState(null);
  const [openDocs, setOpenDocs] = useState({});

  // documentos vindos das consultas (arquivados)
  const archivedDocs = appointments
    .filter((a) => a.documents?.length)
    .flatMap((a) =>
      a.documents.map((d) => ({
        ...d,
        apptDate: a.date,
        apptId: a.id,
      })),
    );

  // documentos a arquivar (uploads recentes do paciente — mock)
  const [pendingDocs, setPendingDocs] = useState([
    {
      id: 1,
      name: 'Exame de sangue — Laboratório Vida',
      type: 'Exame',
      from: 'Paciente',
      date: new Date().toISOString().slice(0, 10),
    },
  ]);

  const past = appointments
    .filter((a) => a.status === 'concluida')
    .sort((a, b) => b.date.localeCompare(a.date));

  const toggleSummary = (id) => {
    setOpenSummary((cur) => (cur === id ? null : id));
    setOpenDocs((cur) => ({ ...cur, [id]: false }));
  };

  const toggleDocs = (id, e) => {
    e.stopPropagation();
    setOpenDocs((cur) => ({ ...cur, [id]: !cur[id] }));
  };

  const handleUpload = () => {
    setPendingDocs((p) => [
      {
        id: Date.now(),
        name: 'Novo documento enviado',
        type: 'Documento',
        from: 'Paciente',
        date: new Date().toISOString().slice(0, 10),
      },
      ...p,
    ]);
    toast('Documento enviado ao seu médico.', 'upload', 'var(--success)');
  };

  return (
    <>
      <button
        className="btn-ghost btn-sm"
        style={{ marginBottom: 8 }}
        onClick={() => navigate('/patient/dashboard')}
      >
        <Icon name="arrowLeft" /> Início
      </button>
      <h1 className="page-title">Histórico e documentos</h1>
      <div className="page-sub">
        Consultas, resumos e todos os seus documentos em um só lugar.
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
          const doc = doctorById(a.doctorId);
          const isOpen = openSummary === a.id;
          const docsOpen = !!openDocs[a.id];
          const docs = a.documents || [];

          return (
            <div
              key={a.id}
              className="card"
              style={{ padding: 0, overflow: 'hidden' }}
            >
              {/* HEADER */}
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
                  <Avatar name={doc.name} size={40} fontSize={13} />
                  <div>
                    <div style={{ fontWeight: 500 }}>{doc.name}</div>
                    <div className="small muted">
                      {specialtyById(doc.specialty).name} · {fmtDateFull(a.date)} ·{' '}
                      {a.time}
                    </div>
                  </div>
                </div>

                <div className="flex-center" style={{ gap: 8 }}>
                  {a.hasSummary && (
                    <span className="badge badge-info">
                      <Icon name="sparkle" size={12} /> Resumo
                    </span>
                  )}
                  {docs.length > 0 && (
                    <span className="badge badge-success">
                      <Icon name="file" size={12} /> {docs.length} laudo
                      {docs.length > 1 ? 's' : ''}
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

              {/* BODY */}
              {isOpen && (
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

                  {a.hasSummary && a.summary ? (
                    <>
                      <div
                        className="badge badge-info"
                        style={{ marginTop: 10, marginBottom: 14 }}
                      >
                        <Icon name="sparkle" size={12} /> Resumo gerado por IA
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 14,
                        }}
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
                    </>
                  ) : (
                    <div className="small muted" style={{ marginTop: 16 }}>
                      Nenhum resumo registrado para esta consulta.
                    </div>
                  )}

                  {docs.length > 0 && (
                    <div style={{ marginTop: 22 }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={(e) => toggleDocs(a.id, e)}
                        style={{
                          width: '100%',
                          justifyContent: 'space-between',
                        }}
                      >
                        <span className="flex-center" style={{ gap: 8 }}>
                          <Icon name="file" size={14} /> Laudos desta consulta (
                          {docs.length})
                        </span>
                        <Icon
                          name="chevronRight"
                          size={16}
                          style={{
                            transform: docsOpen
                              ? 'rotate(90deg)'
                              : 'rotate(0deg)',
                            transition: 'transform .2s',
                          }}
                        />
                      </button>

                      {docsOpen && (
                        <div
                          className="fade-in"
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 10,
                            marginTop: 12,
                          }}
                        >
                          {docs.map((d, i) => (
                            <div
                              key={i}
                              className="card row-between"
                              style={{
                                borderLeft: '4px solid var(--c500)',
                                background: 'rgba(0,159,255,0.05)',
                                padding: 14,
                              }}
                            >
                              <div className="flex-center">
                                <div
                                  style={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: 10,
                                    background: 'var(--c600)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#fff',
                                  }}
                                >
                                  <Icon name="file" size={18} />
                                </div>
                                <div>
                                  <div
                                    style={{
                                      fontWeight: 600,
                                      fontSize: 13.5,
                                      color: 'var(--g50)',
                                    }}
                                  >
                                    {d.name}
                                  </div>
                                  <div className="small muted">
                                    {d.type} · Enviado por {d.from}
                                  </div>
                                </div>
                              </div>
                              <button className="btn btn-primary btn-sm">
                                <Icon name="download" size={14} /> Baixar
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {!a.reviewed && (
                    <div
                      style={{
                        display: 'flex',
                        gap: 10,
                        marginTop: 18,
                        flexWrap: 'wrap',
                      }}
                    >
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => navigate(`/patient/review/${a.id}`)}
                      >
                        <Icon name="star" size={14} /> Avaliar médico
                      </button>
                    </div>
                  )}
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
        className="card"
        style={{
          borderStyle: 'dashed',
          textAlign: 'center',
          padding: 24,
          marginBottom: 14,
        }}
      >
        <div style={{ color: 'var(--g500)', marginBottom: 8 }}>
          <Icon name="upload" size={22} />
        </div>
        <div className="small" style={{ marginBottom: 10 }}>
          Envie um documento para o seu médico
        </div>
        <button className="btn btn-secondary btn-sm" onClick={handleUpload}>
          Selecionar arquivo
        </button>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          marginBottom: 32,
        }}
      >
        {pendingDocs.map((d) => (
          <div key={d.id} className="card row-between" style={{ flexWrap: 'wrap', gap: 10 }}>
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
                  {d.type} · {d.from} · {fmtDateFull(d.date)}
                </div>
              </div>
            </div>
            <span className="badge badge-warning">
              <Icon name="clock" size={12} /> Aguardando arquivamento
            </span>
          </div>
        ))}
        {!pendingDocs.length && (
          <div
            className="card muted small"
            style={{ textAlign: 'center', padding: 20 }}
          >
            Nenhum documento pendente.
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
                  {d.type} · Enviado por {d.from} · {fmtDateFull(d.apptDate)}
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