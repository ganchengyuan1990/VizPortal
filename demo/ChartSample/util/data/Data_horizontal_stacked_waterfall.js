define(["./../../js/JSONOperator", "./../../dataset/stacked_waterfall"], function(JSONOperator, stacked_waterfall) {
    return {
        generateData: function(dataset, chartPar, codeArea) {
                var data= {
                    "metadata":
                        {"fields":[{"id":"Country","name":"Country","semanticType":"Dimension","dataType":"String"},
                        {"id":"Year","name":"Year","semanticType":"Dimension","dataType":"String"},
                        {"id":"Product","name":"Product","semanticType":"Dimension","dataType":"String"},
                        {"id":"Profit","name":"Profit","semanticType":"Measure","dataType":"Number"}]},
                    "data":null};
            if (!dataset) {
                dataset = 'M';
            }
            if (dataset == "S") {
                data.data=JSONOperator.getDataset(stacked_waterfall, 12);
            }
            if (dataset == "M") {
                data.data=JSONOperator.getDataset(stacked_waterfall, 24);
            }
            if (dataset == "L") {
                data.data=JSONOperator.getDataset(stacked_waterfall, 30);
            }
            chartPar.stringData = JSON.stringify(data);
            return chartPar.stringData;
        }
    };
});