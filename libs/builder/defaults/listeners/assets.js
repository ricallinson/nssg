const path = require('path');

const Conf = require('global-conf');

const utils = require('../../../utils');

// Global level assets.
Conf.listen.set('events.builder.loadPagesConfiguration.end', function(loc, val) {
    const pathAbs = path.join(Conf.get('root'), 'assets');
    Conf.set('data.process.assestsRoot', Conf.get('assetsRoot'));
    Conf.set('data.process.assestsRootPage', Conf.get('assetsRoot'));
    Conf.set('data.process.assets.css.files', utils.getPaths(pathAbs, Conf.get('assetsCss'), true));
    Conf.set('data.process.assets.js.files', utils.getPaths(pathAbs, Conf.get('assetsJs'), true));
    Conf.set('data.process.assets.raw.files', utils.getPaths(pathAbs, Conf.get('assetsRaw'), true));
    Conf.set('data.process.assets.img.files', utils.getPaths(pathAbs, Conf.get('assetsImg'), true));
});

// Page level assets.
Conf.listen.set('data.process.loaded', function(loc, val) {
    const pathAbs = path.join(Conf.get(Conf.getAncestorLocation(loc, 'page'), 'pathAbs'), 'assets');
    const pathRel = Conf.get(Conf.getAncestorLocation(loc, 'page'), 'pathRel');
    Conf.set(val, 'process.assestsRoot', Conf.get('assetsRoot'));
    Conf.set(val, 'process.assestsRootPage', path.join(Conf.get('assetsRoot'), pathRel));
    Conf.set(val, 'process.assets.css.files', utils.getPaths(pathAbs, Conf.get('assetsCss'), true));
    Conf.set(val, 'process.assets.js.files', utils.getPaths(pathAbs, Conf.get('assetsJs'), true));
    Conf.set(val, 'process.assets.raw.files', utils.getPaths(pathAbs, Conf.get('assetsRaw'), true));
    Conf.set(val, 'process.assets.img.files', utils.getPaths(pathAbs, Conf.get('assetsImg'), true));
});
