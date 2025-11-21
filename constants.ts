

import { Category, Product } from './types';

// MAPS INTEGRATION REMOVED - No API Key required
export const STORE_LOCATION = {
  lat: 30.0444, 
  lng: 31.2357
};

// CLEARED FOR PRODUCTION USE
export const MOCK_PRODUCTS: Product[] = [];

export const CATEGORY_IMAGES: Record<Category, string> = {
  [Category.PARTY_SUPPLIES]: 'https://images.unsplash.com/photo-1530103862676-de3c9a59af38?auto=format&fit=crop&w=800&q=80',
  [Category.GIFTS]: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80',
  [Category.DECORATIONS]: 'https://images.unsplash.com/photo-1519225421980-715cb0202128?auto=format&fit=crop&w=800&q=80',
  [Category.EVENT_ACCESSORIES]: 'https://images.unsplash.com/photo-1464349153912-bc6163bd8917?auto=format&fit=crop&w=800&q=80',
  [Category.PACKAGING]: 'https://images.unsplash.com/photo-1605647540924-852290f6b0d5?auto=format&fit=crop&w=800&q=80',
};