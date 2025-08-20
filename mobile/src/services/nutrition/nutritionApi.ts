import * as SecureStore from 'expo-secure-store'

const API_BASE_URL = 'http://10.0.0.17:8092';

export class NutritionApiService {
    static async getAuthHeaders() {
        const token = await SecureStore.getItemAsync('access_token');

        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        return headers;
    }

    static async authenticatedFetch(url: string, options: RequestInit = {}) {
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
            // Token might be expired, try to refresh
            // You could trigger refresh logic here
            throw new Error('Authentication required');
        }

        return response;
    }

    static async getTodayMeals(userId: number) {
        const response = await this.authenticatedFetch(`/api/meals/today?userId=${userId}`)
        return response.json()
    }

    static async getMealsByDate(userId: number, date: string) {
        const response = await this.authenticatedFetch(`/api/meals/${date}?userId=${userId}`)
        return response.json()
    }

    static async getTodayNutritionSummary(userId: number) {
        const response = await this.authenticatedFetch(`/api/meals/summary/today?userId=${userId}`)
        return response.json()
    }

    static async getNutritionSummaryByDate(userId: number, date: string) {
        const response = await this.authenticatedFetch(`/api/meals/summary/${date}?userId=${userId}`)
        return response.json()
    }
}

