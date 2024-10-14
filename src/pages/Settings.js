import React, { useState } from "react";
import { useAppContext } from "../contexts/AppContext";
import TitleWithBar from "../components/TitleWithBar";
import Button from "../components/Button";

const Settings = () => {
    const { user, updateUserSettings } = useAppContext();
    const [settings, setSettings] = useState({
        emailNotifications: user?.settings?.emailNotifications || false,
        smsNotifications: user?.settings?.smsNotifications || false,
        language: user?.settings?.language || "en",
        timezone: user?.settings?.timezone || "UTC",
    });

    const handleSettingChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSettings((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSaveSettings = async () => {
        try {
            await updateUserSettings(user.id, settings);
            alert("Settings updated successfully");
        } catch (error) {
            console.error("Error updating settings:", error);
            alert("Failed to update settings");
        }
    };

    const handleChangePassword = () => {
        // TODO: Implement password change functionality
        console.log("Change password functionality to be implemented");
    };

    return (
        <>
            <TitleWithBar title="Settings" />
            <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">
                    Notification Preferences
                </h3>
                <div className="mb-4">
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            name="emailNotifications"
                            checked={settings.emailNotifications}
                            onChange={handleSettingChange}
                            className="mr-2"
                        />
                        Receive email notifications
                    </label>
                </div>
                <div className="mb-4">
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            name="smsNotifications"
                            checked={settings.smsNotifications}
                            onChange={handleSettingChange}
                            className="mr-2"
                        />
                        Receive SMS notifications
                    </label>
                </div>

                <h3 className="text-xl font-semibold mb-4 mt-8">
                    General Settings
                </h3>
                <div className="mb-4">
                    <label className="block mb-2">Language</label>
                    <select
                        name="language"
                        value={settings.language}
                        onChange={handleSettingChange}
                        className="w-full p-2 border rounded"
                    >
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                    </select>
                </div>
                <div className="mb-4">
                    <label className="block mb-2">Timezone</label>
                    <select
                        name="timezone"
                        value={settings.timezone}
                        onChange={handleSettingChange}
                        className="w-full p-2 border rounded"
                    >
                        <option value="UTC">UTC</option>
                        <option value="America/New_York">Eastern Time</option>
                        <option value="America/Chicago">Central Time</option>
                        <option value="America/Denver">Mountain Time</option>
                        <option value="America/Los_Angeles">
                            Pacific Time
                        </option>
                    </select>
                </div>

                <Button onClick={handleSaveSettings} className="mt-4">
                    Save Settings
                </Button>

                <h3 className="text-xl font-semibold mb-4 mt-8">
                    Account Settings
                </h3>
                <Button onClick={handleChangePassword}>Change Password</Button>
            </div>
        </>
    );
};

export default Settings;
