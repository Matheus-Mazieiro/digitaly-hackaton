import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Icon } from '../../lib/icons';
import { Avatar } from '../../components/Shared';

export default function Profile() {
  const navigate = useNavigate();
  const { patientName, logout } = useApp();

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
            <Avatar name={patientName} size={52} />
            <div>
              <div style={{ fontWeight: 600 }}>{patientName}</div>
              <div className="small muted">Paciente</div>
            </div>
          </div>
          <div className="field"><label>Nome</label><input className="input" defaultValue={patientName} /></div>
          <div className="field"><label>E-mail</label><input className="input" defaultValue="nathalia@email.com" /></div>
          <div className="field"><label>Telefone</label><input className="input" defaultValue="(16) 99999-0000" /></div>
          <div className="field"><label>Data de nascimento</label><input className="input" type="date" defaultValue="1999-04-12" /></div>
          <button className="btn btn-secondary btn-sm">Alterar senha</button>
        </div>
        <div className="card">
          <div className="section-title">Preferências</div>
          <div className="row-between" style={{ padding: '10px 0' }}><span className="small">Notificações por e-mail</span><input type="checkbox" defaultChecked /></div>
          <div className="row-between" style={{ padding: '10px 0' }}><span className="small">Notificações em tempo real</span><input type="checkbox" defaultChecked /></div>
          <div className="row-between" style={{ padding: '10px 0' }}><span className="small">Tema escuro</span><input type="checkbox" defaultChecked disabled /></div>
          <hr className="divider" />
          <button className="btn btn-danger btn-sm" onClick={onLogout}>
            <Icon name="logout" /> Sair
          </button>
        </div>
      </div>
    </>
  );
}