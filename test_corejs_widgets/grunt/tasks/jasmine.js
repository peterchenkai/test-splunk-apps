/**
 * Created by michael on 7/3/15.
 */
module.exports = {
    main: {
        options: {
            specs: 'test/specs/*.js',
            template: 'grunt/tasks/jasmine.tmpl',
            junit: {
                path: 'reports',
                consolidate: true
            }
        }
    }
};
