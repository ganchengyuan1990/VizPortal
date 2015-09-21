$(function() {
    var locale = sap.viz.api.env.Locale;
    var resource = sap.viz.api.env.Resource;

    /**set the locale*/
    resource.path('sap.viz.api.env.Language.loadPaths', ['../../resources/langs/']);
    sap.viz.api.env.Resource.path('sap.viz.api.env.Template.loadPaths', 
        ['../../../resources/libs/sap.viz/resources/chart/templates']);

    sap.common.globalization.NumericFormatManager.USE_DEFUALT_FORMATSTRING_OR_NOT = true;

    var VizFrame = sap.viz.vizframe.VizFrame;
    var FlatTableDataset = sap.viz.api.data.FlatTableDataset;
    var textArea = document.getElementById('code-content');
    var dataset = new FlatTableDataset({
        'metadata' : {
            'fields' : [{
                'id' : 'Country', 'name' : 'Country', 'semanticType' : 'Dimension', 'dataType' : 'String'}, {
                'id' : 'Year', 'name' : 'Year', 'semanticType' : 'Dimension', 'dataType' : 'String'}, {
                'id' : 'Product', 'name' : 'Product', 'semanticType' : 'Dimension', 'dataType' : 'String'}, {
                'id' : 'Profit', 'name' : 'Profit', 'semanticType' : 'Measure', 'dataType' : 'Number'
            }]
        },
        'data' : [
            ['China', '2012', 'Car', 120],
            ['China', '2013', 'Car', 180],
            ['China', '2014', 'Car', 200],
            ['China', '2012', 'Truck', 50],
            ['China', '2013', 'Truck', 60],
            ['China', '2014', 'Truck', 100],
            ['USA', '2012', 'Car', 160],
            ['USA', '2013', 'Car', 130],
            ['USA', '2014', 'Car', 170],
            ['USA', '2012', 'Truck', 80],
            ['USA', '2013', 'Truck', 60],
            ['USA', '2014', 'Truck', 100],
            ['Germany', '2012', 'Car', 140],
            ['Germany', '2013', 'Car', 150],
            ['Germany', '2014', 'Car', 160],
            ['Germany', '2012', 'Truck', 50],
            ['Germany', '2013', 'Truck', 70],
            ['Germany', '2014', 'Truck', 90]
        ]
    });

    var bindings = [{
        'feed' : 'categoryAxis',
        'source' : ['Country']
    }, {
        'feed' : 'color',
        'source' : ['Year', 'Product']
    }, {
        'feed' : 'valueAxis',
        'source' : ['Profit']
    }];

    var options = {
        'type' : 'info/bar',
        'container' : $('#vizFrame').get(0),
        'data' : dataset,
        'bindings' : bindings
    };

    function destroy() {
        $('#vizFrame').empty();
    }

    destroy();
    sap.viz.api.env.Template.set('standard_lumira', function() {
        var delJS=['vizFrame.js',,'jquery-ui'];
        var delCss=['button.css'];
        var delElementById=['setting','code-content','toggle','code'];
        toggleViewExtension("index.html","vizFrame.js",textArea,delJS,delCss,delElementById);
        var vizFrame = new VizFrame(options);
    });

});