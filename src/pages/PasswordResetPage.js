import React, { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { authService } from "../services/api";
import { toast } from "react-toastify";
import Button from "../components/Button";

// TODO: Implement the PasswordResetPage component
const PasswordResetPage = () => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [resetSent, setResetSent] = useState(false);
    const navigate = useNavigate();
    const { token } = useParams();

    const [newPassword, setNewPassword] = useState({
        password: "",
        confirmPassword: "",
    });

    const handleRequestReset = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await authService.requestPasswordReset(email);
            setResetSent(true);
            toast.success(
                "Password reset instructions have been sent to your email",
            );
        } catch (error) {
            toast.error(
                error.response?.data?.error ||
                    "Failed to request password reset",
            );
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (newPassword.password !== newPassword.confirmPassword) {
            toast.error("Passwords don't match");
            return;
        }

        setLoading(true);
        try {
            await authService.resetPassword(token, newPassword.password);
            toast.success("Password has been reset successfully");
            navigate("/login");
        } catch (error) {
            toast.error(
                error.response?.data?.error || "Failed to reset password",
            );
        } finally {
            setLoading(false);
        }
    };

    if (token) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-fvBackground py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    <div>
                        <img
                            className="mx-auto h-24 w-auto"
                            src="/fv-logo-transparent.png"
                            alt="Football Victoria"
                        />
                        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                            Reset Your Password
                        </h2>
                    </div>

                    <form
                        className="mt-8 space-y-6"
                        onSubmit={handleResetPassword}
                    >
                        <div className="rounded-md shadow-sm -space-y-px">
                            <div>
                                <label htmlFor="password" className="sr-only">
                                    New Password
                                </label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                    placeholder="New Password"
                                    value={newPassword.password}
                                    onChange={(e) =>
                                        setNewPassword((prev) => ({
                                            ...prev,
                                            password: e.target.value,
                                        }))
                                    }
                                    disabled={loading}
                                />
                            </div>
                            <div>
                                <label
                                    htmlFor="confirmPassword"
                                    className="sr-only"
                                >
                                    Confirm Password
                                </label>
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    required
                                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                    placeholder="Confirm Password"
                                    value={newPassword.confirmPassword}
                                    onChange={(e) =>
                                        setNewPassword((prev) => ({
                                            ...prev,
                                            confirmPassword: e.target.value,
                                        }))
                                    }
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full"
                            >
                                {loading
                                    ? "Resetting Password..."
                                    : "Reset Password"}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-fvBackground py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <img
                        className="mx-auto h-24 w-auto"
                        src="/fv-logo-transparent.png"
                        alt="Football Victoria"
                    />
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Reset Password
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Enter your email address and we'll send you instructions
                        to reset your password.
                    </p>
                </div>

                {resetSent ? (
                    <div className="text-center">
                        <div className="rounded-md bg-green-50 p-4 mb-4">
                            <div className="text-sm text-green-700">
                                We've sent you an email with instructions to
                                reset your password. Please check your inbox.
                            </div>
                        </div>
                        <Button
                            onClick={() => navigate("/login")}
                            className="mt-4"
                        >
                            Return to Login
                        </Button>
                    </div>
                ) : (
                    <form
                        className="mt-8 space-y-6"
                        onSubmit={handleRequestReset}
                    >
                        <div className="rounded-md shadow-sm -space-y-px">
                            <div>
                                <label htmlFor="email" className="sr-only">
                                    Email address
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                    placeholder="Email address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full"
                            >
                                {loading
                                    ? "Sending Reset Link..."
                                    : "Send Reset Link"}
                            </Button>
                        </div>

                        <div className="text-center">
                            <Link
                                to="/login"
                                className="font-medium text-blue-600 hover:text-blue-500"
                            >
                                Back to Login
                            </Link>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default PasswordResetPage;
