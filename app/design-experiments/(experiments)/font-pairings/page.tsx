import { experimentMetadata } from '@/lib/experiments/metadata';
import { FontPairingsContent } from './components/FontPairingsContent';

export const metadata = experimentMetadata('font-pairings');

export default function FontPairingsPage() {
  return <FontPairingsContent />;
}
