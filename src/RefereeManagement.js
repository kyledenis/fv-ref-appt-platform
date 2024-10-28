import React, { useState, useRef, useEffect } from "react";
import Header from "./Header"
import Dashboard from "./Dashboard";
import Calendar from "./Calendar";
import Teams from "./Teams";
import Profile from "./Profile";
import Settings from "./Settings";
import Venue from "./Venue"; 
import Relative from "./Relative"; 
import LoginPage from "./LoginPage";
import './App.css'; //add

const RefereeManagement = () => {
    const [activeTab, setActiveTab] = useState("dashboard");
    const [appointment, setAppointments] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);
    const [currentDate, setCurrentDate] = useState(new Date());
    // yyyy-mm-dd
    const [availableDates, setAvailableDates] = useState([
        "2024-09-07",
        "2024-09-14",
        "2024-09-28",
    ]);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);   
    const handleLogout = () => {
        setIsLoggedIn(false);
        setShowDropdown(false);
    };

    const handleLogin = (username) => {
        setIsLoggedIn(true);
    };
    const [isLoggedIn, setIsLoggedIn] = useState(true);
    // yyyy-mm-dd
    const appointments = [
        {
            id: 1,
            competition: "Premier League",
            type: "Match",
            date: "2024-07-25",
            time: "15:00",
            teams: "Team A vs Team B",
            venue: "Stadium A",
            status: "Confirmed",
        },
        {
            id: 2,
            competition: "Cup",
            type: "Final",
            date: "2024-09-14",
            time: "18:00",
            teams: "Team C vs Team D",
            venue: "Stadium B",
            status: "Pending",
        },
        {
            id: 3,
            competition: "League One",
            type: "Match",
            date: "2024-09-21",
            time: "14:00",
            teams: "Team E vs Team F",
            venue: "Stadium C",
            status: "Confirmed",
        },
        {
            id: 4,
            competition: "Championship",
            type: "Match",
            date: "2024-09-28",
            time: "16:00",
            teams: "Team G vs Team H",
            venue: "Stadium D",
            status: "Confirmed",
        },
        {
            id: 5,
            competition: "Premier League",
            type: "Match",
            date: "2024-10-05",
            time: "15:00",
            teams: "Team I vs Team J",
            venue: "Stadium E",
            status: "Pending",
        },
    ];

    const teams = [
        { id: 1, name: "Melbourne City FC", league: "A-League" },
        { id: 2, name: "Melbourne Victory", league: "A-League" },
        { id: 3, name: "Manchester United", league: "A-League" },
    ];

    const handleLogin = (username) => {
        setIsLoggedIn(true);
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
        setShowDropdown(false);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setShowDropdown(false);
            }
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                setShowAvailabilityModal(false);
                setAvailabilityType(null);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const renderContent = () => {
        switch (activeTab) {
            case "dashboard":
                return (
                    <Dashboard
                        appointments={appointments}
                        handleUpdateAvailability={handleUpdateAvailability}
                    />
                );
            case "calendar":
                return (
                    <Calendar
                        currentDate={currentDate}
                        setCurrentDate={setCurrentDate}
                        selectedDate={selectedDate}
                        setSelectedDate={setSelectedDate}
                        availableDates={availableDates}
                        unavailableDates={unavailableDates}
                        handleUpdateAvailability={handleUpdateAvailability}
                    />
                );
            case "teams":
                return <Teams />;
            case "profile":
                return <Profile />;
            case "settings":
                return <Settings />;
            case "venues":  // Add venue tab
                return <Venue />;
            case "relatives":
                return <Relative />;
            default:
                return null;
        }
    };

    if (!isLoggedIn) {
        return <LoginPage onLogin={handleLogin} />;
    }

    return (
        <div className="bg-fvBackground min-h-screen">
            <Header dropdownRef={dropdownRef} setShowDropdown={setShowDropdown} showDropdown={showDropdown} handleLogout={handleLogout}></Header>
            <nav className="bg-fvBottomHeader text-white">
                <div className="container mx-auto flex justify-center">
                    {[
                        "Dashboard",
                        "Calendar",
                        "Teams",
                        "Venues",   // Add Venues to the navigation
                        "Profile",
                        "Settings",
                        "Relatives",
                    ].map((item) => (
                        <button
                            key={item}
                            className={`py-2 px-4 ${
                                activeTab === item.toLowerCase()
                                    ? "currentActive"
                                    : ""
                            }`}
                            onClick={() => setActiveTab(item.toLowerCase())}
                        >
                            {item}
                        </button>
                    ))}
                </div>
            </nav>

            <main className="container mx-auto mt-6 grid grid-cols-3 gap-6">
                {/* Main content: Appointments table */}
                <section className="col-span-2">{renderContent()}</section>
                {/* Sidebar content: Calendar and News */}
                <aside>
                    <div className="mb-4">
                        <TitleWithBar title="Availability" />
                        <button
                            onClick={handleSubmitAvailability}
                            className="bg-fvMiddleHeader hover:underline text-black font-bold py-3 px-4 rounded w-full"
                        >
                            Submit Availability
                        </button>
                    </div>

                    {/* Calendar widget */}
                    <Calendar
                        currentDate={currentDate}
                        setCurrentDate={setCurrentDate}
                        selectedDate={selectedDate}
                        setSelectedDate={setSelectedDate}
                        availableDates={availableDates}
                        unavailableDates={unavailableDates}
                        isWidget={true}
                        handleUpdateAvailability={handleUpdateAvailability}
                    />
                </aside>
            </main>
            <div ref={availabilityRef}>
            <Availability availabilities={availabilities} weekDay={weekDay} getAvailabilityForReferee={getAvailabilityForReferee}/>
            </div>
            {showAvailabilityModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div
                        ref={modalRef}
                        className="bg-white p-6 rounded-lg w-96 relative"
                    >
                        <button
                            onClick={() => {
                                setShowAvailabilityModal(false);
                                setAvailabilityType(null);
                            }}
                            className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
                        >
                            <X size={24} />
                        </button>
                        <h3 className="text-lg font-semibold mb-4">
                            Update Availability
                        </h3>
                        {!availabilityType ? (
                            <div>
                                <button
                                    onClick={() =>
                                        handleAvailabilityTypeSelect("general")
                                    }
                                    className="w-full mb-2 px-4 py-2 bg-blue-500 text-white rounded"
                                >
                                    Update General Availability
                                </button>
                                <button
                                    onClick={() =>
                                        handleAvailabilityTypeSelect("specific")
                                    }
                                    className="w-full px-4 py-2 bg-blue-500 text-white rounded"
                                >
                                    Update Specific Availability
                                </button>
                            </div>
                        ) : (
                            <div>
                                {renderAvailabilityForm()}
                                <div className="flex justify-end">
                                    <button
                                        onClick={() =>
                                            setAvailabilityType(null)
                                        }
                                        className="mr-2 px-4 py-2 border rounded"
                                    >
                                        Back
                                    </button>
                                    <button
                                        onClick={handleAvailabilitySubmit}
                                        className="px-4 py-2 bg-blue-500 text-white rounded"
                                    >
                                        Save
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
            <ToastContainer />
        </div>
    );
};

export default RefereeManagement;