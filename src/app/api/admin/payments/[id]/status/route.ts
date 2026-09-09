import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Invalid payment ID' }, { status: 400 });
    }

    const body = await request.json();
    const { status } = body;

    if (status !== 'VERIFIED' && status !== 'REJECTED') {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const payment = await prisma.payment.update({
      where: { id },
      data: {
        status,
        verifiedAt: new Date(),
        verifiedById: session.id as string,
      },
    });

    return NextResponse.json({ success: true, payment });
  } catch (error) {
    console.error('Error updating payment status:', error);
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
  }
}
