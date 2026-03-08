import { render } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '../context/AuthContext'
import { NotesPanelProvider } from '../context/NotesPanelContext'
import { DarkModeProvider } from '../context/DarkModeContext'

export function renderWithProviders(ui, options = {}) {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <DarkModeProvider>
          <NotesPanelProvider>
            {ui}
          </NotesPanelProvider>
        </DarkModeProvider>
      </AuthProvider>
    </BrowserRouter>,
    options
  )
}

export * from '@testing-library/react'


