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

        var countries = [{
                name: "China",
                url: "../resources/img/cn.png",
                featureId: "22928332,NAVTEQ"
            },{
                name: "Brazil",
                url: "../resources/img/br.png",
                featureId: "23028911,NAVTEQ"
            },{
                name: "Germany",
                url: "../resources/img/de.png",
                featureId: "20147700,NAVTEQ"
            },{
                name: "France",
                url: "../resources/img/fr.png",
                featureId: "20000001,NAVTEQ"
            },{
                name: "United Kingdom",
                url: "../resources/img/gb.png",
                featureId: "UK,NAVTEQ"
            },{
                name: "India",
                url: "../resources/img/in.png",
                featureId: "22806254,NAVTEQ"
            },{
                name: "United States",
                url: "../resources/img/us.png",
                featureId: "21000001,NAVTEQ"
            },{
                name: "South Korea",
                url: "../resources/img/kr.png",
                featureId: "22928340,NAVTEQ"
            },{
                name: "Japan",
                url: "../resources/img/jp.png",
                featureId: "22928357,NAVTEQ"
            }];

        for(var i =0 ; i < countries.length ; i++){
             // prepare data
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
                    [countries[i].name],

                ],
                "info" : [{
                  "type" : "geo",
                  "info" : [
                      [{'featureId':countries[i].featureId}]
                  ]
                }]
              };

              var ds = new sap.viz.api.data.FlatTableDataset(data);

              // specify the feedings.
              var feeding = {
                location : 'Location',
              };

               // create a marker
              var marker = new sap.viz.geo.dataviz.Marker({
                  url: countries[i].url,
                  highlightUrl: countries[i].url,
                  width: 16,
                  height:11
              });
              

              // create a layer
              var layer = new sap.viz.geo.dataviz.Layer({
                viz : marker,
                data : ds,
                feeding : feeding,
                legendVisible: false
              });

              // add layer
              map.addLayer(layer, true);

        }
        var delJS=['main_image.js'];
        var delCss=['style.css'];
        var delElementById=['setting','code-content','toggle','code'];
        toggleViewExtension("index_image.html","main_image.js",textArea,delJS,delCss,delElementById);
    })
    

});
