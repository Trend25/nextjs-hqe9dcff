// ✅ layout dosyaları client değil, server component olduğu için "use client" eklenmez
import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import ClientAuthProvider from './ClientAuthProvider'

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
        {/* 🔍 Debug log için test */}
        <script
          dangerouslySetInnerHTML={{
            __html: `console.log("🌱 RootLayout yüklendi");`,
          }}
        />
        <ClientAuthProvider>
          {children}
        </ClientAuthProvider>
      </body>
    </html>
  )
}
