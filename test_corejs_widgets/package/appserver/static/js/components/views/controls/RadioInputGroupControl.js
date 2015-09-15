define(
    [
        'jquery',
        'underscore',
        'module',
        'views/shared/controls/Control',
        'util/general_utils'
    ],
    function ($,
              _,
              module,
              Control,
              util) {
        /**
         * Radio button Group
         *
         * @param {Object} options
         *            {Object}     model The model to operate on
         *            {String}     modelAttribute The attribute on the model to observe and update on selection
         *            {String}     groupLabel: The label of the entire group
         *            {String}     direction: (optiional) vertical / horizontal, default is vertical
         *            {Object}     items An array of one-level deep data structures:
         *                 label   (textual display),
         *                 value   (value to store in model)
         *                 tooltip (Text to display in the tooltip)
         *                 isLink  (if the label presents as a link)
         *                 func    (method to call when click the link)
         */
        return Control.extend({
            className: 'control radio-group',
            moduleId: module.id,
            initialize: function () {
                if (this.options.modelAttribute) {
                    this.$el.attr('data-name', this.options.modelAttribute);
                }

                if (this.options.direction !== 'horizontal') {
                    this.options.direction = 'vertical';
                }

                this.$el.addClass('radio-group-' + this.options.direction + '-control');
                Control.prototype.initialize.call(this, this.options);
            },
            render: function () {
                var that = this;
                this._render();
                var value = this._value;
                this.$el.find('input:radio').each(function (i, el) {
                    var $el = $(el);
                    $el.prop({'checked': $el.data('value') === value});
                    $el.change(function () {
                        that.setValue($el.data('value'));
                    });
                });
                return this;
            },
            _render: function () {
                var template = _.template(this.template, {
                    _: _,
                    items: this.options.items,
                    modelAttribute: this.options.modelAttribute
                });
                this.$el.html(template);
                this.$('[rel="tooltip"]').tooltip({animation: false, container: 'body', trigger: 'hover'});

            },
            setItems: function (items, render) {
                render = render || true;
                this.options.items = items;
                render && this.render();
            },
            remove: function () {
                this.$('[rel="tooltip"]').tooltip('destroy');
                Control.prototype.remove.call(this);
            },
            template: '\
                <% _.each(items, function(item, index){ %>\
                    <div class="radio-group-item">\
                        <input type="radio" data-value="<%- item.value %>" \
                        <% if (item.tooltip) { %> rel="tooltip" title="<%=item.tooltip%>" <% } %>>\
                        <% if (item.label) { %>\
                            <<% if (item.isLink) { %>a<% } else { %>div<% } %> class="radio-label <% if (item.isLink) { %>link-label<% } %>"><%- item.label %></<% if (item.isLink) { %>a<% } else { %>div<% } %>>\
                        <% } %>\
                    </div>\
                <% }) %>'
        });
    }
);