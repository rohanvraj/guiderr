export interface Product {
  id: string;
  title: string;
  description: string;
  image: string;
  price: number;
  defaultLink: string;
  influencerLinks: Record<string, string>;
  badge?: 'new' | 'popular';
}

export const products: Record<string, Product[]> = {
  motorcycles: [
    {
      id: 'packing-guide-1',
      title: 'Complete Beginner\'s Guide to Motorcycling',
      description: 'Everything you need to know to start your riding journey safely and confidently',
      image: 'https://images.pexels.com/photos/2116475/pexels-photo-2116475.jpeg?auto=compress&cs=tinysrgb&w=600',
      price: 1999,
      defaultLink: 'https://imojo.in/motorcycling-beginners',
      influencerLinks: {
        rahul: 'https://imojo.in/motorcycling-beginners-rahul',
        manisha: 'https://imojo.in/motorcycling-beginners-manisha',
        alex: 'https://imojo.in/motorcycling-beginners-alex',
      },
      badge: 'popular',
    },
    {
      id: 'advanced-techniques-2',
      title: 'Advanced Riding Techniques',
      description: 'Master cornering, braking, and control for experienced riders',
      image: 'https://images.pexels.com/photos/3612932/pexels-photo-3612932.jpeg?auto=compress&cs=tinysrgb&w=600',
      price: 2499,
      defaultLink: 'https://imojo.in/advanced-riding',
      influencerLinks: {
        rahul: 'https://imojo.in/advanced-riding-rahul',
        manisha: 'https://imojo.in/advanced-riding-manisha',
        alex: 'https://imojo.in/advanced-riding-alex',
      },
    },
    {
      id: 'maintenance-mastery-3',
      title: 'Motorcycle Maintenance Mastery',
      description: 'Keep your bike running smoothly with DIY maintenance and repair',
      image: 'https://images.pexels.com/photos/1416169/pexels-photo-1416169.jpeg?auto=compress&cs=tinysrgb&w=600',
      price: 2199,
      defaultLink: 'https://imojo.in/motorcycle-maintenance',
      influencerLinks: {
        rahul: 'https://imojo.in/motorcycle-maintenance-rahul',
        manisha: 'https://imojo.in/motorcycle-maintenance-manisha',
        alex: 'https://imojo.in/motorcycle-maintenance-alex',
      },
      badge: 'new',
    },
    {
      id: 'safety-essentials-4',
      title: 'Motorcycle Safety Essentials',
      description: 'Comprehensive guide to protective gear and safe riding practices',
      image: 'https://images.pexels.com/photos/5632397/pexels-photo-5632397.jpeg?auto=compress&cs=tinysrgb&w=600',
      price: 1699,
      defaultLink: 'https://imojo.in/motorcycle-safety',
      influencerLinks: {
        rahul: 'https://imojo.in/motorcycle-safety-rahul',
        manisha: 'https://imojo.in/motorcycle-safety-manisha',
        alex: 'https://imojo.in/motorcycle-safety-alex',
      },
    },
  ],
  finance: [
    {
      id: 'investing-beginners-5',
      title: 'Investing for Beginners',
      description: 'Build a solid foundation in stocks, bonds, and portfolio management',
      image: 'https://images.pexels.com/photos/6801648/pexels-photo-6801648.jpeg?auto=compress&cs=tinysrgb&w=600',
      price: 2999,
      defaultLink: 'https://imojo.in/investing-beginners',
      influencerLinks: {
        priya: 'https://imojo.in/investing-beginners-priya',
        vikram: 'https://imojo.in/investing-beginners-vikram',
        sarah: 'https://imojo.in/investing-beginners-sarah',
      },
      badge: 'popular',
    },
    {
      id: 'financial-freedom-6',
      title: 'Financial Freedom Blueprint',
      description: 'Create multiple income streams and achieve early retirement',
      image: 'https://images.pexels.com/photos/3943716/pexels-photo-3943716.jpeg?auto=compress&cs=tinysrgb&w=600',
      price: 3299,
      defaultLink: 'https://imojo.in/financial-freedom',
      influencerLinks: {
        priya: 'https://imojo.in/financial-freedom-priya',
        vikram: 'https://imojo.in/financial-freedom-vikram',
        sarah: 'https://imojo.in/financial-freedom-sarah',
      },
      badge: 'new',
    },
    {
      id: 'crypto-guide-7',
      title: 'Crypto & Digital Assets Guide',
      description: 'Navigate the world of cryptocurrency and blockchain technology',
      image: 'https://images.pexels.com/photos/8369770/pexels-photo-8369770.jpeg?auto=compress&cs=tinysrgb&w=600',
      price: 2699,
      defaultLink: 'https://imojo.in/crypto-assets',
      influencerLinks: {
        priya: 'https://imojo.in/crypto-assets-priya',
        vikram: 'https://imojo.in/crypto-assets-vikram',
        sarah: 'https://imojo.in/crypto-assets-sarah',
      },
    },
    {
      id: 'real-estate-8',
      title: 'Real Estate Investment Guide',
      description: 'Complete guide to building wealth through property investment',
      image: 'https://images.pexels.com/photos/1396132/pexels-photo-1396132.jpeg?auto=compress&cs=tinysrgb&w=600',
      price: 3599,
      defaultLink: 'https://imojo.in/real-estate-guide',
      influencerLinks: {
        priya: 'https://imojo.in/real-estate-guide-priya',
        vikram: 'https://imojo.in/real-estate-guide-vikram',
        sarah: 'https://imojo.in/real-estate-guide-sarah',
      },
    },
  ],
  travel: [
    {
      id: 'solo-travel-9',
      title: 'Solo Travel Essentials',
      description: 'Travel the world alone with confidence, safety, and insider tips',
      image: 'https://images.pexels.com/photos/1008155/pexels-photo-1008155.jpeg?auto=compress&cs=tinysrgb&w=600',
      price: 1899,
      defaultLink: 'https://imojo.in/solo-travel',
      influencerLinks: {
        aditya: 'https://imojo.in/solo-travel-aditya',
        zara: 'https://imojo.in/solo-travel-zara',
        james: 'https://imojo.in/solo-travel-james',
      },
      badge: 'popular',
    },
    {
      id: 'budget-hacks-10',
      title: 'Budget Travel Hacks',
      description: 'See the world without breaking the bank with proven strategies',
      image: 'https://images.pexels.com/photos/3278215/pexels-photo-3278215.jpeg?auto=compress&cs=tinysrgb&w=600',
      price: 1699,
      defaultLink: 'https://imojo.in/budget-travel',
      influencerLinks: {
        aditya: 'https://imojo.in/budget-travel-aditya',
        zara: 'https://imojo.in/budget-travel-zara',
        james: 'https://imojo.in/budget-travel-james',
      },
      badge: 'new',
    },
    {
      id: 'digital-nomad-11',
      title: 'Digital Nomad Handbook',
      description: 'Work remotely while traveling the globe - complete lifestyle guide',
      image: 'https://images.pexels.com/photos/7241426/pexels-photo-7241426.jpeg?auto=compress&cs=tinysrgb&w=600',
      price: 3599,
      defaultLink: 'https://imojo.in/digital-nomad',
      influencerLinks: {
        aditya: 'https://imojo.in/digital-nomad-aditya',
        zara: 'https://imojo.in/digital-nomad-zara',
        james: 'https://imojo.in/digital-nomad-james',
      },
    },
    {
      id: 'asia-guide-12',
      title: 'Complete Asia Travel Guide',
      description: 'Comprehensive guide to traveling through Asia with local insights',
      image: 'https://images.pexels.com/photos/1619317/pexels-photo-1619317.jpeg?auto=compress&cs=tinysrgb&w=600',
      price: 2499,
      defaultLink: 'https://imojo.in/asia-travel-guide',
      influencerLinks: {
        aditya: 'https://imojo.in/asia-travel-guide-aditya',
        zara: 'https://imojo.in/asia-travel-guide-zara',
        james: 'https://imojo.in/asia-travel-guide-james',
      },
    },
  ],
};

export const categoryNames: Record<string, string> = {
  motorcycles: 'Motorcycles',
  finance: 'Finance',
  travel: 'Travel',
};
