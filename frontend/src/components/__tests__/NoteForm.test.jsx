import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../../test/utils'
import NoteForm from '../NoteForm'

describe('NoteForm', () => {
  const mockOnSave = vi.fn()
  const mockOnCancel = vi.fn()

  it('renders form fields', () => {
    renderWithProviders(
      <NoteForm
        articleId={1}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    )

    expect(screen.getByText(/note content/i)).toBeInTheDocument()
  })

  it('allows typing in content field', async () => {
    const user = userEvent.setup()

    renderWithProviders(
      <NoteForm
        articleId={1}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    )

    const textarea = screen.getByPlaceholderText(/write your thoughts/i)
    await user.type(textarea, 'This is a test note')

    expect(textarea).toHaveValue('This is a test note')
  })

  it('has save and cancel buttons', () => {
    renderWithProviders(
      <NoteForm
        articleId={1}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    )

    expect(screen.getByText(/save note/i)).toBeInTheDocument()
    expect(screen.getByText(/cancel/i)).toBeInTheDocument()
  })

  it('calls onCancel when cancel button clicked', async () => {
    const user = userEvent.setup()

    renderWithProviders(
      <NoteForm
        articleId={1}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    )

    const cancelBtn = screen.getByText(/cancel/i)
    await user.click(cancelBtn)

    expect(mockOnCancel).toHaveBeenCalled()
  })
})
