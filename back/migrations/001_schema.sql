-- 001_schema.sql — schema inicial do Digitaly Hub (PostgreSQL)
-- Alinhado com docs/superpowers/specs/2026-09-12-teleconsulta-mvp-design.md §4

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS pacientes (
    id         TEXT PRIMARY KEY,
    nome       TEXT NOT NULL,
    email      TEXT NOT NULL UNIQUE,
    telefone   TEXT NOT NULL,
    nascimento DATE NOT NULL,
    cpf        TEXT NOT NULL UNIQUE,
    senha      TEXT NOT NULL,
    ativo      BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS medicos (
    id             TEXT PRIMARY KEY,
    nome           TEXT NOT NULL,
    email          TEXT NOT NULL UNIQUE,
    telefone       TEXT NOT NULL,
    nascimento     DATE NOT NULL,
    cpf            TEXT NOT NULL UNIQUE,
    crm            TEXT NOT NULL,
    biografia      TEXT NOT NULL DEFAULT '',
    avaliacao_soma INTEGER NOT NULL DEFAULT 0,
    n_consultas    INTEGER NOT NULL DEFAULT 0,
    especialidade  TEXT NOT NULL,
    senha          TEXT NOT NULL,
    ativo          BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS consultas (
    id         TEXT PRIMARY KEY,
    paciente   TEXT NOT NULL REFERENCES pacientes(id),
    medico     TEXT NOT NULL REFERENCES medicos(id),
    hora       TIMESTAMPTZ NOT NULL,
    status     TEXT NOT NULL DEFAULT 'agendada',
    motivo     TEXT,
    prontuario TEXT,
    resumo     TEXT,
    receita    TEXT,
    link       TEXT
);

CREATE TABLE IF NOT EXISTS notificacoes (
    id   TEXT PRIMARY KEY,
    msg  TEXT NOT NULL,
    data TIMESTAMPTZ NOT NULL DEFAULT now(),
    usr  TEXT NOT NULL,
    tipo TEXT NOT NULL DEFAULT 'info',
    lida BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_consultas_medico_hora ON consultas (medico, hora);
CREATE INDEX IF NOT EXISTS idx_consultas_paciente ON consultas (paciente);
CREATE INDEX IF NOT EXISTS idx_notificacoes_usr ON notificacoes (usr);
