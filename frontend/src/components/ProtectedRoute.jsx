import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children, role }) => {
    const { user, token } = useContext(AuthContext);

    if (!token) {
        return <Navigate to="/login" />;
    }

    if (role && user?.role !== role) {
        return <Navigate to={user?.role === 'ADMIN' ? '/admin' : '/dashboard'} />;
    }

    return children;
};

export default ProtectedRoute;
