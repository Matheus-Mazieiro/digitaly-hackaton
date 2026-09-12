import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { Icon } from '../../lib/icons';
import { Logo, BackButton } from '../../components/Shared';
import { SPECIALTIES } from '../../lib/mock';

/* ---------- LOGIN ---------- */
export function Login() {
  const navigate = useNavigate();
  const { setPendingRole } = useApp();
  const { toast } = useToast();
  const [role, setRole] = useState('patient');

  const onLogin = () => {
    setPendingRole(role);
    navigate('/2fa');
  };

  return (
    <div className="auth-screen fade-in">
      <div className="auth-card card glass card-hero">
        <div className="auth-logo">
          <Logo height={40} />
          <div className="auth-tagline">Teleconsulta simples e segura</div>
        </div>

        <div className="role-toggle">
          <button
            className={role === 'patient' ? 'active' : ''}
            onClick={() => setRole('patient')}
          >
            Paciente
          </button>
          <button
            className={role === 'doctor' ? 'active' : ''}
            onClick={() => setRole('doctor')}
          >
            Médico
          </button>
        </div>

        <div className="field">
          <label>E-mail</label>
          <input
            className="input"
            type="email"
            defaultValue={
              role === 'doctor'
                ? 'camila.ferraz@digitalyhub.com'
                : 'nathalia@email.com'
            }
          />
        </div>
        <div className="field">
          <label>Senha</label>
          <input className="input" type="password" defaultValue="123456" />
        </div>
        <button
          className="btn btn-primary btn-block"
          style={{ marginTop: 6 }}
          onClick={onLogin}
        >
          Entrar
        </button>

        <div className="row-between" style={{ marginTop: 16 }}>
          <a
            className="small muted"
            style={{ cursor: 'pointer' }}
            onClick={() =>
              toast(
                'Link de redefinição enviado para seu e-mail.',
                'check',
                'var(--success)',
              )
            }
          >
            Esqueci minha senha
          </a>
          <a
            className="small"
            style={{ color: 'var(--celeste-400)', fontWeight: 500, cursor: 'pointer' }}
            onClick={() =>
              navigate(role === 'doctor' ? '/signup/doctor' : '/signup/patient')
            }
          >
            Criar conta
          </a>
        </div>
      </div>
    </div>
  );
}

/* ---------- SIGNUP PATIENT ---------- */
export function SignupPatient() {
  const navigate = useNavigate();
  const { setPendingRole } = useApp();

  const onConfirm = () => {
    setPendingRole('patient');
    navigate('/2fa');
  };

  return (
    <div className="auth-screen fade-in">
      <div className="auth-card card glass card-hero" style={{ maxWidth: 440 }}>
        <BackButton label="Login" onClick={() => navigate('/login')} />

        <div className="auth-logo" style={{ marginBottom: 18 }}>
          <Logo height={32} />
        </div>

        <div style={{ fontSize: 20, fontWeight: 500, marginBottom: 4 }}>
          Criar conta de paciente
        </div>
        <div className="small muted" style={{ marginBottom: 20 }}>
          Leva menos de um minuto.
        </div>

        <div className="grid-2">
          <div className="field">
            <label>Nome completo</label>
            <input className="input" defaultValue="Nathalia Souza" />
          </div>
          <div className="field">
            <label>CPF</label>
            <input className="input" defaultValue="000.000.000-00" />
          </div>
          <div className="field">
            <label>Data de nascimento</label>
            <input className="input" type="date" defaultValue="1999-04-12" />
          </div>
          <div className="field">
            <label>Telefone</label>
            <input className="input" defaultValue="(16) 99999-0000" />
          </div>
          <div className="field">
            <label>E-mail</label>
            <input className="input" defaultValue="nathalia@email.com" />
          </div>
          <div className="field" />
          <div className="field">
            <label>Senha</label>
            <input className="input" type="password" defaultValue="123456" />
          </div>
          <div className="field">
            <label>Confirmar senha</label>
            <input className="input" type="password" defaultValue="123456" />
          </div>
        </div>

        <button
          className="btn btn-primary btn-block"
          style={{ marginTop: 8 }}
          onClick={onConfirm}
        >
          Criar conta
        </button>
      </div>
    </div>
  );
}

/* ---------- SIGNUP DOCTOR ---------- */
export function SignupDoctor() {
  const navigate = useNavigate();
  return (
    <div className="auth-screen fade-in">
      <div className="auth-card card glass card-hero" style={{ maxWidth: 460 }}>
        <BackButton label="Login" onClick={() => navigate('/login')} />

        <div className="auth-logo" style={{ marginBottom: 18 }}>
          <Logo height={32} />
        </div>

        <div style={{ fontSize: 20, fontWeight: 500, marginBottom: 4 }}>
          Criar conta de médico
        </div>
        <div className="small muted" style={{ marginBottom: 20 }}>
          Validaremos seu registro profissional após o cadastro.
        </div>

        <div className="grid-2">
          <div className="field">
            <label>Nome completo</label>
            <input className="input" defaultValue="Dra. Camila Ferraz" />
          </div>
          <div className="field">
            <label>CPF</label>
            <input className="input" defaultValue="000.000.000-00" />
          </div>
          <div className="field">
            <label>E-mail</label>
            <input className="input" defaultValue="camila.ferraz@digitalyhub.com" />
          </div>
          <div className="field">
            <label>Telefone</label>
            <input className="input" defaultValue="(16) 98888-0000" />
          </div>
          <div className="field">
            <label>CRM</label>
            <input className="input" defaultValue="75410" />
          </div>
          <div className="field">
            <label>Estado do CRM</label>
            <select className="input">
              <option>MG</option>
              <option>SP</option>
              <option>RJ</option>
            </select>
          </div>
          <div className="field" style={{ gridColumn: '1/-1' }}>
            <label>Especialidade</label>
            <select className="input">
              {SPECIALTIES.map((s) => (
                <option key={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Senha</label>
            <input className="input" type="password" defaultValue="123456" />
          </div>
          <div className="field">
            <label>Confirmar senha</label>
            <input className="input" type="password" defaultValue="123456" />
          </div>
        </div>

        <button
          className="btn btn-primary btn-block"
          style={{ marginTop: 8 }}
          onClick={() => navigate('/crm-validating')}
        >
          Criar conta
        </button>
      </div>
    </div>
  );
}

/* ---------- CRM VALIDATING ---------- */
export function CrmValidating() {
  const navigate = useNavigate();
  const { setPendingRole } = useApp();

  useEffect(() => {
    const t = setTimeout(() => {
      setPendingRole('doctor');
      navigate('/2fa', { replace: true });
    }, 1800);
    return () => clearTimeout(t);
  }, [navigate, setPendingRole]);

  return (
    <div className="auth-screen fade-in">
      <div className="auth-card" style={{ textAlign: 'center' }}>
        <div className="auth-logo" style={{ marginBottom: 28 }}>
          <Logo height={36} />
        </div>

        <div
          style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'var(--bg-elev-2)', border: '1px solid var(--borda)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
          }}
        >
          <div
            className="spin"
            style={{
              width: 26, height: 26,
              border: '3px solid var(--grafite-600)',
              borderTopColor: 'var(--celeste-500)',
              borderRadius: '50%',
            }}
          />
        </div>
        <div style={{ fontSize: 17, fontWeight: 500, marginBottom: 6 }}>
          Validando registro profissional
        </div>
        <div className="small muted">
          Estamos confirmando seu CRM. Isso leva poucos instantes.
        </div>
      </div>
    </div>
  );
}

/* ---------- TWO-FA ---------- */
export function TwoFA() {
  const navigate = useNavigate();
  const { setRole, pendingRole } = useApp();
  const { toast } = useToast();
  const [values, setValues] = useState(['1', '2', '3', '4', '5', '6']);
  const [counter, setCounter] = useState(30);

  useEffect(() => {
    if (counter <= 0) return;
    const t = setInterval(() => setCounter((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [counter]);

  const onInput = (i, v) => {
    const next = [...values];
    next[i] = v.slice(0, 1);
    setValues(next);
    if (v && i < 5) document.querySelectorAll('.codeDigit')[i + 1]?.focus();
  };

  const onConfirm = () => {
    const r = pendingRole || 'patient';
    setRole(r);
    navigate(r === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard', {
      replace: true,
    });
    toast('Acesso verificado com sucesso.', 'check', 'var(--success)');
  };

  return (
    <div className="auth-screen fade-in">
      <div className="auth-card card glass card-hero" style={{ textAlign: 'center' }}>
        <div className="auth-logo" style={{ marginBottom: 22 }}>
          <Logo height={32} />
        </div>

        <div
          style={{
            width: 52, height: 52, borderRadius: 16,
            background: 'rgba(0,159,255,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 18px', color: 'var(--celeste-400)',
          }}
        >
          <Icon name="shield" size={24} />
        </div>
        <div style={{ fontSize: 18, fontWeight: 500 }}>Verifique seu acesso</div>
        <div className="small muted" style={{ marginTop: 6 }}>
          Enviamos um código de 6 dígitos para o seu e-mail.
        </div>
        <div className="code-inputs">
          {values.map((v, i) => (
            <input
              key={i}
              maxLength={1}
              className="code-box codeDigit"
              value={v}
              onChange={(e) => onInput(i, e.target.value)}
            />
          ))}
        </div>
        <div className="small muted">
          {counter > 0 ? (
            <>
              Reenviar em <span className="num">{counter}</span>s
            </>
          ) : (
            <a
              style={{ color: 'var(--celeste-400)', fontWeight: 500, cursor: 'pointer' }}
              onClick={() => {
                setCounter(30);
                toast('Novo código enviado.', 'check', 'var(--success)');
              }}
            >
              Reenviar código
            </a>
          )}
        </div>
        <button
          className="btn btn-primary btn-block"
          style={{ marginTop: 18 }}
          onClick={onConfirm}
        >
          Confirmar código
        </button>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12 }}>
          <BackButton label="Login" onClick={() => navigate('/login')} style={{ marginBottom: 0 }} />
        </div>
      </div>
    </div>
  );
}