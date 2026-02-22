import { getNavCategories } from '@/lib/docs/loadDocs'
import DocsSidebar from './_components/DocsSidebar'
import SiteFooter from '@/app/components/SiteFooter'
import styles from './docs.module.css'

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const categories = getNavCategories()

  return (
    <div className={styles.docsLayout}>
      <DocsSidebar categories={categories} />
      <main className={styles.mainContent}>
        {children}
        <SiteFooter variant="dark" />
      </main>
    </div>
  )
}
