#!/usr/bin/env bash
# Cria/popula o banco PostgreSQL local (sem Docker).
# Idempotente: pode rodar quantas vezes quiser.
set -euo pipefail

PG_BIN="/opt/homebrew/opt/postgresql@18/bin"
DB_USER="${DB_USER:-digitaly}"
DB_PASS="${DB_PASS:-digitaly}"
DB_NAME="${DB_NAME:-digitaly}"

PSQL="$PG_BIN/psql"
MIGRATIONS_DIR="$(cd "$(dirname "$0")/../migrations" && pwd)"

# 1. Garante que o Postgres está rodando
if ! "$PG_BIN/pg_isready" -q 2>/dev/null; then
  echo ">> Iniciando postgresql@18 ..."
  brew services start postgresql@18 >/dev/null
  for _ in $(seq 1 30); do
    "$PG_BIN/pg_isready" -q 2>/dev/null && break
    sleep 1
  done
fi
"$PG_BIN/pg_isready" -q || { echo "Postgres não subiu"; exit 1; }
echo ">> Postgres rodando em localhost:5432"

# 2. Role + database (idempotente)
if ! "$PSQL" -d postgres -tAc "SELECT 1 FROM pg_roles WHERE rolname='$DB_USER'" | grep -q 1; then
  "$PSQL" -d postgres -c "CREATE ROLE $DB_USER LOGIN SUPERUSER PASSWORD '$DB_PASS';"
  echo ">> Role '$DB_USER' criado"
fi

if ! "$PSQL" -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'" | grep -q 1; then
  "$PG_BIN/createdb" --owner="$DB_USER" "$DB_NAME"
  echo ">> Database '$DB_NAME' criado"
fi

# 3. Migrations + seed
"$PSQL" -d "$DB_NAME" -f "$MIGRATIONS_DIR/001_schema.sql" >/dev/null
echo ">> Schema aplicado (001_schema.sql)"
"$PSQL" -d "$DB_NAME" -f "$MIGRATIONS_DIR/002_seed.sql" >/dev/null
echo ">> Seed aplicado (002_seed.sql)"
"$PSQL" -d "$DB_NAME" -f "$MIGRATIONS_DIR/003_verificacoes.sql" >/dev/null
echo ">> Migração aplicada (003_verificacoes.sql)"

echo
echo "OK! Banco '$DB_NAME' pronto."
echo "Connection string: postgres://$DB_USER:$DB_PASS@localhost:5432/$DB_NAME"
