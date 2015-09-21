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
                    "feed" : "weight",
                    "source" : ["Revenue"]
                  }, {
                    "feed" : "title",
                    "source" : ["Store Name"]
                  }, {
                    "feed": "color",
                    "source": ["Revenue"]
                  }
                ];
            }
            /*if (series == "two") {
                 binding = [
                  {
                    "feed" : "weight",
                    "source" : ["Revenue","cost"]
                  },{
                    "feed" : "color",
                    "source" : ["Store Name"]
                  }
                ];
            }*/
            chartPar.stringBinding = JSON.stringify(binding);
            return chartPar.stringBinding;
        }
    };
});
