import React, { useState, useEffect } from "react";
import { useAppContext } from "../contexts/AppContext";
import ErrorDisplay from "../components/ErrorDisplay";
import LoadingSpinner from "../components/LoadingSpinner";
import Button from "../components/Button";
import { refereeService } from "../services/api";
import { toast } from "react-toastify";
import TitleWithBar from "../components/TitleWithBar";

const Profile = () => {
    const { user } = useAppContext();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!user?.referee_id) {
                setError("No user ID found");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const response = await refereeService.getRefereeProfile(
                    user.referee_id,
                );
                setProfile(response.data);
            } catch (err) {
                console.error("Error fetching profile:", err);
                setError(err.message || "Failed to fetch profile");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!user?.referee_id) {
            toast.error("No user ID found");
            return;
        }

        try {
            setSaving(true);
            await refereeService.updateRefereeProfile(user.referee_id, profile);
            toast.success("Profile updated successfully");
        } catch (err) {
            toast.error(err.message || "Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    if (error) {
        return (
            <ErrorDisplay
                error={error}
                message="Failed to load profile"
                onRetry={() => window.location.reload()}
            />
        );
    }

    if (loading) {
        return <LoadingSpinner message="Loading profile..." />;
    }

    if (!profile) {
        return (
            <div className="text-center py-8">
                <p className="text-gray-500">No profile data found</p>
            </div>
        );
    }

    return (
        <>
            <div className="flex justify-between items-center">
                <TitleWithBar title="Profile" />
            </div>

            <form
                onSubmit={handleSubmit}
                className="space-y-6 bg-white rounded-lg shadow-lg p-6"
            >
                <h2 className="text-2xl font-semibold mb-6">User Details</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            ID
                        </label>
                        <input
                            type="text"
                            value={profile.referee_id || ""}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            First Name
                        </label>
                        <input
                            type="text"
                            value={profile.first_name || ""}
                            onChange={(e) =>
                                setProfile({
                                    ...profile,
                                    first_name: e.target.value,
                                })
                            }
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Last Name
                        </label>
                        <input
                            type="text"
                            value={profile.last_name || ""}
                            onChange={(e) =>
                                setProfile({
                                    ...profile,
                                    last_name: e.target.value,
                                })
                            }
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Age
                        </label>
                        <input
                            type="text"
                            value={profile.age || ""}
                            onChange={(e) =>
                                setProfile({
                                    ...profile,
                                    age: e.target.value,
                                })
                            }
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Level
                        </label>
                        <input
                            type="text"
                            value={profile.level || ""}
                            onChange={(e) =>
                                setProfile({
                                    ...profile,
                                    level: e.target.value,
                                })
                            }
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Email
                        </label>
                        <input
                            type="email"
                            value={profile.email || ""}
                            onChange={(e) =>
                                setProfile({
                                    ...profile,
                                    email: e.target.value,
                                })
                            }
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Phone Number
                        </label>
                        <input
                            type="tel"
                            value={profile.phone_number || ""}
                            onChange={(e) =>
                                setProfile({
                                    ...profile,
                                    phone_number: e.target.value,
                                })
                            }
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Location
                        </label>
                        <input
                            type="text"
                            value={profile.location || ""}
                            onChange={(e) =>
                                setProfile({
                                    ...profile,
                                    location: e.target.value,
                                })
                            }
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Zip Code
                        </label>
                        <input
                            type="text"
                            value={profile.zip_code || ""}
                            onChange={(e) =>
                                setProfile({
                                    ...profile,
                                    zip_code: e.target.value,
                                })
                            }
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Experience (years)
                        </label>
                        <input
                            type="number"
                            value={profile.experience_years || 0}
                            onChange={(e) =>
                                setProfile({
                                    ...profile,
                                    experience_years: e.target.value,
                                })
                            }
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>
                </div>

                <div className="flex justify-end mt-6">
                    <Button type="submit" disabled={saving}>
                        {saving ? "Saving..." : "Save Changes"}
                    </Button>
                </div>
            </form>
        </>
    );
};

export default Profile;
