import React, { useEffect, useState } from 'react'
import {APIProvider, Map, MapCameraChangedEvent, Pin, AdvancedMarker} from '@vis.gl/react-google-maps';
import { X } from 'lucide-react';
import { useRef } from 'react';
import axios from 'axios';

const MapModal = ({location, availabilityModal, setShowAvailabilityModal}) => {
  const modalRef = useRef(null);
  const [longitude, setLongitude] = useState(0);
  const [latitude, setLatitude] = useState(0);
  useEffect(() => {
        getLongLat();
  }, [])
  const getLongLat = async () => {
    console.log(location)
    const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${location}&key=${process.env.REACT_APP_API_KEY}`);
    console.log(response.data)
    if (response.data.results.length != 0) {
        setLongitude(response.data.results[0].geometry.location.lng);
        setLatitude(response.data.results[0].geometry.location.lat);
        console.log(typeof(longitude))
        console.log(typeof(latitude))
    }
    else {
        const latitude = -33.860664;
        const longitude = 151.208138;
        setLongitude(longitude);
        setLatitude(latitude);
    }
  }
  return (
    <>
    {
    availabilityModal &&
    (<div ref={modalRef} className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
                    <div className="bg-white p-6 rounded-lg relative">
                     <button
                            onClick={() => {
                                setShowAvailabilityModal(false);
                            }}
                            className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
                        >
                            <X size={24} />
                    </button>
                    <h3 className="text-lg font-semibold mb-4">
                        Venue Geographic
                    </h3>
                    <Map
                        style={{width: 800, height: 500}}
                        defaultZoom={13}
                        center={ { lat: latitude, lng: longitude } }
                        mapId={'61bedfe17c6682da'} >
                        <AdvancedMarker
                                key={location}
                                position={{ lat: latitude, lng: longitude }}>
                                <Pin background={'red'} glyphColor={'brown'} borderColor={'#000'} />
                        </AdvancedMarker>    
                    </Map>
                    </div>
    </div>)
    }
    </>
  )
}

export default MapModal