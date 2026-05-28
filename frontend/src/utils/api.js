const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Custom request helper that handles JWT injection and error standardisation.
 */
async function request(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;
  
  // Set up default headers
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  // Inject JWT token if stored
  const token = localStorage.getItem('access_token');
  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);
    
    // Parse JSON safely
    let data = null;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    }

    if (!response.ok) {
      // Handle unauthorized automatically (e.g. token expired)
      if (response.status === 401) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('username');
        if (!endpoint.includes('/auth/token/')) {
          window.dispatchEvent(new Event('auth-expired'));
        }
      }
      
      const errorMsg = data 
        ? (typeof data === 'object' ? JSON.stringify(data) : data) 
        : `Request failed with status ${response.status}`;
      throw new Error(errorMsg);
    }

    return data;
  } catch (error) {
    console.error(`API Error on ${endpoint}:`, error);
    throw error;
  }
}

export const api = {
  // Register a new user
  register: async (username, email, password, passwordConfirm) => {
    return request('/api/auth/register/', {
      method: 'POST',
      body: JSON.stringify({
        username,
        email,
        password,
        password_confirm: passwordConfirm,
      }),
    });
  },

  // Log in user and obtain JWT tokens
  login: async (username, password) => {
    const data = await request('/api/auth/token/', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    
    if (data.access) {
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      localStorage.setItem('username', username);
    }
    return data;
  },

  // Log out user by clearing storage
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('username');
  },

  // Check if currently authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('access_token');
  },

  // Get current username
  getUsername: () => {
    return localStorage.getItem('username') || '';
  },

  // Perform AI rewrite or summarisation
  rewrite: async (text, mode, tone = 'default', length = 'same') => {
    return request('/api/rewrite/', {
      method: 'POST',
      body: JSON.stringify({ text, mode, tone, length }),
    });
  },

  // Retrieve user history
  getHistory: async () => {
    return request('/api/history/', {
      method: 'GET',
    });
  },
};
