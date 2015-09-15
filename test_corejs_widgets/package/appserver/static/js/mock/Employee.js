define(
    [
        'underscore',
        'models/Base'
    ],
    function (_, BaseModel) {
        return BaseModel.extend({
            url: "employees",
            urlRoot: "employees",

            initialize: function () {
                BaseModel.prototype.initialize.apply(this, arguments);
            }
        });
    }
);