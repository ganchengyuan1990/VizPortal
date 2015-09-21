// create code area and get codes
var JSCode;
var URL = "./../../../resources/libs/extensions";

sap.ui.getCore().attachInit(function() {
    var textArea = document.getElementById('code-content');
});
require(["previewData"], function(previewData) {
    requirejs.config({
        baseUrl : URL + "/bundles/sap/viz/ext/datafiltersample"
    });
    require([ "datafiltersample-bundle" ], function() {
        var textArea = document.getElementById('code-content');
        //chart option
        var chartPoperties = {
            categoryAxis: {
                label: {
                    visible: false,
                    rotation: "fixed",
                    angle: 90
                }
            },
            title : {
                visible : true,
                text : "Chart Title",
                alignment : "center",
            },
            "Data Filter Sample Module": {
                borderColor: "none"
            },
            legend:{
                visible : true,
                drawingEffect : "normal"
            },
            tooltip: {
                preRender: function() {
                    window.console.log('preRender----------------');
                },
                postRender: function() {
                    window.console.log('----------------postRender');
                }
            }
        };
        //dataset used by the chart
        var data = previewData.cross.data;
        var ds = new sap.viz.api.data.CrosstableDataset(); 
        ds.data(data);
        
        function onTplLoad() {
            //create chart after applying template
            try {
                var chart = sap.viz.api.core.createViz({
                    type : "sap.viz.ext.datafiltersample",
                    data : ds,
                    bindings : previewData.cross.bindings,
                    container : $("#chart"),
                    properties : chartPoperties,
                });
             var delJS=['index.js'];
             var delCss=['extensionsStyle.css'];
             var delElementById=['setting','code-content','toggle','code'];
             toggleViewExtension("index.html","index.js",textArea,delJS,delCss,delElementById);
            } catch (err) {
                console.log(err);
                return;
            }
            //listen the barData event raised from the extension
            chart.on("barData", function(d) {
                alert("Data: " + d.join(" = "));
            });
            $(window).resize(function(){
                chart.size({
                    width: $("#chart").width(),
                    height: $("#chart").height()
                })
            });
        }
        function onTplFail() {}

        function onLocaleApplied() {
            // set template loadPath
            sap.viz.api.env.Resource.path("sap.viz.api.env.Template.loadPaths", 
                [URL + "/bundles/sap/viz/ext/datafiltersample/sap_viz_ext_datafiltersample-src/resources/templates"]);
            sap.viz.api.env.Template.set("standard", onTplLoad, onTplFail);
            $("footer").text(sap.viz.extapi.env.Language.getResourceString('IDS_VERSION_PUBLIC'));
        }
    
        var lang, params; //paring language from param
        if (window.location && window.location.search) {
            params = window.location.search.match(/sap-ui-language=(\w*)/);
            lang = params && params[1] ? params[1] : lang;
        }
    
        if (lang) {
            sap.viz.api.env.Resource.path("sap.viz.api.env.Language.loadPaths",
             [URL + "/bundles/sap/viz/ext/datafiltersample/sap_viz_ext_datafiltersample-src/resources/languages"]);
            sap.viz.api.env.Language.set(lang, onLocaleApplied);
        } else {
            onLocaleApplied();
        }
    });    
});