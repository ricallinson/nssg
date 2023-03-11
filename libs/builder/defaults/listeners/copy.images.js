const fs = require('fs');
const path = require('path');

const Conf = require('global-conf');

Conf.listen.set('events.builder.outputPages.end', function(loc, val) {
    const buildDir = Conf.get('buildDir');
    Conf.getDescendantLocations('.', 'img.files').forEach(function(location) {
        const assestsRootPage = Conf.get(Conf.getAncestorLocation(location, 'assestsRootPage'));
        Conf.get(location).forEach(function(filePath) {
            fs.cpSync(filePath, path.join(buildDir, assestsRootPage, 'img', path.basename(filePath)), { recursive: true });
        });
    });
});
