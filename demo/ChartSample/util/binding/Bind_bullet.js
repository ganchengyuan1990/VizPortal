define(["./../data/Data_bullet"], function(Data_bullet) {
    return {
        generateBinding: function(series, chartPar, codeArea) {
            var binding;
            if (!series) {
                if (!chartPar.series) {
                    series = "one";
                } else {
                    series = chartPar.series;
                }
            }
            if (series == "one") {
                chartPar.series = "one";
                if (chartPar.bulletType == "primary" || chartPar.bulletType.indexOf("gap") != -1) {
                    binding = [
                      {
                        "feed" : "actualValues",
                        "source" : ["Revenue"]
                      }, {
                        "feed" : "targetValues",
                        "source" : ["Target"]
                      }, {
                        "feed" : "categoryAxis",
                        "source" : ["Store Name"]
                      }
                    ];
                }
                if (chartPar.bulletType == "projected") {
                    binding = [
                      {
                        "feed" : "actualValues",
                        "source" : ["Revenue"]
                      }, {
                        "feed" : "targetValues",
                        "source" : ["Target"]
                      }, {
                        "feed" : "forecastValues",
                        "source" : ["Forecast"]
                      }, {
                        "feed" : "categoryAxis",
                        "source" : ["Store Name"]
                      }
                    ];
                }
                if (chartPar.bulletType == "additional") {
                    binding = [
                      {
                        "feed" : "actualValues",
                        "source" : ["Revenue"]
                      }, {
                        "feed" : "additionalValues",
                        "source" : ["Additional Revenue"]
                      }, {
                        "feed" : "targetValues",
                        "source" : ["Target"]
                      }, {
                        "feed" : "categoryAxis",
                        "source" : ["Store Name"]
                      }
                    ];
                }
                if (chartPar.bulletType == "projected_additional") {
                    binding = [
                      {
                        "feed" : "actualValues",
                        "source" : ["Revenue"]
                      }, {
                        "feed" : "additionalValues",
                        "source" : ["Additional Revenue"]
                      }, {
                        "feed" : "targetValues",
                        "source" : ["Target"]
                      }, {
                        "feed" : "forecastValues",
                        "source" : ["Forecast"]
                      }, {
                        "feed" : "categoryAxis",
                        "source" : ["Store Name"]
                      }
                    ];
                }
                Data_bullet.generateData(null, chartPar, codeArea);
            }
            if (series == "two") {
                chartPar.series = "two";
                if (chartPar.bulletType == "primary" || chartPar.bulletType.indexOf("gap") != -1) {
                    binding = [
                      {
                        "feed" : "actualValues",
                        "source" : ["Revenue", "Revenue2"]
                      }, {
                        "feed" : "targetValues",
                        "source" : ["Target", "Target2"]
                      }, {
                        "feed" : "categoryAxis",
                        "source" : ["Store Name"]
                      }
                    ];
                }
                if (chartPar.bulletType == "projected") {
                    binding = [
                      {
                        "feed" : "actualValues",
                        "source" : ["Revenue", "Revenue2"]
                      }, {
                        "feed" : "targetValues",
                        "source" : ["Target", "Target2"]
                      }, {
                        "feed" : "forecastValues",
                        "source" : ["Forecast", "Forecast2"]
                      }, {
                        "feed" : "categoryAxis",
                        "source" : ["Store Name"]
                      }
                    ];
                }
                if (chartPar.bulletType == "additional") {
                    binding = [
                      {
                        "feed" : "actualValues",
                        "source" : ["Revenue", "Revenue2"]
                      }, {
                        "feed" : "additionalValues",
                        "source" : ["Additional Revenue", "Additional Revenue2"]
                      }, {
                        "feed" : "targetValues",
                        "source" : ["Target", "Target2"]
                      }, {
                        "feed" : "categoryAxis",
                        "source" : ["Store Name"]
                      }
                    ];
                }
                if (chartPar.bulletType == "projected_additional") {
                    binding = [
                      {
                        "feed" : "actualValues",
                        "source" : ["Revenue", "Revenue2"]
                      }, {
                        "feed" : "additionalValues",
                        "source" : ["Additional Revenue", "Additional Revenue2"]
                      }, {
                        "feed" : "targetValues",
                        "source" : ["Target", "Target2"]
                      }, {
                        "feed" : "forecastValues",
                        "source" : ["Forecast", "Forecast2"]
                      }, {
                        "feed" : "categoryAxis",
                        "source" : ["Store Name"]
                      }
                    ];
                }
                Data_bullet.generateData(null, chartPar, codeArea);
            }
            chartPar.stringBinding = JSON.stringify(binding);
            return chartPar.stringBinding;
        }
    };
});
