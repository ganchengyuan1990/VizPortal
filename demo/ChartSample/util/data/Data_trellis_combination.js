define(["./../../js/JSONOperator", "./../../dataset/trellis_combination"], function(JSONOperator, trellis_combination) {
    return {
        generateData: function(dataset, chartPar, codeArea) {
            if (chartPar.series = "one") {
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
                        	"id":"Year",
                        	"name":"Year",
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
                    		"id":"Month",
                    		"name":"Month",
                    		"semanticType":"Dimension",
                    		"dataType":"String"
                    	},
                    	{
                    		"id":"Profit",
                    		"name":"Profit",
                    		"semanticType":"Measure",
                    		"dataType":"Number"
                    	},
                        {
                            "id":"Revenue",
                            "name":"Revenue",
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
                    data.data = JSONOperator.getDataset(trellis_combination, 5);
                    chartPar.dataset = "S";
                }
                if (dataset == "M") {
                    data.data = JSONOperator.getDataset(trellis_combination, 10);
                    chartPar.dataset = "M";
                }
                if (dataset == "L") {
                    data.data = JSONOperator.getDataset(trellis_combination, 50);
                    chartPar.dataset = "L";
                }
                chartPar.stringData = JSON.stringify(data);
                return chartPar.stringData;
            }
        }
    };
});
