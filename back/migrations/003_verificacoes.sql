-- 003_verificacoes.sql — códigos 2FA pendentes (infra de auth)

CREATE TABLE IF NOT EXISTS verificacoes_2fa (
    token      TEXT PRIMARY KEY,
    code_hash  TEXT NOT NULL,
    kind       TEXT NOT NULL,  -- 'signup' | 'login'
    role       TEXT NOT NULL,  -- 'patient' | 'doctor'
    user_id    TEXT NOT NULL,
    email      TEXT NOT NULL,
    expira_em  TIMESTAMPTZ NOT NULL
);
