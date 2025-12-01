import { signal } from '@preact/signals';
import type { FunctionalComponent } from 'preact';
import { useEffect } from 'preact/hooks';

interface User {
  id: number;
  email: string;
  name: string;
  avatar_url?: string;
}

const user = signal<User | null>(null);
const isLoading = signal(false);
const error = signal<string | null>(null);

const API_URL = 'http://localhost:8000';

// Check if user is authenticated on load
const checkAuth = async () => {
  const token = localStorage.getItem('auth_token');
  if (!token) return;

  try {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      const userData = await response.json();
      user.value = userData;
    } else {
      localStorage.removeItem('auth_token');
    }
  } catch (err) {
    console.error('Auth check failed:', err);
    localStorage.removeItem('auth_token');
  }
};

const LoginForm: FunctionalComponent = () => {
  useEffect(() => {
    checkAuth();
  }, []);

  const handleEmailLogin = async (e: Event) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    isLoading.value = true;
    error.value = null;

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.get('email'),
          password: formData.get('password'),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('auth_token', data.access_token);
        await checkAuth();
      } else {
        const errorData = await response.json();
        const detail = errorData.detail || 'Login failed';
        
        // Provide more helpful error messages
        if (detail === 'User not found in community') {
          error.value = 'This email is not registered in the AI Builders community. Please join the community first or check if you\'re using the correct email.';
        } else {
          error.value = detail;
        }
      }
    } catch (err) {
      error.value = 'Network error. Please try again.';
      // Don't log sensitive error details
    } finally {
      isLoading.value = false;
    }
  };

  const handleGoogleLogin = async (credential: string) => {
    isLoading.value = true;
    error.value = null;

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
        localStorage.setItem('auth_token', data.access_token);
        await checkAuth();
      } else {
        const errorData = await response.json();
        const detail = errorData.detail || 'Google login failed';
        
        // Provide more helpful error messages
        if (detail === 'User not found in community') {
          error.value = 'This Google account is not registered in the AI Builders community. Please join the community first.';
        } else {
          error.value = detail;
        }
      }
    } catch (err) {
      error.value = 'Network error. Please try again.';
      // Don't log sensitive error details
    } finally {
      isLoading.value = false;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    user.value = null;
  };

  useEffect(() => {
    // Load Google Sign-In script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    script.onload = () => {
      if (window.google) {
        // Use environment variable for Google Client ID, fallback to hardcoded for backward compatibility
        const googleClientId = import.meta.env.PUBLIC_GOOGLE_CLIENT_ID || '695004012662-a3981egieh12pqcbb57sbiug99b48mos.apps.googleusercontent.com';
        
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: (response: any) => handleGoogleLogin(response.credential),
        });

        window.google.accounts.id.renderButton(
          document.getElementById('google-signin-button'),
          { theme: 'outline', size: 'large', width: '350' }
        );
      }
    };

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  if (user.value) {
    return (
      <div class="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
        <div class="text-center">
          {user.value.avatar_url && (
            <img
              src={user.value.avatar_url}
              alt={user.value.name}
              class="w-20 h-20 rounded-full mx-auto mb-4"
            />
          )}
          <h2 class="text-2xl font-bold mb-2">Welcome, {user.value.name}!</h2>
          <p class="text-gray-600 mb-4">{user.value.email}</p>
          <button
            onClick={handleLogout}
            class="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div class="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 class="text-2xl font-bold mb-6 text-center">AI Builders Login</h2>

      {error.value && (
        <div class="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error.value}
        </div>
      )}

      <form onSubmit={handleEmailLogin} class="space-y-4 mb-6">
        <div>
          <label htmlFor="email" class="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            autocomplete="email"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="your@email.com"
          />
        </div>

        <div>
          <label htmlFor="password" class="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            required
            autocomplete="current-password"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading.value}
          class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isLoading.value ? 'Logging in...' : 'Login with Email'}
        </button>
      </form>

      <div class="relative mb-6">
        <div class="absolute inset-0 flex items-center">
          <div class="w-full border-t border-gray-300"></div>
        </div>
        <div class="relative flex justify-center text-sm">
          <span class="px-2 bg-white text-gray-500">Or continue with</span>
        </div>
      </div>

      <div id="google-signin-button" class="flex justify-center"></div>

      <p class="mt-4 text-sm text-gray-600 text-center">
        Only members of{' '}
        <a
          href="https://community.theaibuilders.dev"
          target="_blank"
          rel="noopener noreferrer"
          class="text-blue-600 hover:underline"
        >
          theaibuilders.dev
        </a>{' '}
        can log in.
      </p>
    </div>
  );
};

export default LoginForm;
