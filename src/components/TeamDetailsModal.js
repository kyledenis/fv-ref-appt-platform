import React, { useState, useEffect, useCallback } from "react";
import { Calendar, Clock, MapPin, Phone, Users, Trophy } from "lucide-react";
import Button from "../components/Button";
import LoadingSpinner from "../components/LoadingSpinner";
import Popup from "../components/Popup";
import { teamService } from "../services/api";

const TeamDetailsModal = ({ team, onClose }) => {
    const [matches, setMatches] = useState({ home: [], away: [] });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState("overview");

    const fetchMatches = useCallback(async () => {
        if (activeTab !== "matches") return;

        try {
            setLoading(true);
            setError(null);

            // Eempty arrays since the service calls aren't working
            setMatches({
                home: [],
                away: [],
            });
        } catch (err) {
            console.error("Error fetching matches:", err);
            setError(err.message || "Failed to load matches");
        } finally {
            setLoading(false);
        }
    }, [activeTab]);

    useEffect(() => {
        fetchMatches();
    }, [fetchMatches]);

    const TabButton = ({ id, label, icon: Icon }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors border-b-2 ${
                activeTab === id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
        >
            <Icon className="w-4 h-4" />
            {label}
        </button>
    );

    const renderOverviewTab = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg border p-6">
                    <h4 className="font-medium text-gray-900 mb-4">
                        Team Information
                    </h4>
                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <div className="bg-blue-100 p-2 rounded-full">
                                <MapPin className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-gray-900 font-medium">
                                    Home Venue
                                </p>
                                <p className="text-gray-600">
                                    {team.home_venue?.venue_name ||
                                        "Not specified"}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="bg-green-100 p-2 rounded-full">
                                <Users className="w-4 h-4 text-green-600" />
                            </div>
                            <div>
                                <p className="text-gray-900 font-medium">
                                    Contact Person
                                </p>
                                <p className="text-gray-600">
                                    {team.contact_name || "Not specified"}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="bg-purple-100 p-2 rounded-full">
                                <Phone className="w-4 h-4 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-gray-900 font-medium">
                                    Contact Number
                                </p>
                                <p className="text-gray-600">
                                    {team.contact_phone_number ||
                                        "Not specified"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg border p-6">
                    <h4 className="font-medium text-gray-900 mb-4">
                        Quick Stats
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">
                                0
                            </div>
                            <div className="text-sm text-gray-500">
                                Matches Played
                            </div>
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">
                                0
                            </div>
                            <div className="text-sm text-gray-500">
                                Home Games
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderMatchesTab = () => (
        <div className="space-y-6">
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <LoadingSpinner />
                </div>
            ) : error ? (
                <div className="text-center py-8">
                    <div className="bg-red-50 rounded-lg p-4 inline-block">
                        <p className="text-red-600 mb-2">{error}</p>
                        <Button onClick={fetchMatches}>Try Again</Button>
                    </div>
                </div>
            ) : (
                <div className="space-y-8">
                    <div>
                        <h3 className="font-semibold text-lg mb-4">
                            Upcoming Home Matches
                        </h3>
                        <div className="text-center py-8 bg-gray-50 rounded-lg">
                            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-500">
                                No upcoming home matches scheduled
                            </p>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-semibold text-lg mb-4">
                            Upcoming Away Matches
                        </h3>
                        <div className="text-center py-8 bg-gray-50 rounded-lg">
                            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-500">
                                No upcoming away matches scheduled
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    const renderStatsTab = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg border p-6 text-center">
                    <div className="text-3xl font-bold text-blue-600">0</div>
                    <div className="text-sm text-gray-500 mt-2">
                        Total Games
                    </div>
                </div>
                <div className="bg-white rounded-lg border p-6 text-center">
                    <div className="text-3xl font-bold text-green-600">0</div>
                    <div className="text-sm text-gray-500 mt-2">Home Games</div>
                </div>
                <div className="bg-white rounded-lg border p-6 text-center">
                    <div className="text-3xl font-bold text-purple-600">0</div>
                    <div className="text-sm text-gray-500 mt-2">Away Games</div>
                </div>
            </div>
        </div>
    );

    return (
        <Popup isOpen={true} onClose={onClose} title={team.club_name}>
            {/* Team Header Info */}
            <div className="bg-gray-50 rounded-lg p-6 grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="space-y-2">
                    <div className="text-sm text-gray-500">Home Venue</div>
                    <div className="flex items-center text-gray-900">
                        <MapPin className="w-4 h-4 mr-2" />
                        {team.home_venue?.venue_name || "Not specified"}
                    </div>
                </div>
                <div className="space-y-2">
                    <div className="text-sm text-gray-500">Contact Person</div>
                    <div className="flex items-center text-gray-900">
                        <Users className="w-4 h-4 mr-2" />
                        {team.contact_name || "Not specified"}
                    </div>
                </div>
                <div className="space-y-2">
                    <div className="text-sm text-gray-500">Contact Number</div>
                    <div className="flex items-center text-gray-900">
                        <Phone className="w-4 h-4 mr-2" />
                        {team.contact_phone_number || "Not specified"}
                    </div>
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="border-b border-gray-200 mb-6">
                <div className="flex gap-4">
                    <TabButton id="overview" label="Overview" icon={Users} />
                    <TabButton id="matches" label="Matches" icon={Calendar} />
                    <TabButton id="stats" label="Statistics" icon={Trophy} />
                </div>
            </div>

            {/* Tab Content */}
            <div className="min-h-[400px]">
                {activeTab === "overview" && renderOverviewTab()}
                {activeTab === "matches" && renderMatchesTab()}
                {activeTab === "stats" && renderStatsTab()}
            </div>
        </Popup>
    );
};

export default TeamDetailsModal;