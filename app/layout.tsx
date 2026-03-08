import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import 'leaflet/dist/leaflet.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'CivicFix',
  description: 'Crowdsourced Issue Reporting Platform',
}

import Header from '@/components/Header'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Header />
          <main className="flex-1 w-full max-w-7xl mx-auto py-8 px-4">
            {children}
          </main>
          <footer className="py-8 text-center text-gray-400 text-sm border-t border-gray-100">
            &copy; 2026 CivicFix - Improving our cities together.
          </footer>
        </div>
      </body>
    </html>
  )
}
