define([], function() {
    return {
        generateBinding: function(series, chartPar, codeArea) {
            if (!series) {
                series = "one";
            }
            if (series == "one") {
            var binding = [{
                'feed' : 'valueAxis',
                'source' : ['Profit']
            },
            {
                'feed' : 'categoryAxis',
                'source' : ['Country']
            }, 
            {
                'feed' : 'waterfallType',
                'source' : ['Product']
            }
            , 
            {
                'feed' : 'color',
                'source' : ['Year']
            }];
            }
            chartPar.stringBinding = JSON.stringify(binding);
            return chartPar.stringBinding;
        }
    };
});