import geocodeAddress from "./geocoding";

const geocodeReferees = async (referees) => {
    const defaultLocation = { lat: -37.8136, lng: 144.9631 }; // Melbourne CBD

    const updatedReferees = await Promise.all(
        referees.map(async (referee) => {
            try {
                const coordinates = await geocodeAddress(referee.address);
                return { ...referee, location: coordinates };
            } catch (error) {
                console.error(
                    `Error geocoding address for ${referee.name}:`,
                    error,
                );
                return { ...referee, location: defaultLocation };
            }
        }),
    );
    return updatedReferees;
};

export default geocodeReferees;
