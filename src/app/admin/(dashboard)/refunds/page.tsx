import prisma from '@/lib/prisma';
import { ExternalLink, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import InitiateRefundButton from './InitiateRefundButton';

export const dynamic = 'force-dynamic';

export default async function RefundsPage() {
  const refundRequests = await prisma.refundRequest.findMany({
    orderBy: { requestedAt: 'desc' },
    include: {
      payment: {
        include: { link: true }
      }
    }
  });

  return (
    <div className="space-y-6 text-[var(--color-aisa-text)]">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold mb-1">Refund Requests</h1>
          <p className="text-sm text-gray-400">View and manage student refund requests</p>
        </div>
        <InitiateRefundButton />
      </div>

      <div className="bg-black/20 border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 border-b border-white/10 text-gray-400">
              <tr>
                <th className="px-6 py-4 font-medium">Date Requested</th>
                <th className="px-6 py-4 font-medium">Payment Info</th>
                <th className="px-6 py-4 font-medium">Reason</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {refundRequests.map((refund) => {
                const { payment } = refund;
                
                return (
                  <tr key={refund.id} className="hover:bg-white/5 transition-colors align-top">
                    <td className="px-6 py-4 text-gray-400 text-xs">
                      {refund.requestedAt.toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-white">{payment ? payment.name : refund.standaloneName}</p>
                      {payment && <p className="text-gray-400 text-xs">{payment.email}</p>}
                      <p className="text-gray-400 text-xs mt-1">
                        <span className="font-mono text-amber-400">{payment ? payment.transactionId : refund.transactionId}</span>
                      </p>
                      <p className="text-gray-400 text-xs mt-1">
                        Amount: ₹{Number(payment ? payment.amount : refund.standaloneAmount).toFixed(2)}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-300 max-w-xs">{refund.reason}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium inline-block ${
                        refund.status === 'APPROVED' ? 'bg-green-500/20 text-green-400' :
                        refund.status === 'REJECTED' ? 'bg-red-500/20 text-red-400' :
                        'bg-amber-500/20 text-amber-400'
                      }`}>
                        {refund.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Link
                        href={`/admin/refunds/${refund.id}/process`}
                        className="inline-flex items-center px-3 py-1.5 bg-black/40 hover:bg-black/60 border border-white/10 rounded-lg text-xs transition-colors text-white"
                      >
                         Process
                      </Link>
                      {refund.status === 'APPROVED' && (
                        <Link
                          href={`/admin/refunds/${refund.id}/invoice`}
                          target="_blank"
                          className="inline-flex items-center px-3 py-1.5 bg-black/40 hover:bg-black/60 border border-white/10 rounded-lg text-xs transition-colors text-white mt-2 lg:mt-0"
                        >
                          <ExternalLink className="w-3 h-3 mr-1.5" /> Invoice
                        </Link>
                      )}
                    </td>
                  </tr>
                );
              })}

              {refundRequests.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                    No refund requests found.
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
