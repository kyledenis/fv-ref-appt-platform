import React from "react";
import { Loader } from "lucide-react";

const LoadingSpinner = ({
    size = "default",
    fullScreen = false,
    message = "Loading...",
}) => {
    const sizeClasses = {
        small: "h-4 w-4",
        default: "h-8 w-8",
        large: "h-12 w-12",
    };

    const spinnerContent = (
        <div className="flex flex-col items-center justify-center">
            <Loader
                className={`${sizeClasses[size]} animate-spin text-blue-500`}
            />
            {message && <p className="mt-2 text-gray-600">{message}</p>}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-75 z-50">
                {spinnerContent}
            </div>
        );
    }

    return <div className="flex justify-center p-4">{spinnerContent}</div>;
};

export default LoadingSpinner;
