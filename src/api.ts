import { User, Event, Project, Announcement, Opportunity, Resource, AuthResponse } from './types';


const TOKEN_KEY = 'iet_auth_token';

let memoryToken: string | null = null;

export function getCookie(name: string): string | null {
  try {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
  } catch (e) {
    console.warn('Cookie access denied:', e);
  }
  return null;
}

export function setCookie(name: string, value: string, days?: number): void {
  try {
    let expires = "";
    if (days) {
      const date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + value + expires + "; path=/; SameSite=Strict; Secure";
  } catch (e) {
    console.warn('Cookie write denied:', e);
  }
}

function eraseCookie(name: string): void {
  try {
    document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Strict; Secure';
  } catch (e) {
    console.warn('Cookie delete failed:', e);
  }
}

export function getStoredToken(): string | null {
  return getCookie(TOKEN_KEY) || memoryToken;
}

export function setStoredToken(token: string, remember: boolean = true): void {
  memoryToken = token;
  setCookie(TOKEN_KEY, token, remember ? 7 : undefined);
}

export function removeStoredToken(): void {
  memoryToken = null;
  eraseCookie(TOKEN_KEY);
}

function getAuthHeaders(): HeadersInit {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// In-memory cache & request deduplication for optimized APIs
const apiCache = new Map<string, { timestamp: number; data: any }>();
const inFlightRequests = new Map<string, Promise<any>>();
const CACHE_TTL = 30000; // 30 seconds TTL

async function fetchWithCache<T>(url: string): Promise<T> {
  const now = Date.now();
  const cached = apiCache.get(url);
  if (cached && now - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  if (inFlightRequests.has(url)) {
    return inFlightRequests.get(url);
  }
  const promise = fetch(url).then(res => res.json()).then(data => {
    apiCache.set(url, { timestamp: Date.now(), data });
    inFlightRequests.delete(url);
    return data;
  }).catch(err => {
    inFlightRequests.delete(url);
    throw err;
  });
  inFlightRequests.set(url, promise);
  return promise;
}

export function invalidateApiCache(url?: string): void {
  if (url) {
    apiCache.delete(url);
  } else {
    apiCache.clear();
  }
}

export const api = {
  // Auth
  async register(data: {
    username: string;
    email: string;
    password: string;
    phone?: string;
    gender?: string;
    dob?: string;
    city?: string;
    institution?: string;
  }): Promise<AuthResponse> {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (json.success && json.token) {
      setStoredToken(json.token);
    }
    return json;
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const json = await res.json();
    if (json.success && json.token) {
      setStoredToken(json.token);
    }
    return json;
  },

  async getMe(): Promise<{ success: boolean; user?: User; message?: string }> {
    const token = getStoredToken();
    if (!token) return { success: false, message: 'No token' };

    const res = await fetch('/api/auth/me', {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async updateProfile(profileData: Partial<User>): Promise<{ success: boolean; user?: User; message?: string }> {
    const res = await fetch('/api/users/profile', {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(profileData),
    });
    return res.json();
  },

  // Directory
  async getMembers(): Promise<{ success: boolean; members: User[] }> {
    return fetchWithCache('/api/members');
  },

  // Events
  async getEvents(): Promise<{ success: boolean; events: Event[] }> {
    return fetchWithCache('/api/events');
  },

  async registerEvent(eventId: string): Promise<{ success: boolean; registered?: boolean; event?: Event; message?: string }> {
    invalidateApiCache();
    const res = await fetch(`/api/events/${eventId}/register`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async createEvent(eventData: Partial<Event>): Promise<{ success: boolean; event?: Event; message?: string }> {
    invalidateApiCache();
    const res = await fetch('/api/events', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(eventData),
    });
    return res.json();
  },

  // Projects
  async getProjects(): Promise<{ success: boolean; projects: Project[] }> {
    return fetchWithCache('/api/projects');
  },

  async submitProject(projectData: Partial<Project>): Promise<{ success: boolean; project?: Project; message?: string }> {
    invalidateApiCache();
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(projectData),
    });
    return res.json();
  },

  async toggleLikeProject(projectId: string): Promise<{ success: boolean; liked?: boolean; likesCount?: number; project?: Project }> {
    invalidateApiCache();
    const res = await fetch(`/api/projects/${projectId}/like`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // Announcements
  async getAnnouncements(): Promise<{ success: boolean; announcements: Announcement[] }> {
    return fetchWithCache('/api/announcements');
  },

  // Opportunities
  async getOpportunities(): Promise<{ success: boolean; opportunities: Opportunity[] }> {
    return fetchWithCache('/api/opportunities');
  },

  async createOpportunity(oppData: Partial<Opportunity>): Promise<{ success: boolean; opportunity?: Opportunity; message?: string }> {
    invalidateApiCache();
    const res = await fetch('/api/opportunities', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(oppData),
    });
    return res.json();
  },

  // Resources
  async getResources(): Promise<{ success: boolean; resources: Resource[] }> {
    return fetchWithCache('/api/resources');
  },

  async createResource(resData: Partial<Resource>): Promise<{ success: boolean; resource?: Resource; message?: string }> {
    invalidateApiCache();
    const res = await fetch('/api/resources', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(resData),
    });
    return res.json();
  },

  // Batch dashboard optimization
  async getDashboardSummary() {
    const [events, projects, announcements, opportunities, resources] = await Promise.all([
      fetchWithCache<{ success: boolean; events: Event[] }>('/api/events'),
      fetchWithCache<{ success: boolean; projects: Project[] }>('/api/projects'),
      fetchWithCache<{ success: boolean; announcements: Announcement[] }>('/api/announcements'),
      fetchWithCache<{ success: boolean; opportunities: Opportunity[] }>('/api/opportunities'),
      fetchWithCache<{ success: boolean; resources: Resource[] }>('/api/resources'),
    ]);
    return {
      events: events.events || [],
      projects: projects.projects || [],
      announcements: announcements.announcements || [],
      opportunities: opportunities.opportunities || [],
      resources: resources.resources || [],
    };
  }
};

