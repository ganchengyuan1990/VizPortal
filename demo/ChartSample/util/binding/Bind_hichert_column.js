define([], function() {
    return {
        generateBinding: function(series, chartPar, codeArea) {
            if (!series) {
                series = "one";
            }
            if (series == "one") {
                var binding = [{
                    "feed": "valueAxis",
                    "source": ["NetRevenue"]
                }, {
                    "feed": "categoryAxis",
                    "source": ["year", "quarter"]
                }, {
                    "feed": "pattern",
                    "source": ["version"]
                }, {
                    "feed": "valueAxis2",
                    "source": ["NetRevenueLastyear"]
                }, {
                    "feed": "pattern2",
                    "source": ["version2"]
                }];
            }
            chartPar.stringBinding = JSON.stringify(binding);
            return chartPar.stringBinding;
        }
    };
});