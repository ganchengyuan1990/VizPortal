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

    var axisColor = "#707070";
    var axisGridlineColor = "#dadada";
    var backgroundColor = "#eeeeee";

    var background = {
        background: {
            color: backgroundColor,
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
            drawingEffect: "glossy"
        }
    };

    var legend = {
        legend: {
            drawingEffect: "glossy",
            title: {
                visible: true
            }
        }
    };

    var plotArea = {
        plotArea: {
            drawingEffect: "glossy"
        }
    };

    var zAxis = {
        zAxis: {
            title: {
                visible: true
            },
            color: axisColor
        }
    };

    var axis = {
        title: {
            visible: true
        },
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

    var verticalGridline = {
        gridline: {
            type: "incised",
            color: axisGridlineColor,
            showFirstLine: true
        }
    };



    var dual = {
        title: {
            applyAxislineColor: true
        }
    };
    var base = merge(background, legend, plotArea);

    var horizontalEffect = {
        xAxis: merge(axis, hideAxisLine, gridline),
        yAxis: axis,
        xAxis2: merge(axis, hideAxisLine)
    };

    var horizontalDualEffect = merge(horizontalEffect, {
        xAxis:dual,
        xAxis2:dual
    });
    delete horizontalDualEffect.xAxis.color;
    delete horizontalDualEffect.xAxis2.color;
    var verticalEffect = {
        yAxis: merge(axis, hideAxisLine, verticalGridline),
        xAxis: axis,
        yAxis2: merge(axis, hideAxisLine)
    };

    var verticalDualEffect = merge(verticalEffect, {
        yAxis:dual,
        yAxis2:dual
    });
    delete verticalDualEffect.yAxis.color;
    delete verticalDualEffect.yAxis2.color;
    //--------------------------------------------------------------
    var barEffect = merge(base, horizontalEffect);

    var bar3dEffect = merge(base, zAxis, horizontalEffect);

    var dualbarEffect = merge(base, horizontalDualEffect);

    var verticalbarEffect = merge(base, verticalEffect);

    var vertical3dbarEffect = merge(base, zAxis, verticalEffect);

    var dualverticalbarEffect = merge(base, verticalDualEffect);

    var stackedbarEffect = merge(base, horizontalEffect);

    var dualstackedbarEffect = merge(base, horizontalDualEffect);

    var stackedverticalbarEffect = merge(base, verticalEffect);

    var dualstackedverticalbarEffect = merge(base, verticalDualEffect);

    var lineEffect = merge(base, verticalEffect);

    var infoRadarEffect = merge(base, {
        plotArea: {
            polarAxis: {
                title: {
                    visible: true
                },
                color: axisColor
            },
            valueAxis: {
                color: axisColor
            }
        }

    });

    var areaEffect = merge(base, verticalEffect);

    var horizontalareaEffect = merge(base, horizontalEffect);

    var duallineEffect = merge(base, verticalDualEffect);

    var horizontallineEffect = merge(base, horizontalEffect);

    var dualhorizontallineEffect = merge(base, horizontalDualEffect);

    var combinationEffect = merge(base, verticalEffect);

    var dualcombinationEffect = merge(base, verticalDualEffect);

    var horizontalcombinationEffect = merge(base, horizontalEffect);

    var dualhorizontalcombinationEffect = merge(base, horizontalDualEffect);
    var bulletEffect =  {
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
                drawingEffect: "normal"
            },
            legend: {
                drawingEffect: "normal",
                title: {
                    visible: true
                }
            },
            plotArea: {
                drawingEffect: "normal",
                gridline:{
                    visible : true
                }
            },

            valueAxis : {
                title: {
                    visible: true
                },
                axisLine: {
                    visible: false
                },
                gridline: {
                    type: "line",
                    color: "#d8d8d8",
                    showLastLine: true
                },
                color: "#333333"
            },

            categoryAxis : {
                title: {
                    visible: true
                },
                gridline: {
                    color: "#d8d8d8"
                },
                color: "#333333"
            }
    };

    var trellisBulletEffect = merge(bulletEffect, {plotArea:{gridline:{visible:false}}});
    var bubbleEffect = merge(base, {
        yAxis: merge(axis, hideAxisLine, gridline),
        xAxis: axis
    });

    var pieEffect = merge(legend, plotArea, {
        background: {
            visible: false
        }
    });

    var pieWithDepthEffect = merge(pieEffect);

    var radarEffect = merge(legend, plotArea, {
        background: {
            visible: false
        },
        plotArea: {
            valueAxis: {
                title: {
                    visible: true
                },
                gridline: {
                    color: axisGridlineColor
                }
            }
        }
    });

    var mekkoEffect = merge(base, {
        yAxis: merge(axis, hideAxisLine, gridline),
        xAxis: merge(axis, showAxisLine),
        xAxis2: merge(axis, showAxisLine)
    });

    var horizontalmekkoEffect = merge(base, {
        xAxis: merge(axis, hideAxisLine, gridline),
        yAxis: merge(axis, showAxisLine),
        yAxis2: merge(axis, showAxisLine)
    });

    var treemapEffect = {
        legend: {
            title: {
                visible: true
            }
        }
    };

    var tagcloudEffect = {
        legend : {
            title : {
                visible : true
            }
        }
    };

    var numericEffect = merge(background, {
        plotArea: {
            valuePoint: {
                label: {
                    fontColor: '#000000'
                }
            }
        }
    });

    var heatmapEffect = {
        legend: {
            title: {
                visible: true
            }
        },
        categoryAxis: {
            title: {
                visible: true
            },
            color: axisColor
        },
        categoryAxis2: {
            title: {
                visible: true
            },
            color: axisColor

        }
    };

    var template = {
        id: "flashy",
        name: "Flashy",
        version: "4.0.0",
        properties: {
            'viz/bar': barEffect,
            'viz/3d_bar': bar3dEffect,
            'viz/image_bar': barEffect,
            'viz/multi_bar': barEffect,
            'viz/dual_bar': dualbarEffect,
            'viz/multi_dual_bar': dualbarEffect,
            'viz/column': verticalbarEffect,
            'viz/3d_column': vertical3dbarEffect,
            'viz/multi_column': verticalbarEffect,
            'viz/dual_column': dualverticalbarEffect,
            'viz/multi_dual_column': dualverticalbarEffect,
            'viz/stacked_bar': stackedbarEffect,
            'viz/multi_stacked_bar': stackedbarEffect,
            'viz/dual_stacked_bar': dualstackedbarEffect,
            'viz/multi_dual_stacked_bar': dualstackedbarEffect,
            'viz/100_stacked_bar': stackedbarEffect,
            'viz/multi_100_stacked_bar': stackedbarEffect,
            'viz/100_dual_stacked_bar': dualstackedbarEffect,
            'viz/multi_100_dual_stacked_bar': dualstackedbarEffect,
            'viz/stacked_column': stackedverticalbarEffect,
            'viz/multi_stacked_column': stackedverticalbarEffect,
            'viz/dual_stacked_column': dualstackedverticalbarEffect,
            'viz/multi_dual_stacked_column': dualstackedverticalbarEffect,
            'viz/100_stacked_column': stackedverticalbarEffect,
            'viz/multi_100_stacked_column': stackedverticalbarEffect,
            'viz/100_dual_stacked_column': dualstackedverticalbarEffect,
            'viz/multi_100_dual_stacked_column': dualstackedverticalbarEffect,
            'riv/cbar': merge(legend, plotArea, {
                background: {
                    drawingEffect: "glossy"
                },
                yAxis: axis
            }),
            'viz/combination': combinationEffect,
            'viz/horizontal_combination': horizontalcombinationEffect,
            'viz/dual_combination': dualcombinationEffect,
            'viz/dual_horizontal_combination': dualhorizontalcombinationEffect,
            'viz/boxplot': merge(base, {
                yAxis: merge(axis, hideAxisLine, verticalGridline),
                xAxis: axis
            }),
            'viz/horizontal_boxplot': merge(base, {
                xAxis: merge(axis, hideAxisLine, gridline),
                yAxis: axis
            }),
            'viz/waterfall': merge(base, {
                yAxis: merge(axis, hideAxisLine, verticalGridline),
                xAxis: {
                    title: {
                        visible: true
                    },
                    color: axisColor
                }
            }),
            'viz/horizontal_waterfall': merge(base, {
                xAxis: merge(axis, hideAxisLine, gridline),
                yAxis: {
                    title: {
                        visible: true
                    },
                    color: axisColor
                }
            }),
            'viz/stacked_waterfall': stackedverticalbarEffect,
            'viz/horizontal_stacked_waterfall': stackedbarEffect,

            'viz/line': lineEffect,
            'viz/multi_line': lineEffect,
            'viz/dual_line': duallineEffect,
            'viz/multi_dual_line': duallineEffect,
            'viz/horizontal_line': horizontallineEffect,
            'viz/multi_horizontal_line': horizontallineEffect,
            'viz/dual_horizontal_line': dualhorizontallineEffect,
            'viz/multi_dual_horizontal_line': dualhorizontallineEffect,
            'viz/area': lineEffect,
            'viz/multi_area': lineEffect,
            'viz/100_area': lineEffect,
            'viz/multi_100_area': lineEffect,
            'viz/horizontal_area': horizontallineEffect,
            'viz/multi_horizontal_area': horizontallineEffect,
            'viz/100_horizontal_area': horizontallineEffect,
            'viz/multi_100_horizontal_area': horizontallineEffect,
            'viz/pie': pieEffect,
            'viz/multi_pie': pieEffect,
            'viz/donut': pieEffect,
            'viz/multi_donut': pieEffect,
            'viz/pie_with_depth': pieWithDepthEffect,
            'viz/donut_with_depth': pieWithDepthEffect,
            'viz/multi_pie_with_depth': pieWithDepthEffect,
            'viz/multi_donut_with_depth': pieWithDepthEffect,
            'viz/bubble': bubbleEffect,
            'viz/multi_bubble': bubbleEffect,
            'viz/scatter': bubbleEffect,
            'viz/multi_scatter': bubbleEffect,
            'viz/scatter_matrix': bubbleEffect,
            'viz/radar': radarEffect,
            'viz/multi_radar': radarEffect,
            'viz/tagcloud': tagcloudEffect,
            'viz/heatmap': {
                legend: {
                    title: {
                        visible: true
                    }
                },
                xAxis: {
                    title: {
                        visible: true
                    },
                    color: axisColor
                },
                yAxis: {
                    title: {
                        visible: true
                    },
                    color: axisColor
                }
            },
            'viz/treemap': treemapEffect,
            'viz/mekko': mekkoEffect,
            'viz/100_mekko': mekkoEffect,
            'viz/horizontal_mekko': horizontalmekkoEffect,
            'viz/100_horizontal_mekko': horizontalmekkoEffect,
            'viz/number': {
                plotArea: {
                    valuePoint: {
                        label: {
                            fontColor: '#000000'
                        }
                    }
                }
            },


            // info charts
            'info/column': info(verticalbarEffect),
            'info/bar': info(barEffect),
            'info/line': info(lineEffect),
            "info/timeseries_line": infoTime(lineEffect),
            'info/pie': info(pieEffect),
            'info/donut': info(pieEffect),
            'info/scatter': infoBubble(bubbleEffect),
            'info/bubble': infoBubble(bubbleEffect),
            'info/stacked_column': info(stackedverticalbarEffect),
            'info/stacked_bar': info(stackedbarEffect),
            'info/mekko': infoMekko(stackedverticalbarEffect),
            'info/100_mekko': infoMekko(stackedverticalbarEffect),
            'info/horizontal_mekko': infoMekko(stackedbarEffect),
            'info/100_horizontal_mekko': infoMekko(stackedbarEffect),
            'info/combination': info(combinationEffect),
            'info/stacked_combination': info(combinationEffect),
            'info/dual_stacked_combination': infoDual(dualcombinationEffect),
            'info/dual_column': infoDual(dualverticalbarEffect),
            'info/dual_line': infoDual(duallineEffect),
            'info/dual_bar': infoDual(dualbarEffect),
            'info/bullet' :info(bulletEffect),
            'info/vertical_bullet': info(bulletEffect),
            'info/trellis_bullet': info(trellisBulletEffect),
            'info/trellis_vertical_bullet': info(trellisBulletEffect),
            'info/100_stacked_column': info(stackedverticalbarEffect),
            'info/100_stacked_bar': info(stackedbarEffect),
            'info/horizontal_line': info(horizontallineEffect),
            'info/dual_horizontal_line': infoDual(dualhorizontallineEffect),
            'info/horizontal_combination': info(horizontalcombinationEffect),
            'info/horizontal_stacked_combination': info(horizontalcombinationEffect),
            'info/dual_horizontal_stacked_combination': infoDual(dualhorizontalcombinationEffect),
            'info/treemap': infoTreemap(treemapEffect),
            'info/area' : info(areaEffect),
            'info/horizontal_area' : info(horizontalareaEffect),
            'info/100_area' : info(areaEffect),
            'info/100_horizontal_area' : info(horizontalareaEffect),
            'info/tagcloud' : infoTagcloud(tagcloudEffect),
            'info/heatmap': infoHeatmap(heatmapEffect),
            'info/dual_combination': infoDual(dualcombinationEffect),
            'info/dual_horizontal_combination': infoDual(dualhorizontalcombinationEffect),
            'info/number': infoNumber(numericEffect),
            'info/waterfall':info(verticalbarEffect),
            'info/stacked_waterfall' : info(stackedverticalbarEffect),
            'info/horizontal_waterfall': info(barEffect),
            'info/horizontal_stacked_waterfall': info(stackedbarEffect),
            'info/radar': infoRadar(infoRadarEffect),

            'info/trellis_area' : trellis(info(areaEffect)),
            'info/trellis_horizontal_area' : trellis(info(horizontalareaEffect)),
            'info/trellis_100_horizontal_area' : trellis(info(horizontalareaEffect)),
            'info/trellis_100_area' : trellis(info(areaEffect)),
            'info/trellis_column': trellis(info(verticalbarEffect)),
            'info/trellis_bar': trellis(info(barEffect)),
            'info/trellis_line': trellis(info(lineEffect)),
            'info/trellis_pie': trellis(info(pieEffect)),
            'info/trellis_donut': trellis(info(pieEffect)),
            'info/trellis_scatter': trellis(infoBubble(bubbleEffect)),
            'info/trellis_bubble': trellis(infoBubble(bubbleEffect)),
            'info/trellis_stacked_column': trellis(info(stackedverticalbarEffect)),
            'info/trellis_stacked_bar': trellis(info(stackedbarEffect)),
            'info/trellis_combination': trellis(info(combinationEffect)),
            'info/trellis_dual_column': trellis(infoDual(dualverticalbarEffect)),
            'info/trellis_dual_stacked_column': trellis(infoDual(dualstackedverticalbarEffect)),
            'info/trellis_dual_stacked_bar': trellis(infoDual(dualstackedbarEffect)),
            'info/trellis_100_dual_stacked_column': trellis(infoDual(dualstackedverticalbarEffect)),
            'info/trellis_100_dual_stacked_bar':  trellis(infoDual(dualstackedbarEffect)),
            'info/trellis_dual_line': trellis(infoDual(duallineEffect)),
            'info/trellis_dual_bar': trellis(infoDual(dualbarEffect)),
            'info/trellis_100_stacked_column': trellis(info(stackedverticalbarEffect)),
            'info/trellis_100_stacked_bar': trellis(info(stackedbarEffect)),
            'info/trellis_horizontal_line': trellis(info(horizontallineEffect)),
            'info/trellis_dual_horizontal_line': trellis(infoDual(dualhorizontallineEffect)),
            'info/trellis_horizontal_combination': trellis(info(horizontalcombinationEffect)),
            'info/trellis_radar': trellis(infoRadar(infoRadarEffect)),

            'info/dual_stacked_bar': infoDual(dualstackedbarEffect),
            'info/100_dual_stacked_bar': infoDual(dualstackedbarEffect),
            'info/dual_stacked_column': infoDual(dualstackedverticalbarEffect),
            'info/100_dual_stacked_column': infoDual(dualstackedverticalbarEffect),
            'info/time_bubble': infoBubble(bubbleEffect),
            'info/timeseries_scatter': infoTimeBubble(bubbleEffect),
            'info/timeseries_bubble': infoTimeBubble(bubbleEffect)
        },
        //v-longtick must be set after v-categoryaxisline
        css: "\
            .v-m-main .v-background-body{fill:#eeeeee;}\
            .v-datapoint .v-boxplotmidline{stroke:#333333}\
            .v-longtick{stroke:#b3b3b3;}\
        ",

        // css property not apply for info chart flag
        isBuiltIn : true

    };
    sap.viz.extapi.env.Template.register(template);

    function info(obj) {
        var ret = merge(obj, {
            valueAxis: merge(hideInfoAxisLine, {
                title: {
                    visible: true
                },
                color: axisColor
            }),
            categoryAxis: axis,
            plotArea: merge(obj.plotArea, gridline)
        });
        general(ret);
        return ret;
    }

    function infoRadar(obj) {
        var ret = merge(obj, {
            plotArea: merge(obj.plotArea, gridline)
        });
        general(ret);
        return ret;
    }

    function infoTime(obj){
        var ret = info(obj);
        ret.timeAxis = ret.categoryAxis;
        delete ret.categoryAxis;
        return ret;
    }

    function infoDual(obj) {
        var ret = merge(obj, {
            valueAxis: merge(hideInfoAxisLine, {
                title: {
                    visible: true,
                    applyAxislineColor: true
                }
            }),
            categoryAxis: axis,
            valueAxis2: merge(hideInfoAxisLine, {
                title: {
                    visible: true,
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

    function infoMekko(obj) {
        return merge(infoDual(obj), {
            valueAxis: {
                title: {
                    applyAxislineColor: false
                }
            },
            valueAxis2: {
                title: {
                    applyAxislineColor: false
                },
                axisLine: {
                    visible: true
                }
            }
        });
    }

    function infoTimeBubble(obj) {
        var ret = infoBubble(obj);
        ret.valueAxis = ret.valueAxis2;
        delete ret.valueAxis2;
        ret.timeAxis = axis;
        return ret;
    }

    function infoBubble(obj) {
        var ret = merge(obj, {
            valueAxis: merge(showInfoAxisLine, {
                title: {
                    visible: true
                },
                color: axisColor
            }),
            valueAxis2: merge(axis, hideInfoAxisLine),
            plotArea: merge(obj.plotArea, gridline),
            sizeLegend : {
                title:{
                  visible : true
                }
            }
        });
        general(ret);
        return ret;
    }

    function trellis(obj){
        obj.plotArea = obj.plotArea || {};
        obj.plotArea.grid = {
            background: {
                color: obj.plotArea.background.color,
                drawingEffect: obj.plotArea.background.drawingEffect,
                gradientDirection: obj.plotArea.background.gradientDirection,
                visible: obj.plotArea.background.visible
            }
        };
        return obj;
    }

    function general(obj) {
        obj.plotArea = obj.plotArea || {};
        obj.plotArea.background = obj.background;
        delete obj.background;

        delete obj.xAxis;
        delete obj.xAxis2;
        delete obj.yAxis;
        delete obj.yAxis2;

    }

    function infoTreemap(obj) {
        obj = merge(background, obj);
        return info(obj);
    }

    function infoTagcloud(obj) {
        obj = merge(background, obj);
        return info(obj);
    }

    function infoNumber(obj){
        var ret = {};
        for (var i in obj) {
            if (obj.hasOwnProperty(i)) {
                ret[i] = obj[i];
            }
        }
        general(ret);
        return ret;
    }

    function infoHeatmap(obj) {
        var ret = merge(obj, {
            categoryAxis: axis,
            categoryAxis2: axis,
            plotArea: merge(obj.plotArea, gridline)
        });
        general(ret);
        return ret;
    }
})();
