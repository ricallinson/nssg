const Conf = require('global-conf');

// Find all child 'tmpl' keys and render them.
function renderSubTemplates(base) {
    Conf.getDescendantLocations(base, 'tmpl').reverse().forEach((location) => {
        if (Conf.get(location, '<<', 'html')) {
            return;
        }
        const tmpl = Conf.get('cache.tmpls', Conf.get(location));
        Conf.set(location, '<<', 'html', tmpl(Conf.get(base)));
        console.log('>>>>>', Conf.get(base));
    });
}

Conf.listen.get('page.html', function(loc, val) {
    if (val) {
        return;
    }
    // The pages root 'data' object location.
    const base = Conf.getAncestorLocation(loc, 'data');
    // Merge the page data over the defaults page data.
    Conf.set(base, Conf.merge(Conf.get('data'), Conf.get(base)));
    renderSubTemplates(base);
    // Now get the page template and render that.
    const tmpl = Conf.get('cache.tmpls', Conf.get(loc, '<<', 'tmpl'));
    Conf.set(loc, tmpl(Conf.get(base)));
});
