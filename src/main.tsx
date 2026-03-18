import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { PetWindow } from './pages/PetWindow'

const path = window.location.pathname;

if (path === '/pet') {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <PetWindow />
    </StrictMode>,
  )
} else {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}