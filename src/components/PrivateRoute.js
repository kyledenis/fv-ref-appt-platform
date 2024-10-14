import React from "react";
import { Navigate } from "react-router-dom";
import { useAppContext } from "../contexts/AppContext";

const PrivateRoute = ({ children }) => {
    const { user } = useAppContext();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default PrivateRoute;
