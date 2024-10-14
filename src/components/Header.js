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
                            <span className="font-bold">{user.firstName}</span>
                        </Button>
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
        </>
    );
};

export default Header;