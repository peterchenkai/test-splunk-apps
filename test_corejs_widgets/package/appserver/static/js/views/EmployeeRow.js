define(
    [
        'underscore',
        'backbone',
        'views/Base'
    ],
    function(
        _,
        Backbone,
        BaseView
    ){

        return BaseView.extend({
            tagName: 'tr',
            className: 'employee-table-row',

            initialize: function(options) {
                BaseView.prototype.initialize.apply(this, arguments);
            },

            render: function() {
                this.$el.html(this.compiledTemplate({
                    name: this.model.get('name'),
                    company: this.model.get('company'),
                    city: this.model.get('city')
                }));
            },

            template: '\
                <td class="name-col"><%= name %></td>\
                <td class="company-col"><%= company %></td>\
                <td class="city-col"><%= city %></td>\
            '
        });
    }
);
