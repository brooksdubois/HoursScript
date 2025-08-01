import chalk from "chalk";
import { output } from "./output";

export class TimeValidationError extends Error {
    constructor(message: string, public context?: string) {
        super(message);
        this.name = 'TimeValidationError';
    }
}

export class WorkDurationError extends Error {
    constructor(message: string, public hoursWorked?: number) {
        super(message);
        this.name = 'WorkDurationError';
    }
}

export class TimeParsingError extends Error {
    constructor(message: string, public input?: string) {
        super(message);
        this.name = 'TimeParsingError';
    }
}

export const handleError = (error: unknown): void => {
    if (error instanceof TimeValidationError) {
        output`${chalk.red('❌')} ${error.message}`;
    }
    else if (error instanceof WorkDurationError) {
        output`
      ${chalk.red('❌')} ${error.message}
      
      ${chalk.gray('Most places require a lunch break before working 8 hours.')}
      ${chalk.gray('Please double-check your times or take a lunch break! 🍽️')}
    `;
    }
    else if (error instanceof TimeParsingError) {
        output`${chalk.red('❌ Invalid time format:')} ${error.input || 'unknown input'}`;
    }
    else {
        output`${chalk.red(`❌ Something went wrong: ${error}`)}`;
    }

    process.exit(1);
};