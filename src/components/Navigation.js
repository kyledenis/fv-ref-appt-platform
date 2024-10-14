import React from "react";

const Navigation = ({ activeTab, setActiveTab }) => {
    const navItems = [
        "Dashboard",
        "Calendar",
        "Referee Filter",
        "Teams",
        "Venues",
        "Profile",
        "Settings",
    ];

    return (
        <nav className="bg-fvBottomHeader text-white">
            <div className="container mx-auto flex justify-center">
                {navItems.map((item) => (
                    <button
                        key={item}
                        className={`py-2 px-4 ${
                            activeTab === item.toLowerCase().replace(" ", "-")
                                ? "underline"
                                : ""
                        }`}
                        onClick={() =>
                            setActiveTab(item.toLowerCase().replace(" ", "-"))
                        }
                    >
                        {item}
                    </button>
                ))}
            </div>
        </nav>
    );
};

export default Navigation;
