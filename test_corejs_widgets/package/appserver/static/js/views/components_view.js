define([
    'jquery',
    'underscore',
    'backbone',
    'models/Base',
    'collections/Base',
    'views/Base',
    'models/shared/DateInput',
    'views/shared/controls/ControlGroup',
    'views/shared/DropDownMenu',
    'views/shared/tablecaption/Master',
    'views/shared/TableHead',
    'contrib/text!app/views/components_view.html',
    'app/components/views/controls/SingleInputControl',
    'app/components/views/controls/MultiSelectInputControl',
    'app/components/views/controls/RadioInputGroupControl',
    'app/views/SimpleDialog',
    'app/mock/Employee',
    'app/mock/Employees',
    'app/views/EmployeeRow',
    'bootstrap.tab'
], function (
    $,
    _,
    Backbone,
    BaseModel,
    BaseCollection,
    BaseView,
    DateInputModel,
    ControlGroup,
    DropDownMenu,
    TableCaption,
    TableHead,
    pageTemplate,
    SingleInputControl,
    MultiSelectInputControl,
    RadioInputGroupControl,
    SimpleDialog,
    EmployeeModel,
    EmployeeCollection,
    EmployeeRow
) {

    var OPTIONS = [
        { value: 'us-east-1',       label: 'US East (N. Virginia)'      },
        { value: 'ap-northeast-1',  label: 'Asia Pacific (Tokyo)'       },
        { value: 'eu-west-1',       label: 'EU (Ireland)'               },
        { value: 'ap-southeast-1',  label: 'Asia Pacific (Singapore)'   },
        { value: 'ap-southeast-2',  label: 'Asia Pacific (Sydney)'      },
        { value: 'us-west-2',       label: 'US West (Oregon)'           },
        { value: 'us-west-1',       label: 'US West (N. California)'    },
        { value: 'eu-central-1',    label: 'EU (Frankfurt)'             },
        { value: 'sa-east-1',       label: 'South America (Sao Paulo)'  }
    ];

    var DISABLED_OPTIONS = [
        { value: 'eu-west-1',       label: 'EU (Ireland)'               },
        { value: 'ap-southeast-1',  label: 'Asia Pacific (Singapore)'   },
        { value: 'us-west-1',       label: 'US West (N. California)'    }
    ];

    var TABLE_HEADS = [
        { label: 'Name', sortKey: 'name' /*, tooltip: 'primary key' */ },
        { label: 'Company', sortKey: 'company' },
        { label: 'City', sortKey: 'city'}
    ];

    var EMPLOYEES = new EmployeeCollection();
    var EMPLOYEE1 = new EmployeeModel();
    var EMPLOYEE2 = new EmployeeModel();
    var EMPLOYEE3 = new EmployeeModel();
    EMPLOYEE1.set({ name: 'Peter', company: 'Splunk', city: 'Shanghai' });
    EMPLOYEE2.set({ name: 'LeiBusi', company: 'Mi', city: 'Beijing' });
    EMPLOYEE3.set({ name: 'LuoFat', company: 'Chuizi', city: 'Beijing' });
    EMPLOYEES.add([ EMPLOYEE1, EMPLOYEE2, EMPLOYEE3 ]);

    // hacky 
    _.each(EMPLOYEES.models,function(model){
        model.paging = new BaseModel();
        model.paging.set('total',EMPLOYEES.length);
    });

    return BaseView.extend({
        initialize: function (options) {
            BaseView.prototype.initialize.apply(this, arguments);

            this.model = new Backbone.Model();

            // Single Input Control
            this.children.simpleInput = new SingleInputControl({
                className: "simple-single-input",
                modelAttribute: "simpleInputValue",
                model: this.model,
                autoCompleteFields: OPTIONS
            });

            this.children.placeholderInput = new SingleInputControl({
                className: "placeholder-single-input",
                modelAttribute: "placeholderInputValue",
                model: this.model,
                autoCompleteFields: OPTIONS,
                placeholder: 'Please select AWS region',
                disableSearch: true
            });

            this.children.disabledInput = new SingleInputControl({
                className: "disabled-single-input",
                modelAttribute: "disabledInputValue",
                model: this.model,
                autoCompleteFields: OPTIONS,
                unselectableFields: DISABLED_OPTIONS
            });

            this.children.tooltipInput = new SingleInputControl({
                className: "tooltip-single-input",
                modelAttribute: "tooltipInputValue",
                model: this.model,
                autoCompleteFields: OPTIONS,
                unselectableFields: DISABLED_OPTIONS,
                tooltip: function(ele) {
                    if ($(ele).hasClass('select2-disabled')) {
                        $(ele).attr('title', 'Disabled option: ' + $(ele, '.select2-result-label').text());
                        $(ele).tooltip({
                            placement: 'right',
                            container: 'body',
                            template: '<div class="tooltip" role="tooltip" style="z-index:10000"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>'
                        });
                    }
                }
            });

            this.children.radioControl = new ControlGroup({
                controlType: 'SyntheticRadio',
                label: 'Synthetic radio button', 
                tooltip: 'It is a synthetic radio control',
                controlOptions: {
                    model: this.model,
                    modelAttribute: "synRadioValue",
                    items: DISABLED_OPTIONS
                }
            });

            this.children.checkControl = new ControlGroup({
                controlType: 'SyntheticCheckbox',
                label: 'Simple check box', 
                controlOptions: {
                    model: this.model,
                    modelAttribute: "synCheckValue"
                }
            });

            this.children.checkGroupControl = new ControlGroup({
                controlType: 'CheckboxGroup',
                label: 'Check group control', 
                controlOptions: {
                    model: this.model,
                    modelAttribute: "checkGroupValue",
                    items: DISABLED_OPTIONS
                }
            });

            this.children.textControl = new ControlGroup({
                controlType: 'Text',
                required: true,
                label: _("Simple text input (required)").t(),
                help: "Enter an AWS account access key that the Splunk App for AWS can use to access your AWS data. " +
                    "<a class='external' target='_blank' href='/help?location=aws.account_access_key'>Learn more</a>",
                controlOptions: {
                    modelAttribute: 'simpleText',
                    model: this.model
                }
            });

            this.children.passwordControl = new ControlGroup({
                controlType: 'Text',
                label: _("Password text input").t(),
                controlOptions: {
                    modelAttribute: 'passwordText',
                    model: this.model,
                    password: true
                }
            });

            this.children.textAreaControl = new ControlGroup({
                controlType: 'Textarea',
                label: _("Simple text area input").t(),
                controlOptions: {
                    modelAttribute: 'textArea',
                    model: this.model,
                    textareaClassName: 'text-area-example',
                    placeholder: 'It is a sample of placeholder text'
                }
            });
/*
            this.children.textBrowseControl = new ControlGroup({
                controlType: 'TextBrowse',
                label: _("Text browse").t(),
                controlOptions: {
                    modelAttribute: 'textBrowse',
                    model: this.model, 
                    placeholder: 'File path',
                    browserType: 'files'
                }
            });
*/

            this.children.dateControl = new ControlGroup({
                controlType: 'Date',
                label: _("Date input").t(),
                controlOptions: {
                    // modelAttribute: 'date',
                    model: new DateInputModel(),
                    inputClassName: 'date-picker'
                }
            });

            this.children.sliderControl1 = new ControlGroup({
                controlType: 'SyntheticSlider',
                label: _("Slider input 1").t(),
                controlOptions: {
                    modelAttribute: 'sliderValue1',
                    model: this.model,
                    min: 100,
                    max: 200,
                    step: 5,
                    minLabel: 'Min=100',
                    maxLabel: 'Max=200'
                }
            });

            this.children.sliderControl2 = new ControlGroup({
                controlType: 'SyntheticSlider',
                label: _("Slider input 2 - strong").t(),
                controlOptions: {
                    modelAttribute: 'sliderValue2',
                    model: this.model,
                    steps: ['not strong', 'strong', 'very strong'],
                    minLabel: 'Weak',
                    maxLabel: 'Strong'
                }
            });

            this.children.accumulator = new ControlGroup({
                controlType: 'Accumulator',
                label: _("Accumulator").t(),
                controlOptions: {
                    modelAttribute: 'accumulator',
                    model: this.model,
                    availableItems: OPTIONS
                }
            }); 

            this.children.radioGroupControl1 = new RadioInputGroupControl({
                model: this.model,
                modelAttribute: 'radioGroup1',
                direction: 'horizontal',
                items: DISABLED_OPTIONS
            });

            this.children.radioGroupControl2 = new RadioInputGroupControl({
                model: this.model,
                modelAttribute: 'radioGroup2',
                direction: 'vertical',
                items: DISABLED_OPTIONS
            });

            this.children.multiSelectControl = new MultiSelectInputControl({
                className: 'multi-select-control',
                model: this.model,
                modelAttribute: 'multiSelect',
                items: OPTIONS
            });

            this.children.dropDownMenu = new DropDownMenu({
                label: 'Drop Down Menu',
                labelIcon: 'settings',
                className: 'btn-group pull-left',
                items: OPTIONS
            });

            // init dialog
            this.children.dialog = new SimpleDialog();
            this.children.dialog.render().appendTo($('body'));
            this.children.dialog.hide();

            // init tables
            this.model.stateModel = new BaseModel();
            this.model.stateModel.set({
                sortKey: 'name',
                sortDirection: 'asc',
                count: 100,
                offset: 0,
                fetching: false
            });

            this.children.tableCaption = new TableCaption({
                countLabel: 'Items',
                model: {
                    state: this.model.stateModel
                },
                collection: EMPLOYEES,
                noFilterButtons: true,
                filterKey: ['name','city']
            });

            this.children.tableHead = new TableHead({
                model: this.model.stateModel,
                columns: TABLE_HEADS
            });

            this.listenTo(this.model.stateModel, 'change:sortKey change:sortDirection', function() {
                var sortKey = this.model.stateModel.get('sortKey');
                var direction = this.model.stateModel.get('sortDirection');

                EMPLOYEES.comparator = function(obj1, obj2) {
                    var r = obj1.get(sortKey) < obj2.get(sortKey) ? 
                        -1 : (obj1.get(sortKey) > obj2.get(sortKey) ? 1 : 0);
                    return direction === 'asc' ? 1 * r : -1 * r;
                };

                EMPLOYEES.sort();
                this._renderTable();
            }.bind(this));
        },

        events: {
            'click .btn-example>.btn-primary': 'showDialog'
        },

        showDialog() {
            this.children.dialog.update({
                title: 'It is a dialog example',
                content: 'I am an demo.',
                btnCancel: 'Cancel',
                btnOK: 'OK'
            });
            this.children.dialog.on('ok', function () {
                console.log('Close dialog with OK');
                this.hide();
            }.bind(this.children.dialog));
            this.children.dialog.on('cancel', function () {
                console.log('Close dialog with Cancel')
                this.hide();
            }.bind(this.children.dialog));
            this.children.dialog.show();
        },

        _renderTable: function() {
            this.rows = this.rows || [];
            _.each(this.rows, function(row) {
                row.remove();
            });

            this.rows = [];

            _.each(EMPLOYEES.models, function(model) {
                var employee = new EmployeeRow({
                    model: model
                });
                this.rows.push(employee);
                this.$('.tables .table').append(employee.render().el);
            }.bind(this));
        },

        render: function() {
            this.$el.html(pageTemplate);

            this.$('.simple-controls')
                .append(this.children.textControl.render().el)
                .append(this.children.passwordControl.render().el)
                // .append(this.children.textBrowseControl.render().el)
                .append(this.children.textAreaControl.render().el)
                .append(this.children.checkControl.render().el)
                .append(this.children.checkGroupControl.render().el)
                .append(this.children.radioControl.render().el)
                .append($("<div class='description'>Radio input group control - customized control</div>"))
                .append(this.children.radioGroupControl1.render().el)
                .append($("<div class='description'>Radio input group control - customized control</div>"))
                .append(this.children.radioGroupControl2.render().el)
                .append($("<div class='description'>Simple single select control</div>"))
                .append(this.children.simpleInput.render().el)
                .append($("<div class='description'>Single select control with placeholder text but without search</div>"))
                .append(this.children.placeholderInput.render().el)
                .append($("<div class='description'>Single select control with disabled options</div>"))
                .append(this.children.disabledInput.render().el)
                .append($("<div class='description'>Single select control with tooltips</div>"))
                .append(this.children.tooltipInput.render().el)
                .append($("<div class='description'>Multi select control</div>"))
                .append(this.children.multiSelectControl.render().el)
                .append(this.children.dateControl.render().el)
                .append(this.children.sliderControl1.render().el)
                .append(this.children.sliderControl2.render().el)
                .append(this.children.accumulator.render().el)
                .append($("<div class='section btn-example'><a class='btn'>Slave Button</a><a class='btn btn-primary'>Primary Button - Show Dialog</a></div>"))
                ;


            var iconBtns = ['icon-trash', 'icon-share', 'icon-export', 'icon-print', 'icon-search'];
            _.each(iconBtns, function(icon) {
                this.$('#icons-examples').append($('<i class="icon-sample ' + icon + '"></i>'));
            }.bind(this));

            this.$('.advanced-controls')
                .append(this.children.dropDownMenu.render().el);

            this.$('.tables').prepend(this.children.tableCaption.render().el);    
            this.$('.tables .table').append(this.children.tableHead.render().el);
            this._renderTable();

            return this;
        }
    })
});