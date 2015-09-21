define([], function() {
    return {
        generateCode: function(chartPar, codeArea) {
            if (window.Chart) {
                window.Chart.destroy();
            }
            var stringCreate = "var dataset = new sap.viz.api.data.FlatTableDataset();dataset.data(data);sap.viz.api.env.Template.set(" + chartPar.stringTemplate + ", function() {var chart = sap.viz.api.core.createViz({type: '" + chartPar.stringChartType + "',data: dataset,container: document.getElementById('chart'),properties: chartOption,bindings: binding}); window.Chart = chart; });";
            var codes = "sap.viz.api.env.Resource.path('sap.viz.api.env.Template.loadPaths', ['../../resources/libs/sap.viz/resources/chart/templates']);" + 
                "var chartOption = " + chartPar.stringChartOption + ";" +
                "var data = " + chartPar.stringData + ";" +
                "var binding = " + chartPar.stringBinding + ";" +
                "var chart;" + stringCreate;
            this.createChart(codes);
            var code="";
            code=codes.replace("window.Chart = chart;",'');
            var delJS=['CreateChart.js'];
            var delCss=['demoStyle.css'];
            var delElementById=['setting','code-content','toggle','code'];
            toggleView("index.html",codeArea,code,delJS,delCss,delElementById);
        },

        createChart: function(string) {
            eval(string);
        }
    };
});
