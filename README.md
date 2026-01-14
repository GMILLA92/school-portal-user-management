# School Portal — User Management

A small **React + TypeScript** application that showcases a **Directory** (users list and user details) alongside an **Analytics** area with interactive charts.

The project is meant as a starting point for a richer user-management platform in the education space.  
Going forward, the idea is to support CSV and Excel uploads so users can bring in their own data, choose what to include, and manage it through a fast, flexible table with filters, bulk actions, and visual insights.

The longer-term vision includes more detailed user profiles, a history of key actions performed on each user, and expanded analytics to better understand usage patterns and trends.  
For now, two charts are included as simple examples of how analytics could be presented and extended in the future.


Built to demonstrate:
- Solid frontend architecture
- Performance optimizations
- Testing strategies
- CI quality gates

---

## Tech stack

- **React + TypeScript + Vite**
- **Routing:** React Router
- **Server-state:** TanStack React Query (`@tanstack/react-query`)
- **Tables:** TanStack Table (`@tanstack/react-table`)
- **Virtualisation:** TanStack Virtual (`@tanstack/react-virtual`)
- **Charts:** Recharts
- **Unit & integration tests:** Vitest + React Testing Library
- **End-to-end tests:** Cypress
- **Code quality:** ESLint, Prettier, Husky, Commitlint
- **CI:** GitHub Actions (pull request pipeline)

---

## Getting started

### Requirements
- **Node.js** (Node 22 is used in CI)

### Install
```bash
npm ci
```

### Run locally
```bash
npm run dev
```

### Application URL
```md
http://127.0.0.1:5173
```

### Build and preview
```bash
npm run build
npm run preview
```

### Available scripts
```bash
npm run lint
npm run typecheck
npm run test
npm run test:coverage
npm run e2e
```

## Application behavior and permissions

The app uses role-based access control to demonstrate different permission levels.
Authentication is intentionally simplified (storage-based) to keep the focus on UX, architecture, and stable automated tests.

### Roles:
| Role    | Accessible areas     | Directory permissions                                       |
| ------- | -------------------- | ----------------------------------------------------------- |
| Admin   | Directory, Analytics | View details, edit details, selection + bulk actions        |
| Teacher | Directory, Analytics | View details, read-only (no edits), bulk actions restricted |
| Staff   | Analytics only       | Directory route is protected/inaccessible                   |

## Key implementation decisions

### Directory virtualization and performance

The Directory table is optimized using row virtualization via @tanstack/react-virtual.

- Rendering large tables is expensive
- Virtualization keeps the DOM footprint small
- Scrolling remains smooth with large datasets

#### Implementation:

- TanStack Table manages sorting and cell rendering
- TanStack Virtual is applied to rows only
- Existing styles and layout are preserved

#### Behavior:

- Only visible rows are rendered
- No additional network requests during scroll
- This is strictly a render optimisation

### Analytics charts

Charts are implemented using Recharts.

### Server-state management

The app uses TanStack React Query for async data handling and caching.

#### Benefits:
- Predictable loading, error, and success states
- Request caching and deduplication
- Clear data lifecycle management

The UI and chart components are decoupled from the data source—replacing mocks with real API endpoints should not require component changes.

## Testing strategy

### Unit and integration testing

#### Tools:

- Vitest
- React Testing Library

#### Commands:

```bash
npm run test
npm run test:coverage
```
### End-to-end testing

#### Tool:

- Cypress

#### Command:

```bash
npm run e2e
```

## CI pipeline
On pull requests targeting the main branch, GitHub Actions runs:

- Install dependencies (npm ci)
- Security audit (npm audit --audit-level=high)
- Lint the codebase
- Type checks
- Unit tests + coverage
- Production build
- Cypress end-to-end tests

All checks must pass before a pull request can be merged.

## Code quality and commit standards
- Prettier ensures consistent formatting
- ESLint enforces linting rules
- Husky manages Git hooks
- Commitlint enforces conventional commit messages

## Project structure
- `src/app` — router, layout shell, route guards
- `src/features/*` — domain modules (directory, analytics, auth)
- `src/shared` — shared UI + utilities
- `cypress/` — end-to-end tests
  
## Future improvements

### Authentication

- Real login flow
- Replace storage-based auth with JWT-based auth

### Data layer
- Replace mocked query hooks with real API endpoints
- Add request retry/backoff and better error telemetry

### Analytics and tracking

- Collect page views and user events
- Track filters, navigation, and edit attempts
- Batched and retry-safe analytics ingestion

### Directory and analytics expansion

- Richer user profiles
- Additional charts (status trends, cohorts, active vs invited)

### Data import

- CSV and Excel upload
- Schema validation
- Visualization of imported data in tables and charts

