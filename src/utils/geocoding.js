const geocodeAddress = async (address) => {
    const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
    const encodedAddress = encodeURIComponent(address);
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.status === "OK") {
            const { lat, lng } = data.results[0].geometry.location;
            return { lat, lng };
        } else {
            console.error("Geocoding response:", data);
            throw new Error(
                `Geocoding failed: ${data.status} - ${
                    data.error_message || "No error message provided"
                }`,
            );
        }
    } catch (error) {
        console.error("Error during geocoding:", error);
        throw error;
    }
};

export default geocodeAddress;
