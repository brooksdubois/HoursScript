// modes.ts
import { Temporal } from "@js-temporal/polyfill";
import { askTime } from "./timeParser";
import { createDateTime } from "./helpers";
import { WorkdayCalculator } from "./workday";
import {
    displayLunchSummary,
    displayLeaveByResults,
    displayWorkSummary,
    displayInsufficientTimeError
} from "./display";
import { TimeContext } from "./types";
import {validateTimeSequence} from "./validators";

export const handleDefaultMode = async (
    date: Temporal.PlainDate,
    dtClockIn: Temporal.PlainDateTime,
    dtLunchOut: Temporal.PlainDateTime
): Promise<void> => {
    const lunchIn = await askTime(
        'What time did you clock back in after lunch?',
        TimeContext.LUNCH_IN,
        dtLunchOut.toPlainTime()
    );

    validateTimeSequence(
        dtClockIn.toPlainTime(),
        dtLunchOut.toPlainTime(),
        lunchIn
    );

    const calculator = new WorkdayCalculator(dtClockIn);
    const dtLunchIn = createDateTime(date, lunchIn);
    const lunchDuration = dtLunchIn.since(dtLunchOut);
    const expectedClockOut = calculator.calculateExpectedClockOut(lunchDuration);

    displayLunchSummary(lunchDuration, expectedClockOut.toPlainTime());
};

export const handleLeaveByMode = async (
    date: Temporal.PlainDate,
    dtClockIn: Temporal.PlainDateTime,
    dtLunchOut: Temporal.PlainDateTime
): Promise<void> => {
    const leaveBy = await askTime(
        'What time do you want to leave by?',
        TimeContext.LEAVE_BY
    );
    const dtLeaveBy = createDateTime(date, leaveBy);

    const calculator = new WorkdayCalculator(dtClockIn);

    if (!calculator.hasTimeForLunch(dtLeaveBy)) {
        displayInsufficientTimeError(leaveBy);
        process.exit(1);
    }

    const maxLunchDuration = calculator.calculateMaxLunchDuration(dtLeaveBy);
    const lunchReturnTime = calculator.calculateLunchReturnTime(dtLunchOut, maxLunchDuration);

    displayLeaveByResults(leaveBy, maxLunchDuration, lunchReturnTime.toPlainTime());
};

export const handleFullClockOutFlow = async (
    date: Temporal.PlainDate,
    clockIn: Temporal.PlainTime,
    dtClockIn: Temporal.PlainDateTime,
    dtLunchOut: Temporal.PlainDateTime,
    lunchOut: Temporal.PlainTime
): Promise<void> => {
    const lunchIn = await askTime(
        'What time did you clock back in after lunch?',
        TimeContext.LUNCH_IN,
        lunchOut
    );

    validateTimeSequence(clockIn, lunchOut, lunchIn);

    const clockOut = await askTime(
        'What time did you clock out?',
        TimeContext.CLOCK_OUT
    );
    validateTimeSequence(dtClockIn.toPlainTime(), lunchIn, clockOut);

    const calculator = new WorkdayCalculator(dtClockIn);
    const dtLunchIn = createDateTime(date, lunchIn);
    const dtClockOut = createDateTime(date, clockOut);
    const lunchDuration = dtLunchIn.since(dtLunchOut);
    const totalWorked = calculator.calculateTotalWorked(dtClockOut, lunchDuration);

    displayWorkSummary(clockOut, lunchDuration, totalWorked);
};