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

const CLOUD_NAME = 'dhzxdbo8q';

/**
 * Coerces any value the CMS or DB might pass in into a usable URL string.
 * Handles: string URLs, bare public IDs, Cloudinary widget response objects
 * ({ secure_url, url, public_id }), undefined, null, and '[object Object]'.
 */
function extractUrl(raw: unknown): string {
  if (!raw) return '';

  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    // Degenerate serialization — object was stringified rather than unwrapped
    return trimmed === '[object Object]' ? '' : trimmed;
  }

  if (typeof raw === 'object') {
    // Cloudinary widget response object shapes (output_filename_only: false)
    const obj = raw as Record<string, unknown>;
    const candidate = obj['secure_url'] ?? obj['url'] ?? obj['public_id'];
    if (typeof candidate === 'string') return candidate.trim();
  }

  return '';
}

/**
 * Returns a fully-optimized Cloudinary URL for any input the CMS or DB provides.
 * - Full Cloudinary URL  → injects f_auto,q_auto:eco,w_N after /upload/
 * - Bare Public ID       → constructs the full URL from CLOUD_NAME
 * - Cloudinary widget object → unwraps secure_url first, then optimizes
 * - Non-Cloudinary URL   → returned unchanged (external images bypass compression)
 * - Falsy / degenerate   → empty string
 */
export function optimizeCloudinaryUrl(
  raw: unknown,
  options: { width?: number; quality?: string } = {}
): string {
  const url = extractUrl(raw);
  if (!url) return '';

  const { width = 400, quality = 'auto:eco' } = options;
  const transforms = `f_auto,q_${quality},w_${width}`;

  // Case 1 — Full Cloudinary URL: inject transforms after /upload/
  if (url.includes('res.cloudinary.com')) {
    if (url.includes('/upload/f_') || url.includes('/upload/q_')) return url;
    return url.replace('/upload/', `/upload/${transforms}/`);
  }

  // Case 2 — Bare Public ID (no http prefix): construct full optimized URL
  if (!url.startsWith('http')) {
    return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transforms}/${url}`;
  }

  // Case 3 — Non-Cloudinary external URL: return unchanged
  return url;
}
