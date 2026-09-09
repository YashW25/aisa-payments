'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, ExternalLink, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function VerifyPage() {
  const [transactionId, setTransactionId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transactionId.trim()) return;

    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId: transactionId.trim() })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to verify payment');
      } else {
        setResult(data);
      }
    } catch (err) {
      setError('An error occurred while verifying the payment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020713] text-white font-sans flex flex-col items-center justify-center p-4">
      {/* Ambient background glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[#00BFFF]/10 rounded-full filter blur-[160px]" />
      </div>

      <div className="relative z-10 w-full max-w-lg">
        <Link href="/" className="text-sm text-gray-400 hover:text-white mb-8 inline-block transition-colors">
          &larr; Back to Home
        </Link>
        
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">
            Verify Payment
          </h1>
          <p className="text-gray-400">
            Enter your Transaction ID to check the status of your payment and download your invoice.
          </p>
        </div>

        <form onSubmit={handleVerify} className="mb-8">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              className="bg-black/40 border border-white/20 text-white text-lg rounded-xl focus:ring-[#00BFFF] focus:border-[#00BFFF] block w-full pl-12 p-4 outline-none transition-colors"
              placeholder="e.g. AISA-2026-XXXX"
              required
            />
            <button
              type="submit"
              disabled={isLoading || !transactionId.trim()}
              className="absolute inset-y-2 right-2 px-6 bg-[#00BFFF] hover:bg-sky-400 text-white font-bold rounded-lg transition-all disabled:opacity-50"
            >
              {isLoading ? 'Checking...' : 'Verify'}
            </button>
          </div>
          {error && (
            <p className="text-red-400 text-sm mt-3 text-center">{error}</p>
          )}
        </form>

        {result && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-6 pb-6 border-b border-white/10">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Status</p>
                <div className="flex items-center space-x-2">
                  {result.status === 'VERIFIED' ? (
                    <><CheckCircle className="w-5 h-5 text-green-400" /><span className="text-lg font-bold text-green-400">Verified</span></>
                  ) : result.status === 'REJECTED' ? (
                    <><XCircle className="w-5 h-5 text-red-400" /><span className="text-lg font-bold text-red-400">Rejected</span></>
                  ) : (
                    <><Clock className="w-5 h-5 text-amber-400" /><span className="text-lg font-bold text-amber-400">Pending</span></>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Amount</p>
                <p className="text-xl font-bold">₹{result.amount}</p>
              </div>
            </div>

            <dl className="space-y-4 text-sm mb-8">
              <div>
                <dt className="text-gray-500 mb-1">Student Name</dt>
                <dd className="font-semibold text-white text-base">{result.name}</dd>
              </div>
              <div>
                <dt className="text-gray-500 mb-1">Payment For</dt>
                <dd className="text-gray-300">{result.linkTitle}</dd>
              </div>
              <div>
                <dt className="text-gray-500 mb-1">Transaction ID</dt>
                <dd className="font-mono text-gray-400">{result.transactionId}</dd>
              </div>
              <div>
                <dt className="text-gray-500 mb-1">Date Submitted</dt>
                <dd className="text-gray-400">{new Date(result.submittedAt).toLocaleString()}</dd>
              </div>
            </dl>

            <Link
              href={`/invoice/${result.id}`}
              target="_blank"
              className="flex items-center justify-center w-full py-4 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold rounded-xl transition-all"
            >
              <ExternalLink className="w-5 h-5 mr-2" />
              View / Download Invoice
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
