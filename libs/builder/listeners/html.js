const Conf = require('global-conf');

// Find all child 'tmpl' keys and render them.
function renderSubTemplates(base) {
    Conf.getDescendantLocations(base, 'tmpl').forEach((location) => {
        const parent = Conf.getAncestorLocation(location, 'data');
        const tmpl = Conf.get('cache.tmpls', Conf.get(location));
        const data = Conf.get(parent);
        Conf.set(parent, '<<', 'html', tmpl(data));
    });
}

Conf.listen.get('page.html', function(loc, val) {
    if (val) {
        return;
    }
    // The pages root 'data' object location.
    const base = Conf.join(loc, '<<', '<<', 'data');
    renderSubTemplates(base);
    // Now get the page template and render that.
    const tmpl = Conf.get('cache.tmpls', Conf.get(loc, '<<', 'tmpl'));
    const data = Conf.merge(Conf.get('data'), Conf.get(base));
    Conf.set(loc, tmpl(data));
});
