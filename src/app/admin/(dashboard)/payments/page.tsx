import prisma from '@/lib/prisma';
import { ExternalLink, CheckCircle, XCircle } from 'lucide-react';
import PaymentActions from './PaymentActions';
import FormSelector from '../FormSelector';

export const dynamic = 'force-dynamic';

export default async function AdminPayments(props: { searchParams: Promise<{ linkId?: string }> }) {
  const searchParams = await props.searchParams;
  const linkId = searchParams.linkId;

  const links = await prisma.paymentLink.findMany({
    select: { id: true, title: true },
    orderBy: { createdAt: 'desc' }
  });

  const payments = linkId 
    ? await prisma.payment.findMany({
        where: { linkId },
        orderBy: { submittedAt: 'desc' },
        include: { link: true }
      })
    : [];

  return (
    <div className="space-y-6 text-[var(--color-aisa-text)]">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">Verify Payments</h1>
        <p className="text-sm text-gray-400">Review and approve submitted payments</p>
      </div>

      <FormSelector links={links} />

      {!linkId ? (
        <div className="bg-black/20 border border-white/10 rounded-xl p-12 text-center text-gray-400">
          <p>Please select a form to view its payments.</p>
        </div>
      ) : (
      <div className="bg-black/20 border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 border-b border-white/10 text-gray-400">
              <tr>
                <th className="px-6 py-4 font-medium">Transaction ID</th>
                <th className="px-6 py-4 font-medium">Student / User</th>
                <th className="px-6 py-4 font-medium">Payment Link</th>
                <th className="px-6 py-4 font-medium">Amount</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-mono text-[var(--color-aisa-gold)]">{payment.transactionId}</td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-white">{payment.name}</p>
                    <p className="text-gray-400 text-xs">{payment.email}</p>
                    {payment.prn && <p className="text-gray-400 text-xs">PRN: {payment.prn}</p>}
                  </td>
                  <td className="px-6 py-4 text-gray-300">{payment.link.title}</td>
                  <td className="px-6 py-4 font-semibold">₹{payment.amount.toString()}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      payment.status === 'VERIFIED' ? 'bg-green-500/20 text-green-400' :
                      payment.status === 'REJECTED' ? 'bg-red-500/20 text-red-400' :
                      'bg-[var(--color-aisa-blue)]/20 text-[var(--color-aisa-blue)]'
                    }`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    {payment.screenshotFileId && (
                      <a
                        href={
                          payment.screenshotFileId.startsWith('http://') || payment.screenshotFileId.startsWith('https://')
                            ? payment.screenshotFileId
                            : `/api/admin/payments/${payment.id}/proof`
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center px-3 py-1.5 bg-black/40 hover:bg-black/60 border border-white/10 rounded-lg text-xs transition-colors"
                      >
                        <ExternalLink className="w-3 h-3 mr-1.5" /> Proof
                      </a>
                    )}
                    <PaymentActions paymentId={payment.id} currentStatus={payment.status} />
                  </td>
                </tr>
              ))}

              {payments.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    No payments have been submitted yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      )}
    </div>
  );
}
