import React, { useState, useRef, useEffect } from "react";
import Header from "../Header";

const Venue = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const handleSearchQuery = (query) => {
        setSearchQuery(query.target.value);
    };
    return(
        <>
            <h1 className="title text-xl font-semibold ml-5 mb-4 text-left">Venue</h1>
            <div className="flex justify-start ml-5 mb-3">
                <input 
                    type="text"
                    placeholder="Search Name"
                    value={searchQuery}
                    onChange={handleSearchQuery}
                    className="p-2 border border-gray-300 rounded-md w-1/3"
                />
            </div>
        </>
    )
}
export default Venue;