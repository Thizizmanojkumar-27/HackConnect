import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Chatroom from './pages/Chatroom';
import Users from './pages/Users';
import Profile from './pages/Profile';
import AdminRegister from './pages/AdminRegister';
import LandingPage from './pages/LandingPage';

const AppLayout = () => {
    const location = useLocation();
    const isFullScreenPage = ['/', '/login', '/register', '/admin'].includes(location.pathname);

    if (isFullScreenPage) {
        return (
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                {/* Fallbacks */}
                <Route path="/admin/register" element={<ProtectedRoute role="ADMIN"><AdminRegister /></ProtectedRoute>} />
                <Route path="/dashboard" element={<ProtectedRoute role="USER"><UserDashboard /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
                <Route path="/admin" element={<ProtectedRoute role="ADMIN"><AdminDashboard /></ProtectedRoute>} />
                <Route path="/chat" element={<ProtectedRoute><Chatroom /></ProtectedRoute>} />
            </Routes>
        );
    }

    return (
        <div className="min-vh-100 d-flex flex-column">
            <Navbar />
            <div className={['/dashboard', '/chat', '/users', '/profile'].includes(location.pathname) ? "w-100 flex-grow-1" : "container mt-4 flex-grow-1"}>
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    <Route path="/admin/register" element={
                        <ProtectedRoute role="ADMIN">
                            <AdminRegister />
                        </ProtectedRoute>
                    } />

                    <Route path="/dashboard" element={
                        <ProtectedRoute role="USER">
                            <UserDashboard />
                        </ProtectedRoute>
                    } />

                    <Route path="/profile" element={
                        <ProtectedRoute>
                            <Profile />
                        </ProtectedRoute>
                    } />

                    <Route path="/users" element={
                        <ProtectedRoute>
                            <Users />
                        </ProtectedRoute>
                    } />

                    <Route path="/admin" element={
                        <ProtectedRoute role="ADMIN">
                            <AdminDashboard />
                        </ProtectedRoute>
                    } />

                    <Route path="/chat" element={
                        <ProtectedRoute>
                            <Chatroom />
                        </ProtectedRoute>
                    } />
                </Routes>
            </div>
        </div>
    );
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <AppLayout />
            </Router>
        </AuthProvider>
    );
}

export default App;
