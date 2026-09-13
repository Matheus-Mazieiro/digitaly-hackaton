// src/services/apiMock.js

// 1. Entidades Baseadas no seu Modelo
const pacientes = [
    {
        id: 'p1',
        nome: 'João da Silva',
        email: 'joao@email.com',
        telefone: '11999999999',
        nascimento: '1990-05-15',
        cpf: '111.111.111-11',
        senha: 'hashed_password'
    }
];

const medicos = [
    {
        id: 'm1',
        nome: 'Dra. Ana Martins',
        email: 'ana@clinica.com',
        telefone: '11888888888',
        nascimento: '1985-02-20',
        cpf: '222.222.222-22',
        crm: '112938-SP',
        biografia: 'Especialista em dermatologia clínica e estética.',
        avaliacao_soma: 245,
        n_consultas: 50,
        especialidade: 'Dermatologia',
        senha: 'hashed_password'
    },
    {
        id: 'm2',
        nome: 'Dr. Rafael Costa',
        email: 'rafael@clinica.com',
        telefone: '11777777777',
        nascimento: '1980-10-10',
        cpf: '333.333.333-33',
        crm: '88213-SP',
        biografia: 'Cardiologista com experiência em prevenção.',
        avaliacao_soma: 480,
        n_consultas: 100,
        especialidade: 'Cardiologia',
        senha: 'hashed_password'
    }
];

const now = new Date();
const amanha = new Date(now); amanha.setDate(amanha.getDate() + 1);
const ontem = new Date(now); ontem.setDate(ontem.getDate() - 1);

const consultas = [
    {
        id: 'c1',
        paciente: 'p1',
        medico: 'm1',
        hora: amanha.toISOString(),
        status: 'confirmada',
        prontuário: '',
        resumo: '',
        receita: null,
        link: 'https://meet.link/c1'
    },
    {
        id: 'c2',
        paciente: 'p1',
        medico: 'm2',
        hora: ontem.toISOString(),
        status: 'concluida',
        prontuário: 'Paciente relatou dores controladas.',
        resumo: 'Manter medicação atual.',
        receita: 'receita_url.pdf',
        link: 'https://meet.link/c2'
    }
];

export const api = {
    getConsultasPaciente: async (pacienteId) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const minhasConsultas = consultas.filter(c => c.paciente === pacienteId);

                const consultasEnriquecidas = minhasConsultas.map(consulta => {
                    const medicoObj = medicos.find(m => m.id === consulta.medico);
                    return {
                        ...consulta,
                        medicoDetalhes: medicoObj
                    };
                });

                resolve(consultasEnriquecidas);
            }, 200);
        });
    }
};