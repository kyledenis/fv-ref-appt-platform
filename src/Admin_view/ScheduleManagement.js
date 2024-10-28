import React, { useState } from "react";
import HomePage from "./HomePage";
import MatchAssignment from "./MatchAssignment";
import Referee from "./Referee";
import Venue from "./Venue";
import 'D:/CAP_FV_Appointment_Platform/fv-appt-platform/src/App.css'; //add
import Header from "../Header";

const ScheduleManagement = () => {
    const [selectedRefereeID, setSelectedRefereeID]=useState(null);
    const [activeTab, setActiveTab] = useState("Home");
    const [selectedMatchID, setSelectedMatchID] = useState(null);
    const navTabs = ["Home", "Venue", "Match", "Referee"]

    const handleTabClick=(tab)=>{
        setActiveTab(tab);
        setSelectedMatchID(null);
    };

    const handleCardClick=(id)=>{
        setActiveTab("Match");
        setSelectedMatchID(id);
    }

    const handleRefereeDetailClick=(refereeID)=>{
        setActiveTab("Referee");
        setSelectedRefereeID(refereeID);
    }

    const renderContent=(iCards)=>{
        switch (activeTab){
            case "Home":
                return <HomePage iCards={iCards} onCardClick={handleCardClick}/>;
            case "Venue":
                return <Venue/>;
            case "Match":
                return <MatchAssignment 
                    iCards={iCards} 
                    selectedMatchID={selectedMatchID} 
                    refereeCards={refereeCards} 
                    onRefereeDetailClick={handleRefereeDetailClick}/>;
            case "Referee":
                return <Referee 
                    refereeCards={refereeCards} 
                    selectedRefereeID={selectedRefereeID}/>;
            default:
                return null;
        }
    }

    const refereeCards = [
        {
            refereeID: 200,
            refereeName: "Chris Hemworth",
            refereeGender: "Male",
            status: "Available",
            refereeExperience: 10,
            refereeDob: "08/11/1983",
            refereeLevel: "3"
        },
        {
            refereeID: 201,
            refereeName: "Hugh Jackman",
            refereeGender: "Male",
            status: "Available",
            refereeExperience: 12,
            refereeDob: "10/12/1968",
            refereeLevel: "3"
        },
        {
            refereeID: 202,
            refereeName: "Margot Robbie",
            refereeGender: "Female",
            status: "Available",
            refereeExperience: 8,
            refereeDob: "07/02/1990",
            refereeLevel: "2"
        },
        {
            refereeID: 203,
            refereeName: "Sam Kerr",
            refereeGender: "Female",
            status: "Unavailable",
            refereeExperience: 12,
            refereeDob: "09/10/1993",
            refereeLevel: "4"
        },
        {
            refereeID: 204,
            refereeName: "Liam Hemworth",
            refereeGender: "Male",
            status: "Available",
            refereeExperience: 10,
            refereeDob: "08/11/1983",
            refereeLevel: "2"
        },
        {
            refereeID: 205,
            refereeName: "Cate Blanchett",
            refereeGender: "Female",
            status: "Unavailable",
            refereeExperience: 9,
            refereeDob: "14/05/1969",
            refereeLevel: "1"
        },
    ]
    const iCards = [
        {
            id: 1,
            venueID: 100,
            refereeID: "",
            venueName: "Marvel Stadium",
            status: "Not Assigned",
            time: "10am - 12pm",
            date: "07/07/2023", 
            location: "Lorem ipsum dolor sit amet, consectetuer adipiscing elit."
        }, 
        {
            id: 2,
            venueID: 101,
            refereeID: 201,
            venueName: "Melbourne Cricket Ground",
            status: "Declined",
            time: "10am - 12pm",
            date: "07/07/2023", 
            location: "Lorem ipsum dolor sit amet, consectetuer adipiscing elit."
        }, 
        {
            id: 3,
            venueID: 103,
            refereeID: 203,
            venueName: "Docklands Stadium",
            status: "Confirmed",
            time: "10am - 12pm",
            date: "07/07/2023", 
            location: "Lorem ipsum dolor sit amet, consectetuer adipiscing elit."
        }, 
        {
            id: 4,
            venueID: 104,
            refereeID: 202,
            venueName: "Adelaide Oval Stadium",
            status: "Confirmed",
            time: "10am - 12pm",
            date: "07/07/2023", 
            location: "Lorem ipsum dolor sit amet, consectetuer adipiscing elit."
        }, 
        {
            id: 5,
            venueID: 105,
            refereeID: 203,
            venueName: "Adelaide Oval Stadium",
            status: "Pending",
            time: "10am - 12pm",
            date: "07/07/2023", 
            location: "Lorem ipsum dolor sit amet, consectetuer adipiscing elit."
        },
        {
            id: 6,
            venueID: 105,
            refereeID: 203,
            venueName: "Adelaide Oval Stadium",
            status: "Confirmed",
            time: "10am - 12pm",
            date: "07/07/2023", 
            location: "Lorem ipsum dolor sit amet, consectetuer adipiscing elit."
        },
        {
            id: 7,
            venueID: 105,
            refereeID: 203,
            venueName: "Adelaide Oval Stadium",
            status: "Pending",
            time: "10am - 12pm",
            date: "07/08/2023", 
            location: "Lorem ipsum dolor sit amet, consectetuer adipiscing elit."
        },
        {
            id: 8,
            venueID: 105,
            refereeID: 203,
            venueName: "Adelaide Oval Stadium",
            status: "Confirmed",
            time: "10am - 12pm",
            date: "07/09/2023", 
            location: "Lorem ipsum dolor sit amet, consectetuer adipiscing elit."
        },
        {
            id: 9,
            venueID: 105,
            refereeID: 203,
            venueName: "Adelaide Oval Stadium",
            status: "Declined",
            time: "10am - 12pm",
            date: "07/10/2023", 
            location: "Lorem ipsum dolor sit amet, consectetuer adipiscing elit."
        },
        {
            id: 10,
            venueID: 105,
            refereeID: 203,
            venueName: "Adelaide Oval Stadium",
            status: "Pending",
            time: "10am - 12pm",
            date: "07/11/2023", 
            location: "Lorem ipsum dolor sit amet, consectetuer adipiscing elit."
        },
    ]
    return (
        <div>
            <Header />
            <nav className="bg-fvBottomHeader text-white z-10">
                {navTabs.map(tab => 
                <button
                key={tab}
                onClick={() => handleTabClick(tab)}
                className={`py-2 px-4 ${tab === activeTab ? "currentActive" : "" }`}>
                    {tab}
                </button>)}
            </nav>
            <main className="container mx-auto mt-6 grid grid-cols-3 gap-6">
                <div className="col-span-2">{renderContent(iCards)}</div>
                <div className="col-span-1">
                <h2 className="title text-xl font-semibold ml-5 mb-5 text-left">News and Messages</h2>
                    <div className="bg-white shadow rounded-lg p-4 m-4 mt-9 ">
                        <p className="text-gray-500">There are no messages to display.</p>
                    </div>
                </div>
                
            </main>
        </div>
    );
};

export default ScheduleManagement;