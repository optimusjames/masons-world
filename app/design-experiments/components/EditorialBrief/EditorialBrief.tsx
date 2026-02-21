import { ReactNode } from 'react';
import Image from 'next/image';
import styles from './EditorialBrief.module.css';

export interface EditorialImage {
  src: string;
  alt: string;
  cropClass?: 'imageCropped' | 'imageCroppedDown';
}

interface EditorialBriefProps {
  label?: string;
  headline: string;
  lede: string;
  images?: EditorialImage[];
  children: ReactNode;
}

export function EditorialBrief({
  label = 'Design Notes',
  headline,
  lede,
  images,
  children,
}: EditorialBriefProps) {
  return (
    <section className={styles.brief}>
      <div className={styles.rule} />
      <div className={styles.sectionLabel}>{label}</div>

      <h2 className={styles.headline}>{headline}</h2>

      <p className={styles.lede}>{lede}</p>

      {images && images.length > 0 && (
        <div className={styles.imageGrid} style={{ gridTemplateColumns: `repeat(${images.length}, 1fr)` }}>
          {images.map((img) => (
            <div key={img.src} className={`${styles.imageWrap} ${img.cropClass ? styles[img.cropClass] : ''}`}>
              <Image
                src={img.src}
                alt={img.alt}
                fill
                sizes="(max-width: 600px) 100vw, 300px"
              />
            </div>
          ))}
        </div>
      )}

      <div className={styles.body}>
        {children}
      </div>
    </section>
  );
}
