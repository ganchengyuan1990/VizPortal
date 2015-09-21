define([], function() {
    return {
        generateBinding: function(series, chartPar, codeArea) {
            if (!series) {
                series = "one";
            }
            if (series == "one") {
               var binding = [
                    {
                    'feed' : 'dataFrame',
                    'source' : ['Year']
                },{
                    'feed' : 'text',
                    'source' : ['Country']
                }, {
                    'feed' : 'weight',
                    'source' : ['Cost']
                }, {
                    'feed' : 'color',
                    'source' : ['Profit']
                }];
            }
            chartPar.stringBinding = JSON.stringify(binding);
            return chartPar.stringBinding;
        }
    };
});
