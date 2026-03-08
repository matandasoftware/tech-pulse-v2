import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { AuthProvider, useAuth } from '../AuthContext'
import { mockUser } from '../../test/mocks/api'

vi.mock('../../services/api', () => ({
  default: {
    post: vi.fn(() => Promise.resolve({
      data: {
        user: mockUser,
        token: 'test-token'
      }
    })),
  }
}))

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('provides initial auth state', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider
    })

    expect(result.current.user).toBeNull()
    expect(result.current.loading).toBe(false)
  })

  it('updates state on login', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider
    })

    act(() => {
      result.current.login(mockUser)
    })

    expect(result.current.user).toEqual(mockUser)
  })

  it('clears state on logout', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider
    })

    act(() => {
      result.current.login(mockUser)
    })

    expect(result.current.user).toEqual(mockUser)

    act(() => {
      result.current.logout()
    })

    expect(result.current.user).toBeNull()
  })
})

