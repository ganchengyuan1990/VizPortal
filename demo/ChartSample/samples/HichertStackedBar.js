define(["./../util/data/Data_hichert_stacked_bar", "./../util/binding/Bind_hichert_stacked_bar", "./../util/property/Common_Property"], function(Data, Binding, Property) {
    return {
        generateData: function(dataset, chartPar, codeArea) {
            Data.generateData(dataset, chartPar, codeArea);
            return chartPar.stringData;
        },

        generateBinding: function(series, chartPar, codeArea) {
            Binding.generateBinding(series, chartPar, codeArea);
            return chartPar.stringBinding;
        },

        generateChartOption: function(property, chartPar, codeArea, chart) {
            Property.generateChartOption(property, chartPar, codeArea, chart);
            return chartPar.stringChartOption;
        }
    };
});