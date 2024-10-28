import React from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import "./App.css";
import RefereeManagement from "./RefereeManagement";
import ScheduleManagement from "./Admin_view/ScheduleManagement";

function App() {
    return (
        <Router>
            <div className="App">
                <nav>
                    <ul>
                        <li>
                            <Link to="/referee">Referee View</Link>
                        </li>
                        <li>
                            <Link to="/admin">Admin View</Link>
                        </li>
                    </ul>
                </nav>
                <Routes>
                    <Route path="/referee" element={<RefereeManagement />} />
                    <Route path="/admin" element={<ScheduleManagement />} />
                    <Route path="/" element={<h1>Welcome to the Management Platform</h1>} />
                </Routes>
            </div>
        </Router>
    );
};

export default App;
