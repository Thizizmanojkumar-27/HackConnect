import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const AdminRegister = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/auth/register-admin', { name, email, password });
            navigate('/admin');
        } catch (err) {
            setError(err.response?.data || 'Failed to register. Email might be taken.');
        }
    };

    return (
        <div className="auth-container">
            <h2 className="text-center mb-4 text-warning fw-bold">Admin Portal: Register</h2>
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label className="form-label text-light">Full Name</label>
                    <input type="text"
                        className="form-control form-control-custom border-warning"
                        value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="mb-3">
                    <label className="form-label text-light">Admin Email</label>
                    <input type="email"
                        className="form-control form-control-custom border-warning"
                        value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="mb-4">
                    <label className="form-label text-light">Secure Password</label>
                    <input type="password"
                        className="form-control form-control-custom border-warning"
                        value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <button type="submit" className="btn btn-warning w-100 py-2 fw-bold shadow-sm">Create Admin Account</button>
            </form>
            <div className="text-center mt-4">
                <Link to="/admin" className="text-info text-decoration-none fw-bold">← Back to Dashboard</Link>
            </div>
        </div>
    );
};

export default AdminRegister;
