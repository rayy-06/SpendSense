import Anthropic from '@anthropic-ai/sdk';
import { prisma } from './prisma';
import { detectAnomalies } from './analytics';
import { queryCache } from './queryCache';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Define tools for the AI agent
export const tools: Anthropic.Tool[] = [
  {
    name: 'get_transactions',
    description:
      'Get recent transactions for the user. Returns transaction history with amounts, dates, categories, and descriptions.',
    input_schema: {
      type: 'object',
      properties: {
        limit: {
          type: 'number',
          description: 'Number of transactions to retrieve (default 20, max 100)',
        },
        type: {
          type: 'string',
          enum: ['income', 'expense'],
          description: 'Filter by transaction type',
        },
      },
    },
  },
  {
    name: 'analyze_spending_patterns',
    description:
      'Analyze spending patterns by category over a time period. Returns breakdown of spending by category with totals and percentages.',
    input_schema: {
      type: 'object',
      properties: {
        days: {
          type: 'number',
          description: 'Number of days to analyze (default 30)',
        },
      },
    },
  },
  {
    name: 'detect_anomalies',
    description:
      'Detect unusual spending patterns and anomalies. Identifies transactions that are significantly different from normal spending habits.',
    input_schema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'get_budgets',
    description:
      'Get current budgets and their status. Returns budget limits, current spending, and remaining amounts.',
    input_schema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'get_goals',
    description:
      'Get financial goals and progress. Returns savings goals with target amounts and current progress.',
    input_schema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'get_summary',
    description:
      'Get overall financial summary. Returns total income, expenses, balance, and key metrics.',
    input_schema: {
      type: 'object',
      properties: {
        days: {
          type: 'number',
          description: 'Number of days to summarize (default 30)',
        },
      },
    },
  },
];

// Tool execution handlers with caching
export async function executeTool(
  toolName: string,
  toolInput: Record<string, any>,
  userId: string
): Promise<any> {
  const startTime = Date.now();

  switch (toolName) {
    case 'get_transactions': {
      const limit = Math.min(toolInput.limit || 20, 100);
      const cacheParams = { limit, type: toolInput.type };

      // Try cache first
      const cached = queryCache.get(userId, 'transactions', cacheParams);
      if (cached) {
        console.log(`[Cache HIT] get_transactions - ${Date.now() - startTime}ms`);
        return cached;
      }

      const where: any = { userId };
      if (toolInput.type) where.type = toolInput.type;

      const transactions = await prisma.transaction.findMany({
        where,
        include: { category: true },
        orderBy: { date: 'desc' },
        take: limit,
      });

      const result = transactions.map((t) => ({
        date: t.date.toISOString().split('T')[0],
        amount: t.amount,
        description: t.description,
        type: t.type,
        category: t.category?.name || 'Uncategorized',
      }));

      // Store in cache
      queryCache.set(userId, 'transactions', result, cacheParams);
      console.log(`[Cache MISS] get_transactions - ${Date.now() - startTime}ms`);

      return result;
    }

    case 'analyze_spending_patterns': {
      const days = toolInput.days || 30;
      const cacheParams = { days };

      // Try cache first
      const cached = queryCache.get(userId, 'spending_patterns', cacheParams);
      if (cached) {
        console.log(`[Cache HIT] analyze_spending_patterns - ${Date.now() - startTime}ms`);
        return cached;
      }

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const spendingByCategory = await prisma.transaction.groupBy({
        by: ['categoryId'],
        where: {
          userId,
          type: 'expense',
          date: { gte: startDate },
        },
        _sum: { amount: true },
        _count: true,
      });

      const categoryIds = spendingByCategory
        .map((s) => s.categoryId)
        .filter((id): id is string => id !== null);

      const categories = await prisma.category.findMany({
        where: { id: { in: categoryIds } },
      });

      const categoryMap = new Map(categories.map((c) => [c.id, c.name]));
      const total = spendingByCategory.reduce((sum, s) => sum + (s._sum.amount || 0), 0);

      const result = spendingByCategory.map((s) => ({
        category: s.categoryId ? categoryMap.get(s.categoryId) || 'Unknown' : 'Uncategorized',
        amount: s._sum.amount || 0,
        transactions: s._count,
        percentage: total > 0 ? ((s._sum.amount || 0) / total) * 100 : 0,
      }));

      // Store in cache
      queryCache.set(userId, 'spending_patterns', result, cacheParams);
      console.log(`[Cache MISS] analyze_spending_patterns - ${Date.now() - startTime}ms`);

      return result;
    }

    case 'detect_anomalies': {
      return await detectAnomalies(userId);
    }

    case 'get_budgets': {
      // Try cache first
      const cached = queryCache.get(userId, 'budgets');
      if (cached) {
        console.log(`[Cache HIT] get_budgets - ${Date.now() - startTime}ms`);
        return cached;
      }

      const budgets = await prisma.budget.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });

      const result = await Promise.all(
        budgets.map(async (budget) => {
          const spending = await prisma.transaction.aggregate({
            where: {
              userId,
              type: 'expense',
              date: {
                gte: budget.startDate,
                lte: budget.endDate,
              },
              ...(budget.categoryId && { categoryId: budget.categoryId }),
            },
            _sum: { amount: true },
          });

          const spent = spending._sum.amount || 0;
          return {
            period: budget.period,
            amount: budget.amount,
            spent,
            remaining: budget.amount - spent,
            percentUsed: (spent / budget.amount) * 100,
          };
        })
      );

      // Store in cache
      queryCache.set(userId, 'budgets', result);
      console.log(`[Cache MISS] get_budgets - ${Date.now() - startTime}ms`);

      return result;
    }

    case 'get_goals': {
      // Try cache first
      const cached = queryCache.get(userId, 'goals');
      if (cached) {
        console.log(`[Cache HIT] get_goals - ${Date.now() - startTime}ms`);
        return cached;
      }

      const goals = await prisma.goal.findMany({
        where: { userId, status: 'active' },
        orderBy: { createdAt: 'desc' },
      });

      const result = goals.map((g) => ({
        name: g.name,
        target: g.targetAmount,
        current: g.currentAmount,
        remaining: g.targetAmount - g.currentAmount,
        percentComplete: (g.currentAmount / g.targetAmount) * 100,
        deadline: g.deadline?.toISOString().split('T')[0],
      }));

      // Store in cache
      queryCache.set(userId, 'goals', result);
      console.log(`[Cache MISS] get_goals - ${Date.now() - startTime}ms`);

      return result;
    }

    case 'get_summary': {
      const days = toolInput.days || 30;
      const cacheParams = { days };

      // Try cache first
      const cached = queryCache.get(userId, 'summary', cacheParams);
      if (cached) {
        console.log(`[Cache HIT] get_summary - ${Date.now() - startTime}ms`);
        return cached;
      }

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const [income, expenses] = await Promise.all([
        prisma.transaction.aggregate({
          where: { userId, type: 'income', date: { gte: startDate } },
          _sum: { amount: true },
        }),
        prisma.transaction.aggregate({
          where: { userId, type: 'expense', date: { gte: startDate } },
          _sum: { amount: true },
        }),
      ]);

      const totalIncome = income._sum.amount || 0;
      const totalExpenses = expenses._sum.amount || 0;

      const result = {
        period: `Last ${days} days`,
        income: totalIncome,
        expenses: totalExpenses,
        balance: totalIncome - totalExpenses,
        avgDailySpending: totalExpenses / days,
      };

      // Store in cache
      queryCache.set(userId, 'summary', result, cacheParams);
      console.log(`[Cache MISS] get_summary - ${Date.now() - startTime}ms`);

      return result;
    }

    default:
      throw new Error(`Unknown tool: ${toolName}`);
  }
}
