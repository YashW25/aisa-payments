import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import { Download } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function InvoicePage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const payment = await prisma.payment.findUnique({
    where: { id: params.id },
    include: { link: true },
  });

  if (!payment) {
    return notFound();
  }

  const customFields = payment.customFields ? (payment.customFields as Record<string, string>) : {};
  const formattedDate = new Date(payment.submittedAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4 text-gray-900">
      
      <div className="max-w-3xl w-full bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100 p-10 print:shadow-none print:border-none print:p-0">
        
        {/* Header */}
        <div className="flex justify-between items-start border-b border-gray-100 pb-8 mb-8">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">INVOICE</h1>
            <p className="text-gray-500 mt-2 font-medium">Payment Receipt</p>
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
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Billed To</p>
            <p className="font-semibold text-lg">{payment.name}</p>
            <p className="text-gray-600">{payment.email}</p>
            {payment.phone && <p className="text-gray-600">{payment.phone}</p>}
            {payment.prn && <p className="text-gray-600 mt-1 text-sm bg-gray-100 inline-block px-2 py-0.5 rounded">PRN: {payment.prn}</p>}
          </div>
          <div className="text-right">
            <div className="mb-4">
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Invoice Number</p>
              <p className="font-mono font-semibold">{payment.transactionId}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Date of Issue</p>
              <p className="font-semibold">{formattedDate}</p>
            </div>
          </div>
        </div>

        {/* Status Banner */}
        <div className={`mb-8 p-4 rounded-lg flex items-center justify-center font-bold tracking-widest uppercase ${
          payment.status === 'VERIFIED' ? 'bg-green-50 text-green-700 border border-green-200' :
          payment.status === 'REJECTED' ? 'bg-red-50 text-red-700 border border-red-200' :
          'bg-yellow-50 text-yellow-700 border border-yellow-200'
        }`}>
          Status: {payment.status}
        </div>

        {/* Form Responses (if any) */}
        {Object.keys(customFields).length > 0 && (
          <div className="mb-10">
            <h3 className="text-lg font-bold border-b border-gray-100 pb-2 mb-4">Form Responses</h3>
            <div className="grid grid-cols-2 gap-y-4 gap-x-8">
              {Object.entries(customFields).map(([q, a], idx) => (
                <div key={idx}>
                  <p className="text-xs text-gray-500 font-semibold">{q}</p>
                  <p className="font-medium text-gray-900 mt-1">{a}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Line Items */}
        <table className="w-full text-left mb-8">
          <thead className="border-b border-gray-200">
            <tr>
              <th className="py-3 text-sm font-semibold text-gray-500 uppercase tracking-wider">Description</th>
              <th className="py-3 text-sm font-semibold text-gray-500 uppercase tracking-wider text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            <tr>
              <td className="py-4">
                <p className="font-semibold">{payment.link.title}</p>
                {payment.link.description && <p className="text-sm text-gray-500 line-clamp-1">{payment.link.description}</p>}
              </td>
              <td className="py-4 text-right font-semibold">₹{payment.amount.toString()}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td className="py-4 text-right font-bold text-gray-500 pr-8">Total</td>
              <td className="py-4 text-right font-bold text-2xl">₹{payment.amount.toString()}</td>
            </tr>
          </tfoot>
        </table>

        {/* Footer */}
        <div className="border-t border-gray-100 pt-8 text-center text-sm text-gray-400">
          <p>Thank you for your payment to AISA.</p>
          <p className="mt-1">For any queries, please contact the administration.</p>
        </div>
      </div>

      {/* Print Button (hidden when printing) */}
      <div className="mt-8 print:hidden">
        <button 
          id="print-btn"
          className="inline-flex items-center px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-xl shadow-lg transition-all"
        >
          <Download className="w-5 h-5 mr-2" />
          Download / Print Invoice
        </button>
      </div>
      {/* 
        Hack for onClick="window.print()" in a server component layout:
        We will just use a tiny script below
      */}
      <script dangerouslySetInnerHTML={{
        __html: `
          document.querySelector('button').addEventListener('click', () => window.print());
        `
      }} />

    </div>
  );
}
