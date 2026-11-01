/**
 * API service for communicating with QuestSage Great Sage AI backend
 */

import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth tokens
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('questsage_token') || localStorage.getItem('questify_token');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('questsage_token');
      localStorage.removeItem('questify_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Types
export interface AIRequest {
  message: string;
  user_id: number;
  context?: Record<string, any>;
}

export interface AIResponse {
  message: string;
  intent: string;
  confidence: number;
  entities: Array<{
    type: string;
    value: string;
    start_pos: number;
    end_pos: number;
    confidence: number;
    context: Record<string, any>;
  }>;
  contextual_understanding: {
    emotional_state: string;
    energy_level: string;
    urgency_level: string;
    complexity_preference: string;
    domain_focus: string;
    temporal_context: string;
    social_context: string;
    motivation_level: number;
    confidence: number;
  };
  suggestions: string[];
  quest_data?: Record<string, any>;
}

export interface QuestGenerationRequest {
  user_message: string;
  user_id: number;
  available_time?: number;
  energy_level?: string;
  preferences?: Record<string, any>;
}

export interface QuestGenerationResponse {
  quest: {
    title: string;
    description: string;
    quest_type: string;
    difficulty: string;
    domain: string;
    xp_value: number;
    estimated_duration: number;
    subtasks: Array<{
      title: string;
      description: string;
      xp_value: number;
      difficulty: string;
      order_index: number;
      estimated_duration: number;
      personalization_notes?: string;
    }>;
  };
  personalization_data: Record<string, any>;
  ai_confidence: number;
  adaptability_score: number;
  creativity_level: number;
  suggestions: string[];
}

export interface User {
  id: number;
  email: string;
  username: string;
  first_name?: string;
  last_name?: string;
  title?: string;
  level: number;
  xp: number;
  wisdom_points: number;
  streak_days: number;
  is_active: boolean;
  active_quests?: number;
  completed_quests?: number;
  total_quests?: number;
  completion_rate?: number;
  created_at?: string;
}

export interface Quest {
  id: number;
  title: string;
  description: string;
  quest_type: string;
  difficulty: 'easy' | 'normal' | 'hard';
  status: 'not_started' | 'in_progress' | 'completed' | 'abandoned';
  xp_value: number;
  estimated_duration: number;
  actual_duration?: number;
  progress_percentage: number;
  subtasks: Array<{
    id: number;
    text: string;
    completed: boolean;
    weight: number;
  }>;
  personalization_data?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// API Methods
export const questsageAPI = {
  // Health check
  async healthCheck(): Promise<{ status: string; ai_engine: string; timestamp: string }> {
    const response = await api.get('/health');
    return response.data as { status: string; ai_engine: string; timestamp: string };
  },

  // AI Analysis
  async analyzeMessage(request: AIRequest): Promise<AIResponse> {
    const response = await api.post('/api/v1/ai/analyze', request);
    return response.data as AIResponse;
  },

  // Quest Generation
  async generateQuest(request: QuestGenerationRequest): Promise<QuestGenerationResponse> {
    const response = await api.post('/api/v1/ai/generate-quest', request);
    return response.data as QuestGenerationResponse;
  },

  // AI Performance
  async getAIPerformance(): Promise<{
    nlu_engine: Record<string, any>;
    status: string;
    timestamp: string;
  }> {
    const response = await api.get('/api/v1/ai/performance');
    return response.data as {
      nlu_engine: Record<string, any>;
      status: string;
      timestamp: string;
    };
  },

  // User Management
  async registerUser(userData: {
    email: string;
    username: string;
    password: string;
    first_name?: string;
    last_name?: string;
  }): Promise<{
    access_token: string;
    token_type: string;
    user_id: number;
    username: string;
    email: string;
  }> {
    const response = await api.post('/api/v1/auth/register', userData);
    const data = response.data as {
      access_token: string;
      token_type: string;
      user_id: number;
      username: string;
      email: string;
    };
    if (data.access_token) {
      localStorage.setItem('questsage_token', data.access_token);
      localStorage.setItem('questsage_user', JSON.stringify(data));
      localStorage.setItem('questify_token', data.access_token);
    }
    return data;
  },

  async loginUser(credentials: { email: string; password: string }): Promise<{
    access_token: string;
    token_type: string;
    user_id: number;
    username: string;
    email: string;
  }> {
    const response = await api.post('/api/v1/auth/login', credentials);
    const data = response.data as {
      access_token: string;
      token_type: string;
      user_id: number;
      username: string;
      email: string;
    };
    if (data.access_token) {
      localStorage.setItem('questsage_token', data.access_token);
      localStorage.setItem('questsage_user', JSON.stringify(data));
      localStorage.setItem('questify_token', data.access_token);
    }
    return data;
  },

  async getCurrentUser(token?: string): Promise<User> {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await api.get('/api/v1/auth/me', { headers });
    return response.data as User;
  },

  logoutUser(): void {
    localStorage.removeItem('questsage_token');
    localStorage.removeItem('questsage_user');
    localStorage.removeItem('questify_token');
    localStorage.removeItem('questify_user');
  },

  // Quest Management
  async getUserQuests(userId?: number, statusFilter?: string): Promise<Quest[]> {
    const params: Record<string, any> = {};
    if (userId) params.user_id = userId;
    if (statusFilter && statusFilter !== 'all') params.status_filter = statusFilter;
    const response = await api.get(`/api/v1/quests/`, { params });
    return response.data as Quest[];
  },

  async createQuest(userId: number | undefined, questData: {
    title: string;
    description: string;
    quest_type?: string;
    difficulty?: string;
    xp_value?: number;
    estimated_duration?: number;
    subtasks?: Array<any>;
  }): Promise<Quest> {
    const payload = userId ? { ...questData, user_id: userId } : questData;
    const response = await api.post('/api/v1/quests/', payload);
    return response.data as Quest;
  },

  async updateQuest(questId: number, userId: number | undefined, updates: {
    title?: string;
    description?: string;
    status?: string;
    progress_percentage?: number;
    difficulty_rating?: number;
    satisfaction_rating?: number;
    user_feedback?: string;
  }): Promise<Quest> {
    const payload = userId ? { ...updates, user_id: userId } : updates;
    const response = await api.put(`/api/v1/quests/${questId}`, payload);
    return response.data as Quest;
  },

  async deleteQuest(questId: number, userId?: number): Promise<{ message: string }> {
    const params = userId ? { user_id: userId } : {};
    const response = await api.delete(`/api/v1/quests/${questId}`, { params });
    return response.data as { message: string };
  },

  async toggleSubtask(questId: number, subtaskId: number): Promise<Quest> {
    const response = await api.patch(`/api/v1/quests/${questId}/subtasks/${subtaskId}/toggle`);
    return response.data as Quest;
  },

  async claimQuestVictory(questId: number): Promise<{
    message: string;
    quest_id: number;
    xp_earned: number;
    wisdom_earned: number;
    new_xp: number;
    level: number;
    leveled_up: boolean;
  }> {
    const response = await api.post(`/api/v1/quests/${questId}/complete`);
    return response.data as {
      message: string;
      quest_id: number;
      xp_earned: number;
      wisdom_earned: number;
      new_xp: number;
      level: number;
      leveled_up: boolean;
    };
  },

  // User Stats
  async getUserStats(userId?: number): Promise<{
    user_id: number;
    level: number;
    xp: number;
    wisdom_points: number;
    streak_days: number;
    total_quests: number;
    completed_quests: number;
    active_quests: number;
    completion_rate: number;
    last_activity: string;
  }> {
    const endpoint = userId ? `/api/v1/users/${userId}/stats` : '/api/v1/users/stats';
    const response = await api.get(endpoint);
    return response.data as {
      user_id: number;
      level: number;
      xp: number;
      wisdom_points: number;
      streak_days: number;
      total_quests: number;
      completed_quests: number;
      active_quests: number;
      completion_rate: number;
      last_activity: string;
    };
  },

  // Generic GET method for custom endpoints
  async get<T = any>(endpoint: string): Promise<T> {
    const response = await api.get(endpoint);
    return response.data as T;
  },

  // User Profile
  async getUserProfile(): Promise<User> {
    const response = await api.get('/api/v1/users/profile');
    return response.data as User;
  },

  // User Achievements
  async getUserAchievements(): Promise<Array<{
    id: number;
    name: string;
    description: string;
    achieved_at: string;
    icon: string;
  }>> {
    const response = await api.get('/api/v1/users/achievements');
    return response.data as Array<{
      id: number;
      name: string;
      description: string;
      achieved_at: string;
      icon: string;
    }>;
  },

  // User Activity
  async getUserActivity(): Promise<Array<{
    id: number;
    action: string;
    quest_name: string;
    xp_earned: number;
    timestamp: string;
  }>> {
    const response = await api.get('/api/v1/users/activity');
    return response.data as Array<{
      id: number;
      action: string;
      quest_name: string;
      xp_earned: number;
      timestamp: string;
    }>;
  },

  // Recent Quests
  async getRecentQuests(): Promise<Quest[]> {
    const response = await api.get('/api/v1/quests/recent');
    return response.data as Quest[];
  },

  // All Quests
  async getAllQuests(): Promise<Quest[]> {
    const response = await api.get('/api/v1/quests');
    return response.data as Quest[];
  },
};

// Aliased export for backwards compatibility
export const questifyAPI = questsageAPI;

export default questsageAPI;
