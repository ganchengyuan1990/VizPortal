(function() {
    var drawingEffect = "normal";
    var legend = {
        titleStyle : {
            fontSize : '14px',
            color : '#d8d8d8',
            fontWeight : 'bold'
        },
        labelStyle : {
            fontSize : '12px',
            color : '#d8d8d8'
        },
        drawingEffect : drawingEffect
    };
    var dataLabel = {
        style : {
            fontSize : "12px",
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
    sap.viz.extapi.env.Template.register({
        id : "highcontrast",
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
                        clusterLegend : legend
                    },
                    "sap.viz.geo.dataviz.Choropleth" : {
                        dataLabel : dataLabel,
                        drawingEffect : drawingEffect,
                        mbcLegend : legend
                    },
                    "sap.viz.geo.dataviz.Pie" : {
                        dataLabel : dataLabel,
                        drawingEffect : drawingEffect,
                        colorLegend : legend,
                        sizeLegend : legend
                    }
                }
            }
        }
    });
})();