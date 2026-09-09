# AISA Payments Portal

A custom-built payment portal and management system for the AI & Data Science Students Association (AISA).

This system allows administrators to generate dynamic payment links with custom forms, process UPI payments (via deep-intent links and QR codes), and manage payment verifications seamlessly.

## ✨ Features

- **Dynamic Payment Links**: Admins can create unlimited payment links with custom slugs (e.g., `/pay/badges-2026`).
- **Custom Form Builder**: Add standard fields (Name, PRN, Year) or fully custom fields (Dropdowns, Text) to any payment link.
- **UPI Deep Integration**: 
  - Native Android intent launcher for major UPI apps (PhonePe, GPay, Paytm, etc.).
  - Universal QR code fallback for cross-device scanning.
- **Platform Fee Handling**: Optional toggle to seamlessly add a 2% platform fee to any transaction.
- **Automated Receipts**: Instantly generates downloadable, professional PDF receipts upon payment submission.
- **Screenshot Verification**: Securely uploads payment proof screenshots to host storage (`/opt/aisa-payments/data/uploads`).
- **Admin Dashboard**: Secure JWT-based admin portal to manage links, track payments, and verify screenshots via an authenticated private API route.
- **Beautiful UI**: Modern, glassmorphism-inspired dark theme tailored to AISA branding.

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, React 19)
- **Database**: PostgreSQL (hosted on [Supabase](https://supabase.com/))
- **ORM**: [Prisma](https://www.prisma.io/)
- **Styling**: Tailwind CSS
- **Media Storage**: Local Persistent Host Disk Mount (`/opt/aisa-payments/data/uploads`)
- **PDF Generation**: `jspdf` & `html2canvas`
- **Deployment**: Docker Compose & Nginx Reverse Proxy on Ubuntu 24.04 LTS

## 🚀 Getting Started

### Prerequisites
Make sure you have Docker Engine and Docker Compose installed on your system.

### Environment Variables
Create a `.env` file in the root directory:

```env
# Supabase PostgreSQL Connection
DATABASE_URL="postgresql://postgres:[password]@[host]:6543/postgres?pgbouncer=true"

# Admin Authentication
JWT_SECRET="your_secure_random_string"

# Site URL
NEXT_PUBLIC_SITE_URL="https://payments.isbmcoe.in"
```

### Docker Deployment

1. Build and start containers:
   ```bash
   docker compose build
   docker compose up -d
   ```

2. Check container status:
   ```bash
   docker compose ps
   ```

Open [https://payments.isbmcoe.in](https://payments.isbmcoe.in) in your browser.
Navigate to `/admin` to log into the management portal.

## 📄 License

Proprietary Software. Developed for AISA (AI & Data Science Students Association).
