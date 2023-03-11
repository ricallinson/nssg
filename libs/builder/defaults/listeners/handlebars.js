const fs = require('fs');
const path = require('path');

const Conf = require('global-conf');
const Handlebars = require('handlebars');

const utils = require('../../../utils');

function registerPartial(file) {
    if (Conf.get('cache.tmpls', file)) {
        return;
    }
    try {
        const tmpl = Handlebars.compile(fs.readFileSync(file, 'utf8').toString());
        const name = path.basename(file, '.phb.html');
        Conf.set('cache.tmpls', file, tmpl);
        Handlebars.registerPartial(name, tmpl);
    } catch (err) {
        console.log(err);
    }
}

// Load, process and cache a handlebars template when it's requested.
Conf.listen.set('tmpl', function(loc, file) {
    if (!file || Conf.get('cache.tmpls', file) || file.indexOf('.hb.') === -1) {
        return;
    }
    try {
        Conf.set('cache.tmpls', file, Handlebars.compile(fs.readFileSync(file, 'utf8').toString()));
    } catch (err) {
        console.log(err);
    }
});

// Find all handlebars template partials so they can be loaded, processed and cached.
Conf.listen.set('builder.loadPagesConfiguration.end', function(loc) {
    utils.getPaths(Conf.get('pagesDir'), ['phb.html'], true).forEach(registerPartial);
    utils.getPaths(Conf.get('defaultsDir'), ['phb.html'], true).forEach(registerPartial);
});
