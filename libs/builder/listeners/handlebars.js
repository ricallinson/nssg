const Handlebars = require('handlebars');
const fs = require('fs');

const Conf = require('global-conf');

Conf.listen.set('tmpl', function(loc, path) {
    if (!path) {
        return;
    }
    if (Conf.get('cache.tmpls', path)) {
        return;
    }
    try {
        Conf.set('cache.tmpls', path, Handlebars.compile(fs.readFileSync(path).toString()));
    } catch (err) {
        console.log(err);
    }
});
