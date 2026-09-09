import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, amount, studentUpiId, reason } = await request.json();

    if (!name || !amount || !studentUpiId || !reason) {
      return NextResponse.json({ error: 'Name, Amount, Student UPI ID, and Reason are required' }, { status: 400 });
    }

    // Create the standalone refund request
    await prisma.refundRequest.create({
      data: {
        standaloneName: name.trim(),
        standaloneAmount: Number(amount),
        studentUpiId: studentUpiId.trim(),
        reason: reason.trim(),
        status: 'PENDING'
      }
    });

    return NextResponse.json({ success: true }, { status: 201 });

  } catch (error) {
    console.error('Error initiating standalone refund:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
