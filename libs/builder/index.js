const fs = require('fs');
const path = require('path');

const prettyjson = require('prettyjson');
const watch = require('watch');

const logger = require('../logger');
const utils = require('../utils');
const serve = require('./serve');
const Conf = require('global-conf');

const BUILD_DIR = 'build';
const PAGES_DIR = 'pages';

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
    Conf.set('defaultsDir', __dirname);
    Conf.set('buildDir', path.join(Conf.get('root'), BUILD_DIR));
    Conf.set('pagesDir', path.join(Conf.get('root'), PAGES_DIR));
    logger.event(`builder.setGlobals`);
}

function loadPagesConfiguration() {
    logger.event(`builder.loadPagesConfiguration`, 'Loading pages.yml');
    Conf.set('source', path.join(Conf.get('root'), 'pages', 'pages.yml'));
    Conf.load('.', Conf.get('source'));
    Conf.set('data', {});
    Conf.set('page.pathAbs', Conf.get('root'));
    Conf.set('data.process.loaded', 'data');
    logger.event(`builder.loadPagesConfiguration`);
}

function loadAllPageConfigurations() {
    logger.event(`builder.loadAllPageConfigurations`, `Setting page values`);
    utils.getPaths(Conf.get('root'), Conf.get('pageTypes'), true).forEach((file) => {
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
    Conf.getDescendantLocations('pages', 'page').forEach((location) => {
        const filePath = path.join(Conf.get('buildDir'), Conf.get(location, 'pathUrl'));
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
        fs.writeFileSync(filePath, Conf.get(location, 'html') || '');
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
    loadListeners(path.join(__dirname, 'listeners'));
    loadListeners(path.join(Conf.get('root'), 'listeners'));
    setGlobals();
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
