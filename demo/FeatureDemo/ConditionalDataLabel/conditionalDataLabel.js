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
           oLayout.setColumns(3);

       
    var oRB1 =  new sap.ui.commons.RadioButton({
           text : 'First-Last',
           tooltip : 'Select First-Last',
           groupName : 'Group1',
           selected:false,
           select: function(){firstLast();}
    });
    oRB1.addStyleClass("oRBStyle");
    var oRB2 = new sap.ui.commons.RadioButton({
        text : 'Max-Min',
        tooltip : 'Select Max-Min',
        groupName : 'Group1',
        selected : false,
        select : function(){maxmin();}
       });
    oRB2.addStyleClass("oRBStyle");
    var oRB3 = new sap.ui.commons.RadioButton({
        text : '1 Serie Only',
        tooltip : 'Select 1 Series Only',
        groupName : 'Group1',
        selected : false,
        select : function(){oneSeries();}
       });
    oRB3.addStyleClass("oRBStyle");
       oLayout.createRow(oRB1,oRB2,oRB3);

      // attach it to some element in the page
    
    SettingPanel.insertContent(oLayout);
    

    
  var textArea = document.getElementById('code-content');
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
             "text": "Line chart Chart"
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
        ["Donald's Market", 3308333.872944, 611658.59, 538515.47632832]
      ]
     };
    ChartPar.data = JSON.stringify(data);
    var binding = [{
         "feed": "valueAxis",
         "source": ["Revenue"]
         }, {
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
        JSCode = "sap.viz.api.env.Resource.path('sap.viz.api.env.Template.loadPaths', ['../../../resources/libs/sap.viz/resources/chart/templates']);var chartOption = " + ChartPar.chartOption + "; var data = " + ChartPar.data + "; var binding = " + ChartPar.binding + ";sap.viz.api.env.Template.set('standard_lumira', function() { chart = sap.viz.api.core.createViz({ type: 'info/line', data: new sap.viz.api.data.FlatTableDataset(data), container: document.getElementById('chart'), properties: chartOption, bindings: binding });});"
        var delJS=['conditionalDataLabel.js'];
        var delCss=['featureStyle.css'];
        var delElementById=['setting','code-content','toggle','code'];
        toggleView("index.html",textArea,JSCode,delJS,delCss,delElementById);
        eval(JSCode);
    };
    createChart();
    function oneSeries(){
        var chartOption = {
            plotArea: {
                        dataPointStyle: {
                            "rules": 
                            [
                                {
                                    "dataContext": {"Revenue": "*"},
                                    "properties": {
                                        "dataLabel": true
                                    }
                                }
                            ],
                            "others": 
                            {
                                "properties": {
                                    "dataLabel": false
                                }
                            }
                        }
                    },
            "interaction": {
            "zoom": {
            "enablement": "enabled"
               }
             },
            "title": {
             "visible": false,
             "text": "Line chart Chart"
           }
        }; 
     ChartPar.chartOption=JSON.stringify(chartOption); 
     var binding = [{
         "feed": "valueAxis",
         "source": ["Revenue","Cost"]
         }, {
         "feed": "color",
         "source": [{"measureNames": ["valueAxis"]}]
         }, {
         "feed": "categoryAxis",
         "source": ["Store Name"]
     }];
     ChartPar.binding = JSON.stringify(binding);
     createChart();
 
    }
    function firstLast(){
        var chartOption = {
            plotArea: {
                        dataPointStyle: {
                            "rules":
                            [
                                {   // using dataContext here, you may also use callback function as below
                                    "dataContext": {"Store Name": "24-Seven"},
                                    "properties": {
                                        "dataLabel": true
                                    }
                                },
                                {
                                    "dataContext": {"Store Name": "Donald's Market"},
                                    "properties": {
                                        "dataLabel": true
                                    }
                                }
                            ],
                            "others":
                            {
                                "properties": {
                                     "dataLabel": false
                                }
                            }
                        }
                    }
        };
        ChartPar.chartOption=JSON.stringify(chartOption); 
        var binding = [{
         "feed": "valueAxis",
         "source": ["Revenue"]
         }, {
         "feed": "color",
         "source": [{"measureNames": ["valueAxis"]}]
         }, {
         "feed": "categoryAxis",
         "source": ["Store Name"]
         }];
        ChartPar.binding = JSON.stringify(binding);
        createChart();
      
    }
    function maxmin(){
        var chartOption = {
             plotArea: {
                        dataPointStyle: {
                            "rules":
                            [
                                {   // using dataContext here, you may also use callback function as below
                                    "dataContext": {"Revenue": 428214.13},
                                    "properties": {
                                        "dataLabel": true
                                    }
                                },
                                {
                                    "dataContext": {"Revenue": 3386251.94},
                                    "properties": {
                                        "dataLabel": true
                                    }
                                }
                            ],
                            "others":
                            {
                                "properties": {
                                     "dataLabel": false
                                }
                            }
                        }
                    }
        };
        var binding = [{
         "feed": "valueAxis",
         "source": ["Revenue"]
         }, {
         "feed": "color",
         "source": [{"measureNames": ["valueAxis"]}]
         }, {
         "feed": "categoryAxis",
         "source": ["Store Name"]
         }];
        ChartPar.binding = JSON.stringify(binding);
        ChartPar.chartOption=JSON.stringify(chartOption);
        createChart();
        
    }
   
});  