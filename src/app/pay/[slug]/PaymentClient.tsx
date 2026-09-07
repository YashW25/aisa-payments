'use client';

import { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Upload, CheckCircle, Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function PaymentClient({ link }: { link: any }) {
  const [isMobile, setIsMobile] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [file, setFile] = useState<File | null>(null);
  const [screenshotDataUrl, setScreenshotDataUrl] = useState<string | null>(null);
  const [step, setStep] = useState(1); // 1: Form, 2: Payment, 3: Success
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [transactionId, setTransactionId] = useState('');

  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    if (/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase())) {
      setIsMobile(true);
    }
  }, []);

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleProceedToPay = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setScreenshotDataUrl(e.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmitPayment = async () => {
    if (!file) {
      setError('Please upload a payment screenshot.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('linkId', link.id);
      formDataToSend.append('screenshot', file);
      formDataToSend.append('formData', JSON.stringify(formData));

      const res = await fetch('/api/payments/submit', {
        method: 'POST',
        body: formDataToSend,
      });

      if (res.ok) {
        const data = await res.json();
        setTransactionId(data.transactionId);
        setStep(3);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to submit payment.');
      }
    } catch (err) {
      setError('An error occurred during submission.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReceipt = async () => {
    if (!receiptRef.current) return;

    try {
      // Capture dimensions before doing anything
      const elWidth = receiptRef.current.offsetWidth;
      const elHeight = receiptRef.current.offsetHeight;

      const canvas = await html2canvas(receiptRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });
      const dataUrl = canvas.toDataURL('image/png');

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (elHeight * pdfWidth) / elWidth;

      // Page 1: Invoice Template
      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);

      // Page 2: Screenshot
      if (screenshotDataUrl) {
        pdf.addPage();
        
        // Load image to get dimensions
        const img = new Image();
        img.src = screenshotDataUrl;
        await new Promise((resolve) => { img.onload = resolve; });

        // Calculate aspect ratio to fit page
        const pageHeight = pdf.internal.pageSize.getHeight();
        const imgRatio = img.width / img.height;
        const pageRatio = pdfWidth / pageHeight;
        
        let targetWidth = pdfWidth - 40; // 20px padding
        let targetHeight = targetWidth / imgRatio;

        if (targetHeight > pageHeight - 40) {
          targetHeight = pageHeight - 40;
          targetWidth = targetHeight * imgRatio;
        }

        const xPos = (pdfWidth - targetWidth) / 2;
        const yPos = (pageHeight - targetHeight) / 2;

        pdf.text('Payment Screenshot', 20, 30);
        pdf.addImage(screenshotDataUrl, 'JPEG', xPos, yPos, targetWidth, targetHeight);
      }

      pdf.save(`Innovara-Receipt-${transactionId}.pdf`);
    } catch (err) {
      console.error('Failed to generate receipt', err);
    }
  };

  const platformFee = link.enablePlatformFee ? Number((link.amount * 0.02).toFixed(2)) : 0;
  const totalAmount = link.amount + platformFee;
  const upiUrl = `upi://pay?pa=${link.upiId}&pn=InnovaraDynamicsPay&am=${totalAmount}&cu=INR&tn=${encodeURIComponent(link.title)}`;
  
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="min-h-screen bg-[var(--color-aisa-navy)] text-[var(--color-aisa-text)] flex flex-col items-center py-12 px-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--color-aisa-blue)] rounded-full mix-blend-screen filter blur-[120px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[var(--color-aisa-gold)] rounded-full mix-blend-screen filter blur-[120px]"></div>
      </div>

      <div className="z-10 w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-8 text-center border-b border-white/10 bg-black/20">
          <h1 className="text-3xl font-bold tracking-wider mb-2">
            <span className="text-[var(--color-aisa-blue)]">AISA</span>
          </h1>
          <h2 className="text-xl font-semibold mb-4">{link.title}</h2>
          
          <div className="inline-block px-6 py-3 bg-[var(--color-aisa-gold)]/10 border border-[var(--color-aisa-gold)]/30 rounded-xl">
            <p className="text-sm text-[var(--color-aisa-gold-dark)] mb-1 uppercase tracking-wider font-semibold">
              {link.enablePlatformFee ? 'Total Payable (incl. 2% fee)' : 'Amount Payable'}
            </p>
            <p className="text-4xl font-bold text-[var(--color-aisa-gold)]">₹{totalAmount}</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 flex-1">
          {error && (
            <div className="mb-6 p-3 rounded-lg bg-red-500/20 text-red-200 border border-red-500/50 text-sm text-center">
              {error}
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleProceedToPay} className="space-y-5">
              {link.formFields.map((field: any, idx: number) => (
                <div key={idx}>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    {field.label} {field.required && '*'}
                  </label>
                  {field.type === 'select' ? (
                    <select
                      required={field.required}
                      value={formData[field.name] || ''}
                      onChange={e => handleInputChange(field.name, e.target.value)}
                      className="w-full px-4 py-3 rounded-lg bg-black/30 border border-white/10 focus:border-[var(--color-aisa-blue)] outline-none appearance-none"
                    >
                      <option value="" disabled>Select {field.label}</option>
                      {field.options?.map((opt: string) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.name === 'email' ? 'email' : 'text'}
                      required={field.required}
                      value={formData[field.name] || ''}
                      onChange={e => handleInputChange(field.name, e.target.value)}
                      className="w-full px-4 py-3 rounded-lg bg-black/30 border border-white/10 focus:border-[var(--color-aisa-blue)] outline-none"
                    />
                  )}
                </div>
              ))}

              <button type="submit" className="w-full py-4 mt-6 bg-[var(--color-aisa-blue)] hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg hover:shadow-[var(--color-aisa-blue)]/20 transition-all text-lg">
                Proceed to Pay ₹{totalAmount}
              </button>
            </form>
          )}

          {step === 2 && (
            <div className="space-y-8 flex flex-col items-center">
              {isMobile ? (
                <div className="text-center space-y-4 w-full">
                  <p className="text-gray-300 mb-6">Click the button below to open your UPI app securely.</p>
                  <a href={upiUrl} className="block w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-xl shadow-lg transition-all text-lg text-center">
                    Pay ₹{totalAmount} with UPI App
                  </a>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <p className="text-gray-300 mb-4">Open your UPI app and scan the QR code to complete payment.</p>
                  <div className="bg-white p-4 rounded-2xl inline-block shadow-[0_0_40px_rgba(255,255,255,0.1)]">
                    <QRCodeSVG value={upiUrl} size={200} />
                  </div>
                  <p className="font-mono text-sm text-[var(--color-aisa-gold)] mt-2">{link.upiId}</p>
                </div>
              )}

              <div className="w-full h-px bg-white/10 my-8"></div>

              <div className="w-full text-center space-y-4">
                <h3 className="font-semibold text-lg">Payment Completed?</h3>
                <p className="text-sm text-gray-400">Upload your successful payment screenshot below.</p>
                
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-white/20 border-dashed rounded-xl cursor-pointer bg-black/20 hover:bg-black/40 hover:border-[var(--color-aisa-blue)] transition-all">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-2 text-gray-400" />
                    <p className="mb-2 text-sm text-gray-400">
                      <span className="font-semibold text-[var(--color-aisa-blue)]">Click to upload</span> or drag and drop
                    </p>
                    {file && <p className="text-xs text-green-400 font-medium">{file.name}</p>}
                  </div>
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                </label>

                <button 
                  onClick={handleSubmitPayment} 
                  disabled={loading || !file}
                  className="w-full py-4 mt-4 bg-white text-[var(--color-aisa-navy)] font-bold rounded-xl shadow-lg hover:bg-gray-200 transition-all text-lg disabled:opacity-50"
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
              <p className="text-gray-400">Your payment has been successfully recorded and is awaiting admin verification.</p>
              
              <div className="bg-black/30 border border-white/10 p-4 rounded-xl mt-6 inline-block w-full text-left">
                <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Reference ID</p>
                <p className="font-mono text-xl font-bold text-[var(--color-aisa-gold)] mb-4">{transactionId}</p>
                
                <div className="space-y-2 text-sm text-gray-300">
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span>Payment For</span>
                    <span className="font-semibold text-white">{link.title}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span>Base Amount</span>
                    <span className="font-semibold text-gray-300">₹{link.amount}</span>
                  </div>
                  {link.enablePlatformFee && (
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span>Platform Fee (2%)</span>
                      <span className="font-semibold text-gray-300">₹{platformFee}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span>Total Paid</span>
                    <span className="font-semibold text-[var(--color-aisa-gold)]">₹{totalAmount}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span>Status</span>
                    <span className="font-semibold text-[var(--color-aisa-blue)]">Under Review</span>
                  </div>
                </div>
              </div>

              <div className="mt-2 flex justify-center">
                <button 
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

      {/* Hidden Receipt Template (Rendered only for PDF generation) */}
      <div style={{ position: 'absolute', top: 0, left: 0, opacity: 0, pointerEvents: 'none', zIndex: -100 }}>
        <div 
          ref={receiptRef} 
          style={{ width: '800px', backgroundColor: 'white', color: '#1a1a1a', padding: '40px', fontFamily: 'sans-serif' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <img 
                src="/innovara-logo.png" 
                alt="Innovara Logo" 
                style={{ height: '80px', objectFit: 'contain', marginBottom: '16px', alignSelf: 'flex-start' }} 
                onError={(e) => { 
                  e.currentTarget.onerror = null; 
                  e.currentTarget.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'; 
                }} 
              />
              <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#00BFFF', margin: '0 0 8px 0' }}>Innovara Dynamics Pay</h1>
              <p style={{ color: '#666', margin: 0, fontSize: '14px', lineHeight: '1.5' }}>
                Secure Payment Gateway<br/>
                Powered by Innovara Dynamics
              </p>
            </div>
            <div style={{ width: '300px' }}>
              <div style={{ backgroundColor: '#00BFFF', color: 'white', padding: '12px 16px', fontSize: '20px', fontWeight: 'bold' }}>
                Receipt for {transactionId}
              </div>
              <div style={{ backgroundColor: '#f0f0f0', padding: '12px 16px', fontSize: '14px', color: '#333' }}>
                Transaction Date: {today}
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '40px' }}>
            <p style={{ fontSize: '12px', fontWeight: 'bold', margin: '0 0 8px 0' }}>RECIPIENT:</p>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#020713', margin: '0 0 4px 0' }}>{formData.name || 'Student'}</h2>
            {formData.email && <p style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#666' }}>{formData.email}</p>}
            {formData.prn && <p style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#666' }}>PRN: {formData.prn}</p>}
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
                <td style={{ padding: '16px 12px', fontSize: '13px', color: '#666' }}>{link.description || 'Service Payment'}</td>
                <td style={{ padding: '16px 12px', fontSize: '14px', textAlign: 'center' }}>1</td>
                <td style={{ padding: '16px 12px', fontSize: '14px', textAlign: 'right' }}>₹{link.amount}</td>
                <td style={{ padding: '16px 12px', fontSize: '14px', textAlign: 'right' }}>₹{link.amount}</td>
              </tr>
            </tbody>
          </table>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ flex: 1, paddingRight: '40px' }}>
              <p style={{ color: '#666', fontSize: '14px' }}>Thanks for your payment!</p>
            </div>
            <div style={{ width: '300px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#666', marginBottom: '16px' }}>Receipt for Payment</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '8px', marginBottom: '8px' }}>
                <span style={{ color: '#666' }}>Subtotal</span>
                <span>₹{link.amount}</span>
              </div>
              {link.enablePlatformFee && (
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '8px', marginBottom: '8px' }}>
                  <span style={{ color: '#666' }}>Platform Fee (2%)</span>
                  <span>₹{platformFee}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '16px' }}>
                <span>Total Paid</span>
                <span>₹{totalAmount}</span>
              </div>
            </div>
          </div>

          {/* Policies Section */}
          <div style={{ marginTop: '40px', padding: '20px', backgroundColor: '#f9f9f9', border: '1px solid #eee', fontSize: '11px', color: '#555', lineHeight: '1.6' }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#00BFFF', fontWeight: 'bold' }}>Terms, Conditions & Refund Policy</h4>
            <p style={{ margin: '0 0 8px 0' }}><strong>1. Payment Processing:</strong> Payments are processed securely via Innovara Dynamics Pay. {link.enablePlatformFee && 'The 2% platform fee is non-refundable.'}</p>
            <p style={{ margin: '0 0 8px 0' }}><strong>2. Verification:</strong> All payments are subject to verification. Services or goods will be rendered only after successful verification of the uploaded payment proof.</p>
            <p style={{ margin: '0 0 8px 0' }}><strong>3. Refund Policy:</strong> Refunds are generally not provided once a transaction is successfully verified, unless there is a duplicate payment or failure to deliver the agreed services. Refund requests must be made within 7 days of the transaction date.</p>
            <p style={{ margin: 0 }}><strong>4. Discrepancies:</strong> In case of any discrepancies or failed transactions, please contact support with your Reference ID.</p>
          </div>

          <div style={{ marginTop: '60px', display: 'flex', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: '#999', fontStyle: 'italic', marginRight: '8px' }}>POWERED BY</span>
            <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#00BFFF', letterSpacing: '1px' }}>INNOVARA DYNAMICS PAY</span>
          </div>
        </div>
      </div>
    </div>
  );
}
