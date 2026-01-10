// API Client wrapper with base URL from environment
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
}

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    // Load token from localStorage on initialization
    this.token = localStorage.getItem('auth_token');
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
    return this.token || localStorage.getItem('auth_token');
  }

  private buildURL(endpoint: string, params?: Record<string, string>): string {
    const url = new URL(endpoint, this.baseURL);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }
    return url.toString();
  }

  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const { params, ...fetchOptions } = options;
    const url = this.buildURL(endpoint, params);

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Token ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers,
      });

      // Handle 401 Unauthorized - clear token and redirect to login
      if (response.status === 401) {
        this.setToken(null);
        window.location.href = '/login';
        throw new Error('Unauthorized');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.message || `HTTP error! status: ${response.status}`);
      }

      // Handle empty responses
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        return data as T;
      }

      return {} as T;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error');
    }
  }

  async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'GET',
      params,
    });
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

// Auth API helpers
export const authApi = {
  login: async (email: string, password: string) => {
    const response = await apiClient.post<{ token: string }>('/api/auth/login/', {
      email,
      password,
    });
    apiClient.setToken(response.token);
    return response;
  },

  signup: async (data: {
    username: string;
    email: string;
    password: string;
    first_name?: string;
    last_name?: string;
  }) => {
    const response = await apiClient.post<{ token: string; user: any; message: string }>('/api/auth/signup/', data);
    apiClient.setToken(response.token);
    return response;
  },

  logout: async () => {
    await apiClient.post('/api/auth/logout/');
    apiClient.setToken(null);
  },

  getMe: async () => {
    return apiClient.get('/api/me/');
  },
};

// Players API
export const playersApi = {
  getAll: () => apiClient.get('/api/players/'),
  getById: (id: string | number) => apiClient.get(`/api/players/${id}/`),
  getMetrics: (id: string | number) => apiClient.get(`/api/players/${id}/metrics/`),
  getSessions: (id: string | number) => apiClient.get(`/api/players/${id}/sessions/`),
  create: (data: unknown) => apiClient.post('/api/players/', data),
};

// Sessions API
export const sessionsApi = {
  getAll: (week?: string) => 
    apiClient.get('/api/sessions/', week ? { week } : undefined),
  getById: (id: string | number) => apiClient.get(`/api/sessions/${id}/`),
  create: (data: unknown) => apiClient.post('/api/sessions/', data),
};

// Leaderboards API
export const leaderboardsApi = {
  getByType: (type: 'speed' | 'strength' | 'compliance') =>
    apiClient.get('/api/leaderboards/', { type }),
};

// Metrics API
export const metricsApi = {
  create: (data: unknown) => apiClient.post('/api/metrics/', data),
};

// Dashboard API
export const dashboardApi = {
  getSummary: () => apiClient.get<{
    total_sessions_completed: number;
    my_compliance: number;
    current_streak: number;
    my_progress: Array<{
      metric_type: 'strength' | 'speed';
      start_value: number;
      end_value: number;
      pct_change: number;
    }>;
  }>('/api/dashboard/summary/'),
};

// Intake API
export const intakeApi = {
  getMyIntake: () => apiClient.get('/api/intake/my_intake/'),
  checkComplete: () => apiClient.get<{ is_complete: boolean; has_intake: boolean; player_id?: number }>('/api/intake/check_complete/'),
  create: (data: unknown) => apiClient.post('/api/intake/', data),
  update: (id: number, data: unknown) => apiClient.patch(`/api/intake/${id}/`, data),
  getPlayers: () => apiClient.get('/api/players/'),
};

// Programmes API
export const programmesApi = {
  submitIntake: (playerId: number, data: {
    sport: string;
    primary_goal: string;
    training_level: string;
    training_days_per_week: number;
    equipment_access: string;
    injuries: Array<{area: string; severity: string; notes?: string}>;
  }) => apiClient.post<{
    player: any;
    archetype: string;
    suggested_programmes: Array<{
      id: number;
      name: string;
      description: string;
      primary_focus: string;
      difficulty: string;
      duration_weeks: number;
      structure: any;
    }>;
  }>(`/api/players/${playerId}/intake/`, data),
  
  createDraft: (playerId: number, data: {
    programme_template_id: number;
    start_date: string;
    title?: string;
    edits?: {
      focus?: string;
      remove_day?: string;
      low_impact_week1?: boolean;
    };
  }) => apiClient.post(`/api/players/${playerId}/programmes/draft/`, data),
  
  update: (id: number, data: unknown) => 
    apiClient.patch(`/api/programmes/${id}/`, data),
  
  coachApprove: (id: number) => 
    apiClient.post(`/api/programmes/${id}/coach-approve/`),
  
  athleteApprove: (id: number) => 
    apiClient.post(`/api/programmes/${id}/athlete-approve/`),
  
  getPlayerProgrammes: (playerId: number) => 
    apiClient.get(`/api/players/${playerId}/programmes/`),
  getMyProgrammes: () => 
    apiClient.get<Array<{
      id: number;
      title: string;
      status: string;
      start_date: string;
      total_sessions?: number;
      completed_sessions?: number;
      progress_percent?: number;
    }>>('/api/programmes/my-programmes/'),
  commence: (id: number) => 
    apiClient.post<{sessions_created: number; sessions: any[]; message: string}>(`/api/programmes/${id}/commence/`, {}),
  checkCompletion: (id: number) => 
    apiClient.post<{programme: any; total_sessions: number; completed_sessions: number; is_complete: boolean}>(`/api/programmes/${id}/check-completion/`),
};

// Workouts API
export const workoutsApi = {
  recommend: (focus?: string) => 
    apiClient.post<{
      title: string;
      type: string;
      duration: number;
      exercises: Array<{name: string; sets: number; reps: string; rest: string; notes?: string}>;
    }>('/api/workouts/recommend/', focus ? { focus } : {}),
  generate: (workout: {
    title: string;
    type: string;
    duration: number;
    exercises: any[];
  }, date?: string) => 
    apiClient.post('/api/workouts/generate/', { workout, date }),
};

