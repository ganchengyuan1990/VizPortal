define(["./../../js/JSONOperator", "./../../dataset/rev_cos_cons"], function(JSONOperator, rev_cos_cons) {
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
                        "id" : "Cost",
                        "name" : "Cost",
                        "semanticType" : "Measure",
                        "dataType" : "Number"
                      }, {
                        "id" : "Consumption",
                        "name" : "Consumption",
                        "semanticType" : "Measure",
                        "dataType" : "Number"
                      }]
                },
                'data': null
            };
            if (!dataset) {
                dataset = 'M';
            }
            if (dataset == "S") {
                data.data = JSONOperator.getDataset(rev_cos_cons, 5);
            }
            if (dataset == "M") {
                data.data = JSONOperator.getDataset(rev_cos_cons, 10);
            }
            if (dataset == "L") {
                data.data = JSONOperator.getDataset(rev_cos_cons, 50);
            }
            chartPar.stringData = JSON.stringify(data);
            return chartPar.stringData;
        }
    };
});
