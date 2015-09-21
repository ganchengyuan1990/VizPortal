(function() {
    var toString = Object.prototype.toString;
    function isArray(it){
        return toString.call(it) === '[object Array]';
    }
    function isObject(it){
        return toString.call(it) === '[object Object]';
    }
    function _merge(a, b){
        for(var key in b){
            if(isArray(b[key])){
                a[key] = b[key].slice();
            }else if(isObject(b[key])){
                a[key] = a[key] || {};
                _merge(a[key], b[key]);
            }else{
                a[key] = b[key];
            }
        }
        return a;
    }
    function merge(){
        var res = {};
        for(var i = 0; i < arguments.length; ++i){
            _merge(res, arguments[i]);
        }
        return res;
    }

    var categoryAxisColor = "#babab9";
    var valueAxisColor = "#878786";
    var gridlineColor = "#ececec";

    var barWithFixedDataPointSize = {
        plotArea:{
            isFixedDataPointSize: true,
            dataPointSize: {min: 8, max: 100},
            gap:{
                groupSpacing: 1.5,
                innerGroupSpacing: 0,
                barSpacing:0.5
            }
        }
    };

    var layoutRatio = {
        legendGroup: {
            layout: {
                maxHeight: 0.2,
                maxWidth: 0.2
            }
        },
        title: {
            layout: {
                maxHeight: 0.2,
                maxWidth: 0.2
            }
        },
        categoryAxis: {
            layout: {
                maxHeight: 0.2,
                maxWidth: 0.2
            }
        },
        valueAxis: {
            layout: {
                maxHeight: 0.15,
                maxWidth: 0.15
            }
        }
    };

    var vizSpec = {
        layout: {
            categoryAxis: {
                maxSizeRatio: 0.20
            },
            valueAxis: {
                maxSizeRatio: 0.15
            },
            dualValue: {
                maxSizeRatio: 0.10
            }
        }
    };

    var padding = {
        general:{
            layout:{
                padding:0.05
            }
        }
    };

    var gridLineStyle = {
        plotArea:{
            gridline:{
                visible: true,
                size: 1,
                color: "#ececec"
            }
        }
    };

    var referenceLineStyle = {
        plotArea:{
            referenceLine:{
                defaultStyle:{
                    label: {
                        fontSize: "11px",
                        fontWeight: "normal"
                    }
                }
            }
        }
    };

    var background = {
        background: {
            border: {
                left: {
                    visible: false
                },

                right: {
                    visible: false
                },

                top: {
                    visible: false
                },

                bottom: {
                    visible: false
                }
            }
        }
    };

    var title = {
        title: {
            alignment: "left",
            visible: false
        }
    };

    var tooltip = {
        tooltip: {
            visible: false
        }
    };

    var legend = {
        legend: {
            visible: false
        }
    };

    var interaction = {
        interaction: {
            selectability: {
                mode: "none"
            },
            enableMouseOver: false,
            enableMouseOut: false,
            enableMouseMove: false,
            enableHover: false
        }
    };

    var plotArea = {
        plotArea: {
            colorPalette: ["#a5d5cb", "#d7ccbf", "#ee6643", "#58c1ef", "#00abaa", "#f6aa6e", "#f9d17b", "#d3cf28", "#eeec9d", "#929896"],
            primaryValuesColorPalette: ["#00abaa", "#8ccdcd", "#d4ebeb"],
            secondaryValuesColorPalette: ["#ee6a05", "#f6aa6e", "#fcddc3"],
            animation: {
                dataLoading: false,
                dataUpdating: false,
                resizing: false
            }
        }
    };

    var axis = {
        lineSize: 1,
        label: {
            visible: true
        },
        axisline: {
            visible: true
        },
        enableLabelSelection: false
    };

    var hideAxisLine = {
        axisline: {
            visible: false
        }
    };

    var showAxisLine = {
        axisline: {
            visible: true
        }
    };

    var valueAxis = merge(axis, {
        color: valueAxisColor
    }, hideAxisLine, vizSpec.layout.valueAxis);

    var categoryAxis = merge(axis, {
        color: categoryAxisColor
    }, showAxisLine, vizSpec.layout.valueAxis);

    var gridline_base = {
        gridline: {
            type: "line",
            size: 1,
            color: gridlineColor
        }
    };

    var gridline_h = merge(gridline_base, {
        gridline: {
            showFirstLine: false,
            showLastLine: true
        }
    });

    var gridline_v = merge(gridline_base, {
        gridline: {
            showFirstLine: true,
            showLastLine: false
        }
    });

    function dualify(props, horizontal) {
        var prefix = horizontal ? "x" : "y",
            val1 = props[prefix + "Axis"],
            val2 = props[prefix + "Axis2"];
        if (val1) {
            delete val1.color;
        }
        if (val2) {
            delete val2.color;
        }
        return props;
    }

    var horizontalEffect = {
        xAxis: merge(valueAxis, gridline_h),
        yAxis: categoryAxis,
        xAxis2: valueAxis
    };

    var verticalEffect = {
        yAxis: merge(valueAxis, gridline_v),
        xAxis: categoryAxis,
        yAxis2: valueAxis
    };

    var xyEffect = {
        xAxis: categoryAxis,
        yAxis: merge(valueAxis, gridline_v)
    };

    var xxEffect = {
        categoryAxis: categoryAxis,
        categoryAxis2: categoryAxis
    };

    var zAxis = {
        zAxis: categoryAxis
    };

    var multiAxisProperty = {
        gridline: {
            color: gridlineColor
        },
        enableLabelSelection: false
    };

    var multiple = {
        rowAxis: merge(multiAxisProperty,{color: categoryAxisColor}),
        columnAxis: merge(multiAxisProperty,{color: categoryAxisColor})
    };

    var rotate = {
        rotate: {
            enableRotate: false
        }
    };

    var trellis_axes = {
        columnAxis: {
            title: {
                style: {
                    fontSize: 12,
                    color: "#000000"
                }
            }
        },
        rowAxis: {
            title: {
                style: {
                    fontSize: 12,
                    color: "#000000"
                }
            }
        }
    };

    var zoom = {
       interaction: {
           zoom: {
               direction: "categoryAxis"
           }
       }
    };

    var base = merge(background, title, tooltip, legend, interaction, plotArea, multiple, trellis_axes, zoom);
    //-----------------------------------------------

    var ghost_properties_vertical_bar = merge(base, verticalEffect, barWithFixedDataPointSize);

    var ghost_properties_horizontal_bar = merge(base, horizontalEffect, barWithFixedDataPointSize);

    var ghost_properties_horizontal_3dbar = merge(base, xyEffect, zAxis, rotate);

    var ghost_properties_vertical_3dbar = merge(base, xyEffect, zAxis, rotate);

    var ghost_properties_horizontal_stackedbar = merge(base, horizontalEffect, barWithFixedDataPointSize);

    var ghost_properties_vertical_stackedbar = merge(base, verticalEffect, barWithFixedDataPointSize);

    var ghost_properties_horizontal_line = merge(base, horizontalEffect, {
        plotArea: {
            marker: {
                visible: false
            },
            tooltipVisble: false
        }
    });

    var ghost_properties_vertical_line = merge(base, verticalEffect, {
        plotArea: {
            marker: {
                visible: false
            }
        }
    });

    var ghost_properties_info_radar = merge(base, {
        plotArea: {
            marker: {
                visible: false
            }
        },
        valueAxis: {
            color: valueAxisColor
        },
        polarAxis: {
            color: categoryAxisColor,
            axisline: {
                visible: true
            }
        }
    });

    var ghost_properties_vertical_area = merge(base, verticalEffect);

    var ghost_properties_horizontal_area  = merge(base, horizontalEffect);

    var ghost_properties_horizontal_combination = merge(base, horizontalEffect, {
        plotArea: {
            line: {
                marker: {
                    visible: false
                }
            },
            tooltipVisble: false
        }
    }, barWithFixedDataPointSize);

    var ghost_properties_vertical_combination = merge(base, verticalEffect, {
        plotArea: {
            line: {
                marker: {
                    visible: false
                }
            }
        }
    }, barWithFixedDataPointSize);

    var ghost_properties_bubble = merge(base, xyEffect, {
        sizeLegend: {
            visible: false
        }
    });

    var ghost_properties_scatter = merge(base, xyEffect);

    var ghost_properties_scattermatrix = merge(base, xyEffect, {
        xAxis: {
            gridline: {
                visible: false
            }
        },
        multiLayout: {
            plotTitle: {
                visible: false
            }
        }
    });
    var mbcColor = {
        plotArea: {
            colorPalette: ["#353838", "#0e606d", "#188ba1", "#18b3cf", "#5dc4e7", "#a5d9ec", "#e6f4fa"]
        }
    };

    var ghost_properties_heatmap = merge(base, xyEffect, mbcColor);
    var ghost_properties_info_heatmap = merge(base, xxEffect, mbcColor);

    var ghost_properties_treemap = merge(base, mbcColor);

    var ghost_properties_info_heatmap = merge(base, xxEffect, mbcColor);

    var ghost_properties_tagcloud = merge(base, mbcColor);

    var ghost_properties_pie = merge(base);

    var ghost_properties_donut = merge(base);

    var ghost_properties_pie_with_depth = merge(base, rotate);

    var ghost_properties_donut_with_depth = merge(base, rotate);

    var ghost_properties_radar = merge(base, {
        plotArea: {
            polarAxis: {
                title: {
                    visible: false
                }
            },
            valueAxis: {
                visible: true
            }
        }
    });

    var ghost_properties_vertical_boxplot = merge(base, verticalEffect);

    var ghost_properties_horizontal_boxplot = merge(base, horizontalEffect);

    var ghost_properties_vertical_waterfall = merge(base, verticalEffect, gridline_h);

    var ghost_properties_horizontal_waterfall = merge(base, horizontalEffect, gridline_v);

    var ghost_properties_mekko = merge(base, horizontalEffect);

    var ghost_properties_horizontal_mekko = merge(base, verticalEffect);

    var ghost_properties_network = merge(base, {
        plotArea: {
            draggable: false,
            label: {
                visible: false
            }
        }
    });

    var ghost_properties_tree = merge(base, {
        plotArea: {
            clickAble: false,
            label: {
                visible: false
            }
        }
    });

    var bulletEffect = merge(base, {});
    var trellisBulletEffect = merge(bulletEffect, {plotArea:{gridline:{visible: false}}});

    var ghost_properties_number = merge(background, title, interaction, {
        plotArea: {
            valuePoint: {
                label: {
                    fontColor: '#8A8A8A'
                }
            }
        }
    });
    sap.viz.extapi.env.Template.register({
        id: "incomplete_ghost_lumira",
        name: "Incomplete Ghost Lumira",
        version: "4.0.0",
        isGhost: true,
        properties: {
            'viz/bar': ghost_properties_horizontal_bar,
            'viz/image_bar': ghost_properties_horizontal_bar,
            'viz/multi_bar': ghost_properties_horizontal_bar,
            'viz/dual_bar': dualify(ghost_properties_horizontal_bar, true),
            'viz/multi_dual_bar': dualify(ghost_properties_horizontal_bar, true),
            'viz/column': ghost_properties_vertical_bar,
            'viz/multi_column': ghost_properties_vertical_bar,
            'viz/dual_column': dualify(ghost_properties_vertical_bar, false),
            'viz/multi_dual_column': dualify(ghost_properties_vertical_bar, false),
            'viz/stacked_bar': ghost_properties_horizontal_stackedbar,
            'viz/multi_stacked_bar': ghost_properties_horizontal_stackedbar,
            'viz/dual_stacked_bar': ghost_properties_horizontal_stackedbar,
            'viz/multi_dual_stacked_bar': dualify(ghost_properties_horizontal_stackedbar, true),
            'viz/100_stacked_bar': ghost_properties_horizontal_stackedbar,
            'viz/multi_100_stacked_bar': ghost_properties_horizontal_stackedbar,
            'viz/100_dual_stacked_bar': dualify(ghost_properties_horizontal_stackedbar, true),
            'viz/multi_100_dual_stacked_bar': dualify(ghost_properties_horizontal_stackedbar, true),
            'viz/stacked_column': ghost_properties_vertical_stackedbar,
            'viz/multi_stacked_column': ghost_properties_vertical_stackedbar,
            'viz/dual_stacked_column': dualify(ghost_properties_vertical_stackedbar, false),
            'viz/multi_dual_stacked_column': dualify(ghost_properties_vertical_stackedbar, false),
            'viz/100_stacked_column': ghost_properties_vertical_stackedbar,
            'viz/multi_100_stacked_column': ghost_properties_vertical_stackedbar,
            'viz/100_dual_stacked_column': dualify(ghost_properties_vertical_stackedbar, false),
            'viz/multi_100_dual_stacked_column': dualify(ghost_properties_vertical_stackedbar, false),
            'riv/cbar': ghost_properties_vertical_bar,

            'viz/3d_bar': ghost_properties_horizontal_3dbar,
            'viz/3d_column': ghost_properties_vertical_3dbar,

            'viz/combination': ghost_properties_vertical_combination,
            'viz/horizontal_combination': ghost_properties_horizontal_combination,
            'viz/dual_combination': dualify(ghost_properties_vertical_combination, false),
            'viz/dual_horizontal_combination': dualify(ghost_properties_horizontal_combination, true),

            'viz/boxplot': ghost_properties_vertical_boxplot,
            'viz/horizontal_boxplot': ghost_properties_horizontal_boxplot,

            'viz/waterfall': ghost_properties_vertical_waterfall,
            'viz/horizontal_waterfall': ghost_properties_horizontal_waterfall,

            'viz/stacked_waterfall': ghost_properties_vertical_waterfall,
            'viz/horizontal_stacked_waterfall': ghost_properties_horizontal_waterfall,

            'viz/line': ghost_properties_vertical_line,
            'viz/multi_line': ghost_properties_vertical_line,
            'viz/dual_line': dualify(ghost_properties_vertical_line, false),
            'viz/multi_dual_line': dualify(ghost_properties_vertical_line, false),
            'viz/horizontal_line': ghost_properties_horizontal_line,
            'viz/multi_horizontal_line': ghost_properties_horizontal_line,
            'viz/dual_horizontal_line': dualify(ghost_properties_horizontal_line, true),
            'viz/multi_dual_horizontal_line': dualify(ghost_properties_horizontal_line, true),

            'viz/area': ghost_properties_vertical_line,
            'viz/multi_area': ghost_properties_vertical_line,
            'viz/100_area': ghost_properties_vertical_line,
            'viz/multi_100_area': ghost_properties_vertical_line,
            'viz/horizontal_area': ghost_properties_horizontal_line,
            'viz/multi_horizontal_area': ghost_properties_horizontal_line,
            'viz/100_horizontal_area': ghost_properties_horizontal_line,
            'viz/multi_100_horizontal_area': ghost_properties_horizontal_line,

            'viz/pie': ghost_properties_pie,
            'viz/multi_pie': ghost_properties_pie,
            'viz/donut': ghost_properties_donut,
            'viz/multi_donut': ghost_properties_donut,

            'viz/pie_with_depth': ghost_properties_pie_with_depth,
            'viz/donut_with_depth': ghost_properties_donut_with_depth,

            'viz/bubble': ghost_properties_bubble,
            'viz/bullet': base,
            'viz/multi_bubble': ghost_properties_bubble,
            'viz/scatter': ghost_properties_scatter,
            'viz/multi_scatter': ghost_properties_scatter,
            'viz/scatter_matrix': ghost_properties_scattermatrix,

            'viz/radar': ghost_properties_radar,
            'viz/multi_radar': ghost_properties_radar,

            'viz/tagcloud': ghost_properties_tagcloud,

            'viz/heatmap': ghost_properties_heatmap,
            'viz/treemap': ghost_properties_treemap,
            'viz/mekko': ghost_properties_mekko,
            'viz/100_mekko': ghost_properties_mekko,
            'viz/horizontal_mekko': ghost_properties_horizontal_mekko,
            'viz/100_horizontal_mekko': ghost_properties_horizontal_mekko,

            'viz/network': ghost_properties_network,
            'viz/tree': ghost_properties_tree,
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
            'info/column': info(ghost_properties_vertical_bar),
            'info/bar': info(ghost_properties_horizontal_bar),
            'info/line': info(ghost_properties_vertical_line),
            'info/timeseries_line': infoTime(ghost_properties_vertical_line),
            'info/pie': infoPie(ghost_properties_pie),
            'info/donut': infoPie(ghost_properties_donut),
            'info/scatter': infoBubble(ghost_properties_scatter),
            'info/bubble': infoBubble(ghost_properties_bubble),
            'info/stacked_column': info(ghost_properties_vertical_stackedbar),
            'info/stacked_bar': info(ghost_properties_horizontal_stackedbar),
            'info/mekko': infoMekko(ghost_properties_vertical_stackedbar),
            'info/100_mekko': infoMekko(ghost_properties_vertical_stackedbar),
            'info/horizontal_mekko': infoMekko(ghost_properties_horizontal_stackedbar),
            'info/100_horizontal_mekko': infoMekko(ghost_properties_horizontal_stackedbar),
            'info/combination': info(ghost_properties_vertical_combination),
            'info/stacked_combination': info(ghost_properties_vertical_combination),
            'info/dual_stacked_combination': infoDual(ghost_properties_vertical_combination),
            'info/dual_column': infoDual(ghost_properties_vertical_bar),
            'info/dual_line': infoDual(ghost_properties_vertical_line),
            'info/dual_bar': infoDual(ghost_properties_horizontal_bar),
            'info/100_stacked_column': info(ghost_properties_vertical_stackedbar),
            'info/100_stacked_bar': info(ghost_properties_horizontal_stackedbar),
            'info/horizontal_line': info(ghost_properties_horizontal_line),
            'info/dual_horizontal_line': infoDual(ghost_properties_horizontal_line),
            'info/horizontal_combination': info(ghost_properties_horizontal_combination),
            'info/horizontal_stacked_combination': info(ghost_properties_horizontal_combination),
            'info/dual_horizontal_stacked_combination': infoDual(ghost_properties_horizontal_combination),
            'info/treemap': infoTreemap(ghost_properties_treemap),
            'info/area' : info(ghost_properties_vertical_area),
            'info/horizontal_area' : info(ghost_properties_horizontal_area),
            'info/100_area' : info(ghost_properties_vertical_area),
            'info/100_horizontal_area' : info(ghost_properties_horizontal_area),
            'info/tagcloud': infoTagcloud(ghost_properties_tagcloud),
            'info/heatmap': infoHeatmap(ghost_properties_info_heatmap),
            'info/dual_combination': infoDual(ghost_properties_vertical_combination),
            'info/dual_horizontal_combination': infoDual(ghost_properties_horizontal_combination),
            'info/number': infoNumber(ghost_properties_number),
            'info/waterfall':info(ghost_properties_vertical_bar),
            'info/stacked_waterfall' : info(ghost_properties_vertical_stackedbar),
            'info/horizontal_waterfall': info(ghost_properties_horizontal_bar),
            'info/horizontal_stacked_waterfall': info(ghost_properties_horizontal_stackedbar),
            'info/radar': infoRadar(ghost_properties_info_radar),

            'info/trellis_area' : trellis(ghost_properties_vertical_area),
            'info/trellis_horizontal_area' : trellis(ghost_properties_horizontal_area),
            'info/trellis_100_horizontal_area' : trellis(ghost_properties_horizontal_area),
            'info/trellis_100_area' : trellis(ghost_properties_vertical_area),
            'info/trellis_column': trellis(info(ghost_properties_vertical_bar)),
            'info/trellis_bar': trellis(info(ghost_properties_horizontal_bar)),
            'info/trellis_line': trellis(info(ghost_properties_vertical_line)),
            'info/trellis_pie': infoPie(ghost_properties_pie),
            'info/trellis_donut': infoPie(ghost_properties_donut),
            'info/trellis_scatter': trellis(infoBubble(ghost_properties_scatter)),
            'info/trellis_bubble': trellis(infoBubble(ghost_properties_bubble)),
            'info/trellis_stacked_column': trellis(info(ghost_properties_vertical_stackedbar)),
            'info/trellis_stacked_bar': trellis(info(ghost_properties_horizontal_stackedbar)),
            'info/trellis_combination': trellis(info(ghost_properties_vertical_combination)),
            'info/trellis_dual_column': trellis(infoDual(ghost_properties_vertical_bar)),
            'info/trellis_dual_line': trellis(infoDual(ghost_properties_vertical_line)),
            'info/trellis_dual_bar': trellis(infoDual(ghost_properties_horizontal_bar)),
            'info/trellis_100_stacked_column': trellis(info(ghost_properties_vertical_stackedbar)),
            'info/trellis_100_stacked_bar': trellis(info(ghost_properties_horizontal_stackedbar)),
            'info/trellis_horizontal_line': trellis(info(ghost_properties_horizontal_line)),
            'info/trellis_dual_horizontal_line': trellis(infoDual(ghost_properties_horizontal_line)),
            'info/trellis_horizontal_combination': trellis(info(ghost_properties_horizontal_combination)),
            'info/trellis_dual_stacked_bar': trellis(infoDual(ghost_properties_horizontal_stackedbar)),
            'info/trellis_dual_stacked_column': trellis(infoDual(ghost_properties_vertical_stackedbar)),
            'info/trellis_100_dual_stacked_column': trellis(infoDual(ghost_properties_horizontal_stackedbar)),
            'info/trellis_100_dual_stacked_bar': trellis(infoDual(ghost_properties_vertical_stackedbar)),
            'info/trellis_radar': trellis(infoRadar(ghost_properties_info_radar)),
            'info/dual_stacked_bar': infoDual(ghost_properties_horizontal_stackedbar),
            'info/100_dual_stacked_bar': infoDual(ghost_properties_horizontal_stackedbar),
            'info/dual_stacked_column': infoDual(ghost_properties_vertical_stackedbar),
            'info/100_dual_stacked_column': infoDual(ghost_properties_vertical_stackedbar),
            'info/time_bubble': infoBubble(ghost_properties_bubble),
            'info/timeseries_scatter': infoBubble(ghost_properties_bubble),
            'info/timeseries_bubble': infoBubble(ghost_properties_bubble),

            'info/bullet' : info(bulletEffect),
            'info/vertical_bullet' : info(bulletEffect),
            'info/trellis_bullet' : trellis(info(trellisBulletEffect)),
            'info/trellis_vertical_bullet' : trellis(info(trellisBulletEffect))
        },

        // css property not apply for info chart flag
        isBuiltIn : true,

        // properties
        css: ".v-m-title .v-title{fill:#000000;font-size:21px;font-weight:normal;}\
            .v-m-legend .v-label{fill:#737373;font-size:11px;font-weight:normal;}\
            .v-m-sizeLegend .v-title{fill:#000000;font-size:12px;font-weight:normal;}\
            .v-hovershadow{fill:#f5f5f5;}\
            .v-hovershadow-mousedown{fill:#dadada;}\
            .v-m-main .v-m-plot .v-title{fill:#000000;font-size:12px;font-weight:normal;}\
            .v-m-main .v-m-plot .v-label{fill:#737373;font-size:11px;font-weight:normal;}\
            .v-m-yAxis .v-title{fill:#000000;font-size:12px;font-weight:normal;}\
            .v-m-yAxis .v-label{fill:#737373;font-size:11px;font-weight:normal;}\
            .v-m-xAxis .v-title{fill:#000000;font-size:12px;font-weight:normal;}\
            .v-m-xAxis .v-label{fill:#737373;font-size:11px;font-weight:normal;}\
            .v-m-yAxis2 .v-title{fill:#000000;font-size:12px;font-weight:normal;}\
            .v-m-yAxis2 .v-label{fill:#737373;font-size:11px;font-weight:normal;}\
            .v-m-xAxis2 .v-title{fill:#000000;font-size:12px;font-weight:normal;}\
            .v-m-xAxis2 .v-label{fill:#737373;font-size:11px;font-weight:normal;}",
        scales : function() {
            var obj = {};
            var singleChartTypes = [ 'info/column', 'info/bar', 'info/line', 'info/pie', 'info/donut',
                'info/scatter', 'info/bubble', 'info/stacked_column', 'info/stacked_bar', 'info/combination',
                'info/stacked_combination', 'info/100_stacked_column', 'info/100_stacked_bar',
                'info/mekko', 'info/100_mekko', 'info/horizontal_mekko', 'info/100_horizontal_mekko',
                'info/horizontal_line',  'info/horizontal_combination', 'info/horizontal_stacked_combination',
                'info/trellis_column', 'info/trellis_bar', 'info/trellis_line',
                'info/trellis_pie', 'info/trellis_donut', 'info/trellis_scatter', 'info/trellis_bubble',
                'info/trellis_stacked_column', 'info/trellis_stacked_bar', 'info/trellis_combination',
                'info/trellis_100_stacked_column', 'info/trellis_100_stacked_bar', 'info/trellis_horizontal_line',
                'info/trellis_horizontal_combination', 'info/time_bubble'];
            singleChartTypes.forEach(function(e) {
                obj[e] = [{
                    "feed": "color",
                    "palette": plotArea.plotArea.colorPalette
                }];
            });
            var dualChartTypes = ['info/dual_stacked_combination', 'info/dual_column', 'info/dual_line',
                'info/dual_bar', 'info/dual_horizontal_line', 'info/dual_horizontal_stacked_combination',
                'info/trellis_dual_column', 'info/trellis_dual_line', 'info/trellis_dual_bar',
                'info/trellis_dual_stacked_bar', 'info/trellis_dual_stacked_column',
                'info/trellis_dual_horizontal_line', 'info/dual_stacked_bar', 'info/100_dual_stacked_bar',
                'info/dual_stacked_column', 'info/100_dual_stacked_column'];
            dualChartTypes.forEach(function(e) {
                obj[e] = [{
                    "feed": "color",
                    "palette": [plotArea.plotArea.primaryValuesColorPalette, plotArea.plotArea.secondaryValuesColorPalette]
                }];
            });

            var mbcChartTypes = ['info/treemap', 'info/heatmap', 'info/tagcloud'];

            mbcChartTypes.forEach(function(e) {
                obj[e] = [{
                    "feed": "color",
                    "palette": mbcColor.plotArea.colorPalette
                }];
            });
            return obj;
        }()
    });

    function infoTrellisBullet(obj){
        var ret = info(obj);
        ret.plotArea.gridline = {visible:false};
    }

    function info(obj) {
        var ret = {};
        for (var i in obj) {
            if (obj.hasOwnProperty(i)) {
                ret[i] = obj[i];
            }
        }

        ret.interaction = {
            selectability: {
                mode: "none",
                axisLabelSelection: false,
                legendSelection: false,
                plotLassoSelection: false,
                plotStdSelection: false
            }
        };

        ret.valueAxis = {
            title: {
                visible: true,
                style: {
                    fontWeight : "normal",
                    fontSize: "12px",
                    color: "#000000"
                }
            },
            color: valueAxisColor,
            label: {
                visible: true,
                style: {
                    fontSize: "10px",
                    color: "#737373"
                }
            },
            axisLine: {
                visible: false
            }
        };

        ret.categoryAxis = {
            title: {
                visible: true,
                style: {
                    fontWeight : "normal",
                    fontSize: "12px",
                    color: "#000000"
                }
            },
            color: categoryAxisColor,
            label: {
                visible: true,
                style: {
                    fontSize: "11px",
                    color: "#737373"
                }
            },
            axisTick:{
                visible: false
            },
            axisLine: {
                visible: true
            }
        };

        ret = merge(ret, layoutRatio, padding, gridLineStyle, referenceLineStyle);

        general(ret);
        return ret;
    }

    function infoRadar(obj) {
        var ret = {};
        for (var i in obj) {
            if (obj.hasOwnProperty(i)) {
                ret[i] = obj[i];
            }
        }

        ret.interaction = {
            selectability: {
                mode: "none",
                axisLabelSelection: false,
                legendSelection: false,
                plotLassoSelection: false,
                plotStdSelection: false
            }
        };

        ret.plotArea.valueAxis = {
            title: {
                visible: true,
                style: {
                    fontWeight : "normal",
                    fontSize: "12px",
                    color: "#000000"
                }
            },
            color: valueAxisColor,
            label: {
                visible: true,
                style: {
                    fontSize: "10px",
                    color: "#737373"
                }
            }
        };

        ret.plotArea.polarAxis = {
            title: {
                visible: true,
                style: {
                    fontWeight : "normal",
                    fontSize: "12px",
                    color: "#000000"
                }
            },
            color: categoryAxisColor,
            label: {
                visible: true,
                style: {
                    fontSize: "11px",
                    color: "#737373"
                }
            },
            axisLine: {
                visible: true
            }
        };

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
        var ret = info(obj);

        ret.valueAxis2 = {
            title: {
                visible: true,
                style: {
                    fontWeight : "normal",
                    fontSize: "12px",
                    color: "#000000"
                }
            },
            color: valueAxisColor,
            label: {
                visible: true,
                style: {
                    fontSize: "10px",
                    color: "#737373"
                }
            },
            axisLine: {
                visible: false
            }
        };

        ret = merge(ret,  {
            valueAxis: {
                layout: {
                    maxHeight: 0.1,
                    maxWidth: 0.1
                }
            },
            valueAxis2: {
                layout: {
                    maxHeight: 0.1,
                    maxWidth: 0.1
                }
            }
        });
        general(ret);
        return ret;
    }

    function infoMekko(obj) {
        return merge(infoDual(obj), {
            valueAxis: {
                title: {
                    applyAxislineColor: true
                },
                color: "#000000"
            },
            valueAxis2: {
                title: {
                    applyAxislineColor: true
                },
                color: "#000000"
            }
        });
    }

    function infoBubble(obj) {
        var ret = info(obj);

        delete ret.categoryAxis;

        ret.valueAxis2 = {
            title: {
                visible: true,
                style: {
                    fontWeight : "normal",
                    fontSize: "12px",
                    color: "#000000"
                }
            },
            color: valueAxisColor,
            label: {
                visible: true,
                style: {
                    fontSize: "10px",
                    color: "#737373"
                }
            },
            axisLine: {
                visible: false
            }
        };

        general(ret);
        return ret;
    }

    function infoPie(obj) {
        var ret = {};
        for (var i in obj) {
            if (obj.hasOwnProperty(i)) {
                ret[i] = obj[i];
            }
        }

        ret.interaction = {
            selectability: {
                mode: "none",
                axisLabelSelection: false,
                legendSelection: false,
                plotLassoSelection: false,
                plotStdSelection: false
            }
        };

        ret = merge(ret, layoutRatio, padding, gridLineStyle, referenceLineStyle);
        general(ret);
        return ret;
    }

    function general(obj) {
        obj.plotArea = obj.plotArea || {};
        obj.plotArea.background = obj.background || background;

        delete obj.background;

        delete obj.xAxis;
        delete obj.xAxis2;
        delete obj.yAxis;
        delete obj.yAxis2;

        if(obj.categoryAxis) {
            if(!obj.categoryAxis.label) {
                obj.categoryAxis.label = {};
            }
            obj.categoryAxis.label.angle = 45;
        }

        obj.title = merge(obj.title, {
            alignment  : "left",
            style : {
                fontWeight : "normal",
                fontSize: "21px",
                color: "#000000"
            }
        });
    }

    function infoTreemap(obj) {
        obj = merge(background, obj);
        obj.plotArea.labelPosition = 'topleft';
        return info(obj);
    }

    function infoTagcloud(obj) {
        obj = merge(background, obj);        
        return info(obj);
    }

    function trellis(obj) {
        obj.plotArea = obj.plotArea || {};
        obj.plotArea.gridline = obj.plotArea.gridline || {};
        obj.plotArea.gridline.visible = false;
        return obj;
    }


    function infoHeatmap(obj) {
        var ret = {};
        for (var i in obj) {
            if (obj.hasOwnProperty(i)) {
                ret[i] = obj[i];
            }
        }

        ret.interaction = {
            selectability: {
                mode: "none",
                axisLabelSelection: false,
                legendSelection: false,
                plotLassoSelection: false,
                plotStdSelection: false
            }
        };

        ret.categoryAxis = {
            title: {
                visible: true,
                style: {
                    fontWeight : "normal",
                    fontSize: "12px",
                    color: "#000000"
                }
            },
            color: categoryAxisColor,
            label: {
                visible: true,
                style: {
                    fontSize: "11px",
                    color: "#737373"
                }
            },
            axisTick:{
                visible: false
            },
            axisLine: {
                visible: true
            }
        };

        ret.categoryAxis2 = {
            title: {
                visible: true,
                style: {
                    fontWeight : "normal",
                    fontSize: "12px",
                    color: "#000000"
                }
            },
            color: categoryAxisColor,
            label: {
                visible: true,
                style: {
                    fontSize: "11px",
                    color: "#737373"
                }
            },
            axisTick:{
                visible: false
            },
            axisLine: {
                visible: true
            }
        };

        ret = merge(ret, layoutRatio, padding, gridLineStyle, referenceLineStyle);

        general(ret);
        return ret;
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
})();
