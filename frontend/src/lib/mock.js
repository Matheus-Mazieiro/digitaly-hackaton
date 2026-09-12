import { dateKey } from './utils';

export const TODAY = new Date(2026, 8, 12); // 12/set/2026 — data base da demo

export function addDays(n) {
  const d = new Date(TODAY);
  d.setDate(d.getDate() + n);
  return d;
}

export const SPECIALTIES = [
  { id: 'cardio', name: 'Cardiologia', icon: 'activity' },
  { id: 'derma', name: 'Dermatologia', icon: 'sparkle' },
  { id: 'geral', name: 'Clínica geral', icon: 'shield' },
  { id: 'orto', name: 'Ortopedia', icon: 'activity' },
  { id: 'psiq', name: 'Psiquiatria', icon: 'user' },
  { id: 'pedia', name: 'Pediatria', icon: 'users' },
  { id: 'gineco', name: 'Ginecologia', icon: 'shield' },
];

// slots com chaves pré-computadas para o mock
const k1 = dateKey(addDays(1));
const k2 = dateKey(addDays(2));
const k3 = dateKey(addDays(3));
const k4 = dateKey(addDays(4));
const k0 = dateKey(addDays(0));

export const DOCTORS = [
  { id: 'd1', name: 'Dra. Ana Martins', specialty: 'derma', crm: '112938', crmState: 'SP', rating: 4.9, reviews: 128, bio: 'Especialista em dermatologia clínica e estética, com foco em acompanhamento contínuo.', slots: { [k1]: ['09:00', '09:30', '10:00', '11:30'], [k2]: ['14:00', '15:00'] } },
  { id: 'd2', name: 'Dr. Rafael Costa', specialty: 'cardio', crm: '88213', crmState: 'SP', rating: 4.8, reviews: 94, bio: 'Cardiologista com experiência em prevenção e acompanhamento de hipertensão.', slots: { [k1]: ['08:30', '13:00'], [k3]: ['09:00', '09:30', '10:30'] } },
  { id: 'd3', name: 'Dra. Camila Ferraz', specialty: 'geral', crm: '75410', crmState: 'MG', rating: 4.95, reviews: 203, bio: 'Clínica geral, atendimento humanizado com foco em saúde preventiva.', slots: { [k0]: ['16:00', '16:30', '17:00'], [k1]: ['09:00', '10:00'] } },
  { id: 'd4', name: 'Dr. Bruno Lacerda', specialty: 'orto', crm: '60122', crmState: 'RJ', rating: 4.7, reviews: 61, bio: 'Ortopedista focado em lesões esportivas e reabilitação.', slots: { [k2]: ['11:00', '11:30'], [k4]: ['09:00'] } },
  { id: 'd5', name: 'Dra. Helena Duarte', specialty: 'psiq', crm: '99031', crmState: 'SP', rating: 4.85, reviews: 150, bio: 'Psiquiatra com abordagem integrativa para ansiedade e transtornos do humor.', slots: { [k1]: ['18:00', '18:30'], [k2]: ['08:00', '08:30'] } },
  { id: 'd6', name: 'Dr. Marcos Vidal', specialty: 'pedia', crm: '54098', crmState: 'SP', rating: 4.6, reviews: 47, bio: 'Pediatra dedicado ao acompanhamento do desenvolvimento infantil.', slots: { [k3]: ['10:00', '10:30', '11:00'] } },
];

export const APPOINTMENTS_SEED = [
  {
    id: 1, doctorId: 'd3', date: dateKey(addDays(-6)), time: '10:00', status: 'concluida',
    reason: 'Dor de cabeça recorrente', hasSummary: true, hasReport: true, reviewed: true,
    summary: {
      motivo: 'Dor de cabeça recorrente há duas semanas.',
      pontos: 'Paciente relata dores no período da tarde, sem histórico de enxaqueca. Nega alterações visuais.',
      orientacoes: 'Hidratação adequada, controle de sono e redução de telas antes de dormir.',
      proximos: 'Retorno em 30 dias caso os sintomas persistam.',
    },
    documents: [{ name: 'Receita — Analgésico', type: 'Receita', from: 'Médico' }],
  },
  { id: 2, doctorId: 'd3', date: dateKey(addDays(1)), time: '09:00', status: 'confirmada', reason: 'Consulta de rotina' },
];

export const NOTIFICATIONS_SEED = [
  { id: 3, type: 'alert', text: 'Sua consulta começa em 15 minutos. Prepare-se!', time: 'agora', read: false },
  { id: 1, type: 'doc', text: 'Novo documento recebido de Dra. Camila Ferraz', time: 'há 2 dias', read: true },
  { id: 2, type: 'confirm', text: 'Consulta com Dra. Camila Ferraz confirmada', time: 'há 1 dia', read: true },
];

export const REVIEWS_SEED = { d3: [{ stars: 5, text: 'Atendimento muito atencioso.' }] };

export const TRANSCRIPT_SCRIPT = [
  { who: 'Médico', text: 'Bom dia! Pode me contar o que está sentindo?' },
  { who: 'Paciente', text: 'Bom dia, doutora. Tenho sentido dores de cabeça recorrentes nas últimas semanas.' },
  { who: 'Médico', text: 'Entendo. Com que frequência elas acontecem?' },
  { who: 'Paciente', text: 'Quase todos os dias, geralmente à tarde. Cheguei a tomar um remédio que já tinha em casa.' },
  { who: 'Médico', text: 'Certo, vou anotar isso. Alguma alteração na visão ou náusea junto com a dor?' },
  { who: 'Paciente', text: 'Não, só a dor mesmo, mas atrapalha bastante o trabalho.' },
  { who: 'Médico', text: 'Vamos ajustar sua rotina de sono e hidratação, e acompanhar a evolução.' },
];

export const INSIGHT_TRIGGERS = {
  3: { kind: 'attention', text: 'Paciente relatou sintomas recorrentes nas últimas semanas.' },
  4: { kind: 'info', text: 'Foi mencionada utilização recente de medicamento por conta própria.' },
  6: { kind: 'suggestion', text: 'Considere esclarecer duração, frequência e possíveis gatilhos do sintoma.' },
};