# Digitaly Hub — Hackathon

Aplicação web de teleconsulta: conecta médicos e pacientes por videoconferência e usa IA para transcrever e resumir a consulta, gerando prontuário e receita em PDF.

## Documentação

- [Banco de Dados (PostgreSQL) — tutorial](./docs/database.md)
- [Design Spec do MVP](./docs/superpowers/specs/2026-09-12-teleconsulta-mvp-design.md)
- [Plano de Implementação (tasks paralelas)](./docs/superpowers/plans/2026-09-12-teleconsulta-mvp-plan.md)

## Estrutura

- `back/` — API em Go (PostgreSQL, WebRTC signaling, IA).
- `frontend/` — SPA em React/Vite.
- `.draft/` — rascunhos de requisitos.
