import categoriesData from '../assets/data/categories.json';
import posesData from '../assets/data/poses.json';
import { Category, PoseTemplate, PoseFilter } from '../types';

class PoseLibrary {
  private categories: Map<string, Category> = new Map();
  private poses: Map<string, PoseTemplate> = new Map();
  private posesList: PoseTemplate[] = [];

  constructor() {
    this.init();
  }

  private init() {
    (categoriesData as Category[]).forEach(c => {
      this.categories.set(c.id, c);
    });

    this.posesList = posesData as PoseTemplate[];
    this.posesList.forEach(p => {
      this.poses.set(p.id, p);
    });
  }

  getAllCategories(): Category[] {
    return Array.from(this.categories.values());
  }

  getCategoryById(id: string): Category | undefined {
    return this.categories.get(id);
  }

  getPoseById(id: string): PoseTemplate | undefined {
    return this.poses.get(id);
  }

  getAllPoses(): PoseTemplate[] {
    return this.posesList;
  }

  getPosesByCategory(categoryId: string, filters?: PoseFilter): PoseTemplate[] {
    let result = this.posesList.filter(p => p.categoryId === categoryId);
    if (filters) {
      result = this.applyFilters(result, filters);
    }
    return result;
  }

  searchPoses(query: string, filters?: PoseFilter): PoseTemplate[] {
    if (!query.trim() && !filters) return this.posesList;
    
    let result = this.posesList;
    
    if (query.trim()) {
      const lowerQuery = query.toLowerCase();
      result = result.filter(p => {
        const cat = this.categories.get(p.categoryId);
        return (
          p.title.toLowerCase().includes(lowerQuery) ||
          (cat && cat.name.toLowerCase().includes(lowerQuery)) ||
          p.tags.some(t => t.toLowerCase().includes(lowerQuery)) ||
          p.difficulty.toLowerCase().includes(lowerQuery) ||
          p.gender.toLowerCase().includes(lowerQuery)
        );
      });
    }

    if (filters) {
      result = this.applyFilters(result, filters);
    }

    return result;
  }

  private applyFilters(poses: PoseTemplate[], filters: PoseFilter): PoseTemplate[] {
    return poses.filter(p => {
      if (filters.gender && filters.gender.length > 0 && !filters.gender.includes(p.gender)) return false;
      if (filters.ageGroup && filters.ageGroup.length > 0 && !filters.ageGroup.includes(p.ageGroup)) return false;
      if (filters.difficulty && filters.difficulty.length > 0 && !filters.difficulty.includes(p.difficulty)) return false;
      if (filters.premium !== undefined && filters.premium !== null && p.premium !== filters.premium) return false;
      if (filters.cameraType && filters.cameraType.length > 0 && !filters.cameraType.includes(p.cameraType)) return false;
      return true;
    });
  }

  getTrending(): PoseTemplate[] {
    return this.posesList.slice(0, 10);
  }

  getRecommended(): PoseTemplate[] {
    return this.posesList.slice().reverse().slice(0, 10);
  }

  getNewPoses(): PoseTemplate[] {
    return this.posesList.slice(-10);
  }
}

export const PoseLibraryService = new PoseLibrary();
