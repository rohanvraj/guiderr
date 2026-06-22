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
  { id: 'tech', label: 'Tech', description: 'Smart home gadgets, power solutions, and electronics.', emoji: '💻', imageId: 'dji_osmo_pocket_3_egpm0w' },
  { id: 'riding-gear', label: 'Riding Gear', description: 'Jackets, helmets, and motorcycle luggage.', emoji: '🏍️', imageId: 'viaterra-claw-motorcycle-luggage_ipqmnx' },
  { id: 'travel', label: 'Travel', description: 'Premium luggage and essentials for the road.', emoji: '✈️', imageId: 'hard_suitcase_image_1_erwlwh' },
  { id: 'lifestyle', label: 'Lifestyle', description: 'Home, kitchen, and ergonomic essentials.', emoji: '🏠', imageId: 'De_Longhi-Dedica-espresso-machine_x52df1' }
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
    imageId: 'ECOVACS-DEEBOT-N30-Plus-robot-vacuum_hgupxa'
  },
  {
    id: 'power-stations',
    category: 'tech',
    label: 'Power Stations',
    description: 'Portable backup power for camping and home emergencies.',
    amazonUrl: `https://www.amazon.in/s?k=portable+power+station+ecoflow+jackery&tag=${TAG}`,
    emoji: '🔋',
    imageId: 'EF_ECOFLOW_DELTA_2_Portable_Power_Station_db3uy5'
  },
  {
    id: 'laptops',
    category: 'tech',
    label: 'Work Laptops',
    description: 'The best Windows and Android laptops for productivity.',
    amazonUrl: `https://www.amazon.in/s?k=laptop+under+50000+dell+hp+acer&tag=${TAG}`,
    emoji: '🖥️',
    imageId: 'dell_15_laptop_under_50k_lsebur'
  },
  {
    id: 'car-accessories',
    category: 'tech',
    label: 'Car Gadgets',
    description: 'Dash cams, tire inflators, and vacuum cleaners.',
    amazonUrl: `https://www.amazon.in/s?k=car+dash+cam+inflator+vacuum&tag=${TAG}`,
    emoji: '🚗',
    imageId: '70mai_a510_dash_cam_image'
  },

  // ─── RIDING GEAR HUB ────────────────────────────────────────────────────
  {
    id: 'riding-apparel',
    category: 'riding-gear',
    label: 'Riding Apparel',
    description: 'Protective jackets, pants, and gloves for motorcyclists.',
    amazonUrl: `https://www.amazon.in/s?k=motorcycle+riding+jacket+pants+gloves&tag=${TAG}`,
    emoji: '🛡️',
    imageId: 'rynox-magnapod-tankbag'
  },
  {
    id: 'motorcycle-luggage',
    category: 'riding-gear',
    label: 'Motorcycle Luggage',
    description: 'Saddle bags, tail bags, and tank bags for touring.',
    amazonUrl: `https://www.amazon.in/s?k=motorcycle+saddle+bags+tail+bag+viaterra+rynox&tag=${TAG}`,
    emoji: '🧳',
    imageId: 'viaterra-claw-motorcycle-luggage_ipqmnx'
  },

  // ─── TRAVEL HUB ─────────────────────────────────────────────────────────
  {
    id: 'suitcases',
    category: 'travel',
    label: 'Travel Bags',
    description: 'Indestructible cabin and check-in luggage.',
    amazonUrl: `https://www.amazon.in/s?k=travel+bags+luggage+mokobara&tag=${TAG}`,
    emoji: '✈️',
    imageId: 'MOKOBARA_The_Transit_Luggage_compressed_zivvgp'
  },

  // ─── LIFESTYLE HUB ──────────────────────────────────────────────────────
  {
    id: 'espresso-machines',
    category: 'lifestyle',
    label: 'Espresso Machines',
    description: 'Cafe-quality coffee and espresso at home.',
    amazonUrl: `https://www.amazon.in/s?k=espresso+machine+delonghi+philips&tag=${TAG}`,
    emoji: '☕',
    imageId: 'De_Longhi-Dedica-espresso-machine_x52df1'
  },
  {
    id: 'ergonomic-chairs',
    category: 'lifestyle',
    label: 'Office Chairs',
    description: 'Comfortable seating for long work-from-home sessions.',
    amazonUrl: `https://www.amazon.in/s?k=ergonomic+office+chair+green+soul&tag=${TAG}`,
    emoji: '🪑',
    imageId: 'chair5_x9gp8r-jupiter-superb'
  }
  
  // --- ADD NEW CATEGORIES HERE ---
  // Just copy a block, change the id/label, and set the category to 'tech', 'travel', etc.
];