sap.ui.getCore().attachInit(function() {
    var locale = sap.viz.api.env.Locale;
    var resource = sap.viz.api.env.Resource;

    /**set the locale*/
    resource.path('sap.viz.api.env.Language.loadPaths', ['../../resources/langs/']);
    sap.viz.api.env.Resource.path('sap.viz.api.env.Template.loadPaths',
     ['../../../resources/libs/sap.viz/resources/chart/templates']);

    sap.common.globalization.NumericFormatManager.USE_DEFUALT_FORMATSTRING_OR_NOT = true;

    
    var SettingPanel = new sap.m.Panel({
        headerText: "Settings",
        height: "auto"
    }).placeAt("setting");
    SettingPanel.addStyleClass("panel1");

    var Label = new sap.m.Label({
        text: "Enable Morpher",
        design: "Bold",
        width: "10em"
    });
    Label.addStyleClass("sapUiSmallMarginTopBottom");

    var Switch1 = new sap.m.Switch({
        id: "SW1",
        customTextOn:"ON",
        customTextOff:"OFF",
        state: false
    });

    var Label2 = new sap.m.Label({
        text: "Show Legend",
        design: "Bold",
        width: "10em"
    });
    Label2.addStyleClass("sapUiSmallMarginTopBottom");

    var Switch2 = new sap.m.Switch({
        id: "SW2",
        customTextOn:"ON",
        customTextOff:"OFF",
        state: true
    });

    var HBox1 = new sap.ui.layout.HorizontalLayout({
        content : [Label, Switch1]
    });
    HBox1.addStyleClass("HBox1");

    var HBox2 = new sap.ui.layout.HorizontalLayout({
        content : [Label2, Switch2]
    });

    var VBox = new sap.ui.layout.VerticalLayout({
        content : [HBox1, HBox2]
    })

    SettingPanel.insertContent(VBox);

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
            ['China', '2012', 'Sport Utility Vehicle', 120],
            ['China', '2013', 'Sport Utility Vehicle', 180],
            ['China', '2014', 'Sport Utility Vehicle', 200],
            ['China', '2012', 'Comfortable Runabout Vehicle', 50],
            ['China', '2013', 'Comfortable Runabout Vehicle', 60],
            ['China', '2014', 'Comfortable Runabout Vehicle', 100],
            ['USA', '2012', 'Sport Utility Vehicle', 160],
            ['USA', '2013', 'Sport Utility Vehicle', 130],
            ['USA', '2014', 'Sport Utility Vehicle', 170],
            ['USA', '2012', 'Comfortable Runabout Vehicle', 80],
            ['USA', '2013', 'Comfortable Runabout Vehicle', 60],
            ['USA', '2014', 'Comfortable Runabout Vehicle', 100],
            ['Germany', '2012', 'Sport Utility Vehicle', 140],
            ['Germany', '2013', 'Sport Utility Vehicle', 150],
            ['Germany', '2014', 'Sport Utility Vehicle', 160],
            ['Germany', '2012', 'Comfortable Runabout Vehicle', 50],
            ['Germany', '2013', 'Comfortable Runabout Vehicle', 70],
            ['Germany', '2014', 'Comfortable Runabout Vehicle', 90]
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
        'type' : 'info/stacked_bar',
        'container' : $('#vizFrame').get(0),
        'data' : dataset,
        'bindings' : bindings
    };

    function destroy() {
        $('#vizFrame').empty();
    }

    destroy();
    sap.viz.api.env.Template.set('standard_lumira', function() {
        var vizFrame = new VizFrame(options);
        vizFrame.disableControl('morpher');

        Switch1.attachChange(function() {
            if (this.getState()) {
                vizFrame.enableControl('morpher');
            } else { 
                vizFrame.disableControl('morpher');
            }
        });

        Switch2.attachChange(function() {
            if (this.getState()) {
                vizFrame.properties({
                    legend : {
                        visible : true
                    }
                })
            } else { 
                vizFrame.properties({
                    legend : {
                        visible : false
                    }
                })
            }
        });
        var delJS=['enableMorpher.js','jquery-ui'];
        var delCss=['button.css'];
        var delElementById=['setting','code-content','toggle','code'];
        toggleViewExtension("index.html","enableMorpher.js",textArea, delJS,delCss,delElementById);
    });
});

