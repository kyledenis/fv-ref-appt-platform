import React from 'react'
import { useState } from 'react';
import TitleWithBar from './components/TitleWithBar';

const Form = ({venues, setVenues}) => {
    const [newVenue, setNewVenue] = useState({
        venue_id: "",
        venue_name: "",
        location: "",
        capacity: "",
    });
  // Handle input change for the form
  const handleChange = (e) => {
    setNewVenue({ ...newVenue, [e.target.name]: e.target.value });
};


// Submit a new venue to the API
const handleSubmit = (e) => {
    e.preventDefault();

    fetch("http://127.0.0.1:8000/api/venue/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newVenue),
    })
        .then((response) => response.json())
        .then((data) => {
            setVenues([...venues, data]);
            setNewVenue({ venue_id: "", venue_name: "", location: "", capacity: "" }); // Clear form
        })
        .catch((error) => console.error("Error adding venue:", error));
};
  return (
    <div class="grid gap-6 gap-y-3 text-sm grid-cols-1 md:grid-cols-5 m-4">
              <TitleWithBar title="Add new venue" />
              <div class="md:col-span-5 m-2">
                <label for="full_name">ID</label>
                <input type="text" name="venue_id" class="h-10 border rounded px-4 w-full bg-gray-50" value={newVenue.venue_id} onChange={handleChange}/>
              </div>
              <div class="md:col-span-5 m-2">
                <label for="full_name">Name</label>
                <input type="text" name="venue_name" class="h-10 border rounded px-4 w-full bg-gray-50" value={newVenue.venue_name} onChange={handleChange}/>
              </div>
              <div class="md:col-span-5 m-2">
                <label for="email">Location</label>
                <input type="text" name="location" class="h-10 border rounded px-4 w-full bg-gray-50" value={newVenue.location} onChange={handleChange}/>
              </div>
              <div class="md:col-span-5 m-2">
                <label for="address">Capacity</label>
                <input type="number" name="capacity" class="h-10 border rounded px-4 w-full bg-gray-50" value={newVenue.capacity} placeholder="" onChange={handleChange} />
              </div>
              <button onClick={handleSubmit} type="button" class="text-gray-900 bg-gradient-to-r from-teal-200 to-lime-200 hover:bg-gradient-to-l hover:from-teal-200 hover:to-lime-200 focus:ring-4 focus:outline-none focus:ring-lime-200 dark:focus:ring-teal-700 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2">Submit</button>
    </div>
  )
}

export default Form