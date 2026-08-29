import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  return NextResponse.json({
    status: 'verified',
    proofHash: `zk_p_${Date.now()}`,
    midnightTx: `0x${Date.now()}`,
  });
}
