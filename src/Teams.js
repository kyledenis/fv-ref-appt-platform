import React, { useState, useEffect} from "react";

const Teams = () => {
    const [clubs, setClubs] = useState([]);
    const [newClub, setNewClub] = useState({
        club_id: "",
        club_name: "",
        home_venue: "",
        contact_name: "",
        contact_phone_number: "",
    });

    //Fetch clubs from the API
    useEffect(() => {
        fetch("http://127.0.0.1:8000/api/club/")
            .then((response) => response.json())
            .then((data) => setClubs(data))
            .catch((error) => console.error("Error fetching clubs:", error));
    }, []);

    return (
        <div>
            <h2 className="text-xl font-semibold mb-4">Manage Clubs</h2>

            {/* Display a list of clubs */}

            <table className="min-w-full bg-white">
                <thead>
                    <tr>
                        <th className="px-3 py-3 border-b-2 border-gray-400 text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Club ID 
                        </th>
                        <th className="px-3 py-3 border-b-2 border-gray-400 text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Club Name
                        </th>
                        <th className="px-3 py-3 border-b-2 border-gray-400 text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Home Venue
                        </th>
                        <th className="px-3 py-3 border-b-2 border-gray-400 text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Contact Name
                        </th>
                        <th className="px-3 py-3 border-b-2 border-gray-400 text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Contact Phone Number
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {clubs.map((club) => (
                        <tr key={club.club_id}>
                            <td className="px-3 py-3 whitespace-no-wrap border-b border-gray-200 text-left">
                                {club.club_id}
                            </td>
                            <td className="px-3 py-3 whitespace-no-wrap border-b border-gray-200 text-left">
                                {club.club_name}
                            </td>
                            <td className="px-3 py-3 whitespace-no-wrap border-b border-gray-200 text-left">
                                {club.home_venue}
                            </td>
                            <td className="px-3 py-3 whitespace-no-wrap border-b border-gray-200 text-left">
                                {club.contact_name}
                            </td>
                            <td className="px-3 py-3 whitespace-no-wrap border-b border-gray-200 text-left">
                                {club.contact_phone_number}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Teams;
