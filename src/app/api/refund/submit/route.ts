import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { transactionId, email, studentUpiId, reason } = await request.json();

    if (!transactionId || !email || !reason) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    }

    // 1. Verify payment exists with the provided transaction ID and email
    const payment = await prisma.payment.findUnique({
      where: { transactionId }
    });

    if (!payment) {
      return NextResponse.json({ error: 'No transaction found with that ID.' }, { status: 404 });
    }

    if (payment.email.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json({ error: 'The email provided does not match the transaction.' }, { status: 403 });
    }

    // 2. Check if a refund request already exists for this payment
    const existingRequest = await prisma.refundRequest.findUnique({
      where: { paymentId: payment.id }
    });

    if (existingRequest) {
      return NextResponse.json({ error: 'A refund request for this transaction has already been submitted.' }, { status: 400 });
    }

    // 3. Create the refund request
    await prisma.refundRequest.create({
      data: {
        paymentId: payment.id,
        studentUpiId,
        reason,
        status: 'PENDING'
      }
    });

    return NextResponse.json({ message: 'Your refund request has been submitted successfully and is pending review.' }, { status: 201 });

  } catch (error) {
    console.error('Refund submission error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
