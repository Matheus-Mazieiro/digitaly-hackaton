// src/services/authMock.js

export const authApi = {
    // POST /login { email, senha }
    login: async (payload) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ success: true, email: payload.email });
            }, 800);
        });
    },

    // POST /register { nome, cpf, data_nascimento, email, senha, especialidade, CRM, estado_crm }
    register: async (payload) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ success: true, email: payload.email });
            }, 800);
        });
    },

    // POST /2fa { codigo } (Adicionei o email para manter a rastreabilidade)
    verify2FA: async (payload) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (payload.codigo === '123456') {
                    resolve({ success: true, token: 'jwt_token_final' });
                } else {
                    reject(new Error('Código inválido.'));
                }
            }, 800);
        });
    }
};