(function() {
    var toString = Object.prototype.toString;
    var squareLegendMarkerShape = {
        legend : {
            marker: {
                shape : "square"
            }
        }
    };


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

    var areaWithFixedDataPointSize = {
        plotArea:{
            isFixedDataPointSize: true
        }
    };

    var lineWithFixedDataPointSize = {
        plotArea:{
            isFixedDataPointSize: true,
        }
    };


    var gridLineStyle = {
        plotArea:{
            gridline:{
                visible: true,
                size: 1,
                color: "#333333"
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

    var legendGroupByShape = {
        legend : {
            groupByShape : true
        }
    };

    var palettes = {
        single: {
            plotArea: {
                colorPalette: ["#73d2e0", "#bbd03b", "#999d20", "#f2910f", "#fccd8c", "#a5d5cb", "#00adc6", "#919795", "#ed6b06"]
            }
        },
        dual: {
            plotArea: {
                primaryValuesColorPalette: ["#00abaa", "#8ccdcd", "#d4ebeb"],
                secondaryValuesColorPalette: ["#ee6a05", "#f6aa6e", "#fcddc3"]
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

    var padding = {
        general:{
            layout:{
                padding:0.05
            }
        }
    };

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

    var axisColor = "#aaaaaa";
    var axisGridlineColor = "#333333";

    var rangeSlider = {
        rangeSlider: {
            sliderStyle: {
                borderColor: "#4e4e4e",
                highlightBorderColor: "#ffffff"
            },
            tooltipStyle: {
                fontColor: "#ffffff",
                borderColor: "#4e4e4e",
                highlightBorderColor: "#009de0",
                backgroundColor: "#333333"
            },
            thumbStyle: {
                indicatorStartColor: "#555555",
                indicatorEndColor: "#0c0c0c",
                indicatorPressStartColor: "#555555",
                indicatorPressEndColor: "#0c0c0c",
                indicatorBorderStartColor: "#ffffff",
                indicatorBorderEndColor: "#ffffff",
                indicatorPressBorderStartColor: "#8b8b8b",
                indicatorPressBorderEndColor: "#8b8b8b",
                indicatorInternalLineColor: "#ffffff",
                subRectBorderColor: "#ffffff",
                subRectColor: "#ffffff",
                rectOpacity: 0.3,
                rectColor: '#009de0',
                rectPressOpacity: 0.3,
                rectPressColor: "#ffffff"
            }
        }
    };

    var title = {
        title: {
            alignment: "left",
            style: {
                color: '#D8D8D8'
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


    var background = {
        background: {
            color: "#1B1B1B",
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
        }
    };

    var scrollbar = {
        thumb: {
            fill: "#a6a6a6",
            hoverFill: "#888888"
        },
        track: {
            fill: '#333333'
        }
    };

    var legend = {

        legend: {
            itemMargin: 0.25,
            drawingEffect: "normal",
            marker: {
                size: 14
            },
            title: {
                visible: false,
                style: {
                    fontSize: "12px",
                    color: "#ffffff",
                    fontWeight: "normal"
                }
            },
            label: {
                style:  {
                    color: "#D8D8D8",
                    fontSize: "10px",
                }
            },
            hoverShadow: {
                color: "#2b2b2b"
            },
            mouseDownShadow: {
                color: "#383838"
            },
            scrollbar: scrollbar
        },
        sizeLegend: {
            drawingEffect: "normal",
            title: {
                visible: true,
                style: {
                    fontSize: "12px",
                    color: "#ffffff",
                    fontWeight: "normal"
                }
            },
            label: {
                style: {
                    color: "#D8D8D8",
                    fontSize: "10px",
                }
            }
        }
    };

    var tooltip = {
        tooltip: {
            background: {
                color: "#000000",
                borderColor: "#ffffff"
            },
            footerLabel: {
                color: "#ffffff"
            },
            separationLine: {
                // borderBottomColor: "#ffffff"
                color: "#ffffff"
            },
            bodyDimensionLabel: {
                color: "#c0c0c0"
            },
            bodyDimensionValue: {
                color: "#c0c0c0"
            },
            bodyMeasureLabel: {
                color: "#c0c0c0"
            },
            bodyMeasureValue: {
                color: "#ffffff"
            },
            closeButton: {
                backgroundColor: "#000000",
                borderColor: "#ffffff"
            }
        }
    };

    var plotArea = {
        plotArea: {
            defaultOthersStyle: {
                color: "#ffffff"
            },
            drawingEffect: "normal",
            referenceLine: {
                defaultStyle: {
                    color: "#ffffff",
                    label: {
                        background: "#1B1B1B",
                        color: "#ffffff"
                    }
                }
            }
        }
    };

    var dataLabel = {
        plotArea: {
            dataLabel: {
                style: {
                    color: "#D8D8D8"
                }
            }
        }
    };

    var zAxis = {
        zAxis: {
            title: {
                visible: true,
                style: {
                    color: "#ffffff"
                }
            },

            label: {
                style: {
                    color: "#d8d8d8"
                }
            },
            color: "#6b6b6b"
        }
    };


    // Axis----------------------------
    var axis = {
        title: {
            visible: true,
            style: {
                fontWeight : "normal",
                fontSize:"12px",
               color: "#ffffff"
            }
        },
        gridline: {
            size: 1,
            color: axisGridlineColor
        },
        hoverShadow: {
            color: "#2b2b2b"
        },
        mouseDownShadow: {
            color: "#383838"
        },
        lineSize: 1
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

    var gridline_base = {
        gridline: {
            type: "line",
            color: axisGridlineColor,
            showLastLine: true
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

    var dual = {
        title: {
            applyAxislineColor: true
        }
    };

    var interaction = {
            interaction : {
                hover : {
                    color : 'lighten(15%)',
                    stroke : {
                        visible : false
                    }
                },
                selected : {
                    stroke : {
                        visible : false
                    }
                },
                deselected : {
                    color: 'greyscale()',
                    stroke : {
                        visible : false
                    }
                }
            }
    };

    var valueAxisColor = "#a8a8a8",
        categoryAxisColor = "#6b6b6b";

    var valueAxis = merge(axis, {
        color: valueAxisColor
    }, hideAxisLine, vizSpec.layout.valueAxis);

    var categoryAxis = merge(axis, {
        color: categoryAxisColor
    }, showAxisLine, vizSpec.layout.categoryAxis);

    var zoom = {
        interaction: {
            zoom: {
                direction: "categoryAxis"
            }
        }
    };

    var base = merge(title, background, legend, tooltip, zoom);

    var horizontalEffect = merge({
        xAxis: merge(valueAxis, gridline_h),
        yAxis: categoryAxis,
        xAxis2: valueAxis
    }, palettes.single);

    var horizontalDualEffect = merge(horizontalEffect, {
        xAxis: merge(dual, vizSpec.layout.dualValue),
        xAxis2: merge(dual, vizSpec.layout.dualValue)
    }, palettes.dual);

    var verticalEffect = merge({
        yAxis: merge(valueAxis, gridline_v),
        xAxis: categoryAxis,
        yAxis2: valueAxis
    }, palettes.single);

    var verticalDualEffect = merge(verticalEffect, {
        yAxis: merge(dual, vizSpec.layout.dualValue),
        yAxis2: merge(dual, vizSpec.layout.dualValue)
    }, palettes.dual);
    
    var linkLineEffect = {
        plotArea: {
            linkline: {
                color: "#a8a8a8"
            }
        }
    };
    
    var datapointColorEffect = {
        plotArea : {
            dataPoint : {
                color : {
                    positive : "#77d36f",
                    negative : "#f24269",
                    total : "#bbbdbf"
                }
            }
        }
    };

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

    //------------------------------------------------
    var barEffect = merge(base, plotArea, dataLabel, horizontalEffect, squareLegendMarkerShape, barWithFixedDataPointSize, interaction);

    var bar3dEffect = merge(base, plotArea, zAxis, horizontalEffect, interaction);

    var dualbarEffect = dualify(merge(base, plotArea, dataLabel, horizontalDualEffect, squareLegendMarkerShape, barWithFixedDataPointSize, interaction), true);

    var verticalbarEffect = merge(base, plotArea, dataLabel, rangeSlider, verticalEffect, squareLegendMarkerShape, barWithFixedDataPointSize, interaction);

    var vertical3dbarEffect = merge(base, plotArea, zAxis, verticalEffect, interaction);

    var dualverticalbarEffect = dualify(merge(base, plotArea, dataLabel, verticalDualEffect, squareLegendMarkerShape, barWithFixedDataPointSize, interaction), false);

    var stackedbarEffect = merge(base, plotArea, horizontalEffect, squareLegendMarkerShape, barWithFixedDataPointSize, interaction);

    var dualstackedbarEffect = dualify(merge(base, plotArea, horizontalDualEffect, squareLegendMarkerShape, barWithFixedDataPointSize, interaction), true);

    var stackedverticalbarEffect = merge(base, plotArea, {
        yAxis: merge(axis, hideAxisLine, dual, gridline_v),
        xAxis: axis,
        yAxis2: merge(axis, hideAxisLine)
    }, squareLegendMarkerShape, barWithFixedDataPointSize, interaction);

    var dualstackedverticalbarEffect = dualify(merge(base, plotArea, verticalDualEffect, squareLegendMarkerShape, barWithFixedDataPointSize, interaction), false);

    var lineEffect = merge(base, plotArea, dataLabel, rangeSlider, verticalEffect, lineWithFixedDataPointSize, interaction);

    var duallineEffect = dualify(merge(base, plotArea, dataLabel, verticalDualEffect, lineWithFixedDataPointSize, interaction), false);

    var horizontallineEffect = merge(base, plotArea, dataLabel, horizontalEffect, lineWithFixedDataPointSize, interaction);

    var dualhorizontallineEffect = dualify(merge(base, plotArea, dataLabel, horizontalDualEffect, lineWithFixedDataPointSize), true);

    var areaEffect = merge(base, plotArea, dataLabel, rangeSlider, verticalEffect, areaWithFixedDataPointSize, interaction);

    var horizontalareaEffect = merge(base, plotArea, dataLabel, rangeSlider, horizontalEffect, areaWithFixedDataPointSize, interaction);

    var combinationEffect = merge(base, plotArea, dataLabel, rangeSlider, verticalEffect, squareLegendMarkerShape, barWithFixedDataPointSize, legendGroupByShape, palettes.single, interaction);

    var dualcombinationEffect = dualify(merge(base, plotArea, dataLabel, verticalDualEffect, squareLegendMarkerShape, barWithFixedDataPointSize, palettes.dual, interaction), false);

    var horizontalcombinationEffect = merge(base, plotArea, dataLabel, horizontalEffect, squareLegendMarkerShape, barWithFixedDataPointSize, legendGroupByShape, palettes.single, interaction);

    var dualhorizontalcombinationEffect = dualify(merge(base, plotArea, dataLabel, horizontalDualEffect, squareLegendMarkerShape, barWithFixedDataPointSize, palettes.dual, interaction), true);

    var bubbleEffect = merge(base, plotArea, dataLabel, {
        yAxis: merge(valueAxis, gridline_h),
        xAxis: categoryAxis
    }, palettes.single, interaction);

    var pieEffect = merge(title, legend, plotArea, dataLabel, squareLegendMarkerShape, tooltip, palettes.single, interaction);

    var radarEffect = merge(title, legend, tooltip, plotArea, {
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
            },
            dataline: {
                fill: {
                    transparency: 0
                }
            },
            polarGrid: {
                color: axisGridlineColor
            }
        }
    }, palettes.single);

    var infoRadarEffect = merge(base, plotArea, dataLabel, rangeSlider, interaction, {
        interaction: {
            hover : {
                color : 'lighten(20%)',
            },
            deselected : {
                area: {
                    color: 'greyscale()'
                }
            }
        },
        plotArea: {
            valueAxis: {
                label: {
                    style: {
                        color: "#d8d8d8",
                        fontSize: "10px"
                    }
                },
                color: "#a8a8a8"
            },
            polarAxis: {
                hoverShadow: {
                    color: "#2b2b2b"
                },
                mouseDownShadow: {
                    color: "#383838"
                },
                label: {
                    style: {
                        color: "#d8d8d8",
                        fontSize: "11px"
                    }
                },
                color: "#666666"
            },
            gridline: {
                color: "#4d4d4d"
            },
            dataLabel: {
                style: {
                    color: 'lighten(20%)'
                }
            }
        }
    }, palettes.single);

    var mekkoEffect = merge(base, plotArea, {
        yAxis: merge(valueAxis, gridline_base),
        xAxis: categoryAxis,
        xAxis2: categoryAxis
    }, palettes.single);
    var horizontalmekkoEffect = merge(base, plotArea, {
        xAxis: merge(valueAxis, gridline_base),
        yAxis: categoryAxis,
        yAxis2: categoryAxis
    }, palettes.single);

    var bulletEffect = merge(title, legend, background, tooltip, plotArea, {
        plotArea: {
            target:{
               valueColor: "#FFFFFF",
               shadowColor: "#333333"
            },
            gridline:{
                visible:true
            }
        },
        categoryAxis:{
            axisTick:{
                visible:false
            },
            hoverShadow:{
                color : "#2b2b2b"
            },
            mouseDownShadow:{
                color : "#383838"
            }
        },
        title:{
            visible:true,
            alignment  : "left",
            style : {
                fontWeight : "normal",
                fontSize: "21px",
                color: "#ffffff"
            }
        },
        categoryAxis2: {
            label: {
                style: {
                    color: "#FFFFFF"
                }
            }
        }
    }, palettes.single, zoom);

    var trellisBulletEffect = merge(bulletEffect, {plotArea:{gridline:{visible: false}}});

    var mbcColor = {
        plotArea: {
            colorPalette: ["#bfebf1","#80d6e2","#19b5cc","#198c9d","#0e6977"]
        }
    };

    var mapEffect = merge(base, tooltip, {
        legend: {
            title: {
                visible: true
            }
        },
        xAxis: categoryAxis, // these are for heat map, tree map doesn't have axes
        yAxis: categoryAxis
    }, mbcColor, interaction);

    var tagcloudEffect = merge(title, legend, {legend:{
        title:{visible:true}
        }}, tooltip, mbcColor);

    var numericEffect = merge(background, title, tooltip, interaction, {
        plotArea: {
            valuePoint: {
                label: {
                    fontColor: '#ffffff'
                }
            }
        }
    });

    var infoMapEffect = merge(base, legend, tooltip, {
        legend: {
            title: {
                visible: true
            }
        },
        categoryAxis: categoryAxis, // these are for heat map, tree map doesn't have axes
        categoryAxis2: categoryAxis
    }, mbcColor, interaction);
    
    var waterfallEffect = merge(verticalbarEffect, linkLineEffect, datapointColorEffect);
    
    var stackedwaterfallEffect = merge(stackedverticalbarEffect, linkLineEffect, datapointColorEffect);
    
    var horizontalwaterfallEffect = merge(barEffect, linkLineEffect, datapointColorEffect);
    
    var horizontalstackedwaterfallEffect = merge(stackedbarEffect, linkLineEffect, datapointColorEffect);


    sap.viz.extapi.env.Template.register({
        id: "highcontrast_lumira",
        name: "HighContrast Lumira",
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
            'riv/cbar': merge(legend, tooltip, plotArea, {
                background: {
                    drawingEffect: "normal"
                },
                yAxis: axis
            }),
            'viz/combination': combinationEffect,
            'viz/horizontal_combination': horizontalcombinationEffect,
            'viz/dual_combination': dualcombinationEffect,
            'viz/dual_horizontal_combination': dualhorizontalcombinationEffect,
            'viz/boxplot': merge(base, plotArea, {
                yAxis: merge(valueAxis, gridline_v),
                xAxis: categoryAxis
            }, palettes.single),
            'viz/horizontal_boxplot': merge(base, plotArea, {
                xAxis: merge(valueAxis, gridline_h),
                yAxis: categoryAxis
            }, palettes.single),
            'viz/waterfall': merge(base, plotArea, {
                yAxis: merge(valueAxis, gridline_v),
                xAxis: categoryAxis
            }, palettes.single),
            'viz/horizontal_waterfall': merge(base, plotArea, {
                xAxis: merge(valueAxis, gridline_h),
                yAxis: categoryAxis
            }, palettes.single),

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
            'viz/pie_with_depth': pieEffect,
            'viz/donut_with_depth': pieEffect,
            'viz/multi_pie_with_depth': pieEffect,
            'viz/multi_donut_with_depth': pieEffect,
            'viz/bubble': bubbleEffect,
            'viz/multi_bubble': bubbleEffect,
            'viz/scatter': bubbleEffect,
            'viz/multi_scatter': bubbleEffect,
            'viz/scatter_matrix': bubbleEffect,
            'viz/radar': radarEffect,
            'viz/multi_radar': radarEffect,
            'viz/tagcloud': tagcloudEffect,
            'viz/heatmap': mapEffect,
            'viz/treemap': mapEffect,
            'viz/mekko': mekkoEffect,
            'viz/100_mekko': mekkoEffect,
            'viz/horizontal_mekko': horizontalmekkoEffect,
            'viz/100_horizontal_mekko': horizontalmekkoEffect,
            'viz/bullet': bulletEffect,
            'viz/number': merge(tooltip, {
                plotArea: {
                    valuePoint: {
                        label: {
                            fontColor: '#D8D8D8'
                        }
                    }
                }
            }),


            'info/column': info(verticalbarEffect),
            'info/bar': info(barEffect),
            'info/line': info(lineEffect),
            'info/timeseries_line': infoTime(lineEffect),
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
            'info/dual_bar': infoDual(dualbarEffect),
            'info/dual_line': infoDual(duallineEffect),
            'info/100_stacked_column': info(stackedverticalbarEffect),
            'info/100_stacked_bar': info(stackedbarEffect),
            'info/horizontal_line': info(horizontallineEffect),
            'info/dual_horizontal_line': infoDual(dualhorizontallineEffect),
            'info/horizontal_combination': info(horizontalcombinationEffect),
            'info/horizontal_stacked_combination': info(horizontalcombinationEffect),
            'info/dual_horizontal_stacked_combination': infoDual(dualhorizontalcombinationEffect),
            'info/dual_combination': infoDual(dualcombinationEffect),
            'info/dual_horizontal_combination': infoDual(dualhorizontalcombinationEffect),
            'info/treemap': infoTreemap(mapEffect),
            'info/area' : info(areaEffect),
            'info/horizontal_area' : info(horizontalareaEffect),
            'info/100_area' : info(areaEffect),
            'info/100_horizontal_area' : info(horizontalareaEffect),
            'info/tagcloud': infoTagcloud(tagcloudEffect),
            'info/heatmap': infoHeatmap(infoMapEffect),
            'info/number': infoNumber(numericEffect),
            'info/waterfall':info(waterfallEffect),
            'info/stacked_waterfall' : info(stackedwaterfallEffect),
            'info/horizontal_waterfall': info(horizontalwaterfallEffect),
            'info/horizontal_stacked_waterfall': info(horizontalstackedwaterfallEffect),
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
            'info/trellis_dual_stacked_column': trellis(infoDual(stackedverticalbarEffect)),
            'info/trellis_dual_stacked_bar': trellis(infoDual(stackedbarEffect)),
            'info/trellis_100_dual_stacked_column':trellis(infoDual(stackedverticalbarEffect)),
            'info/trellis_100_dual_stacked_bar':  trellis(infoDual(stackedbarEffect)),
            'info/trellis_combination': trellis(info(combinationEffect)),
            'info/trellis_dual_column': trellis(infoDual(dualverticalbarEffect)),
            'info/trellis_dual_bar': trellis(infoDual(dualbarEffect)),
            'info/trellis_dual_line': trellis(infoDual(duallineEffect)),
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
            'info/timeseries_bubble': infoTimeBubble(bubbleEffect),
            'info/bullet': info(bulletEffect),
            'info/vertical_bullet': info(bulletEffect),
            'info/trellis_bullet': trellis(info(trellisBulletEffect)),
            'info/trellis_vertical_bullet': trellis(info(trellisBulletEffect))

        },

        // css property not apply for info chart flag
        isBuiltIn : true,

        //v-hidden-title must be set after v-title
        //v-longtick must be set after v-categoryaxisline
        css: ".v-m-title .v-title{fill:#ffffff;font-size:21px;font-weight:normal;}\
          .v-subtitle{fill:#D8D8D8;}\
          .v-longtick{stroke:#5e5e5e;}\
          .v-label{fill:#D8D8D8;}\
          .v-background-body{fill:#1B1B1B;}\
          .v-pie .v-donut-title{fill:#D8D8D8;}\
          .v-polar-axis-label{fill:#D8D8D8;}\
          .v-datalabel{fill:#D8D8D8;}\
          .v-title{fill:#D8D8D8;}\
          .v-hidden-title{fill:#737373;}\
          .v-hoverline{stroke:#606060;}\
          .v-m-tooltip .v-background{background-color:#000000; border-color:#ffffff; fill:#1B1B1B;stroke:#FFFFFF;}\
          .v-m-tooltip .v-footer-label{color:#ffffff; fill:#D8D8D8;}\
          .v-m-tooltip .v-body-dimension-label{color:#c0c0c0;}\
          .v-m-tooltip .v-body-dimension-value{color:#c0c0c0;}\
          .v-m-tooltip .v-body-measure-label{color:#c0c0c0;}\
          .v-m-tooltip .v-body-measure-value{color:#ffffff;}\
          .v-m-tooltip .v-separationline{border-bottom-color:#ffffff;}\
          .v-m-tooltip .v-closeButton{background-color:#000000;border-color:#ffffff;}\
          .v-datapoint-default{stroke:#000000}\
          .v-datapoint-hover{stroke:#999999}\
          .v-datapoint-selected{stroke:#999999}\
          .v-datapoint .v-boxplotmidline{stroke:#ffffff}\
          .v-scrollbarThumb{fill:#c0c0c0}\
          .v-m-legend .v-label{fill:#d8d8d8;font-size:10px;font-weight:normal;}\
          .v-m-sizeLegend .v-label{fill:#d8d8d8;font-size:10px;font-weight:normal;}\
          .v-m-main .v-m-plot .v-title{fill:#ffffff;font-size:12px;font-weight:normal;}\
          .v-m-main .v-m-plot .v-label{fill:#d8d8d8;font-size:11px;font-weight:normal;}\
          .v-m-yAxis .v-title{fill:#ffffff;font-size:12px;font-weight:normal;}\
          .v-m-yAxis .v-label{fill:#d8d8d8;font-size:11px;font-weight:normal;}\
          .v-m-xAxis .v-label{fill:#d8d8d8;font-size:11px;font-weight:normal;}\
          .v-m-xAxis .v-title{fill:#ffffff;font-size:12px;font-weight:normal;}\
          .v-m-yAxis2 .v-title{fill:#ffffff;font-size:12px;font-weight:normal;}\
          .v-m-yAxis2 .v-label{fill:#d8d8d8;font-size:11px;font-weight:normal;}\
          .v-m-xAxis2 .v-title{fill:#ffffff;font-size:12px;font-weight:normal;}\
          .v-m-xAxis2 .v-label{fill:#d8d8d8;font-size:11px;font-weight:normal;}\
          .v-m-legend .v-title{fill:#ffffff;font-size:12px;font-weight:normal;}\
          .v-m-sizeLegend .v-title{fill:#ffffff;font-size:12px;font-weight:normal;}\
          .v-hovershadow{fill:#2b2b2b;}\
          .v-hovershadow-mousedown{fill:#383838;}",
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
                    "palette": palettes.single.plotArea.colorPalette
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
                    "palette": [palettes.dual.plotArea.primaryValuesColorPalette, palettes.dual.plotArea.secondaryValuesColorPalette]
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


    function trellis(obj){
        obj.rowAxis = {
            color: axisColor,
            title: {
                style: {
                    fontSize: 12,
                    color: "#ffffff"
                }
            },
            label: {
                style: {
                    color: axisColor
                }
            },
            hoverShadow: {
                color: "#2b2b2b"
            },
            mouseDownShadow: {
                color: "#383838"
            }
        };

        obj.columnAxis = {
            color: axisColor,
            title: {
                style: {
                    fontSize: 12,
                    color: "#ffffff"
                }
            },
            label: {
                style: {
                    color: axisColor
                }
            },
            hoverShadow: {
                color: "#2b2b2b"
            },
            mouseDownShadow: {
                color: "#383838"
            }
        };

        obj.plotArea = obj.plotArea || {};
        obj.plotArea.gridline = merge(obj.plotArea.gridline || {}, {
            zeroLine: {
                color: "#303030"
            }
        });
        obj.plotArea.grid = {
            line: {
                color: axisGridlineColor
            }
        };
        obj = merge(obj, gridLineStyle);
        obj.plotArea.gridline.visible = false;
        return obj;
    }

    function info(obj) {
        var ret = {};
        for (var i in obj) {
            if (obj.hasOwnProperty(i)) {
                ret[i] = obj[i];
            }
        }

        ret.valueAxis = merge(axis, hideInfoAxisLine, gridline_base, {
            label: {
                style: {
                    color: "#d8d8d8",
                    fontSize: "10px"
                }
            },
            color: "#a8a8a8"
        });

        ret.categoryAxis = merge(axis, {
            hoverShadow: {
                color: "#2b2b2b"
            },
            mouseDownShadow: {
                color: "#383838"
            },
            axisTick:{
                visible: false
            },
            label: {
                style: {
                    color: "#d8d8d8",
                    fontSize: "11px"
                }
            },
            color: "#6b6b6b"
        });

        ret.plotArea.scrollbar = scrollbar;
        ret.plotArea.gridline = merge(ret.plotArea.gridline || {}, {
            zeroLine: {
                unhighlightAxis: true
            }
        });

        ret = merge(ret, layoutRatio, padding, palettes.single, gridLineStyle, referenceLineStyle);

        general(ret);
        return ret;
    }

    function infoTime(obj){
        var ret = info(obj);
        ret.timeAxis = ret.categoryAxis;
        delete ret.categoryAxis;

        ret = merge(ret, {
            timeAxis : {
                interval : {
                    unit : 'minlevel'
                }
            }
        });

        return ret;
    }

    function infoDual(obj) {
        var ret = {};
        for (var i in obj) {
            if (obj.hasOwnProperty(i)) {
                ret[i] = obj[i];
            }
        }
        ret.valueAxis = merge(axis, hideInfoAxisLine, gridline_base, dual, {
            label: {
                style: {
                    color: "#d8d8d8",
                    fontSize: "10px"
                }
            },
            color: "#a8a8a8"
        });
        delete ret.valueAxis.color;

        ret.categoryAxis = merge(axis, {
            hoverShadow: {
                color: "#2b2b2b"
            },
            mouseDownShadow: {
                color: "#383838"
            },
            axisTick:{
                visible: false
            },
            label: {
                style: {
                    color: "#d8d8d8",
                    fontSize: "11px"
                }
            },
            color: "#6b6b6b"
        });

        ret.valueAxis2 = merge(axis, hideInfoAxisLine, dual,{
            label: {
                style: {
                    color: "#d8d8d8",
                    fontSize: "10px"
                }
            },
            color: "#a8a8a8"
        });
        delete ret.valueAxis2.color;

        ret.plotArea.scrollbar = scrollbar;

        ret = merge(ret, layoutRatio, padding, palettes.dual, gridLineStyle, referenceLineStyle);
        ret = merge(ret, {
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
                color: "#FFFFFF"
            },
            valueAxis2: {
                color: "#FFFFFF"
            }
        });
    }

    function infoTimeBubble(obj) {
        var ret = infoBubble(obj);
        ret.valueAxis = ret.valueAxis2;
        delete ret.valueAxis2;
        ret.timeAxis = merge(axis, {
            hoverShadow: {
                color: "#2b2b2b"
            },
            mouseDownShadow: {
                color: "#383838"
            },
            axisTick:{
                visible: false
            },
            label: {
                style: {
                    color: "#d8d8d8",
                    fontSize: "11px"
                }
            },
            color: "#6b6b6b"
        });
        return ret;
    }

    function infoBubble(obj) {
        var ret = {};
        for (var i in obj) {
            if (obj.hasOwnProperty(i)) {
                ret[i] = obj[i];
            }
        }

        ret.valueAxis = merge(axis, gridline_base, showInfoAxisLine, {
            label: {
                style: {
                    color: "#d8d8d8",
                    fontSize: "10px"
                }
            },
            color: "#a8a8a8"
        });

        ret.valueAxis2 = merge(axis, hideInfoAxisLine, {
            label: {
                style: {
                    color: "#d8d8d8",
                    fontSize: "10px"
                }
            },
            color: "#a8a8a8"
        });

        ret.plotArea.scrollbar = scrollbar;
        ret = merge(ret, padding, palettes.single, gridLineStyle, referenceLineStyle);


        general(ret);
        return ret;
    }

    function infoTreemap(obj) {
        var ret = {};
        for (var i in obj) {
            if (obj.hasOwnProperty(i)) {
                ret[i] = obj[i];
            }
        }
//
        ret.plotArea = {};
        ret.plotArea.colorPalette = [  "#e6f4fa","#a5d9ec", "#5dc4e7" ,"#18b3cf","#188ba1","#0e606d" ,"#353838" ];
        ret.plotArea.background = {};
        ret.plotArea.labelPosition = 'topleft';

        ret = merge(background, ret, title, padding, referenceLineStyle);
        general(ret);

        return ret;
    }

    function infoTagcloud(obj) {
        var ret = {};
        for (var i in obj) {
            if (obj.hasOwnProperty(i)) {
                ret[i] = obj[i];
            }
        }
//
        ret.plotArea = {};
        ret.plotArea.colorPalette = [  "#e6f4fa","#a5d9ec", "#5dc4e7" ,"#18b3cf","#188ba1","#0e606d" ,"#353838" ];
        ret.plotArea.background = {};

        ret = merge(background, ret, title, padding, referenceLineStyle);
        general(ret);

        return ret;
    }

    function infoNumber(obj){
        obj.plotArea = obj.plotArea || {};
        obj.plotArea.background = obj.background;
        delete obj.background;

        var gen = obj.general = obj.general || {};
        gen.background = {
            color: "#1B1B1B"
        };

        obj.title = merge(obj.title, {
            alignment  : "left",
            style : {
                fontWeight:"normal",
                fontSize: "21px",
                color: "#ffffff"
            }
        });
        return obj;
    }

    function infoRadar(obj) {
        var ret = {};
        for (var i in obj) {
            if (obj.hasOwnProperty(i)) {
                ret[i] = obj[i];
            }
        }
        ret.plotArea = ret.plotArea || {};
        ret.plotArea.background = ret.background;
        delete ret.background;

        var gen = ret.general = ret.general || {};
        gen.background = {
            color: "#1B1B1B"
        };

        ret.legend = ret.legend || {};
        ret.legend.hoverShadow = {
            color: "#2b2b2b"
        };

        ret.legend.mouseDownShadow = {
            color: "#383838"
        };

        ret.title = merge(ret.title, {
            alignment  : "left",
            style : {
                fontWeight:"normal",
                fontSize: "21px",
                color: "#ffffff"
            }
        });
        return ret;
    }

    function infoHeatmap(obj){
        var ret = {};
        for (var i in obj) {
            if (obj.hasOwnProperty(i)) {
                ret[i] = obj[i];
            }
        }

        ret.categoryAxis = merge(axis, {
            hoverShadow: {
                color: "#2b2b2b"
            },
            mouseDownShadow: {
                color: "#383838"
            },
            axisTick:{
                visible: false
            },
            label: {
                style: {
                    color: "#d8d8d8",
                    fontSize: "11px"
                }
            },
            color: "#6b6b6b"
        });

        ret.categoryAxis2 = merge(axis, {
            hoverShadow: {
                color: "#2b2b2b"
            },
            mouseDownShadow: {
                color: "#383838"
            },
            axisTick:{
                visible: false
            },
            label: {
                style: {
                    color: "#d8d8d8",
                    fontSize: "11px"
                }
            },
            color: "#6b6b6b"
        });

        ret.plotArea = {};
        ret.plotArea.colorPalette = [  "#e6f4fa","#a5d9ec", "#5dc4e7" ,"#18b3cf","#188ba1","#0e606d" ,"#353838" ];
        ret.plotArea.background = {};

        ret = merge(background, ret, title, padding, referenceLineStyle);

        general(ret);
        return ret;
    }

    function general(obj) {
        obj.plotArea = obj.plotArea || {};
        obj.plotArea.background = obj.background;
        delete obj.background;

        delete obj.xAxis;
        delete obj.xAxis2;
        delete obj.yAxis;
        delete obj.yAxis2;

        var gen = obj.general = obj.general || {};
        gen.background = {
            color: "#1B1B1B"
        };

        if (!obj.plotArea.gridline) {
            obj.plotArea.gridline = {};
        }

        obj.plotArea.gridline.color = axisGridlineColor;

        obj.legend = obj.legend || {};
        obj.legend.hoverShadow = {
            color: "#2b2b2b"
        };

        obj.legend.mouseDownShadow = {
            color: "#383838"
        };

        if(obj.categoryAxis) {
            if(!obj.categoryAxis.label) {
                obj.categoryAxis.label = {};
            }
            obj.categoryAxis.label.angle = 45;
        }

        obj.title = merge(obj.title, {
            alignment  : "left",
            style : {
                fontWeight:"normal",
                fontSize: "21px",
                color: "#ffffff"
            }
        });

    }

})();
