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
                    "feed" : "size",
                    "source" : ["Revenue"]
                  },{
                    "feed" : "color",
                    "source" : ["Store Name"]
                  }
                ];
            }
            if (series == "two") {
                 binding = [
                  {
                    "feed" : "size",
                    "source" : ["Revenue","cost"]
                  },{
                    "feed" : "color",
                    "source" : ["Store Name"]
                  }
                ];
            }
            chartPar.stringBinding = JSON.stringify(binding);
            return chartPar.stringBinding;
        }
    };
});
