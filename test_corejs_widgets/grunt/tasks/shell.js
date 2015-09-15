/*
 link splunk source
 */
module.exports = {
    options: {
        stdout: true,
        stderr: true
    },
    link: {
        command: [
            'rm -rf <%= path.splunk.link_src %>',
            'ln -s <%= path.splunk.mrsparkle_dir %> <%= path.splunk.link_src %>'
        ].join('&&')
    },
    unlink: {
        command: 'rm -rf <%= path.splunk.link_src %>'
    }
};