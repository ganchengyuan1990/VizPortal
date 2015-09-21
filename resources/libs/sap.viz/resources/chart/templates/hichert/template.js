(function() {
    var toString = Object.prototype.toString;
    function isArray(it) {
        return toString.call(it) === '[object Array]';
    }
    function isObject(it) {
        return toString.call(it) === '[object Object]';
    }
    function _merge(a, b) {
        for (var key in b) {
            if (isArray(b[key])) {
                a[key] = b[key].slice();
            } else if (isObject(b[key])) {
                a[key] = a[key] || {};
                _merge(a[key], b[key]);
            } else {
                a[key] = b[key];
            }
        }
        return a;
    }
    function merge() {
        var res = {};
        for (var i = 0; i < arguments.length; ++i) {
            _merge(res, arguments[i]);
        }
        return res;
    }

    var axisColor = "#333333";
    var axisGridlineColor = "#dadada";
    var plotColorPalette = ["#5A5A5A", 
                            "#6E6E6E",
                            "#464646",
                            "#DCDCDC",
                            "#323232"];
    var background = {
        background: {
            border: {
                top: {
                    visible: false
                },
                bottom: {
                    visible: false
                },
                left: {
                    visible: false
                },
                right: {
                    visible: false
                }
            },
        }
    };

    var legend = {
        legend: {
            title: {
                visible: false
            }
        }
    };

    var tooltip = {
        tooltip: {
        }
    };

    var plotArea = {
        plotArea: {
            "colorPalette": plotColorPalette

        }
    };

    var axis = {
        gridline: {
            color: axisGridlineColor
        },
        color: axisColor
    };

    var showAxisLine = {
        axisline: {
            visible: true
        }
    };

    var showInfoAxisLine = {
        axisLine: {
            visible: true
        }
    };

    var hideAxisLine = {
        axisline: {
            visible: false
        }
    };

    var hideInfoAxisLine = {
        axisLine: {
            visible: false
        }
    };

    var gridline = {
        gridline: {
            type: "incised",
            color: axisGridlineColor,
            showLastLine: true
        }
    };

    var base = merge(background, legend, tooltip, plotArea);

    var horizontalEffect = {
        xAxis: merge(axis, hideAxisLine, gridline),
        yAxis: axis,
        xAxis2: merge(axis, hideAxisLine)
    };

    var verticalEffect = {
        yAxis: merge(axis, hideAxisLine, gridline),
        xAxis: axis,
        yAxis2: merge(axis, hideAxisLine)
    };

    //--------------------------------------------------------------
    var barEffect = merge(base, horizontalEffect);

    var stackedbarEffect = merge(base, horizontalEffect);

    var stackedverticalbarEffect = merge(base, verticalEffect);

    var lineEffect = merge(base, verticalEffect);

    var scatterEffect = merge(base, {
        yAxis: merge(axis, hideAxisLine, gridline),
        xAxis: axis
    });
    var defaultPattern = {
        "AC": {
            "color": "#323232"
        },
        "FC": {
            "color": "#3F3F3F",
            "pattern": "hatching",
            "stroke": "#ffffff",
            "strokeWidth": "1px"
        },
        "PY": {
            "color": "#969696"
        },
        "PL": {
            "color": "#ffffff",
            "pattern":"nonFill",
            "stroke": "#323232",
            "strokeWidth": "1px"
        }
    };

    var variancePattern = {
        "up":  "#8CB300",
        "down": "#FF2500"
    };

    var template = {
        id: "hichert",
        name: "Hichert",
        version: "1.0.0",
        properties: {
            // info charts
             'info/hichert_bar': info(barEffect),
             'info/hichert_column': info(barEffect),
             'info/hichert_stacked_column': info(stackedverticalbarEffect),
             'info/hichert_stacked_bar': info(stackedbarEffect),
             'info/hichert_line': info(lineEffect),
             'info/hichert_variance_line': info(lineEffect),
            // 'info/hichert_scatter': infoScatter(scatterEffect),
        },
        scales : function() {
            var obj = {};
            var ChartTypes = [ 'info/hichert_column', 'info/hichert_bar'];
            ChartTypes.forEach(function(e) {
                obj[e] = [{
                    "feed": "pattern",
                    "type": "pattern",
                    "patterns": defaultPattern
                },{
                    "feed": "pattern2",
                    "type": "pattern",
                    "patterns": defaultPattern
                },{
                    "feed": "variance1",
                    "type": "value",
                    "colors": variancePattern
                },{
                    "feed": "variance2",
                    "type": "value",
                    "colors": variancePattern
                }];
            });
            
            ["info/hichert_variance_line"].forEach(function(e) {
                obj[e] = [{
                    "feed": "pattern",
                    "type": "pattern",
                    "patterns": defaultPattern
                },{
                    "feed": "pattern2",
                    "type": "pattern",
                    "patterns": defaultPattern
                },{
                    "feed": "variance1",
                    "type": "value",
                    "colors": variancePattern
                }];
            });

            ['info/hichert_stacked_column', 'info/hichert_stacked_bar', "info/hichert_line"].forEach(function(e) {
                obj[e] = [{
                    "feed": "pattern",
                    "type": "pattern",
                    "patterns": defaultPattern
                }];
            });
            return obj;
        }()
    };
    sap.viz.extapi.env.Template.register(template);

    function info(obj) {
        var ret = merge(obj, {
            valueAxis: merge(hideInfoAxisLine, {
                title: {
                    visible: false
                },
                color: axisColor
            }),
            categoryAxis: axis,
            plotArea: merge(obj.plotArea, gridline)
        });
        general(ret);
        return ret;
    }

    function infoDual(obj) {
        var ret = merge(obj, {
            valueAxis: merge(hideInfoAxisLine, {
                title: {
                    visible: false,
                    applyAxislineColor: true
                }
            }),
            categoryAxis: axis,
            valueAxis2: merge(hideInfoAxisLine, {
                title: {
                    visible: false,
                    applyAxislineColor: true
                },
                gridline: {
                    color: axisGridlineColor
                }
            }),
            plotArea: merge(obj.plotArea, gridline)
        });
        general(ret);
        return ret;
    }

    function infoScatter(obj) {
        var ret = merge(obj, {
            valueAxis: merge(showInfoAxisLine, {
                title: {
                    visible: false
                },
                color: axisColor
            }),
            valueAxis2: merge(axis, hideInfoAxisLine),
            plotArea: merge(obj.plotArea, gridline)
        });
        general(ret);
        return ret;
    }

    function general(obj) {
        obj.plotArea.background = obj.background;
        delete obj.background;

        delete obj.xAxis;
        delete obj.xAxis2;
        delete obj.yAxis;
        delete obj.yAxis2;
    }
})();
