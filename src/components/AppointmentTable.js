import React from "react";
import Button from "./Button";

const AppointmentTable = ({ appointments, onViewMatch }) => {
    const getStatusColor = (status) => {
        if (!status) return "bg-gray-500 text-white";
        switch (status.toLowerCase()) {
            case "confirmed":
                return "bg-green-500 text-white";
            case "pending":
                return "bg-yellow-500 text-white";
            case "declined":
                return "bg-red-500 text-white";
            default:
                return "bg-gray-500 text-white";
        }
    };

    return (
        <table className="min-w-full bg-white">
            <thead>
                <tr>
                    <th className="px-3 py-3 border-b-2 border-gray-400 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Competition
                    </th>
                    <th className="px-3 py-3 border-b-2 border-gray-400 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                    </th>
                    <th className="px-3 py-3 border-b-2 border-gray-400 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                    </th>
                    <th className="px-3 py-3 border-b-2 border-gray-400 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Time
                    </th>
                    <th className="px-3 py-3 border-b-2 border-gray-400 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Teams
                    </th>
                    <th className="px-3 py-3 border-b-2 border-gray-400 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Venue
                    </th>
                    <th className="px-3 py-3 border-b-2 border-gray-400 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                    </th>
                    <th className="px-3 py-3 border-b-2 border-gray-400 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                    </th>
                </tr>
            </thead>
            <tbody>
                {appointments.map((appointment) => (
                    <tr key={appointment.id}>
                        <td className="px-3 py-3 whitespace-no-wrap border-b border-gray-200 text-left">
                            {appointment.competition}
                        </td>
                        <td className="px-3 py-3 whitespace-no-wrap border-b border-gray-200 text-left">
                            {appointment.type}
                        </td>
                        <td className="px-3 py-3 whitespace-no-wrap border-b border-gray-200 text-left">
                            {appointment.date}
                        </td>
                        <td className="px-3 py-3 whitespace-no-wrap border-b border-gray-200 text-left">
                            {appointment.time}
                        </td>
                        <td className="px-3 py-3 whitespace-no-wrap border-b border-gray-200 text-left">
                            {appointment.teams}
                        </td>
                        <td className="px-3 py-3 whitespace-no-wrap border-b border-gray-200 text-left">
                            {appointment.venue}
                        </td>
                        <td className="px-3 py-3 whitespace-no-wrap border-b border-gray-200 text-center">
                            <span
                                className={`px-3 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                                    appointment.status,
                                )}`}
                            >
                                {appointment.status || "Unknown"}
                            </span>
                        </td>
                        <td className="px-3 py-3 whitespace-no-wrap border-b border-gray-200 text-center">
                            <Button onClick={() => onViewMatch(appointment)}>
                                View
                            </Button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default AppointmentTable;
