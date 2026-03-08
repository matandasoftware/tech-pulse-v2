import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '../../test/utils'
import Navbar from '../Navbar'

vi.mock('../../services/api', () => ({
  default: {
    get: vi.fn(() => Promise.resolve({ data: { overdue: 0 } })),
  }
}))

describe('Navbar', () => {
  it('renders Tech Pulse brand', () => {
    renderWithProviders(<Navbar />)

    expect(screen.getByText(/tech pulse/i)).toBeInTheDocument()
  })

  it('renders navigation links', () => {
    renderWithProviders(<Navbar />)

    expect(screen.getByText(/home/i)).toBeInTheDocument()
  })

  it('has dark mode toggle button', () => {
    renderWithProviders(<Navbar />)

    const buttons = screen.getAllByRole('button')
    const darkModeButton = buttons.find(btn => btn.getAttribute('aria-label') === 'Toggle dark mode')
    expect(darkModeButton).toBeInTheDocument()
  })
})
