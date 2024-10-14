import "./App.css"

import "leaflet/dist/leaflet.css"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import { Icon, divIcon, point } from "leaflet";
import { useEffect, useState } from "react";

const customIcon = new Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/447/447031.png",
    //iconUrl: require("./icons/placeholder.png"),
    iconSize: [38, 38] // size of the icon
  });

  const createClusterCustomIcon = function (cluster) {
    return new divIcon({
      html: `<span class="cluster-icon">${cluster.getChildCount()}</span>`,
      className: "custom-marker-cluster",
      iconSize: point(33, 33, true)
    });
  };
export default function JimmyViewTest() {
    const [referees, setReferees] = useState([]);
    useEffect(() => {
        async function fetchReferees() {
         try {
                const response = await fetch("http://127.0.0.1:8000/api/referee/")
                const data = await response.json();
                const referees = data.referees;

                const geocodedReferees = await Promise.all(
                    referees.map(async (referee) => {
                        const geocode = await geocodeAddress(referee.location);
                        return {
                            geocode: geocode,
                            popUp: `${referee.first_name} - ${referee.location}`,
                        };
                    })
                );

                setReferees(geocodedReferees);
            } catch (error) {
                console.error("Error fetching referees:", error)
            }
        }
        fetchReferees();
    }, []);

    const geocodeAddress = async (address) => {
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
          );
          const data = await response.json();
          console.log(`Geocoding result for "${address}":`, data); // Log the result
          if (data && data.length > 0) {
            return [data[0].lat, data[0].lon]; // Return [lat, lon]
          } else {
            console.error("No geocoding results for:", address);
            return [48.8566, 2.3522]; // Default to Paris coordinates if no result
          }
        } catch (error) {
          console.error("Error fetching geocoding data for address:", address, error);
          return [48.8566, 2.3522]; // Return default coordinates on error
        }
      };
    return (
        <MapContainer center={[48.8566, 2.3522]} zoom={13}>
            <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"/>

        <MarkerClusterGroup
        chunkedLoading
        iconCreateFunction={createClusterCustomIcon}
        >
        {/* Mapping through the markers */}
        {referees.map((referee, index) => (
          <Marker key={index} position={referee.geocode} icon={customIcon}>
            <Popup>{referee.popUp}</Popup>
          </Marker>
        ))}
        </MarkerClusterGroup>
        </MapContainer>
    );
}