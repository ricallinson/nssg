const fs = require('fs');
const path = require('path');

const Conf = require('global-conf');

Conf.listen.set('builder.loadAllPageConfigurations.end', function(loc, val) {
    Conf.getDescendantLocations('.', 'raw.files').forEach(function(location) {
        Conf.get(location).forEach(function(filePath) {
            const data = fs.readFileSync(filePath, 'utf8');
            Conf.set(location, '<<', 'inline', Conf.normalizeKey(path.basename(filePath)), data);
        });
    });
});
