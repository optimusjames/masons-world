export function fileNameToSlug(fileName: string): string {
  return fileName.replace(/\.md$/, '').replace(/^\d+-/, '')
}

export function slugToTitle(slug: string): string {
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
