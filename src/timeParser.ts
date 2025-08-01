// timeParser.ts
import { Temporal } from "@js-temporal/polyfill";
import { input } from '@inquirer/prompts';
import chalk from "chalk";
import { TimeContext } from "./types";
import {inferAmPm} from "./workday";
import {TimeParsingError} from "./errorHandling";

const parseTimeWithContext = (
    input: string,
    context: TimeContext,
    previousTime?: Temporal.PlainTime
): Temporal.PlainTime => {
    const trimmed = input.trim().toUpperCase();

    // Handle explicit AM/PM
    const explicitMatch = trimmed.match(/^(\d{1,2}):?(\d{2})?\s*(AM|PM)$/);
    if (explicitMatch) {
        let [_, hourStr, minuteStr = '00', meridiem] = explicitMatch;
        let hour = parseInt(hourStr, 10);
        const minute = parseInt(minuteStr, 10);

        if (meridiem === 'PM' && hour !== 12) hour += 12;
        if (meridiem === 'AM' && hour === 12) hour = 0;

        return Temporal.PlainTime.from({ hour, minute });
    }

    // Handle flexible formats: "11", "11:30", "1130"
    const flexibleMatch = trimmed.match(/^(\d{1,2}):?(\d{2})?$/);
    if (flexibleMatch) {
        let [_, hourStr, minuteStr = '00'] = flexibleMatch;
        let hour = parseInt(hourStr, 10);
        const minute = parseInt(minuteStr, 10);

        // Smart AM/PM inference using enum
        const inferredMeridiem = inferAmPm[context](hour, previousTime);

        if (inferredMeridiem === 'PM' && hour !== 12) hour += 12;
        if (inferredMeridiem === 'AM' && hour === 12) hour = 0;

        return Temporal.PlainTime.from({ hour, minute });
    }

    throw new TimeParsingError(`Unable to parse time: "${input}"`, input);
};

export const askTime = async (
    question: string,
    context: TimeContext,
    previousTime?: Temporal.PlainTime
): Promise<Temporal.PlainTime> => {
    const time = await input({
        message: `⏰ ${question}`,
        validate: (input: string) => {
            try {
                parseTimeWithContext(input.trim(), context, previousTime);
                return true;
            } catch (error) {
                if (error instanceof TimeParsingError) {
                    return chalk.red('Invalid time format');
                }
                return chalk.red('Error parsing time');
            }
        }
    });

    return parseTimeWithContext(time.trim(), context, previousTime);
};