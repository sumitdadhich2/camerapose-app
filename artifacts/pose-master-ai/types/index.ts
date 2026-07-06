export type Category = {
  id: string;
  name: string;
  icon: string; // Ionicons name
  templateCount: number;
};

export type PoseTemplate = {
  id: string;
  categoryId: string;
  name: string;
  imageUrl?: string; // Optional if we use local placeholders or outlines
};

export type UserProfile = {
  id: string;
  name: string;
  isGuest: boolean;
  isPremium: boolean;
};
