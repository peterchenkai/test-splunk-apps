// most of the logic are copied from core js.

var requirejs = require('requirejs');
var fs = require('fs-extra');
var path = require('path');
var Q = require('q');
var os = require('os');


module.exports = function (done, grunt, settings) {
    var PAGES_PROFILE = 'grunt/profiles.js';

    var SPLUNK_SRC = settings.path.splunk.link_src; // splunk linked sources
    var APP_JS = settings.path.app.js; // app js root
    var REALTIVE_APP_JS_PATH = '../../../build/appserver/static/js';

    var APP_ROOT = settings.path.app.root;

    var SPLUNK_JS = path.join(SPLUNK_SRC, 'exposed/js');
    var PAGES_DIR = path.join(APP_JS, 'pages');

    var TEMP_JS = path.join(os.tmpDir(), 'appjs-' + (new Date()).getTime());

    var REQUIRE_MODULE_NAME = 'build/bundles/require';
    var COMMON_MODULE_NAME = 'build/bundles/common',
        JS_EXTENSION_RE = /\.js$/;
    // prepare core js and built folder

    function prepare(args) {
        // copy core js and templates
        try {
            fs.removeSync(path.join(APP_ROOT, 'build'));
        }
        catch (err) {
            return Q.reject(err);
        }
        return Q.resolve(args);
    };

    function cleanup(args) {
        var pagesConfig = args.pagesConfig;
        try {
            console.log('Copying build files back to the source tree...');
            pagesConfig.modules.forEach(function (module) {
                var destPath = path.join(APP_ROOT, module.name + '.js');
                console.log('    ' + destPath);
                fs.copySync(path.join(TEMP_JS, module.name + '.js'), destPath);
            });
            console.log('Removing the temporary build directory...');
            fs.removeSync(TEMP_JS);
        }
        catch (err) {
            return Q.reject(err);
        }
        return Q.resolve(args);
    };

    // The main function to kick it all off once r.js's internal libraries have been loaded.
    function main(parse, transform, build) {
        var deferred = Q.defer();
        var pagesConfig = parse.findConfig(fs.readFileSync(PAGES_PROFILE, 'utf8')).config;

        // Pre-process the config with correct directory paths, so that this script can be run from anywhere.
        pagesConfig.baseUrl = SPLUNK_JS;
        pagesConfig.dir = TEMP_JS;
        pagesConfig.mainConfigFile = path.join(SPLUNK_JS, 'profiles', pagesConfig.mainConfigFile);

        // important! point the app path to app js root
        pagesConfig.paths = {
            'app': REALTIVE_APP_JS_PATH
        };

        // For the common module, the run-time configuration needs to include a deep list of dependencies,
        // in order to avoid prevent require from trying to fetch one of those files individually.
        var args = {
            pagesConfig: pagesConfig,
            tools: {
                parse: parse,
                transform: transform,
                build: build
            }
        };
        // build chain
        prepare(args).then(expandCommonDependencies).then(expandRequireAndPages).then(cleanup).then(deferred.resolve).fail(deferred.reject);
        return deferred.promise;
    }

    function expandRequireAndPages(args) {
        var deferred = Q.defer();
        var pagesConfig = args.pagesConfig;
        try {
            var requireModule = args.tools.build.findBuildModule(REQUIRE_MODULE_NAME, pagesConfig.modules);
            // Now that the common module dependencies are expanded, convert all modules that need to be available at runtime
            // into a `bundle` configuration that is appended to the require bootstrapping module.
            addBundlesToRequireModule(requireModule, pagesConfig.modules, args.tools.transform);
            // Add all of the page-specific modules to the current configuration.
            appendPageModules(pagesConfig.modules);
        }
        catch (e) {
            deferred.reject(e);
        }
        // Now that all of the dynamic configuration is complete, hand things off to the r.js optimizer.
        console.log('Running the r.js optimizer, this may take a few minutes...');
        console.log('Temporary build files will be written to: ' + TEMP_JS);
        //console.log('pagesConfig ' + JSON.stringify(pagesConfig));

        console.log('\r\n');
        requirejs.optimize(
            pagesConfig,
            function (output) {
                console.log(output);
                deferred.resolve(args);
            },
            function (err) {
                deferred.reject(err);
            }
        );
        return deferred.promise;
    }

    function expandCommonDependencies(args) {
        var deferred = Q.defer();
        var pagesConfig = args.pagesConfig;
        var parse = args.tools.parse;
        var module = args.tools.build.findBuildModule(COMMON_MODULE_NAME, pagesConfig.modules);
        // To get the full recursive list of dependencies for a module we will run that module through the optimizer and parse the output.
        // First create a build configuration for just that module.
        var singleModuleConfig = JSON.parse(JSON.stringify(pagesConfig));
        delete singleModuleConfig.modules;
        delete singleModuleConfig.dir;
        singleModuleConfig.include = module.include;

        console.log('Expanding dependencies for ' + module.name + '...');
        // Instead of writing the optimized JS out to a file, capture the output and use the r.js parser to find all dependencies inside it.
        // Then add those to the original module's dependency list, dedup, and write the full list back to the module config.
        singleModuleConfig.out = function (output) {
            module.include = dedupArray(module.include.concat(parse.findDependencies('', output))).sort();
            module.include.forEach(function (depName) {
                console.log('    ' + depName);
            });
            console.log('\r\n');
        };

        requirejs.optimize(
            singleModuleConfig,
            function () {
                deferred.resolve(args);
            },
            function (err) {
                deferred.reject(err);
            }
        );
        return deferred.promise;
    }

// Converts the necessary modules into a bundle configuration to be used by require.js at runtime.
// See: http://requirejs.org/docs/api.html#config-bundles
    function addBundlesToRequireModule(module, allModules, transform) {
        console.log('Adding runtime bundle configuration...');
        // Ensure that the configuration objects we need to edit exist, without being destructive.
        module.override = module.override || {};
        module.override.wrap = module.override.wrap || {start: '', end: ''};

        var bundlesConfig = transform.modifyConfig('require({})', function () {
            var newConfig = {bundles: {}};
            allModules
                .filter(function (module) {
                    return module.makeAvailableAtRuntime;
                })
                .forEach(function (module) {
                    console.log('    ' + module.name);
                    newConfig.bundles[module.name] = module.include;
                });

            return newConfig;
        });
        // Prepend the bundles configuration to the wrap.end, to avoid disrupting the symmetry of the existing start/end
        // (e.g. in case they are creating an IIFE)
        module.override.wrap.end = bundlesConfig + module.override.wrap.end;
        console.log('\r\n');
    }

    function appendPageModules(modules) {
        console.log('Processing the pages directory...');
        fs.readdirSync(PAGES_DIR).forEach(function (name) {
            console.log('    ' + name);
            var nameWithoutExtension = name.replace(JS_EXTENSION_RE, '');
            modules.push({
                name: 'build/' + nameWithoutExtension,
                create: true,
                include: ['app/pages/' + nameWithoutExtension],
                exclude: [COMMON_MODULE_NAME]
            });
        });
        console.log('\r\n');
    }

    function dedupArray(array) {
        var seen = {};
        return array.filter(function (item) {
            if (seen.hasOwnProperty(item)) {
                return false;
            }
            seen[item] = true;
            return true;
        });
    }

    // Jump through a few hoops to ask require.js for references to its util libraries,
    // then call the main function with those references.
    requirejs.tools.useLib(function (require) {
        require(['parse', 'transform', 'build'], function () {
            main.apply(null, arguments).then(function () {
                done();
            }).fail(function (err) {
                console.log(err);
                done(err);
            });
        });
    });
};

