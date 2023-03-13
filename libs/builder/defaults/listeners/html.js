const Conf = require('global-conf');

// Find all child 'tmpl' keys and render them.
function renderSubTemplates(dataLocation) {
    Conf.getDescendantLocations(dataLocation, 'tmpl').forEach((location) => {
        if (Conf.get(location, '<<', 'html') || Conf.join(dataLocation, 'tmpl') === location) {
            return;
        }
        const tmpl = Conf.get('cache.tmpls', Conf.get(location));
        Conf.set(location, '<<', 'html', tmpl(Conf.get(dataLocation)));
    });
}

Conf.listen.get('page.html', function(loc, val) {
    // If the HTML is already set return.
    if (val) {
        return;
    }
    // Get the pages 'data' object location.
    const dataLocation = Conf.getAncestorLocation(loc, '<<', 'data');
    // Merge the page data over the defaults page data.
    Conf.set(dataLocation, Conf.merge(Conf.get('data'), Conf.get(dataLocation)));
    // As it says, render any sub templates.
    renderSubTemplates(dataLocation);
    // With the sub templates rendered, get the main container template. This is the one skipped by renderSubTemplates().
    const containerTmpl = Conf.get('cache.tmpls', Conf.get(Conf.join(dataLocation, 'tmpl')));
    // Now render it and save it as the 'html' for the main 'data' object.
    Conf.set(dataLocation, 'html', containerTmpl(Conf.get(dataLocation)));
    // Finally, get the top level page template and render that using the data we just generated.
    const pageTmpl = Conf.get('cache.tmpls', Conf.get(loc, '<<', 'tmpl'));
    Conf.set(loc, pageTmpl(Conf.get(dataLocation)));
});
