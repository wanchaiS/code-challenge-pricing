# Pricing Management System

A full-stack pricing management application with profile chaining, preview capabilities, and inline editing.

## Tech Stack

- **Backend:** Express.js 5, TypeScript, Swagger/OpenAPI
- **Database:** In-memory objects
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

## Development

Run the application locally:

```bash
# Copy env file (defaults to PORT=3000)
cp api/env.example api/.env

# Terminal 1 - Start API (port 3000)
npm run dev:api

# Terminal 2 - Start Client (port 3001)
npm run dev:client
```

### Access Points

- **Frontend:** http://localhost:3001
- **API:** http://localhost:3000
- **API Documentation:** http://localhost:3000/api-docs

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

## Key Features

### 1. Profile Chaining (Based-On Cascading)
Create pricing profiles based on other profiles for layered discounts.
- **Example:** VIP Profile (-10%) → Tenure Discount (-5%) → Global Price
- Recursive calculation walks the entire chain to compute final prices

### 2. Preview Before Save
Calculate prices without persisting changes.
- Dedicated `/preview` endpoint for non-destructive price calculations
- "Refresh" indicator shows when preview is stale after draft changes

### 3. Profile Name Uniqueness
Enforces unique profile names within each organization to prevent conflicts.

### 4. Inline Table Editing
Efficient data entry with keyboard-first navigation.
- Double-click adjustment cells to edit values in place
- Keyboard shortcuts: Enter to save, Escape to cancel

### 5. Comprehensive Testing
- **Unit tests:** Pricing calculation formulas
- **E2E tests:** Happy path for profile creation (Playwright)
- **Component tests:** Form validation (Vitest)


## Architecture Decisions & Tradeoffs

### Schema & Validation
**Zod as single source of truth**
- One schema drives validation, TypeScript types, and Swagger via `@asteasolutions/zod-to-openapi`
- **Benefit:** Keeps contracts in sync across the stack
- **Tradeoff:** Couples the system to Zod (similar to NestJS class-validator or Elysia's Zod-first approach)

### Backend Architecture
**Functional module pattern**
- Express routes/services/repositories are plain functions without a DI container
- **Benefit:** Lightweight and simple for this challenge
- **Future:** At scale, would benefit from DI/lifecycle management (e.g., NestJS modules or Elysia plugins) for scoping, testing, and cross-cutting concerns

### Frontend State Management
**Custom draft state (`useProfileDraft` hook)**
- Handles dirty state, preview, and saves without a form library
- **Benefit:** Precise control for this specific workflow
- **Tradeoff:** More manual wiring than React Hook Form; larger forms would justify a full form library

**TanStack Router + Query**
- Server state in TanStack Query built-in cache; UI state is local
- **Future:** Cross-page shared state would need Zustand or Context as the app grows

### Testing Strategy
**Three-layer approach (Unit + E2E)**
- Unit tests for business logic, Playwright for end-to-end flows
- **Benefit:** Fast feedback loops
- **Future:** Add integration tests (e.g., NestJS TestingModule style) to catch contract gaps

### Search & Data Handling
**Fuzzy search with Fuse.js**
- Client-side search over filtered arrays, no pagination
- **Suitable for:** Small in-memory datasets
- **Future:** DB/search index (MongoDB Atlas Search, PostgreSQL trigram) with pagination

**Money calculations using JavaScript numbers**
- Uses `toFixed(2)` for price formatting
- **Suitable for:** This prototype
- **Future:** Use a decimal/money library (e.g., Dinero.js) to avoid floating-point drift

### Known Limitations & Future Work
- **Cycle prevention:** Backend should reject cyclic profile references; frontend should filter invalid "based-on" options and add a dedicated endpoint for available base profiles
- **Search UX:** Debounced Fuse-backed search without pagination is fine for small datasets; production would add infinite scroll and result counts
