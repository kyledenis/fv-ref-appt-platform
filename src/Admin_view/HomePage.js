import React, { useState, useRef, useEffect } from "react";
import InformationCard from "./InformationCard"
import { CalendarDays } from "lucide-react";
const HomePage = () => {
    const iCards = [
        {
            id: 1,
            venueID: 100,
            refereeID: 200,
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
    ]
    return(
        <>
        <div>
            <h1 className="title text-xl font-semibold ml-5 mb-4 text-left">Upcomming matches</h1>
        </div>
        <div className="grid grid-cols-2">
            {iCards.map(card => (<InformationCard 
            key={card.id}
            {...card}
            />))}
        </div>
        </>
    )
}
export default HomePage;