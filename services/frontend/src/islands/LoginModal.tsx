import { signal } from '@preact/signals';
import { useEffect } from 'preact/hooks';

const API_URL = 'http://localhost:8000';

// Global signal to control modal visibility
export const showLoginModal = signal(false);

// User state
const user = signal<any>(null);
const error = signal<string | null>(null);
const isLoading = signal(false);

const LoginModal = () => {
  const checkAuth = async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      user.value = null;
      return false;
    }

    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        user.value = userData;
        return true;
      } else {
        localStorage.removeItem('auth_token');
        user.value = null;
        return false;
      }
    } catch (err) {
      console.error('Auth check error:', err);
      user.value = null;
      return false;
    }
  };

  const handleEmailLogin = async (e: Event) => {
    e.preventDefault();
    isLoading.value = true;
    error.value = null;

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

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
        localStorage.setItem('auth_token', data.access_token);
        await checkAuth();
        // Dispatch event to update sidebar button
        window.dispatchEvent(new CustomEvent('authStatusChanged'));
        showLoginModal.value = false; // Close modal on success
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
        // Dispatch event to update sidebar button
        window.dispatchEvent(new CustomEvent('authStatusChanged'));
        showLoginModal.value = false; // Close modal on success
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
    // Dispatch event to update sidebar button
    window.dispatchEvent(new CustomEvent('authStatusChanged'));
    showLoginModal.value = false;
  };

  const closeModal = () => {
    showLoginModal.value = false;
    error.value = null;
  };

  useEffect(() => {
    if (!showLoginModal.value) return;

    // Load Google Sign-In script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    script.onload = () => {
      if (window.google) {
        const googleClientId = import.meta.env.PUBLIC_GOOGLE_CLIENT_ID || '695004012662-a3981egieh12pqcbb57sbiug99b48mos.apps.googleusercontent.com';
        
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: (response: any) => handleGoogleLogin(response.credential),
        });

        window.google.accounts.id.renderButton(
          document.getElementById('google-signin-button-modal'),
          { theme: 'outline', size: 'large', width: '100%' }
        );
      }
    };

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [showLoginModal.value]);

  // Check auth on mount and listen for modal open event
  useEffect(() => {
    checkAuth();
    
    // Listen for custom event to open modal
    const handleOpenModal = () => {
      showLoginModal.value = true;
    };
    
    window.addEventListener('openLoginModal', handleOpenModal);
    
    return () => {
      window.removeEventListener('openLoginModal', handleOpenModal);
    };
  }, []);

  // Close modal on successful authentication
  useEffect(() => {
    if (user.value && showLoginModal.value) {
      // Wait a bit to show success, then close
      const timer = setTimeout(() => {
        showLoginModal.value = false;
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [user.value]);

  if (!showLoginModal.value) return null;

  return (
    <>
      {/* Modal Backdrop */}
      <div
        class="fixed inset-0 bg-transparent z-[9999] flex items-center justify-center p-4"
        onClick={closeModal}
      >
        {/* Modal Content */}
        <div
          class="bg-gray-100 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-gray-300"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <div class="flex justify-end p-4">
            <button
              onClick={closeModal}
              class="text-gray-500 hover:text-gray-700 transition-colors"
              aria-label="Close modal"
            >
              <svg
                class="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div class="px-6 pb-6">
            {user.value ? (
              // Logged in state
              <div class="text-center">
                {user.value.avatar_url && (
                  <img
                    src={user.value.avatar_url}
                    alt={user.value.name}
                    class="w-20 h-20 rounded-full mx-auto mb-4"
                  />
                )}
                <h2 class="text-2xl font-bold mb-2 text-gray-800">Welcome, {user.value.name}!</h2>
                <p class="text-gray-600 mb-4">{user.value.email}</p>
                <button
                  onClick={handleLogout}
                  class="w-full bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              // Login form
              <>
                <h2 class="text-2xl font-bold mb-6 text-center text-gray-800">AI Builders Login</h2>

                {error.value && (
                  <div class="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded">
                    {error.value}
                  </div>
                )}

                <form onSubmit={handleEmailLogin} class="space-y-4 mb-6">
                  <div>
                    <label htmlFor="email-modal" class="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email-modal"
                      name="email"
                      required
                      class="w-full px-3 py-2 bg-white border border-gray-300 text-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent placeholder-gray-400"
                      placeholder="your@email.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="password-modal" class="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      id="password-modal"
                      name="password"
                      required
                      class="w-full px-3 py-2 bg-white border border-gray-300 text-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent placeholder-gray-400"
                      placeholder="••••••••"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading.value}
                    class="w-full bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {isLoading.value ? 'Logging in...' : 'Login with Email'}
                  </button>
                </form>

                <div class="relative mb-6">
                  <div class="absolute inset-0 flex items-center">
                    <div class="w-full border-t border-gray-300"></div>
                  </div>
                  <div class="relative flex justify-center text-sm">
                    <span class="px-2 bg-gray-100 text-gray-600">Or continue with</span>
                  </div>
                </div>

                <div id="google-signin-button-modal" class="flex justify-center"></div>

                <p class="mt-4 text-sm text-gray-600 text-center">
                  Only members of{' '}
                  <a
                    href="https://community.theaibuilders.dev"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-gray-700 hover:underline font-medium"
                  >
                    theaibuilders.dev
                  </a>{' '}
                  can log in.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginModal;
