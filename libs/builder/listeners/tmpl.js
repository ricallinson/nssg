const path = require('path');

const Conf = require('global-conf');

Conf.listen.get('tmpl', function(loc, val) {
    // If the value is empty or absolute, do not process.
    if (!val || val && val[0] === '/') {
        return;
    }
    // Path is relative so change it to absolute path.
    if (val && val[0] === '.') {
        Conf.set(loc, path.join(Conf.get(Conf.getAncestorLocation(loc, 'root')), `${val}.html`));
        return;
    }
    // Path is a global template so change it to absolute path.
    Conf.set(loc, path.join(Conf.get('root'), 'pages', `${val}.html`));
});
