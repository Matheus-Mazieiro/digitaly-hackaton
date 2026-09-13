# Relatório — Trilha BA (Auth: cadastro, login, 2FA, JWT)

- **Data:** 2026-09-12
- **Objetivo:** implementar a autenticação real (signup/login/2FA por e-mail, JWT, bcrypt, validações).
- **Status:** ✅ concluída — `go build`, `go vet` e `go test` verdes; fluxo completo testado via curl contra o Postgres.

---

## 1. O que foi implementado

### 1.1 Endpoints

| Método | Rota | Body | Retorno |
|---|---|---|---|
| POST | `/api/auth/signup` | `{role, nome, email, telefone, nascimento, cpf, senha, crm?, biografia?, especialidade?}` | `{pendingToken}` |
| POST | `/api/auth/login` | `{email, senha}` | `{pendingToken}` |
| POST | `/api/auth/verify` | `{pendingToken, code}` | `{token, role}` |
| POST | `/api/auth/resend` | `{pendingToken}` | `{ok: true}` |
| GET | `/api/auth/me` | — (Bearer) | `{id, nome, email, role}` |

**Status HTTP:** `400` validação · `401` não autorizado/código inválido · `409` conflito (e-mail/CPF já existe) · `500` erro interno.

### 1.2 Regras

- **Senha** com hash **bcrypt** (nunca sai do servidor — `json:"-"` nos models).
- **2FA por e-mail**: código de 6 dígitos, expira em **5 min**, armazenado com **SHA-256** na tabela `verificacoes_2fa` (nunca em texto puro). `pendingToken` é aleatório.
- **Signup** cria conta **inativa** (`ativo=false`); `verify` ativa e devolve JWT.
- **Login** valida senha, exige conta ativa, envia código, e o `verify` devolve JWT.
- **JWT** HS256, expiração **24h**, claims `uid` + `role`. Secret em `JWT_SECRET`.
- **Validações de formato**: CPF (`000.000.000-00` ou 11 dígitos), CRM (`UF + número`, ex.: `MG 75410`), e-mail, senha (mín. 6), nascimento (`YYYY-MM-DD`), nome/telefone obrigatórios, especialidade obrigatória para médico.

### 1.3 Mailer (e-mail de verdade)

- Interface `Mailer` + implementação **SMTP** (via `net/smtp`, configurável).
- **Fallback de dev**: se `SMTP_HOST` estiver vazio, o código é **logado no terminal** do servidor (`[MAILER] código ... : 123456`). Para enviar e-mail real, configure `SMTP_HOST`/`SMTP_PORT`/`SMTP_USER`/`SMTP_PASS`.

### 1.4 Arquivos

**Novos:**
- `internal/auth/jwt.go` (gerar/validar JWT)
- `internal/auth/middleware.go` (Bearer + injeção de userID/role)
- `internal/services/auth.go` (orquestração signup/login/verify/resend/me)
- `internal/services/mailer.go` (SMTP + log fallback)
- `internal/services/validation.go` (CPF/CRM/e-mail/senha)
- `internal/services/code.go` (código 6 dígitos, token, SHA-256)
- `internal/repositories/users.go` (CRUD paciente/médico, ativação)
- `internal/repositories/verifications.go` (store do 2FA)
- `internal/handlers/auth.go` (handlers + helpers JSON/erro)
- `migrations/003_verificacoes.sql`
- testes: `validation_test.go`, `code_test.go`, `jwt_test.go`

**Alterados:**
- `config.go` (+ `JWT_SECRET`, `SMTP_*`) · `.env.example` · `routes.go` (rotas auth) · `main.go` (`InitAuth`) · `dto.go` (+ `Me`) · `002_seed.sql` (idempotente com `ON CONFLICT`) · `db-setup.sh` (roda a 003)

---

## 2. Como rodar os testes

### 2.1 Testes unitários (sem precisar de banco)

```bash
cd back
go test ./...
```

Esperado: `ok` em `internal/auth` e `internal/services`.

O que cobre:
- `validation_test.go`: CPF, CRM, e-mail e senha (válidos + inválidos).
- `code_test.go`: código sempre com 6 dígitos numéricos; hash determinístico e distinto.
- `jwt_test.go`: gerar+parsear token, secret errada falha, token inválido falha.

### 2.2 Teste de integração (fluxo completo via curl)

**Passo 0** — banco + servidor:

```bash
cd back
make db-setup          # aplica migrations (inclui 003) — agora é seguro rodar sempre
go run ./cmd/server    # deixa rodando (o código 2FA aparece neste terminal)
```

**Passo 1** — signup de paciente:

```bash
curl -s -X POST localhost:8080/api/auth/signup \
  -H 'Content-Type: application/json' \
  -d '{"role":"patient","nome":"Teste","email":"teste@example.com","telefone":"(11) 90000-0000","nascimento":"1990-01-01","cpf":"999.888.777-66","senha":"123456"}'
# → {"pendingToken":"..."}
```

**Passo 2** — pegar o código no log do servidor (terminal onde `go run` está rodando):

```
[MAILER] código de verificação para teste@example.com: 123456
```

**Passo 3** — verificar:

```bash
curl -s -X POST localhost:8080/api/auth/verify \
  -H 'Content-Type: application/json' \
  -d '{"pendingToken":"<TOKEN_DO_PASSO_1>","code":"123456"}'
# → {"token":"<JWT>","role":"patient"}
```

**Passo 4** — perfil logado:

```bash
curl -s localhost:8080/api/auth/me -H "Authorization: Bearer <JWT>"
# → {"id":"...","nome":"Teste","email":"teste@example.com","role":"patient"}
```

**Passo 5** — login com o usuário seed (testa o bcrypt do seed com o Go):

```bash
curl -s -X POST localhost:8080/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"nathalia@email.com","senha":"123456"}'
# → {"pendingToken":"..."}  (pega o código no log e repete o Passo 3)
```

### 2.3 Casos de erro (rápidos)

```bash
# senha errada → 401
curl -s -w '\nHTTP %{http_code}\n' -X POST localhost:8080/api/auth/login \
  -H 'Content-Type: application/json' -d '{"email":"nathalia@email.com","senha":"errada"}'

# CPF inválido → 400
curl -s -w '\nHTTP %{http_code}\n' -X POST localhost:8080/api/auth/signup \
  -H 'Content-Type: application/json' \
  -d '{"role":"patient","nome":"X","email":"x@example.com","telefone":"1","nascimento":"1990-01-01","cpf":"123","senha":"123456"}'

# CRM inválido (médico) → 400
curl -s -w '\nHTTP %{http_code}\n' -X POST localhost:8080/api/auth/signup \
  -H 'Content-Type: application/json' \
  -d '{"role":"doctor","nome":"Dra","email":"dra@example.com","telefone":"1","nascimento":"1990-01-01","cpf":"888.777.666-55","senha":"123456","crm":"12345","especialidade":"geral"}'

# sem token → 401
curl -s -o /dev/null -w '%{http_code}\n' localhost:8080/api/auth/me

# duplicado (mesmo e-mail) → 409
curl -s -w '\nHTTP %{http_code}\n' -X POST localhost:8080/api/auth/signup \
  -H 'Content-Type: application/json' \
  -d '{"role":"patient","nome":"Teste2","email":"nathalia@email.com","telefone":"1","nascimento":"1990-01-01","cpf":"777.666.555-44","senha":"123456"}'
```

---

## 3. Pendências / próximos passos

1. **Credenciais SMTP reais** — hoje o código sai no log (dev). Plugue `SMTP_HOST/USER/PASS` para enviar de verdade.
2. **`JWT_SECRET`** — trocar o default antes de qualquer deploy.
3. As rotas protegidas (consultas, notificações, etc.) ainda **não usam o middleware** — aplicar `auth.Middleware` nelas quando forem implementadas (BB/FA).
4. Próxima trilha natural: **BB1** (slots/disponibilidade + `/api/doctors?date=`) ou **BB2** (POST agendamento + confirmação).
