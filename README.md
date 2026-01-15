# School Portal — User Management

A small **React + TypeScript** application that showcases a **Directory** (users list and user details) alongside an **Analytics** area with charts.

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

## Live deployment
The application is deployed on Vercel and can be accessed here:
https://portal-user-management-education-space.vercel.app/

The deployment uses Vercel’s default static + SPA setup and is automatically updated on pushes to the main branch.

---

## Application behavior and permissions
The app uses role-based access control to demonstrate different permission levels.
Authentication is intentionally simplified (storage-based) to keep the focus on UX, architecture, and stable automated tests.

## Default login behavior (development & demo)
By default, the application starts logged in as an Admin user.

This choice is intentional and made to:

- Make it easier and quicker to review the project
- Give immediate access to all features without extra setup
- Avoid slowing reviewers down with a full login flow

The role can be changed via mocked authentication logic to simulate different permission levels.

## Roles
| Role    | Accessible areas     | Directory permissions                                       |
| ------- | -------------------- | ----------------------------------------------------------- |
| Admin   | Directory, Analytics | View details, edit details, selection + bulk actions        |
| Teacher | Directory, Analytics | View details, read-only (no edits), bulk actions restricted |
| Staff   | Analytics only       | Directory route is protected/inaccessible                   |

## Role model: identity vs privileges
The app uses a simple role model inspired by real-world permission systems.
Teacher and Staff are primary roles (a user’s identity). Admin is a privilege, but can also be a primary role.

Primary roles are mutually exclusive (a user is either Teacher or Staff). Admin is additive, granting extra permissions on top of the primary role.

## Bulk actions behavior

Bulk actions follow that model:

- Selecting Admin in a bulk action adds the Admin privilege to the user’s existing role
- Selecting Teacher or Staff replaces the user’s primary role with that selection
  
---

## Key implementation decisions

### Directory virtualization and performance

- Debounced search and filtering
  - The Directory toolbar uses debounced search inputs

    By debouncing the search input:
    - Typing remains fast and responsive
    - Filtering is applied only after the user pauses
    - Virtualization continues to perform efficiently at scale


- The Directory table is optimized using row virtualization via @tanstack/react-virtual
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

The UI and chart components are fully decoupled from the data source, so replacing mock data with live API endpoints requires no changes to the components.

## Testing strategy

### Unit testing

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

## Authentication
Authentication is intentionally simplified in this project to keep the focus on architecture, UX, and testing rather than backend integration.

#### Current approach:

Storage-based authentication:
- Role selection is mocked to simulate different user permissions
  
## Accessibility and design choices
The UI is built with accessibility in mind.

- A consistent color system is used to ensure sufficient contrast and readability
- Semantic HTML elements and clear labels are preferred wherever possible
- Visual cues (spacing, headings, grouping) are used to make the interface easier to scan and understand

While this is not a full accessibility audit, the goal is to establish good foundations that make the UI usable and easy to extend with more accessibility features over time.

## Styling and theming
Styling is handled with SCSS modules and a shared set of CSS variables.

Variables are reused across components to ensure visual consistency.

This makes it easy to:
- Adjust the theme in one place
- Maintain consistent contrast and spacing
- Extend the design system without duplicating values

## Reusable UI components
The project includes a small set of reusable UI components (Button and Select for now) that act as design system primitives.
- Centralize styling and behavior
- Ensure visual and interaction consistency
- Reduce duplication across features
- Improve accessibility by default

Variants (e.g. primary, danger, ghost) are handled at the component level, allowing features to remain focused on behavior rather than styling.

This approach makes it easier to scale the UI while keeping a consistent look and feel.

---

## Future improvements

### Data layer
- Replace mocked query hooks with real API endpoints
- Add retries for failed requests and improve error tracking

### Data persistence and UX
- Persist applied filters per user
- Restore table state (filters, sorting, pagination) between sessions

### Authentication and infrastructure
- Implement a real login flow
- Token-based authentication
- Add Docker support for:
  - Local development consistency
  - Easier CI/CD setup
  - Production-ready deployment pipelines
  
### Analytics and tracking
- Collect page views and user interactions
- Track filters, navigation, and edit attempts
- Store analytics events in a backend service

### Directory and analytics expansion
- Richer user profiles
- Additional charts (cohorts, active vs invited...)

### Project Goal: Data import
- CSV and Excel upload to import the data
- Schema validation and customised import
- Visualization of imported data in tables and charts

