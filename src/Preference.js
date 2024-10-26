import axios from 'axios'
import React, { useEffect } from 'react'
import { useState } from 'react';
import TitleWithBar from './components/TitleWithBar';

const Preference = ({referee_id}) => {

  const [favoriteVen, setFavoriteVen] = useState([]);
  useEffect(() => {
    getPreferenceForReferee();
  }, []);
  const getPreferenceForReferee = async () => {
    const preferred = await axios.get("http://localhost:8000/api/preference/");
    console.log(typeof(referee_id))
    if (preferred.status == 200) {
        const favor = preferred.data.filter(ele => ele.referee == Number(referee_id));
        const venuePromises = favor.map(ele => 
            axios.get(`http://localhost:8000/api/venue/${ele.venue}/`).then(res => res.data)
          );
        const favorites = await Promise.all(venuePromises);
    
          // Set the state with favorite venues
        setFavoriteVen(favorites);
    }
  }
  return (
<div class="container mb-4">
   <TitleWithBar title="Preferred venues" />
   <ul class="flex flex-col bg-gray-100 p-4">
        {favoriteVen.map(fav => (
            <li class="border-gray-400 flex flex-row mb-2">
            <div class="select-none cursor-pointer bg-gray-200 rounded-md flex flex-1 items-center p-4  transition duration-500 ease-in-out transform hover:-translate-y-1 hover:shadow-lg">
              <div class="flex flex-col rounded-md w-10 h-10 bg-gray-300 justify-center items-center mr-4">🌟</div>
              <div class="flex-1 pl-1 mr-16">
                <div class="font-medium">{fav.venue_name}</div>
                <div class="text-gray-600 text-md">{fav.location}</div>
              </div>
              <div class="text-gray-600 text-md">{fav.capacity}</div>
            </div>
          </li>
        ))}
    </ul>
    
  </div>
  )
}

export default Preference