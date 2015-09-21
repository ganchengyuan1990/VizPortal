// create code area and get codes
var JSCode, HTMLCode;
var ChartPar = {};

sap.ui.getCore().attachInit(function() {
    // 1. Create Settings
    // 1.1 SettingPanel for the container of all setting elements
    var SettingPanel = new sap.m.Panel({
        headerText: "Settings", 
        height: "auto"
    }).placeAt("setting");

    // 1.2 VBox1 for the left choice
    var RadioButton1 = new sap.ui.commons.RadioButton({
        groupName: "conditionalFormatting",
        text: "Semantic Color",
        width: "15em",
        selected: true
    });
    RadioButton1.addStyleClass("radioStyle");
    var item1 = new sap.ui.core.Item({
        key: "GoodOrBad",
        text: "Good / Bad"
    });
    var item2 = new sap.ui.core.Item({
        key: "OneCat",
        text: "Color One Category"
    });
    var item3 = new sap.ui.core.Item({
        key: "OneSeires",
        text: "Color Two Series"
    });
    var Select = new sap.m.Select({});
    Select.insertItem(item3);Select.insertItem(item2);Select.insertItem(item1);
    Select.addStyleClass("selectStyle");
    var VBox1 = new sap.ui.layout.VerticalLayout({
        content: [RadioButton1, Select]
    });
    VBox1.addStyleClass("vboxStyle");

    // 1.3 VBox2 for the right choice
    var RadioButton2 = new sap.ui.commons.RadioButton({
        groupName: "conditionalFormatting",
        text: "Color Legend Setting",
        width: "15em"
    });
    RadioButton2.addStyleClass("radioStyle");
    var Label = new sap.ui.commons.Label({
        text: "ColorPalette:"
    });
    var Input = new sap.m.Input({
        type: "Text",
        placeholder: "Enter color palette",
        height: "5em",
        value: "red,yellow,blue,green,grey"
    });
    Input.addStyleClass("inputStyle");
    var Button = new sap.ui.commons.Button({
        text: "Apply"
    });
    var VBox2 = new sap.ui.layout.VerticalLayout({
        content: [RadioButton2, Label, Input, Button]
    });

    var HBox1 = new sap.ui.layout.HorizontalLayout({
        content: [VBox1, VBox2]
    });
    SettingPanel.insertContent(HBox1);
    
    Select.setEnabled(true); // defaul enabled state
    Input.setEnabled(false);
    Button.setEnabled(false);

    // 2. Create chart
    // 2.1 Generate chart parameters: properties, data and binding
    var chartOption = {
        plotArea: {
            "dataPointStyleMode": "override",
            "dataPointStyle": {
                "rules":
                [
                    {
                        "dataContext": {"Revenue": {"max": 1500000}},
                        "properties": {
                            "color":"#d32030"
                        },
                        "displayName":"Revenue < 1.5M"
                    }
                ],
                "others":
                {
                    "properties": {
                         "color": "#61a656"
                    },
                    "displayName": "Revenue > 1.5M"
                }
            }
        }
    };
    ChartPar.chartOption = JSON.stringify(chartOption);
    var data = {
        "metadata": {
            "fields": [{
                "id": "Type",
                "name": "Type",
                "semanticType": "Dimension",
                "dataType": "String"
            }, {
                "id": "Store Name",
                "name": "Store Name",
                "semanticType": "Dimension",
                "dataType": "String"
            }, {
                "id": "Revenue",
                "name": "Revenue",
                "semanticType": "Measure",
                "dataType": "Number"
            }, {
                "id": "Cost",
                "name": "Cost",
                "semanticType": "Measure",
                "dataType": "Number"
            }, {
                "id": "Consumption",
                "name": "Consumption",
                "semanticType": "Measure",
                "dataType": "Number"
            }]
        },
        "data": [
            ["Supermarket Milk Production", "24-Seven", 428214.13, 94383.52, 76855.15368],
            ["Supermarket Milk Production", "A&A", 1722148.36, 274735.17, 310292.22],
            ["Supermarket Milk Production", "Alexei's Specialities", 1331176.706884, 233160.58, 143432.18],
            ["Supermarket Milk Production", "BC Market", 1878466.82, 235072.19, 487910.26],
            ["Supermarket Milk Production", "Choices Franchise 1", 3386251.94, 582543.16, 267185.27],
            ["Supermarket Milk Production", "Choices Franchise 3", 2090030.97, 397952.77, 304964.8856125],
            ["Supermarket Milk Production", "Choices Franchise 6", 1932991.59, 343427.25, 291191.83],
            ["Supermarket Milk Production", "Dairy World", 752565.16, 115844.26, 98268.9597904],
            ["Supermarket Milk Production", "Delikatessen", 1394072.66, 263180.86, 176502.5521223],
            ["Supermarket Milk Production", "Donald's Market", 3308333.872944, 611658.59, 538515.47632832]
        ]
    };
    ChartPar.data = JSON.stringify(data);
    var binding = [{
        "feed": "valueAxis",
        "source": ["Revenue"]
    }, {
        "feed": "color",
        "source": ["Store Name"]
    }, {
        "feed": "categoryAxis",
        "source": ["Type"]
    }];
    ChartPar.binding = JSON.stringify(binding);
    var chart;
    var dataset = new sap.viz.api.data.FlatTableDataset();
    dataset.data(data);
var textArea = document.getElementById('code-content');
    // 2.2 Function for creating chart, will be called every time settings are changed
    var createChart = function(chartType) {
        if (!chartType) {
            chartType = "info/column"
        }
        if (chart) {
            chart.destroy()
        }
        JSCode = "var chartOption = " + ChartPar.chartOption + "; var data = " + ChartPar.data + "; var binding = " + ChartPar.binding + "; chart = sap.viz.api.core.createViz({ type: \"" + chartType + "\", data: new sap.viz.api.data.FlatTableDataset(data), container: document.getElementById('chart'), properties: chartOption, bindings: binding });"
        eval(JSCode);
        var delJS=['conditionalFormatting.js'];
        var delCss=['featureStyle.css'];
        var delElementById=['setting','code-content','toggle','code'];
        toggleView("index.html",textArea,JSCode,delJS,delCss,delElementById);
    };
    createChart();

    // 3. Create setting responses
    // 3.1 RadioButton setting
    RadioButton1.attachSelect(function() {
        Select.setEnabled(true);
        Input.setEnabled(false);
        Button.setEnabled(false);
        changeSemanticColor("GoodOrBad");
        Input.setValue("red,yellow,blue,green,grey");
    });
    RadioButton2.attachSelect(function() {
        Select.setEnabled(false);
        Input.setEnabled(true);
        Button.setEnabled(true);
        applyInput(["red", "yellow", "blue", "green", "grey"]);
    });

    // 3.2 Select setting (semantic color setting response)
    var changeSemanticColor = function(key) {
        if (key == "GoodOrBad") {
            binding = [{
                "feed": "valueAxis",
                "source": ["Revenue"]
            }, {
                "feed": "color",
                "source": ["Store Name"]
            }, {
                "feed": "categoryAxis",
                "source": ["Type"]
            }];
            ChartPar.binding = JSON.stringify(binding);
            chartOption = {
                plotArea: {
                    "dataPointStyleMode": "override",
                    "dataPointStyle": {
                        "rules":
                        [
                            {
                                "dataContext": {"Revenue": {"max": 1500000}},
                                "properties": {
                                    "color": "#d32030"
                                },
                                "displayName": "Revenue < 1.5M"
                            }
                        ],
                        "others":
                        {
                            "properties": {
                                "color": "#61a656"
                            },
                            "displayName": "Revenue > 1.5M"
                        }
                    }
                }
            };
            ChartPar.chartOption = JSON.stringify(chartOption);
        } else if (key == "OneCat") {
            binding = [{
                "feed": "valueAxis",
                "source": ["Revenue"]
            }, {
                "feed": "color",
                "source": ["Store Name"]
            }, {
                "feed": "categoryAxis",
                "source": ["Type"]
            }];
            ChartPar.binding = JSON.stringify(binding);
            chartOption = {
                plotArea: {
                    "dataPointStyleMode": "override",
                    "dataPointStyle": {
                        "rules":
                        [
                            {
                                "dataContext": {"Store Name": "Alexei's Specialities"},
                                "properties": {
                                    "color":"#5cbae6"
                                },
                                "displayName": "Alexei’s Specialties"
                            }
                        ],
                        "others":
                        {
                            "properties": {
                                 "color": "#b6d957"
                            },
                            "displayName": "Other Stores"
                        }
                    }
                }
            };
            ChartPar.chartOption = JSON.stringify(chartOption);
        } else if (key == "OneSeires") {
            ChartPar.data = JSON.stringify(data);
            binding = [{
                "feed": "valueAxis",
                "source": ["Revenue", "Cost"]
            }, {
                "feed": "color",
                "source": ["Store Name", {
                    "measureNames": ["valueAxis"]
                }]
            }, {
                "feed": "categoryAxis",
                "source": ["Type"]
            }];
            ChartPar.binding = JSON.stringify(binding);
            chartOption = {
                plotArea: {
                    "dataPointStyleMode": "override",
                    "dataPointStyle": {
                        "rules": 
                        [
                            {
                                "dataContext": {"Revenue": "*"},
                                "properties": {
                                    "color": "#84caec"
                                },
                                "displayName": "2013"
                            },
                            {
                                "dataContext": {"Cost": "*"},
                                "properties": {
                                    "color": "#27a3dd"
                                },
                                "displayName": "2014"
                            }
                        ],
                        "others": null
                    }
                }
            };
            ChartPar.chartOption = JSON.stringify(chartOption);
        }
        createChart();
    };
    Select.attachChange(function() {
        changeSemanticColor(this.getSelectedKey());
    });

    // 3.3 Input setting (for color palette)
    var applyInput = function(palette) {
        chartOption = {
            plotArea: {
                colorPalette: palette
            }
        };
        ChartPar.chartOption = JSON.stringify(chartOption);
        binding = [{
            "feed": "valueAxis",
            "source": ["Revenue"]
        }, {
            "feed": "color",
            "source": ["Store Name"]
        }, {
            "feed": "categoryAxis",
            "source": ["Type"]
        }];
        ChartPar.binding = JSON.stringify(binding);
        createChart();
    };
    var readInputValue = function(inputStr) {
        var colorPalette = [];
        inputStr;
    };
    readInputValue();
    Button.attachPress(function() {
        applyInput(Input.getValue().split(","));
    });
});  
