import type { Metadata, Viewport } from 'next'
import { Noto_Sans_TC } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { StoreProvider } from '@/lib/store'
import { BottomNav } from '@/components/bottom-nav'

const notoTC = Noto_Sans_TC({
  subsets: ['latin'],
  weight: ['400', '500', '700', '900'],
  variable: '--font-noto-tc',
  display: 'swap',
})

export const metadata: Metadata = {
  title: '減重日記',
  description: '給正在使用減重藥物者的私人飲食與營養紀錄工具',
  generator: 'v0.app',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: '減重日記',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#3aa89b',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-Hant" className={`${notoTC.variable} bg-background`}>
      <body className="font-sans antialiased">
        <StoreProvider>
          <div className="relative mx-auto flex min-h-[100dvh] w-full max-w-md flex-col bg-background">
            <main className="flex-1 px-4 pb-28 pt-4">{children}</main>
            <BottomNav />
          </div>
        </StoreProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
