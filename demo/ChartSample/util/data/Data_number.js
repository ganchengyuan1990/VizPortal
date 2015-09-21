define(["./../../js/JSONOperator","./../../dataset/number"], function(JSONOperator,number) {
    return {
        generateData: function(dataset, chartPar, codeArea) {
            var data = {
                'metadata': {
                    'fields': [{
                        "id":"Profit",
                        "name":"Profit",
                        "semanticType":"Measure",
                        "dataType":"Number"
                    }]
                },
                'data': null
            };
            if (!dataset) {
                dataset = 'M';
            }
            if (dataset == "S" || dataset == "M" || dataset == "L") {
                data.data = JSONOperator.getDataset(number, 1);
            }
            chartPar.stringData = JSON.stringify(data);
            return chartPar.stringData;
        }
    };
});
