import chalk from "chalk";

export const output = (strings: TemplateStringsArray, ...values: any[]): void => {
    let result = strings[0];
    for (let i = 0; i < values.length; i++) {
        result += values[i] + strings[i + 1];
    }

    const lines = result.split('\n');

    if (lines[0].trim() === '') lines.shift();
    if (lines[lines.length - 1].trim() === '') lines.pop();

    const minIndent = lines
        .filter(line => line.trim() !== '')
        .reduce((min, line) => {
            const indent = line.match(/^\s*/)?.[0].length || 0;
            return Math.min(min, indent);
        }, Infinity);

    const trimmed = lines
        .map(line => line.slice(minIndent))
        .join('\n');

    console.log(trimmed);
};

export const showHelp = (): void => {
    output`
    ${chalk.greenBright.bold('🕒 whenToClock – Workday Wizard CLI')}

    ${chalk.cyan('Usage:')}
      whenToClock [options]

    ${chalk.cyan('Options:')}
      -h, --help        Show this help message
      -c, --clockOut    Calculate total hours worked (requires clock-out time)
      -l, --leaveBy     Calculate max lunch duration for desired leave time

    ${chalk.cyan('🛠️  Process:')}
      1. Enter your clock-in time
      2. Enter your lunch out/in times  
      3. Get your personalized work schedule calculations

    ${chalk.cyan('⚡ Smart Time Input:')}
      • Just numbers: "8", "11", "1:30"
      • The app guesses AM/PM based on context
      • Still supports explicit: "8:30AM", "12:15PM"
  `;
};