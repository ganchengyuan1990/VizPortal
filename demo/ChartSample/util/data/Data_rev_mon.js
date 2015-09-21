define(["./../../js/JSONOperator", "./../../dataset/rev_mon"], function(JSONOperator,rev_mon) {
    return {
        generateData: function(dataset, chartPar, codeArea) {
            if (!chartPar.series) {
                chartPar.series = "one";
            }
            if (chartPar.series == "one") {
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
                      }]
                },
                'data': null
            };
            if (!dataset) {
                dataset = 'M';
            }
            if (dataset == "S") {
                data.data = JSONOperator.getDataset(rev_mon, 5);
            }
            if (dataset == "M") {
                data.data = JSONOperator.getDataset(rev_mon, 10);
            }
            if (dataset == "L") {
                data.data = JSONOperator.getDataset(rev_mon, 50);
            }
            chartPar.stringData = JSON.stringify(data);
            return chartPar.stringData;
            };
        if (chartPar.series == "two") {
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
                      },{
                        "id": "Month",
                        "name": "Month",
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
                data.data = JSONOperator.getDataset(rev_mon, 5);
            }
            if (dataset == "M") {
                data.data = JSONOperator.getDataset(rev_mon, 10);
            }
            if (dataset == "L") {
                data.data = JSONOperator.getDataset(rev_mon, 50);
            }
            chartPar.stringData = JSON.stringify(data);
            return chartPar.stringData;
            };
            
        }
    };
});
