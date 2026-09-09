import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AISA Payments — Secure Student Payment Portal',
  description:
    'AISA — AI & Data Science Students Association. Pay your fees, event registrations, and more securely through AISA Payment Portal. UPI-powered, instant verification.',
};

export default function Home() {
  return (
    <div className="min-h-screen bg-[#020713] text-white font-sans overflow-x-hidden">
      {/* Ambient background glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[#00BFFF]/10 rounded-full filter blur-[160px]" />
        <div className="absolute bottom-1/3 right-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full filter blur-[160px]" />
        <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-amber-500/5 rounded-full filter blur-[120px]" />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-16 py-5 border-b border-white/5 backdrop-blur-sm bg-black/10">
        <div className="flex items-center space-x-3">
          <Image src="/LOGO.jpeg" alt="AISA Logo" width={40} height={40} className="rounded-lg" />
          <span className="font-bold text-lg tracking-wide">
            <span className="text-[#00BFFF]">AISA</span>{' '}
            <span className="text-white">Payments</span>
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <a href="#policies" className="text-sm text-gray-400 hover:text-white transition-colors hidden md:block">Policies</a>
          <a href="#security" className="text-sm text-gray-400 hover:text-white transition-colors hidden md:block">Security</a>
          <Link
            href="/admin"
            className="px-4 py-2 text-sm font-semibold bg-[#00BFFF]/10 hover:bg-[#00BFFF]/20 border border-[#00BFFF]/30 text-[#00BFFF] rounded-lg transition-all"
          >
            Admin Login
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center justify-center text-center px-4 py-28 md:py-36">
        <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-xs text-gray-400 mb-8">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span>Secured AISA Payment Portal</span>
        </div>

        <div className="mb-8 relative">
          <div className="absolute inset-0 bg-[#00BFFF]/20 rounded-3xl filter blur-2xl scale-110" />
          <Image
            src="/LOGO.jpeg"
            alt="AISA Logo"
            width={130}
            height={130}
            className="relative rounded-3xl shadow-2xl ring-4 ring-white/10"
            priority
          />
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-5 leading-tight">
          <span className="text-[#00BFFF]">AISA</span>{' '}
          <span className="bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">Payments</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-400 max-w-xl mb-3 leading-relaxed">
          AI &amp; Data Science Students Association — Secure Student Payment Portal
        </p>
        <p className="text-sm text-gray-600 mb-10">AISA Official Payment Portal</p>

        <div className="flex flex-col sm:flex-row gap-4">
          <a
            href="#how-it-works"
            className="px-8 py-4 bg-gradient-to-r from-[#00BFFF] to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold rounded-xl shadow-xl shadow-blue-900/30 transition-all text-lg"
          >
            How It Works
          </a>
          <a
            href="#policies"
            className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold rounded-xl transition-all text-lg"
          >
            View Policies
          </a>
        </div>
      </section>

      {/* Trust badges */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: '🔒', label: 'End-to-End Secure', desc: 'SSL encrypted' },
            { icon: '⚡', label: 'Instant UPI', desc: 'BHIM & all UPI apps' },
            { icon: '✅', label: 'Admin Verified', desc: 'Manual verification' },
            { icon: '🧾', label: 'PDF Receipts', desc: 'Downloadable invoices' },
          ].map((item) => (
            <div key={item.label} className="p-5 bg-white/5 border border-white/10 rounded-2xl text-center hover:border-[#00BFFF]/30 transition-all group">
              <div className="text-3xl mb-3">{item.icon}</div>
              <div className="font-semibold text-sm text-white group-hover:text-[#00BFFF] transition-colors">{item.label}</div>
              <div className="text-xs text-gray-500 mt-1">{item.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="relative z-10 max-w-4xl mx-auto px-6 pb-28">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">How It Works</h2>
          <p className="text-gray-500 text-sm">Simple, fast, and transparent</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { step: '01', title: 'Get Your Link', desc: 'Your AISA admin shares a unique payment link for your event, membership, or fee.' },
            { step: '02', title: 'Pay via UPI', desc: 'Scan the QR code or click the UPI button in your preferred payment app. Fast &amp; easy.' },
            { step: '03', title: 'Upload Screenshot', desc: 'Upload your successful payment screenshot. Admin verifies and confirms your registration.' },
          ].map((s) => (
            <div key={s.step} className="relative p-6 bg-white/5 border border-white/10 rounded-2xl hover:border-[#00BFFF]/30 transition-all">
              <div className="text-5xl font-black text-[#00BFFF]/15 mb-4 leading-none">{s.step}</div>
              <h3 className="text-lg font-bold mb-2">{s.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: s.desc }} />
            </div>
          ))}
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className="relative z-10 max-w-4xl mx-auto px-6 pb-28">
        <div className="p-8 md:p-12 bg-gradient-to-br from-[#00BFFF]/10 via-white/5 to-purple-500/5 border border-[#00BFFF]/20 rounded-3xl">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="text-7xl">🛡️</div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-3">Your Payment is Protected</h2>
              <p className="text-gray-400 text-sm leading-relaxed mb-5">
                All payments processed through this portal are verified manually by AISA administrators.
                We use Cloudinary encrypted cloud storage for screenshots and Supabase for secure data management.
                Your personal information is never sold or shared with third parties.
              </p>
              <div className="flex flex-wrap gap-3">
                {['UPI Certified', 'SSL Encrypted', 'DPDPA Compliant', 'Admin Verified', 'Cloudinary Storage'].map((tag) => (
                  <span key={tag} className="px-3 py-1 text-xs font-medium bg-[#00BFFF]/10 border border-[#00BFFF]/20 text-[#00BFFF] rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Policies */}
      <section id="policies" className="relative z-10 max-w-4xl mx-auto px-6 pb-28 space-y-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Policies &amp; Legal</h2>
          <p className="text-gray-500 text-sm">Transparent by design</p>
        </div>

        {/* Payment Policy */}
        <div className="p-8 bg-white/5 border border-white/10 rounded-2xl space-y-4">
          <div className="flex items-center space-x-3 mb-2">
            <span className="text-2xl">💳</span>
            <h3 className="text-xl font-bold text-[#00BFFF]">Payment Policy</h3>
          </div>
          <ul className="space-y-3 text-gray-400 text-sm leading-relaxed">
            <li className="flex gap-3"><span className="text-[#00BFFF] mt-1 shrink-0">→</span><span>All payments are processed via UPI (Unified Payments Interface), facilitated through Innovara Dynamics Pay.</span></li>
            <li className="flex gap-3"><span className="text-[#00BFFF] mt-1 shrink-0">→</span><span>A 2% platform processing fee may be added at the discretion of the event organizer, as stated on each payment link.</span></li>
            <li className="flex gap-3"><span className="text-[#00BFFF] mt-1 shrink-0">→</span><span>Payments are accepted only through official AISA payment links shared by authorized administrators.</span></li>
            <li className="flex gap-3"><span className="text-[#00BFFF] mt-1 shrink-0">→</span><span>All transactions are recorded with a unique reference ID (e.g., AISA-2026-XXXX) for tracking and verification.</span></li>
            <li className="flex gap-3"><span className="text-[#00BFFF] mt-1 shrink-0">→</span><span>Services or goods (event registrations, badges, memberships, etc.) will only be processed after successful admin verification of the uploaded payment proof.</span></li>
          </ul>
        </div>

        {/* Refund Policy */}
        <div className="p-8 bg-white/5 border border-white/10 rounded-2xl space-y-4">
          <div className="flex items-center space-x-3 mb-2">
            <span className="text-2xl">↩️</span>
            <h3 className="text-xl font-bold text-amber-400">Refund &amp; Cancellation Policy</h3>
          </div>
          <ul className="space-y-3 text-gray-400 text-sm leading-relaxed">
            <li className="flex gap-3"><span className="text-amber-400 mt-1 shrink-0">→</span><span>Refunds are <strong className="text-white">generally not provided</strong> once a transaction has been successfully verified by an administrator.</span></li>
            <li className="flex gap-3"><span className="text-amber-400 mt-1 shrink-0">→</span><span>Refund requests may be considered in the following cases: <strong className="text-white">duplicate payments</strong>, proven failure to deliver the agreed service, or technical errors resulting in a wrong charge.</span></li>
            <li className="flex gap-3"><span className="text-amber-400 mt-1 shrink-0">→</span><span>All refund requests must be submitted <strong className="text-white">within 7 days</strong> of the transaction date, along with your Reference ID and proof of payment.</span></li>
            <li className="flex gap-3"><span className="text-amber-400 mt-1 shrink-0">→</span><span>The <strong className="text-white">2% platform processing fee is strictly non-refundable</strong> under all circumstances.</span></li>
            <li className="flex gap-3"><span className="text-amber-400 mt-1 shrink-0">→</span><span>Approved refunds will be processed back to the original UPI account within 5–7 business days.</span></li>
            <li className="flex gap-3"><span className="text-amber-400 mt-1 shrink-0">→</span><span>Event cancellations by AISA will result in a <strong className="text-white">full refund</strong> of the base amount (excluding platform fee).</span></li>
          </ul>
        </div>

        {/* Privacy Policy */}
        <div className="p-8 bg-white/5 border border-white/10 rounded-2xl space-y-4">
          <div className="flex items-center space-x-3 mb-2">
            <span className="text-2xl">🔐</span>
            <h3 className="text-xl font-bold text-purple-400">Privacy Policy</h3>
          </div>
          <ul className="space-y-3 text-gray-400 text-sm leading-relaxed">
            <li className="flex gap-3"><span className="text-purple-400 mt-1 shrink-0">→</span><span>We collect the following information during payment: Name, Email, PRN/Student ID, Phone Number (if required), and payment proof screenshot.</span></li>
            <li className="flex gap-3"><span className="text-purple-400 mt-1 shrink-0">→</span><span>Collected data is used exclusively for verifying your payment, maintaining transaction records, and contacting you about your registration.</span></li>
            <li className="flex gap-3"><span className="text-purple-400 mt-1 shrink-0">→</span><span>Payment screenshots are stored securely on persistent server storage and are accessible only to AISA administrators.</span></li>
            <li className="flex gap-3"><span className="text-purple-400 mt-1 shrink-0">→</span><span>We do <strong className="text-white">not</strong> sell, rent, or share your personal data with any third party for marketing or advertising purposes.</span></li>
            <li className="flex gap-3"><span className="text-purple-400 mt-1 shrink-0">→</span><span>Transaction data is retained for a minimum of 2 years for audit and dispute resolution purposes in compliance with applicable Indian law.</span></li>
            <li className="flex gap-3"><span className="text-purple-400 mt-1 shrink-0">→</span><span>We comply with the <strong className="text-white">Digital Personal Data Protection Act, 2023 (DPDPA)</strong> of India.</span></li>
          </ul>
        </div>

        {/* Terms & Conditions */}
        <div className="p-8 bg-white/5 border border-white/10 rounded-2xl space-y-4">
          <div className="flex items-center space-x-3 mb-2">
            <span className="text-2xl">📜</span>
            <h3 className="text-xl font-bold text-green-400">Terms &amp; Conditions</h3>
          </div>
          <ul className="space-y-3 text-gray-400 text-sm leading-relaxed">
            <li className="flex gap-3"><span className="text-green-400 mt-1 shrink-0">→</span><span>By completing a payment, you agree to these Terms &amp; Conditions and all policies listed on this page.</span></li>
            <li className="flex gap-3"><span className="text-green-400 mt-1 shrink-0">→</span><span>AISA is not responsible for any failed UPI transactions due to bank-side issues, network errors, or incorrect UPI credentials entered by the user.</span></li>
            <li className="flex gap-3"><span className="text-green-400 mt-1 shrink-0">→</span><span>Uploading a false, fraudulent, or edited payment screenshot is a serious violation and will result in immediate disqualification and potential legal action.</span></li>
            <li className="flex gap-3"><span className="text-green-400 mt-1 shrink-0">→</span><span>AISA reserves the right to reject any payment submission that cannot be verified against our bank records.</span></li>
            <li className="flex gap-3"><span className="text-green-400 mt-1 shrink-0">→</span><span>Payment links expire or may be deactivated at any time by AISA administrators without prior notice.</span></li>
            <li className="flex gap-3"><span className="text-green-400 mt-1 shrink-0">→</span><span>All disputes are subject to the jurisdiction of courts in Pune, Maharashtra, India.</span></li>
            <li className="flex gap-3"><span className="text-green-400 mt-1 shrink-0">→</span><span>AISA reserves the right to amend these policies at any time. Continued use constitutes acceptance of the updated policies.</span></li>
          </ul>
        </div>

        {/* Dispute Resolution */}
        <div className="p-8 bg-white/5 border border-white/10 rounded-2xl space-y-4">
          <div className="flex items-center space-x-3 mb-2">
            <span className="text-2xl">⚖️</span>
            <h3 className="text-xl font-bold text-red-400">Dispute Resolution</h3>
          </div>
          <ul className="space-y-3 text-gray-400 text-sm leading-relaxed">
            <li className="flex gap-3"><span className="text-red-400 mt-1 shrink-0">→</span><span>For any payment disputes or discrepancies, please contact AISA with your <strong className="text-white">Reference ID</strong> (e.g., AISA-2026-XXXX).</span></li>
            <li className="flex gap-3"><span className="text-red-400 mt-1 shrink-0">→</span><span>Disputes will be reviewed within <strong className="text-white">3–5 business days</strong> by the AISA finance team.</span></li>
            <li className="flex gap-3"><span className="text-red-400 mt-1 shrink-0">→</span><span>Provide your payment screenshot, Reference ID, and UPI transaction UTR number when reporting a dispute.</span></li>
            <li className="flex gap-3"><span className="text-red-400 mt-1 shrink-0">→</span><span>AISA's decision on payment disputes shall be final and binding for all student transactions.</span></li>
          </ul>
        </div>
      </section>

      {/* Contact / CTA */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 pb-20">
        <div className="p-10 bg-gradient-to-r from-[#00BFFF]/10 to-purple-500/10 border border-white/10 rounded-3xl text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">Need Help?</h2>
          <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto">
            If you have any questions about your payment, need a receipt, or want to report a discrepancy, reach out to your AISA representative.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="mailto:aisa@isbm.edu.in"
              className="px-6 py-3 bg-[#00BFFF] hover:bg-sky-400 text-white font-bold rounded-xl transition-all"
            >
              Contact AISA Support
            </a>
          </div>
        </div>
      </section>

      {/* Admin Quick Link */}
      <section className="relative z-10 px-4 py-16 text-center border-t border-white/5">
        <div className="max-w-md mx-auto p-8 rounded-2xl bg-gradient-to-b from-white/5 to-transparent border border-white/10">
          <h3 className="text-xl font-bold mb-2">Administrator Access</h3>
          <p className="text-gray-400 text-sm mb-6">Create payment links, verify submitted transactions, and export reports.</p>
          <Link
            href="/admin"
            className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold rounded-xl transition-all"
          >
            Admin Dashboard
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 px-6 md:px-16 py-10">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center space-x-3">
            <Image src="/LOGO.jpeg" alt="AISA Logo" width={32} height={32} className="rounded-lg opacity-60" />
            <div>
              <p className="font-semibold text-sm text-gray-300">AISA Payments</p>
              <p className="text-xs text-gray-600">AI &amp; Data Science Students Association</p>
            </div>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-600">
              Secured &amp; Powered by{' '}
              <span className="text-[#00BFFF] font-medium">AISA Payment Portal</span>
            </p>
          </div>
          <div className="text-xs text-gray-600 text-center md:text-right">
            <p>© {new Date().getFullYear()} AISA. All rights reserved.</p>
            <p className="mt-1">ISB&amp;M College of Engineering, Pune</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
