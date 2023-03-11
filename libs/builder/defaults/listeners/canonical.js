const Conf = require('global-conf');

// Sets the 'canonical' URL using 'pathUrl' if it is not already set.
Conf.listen.set('page.pathUrl', function(loc, val) {
    console.log(loc, Conf.getAncestorLocation(loc, 'data'));
    const canonical = Conf.join(Conf.getAncestorLocation(loc, 'data'), 'canonical');
    if (Conf.get(canonical) || !val) {
        return;
    }
    Conf.set(canonical, val);
});
