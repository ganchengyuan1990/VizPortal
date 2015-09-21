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
                    "source" : ["Fat Percentage"]
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
