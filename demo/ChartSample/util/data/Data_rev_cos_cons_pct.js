define(["./../../js/JSONOperator", "./../../dataset/rev_cos_cons_pct"], function(JSONOperator, rev_cos_cons_pct) {
    return {
        generateData: function(dataset, chartPar, codeArea){
        /*if (!chartPar.series) {
          chartPar.series = "one";
        }*/
        if(chartPar.series == "two"){
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
              dataset=chartPar.dataset;
              if (!chartPar.dataset) {
                dataset = 'M';
              };
                  
          }
            if (dataset == "S") {
                  data.data = JSONOperator.getDataset2(rev_cos_cons_pct, 5);
                  chartPar.dataset="S";
            }
            if (dataset == "M") {
                  data.data = JSONOperator.getDataset2(rev_cos_cons_pct, 10);
                  chartPar.dataset="M";
            }
            if (dataset == "L") {
                  data.data = JSONOperator.getDataset2(rev_cos_cons_pct, 50);
                  chartPar.dataset="L";
            }
            if (chartPar.negValue) {
                data.data[0][3] = -1*Math.abs(data.data[0][3]);
            } else {
                data.data[0][3] = Math.abs(data.data[0][3])
            }
            chartPar.stringData = JSON.stringify(data);
            return chartPar.stringData;
        }if (chartPar.series == "one") {
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
                  data.data = JSONOperator.getDataset(rev_cos_cons_pct, 5);
                  chartPar.dataset="S";
              }
              if (dataset == "M") {
                  data.data = JSONOperator.getDataset(rev_cos_cons_pct, 10);
                  chartPar.dataset="M";
              }
              if (dataset == "L") {
                  data.data = JSONOperator.getDataset(rev_cos_cons_pct, 50);
                  chartPar.dataset="L";
               }
              if (chartPar.negValue) {
                  data.data[0][3] = -1*Math.abs(data.data[0][3]);
              } else {
                  data.data[0][3] = Math.abs(data.data[0][3])
              }
              chartPar.stringData = JSON.stringify(data);
              return chartPar.stringData;
        };
      }
    };
});
