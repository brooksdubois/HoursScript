// main.ts
import {Temporal} from '@js-temporal/polyfill';
import {showHelp} from "./output";
import {renderBanner} from "./banner";
import {askTime} from "./timeParser";
import {createDateTime} from "./helpers";
import {handleDefaultMode, handleFullClockOutFlow, handleLeaveByMode} from "./modes";
import {AppMode, TimeContext} from "./types";
import {handleError} from "./errorHandling";
import {validateTimeSequence, validateWorkDurationBeforeLunch} from "./validators";

const parseCommandLineArgs = (): AppMode => {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    showHelp();
    process.exit(0);
  }

  if (args.includes('--clockOut') || args.includes('-c')) {
    return AppMode.CLOCK_OUT;
  }

  if (args.includes('--leaveBy') || args.includes('-l')) {
    return AppMode.LEAVE_BY;
  }

  return AppMode.DEFAULT;
};

const executeMode = async (
    mode: AppMode,
    date: Temporal.PlainDate,
    clockIn: Temporal.PlainTime,
    dtClockIn: Temporal.PlainDateTime,
    dtLunchOut: Temporal.PlainDateTime,
    lunchOut: Temporal.PlainTime
): Promise<void> => {
  switch (mode) {
    case AppMode.LEAVE_BY:
      await handleLeaveByMode(date, dtClockIn, dtLunchOut);
      break;

    case AppMode.CLOCK_OUT:
      await handleFullClockOutFlow(date, clockIn, dtClockIn, dtLunchOut, lunchOut);
      break;

    case AppMode.DEFAULT:
      await handleDefaultMode(date, dtClockIn, dtLunchOut);
      break;

    default:
      // TypeScript will ensure this is never reached if all cases are handled
      const _exhaustiveCheck: never = mode;
      throw new Error(`Unhandled mode: ${mode}`);
  }
};

async function main() {
  try {
    const mode = parseCommandLineArgs();

    renderBanner("Hours 2.0");

    const clockIn = await askTime('What time did you clock in?', TimeContext.CLOCK_IN);
    const lunchOut = await askTime('What time did you clock out for lunch?', TimeContext.LUNCH_OUT, clockIn);

    validateTimeSequence(clockIn, lunchOut);
    validateWorkDurationBeforeLunch(clockIn, lunchOut);

    const date = Temporal.PlainDate.from('2025-01-01');
    const dtClockIn = createDateTime(date, clockIn);
    const dtLunchOut = createDateTime(date, lunchOut);

    await executeMode(mode, date, clockIn, dtClockIn, dtLunchOut, lunchOut);

  } catch (error) {
    handleError(error);
  }
}

main();