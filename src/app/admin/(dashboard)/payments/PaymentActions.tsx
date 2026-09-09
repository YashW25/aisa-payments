'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Loader2, RefreshCcw } from 'lucide-react';

export default function PaymentActions({
  paymentId,
  currentStatus,
}: {
  paymentId: string;
  currentStatus: string;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [studentUpiId, setStudentUpiId] = useState('');
  const [reason, setReason] = useState('Admin initiated refund');
  const router = useRouter();

  const handleStatusUpdate = async (newStatus: 'VERIFIED' | 'REJECTED') => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/payments/${paymentId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        throw new Error('Failed to update status');
      }

      router.refresh();
    } catch (error) {
      console.error(error);
      alert('Failed to update payment status');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInitiateRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/payments/${paymentId}/refund/initiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentUpiId, reason }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to initiate refund');
      }

      setShowRefundModal(false);
      router.push('/admin/refunds');
      router.refresh();
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'Failed to initiate refund');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Loader2 className="w-5 h-5 animate-spin text-[var(--color-aisa-blue)]" />;
  }

  if (currentStatus === 'VERIFIED') {
    return (
      <>
        <button
          onClick={() => setShowRefundModal(true)}
          className="inline-flex items-center px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 rounded-lg text-xs transition-colors"
        >
          <RefreshCcw className="w-3 h-3 mr-1.5" /> Initiate Refund
        </button>

        {showRefundModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-[#111] border border-white/10 p-6 rounded-xl w-full max-w-md shadow-2xl">
              <h3 className="text-lg font-bold text-white mb-4">Initiate Refund</h3>
              <form onSubmit={handleInitiateRefund} className="space-y-4 text-left">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Student UPI ID</label>
                  <input
                    type="text"
                    required
                    value={studentUpiId}
                    onChange={(e) => setStudentUpiId(e.target.value)}
                    placeholder="e.g. student@okaxis"
                    className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-[#00BFFF]"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Reason</label>
                  <textarea
                    required
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-[#00BFFF] min-h-[80px]"
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowRefundModal(false)}
                    className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg text-sm transition-colors"
                  >
                    Initiate
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </>
    );
  }

  if (currentStatus !== 'SUBMITTED') {
    return null;
  }

  return (
    <>
      <button
        onClick={() => handleStatusUpdate('VERIFIED')}
        className="inline-flex items-center px-3 py-1.5 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 rounded-lg text-xs transition-colors"
      >
        <CheckCircle className="w-3 h-3 mr-1.5" /> Verify
      </button>
      <button
        onClick={() => handleStatusUpdate('REJECTED')}
        className="inline-flex items-center px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg text-xs transition-colors"
      >
        <XCircle className="w-3 h-3 mr-1.5" /> Reject
      </button>
    </>
  );
}
