define(["./Samples", "./CodeChartGenerator"], function(Samples, CodeChartGenerator) {
    return {
        generateData: function(dataset, chartPar, codeArea) {
            Samples.getSample(chartPar.stringChartType).generateData(dataset, chartPar, codeArea);
            if (chartPar.stringChartOption && chartPar.stringData && chartPar.stringBinding && chartPar.stringChartType && chartPar.stringTemplate) {
                CodeChartGenerator.generateCode(chartPar, codeArea);
            }
            return chartPar.stringData;
        }
    };
});
