import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { Icon } from '../../lib/icons';
import { Avatar } from '../../components/Shared';

export default function Review() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { apptById, doctorById, patchAppointment, addReview } = useApp();
  const { toast } = useToast();

  const a = apptById(Number(id));
  const doc = a ? doctorById(a.doctorId) : null;

  const [stars, setStars] = useState(0);
  const [text, setText] = useState('');

  if (!a || !doc) return <div className="card">Consulta não encontrada.</div>;

  const onSend = () => {
    const chosen = stars || 5;
    addReview(doc.id, chosen, text);
    patchAppointment(a.id, { reviewed: true });
    toast('Obrigado pela sua avaliação!', 'star', 'var(--c400)');
    navigate('/patient/history');
  };

  return (
    <div style={{ maxWidth: 440, margin: '10px auto 0' }}>
      <button className="btn-ghost btn-sm" onClick={() => navigate('/patient/history')}>
        <Icon name="arrowLeft" /> Voltar
      </button>
      <div className="card card-hero" style={{ textAlign: 'center', marginTop: 14 }}>
        <div style={{ margin: '0 auto 14px' }}>
          <Avatar name={doc.name} size={56} />
        </div>
        <div style={{ fontSize: 17, fontWeight: 600 }}>Como foi sua consulta com {doc.name}?</div>
        <div className="stars" style={{ justifyContent: 'center', margin: '18px 0' }}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              className={`star-btn ${stars >= n ? 'active' : ''}`}
              onClick={() => setStars(n)}
            >
              <Icon name="star" size={30} />
            </button>
          ))}
        </div>
        <textarea
          className="input"
          placeholder="Conte um pouco mais sobre sua experiência (opcional)"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button className="btn btn-primary btn-block" style={{ marginTop: 16 }} onClick={onSend}>
          Enviar avaliação
        </button>
      </div>
    </div>
  );
}