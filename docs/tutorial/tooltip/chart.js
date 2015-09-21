/* 
 * This is a class of user-defined tooltip
 */

var MyTooltip = (function($) {
    var MyTooltip = function() {
        this._rootNode = undefined;
        this._mode = undefined;
    };
    var mp = MyTooltip.prototype;
    mp.showDetail = function(options) {
        if (!this._rootNode) {
            this._rootNode = $("#myTooltip");
        }
        this._mode = options.mode;
        //update content
        this._rootNode.find(".summary .number").text(options.selectedNumber);
        this._rootNode.find(".mode").text(options.mode);
        var dataNode = this._rootNode.find(".data");
        dataNode.find(".datum").remove();
        if (options.data && options.data.length) {
            for (var i = -1; ++i < options.data.length;) {
                var item = options.data[i];
                var itemNode = $("<div class='datum'><span class='key'>" + item.name + "</span><span class='value'>" + item.value + "</span></div").appendTo(dataNode);
                if (item.type === 'measure') {
                    itemNode.find('.value').css("text-decoration", "underline");
                }
            }
        }
        //show it
        this._rootNode.css({
            "display": "block",
            "border-style": options.mode === "infoMode" ? "dotted" : "solid",
            "left": options.position.x + 4,
            "bottom": $(document).height() - options.position.y + 4 //let tooltip showing above mouse point
        });
    };
    mp.hideDetail = function(mode) {
        if (this._rootNode && mode === this._mode) {
            this._rootNode.css("display", "none");
            return true;
        }
    };

    return MyTooltip;
})(jQuery);

var myTooltip = new MyTooltip();
$(function() {
    var chartOption = {
        plotArea: {
            //'colorPalette' : d3.scale.category20().range()
        },
        title: {
            visible: true,
            text: 'Sample Bar Chart Title'
        },
        interaction: {
            'decorations': [{
                'name': 'showDetail',
                'fn': myTooltip.showDetail
            }, {
                'name': 'hideDetail',
                'fn': myTooltip.hideDetail
            }]
        }
    };

    var FlatTableData = {
        "metadata": {
            "fields": [{
                "id": "Country",
                "name": "Country",
                "semanticType": "Dimension",
                "dataType": "String"
            }, {
                "id": "Year",
                "name": "Year",
                "semanticType": "Dimension",
                "dataType": "String"
            }, {
                "id": "Product",
                "name": "Product",
                "semanticType": "Dimension",
                "dataType": "String"
            }, {
                "id": "Profit",
                "name": "Profit",
                "semanticType": "Measure",
                "dataType": "Number"
            }, {
                "id": "Revenue",
                "name": "Revenue",
                "semanticType": "Measure",
                "dataType": "Number"
            }]
        },
        "data": [
            ["China", "2001", "Car", 1500.23, 500],
            ["China", "2001", "Truck", 159.0121212, 300.1212],
            ["China", "2001", "Motorcycle", 129.21, 229.545],
            ["China", "2002", "Car", 136.1245, 272],
            ["China", "2002", "Truck", 147, 247],
            ["China", "2002", "Motorcycle", 47, 147],
            ["USA", "2001", "Car", 58, 116],
            ["USA", "2001", "Truck", 149, 249],
            ["USA", "2001", "Motorcycle", 49, 149],
            ["USA", "2002", "Car", 128.747, 256],
            ["USA", "2002", "Truck", 269, 369.124],
            ["USA", "2002", "Motorcycle", 69, 169],
            ["Canada", "2001", "Car", 58, 116],
            ["Canada", "2001", "Truck", 38, 68],
            ["Canada", "2001", "Motorcycle", 33, 133],
            ["Canada", "2002", "Car", 24, 48],
            ["Canada", "2002", "Truck", 97, 197],
            ["Canada", "2002", "Motorcycle", 47, 147]
        ]
    };

    var ds = new sap.viz.api.data.FlatTableDataset();
    ds.data(FlatTableData);

    binding = [{
        "feed": "valueAxis",
        "source": ["Profit", "Revenue"]
    }, {
        "feed": "color",
        "source": [{
                "measureNames": ["valueAxis"]
            },
            "Product"
        ]
    }, {
        "feed": "categoryAxis",
        "source": ["Country", "Year"]
    }];

    $('#chart').empty();
    if (barChart) {
        barChart.destroy();
        barChart = undefined;
    }

    //TODO How to define feeding API?
    var barChart = sap.viz.api.core.createViz({
        type: 'info/bar',
        data: ds,
        container: $('#chart'),
        options: chartOption,
        bindings: binding
    });

    barChart.on('selectData', function() {
        // Do something cool
    });
});