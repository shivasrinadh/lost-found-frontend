import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import App from './App'
import './styles/main.css'

// Ignore benign media play/pause race rejections that can be triggered by rapid route transitions.
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event?.reason
    const isPlayPauseAbort =
      reason?.name === 'AbortError' &&
      typeof reason?.message === 'string' &&
      reason.message.includes('play() request was interrupted by a call to pause()')

    if (isPlayPauseAbort) {
      event.preventDefault()
    }
  })
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1a1a24',
              color: '#f0efe8',
              border: '1px solid rgba(255,255,255,0.10)',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '14px',
              borderRadius: '14px',
            },
            success: { iconTheme: { primary: '#22c55e', secondary: '#0a0a0f' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#0a0a0f' } },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
