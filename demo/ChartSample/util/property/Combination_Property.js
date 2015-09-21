define(["./Common_Property"], function(Common_Property) {
    return {
        generateChartOption: function(property, chartPar, codeArea, chart) {
            var chartOption, chartOption1, chartOption2;
            if (!property) {
                if (chart.category == "Combination") {
                    chartPar.property.plotArea.dataShape = {
                        primaryAxis: ["line", "bar", "bar"]
                    }
                }
            }
            Common_Property.generateChartOption(property, chartPar, codeArea, chart);
            chartPar.stringChartOption = JSON.stringify(chartPar.property)
            return chartPar.stringChartOption;
        }
    };
});
