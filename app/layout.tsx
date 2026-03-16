import type { Metadata } from 'next'
import { Karla, Space_Grotesk, Lora, Space_Mono } from 'next/font/google'
import './globals.css'

const karla = Karla({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  display: 'swap',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
  variable: '--font-bitter',
})

const lora = Lora({
  subsets: ['latin'],
  weight: ['400', '500'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-lora',
})

const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
  variable: '--font-space-mono',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://masons-world.vercel.app'),
  title: {
    default: 'James Mason — Design Experiments & Writing',
    template: '%s | James Mason',
  },
  description: 'James Mason explores design through code — interactive experiments, visual systems, and writing about building with AI agents.',
  authors: [{ name: 'James Mason' }],
  openGraph: {
    title: 'James Mason — Design Experiments & Writing',
    description: 'Interactive design experiments, visual systems, and writing about building with AI agents.',
    siteName: 'James Mason',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
  },
}

const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'James Mason',
    url: 'https://masons-world.vercel.app',
    sameAs: [
      'https://github.com/optimusjames',
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'James Mason',
    url: 'https://masons-world.vercel.app',
  },
]

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${lora.variable} ${spaceMono.variable}`}>
      <body className={karla.className}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  )
}
