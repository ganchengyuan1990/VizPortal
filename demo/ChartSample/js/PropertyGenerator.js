define(["./Samples", "./JSONOperator", "./../config/chartSamples", "./CodeChartGenerator"], function(Samples, JSONOperator, chartSamples, CodeChartGenerator) {
    return {
        generateChartOption: function(property, chartPar, codeArea) {
            var chartObj = JSONOperator.findById(chartSamples, chartPar.stringChartType);
            Samples.getSample(chartPar.stringChartType).generateChartOption(property, chartPar, codeArea, chartObj);
            if (chartPar.stringChartOption && chartPar.stringData && chartPar.stringBinding && chartPar.stringChartType && chartPar.stringTemplate) {
                CodeChartGenerator.generateCode(chartPar, codeArea);
            }
            return chartPar.stringChartOption;
        }
    };
});
