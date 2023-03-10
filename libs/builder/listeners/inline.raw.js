const fs = require('fs');

const Conf = require('global-conf');

Conf.listen.set('builder.loadAllPageConfigurations.end', function(loc, val) {
    Conf.getDescendantLocations('.', 'raw.files').forEach(function(location) {
        Conf.get(location).forEach(function(filePath) {
            const content = Conf.get(location, '<<', 'inline') || '';
            const data = fs.readFileSync(filePath, 'utf8');
            Conf.set(location, '<<', 'inline', content + data);
        });
    });
});
