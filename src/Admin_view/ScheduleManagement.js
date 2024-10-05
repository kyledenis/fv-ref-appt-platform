import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import HomePage from "./HomePage";
import MatchAssignment from "./MatchAssignment";
import Referee from "./Referee";
import Venue from "./Venue";
import 'D:/CAP_FV_Appointment_Platform/fv-appt-platform/src/App.css'; //add
import Header from "../Header";

const ScheduleManagement = () => {
    const [activeTab, setActiveTab] = useState("Home");
    const navTabs = ["Home", "Venue", "Match", "Referee"]
    const handleTabClick=(tab)=>{
        setActiveTab(tab);
    };
    const renderContent=()=>{
        switch (activeTab){
            case "Home":
                return <HomePage/>;
            case "Venue":
                return <Venue/>;
            case "Match":
                return <MatchAssignment/>;
            case "Referee":
                return <Referee/>;
            default:
                return null;
        }

    }
    return (
        <>
            <Header />
            <nav className="bg-fvBottomHeader text-white">
                {navTabs.map(tab => 
                <button
                key={tab}
                onClick={() => handleTabClick(tab)}
                className={`py-2 px-4 ${tab === activeTab ? "currentActive" : "" }`}>
                    {tab}
                </button>)}
            </nav>
            <main className="container mx-auto mt-6 grid grid-cols-3 gap-6">
                <div className="col-span-2">{renderContent()}</div>
                <div className="bg-white shadow rounded-lg p-4 mt-6">
                        <h2 className="text-xl font-semibold mb-4">
                            News and Messages
                        </h2>
                        <p className="text-gray-500">
                            There are no messages to display.
                        </p>
                </div>
            </main>
        </>
    );
};

export default ScheduleManagement;