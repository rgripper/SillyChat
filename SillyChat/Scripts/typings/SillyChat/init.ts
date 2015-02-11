require.config({
    baseUrl: "/Scripts/typings/SillyChat",

    paths: {
        //main libraries
        jquery: '../../jquery-2.1.3',
 
        //shortcut paths
        knockout: '../../knockout-3.2.0',

        signalR: '../../jquery.signalR-2.2.0',

        signalRHubs: '/signalr/hubs?',
    },
    shim: {
        jquery: {
            exports: "$"
        },
        signalR: {
            deps: ["jquery"],
            exports: "$.connection"
        },
        signalRHubs: {
            deps: ["signalR"],
        },
        app: {
            deps: ["signalRHubs"],
        }
    }
});

require(["app"]);