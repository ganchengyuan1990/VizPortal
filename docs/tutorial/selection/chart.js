var bar;
$(function() {
    var chartOption = {
        "plotArea": {
            "animation": {
                "dataLoading": false,
                "dataUpdating": false,
                "resizing": false
            }
        }
    };
    var feeding = undefined;
    var css = 'undefined';
    var events = {};

    var FlatTableData = {
        "metadata": {
            "fields": [{
                "id": "Region",
                "name": "Region",
                "semanticType": "Dimension",
                "dataType": "String"
            }, {
                "id": "Company",
                "name": "Company",
                "semanticType": "Dimension",
                "dataType": "String"
            }, {
                "id": "Revenue",
                "name": "Revenue",
                "semanticType": "Measure",
                "dataType": "Number"
            }, {
                "id": "Number of Countries",
                "name": "Number of Countries",
                "semanticType": "Measure",
                "dataType": "Number"
            }, {
                "id": "Number of Planes",
                "name": "Number of Planes",
                "semanticType": "Measure",
                "dataType": "Number"
            }]
        },
        "data": [
            ["Asia", "FJ", 4.6, 3, 18],
            ['Asia', 'JL', 18.5, 18, 98],
            ['Asia', 'MU', 14.2, 7, 30],
            ['Asia', 'NG', 10.1, 10, 46],
            ['Asia', 'SQ', 21.3, 15, 100],
            ['Europe', 'AB', 13.5, 12, 103],
            ['Europe', 'AF', 10.1, 16, 102],
            ['Europe', 'AZ', 32.8, 32, 150],
            ['Europe', 'BA', 8.7, 5, 73],
            ['Europe', 'LH', 27.8, 20, 100],
            ['North America', 'AA', 20.3, 21, 97],
            ['North America', 'AC', 10.9, 3, 20],
            ['North America', 'DL', 13.2, 18, 119],
            ['North America', 'NW', 7.3, 4, 30],
            ['North America', 'UA', 22.1, 21, 129],
            ['Others', 'CO', 5.2, 8, 60],
            ['Others', 'MO', 7.6, 2, 30],
            ['Others', 'QF', 19, 15, 98],
            ['Others', 'SA', 2.5, 3, 19]
        ]
    };
    var ds = new sap.viz.api.data.FlatTableDataset(FlatTableData);
    chartOption = {
        bubble: {
            selectionMode: 'multi',
            tooltipEnabled: false
        },
        title: {
            text: 'Sample Bubble Chart Title - Bubble Color Legend'
        },
        legend: {
            isHierarchy: false,
            position: 'right',
            legendType: 'BubbleColorLegend' //BubbleColorLegend
        }
    };

    var binding = [{
        "feed": "valueAxis",
        "source": ["Revenue"]
    }, {
        "feed": "valueAxis2",
        "source": ["Number of Countries"]
    }, {
        "feed": "bubbleWidth",
        "source": ["Number of Planes"]
    }, {
        "feed": "color",
        "source": ["Region"]
    }, ];


    var destroyChart = function(chart) {
        if (chart) {
            chart.destroy();
            chart = undefined;
        }
        $('#chart').empty();
    }
    destroyChart(bar);
    bar = sap.viz.api.core.createViz({
        type: 'info/bubble',
        data: ds,
        container: $('#chart'),
        bindings: binding,
    });

});

var testGetObjects = function() {
    var selectedItems = bar.selection({
        withDataCtx: getWithDataCtx(),
        withInfo: getWithInfo()
    });
    //print it
    document.getElementById("to").value = "";
    for (var i = 0; i < selectedItems.length; i++) {
        var itemString = JSON.stringify(selectedItems[i]);
        document.getElementById("to").value += itemString;
        document.getElementById("to").value += "\n";
    }
};

var testSetObjects = function() {
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

        if (newLine < 0) {
            break;
        }
    }

    bar.selection(objs, {
        selectionMode: getSelectionMode()
    });
};

var testGet = function() {
    var selectedItems = bar.getSelectedByContext();
    //print it
    document.getElementById("ta").value = "";
    for (var i = 0; i < selectedItems.length; i++) {
        var itemString = JSON.stringify(selectedItems[i]);
        document.getElementById("ta").value += itemString;
        document.getElementById("ta").value += "\n";
    }
};

var testSet = function() {
    var objStrings = document.getElementById("ta").value;

    var objs = [];
    var newLine = 0;
    for (;;) {
        newLine = objStrings.indexOf("\n");
        var objStr = objStrings.substring(0, newLine);
        if (objStr.length > 0) {
            objs.push(JSON.parse(objStr));
            objStrings = objStrings.substring(newLine + 1);
        } else {
            break;
        }
    }

    bar.setSelectedByContext(objs);
};

var updateProperties = function() {
    var chartSelectionMode = document.getElementById('chartPropertiesSel');
    var selectionMode = chartSelectionMode.value;
    bar.update({
        properties: {
            interaction: {
                selectability: {
                    mode: selectionMode
                }
            }
        }
    });
};
var getSelectionMode = function() {
    var re = false;
    var clearDOM = document.getElementById("selectionMode");
    if (clearDOM) {
        re = clearDOM.value;
    }
    return re;
};

var getWithDataCtx = function() {
    var re = false;
    var withCtx = document.getElementById("withDataCtx");
    if (withCtx) {
        re = withCtx.checked;
    }
    return re;
};

var getWithInfo = function() {
    var re = false;
    var withInfo = document.getElementById("withInfo");
    if (withInfo) {
        re = withInfo.checked;
    }
    return re;
};
