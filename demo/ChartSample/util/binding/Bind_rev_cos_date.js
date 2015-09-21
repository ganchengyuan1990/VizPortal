define([], function() {
    return {
        generateBinding: function(series, chartPar, codeArea) {
            var binding;
            if (!series) {
                series = "one";
            }
            if (series == "one") {
                binding = [
                  {
                    "feed" : "valueAxis",
                    "source" : ["Revenue"]
                  }, {
                    "feed" : "color",
                    "source" : [{"measureNames" : ["valueAxis"]}]
                  }, {
                    "feed" : "timeAxis",
                    "source" : ["Date"]
                  }
                ];
            }
             if (series == "two") {
                binding = [
                  {
                    "feed" : "valueAxis",
                    "source" : ["Revenue", "Cost"]
                  }, {
                    "feed" : "color",
                    "source" : [{"measureNames" : ["valueAxis"]}]
                  }, {
                    "feed" : "timeAxis",
                    "source" : ["Date"]
                  }
                ];
            }
            chartPar.stringBinding = JSON.stringify(binding);
            return chartPar.stringBinding;
        }
    };
});
