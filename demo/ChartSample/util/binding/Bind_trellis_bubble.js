define(["./../data/Data_trellis_bubble"], function(Data_trellis_bubble) {
    return {
        generateBinding: function(series, chartPar, codeArea) {
            var binding;
            if (!series) {
                series = "one";
            }
            if (series == "one") {
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
                    "source" :["Tax"],
                  },
                  {
                    "feed" : "trellisColumn",
                    "source" : ["Country"]
                  },
                  {
                    "feed" : "trellisRow",
                    "source" : ["Year"]
                  },
                  {
                    "feed" : "color",
                    "source" : ["Product"]

                  },
                  {
                    "feed" : "shape",
                    "source" : ["Month"]
                  }];
                Data_trellis_bubble.generateData(null, chartPar, codeArea);
            }
            chartPar.stringBinding = JSON.stringify(binding);
            return chartPar.stringBinding;
        }
    };
});
