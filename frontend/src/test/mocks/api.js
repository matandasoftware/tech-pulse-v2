import { vi } from 'vitest'

export const mockArticle = {
  id: 1,
  title: 'Test Article',
  content: 'This is test content for the article.',
  url: 'https://example.com/article',
  source: {
    id: 1,
    name: 'TechCrunch',
    slug: 'techcrunch'
  },
  category: {
    id: 1,
    name: 'Technology',
    slug: 'technology'
  },
  created_at: '2026-03-08T00:00:00Z',
  view_count: 10,
  notes_count: 2,
  state: 'active'
}

export const mockUser = {
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  bio: 'Test bio',
  prefers_dark_mode: false
}

export const mockNote = {
  id: 1,
  article: 1,
  content: 'Great article!',
  is_reviewed: false,
  followup_date: null,
  external_link: '',
  created_at: '2026-03-08T00:00:00Z'
}

export const mockApi = {
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  getArticles: vi.fn(),
  getArticle: vi.fn(),
  getUserArticles: vi.fn(),
  createUserArticle: vi.fn(),
  updateUserArticle: vi.fn(),
  getNotes: vi.fn(),
  createNote: vi.fn(),
  updateNote: vi.fn(),
  deleteNote: vi.fn(),
  getAnalyticsOverview: vi.fn(),
  getAnalyticsTrends: vi.fn(),
  getAnalyticsPreferences: vi.fn(),
}
