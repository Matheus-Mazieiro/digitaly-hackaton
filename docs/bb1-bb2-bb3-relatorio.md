# Relatório — BB1, BB2 e BB3 (Disponibilidade, Agendamento e Notificações)

- **Data:** 2026-09-13
- **Escopo:** implementar BB1 (slots/disponibilidade), BB2 (agendamento de consultas) e BB3 (notificações), aplicando o middleware de autenticação nas rotas protegidas.
- **Status:** ✅ concluído — build, vet e testes verdes; fluxo completo validado contra o Postgres real.

---

## 1. Regra de disponibilidade (BB1)

Na hora de agendar, a API devolve **apenas os horários LIVRES** do médico. Os horários em que o médico **não está disponível** (consultas já marcadas) são **removidos** da grade.

```
horários livres = grade padrão − consultas marcadas

grade padrão  = segunda a sexta, 08:00–16:30, a cada 30 min (18 slots)
                sábado/domingo = vazio

consultas marcadas = status IN ('agendada', 'confirmada', 'em_andamento')
                     do médico, naquele dia
```

---

## 2. O que foi implementado

### BB1 — Disponibilidade/slots

| Rota | O que faz | Auth |
|---|---|---|
| `GET /api/doctors?specialty=&date=` | lista médicos; se `date` vier, cada médico vem com `slots` (livres) | pública |
| `GET /api/doctors/{id}/slots?date=` | horários livres de um médico numa data | pública |

### BB2 — Consultas

| Rota | O que faz | Auth |
|---|---|---|
| `GET /api/appointments` | consultas do usuário logado (paciente vê as dele, médico as dele) | Bearer |
| `GET /api/appointments/{id}` | detalhe (só o dono) | Bearer |
| `POST /api/appointments` | agendar (só paciente). Body: `{doctorId, date, time, motivo}` | Bearer + role patient |
| `POST /api/appointments/{id}/confirm` | confirma com código por e-mail. Body: `{code}` | Bearer |
| `POST /api/appointments/{id}/start` | médico inicia a consulta → `em_andamento` | Bearer + role doctor |

### BB3 — Notificações

| Rota | O que faz | Auth |
|---|---|---|
| `GET /api/notifications` | notificações do usuário logado | Bearer |
| `PATCH /api/notifications/{id}/read` | marca como lida (só as do próprio usuário) | Bearer |

### Fluxo de eventos (BB2 + BB3 conectados)

- Agendar → cria consulta (`agendada`) + envia **código de confirmação por e-mail** (reusa a infra do BA).
- Confirmar → status `confirmada` + **notifica o médico**.
- Iniciar → status `em_andamento` + **notifica o paciente**.

---

## 3. Arquivos

**Criados:**
- `migrations/004_verificacoes_ref.sql` (coluna `ref_id` pra vincular o código à consulta)
- `repositories/availability.go`, `repositories/appointments.go`, `repositories/notifications.go`
- `services/availability.go`, `services/appointments.go`, `services/notifications.go`
- `services/availability_test.go`

**Alterados:**
- `dto.go` (+ `slots` no Doctor)
- `repositories/verifications.go` (+ `RefID` e `GetVerificationByRef`)
- `handlers/doctor.go` (+ `date`/slots + `GetDoctorSlots`)
- `handlers/appointment.go` (handlers protegidos de consulta)
- `handlers/notification.go` (handlers protegidos de notificação)
- `handlers/auth.go` (`writeErr` mapeia `404`)
- `services/auth.go` (+ helper `sendCode`)
- `routes.go` (rotas novas + removidas as duplicadas)
- `cmd/server/main.go` (corrigido pool duplo do Postgres + removida função CORS morta)
- `scripts/db-setup-mac.sh` e `db-setup-linux.sh` (rodam a migration 004)

---

## 4. Testes unitários

```bash
cd back
go test ./...
```

Esperado: `ok` em `internal/services` (novo teste `availability_test.go`).

O que o `availability_test.go` cobre:
- `templateSlots`: dia útil gera **18 slots** (08:00 → 16:30); sábado/domingo vazios.
- `freeSlots`: remove os horários ocupados da grade.

---

## 5. Teste de integração (fluxo completo via curl)

**Passo 0 — banco + servidor** (o código 2FA/confirmação sai no terminal do servidor):

```bash
cd back
bash scripts/db-setup-mac.sh      # no Mac (aplica as migrations, incluindo a 004)
go run ./cmd/server               # sobe na porta 8085
```

**Passo 1 — login paciente (p1) e médico (d3)** e guardar os JWTs:

```bash
# login p1
PENDING=$(curl -s -X POST localhost:8085/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"nathalia@email.com","senha":"123456"}')
TOK=$(echo "$PENDING" | python3 -c 'import sys,json;print(json.load(sys.stdin)["pendingToken"])')
# pegue o código no log do servidor e rode:
VERIFY=$(curl -s -X POST localhost:8085/api/auth/verify \
  -H 'Content-Type: application/json' -d "{\"pendingToken\":\"$TOK\",\"code\":\"CODIGO\"}")
P1J=$(echo "$VERIFY" | python3 -c 'import sys,json;print(json.load(sys.stdin)["token"])')
```

> Mesma coisa pro médico com `camila.ferraz@digitalyhub.com` → `D3J`.

**Passo 2 — BB1: ver slots livres** (segunda 14/09/2026):

```bash
curl -s "localhost:8085/api/doctors?specialty=geral&date=2026-09-14"
curl -s "localhost:8085/api/doctors/d3/slots?date=2026-09-14"
```

**Passo 3 — BB2: agendar** (só paciente):

```bash
CREATE=$(curl -s -X POST localhost:8085/api/appointments \
  -H "Authorization: Bearer $P1J" -H 'Content-Type: application/json' \
  -d '{"doctorId":"d3","date":"2026-09-14","time":"09:00","motivo":"Dor de cabeça"}')
APPID=$(echo "$CREATE" | python3 -c 'import sys,json;print(json.load(sys.stdin)["id"])')
```

**Passo 4 — confirmar** (pega o código no log do servidor):

```bash
curl -s -X POST "localhost:8085/api/appointments/$APPID/confirm" \
  -H "Authorization: Bearer $P1J" -H 'Content-Type: application/json' \
  -d '{"code":"CODIGO"}'
```

**Passo 5 — BB3: notificação do médico** (nova consulta confirmada):

```bash
curl -s localhost:8085/api/notifications -H "Authorization: Bearer $D3J"
```

**Passo 6 — BB2: médico inicia**:

```bash
curl -s -X POST "localhost:8085/api/appointments/$APPID/start" -H "Authorization: Bearer $D3J"
```

**Passo 7 — BB3: notificação do paciente** ("médico entrou") + marcar lida:

```bash
curl -s localhost:8085/api/notifications -H "Authorization: Bearer $P1J"
curl -s -X PATCH "localhost:8085/api/notifications/<ID>/read" -H "Authorization: Bearer $P1J"
```

---

## 6. Resultados validados (executados de verdade)

| Teste | Resultado |
|---|---|
| `GET /api/doctors?specialty=geral&date=2026-09-14` | ✅ médico com `slots` (18 horários livres) |
| `GET /api/doctors/d3/slots` | ✅ 18 horários |
| `POST /api/appointments` (paciente) | ✅ criou `agendada` + enviou código |
| `POST .../confirm` com código | ✅ `confirmada` + notificou médico |
| `GET /api/appointments` (paciente) | ✅ só as consultas da p1 |
| `POST .../start` (médico) | ✅ `em_andamento` + notificou paciente |
| `GET /api/notifications` (médico/paciente) | ✅ cada um vê só as suas |
| `PATCH .../read` | ✅ marcou lida |
| Sem token | ✅ `401` |
| Double booking (mesmo horário) | ✅ `409` |
| Médico tentando agendar | ✅ `403` |
| Horário fora da grade (22:00) | ✅ `409` |

---

## 7. Pendências / observações

1. **Porta:** o `main.go` atual usa **8085** (config `PORT` default é 8080). Alinhar com o front (`api.js` aponta 8080) — setar `PORT=8080` ou mudar o `api.js`.
2. **Makefile:** o target `db-setup` aponta pra `db-setup-linux.sh` (default do time). No **Mac**, rode `bash scripts/db-setup-mac.sh` direto (ou mude `SCRIPT` no Makefile).
3. **`GET /api/patients`** continua público e lista todos os pacientes (PII). Fora do escopo BB, mas merece ser protegido/removido.
4. **`slots`**: a API devolve `slots` como array simples (para a `date` pedida). O front (FA) vai ler `doctor.slots` direto, em vez do antigo `doctor.slots[date]` do mock.
5. **IA (merge anterior):** usa `API_TOKEN`; o auth usa `OPENAI_API_KEY`. Unificar depois.
