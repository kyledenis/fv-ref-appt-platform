import React from "react";
import { useAppContext } from "../contexts/AppContext";
import TitleWithBar from "../components/TitleWithBar";

const Teams = () => {
    const { teams } = useAppContext();

    return (
        <>
            <TitleWithBar title="Teams" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {teams && teams.length > 0 ? (
                    teams.map((team) => (
                        <div
                            key={team.id}
                            className="bg-white shadow rounded-lg p-4"
                        >
                            <h3 className="font-semibold">{team.name}</h3>
                            <p>League: {team.league}</p>
                        </div>
                    ))
                ) : (
                    <p>No teams available.</p>
                )}
            </div>
        </>
    );
};

export default Teams;
