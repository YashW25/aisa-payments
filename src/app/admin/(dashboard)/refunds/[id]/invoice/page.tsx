import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import PrintButton from './PrintButton';

export const dynamic = 'force-dynamic';

export default async function RefundInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const refund = await prisma.refundRequest.findUnique({
    where: { id },
    include: {
      payment: {
        include: { link: true }
      }
    }
  });

  if (!refund) {
    return notFound();
  }

  const { payment } = refund;
  const formattedDate = new Date(refund.processedAt || refund.requestedAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4 text-gray-900">
      
      <div className="max-w-3xl w-full bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100 p-10 print:shadow-none print:border-none print:p-0">
        
        {/* Header */}
        <div className="flex justify-between items-start border-b border-gray-100 pb-8 mb-8">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight text-amber-500">REFUND INVOICE</h1>
            <p className="text-gray-500 mt-2 font-medium">Refund Receipt</p>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-bold tracking-widest uppercase">AISA</h2>
            <p className="text-sm text-gray-500 mt-1">AI & Data Science</p>
            <p className="text-sm text-gray-500">Students Association</p>
          </div>
        </div>

        {/* Invoice Meta */}
        <div className="flex justify-between mb-8">
          <div>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Refunded To</p>
            <p className="font-semibold text-lg">{payment ? payment.name : refund.standaloneName}</p>
            {payment && <p className="text-gray-600">{payment.email}</p>}
            {payment && payment.phone && <p className="text-gray-600">{payment.phone}</p>}
            {payment && payment.prn && <p className="text-gray-600 mt-1 text-sm bg-gray-100 inline-block px-2 py-0.5 rounded">PRN: {payment.prn}</p>}
          </div>
          <div className="text-right">
            <div className="mb-4">
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Original Transaction ID</p>
              <p className="font-mono font-semibold">{payment ? payment.transactionId : refund.transactionId}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Date of Refund</p>
              <p className="font-semibold">{formattedDate}</p>
            </div>
          </div>
        </div>

        {/* Status Banner */}
        <div className={`mb-8 p-4 rounded-lg flex items-center justify-center font-bold tracking-widest uppercase ${
          refund.status === 'APPROVED' ? 'bg-green-50 text-green-700 border border-green-200' :
          refund.status === 'REJECTED' ? 'bg-red-50 text-red-700 border border-red-200' :
          'bg-yellow-50 text-yellow-700 border border-yellow-200'
        }`}>
          Refund Status: {refund.status}
        </div>

        {/* Refund Details */}
        <div className="mb-10">
          <h3 className="text-lg font-bold border-b border-gray-100 pb-2 mb-4">Refund Details</h3>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Reason provided</p>
              <p className="font-medium text-gray-900 mt-1">{refund.reason}</p>
            </div>
            {refund.adminNotes && (
              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Admin Notes</p>
                <p className="font-medium text-gray-900 mt-1">{refund.adminNotes}</p>
              </div>
            )}
            {refund.refundProofUrl && (
              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Refund Proof</p>
                <a 
                  href={refund.refundProofUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-block mt-1 text-sm font-semibold text-amber-500 hover:text-amber-600 border border-amber-200 bg-amber-50 px-3 py-1.5 rounded transition-colors print:hidden"
                >
                  View Screenshot Proof
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Line Items */}
        <table className="w-full text-left mb-8">
          <thead className="border-b border-gray-200">
            <tr>
              <th className="py-3 text-sm font-semibold text-gray-500 uppercase tracking-wider">Description</th>
              <th className="py-3 text-sm font-semibold text-gray-500 uppercase tracking-wider text-right">Refund Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            <tr>
              <td className="py-4">
                <p className="font-semibold">{payment ? `${payment.link.title} - Refund` : 'Standalone Refund'}</p>
                {payment && payment.link.description && <p className="text-sm text-gray-500 line-clamp-1">{payment.link.description}</p>}
              </td>
              <td className="py-4 text-right font-semibold text-red-500">-₹{Number(payment ? payment.amount : refund.standaloneAmount).toFixed(2)}</td>
            </tr>
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end border-t border-gray-200 pt-6">
          <div className="w-64">
            <div className="flex justify-between items-center text-xl font-bold">
              <span>Total Refunded</span>
              <span className="text-red-500">-₹{Number(payment ? payment.amount : refund.standaloneAmount).toFixed(2)}</span>
            </div>
            <p className="text-xs text-gray-400 mt-2 text-right">
              Processed back to original UPI account.
            </p>
          </div>
        </div>

      </div>

      {/* Proof Page (Printed on Next Page) */}
      {refund.refundProofUrl && (
        <div className="max-w-3xl w-full mt-8 bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100 p-10 print:shadow-none print:border-none print:p-0 print:break-before-page">
          <h3 className="text-xl font-bold border-b border-gray-100 pb-2 mb-6">Refund Proof Screenshot</h3>
          <div className="flex justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={refund.refundProofUrl} 
              alt="Refund Proof" 
              className="max-w-full max-h-[800px] object-contain border border-gray-200 rounded-lg"
            />
          </div>
        </div>
      )}

      {/* Print Button */}
      <PrintButton />
    </div>
  );
}
