import React from "react";
import { useAppContext } from "../contexts/AppContext";
import TitleWithBar from "../components/TitleWithBar";
import { User } from "lucide-react";

const Profile = () => {
    const { user } = useAppContext();

    if (!user) {
        return <div>Loading user profile...</div>;
    }

    return (
        <>
            <TitleWithBar title="Profile" />
            <div className="bg-white shadow rounded-lg p-4">
                <div className="flex items-center mb-4">
                    <User size={64} className="mr-4" />
                    <div>
                        <h3 className="font-semibold text-lg">{`${user.firstName} ${user.lastName}`}</h3>
                        <p>Person ID: {user.personId}</p>
                        <p>FFA Number: {user.ffaNumber}</p>
                    </div>
                </div>
                <div className="mb-4">
                    <h4 className="font-semibold">Contact Information</h4>
                    <p>Email: {user.email}</p>
                    <p>Phone: {user.phone}</p>
                </div>
                <div>
                    <h4 className="font-semibold">Qualifications</h4>
                    <ul className="list-disc list-inside">
                        {user.qualifications &&
                        user.qualifications.length > 0 ? (
                            user.qualifications.map((qualification, index) => (
                                <li key={index}>{qualification}</li>
                            ))
                        ) : (
                            <li>No qualifications listed.</li>
                        )}
                    </ul>
                </div>
            </div>
        </>
    );
};

export default Profile;
