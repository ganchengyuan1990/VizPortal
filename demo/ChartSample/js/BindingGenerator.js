define(["./Samples", "./CodeChartGenerator"], function(Samples, CodeChartGenerator) {
    return {
        generateBinding: function(series, chartPar, codeArea) {
            Samples.getSample(chartPar.stringChartType).generateBinding(series, chartPar, codeArea);
            if (chartPar.stringChartOption && chartPar.stringData && chartPar.stringBinding && chartPar.stringChartType && chartPar.stringTemplate) {
                CodeChartGenerator.generateCode(chartPar, codeArea);
            }
            return chartPar.stringBinding;
        }
    };
});
