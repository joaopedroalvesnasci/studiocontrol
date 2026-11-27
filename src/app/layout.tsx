import type { Metadata, Viewport } from 'next'
import { Poppins } from 'next/font/google'
import Shell from '@/components/shell'
import './globals.css'

const poppins = Poppins({
  variable: '--font-poppins',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'StudioControl',
  description:
    'Organize clientes, orçamentos, sinais e sessões do seu estúdio de tatuagem em um só lugar.',
}

export const viewport: Viewport = {
  themeColor: '#ffffff',
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body className={`${poppins.variable} antialiased`}>
        <Shell>{children}</Shell>
      </body>
    </html>
  )
}
