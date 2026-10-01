import { NextRequest, NextResponse } from 'next/server';
import { defaultLocalStorage } from '@/lib/storage';
import fs from 'fs';
import path from 'path';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;
    const safeFilename = path.basename(filename);

    const filePath = defaultLocalStorage.getFilePath(safeFilename);
    if (!filePath) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 });
    }

    const ext = path.extname(safeFilename).toLowerCase();
    const contentType =
      ext === '.jpg' || ext === '.jpeg'
        ? 'image/jpeg'
        : ext === '.png'
        ? 'image/png'
        : ext === '.webp'
        ? 'image/webp'
        : 'application/octet-stream';

    const fileBuffer = await fs.promises.readFile(filePath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    console.error('Error serving media file:', error);
    return NextResponse.json({ error: 'Failed to serve media' }, { status: 500 });
  }
}
