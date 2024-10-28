import React, { useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";
import { geocodeAddress } from "../utils/geocoding";
import { loadGoogleMapsScript } from "../utils/loadGoogleMapsScript";

const AddressInput = ({
    value,
    onChange,
    onLocationSelect,
    placeholder = "Enter address or venue",
    className = "",
    isSearching = false,
}) => {
    const inputRef = useRef(null);
    const autocompleteRef = useRef(null);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const loadPlacesLibrary = () => {
            if (!window.google) {
                // Load script if not already loaded
                const script = document.createElement("script");
                script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&libraries=places`;
                script.async = true;
                script.defer = true;
                document.head.appendChild(script);

                script.onload = initializeAutocomplete;
                script.onerror = () =>
                    console.error("Failed to load Google Maps script");
            } else {
                initializeAutocomplete();
            }
        };

        const initializeAutocomplete = async () => {
            try {
                await loadGoogleMapsScript();
                if (inputRef.current && window.google?.maps?.places) {
                    const autocomplete =
                        new window.google.maps.places.Autocomplete(
                            inputRef.current,
                            {
                                componentRestrictions: { country: "AU" },
                                fields: [
                                    "formatted_address",
                                    "geometry",
                                    "name",
                                    "place_id",
                                    "address_components",
                                ],
                            },
                        );

                    autocomplete.addListener("place_changed", async () => {
                        const place = autocomplete.getPlace();

                        if (place.geometry) {
                            const location = {
                                coordinates: {
                                    lat: place.geometry.location.lat(),
                                    lng: place.geometry.location.lng(),
                                },
                                formattedAddress:
                                    place.formatted_address || place.name,
                                placeId: place.place_id,
                                addressComponents: place.address_components,
                            };

                            onChange(location.formattedAddress);
                            onLocationSelect && onLocationSelect(location);
                        } else {
                            // Fallback to geocoding
                            const geocodeResult = await geocodeAddress(
                                place.name,
                            );
                            if (geocodeResult) {
                                onChange(geocodeResult.formattedAddress);
                                onLocationSelect &&
                                    onLocationSelect(geocodeResult);
                            }
                        }
                    });

                    autocompleteRef.current = autocomplete;
                    setIsLoaded(true);
                }
            } catch (error) {
                console.error("Error initializing autocomplete:", error);
            }
        };

        loadPlacesLibrary();

        return () => {
            if (autocompleteRef.current) {
                window.google?.maps?.event?.clearInstanceListeners(
                    autocompleteRef.current,
                );
            }
        };
    }, [onLocationSelect, onChange]);

    const handleManualEntry = (e) => {
        const manualAddress = e.target.value;
        onChange(manualAddress);
    };

    const handleKeyDown = async (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            if (value && !autocompleteRef.current?.getPlace()) {
                const geocodeResult = await geocodeAddress(value);
                if (geocodeResult) {
                    onChange(geocodeResult.formattedAddress);
                    onLocationSelect && onLocationSelect(geocodeResult);
                }
            }
        }
    };

    return (
        <div className="relative flex-1">
            <div className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    value={value}
                    onChange={handleManualEntry}
                    onKeyDown={handleKeyDown}
                    disabled={isSearching}
                    className={`w-full pl-10 pr-4 py-2 rounded-md border focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className} ${
                        isSearching ? "bg-gray-100" : "bg-white"
                    }`}
                    placeholder={placeholder}
                />
                <MapPin
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={18}
                />
            </div>
        </div>
    );
};

export default AddressInput;
