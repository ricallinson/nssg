const path = require('path');

const Conf = require('global-conf');

Conf.listen.get('include', function(loc, val) {
    const location = Conf.join(loc, '<<', 'data');
    if (!val || Conf.get(location)) {
        return;
    }
    if (val[0] === '.') {
        // Path is relative so change it to absolute path.
        Conf.set(loc, path.join(Conf.get(Conf.getAncestorLocation(loc, 'page'), 'pathAbs'), val));
    }
    switch (path.extname(val)) {
    case '.json':
    case '.yml':
    case '.yaml':
        Conf.load(location, Conf.get(loc));
    }
});
