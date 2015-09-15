/**
 * Created by michael on 6/17/15.
 */
define([
        'underscore',
        'jquery',
        'backbone',
        'routers/Base',
        'uri/route',
        'contrib/text!app/views/page_template.html',
        'app/views/components_view'
    ],
    function (_,
              $,
              Backbone,
              BaseRouter,
              Route,
              PageTemplate,
              PageView) {

        return BaseRouter.extend({
            routes: {
                ':locale/app/:app/:page(/)': '_route',
                '*root/:locale/app/:app/:page(/)': '_routeRooted'
            },
            initialize: function () {
                BaseRouter.prototype.initialize.apply(this, arguments);

                this.setPageTitle(_('CoreJS Components').t());
                this.applicationView = new PageView();

                // always fetch app locals
                this.fetchAppLocals = true;
            },
            _renderStructure: function () {
                // render Splunk header and common header
                $('.preload').replaceWith(this.pageView.el);
                this.pageView.$('.main-section-body').append(PageTemplate);
                this._polyfill62();
            },
            _polyfill62: function () {
                _.delay(function () {
                    this.pageView.$('.whatsnew').hide();
                }.bind(this), 500);
            },
            _renderBody: function () {
                // render current view into body
                this.pageView.$('.app-page-body').html(this.applicationView.render().el);
            },
            bootstrapAppNav: function () {
                // polyfill for 6.2
                var nav = __splunkd_partials__['/servicesNS/' + encodeURIComponent(this.model.application.get('owner')) + '/' + encodeURIComponent(this.model.application.get('app')) + '/apps/nav'];
                if (nav) {
                    __splunkd_partials__['/appnav'] = nav;
                }
                BaseRouter.prototype.bootstrapAppNav.apply(this, arguments);
            },
            bootstrapAppLocals: function () {
                BaseRouter.prototype.bootstrapAppLocals.apply(this, arguments);
                this.deferreds.appLocals.then(function () {
                    _.each(this.collection.appLocals.models, function (app) {
                        if (!app.entry.content.has('show_in_nav')) {
                            // polyfill for 6.2
                            var show = app.entry.get('name') !== "splunk_management_console" &&
                                app.entry.get('name') !== "launcher";
                            app.entry.content.set('show_in_nav', show, {silent: true});
                        }
                    })
                }.bind(this));
            },
            /*
             THE ENTRY POINT
             */
            _route: function (locale, app, page) {
                BaseRouter.prototype.page.apply(this, arguments);

                this.deferreds.pageViewRendered.done(function () {
                    this._renderStructure();
                    this._renderBody();
                }.bind(this));
            },
            _routeRooted: function (root, locale, app, page) {
                this.model.application.set({
                    root: root
                }, {silent: true});
                this._route(locale, app, page);
            }
        });
    });
