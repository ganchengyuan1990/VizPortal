$(function(){
    //set template paths
    sap.viz.api.env.Resource.path('sap.viz.api.env.Template.loadPaths',
     ['../../../resources/libs/sap.viz/resources/chart/templates', 
      '../../../resources/libs/sap.viz/resources/geo/templates/?_viz_template_with_css=true'])

    //set map resource path
    sap.viz.api.env.Resource.path("sap.viz.map.Resources", "../../../resources/libs/sap.viz/resources/geo");

    //Apply template
    sap.viz.api.env.Template.set("highcontrast_lumira",function(){
          // initialize a cvom base map
        var baseMapProvider = new sap.viz.geo.basemap.cvom.Provider();

        // create chart
        var map = new sap.viz.geo.Map($('#chart').get(0), {baseMap : baseMapProvider});

        // prepare data
        // prepare data
        var textArea = document.getElementById('code-content');
        var data = {
          "metadata" : {
            "fields" : [{
              "id" : "Location",
              "name" : "Location",
              "semanticType" : "Dimension",
              "dataType" : "String"
            }, {
              "id" : "GPD",
              "name" : "GDP 2015",
              "semanticType" : "Measure"
            },{
              "id" : "Popluation",
              "name" : "Popluation",
              "semanticType" : "Measure"
            }]
          },
          "data" : [
              ['China ', 1000000, 1300000000],
              ['USA ', 1200000, 2000000],
              ['Russia', 1100000, 300000],
              ['Australia' , 900000, 50000],
              ['Canada', 700000, 400000]
          ],
          "info" : [{
            "type" : "geo",
            "info" : [
                [{'featureId':'22928332,NAVTEQ'}],
                [{'featureId':'21000001,NAVTEQ'}],
                [{'featureId':'21482883,NAVTEQ'}],
                [{'featureId':'20485579,NAVTEQ'}],
                [{'featureId':'21041602,NAVTEQ'}]
            ]
          }]
        };

        var ds = new sap.viz.api.data.FlatTableDataset(data);

        // specify the feedings.
        var feeding = {
          location : 'Location',
          size : 'GPD',
          color: 'Popluation'
        };

         // create a bubble
        var bubble = new sap.viz.geo.dataviz.Bubble();
        var delJS=['main_size.js'];
        var delCss=['style.css'];
        var delElementById=['setting','code-content','toggle','code'];
        toggleViewExtension("index_size.html","main_size.js",textArea,delJS,delCss,delElementById);
        // create a layer
        var layer = new sap.viz.geo.dataviz.Layer({
          viz : bubble,
          data : ds,
          feeding : feeding
        });

        // add layer
        map.addLayer(layer, true);

    })
    

});
