(function() {
    var drawingEffect = "normal";
    var legend = {
        titleStyle : {
            fontSize : '12px',
            color : '#000',
            fontWeight : 'normal'
        },
        labelStyle : {
            fontFamily : "Arial",
            fontSize : '10px',
            color : '#737373'
        },
        marker : {
            size : 14
        },
        itemMargin : 0.22,
        drawingEffect : drawingEffect
    };
    var dataLabel = {
        style : {
            fontSize : "11px"
        }
    };
    var tooltip = {
        drawingEffect : drawingEffect
    };
    var categoricalColorPalette = [
        "#73d2e0", "#bbd03b", "#999d20", "#f2910f", "#fccd8c", "#a5d5cb", "#00adc6", "#919795", "#ed6b06"
    ];
    var mbcColorPalette = [
        "#bfebf1", "#80d6e2", "#19b5cc", "#198c9d", "#0e6977"
    ];

    sap.viz.extapi.env.Template.register({
        id : "standard_lumira",
        properties : {
            'viz/geomap' : {
                tooltip : tooltip,
                viz : {
                    "sap.viz.geo.dataviz.Marker" : {
                        legend : legend,
                        dataLabel : dataLabel
                    },
                    "sap.viz.geo.dataviz.Bubble" : {
                        dataLabel : dataLabel,
                        drawingEffect : drawingEffect,
                        mbcLegend : legend,
                        colorLegend : legend,
                        sizeLegend : legend,
                        clusterLegend : legend,
                        colorPalette : categoricalColorPalette,
                        mbcColorPalette : mbcColorPalette,
                        hover : {
                            color : "darken(20)"
                        },
                        deselected : {
                            color : "greyscale()"
                        }
                    },
                    "sap.viz.geo.dataviz.Choropleth" : {
                        dataLabel : dataLabel,
                        drawingEffect : drawingEffect,
                        mbcLegend : legend,
                        colorPalette : mbcColorPalette,
                        hover : {
                            color : "darken(20)"
                        },
                        deselected : {
                            color : "greyscale()"
                        }
                    },
                    "sap.viz.geo.dataviz.Pie" : {
                        dataLabel : dataLabel,
                        drawingEffect : drawingEffect,
                        colorLegend : legend,
                        sizeLegend : legend,
                        colorPalette : categoricalColorPalette,
                        hover : {
                            color : "darken(20)"
                        },
                        deselected : {
                            color : "greyscale()"
                        }
                    }
                }
            }
        }
    });
})();
