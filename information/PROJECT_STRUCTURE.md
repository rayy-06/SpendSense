# SpendSense - Quick Project Structure Reference

## Directory Tree

```
SpendSenseV2/
├── 📁 prisma/
│   └── schema.prisma               ← Database models (5 tables)
│
├── 📁 src/
│   ├── 📁 app/
│   │   ├── 📁 api/                ← Backend API Routes
│   │   │   ├── 📁 ai/
│   │   │   │   └── chat/
│   │   │   │       └── route.ts   ← AI assistant chat endpoint
│   │   │   ├── 📁 analytics/
│   │   │   │   ├── anomalies/
│   │   │   │   │   └── route.ts   ← Anomaly detection API
│   │   │   │   └── route.ts       ← General analytics
│   │   │   ├── 📁 auth/
│   │   │   │   ├── login/route.ts ← Login API
│   │   │   │   ├── logout/route.ts
│   │   │   │   ├── me/route.ts
│   │   │   │   └── register/route.ts
│   │   │   ├── 📁 budgets/
│   │   │   │   └── route.ts       ← Budget CRUD
│   │   │   ├── 📁 cache/
│   │   │   │   └── stats/route.ts ← Cache performance metrics
│   │   │   ├── 📁 categories/
│   │   │   │   └── route.ts       ← Category management
│   │   │   ├── 📁 goals/
│   │   │   │   ├── [id]/route.ts  ← Update/delete goal
│   │   │   │   └── route.ts       ← Get/create goals
│   │   │   └── 📁 transactions/
│   │   │       ├── [id]/route.ts  ← Update/delete transaction
│   │   │       ├── route.ts       ← Get/create transactions
│   │   │       └── upload/route.ts ← PDF upload
│   │   │
│   │   ├── 📁 dashboard/          ← Protected Pages (logged-in users)
│   │   │   ├── 📁 ai-assistant/
│   │   │   │   └── page.tsx       ← AI chat interface
│   │   │   ├── 📁 budgets/
│   │   │   │   └── page.tsx       ← Budget management UI
│   │   │   ├── 📁 goals/
│   │   │   │   └── page.tsx       ← Goals management UI
│   │   │   ├── 📁 transactions/
│   │   │   │   └── page.tsx       ← Transaction list UI
│   │   │   ├── layout.tsx         ← Dashboard sidebar wrapper
│   │   │   └── page.tsx           ← Main dashboard (charts)
│   │   │
│   │   ├── 📁 login/
│   │   │   └── page.tsx           ← Login page
│   │   ├── 📁 register/
│   │   │   └── page.tsx           ← Registration page
│   │   ├── layout.tsx             ← Root HTML wrapper
│   │   └── page.tsx               ← Landing page (/)
│   │
│   ├── 📁 components/             ← Reusable React Components
│   │   ├── LogoutButton.tsx
│   │   ├── SpendingChart.tsx      ← Recharts pie chart
│   │   └── UploadTransactions.tsx ← PDF upload form
│   │
│   ├── 📁 lib/                    ← Utility Libraries
│   │   ├── ai-agent.ts            ← AI tools + execution
│   │   ├── analytics.ts           ← Anomaly detection algorithm
│   │   ├── auth.ts                ← JWT helpers
│   │   ├── cacheInvalidation.ts   ← Cache clearing logic
│   │   ├── prisma.ts              ← Database client
│   │   └── queryCache.ts          ← LRU cache implementation
│   │
│   └── middleware.ts              ← Auth protection (runs before routes)
│
├── 📁 information/                ← Documentation (this folder)
│   ├── CACHING_SYSTEM.md
│   ├── COMPLETE_LEARNING_GUIDE.md
│   ├── PDF_UPLOAD_FIX.md
│   ├── PROJECT_STRUCTURE.md
│   └── README.md
│
├── .env                           ← Secrets (DON'T commit!)
├── .env.example                   ← Template (DO commit)
├── .gitignore                     ← Files to exclude from git
├── next.config.js                 ← Next.js configuration
├── package.json                   ← Dependencies
├── tailwind.config.ts             ← Tailwind configuration
└── tsconfig.json                  ← TypeScript configuration
```

---

## File Count by Category

### Backend (API Routes): 15 files
- Authentication: 4
- Transactions: 3
- Budgets: 1
- Goals: 2
- Analytics: 2
- AI Chat: 1
- Categories: 1
- Cache: 1

### Frontend (Pages): 8 files
- Dashboard: 5
- Auth: 2
- Landing: 1

### Components: 3 files
- Reusable UI components

### Libraries: 6 files
- Core utilities and helpers

### Configuration: 5 files
- TypeScript, Tailwind, Next.js, environment

---

## Key Files You MUST Understand

### 🔥 Top Priority (Read First)

1. **`prisma/schema.prisma`**
   - Database structure
   - Relationships between tables
   - **Lines**: 84

2. **`src/lib/auth.ts`**
   - How authentication works
   - JWT token creation/validation
   - **Lines**: 50

3. **`src/app/api/transactions/route.ts`**
   - Basic CRUD operations
   - Database queries with Prisma
   - **Lines**: 88

4. **`src/app/dashboard/page.tsx`**
   - React component structure
   - State management
   - Data fetching
   - **Lines**: 250

5. **`src/middleware.ts`**
   - Route protection
   - How auth is enforced
   - **Lines**: 40

### ⚡ High Priority (Read Next)

6. **`src/lib/ai-agent.ts`**
   - AI tool definitions
   - Tool execution logic
   - **Lines**: 336

7. **`src/app/api/ai/chat/route.ts`**
   - AI conversation flow
   - Tool calling implementation
   - **Lines**: 112

8. **`src/lib/queryCache.ts`**
   - LRU cache implementation
   - Performance optimization
   - **Lines**: 135

9. **`src/lib/analytics.ts`**
   - Anomaly detection algorithm
   - Statistical calculations
   - **Lines**: 83

10. **`src/app/dashboard/ai-assistant/page.tsx`**
    - AI chat UI
    - Message handling
    - **Lines**: 202

### 🎯 Medium Priority (Understand Patterns)

11. **`src/app/api/transactions/[id]/route.ts`** - Update/delete patterns
12. **`src/app/api/auth/login/route.ts`** - Login flow
13. **`src/app/api/auth/register/route.ts`** - Registration flow
14. **`src/app/dashboard/transactions/page.tsx`** - Complex UI with forms
15. **`src/components/SpendingChart.tsx`** - Data visualization

### 📚 Low Priority (Reference When Needed)

- Other API routes (similar patterns)
- Other dashboard pages (similar structure)
- Configuration files (boilerplate)

---

## Lines of Code (LOC) Breakdown

### Total Project Size: ~2,000 lines

**Backend (API + Libraries)**: ~1,200 lines
- API routes: ~800 lines
- Core libraries: ~400 lines

**Frontend (Pages + Components)**: ~800 lines
- Dashboard pages: ~600 lines
- Components: ~200 lines

**Configuration**: ~100 lines
- TypeScript, Tailwind, Next.js configs

**Documentation**: ~2,500 lines
- Learning guides, README

---

## Code You Wrote vs Generated

### ✅ 100% Your Code (~1,500 lines)
- All API route logic
- Authentication system
- AI agent tools
- Anomaly detection
- Cache implementation
- UI components
- Page layouts
- Business logic

### 🔄 Partially Generated (~300 lines)
- Boilerplate (you customized)
- API route structure (you filled in)
- Component templates (you modified)

### ⚙️ Auto-Generated (~200 lines)
- Prisma client (from schema)
- TypeScript types (from Prisma)
- Next.js routing (from file structure)

---

## API Endpoints Summary

### Authentication
```
POST   /api/auth/register     Create account
POST   /api/auth/login        Login
POST   /api/auth/logout       Logout
GET    /api/auth/me           Get current user
```

### Transactions
```
GET    /api/transactions      Get all transactions
POST   /api/transactions      Create transaction
PUT    /api/transactions/:id  Update transaction
DELETE /api/transactions/:id  Delete transaction
POST   /api/transactions/upload Upload PDF
```

### Budgets
```
GET    /api/budgets           Get all budgets
POST   /api/budgets           Create budget
```

### Goals
```
GET    /api/goals             Get all goals
POST   /api/goals             Create goal
PUT    /api/goals/:id         Update goal (progress)
DELETE /api/goals/:id         Delete goal
```

### Analytics
```
GET    /api/analytics         Get spending analytics
GET    /api/analytics/anomalies Detect anomalies
```

### AI
```
POST   /api/ai/chat           Chat with AI assistant
```

### Cache
```
GET    /api/cache/stats       Get cache performance
```

### Categories
```
GET    /api/categories        Get user categories
POST   /api/categories        Create category
```

---

## Database Tables

### User
- Stores: email, password (hashed), name
- Relations: Has many transactions, budgets, goals, categories

### Transaction
- Stores: amount, description, date, type (income/expense)
- Relations: Belongs to user, optionally belongs to category

### Budget
- Stores: amount limit, period (weekly/monthly/yearly), date range
- Relations: Belongs to user

### Goal
- Stores: name, target amount, current amount, deadline, status
- Relations: Belongs to user

### Category
- Stores: name, type (income/expense)
- Relations: Belongs to user, has many transactions

---

## React Components Hierarchy

```
Root Layout
├── Landing Page (/)
├── Login Page (/login)
├── Register Page (/register)
└── Dashboard Layout (/dashboard)
    ├── Sidebar (navigation)
    └── Content Area
        ├── Main Dashboard (/dashboard)
        │   ├── Summary Cards
        │   ├── SpendingChart
        │   └── Recent Transactions
        ├── Transactions Page (/dashboard/transactions)
        │   ├── UploadTransactions
        │   └── Transaction Table
        ├── Budgets Page (/dashboard/budgets)
        │   └── Budget Cards
        ├── Goals Page (/dashboard/goals)
        │   └── Goal Cards
        └── AI Assistant (/dashboard/ai-assistant)
            └── Chat Interface
```

---

## State Management Patterns

### Client-Side State (useState)
```typescript
const [data, setData] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
```

### Server-Side State (Prisma)
```typescript
const transactions = await prisma.transaction.findMany({
  where: { userId: session.userId }
});
```

### Cache State (LRU Cache)
```typescript
const cached = queryCache.get(userId, 'transactions');
if (cached) return cached;
// ... fetch from DB ...
queryCache.set(userId, 'transactions', data);
```

### Session State (JWT)
```typescript
const session = await getSession(); // From cookie
// session = { userId: '...', email: '...' }
```

---

## Common Patterns You'll See

### API Route Pattern
```typescript
export async function GET(request: NextRequest) {
  // 1. Get session
  const session = await getSession();
  if (!session) return 401;

  // 2. Get query params
  const { searchParams } = new URL(request.url);
  const limit = searchParams.get('limit');

  // 3. Query database
  const data = await prisma.model.findMany({ where: { userId: session.userId } });

  // 4. Return JSON
  return NextResponse.json({ data });
}
```

### React Page Pattern
```typescript
export default function Page() {
  // 1. State
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // 2. Fetch on mount
  useEffect(() => {
    async function loadData() {
      const res = await fetch('/api/endpoint');
      const json = await res.json();
      setData(json.data);
      setLoading(false);
    }
    loadData();
  }, []);

  // 3. Render
  if (loading) return <div>Loading...</div>;
  return <div>{data.map(item => ...)}</div>;
}
```

### Database Query Pattern
```typescript
const data = await prisma.model.findMany({
  where: { userId: session.userId },
  include: { relatedModel: true },
  orderBy: { createdAt: 'desc' },
  take: 20,
  skip: 0
});
```

---

## Quick Reference: Where to Find Things

| What You Need | Where to Look |
|---------------|---------------|
| Add new API endpoint | `src/app/api/[folder]/route.ts` |
| Add new page | `src/app/[folder]/page.tsx` |
| Add new database table | `prisma/schema.prisma` then `npx prisma db push` |
| Modify auth logic | `src/lib/auth.ts` or `src/middleware.ts` |
| Add AI tool | `src/lib/ai-agent.ts` (tools array + execution) |
| Change UI styling | Modify Tailwind classes in `.tsx` files |
| Add environment variable | `.env` (don't commit) + `.env.example` (commit) |
| Configure cache | `src/lib/queryCache.ts` |
| Modify anomaly detection | `src/lib/analytics.ts` |

---

## Testing the App

### Manual Testing Checklist

**Authentication**:
- [ ] Register new account
- [ ] Login with correct credentials
- [ ] Login with wrong credentials (should fail)
- [ ] Access /dashboard without login (should redirect)
- [ ] Logout

**Transactions**:
- [ ] Create income transaction
- [ ] Create expense transaction
- [ ] Edit transaction
- [ ] Delete transaction
- [ ] Upload PDF (if you have test PDF)

**Budgets**:
- [ ] Create budget
- [ ] View budget progress
- [ ] Exceed budget (see warning)

**Goals**:
- [ ] Create goal
- [ ] Update progress
- [ ] Complete goal
- [ ] Delete goal

**AI Assistant**:
- [ ] Ask "What did I spend the most on?"
- [ ] Ask "Are there any unusual transactions?"
- [ ] Ask "Show my recent transactions"
- [ ] Ask "How am I doing with my goals?"

**Cache**:
- [ ] Make same query twice (second should be faster)
- [ ] Check `/api/cache/stats` for hit rate

---

## Deployment Checklist

Before deploying to Vercel/Railway/Netlify:

- [ ] Remove all `console.log()` statements
- [ ] Add `.env.example` to repo
- [ ] Verify `.env` is in `.gitignore`
- [ ] Test build locally: `npm run build`
- [ ] Set environment variables in hosting platform
- [ ] Configure PostgreSQL database URL
- [ ] Run `npx prisma db push` on production DB
- [ ] Test all features in production
- [ ] Set up custom domain (optional)

---

## Performance Metrics

### Cache Performance
- Hit rate: 60-80% expected
- Cache hit latency: <1ms
- Cache miss latency: 50-150ms
- Overall improvement: 90-99% for cached queries

### Page Load Times (Development)
- Landing page: ~500ms
- Dashboard: ~1-2s (includes data fetch)
- API routes: 50-200ms (without cache)

### Database Indexes
- `userId + date` on transactions (for date range queries)
- `userId + categoryId` on transactions (for category filtering)
- `userId` on budgets, goals (for user data fetch)

---

**This structure supports approximately 2,000 lines of production code across 40+ files.**
