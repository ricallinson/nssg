const fs = require('fs');
const path = require('path');

const prettyjson = require('prettyjson');
const watch = require('watch');
const { minify } = require('html-minifier-terser');

const logger = require('../logger');
const utils = require('../utils');
const serve = require('./serve');
const Conf = require('global-conf');

const DEFAULTS_DIR = 'defaults';
const PAGES_DIR = 'pages';
const BUILD_DIR = 'build';

function getProjectRoot(dir) {
    try {
        fs.accessSync(path.join(dir, 'pages', 'pages.yml'), fs.constants.R_OK);
    } catch(err) {
        logger.info(`Current directory "${dir}" is not a project.`);
        process.exit(1);
    }
    return dir;
}

function loadListeners(dir) {
    utils.getPaths(dir, ['js'], true).forEach(function(file) {
        require(file);
    });
}

function setGlobals() {
    logger.event(`builder.setGlobals`, `Setting global values`);
    Conf.set('defaultsDir', path.join(__dirname, DEFAULTS_DIR));
    Conf.set('buildDir', path.join(Conf.get('root'), BUILD_DIR));
    Conf.set('pagesDir', path.join(Conf.get('root'), PAGES_DIR));
    logger.event(`builder.setGlobals`);
}

function loadPagesConfiguration() {
    logger.event(`builder.loadPagesConfiguration`, 'Loading pages.yml');
    Conf.set('source', path.join(Conf.get('pagesDir'), 'pages.yml'));
    Conf.load('.', path.join(Conf.get('defaultsDir'), 'pages.yml'));
    Conf.load('.', Conf.get('source'));
    Conf.set('data', {});
    Conf.set('page.pathAbs', Conf.get('pagesDir'));
    Conf.set('data.process.loaded', 'data');
    logger.event(`builder.loadPagesConfiguration`);
}

function loadAllPageConfigurations() {
    logger.event(`builder.loadAllPageConfigurations`, `Setting page values`);
    utils.getPaths(Conf.get('pagesDir'), Conf.get('pageTypes'), true).forEach((file) => {
        const key = Conf.normalizeKey(file);
        logger.event(`builder.loadPageConfiguration${key}`, `Processing page configuration`);
        const dir = path.join(path.parse(file.replace(Conf.get('root'), '')).dir);
        const page = path.basename(file).split('.').shift();
        const loc = Conf.join(dir.replaceAll(path.sep, Conf.sep), page);
        Conf.load(loc, file);
        Conf.set(loc, 'source', file);
        Conf.set(loc, 'page.pathAbs', path.dirname(file));
        Conf.set(loc, 'page.pathRel', dir);
        Conf.set(loc, 'page.pathUrl', path.join(path.parse(file.replace(Conf.get('pagesDir'), '')).dir, `${page}.html`).replaceAll(path.sep, '/'));
        Conf.set(loc, 'data.process.loaded', Conf.join(loc, 'data'));
        logger.event(`builder.loadPageConfiguration${key}`);
    });
    logger.event(`builder.loadAllPageConfigurations`);
}

function cleanBuildDir() {
    logger.event(`builder.cleanBuildDir`, 'Cleaning build directory');
    fs.rmSync(Conf.get('buildDir'), { recursive: true, force: true });
    fs.mkdirSync(Conf.get('buildDir'), { recursive: true });
    logger.event(`builder.cleanBuildDir`);
}

function outputPages() {
    logger.event('builder.outputPages');
    Conf.getDescendantLocations('pages', 'page').forEach(async(location) => {
        const filePath = path.join(Conf.get('buildDir'), Conf.get(location, 'pathUrl'));
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
        const html = await minify(Conf.get(location, 'html') || '', {
            collapseWhitespace:    true,
            minifyCSS:             true,
            minifyJS:              true,
            preserveLineBreaks:    true,
            removeComments:        true,
            removeEmptyAttributes: true
        });
        fs.writeFileSync(filePath, html);
    });
    logger.event('builder.outputPages');
}

function watchProject(dir) {
    const buildDir = path.join(dir, BUILD_DIR);
    watch.watchTree(dir, { interval: 1 }, function(f, curr, prev) {
        if (typeof f == "object" && prev === null && curr === null) {
            logger.info('preview', `Finished scanning project`);
        } else {
            // options.ignoreDirectoryPattern: /build/ // Is not working?
            if (f.indexOf(buildDir) === -1) {
                logger.info('preview', `Change to ${f}.`);
                exports.build(dir);
            }
        }
    });
}

exports.init = function(dir) {
    const dst = path.join(process.cwd(), dir);
    const src = path.join(__dirname, '..', '..', 'archetype');
    fs.cpSync(src, dst, { recursive: true });
};

exports.build = function(dir) {
    logger.event('builder');
    Conf.set('root', getProjectRoot(path.resolve(dir)));
    setGlobals();
    loadListeners(path.join(Conf.get('defaultsDir'), 'listeners'));
    loadListeners(path.join(Conf.get('root'), 'listeners'));
    loadPagesConfiguration();
    loadAllPageConfigurations();
    cleanBuildDir();
    outputPages();
    //...
    logger.event('builder', prettyjson.render(Conf.root));
};

exports.preview = function(dir, port) {
    const project = getProjectRoot(path.resolve(dir));
    exports.build(project);
    watchProject(project);
    serve.start(path.join(dir, BUILD_DIR), port);
};
