import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = 'http://10.0.0.17:8091';

export class ApiService {
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

  // User profile methods
  static async getUserProfile(userId: number) {
    const response = await this.authenticatedFetch(`/api/users/${userId}`);
    return response.json();
  }

  static async updateUserProfile(userId: number, userData: any) {
    const response = await this.authenticatedFetch(`/api/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
    return response.json();
  }

  static async getFitnessSummary(userId: number) {
    const response = await this.authenticatedFetch(`/api/users/${userId}/fitness-summary`);
    return response.json();
  }
}