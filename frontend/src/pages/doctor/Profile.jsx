import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Icon } from '../../lib/icons';
import { Avatar } from '../../components/Shared';

export default function DoctorProfile() {
  const navigate = useNavigate();
  const { user, specialtyById, logout } = useApp();

  const onLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <>
      <h1 className="page-title">Perfil e configurações</h1>
      <div className="grid-2">
        <div className="card">
          <div className="flex-center" style={{ marginBottom: 18 }}>
            <Avatar name={user?.nome || ''} size={52} />
            <div>
              <div style={{ fontWeight: 600 }}>{user?.nome || ''}</div>
              <span className="badge badge-success"><Icon name="check" size={12} /> CRM verificado</span>
            </div>
          </div>
          <div className="field"><label>Nome</label><input className="input" defaultValue={user?.nome || ''} /></div>
          <div className="field"><label>E-mail</label><input className="input" defaultValue={user?.email || ''} /></div>
          <div className="field"><label>Especialidade</label><input className="input" defaultValue={specialtyById(user?.especialidade)?.name || ''} /></div>
          <div className="grid-2">
            <div className="field"><label>CRM</label><input className="input" defaultValue={user?.crm || ''} /></div>
            <div className="field"><label>Estado</label><input className="input" defaultValue={user?.crmState || ''} /></div>
          </div>
        </div>
        <div className="card">
          <div className="section-title">Biografia profissional</div>
          <textarea className="input" style={{ minHeight: 100 }} defaultValue={user?.biografia || ''} />
          <div className="section-title" style={{ marginTop: 18 }}>Configuração de horários</div>
          <div className="small muted">Disponibilidade padrão: seg–sex, 08h–16h30.</div>
          <hr className="divider" />
          <button className="btn btn-danger btn-sm" onClick={onLogout}>
            <Icon name="logout" /> Sair
          </button>
        </div>
      </div>
    </>
  );
}
