$(function(){
    //set template paths
    sap.viz.api.env.Resource.path('sap.viz.api.env.Template.loadPaths', 
      ['../../../resources/libs/sap.viz/resources/chart/templates', 
      '../../../resources/libs/sap.viz/resources/geo/templates/?_viz_template_with_css=true'])

    //set map resource path
    sap.viz.api.env.Resource.path("sap.viz.map.Resources", 
      "../../../resources/libs/sap.viz/resources/geo");

    //Apply template
    sap.viz.api.env.Template.set("standard_lumira",function(){
          // initialize a cvom base map
        var baseMapProvider = new sap.viz.geo.basemap.cvom.Provider();

        // create chart
        var map = new sap.viz.geo.Map($('#chart').get(0), {baseMap : baseMapProvider});

        var candidators = ['Hillary Rodham Clinton', 'Joseph Robinette', 'Richard John Santorum'];

        var voter_area = ['Republicans', 'Democrats'];
        var textArea = document.getElementById('code-content');

        var states = [            
            ['AR',  '21015128,NAVTEQ'],
            ['AZ',  '21009401,NAVTEQ'],
            ['AL',  '21020257,NAVTEQ'],
            ['CO',  '21017065,NAVTEQ'],
            ['CT',  '21014228,NAVTEQ'],
            ['CA',  '21009408,NAVTEQ'],
            ['NC',  '21020341,NAVTEQ'],
            ['SC',  '21024899,NAVTEQ'],
            ['ND',  '21000007,NAVTEQ'],
            ['SD',  '21014079,NAVTEQ'],
            ['DE',  '21010619,NAVTEQ'],
            ['DC',  '21022302,NAVTEQ'],
            ['FL',  '21023288,NAVTEQ'],
            ['GA',  '21020272,NAVTEQ'],
            ['ID',  '21001828,NAVTEQ'],
            ['IL',  '21002247,NAVTEQ'],
            ['IN',  '21005296,NAVTEQ'],
            ['IA',  '21007081,NAVTEQ'],
            ['KS',  '21017506,NAVTEQ'],
            ['KY',  '21007098,NAVTEQ'],
            ['LA',  '21015135,NAVTEQ'],
            ['MA',  '21014299,NAVTEQ'],
            ['MD',  '21010637,NAVTEQ'],
            ['ME',  '21014244,NAVTEQ'],
            ['MI',  '21007137,NAVTEQ'],
            ['MN',  '21000002,NAVTEQ'],
            ['MO',  '21009318,NAVTEQ'],
            ['MS',  '21020324,NAVTEQ'],
            ['MT',  '21014052,NAVTEQ'],
            ['NE',  '21017521,NAVTEQ'],
            ['NV',  '21010555,NAVTEQ'],
            ['NM',  '21010593,NAVTEQ'],
            ['NJ',  '21010654,NAVTEQ'],
            ['NY',  '21010819,NAVTEQ'],
            ['NH',  '21014721,NAVTEQ'],
            ['OR',  '21001841,NAVTEQ'],
            ['OH',  '21009349,NAVTEQ'],
            ['OK',  '21015169,NAVTEQ'],
            ['PA',  '21010849,NAVTEQ'],
            ['RI',  '21014992,NAVTEQ'],
            ['TN',  '21020362,NAVTEQ'],
            ['TX',  '21015214,NAVTEQ'],
            ['UT',  '21017546,NAVTEQ'],
            ['VA',  '21013672,NAVTEQ'],
            ['VT',  '21015047,NAVTEQ'],
            ['WA',  '21001865,NAVTEQ'],
            ['WY',  '21017559,NAVTEQ'],
            ['WV',  '21013584,NAVTEQ'],
            ['WI',  '21009372,NAVTEQ']
        ];
        // prepare data
        var data = {
          "metadata" : {
            "fields" : [{
              "id" : "Location",
              "name" : "Location",
              "semanticType" : "Dimension",
              "dataType" : "String"
            },{
              "id" : "Value",
              "name" : "Selection Margin",
              "semanticType" : "Measure"
            }]
          },
          "data" : [
          ],
          "info" : [{
            "type" : "geo",
            "info" : [

            ]
          }]
        };

        for(var i = 0 ; i < states.length; i++){
            var row= [];
            row[0] = states[i][0];
            row[1] = Math.random() * 1000;
            data.data.push(row);
            data.info[0].info.push([{featureId:states[i][1]}]);
        }

        var ds = new sap.viz.api.data.FlatTableDataset(data);

        // specify the feedings.
        var feeding_choropleth = {
          location : 'Location',
          color : 'Value'
        };

        // create a choropleth
        var choropleth = new sap.viz.geo.dataviz.Choropleth();

        // create a layer
        var layer = new sap.viz.geo.dataviz.Layer({
          viz : choropleth,
          data : ds,
          feeding : feeding_choropleth
        });

        // add layer
        map.addLayer(layer, true);


        data = {
          "metadata" : {
            "fields" : [{
              "id" : "Location",
              "name" : "Location",
              "semanticType" : "Dimension",
              "dataType" : "String"
            },{
              "id" : "Areas",
              "name" : "Vote Area",
              "semanticType" : "Dimension",
              "dataType" : "String"
            }]
          },
          "data" : [
          ],
          "info" : [{
            "type" : "geo",
            "info" : [

            ]
          }]
        };

        for(var i = 0 ; i < states.length; i++){
            var row= [];
            row[0] = states[i][0];
            row[1] = voter_area[Math.floor(Math.random() * 2)];
            data.data.push(row);
            data.info[0].info.push([{featureId:states[i][1]}]);
        }

        ds = new sap.viz.api.data.FlatTableDataset(data);
        // create a bubble
        var bubble = new sap.viz.geo.dataviz.Bubble({
          dataLabel :{
             visible: true
          },
          colorPalette:['orange', 'blue']
        });

        // specify the feedings.
        var feeding_bubble = {
          location : 'Location',
          color : 'Areas'
        };

        // create another layer
        layer = new sap.viz.geo.dataviz.Layer({
          viz : bubble,
          data : ds,
          feeding : feeding_bubble
        });

        map.addLayer(layer, true);


        data = {
          "metadata" : {
            "fields" : [{
              "id" : "Location",
              "name" : "Location",
              "semanticType" : "Dimension",
              "dataType" : "String"
            },{
              "id" : "Candidators",
              "name" : "Candidators",
              "semanticType" : "Dimension",
              "dataType" : "String"
            },{
              "id" : "Rates",
              "name" : "Support Rates",
              "semanticType" : "Measure",
            }]
          },
          "data" : [
          ],
          "info" : [{
            "type" : "geo",
            "info" : [

            ]
          }]
        };

        for(var i = 0 ; i < states.length; i++){
            for(var j= 0; j < candidators.length; j++){
                var row= [];
                row[0] = states[i][0];
                row[1] = candidators[j];
                row[2] = Math.random()* 1000;
                data.data.push(row);
                data.info[0].info.push([{featureId:states[i][1]}]);
            }
        }

        ds = new sap.viz.api.data.FlatTableDataset(data);

        // create a pie
        var pie = new sap.viz.geo.dataviz.Pie({
            donut :{
               isDonut: true,
               innerRadiusRatio : 0.7
            }
        });

        // specify the feedings.
        var feeding_pie = {
          location : 'Location',
          color : 'Candidators',
          size: "Rates"
        };
        // create another layer
        layer = new sap.viz.geo.dataviz.Layer({
          viz : pie,
          data : ds,
          feeding : feeding_pie
        });
        var delJS=['main_choropleth_bubble_pie.js'];
        var delCss=['style.css'];
        var delElementById=['setting','code-content','toggle','code'];
        toggleViewExtension("index_choropleth_bubble_pie.html",
          "main_choropleth_bubble_pie.js",textArea,delJS,delCss,delElementById);

        map.addLayer(layer, true);


        
 map.then(function(){
            var promise = sap.viz.geo.export.svg(map);
            promise.then(function(string){
                console.log(string);
            })
        })


    })
    

});
