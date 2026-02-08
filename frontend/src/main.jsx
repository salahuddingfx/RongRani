import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import './i18n'
import axios from 'axios'

// Set up axios defaults
axios.defaults.baseURL = 'http://localhost:5000'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
