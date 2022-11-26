import chalk from "chalk";

const error = (...val: any[]) => {
  console.log(chalk.red("error".padEnd(5, " ")), "-", ...val);
};
const info = (...val: any[]) => {
  console.log(chalk.cyan("info".padEnd(5, " ")), "-", ...val);
};
const warn = (...val: any[]) => {
  console.log(chalk.yellow("warn".padEnd(5, " ")), "-", ...val);
};
const ready = (...val: any[]) => {
  console.log(chalk.green("ready".padEnd(5, " ")), "-", ...val);
};
const wait = (...val: any[]) => {
  console.log(chalk.cyan("wait".padEnd(5, " ")), "-", ...val);
};
const event = (...val: any[]) => {
  console.log(chalk.magenta("event".padEnd(5, " ")), "-", ...val);
};

export default {
  error,
  info,
  warn,
  ready,
  wait,
  event,
};
