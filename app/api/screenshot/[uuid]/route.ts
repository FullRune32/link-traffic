import { NextResponse } from 'next/server';
import { getScreenshot } from '@/lib/urlScanner';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ uuid: string }> }
) {
  const { uuid } = await params;

  if (!uuid) {
    return NextResponse.json({ error: 'UUID required' }, { status: 400 });
  }

  const screenshot = await getScreenshot(uuid);

  if (!screenshot) {
    return NextResponse.json({ error: 'Screenshot not found' }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(screenshot), {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
    },
  });
}
