import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';
import { join } from 'path';
import { readFileSync, existsSync } from 'fs';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const refund = await prisma.refundRequest.findUnique({
      where: { id }
    });

    if (!refund || !refund.refundProofFileId) {
      return NextResponse.json({ error: 'Proof file not found' }, { status: 404 });
    }

    const filePath = join(process.cwd(), 'data', 'uploads', refund.refundProofFileId);
    
    if (!existsSync(filePath)) {
      return NextResponse.json({ error: 'Proof file does not exist on disk' }, { status: 404 });
    }

    const fileBuffer = readFileSync(filePath);
    
    const ext = refund.refundProofFileId.split('.').pop()?.toLowerCase();
    let contentType = 'application/octet-stream';
    if (ext === 'png') contentType = 'image/png';
    else if (ext === 'jpg' || ext === 'jpeg') contentType = 'image/jpeg';
    else if (ext === 'pdf') contentType = 'application/pdf';

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400'
      }
    });

  } catch (error) {
    console.error('Error fetching refund proof:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
