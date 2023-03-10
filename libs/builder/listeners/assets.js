const path = require('path');

const Conf = require('global-conf');

const utils = require('../../utils');

Conf.listen.set('data.process.loaded', function(loc, val) {
    const pathAbs = Conf.get(Conf.getAncestorLocation(loc, 'page'), 'pathAbs');
    const pathRel = Conf.get(Conf.getAncestorLocation(loc, 'page'), 'pathRel');
    Conf.set(val, 'process.assestsRoot', Conf.get('assetsRoot'));
    Conf.set(val, 'process.assestsRootPage', path.join(Conf.get('assetsRoot'), pathRel));
    Conf.set(val, 'process.assets.css.files', utils.getPaths(path.join(pathAbs, 'assets', 'css'), Conf.get('assetsCss'), true));
    Conf.set(val, 'process.assets.js.files', utils.getPaths(path.join(pathAbs, 'assets', 'js'), Conf.get('assetsJs'), true));
    Conf.set(val, 'process.assets.raw.files', utils.getPaths(path.join(pathAbs, 'assets', 'raw'), Conf.get('assetsRaw'), true));
    Conf.set(val, 'process.assets.img.files', utils.getPaths(path.join(pathAbs, 'assets', 'img'), Conf.get('assetsImg'), true));
});
