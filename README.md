# Grocery List

A small but production-minded grocery list app built on Angular 21. The
feature is deliberately narrow — view, add, edit, delete, and mark items
as bought — so the code can focus on the _foundation_ a real product
would grow on: clean separation of concerns, typed forms, a mockable
API boundary, accessibility, and a sensible tooling/testing baseline.

## Stack

| Layer          | Choice                                                 |
| -------------- | ------------------------------------------------------ |
| Framework      | Angular 21, standalone components, strict TS           |
| UI components  | Angular Material (M3 azure theme)                      |
| Layout / utils | Tailwind CSS v4 (via `@tailwindcss/postcss`)           |
| Forms          | Reactive Forms, `NonNullableFormBuilder`, typed        |
| HTTP           | `HttpClient` + `withFetch()`                           |
| Async state    | `rxResource` for the list, `signal`s for local state   |
| Mock backend   | JSON Server (`db.json`)                                |
| Tooling        | ESLint + Prettier + Husky + lint-staged + concurrently |
| Tests          | Vitest (jsdom) via `@angular/build:unit-test`          |

## Prerequisites

- Node.js **20.19+** or **22.12+** (Angular 21 requirement)
- npm 10+

## Setup

```bash
npm install
```

The `prepare` script installs Husky's Git hooks on first `npm install`.

## Running the app

For day-to-day work, run the Angular dev server and the mock API together:

```bash
npm run dev
```

- Angular dev server: <http://localhost:4200>
- JSON Server API: <http://localhost:3000/items>

You can also run them individually:

```bash
npm start           # Angular only
npm run server      # json-server only
```

The API base URL is wired through an `InjectionToken` (`API_CONFIG`) so
switching environments or pointing at a real backend is a one-line
change in `app.config.ts`.

## Scripts

| Script         | Purpose                                      |
| -------------- | -------------------------------------------- |
| `start`        | Angular dev server                           |
| `build`        | Production build                             |
| `watch`        | Incremental dev build                        |
| `test`         | Run the Vitest unit test suite               |
| `lint`         | ESLint across TypeScript and HTML templates  |
| `format`       | Prettier write                               |
| `format:check` | Prettier check (CI-friendly)                 |
| `server`       | JSON Server on port 3000 using `db.json`     |
| `dev`          | App + API concurrently                       |
| `prepare`      | Installs Husky hooks (runs on `npm install`) |

Pre-commit hook runs `lint-staged`: ESLint `--fix` and Prettier on
staged `*.ts` / `*.html` / `*.scss` / `*.json` / `*.md` files.

## Project structure

```
src/app/
├── core/                    Singleton, app-wide infrastructure
│   ├── config/              API config + InjectionToken
│   ├── interceptors/        (reserved — HTTP interceptors)
│   ├── models/              (reserved — cross-feature models)
│   └── services/            (reserved — cross-feature services)
├── shared/                  Reusable across features
│   ├── components/
│   │   └── confirm-dialog/  Generic "are you sure?" dialog
│   ├── directives/          (reserved)
│   ├── pipes/               (reserved)
│   ├── constants/           (reserved — cross-feature constants)
│   └── utils/               trimmed-required validator,
│                            getErrorMessage helper
├── features/
│   └── grocery-list/
│       ├── components/      Presentational pieces:
│       │                      grocery-item-form,
│       │                      grocery-list,
│       │                      grocery-list-item
│       ├── constants/       Amount / title / UX limits
│       ├── models/          GroceryItem + create/update DTOs
│       ├── pages/           Smart (route-level) components
│       │   └── grocery-list-page/
│       ├── services/        GroceryListApiService (HTTP only)
│       └── grocery-list.routes.ts
├── app.config.ts            Bootstrapped providers
├── app.routes.ts            App-level routes (lazy-loads feature)
├── app.ts                   Root shell (toolbar + <router-outlet />)
└── main.ts
```

Empty folders under `core/` and `shared/` are intentional skeletons —
they signal where future code should land without creating churn the
first time a cross-feature concern appears.

## Architecture decisions

**Feature-first over layer-first.** Everything a feature owns lives
inside `features/<feature>/`. `shared/` is only for truly reusable
building blocks (the confirm dialog, the `trimmedRequired` validator).
This keeps features deleteable and teams able to own a folder.

**Smart / dumb split stays strict.** The page
(`grocery-list-page`) owns state and talks to services. The list and
row components are purely presentational — they surface intent via
outputs and never touch the API. The `grocery-item-form` is the one
piece of shared UI _within_ the feature and is used for both add and
edit flows (`initialValue`, `submitLabel`, `cancellable` inputs make
it adaptable).

**Configurable API boundary.** `GroceryListApiService` reads the base
URL from an `API_CONFIG` `InjectionToken`, so switching between JSON
Server, a staging backend, a file-replaced build, or a stubbed test
provider is a single-line change — no service code touches `environment.ts`.

**DTOs derived from the model.** `CreateGroceryItemDto = Omit<GroceryItem, 'id'>`
and `UpdateGroceryItemDto = Partial<Omit<GroceryItem, 'id' | 'createdAt'>>`.
Add a field on `GroceryItem` and it flows through both DTOs
automatically with the right mutability rules.

**`rxResource` for fetches, signals for local state.** The list
resource exposes `value`, `isLoading`, `error`, `reload`, and a writable
`value` that the page uses for optimistic toggling. No manual
`BehaviorSubject`s, no explicit `unsubscribe`s in components.

**Optimistic bought toggle.** The checkbox flips instantly via
`itemsResource.update(...)`; the server call rolls back to the
pre-change snapshot on failure. Create, edit, and delete are _not_
optimistic — they're lower-frequency and the reload is fast enough that
the simpler "reload on success" flow is a better trade-off than
custom reconciliation for edge cases like server-side validation.

**Error surfacing.** Initial load failures become a full-page error
block with a retry button; mutation failures use a Material snackbar.
This separation makes the recoverable path obvious: if you can't load
_anything_, there's nothing to do but retry; if a single action failed,
the rest of the UI is still usable.

**Accessibility defaults.**

- `aria-label`s on icon buttons and the bought checkbox (dynamically
  reflecting the action the click will perform).
- `role="alert"` on the load-error block, `aria-busy` + `aria-live` on
  the loading spinner and the "X of Y bought" summary.
- Keyboard: `Escape` cancels inline edit; focus is restored after
  dialog close via `restoreFocus: true`.

**Strict tooling.** `strict: true`, `noImplicitAny`, ESLint forbidding
`any`, enforced `consistent-type-imports`, enforced standalone
components, Prettier via `eslint-config-prettier` so formatting and
linting never conflict.

## Tradeoffs

- **No global state library.** A single, small feature with
  well-bounded server state doesn't benefit from NgRx or Signal Store.
  The page's signals + `rxResource` are enough. The moment a second
  feature needs the item list, extract a signal-backed store service
  under `features/grocery-list/services/` and inject it into both.
- **Optimistic updates are toggle-only.** Create and edit are the
  rarer / more error-prone paths (server validation could reject a
  blank title server-side), so they intentionally wait for the round
  trip. This keeps reconcilation code minimal.
- **No soft-delete / undo.** Deletion is final after confirmation.
  A "snackbar with undo" UX is a natural next step but was out of
  scope for the current feature set.
- **JSON Server doesn't generate timestamps.** The page adds
  `createdAt` / `updatedAt` at DTO construction time. A real backend
  would own these; this keeps the contract explicit for now.
- **Empty `core/` and `shared/` sub-folders.** Keeping them visible is
  a deliberate "here is where this will go" hint for reviewers and
  future contributors, in exchange for slightly louder directory
  listings.

## Future improvements

- Debounced optimistic rename/amount edits inline (no Save button).
- Undo-capable deletes via snackbar action.
- Server-side sorting and grouping (`bought` items drifting to the
  bottom), currently client-stable by `id`.
- Drag-to-reorder with persisted order field.
- Offline support + optimistic queue when the API is unreachable.
- E2E smoke suite (Playwright) covering the happy-path create / edit /
  bought / delete flow end to end against `json-server`.
- CI workflow: `lint`, `test`, `build` on PRs.
- `environment.ts` + file replacements for multi-env builds once the
  app targets more than a local mock API.
- Migrate the confirm dialog to a generic `provideConfirmService`
  helper once a second destructive flow appears.
