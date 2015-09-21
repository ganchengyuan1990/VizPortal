$(function() {
    var ftDsVal1 = {
        "id": "sap.viz.data.FlatTableDataset",
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
            ['Asia', 'FJ', null, 3, 18],
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
    var bindings1 = [{
        "feed": "weight",
        "source": ["Revenue"]
    }, {
        "feed": "color",
        "source": ["Number of Countries"]
    }, {
        "feed": "title",
        "source": ["Region", "Company"]
    }];
    var ftDsVal2 = {
        "id": "sap.viz.data.FlatTableDataset",
        "metadata": {
            "fields": [{
                "id": "Product",
                "name": "Product",
                "semanticType": "Dimension",
                "dataType": "String"
            }, {
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
                "id": "Revenue",
                "name": "Revenue",
                "semanticType": "Measure",
                "dataType": "Number"
            }, {
                "id": "Profit",
                "name": "Profit",
                "semanticType": "Measure",
                "dataType": "Number"
            }]
        },
        "data": [
            ['Car', 'China', "2001", 25, 50],
            ['Car', 'USA', "2001", 58, 158],
            ['Truck', 'China', "2001", 136, 236],
            ['Truck', 'USA', "2001", 128, 228],
            ['Motocycle', 'China', "2001", 23, 43],
            ['Motocycle', 'USA', "2001", 43, 143],
            ['Bicycle', 'China', "2001", 116, 126],
            ['Bicycle', 'USA', "2001", 73, 183]
        ]
    };
    var bindings2 = [{
        "feed": "valueAxis",
        "source": ["Revenue", "Profit"]
    }, {
        "feed": "categoryAxis",
        "source": ["Product"]
    }, {
        "feed": "color",
        "source": ["Country", "Year", {
            "measureNames": ["valueAxis"]
        }]
    }];
    var ftDsVal3 = {
        "id": "sap.viz.data.FlatTableDataset",
        "metadata": {
            "fields": [{
                "id": "Region",
                "name": "Product",
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
            }]
        },
        "data": [
            ['Aisa', null, 3],
            ['Aisa', 18.5, 18],
            ['Aisa', 14.2, 7],
            ['Aisa', 10.1, 10],
            ['Aisa', 21.3, 15],
            ['Europe', 13.5, 12],
            ['Europe', 10.1, 16],
            ['Europe', 32.8, 32],
            ['Europe', 8.7, 5],
            ['Europe', 27.8, 20],
            ['North America', 20.3, 21],
            ['North America', 10.9, 3],
            ['North America', 13.2, 18],
            ['North America', 7.3, 4],
            ['North America', 22.1, 21],
            ['Others', 5.2, 8],
            ['Others', 7.6, 2],
            ['Others', 19, 15],
            ['Others', 2.5, 3]
        ]
    };

    var bindings3 = [{
        "feed": "weight",
        "source": ["Number of Countries"]
    }, {
        "feed": "text",
        "source": ["Region"]
    }, {
        "feed": "color",
        "source": ["Revenue"]
    }];
    var chartOption = {
        'title': {
            visible: false
        },
        'legendGroup': {
            layout: {}
        },
        "legend": {
            title: {
                "visible": true
            },
            "visible": true
        },
        "sizeLegend": {
            title: {
                "visible": true
            },
            "visible": true
        }
    }; 
    var chart = null;
    function destory() {
        $('#chart').empty();
        if (chart) {
            chart.destroy();
            chart = undefined;
        }
    }
    var createChart = function(chartType) {
        var ftds = new sap.viz.api.data.FlatTableDataset();
        if (chartType === 'bar') {
            binding = bindings2;
            ftds.data(ftDsVal2);
        } else if (chartType === 'tagcloud') {
            binding = bindings3;
            ftds.data(ftDsVal3);
        } else if(chartType === "pie"){
            binding = [{
                "feed" : "color",
                "source" : ["Region", "Company"]
            },{
                "feed" : "size",
                "source" : ["Revenue"]
            }];
            ftds.data(ftDsVal1);
        } else if(chartType === "bubble"){
            binding = [{
                "feed" : "valueAxis",
                "source" : ["Revenue"]
            },{
                "feed" : "valueAxis2",
                "source" : ["Number of Countries"]
            },{
                "feed" : "bubbleWidth",
                "source" : ["Number of Planes"]
            },{
                "feed" : "color",
                "source" : ["Region"]
            },{
                "feed" : "shape",
                "source" : ["Company"]
            }];
            ftds.data(ftDsVal1);
        } else if(chartType === "heatmap"){
            binding = [{
                "feed" : "color",
                "source" : ["Revenue"]
            },{
                "feed" : "categoryAxis",
                "source" : ["Region", "Company"]
            }];
            ftds.data(ftDsVal1);
        } else {
            binding = bindings1;
            ftds.data(ftDsVal1);
        }
        chart = sap.viz.api.core.createViz({
            type: 'info/' + chartType,
            data: ftds,
            container: $('#chart'),
            options: chartOption,
            bindings: binding,
            css: 'undefined',
            events: {}
        });
    };

    destory();
    var chartType = $('.btn-group').find('.btn-primary').val();
    createChart(chartType);

    $('#nav a').click(function(e) {
        $(this).tab('show');
    });

    $('#nav a[href="#css"]').click(function(e) {
        //CSS tab
        var tmpcss = ".viz-legend-title{font-family:fantasy; font-size:20px; font-weight:bold; fill:red;}.viz-legend-valueLabel{font-family:fantasy; font-size:34px; font-weight:bold; fill:yellow;} .viz-axis-title{font-family:fantasy; font-size:10px; font-weight:bold; fill:red;}.viz-axis-label{font-family:fantasy; font-size:10px; font-weight:normal; fill:blue;}.viz-tooltip-background{fill:yellow;}.viz-tooltip-title{fill:red;}.viz-tooltip-label{fill:yellow;}.viz-tooltip-value{fill:blue;}";
        $('#cssContent').text(tmpcss);
    });

    $('.btn-group').click(function(e) {
        $(this).find('button').removeClass('btn-primary');
        var target = $(e.target);
        target.addClass('btn-primary');
    });

    $('.btn-group.boolPro').click(function(e) {
        var target = $(e.target);
        var proName = $(this).parent().find('.label-name').text();
        if (proName.split('.').length > 1) {
            chartOption.legend.title.visible = (target.text() === 'ON' ? true : false);
            chartOption.sizeLegend.title.visible = (target.text() === 'ON' ? true : false);
        } else {
            chartOption.legend[proName] = (target.text() === 'ON' ? true : false);
        }
        chart.properties(chartOption);
    });

    $('.btn-group.stringPro').click(function(e) {
        var target = $(e.target);
        var proName = $(this).parent().find('.label-name').text();
        chartOption.legendGroup.layout[proName] = target.val();
        chart.properties(chartOption);
    });

    $('.btn-group.chartType').click(function(e) {
        var chartType = $(e.target).val();
        chart&&chart.destroy();
        var binding;
        $('#chart').empty();
        createChart(chartType);
        
    });

    //$('#chart').resizable();
    $('#chart').bind('resizestop', function(event, ui) {
        if (chart) {
            chart.size({
                'width': $('#chart').width(),
                'height': $('#chart').height()
            });
        }
    });

    $('#applyCSS').click(function(e) {
        var cssValue = $('#cssContent').val();
        css = cssValue;
        chart.css(cssValue);
    });

    //Set plot area color
    $('#applyColor').click(function(e) {
        var startColor = $('#startColor').val();
        var endColor = $('#endColor').val();
        var colorPalette = $('#colorPalette').val();
        var legendValues = $('#legendValues').val();
        var plotArea = {};
        if (startColor) {
            plotArea.startColor = startColor;
        }
        if (endColor) {
            plotArea.endColor = endColor;
        }
        if (colorPalette) {
            plotArea.colorPalette = colorPalette.split(',');
        }
        if (legendValues) {
            plotArea.legendValues = JSON.parse(legendValues);
        }
        chartOption.plotArea = plotArea;
        chart.properties(chartOption);
    });
});