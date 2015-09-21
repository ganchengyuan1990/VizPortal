define(["./Common_Property"], function(Common_Property) {
    return {
        generateChartOption: function(property, chartPar, codeArea, chart) {
            if (chartPar.direction) {
                chartPar.property.interaction.zoom.direction = chartPar.direction
            }
            if (chartPar.stringChartType == "info/timeseries_line") {
                chartPar.property.plotArea.window = {
                    start: "7/5/2012",
                    end: "6/30/2013"
                };
            }
            Common_Property.generateChartOption(property, chartPar, codeArea, chart); // other common properties
            chartPar.stringChartOption = JSON.stringify(chartPar.property)
            return chartPar.stringChartOption;
        }
    };
});
