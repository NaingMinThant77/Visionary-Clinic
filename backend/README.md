# Backend — Competition Prep App

A NestJS REST API backing the practice frontend. Auth (JWT), a generic "Card"
product entity demonstrating every common form input type, and a shopping
cart — all persisted to PostgreSQL via Prisma ORM.

## Stack

- NestJS 11
- Prisma ORM + PostgreSQL
- Passport JWT (`@nestjs/jwt`, `passport-jwt`) for auth
- `class-validator` / `class-transformer` for DTO validation
- `multer` (via `@nestjs/platform-express`) for avatar / card image uploads

## Getting started

You need a local PostgreSQL server running (any recent version).

1. Copy `.env.example` to `.env` and set `DATABASE_URL` to your real Postgres
   credentials (host, user, password, database name):

   ```
   DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/competition_prep?schema=public"
   ```

   The database itself (`competition_prep` above) does not need to exist yet —
   `prisma migrate dev` creates it.

2. Install dependencies and run the initial migration:

   ```bash
   npm install
   npx prisma migrate dev --name init
   ```

   This creates the tables from `prisma/schema.prisma`, generates the Prisma
   Client, and runs the configured seed script (`prisma/seed.ts`) once the
   migration finishes.

3. Start the API:

   ```bash
   npm run start:dev
   ```

The API listens on **http://localhost:3000**, prefixed with `/api`
(e.g. `http://localhost:3000/api/cards`). Uploaded files are served from
`http://localhost:3000/uploads/...` (outside the `/api` prefix).

On boot the app also seeds (idempotently, only if missing) the same demo
data as `prisma/seed.ts`, so `npm run start:dev` alone always has working
data even if you skip the manual seed step:
- a demo user: **demo@example.com** / **password123**
- ~20 demo cards spread across all 6 categories (with picsum.photos placeholder images)

### Other scripts

```bash
npm run build             # compile to dist/
npm run start             # run compiled/dev build once (no watch)
npm run start:prod        # run the compiled dist/main.js
npm run lint               # eslint --fix
npm run prisma:generate   # regenerate the Prisma Client after schema changes
npm run prisma:migrate    # create/apply a new migration (prisma migrate dev)
npm run prisma:studio     # browse the database in Prisma Studio
```

`uploads/` contents are gitignored. To fully reset the database, drop and
recreate it (or `npx prisma migrate reset`), then restart the app.

## Endpoints

All routes are prefixed with `/api`. Endpoints, request fields, and response
shapes are unchanged from before — see `../API_CONTRACT.md` for full
request/response shapes; the frontend does not need any changes.

### Auth
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | – | `{ fullName, email, password }` → `{ accessToken, user }` |
| POST | `/auth/login` | – | `{ email, password }` → `{ accessToken, user }` |
| GET | `/auth/me` | required | current user |

### Users
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/users/me` | required | current user |
| PATCH | `/users/me` | required | update `fullName`, `bio`, `phone`, `address`, `avatarUrl` |
| POST | `/users/me/avatar` | required | multipart `file` → `{ avatarUrl }` |

See `../API_CONTRACT.md` for full request/response shapes.
