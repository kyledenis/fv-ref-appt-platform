import React, { useState, useEffect } from "react";
import { useAppContext } from "../contexts/AppContext";
import Button from "./Button";
import Popup from "./Popup";
import { loadGoogleMapsScript } from "../utils/loadGoogleMapsScript";

const MatchDetails = ({ match, isOpen, onClose }) => {
    const { updateAppointment } = useAppContext();
    const [status, setStatus] = useState(match.status);
    const [declineReason, setDeclineReason] = useState("");
    const [showDeclineForm, setShowDeclineForm] = useState(false);
    const [map, setMap] = useState(null);
    const [mapError, setMapError] = useState(null);
    const [mapCenter, setMapCenter] = useState({
        lat: -37.8136,
        lng: 144.9631,
    }); // Default to Melbourne

    useEffect(() => {
        if (isOpen && match.venue) {
            loadGoogleMapsScript()
                .then((google) => {
                    const geocoder = new google.maps.Geocoder();
                    geocoder.geocode(
                        { address: match.venue + ", Victoria, Australia" },
                        (results, status) => {
                            if (status === "OK" && results[0]) {
                                const location = results[0].geometry.location;
                                const newCenter = {
                                    lat: location.lat(),
                                    lng: location.lng(),
                                };
                                setMapCenter(newCenter);
                                if (map) {
                                    map.setCenter(newCenter);
                                    new google.maps.Marker({
                                        map: map,
                                        position: newCenter,
                                    });
                                }
                            } else {
                                console.error(
                                    "Geocode was not successful for the following reason: " +
                                        status,
                                );
                                setMapError(
                                    "Failed to locate the venue. Showing default location.",
                                );
                            }
                        },
                    );

                    if (!map) {
                        const newMap = new google.maps.Map(
                            document.getElementById("map"),
                            {
                                center: mapCenter,
                                zoom: 15,
                            },
                        );
                        setMap(newMap);
                    }
                })
                .catch((error) => {
                    console.error("Error loading Google Maps:", error);
                    setMapError(
                        "Failed to load Google Maps. Please try again later.",
                    );
                });
        }
    }, [isOpen, match.venue, map]);

    const handleConfirm = async () => {
        await updateAppointment(match.id, { status: "Confirmed" });
        setStatus("Confirmed");
    };

    const handleDecline = () => {
        setShowDeclineForm(true);
    };

    const submitDecline = async () => {
        if (declineReason.trim()) {
            await updateAppointment(match.id, {
                status: "Declined",
                declineReason,
            });
            setStatus("Declined");
            setShowDeclineForm(false);
        }
    };

    const getDrivingDirections = () => {
        const destination = encodeURIComponent(match.venue);
        window.open(
            `https://www.google.com/maps/dir/?api=1&destination=${destination}`,
            "_blank",
        );
    };

    return (
        <Popup isOpen={isOpen} onClose={onClose} title={match.competition}>
            <div className="grid grid-cols-2 gap-6">
                <div>
                    <h3 className="text-xl font-semibold mb-2">
                        Match Details
                    </h3>
                    <p>
                        <strong>Teams:</strong> {match.teams}
                    </p>
                    <p>
                        <strong>Date:</strong> {match.date}
                    </p>
                    <p>
                        <strong>Time:</strong> {match.time}
                    </p>
                    <p>
                        <strong>Venue:</strong> {match.venue}
                    </p>
                    <p>
                        <strong>Type:</strong> {match.type}
                    </p>
                    <p>
                        <strong>Status:</strong> {status}
                    </p>

                    {status === "Pending" && (
                        <div className="mt-4">
                            <Button onClick={handleConfirm} className="mr-2">
                                Confirm Appointment
                            </Button>
                            <Button onClick={handleDecline} variant="secondary">
                                Decline Appointment
                            </Button>
                        </div>
                    )}

                    {showDeclineForm && (
                        <div className="mt-4">
                            <textarea
                                value={declineReason}
                                onChange={(e) =>
                                    setDeclineReason(e.target.value)
                                }
                                placeholder="Please provide a reason for declining"
                                className="w-full p-2 border rounded"
                                rows="3"
                            />
                            <Button onClick={submitDecline} className="mt-2">
                                Submit Decline
                            </Button>
                        </div>
                    )}
                </div>
                <div>
                    <h3 className="text-xl font-semibold mb-2">Location</h3>
                    {mapError ? (
                        <p className="text-red-500">{mapError}</p>
                    ) : (
                        <div
                            id="map"
                            style={{ width: "100%", height: "300px" }}
                        ></div>
                    )}
                    <Button onClick={getDrivingDirections} className="mt-2">
                        Get Driving Directions
                    </Button>
                </div>
            </div>
        </Popup>
    );
};

export default MatchDetails;
