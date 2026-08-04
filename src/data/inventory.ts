// src/data/inventory.ts

export interface Hub {
  id: string;
  label: string;
  description: string;
  emoji: string;
  imageId: string;
}

export interface InventoryItem {
  id: string;
  category: 'tech' | 'riding-gear' | 'travel' | 'lifestyle' | 'investing' | 'personal-finance' | 'credit-cards';
  label: string;
  description: string;
  amazonUrl: string;
  emoji: string;
  imageId: string;
}

const TAG = 'rohan198609-21';

export const HUBS: Hub[] = [
  { id: 'tech', label: 'Tech', description: 'Smart home gadgets, power solutions, and electronics.', emoji: '💻', imageId: 'ChatGPT_Image_Jun_22_2026_08_22_08_PM_alrhjk' },
  { id: 'riding-gear', label: 'Riding Gear', description: 'Jackets, helmets, and motorcycle luggage.', emoji: '🏍️', imageId: 'riding_gear_thumbnail_s6kd4h' },
  { id: 'travel', label: 'Travel', description: 'Premium luggage and essentials for the road.', emoji: '✈️', imageId: 'hard_suitcase_image_1_erwlwh' },
  { id: 'lifestyle', label: 'Lifestyle', description: 'Home, kitchen, and ergonomic essentials.', emoji: '🏠', imageId: 'ChatGPT_Image_Jun_22_2026_08_30_23_PM_vuxlfa' },
  { id: 'investing', label: 'Investing', description: 'Tools and books to build long-term wealth.', emoji: '📈', imageId: 'psychology-of-money_lhkbus' },
  { id: 'personal-finance', label: 'Finance', description: 'Banking and savings tools for Indians.', emoji: '💰', imageId: 'monika-halan-book-click-to-buy_wqis9t' },
  { id: 'credit-cards', label: 'Credit Cards', description: 'Best rewards and cashback cards in India.', emoji: '💳', imageId: 'sbi-cashback-credit-card-32kb_iun40j' }
];

export const INVENTORY: InventoryItem[] = [
  // ─── TECH HUB ──────────────────────────────────────────────────────────
  {
    id: 'robot-vacuums',
    category: 'tech',
    label: 'Robot Vacuums',
    description: 'Hands-free floor cleaning for Indian homes.',
    amazonUrl: `https://www.amazon.in/s?k=robot+vacuum+mop&tag=${TAG}`,
    emoji: '🤖',
    imageId: 'ECOVACS_DEEBOT_N30_White_bv7joa'
  },
  {
    id: 'power-stations',
    category: 'tech',
    label: 'Power Stations',
    description: 'Portable backup power for camping and home emergencies.',
    amazonUrl: `https://www.amazon.in/s?k=portable+power+station+ecoflow+jackery&tag=${TAG}`,
    emoji: '🔋',
    imageId: 'ChatGPT_Image_Jun_22_2026_08_37_35_PM_fytnbg'
  },
  {
    id: 'laptops',
    category: 'tech',
    label: 'Work Laptops',
    description: 'The best Windows and Android laptops for productivity.',
    amazonUrl: `https://www.amazon.in/s?k=laptop+under+50000+dell+hp+acer&tag=${TAG}`,
    emoji: '🖥️',
    imageId: 'ChatGPT_Image_Jul_13_2026_01_40_21_PM_pd5ien'
  },

  {
  id: 'ninja-blender',
  category: 'tech',
  label: 'Ninja Blender',
  description: 'High-performance professional blender for smoothies, nut butters, and frozen drinks.',
  amazonUrl: 'https://amzn.to/4p0X0Dy',
  emoji: '🥤',
  imageId: 'ChatGPT_Image_Jul_5_2026_05_34_11_PM_esdhpo' // Upload your Squooshed AI image to Cloudinary and use that ID
},

{
    id: 'portronics-beem-470',
    category: 'tech',
    label: 'Portronics Beem 470',
    description: 'Smart 1080p Full HD LED projector with a unique rotatable design and built-in Netflix/Prime Video apps. theater-grade 4500 Lumens.',
    amazonUrl: 'https://link.amazon/B0gKc6kKU',
    emoji: '📽️',
    imageId: 'ChatGPT_Image_Jul_13_2026_04_47_23_PM_mpfhp0' // Replace this after your Cloudinary upload
  },

{
  id: 'electric-irons',
  category: 'tech',
  label: 'Electric Irons',
  description: 'Top steam irons, dry irons, and garment steamers for wrinkle-free clothes.',
  amazonUrl: 'https://link.amazon/B03DGeSIU',
  emoji: '👔',
  imageId: 'GC_181_ippzh7'
},

{
    id: 'hamilton-beach-steamer',
    category: 'tech',
    label: 'Hamilton Beach 3-in-1 Steamer',
    description: '1700W patented 3-in-1 garment steamer, steam iron & dry iron with 10-year Durathon soleplate warranty and auto shut-off.',
    amazonUrl: 'https://link.amazon/B0g29MwQC', // <-- Paste your Amazon affiliate link here
    emoji: '💨',
    imageId: 'HAMILTON_BEACH_3_IN_1_bdmus6' // <-- Upload product image to Cloudinary and paste the Public ID here
  },


  // ─── RIDING GEAR HUB ────────────────────────────────────────────────────
  {
    id: 'riding-apparel',
    category: 'riding-gear',
    label: 'Riding Apparel',
    description: 'Protective jackets, pants, and gloves for motorcyclists.',
    amazonUrl: `https://www.amazon.in/s?k=motorcycle+riding+jacket+pants+gloves&tag=${TAG}`,
    emoji: '🛡️',
    imageId: 'ChatGPT_Image_Jun_22_2026_08_46_00_PM_ox1z4c'
  },
  {
    id: 'motorcycle-luggage',
    category: 'riding-gear',
    label: 'Motorcycle Luggage',
    description: 'Saddle bags, tail bags, and tank bags for touring.',
    amazonUrl: `https://www.amazon.in/s?k=motorcycle+saddle+bags+tail+bag+viaterra+rynox&tag=${TAG}`,
    emoji: '🧳',
    imageId: 'ChatGPT_Image_Jun_22_2026_08_44_45_PM_dccxj3'
  },

  {

  id: 'touring-jackets',
  category: 'riding-gear',
  label: 'Touring Jackets',
  description: 'Protective touring motorcycle jackets for all-weather comfort and long-distance riding.',
  amazonUrl: 'https://link.amazon/B0hyCK5CY',
  emoji: '🧥',
  imageId: 'ChatGPT_Image_Jul_14_2026_04_53_41_PM_ytpf3l'

},

{
  id: 'riding-pants',
  category: 'riding-gear',
  label: 'Riding Pants',
  description: 'Protective motorcycle riding pants designed for touring, commuting, and long-distance adventures.',
  amazonUrl: 'https://link.amazon/B07ev018w',
  emoji: '👖',
  imageId: 'ChatGPT_Image_Jul_14_2026_04_52_02_PM_mon8ru'
},

{
  id: 'riding-gloves',
  category: 'riding-gear',
  label: 'Riding Gloves',
  description: 'Protective motorcycle riding gloves for touring, daily commuting, and all-weather comfort.',
  amazonUrl: 'https://link.amazon/B046K9I1f',
  emoji: '🧤',
  imageId: 'ChatGPT_Image_Jul_14_2026_04_58_26_PM_jnfq32'
},

  // ─── TRAVEL HUB ─────────────────────────────────────────────────────────
  {
    id: 'suitcases',
    category: 'travel',
    label: 'Travel Bags',
    description: 'Indestructible cabin and check-in luggage.',
    amazonUrl: `https://www.amazon.in/s?k=travel+bags+luggage+mokobara&tag=${TAG}`,
    emoji: '✈️',
    imageId: 'ChatGPT_Image_Jun_22_2026_08_42_24_PM_psp675'
  },

  // ─── LIFESTYLE HUB ──────────────────────────────────────────────────────
  {
    id: 'espresso-machines',
    category: 'lifestyle',
    label: 'Espresso Machines',
    description: 'Cafe-quality coffee and espresso at home.',
    amazonUrl: `https://www.amazon.in/s?k=espresso+machine+delonghi+philips&tag=${TAG}`,
    emoji: '☕',
    imageId: 'ChatGPT_Image_Jun_22_2026_08_30_23_PM_vuxlfa'
  },
  {
    id: 'ergonomic-chairs',
    category: 'lifestyle',
    label: 'Office Chairs',
    description: 'Comfortable seating for long work-from-home sessions.',
    amazonUrl: `https://www.amazon.in/s?k=ergonomic+office+chair+green+soul&tag=${TAG}`,
    emoji: '🪑',
    imageId: 'ChatGPT_Image_Jun_18_2026_01_14_28_AM_nbkj4w'
  },
  
  // ─── INVESTING ──────────────────────────────────────────────────────────
  {
    id: 'investing-essentials',
    category: 'investing',
    label: 'Investing Books',
    description: 'The foundation of wealth: Psychology of Money & Peter Lynch.',
    amazonUrl: `https://www.amazon.in/s?k=psychology+of+money+peter+lynch+books&tag=${TAG}`,
    emoji: '📚',
    imageId: 'psychology-of-money_lhkbus'
  },
  // ─── PERSONAL FINANCE ───────────────────────────────────────────────────
  {
    id: 'finance-tools',
    category: 'personal-finance',
    label: 'Wealth Management',
    description: 'Top-rated savings accounts and financial planners.',
    amazonUrl: `https://bitli.in/qio3jbz`, // Your Kotak 811 EarnKaro link
    emoji: '🏦',
    imageId: 'monika-halan-book-click-to-buy_wqis9t'
  },

 {
  id: 'mattresses',
  category: 'lifestyle',
  label: 'Mattresses',
  description: 'Compare the best memory foam, orthopedic, latex, and hybrid mattresses for better sleep.',
  amazonUrl: 'https://link.amazon/B06GkgRgc',
  emoji: '🛏️',
  imageId: 'ChatGPT_Image_Jul_14_2026_03_34_09_PM_zr6lja'
},

{
    id: 'tata-1mg-whey-protein',
    category: 'lifestyle',
    label: 'Tata 1mg Whey Protein',
    description: 'Clean whey protein isolate and concentrate blend delivering 24g of protein, 5.6g BCAAs, and 30 Billion CFU probiotics for muscle recovery and easy digestion.',
    amazonUrl: 'https://link.amazon/B0iql0izm',
    emoji: '💪',
    imageId: 'tata-1mg-whey-isolate_bbcjl1' 
  },


  // ─── CREDIT CARDS ───────────────────────────────────────────────────────
  {
    id: 'cashback-cards',
    category: 'credit-cards',
    label: 'Cashback Cards',
    description: 'The SBI & Axis power-duo for 5% savings online.',
    amazonUrl: `https://bitli.in/76MvAMA`, // Your SBI Cashback EarnKaro link
    emoji: '💳',
    imageId: 'sbi-cashback-credit-card-32kb_iun40j'
  }
  // --- ADD NEW CATEGORIES HERE ---
  // Just copy a block, change the id/label, and set the category to 'tech', 'travel', etc.
];