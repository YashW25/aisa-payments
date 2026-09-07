'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle, Download, ExternalLink, Upload } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

type FormField = {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  options?: string[];
};

type PaymentLink = {
  id: string | number;
  title: string;
  description?: string | null;
  amount: number | string;
  upiId: string;
  enablePlatformFee?: boolean;
  formFields?: FormField[];
  upiName?: string | null;
  paymentNote?: string | null;
};

type PaymentClientProps = {
  link: PaymentLink;
};

type UpiApp = {
  name: string;
  packageName: string;
  className: string;
};

const MAX_SCREENSHOT_SIZE = 10 * 1024 * 1024; // 10 MB

// These are Android package names used only to target an installed app.
// The generic UPI intent and QR remain the universal fallback.
const UPI_APPS: UpiApp[] = [
  {
    name: 'PhonePe',
    packageName: 'com.phonepe.app',
    className: 'bg-purple-600 hover:bg-purple-700',
  },
  {
    name: 'Google Pay',
    packageName: 'com.google.android.apps.nbu.paisa.user',
    className: 'bg-blue-600 hover:bg-blue-700',
  },
  {
    name: 'Paytm',
    packageName: 'net.one97.paytm',
    className: 'bg-sky-500 hover:bg-sky-600',
  },
  {
    name: 'BHIM',
    packageName: 'in.org.npci.upiapp',
    className: 'bg-emerald-600 hover:bg-emerald-700',
  },
  {
    name: 'Navi',
    packageName: 'com.naviapp',
    className: 'bg-green-600 hover:bg-green-700',
  },
  {
    name: 'MobiKwik',
    packageName: 'com.mobikwik_new',
    className: 'bg-orange-500 hover:bg-orange-600',
  },
  {
    name: 'super.money',
    packageName: 'com.supermoney',
    className: 'bg-gray-800 hover:bg-gray-900',
  },
];

function formatINR(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'An unexpected error occurred.';
}

export default function PaymentClient({ link }: PaymentClientProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [file, setFile] = useState<File | null>(null);
  const [screenshotDataUrl, setScreenshotDataUrl] = useState<string | null>(null);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [downloadingReceipt, setDownloadingReceipt] = useState(false);

  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    setIsMobile(/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent));
    setIsAndroid(/android/i.test(userAgent));
  }, []);

  const baseAmount = useMemo(() => {
    const amount = Number(link.amount);
    return Number.isFinite(amount) && amount >= 0 ? amount : 0;
  }, [link.amount]);

  const platformFee = useMemo(() => {
    if (!link.enablePlatformFee) return 0;
    return Number((baseAmount * 0.02).toFixed(2));
  }, [baseAmount, link.enablePlatformFee]);

  const totalAmount = useMemo(() => {
    return Number((baseAmount + platformFee).toFixed(2));
  }, [baseAmount, platformFee]);

  // Keep this URI intentionally minimal. It is also the exact payload used for the QR.
  const upiParams = useMemo(() => {
    const params = new URLSearchParams();
    params.set('pa', String(link.upiId ?? '').trim());
    params.set('am', totalAmount.toFixed(2));
    params.set('cu', 'INR');
    return params;
  }, [link.upiId, totalAmount]);

  const upiUrl = useMemo(() => `upi://pay?${upiParams.toString()}`, [upiParams]);

  const today = useMemo(
    () =>
      new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    []
  );

  const fields = Array.isArray(link.formFields) ? link.formFields : [];

  const handleInputChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProceedToPay = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    // Browser-native form validation handles required/type constraints.
    if (!String(link.upiId ?? '').trim()) {
      setError('This payment link is missing a valid UPI ID. Please contact the administrator.');
      return;
    }

    if (totalAmount <= 0) {
      setError('Invalid payment amount. Please contact the administrator.');
      return;
    }

    setStep(2);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setError('');

    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith('image/')) {
      setFile(null);
      setScreenshotDataUrl(null);
      setError('Please upload an image file (PNG, JPG, JPEG, or WebP).');
      event.target.value = '';
      return;
    }

    if (selectedFile.size > MAX_SCREENSHOT_SIZE) {
      setFile(null);
      setScreenshotDataUrl(null);
      setError('Payment screenshot must be 10 MB or smaller.');
      event.target.value = '';
      return;
    }

    setFile(selectedFile);

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setScreenshotDataUrl(reader.result);
      } else {
        setScreenshotDataUrl(null);
      }
    };
    reader.onerror = () => {
      setScreenshotDataUrl(null);
      setError('Unable to read the selected screenshot. Please try again.');
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleSubmitPayment = async () => {
    if (loading) return;

    if (!file) {
      setError('Please upload a payment screenshot.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = new FormData();
      payload.append('linkId', String(link.id));
      payload.append('screenshot', file, file.name);
      payload.append('formData', JSON.stringify(formData));

      const response = await fetch('/api/payments/submit', {
        method: 'POST',
        body: payload,
      });

      const contentType = response.headers.get('content-type') ?? '';
      let data: any = null;

      if (contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        data = text ? { error: text } : null;
      }

      if (!response.ok) {
        throw new Error(data?.error || `Payment submission failed (${response.status}).`);
      }

      if (!data?.transactionId) {
        throw new Error('Payment was submitted, but no reference ID was returned by the server.');
      }

      setTransactionId(String(data.transactionId));
      setStep(3);
    } catch (submissionError) {
      console.error('Payment submission failed:', submissionError);
      setError(getErrorMessage(submissionError));
    } finally {
      setLoading(false);
    }
  };

  const launchUpi = (packageName?: string) => {
    if (!String(link.upiId ?? '').trim()) {
      setError('This payment link has no valid UPI ID.');
      return;
    }

    setError('');

    // Specific app targeting is supported only on Android browsers.
    if (packageName && isAndroid) {
      const encodedParams = upiParams.toString();
      const fallbackUrl = encodeURIComponent(window.location.href);
      const intentUrl =
        `intent://pay?${encodedParams}` +
        `#Intent;scheme=upi;package=${packageName};` +
        `S.browser_fallback_url=${fallbackUrl};end;`;

      window.location.href = intentUrl;
      return;
    }

    // Generic UPI intent is the standards-aligned fallback and is also what the QR encodes.
    window.location.href = upiUrl;
  };

  const handleDownloadReceipt = async () => {
    if (!receiptRef.current || downloadingReceipt) return;

    setDownloadingReceipt(true);
    try {
      const element = receiptRef.current;

      // Keep the receipt rendered off-screen instead of opacity:0 so html2canvas can capture it.
      const canvas = await html2canvas(element, {
        scale: Math.min(2, window.devicePixelRatio || 1),
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      const imageData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const contentWidth = pageWidth - margin * 2;
      const contentHeight = (canvas.height * contentWidth) / canvas.width;

      if (contentHeight <= pageHeight - margin * 2) {
        pdf.addImage(imageData, 'PNG', margin, margin, contentWidth, contentHeight);
      } else {
        // The receipt can be longer than one page; split the canvas into A4-sized pages.
        const sourcePixelsPerMm = canvas.width / contentWidth;
        const pageContentHeightMm = pageHeight - margin * 2;
        const sliceHeightPx = Math.floor(pageContentHeightMm * sourcePixelsPerMm);

        let sourceY = 0;
        let pageNumber = 0;

        while (sourceY < canvas.height) {
          const sliceHeight = Math.min(sliceHeightPx, canvas.height - sourceY);
          const sliceCanvas = document.createElement('canvas');
          sliceCanvas.width = canvas.width;
          sliceCanvas.height = sliceHeight;

          const context = sliceCanvas.getContext('2d');
          if (!context) throw new Error('Unable to prepare receipt PDF.');

          context.fillStyle = '#ffffff';
          context.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
          context.drawImage(
            canvas,
            0,
            sourceY,
            canvas.width,
            sliceHeight,
            0,
            0,
            canvas.width,
            sliceHeight
          );

          if (pageNumber > 0) pdf.addPage();

          const sliceHeightMm = sliceHeight / sourcePixelsPerMm;
          pdf.addImage(
            sliceCanvas.toDataURL('image/png', 1.0),
            'PNG',
            margin,
            margin,
            contentWidth,
            sliceHeightMm
          );

          sourceY += sliceHeight;
          pageNumber += 1;
        }
      }

      const safeTransactionId = transactionId.replace(/[^a-zA-Z0-9_-]/g, '_') || 'payment';
      pdf.save(`AISA-Receipt-${safeTransactionId}.pdf`);
    } catch (receiptError) {
      console.error('Failed to generate receipt:', receiptError);
      setError(`Could not generate the receipt PDF: ${getErrorMessage(receiptError)}`);
    } finally {
      setDownloadingReceipt(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-aisa-navy)] text-[var(--color-aisa-text)] flex flex-col items-center py-12 px-4 relative overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--color-aisa-blue)] rounded-full mix-blend-screen blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[var(--color-aisa-gold)] rounded-full mix-blend-screen blur-[120px]" />
      </div>

      <div className="z-10 w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        <div className="p-8 text-center border-b border-white/10 bg-black/20">
          <h1 className="text-3xl font-bold tracking-wider mb-2">
            <span className="text-[var(--color-aisa-blue)]">AISA</span>
          </h1>
          <h2 className="text-xl font-semibold mb-4">{link.title}</h2>

          <div className="inline-block px-6 py-3 bg-[var(--color-aisa-gold)]/10 border border-[var(--color-aisa-gold)]/30 rounded-xl">
            <p className="text-sm text-[var(--color-aisa-gold-dark)] mb-1 uppercase tracking-wider font-semibold">
              {link.enablePlatformFee ? 'Total Payable (incl. 2% fee)' : 'Amount Payable'}
            </p>
            <p className="text-4xl font-bold text-[var(--color-aisa-gold)]">
              ₹{formatINR(totalAmount)}
            </p>
          </div>
        </div>

        <div className="p-8 flex-1">
          {error && (
            <div className="mb-6 p-3 rounded-lg bg-red-500/20 text-red-200 border border-red-500/50 text-sm text-center break-words">
              {error}
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleProceedToPay} className="space-y-5">
              {fields.length === 0 && (
                <p className="text-sm text-gray-400 text-center">
                  No additional information is required.
                </p>
              )}

              {fields.map((field, index) => {
                const fieldName = String(field.name ?? '').trim();
                if (!fieldName) return null;

                return (
                  <div key={`${fieldName}-${index}`}>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      {field.label || fieldName} {field.required ? '*' : ''}
                    </label>

                    {field.type === 'select' ? (
                      <select
                        name={fieldName}
                        required={Boolean(field.required)}
                        value={formData[fieldName] || ''}
                        onChange={(event) => handleInputChange(fieldName, event.target.value)}
                        className="w-full px-4 py-3 rounded-lg bg-black/30 border border-white/10 focus:border-[var(--color-aisa-blue)] outline-none appearance-none"
                      >
                        <option value="" disabled>
                          Select {field.label || fieldName}
                        </option>
                        {(Array.isArray(field.options) ? field.options : []).map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        name={fieldName}
                        type={field.type === 'email' || fieldName.toLowerCase() === 'email' ? 'email' : 'text'}
                        required={Boolean(field.required)}
                        value={formData[fieldName] || ''}
                        onChange={(event) => handleInputChange(fieldName, event.target.value)}
                        className="w-full px-4 py-3 rounded-lg bg-black/30 border border-white/10 focus:border-[var(--color-aisa-blue)] outline-none"
                      />
                    )}
                  </div>
                );
              })}

              <button
                type="submit"
                className="w-full py-4 mt-6 bg-[var(--color-aisa-blue)] hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg transition-all text-lg"
              >
                Proceed to Pay ₹{formatINR(totalAmount)}
              </button>
            </form>
          )}

          {step === 2 && (
            <div className="space-y-8 flex flex-col items-center">
              {isMobile && (
                <div className="w-full space-y-6">
                  <div className="text-center">
                    <h3 className="font-semibold text-lg mb-1">Choose your UPI app</h3>
                    <p className="text-sm text-gray-400">
                      {isAndroid
                        ? 'Choose an app or use the generic UPI option below.'
                        : 'Use a supported UPI app or scan the QR code below.'}
                    </p>
                  </div>

                  {isAndroid && (
                    <div className="grid grid-cols-2 gap-3">
                      {UPI_APPS.map((app) => (
                        <button
                          key={app.packageName}
                          onClick={() => launchUpi(app.packageName)}
                          type="button"
                          className={`w-full py-3 px-2 ${app.className} text-white font-semibold rounded-xl shadow-md transition-transform hover:scale-[1.02] active:scale-95 text-sm`}
                        >
                          {app.name}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="pt-2 border-t border-white/10">
                    <button
                      onClick={() => launchUpi()}
                      type="button"
                      className="w-full py-4 bg-white text-[var(--color-aisa-navy)] font-bold rounded-xl shadow-lg transition-transform hover:scale-[1.02] active:scale-95 text-lg flex items-center justify-center gap-2"
                    >
                      <ExternalLink className="w-5 h-5" />
                      Pay with any UPI app
                    </button>
                  </div>
                </div>
              )}

              <div className="w-full text-center space-y-4 pt-4 border-t border-white/10">
                <p className="text-gray-300 font-medium">Scan QR Code to Pay</p>
                <div className="bg-white p-4 rounded-2xl inline-block shadow-[0_0_40px_rgba(255,255,255,0.1)]">
                  <QRCodeSVG value={upiUrl} size={220} includeMargin />
                </div>
                <p className="font-mono text-sm text-[var(--color-aisa-gold)] mt-2 break-all">
                  {link.upiId}
                </p>
                <p className="text-xs text-gray-500">
                  Scan using any UPI app. The QR contains the same amount shown above.
                </p>
              </div>

              <div className="w-full h-px bg-white/10 my-2" />

              <div className="w-full text-center space-y-4">
                <h3 className="font-semibold text-lg">Payment Completed?</h3>
                <p className="text-sm text-gray-400">
                  Upload your successful payment screenshot below. It will be sent to the admin for verification.
                </p>

                <label className="flex flex-col items-center justify-center w-full min-h-32 border-2 border-white/20 border-dashed rounded-xl cursor-pointer bg-black/20 hover:bg-black/40 hover:border-[var(--color-aisa-blue)] transition-all px-4 py-4">
                  <div className="flex flex-col items-center justify-center text-center">
                    <Upload className="w-8 h-8 mb-2 text-gray-400" />
                    <p className="mb-2 text-sm text-gray-400">
                      <span className="font-semibold text-[var(--color-aisa-blue)]">Click to upload</span>{' '}
                      or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG, JPEG or WebP • Max 10 MB</p>
                    {file && (
                      <p className="text-xs text-green-400 font-medium mt-2 break-all">{file.name}</p>
                    )}
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/png,image/jpeg,image/webp,image/*"
                    onChange={handleFileChange}
                  />
                </label>

                <button
                  onClick={handleSubmitPayment}
                  disabled={loading || !file}
                  type="button"
                  className="w-full py-4 mt-4 bg-white text-[var(--color-aisa-navy)] font-bold rounded-xl shadow-lg hover:bg-gray-200 transition-all text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Submitting...' : 'Submit Payment'}
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center space-y-6 py-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/20 text-green-400 mb-4">
                <CheckCircle className="w-10 h-10" />
              </div>

              <h2 className="text-2xl font-bold">Payment Submitted!</h2>
              <p className="text-gray-400">
                Your payment has been recorded and is awaiting admin verification.
              </p>

              <div className="bg-black/30 border border-white/10 p-4 rounded-xl mt-6 inline-block w-full text-left">
                <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Reference ID</p>
                <p className="font-mono text-xl font-bold text-[var(--color-aisa-gold)] mb-4 break-all">
                  {transactionId}
                </p>

                <div className="space-y-2 text-sm text-gray-300">
                  <div className="flex justify-between gap-4 border-b border-white/5 pb-2">
                    <span>Payment For</span>
                    <span className="font-semibold text-white text-right">{link.title}</span>
                  </div>
                  <div className="flex justify-between gap-4 border-b border-white/5 pb-2">
                    <span>Base Amount</span>
                    <span className="font-semibold text-gray-300">₹{formatINR(baseAmount)}</span>
                  </div>
                  {link.enablePlatformFee && (
                    <div className="flex justify-between gap-4 border-b border-white/5 pb-2">
                      <span>Platform Fee (2%)</span>
                      <span className="font-semibold text-gray-300">₹{formatINR(platformFee)}</span>
                    </div>
                  )}
                  <div className="flex justify-between gap-4 border-b border-white/5 pb-2">
                    <span>Total Paid</span>
                    <span className="font-semibold text-[var(--color-aisa-gold)]">₹{formatINR(totalAmount)}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span>Status</span>
                    <span className="font-semibold text-[var(--color-aisa-blue)]">Under Review</span>
                  </div>
                </div>
              </div>

              <div className="mt-2 flex justify-center">
                <button
                  onClick={handleDownloadReceipt}
                  disabled={downloadingReceipt}
                  type="button"
                  className="flex items-center space-x-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-colors border border-white/10 disabled:opacity-50"
                >
                  <Download className="w-5 h-5" />
                  <span>{downloadingReceipt ? 'Generating PDF...' : 'Download AISA Receipt'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Off-screen receipt template: kept rendered so html2canvas can capture it. */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          left: '-10000px',
          top: '0',
          width: '800px',
          zIndex: -1,
          pointerEvents: 'none',
        }}
      >
        <div
          ref={receiptRef}
          style={{
            width: '800px',
            backgroundColor: '#ffffff',
            color: '#1a1a1a',
            padding: '40px',
            fontFamily: 'Arial, Helvetica, sans-serif',
            boxSizing: 'border-box',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px', gap: '30px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              <img
                src="/LOGO.jpeg"
                alt="AISA Logo"
                style={{
                  height: '80px',
                  width: 'auto',
                  maxWidth: '260px',
                  objectFit: 'contain',
                  objectPosition: 'left center',
                  marginBottom: '16px',
                  alignSelf: 'flex-start',
                }}
                crossOrigin="anonymous"
                onError={(event) => {
                  event.currentTarget.style.display = 'none';
                }}
              />
              <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#00BFFF', margin: '0 0 8px 0' }}>
                AISA Payment Receipt
              </h1>
              <p style={{ color: '#666', margin: 0, fontSize: '14px', lineHeight: '1.5' }}>
                AI &amp; Data Science Students Association
                <br />
                ISBM University
              </p>
            </div>

            <div style={{ width: '300px', flexShrink: 0 }}>
              <div
                style={{
                  backgroundColor: '#00BFFF',
                  color: 'white',
                  padding: '12px 16px',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  wordBreak: 'break-word',
                }}
              >
                Receipt: {transactionId || 'Pending'}
              </div>
              <div style={{ backgroundColor: '#f0f0f0', padding: '12px 16px', fontSize: '14px', color: '#333' }}>
                Transaction Date: {today}
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '40px' }}>
            <p style={{ fontSize: '12px', fontWeight: 'bold', margin: '0 0 8px 0' }}>PAYER INFORMATION</p>
            {Object.entries(formData).length === 0 ? (
              <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>Student</p>
            ) : (
              Object.entries(formData).map(([key, value]) => (
                <p key={key} style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#666' }}>
                  <strong style={{ color: '#333' }}>{key}:</strong> {value || '-'}
                </p>
              ))
            )}
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '40px' }}>
            <thead>
              <tr style={{ backgroundColor: '#00BFFF', color: 'white', fontSize: '12px' }}>
                <th style={{ padding: '12px', textAlign: 'left' }}>PRODUCT / SERVICE</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>DESCRIPTION</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>QTY.</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>COST</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>TOTAL</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '16px 12px', fontSize: '14px', color: '#020713' }}>{link.title}</td>
                <td style={{ padding: '16px 12px', fontSize: '13px', color: '#666' }}>
                  {link.description || 'Payment'}
                </td>
                <td style={{ padding: '16px 12px', fontSize: '14px', textAlign: 'center' }}>1</td>
                <td style={{ padding: '16px 12px', fontSize: '14px', textAlign: 'right' }}>
                  ₹{formatINR(baseAmount)}
                </td>
                <td style={{ padding: '16px 12px', fontSize: '14px', textAlign: 'right' }}>
                  ₹{formatINR(baseAmount)}
                </td>
              </tr>
            </tbody>
          </table>

          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '40px' }}>
            <div style={{ flex: 1, paddingRight: '20px' }}>
              <p style={{ color: '#666', fontSize: '14px' }}>Thank you for your payment.</p>
              <p style={{ color: '#999', fontSize: '12px', lineHeight: '1.5' }}>
                This receipt confirms submission of payment proof. The payment remains subject to administrative verification.
              </p>
            </div>
            <div style={{ width: '300px', flexShrink: 0 }}>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#666', marginBottom: '16px' }}>
                Payment Summary
              </h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '8px', marginBottom: '8px' }}>
                <span style={{ color: '#666' }}>Subtotal</span>
                <span>₹{formatINR(baseAmount)}</span>
              </div>
              {link.enablePlatformFee && (
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '8px', marginBottom: '8px' }}>
                  <span style={{ color: '#666' }}>Platform Fee (2%)</span>
                  <span>₹{formatINR(platformFee)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '16px' }}>
                <span>Total</span>
                <span>₹{formatINR(totalAmount)}</span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '40px', padding: '20px', backgroundColor: '#f9f9f9', border: '1px solid #eee', fontSize: '11px', color: '#555', lineHeight: '1.6' }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#00BFFF', fontWeight: 'bold' }}>
              PAYMENT &amp; VERIFICATION NOTICE
            </h4>
            <p style={{ margin: '0 0 8px 0' }}>
              <strong>1. Payment Processing:</strong> Payment was initiated using the UPI details displayed on the AISA payment page.
            </p>
            <p style={{ margin: '0 0 8px 0' }}>
              <strong>2. Verification:</strong> All submitted payments are subject to administrative verification against the submitted payment proof.
            </p>
            <p style={{ margin: '0 0 8px 0' }}>
              <strong>3. Refunds:</strong> Refund decisions are subject to the applicable AISA/ISBM event or payment policy.
            </p>
            <p style={{ margin: 0 }}>
              <strong>4. Reference:</strong> Keep this reference ID for future communication regarding the payment.
            </p>
          </div>

          <div style={{ marginTop: '50px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', color: '#999' }}>AISA • ISBM University</span>
            <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#00BFFF', letterSpacing: '1px' }}>
              AISA PAYMENT PORTAL
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}