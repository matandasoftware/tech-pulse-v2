import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { renderWithProviders } from '../../test/utils'
import ProfilePage from '../ProfilePage'

vi.mock('../../services/api', () => ({
  default: {
    get: vi.fn(() => Promise.resolve({
      data: {
        username: 'testuser',
        email: 'test@example.com',
        bio: 'Test bio',
        dark_mode: false,
        total_bookmarks: 15,
        total_notes: 8,
        total_articles_read: 42
      }
    })),
    patch: vi.fn(() => Promise.resolve({ data: {} })),
    post: vi.fn(() => Promise.resolve({ data: {} })),
  }
}))

describe('ProfilePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders profile page', async () => {
    renderWithProviders(<ProfilePage />)

    await waitFor(() => {
      expect(screen.getByText(/profile/i)).toBeInTheDocument()
    })
  })

  it('displays user information', async () => {
    renderWithProviders(<ProfilePage />)

    await waitFor(() => {
      expect(screen.getByText('testuser')).toBeInTheDocument()
    })
  })
})
