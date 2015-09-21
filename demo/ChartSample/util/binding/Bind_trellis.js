define(["./../data/Data_trellis"], function(Data_trellis) {
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
                    "feed" : "categoryAxis",
                    "source" : ["Product"]
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
                    "source" : ["Month"]

                  }];
                Data_trellis.generateData(null, chartPar, codeArea);
            }
            chartPar.stringBinding = JSON.stringify(binding);
            return chartPar.stringBinding;
        }
    };
});
