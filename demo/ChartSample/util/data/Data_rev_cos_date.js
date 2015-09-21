define(["./../../js/JSONOperator", "./../../dataset/rev_cos_date"], function(JSONOperator, rev_cos_date) {
    return {
        generateData: function(dataset, chartPar, codeArea) {
            var data = {
                'metadata': {
                    'fields': [{
                        "id" : "Date",
                        "name" : "Date",
                        "semanticType" : "Dimension",
                        "dataType" : "Date"
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
                      }]
                },
                'data': null
            };
            if (!dataset) {
                dataset = 'M';
            }
            if (dataset == "S") {
                data.data = JSONOperator.getDataset(rev_cos_date, 50);
            }
            if (dataset == "M") {
                data.data = JSONOperator.getDataset(rev_cos_date, 150);
            }
            if (dataset == "L") {
                data.data = JSONOperator.getDataset(rev_cos_date, 361);
            }
            chartPar.stringData = JSON.stringify(data);
            return chartPar.stringData;
        }
    };
});
