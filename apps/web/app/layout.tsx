import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'RoR Trader - Automated Trading Platform',
  description: 'Automate your trading strategies with enterprise-grade security',
  keywords: 'trading, automation, webhook, tradingview, crypto, stocks',
  authors: [{ name: 'RoR Trader Team' }],
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0A0A0B',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-[#0A0A0B] text-white`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
