define(["./../../js/JSONOperator", "./../../dataset/hichert_stacked_bar"], function(JSONOperator, hichert_stacked_bar) {
    return {
        generateData: function(dataset, chartPar, codeArea) {
            // if (chartPar.series = "one") {
                var data = {
                    'metadata': {
                        'fields': [
                        {
                        	"id":"Country",
                        	"name":"Country",
                        	"semanticType":"Dimension",
                        	"dataType":"String"
                        },
                        {
                        	"id":"Product",
                       	 	"name":"Product",
                       	 	"semanticType":"Dimension",
                        	"dataType":"String"
                    	},
                    	{
                    		"id":"Value",
                    		"name":"Value",
                    		"semanticType":"Measure",
                    		"dataType":"Number"
                    	}]
                    },
                    'data': null
                };
                if (!dataset) {
                    dataset = chartPar.dataset;
                    if (!chartPar.dataset) {
                        dataset = 'M';
                    }   
                }
                if (dataset == "S") {
                    data.data = JSONOperator.getDataset(hichert_stacked_bar, 10);
                    chartPar.dataset = "S";
                }
                if (dataset == "M") {
                    data.data = JSONOperator.getDataset(hichert_stacked_bar, 20);
                    chartPar.dataset = "M";
                }
                if (dataset == "L") {
                    data.data = JSONOperator.getDataset(hichert_stacked_bar, 40);
                    chartPar.dataset = "L";
                }
                chartPar.stringData = JSON.stringify(data);
                return chartPar.stringData;
            // }
        }
    };
});