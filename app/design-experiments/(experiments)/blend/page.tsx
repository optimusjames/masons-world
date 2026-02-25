import { experimentMetadata } from '@/lib/experiments/metadata';
import { BlendContent } from './components/BlendContent';

export const metadata = experimentMetadata('blend');

export default function BlendPage() {
  return <BlendContent />;
}
