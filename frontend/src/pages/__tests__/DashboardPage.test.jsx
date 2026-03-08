import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { renderWithProviders } from '../../test/utils'
import DashboardPage from '../DashboardPage'

vi.mock('../../services/api', () => ({
  default: {
    get: vi.fn(() => Promise.resolve({
      data: {
        counts: {
          total_articles: 100,
          user_articles: 42,
          total_notes: 8,
          total_bookmarks: 15,
          pending_followups: 3,
          completed_followups: 5,
          overdue_followups: 1,
          due_today_followups: 2,
          upcoming_followups: 0,
          reviewed_notes: 6,
          unreviewed_notes: 2,
        },
        total_reading_time: 120,
        top_sources: [],
        top_categories: [],
        upcoming_followups: [],
        notes_timeline: [],
      }
    })),
  }
}))

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders dashboard page', async () => {
    renderWithProviders(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText(/dashboard/i)).toBeInTheDocument()
    })
  })

  it('displays statistics', async () => {
    renderWithProviders(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText(/bookmarks/i)).toBeInTheDocument()
    })
  })
})
