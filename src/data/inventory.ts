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
  category: 'tech' | 'riding-gear' | 'travel' | 'lifestyle'; 
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
  { id: 'lifestyle', label: 'Lifestyle', description: 'Home, kitchen, and ergonomic essentials.', emoji: '🏠', imageId: 'ChatGPT_Image_Jun_22_2026_08_30_23_PM_vuxlfa' }
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
    imageId: 'android_vs_windows_laptops_ow2zwa'
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
  }
  
  // --- ADD NEW CATEGORIES HERE ---
  // Just copy a block, change the id/label, and set the category to 'tech', 'travel', etc.
];