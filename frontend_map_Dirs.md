src/
├── app.d.ts                     # TypeScript declaration file for the app
├── app.html                     # HTML template
├── app.css                      # Global CSS with Tailwind imports
│
├── lib/                         # Shared library code
│   ├── assets/                  # Static assets
│   │   ├── icons/               # SVG icons
│   │   └── images/              # Images
│   │
│   ├── components/              # Reusable components
│   │   ├── auth/                # Authentication components (existing)
│   │   ├── ui/                  # UI components
│   │   │   ├── Button.svelte    # Button component
│   │   │   ├── Card.svelte      # Card component
│   │   │   ├── Form.svelte      # Form component
│   │   │   ├── Input.svelte     # Input component
│   │   │   ├── Modal.svelte     # Modal component
│   │   │   ├── Table.svelte     # Table component
│   │   │   └── Toast.svelte     # Toast notification component
│   │   │
│   │   ├── expenses/            # Expense-specific components
│   │   │   ├── ExpenseForm.svelte
│   │   │   ├── ExpenseList.svelte
│   │   │   └── ExpenseFilters.svelte
│   │   │
│   │   ├── categories/          # Category management components
│   │   │   ├── CategoryList.svelte
│   │   │   └── CategoryForm.svelte
│   │   │
│   │   ├── budgets/             # Budget components
│   │   │   ├── BudgetForm.svelte
│   │   │   └── BudgetProgress.svelte
│   │   │
│   │   └── charts/              # Data visualization components
│   │       ├── BarChart.svelte
│   │       ├── LineChart.svelte
│   │       ├── PieChart.svelte
│   │       └── SummaryChart.svelte
│   │
│   ├── services/                # Service layer - Centralized approach
│   │   ├── api.ts               # Core API service with request handling
│   │   ├── auth.ts              # Auth service (existing)
│   │   ├── expenses.ts          # Expense service using api.ts
│   │   ├── categories.ts        # Categories service using api.ts
│   │   ├── budgets.ts           # Budgets service using api.ts
│   │   ├── reports.ts           # Reports service using api.ts
│   │   └── charts.ts            # Chart data transformation service
│   │
│   ├── stores/                  # Svelte stores
│   │   ├── auth.ts              # Auth store (existing)
│   │   ├── expenses.ts          # Expenses store
│   │   ├── categories.ts        # Categories store
│   │   ├── budgets.ts           # Budgets store
│   │   └── ui.ts                # UI state store (modals, toasts, etc.)
│   │
│   ├── types/                   # TypeScript types
│   │   ├── auth.ts              # Auth types (existing)
│   │   ├── api.ts               # API response/request types
│   │   ├── expenses.ts          # Expense related types
│   │   ├── categories.ts        # Category related types
│   │   ├── budgets.ts           # Budget related types
│   │   └── charts.ts            # Chart data types
│   │
│   └── utils/                   # Utility functions
│       ├── token.ts             # Token utilities (existing)
│       ├── format.ts            # Formatting utilities (date, currency)
│       ├── validation.ts        # Form validation utilities
│       └── helpers.ts           # General helper functions
│
├── routes/                      # SvelteKit routes
│   ├── +layout.svelte           # Root layout
│   ├── +layout.ts               # Root layout load function
│   ├── +page.svelte             # Home page
│   ├── +page.ts                 # Home page load function
│   │
│   ├── auth/                    # Auth routes (existing)
│   │   ├── login/
│   │   ├── register/
│   │   ├── forgot-password/
│   │   └── verify-email/
│   │
│   ├── dashboard/               # Dashboard route
│   │   ├── +page.svelte
│   │   └── +page.ts
│   │
│   ├── expenses/                # Expense management routes
│   │   ├── +page.svelte         # Expenses list
│   │   ├── +page.ts
│   │   ├── new/                 # Add new expense
│   │   │   ├── +page.svelte
│   │   │   └── +page.ts
│   │   └── [id]/                # Edit expense
│   │       ├── +page.svelte
│   │       └── +page.ts
│   │
│   ├── categories/              # Category management routes
│   │   ├── +page.svelte
│   │   ├── +page.ts
│   │   └── [id]/
│   │       ├── +page.svelte
│   │       └── +page.ts
│   │
│   ├── budgets/                 # Budget management routes
│   │   ├── +page.svelte
│   │   ├── +page.ts
│   │   └── [id]/
│   │       ├── +page.svelte
│   │       └── +page.ts
│   │
│   └── reports/                 # Analytics & reports routes
│       ├── +page.svelte         # Report dashboard
│       ├── +page.ts
│       ├── summary/             # Summary reports
│       │   ├── +page.svelte
│       │   └── +page.ts
│       ├── category/            # Category analysis
│       │   ├── +page.svelte
│       │   └── +page.ts
│       ├── time-series/         # Time series analysis
│       │   ├── +page.svelte
│       │   └── +page.ts
│       └── budget/              # Budget comparison
│           ├── +page.svelte
│           └── +page.ts
│
├── params/                      # SvelteKit param matchers
│   └── uuid.ts                  # UUID parameter matcher
│
└── hooks.server.ts              # SvelteKit server hooks for auth
