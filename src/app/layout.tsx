import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "AISA Payments | Innovara Dynamics Pay",
    template: "%s | AISA Payments",
  },
  description:
    "AISA — AI & Data Science Students Association secure payment portal powered by Innovara Dynamics Pay. Pay your membership fees, event fees, and more.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "AISA Payments",
    title: "AISA Payments | Innovara Dynamics Pay",
    description:
      "AISA — AI & Data Science Students Association secure payment portal powered by Innovara Dynamics Pay.",
    images: [
      {
        url: "/LOGO.jpeg",
        width: 1200,
        height: 630,
        alt: "AISA Payments",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AISA Payments | Innovara Dynamics Pay",
    description:
      "AISA — AI & Data Science Students Association secure payment portal powered by Innovara Dynamics Pay.",
    images: ["/LOGO.jpeg"],
  },
  icons: {
    icon: [
      { url: "/LOGO.jpeg", type: "image/jpeg" },
    ],
    apple: "/LOGO.jpeg",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
