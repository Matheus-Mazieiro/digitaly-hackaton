import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { Icon } from '../../lib/icons';

export default function Documents() {
  const navigate = useNavigate();
  const { appointments } = useApp();
  const { toast } = useToast();

  const docs = appointments
    .filter((a) => a.documents?.length)
    .flatMap((a) => a.documents.map((d) => ({ ...d, apptDate: a.date })));

  return (
    <>
      <button className="btn-ghost btn-sm" style={{ marginBottom: 8 }} onClick={() => navigate('/patient/dashboard')}>
        <Icon name="arrowLeft" /> Início
      </button>
      <h1 className="page-title">Laudos e documentos</h1>
      <div className="page-sub">Documentos trocados entre você e seus médicos.</div>
      <div className="grid-2" style={{ marginBottom: 24 }}>
        <div className="card" style={{ textAlign: 'center', borderStyle: 'dashed' }}>
          <div style={{ color: 'var(--g500)', marginBottom: 8 }}><Icon name="upload" size={22} /></div>
          <div className="small" style={{ marginBottom: 10 }}>Envie um documento para seu médico</div>
          <button className="btn btn-secondary btn-sm" onClick={() => toast('Documento enviado ao médico.', 'upload', 'var(--success)')}>
            Selecionar arquivo
          </button>
        </div>
        <div className="card">
          <div className="small muted">Total de documentos</div>
          <div className="num" style={{ fontSize: 26, fontWeight: 600, marginTop: 4 }}>{docs.length}</div>
        </div>
      </div>
      <div className="section-title">Laudos e receitas</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {docs.map((d, i) => (
          <div key={i} className="card row-between" style={{ borderLeft: '4px solid var(--c500)', background: 'rgba(0,159,255,0.05)' }}>
            <div className="flex-center">
              <div style={{
                width: 40, height: 40, borderRadius: 10, background: 'var(--c600)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
              }}>
                <Icon name="file" size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--g50)' }}>{d.name}</div>
                <div className="small muted">
                  {d.type} · Enviado por {d.from} · {new Date(d.apptDate + 'T00:00:00').toLocaleDateString('pt-BR')}
                </div>
              </div>
            </div>
            <button className="btn btn-primary btn-sm"><Icon name="download" /> Baixar</button>
          </div>
        ))}
        {!docs.length && (
          <div className="card muted small" style={{ textAlign: 'center', padding: 30 }}>Nenhum documento ainda.</div>
        )}
      </div>
    </>
  );
}