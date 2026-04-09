import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email, api_key } = body as { email: string; api_key: string };

  if (!api_key) {
    return NextResponse.json({ detail: 'API key is required' }, { status: 400 });
  }

  // Verify the API key by calling a lightweight backend endpoint
  try {
    const res = await fetch(`${BACKEND_URL}/v1/projects`, {
      method: 'GET',
      headers: {
        'x-api-key': api_key,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      return NextResponse.json({ detail: 'Invalid credentials' }, { status: 401 });
    }
  } catch {
    return NextResponse.json({ detail: 'Could not reach server' }, { status: 502 });
  }

  // Store the API key in an HTTP-only cookie
  const cookieStore = await cookies();
  cookieStore.set('litmusai_token', api_key, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  // Also store email for display purposes (not httpOnly)
  cookieStore.set('litmusai_email', email ?? '', {
    httpOnly: false,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });

  return NextResponse.json({ ok: true });
}
