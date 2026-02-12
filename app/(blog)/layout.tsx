import styles from './blog.module.css'

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.blogLayout}>
      {children}
    </div>
  )
}
