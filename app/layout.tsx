import { Karla } from 'next/font/google'
import './globals.css'
import BackButton from './components/BackButton'
import Sidebar from './components/Sidebar'

const karla = Karla({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  display: 'swap',
})


export const metadata = {
  title: 'Design Experiments Sandbox',
  description: 'A sandbox for exploring visual design systems, widgets, and layouts',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={karla.className}>
        <BackButton />
        <Sidebar />
        {children}
      </body>
    </html>
  )
}
