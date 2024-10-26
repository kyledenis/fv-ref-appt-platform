import React, { useState } from "react";
import RefereeManagement from "./RefereeManagement";
import GeographicalViewTest from "./components/GeographicalViewTest";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { APIProvider } from "@vis.gl/react-google-maps";

function App() {
    const [activeComponent, setActiveComponent] = useState("home");

    const renderComponent = () => {
        switch (activeComponent) {
            case "home":
                return <RefereeManagement />;
            case "geoView":
                return <GeographicalViewTest />;
            default:
                return <RefereeManagement />;
        }
    };

    return (
        <div className="App">
            <APIProvider apiKey={process.env.REACT_APP_API_KEY} onLoad={() => console.log('Maps API has loaded.')}>
            <nav className="bg-blue-500 p-4">
                <h1 className="text-white text-xl font-semibold">
                    Temporary header for test pages
                </h1>
                <hr className="my-2" />
                <ul className="flex space-x-4">
                    <li>
                        <button
                            onClick={() => setActiveComponent("home")}
                            className="text-white hover:underline"
                        >
                            Home
                        </button>
                    </li>
                    <li>
                        <button
                            onClick={() => setActiveComponent("geoView")}
                            className="text-white hover:underline"
                        >
                            Geo View Test
                        </button>
                    </li>
                </ul>
            </nav>
            {renderComponent()}
            <ToastContainer />
            </APIProvider>
        </div>
    );
}

export default App;
