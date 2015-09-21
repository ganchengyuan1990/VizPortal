define(["./../data/Data_bubble"], function(Data_bubble) {
    return {
        generateBinding: function(series, chartPar, codeArea) {
            var binding;
            if (!series) {
                series = "one";
            }
            if (series == "one") {
                chartPar.series="one";
                binding = [
                   {
                      "feed" : "valueAxis",
                      "source" : ["Profit"]
                   },
                   {
                      "feed" : "valueAxis2",
                      "source" : ["Revenue"]
                   }, 
                   {
                      "feed" : "bubbleWidth",
                      "source" : ["Revenue2"]
                   }, 
                   {
                      "feed" : "color",
                      "source" : ["Country" ]
                   } 
                ];
                Data_bubble.generateData(null,chartPar,codeArea);
            }
             if (series == "two") {
               chartPar.series="two";
                binding = [
                   {
                      "feed" : "valueAxis",
                      "source" : ["Profit"]
                   },
                   {
                      "feed" : "valueAxis2",
                      "source" : ["Revenue"]
                   }, 
                   {
                      "feed" : "bubbleWidth",
                      "source" : ["Revenue2"]
                   }, 
                   {
                      "feed" : "color",
                      "source" : ["Country" ]
                   } 
                ];
                Data_bubble.generateData(null,chartPar,codeArea);
            }
            chartPar.stringBinding = JSON.stringify(binding);
            return chartPar.stringBinding;
        }
    };
});
