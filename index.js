const { program } = require('commander');

const pkg = require('./package.json');
const builder = require('./libs/builder');

program
    .name(pkg.name)
    .description(pkg.description)
    .version(pkg.version);

program.command('init')
    .description('creates the file structure for a project')
    .option('-d, --directory <path>', 'directory where the project will be created', './')
    .action((options) => {
        builder.init(options.directory);
    });

program.command('build')
    .description('builds the project')
    .option('-d, --directory <path>', 'directory where the project will be created', 'build')
    .action((options) => {
        builder.build(options.directory);
    });

program.command('preview')
    .description('starts a server to preview the project')
    .option('-d, --directory <path>', 'directory to preview', './')
    .option('-p, --port <port>', 'the port to use for the server', 5000)
    .action((options) => {
        builder.preview(options.directory, options.port);
    });

program.parse();
