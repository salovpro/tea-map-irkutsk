# Чайная карта Иркутска

Карта чайных Иркутска: Next.js 16, React 19, Prisma 7 и PostgreSQL.

Next.js **не ставится глобально**. Он приходит вместе с зависимостями проекта (`npm install`) и запускается скриптами из `package.json`.

## Что установить на новый ноутбук

| Инструмент | Зачем | Минимум |
| --- | --- | --- |
| [Git](https://git-scm.com/) | Клонирование репозитория | любая свежая версия |
| [Node.js](https://nodejs.org/) | Next.js, npm, Prisma CLI | **20.9+** (в `.nvmrc` указан 22) |
| npm | Ставится вместе с Node.js | 10+ |
| PostgreSQL 16 | База заведений | локально или через Docker |
| [Docker Desktop](https://www.docker.com/products/docker-desktop/) (опционально) | Самый простой способ поднять Postgres | Compose v2 |

Редактор: [Cursor](https://cursor.com/) или VS Code. После открытия папки проекта поставьте рекомендованные расширения (Prisma, ESLint, Tailwind).

### Node.js через nvm (macOS / Linux / WSL)

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
# перезапустите терминал, затем:
nvm install
nvm use
node -v   # должно быть 22.x или новее 20.9
npm -v
```

На Windows удобнее [nvm-windows](https://github.com/coreybutler/nvm-windows), [fnm](https://github.com/Schniz/fnm) или официальный установщик Node.js 22 LTS. Для Next.js на Windows предпочтителен **WSL2**.

### PostgreSQL

Вариант A — Docker (рекомендуется):

```bash
docker compose up -d
```

Вариант B — системный Postgres. Создайте базу `irkmaptea` и пользователя, как в `.env.example`.

## Запуск проекта

```bash
git clone https://gitlab.com/mafiairk/irkmaptea.git
cd irkmaptea

cp .env.example .env
# при необходимости поправьте DATABASE_URL

nvm use          # если используете nvm
npm install      # Next, React, Prisma Client и остальные пакеты
npm run setup    # prisma db push + seed
npm run dev      # http://localhost:3000
```

`npm install` сам выполнит `prisma generate` (`postinstall`). Next.js в этом репозитории в dev запускается с Webpack (`next dev --webpack`), потому что PWA-плагин завязан на webpack. Turbopack: `npm run dev:turbo`.

Карта, список заведений и админка работают только при живом Postgres и заполненной базе. Без `DATABASE_URL` приложение стартует, но места не загрузятся.

## Переменные окружения

Файл `.env` (Prisma CLI читает именно его через `dotenv`):

| Переменная | Обязательна | Назначение |
| --- | --- | --- |
| `DATABASE_URL` | да | Postgres. Для локали добавьте `sslmode=disable`, иначе драйвер `pg` включит TLS |
| `ADMIN_ACCESS_CODE` | нет | Код входа в админку |
| `ADMIN_SESSION_TOKEN` | нет | Стабильное значение session cookie |
| `VENUE_STORAGE_PATH` | нет | Каталог логотипов заведений (по умолчанию `.local-storage/venue-images`) |

Админ-панель: путь задан в `src/lib/admin-constants.ts` (`ADMIN_BASE_PATH`).

## Полезные команды

```bash
npm run dev          # dev-сервер
npm run build        # production-сборка
npm run start        # запуск собранного приложения
npm run lint         # ESLint
npm run setup        # схема БД + тестовые данные
npm run db:push      # применить prisma/schema.prisma к базе
npm run db:seed      # заполнить заведениями
npm run db:studio    # GUI Prisma Studio
```

Миграций в репозитории пока нет: локальная схема синхронизируется через `prisma db push`.

## Стек

- Next.js 16 (App Router, `src/app`) + next-intl (ru / en / zh)
- React 19, Tailwind CSS 4
- Prisma ORM 7 + `@prisma/adapter-pg` + `pg`
- Leaflet (карта)
- PWA: `@ducanh2912/next-pwa`

## Если что-то не стартует

1. `node -v` < 20.9 — обновите Node.js.
2. `DATABASE_URL is not set` — нет файла `.env` или переменная пустая.
3. Ошибка SSL к локальному Postgres — в URL должен быть `?sslmode=disable`.
4. Порт 5432 занят — остановите другой Postgres или смените порт в `docker-compose.yml` и в `.env`.
5. Пустая карта — выполните `npm run setup`.
6. Prisma Client не найден — `npx prisma generate` (или повторный `npm install`).
