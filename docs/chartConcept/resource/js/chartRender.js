define(function() {
    var chartRender = {
        simpleChartRender: function(templateName, type) {
            var key = "chartContainer";
            if (typeof type != "undefined") {
                key = templateName;
                templateName = "standard_lumira";
            }
            var chartOption = {

                title: {
                    visible: true,
                    // text: "Profit Forecast in form of Bullet Chart",
                    style: {
                        fontSize: 20
                    },
                    alignment: "center",
                },
                plotArea: {
                    dataLabel: {
                        visible: true,
                        style: {
                            color: null
                        },
                        hideWhenOverlap: true,
                    },
                }
            };

            chartOption.title.text = type?"Profit Forecast in form of Donut Chart": "Profit Forecast in form of Stacked Column Chart";

            var data = {
                "metadata": {
                    "fields": [{
                        "id": "Country",
                        "name": "Country",
                        "semanticType": "Dimension",
                        "dataType": "String",
                        "domain": ["China", "USA"]
                    }, {
                        "id": "Year",
                        "name": "Year",
                        "semanticType": "Dimension",
                        "dataType": "String"
                    }, {
                        "id": "Product",
                        "name": "Product",
                        "semanticType": "Dimension",
                        "dataType": "String",
                        "domain": ["Car", "Motorcycle", "Truck"]
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
                        "id": "GrowthRate",
                        "name": "GrowthRate",
                        "semanticType": "Measure",
                        "dataType": "Number"
                    }, {
                        "id": "_contextId",
                        "name": "_contextId",
                        "dataType": "String"
                    }]
                },
                "data": [
                    ["USA", "2001", "Car", 58, 116, 0.2, "context6"],
                    ["USA", "2001", "Truck", 149, 249, 0.65, "context7"],
                    ["USA", "2001", "Motorcycle", 49, 149, 0.4, "context8"],
                    ["China", "2001", "Truck", 159, 300, 0.35, "context1"],
                    ["China", "2001", "Car", -150, 500, 0.25, "context0"],
                    ["China", "2001", "Motorcycle", 129, 229, 0.15, "context2"],
                    ["China", "2002", "Car", 136.1245, 272, 0.4, "context3"],
                    ["China", "2002", "Truck", 147, 247, 0.15, "context4"],
                    ["China", "2002", "Motorcycle", 47, 147, 0.10, "context5"],
                    ["USA", "2002", "Car", 128, 256, 0.35, "context9"],
                    ["USA", "2002", "Truck", 269, 369, 0.10, "context10"],
                    ["USA", "2002", "Motorcycle", 69, 169, 0.8, "context11"]
                ]
            };

            var data2 = {
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
                        "id": "GrowthRate",
                        "name": "GrowthRate",
                        "semanticType": "Measure",
                        "dataType": "Number"
                    }, {
                        "id": "_contextId",
                        "name": "_contextId",
                        "dataType": "String"
                    }]
                },
                "data": [
                    ["China", "2001", "Car", 150, 500, 0.25, "context0"],
                    ["USA", "2001", "Truck", 149, 249, 0.65, "context7"],
                    ["China", "2001", "Truck", 159, 300, 0.35, "context1"],
                    ["China", "2001", "Motorcycle", 129, 229, 0.15, "context2"],
                    ["China", "2002", "Truck", 147, 247, 0.15, "context4"],
                    ["China", "2002", "Motorcycle", 47, 147, 0.10, "context5"],
                    ["USA", "2002", "Car", 128, 256, 0.35, "context9"],
                    ["USA", "2002", "Truck", 269, 369, 0.10, "context10"],
                    ["China", "2003", "Truck", 147, 247, 0.15, "context4"],
                    ["China", "2003", "Motorcycle", 47, 147, 0.10, "context5"],
                    ["USA", "2003", "Car", 128, 256, 0.35, "context9"],
                    ["USA", "2003", "Truck", 269, 369, 0.10, "context10"],
                    ["China", "2004", "Truck", 147, 247, 0.15, "context4"],
                    ["China", "2004", "Motorcycle", 47, 147, 0.10, "context5"],
                    ["USA", "2004", "Car", 128, 256, 0.35, "context9"],
                    ["USA", "2004", "Truck", 269, 369, 0.10, "context10"]
                ]
            };


            var feeding = {
                "regionColor": ["Product", "MeasureNamesDimension"],
                "axisLabels": ["Country", "Year"],
                "primaryValues": ["Profit", "Revenue"]
            };

            var feeding2 = {
                "color": ["Country", "Product", "Year"],
                "size": ["Profit"]
            };



            var chartType = type || "info/stacked_column";
            // var templateName = "standard";
            var templatePath;

            var chart;

            templatePath = "../../resources/libs/sap.viz/resources/chart/templates";

            jQuery(document).ready(function() {

                var ds = new sap.viz.api.data.FlatTableDataset(data);
                ds.data(type ? data2 : data);

                $('#' + key)[0].innerHTML = "";
                sap.viz.api.env.Resource.path("sap.viz.api.env.Template.loadPaths", [templatePath]);
                sap.viz.api.env.Template.set(templateName, function() {
                    chart = sap.viz.api.core.createViz({
                        type: chartType,
                        data: ds,
                        container: $('#' + key),
                        properties: chartOption,
                        //bindings : binding,
                        feeding: type ? feeding2 : feeding,
                        //events : events,
                        //scales : scales
                    });
                });
                //---------------------
                // resizeFun();

            });

        },

        trellisChartRender: function(key) {
            var chartOption = {

                title: {
                    visible: true,
                    text: "Profit & Revenue in form of Trellis Chart",
                    style: {
                        fontSize: 20
                    },
                    alignment: "center",
                },
                plotArea: {
                    dataLabel: {
                        visible: true,
                        style: {
                            color: null
                        },
                        hideWhenOverlap: true,
                    }
                }
            };

            var data = {
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
                        "id": "GrowthRate",
                        "name": "GrowthRate",
                        "semanticType": "Measure",
                        "dataType": "Number"
                    }]
                },
                "data": [
                    ["China", "2001", "Car", -150, -500, 0.25],
                    ["USA", "2001", "Car", 58, 116, 0.2],
                    ["USA", "2001", "Truck", 149, -249, 0.65],
                    ["USA", "2001", "Motorcycle", 49, 149, 0.4],
                    ["China", "2001", "Truck", -159, 300, 0.35],
                    ["China", "2001", "Motorcycle", 129, 229, 0.15],
                    ["China", "2002", "Car", 136.1245, -272, 0.4],
                    ["China", "2002", "Truck", 147, 247, 0.15],
                    ["China", "2002", "Motorcycle", 47, 147, 0.10],
                    ["USA", "2002", "Car", 128, 256, 0.35],
                    ["USA", "2002", "Truck", 269, 369, 0.10],
                    ["USA", "2002", "Motorcycle", 69, 169, 0.8]
                ]
            };

            var binding = [{
                "feed": "trellisRow",
                "source": ["Product"]
            }, {
                "feed": "trellisColumn",
                "source": ["Year"]
            }, {
                "feed": "valueAxis",
                "source": ["Profit", "Revenue"]
            }, {
                "feed": "color",
                "source": [{
                    "measureNames": ["valueAxis"]
                }]
            }, {
                "feed": "categoryAxis",
                "source": ["Country"]
            }];

            var chartType = "info/trellis_bar";
            // var templateName = "standard";
            var templatePath;

            var chart;

            templatePath = "../../resources/libs/sap.viz/resources/chart/templates";

            jQuery(document).ready(function() {

                var ds = new sap.viz.api.data.FlatTableDataset(data);
                ds.data(data);

                $('#' + key)[0].innerHTML = "";
                sap.viz.api.env.Resource.path("sap.viz.api.env.Template.loadPaths", [templatePath]);
                sap.viz.api.env.Template.set("standard_lumira", function() {
                    chart = sap.viz.api.core.createViz({
                        type: chartType,
                        data: ds,
                        container: $('#' + key),
                        properties: chartOption,
                        bindings : binding,
                        //events : events,
                        //scales : scales
                    });
                });
                //---------------------
                // resizeFun();

            });

        },


        chartZooming: function(key) {
            var chartOption = {

                title: {
                    visible: true,
                    text: "Profit of Motor vehicle industry in form of Column Chart",
                    style: {
                        fontSize: 20
                    },
                    alignment: "center",
                },
                interaction: {
                    zoom: {
                        direction: "categoryAxis",
                        enablement: "enabled"
                    }
                },
                // legend: {
                //     isScrollable: true
                // },
                plotArea: {
                    isFixedDataPointSize: true,
                    isScrollable: true,
                    dataPointSize: {
                        min: 40
                    },
                    /*dataLabel: {
                        visible : true,
                        style:{color : null},
                        // hideWhenOverlap : true,
                    }*/
                }
            };

            var binding = [{
                "feed": "valueAxis",
                "source": ["Profit", "Revenue"]
            }, {
                "feed": "color",
                "source": [{
                    "measureNames": ["valueAxis"]
                }, "Product", "Year"]
            }, {
                "feed": "categoryAxis",
                "source": ["Country"]
            }];
            var events = {};
            var scales = undefined;
            var ds = new sap.viz.api.data.FlatTableDataset({
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
                    }]
                },
                "data": [
                    ["China", "2001", "Car", 150, 500],
                    ["USA", "2001", "Truck", 149, 249],
                    ["China", "2001", "Truck", 159, 300],
                    ["China", "2001", "Motorcycle", 129, 229],
                    ["China", "2002", "Truck", 147, 247],
                    ["China", "2002", "Motorcycle", 47, 147],
                    ["USA", "2002", "Car", 128, 256],
                    ["USA", "2002", "Truck", 269, 369],
                    ["China", "2003", "Truck", 147, 247],
                    ["China", "2003", "Motorcycle", 47, 147],
                    ["USA", "2003", "Car", 128, 256],
                    ["USA", "2003", "Truck", 269, 369],
                ]
            });

            var chart, type = "info/column";

            /*$('.' + key).resizable({
                    resize : function(event, ui) {
                        if (chart) {
                            chart.size({
                                width : ui.size.width,
                                height : ui.size.height
                            });
                        }
                    }
                });*/

            var templatePath = "../../resources/libs/sap.viz/resources/chart/templates";

            sap.viz.api.env.Resource.path("sap.viz.api.env.Template.loadPaths", [templatePath]);


            sap.viz.api.env.Template.set("standard_lumira", function() {
                chart = sap.viz.api.core.createViz({
                    type: 'info/column',
                    data: ds,
                    container: jQuery('#' + key),
                    properties: chartOption,
                    bindings: binding,
                    events: events,
                    scales: scales
                });

                //          var a = chart.seleciton();
            });



        },


        treeMapRender: function(key) {
            var chartOption = {
                title: {
                    visible: true,
                    text: "Production of Vehicle industry in form of Treemap Chart",
                    layout: {
                        position: 'top'
                    },
                    style: {
                        fontSize: 20
                    },
                    alignment: "center",
                },

                tooltip: {},
                categoryAxis: {
                    title: {
                        visible: true
                    }
                },
                valueAxis: {
                    title: {
                        visible: true
                    },
                    label: {

                    }
                },
                legend: {
                    title: {
                        visible: true
                    }
                },
                plotArea: {
                    isFixedDataPointSize: true,
                    startColor: '#8FBADD',
                    endColor: '#00599F',
                    dataPointSize: {
                        max: 28
                    },
                    window: {
                        start: {
                            categoryAxis: {
                                "Country": "China"
                            }
                        },
                        end: {
                            categoryAxis: {
                                "Country": "China"
                            }
                        }
                    },
                }
            };

            var data = {
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
                        "semanticType": "Dimension",
                        "dataType": "String"
                    }],
                    "context": ["_contextId"]
                },
                "data": [
                    [{
                            "v": "CHN",
                            "d": "China"
                        }, "2001", {
                            "v": "Car",
                            "d": "Auto"
                        },
                        150, 500, 0.25, "context0"
                    ],
                    [{
                        "v": "CHN",
                        "d": "China"
                    }, "2001", "Truck", 159, 300, 0.35, "context1"],
                    [{
                        "v": "CHN",
                        "d": "China"
                    }, "2001", "Motorcycle", 129, 229, 0.15, "context2"],
                    [{
                            "v": "CHN",
                            "d": "China"
                        }, "2002", {
                            "v": "Car",
                            "d": "Auto"
                        },
                        136, 272, 0.30, "context3"
                    ],
                    [{
                        "v": "CHN",
                        "d": "China"
                    }, "2002", "Truck", 147, 247, 0.15, "context4"],
                    [{
                        "v": "CHN",
                        "d": "China"
                    }, "2002", "Motorcycle", 47, 147, 0.10, "context5"],
                    ["USA", "2001", {
                            "v": "Car",
                            "d": "Auto"
                        },
                        58, 116, 0.20, "context6"
                    ],
                    ["USA", "2001", "Truck", 149, 249, 0.65, "context7"],
                    ["USA", "2001", "Motorcycle", 49, 149, 0.75, "context8"],
                    ["USA", "2002", {
                            "v": "Car",
                            "d": "Auto"
                        },
                        128, 256, 0.35, "context9"
                    ],
                    ["USA", "2002", "Truck", 269, 369, 0.10, "context10"],
                    ["USA", "2002", "Motorcycle", 69, 169, 0.05, "context11"]
                ]
            };


            var feeding = {
                "color": ["Revenue"],
                "title": ["Country", "Year", "Product"],
                "weight": ["Profit"]
            };

            var chartType = "info/treemap";
            var templateName = "standard_lumira";
            var chart;

            var templatePath = "../../resources/libs/sap.viz/resources/chart/templates";

            jQuery(document).ready(function() {

                var ds = new sap.viz.api.data.FlatTableDataset(data);
                ds.data(data);

                sap.viz.api.env.Resource.path("sap.viz.api.env.Template.loadPaths", [templatePath]);
                sap.viz.api.env.Template.set(templateName, function() {
                    $('#' + key)[0].innerHTML = "";
                    chart = sap.viz.api.core.createViz({
                        type: chartType,
                        data: ds,
                        container: $('#' + key),
                        properties: chartOption,
                        //bindings : binding2,
                        feeding: feeding,
                        //events : events,
                        //scales : scales
                    });
                });
            });

        },



    };

    return chartRender;

});