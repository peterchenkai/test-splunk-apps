module.exports = {
    main: {
        options: {
            mode: 'tgz',
            archive: '<%= pkg.name %>-<%= pkg.version %>-<%= build_no %>.spl'
        },
        expand: true,
        cwd: 'build',
        src: ['**/*'],
        dest: '<%= pkg.name %>'
    }
};

