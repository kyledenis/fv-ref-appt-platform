import React, { useRef } from "react";
import { useAppContext } from "../contexts/AppContext";
import Button from "./Button";

const Header = ({ showDropdown, setShowDropdown }) => {
    const { user, logout } = useAppContext();
    const dropdownRef = useRef(null);

    const handleLogout = () => {
        logout();
        setShowDropdown(false);
    };

    return (
        <>
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
                        <Button
                            onClick={() => setShowDropdown(!showDropdown)}
                            className="bg-blue-700 hover:bg-blue-600 text-white py-2 px-4 rounded"
                        >
                            Logged in as{" "}
                            <span className="font-bold">
                                {user?.first_name || user?.firstName || "User"}
                            </span>
                        </Button>

                        {showDropdown && (
                            <div className="dropdown absolute mt-3 py-2 w-40 bg-fvBackground rounded-md shadow-xl z-20 border border-gray-300">
                                <div className="dropdown-arrow"></div>
                                <button
                                    className="px-10 text-sm text-black flex hover:text-red-700"
                                    onClick={handleLogout}
                                >
                                    <span className="logout-icon mr-2">←</span>
                                    Log Out
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Header;
