import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const secretKey = () =>
  new TextEncoder().encode(
    process.env.AUTH_SECRET || 'wnm-fallback-secret-please-set-AUTH_SECRET'
  );

export async function middleware(request) {
  const token = request.cookies.get('wnm_session')?.value;
  let valid = false;
  if (token) {
    try {
      await jwtVerify(token, secretKey());
      valid = true;
    } catch {
      valid = false;
    }
  }

  if (!valid) {
    const url = new URL('/signin', request.url);
    url.searchParams.set('next', request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/panel/:path*'],
};
