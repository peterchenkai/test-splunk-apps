/**
 * This is only the static portion of the pages build configuration...
 *
 * Certain parts of this configuration will be updated dynamically at build time.  These updates are documented inline.
 */

require.config({
    preserveLicenseComments: false,
    optimize: 'uglify2',
    uglify2: {
        mangle: {
            except: ['_']
        }
    },
    mainConfigFile: './shared.js',
    stubModules: ['contrib/text'],
    skipDirOptimize: true,
    optimizeCss: 'none',
    wrapShim: true,
    removeCombined: true,
    // The `baseUrl` and `dir` attributes will be added dynamically at build time.

    shim: {
        'profiles/shared': {
            deps: ['contrib/require']
        }
    },
    modules: [

        {
            name: 'build/bundles/require',
            create: true,
            include: [
                'contrib/require',
                'profiles/shared'
            ],
            override: {
                wrapShim: false,
                wrap: {
                    start: '',
                    // At build time, all modules that declare makeAvailableAtRuntime=true in their configuration will be
                    // converted to a stringified require.js `bundle` configuration and prepended to `wrap.end`.
                    end: ''
                }
            }
        },

        {
            name: 'build/bundles/common',
            create: true,
            makeAvailableAtRuntime: true,
            include: [
                'jquery',
                'underscore',
                'backbone',
                'collections/Base',
                'models/Base',
                'routers/Base',
                'util/router_utils',
                'views/Base'
            ]
        }
        // At build time, a module entry for each file in the $SPLUNK_SOURCE/web/search_mrsparkle/exposed/js/pages/ directory
        // will be added here.  Unless a file of the same name exists in $SPLUNK_SOURCE/web/search_mrsparkle/exposed/js/profiles/,
        // which is taked as an indication that a custom build configuration is in use for that page.
    ]
});
