import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { Icon } from '../../lib/icons';
import { Avatar, StatusBadge, BackButton } from '../../components/Shared';
import { fmtDateFullLong } from '../../lib/utils';

export default function ConsultaDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const {
    apptById,
    patientName,
    patchAppointment,
    pushNotification,
    setActiveApptId,
  } = useApp();
  const { toast } = useToast();

  const a = apptById(Number(id));
  if (!a) return <div className="card">Consulta não encontrada.</div>;

  const isFuture = ['agendada', 'confirmada', 'em_andamento'].includes(a.status);
  const isPast = a.status === 'concluida';
  const inProgress = a.status === 'em_andamento';

  const patientDocs = a.patientDocuments || [];
  const doctorDocs = a.documents || [];
  const allDocs = [...doctorDocs, ...patientDocs];

  const startCall = () => {
    setActiveApptId(a.id);
    patchAppointment(a.id, { status: 'em_andamento' });
    pushNotification('Seu médico entrou na sala.', 'started');
    navigate(`/doctor/call?room=${a.id}`);
  };

  const continueCall = () => {
    setActiveApptId(a.id);
    navigate(`/doctor/call?room=${a.id}`);
  };

  const handleDoctorUpload = () => {
    const newDoc = {
      name: 'Documento emitido pelo médico',
      type: 'Laudo',
      from: 'Médico',
      date: new Date().toISOString().slice(0, 10),
    };
    patchAppointment(a.id, (prev) => ({
      documents: [...(prev.documents || []), newDoc],
    }));
    toast('Documento anexado à consulta.', 'upload', 'var(--success)');
  };

  return (
    <>
      <BackButton onClick={() => navigate('/doctor/consultas')} />

      <h1 className="page-title" style={{ fontSize: 24 }}>
        Consulta com {patientName}
      </h1>
      <div className="page-sub">
        {fmtDateFullLong(a.date)} · {a.time} · Sala #{a.id}
      </div>

      <div
        className="card card-hero"
        style={
          isFuture
            ? {
                background:
                  'linear-gradient(135deg, rgba(0,159,255,0.08), rgba(38,42,49,0.6))',
                borderColor: 'var(--celeste-600)',
              }
            : undefined
        }
      >
        <div className="row-between" style={{ flexWrap: 'wrap', gap: 10 }}>
          <div className="flex-center">
            <Avatar name={patientName} size={52} />
            <div>
              <div style={{ fontWeight: 500 }}>{patientName}</div>
              <div className="small muted">27 anos · Particular</div>
            </div>
          </div>
          <StatusBadge status={a.status} />
        </div>

        <hr className="divider" />

        <div className="grid-2">
          <div>
            <div className="small muted">Motivo</div>
            <div style={{ fontWeight: 500 }}>{a.reason || 'Consulta'}</div>
          </div>
          <div>
            <div className="small muted">Pré-consulta</div>
            <div style={{ fontWeight: 500 }}>Sem alergias conhecidas</div>
          </div>
        </div>
      </div>

      {isFuture && (
        <div style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
          {inProgress ? (
            <button className="btn btn-primary" onClick={continueCall}>
              <Icon name="video" /> Continuar teleatendimento
            </button>
          ) : (
            <button className="btn btn-primary" onClick={startCall}>
              <Icon name="video" /> Iniciar teleatendimento
            </button>
          )}
        </div>
      )}

      {isPast && a.hasSummary && a.summary && (
        <div className="card" style={{ marginTop: 20 }}>
          <div className="badge badge-info" style={{ marginBottom: 14 }}>
            <Icon name="sparkle" size={12} /> Resumo gerado por IA
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <div className="section-title">Motivo da consulta</div>
              <div className="small" style={{ color: 'var(--texto-2)', lineHeight: 1.6 }}>
                {a.summary.motivo}
              </div>
            </div>
            <div>
              <div className="section-title">Principais pontos discutidos</div>
              <div className="small" style={{ color: 'var(--texto-2)', lineHeight: 1.6 }}>
                {a.summary.pontos}
              </div>
            </div>
            <div>
              <div className="section-title">Orientações</div>
              <div className="small" style={{ color: 'var(--texto-2)', lineHeight: 1.6 }}>
                {a.summary.orientacoes}
              </div>
            </div>
            <div>
              <div className="section-title">Próximos passos</div>
              <div className="small" style={{ color: 'var(--texto-2)', lineHeight: 1.6 }}>
                {a.summary.proximos}
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={{ marginTop: 24 }}>
        <div
          className="row-between"
          style={{ marginBottom: 14, flexWrap: 'wrap', gap: 10 }}
        >
          <div className="section-title" style={{ margin: 0 }}>
            Documentos e laudos
          </div>
          <button className="btn btn-secondary btn-sm" onClick={handleDoctorUpload}>
            <Icon name="upload" size={14} /> Adicionar documento
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {allDocs.map((d, i) => {
            const fromPatient = d.from === 'Paciente';
            return (
              <div
                key={i}
                className="card row-between"
                style={{
                  borderLeft: `4px solid ${
                    fromPatient ? 'var(--warning)' : 'var(--celeste-500)'
                  }`,
                  background: fromPatient
                    ? 'rgba(245,158,11,0.05)'
                    : 'rgba(0,159,255,0.05)',
                  flexWrap: 'wrap',
                  gap: 10,
                }}
              >
                <div className="flex-center">
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: fromPatient
                        ? 'rgba(245,158,11,0.15)'
                        : 'var(--celeste-500)',
                      color: fromPatient ? '#FBBF24' : '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon name="file" size={18} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: 13.5 }}>
                      {d.name}
                    </div>
                    <div className="small muted">
                      {d.type} · Enviado por {d.from}
                    </div>
                  </div>
                </div>
                <button className="btn btn-secondary btn-sm">
                  <Icon name="download" size={14} /> Baixar
                </button>
              </div>
            );
          })}

          {!allDocs.length && (
            <div
              className="card muted small"
              style={{ textAlign: 'center', padding: 20 }}
            >
              {isFuture
                ? 'Nenhum documento ainda. O paciente pode enviar exames ou encaminhamentos antes da consulta.'
                : 'Nenhum documento nesta consulta.'}
            </div>
          )}
        </div>
      </div>
    </>
  );
}