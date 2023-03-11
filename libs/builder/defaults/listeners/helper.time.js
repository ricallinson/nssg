const Conf = require('global-conf');

Conf.listen.set('events.builder.loadPagesConfiguration.end', function(loc, val) {
    const now = new Date();
    Conf.set('data.helper.time.year', now.getFullYear());
});
