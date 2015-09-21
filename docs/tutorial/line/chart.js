$(function() {
    sap.viz.api.env.Resource.path("sap.viz.api.env.Template.loadPaths", ["../../resources/libs/sap.viz/resources/chart/templates"]);
    var chartOption = {
        plotArea: {
            /*
            lineStyle : {
              rules : [ {
                // if you want to set a lot of condition, you can set condition as a array.
                dataContext : [ {
                  Country : {
                    contain : [ "Canada", "USA" ]
                  },
                  Profit : "*"
                } ],
                properties : {
                  width : 6
                }
              } ]
            },
            */
            dataLabel: {}
        },
        interaction: {
            selectability: {
                mode: 'exclusive'
            }
        },
        title: {
            visible: true,
            text: 'Sample Line Chart Title'
        },
        tooltip: {
            preRender: function(domNode) {
                domNode.append('button').node().textContent = 'ext button';
            },
            postRender: function(domNode) {
                domNode.select('.v-tooltip-selectedText').style('color', 'red');
            }
        },
        categoryAxis: {
            title: {
                visible: true
            }
        },
        valueAxis: {
            title: {
                visible: true
            }
        },
        legend: {
            title: {
                visible: true
            }
        }
    };

    var FlatTableData = {
        "metadata": {
            "fields": [{
                "id": "Country",
                "name": "COUNTRY",
                "semanticType": "Dimension",
                "dataType": "String"
            }, {
                "id": "Year",
                "name": "YEAR",
                "semanticType": "Dimension",
                "dataType": "String"
            }, {
                "id": "Product",
                "name": "PRODUCT",
                "semanticType": "Dimension",
                "dataType": "String"
            }, {
                "id": "Profit",
                "name": "PROFIT",
                "semanticType": "Measure",
                "dataType": "Number"
            }, {
                "id": "Revenue",
                "name": "REVENUE",
                "semanticType": "Measure",
                "dataType": "Number"
            }]
        },
        "data": [
            ["China", "2001", "Car", 25, 50],
            ["China", "2001", "Truck", 159, 300],
            ["China", "2001", "Motorcycle", 129, 229],
            ["China", "2002", "Car", 136, 272],
            ["China", "2002", "Truck", 147, 247],
            ["China", "2002", "Motorcycle", 47, 147],
            ["USA", "2001", "Car", 58, 116],
            ["USA", "2001", "Truck", 149, 249],
            ["USA", "2001", "Motorcycle", 49, 149],
            ["USA", "2002", "Car", 128, 256],
            ["USA", "2002", "Truck", 269, 369],
            ["USA", "2002", "Motorcycle", 69, 169],
            ["Canada", "2001", "Car", 58, 116],
            ["Canada", "2001", "Truck", 38, 68],
            ["Canada", "2001", "Motorcycle", 33, 133],
            ["Canada", "2002", "Car", 24, 48],
            ["Canada", "2002", "Truck", 97, 197],
            ["Canada", "2002", "Motorcycle", 47, 147]
        ]
    };

    var ds = new sap.viz.api.data.FlatTableDataset(FlatTableData);

    var line = undefined;

    function createChart(type) {
        type = "info/line";

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

        line = sap.viz.api.core.createViz({
            type: type,
            data: ds,
            container: $('#chart'),
            options: chartOption,
            bindings: binding
        });
        //updatePropertiesPanel();
    }
    
    if(line){
        line.destroy();
        line = undefined;
        $("#chart").empty();
    }
    createChart();

    $('#chart').resizable({
        resize: function(event, ui) {
            if (line) {
                line.size({
                    width: ui.size.width,
                    height: ui.size.height
                });
            }
        }
    });

    var testGetObjects = function() {
        var selectedItems = line.selection();
        //print it
        document.getElementById("to").value = "";
        for (var i = 0; i < selectedItems.length; i++) {
            var itemString = JSON.stringify(selectedItems[i]);
            document.getElementById("to").value += itemString;
            document.getElementById("to").value += "\n";
        }
    };

    var clearSelection = function() {
        line.selection([], {
            clearSelection: true
        });
    }

    var testSetObjects = function(clearSelection) {
        var objStrings = document.getElementById("to").value;

        var objs = [];
        var newLine = 0;
        for (;;) {
            var objStr;
            newLine = objStrings.indexOf("\n");
            if (newLine < 0) {
                objStr = objStrings;
            } else {
                objStr = objStrings.substring(0, newLine);
            }

            if (objStr.length > 0) {
                objs.push(JSON.parse(objStr));
                objStrings = objStrings.substring(newLine + 1);
            }

            if (newLine <= 0) {
                break;
            }
        }

        line.selection(objs, {
            clearSelection: clearSelection
        });
    };

});