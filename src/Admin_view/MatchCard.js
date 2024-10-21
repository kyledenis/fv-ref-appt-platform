import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare } from "@fortawesome/free-regular-svg-icons";
import { faEllipsisV, faTrashCan } from "@fortawesome/free-solid-svg-icons";

const MatchCard = (props) => {
    // Drop-down Menu
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const toggleDropdown = (e) => {
        e.stopPropagation(); // Prevent the click event from bubbling up to the parent
        setDropdownVisible(!dropdownVisible);
    };

    const statusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'confirmed': 
                return "status-Green";
            case 'pending':
                return "status-Yellow";
            case 'declined':
                return "status-Red";
            default:
                return "";
        }
    };

    const bgColor = (status) => {
        switch (status.toLowerCase()) {
            case 'confirmed': 
                return "bg-Green";
            case 'pending':
                return "bg-Yellow";
            case 'declined':
                return "bg-Red";
            default:
                return "bg-White";
        }
    };

    return (
        <div id="InformationCard" className={`${bgColor(props.status)} shadow-lg rounded-xl p-6 m-4 text-xs ${props.className} ${props.hoverable ? '' : 'no-hover'}`} onClick={props.onClick}>
            {/* title section */}
            <div className="text-xl font-bold mb-2 flex">
                <h1>Match ID: {props.id}</h1>
            </div>
            {/* Main Section */}
            <div className="relative grid grid-cols-1 md:grid-cols-8 gap-3 mb-2">
                {/* Information Section */}
                <div className="col-span-1 md:col-span-3 flex flex-col items-start text-left">
                    <div className="flex flex-row">
                        <h1 className="flex font-bold">Venue ID: </h1>
                        <h1 className="ml-1">{props.venueID}</h1>
                    </div>
                    <div className="flex flex-row">
                        <h1 className="flex font-bold">Referee ID: </h1>
                        <h1 className="truncate ml-1">{props.refereeID}</h1>
                    </div>
                    <div className="flex flex-row">
                        <h1 className="flex font-bold">Time: </h1>
                        <h1 className="ml-1 truncate">{props.time}</h1>
                    </div>
                </div>
                <div className="col-span-1 md:col-span-4 flex flex-col items-start text-left">
                    <div className="flex flex-row items-start whitespace-nowrap w-full">
                        <h1 className="font-bold">Venue Name: </h1>
                        <h1 className="ml-1 truncate">{props.venueName}</h1>
                    </div>
                    <div className="flex flex-row">
                        <h1 className="font-bold">Status: </h1>
                        <h1 className={`ml-1 font-bold ${statusColor(props.status)}`}>{props.status}</h1>
                    </div>
                    <div className="flex flex-row">
                        <h1 className="flex font-bold">Date: </h1>
                        <h1 className="truncate ml-1">{props.date}</h1>
                    </div>
                </div>
                {/* Location */} 
                <div className="col-span-1 md:col-span-7 flex flex-row items-start text-left">
                    <h1 className="font-bold">Location: </h1>
                    <h1 className="ml-1 truncate">{props.location}</h1>
                </div>
                {/* Configuration */}
                <div className="absolute top-0 right-0 col-span-1 flex flex-col items-center">
                    <button onClick={toggleDropdown}>
                        <FontAwesomeIcon className="ellipsis-icon mb-2 icon" icon={faEllipsisV} />
                    </button>
                    {dropdownVisible && (
                        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded-md shadow-lg z-10">
                            <ul className="py-1">
                                <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer" onClick={props.onShowRefereeDetails}>Show Referee Details</li>
                                <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Show Venue Details</li>
                                <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer" onClick={toggleDropdown}>Cancel</li>
                            </ul>
                        </div>
                    )}
                    <button onClick={props.onEditClick}>
                        <FontAwesomeIcon className= "edit-icon mb-2 icon" icon={faPenToSquare} />
                    </button>
                    <button onClick={props.onDeleteClick}>
                        <FontAwesomeIcon className="trash-can-icon icon" icon={faTrashCan} />
                    </button>
                </div>    
            </div>
        </div>
    );
};

export default MatchCard;