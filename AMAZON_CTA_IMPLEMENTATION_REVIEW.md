# Amazon CTA Pill Implementation — Pre-Change Review

## Files Confirmed Before Changes

Both files are confirmed. The current state matches the specification exactly. Two things flagged before proceeding:

1. **`post.body` has the affiliate link in it** (like the Robot Vacuum article you attached). The new field is frontmatter-only — the pill reads from frontmatter, never body. This is correct per your spec.

2. **`blog.ts` currently does not expose frontmatter beyond the named fields it maps**. The field `amazon_affiliate_link` will need to be read from raw frontmatter — I'll add it to the `BlogPost` interface and `getAllPostsRaw()` parser in `blog.ts` as well. This is required for the feature to work. This is still only two touched files in spirit (config.yml and BlogPostPage.tsx needs blog.ts to provide the data), but `blog.ts` is a required third file. Please confirm if you want me to include it, or if you want to scope strictly to two files only (which would require a different parsing approach directly in BlogPostPage.tsx).

---

## FILE 1 — `public/cms/config.yml`: Blog collection fields section

```yaml
    fields:
      - { label: "Title", name: "title", widget: "string" }
      - { label: "Date", name: "date", widget: "datetime" }
      - label: "Category"
        name: "category"
        widget: "select"
        options:
          - "Business"
          - "Automotive"
          - "Motorcycles"
          - { label: "Personal Finance", value: "Finance" }
          - "Investing"
          - "Travel"
          - "Tech"
          - "Lifestyle"
          - "AI Lab"
      - { label: "Author Name", name: "author", widget: "string", required: false }
      - label: "Featured Image"
        name: "featured_image"
        widget: "string"
        required: false
        hint: >-
          Enter the Cloudinary Public ID only (e.g. blog/bike-hero).
          …
      - { label: "Body", name: "body", widget: "markdown" }       ← current last field before body
```

The new `amazon_affiliate_link` field will be inserted **between** `featured_image` and `body`.

**Note:** the `status` field that draft-gating relies on is not currently in `config.yml` at all — this is consistent with current behavior. The new field will slot in cleanly.

---

## FILE 2 — `src/pages/BlogPostPage.tsx`: Full CTA pill section

### State declarations (lines 78–81):
```tsx
const [showPill, setShowPill] = useState(false);
const [pillDismissed, setPillDismissed] = useState(
  () => typeof window !== 'undefined' && sessionStorage.getItem('lib-cta-dismissed') === '1'
);
```

### Scroll trigger `useEffect` (lines 83–96):
```tsx
useEffect(() => {
  if (pillDismissed) return;
  function onScroll() {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight > 0 && window.scrollY / docHeight >= 0.3) setShowPill(true);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  const raf = requestAnimationFrame(onScroll);
  return () => {
    window.removeEventListener('scroll', onScroll);
    cancelAnimationFrame(raf);
  };
}, [pillDismissed]);
```

### Dismiss logic (lines 98–102):
```tsx
function dismissPill() {
  sessionStorage.setItem('lib-cta-dismissed', '1');
  setPillDismissed(true);
  setShowPill(false);
}
```

### Full pill JSX (lines 535–553):
```tsx
{/* ── Floating CTA Pill (Gumroad neo-brutalist) ── */}
{showPill && !pillDismissed && (
  <div className="no-print fixed bottom-20 lg:bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-[#FFD000]">
    <Link
      to={libraryHref}
      className="text-black text-sm font-bold tracking-wide whitespace-nowrap"
    >
      {libraryLabel}
    </Link>
    <button
      onClick={dismissPill}
      aria-label="Dismiss"
      className="text-black/40 hover:text-black transition-colors text-xs leading-none ml-1 font-bold"
    >
      ✕
    </button>
  </div>
)}
```

---

## Key Questions Before Proceeding

### Question: Should we modify `blog.ts`?

**Option A: Include `blog.ts` (Recommended)**
- Add `amazon_affiliate_link?: string` to the `BlogPost` interface
- Update `getAllPostsRaw()` to parse and include this field from frontmatter
- BlogPostPage.tsx can then directly read `post.amazon_affiliate_link`
- Clean, centralized, follows existing pattern
- Three files total: config.yml, blog.ts, BlogPostPage.tsx

**Option B: Keep strictly two files only**
- Parse frontmatter directly inside BlogPostPage.tsx component
- Requires duplicating frontmatter parsing logic (or importing it inline)
- More fragile if frontmatter format changes
- Violates DRY principle
- Not recommended

### Recommendation
Include `blog.ts` as the third file. It's architecturally correct and maintains consistency with how blog data flows through the app.

---

## Implementation Checklist

- [ ] Step 1: Update `public/cms/config.yml` — add `amazon_affiliate_link` field after `featured_image`
- [ ] Step 2: Update `src/utils/blog.ts` — extend `BlogPost` interface and parser
- [ ] Step 3: Update `src/pages/BlogPostPage.tsx` — implement conditional render logic

**Awaiting your confirmation on blog.ts inclusion before proceeding.**
