// Basic entities matching your Java entities
export interface Food {
  id?: number;
  name: string;
  brand?: string;
  barcode?: string;
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

export interface NutritionSummary {
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  date: string;
  // Add other summary properties
}

export interface LogMealRequest {
    userId: number;
    foodId: number;
    quantityGrams: number;
    mealType: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK' | 'OTHER';
    date?: string; // Optional, defaults to today in backend
    notes?: string;
}

export interface LogMealResponse {
    message: string;
    entry: {
        id: number;
        userId: number;
        foodId: number;
        entryDate: string;
        mealType: string;
        quantityGrams: number;
        notes?: string;
        loggedAt: string;
        nutrition: {
            calories: number;
            protein: number;
            carbs: number;
            fat: number;
            fiber?: number;
            sugar?: number;
            sodium?: number;
        };
    };
}

export interface DeleteMealResponse {
    message: string;
    entryId: number;
}

export interface UserMealSummary {
  message: string;
  date: string;
  userId: number;
  mealCount: number;
  meals: Meal[]
}

export interface Meal {
  nutrition: Nutrition;
  notes?: string;
  quantityGrams: number;
  loggedAt: Date;
  mealType: string;
  foodId: number;
  food: Food
}
