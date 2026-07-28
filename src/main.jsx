import React from 'react'
import { createRoot } from 'react-dom/client'
import { LocationProvider } from './context/LocationContext'
import { AuthProvider } from './context/AuthContext'
import { BrowserRouter } from 'react-router-dom'
import AppRoutes from './AppRoutes'
import './index.css'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <LocationProvider><AppRoutes /></LocationProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
