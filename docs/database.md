# Banco de Dados (PostgreSQL) — Tutorial

Este guia explica como subir, popular e usar o banco do Digitaly Hub **sem Docker** (opção nativa via Homebrew). O Docker fica como alternativa no final.

---

## 1. Pré-requisitos

- macOS com **Homebrew**.
- **PostgreSQL 18** instalado: `brew install postgresql@18`
  - Binários ficam em `/opt/homebrew/opt/postgresql@18/bin/`.

> Se você ainda não tem, rode uma vez:
> ```bash
> brew install postgresql@18
> ```

---

## 2. Subir e popular (1 comando)

Na raiz do `back/`:

```bash
make db-setup
```

Esse comando roda `scripts/db-setup.sh`, que faz tudo de forma **idempotente** (pode rodar quantas vezes quiser):

1. Inicia o serviço `postgresql@18` (se ainda não estiver rodando).
2. Cria a role `digitaly` (senha `digitaly`, superuser).
3. Cria o banco `digitaly`.
4. Aplica `migrations/001_schema.sql` (as 4 tabelas).
5. Aplica `migrations/002_seed.sql` (dados de demonstração).

Sem o Makefile:

```bash
cd back
bash scripts/db-setup.sh
```

---

## 3. Conexão

| Item | Valor |
|---|---|
| Host | `localhost` |
| Porta | `5432` |
| Banco | `digitaly` |
| Usuário | `digitaly` |
| Senha | `digitaly` |
| Connection string (Go) | `postgres://digitaly:digitaly@localhost:5432/digitaly` |

---

## 4. Comandos úteis (Makefile)

```bash
make db-setup   # cria/popula (idempotente)
make db-psql    # abre o cliente psql conectado no banco digitaly
make db-reset   # DROP DATABASE e recria do zero (roda schema + seed)
```

---

## 5. Explorar o banco (psql)

Dentro do `psql` (`make db-psql`), alguns comandos úteis:

```sql
\d               -- lista tabelas
\d medicos       -- estrutura da tabela medicos
```

Consultas rápidas:

```sql
-- médicos cadastrados
SELECT id, nome, crm, especialidade, avaliacao_soma, n_consultas
FROM medicos ORDER BY id;

-- pacientes
SELECT id, nome, email, ativo FROM pacientes;

-- consultas
SELECT id, paciente, medico, status, motivo, hora FROM consultas ORDER BY hora;

-- notificações
SELECT id, tipo, lida, msg FROM notificacoes ORDER BY id;
```

---

## 6. Dados de demonstração (seed)

Todas as contas usam a senha **`123456`** (armazenada com hash bcrypt).

**Médicos** (`d1..d6`):

| id | Nome | CRM | Especialidade |
|---|---|---|---|
| d1 | Dra. Ana Martins | SP 112938 | derma |
| d2 | Dr. Rafael Costa | SP 88213 | cardio |
| d3 | Dra. Camila Ferraz | MG 75410 | geral |
| d4 | Dr. Bruno Lacerda | RJ 60122 | orto |
| d5 | Dra. Helena Duarte | SP 99031 | psiq |
| d6 | Dr. Marcos Vidal | SP 54098 | pedia |

**Paciente:**

| id | Nome | E-mail |
|---|---|---|
| p1 | Nathalia Souza | nathalia@email.com |

**Consultas de exemplo:** `c1` (concluída, com resumo) e `c2` (confirmada, para daqui a 2h — datas relativas a `now()`).

---

## 7. Resetar / recomeçar do zero

```bash
make db-reset
```

Equivalente manual:

```bash
/opt/homebrew/opt/postgresql@18/bin/psql -d postgres -c "DROP DATABASE IF EXISTS digitaly;"
make db-setup
```

---

## 8. Alternativa com Docker

Se preferir Docker (a imagem `postgres:16-alpine` já está no `docker-compose.yml` na raiz do projeto):

```bash
colima start          # ou abra o Docker Desktop
docker compose up -d
```

O schema e o seed rodam **automaticamente na primeira subida** (via `/docker-entrypoint-initdb.d`).

> Para refazer do zero com Docker: `docker compose down -v && docker compose up -d`.

---

## 9. Solução de problemas

| Sintoma | Causa provável | Solução |
|---|---|---|
| `make db-setup` não acha `psql` | `postgresql@18` é keg-only (binários fora do PATH) | O script usa o caminho absoluto `/opt/homebrew/opt/postgresql@18/bin/`; não precisa mexer no PATH |
| `pg_isready` → "no response" | Serviço parado | `brew services start postgresql@18` |
| `connection refused` no Go | Serviço parado ou porta diferente | rode `make db-setup`; confirme `brew services list` |
| Seed não roda de novo | Scripts só rodam na 1ª subida (Docker) | `docker compose down -v && docker compose up -d` |
| Quero outro nome/usuário/senha | Padrões `digitaly` | `DB_USER=... DB_PASS=... DB_NAME=... bash back/scripts/db-setup.sh` |
