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
            <ul>
                {clubs.map((club) => (
                    <li key={club.club_id}>
                        (Club ID:{club.club_id}) - (CLub Name:{club.club_name})
                        (Home Venue:{club.home_venue}) - (Contact Name:{club.contact_name})
                        (Contact Phone Number:{club.contact_phone_number})
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Teams;

