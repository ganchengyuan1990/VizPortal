$(function() {
    var locale = sap.viz.api.env.Locale;
    var resource = sap.viz.api.env.Resource;

    var BVRService = sap.viz.vizservices.BVRService;

    /**set the locale*/
    resource.path('sap.viz.api.env.Language.loadPaths', ['../../resources/langs/']);
    sap.viz.api.env.Resource.path('sap.viz.api.env.Template.loadPaths', ['../../../resources/libs/sap.viz/resources/chart/templates']);

    sap.common.globalization.NumericFormatManager.USE_DEFUALT_FORMATSTRING_OR_NOT = true;
    var textArea = document.getElementById('code-content');

    sap.ui.getCore().attachInit(function() {
        // 1. Create Settings
        var SettingPanel = new sap.m.Panel({
            headerText: "Settings", 
            height: "auto",
        }).placeAt("setting");

        var labe1 = new sap.ui.commons.Label({
        text : 'Switch Chart Type',
        });
        labe1.addStyleClass("myRadio");

        var item1 = new sap.ui.core.Item({
            key: "info/line",
            text: "Line Chart"
        });
        var item2 = new sap.ui.core.Item({
            key: "info/column",
            text: "Column Chart"
        });
        var item3 = new sap.ui.core.Item({
            key: "info/bar",
            text: "Bar Chart"
        });
        var item4 = new sap.ui.core.Item({
            key: "info/pie",
            text: "Pie Chart"
        });
        var Select = new sap.m.Select({});
        Select.insertItem(item4);Select.insertItem(item3);Select.insertItem(item2);Select.insertItem(item1);
        Select.addStyleClass("selectStyle");
        
        var VBox1 = new sap.ui.layout.VerticalLayout({
            content: [labe1, Select]
        });
        VBox1.addStyleClass("vboxStyle");

        SettingPanel.insertContent(VBox1);

        // 2. Create VizFrame
        var VizFrame = sap.viz.vizframe.VizFrame;
        var FlatTableDataset = sap.viz.api.data.FlatTableDataset;
        var vizFrame = {};

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
            'source' : ['Country','Year', 'Product']
        }, {
            'feed' : 'color',
            'source' : []
        }, {
            'feed' : 'valueAxis',
            'source' : ['Profit']
        }];

        var options = {
            'type' : 'info/line',
            'container' : $('#vizFrame').get(0),
            'data' : dataset,
            'bindings' : bindings
        };

        function destroy() {
            $('#vizFrame').empty();
        }

        destroy();
        sap.viz.api.env.Template.set('standard_lumira', function() {
            var delJS=['switchChartType.js',,'jquery-ui'];
            var delCss=['button.css'];
            var delElementById=['setting','code-content','toggle','code'];
            toggleViewExtension("index.html","switchChartType.js",textArea,delJS,delCss,delElementById);
            
            vizFrame = new VizFrame(options);
            vizFrame.type("info/line");
        });

        Select.attachChange(function() {
            var current = vizFrame.type();
            var type = null;
            if (this.getSelectedKey()) {
                type = this.getSelectedKey();
            }

            var feeds = bindingsToFeeds(vizFrame.bindings(), current);
            feeds = BVRService.switchFeeds(current, feeds, type).feedItems;
            var feeds = feedsToBindings(feeds);
            var options = {
                'type' : type,
                'bindings' : feeds
            };
            vizFrame.update(options);
            
            if (type !== current) {
                vizFrame.type(type);
            }
        });

        // 3. BVRService Feed Mapping
        var bindingsToFeeds = function(data, type) {
            var metadata = sap.viz.api.metadata.Viz.get(type).bindings;
            lookup = function(feedItem) {
                for (var i = 0; i < metadata.length; i++) {
                    if (metadata[i].id == feedItem) {
                        return metadata[i].type;
                    }
                }
            };
            res = data.map(function(e) {
                return {
                    id : e.feed,
                    values : e.source.map(function(f) {
                        return {
                            id : f,
                            type : lookup(e.feed),
                            dataType : 'String'
                        };
                    })
                };
            });
            return res;
        };
        
        var feedsToBindings = function(data){
            res = data.map(function(e) {
                return {
                    feed : e.id,
                    source : e.values.map(function(f){
                        return f.id;
                    })
                };
            });
            return res;
        };
    });
});