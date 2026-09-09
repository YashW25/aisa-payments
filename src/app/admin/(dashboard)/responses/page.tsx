import prisma from '@/lib/prisma';
import { ExternalLink } from 'lucide-react';
import Link from 'next/link';
import DownloadPDFButton from './DownloadPDFButton';
import DownloadCSVButton from './DownloadCSVButton';

export const dynamic = 'force-dynamic';

export default async function ResponsesPage() {
  const rawPayments = await prisma.payment.findMany({
    orderBy: { submittedAt: 'desc' },
    include: { link: true }
  });

  const payments = rawPayments.map(payment => ({
    ...payment,
    amount: payment.amount.toString(),
    link: {
      ...payment.link,
      amount: payment.link.amount.toString()
    }
  }));

  return (
    <div className="space-y-6 text-[var(--color-aisa-text)]">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold mb-1">Form Responses</h1>
          <p className="text-sm text-gray-400">View detailed responses submitted via payment forms</p>
        </div>
        <div className="flex items-center gap-3">
          <DownloadCSVButton payments={payments} />
          <DownloadPDFButton payments={payments} />
        </div>
      </div>

      <div className="bg-black/20 border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 border-b border-white/10 text-gray-400">
              <tr>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Student Info</th>
                <th className="px-6 py-4 font-medium">Responses</th>
                <th className="px-6 py-4 font-medium">Payment Status</th>
                <th className="px-6 py-4 font-medium text-right">Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {payments.map((payment) => {
                const customFields = payment.customFields ? (payment.customFields as Record<string, string>) : {};
                const hasCustomFields = Object.keys(customFields).length > 0;

                return (
                  <tr key={payment.id} className="hover:bg-white/5 transition-colors align-top">
                    <td className="px-6 py-4 text-gray-400 text-xs">
                      {payment.submittedAt.toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-white">{payment.name}</p>
                      <p className="text-gray-400 text-xs">{payment.email}</p>
                      <p className="text-gray-400 text-xs mt-1">
                        {payment.prn && <span>PRN: {payment.prn} &bull; </span>}
                        {payment.department && <span>{payment.department} &bull; </span>}
                        {payment.year && <span>{payment.year}</span>}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      {hasCustomFields ? (
                        <div className="space-y-1.5 max-w-sm">
                          {Object.entries(customFields).map(([question, answer], idx) => (
                            <div key={idx} className="bg-white/5 rounded p-2">
                              <p className="text-xs text-gray-400 font-medium mb-1">{question}</p>
                              <p className="text-sm text-gray-200">{answer}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-500 italic">No extra questions</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium inline-block ${
                        payment.status === 'VERIFIED' ? 'bg-green-500/20 text-green-400' :
                        payment.status === 'REJECTED' ? 'bg-red-500/20 text-red-400' :
                        'bg-[var(--color-aisa-blue)]/20 text-[var(--color-aisa-blue)]'
                      }`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Link
                        href={`/admin/responses/${payment.id}/invoice`}
                        target="_blank"
                        className="inline-flex items-center px-3 py-1.5 bg-black/40 hover:bg-black/60 border border-white/10 rounded-lg text-xs transition-colors text-white"
                      >
                        <ExternalLink className="w-3 h-3 mr-1.5" /> View Invoice
                      </Link>
                    </td>
                  </tr>
                );
              })}

              {payments.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                    No form responses have been submitted yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
