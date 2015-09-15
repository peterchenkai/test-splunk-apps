var BLACK_LIST = ['package/bin/test', 'package/local/', 'sdktest.py'];

module.exports = {
    build: {
        files: [
            {
                expand: true,
                cwd: 'contrib/common/misc',
                src: ['license-eula.rtf', 'license-eula.txt'],
                dest: 'build'
            },
            {
                expand: true,
                cwd: 'package',
                src: ['**'],
                dest: 'build',
                filter: function (file) {
                    for (var i = 0; i < BLACK_LIST.length; i++) {
                        var name = BLACK_LIST[i];
                        if (file.indexOf(name) >= 0) {
                            return false;
                        }
                    }
                    return true;
                }
            }
        ]
    }
};

