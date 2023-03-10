const fs = require('fs');
const path = require('path');

// As it says, given path `p` will return a boolean as to if it is a directory or not.
exports.isDirectory = function(p) {
    try {
        var stat = fs.lstatSync(p);
        return stat.isDirectory();
    } catch (e) {
        return false;
    }
};

// Given a directory `dir` and an array of file extension `exts`.
// Returns an array of matching descendant files as absolute paths.
exports.getPaths = function(dir, exts, recursive) {
    if (!fs.existsSync(dir)) {
        return [];
    }
    let all = [];
    fs.readdirSync(dir).forEach((p) => {
        p = path.join(dir, p);
        if (!this.isDirectory(p)) {
            exts.forEach((ext) => {
                if (!ext || p.endsWith(`.${ext}`)) {
                    all.push(p);
                }
            });
        } else if (recursive === true) {
            all = all.concat(this.getPaths(p, exts, recursive));
        }
    });
    return all;
};
