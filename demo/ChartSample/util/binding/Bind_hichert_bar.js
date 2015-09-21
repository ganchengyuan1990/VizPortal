define([], function() {
    return {
        generateBinding: function(series, chartPar, codeArea) {
            if (!series) {
                series = "one";
            }
            if (series == "one") {
                var binding = [{
                    "feed": "valueAxis",
                    "source": ["Profit"]
                }, {
                    "feed": "categoryAxis",
                    "source": ["Country"]
                }, {
                    "feed": "pattern",
                    "source": ["version"]
                }, {
                    "feed": "valueAxis2",
                    "source": ["ProfitLastYear"]
                }, {
                    "feed": "pattern2",
                    "source": ["version2"]
                }, {
                    "feed": "variance1",
                    "source": ["ΔPL"]
                }, {
                    "feed": "variance2",
                    "source": ["ΔPL%"]
                }];
            }
            chartPar.stringBinding = JSON.stringify(binding);
            return chartPar.stringBinding;
        }
    };
});