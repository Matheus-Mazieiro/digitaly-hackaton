-- 002_seed.sql — dados de demonstração (idempotente)
-- Senha padrão de demo: "123456" (hash bcrypt gerado via pgcrypto, compatível com Go bcrypt)

-- Médicos (ids d1..d6 alinhados com o mock do front)
INSERT INTO medicos (id, nome, email, telefone, nascimento, cpf, crm, biografia, avaliacao_soma, n_consultas, especialidade, senha, ativo) VALUES
('d1', 'Dra. Ana Martins',   'ana.martins@digitalyhub.com',   '(11) 98888-0001', '1985-03-12', '111.111.111-11', 'SP 112938', 'Especialista em dermatologia clínica e estética, com foco em acompanhamento contínuo.', 627, 128, 'derma',  crypt('123456', gen_salt('bf')), TRUE),
('d2', 'Dr. Rafael Costa',   'rafael.costa@digitalyhub.com',  '(11) 98888-0002', '1982-07-30', '222.222.222-22', 'SP 88213',  'Cardiologista com experiência em prevenção e acompanhamento de hipertensão.', 451, 94, 'cardio', crypt('123456', gen_salt('bf')), TRUE),
('d3', 'Dra. Camila Ferraz', 'camila.ferraz@digitalyhub.com', '(16) 98888-0000', '1988-01-22', '333.333.333-33', 'MG 75410',  'Clínica geral, atendimento humanizado com foco em saúde preventiva.', 1005, 203, 'geral',  crypt('123456', gen_salt('bf')), TRUE),
('d4', 'Dr. Bruno Lacerda',  'bruno.lacerda@digitalyhub.com', '(21) 98888-0004', '1980-11-05', '444.444.444-44', 'RJ 60122',  'Ortopedista focado em lesões esportivas e reabilitação.', 287, 61, 'orto',   crypt('123456', gen_salt('bf')), TRUE),
('d5', 'Dra. Helena Duarte', 'helena.duarte@digitalyhub.com', '(11) 98888-0005', '1986-09-14', '555.555.555-55', 'SP 99031',  'Psiquiatra com abordagem integrativa para ansiedade e transtornos do humor.', 728, 150, 'psiq',   crypt('123456', gen_salt('bf')), TRUE),
('d6', 'Dr. Marcos Vidal',   'marcos.vidal@digitalyhub.com',  '(11) 98888-0006', '1984-05-18', '666.666.666-66', 'SP 54098',  'Pediatra dedicado ao acompanhamento do desenvolvimento infantil.', 216, 47, 'pedia',  crypt('123456', gen_salt('bf')), TRUE)
ON CONFLICT DO NOTHING;

-- Paciente de demonstração
INSERT INTO pacientes (id, nome, email, telefone, nascimento, cpf, senha, ativo) VALUES
('p1', 'Nathalia Souza', 'nathalia@email.com', '(16) 99999-0000', '1999-04-12', '123.456.789-09', crypt('123456', gen_salt('bf')), TRUE)
ON CONFLICT DO NOTHING;

-- Consultas de exemplo (datas relativas a now() para a demo ficar sempre "fresca")
INSERT INTO consultas (id, paciente, medico, hora, status, motivo, resumo) VALUES
('c1', 'p1', 'd3', now() - interval '6 days', 'concluida',
 'Dor de cabeça recorrente',
 '{"motivo":"Dor de cabeça recorrente há duas semanas.","pontos":"Paciente relata dores no período da tarde, sem histórico de enxaqueca. Nega alterações visuais.","orientacoes":"Hidratação adequada, controle de sono e redução de telas antes de dormir.","proximos":"Retorno em 30 dias caso os sintomas persistam."}'),
('c2', 'p1', 'd3', now() + interval '2 hours', 'confirmada', 'Retorno', NULL)
ON CONFLICT DO NOTHING;

-- Notificações de exemplo para a paciente p1
INSERT INTO notificacoes (id, msg, data, usr, tipo, lida) VALUES
('n1', 'Sua consulta começa em 15 minutos. Prepare-se!', now(), 'p1', 'alert', FALSE),
('n2', 'Consulta com Dra. Camila Ferraz confirmada', now() - interval '1 day', 'p1', 'confirm', TRUE),
('n3', 'Novo documento recebido de Dra. Camila Ferraz', now() - interval '2 days', 'p1', 'doc', TRUE)
ON CONFLICT DO NOTHING;
