// All old commerce category routes (/:category) now redirect to the unified Library hub.
// Explicit routes registered before /:category in App.tsx are unaffected.
import { Navigate } from 'react-router-dom';

export default function CategoryPage() {
  return <Navigate to="/library" replace />;
}
