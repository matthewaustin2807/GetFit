import * as SecureStore from 'expo-secure-store';
import {
    FoodSearchResponse,
    BarcodeSearchResponse,
    Meal,
    NutritionSummary,
    ApiError,
    LogMealRequest,
    LogMealResponse,
    DeleteMealResponse,
    UserMealSummary
} from '../../types/nutrition';

const API_BASE_URL = 'http://10.0.0.208:8092';

export class NutritionApiService {
    static async getAuthHeaders(): Promise<Record<string, string>> {
        const token = await SecureStore.getItemAsync('access_token');

        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        return headers;
    }

    static async authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
        const headers = await this.getAuthHeaders();

        const config: RequestInit = {
            ...options,
            headers: {
                ...headers,
                ...options.headers,
            },
        };

        const response = await fetch(`${API_BASE_URL}${url}`, config);

        // Handle token expiration
        if (response.status === 401) {
            throw new Error('Authentication required');
        }

        if (!response.ok) {
            // Try to parse error response
            try {
                const errorData: ApiError = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            } catch {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        }

        return response;
    }

    // Typed food search
    static async getFoodFromSearch(searchTerm: string, limit: number = 10): Promise<FoodSearchResponse> {
        const encodedSearchTerm = encodeURIComponent(searchTerm);
        const response = await this.authenticatedFetch(`/api/foods/search?q=${encodedSearchTerm}&limit=${limit}`);
        return response.json() as Promise<FoodSearchResponse>;
    }

    // Typed barcode search
    static async getFoodByBarcode(barcode: string): Promise<BarcodeSearchResponse> {
        const response = await this.authenticatedFetch(`/api/foods/barcode/${barcode}`);
        return response.json() as Promise<BarcodeSearchResponse>;
    }

    // Typed meal methods
    static async getTodayMeals(userId: number): Promise<UserMealSummary> {
        const response = await this.authenticatedFetch(`/api/meals/today?userId=${userId}`);
        return response.json() as Promise<UserMealSummary>;
    }

    static async getMealsByDate(userId: number, date: string): Promise<UserMealSummary> {
        const response = await this.authenticatedFetch(`/api/meals/date/${date}?userId=${userId}`);
        return response.json() as Promise<UserMealSummary>;
    }

    static async getTodayNutritionSummary(userId: number): Promise<NutritionSummary> {
        const response = await this.authenticatedFetch(`/api/meals/summary/today?userId=${userId}`);
        return response.json() as Promise<NutritionSummary>;
    }

    static async getNutritionSummaryByDate(userId: number, date: string): Promise<NutritionSummary> {
        const response = await this.authenticatedFetch(`/api/meals/summary/${date}?userId=${userId}`);
        return response.json() as Promise<NutritionSummary>;
    }

    // Log a meal
    static async logMeal(logRequest: LogMealRequest): Promise<LogMealResponse> {
        const response = await this.authenticatedFetch('/api/meals/log', {
            method: 'POST',
            body: JSON.stringify(logRequest),
        });
        return response.json() as Promise<LogMealResponse>;
    }

    // Delete a meal entry
    static async deleteMeal(entryId: number, userId: number): Promise<DeleteMealResponse> {
        const response = await this.authenticatedFetch(`/api/meals/${entryId}?userId=${userId}`, {
            method: 'DELETE',
        });
        return response.json() as Promise<DeleteMealResponse>;
    }

    // Get meals by type (breakfast, lunch, dinner, snack)
    static async getMealsByType(
        userId: number,
        mealType: string,
        date?: string
    ): Promise<Meal[]> {
        const dateParam = date ? `&date=${date}` : '';
        const response = await this.authenticatedFetch(
            `/api/meals/type/${mealType.toLowerCase()}?userId=${userId}${dateParam}`
        );
        return response.json() as Promise<Meal[]>;
    }

    // Get weekly meals
    static async getWeeklyMeals(userId: number, startDate?: string): Promise<Meal[]> {
        const startDateParam = startDate ? `&startDate=${startDate}` : '';
        const response = await this.authenticatedFetch(
            `/api/meals/week?userId=${userId}${startDateParam}`
        );
        return response.json() as Promise<Meal[]>;
    }

    // Get complete food details (with nutrition)
    static async getFoodWithNutrition(foodId: number): Promise<any> {
        const response = await this.authenticatedFetch(`/api/foods/${foodId}/complete`);
        return response.json();
    }
}