const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

class ApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  getToken(): string | null {
    if (this.token) return this.token;
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
    }
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'An error occurred');
    }

    return data;
  }

  // Auth endpoints
  async signIn(email: string, password: string) {
    const data = await this.request<{ user: any; token: string }>('/auth/signin', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(data.token);
    return data;
  }

  async signUp(name: string, email: string, password: string) {
    const data = await this.request<{ user: any; token: string }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    this.setToken(data.token);
    return data;
  }

  async signOut() {
    try {
      await this.request('/auth/signout', { method: 'POST' });
    } finally {
      this.setToken(null);
    }
  }

  async getMe() {
    return this.request<{ user: any }>('/auth/me');
  }

  // Bug endpoints
  async getBugs() {
    return this.request<{ bugs: any[] }>('/bugs');
  }

  async getBug(id: string) {
    return this.request<{ bug: any }>(`/bugs/${id}`);
  }

  async createBug(data: { title: string; description: string; severity?: string; priority?: string }) {
    return this.request<{ bug: any }>('/bugs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateBug(id: string, data: { title?: string; description?: string; severity?: string; priority?: string; status?: string }) {
    return this.request<{ bug: any }>(`/bugs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteBug(id: string) {
    return this.request(`/bugs/${id}`, { method: 'DELETE' });
  }

  // User endpoints
  async getUsers() {
    return this.request<{ users: any[] }>('/users');
  }

  async getUser(id: string) {
    return this.request<{ user: any }>(`/users/${id}`);
  }

  async updateProfile(data: { name?: string; status?: string }) {
    return this.request<{ user: any }>('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Admin endpoints
  async getStats() {
    return this.request<{ stats: any }>('/admin/stats');
  }

  async getActivities(limit?: number) {
    const query = limit ? `?limit=${limit}` : '';
    return this.request<{ activities: any[] }>(`/admin/activities${query}`);
  }

  async getAdminUsers() {
    return this.request<{ users: any[] }>('/admin/users');
  }

  async createUser(data: { name: string; email: string; password: string; role?: string }) {
    return this.request<{ user: any }>('/admin/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateUser(id: string, data: { name?: string; email?: string; role?: string; status?: string }) {
    return this.request<{ user: any }>(`/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteUser(id: string) {
    return this.request(`/admin/users/${id}`, { method: 'DELETE' });
  }

  async deleteAdminBug(id: string) {
    return this.request(`/admin/bugs/${id}`, { method: 'DELETE' });
  }
}

export const api = new ApiClient();
export default api;
