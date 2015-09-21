// create code area and get codes
var JSCode; 
var HTMLCode = "<html id=\"html\">" + jQuery("#html")[0].innerHTML + "</html>";
var ChartPar = {};

sap.ui.getCore().attachInit(function() {
   
    var SettingPanel = new sap.m.Panel({
        headerText: "Settings", 
        height: "auto"
    }).placeAt("setting");

    var oLayout = new sap.ui.commons.layout.MatrixLayout("matrix1");
           oLayout.setLayoutFixed(false);
           oLayout.setColumns(1);

    var oCB1 = new sap.ui.commons.CheckBox({
           text : 'Enable Reference Line',
           tooltip : 'Select Reference Line',
           selected:false,
          });
    oCB1.attachChange(function(){
        var isChecked = oCB1.getChecked();
        if(isChecked){
            referenceLine();
        }else{
            delReferenceLine();
        }
    });
      
    
    oLayout.createRow(oCB1);
    SettingPanel.insertContent(oLayout);
    var chartOption = {
    "plotArea": {
        "dataLabel": {
            "formatString":"$00000.00",
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
        "text": "Bar Chart"
        }
    };
    ChartPar.chartOption = JSON.stringify(chartOption);
    var data = {
        "metadata": {
            "fields": [{
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
            ["24-Seven", 428214.13, 94383.52, 76855.15368],
            ["A&A", 1722148.36, 274735.17, 310292.22],
            ["Alexei's Specialities", 1331176.706884, 233160.58, 143432.18],
            ["BC Market", 1878466.82, 235072.19, 487910.26],
            ["Choices Franchise 1", 3386251.94, 582543.16, 267185.27],
            ["Choices Franchise 3", 2090030.97, 397952.77, 304964.8856125],
            ["Choices Franchise 6", 1932991.59, 343427.25, 291191.83],
            ["Dairy World", 752565.16, 115844.26, 98268.9597904],
            ["Delikatessen", 1394072.66, 263180.86, 176502.5521223],
            ["Donald's Market", 3308333.872944, 611658.59, 538515.47632832],
            ["Euro Specials",308490.22,49242.11,30143.96],
            ["Europ. Spec.",1935851.92,356767.68,275449.9578759],
            ["FastFood Inc", 816043.19,131097.81,188724.28],
            ["Food and more",620772.97,118126.43,81511.4769567],
            ["Food Basics",1203178.19,226328.05,150051.5416602],
            ["Fresh Market",164873.41,26136.44,27373.69],
            ["Gogo Grocercies",462603.36,76356.3,122910.5],
            ["Greens",84958.74,15020.07,17633.57]
        ]
    };
    ChartPar.data = JSON.stringify(data);
     var binding = [{
             "feed": "valueAxis",
             "source": ["Revenue"]
             },{
             "feed": "color",
             "source": [{"measureNames": ["valueAxis"]}]
             }, {
             "feed": "categoryAxis",
             "source": ["Store Name"]
             }];
    ChartPar.binding = JSON.stringify(binding);
    var chart;
    var dataset = new sap.viz.api.data.FlatTableDataset();
    dataset.data(data);
var textArea = document.getElementById('code-content');
 
    var createChart = function() {
        if (chart) {
            chart.destroy()
        }
        JSCode = "sap.viz.api.env.Resource.path('sap.viz.api.env.Template.loadPaths', ['../../../resources/libs/sap.viz/resources/chart/templates']);var chartOption = " + ChartPar.chartOption + "; var data = " + ChartPar.data + "; var binding = " + ChartPar.binding + ";sap.viz.api.env.Template.set('standard_lumira', function() { chart = sap.viz.api.core.createViz({ type: 'info/column', data: new sap.viz.api.data.FlatTableDataset(data), container: document.getElementById('chart'), properties: chartOption, bindings: binding });});"
       var delJS=['referenceLine.js'];
       var delCss=['featureStyle.css'];
       var delElementById=['setting','code-content','toggle','code'];
      toggleView("index.html",textArea,JSCode,delJS,delCss,delElementById);
        eval(JSCode);
    };
    createChart();
    function referenceLine(){
        var chartOption = {
           "plotArea": {
              "dataLabel": {
                  "hideWhenOverlap": true,
                  "visible": true
                 },
                "referenceLine": {
                   "line": {
                         "valueAxis": [{
                             "value": 900000,
                             "visible": true,
                             "color": "#666666",
                             "size": 2,
                             "label":{
                                "text":"Average:900K"
                             }
                             }]
                        }
                    },
                 },
           "interaction": {
              "zoom": {
              "enablement": "enabled"
                 }
            },
           "title": {
              "visible": false,
              "text": "Bar Chart"
            }
        };
       ChartPar.chartOption = JSON.stringify(chartOption);
       createChart();
    }
    function delReferenceLine(){
        var chartOption = {
           "plotArea": {
              "dataLabel": {
                  "hideWhenOverlap": true,
                  "visible": true
                 },
                },
           "interaction": {
              "zoom": {
              "enablement": "enabled"
                }
            },
           "title": {
              "visible": false,
              "text": "Bar Chart"
            }
        };
       ChartPar.chartOption = JSON.stringify(chartOption);
       createChart();

    }
  
});  