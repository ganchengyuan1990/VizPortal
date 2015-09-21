$(function() {
    var crosstableDataset;
    var vizcore;
    var manifest;
    var barChart = undefined;
    var chartOption = {};
    var ds = undefined;
    $(document).ready(function() {
        loadChart();
    });

    $('#charttype').change('choosetypr', function(e) {
        var data_test = getData();
        updateTextArea(data_test);
        redrawChart();
    });

    $('#redrawChart').click('redrawchart', function(e) {
        redrawChart();
    });

    function redrawChart() {
        if(barChart){
            barChart.destroy();
            barChart = undefined;
        }
        $('#chart').empty();
        var type = $('#charttype').val();
        var newdata = getData();
        var binding = undefined;
        ds = new sap.viz.api.data.FlatTableDataset(newdata);

        chartOption = getProperties();

        if ($('#charttype').val().indexOf('dual') > -1) {
            binding = [{
                "feed": "categoryAxis",
                "source": ["Country", "Year"]
            }, {
                "feed": "valueAxis",
                "source": ["Profit", "Revenue"]
            }, {
                "feed": "valueAxis2",
                "source": ["Tax"]
            }, {
                "feed": "color",
                "source": [{
                    "measureNames": ["valueAxis", "valueAxis2"]
                }, "Product"]
            }];

        } else if ($('#charttype').val().indexOf('mekko') > -1) {
            binding = [{
                "feed": "categoryAxis",
                "source": ["Products"]
            }, {
                "feed": "valueAxis",
                "source": ["Profit"]
            }, {
                "feed": "valueAxis2",
                "source": ["Revenue"]
            }, {
                "feed": "color",
                "source": ["Country"]
            }];
        } else if ($('#charttype').val().indexOf('scatter') > -1) {
            binding = [{
                "feed": "valueAxis",
                "source": ["Revenue"]
            }, {
                "feed": "valueAxis2",
                "source": ["Number of Countries"]
            }, {
                "feed": "color",
                "source": ["Region"]
            }, ];
        } else if ($('#charttype').val().indexOf('bubble') > -1) {
            binding = [{
                "feed": "valueAxis",
                "source": ["Revenue"]
            }, {
                "feed": "valueAxis2",
                "source": ["Number of Countries"]
            }, {
                "feed": "color",
                "source": ["Region"]
            }, {
                "feed": "bubbleWidth",
                "source": ["Number of Planes"]
            }];
        } else if ($('#charttype').val().indexOf('stacked') > -1 ||
            $('#charttype').val().indexOf('bar') > -1 ||
            $('#charttype').val().indexOf('column') > -1 ||
            $('#charttype').val().indexOf('line') > -1 ||
            $('#charttype').val().indexOf('combination') > -1 ||
            $('#charttype').val().indexOf('area') > -1) {
            binding = [{
                "feed": "valueAxis",
                "source": ["Profit", "Revenue", "Tax"]
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
        } else if ($('#charttype').val().indexOf('heatmap') > -1) {
            binding = [{
                "feed": "color",
                "source": ["Margin"]
            }, {
                "feed": "categoryAxis",
                "source": ["Region", "Continent", "Country", "Year"]
            }];
        } else if ($('#charttype').val().indexOf('tagcloud') > -1) {
            binding = [{
                "feed": "weight",
                "source": ["tagwidth"]
            }, {
                "feed": "color",
                "source": ["tagfamily"]
            }, {
                "feed": "text",
                "source": ["tagname"]
            }];
        } else if ($('#charttype').val().indexOf('treemap') > -1) {
            binding = [{
                "feed": "weight",
                "source": ["Margin"]
            }, {
                "feed": "color",
                "source": ["Volume"]
            }, {
                "feed": "title",
                "source": ["Region", "Continent", "Country", "Year"]
            }];
        } else if ($('#charttype').val().indexOf('pie') > -1) {
            binding = [{
                "feed": "color",
                "source": ["Country", "Region"]
            }, {
                "feed": "size",
                "source": ["Profit"]
            }];
        }

        barChart = sap.viz.api.core.createViz({
            type: type,
            data: ds,
            container: $('#chart'),
            bindings: binding,
            options: chartOption
        });

        document.getElementById("resizeimg").draggable = false;
        document.getElementById("resizeimg").onmousedown = function(event) {
            event.preventDefault();
            return false;
        }
    }

    function updateTextArea(_data) {
        var datajson = JSON.stringify(_data);
        $('#textarea_data').val(datajson);
    }


    function loadChart() {
        var data_test = getData();
        updateTextArea(data_test);
        redrawChart();
    }

    function updateProperties() {
        var options = getProperties();
        barChart.properties(options);
    }

    function getProperties() {
        var result = {
            dataLabel: {},
            legendGroup: {
                layout: {
                    position: 'bottom'
                }
            },
            legend: {
                title: {
                    visible: true
                }
            },
            yAxis: {
                title: {
                    visible: true
                },
                gridline: {},
                scale: {},
                label: {},
                indicator: {
                    enable: false
                }
            },
            yAxis2: {
                title: {
                    visible: true
                },
                gridline: {},
                scale: {},
                indicator: {
                    enable: false
                }
            },
            xAxis: {
                title: {
                    visible: true
                },
                gridline: {},
                scale: {},
                label: {},
                indicator: {
                    enable: true
                }
            },
            xAxis2: {
                title: {
                    visible: true
                },
                gridline: {},
                scale: {},
                indicator: {
                    enable: false
                }
            },
            rowAxis: {
                title: {
                    visible: true
                }
            },
            columnAxis: {
                title: {
                    visible: true
                }
            },
            zAxis: {
                title: {
                    visible: true
                }
            },
            plotArea: {
                marker: {
                    visible: true
                },
                valueAxis: {
                    gridline: {},
                    scale: {},
                    label: {}
                },
                animation: {
                    dataLoading: true,
                    dataUpdating: true
                },
                legendValues: [10, 11, 12, 13, 14, 15]
            },
            multiLayout: {
                plotTitle: {
                    visible: true
                }
            },
            title: {
                visible: true
            }
        };
        //dataLabel
        if ($('#option_datelabel_visible').attr("checked")) {
            result.dataLabel.visible = true;
        } else {
            result.dataLabel.visible = false;
        }
        // if ($('#option_datelabel_position').attr("checked")) {
        //     result.dataLabel.position = 'inside';
        // } else {
        //     result.dataLabel.position = 'outside';
        // }
        //yAxis
        if ($('#option_yAxis_visible').attr("checked")) {
            result.yAxis.visible = true;
        } else {
            result.yAxis.visible = false;
        }
        if ($('#option_yAxis_gridline_visible').attr("checked")) {
            result.yAxis.gridline.visible = true;
        } else {
            result.yAxis.gridline.visible = false;
        }
        if ($('#option_yAxis_scale_fixedRange').attr("checked")) {
            result.yAxis.scale.fixedRange = true;
        } else {
            result.yAxis.scale.fixedRange = false;
        }
        if ($('#option_yAxis_scale_minvalue').val() !== "") {
            result.yAxis.scale.minValue = $('#option_yAxis_scale_minvalue').val();
        }
        if ($('#option_yAxis_scale_maxvalue').val() !== "") {
            result.yAxis.scale.maxValue = $('#option_yAxis_scale_maxvalue').val();
        }
        if ($('#option_yAxis_label_numberFormat').val() !== "") {
            result.yAxis.label.numberFormat = $('#option_yAxis_label_numberFormat').val();
        }
        if ($('#option_yAxis_label_formatString').val() !== "") {
            var formatStringArray = [
                []
            ];
            formatStringArray[0][0] = $('#option_yAxis_label_formatString').val();
            result.yAxis.label.formatString = $('#option_yAxis_label_formatString').val(); //formatStringArray;
        }

        //yAxis2
        if ($('#option_yAxis2_visible').attr("checked")) {
            result.yAxis2.visible = true;
        } else {
            result.yAxis2.visible = false;
        }
        if ($('#option_yAxis2_gridline_visible').attr("checked")) {
            result.yAxis2.gridline.visible = true;
        } else {
            result.yAxis2.gridline.visible = false;
        }
        if ($('#option_yAxis2_scale_fixedRange').attr("checked")) {
            result.yAxis2.scale.fixedRange = true;
        } else {
            result.yAxis2.scale.fixedRange = false;
        }
        if ($('#option_yAxis2_scale_minvalue').val() !== "") {
            result.yAxis2.scale.minValue = $('#option_yAxis2_scale_minvalue').val();
        }
        if ($('#option_yAxis2_scale_maxvalue').val() !== "") {
            result.yAxis2.scale.maxValue = $('#option_yAxis2_scale_maxvalue').val();
        }

        //xAxis
        if ($('#option_xAxis_visible').attr("checked")) {
            result.xAxis.visible = true;
        } else {
            result.xAxis.visible = false;
        }
        if ($('#option_xAxis_gridline_visible').attr("checked")) {
            result.xAxis.gridline.visible = true;
        } else {
            result.xAxis.gridline.visible = false;
        }
        if ($('#option_xAxis_scale_fixedRange').attr("checked")) {
            result.xAxis.scale.fixedRange = true;
        } else {
            result.xAxis.scale.fixedRange = false;
        }
        if ($('#option_xAxis_scale_minvalue').val() !== "") {
            result.xAxis.scale.minValue = $('#option_xAxis_scale_minvalue').val();
        }
        if ($('#option_xAxis_scale_maxvalue').val() !== "") {
            result.xAxis.scale.maxValue = $('#option_xAxis_scale_maxvalue').val();
        }
        if ($('#option_xAxis_label_numberFormat').val() !== "") {
            result.xAxis.label.numberFormat = $('#option_xAxis_label_numberFormat').val();
        }
        if ($('#option_xAxis_label_formatString').val() !== "") {
            var formatStringArray = [
                []
            ];
            formatStringArray[0][0] = $('#option_xAxis_label_formatString').val();
            result.xAxis.label.formatString = formatStringArray;
        }
        //xAxis2
        if ($('#option_xAxis2_visible').attr("checked")) {
            result.xAxis2.visible = true;
        } else {
            result.xAxis2.visible = false;
        }
        if ($('#option_xAxis2_gridline_visible').attr("checked")) {
            result.xAxis2.gridline.visible = true;
        } else {
            result.xAxis2.gridline.visible = false;
        }
        if ($('#option_xAxis2_scale_fixedRange').attr("checked")) {
            result.xAxis2.scale.fixedRange = true;
        } else {
            result.xAxis2.scale.fixedRange = false;
        }
        if ($('#option_xAxis2_scale_minvalue').val() !== "") {
            result.xAxis2.scale.minValue = $('#option_xAxis2_scale_minvalue').val();
        }
        if ($('#option_xAxis2_scale_maxvalue').val() !== "") {
            result.xAxis2.scale.maxValue = $('#option_xAxis2_scale_maxvalue').val();
        }
        //radar value axis
        if ($('#option_radar_valueAxis_visible').attr("checked")) {
            result.plotArea.valueAxis.visible = true;
        } else {
            result.plotArea.valueAxis.visible = false;
        }
        if ($('#option_radar_valueAxis_gridline_visible').attr("checked")) {
            result.plotArea.valueAxis.gridline.visible = true;
        } else {
            result.plotArea.valueAxis.gridline.visible = false;
        }
        if ($('#option_radar_valueAxis_scale_fixedRange').attr("checked")) {
            result.plotArea.valueAxis.scale.fixedRange = true;
        } else {
            result.plotArea.valueAxis.scale.fixedRange = false;
        }
        if ($('#option_radar_valueAxis_scale_minvalue').val() !== "") {
            result.plotArea.valueAxis.scale.minValue = $('#option_radar_valueAxis_scale_minvalue').val();
        }
        if ($('#option_radar_valueAxis_scale_maxvalue').val() !== "") {
            result.plotArea.valueAxis.scale.maxValue = $('#option_radar_valueAxis_scale_maxvalue').val();
        }
        if ($('#option_radar_valueAxis_label_formatString').val() !== "") {
            var formatStringArray = [
                []
            ];
            formatStringArray[0][0] = $('#option_radar_valueAxis_label_formatString').val();
            result.plotArea.valueAxis.label.formatString = formatStringArray;
        }
        return result;
    }
    function updateData() {
        var newdata = jQuery.parseJSON($('#textarea_data').val());
        ds = new crosstableDataset();
        ds.setData(newdata);
        barChart.data(ds);
    }

    function getData() {
        var getdatavalue = {};
        if ($('#charttype').val().indexOf('mekko') > -1) {
            getdatavalue = getMekkoData();
        } else if ($('#charttype').val().indexOf('scatter') > -1 ||
            $('#charttype').val().indexOf('bubble') > -1) {
            if ($('#charttype').val().indexOf('scatter_matrix') > -1) {
                getdatavalue = getOtherData();
            } else {
                getdatavalue = getBubbleData();
            }
        } else if ($('#charttype').val().indexOf('waterfall') > -1 ||
            $('#charttype').val().indexOf('pie') > -1) {
            getdatavalue = getPieData();
        } else if ($('#charttype').val().indexOf('map') > -1) {
            getdatavalue = getMapData();
        } else if ($('#charttype').val().indexOf('tagcloud') > -1) {
            getdatavalue = getTagCloudData();
        } else {
            getdatavalue = getOtherData();
        }
        return getdatavalue;
    }


    function getMekkoData() {
        var data_test_new = {
            "metadata": {
                "fields": [{
                    "id": "Country",
                    "name": "Country",
                    "semanticType": "Dimension",
                    "dataType": "String"
                }, {
                    "id": "Products",
                    "name": "Products",
                    "semanticType": "Dimension",
                    "dataType": "String"
                }, {
                    "id": "Profit",
                    "name": "Profit",
                    "semanticType": "Measure",
                    "dataType": "Number"
                }, {
                    "id": "Revenue",
                    "name": "Revenue",
                    "semanticType": "Measure",
                    "dataType": "Number"
                }]
            },
            "data": [
                ["China", "Car", 25, 252],
                ["China", "Truck", 236, 124],
                ["China", "Motorcycle", 23, 110],
                ["China", "Bicycle", 116, 80],
                ["USA", "Car", 58, 370],
                ["USA", "Truck", 128, 170],
                ["USA", "Motorcycle", 43, 220],
                ["USA", "Bicycle", 73, 100],
            ]
        };

        return data_test_new;
    }

    function getBubbleData() {
        var data_test_new = {
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
        return data_test_new;
    }

    function getPieData() {
        var data_test_new = {
            "metadata": {
                "fields": [{
                    "id": "Country",
                    "name": "Country",
                    "semanticType": "Dimension",
                    "dataType": "String"
                }, {
                    "id": "Region",
                    "name": "Region",
                    "semanticType": "Dimension",
                    "dataType": "String"
                }, {
                    "id": "Profit",
                    "name": "Profit",
                    "semanticType": "Measure",
                    "dataType": "Number"
                }]
            },
            "data": [
                ["C1", "Asia", 10],
                ["C2", "Asia", 10],
                ["C3", "Asia", -40],
            ]
        };
        return data_test_new;
    }



    function getMapData() {
        var data_test_new = {
            "metadata": {
                "fields": [{
                    "id": "Region",
                    "name": "Region",
                    "semanticType": "Dimension",
                    "dataType": "String"
                }, {
                    "id": "Continent",
                    "name": "Continent",
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
                    "id": "Margin",
                    "name": "Margin",
                    "semanticType": "Measure",
                    "dataType": "Number"
                }, {
                    "id": "Volume",
                    "name": "Volume",
                    "semanticType": "Measure",
                    "dataType": "Number"
                }]
            },
            "data": [
                ["East", "Asia", "China", "2011", 23, 11000],
                ["East", "Asia", "China", "2010", 15, 6800],
                ["East", "Asia", "China", "2009", 22, 4300],
                ["East", "Asia", "Japan", "2011", 4, 1520],
                ["East", "Asia", "Japan", "2010", 2, 790],
                ["East", "Asia", "Japan", "2009", 2, 710],
                ["West", "Europe", "France", "2011", 10, 4120],
                ["West", "Europe", "France", "2010", 5, 2070],
                ["West", "Europe", "France", "2009", 5, 1720],
                ["West", "Europe", "Germany", "2011", 14, 6210],
                ["West", "Europe", "Germany", "2010", 8, 3570],
                ["West", "Europe", "Germany", "2009", 6, 2220],
                ["West", "America", "Canada", "2011", 9, 3610],
                ["West", "America", "Canada", "2010", 5, 2100],
                ["West", "America", "Canada", "2009", 5, 1580],
                ["West", "America", "USA", "2011", 25, 12752],
                ["West", "America", "USA", "2010", 82, 7978]
            ]
        };
        return data_test_new;
    }

    function getTagCloudData() {
        var result = [];
        for (var i = 0, len = 20 / 10; i < len; i++) {
            result = result.concat(['China', 'USA', 'Japan', 'England', 'Hongkong', 'France', 'India', 'Thailand', 'Hawaii', 'Brazil']);
        }
        var data = [];
        for (var i = 0, len = result.length; i < len; i++) {
            data.push([result[i], Math.round(Math.random() * 20 + 1), Math.round(Math.random() * 20 + 1)]);
        }
        var dataTest = {
            'metadata': {
                'fields': [{
                    'id': 'tagname',
                    'name': 'tagname',
                    'semanticType': 'Dimension',
                    'dataType': 'String',
                }, {
                    'id': 'tagwidth',
                    'name': 'tagwidth',
                    'semanticType': 'Measure',
                    'dataType': 'Number',
                }, {
                    'id': 'tagfamily',
                    'name': 'tagfamily',
                    'semanticType': 'Measure',
                    'dataType': 'Number',
                }]
            },
            'data': data,
        };
        return dataTest;
    }


    function getOtherData() {
        var data_test_new = {
            "metadata": {
                "fields": [{
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
                    "id": "Product",
                    "name": "Product",
                    "semanticType": "Dimension",
                    "dataType": "String"
                }, {
                    "id": "Profit",
                    "name": "Profit",
                    "semanticType": "Measure",
                    "dataType": "Number"
                }, {
                    "id": "Revenue",
                    "name": "Revenue",
                    "semanticType": "Measure",
                    "dataType": "Number"
                }, {
                    "id": "Tax",
                    "name": "Tax",
                    "semanticType": "Measure",
                    "dataType": "Number"
                }]
            },
            "data": [
                ["China", "2001", "Car", 25, 199, 99],
                ["China", "2001", "Truck", 159, 25, 5],
                ["China", "2002", "Car", 136, 136, 36],
                ["China", "2002", "Truck", 147, 269, 69],
                ["USA", "2001", "Car", 58, 58, 8],
                ["USA", "2001", "Truck", 149, 38, 8],
                ["USA", "2002", "Car", 128, 128, 28],
                ["USA", "2002", "Truck", 269, 58, 8],
                ["Canada", "2001", "Car", 58, 127, 27],
                ["Canada", "2001", "Truck", 38, 149, 9],
                ["Canada", "2002", "Car", 24, 97, 7],
                ["Canada", "2002", "Truck", 97, 24, 4]
            ]
        };
        return data_test_new;
    }

    $('#randomSchema').click(function() {

        var testDataSet = {};

        var currentChartId = $('#charttype').val();
        var feeds = manifest.viz.get(currentChartId).allFeeds();
        var randomP = {
            hierarchy: true,
            range: 10000
        };
        var mfeeds = findFeeds(feeds, 'Measure');
        var dfeeds = findFeeds(feeds, 'Dimension');
        var feed;
        var maxStackedDims;
        for (var i = 0, len = mfeeds.length; i < len; i++) {
            feed = mfeeds[i];
            if (feed.max > 0) {
                var max = (feed.max === Infinity ? 5 : feed.max);
                var fnumber = Math.floor(getRandomNumber(feed.min, max));
                if (fnumber > 0) {
                    randomP['mv' + feed.mgIndex] = fnumber;
                }
            }
        }

        for (var i = 0, len = dfeeds.length; i < len; i++) {
            feed = dfeeds[i];
            maxStackedDims = (feed.maxStackedDims == undefined) ? 5 : feed.maxStackedDims;
            if (feed.max > 0) {
                randomP['aa' + feed.aaIndex] = Math.floor(getRandomNumber(1, maxStackedDims));
                randomP['aa' + feed.aaIndex + 'Count'] = Math.floor(getRandomNumber(1, 10));
            }
        }


        $.getJSON("http://shgtgvmwin007.dhcp.pgdev.sap.corp:8800/datagen?jsoncallback=?", randomP,

            function(data) {
                updateTextArea(data);
                testDataSet[currentChartId] = data;
                ds.setData(testDataSet[currentChartId]);
                barChart.data(ds);
            });
    });

    $('#updateProperties').click(function(e) {
        var options = getProperties();
        barChart.properties(options);
    });

    function findFeeds(feeds, type) {
        var feed, ret = [];
        for (var i = 0, len = feeds.length; i < len; i++) {
            feed = feeds[i];
            if (feed.type == type) {
                ret.push(feed);
            }
        }
        return ret;
    }

    function getRandomNumber(min, max) {
        return parseFloat((Math.random() * (max - min + 1)).toFixed(2)) + min;
    }

    function resize(o, e) {
        var e = e ? e : window.event;
        if (!window.event) {
            e.preventDefault();
        }

        var init = {
            dX: e.clientX,
            dY: e.clientY
        };

        document.onmousemove = function(e) {
            var e = e ? e : window.event;
            var dietX = e.clientX - init.dX;
            var dietY = e.clientY - init.dY;
            init.dX = e.clientX;
            init.dY = e.clientY;
            var chartX = barChart.size().width + dietX;
            var chartY = barChart.size().height + dietY
            barChart.size({
                width: chartX,
                height: chartY
            });
            var o = document.getElementById("resizediv");
            o.style.left = chartX + "px";
            o.style.top = chartY + 10 + "px";
        }
        document.onmouseup = function() {
            document.onmousemove = null;
            document.onmouseup = null;
        }
    }
});
