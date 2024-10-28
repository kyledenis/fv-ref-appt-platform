import React, { useState } from "react";

const AdvancedMatchAssignment = (props) => {
    const [selectedRoles, setSelectedRoles] = useState({});
    const [searchQuery, setSearchQuery] = useState("");
    const [genderFilter, setGenderFilter] = useState([]);
    const [levelFilter, setLevelFilter] = useState([]);
    const [deletedRefereeIDs, setDeletedRefereeIDs] = useState([]);
    
    const [appointedOfficials, setAppointedOfficials] = useState([
        {
            id: 210,
            name: "Pierluigi Collina",
            role: "Referee",
            status: "Confirmed"
        },
        {
            id: 220,
            name: "Antony Taylor",
            role: "Assistant Referee",
            status: "Pending"
        }
    ]);

    const handleSearchQuery = (query) => {
        setSearchQuery(query.target.value);
    };

    const handleGenderFilterChange = (gender) => {
        setGenderFilter(prev => 
            prev.includes(gender) ? prev.filter(g => g !== gender) : [...prev, gender]
        );
    };

    const handleLevelFilterChange = (level) => {
        setLevelFilter(prev => 
            prev.includes(level) ? prev.filter(l => l !== level) : [...prev, level]
        );
    };

    const filterRelevantCards = (searchQuery, genderFilter, levelFilter) => {
        return props.refereeCards.filter(card =>
            card.refereeName.toLowerCase().includes(searchQuery.toLowerCase()) &&
            (genderFilter.length === 0 || genderFilter.includes(card.refereeGender)) &&
            (levelFilter.length === 0 || levelFilter.includes(card.refereeLevel)) &&
            !appointedOfficials.some(official => official.id === card.refereeID)
        );
    };

    const relevantCards = filterRelevantCards(searchQuery, genderFilter, levelFilter);

    const handleDeletedOfficial = (id) => {
        setAppointedOfficials(appointedOfficials.filter(official => official.id !== id));
        setDeletedRefereeIDs(deletedRefereeIDs.filter(refereeID => refereeID !== id));
    };

    const handleAddOfficial = (referee) => {
        setAppointedOfficials([...appointedOfficials, referee]);
    };

    const handleRoleChange = (refereeID, role) => {
        setSelectedRoles({
            ...selectedRoles,
            [refereeID]: role
        });
    };

    const relevantOfficials = appointedOfficials.filter(official => !deletedRefereeIDs.includes(official.id));

    return (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-3/4 h-3/4 overflow-auto relative">
                <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-1 flex flex-col items-start">
                        <h2 className="text-left text-xl font-semibold mb-4">Match Details</h2>
                        <h3 className="font-bold">Match ID: {props.card.id}</h3>
                        <div className="flex flex-row items-start whitespace-nowrap w-full">
                            <h1 className="">Venue Name: </h1>
                            <h1 className="ml-1 truncate">{props.card.venueName}</h1>
                        </div>
                        <div className="flex flex-row items-start whitespace-nowrap w-full">
                            <h1 className="">Location: </h1>
                            <h1 className="ml-1 truncate">{props.card.location}</h1>
                        </div>
                        <div className="flex flex-row items-start whitespace-nowrap w-full">
                            <h1 className="">Status: </h1>
                            <h1 className="ml-1 truncate">{props.card.status}</h1>
                        </div>
                        <div className="flex flex-row items-start whitespace-nowrap w-full">
                            <h1 className="">Time: </h1>
                            <h1 className="ml-1 truncate">{props.card.time}</h1>
                        </div>
                        <div className="flex flex-row items-start whitespace-nowrap w-full">
                            <h1 className="">Date: </h1>
                            <h1 className="ml-1 truncate">{props.card.date}</h1>
                        </div>
                        <h3 className="text-xl font-semibold mt-4 mb-5">Appointed Officials</h3>
                        <table className="min-w-full bg-white">
                            <thead>
                                <tr>
                                    <th className="py-2 px-4 border-b">ID</th>
                                    <th className="py-2 px-4 border-b">Name</th>
                                    <th className="py-2 px-4 border-b">Role</th>
                                    <th className="py-2 px-4 border-b">Status</th>
                                    <th className="py-2 px-4 border-b">Remove</th>
                                </tr>
                            </thead>
                            <tbody>
                                {relevantOfficials.map((official, index) => (
                                    <tr key={index}>
                                        <td className="truncate py-2 px-4 border-b">{official.id}</td>
                                        <td className="truncate py-2 px-4 border-b">{official.name}</td>
                                        <td className="py-2 px-4 border-b">{official.role}</td>
                                        <td className="py-2 px-4 border-b">{official.status}</td>
                                        <td className="py-2 px-4 border-b">
                                            <button 
                                                className="text-red-500 hover:text-red-700"
                                                onClick={() => handleDeletedOfficial(official.id)}
                                            >
                                                Remove
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="col-span-1 flex flex-col items-start">
                        <h2 className="text-xl font-semibold text-left w-full">Official Panel</h2>
                        
                        <h3 className="font-semibold text-center w-full">Filter Referees</h3>
                        <input 
                            type="text"
                            placeholder="Search Name"
                            value={searchQuery}
                            onChange={handleSearchQuery}
                            className="p-2 border border-gray-300 rounded-md w-full mb-2"
                        />
                        <div className="flex flex-col mb-4 items-start">
                        <div className="flex items-center">
                            <h4 className="inline-flex font-semibold mt-2 mr-4">Gender: </h4>
                            <label className="inline-flex items-center mt-2 mr-4">
                                <input 
                                    type="checkbox" 
                                    className="form-checkbox" 
                                    checked={genderFilter.includes("Male")}
                                    onChange={() => handleGenderFilterChange("Male")}
                                />
                                <span className="ml-2">Male</span>
                            </label>
                            <label className="inline-flex items-center mt-2">
                                <input 
                                    type="checkbox" 
                                    className="form-checkbox" 
                                    checked={genderFilter.includes("Female")}
                                    onChange={() => handleGenderFilterChange("Female")}
                                />
                                <span className="ml-2">Female</span>
                            </label>
                        </div>
                        <div className="flex items-center mb-4">
                            <h4 className="inline-flex font-semibold mt-2 mr-4">Level: </h4>
                            <label className="inline-flex items-center mt-2 mr-4">
                                <input 
                                    type="checkbox" 
                                    className="form-checkbox" 
                                    checked={levelFilter.includes("1")}
                                    onChange={() => handleLevelFilterChange("1")}
                                />
                                <span className="ml-2">Level 1</span>
                            </label>
                            <label className="inline-flex items-center mt-2 mr-4">
                                <input 
                                    type="checkbox" 
                                    className="form-checkbox" 
                                    checked={levelFilter.includes("2")}
                                    onChange={() => handleLevelFilterChange("2")}
                                />
                                <span className="ml-2">Level 2</span>
                            </label>
                            <label className="inline-flex items-center mt-2 mr-4">
                                <input 
                                    type="checkbox" 
                                    className="form-checkbox" 
                                    checked={levelFilter.includes("3")}
                                    onChange={() => handleLevelFilterChange("3")}
                                />
                                <span className="ml-2">Level 3</span>
                            </label>
                            <label className="inline-flex items-center mt-2 mr-4">
                                <input 
                                    type="checkbox" 
                                    className="form-checkbox" 
                                    checked={levelFilter.includes("4")}
                                    onChange={() => handleLevelFilterChange("4")}
                                />
                                <span className="ml-2">Level 4</span>
                            </label>
                        </div>
                        </div>
                        <h3 className="text-xl font-semibold mt-4 text-left w-full mb-4">List of Referees</h3>
                        <div className="grid grid-cols-1 gap-4 w-full">
                            {relevantCards.map(referee => (
                                <div key={referee.refereeID} className="relative p-4 border rounded-lg shadow-md">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-left font-semibold">{referee.refereeName}</p>
                                            <p className="text-left">ID: {referee.refereeID}</p>
                                            <p className="text-left">Status: {referee.status}</p>
                                        </div>
                                        <div className="flex items-end">
                                            <select 
                                                className="mb-2 shadow-lg rounded-xl universalButton m-2"
                                                value={selectedRoles[referee.refereeID] || "Referee"}
                                                onChange={(e) => handleRoleChange(referee.refereeID, e.target.value)}
                                            >
                                                <option value="Referee">Referee</option>
                                                <option value="Assistant Referee">Assistant Referee</option>
                                                <option value="Trainee">Trainee</option>
                                            </select>
                                            <button 
                                                className="shadow-lg bg-blue-500 text-white px-4 py-2 rounded m-1" 
                                                onClick={() => handleAddOfficial({
                                                    id: referee.refereeID,
                                                    name: referee.refereeName,
                                                    role: selectedRoles[referee.refereeID] || "Referee",
                                                    status: "Pending" 
                                                })}
                                            >
                                                Add
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="flex justify-end z-50 p-4 rounded">
                    <button 
                        className="shadow-lg bg-green-500 text-white px-4 py-2 rounded m-1" 
                        onClick={props.onClose}
                    >
                        Confirm
                    </button>
                    <button 
                        className="shadow-lg bg-red-500 text-white px-4 py-2 rounded m-1" 
                        onClick={props.onClose}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdvancedMatchAssignment;