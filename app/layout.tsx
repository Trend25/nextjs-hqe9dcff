import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ClientAuthProvider } from './ClientAuthProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Rate My Startup',
  description: 'AI-powered startup stage analysis',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClientAuthProvider>
          {children}
        </ClientAuthProvider>
      </body>
    </html>
  );
}
