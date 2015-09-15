/**
 * Created by michael on 7/20/15.
 */

var path = require('path');
var fs = require('fs');
var exec = require('child_process').exec;
var util = require('util');

var POT_FILE = 'package/locale/messages.pot';
var CFG_FILE = 'package/locale/babel.cfg';
module.exports = function (done, grunt, root) {
    var folders = [];
    grunt.file.recurse(root, function callback(abspath, rootdir, subdir, filename) {
        var folder = subdir ? path.join(rootdir, subdir) : rootdir;
        (folders.indexOf(folder) < 0) && folders.push(folder);
    });
    var folderStr = folders.join(' ');
    exec(util.format('pybabel extract -o %s -F %s %s', POT_FILE, CFG_FILE, folderStr),
        function (error, stdout, stderr) {
            console.log('stdout: ' + stdout);
            console.log('stderr: ' + stderr);
            if (error !== null) {
                console.log('exec error: ' + error);
            }
            done();
        });
};

