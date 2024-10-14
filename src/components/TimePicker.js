import React from "react";

const TimePicker = ({ value, onChange, className = "" }) => {
    const generateTimeOptions = () => {
        const options = [];
        for (let hour = 0; hour < 24; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                const time = `${hour.toString().padStart(2, "0")}:${minute
                    .toString()
                    .padStart(2, "0")}`;
                options.push(
                    <option key={time} value={time}>
                        {time}
                    </option>,
                );
            }
        }
        return options;
    };

    return (
        <select
            className={`w-full p-2 border rounded ${className}`}
            value={value}
            onChange={(e) => onChange(e.target.value)}
        >
            {generateTimeOptions()}
        </select>
    );
};

export default TimePicker;
