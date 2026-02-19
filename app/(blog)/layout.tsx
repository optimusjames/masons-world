import { Permanent_Marker } from 'next/font/google'
import styles from './blog.module.css'

const permanentMarker = Permanent_Marker({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-marker',
})

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${styles.blogLayout} ${permanentMarker.variable}`}>
      {children}
    </div>
  )
}
