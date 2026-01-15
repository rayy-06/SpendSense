import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { invalidateTransactionCache } from '@/lib/cacheInvalidation';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { amount, description, date, type, categoryId } = body;

    // Verify ownership
    const existing = await prisma.transaction.findUnique({
      where: { id },
    });

    if (!existing || existing.userId !== session.userId) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    const transaction = await prisma.transaction.update({
      where: { id },
      data: {
        amount: amount !== undefined ? parseFloat(amount) : undefined,
        description,
        date: date ? new Date(date) : undefined,
        type,
        categoryId: categoryId === null ? null : categoryId,
      },
      include: { category: true },
    });

    // Invalidate cache after mutation
    invalidateTransactionCache(session.userId);

    return NextResponse.json({ transaction });
  } catch (error) {
    console.error('Update transaction error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Verify ownership
    const existing = await prisma.transaction.findUnique({
      where: { id },
    });

    if (!existing || existing.userId !== session.userId) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    await prisma.transaction.delete({
      where: { id },
    });

    // Invalidate cache after mutation
    invalidateTransactionCache(session.userId);

    return NextResponse.json({ message: 'Transaction deleted' });
  } catch (error) {
    console.error('Delete transaction error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
