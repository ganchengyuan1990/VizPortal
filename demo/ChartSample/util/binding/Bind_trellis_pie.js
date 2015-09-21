define(["./../data/Data_trellis_pie"], function(Data_trellis_pie) {
    return {
        generateBinding: function(series, chartPar, codeArea) {
            var binding;
            if (!series) {
                series = "one";
            }
            if (series == "one") {
                binding = [
                  {
                    "feed" : "size",
                    "source" : ["Profit"]
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

                  }];
                Data_trellis_pie.generateData(null, chartPar, codeArea);
            }
            chartPar.stringBinding = JSON.stringify(binding);
            return chartPar.stringBinding;
        }
    };
});
