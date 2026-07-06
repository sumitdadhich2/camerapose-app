export type Category = {
  id: string;
  name: string;
  icon: string; // Ionicons name
  coverImagePlaceholder: string;
  poseCount: number;
  isPremium: boolean;
  subcategories: string[];
};

export type PoseTemplate = {
  id: string;
  title: string;
  categoryId: string;
  subcategory: string;
  gender: 'girl' | 'boy' | 'unisex';
  ageGroup: 'kids' | 'teen' | 'adult' | 'family';
  difficulty: 'easy' | 'medium' | 'hard';
  cameraType: 'front' | 'rear';
  recommendedDistance: string;
  orientation: 'portrait' | 'landscape';
  premium: boolean;
  description: string;
  tips: string[];
  svgOutline: string;
  previewImage: string;
  tags: string[];
};

export type UserProfile = {
  id: string;
  name: string;
  isGuest: boolean;
  isPremium: boolean;
};

export type PoseFilter = {
  gender?: string[];
  ageGroup?: string[];
  difficulty?: string[];
  premium?: boolean | null;
  cameraType?: string[];
};