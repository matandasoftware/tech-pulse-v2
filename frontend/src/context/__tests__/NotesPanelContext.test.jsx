import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { NotesPanelProvider, useNotesPanel } from '../NotesPanelContext'

describe('NotesPanelContext', () => {
  it('provides initial state', () => {
    const { result } = renderHook(() => useNotesPanel(), {
      wrapper: NotesPanelProvider
    })

    expect(result.current.isOpen).toBe(false)
    expect(result.current.currentArticle).toBeNull()
  })

  it('opens panel with article', () => {
    const { result } = renderHook(() => useNotesPanel(), {
      wrapper: NotesPanelProvider
    })

    const mockArticle = { id: 123, title: 'Test Article' }

    act(() => {
      result.current.openPanel(mockArticle)
    })

    expect(result.current.isOpen).toBe(true)
    expect(result.current.currentArticle).toEqual(mockArticle)
  })

  it('closes panel', () => {
    const { result } = renderHook(() => useNotesPanel(), {
      wrapper: NotesPanelProvider
    })

    const mockArticle = { id: 123, title: 'Test Article' }

    act(() => {
      result.current.openPanel(mockArticle)
    })

    expect(result.current.isOpen).toBe(true)

    act(() => {
      result.current.closePanel()
    })

    expect(result.current.isOpen).toBe(false)
  })
})
