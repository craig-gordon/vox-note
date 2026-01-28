import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { initializeNeonClient } from '@journaling-app/shared'
import './index.css'
import App from './App.tsx'

const neonUrl = import.meta.env.VITE_NEON_DATABASE_CONNECTION_STRING
if (neonUrl) {
  initializeNeonClient(neonUrl)
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
