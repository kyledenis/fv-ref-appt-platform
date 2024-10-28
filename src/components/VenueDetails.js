import React, { useState, useEffect } from "react";
import { Map, Users, Calendar, MapPin, ExternalLink } from "lucide-react";
import Button from "./Button";
import LoadingSpinner from "./LoadingSpinner";
import Popup from "./Popup";

const VenueDetails = ({ venue, isOpen, onClose }) => {
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState("upcoming"); // 'upcoming' or 'info'

    useEffect(() => {
        const fetchVenueMatches = async () => {
            try {
                setLoading(true);
                // TODO: Implement matches fetch
                setMatches([]);
            } catch (err) {
                setError("Failed to load venue matches");
            } finally {
                setLoading(false);
            }
        };

        if (isOpen) {
            fetchVenueMatches();
        }
    }, [isOpen, venue?.venue_id]);

    const TabButton = ({ id, label, icon: Icon }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === id
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:bg-gray-100"
            }`}
        >
            <Icon className="w-4 h-4" />
            {label}
        </button>
    );

    return (
        <Popup
            isOpen={isOpen}
            onClose={onClose}
            title={venue?.venue_name || "Venue Details"}
        >
            <div className="flex items-center gap-2 text-gray-600 mb-6">
                <MapPin className="w-4 h-4" />
                <span>{venue?.location}</span>
            </div>

            <div className="flex gap-2 mb-6">
                <TabButton
                    id="upcoming"
                    label="Upcoming Matches"
                    icon={Calendar}
                />
                <TabButton id="info" label="Venue Information" icon={Map} />
            </div>

            <div className="space-y-6">
                {activeTab === "upcoming" ? (
                    <div className="space-y-4">
                        {loading ? (
                            <LoadingSpinner />
                        ) : error ? (
                            <p className="text-red-500">{error}</p>
                        ) : matches.length > 0 ? (
                            matches.map((match) => (
                                <div
                                    key={match.match_id}
                                    className="bg-gray-50 p-4 rounded-lg border border-gray-100"
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-semibold">
                                                {match.home_club?.club_name ||
                                                    "TBA"}{" "}
                                                vs{" "}
                                                {match.away_club?.club_name ||
                                                    "TBA"}
                                            </p>
                                            <p className="text-sm text-gray-600 mt-1">
                                                {new Date(
                                                    match.match_date,
                                                ).toLocaleDateString()}{" "}
                                                at {match.match_time}
                                            </p>
                                        </div>
                                        <Button size="small">
                                            View Details
                                        </Button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p className="font-medium">
                                    No upcoming matches at this venue
                                </p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="bg-gray-50 rounded-lg p-6 border border-gray-100">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="bg-blue-100 p-2 rounded-lg">
                                    <Users className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">Capacity</h3>
                                    <p className="text-gray-600">
                                        {venue?.capacity?.toLocaleString()}{" "}
                                        people
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="bg-blue-100 p-2 rounded-lg">
                                    <MapPin className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">Location</h3>
                                    <p className="text-gray-600">
                                        {venue?.location}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <Button
                            className="w-full"
                            onClick={() =>
                                window.open(
                                    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                        venue?.location || "",
                                    )}`,
                                    "_blank",
                                )
                            }
                        >
                            <ExternalLink className="w-full h-4" />
                            Open in Google Maps
                        </Button>
                    </div>
                )}
            </div>
        </Popup>
    );
};

export default VenueDetails;
