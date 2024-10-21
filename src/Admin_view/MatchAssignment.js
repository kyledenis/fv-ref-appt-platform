import React, { useState } from "react";
import MatchCard from "./MatchCard";
import AdvancedMatchAssignment from "./AdvancedMatchAssignment";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretDown } from "@fortawesome/free-solid-svg-icons";

const MatchAssignment = (props) => {
    const [statusFilter, setStatusFilter] = useState("");
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);
    const selectedCard = props.iCards.find(card => card.id === props.selectedMatchID);
    // Edit function
    const [selectedEditCard, setSelectedEditCard] = useState(null);

    // Delete function
    const [deletedMatchCards, setDeletedMatchCards] = useState([]);

    // Status filter
    const handleStatusFilter = (status) => {
        setStatusFilter(status);
        setShowStatusDropdown(false); // Hide dropdown after selection
    };

    // Return an array that contains all the satisfied cards excluding the selected card from Home tab.
    const filterRelevantCards = (statusFilter) => {
        return props.iCards.filter(card => {
            if (!selectedCard) {
                // If no card is selected, include all cards that match the status filter
                return statusFilter === "" || card.status.toLowerCase() === statusFilter.toLowerCase();
            } else {
                // If a card is selected, exclude the selected card and match the status filter
                return card.id !== selectedCard.id && 
                       (statusFilter === "" || card.status.toLowerCase() === statusFilter.toLowerCase());
            }
        });
    };

    const relevantCards = filterRelevantCards(statusFilter);

    // Advanced editing match assignment panel visibility
    const [showAdvancedPanel, setShowAdvancedPanel] = useState(false);
    const handleEditClick = (card) => {
        setSelectedEditCard(card);
        setShowAdvancedPanel(true);
    };
    const handleClosePanel = () => {
        setSelectedEditCard(null);
        setShowAdvancedPanel(false);
    };

    // Handle delete click
    const handleDeleteClick = (cardId) => {
        setDeletedMatchCards([...deletedMatchCards, cardId]);
    };

    // Filter out deleted cards
    const filterAllDeletedCards = relevantCards.filter(card => !deletedMatchCards.includes(card.id));

    return (
        <>
            <h1 className="title text-xl font-semibold ml-5 mb-4 text-left">Matches</h1>
            <div className="flex justify-start ml-5 mb-3 relative">
                <button 
                    className="shadow-lg rounded-xl universalButton mr-2 flex items-center" 
                    onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                >
                    Filter by Status<FontAwesomeIcon className="ml-2" icon={faCaretDown} />
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
                {selectedCard && (statusFilter === "" || selectedCard.status === statusFilter) && (
                    <MatchCard 
                        key={selectedCard.id}
                        {...selectedCard}
                        className={"highlight-effect"}
                        hoverable={false}
                        onEditClick={() => handleEditClick(selectedCard)}
                        onShowRefereeDetails={() => props.onRefereeDetailClick(selectedCard.refereeID)}
                        onDeleteClick={() => handleDeleteClick(selectedCard.id)}
                    />
                )}
                {filterAllDeletedCards.map(card => (
                    <MatchCard 
                        key={card.id}
                        {...card}
                        hoverable={false}
                        onEditClick={() => handleEditClick(card)}
                        onShowRefereeDetails={() => props.onRefereeDetailClick(card.refereeID)}
                        onDeleteClick={() => handleDeleteClick(card.id)}
                    />
                ))}
            </div>
            {showAdvancedPanel && (
                <AdvancedMatchAssignment 
                    card={selectedEditCard} 
                    onClose={handleClosePanel} 
                    matchDetails={props.iCards}
                    refereeCards={props.refereeCards} 
                />
            )}
        </>
    );
};

export default MatchAssignment;