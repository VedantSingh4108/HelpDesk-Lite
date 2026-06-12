import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);
        setError(null);

        try {
            // Send the email to our new backend route
            const { data } = await axios.post('https://helpdesk-backend-aer8.onrender.com/api/users/forgotpassword', { email });
            setMessage(data.message);
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center h-screen bg-slate-50">
            <div className="card w-full max-w-md p-xl">
                <h2 className="text-2xl text-center mb-md font-bold">Forgot Password</h2>
                <p className="text-center text-muted mb-lg text-sm">
                    Enter your email address and we will send you a link to reset your password.
                </p>

                {message && (
                    <div className="bg-green-100 text-green-800 p-sm rounded-md mb-md text-sm text-center">
                        {message}
                    </div>
                )}

                {error && (
                    <div className="bg-red-100 text-red-800 p-sm rounded-md mb-md text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex-col gap-md">
                    <div>
                        <label className="label block mb-xs">Email Address</label>
                        <input
                            type="email"
                            className="input-field w-full"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                        {loading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                </form>

                <div className="text-center mt-md">
                    <Link to="/" className="text-sm text-primary hover:underline">
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
}