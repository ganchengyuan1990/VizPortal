/*global clearInterval,setInterval,document,parseInt*/
define("sap_viz_ext_gauge-src/js/render", ["sap_viz_ext_gauge-src/js/utils/util"], function(util){
    /*
     * This function is a drawing function; you should put all your drawing logic in it.
     * it,s called in moduleFunc.prototype.render
     * @param {Object} data - proceessed dataset, check dataMapping.js
     * @param {Object} container - the target DOM element (SVG or DIV) of plot area
     * @example
     *   container size:     this.width() or this.height()
     *   container id:       container.node()
     *   dimensions info:    data.meta.dimensions()
     *   measures info:      data.meta.measures()
     */
    var render = function(data, container, dispatch) {
        var width = this.width(),
            height = this.height();
        // data preparation
        var mset1 = data.meta.measures(0);
        var dset1 = data.meta.dimensions(0);
        var mset2 = data.meta.measures(1);

        var descriptions = [];
        var parts = [];
        var totals = [];
        for (var i = 0; i < dset1.length; i++) {
            for (var j = 0; j < data.length; j++) {
                if (i > 0) {
                    descriptions[j] += ' / ' + data[j][dset1[0]];
                } else {
                    descriptions[j] = data[j][dset1[0]];
                    descriptions[j] = getTranslations(descriptions[j]);
                }
            }
        }
        
        for (var m = 0; m < data.length; m++) {
            parts[m] = data[m][mset1[0]];
            totals[m] = data[m][mset2[0]];
        }

        var gaugesCount = Math.min(parts.length, 9);
        var isPercent = [];
        var finalDegrees = [];
        var degrees = [];
        for (i = 0; i < gaugesCount; i++) {
            finalDegrees.push(parts[i] / totals[i] * 360);
            degrees.push(Math.max(360, parts[i] / totals[i] * 360));
            isPercent.push(true);
        }
        var diameter = Math.min(300, width / 3, height / 3);
        // calculate each gauge's layout
        var calculateLayout = function(index, count) {
            var ret = {};
            switch (count) {
                case 1:
                    {
                        ret.left = width / 2 - diameter / 2;
                        ret.top = height / 2 - diameter / 2;
                        break;
                    }
                case 2:
                    {
                        ret.left = width / 2 - (diameter * (1 - index));
                        ret.top = height / 2 - diameter / 2;
                        break;
                    }
                case 3:
                    {
                        ret.left = width / 2 - 1.5 * diameter + i * diameter;
                        ret.top = height / 2 - diameter / 2;
                        break;
                    }
                case 4:
                    {
                        ret.left = width / 2 - (diameter * (1 - index % 2));
                        ret.top = height / 2 - (index < 2 ? diameter : 0);
                        break;
                    }
                default:
                    {
                        ret.left = width / 2 - (diameter * (1.5 - index % 3));
                        ret.top = height / 2 - (index < 3 ? 1.5 * diameter : (index < 6 ? diameter / 2 : -diameter / 2));
                        break;
                    }
            }

            return ret;
        };
        // display gauge's shape
        var dispalyShape = function(i, ctx, color) {
            ctx.clearRect(0, 0, diameter, diameter);
            // draw background
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(191,191,191, 0.3)';
            ctx.lineWidth = diameter / 3;
            ctx.arc(diameter / 2, diameter / 2, diameter / 6, 0, Math.PI * 2, false);
            ctx.stroke();

            ctx.beginPath();
            ctx.strokeStyle = 'rgba(191,191,191, 1)';
            ctx.lineWidth = diameter / 12 * 0.7;
            ctx.arc(diameter / 2, diameter / 2, diameter / 3, 0, Math.PI * 2, false);
            ctx.stroke();


            // draw proportion arc
            var radians = Math.min(Math.max(degrees[i], 0), 360) * Math.PI / 180;

            ctx.beginPath();
            ctx.strokeStyle = 'rgba(' + color.r + ',' + color.g + ',' + color.b + ', 0.2)';
            ctx.lineWidth = diameter / 3;
            ctx.arc(diameter / 2, diameter / 2, diameter / 6, 0 - 90 * Math.PI / 180, -radians - 90 * Math.PI / 180, true);
            ctx.stroke();

            ctx.beginPath();
            ctx.strokeStyle = 'rgba(' + color.r + ',' + color.g + ',' + color.b + ', 1)';
            ctx.lineWidth = diameter / 12;
            ctx.arc(diameter / 2, diameter / 2, diameter / 3, 0 - 90 * Math.PI / 180, -radians - 90 * Math.PI / 180, true);
            ctx.stroke();

        };
        // displaypercentage for each gauge
        var displayPercentage = function(i, ctx, color, textColor) {
            dispalyShape(i, ctx, color);

            // draw percentage text
            ctx.fillStyle = 'rgba(' + textColor.r + ',' + textColor.g + ',' + textColor.b + ', 1)';
            ctx.font = diameter / 7 + "px arial";
            var percent = degrees[i] / 360 * 100;
            var text = percent.toFixed(1);
            var text_width = ctx.measureText(text).width;
            ctx.fillText(text, diameter / 2 - text_width / 2, diameter / 2 + diameter / 20);

            ctx.font = diameter / 14 + "px arial";
            ctx.fillText('%', diameter / 2 + text_width / 2, diameter / 2 + diameter / 20);
        };
        // displayActualData for each gauge
        var displayActualData = function(i, ctx, color, textColor) {
            dispalyShape(i, ctx, color);

            // draw actual data text
            ctx.fillStyle = 'rgba(' + textColor.r + ',' + textColor.g + ',' + textColor.b + ', 1)';
            ctx.font = diameter / 7 + "px arial";
            var text = parts[i];
            var text_width = ctx.measureText(text).width;
            ctx.fillText(text, diameter / 2 - text_width / 2, diameter / 2 + diameter / 20);

            ctx.fillStyle = '#404040';
            ctx.font = diameter / 14 + "px arial";
            text = totals[i];
            text_width = ctx.measureText(text).width;
            ctx.fillText(text, diameter / 2 - text_width / 2, diameter / 2 + diameter / 20 * 2.5);
        };
        // calculate arc color
        var calculateColor = function(degree) {
            var per = degree / 360;
            var ret = {};
            if (per > 0.3) {
                ret.r = 41;
                ret.g = 124;
                ret.b = 190;
            } else if (per > 0.1) {
                ret.r = 255;
                ret.g = 192;
                ret.b = 0;
            } else {
                ret.r = 192;
                ret.g = 0;
                ret.b = 0;
            }
            return ret;
        };
        // calculate text color (little different from arc color)
        var calculateTextColor = function(degree) {
            var per = degree / 360;
            var ret = {};
            if (per > 0.3) {
                ret.r = 41;
                ret.g = 124;
                ret.b = 190;
            } else if (per > 0.1) {
                ret.r = 228;
                ret.g = 108;
                ret.b = 10;
            } else {
                ret.r = 154;
                ret.g = 0;
                ret.b = 0;
            }
            return ret;
        };
        // draw each gauge
        var draw = function(i, ctx, animation_loop, renderComplete) {
            if (typeof animation_loop !== undefined) {
                clearInterval(animation_loop);
            }
            var animate_to = function() {
                if (degrees[i] <= finalDegrees[i]) {
                    clearInterval(animation_loop);
                    renderComplete();
                } else if (degrees[i] > finalDegrees[i]) {
                    degrees[i]--;
                }
                var color = calculateColor(degrees[i]);
                var textColor = calculateTextColor(degrees[i]);
                displayPercentage(i, ctx, color, textColor);
            };
            animation_loop = setInterval(animate_to, 1);
        };
        // add gauge for each pair of data
        var appendGauge = function(i, count, renderComplete) {
            var layout = calculateLayout(i, count);

            // start rendering each gauge based on div not svg
            var div = container.append('div')
                .style('position', 'absolute')
                .style('left', layout.left + 'px')
                .style('top', layout.top + 'px');

            // we use canvas to display data in this example
            var canvas = document.createElement('canvas');
            // append canvas into div
            div[0][0].appendChild(canvas);
            canvas.width = diameter;
            canvas.height = diameter;
            canvas.id = 'gauge' + i;
            var ctx = canvas.getContext("2d");
            var animation_loop;
            var fontSize = diameter / 15;
            // use dimension values
            var description = div.append('text')
                .text(descriptions[i])
                .attr('style', 'font-family:Arial;color:#404040;position:absolute;')
                .style('font-size', fontSize + 'px')
                .style('left', 0)
                .style('top', canvas.height - fontSize * 1.5 + 'px')
                .style('text-align', 'center')
                .style('width', diameter + 'px')
                .style('word-wrap', 'break-word');
            draw(i, ctx, animation_loop, renderComplete);
            // add click event listener
            canvas.addEventListener('click', function(e, a, d) {

                var index = parseInt(this.id.substring(this.id.length - 1), 10);
                var color = calculateColor(degrees[index]);
                var textColor = calculateTextColor(degrees[index]);
                if (isPercent[index]) {
                    displayActualData(index, ctx, color, textColor);
                } else {
                    displayPercentage(index, ctx, color, textColor);
                }
                isPercent[index] = !isPercent[index];
            });
        };

        
        function getTranslations(index){
            var translation = sap.viz.extapi.env.Language.getResourceString(index);
            if(translation === ""){
                return index;
            }
            else{
                return translation;
            } 
        };
        
        var count=0;
        
        function renderComplete(){
            count++;
            if(count>=gaugesCount && dispatch){
                dispatch.initialized({
                    name: "initialized"
                });
            }
            
        };
        
        for (i = 0; i < gaugesCount; i++) {
            appendGauge(i, gaugesCount, renderComplete);
        }

    };

    return render; 
});