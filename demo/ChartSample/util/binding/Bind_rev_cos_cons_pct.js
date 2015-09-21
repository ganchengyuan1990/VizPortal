define(["./../data/Data_rev_cos_cons_pct"], function(Data_rev_cos_cons_pct) {
    return {
        generateBinding: function(series, chartPar, codeArea) {
            var binding;
            if (!series) {
                series = "one";
            }
            if (series == "one") {
                chartPar.series="one";
                binding = [
                  {
                    "feed" : "valueAxis",
                    "source" : ["Revenue"]
                  }, {
                    "feed" : "color",
                    "source" : ["Fat Percentage"]
                  }, {
                    "feed" : "valueAxis2",
                    "source" : ["Cost"]
                  },{
                    "feed":"bubbleWidth",
                    "source":["Consumption"]
                  }
                ];
                Data_rev_cos_cons_pct.generateData(null,chartPar,codeArea);
            }
             if (series == "two") {
               chartPar.series="two";
                binding = [
                  {
                    "feed" : "valueAxis",
                    "source" : ["Revenue"]
                  }, {
                    "feed" : "color",
                    "source" : ["Fat Percentage"]
                  }, {
                    "feed" : "valueAxis2",
                    "source" : ["Cost"]
                  },{
                    "feed":"bubbleWidth",
                    "source":["Consumption"]
                  }
                ];
                Data_rev_cos_cons_pct.generateData(null,chartPar,codeArea);
            }
            chartPar.stringBinding = JSON.stringify(binding);
            return chartPar.stringBinding;
        }
    };
});
