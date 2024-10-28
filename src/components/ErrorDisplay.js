import React from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";
import Button from "./Button";

const ErrorDisplay = ({
    error,
    onRetry,
    message = "An error occurred",
    fullScreen = false,
}) => {
    const errorContent = (
        <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {message}
            </h3>
            {error && (
                <p className="text-sm text-gray-600 mb-4">
                    {typeof error === "string" ? error : error.message}
                </p>
            )}
            {onRetry && (
                <Button onClick={onRetry} className="inline-flex items-center">
                    <RefreshCcw className="h-4 w-4 mr-2" />
                    Try Again
                </Button>
            )}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-75 z-50">
                <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
                    {errorContent}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white shadow-lg rounded-lg p-6 my-4">
            {errorContent}
        </div>
    );
};

export default ErrorDisplay;
