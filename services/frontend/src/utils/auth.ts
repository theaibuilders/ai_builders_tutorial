import { signal } from '@preact/signals';

interface User {
  id: number;
  email: string;
  name: string;
  avatar_url?: string;
}

export const currentUser = signal<User | null>(null);
export const isAuthenticated = signal(false);
export const isLoading = signal(false);

const API_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:8000';

export class AuthService {
  private static TOKEN_KEY = 'auth_token';

  static getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  static setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  static clearToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  static async checkAuth(): Promise<boolean> {
    const token = this.getToken();
    if (!token) {
      currentUser.value = null;
      isAuthenticated.value = false;
      return false;
    }

    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const user = await response.json();
        currentUser.value = user;
        isAuthenticated.value = true;
        return true;
      } else {
        this.clearToken();
        currentUser.value = null;
        isAuthenticated.value = false;
        return false;
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      this.clearToken();
      currentUser.value = null;
      isAuthenticated.value = false;
      return false;
    }
  }

  static async login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    isLoading.value = true;

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        this.setToken(data.access_token);
        await this.checkAuth();
        return { success: true };
      } else {
        const errorData = await response.json();
        return { success: false, error: errorData.detail || 'Login failed' };
      }
    } catch (error) {
      return { success: false, error: 'Network error. Please try again.' };
    } finally {
      isLoading.value = false;
    }
  }

  static async loginWithGoogle(credential: string): Promise<{ success: boolean; error?: string }> {
    isLoading.value = true;

    try {
      const response = await fetch(`${API_URL}/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ credential }),
      });

      if (response.ok) {
        const data = await response.json();
        this.setToken(data.access_token);
        await this.checkAuth();
        return { success: true };
      } else {
        const errorData = await response.json();
        return { success: false, error: errorData.detail || 'Google login failed' };
      }
    } catch (error) {
      return { success: false, error: 'Network error. Please try again.' };
    } finally {
      isLoading.value = false;
    }
  }

  static logout(): void {
    this.clearToken();
    currentUser.value = null;
    isAuthenticated.value = false;
  }

  static async refreshToken(refreshToken: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        this.setToken(data.access_token);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  }
}
