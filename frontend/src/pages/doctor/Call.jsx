import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Icon } from '../../lib/icons';
import { Avatar } from '../../components/Shared';
import Modal from '../../components/Modal';
import { initials } from '../../lib/utils';
import { TRANSCRIPT_SCRIPT, INSIGHT_TRIGGERS } from '../../lib/mock';

const INSIGHT_MAP = {
  attention: ['alert', 'Possível ponto de atenção'],
  info: ['info', 'Informação relevante'],
  suggestion: ['sparkle', 'Sugestão'],
};

function InsightCard({ i }) {
  const [icon, label] = INSIGHT_MAP[i.kind];
  return (
    <div className={`insight-card insight-${i.kind}`}>
      <div className="insight-label">
        <Icon name={icon} size={13} /> {label}
      </div>
      {i.text}
    </div>
  );
}

export default function DoctorCall() {
  const navigate = useNavigate();
  const {
    nextPatientAppt, patientName, doctorById, doctorId,
    copilotTab, setCopilotTab, transcript, setTranscript,
    insights, setInsights, patchAppointment, pushNotification,
  } = useApp();
  const [seconds, setSeconds] = useState(0);
  const [confirmEnd, setConfirmEnd] = useState(false);
  const timerRef = useRef(null);
  const scriptRef = useRef(null);

  const a = nextPatientAppt();
  const doc = doctorById(doctorId);
  const otherName = patientName;
  const selfName = doc?.name || '';

  useEffect(() => {
    setTranscript([]);
    setInsights([]);
    timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);

    let i = 0;
    scriptRef.current = setInterval(() => {
      if (i >= TRANSCRIPT_SCRIPT.length) {
        clearInterval(scriptRef.current);
        return;
      }
      setTranscript((prev) => [...prev, TRANSCRIPT_SCRIPT[i]]);
      if (INSIGHT_TRIGGERS[i]) setInsights((prev) => [...prev, INSIGHT_TRIGGERS[i]]);
      i++;
    }, 3200);

    return () => {
      clearInterval(timerRef.current);
      clearInterval(scriptRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const finish = () => {
    clearInterval(timerRef.current);
    clearInterval(scriptRef.current);
    if (a) {
      patchAppointment(a.id, {
        status: 'concluida',
        hasSummary: true,
        hasReport: true,
        reviewed: false,
        summary: {
          motivo: 'Dor de cabeça recorrente relatada nas últimas semanas.',
          pontos: 'Paciente relatou episódios quase diários, predominantemente à tarde, sem alterações visuais ou náusea associadas. Uso recente de analgésico por conta própria.',
          orientacoes: 'Ajustar rotina de sono, manter boa hidratação e reduzir exposição a telas antes de dormir.',
          proximos: 'Reavaliação em 30 dias caso os sintomas persistam ou se intensifiquem.',
        },
        documents: [{ name: 'Receita — Analgésico', type: 'Receita', from: 'Médico' }],
      });
      pushNotification('Sua consulta foi concluída. O resumo já está disponível.', 'report');
    }
    navigate(`/doctor/history/${a?.id ?? ''}`, { replace: true });
  };

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');

  return (
    <div className="call-wrap">
      <div className="call-main">
        <div className="video-stage">
          <div className="call-topinfo glass">
            <Avatar name={otherName} size={22} fontSize={10} />
            <span className="small" style={{ fontWeight: 500 }}>{otherName}</span>
          </div>
          <div className="call-timer glass num">{mm}:{ss}</div>
          <div className="avatar big-avatar speaking-ring">{initials(otherName)}</div>
          <div className="video-thumb">
            <Avatar name={selfName} size={44} />
          </div>
        </div>
        <div className="call-controls glass" style={{ alignSelf: 'center' }}>
          <button className="ctrl-btn active"><Icon name="mic" /></button>
          <button className="ctrl-btn active"><Icon name="video" /></button>
          <button className="ctrl-btn"><Icon name="screen" /></button>
          <button className="ctrl-btn"><Icon name="paperclip" /></button>
          <button className="ctrl-btn"><Icon name="msg" /></button>
          <button className="ctrl-btn end" onClick={() => setConfirmEnd(true)}>
            <Icon name="phoneOff" />
          </button>
        </div>
      </div>

      <div className="copilot-panel card glass" style={{ padding: 0 }}>
        <div className="copilot-head">
          <span style={{ color: 'var(--c400)' }}><Icon name="robot" size={18} /></span>
          <span style={{ fontWeight: 600, fontSize: 14 }}>Copiloto de IA</span>
        </div>
        <div className="copilot-tabs">
          <button className={`copilot-tab ${copilotTab === 'transcript' ? 'active' : ''}`} onClick={() => setCopilotTab('transcript')}>Transcrição</button>
          <button className={`copilot-tab ${copilotTab === 'insights' ? 'active' : ''}`} onClick={() => setCopilotTab('insights')}>Insights</button>
        </div>
        <div className="copilot-body">
          {copilotTab === 'transcript'
            ? (transcript.length
                ? transcript.map((t, i) => (
                    <div key={i} className="transcript-line">
                      <span className="who">{t.who}</span>{t.text}
                    </div>
                  ))
                : <div className="small muted">A transcrição aparecerá aqui conforme a consulta avança.</div>)
            : (insights.length
                ? insights.map((i, k) => <InsightCard key={k} i={i} />)
                : <div className="small muted">Os insights de apoio aparecerão aqui conforme a consulta avança.</div>)}
        </div>
        <div style={{ padding: '10px 18px', borderTop: '1px solid var(--g700)' }} className="small muted">
          <Icon name="info" size={12} style={{ verticalAlign: -2, marginRight: 4 }} />
          Sugestões geradas por IA — não substituem o julgamento clínico.
        </div>
      </div>

      {confirmEnd && (
        <Modal onClose={() => setConfirmEnd(false)}>
          <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 8 }}>Encerrar consulta?</div>
          <div className="small muted" style={{ marginBottom: 20 }}>
            Isso finalizará o atendimento e irá gerar o resumo por IA.
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => setConfirmEnd(false)}>Cancelar</button>
            <button className="btn btn-danger btn-sm" onClick={finish}>Encerrar consulta</button>
          </div>
        </Modal>
      )}
    </div>
  );
}