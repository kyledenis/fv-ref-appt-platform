import React, { useState, useRef, useEffect } from "react";
import MatchCard from "./MatchCard"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import { faPenToSquare } from "@fortawesome/free-regular-svg-icons";
const HomePage = (props) => {
    
    return(
        <>
            <div>
                <h1 className="title text-xl font-semibold ml-5 mb-4 text-left">Upcomming matches</h1>
            </div>
            <div className="grid grid-cols-2">
                {props.iCards.map(card => (<MatchCard 
                key={card.id}
                {...card}
                onClick={()=>props.onCardClick(card.id)}
                hoverable={true}
                />))}
            </div>
        </>
    )
}
export default HomePage;