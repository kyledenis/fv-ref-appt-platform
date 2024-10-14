import React from "react";

const Button = ({
    children,
    onClick,
    type = "button",
    variant = "primary",
    className = "",
    disabled = false,
}) => {
    const baseClasses =
        "py-1 px-4 rounded focus:outline-none focus:shadow-outline";
    const variantClasses = {
        primary: "bg-blue-500 hover:bg-blue-700 text-white",
        secondary: "bg-gray-500 hover:bg-gray-700 text-white",
        danger: "bg-red-500 hover:bg-red-700 text-white",
    };

    return (
        <button
            type={type}
            onClick={onClick}
            className={`${baseClasses} ${
                variantClasses[variant]
            } ${className} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
            disabled={disabled}
        >
            {children}
        </button>
    );
};

export default Button;
