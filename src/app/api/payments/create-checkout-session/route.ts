import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  return NextResponse.json({
    sessionId: `cs_test_${Date.now()}`,
    url: `/payment/success?appId=${body.applicationId || ''}`,
  });
}
