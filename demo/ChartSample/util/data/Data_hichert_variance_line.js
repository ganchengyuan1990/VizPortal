define(["./../../js/JSONOperator", "./../../dataset/hichert_variance_line"], function(JSONOperator, hichert_variance_line) {
    return {
        generateData: function(dataset, chartPar, codeArea) {
            // if (chartPar.series = "one") {
            var data = {
                "metadata": {
                    "fields": [{
                        "id": "Country",
                        "name": "Country",
                        "semanticType": "Dimension",
                        "dataType": "String"
                    }, {
                        "id": "Profit",
                        "name": "Profit",
                        "semanticType": "Measure",
                        "dataType": "Number"
                    }, {
                        "id": "ProfitLastYear",
                        "name": "Profit Last Year",
                        "semanticType": "Measure",
                        "dataType": "Number"
                    }, {
                        "id": "version",
                        "name": "version",
                        "semanticType": "Dimension",
                        "dataType": "String"
                    }, {
                        "id": "version2",
                        "name": "version2",
                        "semanticType": "Dimension",
                        "dataType": "String"
                    }, {
                        "id": "ΔPL",
                        "name": "ΔPL",
                        "semanticType": "Measure",
                        "dataType": "Number"
                    }, {
                        "id": "ΔPL%",
                        "name": "ΔPL%",
                        "semanticType": "Measure",
                        "dataType": "PercentageNumber"
                    }]
                },
                "data": null
            };
                if (!dataset) {
                    dataset = chartPar.dataset;
                    if (!chartPar.dataset) {
                        dataset = 'M';
                    }   
                }
                if (dataset == "S") {
                    data.data = JSONOperator.getDataset(hichert_variance_line, 6);
                    chartPar.dataset = "S";
                }
                if (dataset == "M") {
                    data.data = JSONOperator.getDataset(hichert_variance_line, 9);
                    chartPar.dataset = "M";
                }
                if (dataset == "L") {
                    data.data = JSONOperator.getDataset(hichert_variance_line, 12);
                    chartPar.dataset = "L";
                }
                chartPar.stringData = JSON.stringify(data);
                return chartPar.stringData;
            // }
        }
    };
});
