'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PlusCircle, Loader2 } from 'lucide-react';

export default function InitiateRefundButton() {
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [studentUpiId, setStudentUpiId] = useState('');
  const [reason, setReason] = useState('Admin initiated refund');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleInitiateRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/admin/refunds/initiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: name.trim(),
          amount: amount.trim(),
          studentUpiId: studentUpiId.trim(), 
          reason: reason.trim() 
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to initiate refund');
      }

      setShowModal(false);
      setName('');
      setAmount('');
      setStudentUpiId('');
      router.refresh();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to initiate refund');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="inline-flex items-center px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg text-sm transition-colors shadow-lg"
      >
        <PlusCircle className="w-4 h-4 mr-2" /> Create Refund
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#111] border border-white/10 p-6 rounded-xl w-full max-w-md shadow-2xl relative">
            <h3 className="text-lg font-bold text-white mb-4">Create Standalone Refund</h3>
            <form onSubmit={handleInitiateRefund} className="space-y-4 text-left">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Student Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Refund Amount (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 500.00"
                  className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Student UPI ID for Refund</label>
                <input
                  type="text"
                  required
                  value={studentUpiId}
                  onChange={(e) => setStudentUpiId(e.target.value)}
                  placeholder="e.g. student@okaxis"
                  className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Reason</label>
                <textarea
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500 min-h-[80px]"
                />
              </div>
              
              {error && (
                <div className="p-2 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded">
                  {error}
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={isLoading}
                  className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center disabled:opacity-50"
                >
                  {isLoading ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating...</>
                  ) : (
                    'Create'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
