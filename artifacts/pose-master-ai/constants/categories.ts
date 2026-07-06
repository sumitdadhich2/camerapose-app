import { PoseLibraryService } from '../services/PoseLibraryService';

export const CATEGORIES = PoseLibraryService.getAllCategories();
export const MOCK_TEMPLATES = PoseLibraryService.getAllPoses().map(p => ({
  id: p.id,
  categoryId: p.categoryId,
  name: p.title
}));
