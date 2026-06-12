import React, { useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

export default function ResetPassword() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    // Grab the token from the URL!
    const { resettoken } = useParams();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        // Basic frontend validation
        if (password !== confirmPassword) {
            return setError('Passwords do not match');
        }

        setLoading(true);

        try {
            // Send the NEW password to the backend, attaching the token to the URL
            await axios.put(`https://helpdesk-backend-aer8.onrender.com/api/users/resetpassword/${resettoken}`, { password });

            setSuccess(true);

            // Send them back to the login page after 3 seconds
            setTimeout(() => {
                navigate('/');
            }, 3000);

        } catch (err) {
            setError(err.response?.data?.message || 'Invalid or expired token.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center h-screen bg-slate-50">
            <div className="card w-full max-w-md p-xl">
                <h2 className="text-2xl text-center mb-lg font-bold">Reset Password</h2>

                {success ? (
                    <div className="text-center">
                        <div className="bg-green-100 text-green-800 p-md rounded-md mb-md">
                            Password updated successfully!
                        </div>
                        <p className="text-sm text-muted">Redirecting to login...</p>
                    </div>
                ) : (
                    <>
                        {error && (
                            <div className="bg-red-100 text-red-800 p-sm rounded-md mb-md text-sm text-center">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="flex-col gap-md">
                            <div>
                                <label className="label block mb-xs">New Password</label>
                                <input
                                    type="password"
                                    className="input-field w-full"
                                    placeholder="Enter new password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength="6"
                                />
                            </div>
                            <div>
                                <label className="label block mb-xs">Confirm New Password</label>
                                <input
                                    type="password"
                                    className="input-field w-full"
                                    placeholder="Confirm new password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    minLength="6"
                                />
                            </div>
                            <button type="submit" className="btn btn-primary w-full mt-sm" disabled={loading}>
                                {loading ? 'Updating...' : 'Update Password'}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}