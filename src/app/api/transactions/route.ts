import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { invalidateTransactionCache } from '@/lib/cacheInvalidation';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const type = searchParams.get('type');
    const categoryId = searchParams.get('categoryId');

    const where: any = { userId: session.userId };
    if (type) where.type = type;
    if (categoryId) where.categoryId = categoryId;

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: { category: true },
        orderBy: { date: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.transaction.count({ where }),
    ]);

    return NextResponse.json({ transactions, total });
  } catch (error) {
    console.error('Get transactions error:', error);
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
    const { amount, description, date, type, categoryId } = body;

    if (!amount || !type || !date) {
      return NextResponse.json(
        { error: 'Amount, type, and date are required' },
        { status: 400 }
      );
    }

    if (type !== 'income' && type !== 'expense') {
      return NextResponse.json(
        { error: 'Type must be income or expense' },
        { status: 400 }
      );
    }

    const transaction = await prisma.transaction.create({
      data: {
        amount: parseFloat(amount),
        description,
        date: new Date(date),
        type,
        categoryId: categoryId || null,
        userId: session.userId,
      },
      include: { category: true },
    });

    // Invalidate cache after mutation
    invalidateTransactionCache(session.userId);

    return NextResponse.json({ transaction }, { status: 201 });
  } catch (error) {
    console.error('Create transaction error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
