// Thin re-export — App.tsx imports CategoryPage; the real logic lives in CategoryHub.
// This keeps the lazy-import in App.tsx unchanged while the hub component stays
// in its own clearly-named file.
export { default } from './CategoryHub';

