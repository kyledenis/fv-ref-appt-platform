import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisV, faTrashCan } from "@fortawesome/free-solid-svg-icons";

const RefereeCard = (props) => {
    
    return (
        <div className={`refereeCard shadow-lg rounded-xl p-3 m-4 text-xs grid grid-cols-1 md:grid-cols-8 ${props.className}`}>
            <div className="col-span-7 flex flex-col text-left">
                {/* Name section */}
                <div className="flex itens-center justify between text-lg font-bold mb-2">
                    {/* <img src={props.avatar} alt="Avatar" className="w-12 h-12 rounded-full mr-4" /> */}
                    <div>
                        <h1>Name: {props.refereeName}</h1>
                        <h1>ID: {props.refereeID}</h1>
                    </div>
                </div>
                {/* Main Section */}
                <div className="grid grid-cols-2 gap-3 mb-2">
                    {/* Information Section */}
                    <div>
                        <h1 className="truncate font-bold">Gender:</h1> <h1>{props.refereeGender}</h1>
                        <h1 className="truncate font-bold">Experience: </h1><h1>{props.refereeExperience} years</h1>
                    </div>
                    <div>
                        <h1 className="truncate font-bold">DoB: </h1><h1 className="truncate">{props.refereeDob}</h1>
                        <h1 className="truncate font-bold">Level: </h1><h1>{props.refereeLevel}</h1>
                    </div>
                </div> 
            </div>
                {/* Configuration */}
            <div className="col-span-1 flex flex-col items-center justify-center space-y-5 md:space-y-20">
                    <button><FontAwesomeIcon className="ellipsis-icon icon" icon={faEllipsisV} /></button>                  
                    <button onClick={props.onDeleteClick}><FontAwesomeIcon className="trash-can-icon icon" icon={faTrashCan} /></button>                  
            </div> 
        </div>
    );
};

export default RefereeCard;