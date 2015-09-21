// create code area and get codes
var JSCode;
var URL = "./../../../resources/libs/extensions";
sap.ui.getCore().attachInit(function() {
    var textArea = document.getElementById('code-content');
});
// Create and initialize the extension in an requireJS manner
// Load the preview data
require(["previewData"], function(previewData) {
    // Configure the baseUrl for requireJS to find the specific module or file
    requirejs.config({
        baseUrl : URL + "/bundles/sap/viz/ext/flagbar"
    });
    require([ "flagbar-bundle" ], function() {
        var textArea = document.getElementById('code-content');
        //chart option
        var chartPoperties = {
            title : {
                visible : true,
                text : "Olympics Medals Analysis",
                alignment : "center",
            },
            "Flag Bar Chart Module": {
                borderColor: "none"
            },
        };
        //dataset used by the chart
        var data = previewData.cross.data;
        var ds = new sap.viz.api.data.CrosstableDataset(); 
        ds.data(data);
        
        function onTplLoad() {
            sap.viz.api.env.Resource.path("sap.viz.ext.flagbar.ImgLoadPath",
    [URL + "/bundles/sap/viz/ext/flagbar/sap_viz_ext_flagbar-src/resources/img/"]);
            //create chart after applying template
            try {
                var chart = sap.viz.api.core.createViz({
                    type : "sap.viz.ext.flagbar",
                    data : ds,
                    bindings : previewData.cross.bindings,
                    container : $("#chart"),
                    properties : chartPoperties,
                });
                jQuery.get("index.html",function(response,status,xhr){
                    jQuery("#__area0").val(response);
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
        [URL + "/bundles/sap/viz/ext/flagbar/sap_viz_ext_flagbar-src/resources/templates"]);
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
            [URL + "/bundles/sap/viz/ext/flagbar/sap_viz_ext_flagbar-src/resources/languages"]);
            sap.viz.api.env.Language.set(lang, onLocaleApplied);
        } else {
            onLocaleApplied();
        }
    });    
});