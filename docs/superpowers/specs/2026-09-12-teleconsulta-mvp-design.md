# Digitaly Hub — Teleconsulta MVP — Design Spec

- **Data:** 2026-09-12
- **Status:** Aprovado (aguardando revisão final do time)
- **Escopo:** MVP de teleconsulta — cadastro → agendamento → consulta (WebRTC) → transcrição/resumo por IA → prontuário e receita em PDF → avaliação.
- **Stack:** Go (backend) · React/Vite (frontend) · PostgreSQL · WebRTC P2P · OpenAI (`gpt-transcribe` + `gpt-4o-mini`) · provedor de e-mail transacional.
- **Restrição de tempo:** 10 horas · 2 devs back · 2 devs front.

---

## 1. Objetivo e definição de "pronto"

Uma aplicação web que conecta médico e paciente por videoconferência e, ao final da consulta, gera automaticamente um **prontuário** (transcrição + resumo estruturado por IA) em PDF, além de uma **receita** em PDF preenchida pelo médico.

O "pronto" é o **fluxo feliz de ponta a ponta** demonstrado ao vivo:

```
Cadastro médico (CRM) → 2FA e-mail → agenda
Cadastro paciente → 2FA e-mail → agenda consulta → confirma por código e-mail
Preroom (janela de 15 min) → chamada WebRTC ao vivo → médico encerra
→ áudio sobe → gpt-transcribe → gpt-4o-mini → resumo → prontuário.pdf
→ médico preenche receita → receita.pdf
→ paciente vê resumo + baixa PDFs + avalia (estrela)
```

---

## 2. Escopo (in / out)

### Dentro do MVP

- Autenticação **real**: cadastro paciente/médico, login, 2FA por e-mail (código de 6 dígitos), senha com hash, JWT.
- Validação de **formato** de CPF, e-mail e CRM (regex, sem validação algorítmica nem registro externo).
- Agendamento: especialidade → data → médico → horário → motivo (pré-consulta) → confirmação por código e-mail.
- Disponibilidade derivada das `consultas` (sem tabela de disponibilidade).
- Videoconferência **WebRTC ponto a ponto** com signaling via WebSocket no backend Go.
- Captura de **áudio** da consulta (no navegador do médico) e upload ao encerrar.
- Pipeline de IA: `gpt-transcribe` (com diarização) → `gpt-4o-mini` → resumo estruturado.
- **Prontuário.pdf** (gerado do resumo) e **Receita.pdf** (gerada de formulário preenchido pelo médico).
- Notificações in-app.
- Avaliação do médico por **estrela** (agrega `avaliacao_soma` / `n_consultas`).

### Fora do MVP (cortado)

- Preço/valor da consulta e pagamento.
- Link compartilhável da consulta (navegação interna apenas).
- Transcrição **ao vivo** e insights do copiloto durante a chamada (a tela mostra "Gravando…"; o resumo sai no fim).
- Prontuário estruturado / histórico clínico do paciente (só o campo livre de pré-consulta).
- Push notification real e upload real de documentos de exames (a UI de documentos existe, mas sem persistência de arquivo no MVP).
- Servidor TURN próprio (usar STUN público; TURN gratuito só se der tempo).

---

## 3. Decisões fechadas

| # | Decisão |
|---|---|
| 1 | Sem transcrição/insights ao vivo (tela de chamada mostra "Gravando…"; resumo no fim). |
| 2 | Sem preço/valor. |
| 3 | Sem link de consulta (navegação interna; campo `link` da tabela fica vazio). |
| 4 | Dados de saúde do paciente = apenas o campo livre de motivo/pré-consulta. |
| 5 | 2FA / e-mail / CRM **reais** (e-mail via provedor; CRM só validação de formato). |
| 6 | Usuários reais (paciente e médico), com base nas tabelas da descrição. |
| 7 | Receita em PDF **preenchida pelo médico** (não gerada pela IA). |
| 8 | Disponibilidade derivada de `consultas` (sem tabela própria). |
| 9 | Avaliação guarda só a estrela (texto descartado). |

---

## 4. Modelo de dados (PostgreSQL)

Nomes de tabela/campos seguem o esquema da descrição. Adições mínimas marcadas com **+**.

### `pacientes`
`id, nome, email, telefone, nascimento, cpf, senha, + ativo`

### `medicos`
`id, nome, email, telefone, nascimento, cpf, crm, biografia, avaliacao_soma, n_consultas, especialidade, senha, + ativo`

- `crm` guarda **UF + número** junto (ex.: `"MG 75410"`), já que o esquema não tem campo de UF.
- `rating` (API) = `avaliacao_soma / n_consultas`; `reviews` (API) = `n_consultas`.

### `consultas`
`id, paciente, medico, hora, status, + motivo, prontuario, resumo, receita, link`

- `status`: `agendada | confirmada | em_andamento | concluida | cancelada`.
- `hora`: datetime completo (data + horário).
- `motivo`: texto livre de pré-consulta.
- `resumo`: **JSON string** `{"motivo","pontos","orientacoes","proximos"}` gerado pela IA.
- `prontuario` / `receita`: caminho do arquivo PDF em disco.
- `link`: fica vazio (decisão 3).

### `notificacoes`
`id, msg, data, usr, + tipo, + lida`

- `tipo`: `alert | doc | confirm | info`.
- `lida`: booleano.

### Disponibilidade (sem tabela)

- Horários ofertados = **template fixo**: segunda a sexta, 08:00–17:00, a cada 30 min.
- Horário **livre** = template − `consultas` ativas (`agendada | confirmada | em_andamento`) do médico naquele `hora`.
- A tela `Availability.jsx` (editor semanal) fica **fora** do MVP.

---

## 5. Arquitetura

```
[React front]  ──REST──►  [Go API]  ──►  [PostgreSQL]
     │                        │
     │──WebSocket signaling───┤   (sala por appointmentId)
     │                        │
     │  WebRTC P2P (vídeo) ── direto médico ⇄ paciente
     │                        │
     └── áudio (upload fim) ──► gpt-transcribe ─► gpt-4o-mini ─► resumo
                                gerador PDF ─► prontuário.pdf / receita.pdf
                                mailer (provedor) ─► códigos 2FA
```

### Backend (Go)

Pacotes (hoje só existem stubs `model`, `repositories`, `services`, `handlers`, `routes`):

- `cmd/server` — entrypoint (HTTP + WS).
- `internal/config` — env (porta, connection string do PostgreSQL, chaves OpenAI/e-mail).
- `internal/model` — structs das 4 entidades.
- `internal/repositories` — acesso PostgreSQL (pgx).
- `internal/services` — auth (JWT/bcrypt), 2FA (gera código → mailer), OpenAI, PDF, disponibilidade.
- `internal/handlers` — handlers REST.
- `internal/ws` — signaling WebRTC.
- `internal/routes` — registro das rotas.

### Frontend (React)

Estrutura atual mantida. Trabalho = trocar a **fonte de dados** (`lib/mock.js` + `AppContext`) por chamadas reais em `lib/api.js`. As telas visuais já existem; adicionar:

- Tela de chamada com WebRTC real + "Gravando…".
- Formulário de receita (nova tela no fluxo do médico).

---

## 6. Contrato da API

Convenção: JSON camelCase (alinhado ao front). O repositório faz o mapeamento para os campos snake_case do banco.

### Auth

| Método | Rota | Body | Retorno |
|---|---|---|---|
| POST | `/api/auth/signup` | `{role, nome, email, telefone, nascimento, cpf, senha, crm?, biografia?, especialidade?}` | `{pendingToken}` |
| POST | `/api/auth/login` | `{email, senha}` | `{pendingToken}` |
| POST | `/api/auth/verify` | `{pendingToken, code}` | `{token, role}` |
| POST | `/api/auth/resend` | `{pendingToken}` | `{ok}` |
| GET | `/api/auth/me` | — (Bearer) | `{id, nome, role, ...}` |

- Signup cria conta **inativa** e envia código 2FA por e-mail. `verify` ativa e devolve JWT.
- Login valida senha, envia código, `verify` devolve JWT.
- Código expira em 5 min; `resend` reenvia.
- CPF/CRM validados por formato; CRM com UF + número.

### Especialidades e médicos

| Método | Rota | Retorno |
|---|---|---|
| GET | `/api/specialties` | `[{id, name, icon}]` |
| GET | `/api/doctors?specialty=&date=` | `[{id, nome, especialidade, crm, biografia, rating, reviews, slots:["09:00",...]}]` |
| GET | `/api/doctors/:id/slots?date=` | `["09:00", ...]` |
| GET | `/api/doctors/me/appointments` | consultas do médico logado |

### Consultas

| Método | Rota | Body | Retorno |
|---|---|---|---|
| POST | `/api/appointments` | `{doctorId, date, time, motivo}` | `{id, confirmPending}` |
| POST | `/api/appointments/:id/confirm` | `{code}` | `{ok}` |
| GET | `/api/appointments` | — | consultas do paciente logado |
| GET | `/api/appointments/:id` | — | detalhe |
| POST | `/api/appointments/:id/start` | — (médico) | `{ok}` → status `em_andamento` |
| POST | `/api/appointments/:id/audio` | multipart (áudio) | `{ok, resumo}` (dispara IA) |
| POST | `/api/appointments/:id/receita` | `{medicamentos:[{nome, dose, instrucoes}], orientacoes}` | `{ok}` (gera receita.pdf) |
| POST | `/api/appointments/:id/review` | `{stars}` | `{ok}` |
| GET | `/api/appointments/:id/prontuario.pdf` | — | PDF |
| GET | `/api/appointments/:id/receita.pdf` | — | PDF |

- `POST /audio` é **síncrono** (a resposta espera transcrição + resumo). Aceitável no MVP; o front usa timeout generoso (ex.: 60s) e mostra estado de "gerando resumo…".
- `POST /review` atualiza `avaliacao_soma += stars` e `n_consultas += 1`.

### Notificações

| Método | Rota | Retorno |
|---|---|---|
| GET | `/api/notifications` | `[{id, msg, data, tipo, lida}]` |
| PATCH | `/api/notifications/:id/read` | `{ok}` |

### WebSocket (signaling)

`/ws/signal?room=<appointmentId>` — autenticado por JWT (query param ou header).

Mensagens: `{type, payload}`

- `join` — entra na sala (payload: `{role}`).
- `offer` / `answer` — SDP.
- `ice` — ICE candidate.
- `leave` — sai da sala.

Regra: **médico = ofertante, paciente = respondente**. Quando os dois estão na sala, o médico cria o `offer`.

---

## 7. Fluxos detalhados

### 7.1 Auth

1. Cadastro paciente/médico → valida formatos → cria conta inativa → envia código 2FA.
2. (médico) tela "validando CRM" reflete a validação de formato (rápida).
3. `verify` com código → ativa → JWT (`id` + `role`).
4. Login → envia código → `verify` → JWT.

### 7.2 Agendamento

1. `GET /specialties` → lista fixa.
2. `GET /doctors?specialty=&date=` → médicos com `slots` livres (template − consultas).
3. `POST /appointments` → `agendada` + código de confirmação por e-mail.
4. `POST /appointments/:id/confirm` → `confirmada` + notificação.

### 7.3 Consulta (coração)

1. Médico `POST /start` → `em_andamento` → `/doctor/call`.
2. Paciente entra pela preroom (janela 15 min antes até 1h depois).
3. WebRTC P2P: `getUserMedia` → `RTCPeerConnection` → signaling via WS → STUN público.
4. Tela do médico mostra "Gravando…"; `MediaRecorder` captura áudio (mic + remoto).
5. Encerrar: `POST /audio` → `gpt-transcribe` (diarização) → `gpt-4o-mini` → `resumo` → gera `prontuário.pdf` → `concluida` + notificação.
6. Médico preenche receita → `POST /receita` → gera `receita.pdf`.
7. Paciente vê resumo, baixa PDFs, avalia (`POST /review`).

### 7.4 Notificações

Eventos → `notificacoes`: consulta confirmada, médico entrou na sala, consulta concluída + resumo pronto, novo documento (receita). Front busca `GET /notifications`.

---

## 8. Tratamento de erros

| Caso | Resposta | Ação no front |
|---|---|---|
| Token inválido/expirado | 401 | redireciona pro login |
| Role errada na rota | 403 | mensagem/redirect |
| CPF/CRM/e-mail formato inválido, senha curta | 400 + mensagem | mostra no campo |
| Horário já ocupado (conflito) | 409 | avisa e recarrega slots |
| Código 2FA inválido/expirado | 400 | permite reenviar |
| Falha ao enviar e-mail | 502 | "não foi possível enviar" + reenviar |
| Falha OpenAI (transcrição/resumo) | 502 | botão "gerar resumo novamente" |
| Upload de áudio falhou | 400/502 | não perde a consulta; permite reenviar |
| WebRTC sem conexão (NAT/TURN) | — | mensagem "não foi possível conectar" + tentar reconectar |

---

## 9. Estratégia de testes

- **Backend (obrigatório):** `go test ./...` com testes unitários em `services` — validação CPF/CRM, derivação de disponibilidade, parse do `resumo` JSON, geração/validação de JWT. 1–2 testes de handler (ex.: criar consulta sem auth → 401).
- **Frontend:** sem testes automatizados no MVP (restrição de tempo). Validação manual com o script de demo (§10).
- **E2E manual:** o próprio script de demo é o teste de aceite.

---

## 10. Script de demo (teste de aceite)

1. Cadastro médico (CRM + especialidade) → 2FA por e-mail → dashboard.
2. Médico abre "Agenda" (vazia; disponibilidade = template).
3. Cadastro paciente → 2FA por e-mail → dashboard.
4. Paciente agenda: especialidade → data → médico → horário → motivo → confirma código e-mail.
5. No horário, preroom libera → ambos entram.
6. Chamada WebRTC ao vivo (mic/câmera reais).
7. Médico encerra → áudio sobe → IA gera resumo → `prontuário.pdf` disponível.
8. Médico preenche receita → `receita.pdf`.
9. Paciente vê resumo, baixa os 2 PDFs, avalia com estrela.
10. Notificações aparecem ao longo do fluxo.

---

## 11. Divisão de tasks (paralelo)

### Fase 0 — contrato + fundação (todos, ~1h)

- Aprovar esta spec (contrato da API).
- Back: criar esqueleto Go completo, PostgreSQL (docker compose) + migrations + seeds (especialidades, médicos de exemplo), middleware JWT, esboço do `lib/api.js`.
- Front: definir o cliente `api.js` consumindo o contrato (rotas base, helpers de auth).

### Back A — Fundação + Auth + E-mail

1. Config/env, conexão PostgreSQL, migrations, seeds, modelos.
2. JWT + bcrypt + middleware.
3. `mailer` (interface + provedor).
4. Endpoints: signup/login/verify/resend/me.
5. Validação de formato CPF/CRM/e-mail.
6. Testes unitários (validações, JWT).

### Back B — Domínio + IA + PDF + WebSocket

1. Especialidades e médicos (listagem + slots derivados).
2. Consultas: agendar/confirmar/iniciar/encerrar/audio/receita/review.
3. Notificações.
4. Integração OpenAI (`gpt-transcribe` + `gpt-4o-mini`).
5. Geração de PDF (prontuário + receita).
6. WebSocket signaling.
7. Testes (disponibilidade, parse resumo).

> Dependência: B usa os modelos/JWT/middleware do A. Mitigação: A entrega DB + modelos + middleware cedo (~2h).

### Front A — Auth + Agendamento + Listas

1. Login/cadastro/2FA reais (chamadas + estados de erro/loading).
2. Fluxo de agendamento real (especialidade → data → médico → slots → confirmar → código).
3. Consultas/histórico/detalhe reais.
4. Notificações reais (listar + marcar lida).

### Front B — Chamada + IA + PDFs

1. WebRTC: `getUserMedia` + `RTCPeerConnection` + cliente de signaling (WS).
2. `MediaRecorder` + upload do áudio ao encerrar + tela "Gravando…".
3. Formulário de receita.
4. Exibição do resumo + download de PDFs + avaliação (estrela).

> Dependência: ambos usam o cliente `api.js` e o contrato. Mitigação: `api.js` centralizado na Fase 0.

---

## 12. Riscos e premissas

- **NAT traversal:** sem TURN próprio, conexões podem falhar atrás de NAT restritivo. Usar STUN público (Google) e, se der tempo, um TURN gratuito (ex.: Open Relay).
- **Áudio perdido:** se a aba do médico fechar antes do upload, o áudio se perde (risco aceito; botão de retry).
- **Custo/latência OpenAI:** `gpt-transcribe` é batch (ok); `gpt-4o-mini` é barato. Resposta do `/audio` é síncrona (pode levar alguns segundos).
- **Provedor de e-mail:** exige credenciais antes da demo.
- **PostgreSQL:** via Docker Compose (postgres:16-alpine); migrations/seeds rodam na primeira subida do container.
- **Chaves necessárias:** OpenAI API key + credenciais do provedor de e-mail (o time deve prover).

---

## 13. Fora de escopo explícito (anti-escopo)

- Pagamentos, preço, planos.
- Prontuário estruturado / histórico clínico completo.
- Upload real de exames/documentos (só receita e prontuário gerados).
- TURN próprio, gravação central, multi-participante.
- Transcrição/insights em tempo real.
- Diarização visual além do que o `gpt-transcribe` devolve no `resumo`.
