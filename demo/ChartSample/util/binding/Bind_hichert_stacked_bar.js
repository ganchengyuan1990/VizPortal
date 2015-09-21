define([], function() {
    return {
        generateBinding: function(series, chartPar, codeArea) {
            if (!series) {
                series = "one";
            }
            if (series == "one") {
                var binding = [{
                    "feed": "valueAxis",
                    "source": ["Value"]
                }, {
                    "feed": "color",
                    "source": ["Product"]
                }, {
                    "feed": "categoryAxis",
                    "source": ["Country"]
                }, {
                    "feed": "pattern",
                    "source": []
                }];
            }
            chartPar.stringBinding = JSON.stringify(binding);
            return chartPar.stringBinding;
        }
    };
});