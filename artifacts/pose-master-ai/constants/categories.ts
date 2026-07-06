import { Category } from '../types';

export const CATEGORIES: Category[] = [
  { id: 'c1', name: 'Single Girl', icon: 'person', templateCount: 42 },
  { id: 'c2', name: 'Single Boy', icon: 'person-outline', templateCount: 38 },
  { id: 'c3', name: 'Friends', icon: 'people', templateCount: 55 },
  { id: 'c4', name: 'Couple', icon: 'heart', templateCount: 60 },
  { id: 'c5', name: 'Family', icon: 'home', templateCount: 30 },
  { id: 'c6', name: 'Kids', icon: 'happy', templateCount: 25 },
  { id: 'c7', name: 'Wedding', icon: 'rose', templateCount: 70 },
  { id: 'c8', name: 'School', icon: 'school', templateCount: 15 },
  { id: 'c9', name: 'College', icon: 'book', templateCount: 20 },
  { id: 'c10', name: 'Traditional', icon: 'flower', templateCount: 45 },
  { id: 'c11', name: 'Temple', icon: 'business', templateCount: 28 },
  { id: 'c12', name: 'Travel', icon: 'airplane', templateCount: 80 },
  { id: 'c13', name: 'Nature', icon: 'leaf', templateCount: 50 },
  { id: 'c14', name: 'Car', icon: 'car', templateCount: 35 },
  { id: 'c15', name: 'Bike', icon: 'bicycle', templateCount: 32 },
  { id: 'c16', name: 'Cafe', icon: 'cafe', templateCount: 40 },
  { id: 'c17', name: 'Fashion', icon: 'shirt', templateCount: 65 },
  { id: 'c18', name: 'Instagram', icon: 'logo-instagram', templateCount: 90 },
  { id: 'c19', name: 'Reels', icon: 'videocam', templateCount: 85 },
  { id: 'c20', name: 'Portrait', icon: 'camera', templateCount: 55 },
];

export const MOCK_TEMPLATES = [
  { id: 't1', categoryId: 'c1', name: 'Looking Back' },
  { id: 't2', categoryId: 'c1', name: 'Walking Away' },
  { id: 't3', categoryId: 'c4', name: 'Holding Hands' },
  { id: 't4', categoryId: 'c12', name: 'Mountain View' },
  { id: 't5', categoryId: 'c18', name: 'Coffee Shop Vibe' },
];
