import React, { useState } from "react";
import RefereeCard from "./RefereeCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretDown} from "@fortawesome/free-solid-svg-icons";

const Referee = (props) => {
    const selectedRefereeCard=props.refereeCards.find(card => card.refereeID === props.selectedRefereeID)

    // Search function
    const [searchQuery, setSearchQuery] = useState("");
    const [genderFilter, setGenderFilter] = useState("");
    const [levelFilter, setLevelFilter] = useState("");
    const [showGenderDropdown, setShowGenderDropdown] = useState(false);
    const [showLevelDropdown, setShowLevelDropdown] = useState(false);

    const [deletedRefereeCards, setDeletedRefereeCards] = useState([])

    const handleSearchQuery = (query) => {
        setSearchQuery(query.target.value);
    };

    // Gender Filter button
    const handleGenderFilter = (gender) => {
        setGenderFilter(gender);
        setShowGenderDropdown(false); // Hide dropdown after selection
    };

    // Level Filter button
    const handleLevelFilter = (level) => {
        setLevelFilter(level);
        setShowLevelDropdown(false); // Hide dropdown after selection
    };

    //after filtering
    const filterRelevantCards = (searchQuery, genderFilter, levelFilter) => {
        return props.refereeCards.filter(card =>
            card.refereeName.toLowerCase().includes(searchQuery.toLowerCase()) &&
            (genderFilter === "" || card.refereeGender === genderFilter) &&
            (levelFilter === "" || card.refereeLevel === levelFilter)
        );
    };

    const relevantCards = filterRelevantCards(searchQuery, genderFilter, levelFilter);

    //After deleting
    const handleDeleteClick=(refereeID)=>{
        setDeletedRefereeCards([...deletedRefereeCards, refereeID]);
    }
    const filerAllDeletedCards= relevantCards.filter(card => !deletedRefereeCards.includes(card.refereeID))

    return (
        <>
            <h1 className="title text-xl font-semibold ml-5 mb-4 text-left">Referees</h1>
            <div className="flex justify-start ml-5 mb-3">
                <input 
                    type="text"
                    placeholder="Search Name"
                    value={searchQuery}
                    onChange={handleSearchQuery}
                    className="p-2 border border-gray-300 rounded-md w-1/3"
                />
            </div>
            <div className="flex justify-start ml-5 mb-3">
                <button 
                    className="shadow-lg rounded-xl universalButton mr-2" 
                    onClick={() => setShowGenderDropdown(!showGenderDropdown)}
                >
                    Filter by Gender<FontAwesomeIcon className="ml-2" icon={faCaretDown} />
                </button>
                {showGenderDropdown && (
                    <div className="absolute bg-white shadow-lg rounded-md mt-2 w-24">
                        <button 
                            className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" 
                            onClick={() => handleGenderFilter("Male")}
                        >
                            Male
                        </button>
                        <button 
                            className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" 
                            onClick={() => handleGenderFilter("Female")}
                        >
                            Female
                        </button>
                        <button 
                            className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" 
                            onClick={() => handleGenderFilter("")}
                        >
                            All
                        </button>
                    </div>
                )}
                <button 
                    className="shadow-lg rounded-xl universalButton mr-2" 
                    onClick={() => setShowLevelDropdown(!showLevelDropdown)}
                >
                    Filter by Level<FontAwesomeIcon className="ml-2" icon={faCaretDown} />
                </button>
                {showLevelDropdown && (
                    <div className="absolute bg-white shadow-lg rounded-md mt-2 w-24">
                        <button 
                            className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" 
                            onClick={() => handleLevelFilter("1")}
                        >
                            1
                        </button>
                        <button 
                            className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" 
                            onClick={() => handleLevelFilter("2")}
                        >
                            2
                        </button>
                        <button 
                            className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" 
                            onClick={() => handleLevelFilter("3")}
                        >
                            3
                        </button>
                        <button 
                            className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" 
                            onClick={() => handleLevelFilter("4")}
                        >
                            4
                        </button>
                        <button 
                            className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" 
                            onClick={() => handleLevelFilter("")}
                        >
                            All
                        </button>
                    </div>
                )}
            </div>
            <div className="grid grid-cols-2">
                {filerAllDeletedCards.map(card => (
                    <RefereeCard
                        key={card.refereeID}
                        className={props.selectedRefereeID === card.refereeID ? "highlight-effect" : ""}
                        refereeID={card.refereeID}
                        refereeName={card.refereeName}
                        refereeGender={card.refereeGender}
                        refereeExperience={card.refereeExperience}
                        refereeDob={card.refereeDob}
                        refereeLevel={card.refereeLevel}
                        onDeleteClick={()=>handleDeleteClick(card.refereeID)}
                    />
                ))}
            </div>
        </>
    );
};

export default Referee;