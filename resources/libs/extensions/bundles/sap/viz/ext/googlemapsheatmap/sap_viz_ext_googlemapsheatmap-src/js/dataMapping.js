/*<<dependency*/
define("sap_viz_ext_googlemapsheatmap-src/js/dataMapping", ["sap_viz_ext_googlemapsheatmap-src/js/utils/util"], function(util){
/*dependency>>*/
    var processData = function(data, feeds, done) {
        // Build name index so that dimension/measure sets can be accessed by name
        util.buildNameIdx(feeds);
        /**
         * mapper function is optional and used to customize your data conversion logic, for example, 
         * you can map from object array to a simplified x-y value array as below, 
         *
         *     var mapper = function(d, meta) {
         *         var val = parseFloat(d[meta.measures(0, 0)]);
         *         mems = [];
         *         $.each(meta.dimensions(), function(idx, dim) {
         *             mems.push(d[dim]);
         *        });
         *       return [mems.join(" / "), val];
         *     }
         */
        var mapper = function(d, meta) {
            return d;
        };
        // convert data into an object array, which is compatible to the return of
        // d3.csv() by default. Each data row is converted into attributes of an object.
        util.toTable(data, mapper, function(err, pData) {
            if(err) {
                return done(err, null);
            } else if(!pData) {
                return done('Empty data', null);
            }
            
            // delete if any data is not number  
            for(var i = 0; i < pData.length; i++){
                if(pData[i].Dimension && isNaN(pData[i].Dimension)){
                    for(var j = 0; j < pData.length; j++){
                        delete pData[j];
                    }
                    pData.length = 0;
                }
                if((pData.length!== 0) && (!(pData[i].LATITUDE && pData[i].LONGITUDE))){
                    for(var j = 0; j < pData.length; j++){
                        delete pData[j];
                    }
                    pData.length = 0;
                }
                    
                
            }
            
            return done(null, pData);
        });
    };
    return processData;
});