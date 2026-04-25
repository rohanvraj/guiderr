// Static affiliate inventory — zero DB hits.
// Each item has a stable `id` slug used in URLs and tracking.
// imageUrl: full Cloudinary URL or /path/to/local.
// category: matches the route slug (e.g. /rohan-selection/laptops).

export interface InventoryItem {
  id: string;
  name: string;
  category: string;   // used for route-based filtering
  displayCategory: string;
  imageUrl: string;
  link: string;       // affiliate / product link
  description: string;
  price: string;      // display string, e.g. "₹54,990" or "From ₹1,199"
}

export const INVENTORY: InventoryItem[] = [
  // ── Laptops ────────────────────────────────────────────────────────────────
  {
    id: 'macbook-air-m2',
    name: 'Apple MacBook Air M2 (2023)',
    category: 'laptops',
    displayCategory: 'Laptops',
    imageUrl: 'https://m.media-amazon.com/images/I/71vFKBpKakL._SX679_.jpg',
    link: 'https://amzn.to/macbook-air-m2',
    description: 'Fanless design, 18-hour battery, best-in-class performance for creators and students.',
    price: '₹99,900',
  },
  {
    id: 'dell-xps-15',
    name: 'Dell XPS 15 (2024)',
    category: 'laptops',
    displayCategory: 'Laptops',
    imageUrl: 'https://m.media-amazon.com/images/I/81lFdBQtKGL._SX679_.jpg',
    link: 'https://amzn.to/dell-xps-15',
    description: 'OLED display, Intel Core Ultra, ideal for video editors and developers.',
    price: '₹1,74,990',
  },
  {
    id: 'asus-zenbook-14',
    name: 'ASUS Zenbook 14 OLED',
    category: 'laptops',
    displayCategory: 'Laptops',
    imageUrl: 'https://m.media-amazon.com/images/I/71+gD4MAOFL._SX679_.jpg',
    link: 'https://amzn.to/asus-zenbook-14',
    description: 'Lightweight OLED workhorse with all-day battery — best value under ₹80k.',
    price: '₹74,990',
  },
  {
    id: 'lenovo-thinkpad-x1',
    name: 'Lenovo ThinkPad X1 Carbon Gen 12',
    category: 'laptops',
    displayCategory: 'Laptops',
    imageUrl: 'https://m.media-amazon.com/images/I/616FIsHbokL._SX679_.jpg',
    link: 'https://amzn.to/thinkpad-x1',
    description: 'Business flagship: MIL-SPEC durability, 5G optional, legendary keyboard.',
    price: '₹1,29,990',
  },
  {
    id: 'hp-spectre-x360',
    name: 'HP Spectre x360 14 (2024)',
    category: 'laptops',
    displayCategory: 'Laptops',
    imageUrl: 'https://m.media-amazon.com/images/I/71yj9EoR9QL._SX679_.jpg',
    link: 'https://amzn.to/hp-spectre-x360',
    description: '2-in-1 convertible with OLED touch display — perfect for note-takers and designers.',
    price: '₹1,49,990',
  },
  {
    id: 'acer-swift-go-14',
    name: 'Acer Swift Go 14 (OLED)',
    category: 'laptops',
    displayCategory: 'Laptops',
    imageUrl: 'https://m.media-amazon.com/images/I/71t0bEzDkKL._SX679_.jpg',
    link: 'https://amzn.to/acer-swift-go-14',
    description: 'Budget OLED gem — vivid screen + Intel Core Ultra at a student-friendly price.',
    price: '₹59,990',
  },

  // ── Vlogging Cameras ────────────────────────────────────────────────────────
  {
    id: 'sony-zv-e10-ii',
    name: 'Sony ZV-E10 II',
    category: 'vlogging-cameras',
    displayCategory: 'Vlogging Cameras',
    imageUrl: 'https://m.media-amazon.com/images/I/71IqHWxJhRL._SX679_.jpg',
    link: 'https://amzn.to/sony-zve10-ii',
    description: 'Best-in-class autofocus, swivel screen — the YouTube standard for sub-₹70k.',
    price: '₹64,990',
  },
  {
    id: 'gopro-hero-12',
    name: 'GoPro HERO 12 Black',
    category: 'vlogging-cameras',
    displayCategory: 'Vlogging Cameras',
    imageUrl: 'https://m.media-amazon.com/images/I/71UMBpLJoGL._SX679_.jpg',
    link: 'https://amzn.to/gopro-hero12',
    description: 'Waterproof action cam — essential for motorcycle rides and adventure travel.',
    price: '₹34,990',
  },
  {
    id: 'dji-osmo-pocket-3',
    name: 'DJI Osmo Pocket 3',
    category: 'vlogging-cameras',
    displayCategory: 'Vlogging Cameras',
    imageUrl: 'https://m.media-amazon.com/images/I/61MbYpHlNQL._SX679_.jpg',
    link: 'https://amzn.to/dji-osmo-pocket3',
    description: '3-axis gimbal built-in, 4K/120fps — pocket-sized cinema for solo creators.',
    price: '₹49,990',
  },
  {
    id: 'canon-g7x-iii',
    name: 'Canon PowerShot G7X Mark III',
    category: 'vlogging-cameras',
    displayCategory: 'Vlogging Cameras',
    imageUrl: 'https://m.media-amazon.com/images/I/71NRDqNGFQL._SX679_.jpg',
    link: 'https://amzn.to/canon-g7x-iii',
    description: 'Live-streaming built-in, pop-up selfie screen — popular with travel vloggers.',
    price: '₹54,995',
  },
  {
    id: 'insta360-x4',
    name: 'Insta360 X4',
    category: 'vlogging-cameras',
    displayCategory: 'Vlogging Cameras',
    imageUrl: 'https://m.media-amazon.com/images/I/61jTXVMFa3L._SX679_.jpg',
    link: 'https://amzn.to/insta360-x4',
    description: '360° 8K recording — mount it on your helmet and let AI reframe the shot.',
    price: '₹43,999',
  },
  {
    id: 'sony-fx30',
    name: 'Sony FX30 Cinema Camera',
    category: 'vlogging-cameras',
    displayCategory: 'Vlogging Cameras',
    imageUrl: 'https://m.media-amazon.com/images/I/71dV3HKM3GL._SX679_.jpg',
    link: 'https://amzn.to/sony-fx30',
    description: 'Super-35 sensor, S-Cinetone — step up to cinematic quality under ₹1 lakh.',
    price: '₹99,990',
  },
];

// All unique category slugs (for nav/filter generation)
export const INVENTORY_CATEGORIES = [...new Set(INVENTORY.map((i) => i.category))];
