# Card Market — Frontend (Competition Practice)

A React + TypeScript reference app built to practice for a no-AI coding competition. It
implements a small marketplace ("cards") against the NestJS backend described in
`../API_CONTRACT.md`, demonstrating the common patterns you'd want to re-type from memory:
routing, protected routes, an axios client with interceptors, SWR data fetching,
react-hook-form + zod forms (every common input type), and shadcn/ui components.

See `CHEATSHEET.md` for copy-paste-sized snippets of each pattern.

## Stack

- Vite + React + TypeScript
- react-router-dom v7 (`createBrowserRouter`)
- axios (single instance, request/response interceptors)
- swr (all GET fetching, one hook per resource)
- react-hook-form + zod + `@hookform/resolvers`
- Tailwind CSS v3
- shadcn/ui (Radix UI primitives, "new-york" style)

## Running it

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the env file and point it at your backend (defaults already match the contract):

   ```bash
   cp .env.example .env
   ```

3. Start the backend (see `../backend`) so it's listening on `http://localhost:3000/api`.

4. Start the dev server:

   ```bash
   npm run dev
   ```

   The app runs at `http://localhost:5173`.

5. Build for production / type-check:

   ```bash
   npm run build
   ```

## Project structure

```
src/
  api/            axios instance + one file per resource (auth, users, cards, cart)
  components/     shared components: Nav, Footer, Layout, CartDrawer, ProtectedRoute,
                  CardForm, EmptyState, ErrorState, Loading
  components/ui/  shadcn/ui components (button, input, form, dialog, sheet, ...)
  context/        AuthContext (login/register/logout/user, backed by localStorage + useMe)
  hooks/          useCards, useCard, useCart, useMe, useDebounce
  lib/            utils.ts (the `cn` class-merge helper)
  pages/          one file per route
  routes.tsx      route table (createBrowserRouter)
  types.ts        shared TS types matching the API contract
  App.tsx, main.tsx
```

## Routes

| Path              | Page                                              | Protected |
| ------------------ | -------------------------------------------------- | --------- |
| `/`                | Card grid: search, category filter, pagination      | no        |
| `/login`           | Login form                                          | no        |
| `/register`        | Register form                                       | no        |
| `/cards/:id`       | Card detail, add to cart, edit/delete if owner       | no        |
| `/cards/new`       | Create card (every input type)                      | yes       |
| `/cards/:id/edit`  | Edit card (owner only, others redirected)            | yes       |
| `/profile`         | Edit profile + avatar upload                         | yes       |

The cart itself lives in a `Sheet` drawer opened from the nav bar's cart icon, not a route.

## Notable implementation choices / deviations from the brief

- **Tailwind v3 + Radix-based shadcn/ui, not whatever `shadcn@latest` defaults to today.**
  Running `npx shadcn@latest init` in this environment resolves to a brand-new preview
  stack: Tailwind v4 with `@import` syntax, a "base-nova" style, and **Base UI** primitives
  instead of Radix (different component API entirely — `data-checked`/`data-open` instead
  of the `data-state` attributes used by virtually every existing shadcn tutorial, blog
  post, and codebase). Since this repo's whole purpose is to encode "common patterns" the
  user can recognize and re-type under pressure, shipping that preview would work against
  the goal. I pinned to Tailwind v3 and initialized shadcn with `-b radix`, then hand-wrote
  the component files using the classic, long-stable Radix + CVA + `clsx`/`tailwind-merge`
  shadcn source (the version that matches shadcn's own docs and nearly everything written
  about it). Functionally there's no gap — same component set, same props, same usage.
- **`cn` helper** lives in `src/lib/utils.ts` as the standard `clsx` + `tailwind-merge`
  composition (`cn(...inputs) => twMerge(clsx(inputs))`), matching shadcn's classic source.
- **Sonner's `Toaster`** doesn't wire up `next-themes` (the classic shadcn snippet does,
  for dark-mode-aware toasts) since this app has no theme toggle — adding that dependency
  for a feature that's never exercised would be unnecessary weight for a study reference.
- **Tag options** for the checkbox group (`new-arrival`, `sale`, `limited`, `bestseller`,
  `exclusive`) are a fixed illustrative list — the contract only specifies `tags: string[]`
  without an enum, so any fixed set works to demonstrate the pattern.
- Everything else (field names, endpoints, request/response shapes, multipart upload
  fields) follows `API_CONTRACT.md` exactly.

## Build status

`npm run build` (`tsc -b && vite build`) passes cleanly with no type errors. `npm run dev`
was smoke-tested and serves correctly; full end-to-end testing against the live backend
was out of scope since it's being built in parallel.
