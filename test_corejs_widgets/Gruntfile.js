var path = require('path');
var compile = require('./grunt/compile');
var babel = require('./grunt/babel');

module.exports = function (grunt) {
    var taskDir = path.join(process.cwd(), 'grunt', 'tasks');
    var pkg = grunt.file.readJSON('package.json');
    var settings = grunt.file.readJSON('settings.json');
    var splunkSource = process.env['SPLUNK_SOURCE'];
    var splunkHome = process.env['SPLUNK_HOME'];

    var mrsparklePath = settings.path.splunk['mrsparkle_dir'];
    if (splunkSource) {
        mrsparklePath = path.join(splunkSource, 'web/search_mrsparkle');
        settings.path.splunk['mrsparkle_dir'] = mrsparklePath;
    }
    if (splunkHome) {
        mrsparklePath = path.join(splunkHome, 'share/splunk/search_mrsparkle');
        settings.path.splunk['mrsparkle_dir'] = mrsparklePath;
    }
    console.log('mrsparklePath = ' + mrsparklePath);
    if (!mrsparklePath || !grunt.file.exists(mrsparklePath, 'exposed')) {
        console.error('invalid mrsparkle_dir in settings.json or env variables');
        process.exit(1);
    }


    settings.pkg = pkg;

    require('time-grunt')(grunt);
    require('load-grunt-config')(grunt, {
        configPath: taskDir,
        data: settings,
        loadGruntTasks: {
            pattern: 'grunt-*',
            config: require('./package.json'),
            scope: 'devDependencies'
        }
    });

    grunt.registerTask('_compilejs', 'compile javascript', function () {
        var done = this.async();
        compile(done, grunt, settings);
    });

    grunt.registerTask('pybabel', 'generate message.pot', function () {
        var done = this.async();
        var root = 'package/appserver/static/js/views';
        babel(done, grunt, root);
    });


    grunt.registerTask('dcompileless', ['copy:build', 'less:production']);
    grunt.registerTask('dcompilejs', ['copy:build', '_compilejs']);
    grunt.registerTask('compile', ['shell:link', 'less:production', '_compilejs']);
    grunt.registerTask('css', ['shell:link', 'copy:build', 'less:development']);
    grunt.registerTask('default', ['clean', 'shell:link', 'copy:build', 'less:production', '_compilejs', 'compress:main']);
};

