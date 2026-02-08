import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import './i18n'
import axios from 'axios'

// Set up axios defaults
axios.defaults.baseURL =
  import.meta.env.VITE_API_BASE_URL || 'https://chirkut-ghor.onrender.com'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
