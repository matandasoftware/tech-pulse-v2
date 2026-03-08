// frontend/src/components/__tests__/LoadingSkeleton.test.jsx
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { ArticleListSkeleton, ArticleCardSkeleton, StatCardSkeleton } from '../LoadingSkeleton'

describe('LoadingSkeleton', () => {
  it('renders ArticleListSkeleton with default count', () => {
    const { container } = render(<ArticleListSkeleton />)
    const skeletons = container.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBe(6)
  })

  it('renders ArticleListSkeleton with custom count', () => {
    const { container } = render(<ArticleListSkeleton count={5} />)
    const skeletons = container.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBe(5)
  })

  it('renders ArticleCardSkeleton', () => {
    const { container } = render(<ArticleCardSkeleton />)
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('renders StatCardSkeleton', () => {
    const { container } = render(<StatCardSkeleton />)
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
  })
})
