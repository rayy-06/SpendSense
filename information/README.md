# SpendSense - AI Budgeting Assistant

An intelligent budgeting application powered by AI that helps users track spending, manage budgets, set financial goals, and receive personalized financial insights.

## Tech Stack

- **Frontend & Backend**: Next.js 15 (App Router) with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **AI**: Claude API (Anthropic) with tool calling and streaming
- **Styling**: Tailwind CSS
- **Authentication**: JWT with httpOnly cookies

## Features

### Core Features
- ✅ User authentication (email/password)
- ✅ Manual transaction entry (income/expense tracking)
- ✅ CSV/PDF upload with AI-powered parsing
- ✅ Category-based transaction organization
- ✅ Budget tracking with visual progress indicators
- ✅ Financial goal setting and progress tracking
- ✅ Spending analytics and insights
- ✅ Anomaly detection for unusual transactions
- ✅ Forecast simulator for what-if scenarios

### AI Assistant
- 7+ database-backed tools for financial analysis
- Streaming responses for real-time interaction
- Natural language queries about spending
- Personalized budget coaching
- Spending pattern analysis
- Goal progress tracking

## Setup Instructions

### Prerequisites

- Node.js 20.x or higher
- PostgreSQL database
- Anthropic API key (get one at https://console.anthropic.com/)

### 1. Database Setup

First, set up a PostgreSQL database. You can use a local installation or a cloud provider like:
- Neon (https://neon.tech/)
- Supabase (https://supabase.com/)
- Railway (https://railway.app/)

### 2. Environment Variables

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

Edit `.env` with your actual values:

```env
# Database - Replace with your PostgreSQL connection string
DATABASE_URL="postgresql://user:password@localhost:5432/spendsense?schema=public"

# JWT Secret - Generate a random string (e.g., using openssl rand -base64 32)
JWT_SECRET="your-random-secret-key-here"

# Claude API - Get from https://console.anthropic.com/
ANTHROPIC_API_KEY="your-anthropic-api-key"
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Database Migration

Run Prisma migrations to set up the database schema:

```bash
npx prisma migrate dev --name init
```

This creates all necessary tables (Users, Transactions, Categories, Budgets, Goals).

### 5. Generate Prisma Client

```bash
npx prisma generate
```

### 6. Run Development Server

```bash
npm run dev
```

The app will be available at http://localhost:3000

## Usage

### Getting Started

1. **Register an Account**: Navigate to `/register` and create a new account
2. **Login**: Sign in with your credentials
3. **Add Transactions**:
   - Use the "Add Transaction" button for manual entry
   - Upload CSV/PDF bank statements for bulk import
4. **Create Budgets**: Set spending limits for different time periods
5. **Set Goals**: Define financial goals and track progress
6. **Chat with AI**: Use the AI Assistant for insights and recommendations

### AI Assistant Capabilities

The AI assistant can:
- Analyze spending patterns by category
- Detect unusual or anomalous transactions
- Run forecast simulations for budget changes
- Track budget performance
- Monitor goal progress
- Provide personalized financial advice

Example queries:
- "What did I spend the most on last month?"
- "Show me any unusual transactions"
- "How would cutting my dining budget by 20% affect my monthly spending?"
- "Am I on track to meet my savings goals?"

## Project Structure

```
SpendSenseV2/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/                # API routes
│   │   │   ├── auth/           # Authentication endpoints
│   │   │   ├── transactions/   # Transaction CRUD
│   │   │   ├── budgets/        # Budget management
│   │   │   ├── goals/          # Goal tracking
│   │   │   ├── analytics/      # Analytics & anomaly detection
│   │   │   └── ai/             # AI chat endpoint
│   │   ├── dashboard/          # Dashboard pages
│   │   ├── login/              # Login page
│   │   ├── register/           # Registration page
│   │   └── layout.tsx          # Root layout
│   ├── components/             # React components
│   ├── lib/                    # Utilities
│   │   ├── auth.ts             # JWT authentication
│   │   ├── prisma.ts           # Prisma client
│   │   ├── analytics.ts        # Anomaly detection & forecasting
│   │   └── ai-agent.ts         # AI tool definitions & execution
│   └── middleware.ts           # Auth middleware
├── prisma/
│   └── schema.prisma           # Database schema
├── public/                     # Static assets
└── package.json
```

## Database Schema

- **User**: User accounts with authentication
- **Category**: Transaction categories (income/expense)
- **Transaction**: Financial transactions with amounts, dates, and categories
- **Budget**: Spending budgets with time periods
- **Goal**: Financial goals with target and current amounts

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Transactions
- `GET /api/transactions` - List transactions
- `POST /api/transactions` - Create transaction
- `PUT /api/transactions/[id]` - Update transaction
- `DELETE /api/transactions/[id]` - Delete transaction
- `POST /api/transactions/upload` - Upload and parse CSV/PDF

### Budgets & Goals
- `GET /api/budgets` - List budgets with spending
- `POST /api/budgets` - Create budget
- `GET /api/goals` - List goals
- `POST /api/goals` - Create goal
- `PATCH /api/goals/[id]` - Update goal progress

### Analytics
- `GET /api/analytics` - Get spending analytics
- `GET /api/analytics/anomalies` - Detect anomalies
- `POST /api/analytics/forecast` - Run forecast simulation

### AI
- `POST /api/ai/chat` - Stream AI chat responses (with tool calling)

## Development

### Run in Development Mode
```bash
npm run dev
```

### Build for Production
```bash
npm run build
npm start
```

### Prisma Studio (Database GUI)
```bash
npx prisma studio
```

## Security Notes

- Passwords are hashed with bcrypt
- JWTs are stored in httpOnly cookies
- API routes are protected with authentication middleware
- Never commit `.env` file to version control
- Use strong JWT_SECRET in production

## Future Enhancements

Potential features to add:
- Receipt OCR for image uploads
- Recurring transaction automation
- Budget alerts and notifications
- Data export (CSV, PDF reports)
- Multi-currency support
- Shared budgets for families/roommates
- Mobile app integration

## License

MIT

## Author

Built as a demonstration of AI-powered financial management tools.
