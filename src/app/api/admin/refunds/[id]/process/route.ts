import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

// Helper to save uploaded file
async function saveUpload(file: File): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  
  const uploadDir = join(process.cwd(), 'data', 'uploads');
  if (!existsSync(uploadDir)) {
    mkdirSync(uploadDir, { recursive: true });
  }

  // Create a unique filename
  const uniqueId = Math.random().toString(36).substring(2, 15);
  const ext = file.name.split('.').pop() || 'png';
  const fileName = `refund-${Date.now()}-${uniqueId}.${ext}`;
  const filePath = join(uploadDir, fileName);

  await writeFile(filePath, buffer);
  return fileName;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    
    // Parse form data
    const formData = await request.formData();
    const action = formData.get('action') as string;
    const notes = formData.get('notes') as string;
    const adminId = formData.get('adminId') as string;
    const file = formData.get('file') as File | null;

    if (action !== 'APPROVE' && action !== 'REJECT') {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const refund = await prisma.refundRequest.findUnique({
      where: { id },
      include: { payment: true }
    });

    if (!refund) {
      return NextResponse.json({ error: 'Refund request not found' }, { status: 404 });
    }

    if (refund.status !== 'PENDING') {
      return NextResponse.json({ error: 'Refund request is already processed' }, { status: 400 });
    }

    let savedFileName = null;
    if (action === 'APPROVE') {
      if (!file) {
        return NextResponse.json({ error: 'Proof file is required to approve' }, { status: 400 });
      }
      savedFileName = await saveUpload(file);
    }

    const newStatus = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';

    await prisma.refundRequest.update({
      where: { id },
      data: {
        status: newStatus,
        processedAt: new Date(),
        processedById: adminId,
        adminNotes: notes || null,
        refundProofFileId: savedFileName,
        refundProofUrl: savedFileName ? `/api/admin/refunds/${id}/proof` : null
      }
    });

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Error processing refund:', error);
    try {
      await writeFile(join(process.cwd(), 'debug-error.log'), error?.stack || error?.message || String(error));
    } catch(e) {}
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
