import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import App from './App'
import './styles/main.css'

// Ignore benign media play/pause race rejections that can be triggered by rapid route transitions.
// These occur when Framer Motion or Route changes interrupt media playback promises.
if (typeof window !== 'undefined') {
  // Suppress unhandledrejection events
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event?.reason

    // Check for the specific AbortError from play() being interrupted
    const isPlayPauseAbort =
      reason?.name === 'AbortError' &&
      typeof reason?.message === 'string' &&
      reason.message.includes('play() request was interrupted by a call to pause()')

    // Also catch generic AbortErrors that may be from the same source
    const isGenericMediaAbort =
      reason?.name === 'AbortError' &&
      (reason?.message?.includes('abort') || reason?.message?.includes('media'))

    if (isPlayPauseAbort || isGenericMediaAbort) {
      event.preventDefault() // Suppress the error from appearing in console
    }
  })

  // Also suppress console output for this error in development
  if (import.meta.env.DEV) {
    const originalError = console.error
    console.error = function (...args) {
      const errorStr = args?.[0]?.toString?.() || ''
      const isMediaError = errorStr.includes('play() request was interrupted') ||
        (args?.[0]?.name === 'AbortError' && errorStr.includes('abort'))

      if (!isMediaError) {
        originalError.apply(console, args)
      }
    }
  }
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
