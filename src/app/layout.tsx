import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import LayoutShell from '@/app/components/LayoutShell'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Летучка — Туристическое агентство',
  description: 'Организация незабываемых путешествий по всему миру',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className={inter.className} style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <LayoutShell>{children}</LayoutShell>
      </body>
    </html>
  )
}
