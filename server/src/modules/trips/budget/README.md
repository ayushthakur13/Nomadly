# Budget Module

Financial planning and expense tracking for Nomadly trips. Covers the full stack — server-side aggregate model, service layer, HTTP API, and the React frontend module.

**Philosophy**: Budget awareness first, ledger second.  
**Architecture**: Financial aggregate pattern. `TripBudget` is the root entity; `Expense` documents are ledger entries keyed by `tripId`. All reads are driven by a single `BudgetSnapshot` DTO recomputed after every write.

---

## Server — Schemas

### TripBudget

```typescript
{
  tripId: ObjectId               // Unique ref to parent trip
  baseCurrency: string           // ISO currency code
  baseBudgetAmount?: number      // Optional overall target
  createdBy: ObjectId
  members: IBudgetMember[]
  rules: IBudgetRules
}

// IBudgetMember
{ userId, plannedContribution, role: 'creator'|'member', joinedAt, isPastMember }

// IBudgetRules
{ allowMemberContributionEdits, allowMemberExpenseCreation, allowMemberExpenseEdits }
```

### Expense

```typescript
{
  tripId: ObjectId
  title?: string
  amount: number                 // Normalized to 2 decimal places
  currency: string               // Must match TripBudget.baseCurrency
  category?: string
  paidBy: ObjectId               // Immutable after creation
  createdBy: ObjectId            // Immutable after creation
  splitMethod: 'equal' | 'custom'
  splits: { userId: ObjectId; amount: number }[]
  date?: Date
  notes?: string
}
```

### BudgetSnapshot DTO

```typescript
{
  budget: TripBudget
  expenses: Expense[]
  summary: { totalPlanned, totalSpent, remaining }
  memberSummaries: { userId, planned, spent, remaining }[]
}
```

---

## Server — Validation Rules

- All monetary values normalized to 2 decimal places at persistence boundary (`FinancialUtils.normalizeMoney()`)
- Sum of custom splits must equal expense amount (±0.01 tolerance)
- **Contribution update**: upward edits always allowed; downward edits blocked only if `newPlanned < spent && newPlanned < currentPlanned` *(see [Edge Cases](#edge-cases--fixes))*
- Past members (`isPastMember: true`) cannot write
- `paidBy`, `createdBy`, `tripId`, and `splitMethod` are immutable after expense creation

---

## Server — Split Methods

| Method | Behaviour |
|---|---|
| `equal` | Auto-split equally; floating-point drift applied to final participant |
| `custom` | Client provides full `splits` array; server validates sum matches amount |

Frontend labels: `equal` → **"Fair Split"**, `custom` → **"Custom Amounts"**

The `percentage` method was removed — equal + custom covers all practical cases.

---

## Server — BudgetService API

```typescript
// Budget
createBudget(tripId, userId, dto)               → BudgetSnapshot
getBudgetSnapshot(tripId, userId)               → BudgetSnapshot
updateBaseBudget(tripId, userId, dto)           → BudgetSnapshot  // creator only
updateMemberContribution(tripId, userId, ...)   → BudgetSnapshot

// Expenses
createExpense(tripId, userId, dto)              → BudgetSnapshot
updateExpense(tripId, expenseId, userId, dto)   → BudgetSnapshot
deleteExpense(tripId, expenseId, userId)        → BudgetSnapshot

// Cloning
cloneBudget(originalTripId, newTripId, userId, mode) → void
```

**Clone modes**:

| Mode | What is copied |
|---|---|
| `TEMPLATE` | Structure + members, contributions reset to 0 |
| `PLANNING` | Structure + members + contributions, no expenses |
| `FULL_HISTORY` | Complete duplicate including all expenses |

---

## Server — HTTP Endpoints

```
POST   /api/trips/:tripId/budget                         Create budget (creator only)
GET    /api/trips/:tripId/budget                         Full BudgetSnapshot
PATCH  /api/trips/:tripId/budget                         Update baseBudgetAmount (creator only)
PATCH  /api/trips/:tripId/budget/members/:userId         Update plannedContribution
POST   /api/trips/:tripId/expenses                       Create expense
PATCH  /api/trips/:tripId/expenses/:expenseId            Update expense
DELETE /api/trips/:tripId/expenses/:expenseId            Delete expense
```

---

## Server — Utilities & Cache

**`budget.utils.ts`** modules:

| Module | Responsibilities |
|---|---|
| `FinancialUtils` | `roundToTwo()`, `normalizeMoney()` |
| `ValidationUtils` | Amount, contribution, currency, split-sum, ObjectId validation |
| `MappingUtils` | DTO mapping, snapshot building, summary computation |
| `BudgetAccessUtils` | Permission enforcement, past-member blocking |
| `SplitUtils` | `computeSplits()` for `equal` and `custom`; drift correction |

**Cache**: `Trip.budgetSummary` is recomputed from the full ledger after every write via `syncTripBudgetSummary()`. Sync errors are caught and logged silently — they never fail the primary mutation.

---

## Server — File Structure

```
budget/
├── budget.controller.ts
├── budget.model.ts
├── budget.routes.ts
├── budget.service.ts
├── budget.utils.ts
├── expense.controller.ts
├── expense.model.ts
├── expense.routes.ts
├── index.ts
└── README.md
```

---

## Frontend — Module Layout

```
client/src/features/trips/workspace/modules/budget/
├── BudgetPage.tsx
├── index.ts
├── hooks/
│   ├── useBudget.ts
│   ├── useBudgetFilters.ts
│   ├── useBudgetPermissions.ts
│   ├── useBudgetStats.ts
│   ├── useMemberDetails.ts
│   └── index.ts
├── components/
│   ├── BudgetHeader.tsx
│   ├── BudgetMembers.tsx
│   ├── CreateBudgetForm.tsx
│   ├── CreateExpenseModal.tsx
│   ├── ExpenseRow.tsx
│   ├── ExpensesList.tsx
│   └── index.ts
└── utils/
    ├── constants.ts
    └── formatting.ts
```

---

## Frontend — Constants

**`EXPENSE_CATEGORIES`**: `Accommodation · Food & Drinks · Transport · Activities · Shopping · Entertainment · Health · Other`

- Expenses with no category or `'Other'` are both normalised to `'Other'` in filters, the category breakdown card, and insights.
- In edit dropdowns, `'Other'` is excluded from mapped options — the blank default option covers it, preventing a duplicate entry.

**`SPLIT_METHOD_LABELS`**: `{ equal: 'Fair Split', custom: 'Custom Amounts' }`

Both constants live in **`utils/constants.ts`**. Re-exported from `utils/formatting.ts` is `CATEGORY_DOT`, `getCategoryDot()`, `formatCurrency()`, and `formatDate()`.

---

## Frontend — Hooks

| Hook | Purpose |
|---|---|
| `useBudget` | Snapshot state + all CRUD actions. Returns `snapshot`, `loading`, `actionLoading`, `error`, and all action functions. |
| `useBudgetPermissions(snapshot)` | Derives `isCreator`, `canAddExpense`, `canEditBaseBudget`, `canEditContribution(userId)`. Normalizes IDs via `String(v).trim()`. |
| `useMemberDetails` | Fetches `TripMember` records once on mount. Exposes `getMemberName(userId)` and `membersWithDetails` map (for `profilePicUrl`). Called **once in `BudgetPage`** — `getMemberName` and `membersWithDetails` are threaded down as props to `BudgetHeader`, `BudgetMembers`, `ExpensesList` → `ExpenseRow`, and `CreateExpenseModal`. |
| `useBudgetFilters(expenses)` | Client-side category / member / date-range filtering + sort. |
| `useBudgetStats(snapshot)` | Memoized analytics: `expensesByCategory`, `expensesByMember`, `averageExpenseAmount`, `largestExpense`, `recentExpenses`. |

---

## Frontend — Components

### `BudgetPage`

Page root. Owns three modal state flags: `showCreateModal`, `showBudgetForm`, `showContributionsModal`.

Calls `useMemberDetails()` **once** and passes `getMemberName` + `membersWithDetails` as props to all child components that need member name or avatar resolution. This keeps the member-details fetch to a single request per page load.

Layout when a budget exists:
```
PageHeader  ("Budget" title · "Contributions" ghost button · "Add expense" primary
             + subtitle stats row: wallet / receipt / piggyBank icons with my spend figures)
BudgetHeader  (4 stat cards + base budget editor)
ExpensesList  (full width)
InfoModal[Contributions]  (portal overlay → BudgetMembers)
```

The Contributions overlay has **two entry points**: the "Contributions" ghost button in `PageHeader`, and clicking the **Committed** stat card in `BudgetHeader` (via `onOpenContributions` prop). Both set the same state — single source of truth.

### `BudgetHeader`

**Base budget editor** — creator only. Shows mismatch hints: amber "Short by X" when `baseBudgetAmount > totalPlanned`, emerald "Buffer of X" when below.

**4 stat cards** (2×2 mobile / 4×1 lg+):

| Card | Label | Clickable | Opens |
|---|---|---|---|
| Committed | Total planned contributions | ✅ | Contributions overlay |
| Spent | Total logged spend | ✅ (if any member spent > 0) | Spenders breakdown modal |
| Remaining | Planned − Spent | ❌ | — |
| By Category | Top-3 category list | ✅ (if expenses exist) | Full category breakdown modal |

All four cards share identical DOM structure. Non-interactive cards render the chevron icon with `opacity-0` for pixel-identical alignment. Button cards use `block text-left` to override the browser UA `inline-flex` default on `<button>`. The two `InfoModal` overlays (`showCategoryModal`, `showSpendersModal`) are rendered **outside** the grid `<div>` — they are siblings of the grid, not children.

Props: `snapshot`, `canEditBaseBudget`, `actionLoading`, `getMemberName`, `membersWithDetails`, `onUpdateBaseBudget`, `onClearBaseBudget`, `onOpenContributions`.

### `BudgetMembers`

Bare `divide-y` list — no card wrapper. Lives inside the Contributions `InfoModal`.

**Each member row**:
- **Avatar** — `profilePicUrl` photo or emerald initials fallback
- **Name** + **remaining badge** (green ≥ 0, red if over) + **pencil edit button**
- **Plan chip** (`bg-gray-100`) + **Spent chip** (`bg-rose-50`)
- **Progress bar** (`h-1.5`): emerald < 80% · amber ≥ 80% · red = over. Renders when `planned > 0 || spent > 0`.
- **Edit mode** — inline input with Save/Cancel pill buttons and live what-if preview

Permissions memoized per-member via `memberPermissionsMap`.

### `ExpenseRow` / `ExpensesList`

`ExpenseRow` is inline-editable. Category edit uses `<select>` — `<input list>` was dropped because pre-filled values only show subset matches. `ExpensesList` consumes `useBudgetFilters` and is full-width.

Both receive `getMemberName` as a prop from `BudgetPage` → `ExpensesList` → `ExpenseRow`. No `useMemberDetails()` call inside either component.

### `CreateExpenseModal`

Portal-rendered via `createPortal`. Receives `getMemberName` as a prop from `BudgetPage` — no internal `useMemberDetails()` call.

Features:
- Category selection via color-dot pill chips grid
- Split method via pill toggle (equal / custom)
- Custom split: per-member amount inputs with live balanced/over/under status indicator

---

## Frontend — Reusable UI Primitives

### `InfoModal` (`ui/common/InfoModal.tsx`)

Generic portal overlay replacing repeated `createPortal` + backdrop blocks.

```typescript
interface InfoModalProps {
  isOpen: boolean; title: string; subtitle?: string
  onClose: () => void; children: ReactNode
  size?: 'sm' | 'md'  // default: 'sm'
}
```

| Size | Panel | Body height | Use |
|---|---|---|---|
| `sm` | `max-w-sm` | `max-h-80` | Read-only info (category breakdown, insights) |
| `md` | `max-w-md` | `max-h-[60vh]` | Interactive content (BudgetMembers) |

### `PageHeader` (`ui/common/PageHeader.tsx`)

Extended with `subtitle?: ReactNode` (widened from `string`) — strings receive a `<p>` wrapper automatically; passing JSX renders it directly. Also supports `secondaryAction` prop — renders as a ghost button to the left of the primary action. Budget page passes a stats row (wallet / receipt / piggyBank icon + spend figures) as the subtitle.

---

## Edge Cases & Fixes

### Contribution increase blocked when already over budget

**Scenario**: `planned = ₹2,000`, `spent = ₹2,150`. Trying to set `planned = ₹2,100` was blocked.

**Root cause**: `if (newPlanned < spent)` blocked all values below spent — including upward edits when already in deficit.

**Fix** (`budget.service.ts`):
```typescript
// Block only if BOTH: still below spent AND moving in wrong direction
if (plannedContribution < spentByMember && plannedContribution < currentPlanned) {
  throw new Error('Planned contribution cannot be reduced below amount already spent');
}
```

| Current | Spent | New | Result |
|---|---|---|---|
| ₹2,000 | ₹2,150 | ₹2,100 | ✅ Upward edit — always allowed |
| ₹2,000 | ₹2,150 | ₹2,200 | ✅ Fully recovers deficit |
| ₹3,000 | ₹2,150 | ₹1,800 | ❌ Downward past spent |
| ₹3,000 | ₹2,150 | ₹2,500 | ✅ Downward but still above spent |
| ₹2,000 | ₹2,150 | ₹1,500 | ❌ Deepens deficit |

### Progress bar hidden when `planned = 0`

**Scenario**: Member has no planned contribution but appears in expense splits. Bar was hidden; red badge had nothing beneath it.

**Fix** (`BudgetMembers.tsx`):
```typescript
const spentPct = member.planned > 0
  ? Math.min(Math.round((member.spent / member.planned) * 100), 100)
  : member.spent > 0 ? 100 : 0;  // zero-plan → full red bar

// Guard: member.planned > 0  →  member.planned > 0 || member.spent > 0
```

---

## Integration Points

- **Called by**: `trip.service.ts` — `budgetService.cloneBudget()` during trip duplication
- **Calls**: `Trip` model (cache sync), `members.service.ts` frontend (member details + profile pictures)

---

## Examples

### Create Budget

```http
POST /api/trips/:tripId/budget
{ "baseCurrency": "INR", "baseBudgetAmount": 50000,
  "members": [{ "userId": "...", "plannedContribution": 25000 }, ...] }
```

### Create Expense (equal split)

```http
POST /api/trips/:tripId/expenses
{ "title": "Hotel", "amount": 3000, "currency": "INR",
  "category": "Accommodation", "paidBy": "...",
  "splitMethod": "equal",
  "splits": [{ "userId": "...", "amount": 1500 }, { "userId": "...", "amount": 1500 }] }
```

### Create Expense (custom split)

```http
POST /api/trips/:tripId/expenses
{ "title": "Group Dinner", "amount": 2400, "currency": "INR",
  "category": "Food & Drinks", "paidBy": "...",
  "splitMethod": "custom",
  "splits": [{ "userId": "...", "amount": 1200 }, { "userId": "...", "amount": 800 }, { "userId": "...", "amount": 400 }] }
```

### Update Contribution

```http
PATCH /api/trips/:tripId/budget/members/:userId
{ "plannedContribution": 28000 }
```

### Clone Budget

```typescript
await budgetService.cloneBudget(originalTripId, newTripId, userId, 'PLANNING');
```
