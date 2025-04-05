export const timeToMinutes = (time) => {
    console.log("time split  : ", time)
    const [hours, minutes, seconds] = time.split(":").map(Number);
    return hours * 60 + minutes;
};

export const minutesToTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:00`;
}

