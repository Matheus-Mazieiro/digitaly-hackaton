import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// import { useApp } from '../../context/AppContext'; // Removido para usar chamadas reais
import { Icon } from '../../lib/icons';
import { Avatar, StatusBadge } from '../../components/Shared';
import { fmtDateFull, extractTime, appointmentAccessInfoNova } from '../../lib/utils';
import { api } from '../../services/apiMock';

export default function Appointments() {
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [apptTab, setApptTab] = useState('proximas');

  const loggedUserId = 'p1';

  useEffect(() => {
    async function fetchConsultas() {
      setLoading(true);
      try {
        const data = await api.getConsultasPaciente(loggedUserId);
        setAppointments(data);
      } catch (error) {
        console.error("Erro ao carregar consultas:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchConsultas();
  }, [loggedUserId]);

  // Lógica de separação por status
  const upcoming = appointments.filter((a) =>
    ['agendada', 'confirmada', 'em_andamento'].includes(a.status)
  );
  const past = appointments.filter((a) =>
    ['concluida', 'cancelada'].includes(a.status)
  );
  const list = apptTab === 'proximas' ? upcoming : past;

  return (
    <>
      <h1 className="page-title">Minhas consultas</h1>
      <div className="page-sub">
        Acompanhe suas consultas futuras e anteriores.
      </div>

      <div className="role-toggle" style={{ maxWidth: 280, marginBottom: 20 }}>
        <button
          className={apptTab === 'proximas' ? 'active' : ''}
          onClick={() => setApptTab('proximas')}
        >
          Próximas
        </button>
        <button
          className={apptTab === 'anteriores' ? 'active' : ''}
          onClick={() => setApptTab('anteriores')}
        >
          Anteriores
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {loading ? (
          // Placeholder de loading super simples
          <div className="card muted small" style={{ textAlign: 'center', padding: 30 }}>
            Carregando consultas...
          </div>
        ) : list.map((a) => {
          // Os dados do médico agora vêm aninhados (padrão de API REST bem feita)
          const doc = a.medicoDetalhes;
          const { canJoin } = appointmentAccessInfoNova(a);

          return (
            <div
              key={a.id}
              className="card row-between"
              style={{ flexWrap: 'wrap', gap: 14 }}
            >
              <div className="flex-center">
                <Avatar name={doc.nome} size={44} />
                <div>
                  <div style={{ fontWeight: 500 }}>{doc.nome}</div>
                  <div className="small muted">
                    {/* A especialidade já é string na nova entidade */}
                    {doc.especialidade} · {fmtDateFull(a.hora)} ·{' '}
                    {extractTime(a.hora)}
                  </div>
                </div>
              </div>
              <div className="flex-center">
                <StatusBadge status={a.status} />
                {canJoin && (
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => navigate(`/patient/preroom/${a.id}`)}
                  >
                    <Icon name="video" /> Entrar
                  </button>
                )}
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => navigate(`/patient/appointments/${a.id}`)}
                >
                  Detalhes
                </button>
              </div>
            </div>
          );
        })}

        {!loading && list.length === 0 && (
          <div
            className="card muted small"
            style={{ textAlign: 'center', padding: 30 }}
          >
            Nenhuma consulta encontrada.
          </div>
        )}
      </div>
    </>
  );
}