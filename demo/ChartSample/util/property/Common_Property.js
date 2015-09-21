define(["../../config/titleList"], function(titleList) {
    return {
        generateChartOption: function(property, chartPar, codeArea, chart) {
            var chartOption, chartOption1, chartOption2;
            if (!property) {
                var isHichertChart = /hichert/i.test(chartPar.stringChartType);
                chartPar.property.plotArea.dataLabel = {
                    hideWhenOverlap: true,
                    visible: true
                }
                if (chartPar.stringChartType === "info/pie" ||
                    chartPar.stringChartType === "info/donut" ||
                    chartPar.stringChartType === "info/trellis_donut" ||
                    chartPar.stringChartType === "info/trellis_pie" ||
                    isHichertChart) {
                    chartPar.property.plotArea.dataLabel.formatString = "#,##0.00";
                    chartPar.property.tooltip = {
                        formatString: "#,##0.00"
                    };
                } else {
                    chartPar.property.plotArea.dataLabel.formatString = "$#,##0.0";
                    chartPar.property.tooltip = {
                        formatString: "$#,##0.00"
                    };
                }

                if (chartPar.stringChartType == "info/hichert_bar" || chartPar.stringChartType == "info/hichert_column") {
                    chartPar.property.plotArea.differenceMarker = {
                        "enable": true
                    };
                } else if (chartPar.stringChartType == "info/hichert_stacked_bar" || chartPar.stringChartType == "info/hichert_stacked_column" || chartPar.stringChartType == "info/hichert_line" || chartPar.stringChartType == "info/hichert_variance_line") {
                    chartPar.property.interaction.selectability = {
                        mode: "exclusive"
                    };
                } else {
                    chartPar.property.interaction.selectability = {
                        mode: "none"
                    };
                }

                chartPar.property.title = {
                    visible: isHichertChart ? true : false,
                    text: titleList[chart.name]
                };
                chartPar.property.interaction.zoom.enablement = "enabled";
                chartPar.property.valueAxis = {
                    label: {
                        "formatString": "u",
                        "unitFormatType": "FinancialUnits"
                    }
                };
                chartPar.property.valueAxis2 = {
                    label: {
                        "formatString": "u",
                        "unitFormatType": "FinancialUnits"
                    }
                };
            }
            if (property == "onDataLabel") {
                chartPar.property.plotArea.dataLabel.visible = true;
                chartPar.property.plotArea.dataLabel.hideWhenOverlap = true;
            }
            if (property == "offDataLabel") {
                chartPar.property.plotArea.dataLabel.visible = false;
            }
            if (property == "onTitle") {
                if (chartPar.stringChartType == "info/100_area") {
                    chartPar.property.title = {
                        visible: true,
                        text: "100% Area Chart"
                    };
                } else if (chartPar.stringChartType == "info/tagcloud") {
                    chartPar.property.title = {
                        visible: true,
                        text: "TagCloud"
                    };
                } else {
                    chartPar.property.title = {
                        visible: true,
                        text: titleList[chart.name]
                    };
                }

            }
            if (property == "offTitle") {
                chartPar.property.title = {
                    visible: false
                }
            }
            if (/exclusive/i.test(property) || /inclusive/i.test(property) || /none/i.test(property)) {
                chartPar.property.interaction.selectability = {
                    mode: property
                };
            }
            if (property == "differenceMarker") {
                chartPar.property.plotArea = {
                    "differenceMarker": {
                        "enable": true
                    }
                };
                if (chartPar.property.interaction.selectability) {
                    delete chartPar.property.interaction.selectability;
                }
            }
            if (chartPar.stringChartType == "info/hichert_variance_line") {
                chartPar.property.embeddedLegend = {
                    layout: {
                        leftWidth: 50
                    }
                };
            }
            if (chartPar.stringChartType == "info/hichert_stacked_bar") {
                chartPar.property.plotArea.dataLabel.formatString = "$#0.00M";
            } else if (chartPar.stringChartType == "info/hichert_stacked_column") {
                chartPar.property.plotArea.dataLabel.formatString = "#0M";
            }
            chartPar.stringChartOption = JSON.stringify(chartPar.property)
            return chartPar.stringChartOption;
        }
    };
});