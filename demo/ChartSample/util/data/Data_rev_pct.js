define(["./../../js/JSONOperator", "./../../dataset/rev_pct"], function(JSONOperator, rev_pct) {
    return {
        generateData: function(dataset, chartPar, codeArea) {
            var data = {
                'metadata': {
                    'fields': [{
                        "id" : "Store Name",
                        "name" : "Store Name",
                        "semanticType" : "Dimension",
                        "dataType" : "String"
                      }, {
                        "id" : "Revenue",
                        "name" : "Revenue",
                        "semanticType" : "Measure",
                        "dataType" : "Number"
                      }, {
                        "id" : "Fat Percentage",
                        "name" : "Fat Percentage",
                        "semanticType" : "Dimension",
                        "dataType" : "String"
                      }]
                },
                'data': null
            };
            if (!dataset) {
                dataset = 'M';
            }
            if (dataset == "S") {
                data.data = JSONOperator.getDataset2(rev_pct, 5);
            }
            if (dataset == "M") {
                data.data = JSONOperator.getDataset2(rev_pct, 10);
            }
            if (dataset == "L") {
                data.data = JSONOperator.getDataset2(rev_pct, 50);
            }
            chartPar.stringData = JSON.stringify(data);
            return chartPar.stringData;
        }
    };
});
