// create code area and get codes
var JSCode;
var HTMLCode = "<html id=\"html\">" + jQuery("#html")[0].innerHTML + "</html>";

sap.ui.getCore().attachInit(function() {
    // 1. Create Settings
    // 1.1 SettingPanel for the container of all setting elements
    var SettingPanel = new sap.m.Panel({
        headerText: "Settings",
        height: "auto"
    }).placeAt("setting");

    var label = new sap.ui.commons.Label({
        text: "Chart Type: ",
        width: "6em",
        selected: true
    });
    var chartTypeSel = new sap.m.Select({
        width: "16.5em"
    });
    var item = new sap.ui.core.Item({
        key: "info/timeseries_line",
        text: "Line Chart for Time Series"
    });
    chartTypeSel.addItem(item);
    item = new sap.ui.core.Item({
        key: "info/column",
        text: "Column Chart"
    });
    chartTypeSel.addItem(item);
    item = new sap.ui.core.Item({
        key: "info/timeseries_scatter",
        text: "Scatter Chart"
    });
    chartTypeSel.addItem(item);
    chartTypeSel.addStyleClass("selectStyle");
    var HBox1 = new sap.ui.layout.HorizontalLayout({
        content: [label, chartTypeSel]
    });
    HBox1.addStyleClass("mgr50");

    label = new sap.ui.commons.Label({
        text: "Dataset: ",
        width: "5em",
        selected: true
    });
    var dataSetSel = new sap.m.Select({
        width: "10.5em"
    });
    item = new sap.ui.core.Item({
        key: "100000",
        text: "100k"
    });
    dataSetSel.addItem(item);
    item = new sap.ui.core.Item({
        key: "50000",
        text: "50k"
    });
    dataSetSel.addItem(item);
    item = new sap.ui.core.Item({
        key: "10000",
        text: "10k"
    });
    dataSetSel.addItem(item);
    dataSetSel.addStyleClass("selectStyle");
    var HBox2 = new sap.ui.layout.HorizontalLayout({
        content: [label, dataSetSel]
    });
    var HBox3 = new sap.ui.layout.HorizontalLayout({
        content: [HBox1, HBox2],
        allowWrapping: true
    });
    SettingPanel.insertContent(HBox3);

    chartTypeSel.setEnabled(true); // default enabled state
    dataSetSel.setEnabled(true); // default enabled state

    // 2. Create chart
    // 2.1 Generate chart parameters: data and binding
    var data;
    var binding;
    var chartType = "info/timeseries_line";
    var dataVolume = 100000;
    var chart;

    var dataRowByType = {
        "info/timeseries_line": dataRowForLineColumn,
        "info/column": dataRowForLineColumn,
        "info/timeseries_scatter": dataRowForScatter
    };

    var metadataByType = {
        "info/timeseries_line": {
            "fields": [{
                "id": "Date",
                "name": "Date",
                "semanticType": "Dimension",
                "dataType": "Date"
            }, {
                "id": "Company",
                "name": "Company",
                "semanticType": "Dimension",
                "dataType": "String"
            }, {
                "id": "Price",
                "name": "Price in US dollar",
                "semanticType": "Measure",
                "dataType": "Number"
            }]
        },
        "info/column": {
            "fields": [{
                "id": "Date",
                "name": "Date",
                "semanticType": "Dimension",
                "dataType": "String"
            }, {
                "id": "Company",
                "name": "Company",
                "semanticType": "Dimension",
                "dataType": "String",
                "domain": ["AT&T", "T-Mobile", "Sprint"]
            }, {
                "id": "Price",
                "name": "Price in US dollar",
                "semanticType": "Measure",
                "dataType": "Number"
            }]
        },
        "info/timeseries_scatter": {
            "fields": [{
                "id": "Date GMT",
                "name": "Date GMT",
                "semanticType": "Dimension",
                "dataType": "Date"
            }, {
                "id": "Sample Measurement",
                "name": "Sample Measurement",
                "semanticType": "Measure",
                "dataType": "Number"
            }, {
                "id": "State Code",
                "name": "State Code",
                "semanticType": "Dimension",
                "dataType": "String",
                "domain": ["06"]
            }, {
                "id": "County Code",
                "name": "County Code",
                "semanticType": "Dimension",
                "dataType": "String",
                "domain": ["037"]
            }]
        }
    };

    var bindingByType = {
        "info/timeseries_line": [{
            "feed": "color",
            "source": ["Company"]
        }, {
            "feed": "timeAxis",
            "source": ["Date"]
        }, {
            "feed": "valueAxis",
            "source": ["Price"]
        }],
        "info/column": [{
            "feed": "valueAxis",
            "source": ["Price"]
        }, {
            "feed": "color",
            "source": ["Company"]
        }, {
            "feed": "categoryAxis",
            "source": ["Date"]
        }],
        "info/timeseries_scatter": [{
            "feed": "timeAxis",
            "source": ["Date GMT"]
        }, {
            "feed": "valueAxis",
            "source": ["Sample Measurement"]
        }, {
            "feed": "color",
            "source": ["State Code"]
        }, {
            "feed": "shape",
            "source": ["County Code"]
        }]
    };

    function getDataRow(key, dataRow) {
        return dataRow.slice(0, +key);
    }

    function generateNewData(key) {
        data = {
            "metadata": metadataByType[chartType],
            "data": getDataRow(key, dataRowByType[chartType])
        };
    }

    generateNewData(100000);

    var chartOption = {
        categoryAxis: {
            visible: false
        },
        plotArea: {
            isFixedDataPointSize: false,
            dataPoint: {
                savingMode: true
            }
        },
        timeAxis: {
            interval: {
                unit: null
            }
        },
        interaction: {
            zoom: {
                enablement: 'enabled',
                direction: 'categoryAxis'
            }
        }
    };

    function startLoading() {
        jQuery("img#loading").css("display", "block");
    }

    function endLoading() {
        jQuery("img#loading").css("display", "none");
    }

    var textArea = document.getElementById('code-content');
    // 2.2 Function for creating chart, will be called every time settings are changed
    var createChart = function() {
        if (chart) {
            chart.destroy();
        }
        startLoading();
        binding = bindingByType[chartType];
        setTimeout(function() {
            JSCode = "sap.viz.api.env.Resource.path('sap.viz.api.env.Template.loadPaths', ['../../../resources/libs/sap.viz/resources/chart/templates']);";
            JSCode += "var data = " + JSON.stringify(data) + ";";
            JSCode += "var binding = " + JSON.stringify(binding) + ";";
            JSCode += "var chartOption = " + JSON.stringify(chartOption) + ";";
            JSCode += "sap.viz.api.env.Template.set('standard_lumira', function() {chart = sap.viz.api.core.createViz({ type: '" + chartType + "', data: new sap.viz.api.data.FlatTableDataset(data, {skipCloneData: true}), container: document.getElementById('chart'), bindings: binding, properties:chartOption });});";
            eval(JSCode);
            endLoading();
        }, 100);
        var dataRowToDisplay = data.data.slice(0, 10);
        dataRowToDisplay.push("................");

        var JSCodeForDisplay = "sap.viz.api.env.Resource.path('sap.viz.api.env.Template.loadPaths', ['../../../resources/libs/sap.viz/resources/chart/templates']);";
        JSCodeForDisplay += "var data = " + JSON.stringify({
            metadata: data.metadata,
            data: dataRowToDisplay
        }) + ";//Omitted some for there are too many to display.\n";
        JSCodeForDisplay += "var binding = " + JSON.stringify(binding) + ";";
        JSCodeForDisplay += "var chartOption = " + JSON.stringify(chartOption) + ";";
        JSCodeForDisplay += "sap.viz.api.env.Template.set('standard_lumira', function() {chart = sap.viz.api.core.createViz({ type: '" + chartType + "', data: new sap.viz.api.data.FlatTableDataset(data), container: document.getElementById('chart'), bindings: binding, properties:chartOption });});";
        var delJS = ['index.js'];
        var delCss = ['featureStyle.css', "index.css"];
        var delElementById = ['setting', 'code-content', 'toggle', 'code', "loading"];
        toggleView("index.html", textArea, JSCodeForDisplay, delJS, delCss, delElementById);
    };
    createChart();

    chartTypeSel.attachChange(function() {
        chartType = this.getSelectedKey();
        generateNewData(dataVolume);
        createChart();
    });

    dataSetSel.attachChange(function() {
        dataVolume = this.getSelectedKey();
        generateNewData(dataVolume);
        createChart();
    });

});