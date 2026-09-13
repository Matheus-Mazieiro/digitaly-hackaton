#!/usr/bin/env bash
# Teste de integração — BB1 (disponibilidade), BB2 (agendamento) e BB3 (notificações).
#
# Pré-requisitos:
#   - Postgres rodando e migrado (bash scripts/db-setup-mac.sh  ou  db-setup-linux.sh)
#   - go instalado
#
# O script: sobe o servidor capturando o log (para ler os códigos 2FA),
# roda o fluxo completo e imprime ✅/❌. Sai com código != 0 se algo falhar.

set -uo pipefail

PORT="${PORT:-8085}"
BASE_URL="${BASE_URL:-http://localhost:$PORT}"
LOG_FILE="${LOG_FILE:-/tmp/digitaly-server.log}"
BACK_DIR="$(cd "$(dirname "$0")/.." && pwd)"

PASS=0
FAIL=0

ok()   { echo "  ✅ $1"; PASS=$((PASS+1)); }
fail() { echo "  ❌ $1"; FAIL=$((FAIL+1)); }

assert_eq() {
  local desc="$1" expected="$2" actual="$3"
  if [ "$expected" = "$actual" ]; then ok "$desc"; else fail "$desc (esperado '$expected', veio '$actual')"; fi
}

# j '<expr>' extrai um campo do JSON vindo do stdin (vazio se inválido).
j() { python3 -c "import sys,json;d=json.load(sys.stdin);print(d$1)" 2>/dev/null || true; }

# --- sobe o servidor com o log capturado ---
echo "== Iniciando servidor em $BASE_URL (log: $LOG_FILE) =="
lsof -ti:"$PORT" 2>/dev/null | xargs kill 2>/dev/null || true
: > "$LOG_FILE"
(cd "$BACK_DIR" && go run ./cmd/server >> "$LOG_FILE" 2>&1 &)

for _ in $(seq 1 30); do
  curl -s "$BASE_URL/health" >/dev/null 2>&1 && break
  sleep 1
done
curl -s "$BASE_URL/health" >/dev/null 2>&1 || { echo "servidor não subiu"; exit 1; }
ok "servidor no ar"

# --- login (2FA com código lido do log) ---
login() {
  local email="$1" pending tok code verify
  pending=$(curl -s -X POST "$BASE_URL/api/auth/login" \
    -H 'Content-Type: application/json' \
    -d "{\"email\":\"$email\",\"senha\":\"123456\"}")
  tok=$(echo "$pending" | j "['pendingToken']")
  sleep 1
  code=$(grep -o "código de verificação para $email: [0-9]\{6\}" "$LOG_FILE" | tail -1 | grep -o '[0-9]\{6\}')
  verify=$(curl -s -X POST "$BASE_URL/api/auth/verify" \
    -H 'Content-Type: application/json' \
    -d "{\"pendingToken\":\"$tok\",\"code\":\"$code\"}")
  echo "$verify" | j "['token']"
}

echo "== Login =="
P1J=$(login "nathalia@email.com")
D3J=$(login "camila.ferraz@digitalyhub.com")
[ -n "$P1J" ] && ok "login paciente (p1)" || fail "login paciente"
[ -n "$D3J" ] && ok "login médico (d3)" || fail "login médico"

# próxima data útil (seg–sex)
DATE=$(python3 -c 'import datetime; d=datetime.date.today()+datetime.timedelta(days=1)
while d.weekday()>=5: d+=datetime.timedelta(days=1)
print(d.strftime("%Y-%m-%d"))')

echo "== BB1 — disponibilidade (data $DATE) =="
SLOTS=$(curl -s "$BASE_URL/api/doctors/d3/slots?date=$DATE")
echo "$SLOTS" | grep -q '"' && ok "GET /doctors/d3/slots retorna horários" || fail "GET /doctors/d3/slots vazio"

DOCTORS=$(curl -s "$BASE_URL/api/doctors?specialty=geral&date=$DATE")
echo "$DOCTORS" | grep -q '"slots"' && ok "GET /doctors?date= retorna campo slots" || fail "GET /doctors sem slots"

SLOT=$(echo "$SLOTS" | python3 -c 'import sys,json;d=json.load(sys.stdin);print(d[0] if d else "")' 2>/dev/null || true)
[ -n "$SLOT" ] && ok "primeiro horário livre: $SLOT" || fail "nenhum horário livre em $DATE"

echo "== BB2 — agendamento =="
CREATE=$(curl -s -X POST "$BASE_URL/api/appointments" \
  -H "Authorization: Bearer $P1J" -H 'Content-Type: application/json' \
  -d "{\"doctorId\":\"d3\",\"date\":\"$DATE\",\"time\":\"$SLOT\",\"motivo\":\"Teste integração\"}")
APPID=$(echo "$CREATE" | j "['id']")
[ -n "$APPID" ] && ok "POST /appointments criou consulta ($APPID)" || fail "POST /appointments falhou: $CREATE"

sleep 1
CODE=$(grep -o 'código de verificação para nathalia@email.com: [0-9]\{6\}' "$LOG_FILE" | tail -1 | grep -o '[0-9]\{6\}')
CONFIRM=$(curl -s -X POST "$BASE_URL/api/appointments/$APPID/confirm" \
  -H "Authorization: Bearer $P1J" -H 'Content-Type: application/json' \
  -d "{\"code\":\"$CODE\"}")
echo "$CONFIRM" | grep -q '"ok":true' && ok "confirm com código" || fail "confirm falhou: $CONFIRM"

LIST=$(curl -s "$BASE_URL/api/appointments" -H "Authorization: Bearer $P1J")
echo "$LIST" | grep -q "$APPID" && ok "paciente vê a consulta na lista" || fail "consulta não aparece na lista do paciente"

START=$(curl -s -X POST "$BASE_URL/api/appointments/$APPID/start" -H "Authorization: Bearer $D3J")
echo "$START" | grep -q '"ok":true' && ok "médico inicia a consulta" || fail "start falhou: $START"

echo "== BB3 — notificações =="
NOTIF_D=$(curl -s "$BASE_URL/api/notifications" -H "Authorization: Bearer $D3J")
echo "$NOTIF_D" | grep -q 'Nova consulta confirmada' && ok "médico recebeu notificação de confirmação" || fail "notificação do médico ausente"

NOTIF_P=$(curl -s "$BASE_URL/api/notifications" -H "Authorization: Bearer $P1J")
echo "$NOTIF_P" | grep -q 'Seu médico entrou' && ok "paciente recebeu notificação de início" || fail "notificação do paciente ausente"

NID=$(echo "$NOTIF_P" | python3 -c 'import sys,json;d=json.load(sys.stdin);print(d[0]["id"] if d else "")' 2>/dev/null || true)
if [ -n "$NID" ]; then
  READ=$(curl -s -X PATCH "$BASE_URL/api/notifications/$NID/read" -H "Authorization: Bearer $P1J")
  echo "$READ" | grep -q '"ok":true' && ok "marcar notificação como lida" || fail "marcar lida falhou: $READ"
fi

echo "== Erros =="
HTTP=$(curl -s -o /dev/null -w '%{http_code}' "$BASE_URL/api/appointments")
assert_eq "sem token → 401" "401" "$HTTP"

HTTP=$(curl -s -o /dev/null -w '%{http_code}' -X POST "$BASE_URL/api/appointments" \
  -H "Authorization: Bearer $P1J" -H 'Content-Type: application/json' \
  -d "{\"doctorId\":\"d3\",\"date\":\"$DATE\",\"time\":\"$SLOT\",\"motivo\":\"dup\"}")
assert_eq "double booking → 409" "409" "$HTTP"

HTTP=$(curl -s -o /dev/null -w '%{http_code}' -X POST "$BASE_URL/api/appointments" \
  -H "Authorization: Bearer $D3J" -H 'Content-Type: application/json' \
  -d "{\"doctorId\":\"d3\",\"date\":\"$DATE\",\"time\":\"10:00\",\"motivo\":\"x\"}")
assert_eq "médico tentando agendar → 403" "403" "$HTTP"

HTTP=$(curl -s -o /dev/null -w '%{http_code}' -X POST "$BASE_URL/api/appointments" \
  -H "Authorization: Bearer $P1J" -H 'Content-Type: application/json' \
  -d "{\"doctorId\":\"d3\",\"date\":\"$DATE\",\"time\":\"22:00\",\"motivo\":\"x\"}")
assert_eq "horário fora da grade → 409" "409" "$HTTP"

echo
echo "=========================================="
echo "  Resultado: $PASS passaram · $FAIL falharam"
echo "=========================================="
[ "$FAIL" -eq 0 ] || exit 1
