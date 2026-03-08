// frontend/src/components/__tests__/ArticleCard.test.jsx
import { describe, it, expect, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { renderWithProviders } from '../../test/utils'
import ArticleCard from '../ArticleCard'

vi.mock('../../services/api', () => ({
  default: {
    get: vi.fn(() => Promise.resolve({ data: { results: [] } })),
    post: vi.fn(() => Promise.resolve({ data: {} })),
  }
}))

const mockArticle = {
  id: 1,
  title: 'Test Article',
  content: 'This is test content',
  source: { name: 'TechCrunch' },
  category: { name: 'Technology' },
  published_at: '2026-03-08T00:00:00Z',
  view_count: 10,
  notes_count: 2
}

describe('ArticleCard', () => {
  it('renders article information', () => {
    renderWithProviders(<ArticleCard article={mockArticle} />)

    expect(screen.getByText('Test Article')).toBeInTheDocument()
    expect(screen.getByText('TechCrunch')).toBeInTheDocument()
    expect(screen.getByText('Technology')).toBeInTheDocument()
  })

  it('shows bookmark button', () => {
    renderWithProviders(<ArticleCard article={mockArticle} />)

    const bookmarkBtn = screen.getByText(/bookmark/i)
    expect(bookmarkBtn).toBeInTheDocument()
  })

  it('shows notes button', () => {
    renderWithProviders(<ArticleCard article={mockArticle} />)

    const notesBtn = screen.getByText(/notes/i)
    expect(notesBtn).toBeInTheDocument()
  })

  it('displays notes count badge when notes exist', async () => {
    renderWithProviders(<ArticleCard article={mockArticle} />)

    await waitFor(() => {
      const badge = screen.queryByText('2')
      expect(badge).toBeInTheDocument()
    })
  })
})
