define([], function() {
    return {
        findById: function(source, id) {
            if (id == "info/100_stacked_bar" || id == "info/100_stacked_column" || id == "info/100_mekko"||id=="info/100_area") { // 100_stacked shared same data and binding as stacked
                    id = "info/" + id.slice(9);
                }
            for (var i = 0; i < source.length; i++) {
                if (source[i].id === id) {
                    return source[i];
                }
            }
        },

        findOrder: function(source, id) {
            for (var i = 0; i < source.length; i++) {
                if (source[i].id === id) {
                    return i;
                }
            }
        },

        getDataset: function(source, length) {
            var dataArray = [];
            for (var i = 0; i < length; i++) {
                dataArray.push(source[i]);
            }
            return dataArray;
        },

        getDataset2: function(source, length) {
            var dataArray = [];
            for (var i = 0; i < length; i++) {
                dataArray.push(source[i]);
            }
            for (var j = 50; j < 50+length; j++) {
                dataArray.push(source[j]);
            }
            return dataArray;
        },
        getTwoSeriesDataset: function(source, length,halfLength) {
            var dataArray = [];
            for (var i = 0; i < length; i++) {
                dataArray.push(source[i]);
            }
            for (var j = halfLength; j < halfLength+length; j++) {
                dataArray.push(source[j]);
            }
            return dataArray;
        },

        getBulletDatasetHalf: function(source, length) {
            var dataArray = [];
            for (var i = 0; i < length; i++) {
                var actualData = [];
                for (var j = 0; j < 5; j++) {
                    actualData.push(source[i][j]);
                }
                dataArray.push(actualData)
            }
            return dataArray;
        },

        getSelectedData: function(source, length, targetArray) {
            var dataArray = [];
            for (var i = 0; i < length; i++) {
                var actualData = [];
                for (var j = 0; j < targetArray.length; j++) {
                    actualData.push(source[i][targetArray[j]]);
                }
                dataArray.push(actualData);
            }
            return dataArray;
        }
    };
});
