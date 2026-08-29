import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ applicationId: string }> }
) {
  const { applicationId } = await params;
  return NextResponse.json({ status: 'ok', applicationId });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ applicationId: string }> }
) {
  const { applicationId } = await params;
  const body = await request.json().catch(() => ({}));
  return NextResponse.json({ status: 'updated', applicationId, ...body });
}
