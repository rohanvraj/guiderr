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
 * Also constructs a full optimized URL from bare Cloudinary Public IDs
 * (returned by Decap CMS when output_filename_only: true).
 * - Non-Cloudinary external URLs are returned unchanged.
 * - URLs that already contain transformation parameters (f_ or q_) are returned unchanged.
 */
const CLOUD_NAME = 'dhzxdbo8q';

export function optimizeCloudinaryUrl(
  url: string | undefined | null,
  options: { width?: number; quality?: string } = {}
): string {
  if (!url) return '';

  const { width = 400, quality = 'auto:eco' } = options;
  const transforms = `f_auto,q_${quality},w_${width}`;

  // Case 1 — Full Cloudinary URL: inject transforms after /upload/
  if (url.includes('res.cloudinary.com')) {
    if (url.includes('/upload/f_') || url.includes('/upload/q_')) return url;
    return url.replace('/upload/', `/upload/${transforms}/`);
  }

  // Case 2 — Bare Public ID from Decap CMS (output_filename_only: true).
  // Not a URL at all, so construct the full optimized Cloudinary URL.
  if (!url.startsWith('http')) {
    return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transforms}/${url}`;
  }

  // Case 3 — Non-Cloudinary external URL (local placeholders, etc.)
  return url;
}
