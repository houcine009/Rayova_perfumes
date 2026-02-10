import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios';

const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && envUrl.startsWith('http')) return envUrl;

  if (typeof window !== 'undefined') {
    const { hostname, protocol, port } = window.location;

    // If we're on a standard dev port but backend is usually 8000
    if ((port === '8080' || port === '5173' || port === '8081') && (hostname === 'localhost' || hostname === '127.0.0.1')) {
      return `http://localhost:8000/api`;
    }

    // Default to the same origin's /api
    return `${protocol}//${hostname}${port ? ':' + port : ''}/api`;
  }

  return '/api';
};

const API_BASE_URL = getApiBaseUrl();
console.log('[API] Base URL:', API_BASE_URL);

interface ApiResponse<T = unknown> {
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

class ApiClient {
  private axiosInstance: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('auth_token');

    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      withCredentials: false,
      headers: {
        'Accept': 'application/json',
      },
    });

    // Request interceptor for auth token
    this.axiosInstance.interceptors.request.use(
      (config) => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.axiosInstance.interceptors.response.use(
      (response) => response.data,
      (error) => {
        const status = error.response?.status;
        const data = error.response?.data;

        console.error('[API Error]', {
          url: error.config?.url,
          status,
          message: data?.message || error.message,
          errors: data?.errors,
          data
        });

        let message = data?.message || error.message || 'Une erreur est survenue';

        // Handle validation errors (422)
        if (status === 422 && data?.errors) {
          const firstErrorKey = Object.keys(data.errors)[0];
          const firstErrorMessage = data.errors[firstErrorKey][0];
          message = `${message}: ${firstErrorMessage}`;
        }

        const customError = new Error(message);
        (customError as any).response = error.response;
        (customError as any).status = status;
        (customError as any).validationErrors = data?.errors;
        return Promise.reject(customError);
      }
    );
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  getToken(): string | null {
    return this.token;
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    return this.axiosInstance.get<any, T>(endpoint, { params });
  }

  async post<T>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const isFormData = data instanceof FormData || (data && typeof data.append === 'function');
    const requestConfig = { ...config };

    if (isFormData) {
      // For FormData, we MUST NOT set Content-Type header manually
      // so the browser can set it with the correct boundary string.
      if (requestConfig.headers) {
        delete requestConfig.headers['Content-Type'];
      }
    } else if (data && typeof data === 'object' && !(requestConfig.headers && requestConfig.headers['Content-Type'])) {
      // Default to JSON for plain objects if not specified
      requestConfig.headers = {
        ...requestConfig.headers,
        'Content-Type': 'application/json',
      };
    }

    return this.axiosInstance.post<any, T>(endpoint, data, requestConfig);
  }

  async put<T>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const isFormData = data instanceof FormData || (data && typeof data.append === 'function');
    const requestConfig = { ...config };

    if (isFormData) {
      if (requestConfig.headers) {
        delete requestConfig.headers['Content-Type'];
      }
      // Laravel/PHP handles PUT with files best via POST spoofing
      if (data instanceof FormData && !data.has('_method')) {
        data.append('_method', 'PUT');
      }
      return this.axiosInstance.post<any, T>(endpoint, data, requestConfig);
    }

    if (data && typeof data === 'object' && !(requestConfig.headers && requestConfig.headers['Content-Type'])) {
      requestConfig.headers = {
        ...requestConfig.headers,
        'Content-Type': 'application/json',
      };
    }

    return this.axiosInstance.put<any, T>(endpoint, data, requestConfig);
  }

  async delete<T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
    return this.axiosInstance.delete<any, T>(endpoint, config);
  }

  async upload<T>(endpoint: string, file: File, additionalData?: Record<string, string>): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }
    // For upload method, we also want browser to set boundary
    return this.post<T>(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data', // Will be stripped by post logic above
      },
    });
  }
}

// Export singleton instance
export const api = new ApiClient();

// Export types
export type { ApiResponse, PaginatedResponse };
