import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../../test/utils'
import LoginPage from '../LoginPage'

vi.mock('../../services/api', () => ({
  default: {
    post: vi.fn(() => Promise.resolve({
      data: {
        user: { username: 'testuser', email: 'test@example.com' },
        token: 'test-token'
      }
    })),
  }
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  }
})

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders login form', () => {
    renderWithProviders(<LoginPage />)

    expect(screen.getByPlaceholderText(/username/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument()
  })

  it('allows typing in username field', async () => {
    const user = userEvent.setup()
    renderWithProviders(<LoginPage />)

    const usernameInput = screen.getByPlaceholderText(/username/i)
    await user.type(usernameInput, 'testuser')

    expect(usernameInput).toHaveValue('testuser')
  })

  it('allows typing in password field', async () => {
    const user = userEvent.setup()
    renderWithProviders(<LoginPage />)

    const passwordInput = screen.getByPlaceholderText(/password/i)
    await user.type(passwordInput, 'password123')

    expect(passwordInput).toHaveValue('password123')
  })

  it('has link to register page', () => {
    renderWithProviders(<LoginPage />)

    const registerLink = screen.getByText(/register here/i)
    expect(registerLink).toBeInTheDocument()
  })
})
