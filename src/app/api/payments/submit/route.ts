import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const linkId = formData.get('linkId') as string;
    const screenshot = formData.get('screenshot') as File;
    const formDataStr = formData.get('formData') as string;

    if (!linkId || !screenshot || !formDataStr) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const parsedData = JSON.parse(formDataStr);
    
    // Fetch link details
    const link = await prisma.paymentLink.findUnique({
      where: { id: linkId },
    });

    if (!link) {
      return NextResponse.json({ error: 'Payment link not found' }, { status: 404 });
    }

    // Generate transaction ID: AISA-YYYY-XXXX
    const year = new Date().getFullYear();
    const count = await prisma.payment.count({
      where: {
        transactionId: { startsWith: `AISA-${year}` }
      }
    });
    const transactionId = `AISA-${year}-${String(count + 1).padStart(4, '0')}`;

    // Upload to Cloudinary
    let screenshotUrl = null;
    try {
      const buffer = Buffer.from(await screenshot.arrayBuffer());
      const base64Image = `data:${screenshot.type};base64,${buffer.toString('base64')}`;
      
      const uploadResponse = await cloudinary.uploader.upload(base64Image, {
        folder: 'aisa-payments',
        public_id: `${transactionId}-${parsedData.name || 'Unknown'}`.replace(/[^a-zA-Z0-9_-]/g, ''),
      });

      screenshotUrl = uploadResponse.secure_url;
    } catch (uploadError) {
      console.error('Cloudinary Upload Error:', uploadError);
      return NextResponse.json({ error: 'Failed to upload screenshot' }, { status: 500 });
    }

    // Prepare fixed fields vs custom fields
    const { name, email, phone, prn, department, year: studentYear, division, ...customFields } = parsedData;

    const baseAmount = Number(link.amount);
    const platformFee = link.enablePlatformFee ? Number((baseAmount * 0.02).toFixed(2)) : 0;
    const totalAmount = baseAmount + platformFee;

    // Save to database
    const payment = await prisma.payment.create({
      data: {
        transactionId,
        linkId,
        name: name || 'Unknown',
        email: email || '',
        phone,
        prn,
        department,
        year: studentYear,
        division,
        customFields: Object.keys(customFields).length > 0 ? customFields : null,
        amount: totalAmount,
        status: 'SUBMITTED',
        screenshotFileId: screenshotUrl, // We store the Cloudinary URL here now
      },
    });

    return NextResponse.json({ success: true, transactionId });
  } catch (error) {
    console.error('Payment submit error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
