import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const budgets = await prisma.budget.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate spending for each budget
    const budgetsWithSpending = await Promise.all(
      budgets.map(async (budget) => {
        const spending = await prisma.transaction.aggregate({
          where: {
            userId: session.userId,
            type: 'expense',
            date: {
              gte: budget.startDate,
              lte: budget.endDate,
            },
            ...(budget.categoryId && { categoryId: budget.categoryId }),
          },
          _sum: { amount: true },
        });

        return {
          ...budget,
          spent: spending._sum.amount || 0,
          remaining: budget.amount - (spending._sum.amount || 0),
          percentUsed: ((spending._sum.amount || 0) / budget.amount) * 100,
        };
      })
    );

    return NextResponse.json({ budgets: budgetsWithSpending });
  } catch (error) {
    console.error('Get budgets error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { amount, period, categoryId, startDate, endDate } = body;

    if (!amount || !period || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Amount, period, startDate, and endDate are required' },
        { status: 400 }
      );
    }

    const budget = await prisma.budget.create({
      data: {
        amount: parseFloat(amount),
        period,
        categoryId: categoryId || null,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        userId: session.userId,
      },
    });

    return NextResponse.json({ budget }, { status: 201 });
  } catch (error) {
    console.error('Create budget error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
