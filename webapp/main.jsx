import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'  // This line is already present, but I'm including it for clarity

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)