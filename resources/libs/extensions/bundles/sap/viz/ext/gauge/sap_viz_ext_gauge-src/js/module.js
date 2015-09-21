/*global navigator,document,XMLSerializer*/
define("sap_viz_ext_gauge-src/js/module", ["sap_viz_ext_gauge-src/js/render", "sap_viz_ext_gauge-src/js/dataMapping"], function(render, processData) {
    var moduleFunc = {
        _colorPalette: d3.scale.category20().range().concat(d3.scale.category20b().range()).concat(d3.scale.category20c().range()), // color palette used by chart
        _dispatch: d3.dispatch("initialized", "startToInit", 'barData') //event dispatcher
    };

    moduleFunc.dispatch = function(_) {
        if (!arguments.length) {
            return this._dispatch;
        }
        this._dispatch = _;
        return this;
    };

    /*
     * function of drawing chart
     */
    moduleFunc.render = function(selection) {
        this._selection = selection;
        //add xml ns for root svg element, so the image element can be exported to canvas
        $(selection.node().parentNode.parentNode).attr("xmlns:xlink", "http://www.w3.org/1999/xlink");

        var that = this,
            dispatch = this.dispatch(),
            _data = this.data(),
            _feeds = this._manifest.feeds;
        dispatch.startToInit();
        selection.each(function() {
            //prepare canvas with width and height of div container
            d3.select(this).selectAll('div.gauge').remove();
            //append 'div' element
            var vis = d3.select(this).append('div').attr('class', 'gauge').attr('width', that.width()).attr('height', that.height());
            
            processData(_data, _feeds, function(err, pData) {
                if(err) {
                    vis.append("text").text(err);
                    return;
                }
            render.call(that, pData, vis, dispatch);
            
           });
        });
    };

    /*
     * get/set your color palette if you support color palette
     */
    moduleFunc.colorPalette = function(_) {
        if (!arguments.length) {
            return this._colorPalette;
        }
        this._colorPalette = _;
        return this;
    };

    /**
     * export current extension to the specified content.
     * @param {Object} options the options for exporting content.
     * @example:
     * {
     *   type: String - current only support "svg".
     *   width: Number - the exported content will be scaled to the specific width.
     *   height: Number - the exported content will be scaled to the specific height.
     * }
     */
    moduleFunc.exportContent = function(options) {
        if (options && options.type !== "svg") {
            return "";
        }

        var svg, svgStr, doc,
            wrapper;

        // scale if necessary
        if (options && options.width && options.height) {
            doc = d3.select('body').append('svg');
            doc.attr("xmlns", "http://www.w3.org/2000/svg");
            doc.attr("xmlns:xmlns:xlink", "http://www.w3.org/1999/xlink");
            doc.attr("width", options.width);
            doc.attr("height", options.height);
            doc.attr("viewBox", "0 0 " + this._width + " " + this._height);
            svg = doc.append('svg').
            attr("width", this._width).attr("height", this._height);
        } else {
            doc = d3.select('body').append('svg').attr("xmlns", "http://www.w3.org/2000/svg").
            attr("width", this._width).attr("height", this._height);
            svg = doc;
        }

        // wrapper = svg.append("foreignObject").attr("width", this._width).attr("height", this._height).append("xhtml:body");
        wrapper = svg.append("g");
        wrapper.append('rect').attr("width", this._width).attr("height", this._height).attr("fill-opacity", 0);

        // get image url from the raw canvas element
        this._selection.selectAll(".gauge div").each(function(data, i) {
            var div = d3.select(this), 
                canvas = div.select('canvas'),
                text = div.select('text'),
                url = canvas.node().toDataURL(),
                gauge = wrapper.append('g').style('-webkit-transform', 'translate(' + div.style('left') + ',' + div.style('top') + ')');

            // use xlink:href to embed dataUrl image
            gauge.append("image").attr('width', canvas.style('width')).attr('height', canvas.style('height'))
                .attr('preserveAspectRatio', 'xMinYMin meet').attr('xlink:href', url);
        });

        try {
            svgStr = new XMLSerializer().serializeToString(doc.node());
        } catch (e) {}

        // remove the cloned node
        doc.remove();

        return svgStr;
    };

    /**
     * determine if the extension support to be exported to the specific <param>contentType</param>, e.g. "svg" or "png"
     * @param {String} contentType the content type to be exported to.
     */
    moduleFunc.supportExportToContentType = function(contentType) {
        return contentType === "svg";
    };

    return moduleFunc;
});