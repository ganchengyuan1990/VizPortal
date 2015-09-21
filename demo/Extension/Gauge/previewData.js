define([], function() {
    var previewData = {
        cross: {"data":{"analysisAxis":[{"index":1,"data":[{"type":"Dimension","name":"Player","values":["Santi Cazorla","Mikel Arteta","Lukas Podolski","Olivier Giroud","Theo Walcott","Aaron Ramsey","Alex Oxlade-Chamberlain","Gervinho","Tomas Rosicky"]}]}],"measureValuesGroup":[{"index":1,"data":[{"type":"Measure","name":"Goals","values":[[12,6,11,11,14,1,1,5,2]]}]},{"index":2,"data":[{"type":"Measure","name":"Total","values":[[40,8,20,38,39,12,7,9,4]]}]}]},"bindings":[{"feed":"sap.viz.ext.gauge.PlotModule.DS1","source":[{"type":"analysisAxis","index":1}]},{"feed":"sap.viz.ext.gauge.PlotModule.MS1","source":[{"type":"measureValuesGroup","index":1}]},{"feed":"sap.viz.ext.gauge.PlotModule.MS2","source":[{"type":"measureValuesGroup","index":2}]}]},
        flat: {"metadata":{"dimensions":[{"name":"Player","value":"{Player}"}],"measures":[{"name":"Goals","value":"{Goals}"},{"name":"Total","value":"{Total}"}],"data":{"path":"/data"}},"feedItems":[{"uid":"sap.viz.ext.gauge.PlotModule.DS1","type":"Dimension","values":["Player"]},{"uid":"sap.viz.ext.gauge.PlotModule.MS1","type":"Measure","values":["Goals"]},{"uid":"sap.viz.ext.gauge.PlotModule.MS2","type":"Measure","values":["Total"]}],"data":{"data":[{"Player":"Santi Cazorla","Goals":12,"Total":40},{"Player":"Mikel Arteta","Goals":6,"Total":8},{"Player":"Lukas Podolski","Goals":11,"Total":20},{"Player":"Olivier Giroud","Goals":11,"Total":38},{"Player":"Theo Walcott","Goals":14,"Total":39},{"Player":"Aaron Ramsey","Goals":1,"Total":12},{"Player":"Alex Oxlade-Chamberlain","Goals":1,"Total":7},{"Player":"Gervinho","Goals":5,"Total":9},{"Player":"Tomas Rosicky","Goals":2,"Total":4}]}}
    };
    return previewData;
});