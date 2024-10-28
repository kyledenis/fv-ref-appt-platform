import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAppContext } from "./contexts/AppContext";
import { ToastContainer } from "react-toastify";

// Pages
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import PasswordResetPage from "./pages/PasswordResetPage";
import Dashboard from "./pages/Dashboard";
import Calendar from "./pages/Calendar";
import RefereeFilter from "./pages/RefereeFilter";
import Teams from "./pages/Teams";
import Venues from "./pages/Venues";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";

// Components
import Header from "./components/Header";
import Navigation from "./components/Navigation";
import TitleWithBar from "./components/TitleWithBar";
import AvailabilityModal from "./components/AvailabilityModal";
import CalendarWidget from "./components/CalendarWidget";
import ErrorBoundary from "./components/ErrorBoundary";
import LoadingSpinner from "./components/LoadingSpinner";

const App = () => {
    const { user, loading: authLoading } = useAppContext();
    const [activeTab, setActiveTab] = useState("dashboard");
    const [showDropdown, setShowDropdown] = useState(false);
    const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);

    // Clean up any Google Maps resources when the app unmounts
    useEffect(() => {
        return () => {
            // Clean up Google Maps scripts
            const scripts = document.querySelectorAll(
                'script[src*="maps.googleapis.com"]',
            );
            scripts.forEach((script) => script.remove());

            // Clean up Google Maps objects
            delete window.google;
            delete window.initMap;
        };
    }, []);

    const renderContent = () => {
        switch (activeTab) {
            case "dashboard":
                return <Dashboard />;
            case "calendar":
                return <Calendar />;
            case "referee-filter":
                return <RefereeFilter />;
            case "teams":
                return <Teams />;
            case "venues":
                return <Venues />;
            case "profile":
                return <Profile />;
            case "settings":
                return <Settings />;
            default:
                return <Dashboard />;
        }
    };

    if (authLoading) {
        return <LoadingSpinner fullScreen message="Loading..." />;
    }

    return (
        <ErrorBoundary>
            <div className="bg-fvBackground min-h-screen">
                <ToastContainer
                    position="top-right"
                    autoClose={5000}
                    hideProgressBar={false}
                    newestOnTop
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme="light"
                />

                <Routes>
                    {!user ? (
                        <>
                            <Route path="/login" element={<LoginPage />} />
                            <Route
                                path="/register"
                                element={<RegisterPage />}
                            />
                            <Route
                                path="/reset-password"
                                element={<PasswordResetPage />}
                            />
                            <Route
                                path="/reset-password/:token"
                                element={<PasswordResetPage />}
                            />
                            <Route
                                path="*"
                                element={<Navigate to="/login" replace />}
                            />
                        </>
                    ) : (
                        <>
                            <Route
                                path="/"
                                element={
                                    <div className="min-h-screen flex flex-col">
                                        <Header
                                            showDropdown={showDropdown}
                                            setShowDropdown={setShowDropdown}
                                        />
                                        <Navigation
                                            activeTab={activeTab}
                                            setActiveTab={setActiveTab}
                                        />
                                        <main className="flex-grow container mx-auto mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6 px-4">
                                            <section className="lg:col-span-2">
                                                {renderContent()}
                                            </section>
                                            <aside>
                                                <div className="space-y-6">
                                                    <div>
                                                        <TitleWithBar title="Availability" />
                                                        <button
                                                            onClick={() =>
                                                                setShowAvailabilityModal(
                                                                    true,
                                                                )
                                                            }
                                                            className="bg-fvMiddleHeader hover:bg-gray-100 text-black font-bold py-3 px-4 rounded w-full transition duration-200"
                                                        >
                                                            Update Availability
                                                        </button>
                                                    </div>

                                                    <CalendarWidget
                                                        isWidget={true}
                                                    />

                                                    <div>
                                                        <TitleWithBar title="News and Messages" />
                                                        <div className="bg-white shadow rounded-lg p-4 mb-6">
                                                            <p className="text-gray-500">
                                                                No messages to
                                                                display.
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </aside>
                                        </main>
                                        <AvailabilityModal
                                            isOpen={showAvailabilityModal}
                                            onClose={() =>
                                                setShowAvailabilityModal(false)
                                            }
                                        />
                                    </div>
                                }
                            />
                            <Route
                                path="*"
                                element={<Navigate to="/" replace />}
                            />
                        </>
                    )}
                </Routes>
            </div>
        </ErrorBoundary>
    );
};

export default App;
