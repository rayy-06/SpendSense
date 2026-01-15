import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(
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
    const { currentAmount, status } = body;

    const existing = await prisma.goal.findUnique({
      where: { id },
    });

    if (!existing || existing.userId !== session.userId) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }

    const goal = await prisma.goal.update({
      where: { id },
      data: {
        currentAmount: currentAmount !== undefined ? parseFloat(currentAmount) : undefined,
        status,
      },
    });

    return NextResponse.json({ goal });
  } catch (error) {
    console.error('Update goal error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
