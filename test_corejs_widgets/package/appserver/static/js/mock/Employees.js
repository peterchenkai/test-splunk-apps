define(
    [
        'jquery',
        'collections/Base',
        'app/mock/Employee'
    ],
    function ($, SplunkDsBase, Employee) {
        return SplunkDsBase.extend({
            url: "employees",
            model: Employee,
            initialize: function () {
                SplunkDsBase.prototype.initialize.apply(this, arguments);
            }
        });
    }
);
