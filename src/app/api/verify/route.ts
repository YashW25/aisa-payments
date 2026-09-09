import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { transactionId } = await req.json();
    
    if (!transactionId) {
      return NextResponse.json({ error: 'Transaction ID is required' }, { status: 400 });
    }

    // Sanitize input (basic)
    const cleanTxId = transactionId.trim();

    const payment = await prisma.payment.findFirst({
      where: { transactionId: cleanTxId },
      include: { link: true }
    });

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found. Please check your Transaction ID.' }, { status: 404 });
    }

    return NextResponse.json({
      id: payment.id,
      transactionId: payment.transactionId,
      name: payment.name,
      status: payment.status,
      amount: payment.amount.toString(),
      linkTitle: payment.link.title,
      submittedAt: payment.submittedAt
    });

  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
