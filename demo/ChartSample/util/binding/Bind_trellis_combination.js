define(["./../data/Data_trellis_combination"],function(Data_trellis_combination){
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
                    "source" : ["Profit","Revenue"]
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
                    "source" : ["Month",{"measureNames" : ["valueAxis"]}]

                  }];
                Data_trellis_combination.generateData(null, chartPar, codeArea);
            }
            chartPar.stringBinding = JSON.stringify(binding);
            return chartPar.stringBinding;
        }
    };
});