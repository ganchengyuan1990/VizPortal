define(["./../../js/JSONOperator", "./../../dataset/bubble"], function(JSONOperator, bubble) {
    return {
        generateData: function(dataset, chartPar, codeArea){
       
        if(chartPar.series == "two"){
           var data = {
                'metadata': {
                    'fields': [
                {
                    "id" : "Country",
                    "name" : "COUNTRY",
                    "semanticType" : "Dimension",
                    "dataType" : "String"
                }, 
                {
                    "id" : "Year",
                    "name" : "YEAR",
                    "semanticType" : "Dimension",
                    "dataType" : "String"
                },
                {
                   "id" : "Profit",
                   "name" : "PROFIT",
                   "semanticType" : "Measure",
                   "dataType" : "Number"
                },
                {
                   "id" : "Revenue",
                   "name" : "REVENUE",
                   "semanticType" : "Measure",
                   "dataType" : "Number"
                }, 
                {
                   "id" : "Revenue2",
                   "name" : "REVENUE2",
                   "semanticType" : "Measure",
                   "dataType" : "Number"
                }, 
                {
                  "id" : "Revenue3",
                  "name" : "REVENUE3",
                  "semanticType" : "Measure",
                  "dataType" : "Number"
                }, 
                {
                 "id" : "GrowthRate",
                 "name" : "GrowthRate",
                 "semanticType" : "Measure",
                 "dataType" : "Number"
                 }]
                    },
                'data': null
             };
            if (!dataset) {
                 dataset=chartPar.dataset;   
             }
            if(dataset==null)
             {
              dataset="M";
             }
            if (dataset == "S") {
                  data.data=JSONOperator.getTwoSeriesDataset(bubble, 6,18);
                  chartPar.dataset="S";
            }
            if (dataset == "M") {
                  data.data = JSONOperator.getTwoSeriesDataset(bubble, 12,18);
                  chartPar.dataset="M";
            }
            if (dataset == "L") {
                  data.data = JSONOperator.getTwoSeriesDataset(bubble,18,18);
                  chartPar.dataset="L";
            }
            chartPar.stringData = JSON.stringify(data);
            return chartPar.stringData;
        }if (chartPar.series == "one") {
           var data = {
                'metadata': {
                    'fields': [{
                    "id" : "Country",
                    "name" : "COUNTRY",
                    "semanticType" : "Dimension",
                    "dataType" : "String"
                }, 
                {
                    "id" : "Year",
                    "name" : "YEAR",
                    "semanticType" : "Dimension",
                    "dataType" : "String"
                },
                {
                   "id" : "Profit",
                   "name" : "PROFIT",
                   "semanticType" : "Measure",
                   "dataType" : "Number"
                },
                {
                  "id" : "Revenue",
                  "name" : "REVENUE",
                  "semanticType" : "Measure",
                  "dataType" : "Number"
                }, 
                {
                  "id" : "Revenue2",
                  "name" : "REVENUE2",
                  "semanticType" : "Measure",
                  "dataType" : "Number"
                }, 
               {
                  "id" : "Revenue3",
                  "name" : "REVENUE3",
                  "semanticType" : "Measure",
                  "dataType" : "Number"
               }, 
               {
                  "id" : "GrowthRate",
                  "name" : "GrowthRate",
                  "semanticType" : "Measure",
                  "dataType" : "Number"
              }]
                    },
                'data': null
             };
              if (!dataset) {
                 dataset=chartPar.dataset;   
              }
             if(dataset==null)
             {
                dataset="M";
             }
              if (dataset == "S") {
                  data.data=JSONOperator.getDataset(bubble, 6);
                  chartPar.dataset="S";
              }
              if (dataset == "M") {
                  data.data = JSONOperator.getDataset(bubble, 12);
                  chartPar.dataset="M";
              }
              if (dataset == "L") {
                  data.data = JSONOperator.getDataset(bubble, 18);
                  chartPar.dataset="L";
              }
              chartPar.stringData = JSON.stringify(data);
              return chartPar.stringData;
        };
      }
    };
});
