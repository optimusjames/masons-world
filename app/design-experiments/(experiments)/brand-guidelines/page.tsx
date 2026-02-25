import { experimentMetadata } from '@/lib/experiments/metadata';
import { BrandGuidelinesContent } from './components/BrandGuidelinesContent';

export const metadata = experimentMetadata('brand-guidelines');

export default function BrandGuidelinesPage() {
    return <BrandGuidelinesContent />;
}
