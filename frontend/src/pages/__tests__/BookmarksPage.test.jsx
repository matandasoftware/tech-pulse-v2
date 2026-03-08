import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { renderWithProviders } from '../../test/utils'
import BookmarksPage from '../BookmarksPage'

vi.mock('../../services/api', () => ({
  default: {
    get: vi.fn(() => Promise.resolve({
      data: {
        results: [
          {
            id: 1,
            article: {
              id: 1,
              title: 'Bookmarked Article 1',
              content: 'Content 1',
              source: { name: 'TechCrunch' },
              category: { name: 'Tech' },
              published_at: '2026-03-08T00:00:00Z',
              view_count: 10,
              notes_count: 2
            },
            is_bookmarked: true,
            bookmarked_at: '2026-03-08T00:00:00Z'
          }
        ],
        count: 1
      }
    })),
  }
}))

describe('BookmarksPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders bookmarks page', async () => {
    renderWithProviders(<BookmarksPage />)

    await waitFor(() => {
      expect(screen.getByText(/bookmarks/i)).toBeInTheDocument()
    })
  })

  it('displays bookmarked articles', async () => {
    renderWithProviders(<BookmarksPage />)

    await waitFor(() => {
      expect(screen.getByText('Bookmarked Article 1')).toBeInTheDocument()
    })
  })
})
