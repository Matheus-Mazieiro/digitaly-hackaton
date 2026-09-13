# Relatório — Conclusão da Fase 0

- **Data:** 2026-09-12
- **Objetivo:** concluir o setup + contrato (Fase 0 do plano) e aplicar a **Opção A** (mapeamento camelCase no backend via DTOs).
- **Status:** ✅ concluída (backend compila, endpoints testados contra o Postgres real).

---

## 1. Decisão aplicada

- **Opção A:** o banco continua snake_case (schema aprovado), e a API expõe **JSON camelCase** via uma camada de DTOs no backend. O front pluga direto, sem retrabalho.

---

## 2. O que foi feito (backend)

### 2.1 Novos pacotes/arquivos

| Arquivo | O que faz |
|---|---|
| `back/internal/config/config.go` | Lê env com defaults (`PORT`, `DATABASE_URL`, `OPENAI_API_KEY`, `EMAIL_FROM`) |
| `back/.env.example` | Documenta as variáveis de ambiente |
| `back/internal/dto/dto.go` | Structs de resposta em camelCase (Doctor, Patient, Appointment, Summary, Document, Notification, Specialty) |
| `back/internal/dto/mapper.go` | Mapeia entidade → DTO (rename, cálculo de rating, split de CRM, parse de resumo, split de hora) |
| `back/internal/services/specialties.go` | Lista fixa das 7 especialidades |
| `back/internal/handlers/specialty.go` | Endpoint `GET /specialties` |
| `back/internal/ws/ws.go` | Skeleton do signaling WebRTC (rota `/ws/signal` retorna 501 até a BB6) |

### 2.2 Alterações

| Arquivo | Mudança |
|---|---|
| `model/patient/patient.go` | `Senha` → `json:"-"` (não vaza mais hash) |
| `model/doctor/doctor.go` | `Senha` → `json:"-"` |
| `services/services.go` | Agora retorna DTOs (faz o mapping) em vez de entidades |
| `handlers/patient.go` | Query params em camelCase (`name`, `email`, `phone`, `birthDate`, `cpf`) |
| `handlers/doctor.go` | Query params em camelCase (`specialty`, `name`, `crm`, `bio`...) |
| `handlers/appointment.go` | Query params em camelCase (`patientId`, `doctorId`, `date`, `status`, `reason`) |
| `handlers/notification.go` | Query params em camelCase (`userId`, `type`, `read`, `date`, `text`) |
| `routes/routes.go` | Registrou `/specialties` e `/ws/signal` |
| `cmd/server/main.go` | Passou a usar o pacote `config` |
| `.gitignore` (raiz) | Completado (`bin/`, `.env`, `node_modules/`, `dist/`...) |

### 2.3 Mapeamentos aplicados (Opção A)

- **Médico:** `nome→name`, `especialidade→specialty`, `biografia→bio`, `crm ("MG 75410")→crm ("75410") + crmState ("MG")`, `avaliacao_soma/n_consultas→rating (média) + reviews`.
- **Paciente:** `nome→name`, `telefone→phone`, `nascimento→birthDate`, sem `senha`.
- **Consulta:** `medico→doctorId`, `hora→date + time`, `motivo→reason`, `resumo (JSON)→summary (objeto)`, `prontuario/receita→documents[] + hasReport`, `hasSummary`.
- **Notificação:** `tipo→type`, `msg→text`, `data→time`, `lida→read`.

---

## 3. O que foi feito (frontend)

| Arquivo | O que faz |
|---|---|
| `frontend/src/lib/api.js` | **Cliente real** (fetch) substituindo o mock: todas as rotas do contrato, helper `request()` com `Content-Type`, token Bearer (`localStorage`), tratamento de erro, `FormData` p/ upload de áudio e URLs diretas de PDF |

> Observação: o `AppContext`/páginas ainda **não** consomem o `api.js` — essa é a etapa FA/FB (próximas fases). O `api.js` está pronto para ser plugado.

---

## 4. Contrato de API (resumo do que está no ar agora)

### Rotas implementadas (GET, lidas do Postgres)

| Rota | Query params (camelCase) | Retorno |
|---|---|---|
| `GET /health` | — | `OK` |
| `GET /ready` | — | `Pronto para receber tráfego` |
| `GET /specialties` | — | `[{id, name, icon}]` |
| `GET /doctors` | `specialty`, `id`, `name`, `email`, `crm`, `bio` | `[{id, name, specialty, crm, crmState, rating, reviews, bio}]` |
| `GET /patients` | `id`, `name`, `email`, `phone`, `birthDate`, `cpf` | `[{id, name, email, phone, birthDate, cpf}]` |
| `GET /appointments` | `id`, `patientId`, `doctorId`, `date`, `status`, `reason` | `[{id, doctorId, date, time, status, reason, hasSummary, hasReport, summary, documents}]` |
| `GET /notifications` | `id`, `userId`, `type`, `read`, `date`, `text` | `[{id, type, text, time, read}]` |
| `GET /ws/signal` | — | `501` (stub, implementar na BB6) |

### Rotas definidas no contrato (ainda não implementadas)

Auth (`/api/auth/*`), agendamento (`POST /api/appointments`, slots, confirm, start, audio, receita, review), notificações (`PATCH .../read`), PDFs. Elas já existem no `api.js`, aguardando as fases BA/BB.

---

## 5. Testes executados (contra Postgres real)

```
GET /specialties                  → 7 especialidades ✅
GET /doctors?specialty=geral      → Camila, rating 4.95, crm 75410 / MG, sem senha ✅
GET /appointments?status=concluida→ date/time split, summary parseado, hasSummary ✅
GET /notifications?userId=p1&read=false → type/text/time/read em camelCase ✅
```

- `go build ./...` ✅ · `go vet ./...` ✅ · `go mod tidy` (pgx virou dependência direta) ✅

---

## 6. O que ficou de fora (próximas fases)

| Item | Fase |
|---|---|
| Auth real (signup/login/2FA/JWT/e-mail) | BA |
| Disponibilidade/slots derivados de consultas (`GET /doctors?date=`) | BB1 |
| POST agendamento + confirmar código e-mail | BB2 |
| Notificações (criar/marcar lida) | BB3 |
| OpenAI (`gpt-transcribe` + `gpt-4o-mini`) e PDFs | BB4/BB5 |
| Signaling WebRTC real (`/ws/signal`) | BB6 |
| Avaliação (estrela) | BB7 |
| Front plugar no `api.js` (AppContext + páginas) | FA/FB |

### Pendências / observações

1. **`reviewed` (avaliação) não está no DTO de consulta** — o campo não existe no banco. Será adicionado quando a avaliação (BB7) for implementada. O front pode tratar `undefined` como "não avaliado".
2. **`slots` não está no DTO de médico** — entra na BB1 (disponibilidade derivada das consultas).
3. **Query params camelCase**: os filtros internos (`DoctorFilter`, etc.) continuam com nomes snake_case de struct, mas os **query params da API** já são camelCase (mapeados no handler).
4. **`.env`** não é carregado automaticamente (sem `godotenv`); use `export`/direnv ou rode com as variáveis no shell. O `main.go` já tem defaults de dev.
