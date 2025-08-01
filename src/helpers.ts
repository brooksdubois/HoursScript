import {Temporal} from "@js-temporal/polyfill";

export const createDateTime = (
    date: Temporal.PlainDate, time: Temporal.PlainTime
): Temporal.PlainDateTime => date.toPlainDateTime(time);

export const formatTime12Hour = (time: Temporal.PlainTime): string => {
    let hour = time.hour;
    const minute = time.minute.toString().padStart(2, '0');
    const suffix = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    return `${hour}:${minute} ${suffix}`;
};

export const formatDuration = (dur: Temporal.Duration): string =>
    `${dur.hours}h ${dur.minutes}m`;