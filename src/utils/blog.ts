import { optimizeCloudinaryUrl } from './cloudinary';

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  category: string;
  author: string;
  featuredImage: string;
  body: string;
  status: string;
}

export interface FeaturedStory {
  slug: string;
  title: string;
  date: string;
  category: string;
  author: string;
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
  const lines = match[1].split('\n');
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const idx = line.indexOf(':');
    if (idx === -1) { i++; continue; }
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    // Handle multi-line quoted YAML strings (continuation lines are indented)
    if ((value.startsWith('"') || value.startsWith("'")) && !value.endsWith(value[0])) {
      const quote = value[0];
      while (i + 1 < lines.length) {
        i++;
        const continuation = lines[i].trim();
        value += ' ' + continuation;
        if (continuation.endsWith(quote)) break;
      }
    }
    value = value.replace(/^["']|["']$/g, '');
    if (key) metadata[key] = value;
    i++;
  }

  return { metadata, body: match[2] };
}

// ── Load every .md file under src/content/blog/ at build time ───────────────
const blogModules = import.meta.glob('/src/content/blog/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const featuredModules = import.meta.glob('/src/content/featured/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

/** All posts including drafts — internal use only. */
function getAllPostsRaw(): BlogPost[] {
  return Object.entries(blogModules)
    .map(([filepath, raw]) => {
      const { metadata, body } = parseFrontmatter(raw);
      const slug = filepath.split('/').pop()?.replace('.md', '') ?? '';

      return {
        slug,
        title: metadata.title || 'Untitled',
        date: metadata.date || '',
        category: metadata.category || '',
        author: metadata.author || '',
        featuredImage: metadata.featured_image || '',
        body,
        status: metadata.status || 'published',
      };
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/** All published posts (drafts excluded), newest first. */
export function getAllPosts(): BlogPost[] {
  return getAllPostsRaw().filter((p) => p.status !== 'draft');
}

/** Category lookup using statically bundled markdown content only. */
export function getPostsByCategory(category: string): BlogPost[] {
  return getAllPosts().filter((post) => post.category === category);
}

/**
 * Single post lookup by slug — includes drafts so the article renders
 * when accessed by direct URL. BlogPostPage gates draft visibility to
 * localhost only.
 */
export function getPostBySlug(slug: string): BlogPost | undefined {
  return getAllPostsRaw().find((p) => p.slug === slug);
}

/** Single featured story lookup by slug. */
export function getFeaturedStoryBySlug(slug: string): FeaturedStory | undefined {
  return getAllFeaturedStories().find((s) => s.slug === slug);
}

/** All featured stories, newest first. */
export function getAllFeaturedStories(): FeaturedStory[] {
  return Object.entries(featuredModules)
    .map(([filepath, raw]) => {
      const { metadata, body } = parseFrontmatter(raw);
      const slug = filepath.split('/').pop()?.replace('.md', '') ?? '';

      return {
        slug,
        title: metadata.title || 'Untitled',
        date: metadata.date || '',
        category: metadata.category || 'Featured Story',
        author: metadata.author || '',
        featuredImage: metadata.featured_image || '',
        body,
      };
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/**
 * Feather-Weight rule: run every Cloudinary image through q_auto:eco.
 * Used by the react-markdown custom `img` renderer.
 */
export function optimizeBlogImage(src: string | undefined, width = 800): string {
  return optimizeCloudinaryUrl(src, { width, quality: 'auto:eco' });
}
