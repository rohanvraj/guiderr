// Static affiliate inventory — zero DB hits.
// Each item has a stable `id` slug used in URLs and tracking.
// imageUrl: full Cloudinary URL or /path/to/local.
// category: matches the route slug (e.g. /rohan-selection/tech).
//
// Supported categories: tech | investing | personal-finance |
//                        riding-gear | lifestyle | credit-cards

export interface InventoryItem {
  id: string;
  name: string;
  category: string;   // used for route-based filtering
  displayCategory: string;
  imageUrl: string;
  link: string;       // affiliate / product link
  description: string;
}

export const INVENTORY: InventoryItem[] = [
  // ── Tech — Laptops ─────────────────────────────────────────────────────────
  {
    id: 'macbook-air-m2',
    name: 'Apple MacBook Air M2 (2023)',
    category: 'tech',
    displayCategory: 'Tech',
    imageUrl: 'https://m.media-amazon.com/images/I/71vFKBpKakL._SX679_.jpg',
    link: 'https://amzn.to/macbook-air-m2',
    description: 'Fanless design, 18-hour battery, best-in-class performance for creators and students.',
  },
  {
    id: 'dell-xps-15',
    name: 'Dell XPS 15 (2024)',
    category: 'tech',
    displayCategory: 'Tech',
    imageUrl: 'https://m.media-amazon.com/images/I/81lFdBQtKGL._SX679_.jpg',
    link: 'https://amzn.to/dell-xps-15',
    description: 'OLED display, Intel Core Ultra, ideal for video editors and developers.',
  },
  {
    id: 'asus-zenbook-14',
    name: 'ASUS Zenbook 14 OLED',
    category: 'tech',
    displayCategory: 'Tech',
    imageUrl: 'https://m.media-amazon.com/images/I/71+gD4MAOFL._SX679_.jpg',
    link: 'https://amzn.to/asus-zenbook-14',
    description: 'Lightweight OLED workhorse with all-day battery — best value under ₹80k.',
  },
  {
    id: 'lenovo-thinkpad-x1',
    name: 'Lenovo ThinkPad X1 Carbon Gen 12',
    category: 'tech',
    displayCategory: 'Tech',
    imageUrl: 'https://m.media-amazon.com/images/I/616FIsHbokL._SX679_.jpg',
    link: 'https://amzn.to/thinkpad-x1',
    description: 'Business flagship: MIL-SPEC durability, 5G optional, legendary keyboard.',
  },
  {
    id: 'hp-spectre-x360',
    name: 'HP Spectre x360 14 (2024)',
    category: 'tech',
    displayCategory: 'Tech',
    imageUrl: 'https://m.media-amazon.com/images/I/71yj9EoR9QL._SX679_.jpg',
    link: 'https://amzn.to/hp-spectre-x360',
    description: '2-in-1 convertible with OLED touch display — perfect for note-takers and designers.',
  },
  {
    id: 'acer-swift-go-14',
    name: 'Acer Swift Go 14 (OLED)',
    category: 'tech',
    displayCategory: 'Tech',
    imageUrl: 'https://m.media-amazon.com/images/I/71t0bEzDkKL._SX679_.jpg',
    link: 'https://amzn.to/acer-swift-go-14',
    description: 'Budget OLED gem — vivid screen + Intel Core Ultra at a student-friendly price.',
  },

  // ── Tech — Vlogging Cameras ─────────────────────────────────────────────────
  {
    id: 'sony-zv-e10-ii',
    name: 'Sony ZV-E10 II',
    category: 'tech',
    displayCategory: 'Tech',
    imageUrl: 'https://m.media-amazon.com/images/I/71IqHWxJhRL._SX679_.jpg',
    link: 'https://amzn.to/sony-zve10-ii',
    description: 'Best-in-class autofocus, swivel screen — the YouTube standard for sub-₹70k.',
  },
  {
    id: 'gopro-hero-12',
    name: 'GoPro HERO 12 Black',
    category: 'tech',
    displayCategory: 'Tech',
    imageUrl: 'https://m.media-amazon.com/images/I/71UMBpLJoGL._SX679_.jpg',
    link: 'https://amzn.to/gopro-hero12',
    description: 'Waterproof action cam — essential for motorcycle rides and adventure travel.',
  },
  {
    id: 'dji-osmo-pocket-3',
    name: 'DJI Osmo Pocket 3',
    category: 'tech',
    displayCategory: 'Tech',
    imageUrl: 'https://m.media-amazon.com/images/I/61MbYpHlNQL._SX679_.jpg',
    link: 'https://amzn.to/dji-osmo-pocket3',
    description: '3-axis gimbal built-in, 4K/120fps — pocket-sized cinema for solo creators.',
  },
  {
    id: 'canon-g7x-iii',
    name: 'Canon PowerShot G7X Mark III',
    category: 'tech',
    displayCategory: 'Tech',
    imageUrl: 'https://m.media-amazon.com/images/I/71NRDqNGFQL._SX679_.jpg',
    link: 'https://amzn.to/canon-g7x-iii',
    description: 'Live-streaming built-in, pop-up selfie screen — popular with travel vloggers.',
  },
  {
    id: 'insta360-x4',
    name: 'Insta360 X4',
    category: 'tech',
    displayCategory: 'Tech',
    imageUrl: 'https://m.media-amazon.com/images/I/61jTXVMFa3L._SX679_.jpg',
    link: 'https://amzn.to/insta360-x4',
    description: '360° 8K recording — mount it on your helmet and let AI reframe the shot.',
  },
  {
    id: 'sony-fx30',
    name: 'Sony FX30 Cinema Camera',
    category: 'tech',
    displayCategory: 'Tech',
    imageUrl: 'https://m.media-amazon.com/images/I/71dV3HKM3GL._SX679_.jpg',
    link: 'https://amzn.to/sony-fx30',
    description: 'Super-35 sensor, S-Cinetone — step up to cinematic quality under ₹1 lakh.',
  },

  // ── Investing ───────────────────────────────────────────────────────────────
  {
    id: 'learn-to-earn-peter-lynch',
    name: 'Learn to Earn by Peter Lynch',
    category: 'investing',
    displayCategory: 'Investing',
    imageUrl: 'https://m.media-amazon.com/images/I/71WT1J3Hw4L._SY466_.jpg',
    link: 'https://amzn.to/4trbmys',
    description: 'The clearest introduction to how the stock market works — from the GOAT of investing.',
  },

  // ── Personal Finance ────────────────────────────────────────────────────────
  {
    id: 'wildhorn-wallet',
    name: 'WildHorn Leather Wallet',
    category: 'personal-finance',
    displayCategory: 'Personal Finance',
    imageUrl: 'https://m.media-amazon.com/images/I/71r1p5EpCCL._SX679_.jpg',
    link: 'https://amzn.to/3QcUehk',
    description: 'Slim RFID-blocking genuine leather wallet — carry your wealth with class.',
  },
];

// All unique category slugs (for nav/filter generation)
export const INVENTORY_CATEGORIES = [...new Set(INVENTORY.map((i) => i.category))];
