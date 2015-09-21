    $(function(){
    var SettingPanel = new sap.m.Panel({
    headerText: "Settings", 
    height: "auto",
    }).placeAt("setting");
    var oLayout = new sap.ui.commons.layout.MatrixLayout();
    oLayout.setLayoutFixed(false);
    oLayout.setColumns(5);
    var oRB1 = new sap.ui.commons.RadioButton({
    text : 'Scrolling',
    selected : true,
    width:'150px',
    groupName : 'Group1',
        select : function() {
            input1.setEnabled(false);
            input2.setEnabled(false); 
            button.setEnabled(false);
            chartOption.plotArea.window.start.categoryAxis.StoreName="24-Seven";
            chartOption.plotArea.window.end.categoryAxis.StoreName="Delikate";
            createChart();
          } 
    });
    oRB1.addStyleClass("myRadio");
    var oRB2 = new sap.ui.commons.RadioButton({
    text : 'Window Range',
    groupName : 'Group1',
    select : function() { 
            input1.setEnabled(true);
            input2.setEnabled(true);
            button.setEnabled(true);
            chartOption.plotArea.window.start.categoryAxis.StoreName="24-Seven";
            chartOption.plotArea.window.end.categoryAxis.StoreName="Donald's Market";
            createChart();
        } 
    });
    oRB2.addStyleClass("myRadio");
    oLayout.createRow(oRB1, oRB2);
    var input1=new sap.ui.commons.TextField();
    input1.setPlaceholder("Start Value");
    var input2=new sap.ui.commons.TextField();
    input2.setPlaceholder("End Value");
    input1.setEnabled(false);
    input2.setEnabled(false);
    var button=new sap.ui.commons.Button({
        text:'Apply',
        width:'90px'
    });
    button.setEnabled(false);
    button.attachPress(function(){
        chartOption.plotArea.window.start.categoryAxis.StoreName=input1.getValue();
        chartOption.plotArea.window.end.categoryAxis.StoreName=input2.getValue();
       createChart();
    });
    oLayout.createRow('',input1,'--',input2,button);
    SettingPanel.insertContent(oLayout);
    var textArea = document.getElementById('code-content');
var chartOption = {
    "plotArea": {
        "dataLabel": {
            "formatString":"$00000.00",
            "hideWhenOverlap": true,
            "visible": true
          },
        "window":{
            "start":{
                "categoryAxis": {'StoreName': '24-Seven'}
            },
            "end":{
                "categoryAxis": {'StoreName': "Delikate"}
            }
        }
    },
    "legend":{
        "isScrollable":true
    },
    "interaction": {
        "zoom": {
            "enablement": "enabled"
        }
    },
    "title": {
        "visible": false,
        "text": "Column Chart"
    }
};
var data = {
    "metadata": {
        "fields": [{
            "id": "StoreName",
            "name": "StoreName",
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
        ["24-Seven", 428214.13, 94383.52, 76855.15368],
        ["A&A", 1722148.36, 274735.17, 310292.22],
        ["Alexei's Specialities", 1331176.706884, 233160.58, 143432.18],
        ["BC Market", 1878466.82, 235072.19, 487910.26],
        ["Choices Franchise 1", 3386251.94, 582543.16, 267185.27],
        ["Choices Franchise 3", 2090030.97, 397952.77, 304964.8856125],
        ["Choices Franchise 6", 1932991.59, 343427.25, 291191.83],
        ["Dairy World", 752565.16, 115844.26, 98268.9597904],
        ["Delikate", 1394072.66, 263180.86, 176502.5521223],
        ["Delikatessen1", 1394072.66, 263180.86, 176502.5521223],
        ["Delikatessen2", 1394072.66, 263180.86, 176502.5521223],
        ["Delikatessen3", 1394072.66, 263180.86, 176502.5521223],
        ["Donald's Market", 3308333.872944, 611658.59, 538515.47632832]
    ]
};
var binding = [{
    "feed": "valueAxis",
    "source": ["Revenue"]
}, {
    "feed": "color",
    "source": [{
        "measureNames": ["valueAxis"]
    }]
}, {
    "feed": "categoryAxis",
    "source": ["StoreName"]
}];
 
var chart;
var code;
function createChart(){
    var stCharOption="sap.viz.api.env.Resource.path('sap.viz.api.env.Template.loadPaths', ['../../../resources/libs/sap.viz/resources/chart/templates']); var chartOption ="+JSON.stringify(chartOption)+";";
    var stData="var data="+JSON.stringify(data)+";";
    var stBinging="var binding= "+JSON.stringify(binding)+";";
    code= stCharOption+stData+stBinging;
    code=code+"var dataset = new sap.viz.api.data.FlatTableDataset();dataset.data(data);sap.viz.api.env.Template.set('standard_lumira', function() {chart = sap.viz.api.core.createViz({"+
        "type: 'info/column',"+
        "data: dataset,"+
        "container: document.getElementById('chart'),"+
        "properties: chartOption,"+
        "bindings: binding"+
    "});});"
    if(chart)
    {
        chart.destroy();
    }
    var delJS=['scrollWinRange.js'];
    var delCss=['featureStyle.css'];
    var delElementById=['setting','code-content','toggle','code'];
     toggleView("index.html",textArea,code,delJS,delCss,delElementById);
    eval(code);
}
createChart();
 });