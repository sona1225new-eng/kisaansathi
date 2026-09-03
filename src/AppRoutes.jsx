import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import App from './App'
import ProtectedRoute from './components/ProtectedRoute'
import { useAuthContext } from './context/AuthContext'
import LandingPage from './pages/LandingPage'
import MicButton from './components/MicButton'
import { ForgotPasswordPage, LoginPage, RegisterPage, ResetPasswordPage } from './pages/AuthPages'

function HomeRedirect() {
    const { isAuthenticated, ready } = useAuthContext()
    if (!ready) return <div className="min-h-screen grid place-items-center text-green-700">Loading Kisaan Saathi…</div>
    return isAuthenticated ? <Navigate to="/dashboard" replace /> : <LandingPage />
}

export default function AppRoutes() {
    const { isAuthenticated } = useAuthContext()
    return (
        <>
            <Routes>
                <Route path="/" element={<HomeRedirect />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route element={<ProtectedRoute />}>
                    <Route path="/dashboard" element={<App />} />
                    <Route path="/dashboard/*" element={<App />} />
                </Route>
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            {isAuthenticated && <MicButton />}
        </>
    )
}