const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');

const compression = require('compression')();
const handler = require('serve-handler');

const logger = require('../logger');

process.env.npm_lifecycle_event = process.env.npm_lifecycle_event || '';
const IS_SSL = process.env.npm_lifecycle_event.includes('-ssl') || process.argv.includes('--ssl');

function setup(dir) {
    let server = http;
    let options = {};
    if (!IS_SSL) {
        return [server, options];
    }
    server = https;
    options = {
        key:  path.join(dir, '../ssl/key.pem'),
        cert: path.join(dir, '../ssl/cert.pem')
    };
    Object.keys(options).forEach(k => {
        if (!fs.existsSync(options[k])) {
            console.log(`Could not find SSL ${k} at: ${options[k]}`);
            process.exit(1);
        }
        console.log(`Loading SSL ${k} from: ${options[k]}`);
        options[k] = fs.readFileSync(options[k], 'utf8');
    });
    return [server, options];
}

exports.start = function(dir, port) {
    let baseUrl = `http://localhost:${port}`;
    logger.info('preview', `Starting preview server '${baseUrl}' watching project at '${dir}'`);
    const [server, options] = setup(dir);
    exports.server = server.createServer(options, (req, res) => {
        compression(req, res, () => {
            handler(req, res, {
                public:        dir,
                etag:          true,
                symlinks:      true,
                trailingSlash: true
            });
        });
    }).listen(port);
};

exports.stop = function() {
    logger.info('preview', 'Stopping preview server');
    exports.server && exports.server.close();
    process.exit(0);
};
