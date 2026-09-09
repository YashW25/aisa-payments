import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request: Request) {
  let savedFilePath: string | null = null;

  try {
    const formData = await request.formData();
    const linkId = formData.get('linkId') as string;
    const screenshot = formData.get('screenshot') as File;
    const formDataStr = formData.get('formData') as string;

    if (!linkId || !screenshot || !formDataStr) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Validate screenshot file type and size
    if (!ALLOWED_MIME_TYPES.includes(screenshot.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload a JPEG, PNG, WEBP, or HEIC image.' },
        { status: 400 }
      );
    }

    if (screenshot.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'Payment screenshot must be 10 MB or smaller.' },
        { status: 400 }
      );
    }

    const parsedData = JSON.parse(formDataStr);
    const { name, email, phone, upiId: studentUpiId, prn, department, year: studentYear, division, ...customFields } = parsedData;

    if (!phone || String(phone).trim() === '') {
      return NextResponse.json({ error: 'Mobile Number is required.' }, { status: 400 });
    }

    if (!studentUpiId || String(studentUpiId).trim() === '') {
      return NextResponse.json({ error: 'UPI ID is required.' }, { status: 400 });
    }

    // 2. Fetch payment link details
    const link = await prisma.paymentLink.findUnique({
      where: { id: linkId },
    });

    if (!link) {
      return NextResponse.json({ error: 'Payment link not found' }, { status: 404 });
    }

    const year = new Date().getFullYear();
    let transactionId = '';
    let payment = null;
    let attempts = 0;
    let savedRelativePath = '';

    const baseAmount = Number(link.amount);
    const platformFee = link.enablePlatformFee ? Number((baseAmount * 0.02).toFixed(2)) : 0;
    const totalAmount = baseAmount + platformFee;

    // Retry loop for transactionId collision
    while (attempts < 5 && !payment) {
      try {
        attempts++;
        transactionId = `AISA-${year}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

        // Prepare file
        if (!savedFilePath) {
          const uploadsDir = path.join(process.cwd(), 'data', 'uploads');
          await fs.mkdir(uploadsDir, { recursive: true });

          let ext = '.png';
          if (screenshot.type === 'image/jpeg') ext = '.jpg';
          else if (screenshot.type === 'image/webp') ext = '.webp';
          else if (screenshot.type === 'image/heic' || screenshot.type === 'image/heif') ext = '.heic';

          const randomHash = crypto.randomBytes(4).toString('hex').toUpperCase();
          const secureFilename = `${transactionId}-${Date.now()}-${randomHash}${ext}`;
          
          const targetFilePath = path.join(uploadsDir, secureFilename);
          const arrayBuffer = await screenshot.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          
          await fs.writeFile(targetFilePath, buffer);
          savedFilePath = targetFilePath;
          savedRelativePath = secureFilename;
        }

        payment = await prisma.payment.create({
          data: {
            transactionId,
            linkId,
            name: name || 'Unknown',
            email: email || '',
            phone: String(phone).trim(),
            upiId: String(studentUpiId).trim(),
            prn: prn || null,
            department: department || null,
            year: studentYear || null,
            division: division || null,
            customFields: Object.keys(customFields).length > 0 ? customFields : null,
            amount: totalAmount,
            status: 'SUBMITTED',
            screenshotFileId: savedRelativePath,
          },
        });
      } catch (err: any) {
        if (err.code === 'P2002') {
          // Collision on transactionId, continue to retry
          payment = null;
        } else {
          throw err;
        }
      }
    }

    if (!payment) {
      throw new Error('Failed to generate a unique transaction ID after multiple attempts');
    }

    const host = request.headers.get('host') || 'payments.isbmcoe.in';
    const proto = request.headers.get('x-forwarded-proto') || 'https';
    const screenshotUrl = `${proto}://${host}/api/admin/payments/${payment.id}/proof`;

    await prisma.payment.update({
      where: { id: payment.id },
      data: { screenshotUrl },
    });

    return NextResponse.json({ success: true, transactionId: payment.transactionId });
  } catch (error) {
    console.error('Payment submit error:', error);

    // Clean up saved file if database operation failed
    if (savedFilePath) {
      try {
        await fs.unlink(savedFilePath);
      } catch (cleanupErr) {
        console.error('Failed to cleanup orphaned file:', cleanupErr);
      }
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
