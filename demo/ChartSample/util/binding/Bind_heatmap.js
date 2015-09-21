define(["./../data/Data_rev_mon"], function(Data_rev_mon) {
    return {
        generateBinding: function(series, chartPar, codeArea) {
            var binding;
            if (!series) {
                series = "one";
            }
            if (series == "one") {
              chartPar.series= "one";
                binding = [
                  {
                    "feed" : "color",
                    "source" : ["Revenue"]
                  },{
                    "feed" : "categoryAxis",
                    "source" : ["Store Name"]
                  }
                ];
                Data_rev_mon.generateData(null,chartPar,codeArea);
            }
            if (series == "two") {
              chartPar.series="two";
                 binding = [
                  {
                    "feed" : "color",
                    "source" : ["Revenue"]
                  },{
                    "feed" : "categoryAxis",
                    "source" : ["Store Name"]
                  },{
                    "feed": "categoryAxis2",
                    "source": ["Month"]
                  }
                ];
                Data_rev_mon.generateData(null,chartPar,codeArea);
            }
            chartPar.stringBinding = JSON.stringify(binding);
            return chartPar.stringBinding;
        }
    };
});
