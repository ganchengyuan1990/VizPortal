$(function(){
    //set template paths
    sap.viz.api.env.Resource.path('sap.viz.api.env.Template.loadPaths', 
      ['../../../resources/libs/sap.viz/resources/chart/templates', 
      '../../../resources/libs/sap.viz/resources/geo/templates/?_viz_template_with_css=true'])

    //set map resource path
    sap.viz.api.env.Resource.path("sap.viz.map.Resources", 
      "../../../resources/libs/sap.viz/resources/geo");

    //Apply template
    sap.viz.api.env.Template.set("highcontrast_lumira",function(){
          // initialize a cvom base map
        var baseMapProvider = new sap.viz.geo.basemap.cvom.Provider();

        // create chart
        var map = new sap.viz.geo.Map($('#chart').get(0), {baseMap : baseMapProvider});
        var textArea = document.getElementById('code-content');

       // prepare data
        var data = {
          "metadata" : {
            "fields" : [{
              "id" : "Location",
              "name" : "Location",
              "semanticType" : "Dimension",
              "dataType" : "String"
            }, {
              "id" : "Year",
              "name" : "Year",
              "semanticType" : "Dimension",
              "dataType" : "String"
            },{
              "id" : "GDP",
              "name" : "GDP",
              "semanticType" : "Measure"
            }]
          },
          "data" : [
              ["China", "2001", 5000],
              ["China", "2002", 3000],
              ["China", "2003", 4000],
              ["USA", "2001", 1000],
              ["USA", "2002", 3000],
              ["USA", "2003", 4000],
              ["Brazil", "2001", 1000],
              ["Brazil", "2002", 3000],
              ["Brazil", "2003", 2000],

          ],
          "info" : [{
            "type" : "geo",
            "info" : [
                [{'featureId':'22928332,NAVTEQ'}],
                [{'featureId':'22928332,NAVTEQ'}],
                [{'featureId':'22928332,NAVTEQ'}],
                [{'featureId':'21000001,NAVTEQ'}],
                [{'featureId':'21000001,NAVTEQ'}],
                [{'featureId':'21000001,NAVTEQ'}],
                [{'featureId':'23028911,NAVTEQ'}],
                [{'featureId':'23028911,NAVTEQ'}],
                [{'featureId':'23028911,NAVTEQ'}]
            ]
          }]
        };

        var ds = new sap.viz.api.data.FlatTableDataset(data);

        // specify the feedings.
        var feeding = {
          location : 'Location',
          size: 'GDP',
          color: 'Year'
        };

      // create a pie
        var pie = new sap.viz.geo.dataviz.Pie({
          dataLabel:{
            visible: true
          }
        });

        // create a layer
        var layer = new sap.viz.geo.dataviz.Layer({
          viz : pie,
          data : ds,
          feeding : feeding
        });
        var delJS=['main_pie.js'];
        var delCss=['style.css'];
       var delElementById=['setting','code-content','toggle','code'];
        toggleViewExtension("index_pie.html","main_pie.js",textArea,delJS,delCss,delElementById);

        // add layer
        map.addLayer(layer, true);

    })
    

});
