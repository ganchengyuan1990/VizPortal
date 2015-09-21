(function() {
    var drawingEffect = "glossy";
    var legend = {
        titleStyle : {
            fontSize : '14px',
            color : '#333333',
            fontWeight : 'bold'
        },
        labelStyle : {
            fontSize : '12px',
            color : '#333'
        },
        drawingEffect : drawingEffect
    };
    var dataLabel = {
        style : {
            fontSize : "12px"
        }
    };
    var tooltip = {
        drawingEffect : drawingEffect
    };
    var sizeLegend = {};
    var i;
    for (i in legend) {
        if (legend.hasOwnProperty(i)) {
            sizeLegend[i] = legend[i];
        }
    }
    sizeLegend.drawingEffect = "normal";
    sap.viz.extapi.env.Template.register({
        id : "flashy",
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
                        sizeLegend : sizeLegend,
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
                        sizeLegend : sizeLegend
                    }
                }
            }
        }
    });
})();