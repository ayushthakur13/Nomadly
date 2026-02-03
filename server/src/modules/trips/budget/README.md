# Budget Module

Financial ledger management with expense tracking, split computation, budget planning, and trip cloning support.

**Architecture**: Financial aggregate pattern with TripBudget as root entity and Expense as ledger entries.

---

## TripBudget Schema

```typescript
{
  _id: ObjectId
  tripId: ObjectId               // Reference to parent trip (unique)
  baseCurrency: string           // ISO currency code (e.g., 'USD', 'INR')
  createdBy: ObjectId            // Trip creator who owns this budget
  members: IBudgetMember[]       // Array of trip members in budget
  rules: IBudgetRules            // Budget rules and permissions
  createdAt: Date
  updatedAt: Date
}

// Budget Member (embedded)
{
  userId: ObjectId               // Trip member ID
  plannedContribution: number    // Their budgeted amount (≥ spent)
  role: 'creator' | 'member'     // Creator or regular member
  joinedAt: Date                 // When they joined
  isPastMember: boolean          // Can past members be edited? No
}

// Budget Rules (embedded)
{
  allowMemberContributionEdits: boolean
  allowMemberExpenseCreation: boolean
  allowMemberExpenseEdits: boolean
}
```

---

## Expense Schema

```typescript
{
  _id: ObjectId
  tripId: ObjectId               // Reference to parent trip
  title?: string                 // Expense description
  amount: number                 // Amount spent (normalized to 2 decimals)
  currency: string               // ISO code (must match TripBudget.baseCurrency)
  category?: string              // Expense category
  paidBy: ObjectId               // Who paid (required)
  createdBy: ObjectId            // Who created expense
  splitMethod: 'equal' | 'custom' | 'percentage'
  splits: IExpenseSplit[]        // Breakdown of who owes what
  date?: Date                    // When expense occurred
  notes?: string                 // Additional details
  createdAt: Date
  updatedAt: Date
}

// Expense Split (embedded)
{
  userId: ObjectId               // Person in split
  amount: number                 // Their share (normalized to 2 decimals)
}
```

---

## Validation Rules

- All monetary values normalized to 2 decimal places
- Sum of splits must equal expense amount (±0.01 tolerance)
- Planned contribution cannot be less than member's spent amount
- Past members cannot write to expenses
- Exactly one creator per budget
- Currency must be valid ISO code
- Expense dates must be strings (ISO format or "now")

---

## Split Methods

- **Equal**: `splits` auto-calculated equally, with drift adjustment on last participant
- **Custom**: `splits` array provided by user, validated
- **Percentage**: Percentage amounts in `splits`, converted to currency amounts

---

## BudgetService API

### Budget Management

```typescript
createBudget(tripId: string, userId: string, dto: CreateBudgetDTO): Promise<BudgetSnapshot>
// Create budget with trip members

getBudgetSnapshot(tripId: string, userId: string): Promise<BudgetSnapshot>
// Fetch budget with all expenses and summaries

updateMemberContribution(tripId: string, userId: string, requesterId: string, dto: UpdateBudgetMemberDTO): Promise<BudgetSnapshot>
// Update member's planned contribution and sync cache
```

### Expense Management

```typescript
createExpense(tripId: string, userId: string, dto: CreateExpenseDTO): Promise<BudgetSnapshot>
// Create expense with splits and sync cache

updateExpense(tripId: string, expenseId: string, userId: string, dto: UpdateExpenseDTO): Promise<BudgetSnapshot>
// Update expense (guards immutable fields) and sync cache

deleteExpense(tripId: string, expenseId: string, userId: string): Promise<BudgetSnapshot>
// Delete expense and recompute cache
```

### Budget Cloning (Phase 5)

```typescript
cloneBudget(
  originalTripId: string,
  newTripId: string,
  cloningUserId: string,
  mode: 'TEMPLATE' | 'PLANNING' | 'FULL_HISTORY' = 'PLANNING'
): Promise<void>
```

**Clone Modes**:
- **TEMPLATE**: Copy structure and members, reset all contributions to 0 (fresh planning)
- **PLANNING**: Copy structure, members, and budgets but no expenses (reuse budget plan)
- **FULL_HISTORY**: Complete duplicate including all expenses (full ledger history)

### Internal Helpers

```typescript
syncTripBudgetSummary(tripId: string, budget: ITripBudget): Promise<void>
// Recompute Trip.budgetSummary from full ledger
```

---

## BudgetSnapshot DTO

```typescript
{
  _id: ObjectId
  tripId: ObjectId
  baseCurrency: string
  createdBy: ObjectId
  members: BudgetMember[]        // DTO version with nested summaries
  summary: BudgetSummary         // Trip-level aggregates
  memberSummaries: Record<userId, MemberBudgetSummary>  // Per-member details
  createdAt: Date
  updatedAt: Date
}

// Budget Summary (aggregated at trip level)
{
  totalBudgeted: number          // Sum of all planned contributions
  totalSpent: number             // Sum of all expense amounts
  totalSettled: number           // Total paid in settlements
}

// Member Budget Summary
{
  userId: ObjectId
  role: 'creator' | 'member'
  plannedContribution: number
  spent: number                  // Total of their own expenses
  owes: number                   // Calculated from splits
  settledWith: number            // Amount they've paid/received
}
```

---

## HTTP Endpoints

```
POST   /api/trips/:tripId/budget
       Create budget (trip creator only)
       Body: { baseCurrency: string, members?: CreateBudgetMemberDTO[] }

GET    /api/trips/:tripId/budget
       Get budget snapshot with all details
       Returns: { snapshot: BudgetSnapshot }

PATCH  /api/trips/:tripId/budget/members/:userId
       Update member's planned contribution
       Body: { plannedContribution: number }

POST   /api/trips/:tripId/expenses
       Create expense with splits
       Body: CreateExpenseDTO (amount, paidBy, splits, splitMethod, etc.)

PATCH  /api/trips/:tripId/expenses/:expenseId
       Update expense (guards immutable fields: createdBy, paidBy, tripId, splitMethod)
       Body: Partial<UpdateExpenseDTO>

DELETE /api/trips/:tripId/expenses/:expenseId
       Delete expense (creator can delete any, others own)
```

---

## Utility Modules (budget.utils.ts)

- **FinancialUtils**: `roundToTwo()`, `normalizeMoney()`
- **ValidationUtils**: ID/amount/contribution/date/currency/split validation
- **MappingUtils**: DTO mapping, snapshot building, summary computation
- **BudgetAccessUtils**: Member access checks, permission enforcement
- **SplitUtils**: Split computation (equal/custom/percentage) and validation

---

## Cache Strategy

- Trip.budgetSummary recomputed from full ledger after every write
- Not incremental (read-compute-write pattern)
- Synced automatically by service layer
- Ensures consistency across mutation operations

---

## Key Design Decisions

1. **Financial Normalization**: All values rounded to 2 decimals at persistence boundaries
2. **Aggregate Pattern**: TripBudget is financial root, Expense is ledger entry
3. **Permission Enforcement**: Creator override, member ownership, past member blocking
4. **Immutable Fields**: createdBy, paidBy, tripId, splitMethod cannot be updated
5. **Constraint Validation**: Planned ≥ spent for all members
6. **No Incremental Cache**: Trip cache recomputes from full ledger for correctness

---

## File Structure

```
budget/
├── budget.controller.ts        # HTTP request handlers (109 lines)
├── budget.model.ts             # Mongoose schema definition
├── budget.service.ts           # Business logic and operations (469 lines)
├── budget.routes.ts            # Route definitions
├── budget.utils.ts             # Utility modules (311 lines)
├── expense.controller.ts        # Expense HTTP handlers (113 lines)
├── expense.model.ts            # Expense schema
├── expense.routes.ts           # Expense routes
├── index.ts                    # Module exports
└── README.md                   # This file
```

---

## Integration Points

**Called by**:
- `trip.service.ts` - Budget cloning via `budgetService.cloneBudget()`
- Expense operations auto-sync Trip.budgetSummary

**Calls**:
- Trip model for cache synchronization
- Maps module for location data (if any)

---

## Examples

### Create Budget

```typescript
POST /api/trips/507f1f77bcf86cd799439011/budget
Content-Type: application/json

{
  "baseCurrency": "USD",
  "members": [
    { "userId": "507f1f77bcf86cd799439012", "plannedContribution": 1000 },
    { "userId": "507f1f77bcf86cd799439013", "plannedContribution": 1000 }
  ]
}
```

### Create Expense

```typescript
POST /api/trips/507f1f77bcf86cd799439011/expenses
Content-Type: application/json

{
  "title": "Hotel Booking",
  "amount": 300,
  "currency": "USD",
  "paidBy": "507f1f77bcf86cd799439012",
  "splitMethod": "equal",
  "splits": [
    { "userId": "507f1f77bcf86cd799439012", "amount": 150 },
    { "userId": "507f1f77bcf86cd799439013", "amount": 150 }
  ]
}
```

### Clone Budget

```typescript
Called from trip.service.ts during trip cloning:

await budgetService.cloneBudget(
  originalTripId,
  newTripId,
  userId,
  'PLANNING'  // or 'TEMPLATE' or 'FULL_HISTORY'
);
```

