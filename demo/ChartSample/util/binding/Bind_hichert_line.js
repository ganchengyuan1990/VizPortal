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
                    "source": ["Year", "Month"]
                }, {
                    "feed": "pattern",
                    "source": ["Version"]
                }];

            }
            chartPar.stringBinding = JSON.stringify(binding);
            return chartPar.stringBinding;
        }
    };
});