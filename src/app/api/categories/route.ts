import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const categories = await prisma.category.findMany({
      where: { userId: session.userId },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
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
    const { name, type } = body;

    if (!name || !type) {
      return NextResponse.json(
        { error: 'Name and type are required' },
        { status: 400 }
      );
    }

    if (type !== 'income' && type !== 'expense') {
      return NextResponse.json(
        { error: 'Type must be income or expense' },
        { status: 400 }
      );
    }

    const category = await prisma.category.create({
      data: {
        name,
        type,
        userId: session.userId,
      },
    });

    return NextResponse.json({ category }, { status: 201 });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Category already exists' },
        { status: 400 }
      );
    }
    console.error('Create category error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
