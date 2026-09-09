import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import ProcessRefundClient from './ProcessRefundClient';
import { getAdminSession } from '@/lib/auth';

export default async function ProcessRefundPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  const { id } = await params;
  
  const refund = await prisma.refundRequest.findUnique({
    where: { id },
    include: {
      payment: {
        include: { link: true }
      },
      processedBy: true
    }
  });

  if (!refund) {
    notFound();
  }

  const { payment } = refund;

  return (
    <div className="max-w-3xl space-y-6 text-[var(--color-aisa-text)]">
      <div className="mb-8">
        <Link href="/admin/refunds" className="text-sm text-gray-400 hover:text-white mb-4 inline-block">
          &larr; Back to Refunds
        </Link>
        <h1 className="text-2xl font-bold mb-1">Process Refund Request</h1>
        <p className="text-sm text-gray-400">Review and approve or reject the refund</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-black/20 border border-white/10 rounded-xl p-6">
          <h2 className="text-lg font-bold border-b border-gray-100/10 pb-2 mb-4">Payment Details</h2>
          <dl className="space-y-4 text-sm">
            <div>
              <dt className="text-gray-400">Transaction ID</dt>
              <dd className="font-mono text-amber-400">{payment ? payment.transactionId : refund.transactionId}</dd>
            </div>
            <div>
              <dt className="text-gray-400">Student</dt>
              <dd className="font-medium text-white">{payment ? payment.name : refund.standaloneName}</dd>
              {payment && <dd className="text-gray-400 text-xs">{payment.email}</dd>}
            </div>
            <div>
              <dt className="text-gray-400">Refund Amount</dt>
              <dd className="font-semibold text-white">₹{Number(payment ? payment.amount : refund.standaloneAmount).toFixed(2)}</dd>
            </div>
            {payment && (
              <div>
                <dt className="text-gray-400">Date Paid</dt>
                <dd className="text-gray-200">{payment.submittedAt.toLocaleString()}</dd>
              </div>
            )}
          </dl>
        </div>

        <div className="bg-black/20 border border-white/10 rounded-xl p-6">
          <h2 className="text-lg font-bold border-b border-gray-100/10 pb-2 mb-4">Refund Details</h2>
          <dl className="space-y-4 text-sm">
            <div>
              <dt className="text-gray-400">Date Requested</dt>
              <dd className="text-gray-200">{refund.requestedAt.toLocaleString()}</dd>
            </div>
            {refund.studentUpiId && (
              <div>
                <dt className="text-gray-400">Student UPI ID for Refund</dt>
                <dd className="font-mono text-amber-400">{refund.studentUpiId}</dd>
              </div>
            )}
            <div>
              <dt className="text-gray-400">Status</dt>
              <dd>
                <span className={`px-2 py-1 rounded-full text-xs font-medium inline-block ${
                  refund.status === 'APPROVED' ? 'bg-green-500/20 text-green-400' :
                  refund.status === 'REJECTED' ? 'bg-red-500/20 text-red-400' :
                  'bg-amber-500/20 text-amber-400'
                }`}>
                  {refund.status}
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-gray-400">Reason</dt>
              <dd className="text-gray-200 bg-white/5 p-3 rounded mt-1">{refund.reason}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="bg-black/20 border border-white/10 rounded-xl p-6">
        <h2 className="text-lg font-bold border-b border-gray-100/10 pb-2 mb-4">Action</h2>
        {refund.status === 'PENDING' ? (
          <ProcessRefundClient 
            refundId={refund.id} 
            adminId={session!.adminId} 
            studentUpiId={refund.studentUpiId || ''} 
            amount={Number(payment ? payment.amount : refund.standaloneAmount)}
            payeeName={payment ? payment.name : (refund.standaloneName || '')}
          />
        ) : (
          <div className="text-sm text-gray-400">
            <p>This refund was <strong className={refund.status === 'APPROVED' ? 'text-green-400' : 'text-red-400'}>{refund.status.toLowerCase()}</strong> on {refund.processedAt?.toLocaleString()}.</p>
            {refund.adminNotes && (
              <p className="mt-2"><strong>Notes:</strong> {refund.adminNotes}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
