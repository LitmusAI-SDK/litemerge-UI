import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete('litmusai_token');
  cookieStore.delete('litmusai_email');
  return NextResponse.json({ ok: true });
}
