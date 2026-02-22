import { Bitter, Lora, Space_Mono, DM_Sans, Permanent_Marker } from 'next/font/google'
import SiteFooter from '../components/SiteFooter'
import styles from './blog.module.css'

const bitter = Bitter({
  subsets: ['latin'],
  weight: ['700', '800'],
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

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-dm-sans',
})

const permanentMarker = Permanent_Marker({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-marker',
})

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${styles.blogLayout} ${bitter.variable} ${lora.variable} ${spaceMono.variable} ${dmSans.variable} ${permanentMarker.variable}`}>
      {children}
      <SiteFooter variant="dark" />
    </div>
  )
}
