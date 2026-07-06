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
  /** Recommended camera/subject height, e.g. "Waist Level" or "Eye Level". */
  recommendedHeight: string;
  orientation: 'portrait' | 'landscape';
  premium: boolean;
  description: string;
  tips: string[];
  /** Key into the local SVG outline registry (see features/overlay/svgOutlines.tsx). */
  svgOutline: string;
  previewImage: string;
  tags: string[];
};

/**
 * Recommended orientation is the same concept as `PoseTemplate.orientation` —
 * kept as a single source of truth on the template rather than duplicating
 * the field, to avoid the two drifting out of sync.
 */
export type RecommendedOrientation = PoseTemplate['orientation'];

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