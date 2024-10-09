import React, { useState } from "react";
import MatchCard from "./MatchCard";

const MatchAssignment = (props) => {
    const [statusFilter, setStatusFilter] = useState("");
    const [highlight, setHighlight] = useState(true);
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);

    const selectedCard = props.iCards.find(card => card.id === props.selectedMatchID);

    // highlight state
    const handleCardClick = () => {
        setHighlight(false);
    };
    
    // status filter
    const handleStatusFilter = (status) => {
        setStatusFilter(status);
        setShowStatusDropdown(false); // Hide dropdown after selection
    };

    const filterRelevantCards = (statusFilter) => {
        return props.iCards.filter(card => 
            (statusFilter === "" || card.status.toLowerCase() === statusFilter.toLowerCase())
        );
    };

    const relevantCards = filterRelevantCards(statusFilter);

    return (
        <>
            <h1 className="title text-xl font-semibold ml-5 mb-4 text-left">Matches</h1>
            <div className="flex justify-start ml-5 mb-3 relative">
                <button 
                    className="shadow-lg rounded-xl universalButton mr-2" 
                    onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                >
                    Status
                </button>
                {showStatusDropdown && (
                    <div className="absolute bg-white shadow-lg rounded-md mt-2 w-48 z-10">
                        <button 
                            className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" 
                            onClick={() => handleStatusFilter("Confirmed")}
                        >
                            Confirmed
                        </button>
                        <button 
                            className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" 
                            onClick={() => handleStatusFilter("Pending")}
                        >
                            Pending
                        </button>
                        <button 
                            className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" 
                            onClick={() => handleStatusFilter("Declined")}
                        >
                            Declined
                        </button>
                        <button 
                            className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" 
                            onClick={() => handleStatusFilter("Not Assigned")}
                        >
                            Not Assigned
                        </button>
                        <button 
                            className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" 
                            onClick={() => handleStatusFilter("")}
                        >
                            All
                        </button>
                    </div>
                )}
            </div>
            <div className="grid grid-cols-2">
                {statusFilter === "" && selectedCard && (
                    <MatchCard 
                        key={selectedCard.id}
                        {...selectedCard}
                        className={highlight ? "highlight-effect" : ""}
                        onClick={handleCardClick}
                        hoverable={false}
                    />
                )}
                {relevantCards.map(card => (
                    <MatchCard 
                        key={card.id}
                        {...card}
                        hoverable={false}
                    />
                ))}
            </div>
        </>
    );
};

export default MatchAssignment;