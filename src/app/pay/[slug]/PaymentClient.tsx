'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Upload, CheckCircle, Download, ArrowLeft } from 'lucide-react';
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
  id: string;
  title: string;
  description?: string | null;
  amount: number | string;
  upiId: string;
  payeeName?: string | null;
  formFields?: FormField[] | null;
  enablePlatformFee?: boolean | null;
  slug?: string | null;
};

type PaymentClientProps = {
  link: PaymentLink;
};

// Removed generateTransactionRef

function formatINR(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0);
}

export default function PaymentClient({ link }: PaymentClientProps) {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [file, setFile] = useState<File | null>(null);
  const [screenshotDataUrl, setScreenshotDataUrl] = useState<string | null>(null);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const receiptRef = useRef<HTMLDivElement>(null);

  const formFields = useMemo(
    () => (Array.isArray(link?.formFields) ? link.formFields : []),
    [link?.formFields]
  );

  const baseAmount = useMemo(() => {
    const value = Number(link?.amount);
    return Number.isFinite(value) && value >= 0 ? value : 0;
  }, [link?.amount]);

  const platformFee = useMemo(
    () => (link?.enablePlatformFee ? Number((baseAmount * 0.02).toFixed(2)) : 0),
    [baseAmount, link?.enablePlatformFee]
  );

  const totalAmount = useMemo(
    () => Number((baseAmount + platformFee).toFixed(2)),
    [baseAmount, platformFee]
  );

  useEffect(() => {
    setFormData({});
    setFile(null);
    setScreenshotDataUrl(null);
    setTransactionId('');
    setStep(1);
    setError('');
  }, [link.id]);

  const upiUrl = useMemo(() => {
    const upiId = String(link?.upiId || '').trim();

    if (!upiId || totalAmount <= 0) {
      return '';
    }

    const params = new URLSearchParams({
      pa: upiId,
      pn: String(link?.payeeName || 'AISA Club').trim(),
      tn: String(link?.title || 'AISA Payment').trim(),
      am: totalAmount.toFixed(2),
      cu: 'INR',
    });

    return `upi://pay?${params.toString()}`;
  }, [link?.upiId, link?.payeeName, link?.title, totalAmount]);

  const today = useMemo(
    () =>
      new Date().toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    []
  );

  const handleInputChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProceedToPay = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (!link?.upiId?.trim()) {
      setError('This payment link does not have a valid UPI ID.');
      return;
    }

    if (!Number.isFinite(baseAmount) || baseAmount <= 0) {
      setError('This payment link has an invalid payment amount.');
      return;
    }

    if (!formData.phone?.trim()) {
      setError('Mobile Number is required.');
      return;
    }

    if (!formData.upiId?.trim()) {
      setError('UPI ID is required.');
      return;
    }

    setStep(2);
  };

  const handleBackToForm = () => {
    if (submitting) return;
    setError('');
    setStep(1);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setError('');

    const selectedFile = event.target.files?.[0];
    if (!selectedFile) {
      return;
    }

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/heic',
      'image/heif',
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      setFile(null);
      setScreenshotDataUrl(null);
      setError('Please upload a JPG, PNG, WEBP, HEIC, or HEIF image.');
      event.target.value = '';
      return;
    }

    const maxSize = 10 * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      setFile(null);
      setScreenshotDataUrl(null);
      setError('Payment screenshot must be 10 MB or smaller.');
      event.target.value = '';
      return;
    }

    setFile(selectedFile);

    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const result = readerEvent.target?.result;
      if (typeof result === 'string') {
        setScreenshotDataUrl(result);
      }
    };
    reader.onerror = () => {
      setScreenshotDataUrl(null);
      setError('Unable to preview the selected screenshot.');
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleSubmitPayment = async () => {
    if (submitting) return;

    if (!file) {
      setError('Please upload a payment screenshot.');
      return;
    }

    if (!file) {
      setError('Please upload a payment screenshot.');
      return;
    }

    setLoading(true);
    setSubmitting(true);
    setError('');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('linkId', String(link.id));
      formDataToSend.append('screenshot', file);
      formDataToSend.append('formData', JSON.stringify(formData));
      formDataToSend.append('amount', totalAmount.toFixed(2));
      formDataToSend.append('upiId', String(link.upiId || '').trim());

      const response = await fetch('/api/payments/submit', {
        method: 'POST',
        body: formDataToSend,
      });

      let data: Record<string, unknown> = {};

      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        data = { error: text || 'Server returned an unexpected response.' };
      }

      if (!response.ok) {
        throw new Error(
          typeof data.error === 'string'
            ? data.error
            : 'Failed to submit payment.'
        );
      }

      const returnedTransactionId =
        typeof data.transactionId === 'string' ? data.transactionId : '';

      setTransactionId(returnedTransactionId);
      setStep(3);
    } catch (submitError) {
      console.error('Payment submission failed:', submitError);
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'An error occurred during submission.'
      );
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  const handleDownloadReceipt = async () => {
    if (!receiptRef.current) {
      setError('Receipt is not ready yet.');
      return;
    }

    setError('');

    try {
      const element = receiptRef.current;

      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => resolve());
      });

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height],
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);

      const screenshotWidth = canvas.width;
      const screenshotHeight = canvas.height;

      if (screenshotDataUrl) {
        const userImg = new Image();
        userImg.src = screenshotDataUrl;

        await new Promise<void>((resolve, reject) => {
          userImg.onload = () => resolve();
          userImg.onerror = (err) => reject(err);
        });

        pdf.addPage([screenshotWidth, screenshotHeight], 'portrait');
        pdf.addImage(
          screenshotDataUrl,
          'JPEG',
          0,
          0,
          screenshotWidth,
          screenshotHeight
        );
      }

      pdf.save(
        `AISA-Receipt-${transactionId || 'payment'}.pdf`
      );
    } catch (receiptError) {
      console.error('Failed to generate receipt:', receiptError);
      setError(
        receiptError instanceof Error
          ? receiptError.message
          : 'Failed to generate the receipt.'
      );
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

          <h2 className="text-xl font-semibold mb-4">
            {link?.title || 'Payment'}
          </h2>

          {link?.description && (
            <p className="text-sm text-gray-400 mb-5">{link.description}</p>
          )}

          <div className="inline-block px-6 py-3 bg-[var(--color-aisa-gold)]/10 border border-[var(--color-aisa-gold)]/30 rounded-xl">
            <p className="text-sm text-[var(--color-aisa-gold-dark)] mb-1 uppercase tracking-wider font-semibold">
              {link?.enablePlatformFee
                ? 'Total Payable (incl. 2% fee)'
                : 'Amount Payable'}
            </p>

            <p className="text-4xl font-bold text-[var(--color-aisa-gold)]">
              {formatINR(totalAmount)}
            </p>
          </div>
        </div>

        <div className="p-8 flex-1">
          {error && (
            <div
              role="alert"
              className="mb-6 p-3 rounded-lg bg-red-500/20 text-red-200 border border-red-500/50 text-sm text-center"
            >
              {error}
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleProceedToPay} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone || ''}
                  onChange={(event) => handleInputChange('phone', event.target.value)}
                  placeholder="Enter mobile number"
                  className="w-full px-4 py-3 rounded-lg bg-black/30 border border-white/10 focus:border-[var(--color-aisa-blue)] outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  UPI ID *
                </label>
                <input
                  type="text"
                  required
                  value={formData.upiId || ''}
                  onChange={(event) => handleInputChange('upiId', event.target.value)}
                  placeholder="Enter UPI ID (e.g. username@bank)"
                  className="w-full px-4 py-3 rounded-lg bg-black/30 border border-white/10 focus:border-[var(--color-aisa-blue)] outline-none"
                />
              </div>

              {formFields.map((field, index) => {
                const fieldName = field?.name || `field_${index}`;
                if (fieldName === 'phone' || fieldName === 'upiId') {
                  return null;
                }
                const fieldLabel = field?.label || fieldName;

                if (field.type === 'select') {
                  return (
                    <div key={`${fieldName}-${index}`}>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        {fieldLabel} {field.required && '*'}
                      </label>

                      <select
                        required={Boolean(field.required)}
                        value={formData[fieldName] || ''}
                        onChange={(event) =>
                          handleInputChange(fieldName, event.target.value)
                        }
                        className="w-full px-4 py-3 rounded-lg bg-black/30 border border-white/10 focus:border-[var(--color-aisa-blue)] outline-none"
                      >
                        <option value="" disabled>
                          Select {fieldLabel}
                        </option>

                        {(Array.isArray(field.options) ? field.options : []).map(
                          (option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          )
                        )}
                      </select>
                    </div>
                  );
                }

                const normalizedType = String(field.type || 'text').toLowerCase();

                const inputType =
                  normalizedType === 'email'
                    ? 'email'
                    : normalizedType === 'tel' ||
                        normalizedType === 'phone' ||
                        normalizedType === 'number'
                      ? normalizedType === 'number'
                        ? 'number'
                        : 'tel'
                      : 'text';

                return (
                  <div key={`${fieldName}-${index}`}>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      {fieldLabel} {field.required && '*'}
                    </label>

                    <input
                      type={inputType}
                      required={Boolean(field.required)}
                      value={formData[fieldName] || ''}
                      onChange={(event) =>
                        handleInputChange(fieldName, event.target.value)
                      }
                      className="w-full px-4 py-3 rounded-lg bg-black/30 border border-white/10 focus:border-[var(--color-aisa-blue)] outline-none"
                    />
                  </div>
                );
              })}

              <button
                type="submit"
                className="w-full py-4 mt-6 bg-[var(--color-aisa-blue)] hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg transition-all text-lg"
              >
                Proceed to Pay {formatINR(totalAmount)}
              </button>
            </form>
          )}

          {step === 2 && (
            <div className="space-y-8 flex flex-col items-center">
              <div className="w-full">
                <button
                  type="button"
                  onClick={handleBackToForm}
                  disabled={submitting}
                  className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to details
                </button>
              </div>

              <div className="w-full text-center space-y-4">
                <div>
                  <p className="text-gray-300 font-medium">Scan QR Code to Pay</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Scan with any supported UPI app
                  </p>
                </div>

                <div className="bg-white p-4 rounded-2xl inline-block shadow-[0_0_40px_rgba(255,255,255,0.1)]">
                  {upiUrl ? (
                    <QRCodeSVG
                      value={upiUrl}
                      size={220}
                      level="M"
                      includeMargin
                    />
                  ) : (
                    <div className="w-[220px] h-[220px] flex items-center justify-center text-gray-500 text-sm">
                      Preparing QR...
                    </div>
                  )}
                </div>

                <p className="font-mono text-sm text-[var(--color-aisa-gold)] mt-2 break-all">
                  {link?.upiId}
                </p>

                {/* Transaction Ref removed from step 2 display */}
              </div>

              <div className="w-full h-px bg-white/10" />

              <div className="w-full text-center space-y-4">
                <h3 className="font-semibold text-lg">Payment Completed?</h3>

                <p className="text-sm text-gray-400">
                  After completing payment, upload the successful payment
                  screenshot below.
                </p>

                <label className="flex flex-col items-center justify-center w-full min-h-32 px-4 border-2 border-white/20 border-dashed rounded-xl cursor-pointer bg-black/20 hover:bg-black/40 hover:border-[var(--color-aisa-blue)] transition-all">
                  <div className="flex flex-col items-center justify-center py-5 text-center">
                    <Upload className="w-8 h-8 mb-2 text-gray-400" />

                    <p className="mb-2 text-sm text-gray-400">
                      <span className="font-semibold text-[var(--color-aisa-blue)]">
                        Click to upload
                      </span>{' '}
                      or drag and drop
                    </p>

                    <p className="text-xs text-gray-500">
                      JPG, PNG, WEBP, HEIC or HEIF • Max 10 MB
                    </p>

                    {file && (
                      <p className="mt-2 text-xs text-green-400 font-medium break-all">
                        {file.name}
                      </p>
                    )}
                  </div>

                  <input
                    type="file"
                    className="hidden"
                    accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
                    onChange={handleFileChange}
                  />
                </label>

                {screenshotDataUrl && (
                  <div className="rounded-xl overflow-hidden border border-white/10 bg-black/20">
                    <img
                      src={screenshotDataUrl}
                      alt="Payment screenshot preview"
                      className="w-full max-h-64 object-contain"
                    />
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleSubmitPayment}
                  disabled={loading || !file || submitting}
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
                Your payment has been successfully recorded and is awaiting
                admin verification.
              </p>

              <div className="bg-black/30 border border-white/10 p-4 rounded-xl mt-6 inline-block w-full text-left">
                <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">
                  Reference ID
                </p>

                <p className="font-mono text-xl font-bold text-[var(--color-aisa-gold)] mb-4 break-all">
                  {transactionId}
                </p>

                <div className="space-y-2 text-sm text-gray-300">
                  <div className="flex justify-between gap-4 border-b border-white/5 pb-2">
                    <span>Payment For</span>
                    <span className="font-semibold text-white text-right">
                      {link.title}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4 border-b border-white/5 pb-2">
                    <span>Base Amount</span>
                    <span className="font-semibold text-gray-300 whitespace-nowrap">
                      {formatINR(baseAmount)}
                    </span>
                  </div>

                  {link.enablePlatformFee && (
                    <div className="flex justify-between gap-4 border-b border-white/5 pb-2">
                      <span>Platform Fee (2%)</span>
                      <span className="font-semibold text-gray-300 whitespace-nowrap">
                        {formatINR(platformFee)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between gap-4 border-b border-white/5 pb-2">
                    <span>Total Paid</span>
                    <span className="font-semibold text-[var(--color-aisa-gold)] whitespace-nowrap">
                      {formatINR(totalAmount)}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span>Status</span>
                    <span className="font-semibold text-[var(--color-aisa-blue)]">
                      Under Review
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-2 flex justify-center">
                <button
                  type="button"
                  onClick={handleDownloadReceipt}
                  className="flex items-center space-x-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-colors border border-white/10"
                >
                  <Download className="w-5 h-5" />
                  <span>Download PDF Receipt</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Off-screen receipt template used only for PDF generation */}
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
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '40px',
              gap: '30px',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <img
                src="/LOGO.jpeg"
                alt="AISA Logo"
                style={{
                  height: '80px',
                  width: 'auto',
                  maxWidth: '260px',
                  objectFit: 'contain',
                  marginBottom: '16px',
                  alignSelf: 'flex-start',
                }}
                onError={(event) => {
                  event.currentTarget.style.display = 'none';
                }}
              />

              <h1
                style={{
                  fontSize: '28px',
                  fontWeight: 'bold',
                  color: '#00BFFF',
                  margin: '0 0 8px 0',
                }}
              >
                AISA Payment Receipt
              </h1>

              <p
                style={{
                  color: '#666',
                  margin: 0,
                  fontSize: '14px',
                  lineHeight: '1.5',
                }}
              >
                AI &amp; Data Science Students Association
                <br />
                Payment Submission Receipt
              </p>
            </div>

            <div style={{ width: '300px', flexShrink: 0 }}>
              <div
                style={{
                  backgroundColor: '#00BFFF',
                  color: 'white',
                  padding: '12px 16px',
                  fontSize: '20px',
                  fontWeight: 'bold',
                }}
              >
                Receipt for {transactionId}
              </div>

              <div
                style={{
                  backgroundColor: '#f0f0f0',
                  padding: '12px 16px',
                  fontSize: '14px',
                  color: '#333',
                }}
              >
                Transaction Date: {today}
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '40px' }}>
            <p
              style={{
                fontSize: '12px',
                fontWeight: 'bold',
                margin: '0 0 8px 0',
              }}
            >
              PAYER DETAILS
            </p>

            {formFields.map((field, index) => {
              const fieldName = field?.name || `field_${index}`;
              const value = formData[fieldName];

              if (!value) return null;

              return (
                <p
                  key={`${fieldName}-${index}`}
                  style={{
                    margin: '0 0 4px 0',
                    fontSize: '14px',
                    color: '#666',
                  }}
                >
                  <strong>{field?.label || fieldName}:</strong> {value}
                </p>
              );
            })}
          </div>

          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              marginBottom: '40px',
            }}
          >
            <thead>
              <tr
                style={{
                  backgroundColor: '#00BFFF',
                  color: 'white',
                  fontSize: '12px',
                }}
              >
                <th style={{ padding: '12px', textAlign: 'left' }}>
                  PRODUCT / SERVICE
                </th>
                <th style={{ padding: '12px', textAlign: 'left' }}>
                  DESCRIPTION
                </th>
                <th style={{ padding: '12px', textAlign: 'center' }}>
                  QTY.
                </th>
                <th style={{ padding: '12px', textAlign: 'right' }}>
                  COST
                </th>
                <th style={{ padding: '12px', textAlign: 'right' }}>
                  TOTAL
                </th>
              </tr>
            </thead>

            <tbody>
              <tr style={{ borderBottom: '1px solid #eee' }}>
                <td
                  style={{
                    padding: '16px 12px',
                    fontSize: '14px',
                    color: '#020713',
                  }}
                >
                  {link.title}
                </td>

                <td
                  style={{
                    padding: '16px 12px',
                    fontSize: '13px',
                    color: '#666',
                  }}
                >
                  {link.description || 'AISA Payment'}
                </td>

                <td
                  style={{
                    padding: '16px 12px',
                    fontSize: '14px',
                    textAlign: 'center',
                  }}
                >
                  1
                </td>

                <td
                  style={{
                    padding: '16px 12px',
                    fontSize: '14px',
                    textAlign: 'right',
                  }}
                >
                  {formatINR(baseAmount)}
                </td>

                <td
                  style={{
                    padding: '16px 12px',
                    fontSize: '14px',
                    textAlign: 'right',
                  }}
                >
                  {formatINR(baseAmount)}
                </td>
              </tr>
            </tbody>
          </table>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ flex: 1, paddingRight: '40px' }}>
              <p style={{ color: '#666', fontSize: '14px' }}>
                Thank you for your payment submission.
              </p>
            </div>

            <div style={{ width: '300px' }}>
              <h3
                style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: '#666',
                  marginBottom: '16px',
                }}
              >
                Payment Summary
              </h3>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid #eee',
                  paddingBottom: '8px',
                  marginBottom: '8px',
                }}
              >
                <span style={{ color: '#666' }}>Subtotal</span>
                <span>{formatINR(baseAmount)}</span>
              </div>

              {link.enablePlatformFee && (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid #eee',
                    paddingBottom: '8px',
                    marginBottom: '8px',
                  }}
                >
                  <span style={{ color: '#666' }}>Platform Fee (2%)</span>
                  <span>{formatINR(platformFee)}</span>
                </div>
              )}

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontWeight: 'bold',
                  fontSize: '16px',
                }}
              >
                <span>Total Amount</span>
                <span>{formatINR(totalAmount)}</span>
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: '40px',
              padding: '20px',
              backgroundColor: '#f9f9f9',
              border: '1px solid #eee',
              fontSize: '11px',
              color: '#555',
              lineHeight: '1.6',
            }}
          >
            <h4
              style={{
                margin: '0 0 10px 0',
                fontSize: '13px',
                color: '#00BFFF',
                fontWeight: 'bold',
              }}
            >
              TERMS, CONDITIONS &amp; REFUND POLICY
            </h4>

            <p style={{ margin: '0 0 8px 0' }}>
              <strong>1. Payment Processing:</strong> Payments are made directly
              to the UPI ID displayed on this payment page.
              {link.enablePlatformFee &&
                ' The 2% platform fee is non-refundable.'}
            </p>

            <p style={{ margin: '0 0 8px 0' }}>
              <strong>2. Verification:</strong> All submitted payments are
              subject to verification. Services, goods, registrations, or
              benefits will be processed only after successful verification of
              the uploaded payment proof.
            </p>

            <p style={{ margin: '0 0 8px 0' }}>
              <strong>3. Refund Policy:</strong> Refund requests are subject to
              AISA&apos;s applicable event or payment policy.
            </p>

            <p style={{ margin: 0 }}>
              <strong>4. Discrepancies:</strong> In case of any discrepancy or
              failed transaction, contact the AISA team with your Reference ID.
            </p>
          </div>

          <div
            style={{
              marginTop: '60px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <span
              style={{
                fontSize: '12px',
                color: '#999',
                fontStyle: 'italic',
                marginRight: '8px',
              }}
            >
              POWERED BY
            </span>

            <span
              style={{
                fontSize: '16px',
                fontWeight: 'bold',
                color: '#00BFFF',
                letterSpacing: '1px',
              }}
            >
              AISA PAYMENT PORTAL
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
