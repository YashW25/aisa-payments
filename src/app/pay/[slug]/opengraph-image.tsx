import { ImageResponse } from 'next/og';
import prisma from '@/lib/prisma';

export const runtime = 'nodejs';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const link = await prisma.paymentLink.findUnique({ where: { slug } });

  const title = link?.title ?? 'Payment Link';
  const description = link?.description ?? 'Secure student payment';
  const baseAmount = link ? Number(link.amount) : 0;
  const platformFee = link?.enablePlatformFee ? Number((baseAmount * 0.02).toFixed(2)) : 0;
  const totalAmount = baseAmount + platformFee;

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(135deg, #020713 0%, #0a1628 50%, #020713 100%)',
          position: 'relative',
          overflow: 'hidden',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Grid pattern overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(rgba(0,191,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,191,255,0.04) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        {/* Glow blobs */}
        <div
          style={{
            position: 'absolute',
            top: '-100px',
            left: '-100px',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0,191,255,0.15) 0%, transparent 70%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-80px',
            right: '-80px',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)',
          }}
        />

        {/* Top bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '36px 56px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          {/* AISA Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '14px',
                background: 'rgba(0,191,255,0.15)',
                border: '1px solid rgba(0,191,255,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '22px',
                fontWeight: 'bold',
                color: '#00BFFF',
              }}
            >
              AI
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '22px', fontWeight: 'bold', color: '#ffffff', letterSpacing: '1px' }}>
                AISA Payments
              </span>
              <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>
                Powered by AISA Payment Portal
              </span>
            </div>
          </div>

          {/* Secure badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              background: 'rgba(0,255,100,0.08)',
              border: '1px solid rgba(0,255,100,0.2)',
              borderRadius: '50px',
            }}
          >
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }} />
            <span style={{ fontSize: '13px', color: '#4ade80', fontWeight: '600' }}>Secure Payment</span>
          </div>
        </div>

        {/* Main content */}
        <div
          style={{
            display: 'flex',
            flex: 1,
            alignItems: 'center',
            padding: '0 56px',
            gap: '60px',
          }}
        >
          {/* Left: Title & Description */}
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '16px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '6px 14px',
                background: 'rgba(0,191,255,0.08)',
                border: '1px solid rgba(0,191,255,0.2)',
                borderRadius: '50px',
                width: 'fit-content',
                fontSize: '12px',
                color: '#00BFFF',
                fontWeight: '600',
                letterSpacing: '1px',
                textTransform: 'uppercase',
              }}
            >
              🎓 AISA Official Payment
            </div>
            <div
              style={{
                fontSize: '52px',
                fontWeight: '800',
                color: '#ffffff',
                lineHeight: '1.1',
                letterSpacing: '-1px',
              }}
            >
              {title}
            </div>
            <div
              style={{
                fontSize: '18px',
                color: 'rgba(255,255,255,0.45)',
                lineHeight: '1.5',
                maxWidth: '480px',
              }}
            >
              {description}
            </div>
          </div>

          {/* Right: Amount card */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              width: '300px',
              padding: '40px 32px',
              background: 'linear-gradient(135deg, rgba(0,191,255,0.12) 0%, rgba(0,80,180,0.08) 100%)',
              border: '1px solid rgba(0,191,255,0.3)',
              borderRadius: '28px',
              gap: '12px',
              boxShadow: '0 0 80px rgba(0,191,255,0.08)',
            }}
          >
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase' }}>
              {link?.enablePlatformFee ? 'Total Payable' : 'Amount'}
            </div>
            <div
              style={{
                fontSize: '64px',
                fontWeight: '900',
                background: 'linear-gradient(90deg, #00BFFF, #60a5fa)',
                backgroundClip: 'text',
                color: 'transparent',
                lineHeight: '1',
              }}
            >
              ₹{totalAmount}
            </div>
            {link?.enablePlatformFee && (
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>
                incl. 2% platform fee
              </div>
            )}
            <div
              style={{
                marginTop: '12px',
                width: '100%',
                padding: '12px',
                background: 'rgba(0,191,255,0.1)',
                borderRadius: '12px',
                textAlign: 'center',
                fontSize: '14px',
                color: '#00BFFF',
                fontWeight: '700',
              }}
            >
              Pay via UPI →
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 56px',
            borderTop: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.2)' }}>
            AI &amp; Data Science Students Association · ISB&amp;M College of Engineering, Pune
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {['UPI Secured', 'Verified', 'PDF Receipt'].map((tag) => (
              <div
                key={tag}
                style={{
                  padding: '4px 10px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '20px',
                  fontSize: '11px',
                  color: 'rgba(255,255,255,0.35)',
                }}
              >
                {tag}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
