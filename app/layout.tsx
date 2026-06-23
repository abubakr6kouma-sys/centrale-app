import type { Metadata } from 'next'
import { Sora, Manrope, Instrument_Serif } from 'next/font/google'
import './globals.css'
import AuthProvider from '@/components/AuthProvider'

const sora = Sora({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sora',
  display: 'swap',
})

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-manrope',
  display: 'swap',
})

const instrument = Instrument_Serif({
  subsets: ['latin'],
  weight: ['400'],
  style: ['italic', 'normal'],
  variable: '--font-instrument',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'CentralY — l\'IA traite vos emails, vous gardez le contrôle',
  description:
    'CentralY analyse, classe et résume vos emails entrants, puis prépare une réponse professionnelle. Rien n\'est envoyé sans votre accord.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${sora.variable} ${manrope.variable} ${instrument.variable}`}>
      <body className="font-sans antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
