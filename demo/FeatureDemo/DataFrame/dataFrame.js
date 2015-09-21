// create code area and get codes
var JSCode; 
var HTMLCode = "<html id=\"html\">" + jQuery("#html")[0].innerHTML + "</html>";
var ChartPar = {};

sap.ui.getCore().attachInit(function() {
    // 1. Create Settings
    // 1.1 SettingPanel for the container of all setting elements
    var SettingPanel = new sap.m.Panel({
        headerText: "Settings", 
        height: "auto"
    }).placeAt("setting");

    // 1.2 VBox1 for the choice
    var label = new sap.ui.commons.Label({
        text: "Year :",
        width: "4em",
        selected: true
    });
    var item1 = new sap.ui.core.Item({
        key: "2012",
        text: "2012"
    });
    var item2 = new sap.ui.core.Item({
        key: "2013",
        text: "2013"
    });
    var item3 = new sap.ui.core.Item({
        key: "2014",
        text: "2014"
    });
    var Select = new sap.m.Select({
        width: "7.5em"
    });
    Select.insertItem(item3);Select.insertItem(item2);Select.insertItem(item1);
    Select.addStyleClass("selectStyle");
    var HBox1 = new sap.ui.layout.HorizontalLayout({
        content: [label, Select]
    });
    SettingPanel.insertContent(HBox1);
     
    Select.setEnabled(true); // default enabled state

    // 2. Create chart
    // 2.1 Generate chart parameters: data and binding
    var data = {
        'metadata' : {
            'fields' : [{
                'id' : 'Keywords', 'name' : 'Keywords', 'semanticType' : 'Dimension', 'dataType' : 'String'}, {
                'id' : 'Year', 'name' : 'Year', 'semanticType' : 'Dimension', 'dataType' : 'String'}, {
                'id' : 'Cost', 'name' : 'Cost', 'semanticType' : 'Measure', 'dataType' : 'Number'}, {
                'id' : 'Profit', 'name' : 'Profit', 'semanticType' : 'Measure', 'dataType' : 'Number'
            }]
        },
        'data' : [
            ['Cloud', '2012', 60, 120],
            ['Cloud', '2013', 50, 180],
            ['Cloud', '2014', 70, 200],
            ['Big Data', '2012', 90, 160],
            ['Big Data', '2013', 100, 130],
            ['Big Data', '2014', 120, 170],
            ['Mobile', '2012', 100, 140],
            ['Mobile', '2013', 78, 150],
            ['Mobile', '2014', 56, 160],
            ['Internet+', '2012', 45, 100],
            ['Internet+', '2013', 74, 140],
            ['Internet+', '2014', 56, 159],
            ['Machine Learning', '2012', 26, 56],
            ['Machine Learning', '2013', 75, 120],
            ['Machine Learning', '2014', 42, 90],
            ['IoT', '2012', 45, 120],
            ['IoT', '2013', 66, 170],
            ['IoT', '2014', 170, 159],
            ['Robot', '2012', 26, 56],
            ['Robot', '2013', 76, 190],
            ['Robot', '2014', 100, 179],
            ['Analytics', '2012', 76, 56],
            ['Analytics', '2013', 49, 90],
            ['Analytics', '2014', 85, 149],
            ['Platform', '2012', 90, 50],
            ['Platform', '2013', 77, 112],
            ['Platform', '2014', 66, 176],
            ['Web2.0', '2012', 45, 100],
            ['Web2.0', '2013', 74, 140],
            ['Web2.0', '2014', 56, 159],
            ['Design', '2012', 26, 56],
            ['Design', '2013', 75, 120],
            ['Design', '2014', 42, 90],
            ['Blog', '2012', 45, 120],
            ['Blog', '2013', 66, 170],
            ['Blog', '2014', 170, 159],
            ['Community', '2012', 26, 56],
            ['Community', '2013', 76, 190],
            ['Community', '2014', 100, 179],
            ['Visualisation', '2012', 76, 56],
            ['Visualisation', '2013', 49, 90],
            ['Visualisation', '2014', 85, 149],
            ['Ajax', '2012', 90, 50],
            ['Ajax', '2013', 77, 112],
            ['Ajax', '2014', 66, 176],
            ['Photography', '2012', 45, 120],
            ['Photography', '2013', 66, 170],
            ['Photography', '2014', 170, 159],
            ['Financial', '2012', 26, 56],
            ['Financial', '2013', 76, 190],
            ['Financial', '2014', 100, 179],
            ['Business', '2012', 76, 56],
            ['Business', '2013', 49, 90],
            ['Business', '2014', 85, 149],
            ['Strategy', '2012', 90, 50],
            ['Strategy', '2013', 77, 112],
            ['Strategy', '2014', 66, 176],
            ['Customer', '2012', 45, 100],
            ['Customer', '2013', 74, 140],
            ['Customer', '2014', 56, 159],
            ['Model', '2012', 26, 56],
            ['Model', '2013', 75, 120],
            ['Model', '2014', 42, 90],
            ['Service', '2012', 45, 120],
            ['Service', '2013', 66, 170],
            ['Service', '2014', 170, 159],
            ['Framework', '2012', 26, 56],
            ['Framework', '2013', 76, 190],
            ['Framework', '2014', 100, 179]
        ]
    };
    ChartPar.data = JSON.stringify(data);
    var binding = [{
        'feed' : 'dataFrame',
        'source' : ['Year']
    },{
        'feed' : 'text',
        'source' : ['Keywords']
    }, {
        'feed' : 'weight',
        'source' : ['Cost']
    }, {
        'feed' : 'color',
        'source' : ['Profit']
    }];
    ChartPar.binding = JSON.stringify(binding);
    var chart;
    var dataset = new sap.viz.api.data.FlatTableDataset();
    dataset.data(data);
    var textArea = document.getElementById('code-content');
    // 2.2 Function for creating chart, will be called every time settings are changed
    var createChart = function() {
        if (chart) {
            chart.destroy()
        }
        JSCode = "sap.viz.api.env.Resource.path('sap.viz.api.env.Template.loadPaths', ['../../../resources/libs/sap.viz/resources/chart/templates']);";
        JSCode = JSCode + "var data = " + ChartPar.data + "; var binding = " + ChartPar.binding + "; sap.viz.api.env.Template.set('standard_lumira', function() {chart = sap.viz.api.core.createViz({ type: 'info/tagcloud', data: new sap.viz.api.data.FlatTableDataset(data), container: document.getElementById('chart'), bindings: binding });chart.properties({'legend': {'visible' : false}});});"
        var delJS=['dataFrame.js'];
        var delCss=['featureStyle.css'];
        var delElementById=['setting','code-content','toggle','code'];
        toggleView("index.html",textArea,JSCode,delJS,delCss,delElementById);
        eval(JSCode);
    };
    createChart();

    // 3. Create setting responses
    // Select setting (dataFrame)
    var scales = [];
    Select.attachChange(function() {
        if (this.getSelectedKey() == "2012") {
            scales = chart.scales();
            scales[1].currentValue =scales[1].domain[0];
            chart.scales(scales);
        } else if (this.getSelectedKey() == "2013") {
            scales = chart.scales();
            scales[1].currentValue =scales[1].domain[1];
            chart.scales(scales);
        } else if (this.getSelectedKey() == "2014") {
            scales = chart.scales();
            scales[1].currentValue =scales[1].domain[2];
            chart.scales(scales);
        }
    });
});  