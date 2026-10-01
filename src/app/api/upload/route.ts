import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getStorageProvider } from '@/lib/storage';
import { applyRateLimit } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  const rateLimitResponse = applyRateLimit(req, { limit: 15, windowMs: 60000, prefix: 'upload' });
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'LANDLORD') {
      return NextResponse.json({ error: 'Only landlords can upload property images' }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size exceeds 5MB limit' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const storage = getStorageProvider();
    const url = await storage.upload(buffer, file.name, file.type);

    return NextResponse.json({
      status: 'ok',
      url,
      filename: file.name,
      sizeBytes: file.size,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Upload failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
