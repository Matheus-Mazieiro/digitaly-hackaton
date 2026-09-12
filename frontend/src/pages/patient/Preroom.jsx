import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Icon } from '../../lib/icons';
import { Avatar } from '../../components/Shared';

function apptDateLabel(a) {
  const d = new Date(a.date + 'T00:00:00');
  return `${d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} · ${a.time}`;
}

export default function Preroom() {
  const navigate = useNavigate();
  const { nextPatientAppt, doctorById, specialtyById, patientName } = useApp();
  const [mic, setMic] = useState(true);
  const [cam, setCam] = useState(true);
  const a = nextPatientAppt();

  if (!a) return <div className="card">Nenhuma consulta em andamento.</div>;

  const doc = doctorById(a.doctorId);
  const spec = specialtyById(doc.specialty);
  const canEnter = a.status === 'em_andamento';

  return (
    <div style={{ maxWidth: 520, margin: '10px auto 0', textAlign: 'center' }}>
      <h1 className="page-title" style={{ fontSize: 22 }}>Prepare-se para sua consulta</h1>
      <div className="page-sub">Quando estiver pronto, entre na sala para iniciar seu atendimento.</div>
      <div className="card card-hero" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{
          height: 220, background: 'linear-gradient(160deg,#141821,#0B0D10)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div className="avatar big-avatar">{patientName.split(' ').map((w) => w[0]).slice(0, 2).join('')}</div>
        </div>
        <div style={{ padding: 18 }}>
          <div className="row-between">
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 600 }}>{doc.name}</div>
              <div className="small muted">{spec.name} · {apptDateLabel(a)}</div>
            </div>
            {canEnter
              ? <span className="badge badge-success"><Icon name="check" size={12} /> Sala aberta</span>
              : <span className="badge badge-warning"><Icon name="clock" size={12} /> Aguardando médico</span>}
          </div>
          <hr className="divider" />
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
            <button className={`ctrl-btn ${mic ? 'active' : ''}`} onClick={() => setMic((v) => !v)}>
              <Icon name="mic" />
            </button>
            <button className={`ctrl-btn ${cam ? 'active' : ''}`} onClick={() => setCam((v) => !v)}>
              <Icon name="video" />
            </button>
          </div>
        </div>
      </div>
      <button
        className="btn btn-primary btn-block"
        style={{ marginTop: 20 }}
        disabled={!canEnter}
        onClick={() => navigate('/patient/call')}
      >
        <Icon name="video" /> Entrar na consulta
      </button>
      {!canEnter && <div className="small muted" style={{ marginTop: 10 }}>Você poderá entrar assim que o médico iniciar o atendimento.</div>}
    </div>
  );
}