import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';
import fs from 'fs';
import path from 'path';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Verify Admin Session
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Invalid payment ID' }, { status: 400 });
    }

    // 2. Fetch payment record
    const payment = await prisma.payment.findUnique({
      where: { id },
      select: { screenshotFileId: true, transactionId: true },
    });

    if (!payment || !payment.screenshotFileId) {
      return NextResponse.json({ error: 'Proof image not found' }, { status: 404 });
    }

    const filePathOrUrl = payment.screenshotFileId;

    // If it's a legacy full URL (e.g. Cloudinary or external), redirect to it safely
    if (filePathOrUrl.startsWith('http://') || filePathOrUrl.startsWith('https://')) {
      return NextResponse.redirect(filePathOrUrl);
    }

    // 3. Resolve local path and prevent directory traversal
    const uploadsDir = path.join(process.cwd(), 'data', 'uploads');
    const sanitizedFilename = path.basename(filePathOrUrl);
    const targetPath = path.join(uploadsDir, sanitizedFilename);

    if (!targetPath.startsWith(uploadsDir)) {
      return NextResponse.json({ error: 'Invalid file path' }, { status: 400 });
    }

    if (!fs.existsSync(/*turbopackIgnore: true*/ targetPath)) {
      return NextResponse.json({ error: 'Proof file does not exist on disk' }, { status: 404 });
    }

    // 4. Determine content type based on extension
    const ext = path.extname(targetPath).toLowerCase();
    let contentType = 'image/png';
    if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
    else if (ext === '.webp') contentType = 'image/webp';
    else if (ext === '.heic' || ext === '.heif') contentType = 'image/heic';

    const fileStream = fs.readFileSync(/*turbopackIgnore: true*/ targetPath);

    return new NextResponse(fileStream, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'private, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Error fetching proof image:', error);
    return NextResponse.json({ error: 'Failed to retrieve proof image' }, { status: 500 });
  }
}
