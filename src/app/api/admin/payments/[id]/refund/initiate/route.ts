import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';

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
    const { studentUpiId, reason } = await request.json();

    if (!studentUpiId || !reason) {
      return NextResponse.json({ error: 'Student UPI ID and Reason are required' }, { status: 400 });
    }

    const payment = await prisma.payment.findUnique({
      where: { id }
    });

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    if (payment.status !== 'VERIFIED') {
      return NextResponse.json({ error: 'Refunds can only be initiated for VERIFIED payments' }, { status: 400 });
    }

    // Check if a refund request already exists for this payment
    const existingRequest = await prisma.refundRequest.findUnique({
      where: { paymentId: payment.id }
    });

    if (existingRequest) {
      return NextResponse.json({ error: 'A refund request for this transaction already exists.' }, { status: 400 });
    }

    // Create the refund request
    await prisma.refundRequest.create({
      data: {
        paymentId: payment.id,
        studentUpiId,
        reason,
        status: 'PENDING'
      }
    });

    return NextResponse.json({ success: true }, { status: 201 });

  } catch (error) {
    console.error('Error initiating refund:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
