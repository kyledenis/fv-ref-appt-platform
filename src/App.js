import React, { useState } from "react";
import { useAppContext } from "./contexts/AppContext";
import LoginPage from "./pages/LoginPage";
import Header from "./components/Header";
import Navigation from "./components/Navigation";
import Dashboard from "./pages/Dashboard";
import Calendar from "./pages/Calendar";
import RefereeFilter from "./pages/RefereeFilter";
import Teams from "./pages/Teams";
import Venues from "./pages/Venues";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import TitleWithBar from "./components/TitleWithBar";
import AvailabilityModal from "./components/AvailabilityModal";
import CalendarWidget from "./components/CalendarWidget";
import ErrorBoundary from "./components/ErrorBoundary";

const App = () => {
    const { user, logout } = useAppContext();
    const [activeTab, setActiveTab] = useState("dashboard");
    const [showDropdown, setShowDropdown] = useState(false);
    const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);

    if (!user) {
        return <LoginPage />;
    }

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

    return (
        <ErrorBoundary>
            <div className="bg-fvBackground min-h-screen">
                <Header
                    showDropdown={showDropdown}
                    setShowDropdown={setShowDropdown}
                />
                <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
                <main className="container mx-auto mt-6 grid grid-cols-3 gap-6">
                    <section className="col-span-2">{renderContent()}</section>
                    <aside>
                        <div className="mb-4">
                            <TitleWithBar title="Availability" />
                            <button
                                onClick={() => setShowAvailabilityModal(true)}
                                className="bg-fvMiddleHeader hover:underline text-black font-bold py-3 px-4 rounded w-full"
                            >
                                Update Availability
                            </button>
                        </div>
                        <CalendarWidget isWidget={true} />
                        <div className="mt-6">
                            <TitleWithBar title="News and Messages" />
                            <div className="bg-white shadow rounded-lg p-4">
                                <p className="text-gray-500">
                                    There are no messages to display.
                                </p>
                            </div>
                        </div>
                    </aside>
                </main>
                <AvailabilityModal
                    isOpen={showAvailabilityModal}
                    onClose={() => setShowAvailabilityModal(false)}
                />
            </div>
        </ErrorBoundary>
    );
};

export default App;
