import React, { useState, useEffect } from "react";
import { useAppContext } from "../contexts/AppContext";
import Button from "./Button";
import Popup from "./Popup";
import { Map } from "lucide-react";
import { appointmentService } from "../services/api";
import { toast } from "react-toastify";
import withAsyncState from "../hoc/withAsyncState";
import LoadingSpinner from "./LoadingSpinner";
import {
    getGoogleMaps,
    isGoogleMapsLoaded,
} from "../utils/loadGoogleMapsScript";

const MatchDetails = ({ match, isOpen, onClose }) => {
    const [matchDetails, setMatchDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updating, setUpdating] = useState(false);
    const [showDeclineForm, setShowDeclineForm] = useState(false);
    const [declineReason, setDeclineReason] = useState("");
    const [mapError, setMapError] = useState(null);
    const [map, setMap] = useState(null);

    useEffect(() => {
        if (isOpen && match?.id) {
            fetchMatchDetails();
            initializeMap();
        }
    }, [isOpen, match?.id]);

    const fetchMatchDetails = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await appointmentService.getAppointment(match.id);
            setMatchDetails(response.data);
        } catch (err) {
            setError(
                err.response?.data?.message || "Failed to fetch match details",
            );
        } finally {
            setLoading(false);
        }
    };

    const initializeMap = async () => {
        try {
            if (!isGoogleMapsLoaded()) {
                const script = document.createElement("script");
                const API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

                if (!API_KEY) {
                    throw new Error("Google Maps API key is not configured");
                }

                script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places`;
                script.async = true;
                script.defer = true;

                await new Promise((resolve, reject) => {
                    script.addEventListener("load", resolve);
                    script.addEventListener("error", reject);
                    document.head.appendChild(script);
                });
            }

            const google = getGoogleMaps();
            if (!google) {
                throw new Error("Google Maps failed to load");
            }

            const geocoder = new google.maps.Geocoder();
            geocoder.geocode(
                { address: `${match.venue}, Victoria, Australia` },
                (results, status) => {
                    if (status === "OK" && results[0]) {
                        const mapInstance = new google.maps.Map(
                            document.getElementById("map"),
                            {
                                center: results[0].geometry.location,
                                zoom: 15,
                            },
                        );
                        new google.maps.Marker({
                            map: mapInstance,
                            position: results[0].geometry.location,
                        });
                        setMap(mapInstance);
                    } else {
                        setMapError("Failed to locate venue");
                    }
                },
            );
        } catch (err) {
            setMapError("Failed to load map");
            console.error("Map initialization error:", err);
        }
    };

    const handleAccept = async () => {
        try {
            setUpdating(true);
            await appointmentService.updateAppointment(match.id, {
                status: "confirmed",
            });
            toast.success("Match accepted successfully");
            onClose();
        } catch (err) {
            toast.error(
                err.response?.data?.message || "Failed to accept match",
            );
        } finally {
            setUpdating(false);
        }
    };

    const handleDecline = async () => {
        if (!declineReason.trim()) {
            toast.error("Please provide a reason for declining");
            return;
        }

        try {
            setUpdating(true);
            await appointmentService.updateAppointment(match.id, {
                status: "declined",
                declineReason,
            });
            toast.success("Match declined");
            onClose();
        } catch (err) {
            toast.error(
                err.response?.data?.message || "Failed to decline match",
            );
        } finally {
            setUpdating(false);
        }
    };

    const MatchContent = withAsyncState(({ matchDetails }) => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <h3 className="text-xl font-semibold mb-4">Match Details</h3>
                <div className="space-y-2">
                    <p>
                        <strong>Teams:</strong> {matchDetails.teams}
                    </p>
                    <p>
                        <strong>Date:</strong> {matchDetails.date}
                    </p>
                    <p>
                        <strong>Time:</strong> {matchDetails.time}
                    </p>
                    <p>
                        <strong>Venue:</strong> {matchDetails.venue}
                    </p>
                    <p>
                        <strong>Status:</strong> {matchDetails.status}
                    </p>
                </div>

                {matchDetails.status === "pending" && (
                    <div className="mt-6 space-x-4">
                        <Button onClick={handleAccept} disabled={updating}>
                            {updating ? "Accepting..." : "Accept Match"}
                        </Button>
                        <Button
                            onClick={() => setShowDeclineForm(true)}
                            variant="secondary"
                            disabled={updating}
                        >
                            Decline Match
                        </Button>
                    </div>
                )}

                {showDeclineForm && (
                    <div className="mt-4">
                        <textarea
                            value={declineReason}
                            onChange={(e) => setDeclineReason(e.target.value)}
                            className="w-full p-2 border rounded"
                            placeholder="Please provide a reason for declining"
                            rows={3}
                        />
                        <Button
                            onClick={handleDecline}
                            className="mt-2"
                            disabled={updating}
                        >
                            {updating ? "Declining..." : "Submit Decline"}
                        </Button>
                    </div>
                )}
            </div>

            <div>
                <h3 className="text-xl font-semibold mb-4">Location</h3>
                {mapError ? (
                    <div className="bg-red-50 p-4 rounded">
                        <p className="text-red-600">{mapError}</p>
                    </div>
                ) : (
                    <div
                        id="map"
                        className="w-full h-64 rounded-lg shadow-md"
                    ></div>
                )}
            </div>
        </div>
    ));

    return (
        <Popup
            isOpen={isOpen}
            onClose={onClose}
            title={match?.competition || "Match Details"}
        >
            <MatchContent
                loading={loading}
                error={error}
                matchDetails={matchDetails}
                onRetry={fetchMatchDetails}
                loadingMessage="Loading match details..."
                errorMessage="Failed to load match details"
            />
        </Popup>
    );
};

export default MatchDetails;
