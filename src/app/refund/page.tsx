'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function RefundPolicyGateway() {
  const [transactionId, setTransactionId] = useState('');
  const [email, setEmail] = useState('');
  const [studentUpiId, setStudentUpiId] = useState('');
  const [reason, setReason] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    try {
      const res = await fetch('/api/refund/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId, email, studentUpiId, reason })
      });
      const data = await res.json();
      
      if (res.ok) {
        setStatus('success');
        setMessage(data.message || 'Refund request submitted successfully.');
      } else {
        setStatus('error');
        setMessage(data.error || 'Failed to submit refund request.');
      }
    } catch (err) {
      setStatus('error');
      setMessage('An unexpected error occurred.');
    }
  };

  return (
    <div className="min-h-screen bg-[#020713] text-white font-sans flex flex-col items-center py-12 px-4 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[#00BFFF]/10 rounded-full filter blur-[160px]" />
      </div>

      <div className="relative z-10 w-full max-w-2xl mb-8 flex justify-between items-center">
        <Link href="/" className="inline-flex items-center space-x-2 text-gray-400 hover:text-white transition-colors">
          <span>&larr;</span>
          <span>Back to Home</span>
        </Link>
        <Image src="/LOGO.jpeg" alt="AISA Logo" width={40} height={40} className="rounded-lg" />
      </div>

      <div className="relative z-10 w-full max-w-2xl bg-black/40 border border-white/10 rounded-3xl p-8 backdrop-blur-md shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Refund Policy &amp; Gateway</h1>
          <p className="text-sm text-gray-400">Request a refund for your AISA payment</p>
        </div>

        <div className="mb-8 p-6 bg-white/5 border border-white/10 rounded-2xl">
          <h2 className="text-xl font-semibold mb-3 text-amber-400">Refund Policy</h2>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>&bull; Refunds are generally not provided after verification.</li>
            <li>&bull; Valid reasons include duplicate payments or technical errors.</li>
            <li>&bull; Requests must be submitted within 7 days.</li>
            <li>&bull; The 2% platform fee is non-refundable.</li>
            <li>&bull; Approvals are at the discretion of the AISA finance team.</li>
          </ul>
        </div>

        {status === 'success' ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">✅</span>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Request Submitted</h2>
            <p className="text-gray-400 mb-6">{message}</p>
            <button
              onClick={() => { setStatus('idle'); setTransactionId(''); setEmail(''); setReason(''); }}
              className="px-6 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white font-medium transition-colors"
            >
              Submit Another Request
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Transaction ID</label>
              <input
                type="text"
                required
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder="e.g. AISA-2026-XXXX"
                className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00BFFF]/50 text-white placeholder:text-gray-600 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Email Address (used during payment)</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00BFFF]/50 text-white placeholder:text-gray-600 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">UPI ID for Refund</label>
              <input
                type="text"
                required
                value={studentUpiId}
                onChange={(e) => setStudentUpiId(e.target.value)}
                placeholder="e.g. yourname@okaxis"
                className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00BFFF]/50 text-white placeholder:text-gray-600 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Reason for Refund</label>
              <textarea
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Please describe why you are requesting a refund..."
                className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00BFFF]/50 text-white placeholder:text-gray-600 transition-all min-h-[100px]"
              />
            </div>

            {status === 'error' && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-bold rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === 'loading' ? 'Submitting...' : 'Submit Refund Request'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
