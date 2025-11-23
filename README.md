
## Tech Stack

- **Backend:** Express.js 5, TypeScript, Swagger/OpenAPI
- **DB:** In-memory objects
- **Frontend:** React 19, Vite, TanStack Router, TanStack Query, Tailwind CSS
- **Testing:** Vitest (unit), Playwright (e2e)

---

## Getting Started

### Prerequisites

- Node.js >= 18.18.0
- npm >= 9.0.0

### Installation

```bash
# Install dependencies for all workspaces (from root dir)
npm install
```

---

## Development Mode

Run the application locally by.

```bash
# Copy env file (defaults to PORT=3000)
cp api/env.example api/.env 

# Terminal 1 - Start API (port 3000)
npm run dev:api

# Terminal 2 - Start Client (port 3001)
npm run dev:client
```

**Access the application:**
- Frontend: http://localhost:3001
- API: http://localhost:3000
- API Documentation: http://localhost:3000/api-docs

---

## Testing

```bash
# Run API tests
npm run test:api

# Run Client tests
npm run test:client

# Run E2E tests (requires API and Client running)
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui
```

### Features worth mentioning

**1. Profile Chaining (Based-On Cascading)**
- Create pricing profiles based on other profiles for layered discounts
- Example: VIP Profile (-10%) → Tenure Discount (-5%) → Global Price
- Recursive calculation walks the entire chain to compute final prices

**2. Preview Before Save**
- Dedicated `/preview` endpoint calculates prices without persisting changes
- "Refresh" indicator shows when preview is stale after draft changes

**3. Profile Name Uniqueness**
- Enforces unique profile names within each organization

**4. Inline Table Editing**
- Double-click adjustment cells to edit values in place
- Keyboard navigation (Enter to save, Escape to cancel)

**9. Testing**
- Unit tests for pricing calculation formulas
- E2E tests covering a basic happy path for profile creation
- Frontend component tests for form validation (product form)


## Decision tradeoffs & Future work

- **Zod as single source of truth** – One schema drives validation, TS types, and Swagger via `@asteasolutions/zod-to-openapi`. Keeps contracts in sync; couples us to Zod. Frameworks like NestJS often use class-validator, Elysia uses Zod-first—this matches that single-schema pattern.

- **Functional module pattern** – Express routes/services/repositories are plain functions, no DI container. Lightweight for the challenge; at scale we’d lean on DI/lifecycle (e.g., NestJS modules/providers or Elysia plugins) for scoping, testing, and cross-cutting concerns.

- **Custom draft state management** – A bespoke `useProfileDraft` hook handles dirty state, preview, and saves instead of a form lib. Precise control for this flow, but more wiring than common form libraries; larger forms would move to React Hook Form to match ecosystem norms.

- **Three-layer testing strategy** – Unit + Playwright E2E, minimal integration tests. Fast feedback but contract gaps can slip; frameworks like Nest make API integration tests easy via TestingModule—production would add those.

- **Fuzzy search** – Fuse.js over filtered arrays, no pagination. Fine for small in-memory datasets; production would use DB/search index (MongoDB Atlas Search/PG trigram) with pagination.

- **Based-on cycles prevention** – Backend should reject cyclic profile references; frontend should filter out options that would loop, and a new route for “available base profiles” endpoint to make this explicit.

- **Money math via number** – Prices use JS numbers with `toFixed(2)`; acceptable here but can drift. Production would move to a decimal/money lib.

- **TanStack Router + Query** – there are others 3rd party libs that essentially do the same job but im familia with these ones. Server state lives in TanStack Query; UI state is local. Simple now; cross-page shared state would need a light store (e.g., Zustand) or Context if scope grows.
 
- **Custom draft state, no form lib** – `useProfileDraft` handles dirty/preview/save manually. Precise control, but more wiring than a form library;

- **Search UX for small datasets** – Debounced Fuse-backed search, no pagination (`SearchProducts`). Fine for the challenge; production would add paging/infinite scroll and result counts.
