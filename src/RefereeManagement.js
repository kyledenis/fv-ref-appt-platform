import React, { useState, useRef, useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import Dashboard from "./Dashboard";
import Calendar from "./Calendar";
import Teams from "./Teams";
import Profile from "./Profile";
import Settings from "./Settings";
import Venue from "./Venue"; 
import Relative from "./Relative"; 
import LoginPage from "./LoginPage";
import TitleWithBar from "./components/TitleWithBar";
import TimePicker from "./components/TimePicker";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from "axios";
import Availability from "./Availability";

const RefereeManagement = () => {
    const [activeTab, setActiveTab] = useState("dashboard");
    const [appointment, setAppointments] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [availableDates, setAvailableDates] = useState([]);
    const [unavailableDates, setUnavailableDates] = useState([]);
    const [availabilities, setAvailability] = useState([]);
    const [isLoggedIn, setIsLoggedIn] = useState(true);
    const [showDropdown, setShowDropdown] = useState(false);
    const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
    const [availabilityType, setAvailabilityType] = useState(null);
    const availabilityRef = useRef(null);
    const [refereeProfile, setRefereeProfile] = useState({
        "referee_id": null,
        "first_name": null,
        "last_name": null,
        "gender": null,
        "date_of_birth": null,
        "age": null,
        "location": null,
        "zipcode": null,
        "email": null,
        "phone_number": null,
        "experience_years": null,
        "level": null
    })
    const [availabilityData, setAvailabilityData] = useState({
        date: null,
        day: null,
        timeType: "entireDay",
        startTime: null,
        endTime: null,
        type: "available",
        organizations: "all",
    });
    const dropdownRef = useRef(null);
    const modalRef = useRef(null);

    useEffect(() => {
        getFirstRefereeAndAvailability();
    }, []);

    useEffect(() => {
        getAvailabilityForReferee();
    }, [refereeProfile]);

    useEffect(() => {
        availabilityRef.current?.scrollIntoView({ behavior: "smooth" });
      }, [availabilities]);

    const getAvailabilityForReferee = async () => {
        const availability = await axios.get(`http://localhost:8000/api/availability/?referee=${refereeProfile.referee_id}`);
        setAvailability(availability.data);
        console.log(availability.data)
    }
    const getFirstRefereeAndAvailability = async () => {
        const firstReferee = await axios.get("http://localhost:8000/api/referee/1/");
        setRefereeProfile(firstReferee.data);
    }

    const weekDay = {
        "Mon": "Monday",
        "Tue": "Tuesday",
        "Wed": "Wednesday",
        "Thu": "Thursay",
        "Fri": "Friday",
        "Sat": "Saturday",
        "Sun": "Sunday"
    }
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

    const validateField = () => {
        if (!availabilityData.date && !availabilityData.day) {
            toast.error("Availability date or weekday must not be empty", {
                autoClose: 5000,
                pauseOnHover: true,
                closeOnClick: true,
                theme: "dark"
            });
            return false;
        }
        else {
            return true;
        }
    }

    const handleSubmitAvailability = async () => {
        if (!validateField()) {
            return;
        }
        const availability = {
            referee: refereeProfile.referee_id,
            weekday: availabilityData.day?.slice(0, 3),
            availableType: availabilityData.type[0].toUpperCase(),
            start_time: availabilityData.startTime,
            end_time: availabilityData.endTime,
            date: availabilityData.date,
        }
        if (availability.date || availability.weekday) {
            const loading = toast.loading("Please wait...");
            const response = await axios.post("http://localhost:8000/api/availability/", availability);
            console.log(response);
            if (response.status == 201) {
                toast.update(loading, {render: "Submited Successfully", type: "success", isLoading: false, autoClose: 5000, hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    theme: "dark"
                });
                getAvailabilityForReferee();
            }
            else {
                toast.update(loading, {render: "Something went wrong", type: "error", isLoading: false });
            }
        }
        //reset availabilityData
        setAvailabilityData({
            date: null,
            day: null,
            timeType: "entireDay",
            startTime: null,
            endTime: null,
            type: "available",
            organizations: "all",
        })

    }

    const handleUpdateAvailability = () => {
        setShowAvailabilityModal(true);
    };

    const handleAvailabilityTypeSelect = (type) => {
        setAvailabilityType(type);
    };

    const handleAvailabilitySubmit = () => {
        if (availabilityType === "specific" && availabilityData.date) {
            const dateString = availabilityData.date;
            
            if (availabilityData.type === "available") {
                setAvailableDates([dateString]);
                setUnavailableDates((prev) =>
                    prev.filter((date) => date !== dateString),
                );
            } else {
                setUnavailableDates([dateString]);
                setAvailableDates((prev) =>
                    prev.filter((date) => date !== dateString),
                );
            }
        } else if (availabilityType === "general") {
            // TODO: Implement general availability logic
            console.log("General availability updated:", availabilityData);
        }

        validateField();
        setShowAvailabilityModal(false);
        setAvailabilityType(null);

    };

    const renderAvailabilityForm = () => {
        return (
            <div>
                <h4 className="font-semibold mb-2">
                    {availabilityType === "general"
                        ? "Add General Availability"
                        : "Add Specific Availability"}
                </h4>
                {availabilityType === "specific" ? (
                    <div className="mb-4">
                        <label className="block mb-1">
                            Date you are specifically available
                        </label>
                        <input
                            type="date"
                            className="w-full p-2 border rounded"
                            value={availabilityData.date || ""}
                            onChange={(e) =>
                                setAvailabilityData({
                                    ...availabilityData,
                                    date: e.target.value,
                                })
                            }
                        />
                    </div>
                ) : (
                    <div className="mb-4">
                        <label className="block mb-1">
                            Day you are generally available
                        </label>
                        <select
                            className="w-full p-2 border rounded"
                            value={availabilityData.day || ""}
                            onChange={(e) =>
                                setAvailabilityData({
                                    ...availabilityData,
                                    day: e.target.value,
                                })
                            }
                        >
                            <option value="">Select a day</option>
                            <option value="Monday">Monday</option>
                            <option value="Tuesday">Tuesday</option>
                            <option value="Wednesday">Wednesday</option>
                            <option value="Thursday">Thursday</option>
                            <option value="Friday">Friday</option>
                            <option value="Saturday">Saturday</option>
                            <option value="Sunday">Sunday</option>
                        </select>
                    </div>
                )}
                <div className="mb-4">
                    <label className="block mb-1">Time you are available</label>
                    <select
                        className="w-full p-2 border rounded mb-2"
                        value={availabilityData.timeType}
                        onChange={(e) =>
                            setAvailabilityData({
                                ...availabilityData,
                                timeType: e.target.value,
                            })
                        }
                    >
                        <option value="entireDay">For the entire day</option>
                        <option value="from">From</option>
                        <option value="until">Anytime until</option>
                    </select>
                    {availabilityData.timeType !== "entireDay" && (
                        <TimePicker
                            value={
                                availabilityData.timeType === "from"
                                    ? availabilityData.startTime
                                    : availabilityData.endTime
                            }
                            onChange={(time) =>
                                setAvailabilityData({
                                    ...availabilityData,
                                    [availabilityData.timeType === "from"
                                        ? "startTime"
                                        : "endTime"]: time,
                                })
                            }
                        />
                    )}
                </div>
                <div className="mb-4">
                    <label className="block mb-1">Type of availability</label>
                    <select
                        className="w-full p-2 border rounded"
                        value={availabilityData.type}
                        onChange={(e) =>
                            setAvailabilityData({
                                ...availabilityData,
                                type: e.target.value,
                            })
                        }
                    >
                        <option value="available">Available</option>
                        <option value="unavailable">Unavailable</option>
                    </select>
                </div>
                <div className="mb-4">
                    <label className="block mb-1">
                        Where you are available
                    </label>
                    <div>
                        <label className="inline-flex items-center mr-4">
                            <input
                                type="radio"
                                className="form-radio"
                                name="organizations"
                                value="all"
                                checked={
                                    availabilityData.organizations === "all"
                                }
                                onChange={(e) =>
                                    setAvailabilityData({
                                        ...availabilityData,
                                        organizations: e.target.value,
                                    })
                                }
                            />
                            <span className="ml-2">All organisations</span>
                        </label>
                        <label className="inline-flex items-center">
                            <input
                                type="radio"
                                className="form-radio"
                                name="organizations"
                                value="selected"
                                checked={
                                    availabilityData.organizations ===
                                    "selected"
                                }
                                onChange={(e) =>
                                    setAvailabilityData({
                                        ...availabilityData,
                                        organizations: e.target.value,
                                    })
                                }
                            />
                            <span className="ml-2">Selected organisations</span>
                        </label>
                    </div>
                </div>
            </div>
        );
    };

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
            <header className="bg-fvTopHeader text-white p-2">
                <div className="container mx-auto flex justify-between items-center">
                    <h1 className="text-s font-bold">
                        Referee Management Platform
                    </h1>
                </div>
            </header>

            <div className="bg-fvMiddleHeader text-white p-4">
                <div className="container mx-auto flex justify-between items-center">
                    <div className="flex items-center">
                        <img
                            src="/fv-logo-transparent.png"
                            alt="Football Victoria"
                            className="h-16"
                        />
                    </div>
                    <div className="relative" ref={dropdownRef}>
                        <button
                            className="bg-blue-700 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                            onClick={() => setShowDropdown(!showDropdown)}
                        >
                            Logged in as {refereeProfile.first_name + " " + refereeProfile.last_name}
                        </button>
                        {showDropdown && (
                            <div className="absolute right-0 mt-2 py-2 w-48 bg-white rounded-md shadow-xl z-20">
                                <button
                                    className="block px-4 py-2 text-sm capitalize text-gray-700 hover:bg-blue-500 hover:text-white"
                                    onClick={handleLogout}
                                >
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

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
                                    ? "underline"
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