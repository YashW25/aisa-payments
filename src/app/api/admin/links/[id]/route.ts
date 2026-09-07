import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';
import { Prisma } from '@prisma/client';

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();

    const link = await prisma.paymentLink.update({
      where: { id: params.id },
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description,
        amount: new Prisma.Decimal(data.amount),
        upiId: data.upiId,
        formFields: data.formFields || [],
        enablePlatformFee: Boolean(data.enablePlatformFee),
        isActive: Boolean(data.isActive),
      },
    });

    return NextResponse.json({ success: true, link });
  } catch (error) {
    console.error('Update link error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
