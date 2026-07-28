import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { LocationProvider } from './context/LocationContext'
import './index.css'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LocationProvider>
      <App />
    </LocationProvider>
  </React.StrictMode>
)
