import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  display: 'swap',
})

export const metadata = {
  title: 'Design Experiments Sandbox',
  description: 'A sandbox for exploring visual design systems, widgets, and layouts',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
