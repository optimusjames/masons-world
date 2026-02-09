export function parseFileName(fileName: string): { order: number; slug: string } {
  const match = fileName.match(/^(\d+)-(.+)\.md$/)
  if (match) {
    return { order: parseInt(match[1], 10), slug: match[2] }
  }
  // No numeric prefix
  const slug = fileName.replace(/\.md$/, '')
  return { order: 999, slug }
}
