define([], function() {
    return {
        generateBinding: function(series, chartPar, codeArea) {
            var binding;
            if (!series) {
                series = "one";
                if (chartPar.stringChartType.indexOf("stacked") != -1) {
                  series = "two";
                }
            }
            if (series == "one") {
                binding = [
                  {
                    "feed" : "valueAxis",
                    "source" : ["Revenue", "Cost"]
                  }, {
                    "feed" : "color",
                    "source" : [{"measureNames" : ["valueAxis"]}]
                  }, {
                    "feed" : "categoryAxis",
                    "source" : ["Store Name"]
                  }
                ];
            }
            if (series == "two") {
                binding = [
                  {
                    "feed" : "valueAxis",
                    "source" : ["Revenue", "Cost", "Consumption"]
                  }, {
                    "feed" : "color",
                    "source" : [{"measureNames" : ["valueAxis"]}]
                  }, {
                    "feed" : "categoryAxis",
                    "source" : ["Store Name"]
                  }
                ];
            }
            chartPar.stringBinding = JSON.stringify(binding);
            return chartPar.stringBinding;
        }
    };
});
