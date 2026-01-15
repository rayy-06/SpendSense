import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30'; // days

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Get spending by category
    const spendingByCategory = await prisma.transaction.groupBy({
      by: ['categoryId'],
      where: {
        userId: session.userId,
        type: 'expense',
        date: { gte: startDate },
      },
      _sum: { amount: true },
      _count: true,
    });

    // Get category details
    const categoryIds = spendingByCategory
      .map((s) => s.categoryId)
      .filter((id): id is string => id !== null);

    const categories = await prisma.category.findMany({
      where: { id: { in: categoryIds } },
    });

    const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

    const spendingData = spendingByCategory.map((s) => ({
      category: s.categoryId ? categoryMap.get(s.categoryId) || 'Unknown' : 'Uncategorized',
      amount: s._sum.amount || 0,
      count: s._count,
    }));

    // Get daily spending trend
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: session.userId,
        date: { gte: startDate },
      },
      orderBy: { date: 'asc' },
    });

    // Group by date
    const dailyData = transactions.reduce((acc, t) => {
      const date = t.date.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { income: 0, expense: 0 };
      }
      if (t.type === 'income') {
        acc[date].income += t.amount;
      } else {
        acc[date].expense += t.amount;
      }
      return acc;
    }, {} as Record<string, { income: number; expense: number }>);

    const dailyTrend = Object.entries(dailyData).map(([date, data]) => ({
      date,
      ...data,
    }));

    // Calculate averages
    const totalIncome = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const avgDailySpending = totalExpenses / parseInt(period);

    return NextResponse.json({
      spendingByCategory: spendingData,
      dailyTrend,
      summary: {
        totalIncome,
        totalExpenses,
        netSavings: totalIncome - totalExpenses,
        avgDailySpending,
      },
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
