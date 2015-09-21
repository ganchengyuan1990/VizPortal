define(["./../../js/JSONOperator"], function(JSONOperator) {
    return {
        generateData: function(dataset, chartPar, codeArea) {
            if (chartPar.series=="two") {
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
                      },{
                        "id":"Fat Percentage",
                        "name":"Fat Percentage",
                        "semanticType" : "Dimension",
                        "dataType" : "String"
                      }]
                    }]
                },
                'data': null
            };
             if (!dataset) {
              dataset=chartPar.dataset;
              if (!chartPar.dataset) {
                dataset = 'M';
              };
                  
            }
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
        }if (chartPar.series=="one") {
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
                      },{
                        "id":"Fat Percentage",
                        "name":"Fat Percentage",
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
        };
            
        }
    };
});