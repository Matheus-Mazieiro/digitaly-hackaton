import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { Icon } from '../../lib/icons';
import { Logo, BackButton } from '../../components/Shared';
import { SPECIALTIES } from '../../lib/mock';
import { authApi } from '../../services/authMock';

/* ---------- LOGIN ---------- */
export function Login() {
  const navigate = useNavigate();
  const { setPendingRole } = useApp();
  const { toast } = useToast();

  const [role, setRole] = useState('patient');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  const onLogin = async () => {
    if (!email || !senha) return toast('Preencha todos os campos.', 'alert', 'var(--warning)');

    setLoading(true);
    try {
      await authApi.login({ email, senha });
      setPendingRole(role);
      navigate('/2fa', { state: { email } });
    } catch (err) {
      toast('Erro ao fazer login. Verifique suas credenciais.', 'alert', 'var(--danger)');
    } finally {
      setLoading(false);
    }
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
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={role === 'doctor' ? 'Ex: doutora@clinica.com' : 'Ex: nathalia@email.com'}
          />
        </div>
        <div className="field">
          <label>Senha</label>
          <input
            className="input"
            type="password"
            placeholder="••••••••"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
        </div>
        <button
          className="btn btn-primary btn-block"
          style={{ marginTop: 6 }}
          onClick={onLogin}
          disabled={loading}
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>

        <div className="row-between" style={{ marginTop: 16 }}>
          <a
            className="small muted"
            style={{ cursor: 'pointer' }}
            onClick={() => toast('Link de redefinição enviado para seu e-mail.', 'check', 'var(--success)')}
          >
            Esqueci minha senha
          </a>
          <a
            className="small"
            style={{ color: 'var(--celeste-400)', fontWeight: 500, cursor: 'pointer' }}
            onClick={() => navigate(role === 'doctor' ? '/signup/doctor' : '/signup/patient')}
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
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    nome: '', cpf: '', data_nascimento: '', email: '', senha: ''
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onConfirm = async () => {
    const cpfRegex = /^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/;

    if (!form.nome || !form.cpf || !form.email || !form.senha) {
      return toast('Preencha os campos obrigatórios.', 'alert', 'var(--warning)');
    }
    if (!cpfRegex.test(form.cpf)) {
      return toast('CPF inválido. Utilize o formato 000.000.000-00 ou apenas números.', 'alert', 'var(--danger)');
    }

    setLoading(true);
    try {
      await authApi.register(form);
      setPendingRole('patient');
      navigate('/2fa', { state: { email: form.email } });
    } catch (err) {
      toast('Erro ao criar conta.', 'alert', 'var(--danger)');
    } finally {
      setLoading(false);
    }
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
            <input className="input" name="nome" placeholder="Ex: Nathalia Souza" value={form.nome} onChange={handleChange} />
          </div>
          <div className="field">
            <label>CPF</label>
            <input className="input" name="cpf" placeholder="Ex: 123.456.789-00" value={form.cpf} onChange={handleChange} />
          </div>
          <div className="field">
            <label>Data de nascimento</label>
            <input className="input" type="date" name="data_nascimento" value={form.data_nascimento} onChange={handleChange} />
          </div>
          <div className="field">
            <label>Telefone</label>
            <input className="input" placeholder="Ex: (16) 99999-0000" />
          </div>
          <div className="field">
            <label>E-mail</label>
            <input className="input" type="email" name="email" placeholder="Ex: nathalia@email.com" value={form.email} onChange={handleChange} />
          </div>
          <div className="field" />
          <div className="field">
            <label>Senha</label>
            <input className="input" type="password" name="senha" placeholder="••••••••" value={form.senha} onChange={handleChange} />
          </div>
          <div className="field">
            <label>Confirmar senha</label>
            <input className="input" type="password" placeholder="••••••••" />
          </div>
        </div>

        <button
          className="btn btn-primary btn-block"
          style={{ marginTop: 8 }}
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? 'Criando...' : 'Criar conta'}
        </button>
      </div>
    </div>
  );
}

/* ---------- SIGNUP DOCTOR ---------- */
export function SignupDoctor() {
  const navigate = useNavigate();
  const { setPendingRole } = useApp();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    nome: '', cpf: '', data_nascimento: '', email: '', senha: '',
    especialidade: SPECIALTIES[0].name, CRM: '', estado_crm: 'SP'
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onConfirm = async () => {
    const cpfRegex = /^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/;

    if (!form.nome || !form.cpf || !form.email || !form.senha || !form.CRM) {
      return toast('Preencha os campos obrigatórios.', 'alert', 'var(--warning)');
    }
    if (!cpfRegex.test(form.cpf)) {
      return toast('CPF inválido. Utilize o formato 000.000.000-00 ou apenas números.', 'alert', 'var(--danger)');
    }
    if (!/^\d{4,8}$/.test(form.CRM)) {
      return toast('CRM inválido. Digite apenas números (4 a 8 dígitos).', 'alert', 'var(--danger)');
    }

    setLoading(true);
    try {
      await authApi.register(form);
      setPendingRole('doctor');
      navigate('/2fa', { state: { email: form.email } });
    } catch (err) {
      toast('Erro ao criar conta.', 'alert', 'var(--danger)');
    } finally {
      setLoading(false);
    }
  };

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
          Validaremos seu registro profissional no cadastro.
        </div>

        <div className="grid-2">
          <div className="field">
            <label>Nome completo</label>
            <input className="input" name="nome" placeholder="Ex: Dra. Camila Ferraz" value={form.nome} onChange={handleChange} />
          </div>
          <div className="field">
            <label>CPF</label>
            <input className="input" name="cpf" placeholder="Ex: 123.456.789-00" value={form.cpf} onChange={handleChange} />
          </div>
          <div className="field">
            <label>E-mail</label>
            <input className="input" type="email" name="email" placeholder="Ex: camila@clinica.com" value={form.email} onChange={handleChange} />
          </div>
          <div className="field">
            <label>Data de Nascimento</label>
            <input className="input" type="date" name="data_nascimento" value={form.data_nascimento} onChange={handleChange} />
          </div>
          <div className="field">
            <label>CRM</label>
            <input className="input" name="CRM" placeholder="Ex: 123456" value={form.CRM} onChange={handleChange} />
          </div>
          <div className="field">
            <label>Estado do CRM</label>
            <select className="input" name="estado_crm" value={form.estado_crm} onChange={handleChange}>
              <option value="SP">SP</option>
              <option value="MG">MG</option>
              <option value="RJ">RJ</option>
            </select>
          </div>
          <div className="field" style={{ gridColumn: '1/-1' }}>
            <label>Especialidade</label>
            <select className="input" name="especialidade" value={form.especialidade} onChange={handleChange}>
              {SPECIALTIES.map((s) => (
                <option key={s.id} value={s.name}>{s.name}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Senha</label>
            <input className="input" type="password" name="senha" placeholder="••••••••" value={form.senha} onChange={handleChange} />
          </div>
          <div className="field">
            <label>Confirmar senha</label>
            <input className="input" type="password" placeholder="••••••••" />
          </div>
        </div>

        <button
          className="btn btn-primary btn-block"
          style={{ marginTop: 8 }}
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? 'Criando...' : 'Criar conta'}
        </button>
      </div>
    </div>
  );
}

/* ---------- TWO-FA ---------- */
export function TwoFA() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setRole, pendingRole } = useApp();
  const { toast } = useToast();

  const userEmail = location.state?.email;
  const [values, setValues] = useState(['', '', '', '', '', '']);
  const [counter, setCounter] = useState(30);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userEmail) navigate('/login', { replace: true });
  }, [userEmail, navigate]);

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

  const onConfirm = async () => {
    const codigo = values.join('');
    if (codigo.length < 6) return toast('Digite os 6 dígitos.', 'alert', 'var(--warning)');

    setLoading(true);
    try {
      await authApi.verify2FA({ email: userEmail, codigo });

      const r = pendingRole || 'patient';
      setRole(r);
      navigate(r === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard', {
        replace: true,
      });
      toast('Acesso verificado com sucesso.', 'check', 'var(--success)');
    } catch (error) {
      toast('Código inválido ou expirado.', 'alert', 'var(--danger)');
      setValues(['', '', '', '', '', '']);
      document.querySelectorAll('.codeDigit')[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const onResend = () => {
    setCounter(30);
    toast('Novo código enviado.', 'check', 'var(--success)');
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
          Enviamos um código de 6 dígitos para <br /><strong>{userEmail}</strong>.
        </div>
        <div className="code-inputs" style={{ marginTop: 16 }}>
          {values.map((v, i) => (
            <input
              key={i}
              maxLength={1}
              className="code-box codeDigit"
              value={v}
              onChange={(e) => onInput(i, e.target.value)}
              disabled={loading}
              placeholder="0"
            />
          ))}
        </div>
        <div className="small muted" style={{ marginTop: 16 }}>
          {counter > 0 ? (
            <>
              Reenviar em <span className="num">{counter}</span>s
            </>
          ) : (
            <a
              style={{ color: 'var(--celeste-400)', fontWeight: 500, cursor: 'pointer' }}
              onClick={onResend}
            >
              Reenviar código
            </a>
          )}
        </div>
        <button
          className="btn btn-primary btn-block"
          style={{ marginTop: 18 }}
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? 'Verificando...' : 'Confirmar código'}
        </button>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12 }}>
          <BackButton label="Voltar ao Login" onClick={() => navigate('/login')} style={{ marginBottom: 0 }} />
        </div>
      </div>
    </div>
  );
}