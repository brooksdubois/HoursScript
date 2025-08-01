// workday.ts
import { Temporal } from "@js-temporal/polyfill";
import {TimeContext} from "./types";

export class WorkdayCalculator {
    private readonly WORK_DAY_HOURS = 8;

    constructor(
        private readonly clockInTime: Temporal.PlainDateTime,
        private readonly workDayHours: number = 8
    ) {}

    /**
     * Calculate when you should clock out based on lunch duration
     */
    calculateExpectedClockOut(lunchDuration: Temporal.Duration): Temporal.PlainDateTime {
        return this.clockInTime.add({ hours: this.workDayHours }).add(lunchDuration);
    }

    /**
     * Calculate maximum lunch duration to leave by a specific time
     */
    calculateMaxLunchDuration(leaveByTime: Temporal.PlainDateTime): Temporal.Duration {
        const workEndTarget = this.clockInTime.add({ hours: this.workDayHours });
        return leaveByTime.since(workEndTarget);
    }

    /**
     * Calculate total time worked
     */
    calculateTotalWorked(
        clockOutTime: Temporal.PlainDateTime,
        lunchDuration: Temporal.Duration
    ): Temporal.Duration {
        return clockOutTime.since(this.clockInTime).subtract(lunchDuration);
    }

    /**
     * Calculate when to return from lunch based on max lunch duration
     */
    calculateLunchReturnTime(
        lunchOutTime: Temporal.PlainDateTime,
        maxLunchDuration: Temporal.Duration
    ): Temporal.PlainDateTime {
        return lunchOutTime.add(maxLunchDuration);
    }

    /**
     * Check if there's enough time for lunch given a leave-by time
     */
    hasTimeForLunch(leaveByTime: Temporal.PlainDateTime): boolean {
        const maxLunchDuration = this.calculateMaxLunchDuration(leaveByTime);
        return maxLunchDuration.total({ unit: 'minutes' }) > 0;
    }
}

export const inferAmPm: Record<TimeContext, (hour: number, prevTime?: Temporal.PlainTime) => 'AM' | 'PM'> = {
    [TimeContext.CLOCK_IN]: () =>  'AM',
    [TimeContext.LUNCH_IN]: (hour, prevTime) => {
        if (!prevTime) return 'PM';
        const amHour = hour === 12 ? 0 : hour;
        const pmHour = hour === 12 ? 12 : hour + 12;
        if (amHour > prevTime.hour ||
            (amHour === prevTime.hour && amHour > prevTime.minute)) {
            return 'AM';
        }
        if (pmHour > prevTime.hour ||
            (pmHour === prevTime.hour && pmHour > prevTime.minute)) {
            return 'PM';
        }
        return 'PM';
    },
    [TimeContext.LUNCH_OUT]: (hour, prevTime) => {
        if (!prevTime) return 'PM';
        const amTime = hour === 12 ? 0 : hour;
        return (amTime > prevTime.hour ||
            (amTime === prevTime.hour && prevTime.minute === 0)) ? 'AM' : 'PM';
    },
    [TimeContext.CLOCK_OUT]: () => 'PM',
    [TimeContext.LEAVE_BY]: () => 'PM'
};