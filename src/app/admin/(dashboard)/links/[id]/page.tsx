import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import ClientEditForm from './ClientEditForm';

export const dynamic = 'force-dynamic';

export default async function EditPaymentLink(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const link = await prisma.paymentLink.findUnique({
    where: { id: params.id },
  });

  if (!link) {
    notFound();
  }

  const serializedLink = {
    ...link,
    amount: link.amount.toString(),
  };

  return <ClientEditForm initialData={serializedLink} />;
}
