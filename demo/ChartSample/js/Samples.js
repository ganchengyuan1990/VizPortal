define(["./../config/chartSamples",
        "./JSONOperator",
        "./../samples/Bar", 
        "./../samples/BarDual", 
        "./../samples/Column", 
        "./../samples/ColumnDual", 
        "./../samples/BarStacked", 
        "./../samples/ColumnStacked", 
        "./../samples/Line",
        "./../samples/LineDual",
        "./../samples/LineTimeSeries",
        "./../samples/Bubble",
        "./../samples/BubbleScatter",
        "./../samples/Pie",
        "./../samples/Donut",
        "./../samples/Combination",
        "./../samples/CombinationBar",
        "./../samples/CombinationStackedBar",
        "./../samples/CombinationStackedColumn",
        "./../samples/BulletVertical",
        "./../samples/Bullet",
        "./../samples/TreeMap",
        "./../samples/HeatMap",
        "./../samples/Mekko",
        "./../samples/Area",
        "./../samples/AreaHorizontal",
        "./../samples/PersentArea",
        "./../samples/Trellis",
        "./../samples/TrellisStacked",
        "./../samples/TrellisLine",
        "./../samples/TrellisPie",
        "./../samples/TrellisDonut",
        "./../samples/TrellisCombination",
        "./../samples/TrellisHorzComb",
        "./../samples/TrellisBubble",
        "./../samples/TrellisScatter",
        "./../samples/TrellisArea",
        "./../samples/Numeric",
        "./../samples/Tagcloud",
        "./../samples/Waterfall",
        "./../samples/StackedWaterfall",
        "./../samples/HorizontalWaterfall",
        "./../samples/HorizontalStackedWaterfall",
        "./../samples/Radar",
        "./../samples/HichertStackedBar",
        "./../samples/HichertStackedColumn",
        "./../samples/HichertBar",
        "./../samples/HichertColumn",
        "./../samples/HichertVarianceLine",
        "./../samples/HichertLine"
        ], 
    function(chartSamples) {
        var args = arguments;
        var SAMPLES = {};
        var samples = {
            registerSample: function(sample, index) {
                SAMPLES[chartSamples[index-2].id] = sample;
            },

            getSample: function(chartId) {
                if (chartId == "info/100_stacked_bar" || chartId == "info/100_stacked_column" || chartId == "info/100_mekko"|| chartId== "info/100_area") { // 100_stacked shared same data and binding as stacked
                    chartId = "info/" + chartId.slice(9);
                }
                return SAMPLES[chartId]
            }
        };
        
        for (var i = 2; i < args.length; i++) {
            samples.registerSample(args[i], i)
        }
        return samples;
});
