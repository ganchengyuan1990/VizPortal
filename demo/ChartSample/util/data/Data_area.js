define(["./../../js/JSONOperator", "./../../dataset/area"], function(JSONOperator, area) {
    return {
        generateData: function(dataset, chartPar, codeArea) {
            var data= {"metadata":
                        {"fields":[{"id":"Country","name":"Country","semanticType":"Dimension","dataType":"String"},
                        {"id":"Year","name":"Year","semanticType":"Dimension","dataType":"String"},
                        {"id":"Profit","name":"Profit","semanticType":"Measure","dataType":"Number"}]},
                       "data":null};
            if (!dataset) {
                dataset = 'M';
            }
            if (dataset == "S") {
               data.data=JSONOperator.getDataset(area, 6);
            }
            if (dataset == "M") {
               data.data=JSONOperator.getDataset(area, 12);
             }
            if (dataset == "L") {
               data.data=JSONOperator.getDataset(area, 15);
            }
            chartPar.stringData = JSON.stringify(data);
            return chartPar.stringData;
        }
    };
});