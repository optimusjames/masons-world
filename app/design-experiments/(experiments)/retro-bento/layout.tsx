import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Retro Bento - Design Experiments',
  description: 'CrossFit bento grid meets retro hardware aesthetics. Nine fitness widgets styled as rack-mount modules with CRT displays, LED indicators, analog gauges, and brushed aluminum panels.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
