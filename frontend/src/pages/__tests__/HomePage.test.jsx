import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { renderWithProviders } from '../../test/utils'
import HomePage from '../HomePage'

vi.mock('../../services/api', () => ({
  default: {
    get: vi.fn(() => Promise.resolve({
      data: {
        results: [
          {
            id: 1,
            title: 'Test Article 1',
            content: 'Content 1',
            source: { name: 'TechCrunch' },
            category: { name: 'Tech' },
            published_at: '2026-03-08T00:00:00Z',
            view_count: 10,
            notes_count: 2,
            state: 'active'
          },
          {
            id: 2,
            title: 'Test Article 2',
            content: 'Content 2',
            source: { name: 'The Verge' },
            category: { name: 'AI' },
            published_at: '2026-03-08T00:00:00Z',
            view_count: 5,
            notes_count: 0,
            state: 'active'
          }
        ],
        count: 2,
        next: null,
        previous: null
      }
    })),
  }
}))

describe('HomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders homepage', async () => {
    renderWithProviders(<HomePage />)

    await waitFor(() => {
      expect(screen.getByText('Test Article 1')).toBeInTheDocument()
      expect(screen.getByText('Test Article 2')).toBeInTheDocument()
    })
  })

  it('shows loading skeleton initially', () => {
    renderWithProviders(<HomePage />)

    const skeletons = document.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('displays article cards after loading', async () => {
    renderWithProviders(<HomePage />)

    await waitFor(() => {
      expect(screen.getByText('Test Article 1')).toBeInTheDocument()
    })
  })
})
