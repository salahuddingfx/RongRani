const chalk = require('chalk');
const env = require('../config/env');

/**
 * Creative & Professional Logger
 * Uses chalk for aesthetic terminal output with consistent branding.
 */

const formatTimestamp = () => {
    return chalk.gray(`[${new Date().toLocaleTimeString()}]`);
};

const logger = {
    info: (message, meta = '') => {
        console.log(
            `${formatTimestamp()} ${chalk.cyan.bold('ℹ INFO')}  ${chalk.white(message)}`,
            meta ? chalk.gray(JSON.stringify(meta)) : ''
        );
    },
    error: (message, meta = '') => {
        console.error(
            `${formatTimestamp()} ${chalk.red.bold('✖ ERROR')} ${chalk.red(message)}`,
            meta
        );
    },
    warn: (message, meta = '') => {
        console.warn(
            `${formatTimestamp()} ${chalk.yellow.bold('⚠ WARN')}  ${chalk.yellow(message)}`,
            meta
        );
    },
    success: (message) => {
        console.log(
            `${formatTimestamp()} ${chalk.green.bold('✔ SUCCESS')} ${chalk.green(message)}`
        );
    },
    debug: (message, meta = '') => {
        if (env.NODE_ENV !== 'production') {
            console.log(
                `${formatTimestamp()} ${chalk.magenta.bold('⚙ DEBUG')} ${chalk.magenta(message)}`,
                meta
            );
        }
    },
    // Stylized branding log
    brand: () => {
        console.log('\n' + chalk.bold.magenta('=================================================='));
        console.log(chalk.bold.magenta('            ✨ RONGRANI BACKEND CORE ✨           '));
        console.log(chalk.bold.magenta('=================================================='));
        console.log(`${chalk.bold('Environment:')} ${chalk.yellow(env.NODE_ENV)}`);
        console.log(`${chalk.bold('Port:')}        ${chalk.yellow(env.PORT)}`);
        console.log(`${chalk.bold('Status:')}      ${chalk.green('Active & Ready')}`);
        console.log(chalk.bold.magenta('==================================================\n'));
    }
};

module.exports = logger;
