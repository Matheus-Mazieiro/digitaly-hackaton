#!/usr/bin/env bash
# Cria/popula o banco PostgreSQL local (sem Docker).
# Idempotente: pode rodar quantas vezes quiser.

set -euo pipefail

DB_USER="${DB_USER:-digitaly}"
DB_PASS="${DB_PASS:-digitaly}"
DB_NAME="${DB_NAME:-digitaly}"

PSQL="$(which psql)"
CREATEDB="$(which createdb)"
PG_ISREADY="$(which pg_isready)"

MIGRATIONS_DIR="$(cd "$(dirname "$0")/../migrations" && pwd)"

# 1. Garante que o Postgres está rodando
if ! "$PG_ISREADY" -q; then
  echo ">> Iniciando PostgreSQL..."

  if command -v systemctl >/dev/null 2>&1; then
    sudo systemctl start postgresql
  else
    sudo service postgresql start
  fi

  for _ in $(seq 1 30); do
    "$PG_ISREADY" -q && break
    sleep 1
  done
fi

"$PG_ISREADY" -q || {
  echo "Postgres não subiu"
  exit 1
}

echo ">> Postgres rodando em localhost:5432"

# 2. Role + database (idempotente)
if ! sudo -u postgres "$PSQL" -tAc \
  "SELECT 1 FROM pg_roles WHERE rolname='$DB_USER'" | grep -q 1; then

  sudo -u postgres "$PSQL" -c \
    "CREATE ROLE $DB_USER LOGIN PASSWORD '$DB_PASS';"

  echo ">> Role '$DB_USER' criado"
fi

if ! sudo -u postgres "$PSQL" -tAc \
  "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'" | grep -q 1; then

  sudo -u postgres "$CREATEDB" \
    --owner="$DB_USER" "$DB_NAME"

  echo ">> Database '$DB_NAME' criado"
fi

# 3. Migrations + seed
sudo -u postgres "$PSQL" \
  -d "$DB_NAME" \
  < "$MIGRATIONS_DIR/001_schema.sql"

echo ">> Schema aplicado (001_schema.sql)"

sudo -u postgres "$PSQL" \
  -d "$DB_NAME" \
  < "$MIGRATIONS_DIR/002_seed.sql"

echo ">> Seed aplicado (002_seed.sql)"

sudo -u postgres "$PSQL" \
  -d "$DB_NAME" \
  < "$MIGRATIONS_DIR/003_verificacoes.sql"

echo ">> Migração aplicada (003_verificacoes.sql)"

sudo -u postgres "$PSQL" \
  -d "$DB_NAME" \
  < "$MIGRATIONS_DIR/004_verificacoes_ref.sql"

echo ">> Migração aplicada (004_verificacoes_ref.sql)"

echo
echo "OK! Banco '$DB_NAME' pronto."
echo "Connection string:"
echo "postgres://$DB_USER:$DB_PASS@localhost:5432/$DB_NAME"