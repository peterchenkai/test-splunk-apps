require([
        'app/routers/components_router',
        'util/router_utils'
    ],
    function (
         Router,
         Router_utils
    ) {
        var router = new Router();
        Router_utils.start_backbone_history();
    });