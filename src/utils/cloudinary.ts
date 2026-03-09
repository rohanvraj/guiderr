/**
 * Cloudinary URL optimization helpers.
 *
 * Raw URLs stored in the DB look like:
 *   https://res.cloudinary.com/dhzxdbo8q/image/upload/v1234567/ebook-cover.png
 *
 * Optimized URLs look like:
 *   https://res.cloudinary.com/dhzxdbo8q/image/upload/f_auto,q_auto,w_400/v1234567/ebook-cover.png
 *
 * f_auto  → serves WebP to Chrome/Firefox, AVIF where supported — smaller files, same quality
 * q_auto  → Cloudinary picks the best compression level automatically
 * w_N     → resize to N px wide (maintains aspect ratio)
 */

/**
 * Appends Cloudinary transformation parameters to a URL if it is a Cloudinary URL.
 * - Non-Cloudinary URLs (placeholders, external images) are returned unchanged.
 * - URLs that already contain transformation parameters (f_ or q_) are returned unchanged.
 */
export function optimizeCloudinaryUrl(
  url: string | undefined | null,
  options: { width?: number; quality?: string } = {}
): string {
  if (!url) return '';

  // Pass through non-Cloudinary URLs (local placeholders, etc.)
  if (!url.includes('res.cloudinary.com')) return url;

  // Don't double-apply: if transforms already present, return as-is
  if (url.includes('/upload/f_') || url.includes('/upload/q_')) return url;

  const { width = 400, quality = 'auto:eco' } = options;
  const transforms = `f_auto,q_${quality},w_${width}`;

  // Insert transforms right after /upload/
  return url.replace('/upload/', `/upload/${transforms}/`);
}
