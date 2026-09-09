'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';

export default function ProcessRefundClient({ 
  refundId, 
  adminId, 
  studentUpiId,
  amount,
  payeeName
}: { 
  refundId: string; 
  adminId: string; 
  studentUpiId: string;
  amount: number;
  payeeName: string;
}) {
  const [status, setStatus] = useState<'idle' | 'loading'>('idle');
  const [error, setError] = useState('');
  const [notes, setNotes] = useState('');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const router = useRouter();

  const upiUrl = useMemo(() => {
    if (!studentUpiId || !amount) return '';
    return `upi://pay?pa=${encodeURIComponent(studentUpiId)}&pn=${encodeURIComponent(payeeName)}&am=${amount.toFixed(2)}&cu=INR&tn=Refund%20from%20AISA`;
  }, [studentUpiId, payeeName, amount]);

  const handleProcess = async (action: 'APPROVE' | 'REJECT') => {
    if (action === 'APPROVE' && !proofFile) {
      setError('You must upload a screenshot proof to approve the refund.');
      return;
    }

    setStatus('loading');
    setError('');

    try {
      const formData = new FormData();
      formData.append('action', action);
      formData.append('notes', notes);
      formData.append('adminId', adminId);
      
      if (action === 'APPROVE' && proofFile) {
        formData.append('file', proofFile);
      }

      const res = await fetch(`/api/admin/refunds/${refundId}/process`, {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to process refund');
      }

      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setStatus('idle');
    }
  };

  return (
    <div className="space-y-6">
      {studentUpiId && upiUrl && (
        <div className="bg-white/5 p-4 rounded-xl flex flex-col md:flex-row items-center gap-6">
          <div className="p-4 bg-white rounded-xl shadow-lg shrink-0">
            <QRCodeSVG value={upiUrl} size={150} level="H" includeMargin={true} />
          </div>
          <div className="flex-1 space-y-2 text-sm text-gray-300">
            <h3 className="font-bold text-white text-base">Scan to Refund</h3>
            <p>Scan this QR code with any UPI app to directly refund <strong>₹{amount.toFixed(2)}</strong> to the student.</p>
            <div className="bg-black/50 p-2 rounded border border-white/10 font-mono text-xs">
              {studentUpiId}
            </div>
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm text-gray-400 mb-2">Upload Refund Screenshot (Required for Approval)</label>
        <input 
          type="file" 
          accept="image/*"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) setProofFile(f);
          }}
          className="block w-full text-sm text-gray-400
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-[var(--color-aisa-blue)]/20 file:text-[var(--color-aisa-blue)]
            hover:file:bg-[var(--color-aisa-blue)]/30 transition-colors"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">Admin Notes (Optional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Enter notes about this decision..."
          className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#00BFFF]/50 text-white text-sm placeholder:text-gray-600 min-h-[80px]"
        />
      </div>

      {error && (
        <div className="p-2 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded">
          {error}
        </div>
      )}

      <div className="flex space-x-3 pt-2">
        <button
          onClick={() => handleProcess('APPROVE')}
          disabled={status === 'loading'}
          className="px-6 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
        >
          {status === 'loading' ? 'Processing...' : 'Approve Refund'}
        </button>
        <button
          onClick={() => handleProcess('REJECT')}
          disabled={status === 'loading'}
          className="px-6 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
        >
          {status === 'loading' ? 'Processing...' : 'Reject Refund'}
        </button>
      </div>
    </div>
  );
}
