import React from 'react'
import TitleWithBar from './components/TitleWithBar';
import axios from 'axios';
import { toast } from 'react-toastify';

const Availability = ({availabilities, weekDay, getAvailabilityForReferee}) => {
    const generalAvailability = []
    const specificAvaialbility = []
    for(let availability of availabilities) {
        if (availability.date) {
            specificAvaialbility.push(availability);
        }
        else {
            generalAvailability.push(availability);
        }
    }

    const deleteAvailability = async (availabilityID) => {
        console.log(availabilityID);
        const response = await axios.delete(`http://localhost:8000/api/availability/${availabilityID}/`);
        if (response.status == 204) {
            getAvailabilityForReferee();
        }
    }
  return (
    <div>
        <TitleWithBar title="General availability" />
            <div className="container mx-auto mt-6 grid grid-cols-3 gap-6">
            <table className="min-w-full bg-white col-span-2">
                <thead>
                    <tr>
                        <th className="px-3 py-3 border-b-2 border-gray-400 text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Availability type
                        </th>
                        <th className="px-3 py-3 border-b-2 border-gray-400 text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Available weekday
                        </th>
                        <th className="px-3 py-3 border-b-2 border-gray-400 text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Available start time
                        </th>
                        <th className="px-3 py-3 border-b-2 border-gray-400 text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Available end time
                        </th>
                        <th className="px-3 py-3 border-b-2 border-gray-400 text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Remove availability
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {generalAvailability.map((availability) => (
                        <tr key={availability.availableID}>
                            <td className="px-3 py-3 whitespace-no-wrap border-b border-gray-200 text-center">
                                {availability.availableType}
                            </td>
                            <td className="px-3 py-3 whitespace-no-wrap border-b border-gray-200 text-center">
                                {weekDay[availability.weekday]}
                            </td>
                            <td className="px-3 py-3 whitespace-no-wrap border-b border-gray-200 text-center">
                                {availability.start_time ? availability.start_time : "Any time"}
                            </td>
                            <td className="px-3 py-3 whitespace-no-wrap border-b border-gray-200 text-center">
                                {availability.end_time ? availability.end_time : "Any time"}
                            </td>
                            <td className="px-3 py-3 whitespace-no-wrap border-b border-gray-200 text-center">
                                <button onClick={() => {deleteAvailability(availability.availableID)}} type="button" class="text-gray-900 bg-gradient-to-r from-teal-200 to-lime-200 hover:bg-gradient-to-l hover:from-teal-200 hover:to-lime-200 focus:ring-4 focus:outline-none focus:ring-lime-200 dark:focus:ring-teal-700 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2">Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {/* News and Messages */}
            <div>
                        <TitleWithBar title="News and Messages" />
                        <div className="bg-white shadow rounded-lg p-4">
                            <p className="text-gray-500">
                                There are no messages to display.
                            </p>
                        </div>
            </div>
            </div>
            <TitleWithBar title="Specific availability" />
            <div className="container mx-auto mt-6 grid grid-cols-3 gap-6">
            <table className="min-w-full bg-white col-span-2">
                <thead>
                    <tr>
                        <th className="px-3 py-3 border-b-2 border-gray-400 text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Availability type
                        </th>
                        <th className="px-3 py-3 border-b-2 border-gray-400 text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Available date
                        </th>
                        <th className="px-3 py-3 border-b-2 border-gray-400 text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Available start time
                        </th>
                        <th className="px-3 py-3 border-b-2 border-gray-400 text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Available end time
                        </th>
                        <th className="px-3 py-3 border-b-2 border-gray-400 text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Remove availability
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {specificAvaialbility.map((availability) => (
                        <tr key={availability.availableID}>
                            <td className="px-3 py-3 whitespace-no-wrap border-b border-gray-200 text-center">
                                {availability.availableType}
                            </td>
                            <td className="px-3 py-3 whitespace-no-wrap border-b border-gray-200 text-center">
                                {availability.date}
                            </td>
                            <td className="px-3 py-3 whitespace-no-wrap border-b border-gray-200 text-center">
                                {availability.start_time ? availability.start_time : "Any time"}
                            </td>
                            <td className="px-3 py-3 whitespace-no-wrap border-b border-gray-200 text-center">
                                {availability.endTime ? availability.end_time : "Any time"}
                            </td>
                            <td className="px-3 py-3 whitespace-no-wrap border-b border-gray-200 text-center">
                                <button onClick={() => {deleteAvailability(availability.availableID)}} type="button" class="text-gray-900 bg-gradient-to-r from-teal-200 to-lime-200 hover:bg-gradient-to-l hover:from-teal-200 hover:to-lime-200 focus:ring-4 focus:outline-none focus:ring-lime-200 dark:focus:ring-teal-700 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2">Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            </div>
    </div>
  )
}

export default Availability