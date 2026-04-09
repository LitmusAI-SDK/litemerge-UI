import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

async function getToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get('litmusai_token')?.value ?? null;
}

function buildBackendUrl(params: { path: string[] }, req: NextRequest): string {
  const pathStr = params.path.join('/');
  const search = req.nextUrl.search;
  return `${BACKEND_URL}/${pathStr}${search}`;
}

async function proxyRequest(req: NextRequest, params: { path: string[] }) {
  const token = await getToken();
  const url = buildBackendUrl(params, req);

  const isSSE = params.path.at(-1) === 'stream';

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) headers['x-api-key'] = token;

  const init: RequestInit = {
    method: req.method,
    headers,
  };

  if (!['GET', 'HEAD'].includes(req.method)) {
    const body = await req.text();
    if (body) init.body = body;
  }

  try {
    const backendRes = await fetch(url, init);

    // SSE: stream the response directly
    if (isSSE && backendRes.body) {
      return new NextResponse(backendRes.body, {
        status: backendRes.status,
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

    const body = await backendRes.text();
    return new NextResponse(body, {
      status: backendRes.status,
      headers: {
        'Content-Type': backendRes.headers.get('Content-Type') ?? 'application/json',
      },
    });
  } catch {
    return NextResponse.json({ detail: 'Could not reach server' }, { status: 502 });
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(req, await params);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(req, await params);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(req, await params);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(req, await params);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(req, await params);
}
