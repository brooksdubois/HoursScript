// display.ts
import chalk from "chalk";
import { Temporal } from "@js-temporal/polyfill";
import { output } from "./output";
import { formatDuration, formatTime12Hour } from "./helpers";
import {WorkDurationError} from "./errorHandling";

export const displayLunchSummary = (
    lunchDuration: Temporal.Duration,
    expectedClockOut: Temporal.PlainTime
): void => {
  output`
    🍽️ You were at lunch for ${chalk.magenta(formatDuration(lunchDuration))}.
    🏁 To clock out on time, you need to leave by ⏳ ${chalk.greenBright.bold(formatTime12Hour(expectedClockOut))}.
  `;
};

export const displayLeaveByResults = (
    leaveByTime: Temporal.PlainTime,
    maxLunchDuration: Temporal.Duration,
    lunchReturnTime: Temporal.PlainTime
): void => {
  output`
    🕔 Target leave time: ${chalk.yellow(formatTime12Hour(leaveByTime))}.
    🍽️ You can spend ${chalk.magenta(formatDuration(maxLunchDuration))} at lunch.
    🚨 Be back by ${chalk.redBright(formatTime12Hour(lunchReturnTime))} sharp!
  `;
};

export const displayWorkSummary = (
    clockOutTime: Temporal.PlainTime,
    lunchDuration: Temporal.Duration,
    totalWorked: Temporal.Duration
): void => {
  output`
    🕓 You clocked out at ${chalk.green(formatTime12Hour(clockOutTime))}.
    🍽️ Lunch break was ${chalk.magenta(formatDuration(lunchDuration))}.
    📊 Total time on the clock: ${chalk.cyanBright(formatDuration(totalWorked))}.
  `;
};

export const displayInsufficientTimeError = (leaveByTime: Temporal.PlainTime): never => {
  throw new WorkDurationError(
      `No time left for lunch if you want to leave by ${formatTime12Hour(leaveByTime)}. Try again with a later time or reduce your workday expectations. 😅`
  );
};