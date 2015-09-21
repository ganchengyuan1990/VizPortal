define(["./Common_Property", "./../binding/Bind_bullet"], function(Common_Property, Bind_bullet) {
    return {
        generateChartOption: function(property, chartPar, codeArea, chart) {
            if (chartPar.bulletType == "gap_below") {
                chartPar.property.plotArea.gap = {
                    visible: true,
                    type: "negative"
                }
            }
            if (chartPar.bulletType == "gap_above") {
                chartPar.property.plotArea.gap = {
                    visible: true,
                    type: "positive"
                }
            }
            Bind_bullet.generateBinding(null, chartPar, codeArea);
            Common_Property.generateChartOption(property, chartPar, codeArea, chart); // other common properties
            chartPar.stringChartOption = JSON.stringify(chartPar.property)
            return chartPar.stringChartOption;
        }
    };
});
