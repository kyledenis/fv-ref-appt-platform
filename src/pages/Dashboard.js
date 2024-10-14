import React from "react";
import { useAppContext } from "../contexts/AppContext";
import AppointmentTable from "../components/AppointmentTable";
import MatchDetails from "../components/MatchDetails";
import TitleWithBar from "../components/TitleWithBar";

const Dashboard = () => {
    const { appointments } = useAppContext();
    const [selectedMatch, setSelectedMatch] = React.useState(null);

    return (
        <div>
            <TitleWithBar title="Upcoming Appointments" />
            <AppointmentTable
                appointments={appointments}
                onViewMatch={setSelectedMatch}
            />
            {selectedMatch && (
                <MatchDetails
                    match={selectedMatch}
                    isOpen={!!selectedMatch}
                    onClose={() => setSelectedMatch(null)}
                />
            )}
        </div>
    );
};

export default Dashboard;
