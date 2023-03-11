const path = require('path');
const fs = require('fs');

const Marked = require('marked');

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
    case '.md':
        Conf.set(location, Marked.parse(fs.readFileSync(Conf.get(loc), 'utf8')));
    }
});
