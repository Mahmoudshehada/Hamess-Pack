
import { Category, Product } from './types';

// REPLACE WITH YOUR VALID GOOGLE MAPS API KEY
export const GOOGLE_MAPS_API_KEY = 'AIzaSyA9UfyBuKf8ocqI0AwsE5BRkared227SBI'; 

// Central Store Location (e.g., Downtown Cairo) for distance calculation
export const STORE_LOCATION = {
  lat: 30.0444, 
  lng: 31.2357
};

export const MOCK_PRODUCTS: Product[] = [
  // --- NEW PERMANENT PRODUCTS ---
  {
    id: 'prod-cub-2025',
    name: 'Cub 2025 (Blue Party Cups)',
    price: 100,
    category: Category.PARTY_SUPPLIES,
    description: 'Durable blue plastic cups (50 Pack). Special edition 2025 celebration party supplies.',
    image: 'https://images.unsplash.com/photo-1576669092396-5354b891fb43?auto=format&fit=crop&w=800&q=80',
    rating: 5.0,
    isCustomizable: false,
    stock: 100,
    costPrice: 50
  },
  {
    id: 'prod-num-4-candle',
    name: 'Gold Birthday Candle - Number 4',
    price: 28,
    category: Category.DECORATIONS,
    description: 'Premium gold metallic finish birthday candle. Number 4.',
    image: 'https://images.unsplash.com/photo-1572370332826-b6f246136dae?auto=format&fit=crop&w=800&q=80',
    rating: 5.0,
    isCustomizable: false,
    stock: 200,
    costPrice: 12
  },
  {
    id: 'prod-num-0-candle',
    name: 'Gold Birthday Candle - Number 0',
    price: 28,
    category: Category.DECORATIONS,
    description: 'Premium gold metallic finish birthday candle. Number 0.',
    image: 'https://images.unsplash.com/photo-1602662516326-5425b993f435?auto=format&fit=crop&w=800&q=80',
    rating: 5.0,
    isCustomizable: false,
    stock: 200,
    costPrice: 12
  },
  {
    id: 'prod-silver-forks',
    name: 'Elite Premium Forks (10 Pcs)',
    price: 50,
    category: Category.EVENT_ACCESSORIES,
    description: 'Heavy duty silver-look plastic forks. Elegant and durable for any event.',
    image: 'https://images.unsplash.com/photo-1618331835717-801e976710b2?auto=format&fit=crop&w=800&q=80',
    rating: 4.8,
    isCustomizable: false,
    stock: 150,
    costPrice: 25
  },
  {
    id: 'prod-white-spoons',
    name: 'Elite Premium Spoons (10 Pcs)',
    price: 39,
    category: Category.EVENT_ACCESSORIES,
    description: 'Heavy duty white plastic spoons. Premium quality for serving.',
    image: 'https://images.unsplash.com/photo-1585374822305-906a3d376345?auto=format&fit=crop&w=800&q=80',
    rating: 4.8,
    isCustomizable: false,
    stock: 150,
    costPrice: 18
  },
  {
    id: 'prod-green-set',
    name: 'Eco Green Party Set',
    price: 120,
    category: Category.PARTY_SUPPLIES,
    description: 'Complete set with green paper cups, plates, and wooden forks.',
    image: 'https://images.unsplash.com/photo-1615934172545-6d65b232644e?auto=format&fit=crop&w=800&q=80',
    rating: 4.9,
    isCustomizable: false,
    stock: 80,
    costPrice: 60
  },
  {
    id: 'prod-divided-plate',
    name: 'White Divided Serving Plate',
    price: 20,
    category: Category.PARTY_SUPPLIES,
    description: 'Sturdy 3-compartment disposable plate. Perfect for meals with sides.',
    image: 'https://images.unsplash.com/photo-1533746729715-20906798a643?auto=format&fit=crop&w=800&q=80',
    rating: 4.5,
    isCustomizable: false,
    stock: 300,
    costPrice: 8
  },
  
  // --- EXISTING PRODUCTS ---
  {
    id: '1',
    name: 'Golden Birthday Balloons Set',
    price: 250,
    category: Category.PARTY_SUPPLIES,
    description: 'A complete set of golden balloons including numbers and happy birthday text.',
    image: 'https://picsum.photos/seed/balloons/400/400',
    rating: 4.5,
    colors: ['Gold', 'Silver', 'Rose Gold'],
    isCustomizable: false,
    stock: 50
  },
  {
    id: '2',
    name: 'Luxury Gift Box',
    price: 120,
    category: Category.PACKAGING,
    description: 'Premium rigid box with magnetic closure. Perfect for high-end gifts.',
    image: 'https://picsum.photos/seed/box/400/400',
    rating: 4.8,
    colors: ['Black', 'White', 'Red'],
    isCustomizable: true,
    stock: 100
  },
  {
    id: '3',
    name: 'LED String Lights',
    price: 85,
    category: Category.DECORATIONS,
    description: 'Warm white LED lights, 10 meters. Battery operated.',
    image: 'https://picsum.photos/seed/lights/400/400',
    rating: 4.2,
    isCustomizable: false,
    stock: 200
  },
  {
    id: '4',
    name: 'Custom Name Cake Topper',
    price: 150,
    category: Category.EVENT_ACCESSORIES,
    description: 'Acrylic cake topper customizable with any name or age.',
    image: 'https://picsum.photos/seed/cake/400/400',
    rating: 4.9,
    colors: ['Gold', 'Black'],
    isCustomizable: true,
    stock: 30
  },
  {
    id: '5',
    name: 'Scented Candle Gift Set',
    price: 450,
    category: Category.GIFTS,
    description: 'Set of 3 aromatherapy candles in glass jars.',
    image: 'https://picsum.photos/seed/candle/400/400',
    rating: 4.7,
    isCustomizable: true,
    stock: 45
  },
  {
    id: '6',
    name: 'Confetti Poppers (Pack of 5)',
    price: 100,
    category: Category.PARTY_SUPPLIES,
    description: 'Safe and fun confetti poppers for surprises.',
    image: 'https://picsum.photos/seed/confetti/400/400',
    rating: 4.0,
    isCustomizable: false,
    stock: 150
  },
  {
    id: '7',
    name: 'Hamess Signature Party Bundle',
    price: 850,
    category: Category.PARTY_SUPPLIES,
    description: 'The ultimate party kit! Includes 50 balloons, "Happy Birthday" banner, 20 plates, 20 cups, and a table runner.',
    image: 'https://picsum.photos/seed/hamessparty/400/400',
    rating: 5.0,
    colors: ['Gold/Black', 'Pink/White', 'Blue/Silver'],
    isCustomizable: true,
    stock: 25
  },
  {
    id: '8',
    name: 'Custom Printed Gift Bags (10 Pack)',
    price: 200,
    category: Category.PACKAGING,
    description: 'Elegant paper gift bags with your custom text or logo. Perfect for party favors.',
    image: 'https://picsum.photos/seed/bags/400/400',
    rating: 4.8,
    colors: ['White', 'Kraft', 'Black'],
    isCustomizable: true,
    stock: 100
  }
];

export const CATEGORY_IMAGES: Record<Category, string> = {
  [Category.PARTY_SUPPLIES]: 'https://images.unsplash.com/photo-1530103862676-de3c9a59af38?auto=format&fit=crop&w=800&q=80',
  [Category.GIFTS]: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80',
  [Category.DECORATIONS]: 'https://images.unsplash.com/photo-1519225421980-715cb0202128?auto=format&fit=crop&w=800&q=80',
  [Category.EVENT_ACCESSORIES]: 'https://images.unsplash.com/photo-1464349153912-bc6163bd8917?auto=format&fit=crop&w=800&q=80',
  [Category.PACKAGING]: 'https://images.unsplash.com/photo-1605647540924-852290f6b0d5?auto=format&fit=crop&w=800&q=80',
};
