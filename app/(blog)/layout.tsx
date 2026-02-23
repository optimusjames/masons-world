import { DM_Sans, Permanent_Marker } from 'next/font/google'
import SiteFooter from '@/app/components/SiteFooter'
import styles from './blog.module.css'

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
    <div className={`${styles.blogLayout} ${dmSans.variable} ${permanentMarker.variable}`}>
      {children}
      <SiteFooter className={styles.blogFooter} />
    </div>
  )
}
