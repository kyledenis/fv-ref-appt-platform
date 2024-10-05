import React from "react";

const InformationCard = (props)=>{
    
    const statusColor=(status)=>{
        switch (status.toLowerCase()){
            case 'confirmed': 
                return("status-Green");
            case 'pending':
                return("status-Yellow");
            case 'declined':
                return("status-Red");
            default:
                return("");
        }
    };

    const bgColor=(status)=>{
        switch (status.toLowerCase()){
            case 'confirmed': 
                return("bg-Green");
            case 'pending':
                return("bg-Yellow");
            case 'declined':
                return("bg-Red");
            default:
                return("bg-White");
        }
    };


    return(
        <div id="InformationCard" className={`${bgColor(props.status)} shadow-lg rounded-xl p-6 m-4 text-xs`}>
            {/* title section */}
            <div className="text-xl font-bold mb-2 flex">
                <h1>Match ID: {props.id}</h1>
            </div>
            {/* Main Section */}
            <div className="grid grid-cols-1 md:grid-cols-8 gap-3 mb-2 ">
                {/* Information Section */}
                <div className="col-span-1 md:col-span-3 flex flex-col items-start text-left">
                    <div className="flex flex-row">
                        <h1 className="flex font-bold">Venue ID: </h1>
                        <h1 className="ml-1">{props.venueID}</h1>
                    </div>
                    <div className="flex flex-row">
                        <h1 className="flex font-bold">Referee ID: </h1>
                        <h1 className="ml-1">{props.refereeID}</h1>
                    </div>
                    <div className="flex flex-row">
                        <h1 className="flex font-bold">Time: </h1>
                        <h1 className="ml-1">{props.time}</h1>
                    </div>
                </div>
                <div className="col-span-1 md:col-span-4 flex flex-col items-start  text-left">
                    <div className="flex flex-row items-start whitespace-nowrap w-full">
                        <h1 className="font-bold">Venue Name: </h1>
                        <h1 className="ml-1 truncate">{props.venueName}</h1>
                    </div>
                    <div className="flex flex-row">
                        <h1 className="font-bold">Status: </h1>
                        <h1 className={`ml-1 font-bold ${statusColor(props.status)}`}>{props.status}</h1>
                    </div>
                    <div className="flex  flex-row">
                        <h1 className="flex font-bold">Date: </h1>
                        <h1 className="ml-1">{props.date}</h1>
                    </div>
                </div>
                {/* Configuration */}
                <div className="col-span-1 flex flex-col items-end space-x-2">
                    <h1 className="">M</h1>
                    <h1 className="">E</h1>
                    <h1 className="">D</h1>
                </div>
                {/* Location */}
                <div className="col-span-1 md:col-span-7 flex flex-row items-start text-left">
                    <h1 className="font-bold">Location: </h1>
                    <h1 className="ml-1 truncate">{props.location}</h1>
                </div>
            </div>
        </div>
    );
}
export default InformationCard;