import React, { useState, useEffect } from "react";
import { useAppContext } from "../contexts/AppContext";
import TitleWithBar from "../components/TitleWithBar";
import Button from "../components/Button";
import { teamService } from "../services/api";
import { toast } from "react-toastify";
import LoadingSpinner from "../components/LoadingSpinner";
import {
    Search,
    MapPin,
    Phone,
    Users,
    Mail,
    Calendar,
    Trophy,
    Clock,
} from "lucide-react";
import TeamDetailsModal from "../components/TeamDetailsModal";
import Popup from "../components/Popup";

const Teams = () => {
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all"); // 'all', 'active', 'inactive'

    // Filter teams based on search and status
    const filteredTeams = teams.filter((team) => {
        const matchesSearch =
            team.club_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            team.contact_name?.toLowerCase().includes(searchTerm.toLowerCase());
        if (filterStatus === "all") return matchesSearch;
        return matchesSearch;
    });

    useEffect(() => {
        const fetchTeams = async () => {
            try {
                setLoading(true);
                const response = await teamService.getAllTeams();
                const teamsData = Array.isArray(response.data)
                    ? response.data
                    : response.data.results || [];
                setTeams(teamsData);
            } catch (err) {
                console.error("Error fetching teams:", err);
                toast.error("Failed to load teams");
            } finally {
                setLoading(false);
            }
        };

        fetchTeams();
    }, []);

    if (loading) {
        return <LoadingSpinner message="Loading teams..." />;
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <div className="bg-red-50 rounded-lg p-6 inline-block">
                    <h3 className="text-red-600 font-semibold mb-2">
                        Failed to load teams
                    </h3>
                    <p className="text-red-500 mb-4">{error}</p>
                    <Button onClick={() => window.location.reload()}>
                        Try Again
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <TitleWithBar title="Teams" />
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-white rounded-lg shadow-sm p-1">
                        <button
                            onClick={() => setFilterStatus("all")}
                            className={`px-4 py-2 rounded-md transition-colors ${
                                filterStatus === "all"
                                    ? "bg-blue-100 text-blue-600"
                                    : "text-gray-600 hover:bg-gray-100"
                            }`}
                        >
                            All Teams
                        </button>
                        <button
                            onClick={() => setFilterStatus("active")}
                            className={`px-4 py-2 rounded-md transition-colors ${
                                filterStatus === "active"
                                    ? "bg-blue-100 text-blue-600"
                                    : "text-gray-600 hover:bg-gray-100"
                            }`}
                        >
                            Active
                        </button>
                        <button
                            onClick={() => setFilterStatus("inactive")}
                            className={`px-4 py-2 rounded-md transition-colors ${
                                filterStatus === "inactive"
                                    ? "bg-blue-100 text-blue-600"
                                    : "text-gray-600 hover:bg-gray-100"
                            }`}
                        >
                            Inactive
                        </button>
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
                <input
                    type="text"
                    placeholder="Search teams by name or contact..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-100 focus:border-blue-500 focus:ring-0 bg-white shadow-sm"
                />
                <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
            </div>

            {/* Teams Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTeams.map((team) => (
                    <div
                        key={team.club_id}
                        onClick={() => setSelectedTeam(team)}
                        className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden cursor-pointer"
                    >
                        {/* Team Header */}
                        <div className="p-6 border-b border-gray-100">
                            <div className="flex items-start justify-between mb-4">
                                <h3 className="font-semibold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">
                                    {team.club_name}
                                </h3>
                                <div className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-sm font-medium">
                                    Active
                                </div>
                            </div>

                            {/* Venue Info */}
                            <div className="flex items-center text-gray-600 mb-2">
                                <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                                <span className="truncate">
                                    {team.home_venue?.venue_name ||
                                        "No venue assigned"}
                                </span>
                            </div>
                        </div>

                        {/* Contact Info */}
                        <div className="px-6 py-4 bg-gray-50">
                            <div className="space-y-2">
                                <div className="flex items-center text-gray-600">
                                    <Users className="w-4 h-4 mr-2 flex-shrink-0" />
                                    <span>
                                        {team.contact_name || "No contact name"}
                                    </span>
                                </div>
                                <div className="flex items-center text-gray-600">
                                    <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                                    <span>
                                        {team.contact_phone_number ||
                                            "No phone number"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="px-6 py-4 border-t border-gray-100">
                            <div className="flex justify-between text-sm">
                                <div className="text-gray-500">
                                    <Trophy className="w-4 h-4 inline mr-1" />
                                    <span>5 matches won</span>
                                </div>
                                <div className="text-gray-500">
                                    <Calendar className="w-4 h-4 inline mr-1" />
                                    <span>3 upcoming</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* No Results */}
            {filteredTeams.length === 0 && (
                <div className="text-center py-12">
                    <div className="bg-gray-50 rounded-lg p-6 inline-block">
                        <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-gray-900 font-semibold mb-2">
                            No teams found
                        </h3>
                        <p className="text-gray-500">
                            Try adjusting your search or filters
                        </p>
                    </div>
                </div>
            )}

            {/* Team Details Modal */}
            {selectedTeam && (
                <TeamDetailsModal
                    team={selectedTeam}
                    onClose={() => setSelectedTeam(null)}
                />
            )}
        </div>
    );
};

export default Teams;
