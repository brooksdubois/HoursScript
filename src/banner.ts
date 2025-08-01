import cfonts from "cfonts";
import chalk from "chalk";

const fonts = [
    'block', 'chrome', 'tiny', 'slick', 'huge', 'simple', '3d'
];

export const renderBanner = (text: string): void => {
    const randomFont = fonts[Math.floor(Math.random() * fonts.length)];
    cfonts.say(text, {
        font: randomFont,
        gradient: ['red', 'blue'],
        align: 'left',
        space: true,
        transition: false,
    });
    console.log(chalk.gray(`(Font: ${randomFont})`));
};
