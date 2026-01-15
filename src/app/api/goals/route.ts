import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const goals = await prisma.goal.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ goals });
  } catch (error) {
    console.error('Get goals error:', error);
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
    const { name, targetAmount, currentAmount, deadline } = body;

    if (!name || !targetAmount) {
      return NextResponse.json(
        { error: 'Name and target amount are required' },
        { status: 400 }
      );
    }

    const goal = await prisma.goal.create({
      data: {
        name,
        targetAmount: parseFloat(targetAmount),
        currentAmount: currentAmount ? parseFloat(currentAmount) : 0,
        deadline: deadline ? new Date(deadline) : null,
        userId: session.userId,
      },
    });

    return NextResponse.json({ goal }, { status: 201 });
  } catch (error) {
    console.error('Create goal error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
