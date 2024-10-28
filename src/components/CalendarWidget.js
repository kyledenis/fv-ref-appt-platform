import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useAppContext } from "../contexts/AppContext";
import Button from "./Button";

const CalendarWidget = ({ isWidget = false }) => {
    const { availableDates, unavailableDates } = useAppContext();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);
    const [calendarDays, setCalendarDays] = useState([]);
    const { user } = useAppContext();

    const changeMonth = (increment) => {
        setCurrentDate((prevDate) => {
            const newDate = new Date(prevDate);
            newDate.setMonth(newDate.getMonth() + increment);
            return newDate;
        });
    };

    const goToToday = () => {
        setCurrentDate(new Date());
    };

    const isDateAvailable = (dateString) => {
        return availableDates.includes(dateString);
    };

    const isDateUnavailable = (dateString) => {
        return unavailableDates.includes(dateString);
    };

    useEffect(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const today = new Date();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const days = [];

        // Adjust for Monday start (0 = Monday, 6 = Sunday)
        const startDay = (firstDayOfMonth + 6) % 7;

        for (let i = 0; i < startDay; i++) {
            days.push({ type: "empty", key: `empty-${i}` });
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dateString = date.toISOString().split("T")[0];
            const dayIndex = (date.getDay() + 6) % 7;
            const isAvailable = availableDates.includes(dateString);
            const isUnavailable = unavailableDates.includes(dateString);

            days.push({
                type: "day",
                key: dateString,
                day,
                dateString,
                dayIndex,
                isToday: date.toDateString() === today.toDateString(),
                isAvailable,
                isUnavailable,
            });
        }

        setCalendarDays(days);
    }, [currentDate, availableDates, unavailableDates]);

    const renderCalendarDay = (dayInfo) => {
        if (dayInfo.type === "empty") {
            return <div key={dayInfo.key} className="p-2"></div>;
        }

        return (
            <button
                key={dayInfo.key}
                onClick={() => setSelectedDate(dayInfo.dateString)}
                className={`p-2 relative flex items-center justify-center w-full h-full ${
                    selectedDate === dayInfo.dateString ? "bg-blue-200" : ""
                } ${
                    dayInfo.isToday ? "text-blue-500 font-bold" : ""
                } hover:bg-gray-100`}
            >
                <span
                    className={`${
                        dayInfo.isToday
                            ? "w-7 h-7 flex items-center justify-center rounded-full bg-blue-100"
                            : ""
                    }`}
                >
                    {dayInfo.day}
                </span>
                {dayInfo.isAvailable && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-green-600 rounded-sm"></div>
                )}
                {dayInfo.isUnavailable && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-600 rounded-sm"></div>
                )}
            </button>
        );
    };

    return (
        <div className="bg-white shadow rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-lg">
                    {currentDate.toLocaleString("default", {
                        month: "long",
                        year: "numeric",
                    })}
                </h3>
                <div className="flex items-center">
                    <Button
                        onClick={goToToday}
                        className="mr-2 text-sm py-1 px-2"
                    >
                        Today
                    </Button>
                    <button className="mr-2" onClick={() => changeMonth(-1)}>
                        <ChevronLeft size={20} />
                    </button>
                    <button onClick={() => changeMonth(1)}>
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>
            <div className="grid grid-cols-7 gap-1">
                {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map(
                    (day) => (
                        <div
                            key={day}
                            className="font-semibold text-gray-500 text-sm text-center"
                        >
                            {day}
                        </div>
                    ),
                )}
                {calendarDays.map(renderCalendarDay)}
            </div>
        </div>
    );
};

export default CalendarWidget;
