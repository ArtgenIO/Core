import chalk from 'chalk';
import { createLogger as factory, format } from 'winston';
import { Console } from 'winston/lib/winston/transports';
import { ILogger } from '../container';

const { combine, timestamp, printf, splat } = format;

export const createLogger = (): ILogger => {
  let isSilent = process.env.NODE_ENV === 'test';

  if (!isSilent) {
    //console.clear();
    const s = ' '.repeat(16);

    console.log(
      '\n',
      chalk.green('-'.repeat(80)),
      '\n\n',
      chalk.cyan(s + ' █████╗ ██████╗ ████████╗ ██████╗ ███████╗███╗   ██╗\n'),
      chalk.cyan(s + '██╔══██╗██╔══██╗╚══██╔══╝██╔════╝ ██╔════╝████╗  ██║\n'),
      chalk.cyan(s + '███████║██████╔╝   ██║   ██║  ███╗█████╗  ██╔██╗ ██║\n'),
      chalk.cyan(s + '██╔══██║██╔══██╗   ██║   ██║   ██║██╔══╝  ██║╚██╗██║\n'),
      chalk.cyan(s + '██║  ██║██║  ██║   ██║   ╚██████╔╝███████╗██║ ╚████║\n'),
      chalk.cyan(s + '╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝    ╚═════╝ ╚══════╝╚═╝  ╚═══╝\n'),
      '\n',
      chalk.green('-'.repeat(80)),
      '\n',
    );
  }

  // Turn logging back when it's useful to debug test sequnces.
  if (process.argv.includes('--silent=0')) {
    isSilent = false;
  }

  const levels = {
    debug: chalk.magenta('debug'),
    info: chalk.blue('info'),
    warn: chalk.yellow('warn'),
    error: chalk.red('error'),
    http: chalk.gray('http'),
    verbose: chalk.gray('verbose'),
  };
  const variable = chalk.yellow('$1');
  const application = chalk.cyan(process.env.ARTGEN_NODE_ID);

  const loggedAt = timestamp({
    format: 'hh:mm:ss.SSS',
  });

  const logger = factory({
    handleExceptions: false,
    transports: [
      new Console({
        silent: isSilent,
        level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
        stderrLevels: ['warn', 'error'],
        consoleWarnLevels: ['warn', 'error'],
        handleExceptions: false,
        format: combine(
          loggedAt,
          splat(),
          printf(({ timestamp, level, message, scope }) => {
            message = message
              ? message.replace(/\[([^\]]+)\]/g, '[' + variable + ']')
              : '';

            return `[${application}][${chalk.gray(timestamp)}][${
              levels[level]
            }][${chalk.green(scope ?? 'Kernel')}] ${message} `;
          }),
        ),
      }),
    ],
    exitOnError: false,
  });

  return logger;
};
