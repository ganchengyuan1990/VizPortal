define(["./../../js/JSONOperator", "./../../dataset/hichert_column"], function(JSONOperator, hichert_column) {
    return {
        generateData: function(dataset, chartPar, codeArea) {
            // if (chartPar.series = "one") {
            var data = {
                "metadata": {
                    "fields": [{
                        "id": "year",
                        "name": "year",
                        "semanticType": "Dimension",
                        "dataType": "String"
                    }, {
                        "id": "quarter",
                        "name": "quarter",
                        "semanticType": "Dimension",
                        "dataType": "String"
                    }, {
                        "id": "NetRevenue",
                        "name": "NetRevenue",
                        "semanticType": "Measure",
                        "dataType": "Number"
                    }, {
                        "id": "NetRevenueLastyear",
                        "name": "NetRevenueLastyear",
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
                    data.data = JSONOperator.getDataset(hichert_column, 3);
                    chartPar.dataset = "S";
                }
                if (dataset == "M") {
                    data.data = JSONOperator.getDataset(hichert_column, 5);
                    chartPar.dataset = "M";
                }
                if (dataset == "L") {
                    data.data = JSONOperator.getDataset(hichert_column, 7);
                    chartPar.dataset = "L";
                }
                chartPar.stringData = JSON.stringify(data);
                return chartPar.stringData;
            // }
        }
    };
});
