export const mockUser = {
    id: 1,
    username: "admin",
    firstName: "Admin",
    lastName: "User",
    email: "admin@example.com",
    phone: "+1234567890",
    personId: "P12345",
    ffaNumber: "FFA98765",
    qualifications: ["FIFA Referee", "National Referee", "Youth Referee"],
    settings: {
        emailNotifications: true,
        smsNotifications: false,
        language: "en",
        timezone: "UTC",
    },
};

export const mockAppointments = [
    {
        id: 1,
        competition: "Premier League",
        type: "Match",
        date: "2024-10-15",
        time: "15:00",
        teams: "Team A vs Team B",
        venue: "MCG",
        status: "Confirmed",
    },
    {
        id: 2,
        competition: "Cup",
        type: "Final",
        date: "2024-10-20",
        time: "18:00",
        teams: "Team C vs Team D",
        venue: "AAMI Park",
        status: "Pending",
    },
    {
        id: 3,
        competition: "League One",
        type: "Match",
        date: "2024-10-25",
        time: "14:00",
        teams: "Team E vs Team F",
        venue: "Sydenham Park Soccer Club",
        status: "Confirmed",
    },
];

export const mockTeams = [
    { id: 1, name: "Team A", league: "Premier League" },
    { id: 2, name: "Team B", league: "Premier League" },
    { id: 3, name: "Team C", league: "Cup" },
    { id: 4, name: "Team D", league: "Cup" },
    { id: 5, name: "Team E", league: "League One" },
    { id: 6, name: "Team F", league: "League One" },
];

export const mockVenues = [
    { id: 1, name: "MCG", capacity: 50000, location: "Melbourne" },
    { id: 2, name: "AAMI Park", capacity: 40000, location: "City B" },
    { id: 3, name: "Sydenham Park Soccer Club", capacity: 30000, location: "City C" },
];

export const mockReferees = [
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

export const mockAvailableDates = ["2024-10-07", "2024-10-14", "2024-10-21"];
export const mockUnavailableDates = ["2024-10-10", "2024-10-17", "2024-10-24"];
