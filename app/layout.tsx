import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import ClientAuthProvider from './ClientAuthProvider';
const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Rating Sistemi',
  description: 'Girişimci ve yatırımcı değerlendirme platformu',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr">
      <body className={inter.className}>
        <ClientAuthProvider>
          {children}
        </ClientAuthProvider>
      </body>
    </html>
  )
}
