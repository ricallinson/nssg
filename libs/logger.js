const timethat = require('timethat');

const Conf = require('global-conf');

/*
Simple logger, exports two methods (log and error)
The first argument should be the key, it will get
printed like:

    [key] other, args, here

Passing npm run build -- --quiet will skip the console.log
but still print console.error
*/

const quiet = process.argv.includes('--quiet');

const chalk = require('chalk');

exports.info = (key, ...args) => {
    console.log(chalk.blue(`[${key}]`), ...args);
};

exports.log = (key, ...args) => {
    if (!quiet) {
        console.log(chalk.magenta(`[${key}]`), ...args);
    }
};

exports.error = (key, ...args) => {
    console.error(chalk.red(`ERR [${key}]`), ...args);
};

exports.event = (key, ...args) => {
    const start = Conf.get('events', key, 'start');
    if (!start) {
        Conf.set('events', key, 'start', Date.now());
        this.log(key, ...args);
        return;
    }
    const end = Date.now();
    Conf.set('events', key, 'end', end);
    args.push(timethat.calc(start, end));
    this.log(key, ...args);
};
