define(["./CodeChartGenerator"], function(CodeChartGenerator) {
    return {
        generateChartType: function(stringChartType, chartPar, codeArea) {
            chartPar.stringChartType = "info/" + stringChartType;
            if (chartPar.stringChartOption && chartPar.stringData && chartPar.stringBinding && chartPar.stringChartType && chartPar.stringTemplate) {
                CodeChartGenerator.generateCode(chartPar, codeArea);
            }
            return "info/" + stringChartType;
        }
    };
});
