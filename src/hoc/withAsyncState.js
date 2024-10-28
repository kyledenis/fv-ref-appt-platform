import React from "react";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorDisplay from "../components/ErrorDisplay";

const withAsyncState = (WrappedComponent) => {
    return function WithAsyncStateComponent({
        loading,
        error,
        onRetry,
        loadingMessage,
        errorMessage,
        fullScreen = false,
        ...props
    }) {
        if (loading) {
            return (
                <LoadingSpinner
                    fullScreen={fullScreen}
                    message={loadingMessage}
                />
            );
        }

        if (error) {
            return (
                <ErrorDisplay
                    error={error}
                    onRetry={onRetry}
                    message={errorMessage}
                    fullScreen={fullScreen}
                />
            );
        }

        return <WrappedComponent {...props} />;
    };
};

export default withAsyncState;
