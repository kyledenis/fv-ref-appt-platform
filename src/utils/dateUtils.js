// Convert a Date object to a string in YYYY-MM-DD format
export const dateToString = (date) => {
    return date.toISOString().split("T")[0];
};

// Convert a string in YYYY-MM-DD format to a Date object
export const stringToDate = (dateString) => {
    return new Date(dateString + "T00:00:00Z");
};

// Get the day index (0-6) where 0 is Monday and 6 is Sunday
export const getDayIndex = (date) => {
    const day = date.getDay();
    return day === 0 ? 6 : day - 1;
};

// Generate an array of date strings for a given month and year
export const getMonthDates = (year, month) => {
    const dates = [];
    const date = new Date(year, month, 1);
    while (date.getMonth() === month) {
        dates.push(dateToString(date));
        date.setDate(date.getDate() + 1);
    }
    return dates;
};

// Check if a date is within a given range
export const isDateInRange = (date, startDate, endDate) => {
    return date >= startDate && date <= endDate;
};
