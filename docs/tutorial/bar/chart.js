$(function() {
    var locale = sap.viz.api.env.Locale;
    var resource = sap.viz.api.env.Resource;

    /**set the locale*/
    resource.path('sap.viz.api.env.Language.loadPaths', ['../../resources/libs/sap.viz/resources/chart/langs/']);

    sap.common.globalization.NumericFormatManager.USE_DEFUALT_FORMATSTRING_OR_NOT = true;

    var type = "info/bar";
    sap.viz.api.env.Resource.path("sap.viz.api.env.Template.loadPaths", ["../../resources/libs/sap.viz/resources/chart/templates"]);
    var chartOption = {
        plotArea: {
            dataLabel: {
                formatString: {
                    // Profit: "0.0",
                    // Revenue: "0.00%"
                }
            }
        },
        title: {
            visible: true,
            text: 'Sample Bar Chart Title'
        },
        tooltip: {
            formatString: {
                // Profit: "0.00",
                // Revenue: "0.00%"
            }
        },
        xAxis: {
            label: {
                formatString: "0.0%"
            }
        },
        valueAxis: {
            label: {
                // formatString: "0.00"
            }
        }
    };

    var FlatTableData = {
        "metadata": {
            "fields": [{
                "id": "Country",
                "name": "Country",
                "semanticType": "Dimension",
                "dataType": "String"
            }, {
                "id": "Year",
                "name": "Year",
                "semanticType": "Dimension",
                "dataType": "String"
            }, {
                "id": "Product",
                "name": "Product",
                "semanticType": "Dimension",
                "dataType": "String"
            }, {
                "id": "Profit",
                "name": "Profit",
                "semanticType": "Measure",
                "dataType": "Number"
            }, {
                "id": "Revenue",
                "name": "Revenue",
                "semanticType": "Measure",
                "dataType": "Number"
            }, {
                "id": "_contextId",
                "name": "_contextId",
                "dataType": "String"
            }]
        },
        "data": [
            ["China", "2001", "Car", 1500.23, 500, "context0"],
            ["China", "2001", "Truck", 159.0121212, 300.1212, "context1"],
            ["China", "2001", "Motorcycle", 129.21, 229.545, "context2"],
            ["China", "2002", "Car", 136.1245, 272, "context3"],
            ["China", "2002", "Truck", 147, 247, "context4"],
            ["China", "2002", "Motorcycle", 47, 147, "context5"],
            ["USA", "2001", "Car", 58, 116, "context6"],
            ["USA", "2001", "Truck", 149, 249, "context7"],
            ["USA", "2001", "Motorcycle", 49, 149, "context8"],
            ["USA", "2002", "Car", 128.747, 256, "context9"],
            ["USA", "2002", "Truck", 269, 369.124, "context10"],
            ["USA", "2002", "Motorcycle", 69, 169, "context11"],
            ["Canada", "2001", "Car", 58, 116, "context12"],
            ["Canada", "2001", "Truck", 38, 68, "context13"],
            ["Canada", "2001", "Motorcycle", 33, 133, "context14"],
            ["Canada", "2002", "Car", 24, 48, "context15"],
            ["Canada", "2002", "Truck", 97, 197, "context16"],
            ["Canada", "2002", "Motorcycle", 47, 147, "context17"]
        ]
    };

    var ds = new sap.viz.api.data.FlatTableDataset(FlatTableData);
    var chart;

    function createChart() {
        destory();
        binding = [{
            "feed": "valueAxis",
            "source": ["Profit", "Revenue"]
        }, {
            "feed": "color",
            "source": [{
                    "measureNames": ["valueAxis"]
                },
                "Product"
            ]
        }, {
            "feed": "categoryAxis",
            "source": ["Country", "Year"]
        }];

        chart = sap.viz.api.core.createViz({
            type: type,
            data: ds,
            container: $('#chart'),
            options: chartOption,
            bindings: binding
        });
    }

    function destory() {
        $('#chart').empty();
        if (chart) {
            chart.destroy();
            chart = undefined;
        }
    }

    createChart();

    $('#chart').resizable({
        resize: function(event, ui) {
            if (chart) {
                chart.size({
                    width: ui.size.width,
                    height: ui.size.height
                });
            }
        }
    });
});

