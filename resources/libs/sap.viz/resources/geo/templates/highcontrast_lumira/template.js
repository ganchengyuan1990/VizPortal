(function() {
    var drawingEffect = "normal";
    var legend = {
        titleStyle : {
            fontSize : '12px',
            color : '#fff',
            fontWeight : 'normal'
        },
        labelStyle : {
            fontFamily : "Arial",
            fontSize : '10px',
            color : '#d8d8d8'
        },
        marker : {
            size : 14
        },
        itemMargin : 0.22,
        drawingEffect : drawingEffect
    };
    var dataLabel = {
        style : {
            fontSize : "11px",
            color : '#d8d8d8'
        }
    };
    var tooltip = {
        background : {
            color : "#000000",
            borderColor : "#ffffff"
        },
        drawingEffect : drawingEffect,
        footerLabel : {
            color : "#ffffff"
        },
        separationLine : {
            color : "#ffffff"
        },
        bodyDimensionLabel : {
            color : "#c0c0c0"
        },
        bodyDimensionValue : {
            color : "#c0c0c0"
        },
        bodyMeasureLabel : {
            color : "#c0c0c0"
        },
        bodyMeasureValue : {
            color : "#ffffff"
        },
        closeButton : {
            backgroundColor : "#000000",
            borderColor : "#ffffff"
        }
    };
    var categoricalColorPalette = [
        "#73d2e0", "#bbd03b", "#999d20", "#f2910f", "#fccd8c", "#a5d5cb", "#00adc6", "#919795", "#ed6b06"
    ];
    var mbcColorPalette = [
        "#bfebf1", "#80d6e2", "#19b5cc", "#198c9d", "#0e6977"
    ];

    sap.viz.extapi.env.Template.register({
        id : "highcontrast_lumira",
        properties : {
            'viz/geomap' : {
                mapProvider : {
                    "sap.viz.geo.basemap.esri.Provider" : {
                        basemap : "satellite"
                    }
                },
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
                            color : "lighten(15)"
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
                            color : "lighten(15)"
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
                            color : "lighten(15)"
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
