import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Icon } from '../../lib/icons';
import { Avatar } from '../../components/Shared';
import Modal from '../../components/Modal';
import { initials } from '../../lib/utils';

export default function PatientCall() {
  const navigate = useNavigate();
  const { nextPatientAppt, doctorById, patientName, patchAppointment, pushNotification } = useApp();
  const [seconds, setSeconds] = useState(0);
  const [confirmEnd, setConfirmEnd] = useState(false);
  const timer = useRef(null);

  const a = nextPatientAppt();
  const doc = a ? doctorById(a.doctorId) : null;
  const otherName = doc?.name || '';
  const selfName = patientName;

  useEffect(() => {
    timer.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer.current);
  }, []);

  const finish = () => {
    if (a) {
      patchAppointment(a.id, {
        status: 'concluida',
        hasSummary: true,
        hasReport: true,
        reviewed: false,
        summary: {
          motivo: 'Dor de cabeça recorrente relatada nas últimas semanas.',
          pontos: 'Paciente relatou episódios quase diários, predominantemente à tarde, sem alterações visuais.',
          orientacoes: 'Ajustar rotina de sono, manter boa hidratação e reduzir exposição a telas antes de dormir.',
          proximos: 'Reavaliação em 30 dias caso os sintomas persistam.',
        },
        documents: [{ name: 'Receita — Analgésico', type: 'Receita', from: 'Médico' }],
      });
      pushNotification('Sua consulta foi concluída. O resumo já está disponível.', 'report');
    }
    navigate('/patient/dashboard');
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
      {confirmEnd && (
        <Modal onClose={() => setConfirmEnd(false)}>
          <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 8 }}>Encerrar consulta?</div>
          <div className="small muted" style={{ marginBottom: 20 }}>Isso finalizará o atendimento.</div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => setConfirmEnd(false)}>Cancelar</button>
            <button className="btn btn-danger btn-sm" onClick={finish}>Encerrar consulta</button>
          </div>
        </Modal>
      )}
    </div>
  );
}