// Centralized API utility for all backend calls
const API_BASE_URL =  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: string[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any = null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Refresh access token using refresh token
const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken = localStorage.getItem('refreshToken');

  if (!refreshToken) {
    return null;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    const data = await response.json();

    if (response.ok && data.success && data.data?.accessToken) {
      localStorage.setItem('authToken', data.data.accessToken);
      return data.data.accessToken;
    }

    // Refresh token is invalid or expired, clear tokens
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    return null;
  } catch (error) {
    console.error('Token refresh failed:', error);
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    return null;
  }
};

// Helper function for API calls
export const apiRequest = async <T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  const url = `${API_BASE_URL}/api${endpoint}`;
  const token = localStorage.getItem('authToken');

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  try {
    console.log(`🌐 API Request: ${options.method || 'GET'} ${url}`);
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();
    console.log(`✅ API Response [${endpoint}]:`, { status: response.status, data });

    // Handle token expiration
    if (response.status === 401 && data.message?.includes('expired')) {
      if (isRefreshing) {
        // Wait for the current token refresh to complete
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            // Retry the request with the new token
            return apiRequest<T>(endpoint, options);
          })
          .catch((err) => {
            throw err;
          });
      }

      isRefreshing = true;

      try {
        const newToken = await refreshAccessToken();

        if (newToken) {
          processQueue(null, newToken);
          isRefreshing = false;
          // Retry the original request with new token
          return apiRequest<T>(endpoint, options);
        } else {
          processQueue(new Error('Token refresh failed'), null);
          isRefreshing = false;
          // Redirect to login or dispatch logout event
          window.dispatchEvent(new CustomEvent('auth:logout'));
          throw new Error('Session expired. Please login again.');
        }
      } catch (error) {
        processQueue(error, null);
        isRefreshing = false;
        throw error;
      }
    }

    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }

    return data;
  } catch (error: any) {
    console.error(`❌ API Error [${endpoint}]:`, error);
    throw error;
  }
};

// Convenience methods
export const api = {
  get: <T = any>(endpoint: string) =>
    apiRequest<T>(endpoint, { method: 'GET' }),

  post: <T = any>(endpoint: string, body: any) =>
    apiRequest<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  put: <T = any>(endpoint: string, body: any) =>
    apiRequest<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),

  delete: <T = any>(endpoint: string) =>
    apiRequest<T>(endpoint, { method: 'DELETE' }),
};
