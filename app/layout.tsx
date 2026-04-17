import type { Metadata } from 'next'
import { Playfair_Display, Source_Sans_3 } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import './globals.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
  weight: ['400', '500', '700', '800', '900'],
})

const sourceSans = Source_Sans_3({
  subsets: ['latin'],
  variable: '--font-source',
  display: 'swap',
  weight: ['300', '400', '600', '700'],
})

export const metadata: Metadata = {
  title: 'La Grande Projection — Nowrinkles Love',
  description:
    'Inscrivez-vous à la Grande Projection organisée par Nowrinkles Love. Un événement chrétien unique.',
  openGraph: {
    title: 'La Grande Projection — Nowrinkles Love',
    description: 'Un événement chrétien unique organisé par Nowrinkles Love.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className={`${playfair.variable} ${sourceSans.variable}`}>
      <body>
        {children}
        <Toaster
          position="bottom-center"
          toastOptions={{
            style: {
              background: '#1C1C2E',
              color: '#FFFFE4',
              fontFamily: 'var(--font-source)',
              fontSize: '0.9rem',
              borderRadius: '0',
              border: '1px solid rgba(146,169,225,0.3)',
            },
          }}
        />
      </body>
    </html>
  )
}
