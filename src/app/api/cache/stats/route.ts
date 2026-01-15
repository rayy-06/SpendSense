import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { queryCache } from '@/lib/queryCache';

/**
 * GET /api/cache/stats
 *
 * Returns cache performance statistics
 * Used for monitoring and optimization metrics
 */
export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const stats = queryCache.getStats();

    return NextResponse.json({
      ...stats,
      message: 'Cache statistics retrieved successfully',
    });
  } catch (error) {
    console.error('Get cache stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
