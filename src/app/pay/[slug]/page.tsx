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

  if (!link) {
    return {
      title: 'Payment Not Found',
      description: 'This payment link is not available.',
    };
  }

  if (!link.isActive) {
    return {
      title: 'Form Closed',
      description: 'This payment form is currently not accepting responses.',
    };
  }

  const platformFee = link.enablePlatformFee ? Number((Number(link.amount) * 0.02).toFixed(2)) : 0;
  const totalAmount = Number(link.amount) + platformFee;
  const title = `Pay ₹${totalAmount} — ${link.title}`;
  const description =
    link.description ||
    `Secure online payment for ${link.title}. Amount: ₹${totalAmount}. Powered by AISA Payment Portal.`;
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

  if (!link) {
    notFound();
  }

  if (!link.isActive) {
    return (
      <div className="min-h-screen bg-[var(--color-aisa-navy)] text-[var(--color-aisa-text)] flex flex-col items-center justify-center py-12 px-4 relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--color-aisa-blue)] rounded-full mix-blend-screen blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[var(--color-aisa-gold)] rounded-full mix-blend-screen blur-[120px]" />
        </div>

        <div className="z-10 w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col items-center p-8 text-center">
          <div className="w-20 h-20 bg-yellow-500/20 text-yellow-500 rounded-full flex items-center justify-center mb-6 border border-yellow-500/30">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold tracking-wider mb-3">
            <span className="text-white">Form Closed</span>
          </h1>
          <p className="text-gray-400">
            This payment form is currently not accepting responses. If you believe this is an error, please contact the administrator.
          </p>
        </div>
      </div>
    );
  }

  // Convert Decimal to number for the client component
  const safeLink = {
    ...link,
    amount: Number(link.amount),
    formFields: link.formFields as any,
  };

  return <PaymentClient link={safeLink} />;
}
