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

        // Add Measures
        var measureLabel = new sap.ui.commons.Label({
        text : 'Add Measures',
        });
        measureLabel.addStyleClass("myRadio");

        var measureItems =[
            new sap.ui.core.Item({
                key: "Profit",
                text: "Profit"
            }),
            new sap.ui.core.Item({
                key: "Cost",
                text: "Cost"
            })
        ] ;

        var measureSelect = new sap.m.MultiComboBox();
        measureItems.forEach(function (item) {measureSelect.insertItem(item);});
        measureSelect.setSelectedKeys("Cost");
        
        var measureVBox = new sap.ui.layout.VerticalLayout({
            content: [measureLabel, measureSelect]
        });
        measureVBox.addStyleClass("vboxStyle");

        // Add Dimension
        var dimensionLabel = new sap.ui.commons.Label({
            text : 'Add Dimensions',
        });

        var dimensionItems = [
            new sap.ui.core.Item({
                key: "Product",
                text: "Product"
            }),
            new sap.ui.core.Item({
                key: "Year",
                text: "Year"
            }),
            new sap.ui.core.Item({
            key: "Country",
            text: "Country"
            })
        ];

        dimensionLabel.addStyleClass("myRadio");
        var dimensionSelect = new sap.m.MultiComboBox();
        dimensionItems.forEach(function (item) {dimensionSelect.insertItem(item);});
        dimensionSelect.setSelectedKeys("Country");

        var dimensionVBox = new sap.ui.layout.VerticalLayout({
            content: [dimensionLabel, dimensionSelect]
        });
        dimensionVBox.addStyleClass("vboxStyle");

        var HBox1 = new sap.ui.layout.HorizontalLayout({
            content: [measureVBox, dimensionVBox]
        });

        SettingPanel.insertContent(HBox1);

        // 2. Create VizFrame
        var VizFrame = sap.viz.vizframe.VizFrame;
        var FlatTableDataset = sap.viz.api.data.FlatTableDataset;
        var vizFrame = {};

        var currentFeeds = [{}];

        var dataset1 = new FlatTableDataset({
            'metadata' : {
                'fields' : [{
                    'id' : 'Country', 'name' : 'Country', 'semanticType' : 'Dimension', 'dataType' : 'String'}, {
                    'id' : 'Cost', 'name' : 'Cost', 'semanticType' : 'Measure', 'dataType' : 'Number'}, {
                    'id' : 'Profit', 'name' : 'Profit', 'semanticType' : 'Measure', 'dataType' : 'Number'
                }]
            },
            'data' : [
                ['China',  60, 120],
                ['China', 50, 180],
                ['China',  70, 200],
                ['China',  30, 50],
                ['China',  40, 60],
                ['China', 50, 100],
                ['USA',  100, 160],
                ['USA', 90, 130],
                ['USA',  150, 170],
                ['USA',  40, 80],
                ['USA', 60, 60],
                ['USA',  90, 100],
                ['Germany',  100, 140],
                ['Germany',  60, 150],
                ['Germany',  100, 160],
                ['Germany',  20, 50],
                ['Germany', 40, 70],
                ['Germany', 47, 90]
            ]
        });

        var dataset2 = new FlatTableDataset({
            'metadata' : {
                'fields' : [{
                    'id' : 'Year', 'name' : 'Year', 'semanticType' : 'Dimension', 'dataType' : 'String'}, {
                    'id' : 'Cost', 'name' : 'Cost', 'semanticType' : 'Measure', 'dataType' : 'Number'}, {
                    'id' : 'Profit', 'name' : 'Profit', 'semanticType' : 'Measure', 'dataType' : 'Number'
                }]
            },
            'data' : [
                ['2012',  60, 120],
                ['2013', 50, 180],
                ['2014',  70, 200],
                ['2012',  30, 50],
                ['2013',  40, 60],
                ['2014', 50, 100],
                ['2012',  100, 160],
                ['2013', 90, 130],
                ['2014',  150, 170],
                ['2012',  40, 80],
                ['2013', 60, 60],
                ['2014',  90, 100],
                ['2012',  100, 140],
                ['2013',  60, 150],
                ['2014',  100, 160],
                ['2012',  20, 50],
                ['2013', 40, 70],
                ['2014', 47, 90]
            ]
        });

        var dataset3 = new FlatTableDataset({
            'metadata' : {
                'fields' : [{
                    'id' : 'Product', 'name' : 'Product', 'semanticType' : 'Dimension', 'dataType' : 'String'}, {
                    'id' : 'Cost', 'name' : 'Cost', 'semanticType' : 'Measure', 'dataType' : 'Number'}, {
                    'id' : 'Profit', 'name' : 'Profit', 'semanticType' : 'Measure', 'dataType' : 'Number'
                }]
            },
            'data' : [
                ['Car',  60, 120],
                ['Car', 50, 180],
                ['Car',  70, 200],
                ['Truck',  30, 50],
                ['Truck',  40, 60],
                ['Truck', 50, 100],
                ['Car',  100, 160],
                ['Car', 90, 130],
                ['Car',  150, 170],
                ['Truck',  40, 80],
                ['Truck', 60, 60],
                ['Truck',  90, 100],
                ['Car',  100, 140],
                ['Car',  60, 150],
                ['Car',  100, 160],
                ['Truck',  20, 50],
                ['Truck', 40, 70],
                ['Truck', 47, 90]
            ]
        });

        var dataset4 = new FlatTableDataset({
            'metadata' : {
                'fields' : [{
                    'id' : 'Country', 'name' : 'Country', 'semanticType' : 'Dimension', 'dataType' : 'String'}, {
                    'id' : 'Year', 'name' : 'Year', 'semanticType' : 'Dimension', 'dataType' : 'String'}, {
                    'id' : 'Cost', 'name' : 'Cost', 'semanticType' : 'Measure', 'dataType' : 'Number'}, {
                    'id' : 'Profit', 'name' : 'Profit', 'semanticType' : 'Measure', 'dataType' : 'Number'
                }]
            },
            'data' : [
                ['China', '2012', 60, 120],
                ['China', '2013', 50, 180],
                ['China', '2014', 70, 200],
                ['China', '2012', 30, 50],
                ['China', '2013', 40, 60],
                ['China', '2014', 50, 100],
                ['USA', '2012', 100, 160],
                ['USA', '2013', 90, 130],
                ['USA', '2014', 150, 170],
                ['USA', '2012', 40, 80],
                ['USA', '2013', 60, 60],
                ['USA', '2014', 90, 100],
                ['Germany', '2012', 100, 140],
                ['Germany', '2013', 60, 150],
                ['Germany', '2014', 100, 160],
                ['Germany', '2012', 20, 50],
                ['Germany', '2013', 40, 70],
                ['Germany', '2014', 47, 90]
            ]
        });

        var dataset5 = new FlatTableDataset({
            'metadata' : {
                'fields' : [{
                    'id' : 'Country', 'name' : 'Country', 'semanticType' : 'Dimension', 'dataType' : 'String'}, {
                    'id' : 'Product', 'name' : 'Product', 'semanticType' : 'Dimension', 'dataType' : 'String'}, {
                    'id' : 'Cost', 'name' : 'Cost', 'semanticType' : 'Measure', 'dataType' : 'Number'}, {
                    'id' : 'Profit', 'name' : 'Profit', 'semanticType' : 'Measure', 'dataType' : 'Number'
                }]
            },
            'data' : [
                ['China', 'Car', 60, 120],
                ['China', 'Car', 50, 180],
                ['China', 'Car', 70, 200],
                ['China', 'Truck', 30, 50],
                ['China', 'Truck', 40, 60],
                ['China', 'Truck', 50, 100],
                ['USA', 'Car', 100, 160],
                ['USA', 'Car', 90, 130],
                ['USA', 'Car', 150, 170],
                ['USA', 'Truck', 40, 80],
                ['USA', 'Truck', 60, 60],
                ['USA', 'Truck', 90, 100],
                ['Germany', 'Car', 100, 140],
                ['Germany', 'Car', 60, 150],
                ['Germany', 'Car', 100, 160],
                ['Germany', 'Truck', 20, 50],
                ['Germany', 'Truck', 40, 70],
                ['Germany', 'Truck', 47, 90]
            ]
        });

        var dataset6 = new FlatTableDataset({
            'metadata' : {
                'fields' : [{
                    'id' : 'Year', 'name' : 'Year', 'semanticType' : 'Dimension', 'dataType' : 'String'}, {
                    'id' : 'Product', 'name' : 'Product', 'semanticType' : 'Dimension', 'dataType' : 'String'}, {
                    'id' : 'Cost', 'name' : 'Cost', 'semanticType' : 'Measure', 'dataType' : 'Number'}, {
                    'id' : 'Profit', 'name' : 'Profit', 'semanticType' : 'Measure', 'dataType' : 'Number'
                }]
            },
            'data' : [
                ['2012', 'Car', 60, 120],
                ['2013', 'Car', 50, 180],
                ['2014', 'Car', 70, 200],
                ['2012', 'Truck', 30, 50],
                ['2013', 'Truck', 40, 60],
                ['2014', 'Truck', 50, 100],
                ['2012', 'Car', 100, 160],
                ['2013', 'Car', 90, 130],
                ['2014', 'Car', 150, 170],
                ['2012', 'Truck', 40, 80],
                ['2013', 'Truck', 60, 60],
                ['2014', 'Truck', 90, 100],
                ['2012', 'Car', 100, 140],
                ['2013', 'Car', 60, 150],
                ['2014', 'Car', 100, 160],
                ['2012', 'Truck', 20, 50],
                ['2013', 'Truck', 40, 70],
                ['2014', 'Truck', 47, 90]
            ]
        });

        var dataset7 = new FlatTableDataset({
            'metadata' : {
                'fields' : [{
                    'id' : 'Country', 'name' : 'Country', 'semanticType' : 'Dimension', 'dataType' : 'String'}, {
                    'id' : 'Year', 'name' : 'Year', 'semanticType' : 'Dimension', 'dataType' : 'String'}, {
                    'id' : 'Product', 'name' : 'Product', 'semanticType' : 'Dimension', 'dataType' : 'String'}, {
                    'id' : 'Cost', 'name' : 'Cost', 'semanticType' : 'Measure', 'dataType' : 'Number'}, {
                    'id' : 'Profit', 'name' : 'Profit', 'semanticType' : 'Measure', 'dataType' : 'Number'
                }]
            },
            'data' : [
                ['China', '2012', 'Car', 60, 120],
                ['China', '2013', 'Car', 50, 180],
                ['China', '2014', 'Car', 70, 200],
                ['China', '2012', 'Truck', 30, 50],
                ['China', '2013', 'Truck', 40, 60],
                ['China', '2014', 'Truck', 50, 100],
                ['USA', '2012', 'Car', 100, 160],
                ['USA', '2013', 'Car', 90, 130],
                ['USA', '2014', 'Car', 150, 170],
                ['USA', '2012', 'Truck', 40, 80],
                ['USA', '2013', 'Truck', 60, 60],
                ['USA', '2014', 'Truck', 90, 100],
                ['Germany', '2012', 'Car', 100, 140],
                ['Germany', '2013', 'Car', 60, 150],
                ['Germany', '2014', 'Car', 100, 160],
                ['Germany', '2012', 'Truck', 20, 50],
                ['Germany', '2013', 'Truck', 40, 70],
                ['Germany', '2014', 'Truck', 47, 90]
            ]
        });

        var dataset8 = new FlatTableDataset({
            'metadata' : {
                'fields' : [{
                    'id' : 'Cost', 'name' : 'Cost', 'semanticType' : 'Measure', 'dataType' : 'Number'}, {
                    'id' : 'Profit', 'name' : 'Profit', 'semanticType' : 'Measure', 'dataType' : 'Number'
                }]
            },
            'data' : [
                [60, 120],
                [50, 180],
                [70, 200],
                [30, 50],
                [40, 60],
                [50, 100],
                [100, 160],
                [90, 130],
                [150, 170],
                [40, 80],
                [60, 60],
                [90, 100],
                [100, 140],
                [60, 150],
                [100, 160],
                [20, 50],
                [40, 70],
                [47, 90]
            ]
        });

        // init
        var bindings1 = [{
            'feed' : 'categoryAxis',
            'source' : ['Country']
        }, {
            'feed' : 'valueAxis',
            'source' : ['Cost']
        }];

        var currentBindings = bindings1;

        var options = {
            'type' : 'info/column',
            'container' : $('#vizFrame').get(0),
            'data' : dataset1,
            'bindings' : currentBindings
        };

        function destroy() {
            $('#vizFrame').empty();
        }

        destroy();
        sap.viz.api.env.Template.set('standard_lumira', function() {
            var delJS=['suggestFeeds.js','jquery-ui'];
            var delCss=['button.css'];
            var delElementById=['setting','code-content','toggle','code'];
            toggleViewExtension("index.html","suggestFeeds.js",textArea,delJS,delCss,delElementById);

            vizFrame = new VizFrame(options);
        });

        var current = "info/column";

        measureSelect.attachSelectionChange(function(event) {
            var analysisObject = [];
            var meaId = event.getParameters().changedItem.getKey();
            var measures = measureSelect.getSelectedKeys();
            if (event.getParameters().selected === true) {
                analysisObject.push({"id": meaId, "type": "Measure", "dataType": "Number"});
            } else {
                for (var i = 0; i < currentBindings.length; i++) {
                    if (currentBindings[i].feed === "valueAxis") {
                        currentBindings[i].source = [];
                        measures.forEach(function(e) {
                            currentBindings[i].source.push(e);
                        });
                    }
                }
            }
            updateVizFrame(analysisObject);
        });

        var needMND = function (feedings, analysisObjects) {
            // valueAxis has Measure.
            var case1 = feedings.some(function (feed) {
                if (feed.id === 'valueAxis') {
                    // true = 1 when adding with int
                    var measureCount = analysisObjects.filter(function (ao) {return ao.type === 'Measure';}).length;
                    if((feed.values.length + measureCount) >= 1) {
                        return true;
                    }
                }
            });
            // Some feeds does not meed minimum requirement.
            // FIXME For simplicity here we hard code categoryAxis.
            var case2 = feedings.some(function (feed) {
                if (feed.id === 'categoryAxis') {
                    var dimensionCount = analysisObjects.filter(function (ao) {
                        return (ao.type === 'Dimension');
                    }).length;
                    if((feed.values.length + dimensionCount) <= 0) {
                        return true;
                    }
                }
            });
            
            return case1&&case2;
        };

        dimensionSelect.attachSelectionChange(function(event) {
            var analysisObject = [];
            var dimId = event.getParameters().changedItem.getKey();
            var dimensions = dimensionSelect.getSelectedKeys();

            if (event.getParameters().selected === true) {
                analysisObject.push({"id": dimId, "type": "Dimension", "dataType": "String"});
            } else {
                var found = false;
                for (var i = 0; i < currentBindings.length; i++) {
                    if (!found && currentBindings[i].feed !== "valueAxis") {
                        var dims = currentBindings[i].source;
                        for (var j = 0; j < dims.length; j++) {
                            if (dims[j] === dimId) {
                                found = true;
                                dims.splice(j, 1);
                                break;
                            }
                        }
                    }
                }
            }
            updateVizFrame(analysisObject);
        });

        var updateVizFrame = function(analysisObjects) {

            var currentFeeds = bindingsToFeeds(currentBindings, current);
            // filter the mnd and calculate later
            for (var i = 0; i < currentFeeds.length; i++) {
                currentFeeds[i].values = currentFeeds[i].values.filter(function(value) {
                    if (value.id !== "MND") {
                        return true;
                    }
                });
            }
           
            //Suggest new feeds when new analysis objects are added to existing viz and feeds.
            if (needMND(currentFeeds, analysisObjects)) {
                analysisObjects = analysisObjects || [];
                analysisObjects.push({"id": "MND", "type": "MND", "dataType" : "String"});
            } 
            
            analysisObjects = analysisObjects || [];
            if (analysisObjects) {
                currentFeeds = BVRService.suggestFeeds(current, currentFeeds, analysisObjects).feedItems;
            }
            
            // if there are serval measure, add no mnd in dimension, put the mnd in color
            var mutipleMeasure = false, hasMND = false;
            for(var i = 0; i<currentFeeds.length; i++){
                if(currentFeeds[i].id === "valueAxis") {
                    if (currentFeeds[i].values.length > 1){
                        mutipleMeasure = true;
                    }
                } else {
                    for (var j = 0;j<currentFeeds[i].values.length; j++){
                        if(currentFeeds[i].values[j].id === "MND"){
                            hasMND = true;
                        }
                    }
                }
            }
            
            if (mutipleMeasure && !hasMND) {
                for(i = 0; i<currentFeeds.length; i++){
                    if(currentFeeds[i].id === "color") {
                        currentFeeds[i].values = currentFeeds[i].values ||[];
                        currentFeeds[i].values.push({"id": "MND", "type": "MND", "dataType" : "String"});
                    }
                }
            }
            
            var bindings = feedsToBindings(currentFeeds);
            var options = {};
            var dimensions = dimensionSelect.getSelectedKeys();
            var input = dimensions.join(",");
            switch(input) {
                case 'Country':
                options = {
                    'bindings' : bindings,
                    'data' : dataset1
                };
                break;
                case 'Year':
                options = {
                    'bindings' : bindings,
                    'data' : dataset2
                };
                break;
                case 'Product':
                options = {
                    'bindings' : bindings,
                    'data' : dataset3
                };
                break;
                case 'Country,Year':
                case 'Year,Country':
                options = {
                    'bindings' : bindings,
                    'data' : dataset4
                };
                break;
                case 'Country,Product':
                case 'Product,Country':
                options = {
                    'bindings' : bindings,
                    'data' : dataset5
                };
                break;
                case 'Year,Product':
                case 'Product,Year':
                options = {
                    'bindings' : bindings,
                    'data' : dataset6
                };
                break;
                case 'Country,Year,Product': 
                case 'Country,Product,Year':
                case 'Product,Year,Country':
                case 'Product,Country,Year':
                case 'Year,Product,Country':
                case 'Year,Country,Product':
                options = {
                    'bindings' : bindings,
                    'data' : dataset7
                };
                break;
                case '':
                options = {
                    'bindings' : bindings,
                    'data' : dataset8
                };
                break;
                case undefined:
                options = {
                    'bindings' : bindings,
                    'data' : dataset1
                };
                break;
            }
            try {
                currentBindings = options.bindings;
                vizFrame.update(options);
            } catch(e){
                
            }
        };

        // 3. BVRService Feed Mapping
        var bindingsToFeeds = function(data, type) {
            var metadata = sap.viz.api.metadata.Viz.get(type).bindings;
            var lookupType = function(feedItem) {
                for (var i = 0; i < metadata.length; i++) {
                    if (metadata[i].id == feedItem) {
                        return metadata[i].type;
                    }
                }
            };
            var lookupDataType = function(feedItem) {
                for (var i = 0; i < metadata.length; i++) {
                    if (metadata[i].id == feedItem) {
                        if(metadata[i].type === "Dimension") {
                            return "String";
                        } else if(metadata[i].type === "Measure") {
                            return "Number";
                        }
                    }
                }
            };
           
            if (data && data.length) {
                var res = data.map(function(e) {
                    return {
                        id : e.feed,
                        values : e.source.map(function(f) {
                            if ( typeof (f) === "string") {
                                return {
                                    id : f,
                                    type : lookupType(e.feed),
                                    dataType : lookupDataType(e.feed)
                                };
                            } else {
                                return {
                                    id : "MND",
                                    type : "MND",
                                    dataType : "String"
                                };
                            }
                        })
                    };
                });
                return res;
            } else {
                // give the default feeds
                return [{
                        "id" : "categoryAxis",
                        "values" : [
                        ]
                    }, {
                        "id" : "valueAxis",
                        "values" : [
                        ]
                    }
                ];
            }

            
        };
        
        var feedsToBindings = function(feedItems){
            var bindings = [];
            var valueAxisNames = ["valueAxis"];
            feedItems.forEach(function(feed) {
                var values = feed.values || [];
                var list = [];
                if (values.length === 0) {
                    return;
                }
                for (var j = 0; j < values.length; j++) {
                    var aaObj = values[j];
                    if (aaObj.type === "MND") {
                        list.push({
                            measureNames : valueAxisNames
                        });
                    } else {
                        list.push(aaObj.id);
                    }
                }
                bindings.push({
                    feed : feed.id,
                    source : list
                });
            });
            return bindings;
        };
    });
});