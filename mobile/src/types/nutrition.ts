// Basic entities matching your Java entities
export interface Food {
  id?: number;
  name: string;
  brand?: string;
  barcode?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Nutrition {
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  unit?: string;
}

// API Response types
export interface FoodSearchResponse {
  query: string;
  total_results: number;
  local_results: number;
  cached_new: number;
  api_used?: string;
  foods: FoodItem[];
}

export interface FoodItem {
  id?: number;
  name: string;
  brand?: string;
  barcode?: string;
  nutrition?: Nutrition;
  hasNutrition: boolean;
  source: 'local' | 'api' | 'auto-cached' | 'search_a_licious';
  available_offline: boolean;
  nutriscore_grade?: string;
}

export interface BarcodeSearchResponse {
  barcode: string;
  found: boolean;
  source?: 'local' | 'api' | 'auto-cached';
  food?: FoodItem;
  message?: string;
  error?: string;
}

// Error response type
export interface ApiError {
  error: string;
  suggestion?: string;
  example?: string;
}

// Meal-related types (for your existing methods)
export interface Meal {
  id: number;
  userId: number;
  date: string;
  // Add other meal properties as needed
}

export interface NutritionSummary {
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  date: string;
  // Add other summary properties
}