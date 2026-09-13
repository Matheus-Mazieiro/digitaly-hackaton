-- 004_verificacoes_ref.sql — ref_id para vincular código 2FA a uma consulta (confirmação de agendamento)

ALTER TABLE verificacoes_2fa ADD COLUMN IF NOT EXISTS ref_id TEXT;
