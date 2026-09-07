import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    
    // Validate required fields
    if (!data.slug || !data.title || !data.amount || !data.upiId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if slug exists
    const existing = await prisma.paymentLink.findUnique({
      where: { slug: data.slug },
    });

    if (existing) {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 400 });
    }

    const newLink = await prisma.paymentLink.create({
      data: {
        slug: data.slug,
        title: data.title,
        description: data.description || '',
        amount: data.amount,
        upiId: data.upiId,
        formFields: data.formFields || [],
        enablePlatformFee: Boolean(data.enablePlatformFee),
        isActive: true,
      },
    });

    return NextResponse.json({ success: true, link: newLink });
  } catch (error) {
    console.error('Create link error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const links = await prisma.paymentLink.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { payments: true }
        }
      }
    });

    return NextResponse.json({ links });
  } catch (error) {
    console.error('Fetch links error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
