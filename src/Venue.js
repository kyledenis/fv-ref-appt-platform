import React, { useState, useEffect } from "react";
import Form from "./Form";
import MapModal from "./MapModal";
import TitleWithBar from "./components/TitleWithBar";
import axios from "axios";

const Venue = ({referee_id}) => {
    const [venues, setVenues] = useState([]);
    const [availabilityModal, setShowAvailabilityModal] = useState(false)
    const [selectedLocation, setSelectedVenue] = useState("")
    const [favor, setFavor] = useState([])
    

    // Fetch venues from the API
    useEffect(() => {
        fetch("http://127.0.0.1:8000/api/venue/")
            .then((response) => response.json())
            .then((data) => setVenues(data))
            .catch((error) => console.error("Error fetching venues:", error));
    }, []);

    useEffect(() => {
        getPreferenceForRef();
    }, []);

    const getPreferenceForRef = async () => {
        const res = await axios.get("http://localhost:8000/api/preference/");
        if (res.status == 200) {
            const result = res.data.filter(ele => ele.referee == Number(referee_id));
            setFavor(result);
            console.log(favor)
        }
    }


    return (
        <div>
            <TitleWithBar title="Manage venue" />
            <button type="button" className="text-gray-900 bg-gradient-to-r from-teal-200 to-lime-200 hover:bg-gradient-to-l hover:from-teal-200 hover:to-lime-200 focus:ring-4 focus:outline-none focus:ring-lime-200 dark:focus:ring-teal-700 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-6">
                Save favorite venue
            </button>
            <table className="min-w-full bg-white">
                <thead>
                    <tr>
                        <th className="px-3 py-3 border-b-2 border-gray-400 text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Preferred
                        </th>
                        <th className="px-3 py-3 border-b-2 border-gray-400 text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Venue ID 
                        </th>
                        <th className="px-3 py-3 border-b-2 border-gray-400 text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Venue Name
                        </th>
                        <th className="px-3 py-3 border-b-2 border-gray-400 text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Location
                        </th>
                        <th className="px-3 py-3 border-b-2 border-gray-400 text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Capacity
                        </th>
                        <th className="px-3 py-3 border-b-2 border-gray-400 text-xs font-medium text-gray-500 uppercase tracking-wider">
                            View venue
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {venues.map((venue) => (
                        <tr key={venue.venue_id}>
                            <td className="px-3 py-3 whitespace-no-wrap border-b border-gray-200 text-left">
                                <input type="checkbox" className="accent-pink-500 " />
                            </td>
                            <td className="px-3 py-3 whitespace-no-wrap border-b border-gray-200 text-left">
                                {venue.venue_id}
                            </td>
                            <td className="px-3 py-3 whitespace-no-wrap border-b border-gray-200 text-left">
                                {venue.venue_name}
                            </td>
                            <td className="px-3 py-3 whitespace-no-wrap border-b border-gray-200 text-left">
                                {venue.location}
                            </td>
                            <td className="px-3 py-3 whitespace-no-wrap border-b border-gray-200 text-left">
                                {venue.capacity}
                            </td>
                            <td className="px-3 py-3 whitespace-no-wrap border-b border-gray-200 text-center">
                                <button type="button" onClick={() => {setShowAvailabilityModal(true); setSelectedVenue(venue.location)}} className="text-gray-900 bg-gradient-to-r from-teal-200 to-lime-200 hover:bg-gradient-to-l hover:from-teal-200 hover:to-lime-200 focus:ring-4 focus:outline-none focus:ring-lime-200 dark:focus:ring-teal-700 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2">
                                    View graphical map
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            
            <Form venues={venues} setVenues={setVenues} />
            {availabilityModal && <MapModal location={selectedLocation} setShowAvailabilityModal={setShowAvailabilityModal} availabilityModal={availabilityModal}/>}

        </div>
    );
};

export default Venue;
