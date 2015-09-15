/**
 * Created by michael on 5/14/15.
 */
var path = require('path');

module.exports = {
    production: {
        options: {
            paths: [path.join('<%= path.splunk.link_src %>', 'exposed/less')],
            modifyVars: {
                theme: ''
            }
        },
        files: [
            {
                expand: true,
                cwd: 'build/appserver/static/less',
                src: [
                    'common.less',
                    'pages/**/bootstrap.less'
                ],
                dest: '<%= path.app.css %>',
                ext: '.css'
            }
        ]
    },
    development: {
        options: {
            paths: [path.join('<%= path.splunk.link_src %>', 'exposed/less')],
            modifyVars: {
                theme: ''
            }
        },
        files: [
            {
                expand: true,
                cwd: 'build/appserver/static/less',
                src: [
                    'common.less',
                    'pages/**/bootstrap.less'
                ],
                dest: '<%= path.app.dev_css %>',
                ext: '.css'
            }
        ]
    }
};

