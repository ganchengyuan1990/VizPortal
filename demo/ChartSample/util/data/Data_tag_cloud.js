define(["./../../js/JSONOperator", "./../../dataset/tag_cloud"], function(JSONOperator, tag_cloud) {
    return {
        generateData: function(dataset, chartPar, codeArea) {
            var data = {
                "metadata": {
                    "fields": [{
                    'id' : 'Country', 'name' : 'Country', 'semanticType' : 'Dimension', 'dataType' : 'String'}, {
                    'id' : 'Year', 'name' : 'Year', 'semanticType' : 'Dimension', 'dataType' : 'String'}, {
                    'id' : 'Cost', 'name' : 'Cost', 'semanticType' : 'Measure', 'dataType' : 'Number'}, {
                    'id' : 'Profit', 'name' : 'Profit', 'semanticType' : 'Measure', 'dataType' : 'Number'}]},
               'data': null
            };
            if (!dataset) {
                dataset = 'M';
            }
            if (dataset == "S") {
                data.data = JSONOperator.getDataset(tag_cloud, 10);
            }
            if (dataset == "M") {
                data.data = JSONOperator.getDataset(tag_cloud,15);
            }
            if (dataset == "L") {
                data.data = JSONOperator.getDataset(tag_cloud, 21);
            }
            chartPar.stringData = JSON.stringify(data);
            return chartPar.stringData;
        }
    };
});