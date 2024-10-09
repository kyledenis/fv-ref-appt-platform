import React, { useState } from "react";
import RefereeCard from "./RefereeCard";

const Referee = (props) => {
    // Search function
    const [searchQuery, setSearchQuery] = useState("");
    const [genderFilter, setGenderFilter] = useState("");
    const [levelFilter, setLevelFilter] = useState("");
    const [showGenderDropdown, setShowGenderDropdown] = useState(false);
    const [showLevelDropdown, setShowLevelDropdown] = useState(false);

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

    const filterRelevantCards = (searchQuery, genderFilter, levelFilter) => {
        return props.refereeCards.filter(card =>
            card.refereeName.toLowerCase().includes(searchQuery.toLowerCase()) &&
            (genderFilter === "" || card.refereeGender === genderFilter) &&
            (levelFilter === "" || card.refereeLevel === levelFilter)
        );
    };

    const relevantCards = filterRelevantCards(searchQuery, genderFilter, levelFilter);

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
                    FIlter by Gender
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
                    Filter by Level
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
                {relevantCards.map(card => (
                    <RefereeCard
                        key={card.id}
                        refereeID={card.refereeID}
                        refereeName={card.refereeName}
                        refereeGender={card.refereeGender}
                        refereeExperience={card.refereeExperience}
                        refereeDob={card.refereeDob}
                        refereeLevel={card.refereeLevel}
                    />
                ))}
            </div>
        </>
    );
};

export default Referee;