import { optimizeCloudinaryUrl } from './cloudinary';

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  category: string;
  featuredImage: string;
  body: string;
}

/**
 * Minimal frontmatter parser — avoids adding gray-matter to the bundle.
 * Handles simple key: value YAML between --- fences.
 */
function parseFrontmatter(raw: string): { metadata: Record<string, string>; body: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { metadata: {}, body: raw };

  const metadata: Record<string, string> = {};
  for (const line of match[1].split('\n')) {
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
    if (key) metadata[key] = value;
  }

  return { metadata, body: match[2] };
}

// ── Load every .md file under src/content/blog/ at build time ───────────────
const blogModules = import.meta.glob('/src/content/blog/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

/** All posts, newest first. */
export function getAllPosts(): BlogPost[] {
  return Object.entries(blogModules)
    .map(([filepath, raw]) => {
      const { metadata, body } = parseFrontmatter(raw);
      const slug = filepath.split('/').pop()?.replace('.md', '') ?? '';

      return {
        slug,
        title: metadata.title || 'Untitled',
        date: metadata.date || '',
        category: metadata.category || '',
        featuredImage: metadata.featured_image || '',
        body,
      };
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/** Single post lookup by slug. */
export function getPostBySlug(slug: string): BlogPost | undefined {
  return getAllPosts().find((p) => p.slug === slug);
}

/**
 * Feather-Weight rule: run every Cloudinary image through q_auto:eco.
 * Used by the react-markdown custom `img` renderer.
 */
export function optimizeBlogImage(src: string | undefined, width = 800): string {
  return optimizeCloudinaryUrl(src, { width, quality: 'auto:eco' });
}
