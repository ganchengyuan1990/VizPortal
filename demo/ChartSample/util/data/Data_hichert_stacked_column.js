define(["./../../js/JSONOperator", "./../../dataset/hichert_stacked_column"], function(JSONOperator, hichert_stacked_column) {
    return {
        generateData: function(dataset, chartPar, codeArea) {
            // if (chartPar.series = "one") {
            var data = {
                "metadata": {
                    "fields": [{
                        "id": "Year",
                        "name": "Year",
                        "semanticType": "Dimension",
                        "dataType": "String"
                    }, {
                        "id": "Month",
                        "name": "Month",
                        "semanticType": "Dimension",
                        "dataType": "String"
                    }, {
                        "id": "Product",
                        "name": "Product",
                        "semanticType": "Dimension",
                        "dataType": "String"
                    }, {
                        "id": "Version",
                        "name": "Version",
                        "semanticType": "Dimension",
                        "dataType": "String"
                    }, {
                        "id": "Value",
                        "name": "Value",
                        "semanticType": "Measure",
                        "dataType": "Number"
                    }]
                },
                'data': null
            };
            if (!dataset) {
                dataset = chartPar.dataset;
                if (!chartPar.dataset) {
                    dataset = 'M';
                }
            }
            if (dataset == "S") {
                data.data = JSONOperator.getDataset(hichert_stacked_column, 30);
                chartPar.dataset = "S";
            }
            if (dataset == "M") {
                data.data = JSONOperator.getDataset(hichert_stacked_column, 45);
                chartPar.dataset = "M";
            }
            if (dataset == "L") {
                data.data = JSONOperator.getDataset(hichert_stacked_column, 60);
                chartPar.dataset = "L";
            }
            chartPar.stringData = JSON.stringify(data);
            return chartPar.stringData;
            // }
        }
    };
});