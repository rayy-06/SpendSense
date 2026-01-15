import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { detectAnomalies } from '@/lib/analytics';

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await detectAnomalies(session.userId);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Detect anomalies error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
