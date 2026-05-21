import type { Metadata } from 'next';
import { Syne, Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const syne = Syne({ subsets: ['latin'], variable: '--font-syne', weight: ['400', '500', '600', '700', '800'] });

export const metadata: Metadata = {
  title: { default: 'ChatLax', template: '%s | ChatLax' },
  description: 'Realtime chat for modern teams. Fast, secure, and beautifully designed.',
  keywords: ['chat', 'realtime', 'messaging', 'team communication'],
  openGraph: {
    title: 'ChatLax',
    description: 'Realtime chat for modern teams.',
    type: 'website',
  },
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${syne.variable}`}>
      <head>
        <link rel="icon" href="/logo.png" type="image/png" />
      </head>
      <body className="bg-[#0a0a0a] text-[#e0e0e0] antialiased">
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#1a1a1a',
              color: '#e0e0e0',
              border: '1px solid #2a2a2a',
              borderRadius: '12px',
              fontSize: '13px',
            },
            success: { iconTheme: { primary: '#4ade80', secondary: '#0a0a0a' } },
            error: { iconTheme: { primary: '#f87171', secondary: '#0a0a0a' } },
          }}
        />
      </body>
    </html>
  );
}
