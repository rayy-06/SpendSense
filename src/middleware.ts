import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSessionFromRequest } from './lib/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes
  const publicRoutes = ['/', '/login', '/register'];
  const isPublicRoute = publicRoutes.includes(pathname);

  const session = await getSessionFromRequest(request);

  // Debug logging
  console.log('Middleware:', { pathname, hasSession: !!session, cookie: request.cookies.get('token')?.value?.substring(0, 20) });

  // Redirect to login if accessing protected route without session
  if (!isPublicRoute && !session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Redirect to dashboard if accessing auth pages with session
  if ((pathname === '/login' || pathname === '/register') && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
  runtime: 'nodejs',
};
