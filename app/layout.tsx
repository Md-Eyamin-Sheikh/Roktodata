import type { Metadata, Viewport } from 'next';
import { Noto_Sans_Bengali, Inter } from 'next/font/google';
import './globals.css';
import { ToastProvider } from '@/components/ui/ToastNotification';
import { LanguageProvider } from '@/lib/i18n/LanguageContext';

const notoSansBengali = Noto_Sans_Bengali({
  subsets: ['bengali'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-noto-bengali',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-inter',
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#c41e3a',
};

export const metadata: Metadata = {
  title: 'রক্তদাতা — মানবিক রক্তদান প্ল্যাটফর্ম',
  description: 'প্রিমিয়াম মোবাইল-ফার্স্ট রক্তদান প্ল্যাটফর্ম: জরুরি রক্তের অনুরোধ, লাইভ ট্র্যাকিং, ডোনার ডিরেক্টরি ও মানবিক প্রভাব বিশ্লেষণ।',
  manifest: '/manifest.json',
  openGraph: {
    title: 'রক্তদাতা — মানবিক রক্তদান প্ল্যাটফর্ম',
    description: 'প্রিমিয়াম মোবাইল-ফার্স্ট রক্তদান প্ল্যাটফর্ম: জরুরি রক্তের অনুরোধ, লাইভ ট্র্যাকিং, ডোনার ডিরেক্টরি ও মানবিক প্রভাব বিশ্লেষণ।',
    type: 'website',
    locale: 'bn_BD',
    siteName: 'রক্তদাতা — Roktodata',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'রক্তদাতা — মানবিক রক্তদান প্ল্যাটফর্ম',
    description: 'প্রিমিয়াম মোবাইল-ফার্স্ট রক্তদান প্ল্যাটফর্ম: জরুরি রক্তের অনুরোধ, লাইভ ট্র্যাকিং, ডোনার ডিরেক্টরি ও মানবিক প্রভাব বিশ্লেষণ।',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bn" className={`${notoSansBengali.variable} ${inter.variable}`}>
      <body suppressHydrationWarning className="bg-[#F7F7F9] text-[#1B1B1F] antialiased min-h-screen selection:bg-[#FDECEF] selection:text-[#9E0027]">
        <LanguageProvider>
          <ToastProvider>{children}</ToastProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
