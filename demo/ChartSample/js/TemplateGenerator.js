define(["./CodeChartGenerator"], function(CodeChartGenerator) {
    return {
        generateTemplate: function(template, chartPar, codeArea) {
            if (!template) {
                chartPar.stringTemplate = JSON.stringify('standard_lumira');
            }
            if (template) {
                chartPar.stringTemplate = JSON.stringify(template);
            }
            if (chartPar.stringChartOption && chartPar.stringData && chartPar.stringBinding && chartPar.stringChartType && chartPar.stringTemplate) {
                CodeChartGenerator.generateCode(chartPar, codeArea);
            }
            return chartPar.stringTemplate;
        }
    };
});
