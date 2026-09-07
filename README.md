# AISA Payments Portal

A beautifully designed, custom-built payment portal and management system for the AI & Data Science Students Association (AISA). Powered by Innovara Dynamics.

This system allows administrators to generate dynamic payment links with custom forms, process UPI payments (via deep-intent links and QR codes), and manage payment verifications seamlessly.

## ✨ Features

- **Dynamic Payment Links**: Admins can create unlimited payment links with custom slugs (e.g., `/pay/badges-2026`).
- **Custom Form Builder**: Add standard fields (Name, PRN, Year) or fully custom fields (Dropdowns, Text) to any payment link.
- **UPI Deep Integration**: 
  - Native Android intent launcher for major UPI apps (PhonePe, GPay, Paytm, etc.).
  - Universal QR code fallback for cross-device scanning.
- **Platform Fee Handling**: Optional toggle to seamlessly add a 2% platform fee to any transaction.
- **Automated Receipts**: Instantly generates downloadable, professional PDF receipts upon payment submission.
- **Screenshot Verification**: Securely uploads payment proof screenshots to Cloudinary.
- **Admin Dashboard**: Secure JWT-based admin portal to manage links, track payments, and verify screenshots.
- **Beautiful UI**: Modern, glassmorphism-inspired dark theme tailored to AISA branding.

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, React 19)
- **Database**: PostgreSQL (hosted on [Supabase](https://supabase.com/))
- **ORM**: [Prisma](https://www.prisma.io/)
- **Styling**: Tailwind CSS
- **Media Storage**: [Cloudinary](https://cloudinary.com/)
- **PDF Generation**: `jspdf` & `html2canvas`
- **Deployment**: [Netlify](https://www.netlify.com/)

## 🚀 Getting Started

### Prerequisites
Make sure you have Node.js installed and accounts on Supabase and Cloudinary.

### Environment Variables
Create a `.env` file in the root directory and add the following variables:

```env
# Supabase PostgreSQL Connection
# IMPORTANT: When deploying to serverless platforms like Netlify, 
# use the Transaction Pooler URL (Port 6543) with ?pgbouncer=true
DATABASE_URL="postgresql://postgres:[password]@[host]:6543/postgres?pgbouncer=true"

# Cloudinary (For Payment Screenshot Uploads)
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"

# Admin Authentication
JWT_SECRET="your_secure_random_string"

# Site URL (For SEO and OpenGraph metadata generation)
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Sync the Prisma Schema with your database:
   ```bash
   npx prisma db push
   ```

3. Seed the Admin User (Modify `scripts/seed-admin.mjs` first if you want to change the default email/password):
   ```bash
   node scripts/seed-admin.mjs
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.
Navigate to `/admin` to log into the management portal.

## 🌐 Deployment (Netlify)

This project is configured for deployment on Netlify using the `@netlify/plugin-nextjs`.

1. Connect your GitHub repository to Netlify.
2. In Netlify's **Environment Variables** settings, add all the variables from your `.env` file.
3. Make sure you are using the **IPv4 Connection Pooler** database URL from Supabase, as Netlify serverless functions do not support direct IPv6 connections.
4. The `netlify.toml` and `package.json` are pre-configured to automatically run `prisma generate` during the build process.

## 📄 License

Proprietary Software. Developed for AISA by Innovara Dynamics.
