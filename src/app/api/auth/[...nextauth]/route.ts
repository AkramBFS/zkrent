import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ authenticated: true, user: { name: 'Elena Rostova', role: 'tenant' } });
}

export async function POST() {
  return NextResponse.json({ authenticated: true, user: { name: 'Elena Rostova', role: 'tenant' } });
}
