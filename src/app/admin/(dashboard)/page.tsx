import prisma from '@/lib/prisma';
import { IndianRupee, Link as LinkIcon, Clock, CheckCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const [totalLinks, payments] = await Promise.all([
    prisma.paymentLink.count(),
    prisma.payment.findMany(),
  ]);

  const successfulPayments = payments.filter(p => p.status === 'VERIFIED');
  const pendingPayments = payments.filter(p => p.status === 'SUBMITTED' || p.status === 'UNDER_REVIEW');
  
  const totalCollections = successfulPayments.reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <div className="space-y-6 text-[var(--color-aisa-text)]">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
        <p className="text-sm text-gray-400">Overview of AISA payment collections</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-black/20 border border-white/10 p-5 rounded-xl">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-gray-400 text-sm font-medium mb-1">Total Collections</p>
              <h3 className="text-2xl font-bold text-[var(--color-aisa-gold)]">₹{totalCollections.toLocaleString()}</h3>
            </div>
            <div className="p-2 bg-[var(--color-aisa-gold)]/10 rounded-lg text-[var(--color-aisa-gold)]">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
        </div>
        
        <div className="bg-black/20 border border-white/10 p-5 rounded-xl">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-gray-400 text-sm font-medium mb-1">Successful</p>
              <h3 className="text-2xl font-bold text-green-400">{successfulPayments.length}</h3>
            </div>
            <div className="p-2 bg-green-500/10 rounded-lg text-green-400">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="bg-black/20 border border-white/10 p-5 rounded-xl">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-gray-400 text-sm font-medium mb-1">Pending Verification</p>
              <h3 className="text-2xl font-bold text-[var(--color-aisa-blue)]">{pendingPayments.length}</h3>
            </div>
            <div className="p-2 bg-[var(--color-aisa-blue)]/10 rounded-lg text-[var(--color-aisa-blue)]">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="bg-black/20 border border-white/10 p-5 rounded-xl">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-gray-400 text-sm font-medium mb-1">Payment Links</p>
              <h3 className="text-2xl font-bold text-[var(--color-aisa-accent)]">{totalLinks}</h3>
            </div>
            <div className="p-2 bg-[var(--color-aisa-accent)]/10 rounded-lg text-[var(--color-aisa-accent)]">
              <LinkIcon className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Payments Preview (Optional, can be expanded later) */}
      <div className="bg-black/20 border border-white/10 rounded-xl overflow-hidden">
        <div className="p-5 border-b border-white/10">
          <h2 className="text-lg font-semibold">Recent Payments</h2>
        </div>
        <div className="p-5 text-center text-gray-400 text-sm py-12">
          Payments list view will be implemented here.
        </div>
      </div>
    </div>
  );
}
