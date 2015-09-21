define(["./../../js/JSONOperator", "./../../dataset/bullet"], function(JSONOperator, bullet_data) {
    return {
        generateData: function(dataset, chartPar, codeArea) {
            var selectedArray = []; var data;
            if (!chartPar.bulletType) {
                chartPar.bulletType = "primary"
            }
            if (chartPar.series == "two") {
                if (chartPar.bulletType == "primary" || chartPar.bulletType.indexOf("gap") != -1) {
                    data = {
                        'metadata': {
                            'fields': [{
                                "id" : "Store Name",
                                "name" : "Store Name",
                                "semanticType" : "Dimension",
                                "dataType" : "String"
                              }, {
                                "id" : "Revenue",
                                "name" : "Revenue",
                                "semanticType" : "Measure",
                                "dataType" : "Number"
                              }, {
                                "id" : "Target",
                                "name" : "Target",
                                "semanticType" : "Measure",
                                "dataType" : "Number"
                              }, {
                                "id" : "Revenue2",
                                "name" : "Revenue2",
                                "semanticType" : "Measure",
                                "dataType" : "Number"
                              }, {
                                "id" : "Target2",
                                "name" : "Target2",
                                "semanticType" : "Measure",
                                "dataType" : "Number"
                              }]
                        },
                        'data': null
                    };
                    selectedArray = [0, 1, 2, 5, 6];
                }
                if (chartPar.bulletType == "projected") {
                    data = {
                        'metadata': {
                            'fields': [{
                                "id" : "Store Name",
                                "name" : "Store Name",
                                "semanticType" : "Dimension",
                                "dataType" : "String"
                              }, {
                                "id" : "Revenue",
                                "name" : "Revenue",
                                "semanticType" : "Measure",
                                "dataType" : "Number"
                              }, {
                                "id" : "Target",
                                "name" : "Target",
                                "semanticType" : "Measure",
                                "dataType" : "Number"
                              }, {
                                "id" : "Forecast",
                                "name" : "Forecast",
                                "semanticType" : "Measure",
                                "dataType" : "Number"
                              }, {
                                "id" : "Revenue2",
                                "name" : "Revenue2",
                                "semanticType" : "Measure",
                                "dataType" : "Number"
                              }, {
                                "id" : "Target2",
                                "name" : "Target2",
                                "semanticType" : "Measure",
                                "dataType" : "Number"
                              }, {
                                "id" : "Forecast2",
                                "name" : "Forecast2",
                                "semanticType" : "Measure",
                                "dataType" : "Number"
                              }]
                        },
                        'data': null
                    };
                    selectedArray = [0, 1, 2, 3, 5, 6, 7];
                }
                if (chartPar.bulletType == "additional") {
                    data = {
                        'metadata': {
                            'fields': [{
                                "id" : "Store Name",
                                "name" : "Store Name",
                                "semanticType" : "Dimension",
                                "dataType" : "String"
                              }, {
                                "id" : "Revenue",
                                "name" : "Revenue",
                                "semanticType" : "Measure",
                                "dataType" : "Number"
                              }, {
                                "id" : "Target",
                                "name" : "Target",
                                "semanticType" : "Measure",
                                "dataType" : "Number"
                              }, {
                                "id" : "Additional Revenue",
                                "name" : "Additional Revenue",
                                "semanticType" : "Measure",
                                "dataType" : "Number"
                              }, {
                                "id" : "Revenue2",
                                "name" : "Revenue2",
                                "semanticType" : "Measure",
                                "dataType" : "Number"
                              }, {
                                "id" : "Target2",
                                "name" : "Target2",
                                "semanticType" : "Measure",
                                "dataType" : "Number"
                              }, {
                                "id" : "Additional Revenue2",
                                "name" : "Additional Revenue2",
                                "semanticType" : "Measure",
                                "dataType" : "Number"
                              }]
                        },
                        'data': null
                    };
                    selectedArray = [0, 1, 2, 4, 5, 6, 8];
                }
                if (chartPar.bulletType == "projected_additional") {
                    data = {
                        'metadata': {
                            'fields': [{
                                "id" : "Store Name",
                                "name" : "Store Name",
                                "semanticType" : "Dimension",
                                "dataType" : "String"
                              }, {
                                "id" : "Revenue",
                                "name" : "Revenue",
                                "semanticType" : "Measure",
                                "dataType" : "Number"
                              }, {
                                "id" : "Target",
                                "name" : "Target",
                                "semanticType" : "Measure",
                                "dataType" : "Number"
                              }, {
                                "id" : "Forecast",
                                "name" : "Forecast",
                                "semanticType" : "Measure",
                                "dataType" : "Number"
                              }, {
                                "id" : "Additional Revenue",
                                "name" : "Additional Revenue",
                                "semanticType" : "Measure",
                                "dataType" : "Number"
                              }, {
                                "id" : "Revenue2",
                                "name" : "Revenue2",
                                "semanticType" : "Measure",
                                "dataType" : "Number"
                              }, {
                                "id" : "Target2",
                                "name" : "Target2",
                                "semanticType" : "Measure",
                                "dataType" : "Number"
                              }, {
                                "id" : "Forecast2",
                                "name" : "Forecast2",
                                "semanticType" : "Measure",
                                "dataType" : "Number"
                              }, {
                                "id" : "Additional Revenue2",
                                "name" : "Additional Revenue2",
                                "semanticType" : "Measure",
                                "dataType" : "Number"
                              }]
                        },
                        'data': null
                    };
                    selectedArray = [0, 1, 2, 3, 4, 5, 6, 7, 8];
                }
                if (!dataset || dataset == "primary") {
                    dataset = chartPar.dataset;
                    if (!chartPar.dataset) {
                        dataset = 'M';
                    }
                }
                if (dataset == "S") {
                    data.data = JSONOperator.getSelectedData(bullet_data, 5, selectedArray);
                    chartPar.dataset = "S";
                }
                if (dataset == "M") {
                    data.data = JSONOperator.getSelectedData(bullet_data, 10, selectedArray);
                    chartPar.dataset = "M";
                }
                if (dataset == "L") {
                    data.data = JSONOperator.getSelectedData(bullet_data, 50, selectedArray);
                    chartPar.dataset = "L";
                }
                chartPar.stringData = JSON.stringify(data);
                return chartPar.stringData;
            } 
            if (chartPar.series == "one") {
                if (chartPar.bulletType == "primary" || chartPar.bulletType.indexOf("gap") != -1) {
                    data = {
                        'metadata': {
                            'fields': [{
                                "id" : "Store Name",
                                "name" : "Store Name",
                                "semanticType" : "Dimension",
                                "dataType" : "String"
                              }, {
                                "id" : "Revenue",
                                "name" : "Revenue",
                                "semanticType" : "Measure",
                                "dataType" : "Number"
                              }, {
                                "id" : "Target",
                                "name" : "Target",
                                "semanticType" : "Measure",
                                "dataType" : "Number"
                              }]
                        },
                        'data': null
                    };
                    selectedArray = [0, 1, 2];
                }
                if (chartPar.bulletType == "projected") {
                    data = {
                        'metadata': {
                            'fields': [{
                                "id" : "Store Name",
                                "name" : "Store Name",
                                "semanticType" : "Dimension",
                                "dataType" : "String"
                              }, {
                                "id" : "Revenue",
                                "name" : "Revenue",
                                "semanticType" : "Measure",
                                "dataType" : "Number"
                              }, {
                                "id" : "Target",
                                "name" : "Target",
                                "semanticType" : "Measure",
                                "dataType" : "Number"
                              }, {
                                "id" : "Forecast",
                                "name" : "Forecast",
                                "semanticType" : "Measure",
                                "dataType" : "Number"
                              }]
                        },
                        'data': null
                    };
                    selectedArray = [0, 1, 2, 3];
                }
                if (chartPar.bulletType == "additional") {
                    data = {
                        'metadata': {
                            'fields': [{
                                "id" : "Store Name",
                                "name" : "Store Name",
                                "semanticType" : "Dimension",
                                "dataType" : "String"
                              }, {
                                "id" : "Revenue",
                                "name" : "Revenue",
                                "semanticType" : "Measure",
                                "dataType" : "Number"
                              }, {
                                "id" : "Target",
                                "name" : "Target",
                                "semanticType" : "Measure",
                                "dataType" : "Number"
                              }, {
                                "id" : "Additional Revenue",
                                "name" : "Additional Revenue",
                                "semanticType" : "Measure",
                                "dataType" : "Number"
                              }]
                        },
                        'data': null
                    };
                    selectedArray = [0, 1, 2, 4];
                }
                if (chartPar.bulletType == "projected_additional") {
                    data = {
                        'metadata': {
                            'fields': [{
                                "id" : "Store Name",
                                "name" : "Store Name",
                                "semanticType" : "Dimension",
                                "dataType" : "String"
                              }, {
                                "id" : "Revenue",
                                "name" : "Revenue",
                                "semanticType" : "Measure",
                                "dataType" : "Number"
                              }, {
                                "id" : "Target",
                                "name" : "Target",
                                "semanticType" : "Measure",
                                "dataType" : "Number"
                              }, {
                                "id" : "Forecast",
                                "name" : "Forecast",
                                "semanticType" : "Measure",
                                "dataType" : "Number"
                              }, {
                                "id" : "Additional Revenue",
                                "name" : "Additional Revenue",
                                "semanticType" : "Measure",
                                "dataType" : "Number"
                              }]
                        },
                        'data': null
                    };
                    selectedArray = [0, 1, 2, 3, 4];
                }
                if (!dataset) {
                    dataset = chartPar.dataset;
                    if (!chartPar.dataset) {
                        dataset = 'M';
                    }   
                }
                if (dataset == "S") {
                    data.data = JSONOperator.getSelectedData(bullet_data, 5, selectedArray);
                    chartPar.dataset = "S";
                }
                if (dataset == "M") {
                    data.data = JSONOperator.getSelectedData(bullet_data, 10, selectedArray);
                    chartPar.dataset = "M";
                }
                if (dataset == "L") {
                    data.data = JSONOperator.getSelectedData(bullet_data, 50, selectedArray);
                    chartPar.dataset = "L";
                }
                chartPar.stringData = JSON.stringify(data);
                return chartPar.stringData;
            }
        }
    };
});
