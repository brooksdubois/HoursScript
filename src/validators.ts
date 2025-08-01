import { TimeValidationError, WorkDurationError } from "./errorHandling";
import {Temporal} from "@js-temporal/polyfill";
import {createDateTime} from "./helpers";

export const validateTimeSequence = (
    clockIn: Temporal.PlainTime,
    lunchOut: Temporal.PlainTime,
    lunchIn?: Temporal.PlainTime
): void => {
    if (Temporal.PlainTime.compare(lunchOut, clockIn) <= 0) {
        throw new TimeValidationError('Lunch out time must be after clock-in time.');
    }

    if (lunchIn && Temporal.PlainTime.compare(lunchIn, lunchOut) <= 0) {
        throw new TimeValidationError('Lunch return time must be after lunch out time.');
    }
};

export const validateWorkDurationBeforeLunch = (
    clockIn: Temporal.PlainTime,
    lunchOut: Temporal.PlainTime,
    maxHoursBeforeLunch: number = 8
): void => {
    const tempDate = Temporal.PlainDate.from('2025-01-01');
    const dtClockIn = createDateTime(tempDate, clockIn);
    const dtLunchOut = createDateTime(tempDate, lunchOut);

    const hoursWorked = dtLunchOut.since(dtClockIn).total({ unit: 'hours' });

    if (hoursWorked >= maxHoursBeforeLunch) {
        throw new WorkDurationError(
            `You've already worked ${Math.floor(hoursWorked)} hours straight!`,
            Math.floor(hoursWorked)
        );
    }
};