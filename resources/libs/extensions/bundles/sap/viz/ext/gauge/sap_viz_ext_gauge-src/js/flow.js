define("sap_viz_ext_gauge-src/js/flow", ["sap_viz_ext_gauge-src/js/module"], function(moduleFunc) {
    var flowRegisterFunc = function() {
        var flow = sap.viz.extapi.Flow.createFlow({
            id: 'sap.viz.ext.gauge',
            name: 'Gauge',
            dataModel: 'sap.viz.api.data.CrosstableDataset',
            type: 'BorderDIVFlow' // since we're using DIV Container, the type here should be 'BorderDIVFlow'
        });
        var titleElement = sap.viz.extapi.Flow.createElement({
            id: 'sap.viz.chart.elements.Title',
            name: 'Title'
        });
        flow.addElement({
            'element': titleElement,
            'propertyCategory': 'title',
            'place': 'top'
        });
        var element = sap.viz.extapi.Flow.createElement({
            id: 'sap.viz.ext.module.Gauge',
            name: 'Gauge Module'
        });
        element.implement('sap.viz.elements.common.BaseGraphic', moduleFunc);
        /*Feeds Definition*/
        //ds1: Gauge Series
        var ds1 = {
            "id": "sap.viz.ext.gauge.PlotModule.DS1",
            "name": "Gauge Series",
            "type": "Dimension",
            "min": 1,
            "max": 1,
            "aaIndex": 1
        };
        //ms1: Data Value
        var ms1 = {
            "id": "sap.viz.ext.gauge.PlotModule.MS1",
            "name": "Data Value",
            "type": "Measure",
            "min": 1,
            "max": 1,
            "mgIndex": 1
        };
        //ms2: Total Amount
        var ms2 = {
            "id": "sap.viz.ext.gauge.PlotModule.MS2",
            "name": "Total Amount",
            "type": "Measure",
            "min": 1,
            "max": 1,
            "mgIndex": 2
        };
        element.addFeed(ds1);
        element.addFeed(ms1);
        element.addFeed(ms2);
        flow.addElement({
            'element': element,
            'propertyCategory': 'sap.viz.ext.gauge'
        });
        sap.viz.extapi.Flow.registerFlow(flow);
    };
    flowRegisterFunc.id = 'sap.viz.ext.gauge';

    /*flow>>*/
    return {
        id: flowRegisterFunc.id,
        init: flowRegisterFunc
    };
});