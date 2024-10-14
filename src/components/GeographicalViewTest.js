import React, { useState } from "react";
import GeographicalView from "./GeographicalView";

const GeographicalViewTest = () => {
    const [filters, setFilters] = useState({
        availability: false,
        level: "",
        minAge: "",
        minExperience: "",
        qualification: "",
        distance: 50,
    });

    const mockReferees = [
        {
            id: 1,
            name: "John Doe",
            location: { lat: -37.8136, lng: 144.9631 },
            level: "Senior",
            isAvailable: true,
            age: 35,
            experienceYears: 10,
            qualifications: ["FIFA", "National"],
        },
        {
            id: 2,
            name: "Jane Smith",
            location: { lat: -37.8235, lng: 144.9523 },
            level: "Junior",
            isAvailable: false,
            age: 25,
            experienceYears: 3,
            qualifications: ["Regional"],
        },
        {
            id: 3,
            name: "Bob Johnson",
            location: { lat: -37.803, lng: 144.97 },
            level: "Intermediate",
            isAvailable: true,
            age: 30,
            experienceYears: 7,
            qualifications: ["National"],
        },
        {
            id: 4,
            name: "Alice Brown",
            location: { lat: -37.818, lng: 144.953 },
            level: "Senior",
            isAvailable: true,
            age: 40,
            experienceYears: 15,
            qualifications: ["FIFA", "National", "Youth"],
        },
        {
            id: 5,
            name: "Charlie Davis",
            location: { lat: -37.81, lng: 144.96 },
            level: "Junior",
            isAvailable: true,
            age: 22,
            experienceYears: 2,
            qualifications: ["Regional", "Youth"],
        },
    ];

    const mockVenues = [
        {
            id: 1,
            name: "Melbourne Cricket Ground",
            location: { lat: -37.82, lng: 144.9834 },
        },
        { id: 2, name: "AAMI Park", location: { lat: -37.825, lng: 144.9833 } },
        {
            id: 3,
            name: "Lakeside Stadium",
            location: { lat: -37.8407, lng: 144.966 },
        },
        {
            id: 4,
            name: "Olympic Park Oval",
            location: { lat: -37.8255, lng: 144.9811 },
        },
    ];

    const handleFilterChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFilters((prevFilters) => ({
            ...prevFilters,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Geographical View Test</h1>
            <div className="mb-4 grid grid-cols-2 gap-4">
                <label className="block">
                    <input
                        type="checkbox"
                        name="availability"
                        checked={filters.availability}
                        onChange={handleFilterChange}
                        className="mr-2"
                    />
                    Available Only
                </label>
                <label className="block">
                    <span className="mr-2">Level:</span>
                    <select
                        name="level"
                        value={filters.level}
                        onChange={handleFilterChange}
                        className="border p-1"
                    >
                        <option value="">All</option>
                        <option value="Junior">Junior</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Senior">Senior</option>
                    </select>
                </label>
                <label className="block">
                    <span className="mr-2">Min Age:</span>
                    <input
                        type="number"
                        name="minAge"
                        value={filters.minAge}
                        onChange={handleFilterChange}
                        className="border p-1 w-20"
                    />
                </label>
                <label className="block">
                    <span className="mr-2">Min Experience (years):</span>
                    <input
                        type="number"
                        name="minExperience"
                        value={filters.minExperience}
                        onChange={handleFilterChange}
                        className="border p-1 w-20"
                    />
                </label>
                <label className="block">
                    <span className="mr-2">Qualification:</span>
                    <select
                        name="qualification"
                        value={filters.qualification}
                        onChange={handleFilterChange}
                        className="border p-1"
                    >
                        <option value="">All</option>
                        <option value="FIFA">FIFA</option>
                        <option value="National">National</option>
                        <option value="Regional">Regional</option>
                        <option value="Youth">Youth</option>
                    </select>
                </label>
                <label className="block">
                    <span className="mr-2">Max Distance (km):</span>
                    <input
                        type="number"
                        name="distance"
                        value={filters.distance}
                        onChange={handleFilterChange}
                        className="border p-1 w-20"
                    />
                </label>
            </div>
            <GeographicalView
                referees={mockReferees}
                venues={mockVenues}
                filters={filters}
            />
        </div>
    );
};

export default GeographicalViewTest;
