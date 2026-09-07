import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import PaymentClient from './PaymentClient';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export async function generateMetadata(
  props: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await props.params;
  const link = await prisma.paymentLink.findUnique({ where: { slug } });

  if (!link || !link.isActive) {
    return {
      title: 'Payment Not Found',
      description: 'This payment link is not available.',
    };
  }

  const platformFee = link.enablePlatformFee ? Number((Number(link.amount) * 0.02).toFixed(2)) : 0;
  const totalAmount = Number(link.amount) + platformFee;
  const title = `Pay ₹${totalAmount} — ${link.title}`;
  const description =
    link.description ||
    `Secure online payment for ${link.title}. Amount: ₹${totalAmount}. Powered by Innovara Dynamics Pay.`;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  return {
    title,
    description,
    openGraph: {
      type: 'website',
      locale: 'en_IN',
      url: `${siteUrl}/pay/${slug}`,
      siteName: 'AISA Payments',
      title,
      description,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function PaymentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const link = await prisma.paymentLink.findUnique({
    where: { slug },
  });

  if (!link || !link.isActive) {
    notFound();
  }

  // Convert Decimal to number for the client component
  const safeLink = {
    ...link,
    amount: Number(link.amount),
    formFields: link.formFields as any,
  };

  return <PaymentClient link={safeLink} />;
}
