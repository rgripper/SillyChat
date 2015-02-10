require.config({
    baseUrl: "/Scripts/typings/SillyChat",

    paths: {
        //main libraries
        jquery: '../../jquery-2.1.3',
 
        //shortcut paths
        knockout: '../../knockout-3.2.0',
    },
});

require(["App"]);