 
        $(function(){
            var code;
    var SettingPanel = new sap.m.Panel({
        headerText: "Settings", 
        height: "auto"
    }).placeAt("setting");
    var oLayout = new sap.ui.commons.layout.MatrixLayout();
    oLayout.setLayoutFixed(false);
    oLayout.setColumns(6);
    var labe1 = new sap.ui.commons.Label({
        text : 'Customize Format String',
        design: "Bold"
    });
    labe1.addStyleClass("myRadio");
    var labe2 = new sap.ui.commons.Label({
    text : 'Change Formatting',
    design: "Bold"
    });
    var labe4=new sap.ui.commons.Label({
        width:"80px",
    });
    labe2.addStyleClass("myRadio");
    oLayout.createRow(labe1,labe4,labe4,labe4,labe2);
    var labe3=new sap.ui.commons.Label({
        text:"Select Separator:"
    });
    var input1=new sap.ui.commons.TextField({
        value:"$"
    });
     var item1 = new sap.ui.core.Item({
        key: "UsingDot",
        text: "UsingDot"
    });
    var item2 = new sap.ui.core.Item({
        key: "UsingComma",
        text: "UsingComma"
    });
    var select = new sap.m.Select({});
    select.insertItem(item1);select.insertItem(item2);
    select.addStyleClass("selectStyle1");
    select.attachChange(function() {
        if(select.getSelectedIndex()==0)
       {
         chartOption.plotArea.dataLabel.formatString="000,000.00";
       }else if(select.getSelectedIndex()==1)
       {
        chartOption.plotArea.dataLabel.formatString="000\\.000\.00";
       } 
       $('#htmlView').addClass("active");
       $('#jsView').removeClass("active");
       createChart();
    });
    var button=new sap.ui.commons.Button({
        text:'Apply',
        width:'100%'
    });
   button.attachPress(function(){
       
        chartOption.plotArea.dataLabel.formatString=input1.getValue()+"00000.00";
       $('#htmlView').addClass("active");
       $('#jsView').removeClass("active");
       createChart();
    });
    var oRow = new sap.ui.commons.layout.MatrixLayoutRow();
    var oCell = new sap.ui.commons.layout.MatrixLayoutCell({
    colSpan : 2 });
    var sNBN=new sap.ui.commons.Button({
        text:'Scentific Notation',
        width:"100%"  
    });
    oCell.addContent(sNBN);
    oRow.addCell(oCell);
    sNBN.attachPress(function(){
        chartOption.plotArea.dataLabel.formatString="0\\.00000e5";
        $('#htmlView').addClass("active");
        $('#jsView').removeClass("active");
        createChart();
    });
    var resetBn=new sap.ui.commons.Button({
        text:'Reset',
        width:"80px"
    });
    resetBn.attachPress(function(){
        chartOption.plotArea.dataLabel.formatString="00000.00";
        $('#htmlView').addClass("active");
        $('#jsView').removeClass("active");
        createChart();
    });
    oLayout.createRow(labe3,select,labe4,labe4,input1,button);
    oLayout.addRow(oRow);
    oLayout.createRow(resetBn);
    SettingPanel.insertContent(oLayout);
 
 var textArea = document.getElementById('code-content');

var chartOption = {
    "plotArea": {
        "dataLabel": {
            "formatString": "",
            "hideWhenOverlap": true,
            "visible": true
        }
    },
    "interaction": {
        "zoom": {
            "enablement": "enabled"
        }
    },
    "title": {
        "visible": false,
        "text": "Dual column Chart"
    }
};
var stChartOption=JSON.stringify(chartOption);
function generateData()
{
  var data = {
    "metadata": {
        "fields": [{
            "id": "Store Name",
            "name": "Year",
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
        },{
            "id": "live",
            "name": "live",
            "semanticType": "Measure",
            "dataType": "Number"
        },{
            "id": "education",
            "name": "education",
            "semanticType": "Measure",
            "dataType": "Number"
        },{
            "id": "product",
            "name": "product",
            "semanticType": "Measure",
            "dataType": "Number"
        },{
            "id": "Year",
            "name": "Country",
            "semanticType": "Dimension",
            "dataType": "String"
        }]
    },
    "data": [
        ["2011", 2845431.12, 94383.52, 76855.15368,76855.15368,235072.19,94383.52,"China"],
        ["2011", 1722148.36, 274735.17, 310292.22,310292.22,235072.19,94383.52,"China"],
        ["2011", 1331176.706884, 233160.58, 143432.18,76855.15368,235072.19,94383.52,"China"],
        ["2011", 1878466.82, 235072.19, 487910.26,310292.22,235072.19,94383.52,"USA"],
        ["2011", 1878466.82, 235072.19, 587910.26,76855.15368,235072.19,94383.52,"USA"],
        ["2011", 1878466.82, 235072.19, 387910.26,310292.22,235072.19,94383.52,"USA"],
        ["2012", 438625.94, 382543.16, 467185.27,310292.22,235072.19,94383.52,"China"],
        ["2012", 2090030.97, 397952.77, 304964.8856125,310292.22,235072.19,94383.52,"China"],
        ["2012", 1932991.59, 343427.25, 291191.83,310292.22,235072.19,94383.52,"China"],
        ["2012", 338625.94, 582543.16, 267185.27,310292.22,235072.19,94383.52,"USA"],
        ["2012", 2090030.97, 397952.77, 304964.8856125,310292.22,235072.19,94383.52,"USA"],
        ["2012", 1932991.59, 343427.25, 291191.83,310292.22,235072.19,94383.52,"USA"],
        ["2011", 1878466.82, 235072.19, 187910.26,310292.22,235072.19,94383.52,"Canada"],
        ["2011", 1878466.82, 235072.19, 687910.26,310292.22,235072.19,94383.52,"Canada"],
        ["2011", 1878466.82, 235072.19, 787910.26,310292.22,235072.19,94383.52,"Canada"],

        ["2012", 238625.94, 582543.16, 267185.27,310292.22,235072.19,94383.52,"Canada"],
        ["2012", 2090030.97, 397952.77, 304964.8856125,310292.22,235072.19,94383.52,"Canada"],
        ["2012", 1932991.59, 343427.25, 291191.83,310292.22,235072.19,94383.52,"Canada"], 
    ]
   }; 
   return data; 
}
function generateBind()
{
    var binding = [{
    "feed": "valueAxis",
    "source": ["Revenue"]
}, {
    "feed": "valueAxis2",
    "source": ["Cost","Consumption","live","education","product"]
}, {
    "feed": "valueAxis2",
    "source": []
},{
    "feed": "trellisColumn",
    "source": ["Year"]
},{
    "feed": "color",
    "source": [{
        "measureNames": ["valueAxis", "valueAxis2"]
    }]
}, {
    "feed": "categoryAxis",
    "source": ["Store Name"]
 }];
 return binding;
}
var chart;

function createChart()
{
    var data=generateData();
    var stData=JSON.stringify(data);
    var binding=generateBind();
    var stBinding=JSON.stringify(binding);
     code="sap.viz.api.env.Resource.path('sap.viz.api.env.Template.loadPaths', ['../../../resources/libs/sap.viz/resources/chart/templates']); var chartOption ="+JSON.stringify(chartOption)+";";
     code=code+"var data="+stData+";";
     code=code+"var binding= "+stBinding+";";
     code=code+"var dataset = new sap.viz.api.data.FlatTableDataset();dataset.data(data);sap.viz.api.env.Template.set('standard_lumira', function() {chart = sap.viz.api.core.createViz({"+
            "type: 'info/trellis_dual_column',"+
            "data: dataset,"+
            "container: document.getElementById('chart'),"+
            "properties: chartOption,"+
            "bindings: binding"+
        "});});"
      if(chart)
      {
         chart.destroy();
      }
      var delJS=['dataFormatting.js'];
      var delCss=['featureStyle.css'];
      var delElementById=['setting','code-content','toggle','code'];
      toggleView("index.html",textArea,code,delJS,delCss,delElementById);
    eval(code);
}
    createChart();
 });

 
    
 
