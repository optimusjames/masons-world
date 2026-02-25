import { experimentMetadata } from '@/lib/experiments/metadata';
import { ContactSheetBrowser } from './components/ContactSheetBrowser';

export const metadata = experimentMetadata('contact-sheet');

export default function ContactSheetPage() {
  return <ContactSheetBrowser />;
}
