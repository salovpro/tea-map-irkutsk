#!/usr/bin/env bash
# One-shot local bootstrap: Node, PostgreSQL, npm packages, schema, seed.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

log() { printf '\n==> %s\n' "$*"; }

need_cmd() {
  command -v "$1" >/dev/null 2>&1
}

ensure_node() {
  if need_cmd node; then
    local major
    major="$(node -p "process.versions.node.split('.')[0]")"
    if [ "$major" -ge 20 ]; then
      log "Node.js $(node -v) уже установлен"
      return
    fi
    log "Нужен Node.js 20.9+, сейчас $(node -v)"
  fi

  if [ -s "$HOME/.nvm/nvm.sh" ]; then
    # shellcheck disable=SC1091
    . "$HOME/.nvm/nvm.sh"
  elif ! need_cmd nvm; then
    log "Ставлю nvm"
    curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
    export NVM_DIR="$HOME/.nvm"
    # shellcheck disable=SC1091
    . "$NVM_DIR/nvm.sh"
  fi

  log "Ставлю Node.js из .nvmrc"
  nvm install
  nvm use
}

ensure_postgres_docker() {
  if ! need_cmd docker; then
    return 1
  fi
  if docker info >/dev/null 2>&1; then
    log "Запускаю PostgreSQL через Docker Compose"
    docker compose up -d
    return 0
  fi
  return 1
}

ensure_postgres_apt() {
  if need_cmd psql && pg_isready -h 127.0.0.1 -p 5432 >/dev/null 2>&1; then
    log "PostgreSQL уже слушает 127.0.0.1:5432"
  else
    if ! need_cmd apt-get; then
      return 1
    fi
    log "Ставлю PostgreSQL через apt"
    sudo DEBIAN_FRONTEND=noninteractive apt-get update -y
    sudo DEBIAN_FRONTEND=noninteractive apt-get install -y postgresql postgresql-contrib
    if need_cmd service; then
      sudo service postgresql start || true
    fi
    sudo pg_isready || sudo pg_ctlcluster --all start || true
  fi

  log "Создаю роль postgres и базу irkmaptea"
  sudo -u postgres psql -v ON_ERROR_STOP=1 -c "ALTER ROLE postgres WITH LOGIN PASSWORD 'postgres' SUPERUSER;"
  sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname = 'irkmaptea'" | grep -q 1 \
    || sudo -u postgres createdb -O postgres irkmaptea
}

ensure_postgres() {
  if ensure_postgres_docker; then
    return
  fi
  if ensure_postgres_apt; then
    return
  fi
  echo "Не удалось поднять PostgreSQL. Установите Docker Desktop или PostgreSQL 16 и повторите." >&2
  exit 1
}

wait_for_postgres() {
  log "Жду готовности PostgreSQL"
  local i
  for i in $(seq 1 30); do
    if pg_isready -h 127.0.0.1 -p 5432 -d irkmaptea >/dev/null 2>&1; then
      return
    fi
    if PGPASSWORD=postgres psql "postgresql://postgres:postgres@127.0.0.1:5432/irkmaptea?sslmode=disable" -c 'SELECT 1' >/dev/null 2>&1; then
      return
    fi
    sleep 1
  done
  echo "PostgreSQL не ответил на 127.0.0.1:5432" >&2
  exit 1
}

ensure_env() {
  if [ ! -f .env ]; then
    log "Копирую .env.example → .env"
    cp .env.example .env
  else
    log ".env уже есть"
  fi
}

ensure_node
ensure_postgres
ensure_env
wait_for_postgres

log "Ставлю npm-зависимости (Next.js, Prisma, React…)"
npm install

log "Применяю схему Prisma и загружаю seed"
npm run setup

log "Готово. Запуск dev-сервера: npm run dev"
printf 'Откройте http://localhost:3000\n'
