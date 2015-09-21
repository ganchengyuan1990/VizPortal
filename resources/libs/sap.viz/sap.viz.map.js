if (requirejs && requirejs.s && requirejs.s.contexts && requirejs.s.contexts._) {
    window.__sap_viz_internal_requirejs_nextTick__ = requirejs.s.contexts._.nextTick;
    requirejs.s.contexts._.nextTick = function(fn) {fn();};
}
//ESRI require configuration. 
//To use esri api by require js, we need to :
//1 use dojo in googleapis.
//2 include dojo.has.js in //tp/tp.dojo.toolkit/1.9.0/REL/js/dojo/dojo.has.js
if(require && require.config){
   require.config({
    paths : {
      "esri" : "//js.arcgis.com/3.8/js/esri",
      "dojo" : "//ajax.googleapis.com/ajax/libs/dojo/1.9.0/dojo",
      "dojox" : "//js.arcgis.com/3.8/js/dojo/dojox",
      "dijit" : "//js.arcgis.com/3.8/js/dojo/dijit" 
    }
   });
}
/*
 * 1. Make every AMD module exports itself.
 * 2. Every module stays anonymous until they are required.
 * 3. "Exporting" includes global namespace setup and auto loading.
 * 4. The trick must work for any valid AMD loader.
 */
(function(global){
    var ostring = Object.prototype.toString;
    function isFunction(it) {
        return ostring.call(it) === '[object Function]';
    }

    function isArray(it) {
        return ostring.call(it) === '[object Array]';
    }

    function mixin(target, src) {
        for(var prop in src){
            if(src.hasOwnProperty(prop)){
                target[prop] = src[prop];
            }
        }
        if(isFunction(target) && isFunction(src)){
            target = src;
        }
        return target;
    }

    function exportNamespace(id, mod){
        for(var i = 0,
                nameParts = id.split("/"),
                p = global,
                c;
            c = nameParts[i]; ++i){

            if(i < nameParts.length - 1){
                p[c] = p[c] || {};
            }else{
                p[c] = p[c] ? mixin(p[c], mod) : mod;
            }
            p = p[c];
        }
    }

    if(define && define.amd && !define.__exportNS){
        var originalDefine = define;
        define = function(name, deps, callback){
            if(typeof name !== 'string'){
                callback = deps;
                deps = name;
                name = null;
            }
            if(!isArray(deps)){
                callback = deps;
                deps = [];
            }

            var needExport = deps.indexOf('exports') >= 0;
            var needRequire = needExport || deps.indexOf('require') >= 0;
            if(needExport){
                deps.push('module');

                var originalCallback = callback;
                callback = function(){
                    var last = arguments.length - 1;
                    var mod = arguments[last];
                    var result = originalCallback;
                    if(isFunction(originalCallback)){
                        var args = [].slice.apply(arguments, [0, last]);
                        result = originalCallback.apply(this, args);
                    }
                    exportNamespace(mod.id, result);
                    return result;
                };
            }
            if(name && needRequire){
                define.__autoLoad.push(name);
            }

            return name ? originalDefine(name, deps, callback) : originalDefine(deps, callback);
        };
        for(var prop in originalDefine){
            define[prop] = originalDefine[prop];
        }
        define.__exportNS = originalDefine;
        define.__autoLoad = [];
    }
})(this);
define('sap/viz/geo/Constants',{
    CSS_CLASS : {
        ROOT : "geomap",
        MAP_CONTAINER : "mapContainer"
    },
    CHART_TYPE : "viz/geomap"
});
define('sap/viz/geo/Bounds',[
    "exports"
], function() {
    function min(a, b) {
        if (a == null) {
            return b;
        }

        if (b == null) {
            return a;
        }

        return Math.min(a, b);
    }

    function max(a, b) {
        if (a == null) {
            return b;
        }

        if (b == null) {
            return a;
        }

        return Math.max(a, b);
    }

    function minMax(p1, p2, dim) {
        var q1 = [], q2 = [];
        for (var i = 0; i < 2; i++) {
            var arr, fn, arr2;
            if (i === 0) {
                arr = q1;
                fn = min;
            } else {
                arr = q2;
                fn = max;
            }

            for (var j = 0; j < dim; j++) {
                arr[j] = fn(p1[j], p2[j]);
            }
        }

        return [
            q1, q2
        ];
    }

    /**
     * Create a bounding box object.
     *
     * @constructor
     * @alias sap.viz.geo.Bounds
     * @param {Array|Number|sap.viz.geo.Bounds}
     *            [arg0] If it is
     *            <ul>
     *            <li>a number, it means the initial dimension of the bounding
     *            box. If not defined, the default dimension is 2.</li>
     *            <li>a "sap.viz.geo.Bounds" object, it will create a copy of
     *            this bounds object.</li>
     *            <li>an array and there's only one parameter, it should have
     *            2*dimension numbers which are the coordinate values of two
     *            vertexes. And if the second parameter exists, this array will
     *            be treated as one of vertexes.</li>
     *            </ul>
     * @param {Array}
     *            [arg1] the coordinate of the second vertex (longitude and
     *            latitude)
     */
    var Bounds = function() {
        var argLen = arguments.length, dim = 0, min, max, p1, p2;
        if (argLen === 0) {
            dim = 2;
        } else if (argLen === 1) {
            var arg = arguments[0];
            if (Array.isArray(arg)) {
                dim = arg.length / 2;
                p1 = arg.slice(0, dim);
                p2 = arg.slice(dim);
            } else if (arg instanceof Bounds) {
                min = arg.min();
                max = arg.max();
                dim = arg.dimension();
            } else {
                dim = arg;
            }
        } else if (argLen >= 2) {
            p1 = arguments[0];
            p2 = arguments[1];
            dim = p1.length;
        }

        this._dim = dim;

        if (p1 && p2) {
            var result = minMax(p1, p2, dim);
            min = result[0];
            max = result[1];
        }

        this._min = min || [];
        this._max = max || [];
    };

    /**
     * Get/set the minimum coordinate values.
     *
     * @param {Array}
     *            [min] the minimum coordinate values to be set
     * @returns {sap.viz.geo.Bounds|Array} the minimum coordinate
     *          values(getting) or the bounding box object itself(setting)
     */
    Bounds.prototype.min = function(_) {
        if (arguments.length === 0) {
            return this._min;
        }

        this._min = _.slice(0);
        return this;
    };

    /**
     * Get/set the maximum coordinate values.
     *
     * @param {Array}
     *            [max] the maximum coordinate values to be set
     * @returns {sap.viz.geo.Bounds|Array} the maximum coordinate
     *          values(getting) or the bounding box object itself(setting)
     */
    Bounds.prototype.max = function(_) {
        if (arguments.length === 0) {
            return this._max;
        }

        this._max = _.slice(0);
        return this;
    };

    /**
     * Get/set the dimension.
     *
     * @ignore
     * @param {Number}
     *            [dim] the dimension to be set
     * @returns {sap.viz.geo.Bounds|Number} the dimension(getting) or the
     *          bounding box object itself(setting)
     */
    Bounds.prototype.dimension = function(_) {
        if (arguments.length === 0) {
            return this._dim;
        }

        this._dim = _;
        return this;
    };

    /**
     * Calculate the center coordinate values.
     *
     * @ignore
     * @returns {Array}
     */
    Bounds.prototype.getCenter = function() {
        var result = [];
        for (var i = 0, len = this._dim; i < len; i++) {
            result[i] = (this._max[i] + this._min[i]) / 2;
        }
        return result;
    };

    /**
     * Calculate the length by given dimension index.
     *
     * @ignore
     * @param {Number}
     *            index the dimension index
     * @returns {Number}
     */
    Bounds.prototype.getLength = function(index) {
        return this._max[index] - this._min[index];
    };

    /**
     * Whether the bounding box contains another given box
     *
     * @ignore
     * @param {sap.viz.geo.Bounds}
     *            box the bounding box to be tested
     * @returns {Boolean}
     */
    Bounds.prototype.contain = function(box) {
        var boxMin = box._min, boxMax = box._max, selfMin = this._min, selfMax = this._max;
        for (var i = 0, len = this._dim; i < len; i++) {
            var minV = boxMin[i], maxV = boxMax[i], selfMinV = selfMin[i], selfMaxV = selfMax[i];
            if (minV < selfMinV || maxV > selfMaxV) {
                return false;
            }
        }
        return true;
    };

    Bounds.prototype.containPoint = function(point) {
        return this.contain(new Bounds(point, point));
    };

    /**
     * Merge given box into this bounding box
     *
     * @ignore
     * @param {sap.viz.geo.Bounds}
     *            box the bounding box to be merged
     *
     * @returns {sap.viz.geo.Bounds} the bounding box object itself
     */
    Bounds.prototype.union = function(box) {
        if (box && box._min.length && box._max.length) {
            var dim = this._dim;
            for (var i = 0; i < 2; i++) {
                var arr, fn, arr2;
                if (i === 0) {
                    arr = this._min;
                    fn = min;
                    arr2 = box.min();
                } else {
                    arr = this._max;
                    fn = max;
                    arr2 = box.max();
                }

                for (var j = 0; j < dim; j++) {
                    arr[j] = fn(arr[j], arr2[j]);
                }
            }
        }
        return this;
    };

    /**
     * Calculate the intersect area of given box and this bounding box
     *
     * @ignore
     * @param {sap.viz.geo.Bounds}
     *            box the bounding box
     *
     * @returns {sap.viz.geo.Bounds} the new intersect bounding box, null if not
     *          intersect
     */
    Bounds.prototype.intersects = function(box) {
        if (box.dimension() !== this._dim) {
            return null;
        } else {
            var minArray = [];
            var maxArray = [];
            for (var i = 0; i < this._dim; i++) {
                var array = [
                    box.max()[i], box.min()[i], this._max[i], this._min[i]
                ];
                array.sort(function(a, b) {
                    return a - b;
                });
                if ((array[2] > box.min()[i] && array[2] > this._min[i]) || array[1] === array[2]) {
                    minArray.push(array[1]);
                    maxArray.push(array[2]);
                } else {
                    return null;
                }
            }
            return new Bounds(minArray, maxArray);
        }
    };

    /**
     * Transform the bounding box with function.
     *
     * @ignore
     * @param {Function}
     *            fn the transform function which accepts an array as input
     *            parameter
     * @param {Object}
     *            [scope] the scope object when calling the function
     * @param {Boolean}
     *            [self] if true, it will change current object
     *
     * @returns {sap.viz.geo.Bounds} or a new bounding box or the bounding box
     *          object itself if "self" is true
     */
    Bounds.prototype.transform = function(fn, scope, self) {
        var p1 = fn.call(scope, this._min), p2 = fn.call(scope, this._max);

        var dim = this._dim, q1 = [], q2 = [];
        for (var i = 0; i < 2; i++) {
            var arr, arr2;
            if (i === 0) {
                arr = q1;
                fn = min;
            } else {
                arr = q2;
                fn = max;
            }

            for (var j = 0; j < dim; j++) {
                arr[j] = fn(p1[j], p2[j]);
            }
        }

        if (!self) {
            return new Bounds(q1, q2);
        }

        this._min = q1;
        this._max = q2;
        return this;
    };

    Bounds.prototype.equal = function(o) {
        var dim = this._dim;
        if (dim !== o._dim) {
            return false;
        }
        for (var i = dim - 1; i >= 0; i--) {
            if (this._min[i] !== o._min[i] || this._max[i] !== o._max[i]) {
                return false;
            }
        }
        return true;
    };

    return Bounds;
});

define('sap/viz/geo/Feature',[
    "sap/viz/geo/Bounds"
], function(Bounds) {

    var d3GeoBounds = d3.geo.path().projection(null).bounds || d3.geo.bounds;

    var Feature = function(geoJson) {
        for ( var i in geoJson) {
            if (geoJson.hasOwnProperty(i)) {
                this[i] = geoJson[i];
            }
        }

        var bbox = this.bbox;
        if (!bbox) {
            bbox = d3GeoBounds(this);
            this.bbox = new Bounds(bbox[0], bbox[1]);
        } else {
            this.bbox = new Bounds(bbox);
        }
    };

    Feature.prototype = Object.create(null, {
        centroid : {
            get : function() {
                var props = this.properties;
                var result = props && props.centroid;
                if (!result) {
                    result = this.bbox.getCenter();
                    this.centroid = result;
                }
                return result;
            },
            set : function(v) {
                var props = this.properties;
                if (!props) {
                    this.properties = props = {};
                }
                props.centroid = v;
            }
        }
    });

    return Feature;
});
define('sap/viz/geo/LocationType',["exports"], function() {

    /**
     * Enumeration of location types.
     * 
     * @class sap.viz.geo.LocationType
     */
    var locationType = {
        /**
         * feature id
         * 
         * @readonly
         * @default
         * @memberof sap.viz.geo.LocationType
         */
        FEATURE_ID : "featureId",
        /**
         * geographic coordinate such as longitude and latitude
         * 
         * @readonly
         * @default
         * @memberof sap.viz.geo.LocationType
         */
        COORDINATE : "coordinate"
    };

    return locationType;
});
define('sap/viz/geo/utils/Logger',[
    'sap/viz/framework/common/log/Logger', 'sap/viz/framework/common/log/Analyzer'
], function Setup(LOG, Analyzer) {
    var Logger = {
        'profiling' : function(msg) {
            if (LOG.level >= LOG.LEVEL.DEBUG) {
                Analyzer.pnrProfiling(msg);
            }

        },
        'error' : function(msg) {
            LOG.error(msg, 'geo');
        },
        'debug' : function(msg) {
            LOG.debug(msg, 'geo');
        }

    };
    return Logger;
});
define('sap/viz/geo/EventSource',[
    "jquery"
], function(
    $
) {
    var on = function(type, listener) {
        var map = this._eventMap;

        if (map) {
            var i = type.indexOf("."), name = "";

            // Extract optional namespace, e.g., "click.foo"
            if (i >= 0) {
                name = type.slice(i + 1);
                type = type.slice(0, i);
            }

            var subMap = map.get(type);
            if (arguments.length === 1) {
                return subMap && subMap.get(name);
            }

            if (!subMap) {
                subMap = map.set(type, d3.map());
            }

            if (listener != null) {
                subMap.set(name, listener);
            } else {
                subMap.remove(name);
            }
        }
        return this;
    };

    var off = function(type) {
        return this.on(type, undefined);
    };

    var fire = function(type) {
        var eventMap = this._eventMap;
        if (eventMap) {
            var subMap = eventMap.get(type);
            if (subMap) {
                var args = Array.prototype.slice.call(arguments, 1);
                return $.when.apply(null, subMap.values().map(function(listener) {
                    return listener.apply(this, args);
                }.bind(this)));
            }
        }
        return $.Deferred().resolve().promise();
    };

    return {
        init : function() {
            this._eventMap = d3.map();
        },
        mixin : function() {
            this.on = on;
            this.off = off;
            this._fireEvent = fire;
            return this;
        },
        destroy : function() {
            this._eventMap = null;
            return this;
        }
    };
});
define('sap/viz/geo/utils/PropertiesHelper',[
    "sap/viz/framework/common/util/ObjectUtils"
], function(ObjectUtils) {

    function triggerPropertiesChange() {
        delete this._properties;
        return this._onChange();
    }

    function PropertiesHelper(defaultProperties, userProperties, templateManager) {
        this._defaultProperties = defaultProperties || {};
        this._userProperties = ObjectUtils.clone(userProperties) || {};
        this._triggerPropertiesChange = triggerPropertiesChange.bind(this);

        this.setTemplateManager(templateManager);
    }

    PropertiesHelper.prototype.setTemplateManager = function(templateManager) {
        delete this._properties;
        
        var tm = this._templateManager;
        if (tm) {
            tm._removeListener(this._triggerPropertiesChange);
        }

        tm = this._templateManager = templateManager;
        if (tm) {
            tm._addListener(this._triggerPropertiesChange);
        } else {
            delete this._templateManager;
        }
    };

    PropertiesHelper.prototype.update = function(properties) {
        ObjectUtils.extendByRepalceArray(true, this._userProperties, properties);
        return this._triggerPropertiesChange();
    };

    PropertiesHelper.prototype.get = function() {
        var properties = this._properties;
        if (!properties) {
            var tm = this._templateManager;
            properties = ObjectUtils.extendByRepalceArray(true, null, this._defaultProperties, tm &&
                this._getTemplateProperties(tm), this._userProperties);
            this._properties = properties;
            this._verify(properties);
        }
        return properties;
    };

    PropertiesHelper.prototype.getUserProperties = function() {
        return ObjectUtils.clone(this._userProperties);
    };

    PropertiesHelper.prototype.destroy = function() {
        this.setTemplateManager(null);
        delete this._defaultProperties;
        delete this._userProperties;        
        delete this._triggerPropertiesChange;
    };

    PropertiesHelper.prototype._getTemplateProperties = function(templateManager) {

    };

    PropertiesHelper.prototype._onChange = function() {

    };

    PropertiesHelper.prototype._verify = function(properties) {

    };

    return PropertiesHelper;
});
define('sap/viz/geo/interaction/behaviorId',[],function() {
    return "geoBehavior";
});
define('sap/viz/geo/interaction/behavior',[
    "sap/viz/framework/interaction/Behavior", 'sap/viz/framework/interaction/BehaviorManager',
    "sap/viz/geo/interaction/behaviorId"
], function(Behavior, behaviorManager, behaviorId) {
    var b = new Behavior();
    behaviorManager.register(behaviorId, b);

    return b;
});
define('sap/viz/geo/interaction/addToBehavior',[
    "sap/viz/framework/common/util/ObjectUtils",
    "sap/viz/geo/interaction/behavior"
], function(
    ObjectUtils,
    behavior
) {
    var forEach = Array.prototype.forEach;
    return function() {
        forEach.call(arguments, function(arg){
            var oriConfig = arg.oriConfig, ret;
            if (oriConfig) {
                ret = ObjectUtils.clone(arg.oriConfig);
                delete ret.supportedChartTypes;
                var handlerExtension = arg.handlerExtension;
                if (handlerExtension) {
                    var oriHandler = ret.handler;
                    var CustomHandler = function() {
                        oriHandler.apply(this, arguments);
                    };

                    var ext = {
                        constructor : {
                            value : CustomHandler
                        }
                    };

                    var i;
                    for (i in handlerExtension) {
                        if (handlerExtension.hasOwnProperty(i)) {
                            ext[i] = {
                                value : handlerExtension[i]
                            };
                        }
                    }

                    CustomHandler.prototype = Object.create(oriHandler.prototype, ext);

                    ret.handler = CustomHandler;
                }
                var post = arg.post;
                if (post) {
                    post(ret);
                }
            } else {
                ret = arg;
            }
            behavior.addActionByDef(ret);
        });        
    };
});
define('sap/viz/geo/dataviz/DataShapes',[
    'sap/viz/chart/components/util/DataPointUtils',
    "sap/viz/framework/common/util/Constants"
], function(
    DataPointUtils,
    Constants
) {
    var DP_ID_ATTR_SEP_CHAR = "|", CLASS_ELEMENT = Constants.CSS.CLASS.DATAPOINT, SELECTOR_ELEMENT = "." +
        CLASS_ELEMENT;

    var slice = Array.prototype.slice;

    function getDataPointIds(node) {
        var value = DataPointUtils.getDataPointId(node);
        return value != null ? value.split(DP_ID_ATTR_SEP_CHAR) : [];
    }

    return {
        CSS_CLASS : CLASS_ELEMENT,
        getLayer : function(node) {
            return d3.select(node).datum().layer;
        },
        getAll : function(parentNode) {
            return slice.call(parentNode.querySelectorAll(SELECTOR_ELEMENT));
        },
        getDataPointIds : getDataPointIds,
        setDataPointId : function(node, datum) {
            var data = datum.data || [
                datum
            ];

            DataPointUtils.setDataPointId(node, data.map(function(d) {
                return d.dataHolder.dp.id;
            }).join(DP_ID_ATTR_SEP_CHAR));
            return this;
        },
        queryByDataPointIds : function(nodes, dpIds) {
            return nodes.filter(function(node) {
                return getDataPointIds(node).some(function(dpId) {
                    return dpIds.indexOf(dpId) !== -1;
                });
            });
        }
    };
});
define('sap/viz/geo/dataviz/Constants',[],function() {
    return {
        COLOR_PALETTE : [
            "#748CB2", "#9CC677", "#EACF5E", "#F9AD79", "#D16A7C", "#8873A2", "#3A95B3", "#B6D949", "#FDD36C",
            "#F47958", "#A65084", "#0063B1", "#0DA841", "#FCB71D", "#F05620", "#B22D6E", "#3C368E", "#8FB2CF",
            "#95D4AB", "#EAE98F", "#F9BE92", "#EC9A99", "#BC98BD", "#1EB7B2", "#73C03C", "#F48323", "#EB271B",
            "#D9B5CA", "#AED1DA", "#DFECB2", "#FCDAB0", "#F5BCB4"
        ],
        MBC_COLOR_PALETTE : [
            "#fAC99E", "#f7A660", "#f48323", "#b7621a", "#703c10"
        ]
    };
});

define('sap/viz/geo/dataviz/AbstractViz',[
    "sap/viz/geo/EventSource",
    "sap/viz/framework/common/util/ObjectUtils",
    "sap/viz/chart/components/util/DataPointUtils",
    "sap/viz/chart/components/util/BoundingBoxUtils",
    "sap/viz/chart/behavior/config/handler/LassoBehaviorHandler",
    "sap/viz/geo/utils/PropertiesHelper",
    "sap/viz/framework/common/util/oo",
    "sap/viz/geo/interaction/addToBehavior",
    "sap/viz/chart/behavior/config/DataPointBehaviorConfig",
    "sap/viz/geo/dataviz/DataShapes",
    "sap/viz/geo/dataviz/Constants",
    "sap/viz/framework/common/util/UADetector",
    "require",
    'jquery',
    "exports"
], function(
    EventSource,
    Objects,
    DataPointUtils,
    BoundingBoxUtils,
    LassoBehaviorHandler,
    PropertiesHelper,
    oo,
    addToBehavior,
    DataPointBehaviorConfig,
    DataShapes,
    DataVizConstants,
    UADetector,
    require,
    $
) {
    if (!UADetector.isMobile()) {
        var customHoverEffectOnDataPoint = function(flag, event, service) {
            var node = event.data.targets;
            DataShapes.getLayer(node).viz()._onHover(node, flag, service.getEffectManager(),
                service.getMap().getSelectionModel());
        };

        addToBehavior({
            oriConfig : DataPointBehaviorConfig[0],
            handlerExtension : {
                _getDataPoint : function(node) {
                    return DataShapes.getDataPointIds(node);
                },
                _hasDataPoint : function(dataPoints, dataPoint) {
                    if (!Array.isArray(dataPoint)) {
                        dataPoint = [
                            dataPoint
                        ];
                    }

                    return dataPoint.some(function(dp) {
                        return dataPoints.indexOf(dp) !== -1;
                    });
                },
                customHoverEffectOnDataPoint : customHoverEffectOnDataPoint.bind(null, true),
                customUnhoverEffectOnDataPoint : customHoverEffectOnDataPoint.bind(null, false),
            },
            post : function(config) {
                config.id = "dataPointHoverBehaviorDefinition";
                config.triggerEvent = [
                    {
                        "name" : "afterBehaviorLoaded",
                        "method" : "initialize"
                    }, {
                        "name" : "hover",
                        "targets" : DataShapes.CSS_CLASS,
                        "method" : "hoverOnDataPoint"
                    }, {
                        "name" : "hover",
                        "excludeTargets" : DataShapes.CSS_CLASS,
                        "method" : "hoverOnNonDataPoint"
                    }, {
                        "name" : "hoverOnDataPoint",
                        "method" : "hoverEffectOnDataPoint"
                    }, {
                        "name" : "unhoverOnDataPoint",
                        "method" : "unhoverOnDataPoint"
                    }
                ];
            }
        }, {
            id : "hoverOnDataPoint_custom",
            "triggerEvent" : {
                "name" : "hoverOnDataPoint"
            },
            "handler" : customHoverEffectOnDataPoint.bind(null, true)
        }, {
            id : "unhoverOnDataPoint_custom",
            "triggerEvent" : {
                "name" : "unhoverOnDataPoint"
            },
            "handler" : customHoverEffectOnDataPoint.bind(null, false)
        });
    }
    var EVENT_NAME_PROPERTIES_CHANGE = "propertiesChange";

    var VizPropertiesHelper = function(viz, defaultProps, userProps) {
        this._viz = viz;
        VizPropertiesHelper.superclass.constructor.call(this, Objects.extend(true, {
            drawingEffect : "normal"
        }, defaultProps), userProps);
    };

    oo.extend(VizPropertiesHelper, PropertiesHelper);

    VizPropertiesHelper.prototype._getTemplateProperties = function(TemplateManager) {
        return TemplateManager._getVizProperties(this._viz._id);
    };

    VizPropertiesHelper.prototype._onChange = function() {
        return this._viz._fireEvent(EVENT_NAME_PROPERTIES_CHANGE);
    };

    VizPropertiesHelper.prototype._verify = function(properties) {
        this._viz.verifyProperties(properties);
    };

    /**
     * @constructor
     * @alias sap.viz.geo.dataviz.AbstractViz
     * @param {Object}
     *            props the configuration object
     * @ignore
     */
    var AbstractViz = function(props, feedDef, implConstructor, id, defaultProps) {
        EventSource.init.call(this);
        this._feedDef = feedDef;
        this._implConstructor = implConstructor;
        this._id = id;

        this._propertiesHelper = new VizPropertiesHelper(this, defaultProps, props);

        // Internal state to store previous dataLabel visible state, improve
        // performance
        this._lastLabelVisible = false;
    };

    AbstractViz.EVENT_NAME_PROPERTIES_CHANGE = EVENT_NAME_PROPERTIES_CHANGE;

    EventSource.mixin.call(AbstractViz.prototype);

    Object.defineProperty(AbstractViz.prototype, "_props", {
        get : function() {
            return this._propertiesHelper.get();
        }
    });

    AbstractViz.prototype.getDispatch = function() {
        return this._dispatch;
    };

    AbstractViz.prototype.verifyProperties = function() {

    };

    /**
     * Get/set properties. Setting/updating properties will re-render all layers
     * which rely on this visualization object.
     * 
     * @param {Object}
     *            [properties] the update of properties object. Increasing
     *            update is supported that is you can only put updating part in
     *            the object instead of providing a full configuration object.
     * @returns the current configuration object(getting) or the visualization
     *          object itself(setting)
     */
    AbstractViz.prototype.properties = function(_) {
        var propsHelper = this._propertiesHelper;
        var props = propsHelper.get();
        if (arguments.length === 0) {
            return props;
        }

        if (props.dataLabel) {
            // record previous data label visible state
            this._lastLabelVisible = props.dataLabel.visible;
        }

        return propsHelper.update(_);
    };
    
    AbstractViz.prototype._setTemplateManager = function(tm) {
        this._propertiesHelper.setTemplateManager(tm);
    };

    AbstractViz.prototype._createImpl = function() {
        return new (this._implConstructor)(this);
    };

    /**
     * Get feeding definition for this viz type. The implementation should
     * implement this function.
     * 
     * @abstract
     * @returns {Array} the feeding definition.
     * @ignore
     */
    AbstractViz.prototype._getFeedingDef = function() {
        return this._feedDef;
    };

    AbstractViz.prototype._onSelectionChanged = function(node, selectionStatus, effectManager, datum) {
        return this;
    };

    AbstractViz.prototype._filterByLassoRect = function(elements, lassoRect, map) {
        return elements.filter(function() {
            return LassoBehaviorHandler.prototype._isCovered(this, [
                lassoRect
            ]);
        });
    };

    AbstractViz.prototype.toJSON = function() {
        return {
            id : this._id,
            options : this._propertiesHelper.getUserProperties()
        };
    };

    AbstractViz.prototype.destroy = function() {
        this._propertiesHelper.destroy();
    };

    AbstractViz.prototype._onHover = function(node, hover, effectManager, selectionModel) {
        return this;
    };

    AbstractViz._deserialize = function(o) {
        var d = $.Deferred();
        require([
            o.id.replace(/\./g, '\/')
        ], function(Viz) {
            d.resolve(new Viz(o.options));
        });
        return d.promise();
    };

    return AbstractViz;
});

define('sap/viz/geo/dataviz/Layer',[
    "sap/viz/framework/common/util/ObjectUtils",
    'sap/viz/geo/Feature',
    "sap/viz/geo/Bounds",
    "sap/viz/geo/LocationType",
    "sap/viz/geo/utils/Logger",
    "sap/viz/framework/common/util/TypeUtils",
    "sap/viz/framework/chartmodel/DataModel",
    "sap/viz/geo/dataviz/AbstractViz",
    "sap/viz/geo/Constants",
    "sap/viz/geo/dataviz/DataShapes",
    "sap/viz/geo/EventSource",
    'sap/viz/framework/chartmodel/DataSelector',
    "jquery",
    "sap/viz/framework/common/util/DataUtils",
    "exports"
], function(
    ObjectUtils,
    Feature,
    Bounds,
    LocationType,
    Logger,
    TypeUtils,
    DataModel,
    AbstractViz,
    Constants,
    DataShapes,
    EventSource,
    DataSelector,
    $,
    DataUtils
) {
    var ELEMENT_EVENT_TARGET_CLASS_NAME = "eventTarget", ELEMENT_CLASS_NAME = "elementWrapper " + DataShapes.CSS_CLASS;
    var LOCATION = "location";

    var idGen = (function() {
        var id = 0;

        return function() {
            return "sap-viz-layer-" + id++;
        };
    })();

    function toFeatures(locations, repository) {
        var d = $.Deferred();

        var result = [],
            featureIdMap = {},
            names = [],
            nameIndexes = [];
        for (var i = 0, len = locations.length; i < len; i++) {
            var location = locations[i];

            var type = location.type,
                value = location.value;

            if (type === LocationType.COORDINATE) {
                var lngLat = value.split(",").map(Number);
                if (lngLat[0] >= -180 && lngLat[0] <= 180 && lngLat[1] >= -90 && lngLat[1] <= 90) {
                    result[i] = new Feature({
                        "type": "Feature",
                        "bbox": [
                            lngLat[0], lngLat[1], lngLat[0], lngLat[1]
                        ],
                        "id": value + ",COORDINATE",
                        "geometry": {
                            "type": "Point",
                            "coordinates": lngLat
                        },
                        "properties": {
                            "name": lngLat.join(',')
                        }
                    });
                } else {
                    result[i] = null;
                    // TODO LOG.WRAN
                }
            } else if (type === LocationType.FEATURE_ID) {
                var indexes = featureIdMap[value];
                if (!indexes) {
                    indexes = [];
                    featureIdMap[value] = indexes;
                }
                indexes.push(i);
            } else if (type === undefined) {
                if (!Array.isArray(value)) {
                    value = [
                        value
                    ];
                }
                names.push(value);
                nameIndexes.push(i);
            }
        }

        var resolveByFeatureId = function(){
            var done = d.resolve.bind(d, result);

            var featureIds = Object.keys(featureIdMap);
            if (featureIds.length) {
                repository.getFeaturesByIds(featureIds).then(function(features) {
                    for (var featureId in features) {
                        if (features.hasOwnProperty(featureId)) {
                            var rawFeature = features[featureId];
                            var feature = rawFeature ? new Feature(rawFeature) : null;
                            featureIdMap[featureId].forEach(function(i) {
                                result[i] = feature;
                            });
                        }
                    }
                    done();
                });
            } else {
                done();
            }
        };

        if(names.length){
            repository.searchByNames(names).then(function(rets) {
                rets.forEach(function(ret, i) {
                    if (ret.length) {
                        var featureId = ret[0].featureId;
                        var indexes = featureIdMap[featureId];
                        if (!indexes) {
                            indexes = [];
                            featureIdMap[featureId] = indexes;
                        }
                        indexes.push(nameIndexes[i]);
                    }
                });

                resolveByFeatureId();
            });
        } else {
            resolveByFeatureId();
        }        

        return d.promise();
    }

    function resolveMetadata() {
        if (this._viz && this._data && this._feeding) {
            var feedingDef = this._viz._getFeedingDef();
            var feeding = this._feeding;
            var data = this._data;
            var validate = feedingDef.every(function(fd) {
                var id = fd.id;
                if (fd.required) {
                    return feeding[id] && data.metadata(feeding[id])[0];
                } else if (feeding[id]) {
                    return data.metadata(feeding[id])[0];
                } else {
                    return true;
                }
            });
            this._metadata = [];
            this._metaFeedingMapping = {};
            if (validate) {
                feedingDef.forEach(function(fd) {
                    var id = fd.id;
                    if (feeding[id]) {
                        var meta = data.metadata(feeding[id])[0];
                        this._metadata.push(meta);
                        this._metaFeedingMapping[id] = meta;
                    }
                }.bind(this));
            }
        } else {
            this._metadata = [];
            this._metaFeedingMapping = {};
        }
    }

    /**
     * Create a new overlay layer object.
     * 
     * @constructor
     * @alias sap.viz.geo.dataviz.Layer
     * @param {Object}
     *            [options] the configuration object.
     * @param {Object}
     *            [options.data] an array holding data to be shown
     *            in this layer.
     * @param {Object}
     *            [options.viz] a <a
     *            href="sap.viz.geo.dataviz.AbstractViz.html">data visualization.
     * @param {Object}
     *            [options.feeding] a object of feeding.
     * @param {Boolean}
     *            [options.legendVisible] a boolean value to
     *            indicate whether the legend of this layer should be shown.
     *            Default is false.
     * @param {Object}
     *            [options.tooltip] the configuration of tooltip.
     * @param {String|Object}
     *            [options.tooltip.formatString] a string or a object which is the format pattern of numbers in
     *            tooltip. It can be also an object keys of which are ids of
     *            measures to specify the patterns separately.
     * @param {String}
     *            [options.tooltip.unitFormatType] a string which is the type of format pattern of numbers in
     *            tooltip. It can be also an object keys of which are ids of
     *            measures to specify the patterns separately.
     */
    var Layer = function(options) {
        EventSource.init.call(this);
        this._id = idGen();
        this._rendered = false;
        this._attached = false;
        this._visible = true;
        this._legend = null;

        if (options) {
            this._legendVisible = Boolean((options.legendVisible === false) ? false : true);
            this._tooltip = options.tooltip||{};
            this.feeding(options.feeding);
            this.data(options.data);
            this.viz(options.viz);
        }
    };

    EventSource.mixin.call(Layer.prototype);

    /**
     * Get/set the visibility of legend.
     * 
     * @param {Boolean}
     *            [visible] the legend visibility to be set
     * @returns a boolean value to indicate the legend visibility(getting) or
     *          the layer object itself(setting)
     */
    Layer.prototype.legendVisibility = function(visible) {
        if (arguments.length === 0) {
            return this._legendVisible;
        }

        var v = Boolean(visible === false ? false : true);
        if (this._legendVisible !== v) {
            this._legendVisible = v;
            if (this._attached) {
                applyLegendVisibility.call(this);
            }
        }

        return this;
    };

   /**
     * Get/set the tooltip infomation.
     * 
     * @param {String|Object}
     *            [info] a string which contains the format pattern of numbers to be set in
     *            tooltip. It can be also an object keys of which are ids of
     *            measures to specify the patterns separately.
     * @returns the tooltip format(getting) or the layer object itself(setting)
     */
    Layer.prototype.tooltip = function(info) {
        if (!arguments.length) {
            return this._tooltip;
        }
        if(info.formatString||info.unitFormatType){
            if(info.formatString){
                this._tooltip.formatString = info.formatString;
            }             
            if(info.unitFormatType){
                this._tooltip.unitFormatType = info.unitFormatType;
            }
        } else {
            this._tooltip.formatString = info;
        }
        return this;
    };

    Layer.prototype._getTooltipData = function(data) {
        var content = this._vizImpl._getTooltipContent(data, this._metaFeedingMapping);
        var args = [];
        var part;

        part = content.dimension;
        if (part) {
            args.push(part);
        }

        part = content.measure;
        if (part) {
            args.push(part);
        }

        part = content.otherInfo;
        if (part) {
            args.push(part);
        }

        var ret = [];
        return ret.concat.apply(ret, args);
    };

    /**
     * Get/set the visibility of this layer.
     * 
     * @param {Boolean}
     *            [visible] the visibility to be set
     * @returns a boolean value to indicate the visibility(getting) or the layer
     *          object itself(setting)
     */
    Layer.prototype.visibility = function(visible) {
        if (arguments.length === 0) {
            return this._visible;
        }

        var v = Boolean(visible);
        if (this._visible !== v) {
            this._visible = v;

            applyVisibility.call(this);
            applyLegendVisibility.call(this);
        }

        return this;
    };

    Layer.prototype._attach = function(toPixel, parentNode, dispatch, effectManager, templateManager) {
        if (arguments.length === 0) {
            return this._attached;
        }

        this._toPixel = toPixel;
        this._parentNode = parentNode;
        this._dispatch = dispatch;
        this._effectManager = effectManager;
        
        this._templateManager = templateManager;
        var viz = this._viz;
        if(viz){
            viz._setTemplateManager(templateManager);
        }
        
        this._attached = true;
    };

    Layer.prototype._canRender = function() {
        return (this._isDataReady() && this._attached);
    };

    Layer.prototype._isDataReady = function() {
        return !!(this._viz && this._data && !DataUtils.isEmptyDataset(this._data) &&
                this._feeding && this._metadata.length);
    };

    Layer.prototype._render = function(nextNonEmptyLayer, mapSize, bHiddenLegend) {
        this._rendered = true;
        renderViz.call(this, nextNonEmptyLayer, mapSize, bHiddenLegend);
    };

    Layer.prototype._isRendered = function() {
        return this._rendered;
    };

    Layer.prototype._detach = function() {
        if (this._legend) {
            this._dispatch.removeLegend(this._legend);
        }
        registerVizPropsChangeListener.call(this, false);

        this._legend = null;

        destroyElements.call(this);

        delete this._parentNode;
        delete this._toPixel;
        delete this._dispatch;
        this._effectManager = null;
        
        delete this._templateManager;
        var viz = this._viz;
        if (viz) {
            viz._setTemplateManager(null);
        }

        this._attached = false;

        this._rendered = false;
    };

    Layer.prototype._destroy = function() {
        destroyDataModel.call(this);
        this._detach();
        EventSource.destroy.call(this);
        return this;
    };

    /**
     * Get/set the visualization of this layer. Setting new visualization object
     * for layer will re-render layer.
     * 
     * @param {sap.viz.geo.dataviz.AbstractViz}
     *            [viz] the new data visualization object
     * @param {Object}
     *            [feed] a object of feeding
     * @param {Boolean}
     *            [adjustBounds] if true, the bounding box of map will be
     *            adjusted to fully show this layer.
     * @returns {sap.viz.geo.dataviz.AbstractViz|Promise} the visualization
     *          object(getting) or a promise object which will be resolved when
     *          the layer is updated and renders over(setting)
     */
    Layer.prototype.viz = function(viz, feeding, adjustBounds) {
        if (arguments.length === 0) {
            return this._viz;
        }

        Logger.profiling("Layer:set_viz");

        destroyDataModel.call(this);
        if (arguments.length === 2 && typeof (arguments[1]) === 'boolean') {
            adjustBounds = arguments[1];
            feeding = null;
        }

        var promise = this.update({
            viz : viz,
            feeding : feeding || this._feeding,
            adjustBounds : adjustBounds
        });

        Logger.profiling("Layer:set_viz");
        return promise;
    };

    function registerVizPropsChangeListener(flag) {
        var viz = this._viz;
        if (viz) {
            var evt = AbstractViz.EVENT_NAME_PROPERTIES_CHANGE + "." + this._id;
            if (flag) {
                viz.on(evt, render.bind(this));
            } else {
                viz.off(evt);
            }
        }
    }

    /**
     * Get/set the data of this layer. Setting new data for layer will re-render
     * layer.
     * 
     * @param {Array}
     *            [data] the new data
     * @param {Object}
     *            [feeding] a object of feeding
     * @param {Boolean}
     *            [adjustBounds] if true, the bounding box of map will be
     *            adjusted to fully show this layer.
     * @returns {sap.viz.api.data.FlatTableDataset|Promise} the data(getting) or
     *          a promise object which will be resolved when the layer is
     *          updated and renders over(setting)
     */
    Layer.prototype.data = function(data, feeding, adjustBounds) {
        if (arguments.length === 0) {
            return this._data;
        }

        Logger.profiling("Layer:set_data");

        if (arguments.length === 2 && typeof (arguments[1]) === 'boolean') {
            adjustBounds = arguments[1];
            feeding = null;
        }

        var promise = this.update({
            data : data,
            feeding : feeding || this._feeding,
            adjustBounds : adjustBounds
        });

        Logger.profiling("Layer:set_data");

        return promise;
    };

    /**
     * Get/set the feeding of this layer. Setting new feeding for layer will
     * re-render layer.
     * 
     * @param {Object}
     *            [feeding] a object of feeding
     * @param {Boolean}
     *            [adjustBounds] if true, the bounding box of map will be
     *            adjusted to fully show this layer.
     * @returns {Object|Promise} the feeding(getting) or a promise object which
     *          will be resolved when the layer is updated and renders
     *          over(setting)
     */
    Layer.prototype.feeding = function(feeding, adjustBounds) {
        if (arguments.length === 0) {
            return this._feeding;
        }

        Logger.profiling("Layer:set_feeding");
        var promise = this.update({
            feeding : feeding,
            adjustBounds : adjustBounds
        });

        Logger.profiling("Layer:set_feeding");
        return promise;
    };

    /**
     * update layer
     * 
     * @param {Object}
     *            option
     * @param {sap.viz.api.data.FlatTableDataset}
     *            [option.data] the new data of this layer
     * @param {sap.viz.geo.dataviz.AbstractViz|Object}
     *            [option.viz] a data visualization object or a plain object
     *            which presents the new properties of viz of this layer
     * @param {Object}
     *            [option.feeding] an object of feeding
     * @param {boolean}
     *            [option.adjustBounds=false] a boolean value to indicate
     *            whether to adjust bounds after update of the layer
     * @returns {Promise} a promise object which will be resolved when the layer
     *          is updated and renders over
     */
    Layer.prototype.update = function(option) {
        var d = $.Deferred();

        if (arguments.length === 0) {
            d.resolve();
        } else {
            Logger.profiling("Layer:update");

            var needRender = false, needResolveData = false;
            if (option.viz) {
                registerVizPropsChangeListener.call(this, false);

                if (option.viz instanceof AbstractViz) {
                    if (this._viz) {
                        this._viz._setTemplateManager(null);
                    }
                    this._viz = option.viz;
                    this._vizImpl = this._viz._createImpl();
                    
                    this._viz._setTemplateManager(this._templateManager);
                    
                    needResolveData = true;
                } else if (option.viz instanceof Object) {
                    this._viz.properties(option.viz);
                }

                registerVizPropsChangeListener.call(this, true);

                needRender = true;
            }

            // remove data if data is null
            if (option.feeding || option.feeding === null || option.data || option.data === null) {

                if (option.feeding || option.feeding === null) {
                    this._feeding = option.feeding;
                }

                if (option.data || option.data === null) {
                    this._data = option.data;
                }

                needRender = true;
                needResolveData = true;
            }

            if (needRender) {
                if (this._legend) {
                    this._dispatch.removeLegend(this._legend);
                    this._legend = null;
                }

                if (needResolveData) {
                    destroyDataModel.call(this);
                    this._bounds = null;
                }

                resolveMetadata.call(this);
                destroyElements.call(this);
                this._elements = null;

                render.call(this, option.adjustBounds, function() {
                    d.resolve();
                });
            } else {
                d.resolve();
            }

            Logger.profiling("Layer:update");
        }
        return d.promise();
    };

    function destroyDataModel() {
        this._resolvedData = null;
        var dataModel = this._dataModel;
        if (dataModel) {
            this._fireEvent("beforeDestroyDataModel");
            dataModel.destroy();
            this._dataModel = null;
        }
    }

    Layer.prototype._getVizImpl = function() {
        return this._vizImpl;
    };

    Layer.prototype._getMetadata = function() {
        return this._metadata;
    };

    Layer.prototype._isEmpty = function() {
        var elements = this._elements;
        return !elements || elements.empty();
    };

    Layer.prototype._insertBefore = function(target) {
        var tagetNode = target ? target._elements.node() : null;
        if (this._elements) {
            this._elements.each(function() {
                this.parentNode.insertBefore(this, tagetNode);
            });
        }
        return this;
    };

    Layer.prototype.getLegend = function() {
        return this._legend;
    };

    Layer.prototype._getBounds = function() {
        if (!this._bounds && this._resolvedData && this._resolvedData.length) {
            var bounds = new Bounds(2);
            this._resolvedData.forEach(function(d) {
                bounds.union(d.feature.bbox);
            });
            this._bounds = this._vizImpl._applyPadding(bounds);
        }
        return this._bounds;
    };

    Layer.prototype._resolveData = function(cb, scope) {
        if (!this._resolvedData) {
            Logger.profiling("Layer:resolve_data");
            var results = resolveFeeding(this._data, this._metaFeedingMapping);
            var locations = resolveLocations(results);
            toFeatures(locations, this._map._repository).then(function(result) {
                this._resolvedData = [];
                var i, len;
                for (i = 0, len = result.length; i < len; i++) {
                    var r = result[i];

                    if (r && r.type) {
                        this._resolvedData.push({
                            feature : r,
                            centroid : r.centroid,
                            raw : results[i].raw,
                            dataHolder : results[i],
                            rawId : i
                        });
                    }
                }
                for (i = 0; i < this._resolvedData.length; i++) {
                    this._resolvedData[i].index = i;
                }

                var bindingResults = {};
                var m, metaFeedingMapping = this._metaFeedingMapping;
                for (m in metaFeedingMapping) {
                    if (metaFeedingMapping.hasOwnProperty(m)) {
                        bindingResults[m] = {
                            metaData : [
                                metaFeedingMapping[m]
                            ]
                        };
                    }
                }
                bindingResults.series = this._resolvedData.map(function(d) {
                    return d.dataHolder;
                });
                this._dataModel = new DataModel(bindingResults, this._data);

                Logger.profiling("Layer:resolve_data");
                cb.call(scope);
            }.bind(this));
        } else {
            cb.call(scope);
        }

        return this;
    };

    Layer.prototype._getElements = function(returnDOM) {
        var ret;
        var elements = this._elements;
        if (returnDOM) {
            ret = [];
            if (elements) {
                elements.each(function() {
                    ret.push(this);
                });
            }
        } else {
            ret = elements;
        }
        return ret;
    };

    Layer.prototype._hasDataPointId = function(dpId) {
        var dp;
        var dataModel = this._dataModel;
        if (dataModel) {
            dp = dataModel.getDataPoint(dpId);
        }
        return dp != null;
    };

    Layer.prototype._getElementsCoveredByLasso = function(lassoRect, map) {
        if (this._visible) {
            var viz = this._viz;
            if (viz) {
                var elements = this._elements;
                if (elements) {
                    return viz._filterByLassoRect(elements, lassoRect, map);
                }
            }
        }

        return null;
    };

    Layer.prototype._queryDataPointIds = function(condition) {
        var dataModel = this._dataModel;
        return dataModel ? new DataSelector(condition, dataModel).getDataPoints().map(function(dp) {
            return String(dp.id);
        }) : [];
    };

    function render(adjustBounds, cb) {
        if (this._map) {
            this._map._renderLayer(this, adjustBounds, cb);
        } else {
            if (cb) {
                cb();
            }
        }
    }

    function resolveFeeding(data, metaFeedingMapping) {
        var rawData = data.table();
        var rawInfo = data.dataInFields([
            metaFeedingMapping[LOCATION].id
        ]);
        var results = rawData.map(function(d, i) {
            var resData = {};
            for ( var feed in metaFeedingMapping) {
                if (metaFeedingMapping.hasOwnProperty(feed)) {
                    var metaData = metaFeedingMapping[feed];
                    resData[feed] = d[metaData.id];
                }
            }
            d.geoInfo = rawInfo[i].info && rawInfo[i].info.geo && rawInfo[i].info.geo.length && rawInfo[i].info.geo[0];
            resData['raw'] = d;
            return resData;
        });

        return results;
    }

    function resolveLocations(feedingData) {
        return feedingData.map(function(data) {
            var info = data.raw.geoInfo;
            var type, value;

            if (!info) {
                type = undefined;
                value = data.location;
            } else if (info.type === LocationType.FEATURE_ID) {
                type = LocationType.FEATURE_ID;
                value = data.location;
            } else if (info.type === LocationType.COORDINATE) {
                type = LocationType.COORDINATE;
                value = data.location;
            } else if (info.featureId) {
                type = LocationType.FEATURE_ID;
                value = info.featureId;
            } else if (info.coordinate) {
                type = LocationType.COORDINATE;
                value = info.coordinate;
            } else if (info.location) {
                type = undefined;
                value = info.location;
            } else {
                type = undefined;
                value = data.location;
            }
            return {
                type : type,
                value : value
            };
        });
    }

    function destroyElements() {
        if (this._elements) {
            this._elements.remove();
            this._elements = null;
        }
    }

    var generateId = (function() {
        var id = 1;
        return function() {
            id++;
            return 'c' + id;
        };
    })();

    function renderViz(nextNonEmptyLayer, mapSize) {
        if (!this._resolvedData) {
            return;
        }

        Logger.profiling("Layer:rendering-rendering_viz");

        var data = this._resolvedData.map(function(d) {
            return ObjectUtils.extend({}, d);
        }), viz = this._vizImpl, toPixel = this._toPixel;

        var vizInstance = this._viz;

        viz._setMetaFeedingMapping(this._metaFeedingMapping);
        data = viz._prepareData(data, toPixel, mapSize);
        data.forEach(function(d) {
            if (d.rawId === undefined) {
                if (Array.isArray(d.data)) {
                    var ids = d.data.map(function(x) {
                        return x.rawId;
                    }).sort();
                    d.rawId = ids.join('_');
                } else {
                    d.rawId = generateId();
                }
            }
            d.layer = this;
        }, this);

        var docFrag, selection = this._elements;
        if (!selection) {
            docFrag = document.createDocumentFragment();
            selection = d3.select(docFrag).selectAll("div");
        }

        selection = selection.data(data, function(d) {
            return d.rawId;
        });
        selection.exit().remove();

        var enter = selection.enter().append("xhtml:div").attr("class", ELEMENT_CLASS_NAME);

        // can be simplified if with d3.v3
        var beforeNode = nextNonEmptyLayer ? nextNonEmptyLayer._elements.node() : null, parentNode = this._parentNode;
        if (beforeNode && !enter.empty() && !docFrag) {
            enter.each(function() {
                parentNode.insertBefore(this, beforeNode);
            });
        }

        var emptyElements = selection.filter(isEmpty);

        viz._buildDom(emptyElements, ELEMENT_EVENT_TARGET_CLASS_NAME);

        emptyElements.classed(ELEMENT_EVENT_TARGET_CLASS_NAME, hasNotEventTarget);

        if (docFrag) {
            parentNode.insertBefore(docFrag, beforeNode);
            selection[0].parentNode = parentNode;
        }

        // selection.order();
        viz._update(selection, toPixel, this._effectManager);
        selection.attr("style", function(d) {
            var min = viz._getLeftTop(d, toPixel);
            return "left:" + min[0] + "px;top:" + min[1] + "px";
        }).each(function(d) {
            DataShapes.setDataPointId(this, d);
        });

        this._elements = selection;
        viz._postRender(selection);
        applyVisibility.call(this);

        if (data.length) {
            Logger.profiling("Layer:rendering-rendering_viz-generating_legend");
            this._legend = viz._generateLegend(data, this._legend, this._effectManager);        

            if (this._legend) {
                this._legend.setDispatch(this._dispatch);
                this._legend.setLayer(this);
            }

            this._dispatch.renderLegend(this);
            applyLegendVisibility.call(this);
            Logger.profiling("Layer:rendering-rendering_viz-generating_legend");
        }

        Logger.profiling("Layer:rendering-rendering_viz");
    }

    function applyVisibility() {
        if (this._elements) {
            this._elements.style("visibility", this._visible ? "" : "hidden");
        }
    }
    
    function applyLegendVisibility() {
        var d = this._dispatch;
        if (d) {
            d[this._visible && this._legendVisible ? "showLegend" : "hideLegend"](this);
        }
    }

    function clearContent() {
        this.innerHTML = "";
    }

    function isEmpty() {
        return this.childNodes.length === 0;
    }

    function hasNotEventTarget() {
        return this.getElementsByClassName(ELEMENT_EVENT_TARGET_CLASS_NAME).length === 0;
    }

    Layer.fromEventTarget = function(target) {
        if (target) {
            while (true) {
                var selection = d3.select(target);
                if (selection.classed(Constants.CSS_CLASS.ROOT)) {
                    break;
                }
                if (selection.classed(ELEMENT_CLASS_NAME)) {
                    return selection;
                }
                target = target.parentNode;
                if (!target) {
                    break;
                }
            }
        }

        return null;
    };

    return Layer;
});

define('sap/viz/geo/OverlayPane',[
    "sap/viz/geo/dataviz/Layer"
], function(Layer) {
    function getElementFromEvent(e) {
        return Layer.fromEventTarget(e.target);
    }

    function toPixel(map, lnglat) {
        var result = map.toPixel(lnglat);
        result[0] -= this._translate[0];
        result[1] -= this._translate[1];
        return result;
    }

    function toLngLat(map, point) {
        return map.toLngLat([
            point[0] + this._translate[0], point[1] + this._translate[1]
        ]);
    }

    function createDom(dispatch) {
        var dom = document.createElement("div");
        dom.setAttribute("class", "overlayPane");

        return dom;
    }

    function onBaseMapChanged(baseMap) {
        var dom = this._dom;
        dom.setAttribute("style", "left: 0px; top: 0px;");
        this._translate = [
            0, 0
        ];

        baseMap.getOverlayContainerRootNode().appendChild(dom);
    }

    function OverlayPane(map) {
        var dispatch = this._dispatch = map._dispatch;
        this._translate = [
            0, 0
        ];
        this._toPixel = toPixel.bind(this, map);
        this._toPixel.invert = toLngLat.bind(this, map);
        this._effectManager = map._effectManager;
        this._templateManager = map._templateManager;
        this._attachedLayers = [];
        var dom = this._dom = createDom(dispatch);

        dispatch.on("baseMapChanged.overlayPan", onBaseMapChanged.bind(this));
    }

    OverlayPane.prototype.translate = function(delta, persistent) {
        var translateX = 0, translateY = 0;
        if (delta !== false) {
            translateX = this._translate[0] + delta[0];
            translateY = this._translate[1] + delta[1];
        } else {
            persistent = true;
        }

        var style = this._dom.style;
        style.left = translateX + "px";
        style.top = translateY + "px";

        if (persistent) {
            this._translate = [
                translateX, translateY
            ];
        }
    };

    OverlayPane.prototype.setVisibility = function(visible) {
        this._dom.style.visibility = visible ? "" : "hidden";
    };

    OverlayPane.prototype.detach = function() {
        this._dom.parentNode.removeChild(this._dom);
        var style = this._dom.style;
        style.left = 0;
        style.top = 0;
        this._translate = [
            0, 0
        ];
    };

    OverlayPane.prototype.attachLayer = function(layer) {
        layer._attach(this._toPixel, this._dom, this._dispatch, this._effectManager, this._templateManager);
        this._attachedLayers.push(layer);
        return this;
    };

    OverlayPane.prototype.detachLayer = function(layer) {
        var index = this._attachedLayers.indexOf(layer);
        if (index >= 0) {
            this._attachedLayers.splice(index, 1);
            layer._detach();
        }
    };

    OverlayPane.prototype.destroy = function() {
        for (var i = 0; i < this._attachedLayers.length; i++) {
            this._attachedLayers[i]._detach();
        }
        this._attachedLayers = null;
        
        delete this._templateManager;
    };

    return OverlayPane;
});

define('sap/viz/geo/dataviz/SelectionModel',[
    "sap/viz/framework/common/util/ObjectUtils",
    "sap/viz/geo/dataviz/Layer",
    'sap/viz/framework/interaction/Constants',
    "sap/viz/chart/behavior/config/DataPointBehaviorConfig",
    "sap/viz/chart/behavior/config/RuntimeSelectionHelperConfig",
    "sap/viz/chart/behavior/config/LassoBehaviorConfig",
    "sap/viz/chart/behavior/config/SelectionAPIConfig",
    "sap/viz/geo/EventSource",
    "sap/viz/chart/components/util/DataPointUtils",
    "sap/viz/geo/interaction/addToBehavior",
    'sap/viz/framework/chartmodel/DataSelector',
    "sap/viz/geo/Constants",
    "sap/viz/geo/dataviz/DataShapes"
], function(
    ObjectUtils,
    Layer,
    InteractionConstants,
    DataPointBehaviorConfig,
    RuntimeSelectionHelperConfig,
    LassoBehaviorConfig,
    SelectionAPIConfig,
    EventSource,
    DataPointUtils,
    addToBehavior,
    DataSelector,
    Constants,
    DataShapes
) {

    var STATUS_DEFAULT = 0, STATUS_SELECTED = 1, STATUS_DESELECTED = -1;

    var SELECTION_MODE = InteractionConstants.SELECTION_MODE;

    var statusKey = "selectedDataPoints";

    function hasSelection(selectedDataPoints) {
        return selectedDataPoints.length > 0;
    }

    function hasDataPoint(dataPoints, dataPoint) {
        if (!Array.isArray(dataPoint)) {
            dataPoint = [
                dataPoint
            ];
        }

        return dataPoint.some(function(dp) {
            return dataPoints.indexOf(dp) !== -1;
        });
    }
    
    function getAllDataPointNodes(service){
        return DataShapes.getAll(service.getMap()._rootContainer);
    }

    function getNodes(dataPoints, service) {
        return DataShapes.queryByDataPointIds(getAllDataPointNodes(service), dataPoints);
    }

    function onNodesSelectedStatusChanged(isSelect, evt, service) {
        var effectManager = service.getEffectManager();
        var evtData = evt.data;
        var status = isSelect ? STATUS_SELECTED : (evtData.isAnyOtherSelected ? STATUS_DESELECTED : STATUS_DEFAULT);
        evtData.targets.forEach(function(node) {
            var d = d3.select(node).datum();
            d.layer.viz()._onSelectionChanged(node, status, effectManager, d);
        });
    }

    function getDataPoint(node) {
        return DataShapes.getDataPointIds(node);
    }

    function onLayerDataModelInvalid(event, service) {
        var layer = event.data;
        var selectedDataPoints = service.getStatus(statusKey).filter(function(dpId) {
            return !layer._hasDataPointId(dpId);
        });

        service.setStatus(statusKey, selectedDataPoints).fireEvent("deselectDataPoint", {
            targets : layer._getElements(true)
        }).fireEvent("clearPlot", {
            isGray : hasSelection(selectedDataPoints)
        });
    }

    addToBehavior({
        "id" : "processSelection_beforeDestroyLayerDataModel",
        "triggerEvent" : {
            "name" : "beforeDestroyLayerDataModel"
        },
        "handler" : onLayerDataModelInvalid
    }, {
        "id" : "processSelection_layerRemoved",
        "triggerEvent" : {
            "name" : "layerRemoved"
        },
        "handler" : onLayerDataModelInvalid
    }, {
        "id" : "processSelection_layerRendered",
        "triggerEvent" : {
            "name" : "layerRendered"
        },
        "handler" : function(event, service) {
            var layer = event.data;
            var selectedDataPoints = service.getStatus(statusKey).filter(function(dpId) {
                return layer._hasDataPointId(dpId);
            });
            if (selectedDataPoints.length) {
                service.fireEvent("selectDataPoint", {
                    targets : DataShapes.queryByDataPointIds(layer._getElements(true), selectedDataPoints)
                });
            }
        }
    }, {
        "id" : "selectNodes",
        "triggerEvent" : {
            "name" : "selectDataPoint"
        },
        "handler" : onNodesSelectedStatusChanged.bind(null, true)
    }, {
        "id" : "deselectNodes",
        "triggerEvent" : {
            "name" : "deselectDataPoint"
        },
        "handler" : onNodesSelectedStatusChanged.bind(null, false)
    }, {
        oriConfig : DataPointBehaviorConfig[0],
        handlerExtension : {
            _getDataPoint : getDataPoint,
            clearPlot : function(event, service) {
                var gray = !!event.data.isGray;
                d3.select(service.getMap()._overlaysPane._dom).classed("selected", gray);
                var effectManager = service.getEffectManager();
                var status = gray ? STATUS_DESELECTED : STATUS_DEFAULT;
                getAllDataPointNodes(service).forEach(function(node) {
                    var d = d3.select(node).datum();
                    d.layer.viz()._onSelectionChanged(node, status, effectManager, d);
                });
            },
            _hasDataPoint : hasDataPoint
        },
        post : function(config) {
            config.id = "dataPointSelectionBehaviorDefinition";
            config.triggerEvent = [
                {
                    "name" : "standAloneInitialized",
                    "method" : "standAloneInitialized"
                }, {
                    "name" : "click",
                    "targets" : DataShapes.CSS_CLASS,
                    "method" : "clickOnDataPoint"
                }, {
                    "name" : "selectDataPoint",
                    "method" : "selectDataPoint"
                }, {
                    "name" : "deselectDataPoint",
                    "method" : "deselectDataPoint"
                }, {
                    "name" : "clearPlot",
                    "method" : "clearPlot"
                }
            ];
        }
    }, {
        oriConfig : LassoBehaviorConfig[0],
        handlerExtension : {
            _getShowDetailTarget : function(selectedDataPoints, service) {
                var nodes = getNodes(selectedDataPoints, service);
                if (nodes.length === 1) {
                    return nodes[0];
                }
            },
            _getBoundSelection : function(service) {
                return service.getMap()._rootContainer;
            },
            _getTargets : function(lassoRects, service) {
                var res = [];
                var map = service.getMap();
                var layers = map.getLayers();
                if (layers.length > 0) {
                    var lassoRect = lassoRects[0];

                    layers.forEach(function(layer) {
                        var elements = layer._getElementsCoveredByLasso(lassoRect, map);
                        if (elements) {
                            elements.each(function() {
                                res = res.concat(DataShapes.getDataPointIds(this));
                            });
                        }
                    });
                }

                return res;
            }
        },
        post : function(config) {
            config.triggerEvent.forEach(function(e) {
                if (e.name === "lassostart" || e.name === "lassomove" || e.name === "lassoend") {
                    e.targets = Constants.CSS_CLASS.ROOT;
                }
            });
        }
    }, {
        oriConfig : RuntimeSelectionHelperConfig[0],
        handlerExtension : {
            _hasDataPoint : hasDataPoint,
            _buildEventData : function(dataPoints, service) {
                var map = service.getMap();
                return this._getNodes(dataPoints, service).map(function(node) {
                    var d = d3.select(node).datum();
                    return {
                        target : node,
                        data : {
                            layer : map.layerIndexOf(d.layer),
                            data : ObjectUtils.clone(d.raw)
                        }
                    };
                });
            },
            _getNodes : getNodes
        },
        post : function(config) {
            var i, e, triggerEvent = config.triggerEvent, len = triggerEvent.length;

            for (i = 0; i < len; i++) {
                e = triggerEvent[i];
                if (e.method === "deselectAll" && e.name === "click") {
                    e.targets = Constants.CSS_CLASS.MAP_CONTAINER;
                    e.excludeTargets = 'v-datapoint';
                    break;
                }
            }
            var index;
            for (i = 0; i < len; i++) {
                e = triggerEvent[i];
                if (e.method === "refreshedKeepSelection" && e.name === "afterChartRendered") {
                    index = i;
                    break;
                }
            }

            triggerEvent.splice(index, 1);
        }
    }, {
        oriConfig : SelectionAPIConfig[0],
        handlerExtension : {
            _buildGetSelectionResult : function(selectedContexts, service) {
                var items = [];
                getNodes(selectedContexts, service).forEach(function(node) {
                    var d = d3.select(node).datum();
                    var layer = d.layer;
                    var layerIndex = service.getMap().layerIndexOf(layer);

                    var raw = ObjectUtils.clone(d.raw);

                    (Array.isArray(raw) ? raw : [
                        raw
                    ]).forEach(function(x) {
                        items.push({
                            layerIndex : layerIndex,
                            data : x,
                            info : x.geoInfo
                        });
                        delete x.geoInfo;
                    });
                });

                return items;
            },
            _getTargets : function(items, service) {
                var collection = {};
                items.forEach(function(item) {
                    var layerIndex = item.layerIndex;
                    if (layerIndex == null) {
                        layerIndex = "*";
                    }
                    var array = collection[layerIndex];
                    if (!array) {
                        collection[layerIndex] = array = [];
                    }
                    array.push(item.data);
                });

                var map = service.getMap();

                var i;
                var allLayerConditions = collection["*"];
                if (allLayerConditions) {
                    var layerCount = map.getLayers().length;
                    for (i = 0; i < layerCount; i++) {
                        var array = collection[i];
                        collection[i] = array ? array.concat(allLayerConditions) : allLayerConditions;
                    }
                    delete collection["*"];
                }

                var res = [];
                for (i in collection) {
                    if (collection.hasOwnProperty(i)) {
                        var layer = map.getLayer(i);
                        res = res.concat(layer._queryDataPointIds(collection[i]));
                    }
                }

                return res;
            }
        }
    });

    function getEventSignature(name) {
        return name + ".selectionModel";
    }

    function selectDataEvtListener(evt) {
        delete evt.type;
        this._fireEvent(evt.name, evt);
    }

    /**
     * @constructor
     * @alias sap.viz.geo.dataviz.SelectionModel
     */
    var SelectionModel = function(map, props) {
        props = props || {};
        EventSource.init.call(this);
        this._map = map;

        this.mode(props.mode || SELECTION_MODE.INCLUSIVE);

        this.lassoEnabled = false;

        map._dispatch.on(getEventSignature("baseMapChanged"), function(baseMap) {
            baseMap.togglePan(!this.lassoEnabled);
        });

        this._map._interaction._service._eventDispatcher.on(getEventSignature("selectData"),
            selectDataEvtListener.bind(this)).on(getEventSignature("deselectData"), selectDataEvtListener.bind(this));
    };

    EventSource.mixin.call(SelectionModel.prototype);

    /**
     * Get/set the selection mode.
     * 
     * @param {String}
     *            [mode] the selection mode to be set.
     * @returns the current selection mode (getting) or the selection model
     *          object itself(setting)
     */
    SelectionModel.prototype.mode = function(_) {
        var key = "interaction.selectability.mode";
        var pm = this._map._interaction._service.getProperties();

        var oriValue = pm.get(key);
        if (arguments.length === 0) {
            return oriValue;
        }
        var selMode = _.toUpperCase();
        switch (selMode) {
        case SELECTION_MODE.INCLUSIVE:
        case SELECTION_MODE.EXCLUSIVE:
        case SELECTION_MODE.NONE:
        case SELECTION_MODE.SINGLE:
        case SELECTION_MODE.MULTIPLE:
            if (oriValue != null && oriValue.toUpperCase() !== selMode) {
                this.clear();
            }
            pm.set(key, selMode);
        }

        return this;
    };

    /**
     * Reset all selected elements to normal.
     * 
     * @returns the selection model object itself
     */
    SelectionModel.prototype.clear = function() {
        this.selection(null, {
            clearSelection : true
        });
        return this;
    };

    Object.defineProperty(SelectionModel.prototype, "lassoEnabled", {
        set : function(_) {
            this._map._interaction.getMonitor().setProperties({
                enableLasso : this._lassoEnabled = _
            });
            var baseMap = this._map.baseMap();
            if (baseMap) {
                baseMap.togglePan(!_);
            }
        },
        get : function() {
            return this._lassoEnabled;
        }
    });

    /**
     * Set current selection status and if called without arguments, it will
     * return current selected data.
     * 
     * @param {Array}
     *            [conditions] the conditions to match data to be selected
     * @param {Object}
     *            [options] the options for setting selection
     * @param {string}
     *            [options.selectionMode] the selection mode for applying new
     *            conditions. If not given, current mode will be used.
     * @param {boolean}
     *            [options.clearSelection=false] if true, current selection will
     *            be cleared before applying new conditions
     * 
     * @returns {Array|boolean} Return an array including current selected data
     *          for getting case. And for setting case, return a boolean value
     *          to indicate whether the operation is successful.
     */
    SelectionModel.prototype.selection = function(conditions, options) {
        var statusMgr = this._map._interaction._service._getStatusManager();
        
        if (Array.isArray(conditions) || (conditions == null && options != null)) {
            var config = {
                items : conditions,
                options : options
            };
            statusMgr.set('interaction.selectedDataPoints', config);
            return !!config.success;
        } else {
            return statusMgr.get('interaction.selectedDataPoints');
        }
    };

    SelectionModel.prototype.toJSON = function() {
        var json = {
            id : "sap.viz.geo.dataviz.SelectionModel",
            options : this._props
        };
        return json;
    };

    SelectionModel.prototype.fromJSON = function(json) {
        this._props = json.options;
    };

    SelectionModel.prototype.destroy = function() {
        EventSource.destroy.call(this);
    };

    SelectionModel.ELEMENT_STATUS = {
        DEFAULT : STATUS_DEFAULT,
        SELECTED : STATUS_SELECTED,
        DESELECTED : STATUS_DESELECTED
    };

    SelectionModel.prototype._getSelectionStatus = function(node) {
        var dps = this._map._interaction._service.getStatus(statusKey);
        if (!hasSelection(dps)) {
            return STATUS_DEFAULT;
        }
        return hasDataPoint(dps, getDataPoint(node)) ? STATUS_SELECTED : STATUS_DESELECTED;
    };

    return SelectionModel;
});

define('sap/viz/geo/dispatch',[],function() {
    return function() {
        return d3.dispatch("showLegend", "hideLegend", "removeLegend", "renderLegend", "baseMapChanged");
    };
});
define('sap/viz/geo/GeoLegendManager',[
    "sap/viz/geo/utils/Logger",
    "sap/viz/framework/common/util/DataGraphics",
    "sap/viz/framework/common/util/DOM",
    "jquery",
    "sap/viz/geo/interaction/behavior"
], function(
    Logger,
    DataGraphics,
    DOM,
    $,
    behavior
) {
    var SCROLLBAR_SPACE = 17;

    var CLASS_LEGEND = "v-legend", CLASS_LEGENDS = "legends";

    [
        {
            "id" : "legends_hover",
            "triggerEvent" : {
                "name" : "hover",
                "targets" : CLASS_LEGENDS
            },
            "handler" : function(event, service) {
                var legendManager = service.getMap()._legendManager;
                if (!legendManager._hover) {
                    legendManager.mouseInOut(true);
                    legendManager._hover = true;
                }
            }
        }, {
            "id" : "legends_unhover",
            "triggerEvent" : {
                "name" : "hover",
                "excludeTargets" : CLASS_LEGENDS
            },
            "handler" : function(event, service) {
                var legendManager = service.getMap()._legendManager;
                if (legendManager._hover) {
                    legendManager.mouseInOut(false);
                    legendManager._hover = false;
                }
            }
        }
    ].forEach(behavior.addActionByDef, behavior);
    
    /**
     * @ignore
     * @constructor
     * @alias sap.viz.geo.GeoLegendManager
     */
    function LegendManager(rootNode, map) {
        this._dispatch = map._dispatch;
        this._dispatch.on("showLegend.legendManager", this.showLegend.bind(this));
        this._dispatch.on("hideLegend.legendManager", this.hideLegend.bind(this));
        this._dispatch.on("removeLegend.legendManager", this.removeLegend.bind(this));
        this._dispatch.on("renderLegend.legendManager", this.renderLegend.bind(this));

        this._rootNode = rootNode;
        rootNode.className = CLASS_LEGENDS;
        rootNode.setAttribute("style", "display: none;");

        this._currentWidth = 60;
        this._legends = [];
        this._map = map;
    }

    LegendManager.prototype.constructor = LegendManager;
    /*
     * @ignore @param {boolean} bOver 'true' means mouse moving in legends,
     * otherwise means moving out
     * 
     */
    LegendManager.prototype.mouseInOut = function(bOver) {
        var mapSize = this._map._currentSize;
        this._rootNode.style.height = "";

        if (this._rootNode.offsetHeight > mapSize[1] - this._reservedSpace) {
            if (bOver) {
                this._rootNode.style.overflow = "";
                d3.select(this._rootNode).classed("legends-scroll", true);
            } else {
                this._rootNode.style.overflow = "hidden";
                d3.select(this._rootNode).classed("legends-scroll", false);
            }
            this._rootNode.style.height = (mapSize[1] - this._reservedSpace) + "px";
        } else {
            d3.select(this._rootNode).classed("legends-scroll", false);
        }
    };

    LegendManager.prototype.reservedSpace = function(_) {
        if (arguments.length) {
            this._reservedSpace = _;
            return this;
        }

        return this._reservedSpace;
    };
    /*
     * when add a legend or hide a legend, the whole legends size may change,
     * update legend's width if needed @ignore
     * 
     */
    LegendManager.prototype.updateWidth = function() {
        var mapSize = this._map._currentSize;
        if (mapSize[1] - this._reservedSpace < 60) {
            this._rootNode.style.display = "none";
            return;
        }
        var i;
        var width = 0;
        this._rootNode.style.display = "";
        var legend;
        var bMbcOnly = true;
        var mbcWidth = 0;
        for (i = 0; i < this._legends.length; ++i) {
            legend = this._legends[i];
            if (legend && this._rootNode.childNodes[i].style.display !== "none") {
                var minWidth = 0;
                var maxWidth = 0;
                if (legend.getPreferredSize) {
                    minWidth = legend.getPreferredSize().minWidth;
                    maxWidth = legend.getPreferredSize().width;
                } else {
                    maxWidth = minWidth = legend.width();
                }
                // 
                if (minWidth + SCROLLBAR_SPACE > mapSize[0] / 4) {
                    this._rootNode.childNodes[i].style.display = "none";
                } else {
                    if (legend.bMbcOnly && legend.bMbcOnly()) {
                        mbcWidth = mbcWidth > legend.getPreferredSize().mbcWidth ? mbcWidth
                            : legend.getPreferredSize().mbcWidth;
                    } else {
                        bMbcOnly = false;
                    }

                    if (maxWidth + SCROLLBAR_SPACE <= mapSize[0] / 4) {
                        if (maxWidth > width) {
                            width = maxWidth;
                        }
                    } else {
                        width = mapSize[0] / 4;
                    }
                }
            }
        }

        if (bMbcOnly) {
            if (mbcWidth + SCROLLBAR_SPACE < mapSize[0] / 4) {
                width = mbcWidth;
            } else {
                width = mapSize[0] / 4 - SCROLLBAR_SPACE;
            }
        }

        if (width + SCROLLBAR_SPACE > mapSize[0] / 4 || width === 0) {
            this._rootNode.style.display = "none";
            return;
        }

        if (this._currentWidth !== width) {
            for (i = 0; i < this._legends.length; ++i) {
                legend = this._legends[i];
                if (legend && legend.getPreferredSize && this._rootNode.childNodes[i].style.display !== "none") {
                    legend.width(width);
                    legend.reRender();
                }
            }
            this._currentWidth = width;
        }
        // add extra space for IE scroll bar
        this._rootNode.style.width = this._currentWidth + SCROLLBAR_SPACE + "px";

        resetFirstFlag.call(this);
    };
    
    function resetFirstFlag(){
        var children = $(this._rootNode.childNodes);
        children.filter(".first").toggleClass("first", false);
        children.filter(".v-legend-display").first().addClass("first");
    }
    
    /*
     * @ignore @param {sap.viz.geo.layer} layer for display legend
     */
    LegendManager.prototype.renderLegend = function(layer) {
        Logger.profiling("LegendManager:render_legend");
        var legend = layer.getLegend();
        if (!legend) {
            return;
        }
        var node, selection;
        if (!legend.node()) {
            node = document.createElement("div");

            var i = 0, legends = this._legends, map = this._map, currentLayerIndex = map.layerIndexOf(layer), temp;
            while ((temp = legends[i]) && (currentLayerIndex < map.layerIndexOf(temp._layer))) {
                i++;
            }

            legends.splice(i, 0, legend);
            var refNode = this._rootNode.childNodes[i];
            if (refNode) {
                this._rootNode.insertBefore(node, refNode);
            } else {
                this._rootNode.appendChild(node);
            }
            selection = d3.select(node);
            selection.attr("class", CLASS_LEGEND);
        }

        if (legend.getPreferredSize) {
            var size = legend.getPreferredSize();
            var width = this._currentWidth > size.minWidth ? this._currentWidth : size.minWidth;
            legend.width(width).height(size.minHeight);
        }

        legend.render(node);
        node = legend.node();

        DataGraphics.setData(node, legend);

        selection = d3.select(node);
        if (!layer.legendVisibility()) {
            node.style.display = "none";
            selection.classed("v-legend-display", false);
        } else {
            node.style.display = "";
            selection.classed("v-legend-display", true);
        }

        if (!d3.select(this._rootNode).selectAll(".v-legend-display").empty()) {
            this._rootNode.style.display = "";
        }
        this.updateWidth();
        this.mouseInOut(false);
        Logger.profiling("LegendManager:render_legend");
    };

    /*
     * reorder legend when layer orders changed @ignore @param legend legend to
     * move @param number negative means moving backward abs(number) steps,
     * positive means moving forward number steps
     */
    LegendManager.prototype.reorderLegend = function(legend, number) {
        Logger.profiling("LegendManager:reorder_legend");
        var oldIndex = this._legends.indexOf(legend);
        if (oldIndex >= 0) {
            this._legends.splice(oldIndex, 1);
            this._legends.splice(oldIndex + number, 0, legend);
            var div = legend.node();
            this._rootNode.removeChild(div);
            if (oldIndex + number === this._legends.length - 1) {
                this._rootNode.appendChild(div);
            } else {
                this._rootNode.insertBefore(div, this._rootNode.childNodes[oldIndex + number]);
            }
            resetFirstFlag.call(this);
        }
        Logger.profiling("LegendManager:reorder_legend");
    };

    /*
     * remove current legend @ignore @param legend legend to remove
     */
    LegendManager.prototype.removeLegend = function(legend) {
        if (!legend) {
            return;
        }
        Logger.profiling("LegendManager:remove_legend");

        this._legends.splice(this._legends.indexOf(legend), 1);

        if (!legend.node()) {
            return;
        }
        var div = legend.node();
        if (legend.destroy) {
            legend.destroy();
        }
        this._rootNode.removeChild(div);
        if (d3.select(this._rootNode).selectAll(".v-legend-display").empty()) {
            this._rootNode.style.display = "none";
        }
        this.updateWidth();
        this.mouseInOut(false);
        Logger.profiling("LegendManager:remove_legend");
    };

    /*
     * show layer legend @ignore @param layer the layer to show legend
     */
    LegendManager.prototype.showLegend = function(layer) {
        Logger.profiling("LegendManager:show_legend");

        var legend = layer.getLegend();
        if (!legend) {
            return;
        }
        if (!legend.hasRendered()) {
            this.renderLegend(layer);
            return;
        }
        var node = legend.node();
        node.style.display = "";
        d3.select(node).classed("v-legend-display", true);
        this._rootNode.style.display = "";
        this.updateWidth();
        this.mouseInOut(false);
        Logger.profiling("LegendManager:show_legend");
    };

    /*
     * hide legend @ignore @param layer the layer to hide legend
     */
    LegendManager.prototype.hideLegend = function(layer) {
        Logger.profiling("LegendManager:hide_legend");

        var legend = layer.getLegend();
        if (!legend || !legend.node()) {
            return;
        }
        var node = legend.node();
        node.style.display = "none";
        d3.select(node).classed("v-legend-display", false);
        if (d3.select(this._rootNode).selectAll(".v-legend-display").empty()) {
            this._rootNode.style.display = "none";
        }
        this.updateWidth();
        this.mouseInOut(false);
        Logger.profiling("LegendManager:hide_legend");
    };

    LegendManager.getLegendFromChild = function(node) {
        while (node) {
            if (DOM.hasClass(node, CLASS_LEGEND)) {
                return DataGraphics.getData(node);
            }
            node = node.parentNode;
        }
    };

    return LegendManager;
});

define('sap/viz/geo/MapControl',[
    "sap/viz/framework/common/lang/LangManager",
    "sap/viz/framework/common/util/UADetector",
    "sap/viz/geo/interaction/behavior"
], function(
    langManager,
    UADetector,
    behavior
) {
    var buttonConfigs = [
        {
            cls : "zoomInBtn",
            title : 'IDS_ZOOM_IN',
            handler : function(event, service) {
                service.getMap().zoom(1);
            }
        }, {
            cls : "zoomOutBtn",
            title : 'IDS_ZOOM_OUT',
            handler : function(event, service) {
                service.getMap().zoom(-1);
            }
        }, {
            cls : "resetBtn",
            title : 'IDS_RESET',
            handler : function(event, service) {
                service.getMap().reset();
            }
        }
    ];

    if (!UADetector.isMobile()) {
        buttonConfigs.splice(2, 0, {
            cls : "btnToggleLasso",
            title : 'IDS_MARQUEE_SELECTION',
            handler : function(event, service) {
                var selectionModel = service.getMap().getSelectionModel();
                d3.select(event.data.currentTarget).classed("on",
                    selectionModel.lassoEnabled = !selectionModel.lassoEnabled);
            }
        });
    }

    behavior.addActionByDef({
        "id" : "mapControl",
        "triggerEvent" : {
            "name" : "click",
            "targets" : buttonConfigs.map(function(d) {
                return d.cls;
            })
        },
        "handler" : function(event, service) {
            d3.select(event.data.currentTarget).datum().handler(event, service);
        }
    });

    function updateTitle() {
        var buttons = this._buttons;
        if (buttons) {
            buttons.attr('title', function(d) {
                return langManager.get(d.title);
            });
        }
    }

    function MapControl(container) {
        container = d3.select(container);
        var control = container.append("div").attr("class", "mapControl");
        this._buttons = control.selectAll("div").data(buttonConfigs).enter().append("div").attr('class', function(d) {
            return d.cls;
        });
        updateTitle.call(this);
        this._control = control;
        langManager.addListener(this._langListener = {
            fn : updateTitle,
            scope : this
        });
    }

    MapControl.prototype.show = function() {
        var control = this._control;
        if (control) {
            control.style('display', null);
        }
        return this;
    };

    MapControl.prototype.hide = function() {
        var control = this._control;
        if (control) {
            control.style('display', 'none');
        }
        return this;
    };

    MapControl.prototype.destroy = function() {
        var control = this._control;
        if (control) {
            control.remove();
        }
        langManager.removeListener(this._langListener);
        this._control = null;
        this._buttons = null;
    };

    return MapControl;
});
define('sap/viz/geo/OperationQueue',[
    "sap/viz/geo/utils/Logger"
], function(Logger) {

    var OperationQueue = function() {
        this._queue = [];
        this._processed = true;
    };

    OperationQueue.prototype.offerOp = function(op) {
        this._queue.push(op);
        this._processQueue();
    };

    OperationQueue.prototype._processQueue = function() {
        var processing = [];
        var level = 100;
        var that = this;

        while (this._processed && this._queue.length) {
            if (this._queue[0].level === 0) {
                if (processing.length === 0) {
                    processing.push(this._queue.shift());
                }
                break;
            } else if (this._queue[0].level <= level) {
                level = this._queue[0].level;
                processing.push(this._queue.shift());
            } else {
                break;
            }
        }

        if (processing.length) {
            this._processed = false;
            asyncEach(processing, function(item, cb) {
                Logger.profiling(item.name);
                try {
                    item.op(function() {
                        Logger.profiling(item.name);
                        cb();
                    });
                } catch (e) {
                    Logger.profiling(item.name);
                    Logger.error(e && e.message);
                    cb();
                }
            }, function(err) {
                that._processed = true;
                that._processQueue();
            });
        }
    };

    function noop() {
    }

    function asyncEach(arr, iterator, callback) {
        callback = callback || noop;

        if (!arr.length) {
            return callback();
        }

        var completed = 0;
        arr.forEach(function(item) {
            iterator(item, function(err) {
                completed++;
                if (err) {
                    callback(err);
                    callback = noop;
                } else {
                    if (completed >= arr.length) {
                        callback(null);
                    }
                }
            });
        });
    }

    return OperationQueue;

});

define('sap/viz/geo/interaction/create',[
    "sap/viz/framework/interaction/Interaction", "sap/viz/geo/interaction/behaviorId"
], function(Interaction, behaviorId) {
    return function(map) {
        var ins = new Interaction({
            rootNode : d3.select(map._rootContainer),
            effectManager : map._effectManager
        });

        var service = ins._service;
        service.getMap = function() {
            return map;
        };

        map.on("beforeDestroyLayerDataModel.interactionService", function(layer) {
            service.fireEvent("beforeDestroyLayerDataModel", layer);
        }).on("layerRemoved.interactionService", function(layer) {
            service.fireEvent("layerRemoved", layer);
        }).on("layerRendered.interactionService", function(layer) {
            service.fireEvent("layerRendered", layer);
        });

        ins.properties({
            interaction : {
                behaviorType : behaviorId
            }
        });
        
        ins.getMonitor().setProperties({
            enableHover : true
        });

        ins.initialize();

        return ins;
    };
});
define('sap/viz/geo/createEffectManager',[
    'sap/viz/framework/common/effect/EffectManager', "sap/viz/framework/common/util/SVG"
], function(EffectManager, SVG) {

    return function(container) {
        var svg = SVG.create("svg");
        var defs = SVG.create("defs", svg);
        svg.setAttribute("class", "effectsContainer");
        container.appendChild(svg);
        return new EffectManager(d3.select(defs));
    };
});

define('sap/viz/geo/dataviz/Tooltip',[
    "sap/viz/geo/interaction/addToBehavior", "sap/viz/chart/behavior/config/TooltipBehaviorConfig",
    "sap/viz/framework/common/util/ObjectUtils", "sap/viz/framework/common/lang/LangManager",
    "sap/viz/geo/utils/PropertiesHelper", "sap/viz/framework/common/util/oo"
], function(addToBehavior, TooltipBehaviorConfig, ObjectUtils, langManager, PropertiesHelper, oo) {
    function hide(service) {
        service.fireEvent("hideDetail", {
            mode : service.getStatus("tooltipMode")
        });
    }
    addToBehavior({
        oriConfig : TooltipBehaviorConfig[0],
        handlerExtension : {
            initialized : function(event, service) {
                Object.getPrototypeOf(this.constructor.prototype).initialized.apply(this, arguments);

                var fn = hide.bind(null, service);

                var map = service.getMap();
                map.on("zoomStart.tooltip", fn);
                map.on("panStart.tooltip", fn);
                map.on("layerRemoved.tooltip", fn);
                map.on("layerRendered.tooltip", fn);

                this._tooltipModule._drawDimensionAndMeasure = function(data) {
                    this.constructor.prototype._drawDimensionAndMeasure.apply(this, arguments);

                    if (!data) {
                        return;
                    }

                    data = data.filter(function(d) {
                        return d.type !== "Dimension" && d.type !== "Measure";
                    });

                    var table = this._mainDiv.select(".v-tooltip-dimension-measure");
                    var nameStyle, valueStyle, style, tr, td, className;
                    if(data.length > 0){
                        var trs = table.selectAll("tr");
                        if(!trs.empty()){
                            tr = trs[0][trs[0].length - 1];
                            td =  tr.querySelectorAll('td');
                            var len = td.length;
                            for(var i = 0; i < len; ++i){
                                td[i].style["padding-bottom"] = this._display.measureName["paddingBottom"];
                            }
                            
                        }
  
                    }
                    for (var j = 0; j < data.length; j++) {
                        var key = data[j].name;
                        var value = data[j].value;
                        for (var k = 0; k < value.length; k++) {
                            if (j === data.length - 1 && k === value.length - 1) {
                                if (typeof (value[k]) === "number") {
                                    nameStyle = ObjectUtils.extend(true, {}, this._display.measureName);
                                    valueStyle = ObjectUtils.extend(true, {}, this._display.measureValue);
                                } else {
                                    nameStyle = ObjectUtils.extend(true, {}, this._display.dimensionName);
                                    valueStyle = ObjectUtils.extend(true, {}, this._display.dimensionValue);
                                }
                                nameStyle.paddingBottom = '0px';
                                valueStyle.paddingBottom = '0px';
                            } else {
                                if (typeof (value[k]) === "number") {
                                    nameStyle = this._display.measureName;
                                    valueStyle = this._display.measureValue;
                                } else {
                                    nameStyle = this._display.dimensionName;
                                    valueStyle = this._display.dimensionValue;
                                }
                            }
                            tr = table.append('tr');
                            // otherInfo key
                            style = this._getStyle(nameStyle);
                            if (this._defaultToolTipColors.measureName !== '') {
                                if (typeof (value[k]) === "number") {
                                    style += ';color:' + this._defaultToolTipColors.measureName;
                                } else {
                                    style += ';color:' + this._defaultToolTipColors.dimensionName;
                                }
                            }

                            className = 'v-body-measure-label';

                            if (k > 0) {
                                style += ";visibility : hidden";
                            }

                            var handleNull = function(_) {
                                return _ == null ? langManager.get("IDS_ISNOVALUE") : _;
                            };

                            td = tr.append('td').attr('style', style).text(handleNull(key) + ":").attr('class',
                                className);
                            this._dimensionOrMeasureTitles.push(td);
                            // otherInfo value
                            style = this._getStyle(valueStyle);

                            if (this._defaultToolTipColors.measureValue !== '') {
                                if (typeof (value[k]) === "number") {
                                    style += ';color:' + this._defaultToolTipColors.measureValue;
                                } else {
                                    style += ';color:' + this._defaultToolTipColors.dimensionValue;
                                }
                            }

                            className = 'v-body-measure-value';

                            tr.append('td').attr('style', style).text(handleNull(value[k])).attr('class', className);
                        }
                    }
                };
            },
            extractTooltipData : function(event, service) {
                var data = d3.select(event.data.target).datum();
                var layer = data.layer;
                service.setStatus("tooltipData", layer._getTooltipData(data));
                var pm = this._tooltipModule._properties;
                pm.set("tooltip", service.getMap()._tooltip._properties);
                pm.set("tooltip", layer.tooltip());
            },
            _getTooltipContainer : function(service) {
                return service.getMap()._rootContainer;
            }
        },
        post : function(config) {
            config.triggerEvent = config.triggerEvent.filter(function(c) {
                var method = c.method;
                return method !== "extractTooltipDataPercentage" && method !== "extractTooltipDataTimebubble";
            });
        }
    });

    var TooltipPropertiesHelper = function(tooltip, options) {
        this._tooltip = tooltip;
        var map = tooltip._map;
        TooltipPropertiesHelper.superclass.constructor.call(this, map._interaction.properties().tooltip, options,
            map._templateManager);
    };

    oo.extend(TooltipPropertiesHelper, PropertiesHelper);

    TooltipPropertiesHelper.prototype._getTemplateProperties = function(templateManager) {
        return templateManager._getTooltipProperties();
    };

    TooltipPropertiesHelper.prototype._onChange = function() {
        hide(this._tooltip._map._interaction._service);
    };

    /**
     * @class
     * @alias sap.viz.geo.dataviz.Tooltip
     */
    var Tooltip = function(map, options) {
        this._map = map;
        this._propertiesHelper = new TooltipPropertiesHelper(this, options);
    };

    Object.defineProperty(Tooltip.prototype, "_properties", {
        get : function() {
            return this._propertiesHelper.get();
        }
    });

    /**
     * Get/set the properties of tooltip.
     * 
     * @param {Object}
     *            [properties] the updating properties object
     * 
     * @returns {Object|sap.viz.geo.dataviz.Tooltip} If no arguments, it will
     *          return current properties object;otherwise, it will update
     *          properties with given parameter and return tooltip object
     *          itself.
     */
    Tooltip.prototype.properties = function() {
        if (arguments.length) {
            this._propertiesHelper.update(arguments[0]);
            return this;
        }
        return ObjectUtils.clone(this._properties);
    };

    Tooltip.prototype.destroy = function() {
        this._propertiesHelper.destroy();
    };

    return Tooltip;
});

define('sap/viz/geo/BasemapSwitcher',[
    "sap/viz/framework/common/lang/LangManager",
    "sap/viz/geo/interaction/behavior",
    "sap/viz/geo/EventSource"
], function(
    langManager,
    behavior,
    EventSource
) {

    var CSS_CLASS_SELECTED = "selected";
    var CSS_CLASS_BASE_MAP = "basemap";
    var CSS_CLASS_EXPAND = "expand";

    behavior.addActionByDef({
        "id" : "click_basemapSwitcher",
        "triggerEvent" : {
            "name" : "click",
            "targets" : CSS_CLASS_BASE_MAP
        },
        "handler" : function(event, service) {
            var basemapNode = event.data.currentTarget;
            var switcherNode = basemapNode.parentNode;
            var switcher = d3.select(switcherNode);
            var expand = switcher.classed(CSS_CLASS_EXPAND);
            switcher.classed(CSS_CLASS_EXPAND, !expand);

            if (expand) {
                var switcherInstance = switcher.datum();
                var basemapName = d3.select(basemapNode).datum().name;
                var currentName = switcherInstance._current;
                if (basemapName !== currentName) {
                    switcherInstance._fireEvent("switch", basemapName, currentName).then(function() {
                        switcherInstance._fireEvent("switchEnd", basemapName, currentName);
                    });
                }
            }
        }
    });

    function updateTitle() {
        var basemaps = this._basemaps;
        if (basemaps) {
            basemaps.attr("title", function(d) {
                return langManager.get(d.langCode);
            });
        }
    }

    function applyCurrent() {
        var basemaps = this._basemaps;
        if (basemaps) {
            var selectedBasemapNode, current = this._current;
            basemaps.classed(CSS_CLASS_SELECTED, function(d) {
                var selected = d.name === current;
                if (selected) {
                    selectedBasemapNode = this;
                }

                return selected;
            });
            if (selectedBasemapNode) {
                var switcherNode = this._switcher.node();
                var topRightNode = switcherNode.childNodes[1];
                if (selectedBasemapNode !== topRightNode) {
                    var selectedNodeSibling = selectedBasemapNode.nextSibling;
                    var topRightNodeNodeSibling = topRightNode.nextSibling;
                    switcherNode.insertBefore(selectedBasemapNode, topRightNodeNodeSibling);
                    switcherNode.insertBefore(topRightNode, selectedNodeSibling);
                }
            }
        }
    }

    function applyDisplay() {
        var switcher = this._switcher;
        if (switcher) {
            switcher.classed('show', !this._hidden && this._switcher.node().hasChildNodes());
        }
    }

    /**
     * The base map switcher component of map. It should not be created directly and can be retrieved
     * by {@link sap.viz.geo.Map#getBasemapSwitcher|"getBasemapSwitcher"} of map instance.
     * 
     * @class
     * @alias sap.viz.geo.BasemapSwitcher
     */    
    var BaseMapSwitcher = function(container) {
        EventSource.init.call(this);
        this._hidden = false;
        this._switcher = d3.select(container).append("div").attr("class", "basemapSwitcher").datum(this);
        langManager.addListener(this._langListener = {
            fn : updateTitle,
            scope : this
        });
    };
    
    /**
     * Fires when the base map switcher is switching the base map by clicking/tapping.
     * And the new and current base map names as parameters will be transferred to listener.
     * 
     * @event sap.viz.geo.BasemapSwitcher#switch
     */
    
    /**
     * Fires when the base map is changed by the base map switcher and re-rendering is over.
     * And the new and current base map names as parameters will be transferred to listener.
     * 
     * @event sap.viz.geo.BasemapSwitcher#switchEnd
     */
    
    EventSource.mixin.call(BaseMapSwitcher.prototype);

    BaseMapSwitcher.prototype._setBasemapConfigs = function(mapTypes) {
        var switcher = this._switcher;
        if (switcher) {
            mapTypes = mapTypes || [];
            var basemaps = switcher.selectAll("." + CSS_CLASS_BASE_MAP).data(mapTypes);
            basemaps.exit().remove();
            basemaps.enter().append("img").attr("class", CSS_CLASS_BASE_MAP);
            this._basemaps = basemaps;
            basemaps.attr("src", function(d) {
                return d.img;
            });
            updateTitle.call(this);
            applyCurrent.call(this);
            applyDisplay.call(this);
        }
        return this;
    };

    BaseMapSwitcher.prototype._setCurrent = function(current) {
        if (this._current !== current) {
            this._current = current;
            applyCurrent.call(this);
        }
        return this;
    };

    /**
     * Get/set the visibility.
     * 
     * @param {boolean}
     *            [visible] a boolean value to set the visibility of base map
     *            switcher
     * @returns {sap.viz.geo.BasemapSwitcher|boolean}the base map switcher
     *          object itself(setting) or the visibility of base map
     *          switcher(getting)
     */
    BaseMapSwitcher.prototype.visible = function() {
        if (arguments.length) {
            this._hidden = !arguments[0];
            applyDisplay.call(this);
            return this;
        }

        return !this._hidden;
    };

    BaseMapSwitcher.prototype._destroy = function() {
        var switcher = this._switcher;
        if (switcher) {
            switcher.remove();
        }
        langManager.removeListener(this._langListener);
        this._switcher = null;
        this._basemaps = null;
    };

    return BaseMapSwitcher;
});

define('sap/viz/geo/basemap/AbstractProvider',[
    "sap/viz/framework/common/util/oo",
    "sap/viz/geo/utils/PropertiesHelper",
    "require",
    "jquery",
    "sap/viz/geo/EventSource",
    "exports"
], function(
    oo,
    PropertiesHelper,
    require,
    $,
    EventSource
) {

    var CustomPropertiesHelper = function(provider, defaultProps, userProps) {
        this._provider = provider;
        CustomPropertiesHelper.superclass.constructor.call(this, defaultProps, userProps);
    };

    oo.extend(CustomPropertiesHelper, PropertiesHelper);

    CustomPropertiesHelper.prototype._getTemplateProperties = function(TemplateManager) {
        return TemplateManager._getMapProviderProperties(this._provider._id);
    };

    CustomPropertiesHelper.prototype._onChange = function() {
        return this._provider._onPropertiesChange();
    };
    /**
     * Create a new base map provider object. The concrete providers should call
     * this constructor in their own constructors with necessary parameters.
     * 
     * @constructor
     * @alias sap.viz.geo.basemap.AbstractProvider
     * @param {Object}
     *            options the configuration object
     * @param {Object}
     *            defaultOptions the default configuration object which will be
     *            merged with input options. The concrete providers can specify
     *            default configuration here.
     */
    var AbstractProvider = function(options, defaultOptions, id) {
        EventSource.init.call(this);
        this._id = id;
        this._propertiesHelper = new CustomPropertiesHelper(this, defaultOptions, options);
    };

    EventSource.mixin.call(AbstractProvider.prototype);

    Object.defineProperty(AbstractProvider.prototype, "_options", {
        get : function() {
            return this._propertiesHelper.get();
        }
    });

    AbstractProvider.prototype._setTemplateManager = function(tm) {
        this._propertiesHelper.setTemplateManager(tm);
    };
    
    AbstractProvider.prototype._onPropertiesChange = function() {

    };
    
    AbstractProvider.prototype._onPanStart= function(){
        this._fireEvent("panStart");
        return this;
    };
    
    AbstractProvider.prototype._onPan = function(delta){
        this._fireEvent("pan", delta);
        return this;
    };
    
    AbstractProvider.prototype._onPanEnd= function(delta){
        this._fireEvent("panEnd", delta);
        return this;
    };
    
    AbstractProvider.prototype._onPanComplete = function(){
        this._fireEvent("panComplete").then(function(){
            this._fireEvent("_panCompleteDone");
        }.bind(this));
        return this;
    };
    
    AbstractProvider.prototype._onZoomStart = function(){
        this._fireEvent("zoomStart");
        return this;
    };
    
    AbstractProvider.prototype._onZoomEnd = function(){
        this._fireEvent("zoomEnd");
        return this;
    };
    
    AbstractProvider.prototype._onZoomComplete = function(){
        this._fireEvent("zoomComplete").then(function(){
            this._fireEvent("_zoomCompleteDone");
        }.bind(this));
        return this;
    };
    
    AbstractProvider.prototype._onBasemapChange = function(){
        this._fireEvent("basemapChange");
        return this;
    };

    /**
     * Render the base map.
     * 
     * @abstract
     * @param {HTMLElement}
     *            container the HTML DOM element to contain the base map
     * @param {Function}
     *            onRendered a call back function which will be called when base
     *            map complete rendering
     * 
     * @returns the provider object itself
     */
    AbstractProvider.prototype.render = function(container, onRendered) {
        return this;
    };

    /**
     * Destory the base map. The concrete providers should clean their
     * footprints such as removing DOM elements,purging event listeners and so
     * on.
     * 
     * @abstract
     * @returns the provider object itself
     */
    AbstractProvider.prototype.destroy = function() {
        this._propertiesHelper.destroy();
        EventSource.destroy.call(this);
        return this;
    };

    /**
     * Get/set the bounds of base map.
     * 
     * @abstract
     * 
     * @param {sap.viz.geo.Bounds}
     *            [bounds] When setting the bounds, base map provider should
     *            adjust the center and scale of map to fully contain the given
     *            bounds.
     * 
     * @returns the bounds(getting) or a promise object which will be resolved
     *          after map's bounds is changed and rendering is over(setting).
     * 
     */
    AbstractProvider.prototype.bounds = function() {};

    /**
     * Return a DOM node which the overlay layers will be appended to. Overlay
     * layers must be inserted into base map so that they won't intercept the
     * mouse events such as "panning" or "zooming".
     * 
     * @abstract
     * @returns {HTMLElement}
     * 
     */
    AbstractProvider.prototype.getOverlayContainerRootNode = function() {
    };

    /**
     * Convert a geographic coordinate to screen coordinate.
     * 
     * @abstract
     * @param {Array}
     *            lnglat an array holding longitude and latitude values
     * 
     * @returns {Array} an array holding x and y values
     * 
     */
    AbstractProvider.prototype.toPixel = function(lngLat) {
        return [
            0, 0
        ];
    };

    /**
     * Convert a screen coordinate to geographic coordinate.
     * 
     * @abstract
     * @param {Array}
     *            point an array holding x and y values to be converted
     * 
     * @returns {Array} an array holding longitude and latitude values
     * 
     */
    AbstractProvider.prototype.toLngLat = function(point, linear) {
        return [
            0, 0
        ];
    };

    /**
     * Judge if the boundingBox intersects with the map area.
     * 
     * @abstract
     * @param {Array}
     *            boundingBox an two dim array holding bounding values
     * @returns {Array} an two dim array that defines the intersect area, null
     *          if they are not intersect
     */
    AbstractProvider.prototype.intersects = function(boundingBox) {
        return this;
    };

    /**
     * Zoom out one level
     * 
     * @abstract
     * @param {number}
     *            direction the zoom direction zoom in is - zoom out is +
     */
    AbstractProvider.prototype.zoom = function(direction) {
        return this;
    };

    /**
     * Enable or disable pan.
     * 
     * @abstract
     * @param boolean
     *            enablePan enable pan or not
     * @returns the provider object itself
     * 
     */
    AbstractProvider.prototype.togglePan = function(enablePan) {
        return this;
    };

    /**
     * Refresh base provider and keep orginal bounding box view.
     * 
     * @returns the provider object itself
     * 
     */
    AbstractProvider.prototype.refresh = function() {
        return this;
    };

    AbstractProvider.prototype.toJSON = function() {
        return {
            id : this._id,
            options :this._propertiesHelper.getUserProperties()
        };
    };

    AbstractProvider.prototype.needRenderOnPan = function() {
        return false;
    };

    /**
     * Return an array including the available base map informations of this map provider.
     * Every base map is described as an object like:
     * <pre>
     * {
     *     name : "streets", // the name of base map
     *     langCode : "IDS_STREETS", // the language key of base map's name for i18n
     *     img : "streets.png" // the thumbnail image url of base map
     * }
     * </pre>
     * 
     * @returns {Array} 
     */
    AbstractProvider.prototype.getBasemapConfigs = function() {
        return null;
    };
    
    /**
     * Set the base map. The map provider will change the base map at once.
     * @param {String} basemap the name of base map
     * 
     * @returns the provider object itself
     */
    AbstractProvider.prototype.setBasemap = function(basemap) {
        return this._propertiesHelper.update({
            basemap : basemap 
        });
    };
    
    /**
     * Get the name of current base map.
     * 
     * @returns {String}
     */
    AbstractProvider.prototype.getBasemap = function() {
        return this._propertiesHelper.get().basemap;
    };
    
    AbstractProvider._deserialize = function(o){
        var d = $.Deferred();
        require([
            o.id.replace(/\./g, '\/')
        ], function(Provider) {
            var instance = Object.create(Provider.prototype);
            var argsBuilder = Provider._buildConstructorArgsFromSerialization ||
                AbstractProvider._buildConstructorArgsFromSerialization;
            Provider.apply(instance, argsBuilder(o));
            d.resolve(instance);
        });
        return d.promise();
    };
    
    AbstractProvider._buildConstructorArgsFromSerialization = function(o){
        return [o.options];
    };

    return AbstractProvider;
});
define('sap/viz/geo/migrate/serialization',[],function() {
    var VERSION_SEG_COUNT = 3, VERSION_SEP = ".";
    function getVersionSegments(version) {
        var ret = version == null ? [] : version.split(VERSION_SEP);
        var i;
        for (i = 0; i < VERSION_SEG_COUNT; i++) {
            if (ret[i] == null) {
                ret[i] = 0;
            }
        }
        return ret.slice(0, VERSION_SEG_COUNT);
    }

    function compare(a, b) {
        var c = a - b;
        return c === 0 ? 0 : (c > 0 ? 1 : -1);
    }

    function compareVersionSegments(a, b) {
        var i, c;
        for (i = 0; i < VERSION_SEG_COUNT; i++) {
            c = compare(a[i], b[i]);
            if (c !== 0) {
                break;
            }
        }

        return c;
    }

    return function(migrators) {
        migrators.forEach(function(migrator) {
            migrator.fromSegments = getVersionSegments(migrator.from);
            migrator.toSegments = getVersionSegments(migrator.to);
        });

        return function(serialization) {
            // a regular serialization must have baseMap property. Do nothing if
            // not a regular serialization (BITSDC1-5917)
            if (!serialization.baseMap) {
                return;
            }
            var versionSegs = getVersionSegments(serialization.version), flag = false;
            migrators.forEach(function(migrator) {
                if (!flag && compareVersionSegments(versionSegs, migrator.fromSegments) >= 0 &&
                    compareVersionSegments(versionSegs, migrator.toSegments) < 0) {
                    flag = true;
                }

                if (flag) {
                    migrator(serialization);
                    serialization.version = migrator.to;
                }
            });
        };
    };
});
define('sap/viz/geo/migrate/UndefTo5_8_0',[],function() {
    var fn = function(serialization) {
        var oriMapProviderOptions = serialization.baseMap.options;
        var newMapProviderOptions = {
            center : oriMapProviderOptions.center,
            zoom : oriMapProviderOptions.zoom
        };

        var mapProviderBasemap = oriMapProviderOptions.basemap;
        if (mapProviderBasemap !== "topo") {
            newMapProviderOptions.basemap = mapProviderBasemap;
        }

        serialization.baseMap.options = newMapProviderOptions;

        serialization.layers.forEach(function(layer) {
            if(layer.options.tooltipFormat){
                layer.options.tooltip = {
                    "formatString" : layer.options.tooltipFormat
                };
                delete layer.options.tooltipFormat;
            }
        });

        serialization.vizs.forEach(function(viz) {
            var oriVizProps = viz.options;
            var newVizProps = {};

            var legendName;
            switch (viz.id) {
            case "sap.viz.geo.dataviz.Choropleth":
                legendName = "mbcLegend";
                break;
            case "sap.viz.geo.dataviz.Bubble":
                legendName = "sizeLegend";
                break;
            }

            if (legendName) {
                var legend = oriVizProps[legendName];
                if (legend && legend.formatString) {
                    newVizProps[legendName] = legend;
                }
            }

            var cluster = oriVizProps.cluster;
            if (cluster && cluster.enabled) {
                newVizProps.cluster = {
                    enabled : cluster.enabled
                };
            }

            var dataLabel = oriVizProps.dataLabel;
            if (dataLabel) {
                var newDataLabelProps = {}, empty = true;
                if (dataLabel.visible) {
                    newDataLabelProps.visible = dataLabel.visible;
                    empty = false;
                }
                if (dataLabel.format) {
                    newDataLabelProps.format = dataLabel.format;
                    empty = false;
                }
                if (!empty) {
                    newVizProps.dataLabel = newDataLabelProps;
                }
            }

            viz.options = newVizProps;
        });
    };

    fn.to = "5.8.0";
    return fn;
});
define('sap/viz/geo/utils/Serialization',[
    "sap/viz/geo/Constants",
    "sap/viz/api/data/FlatTableDataset",
    "sap/viz/geo/dataviz/Layer",
    "sap/viz/geo/basemap/AbstractProvider",
    "sap/viz/geo/dataviz/AbstractViz",
    "jquery",
    "sap/viz/geo/migrate/serialization",
    "sap/viz/geo/migrate/UndefTo5_8_0",
    "exports"
], function(
    Constants,
    FlatTableDataset,
    Layer, 
    AbstractProvider,
    AbstractViz,
    $,
    migrateSerialization
) {
    /**
     * set of serialization utils.
     * 
     * @class sap.viz.geo.utils.Serialization
     * @example <caption>How to use geo serialization utils</caption>
     * 
     * <pre>
     * var chart = sap.viz.api.core.createViz({ type : 'viz/geomap',
     *          container : $('#mapContainer'), options : { geomap : { baseMap :
     *          baseMapProvider } } });
     * 
     * var map = chart.action(&quot;getMap&quot;);
     * var data = { &quot;metadata&quot; : { &quot;fields&quot; : [
     *           { &quot;id&quot; : &quot;Location&quot;,
     *             &quot;name&quot; : &quot;Location&quot;,
     *             &quot;semanticType&quot; : &quot;Dimension&quot;,
     *             &quot;dataType&quot; : &quot;String&quot; },
     *           { &quot;id&quot; : &quot;Value&quot;,
     *             &quot;name&quot; : &quot;Value&quot;,
     *             &quot;semanticType&quot; : &quot;Measure&quot; }] }, 
     *           &quot;data&quot; : [[&quot;21017506,NAVTEQ&quot;, 3000],
     *                               [&quot;21010593,NAVTEQ&quot;, 4000],
     *                               [&quot;21020341,NAVTEQ&quot;, 5000]],
     *           &quot;info&quot; : [{ &quot;type&quot; : &quot;geo&quot;, 
     *                                 &quot;info&quot; : [[{'type' : sap.viz.geo.LocationType.FEATURE_ID }],
     *                 [{ 'type' : sap.viz.geo.LocationType.FEATURE_ID }],
     *                  [{ 'type' : sap.viz.geo.LocationType.FEATURE_ID }]] }] };
     * 
     * var ds = new sap.viz.api.data.FlatTableDataset(data); var feeding = {
     * location : 'Location', color : 'Value' };
     * 
     * map.addLayer(new sap.viz.geo.dataviz.Layer({ viz : new
     * sap.viz.geo.dataviz.Choropleth(), data : ds, feeding : feeding }));
     * 
     * var json = map.toJSON();
     * var newFeeding = sap.viz.geo.utils.serialization.getFeeds(json);
     * json = sap.viz.geo.utils.serialization.removeDataset(json);
     * 
     * var updateData = { &quot;metadata&quot; : { &quot;fields&quot; :
     *          [{ &quot;id&quot; : &quot;Location&quot;, 
     *             &quot;name&quot; : &quot;Location&quot;,
     *             &quot;semanticType&quot; : &quot;Dimension&quot;,
     *             &quot;dataType&quot; : &quot;String&quot; },
     *           { &quot;id&quot; : &quot;Value&quot;, 
     *             &quot;name&quot; : &quot;Value&quot;,
     *             &quot;semanticType&quot; : &quot;Measure&quot; }] },
     *           &quot;data&quot; :
     *                 [[&quot;21017506,NAVTEQ&quot;, 2000],
     *                 [&quot;21010593,NAVTEQ&quot;, 3000],
     *                 [&quot;21020341,NAVTEQ&quot;,500]],
     *           &quot;info&quot; : [{ &quot;type&quot; : &quot;geo&quot;,
     *                                 &quot;info&quot; : [[{ 'type' : sap.viz.geo.LocationType.FEATURE_ID }], 
     *           [{ 'type' : sap.viz.geo.LocationType.FEATURE_ID }], 
     *           [{ 'type' : sap.viz.geo.LocationType.FEATURE_ID }]] }] };
     * 
     * var newData = new sap.viz.api.data.FlatTableDataset(updateData); 
     * json =  sap.viz.geo.utils.serialization.updateDataset(json, [newData]);
     * var chart2 = sap.viz.api.core.createViz({ type : 'viz/geomap', container : $('#chart'));
     * var geomap = chart2.action(&quot;getMap&quot;); geomap.fromJSON(json);
     * </pre>
     * 
     */
    var Serialization = {};

    /**
     * @memberof sap.viz.geo.utils.Serialization
     * @param [value]
     *            serialization result from sap.viz.geo.Map.toJSON
     * @returns array of all geomap layers feeding
     * 
     */
    Serialization.getFeeds = function(value) {
        var feeds = value.layers.map(function(d) {
            return d.feeding;
        });
        return feeds;
    };

    /**
     * remove all geo map layers dataset, it will change serialization result
     * directly
     * 
     * @memberof sap.viz.geo.utils.Serialization
     * @param [value]
     *            serialization result from sap.viz.geo.Map.toJSON()
     * @returns updated serialization result
     */
    Serialization.removeDataset = function(value) {
        var i;
        for (i = 0; i < value.layers.length; ++i) {
            value.layers[i].dataIndex = -1;
        }
        value.data = [];
        return value;
    };

    Serialization.removeLayerDataset = function(value, layerIndex) {
        if (layerIndex < 0 || layerIndex >= value.layers.length) {
            return value;
        }

        if (value.layers[layerIndex].dataIndex === -1) {
            return value;
        }

        var dataIndex = value.layers[layerIndex].dataIndex;
        var refCount = 0;
        var i;
        for (i = 0; i < value.layers.length; ++i) {
            if (value.layers[i].dataIndex === dataIndex) {
                refCount++;
            }
        }

        value.layers[layerIndex].dataIndex = -1;
        if (refCount === 1) {
            value.data.splice(dataIndex, 1);
            for (i = 0; i < value.layers.length; ++i) {
                if (value.layers[i].dataIndex > dataIndex) {
                    value.layers[i].dataIndex--;
                }
            }
        }
        return value;
    };

    /**
     * Update one geomap layer's dataset, if index is not validated, we will not
     * change input
     * 
     * @memberof sap.viz.geo.utils.Serialization
     * @param [value]
     *            serialization result from sap.viz.geo.Map.toJSON()
     * @param [index]
     *            index of geomap layer to update
     * @param [dataset]
     *            the Flattable to update layer data
     * @returns updated serialization result
     * @ignore
     */
    Serialization.updateLayerDataset = function(value, index, dataset) {
        if (index < 0 || index >= value.layers.length) {
            return value;
        }
        Serialization.removeLayerDataset(value, index);
        if (dataset != null) {
            value.layers[index].dataIndex = value.data.length;
            value.data.push(dataset.toJSON());
        }
        return value;
    };

    /**
     * Update all geomap layer's dataset, it will change input value directly.
     * if no datasetArr, just remove all layers' data.
     * 
     * @memberof sap.viz.geo.utils.Serialization
     * @param [value]
     *            serialization result from sap.viz.geo.Map.toJSON()
     * @param [datasetArr]
     *            array of Flattable to update value
     * @returns updated serialization result
     */
    Serialization.updateDataset = function(value, datasetArr) {

        Serialization.removeDataset(value);
        if (!datasetArr || datasetArr.length === 0 || value.layers.length === 0) {
            return value;
        }

        var length = datasetArr.length > value.layers.length ? value.layers.length : datasetArr.length;
        var dataArr = [];
        var dataIndexes = [];
        var i = 0;
        for (i = 0; i < length; ++i) {
            if (datasetArr[i]) {
                var curIndex = dataArr.indexOf(datasetArr[i]);
                if (curIndex === -1) {
                    dataIndexes.push(dataArr.length);
                    dataArr.push(datasetArr[i]);
                } else {
                    dataIndexes.push(curIndex);
                }
            } else {
                dataIndexes.push(-1);
            }
        }

        // if input data less than layers number, we keep the remain layers

        for (i = 0; i < length; ++i) {
            value.layers[i].dataIndex = dataIndexes[i];
        }

        for (i = 0; i < dataArr.length; ++i) {
            value.data.push(dataArr[i].toJSON());
        }

        return value;
    };

    Serialization.migrate = migrateSerialization(Array.prototype.slice.call(arguments, 7, arguments.length - 1));

    var CHART_TYPE = Constants.CHART_TYPE;
    Serialization._serialize = function(map, options) {
        var ret = {
            "type" : CHART_TYPE
        };

        if (sap.viz.api.hasOwnProperty("VERSION")) {
            ret.version = sap.viz.api.VERSION;
        }

        var mapProvider = map.baseMap();
        if (mapProvider) {
            ret.baseMap = mapProvider.toJSON();
        }
        
        ret.template = map.getTemplateManager().templateId();
        
        var layers = map.getLayers();
        var skipData = options && (options.discardData || options.emptyDataset);
        var vizArr = [], dataArr;
        
        if (!skipData) {
            dataArr = [];
        }

        ret.layers = map.getLayers().map(function(layer) {
            var ret = {
                id : "sap.viz.geo.dataviz.Layer",
                options : {
                    visible : layer.visibility(),
                    legendVisible : layer.legendVisibility(),
                    tooltip : layer.tooltip()
                },
                feeding : layer.feeding()
            };

            var viz = layer.viz();
            if (viz) {
                var vizIndex = vizArr.indexOf(viz);
                if (vizIndex === -1) {
                    vizIndex = vizArr.push(viz) - 1;
                }
                ret.vizIndex = vizIndex;
            }

            if (!skipData) {
                var data = layer.data();
                if (data) {
                    var dataIndex = dataArr.indexOf(data);
                    if (dataIndex === -1) {
                        dataIndex = dataArr.push(data) - 1;
                    }
                    ret.dataIndex = dataIndex;
                }
            }

            return ret;
        });

        ret.vizs = vizArr.map(function(o) {
            return o.toJSON();
        });

        if (dataArr) {
            ret.data = dataArr.map(function(o) {
                return o.toJSON();
            });
        }
        
        return ret;
    };

    Serialization._deserialize = function(map, serialization) {
        var d = $.Deferred();
        map.getTemplateManager().templateId(serialization.template).then(function() {
            AbstractProvider._deserialize(serialization.baseMap).then(function(mapProvider) {
                map.baseMap(mapProvider, function() {
                    var layerSers = serialization.layers;
                    if (layerSers) {
                        var dataSers = serialization.data;
                        var dataSets = dataSers ? dataSers.map(function(o) {
                            return FlatTableDataset.fromJSON(o);
                        }) : [];

                        var vizSers = serialization.vizs;

                        var fn = function(vizs) {
                            layerSers.forEach(function(layerSer) {
                                var options = layerSer.options;

                                var layer = new Layer({
                                    data : dataSets[layerSer.dataIndex],
                                    feeding : layerSer.feeding,
                                    viz : vizs ? vizs[layerSer.vizIndex] : undefined,
                                    tooltip : options.tooltip,
                                    legendVisible : options.legendVisible
                                }).visibility(options.visible);

                                map.addLayer(layer);
                            });

                            map.then(function() {
                                d.resolve();
                            });
                        };

                        if (vizSers) {
                            $.when.apply(null, vizSers.map(function(o) {
                                return AbstractViz._deserialize(o);
                            })).then(function() {
                                fn(Array.prototype.slice.call(arguments, 0));
                            });
                        } else {
                            fn();
                        }
                    } else {
                        d.resolve();
                    }
                });
            });
        });
        return d.promise();
    };

    return Serialization;
});
define('sap/viz/geo/TemplateManager',[
    "sap/viz/framework/common/template/TemplateManager",
    "jquery",
    "sap/viz/geo/Constants"
], function(
    TemplateManager,
    $,
    Constants
) {

    var CHART_TYPE = Constants.CHART_TYPE;
    var RE_CSS_SEARCH = new RegExp("\\." + Constants.CSS_CLASS.ROOT + " ", "g");
    
    /**
     * The template manager of map instance. This constructor should not be used
     * directly. A map's template manager object can be retrieved by its
     * {@link sap.viz.geo.Map#getTemplateManager|"getTemplateManager"} function.
     * 
     * @class
     * @alias sap.viz.geo.TemplateManager
     */
    var GeoTemplateManager = function(id) {
        this._id = id;
        this._listeners = [];
        registerGlobalListener.call(this);
    };

    function registerGlobalListener() {
        var gl = this._globalListener;
        if (!gl) {
            TemplateManager.addListener(this._globalListener = {
                fn : function(){
                    applyTemplateProps.call(this);
                },
                scope : this
            });
        }
    }

    function unregisterGlobalListener() {
        var gl = this._globalListener;
        if (gl) {
            TemplateManager.removeListener(gl);
            delete this._globalListener;
        }
    }

    function callListeners() {
        return $.when.apply(null, this._listeners.map(function(o) {
            return o(this);
        }, this));
    }    

    function getTemplate(templateId){
        var d = $.Deferred(), ret;

        var fn = function(){
            d.resolve(ret);
        };

        if(templateId != null){
            var fn2 = function() {
                var template = TemplateManager.retrieve(templateId);

                if (template) {
                    var props = template.properties;
                    if(CHART_TYPE in props){
                        if(!ret){
                            ret = {};
                        }
                        ret.props = props[CHART_TYPE];      
                    }

                    if(template.cssFlag){
                        $.get(template.path + template.id + "/template.css").then(function(css) {
                            if(!ret){
                                ret = {};
                            }
                            ret.css = css;
                        }).always(fn);
                        return;
                    }
                }
                fn();
            };

            if (!TemplateManager.isLoaded(templateId)) {
                TemplateManager.load(templateId, fn2);
            } else {
                fn2();
            }
        }else{
            fn();
        }

        return d.promise();
    }

    function getCurrent() {
        if (!this.hasOwnProperty("_current")) {
            this._current = TemplateManager.current().props(CHART_TYPE);
        }

        return this._current;
    }

    function applyTemplateProps() {
        if (arguments.length) {
            this._current = arguments[0];
        } else {
            delete this._current;
        }
        return callListeners.call(this);
    }

    /**
     * Get/set the template id used in this map instance.
     *
     * @param {string}
     *            [templateId] the template id to be set. Set null/undefined/""
     *            to clear the template of map instance.
     * 
     * @returns {string|Promise} if called without argument, return the id of
     *          template used in map instance; otherwise, return a promise
     *          object which will be resolved when new template is applied to
     *          map.
     */
    GeoTemplateManager.prototype.templateId = function(templateId) {
        if (arguments.length) {
            if (templateId === "") {
                templateId = null;
            }

            var d = $.Deferred();

            if (templateId == this._templateId) {
                d.resolve();
            } else {
                this._templateId = templateId;

                getTemplate(templateId).then(function(ret){
                    var style = this._style;
                    if (style) {
                        style.textContent = "";
                    }

                    var args;
                    if(!ret){
                        registerGlobalListener.call(this);
                    }else{
                        unregisterGlobalListener.call(this);

                        var css = ret.css;
                        if(css){
                            if (!style) {
                                style = this._style = document.head.appendChild(document.createElement("style"));
                            }
                            style.textContent = css.replace(RE_CSS_SEARCH, "#" + this._id + "$&");
                        }

                        args = [ret.props];
                    }

                    return applyTemplateProps.apply(this, args).always(function(){
                        d.resolve();
                    });           
                }.bind(this));
            }
            return d.promise();
        }

        return this._templateId;
    };
    
    GeoTemplateManager.prototype._destroy = function() {
        var style = this._style;
        if (style) {
            style.parentNode.removeChild(style);
        }
        delete this._style;
        delete this._id;

        unregisterGlobalListener.call(this);
        delete this._listeners;
        delete this._current;
        delete this._templateId;
        return this;
    };
    
    GeoTemplateManager.prototype._getTooltipProperties = function() {
        var current = getCurrent.call(this);
        return current && current.tooltip;
    };
    
    GeoTemplateManager.prototype._getVizProperties = function(vizId) {
        var current = getCurrent.call(this);
        var viz = current && current.viz;
        return viz && viz[vizId];
    };
    
    GeoTemplateManager.prototype._getMapProviderProperties = function(providerId) {
        var current = getCurrent.call(this);
        var mapProvider = current && current.mapProvider;
        return mapProvider && mapProvider[providerId];
    };
    
    GeoTemplateManager.prototype._addListener = function(listener) {
        var listeners = this._listeners;
        if (listeners.indexOf(listener) === -1) {
            listeners.push(listener);
        }
        return this;
    };
    
    GeoTemplateManager.prototype._removeListener = function(listener) {
        var listeners = this._listeners;
        var index = listeners.indexOf(listener);
        if (index !== -1) {
            listeners.splice(index, 1);
        }
        return this;
    };

    return GeoTemplateManager;
});
define('sap/viz/geo/repository/AbstractRepository',['sap/viz/framework/common/util/FunctionUtils', 'exports'], function(FunctionUtils) {
    var AbstractRepository = function() {};

    AbstractRepository.prototype.getFeaturesByIds = FunctionUtils.unimplemented;

    AbstractRepository.prototype.searchByNames = FunctionUtils.unimplemented;

    return AbstractRepository;
});

define('sap/viz/geo/repository/CompositeRepository',[
    'sap/viz/framework/common/util/oo',
    'sap/viz/geo/repository/AbstractRepository',
    'sap/viz/framework/common/util/FunctionUtils',
    'sap/viz/framework/common/util/ObjectUtils',
    'jquery',
    'exports'
], function(oo, AbstractRepository, FunctionUtils, ObjectUtils, $) {
    var CompositeRepository = function() {
        this._repos = Array.prototype.slice.apply(arguments);
    };

    oo.extend(CompositeRepository, AbstractRepository);

    CompositeRepository.prototype.getRepositories = function() {
        return this._repos.slice();
    };

    CompositeRepository.prototype.addRepository = function(repo) {
        var repoId = repo.getId(),
            repos = this._repos;
        if (repos.some(function(repo) {
                return repoId === repo.getId();
            })) {
            FunctionUtils.error('A repository with same id "{0}" exists.', repoId);
        }
        this._repos.push(repo);
        return this;
    };

    CompositeRepository.prototype.removeRepository = function(repo) {
        var repos = this._repos;
        var index = repos.indexOf(repo);
        if (index !== -1) {
            repos.splice(index, 1);
        }
        return this;
    };

    CompositeRepository.prototype.searchByNames = function(names) {
        var repos = this._repos;
        return $.when.apply(null, repos.map(function(repo) {
            return repo.searchByNames(names);
        })).pipe(function() {
            var rets = arguments;
            return names.map(function(name, index) {
                var ret = [];
                Array.prototype.forEach.call(rets, function(repoRets) {
                    ret = ret.concat(repoRets[index]);
                });

                return ret;
            });
        });
    };

    CompositeRepository.prototype.getFeaturesByIds = function(featureIds) {
        var repos = this._repos,
            repoLen = repos.length;
        var array = [], invalid = [];
        featureIds.forEach(function(featureId) {
            for (var i = 0; i < repoLen; i++) {
                if (repos[i].isValidFeatureId(featureId)) {
                    var arr = array[i];
                    if (!arr) {
                        arr = array[i] = [];
                    }

                    arr.push(featureId);
                    return;
                }                
            }
            invalid.push(featureId);
        });

        return $.when.apply(null, array.map(function(arr, index) {
            if (arr) {
                return repos[index].getFeaturesByIds(arr);
            }
        })).pipe(function() {
            var result = {};
            Array.prototype.forEach.call(arguments, function(ret) {
                ObjectUtils.extend(result, ret);
            });
            invalid.forEach(function(featureId){
                result[featureId] = null;
            });
            return result;
        });
    };

    CompositeRepository.prototype.getWorldMapFeatures = function() {
        var repos = this._repos;
        for (var i = 0, len = repos.length; i < len; i++) {
            var repo = repos[i];
            var fn = repo.getWorldMapFeatures;
            if (fn) {
                return fn.apply(repo, arguments);
            }
        }

        FunctionUtils.unsupported();
    };

    return CompositeRepository;
});

define('sap/viz/geo/repository/SingleRepository',['sap/viz/framework/common/util/oo',
    'sap/viz/geo/repository/AbstractRepository',
    'sap/viz/framework/common/util/FunctionUtils',
    'sap/viz/framework/common/util/ObjectUtils',
    'exports'
], function(oo, AbstractRepository, FunctionUtils, ObjectUtils) {
    var SingleRepository = function(providerId, version) {
        this._providerId = providerId;
        this._version = version;

        var id = providerId;
        if (version != null && version !== '') {
            id += '|' + version;
        }
        this._id = id;
    };

    oo.extend(SingleRepository, AbstractRepository);

    SingleRepository.prototype.getId = function() {
        return this._id;
    };

    SingleRepository.prototype.isValidFeatureId = function(featureId) {
        return featureId.substring(featureId.indexOf(',') + 1) === this._id;
    };

    SingleRepository.prototype.getFeaturesByIds = function(featureIds) {
        return this._getFeaturesByIdsInternal(featureIds.map(function(featureId) {
            return featureId.substring(0, featureId.indexOf(','));
        })).pipe(function(features) {
            var result = {};
            for (var i in features) {
                if(features.hasOwnProperty(i)){
                    var obj = this._processFeatures(features[i]);
                    result[obj.id] = obj;
                }
            }
            return result;
        }.bind(this));
    };

    SingleRepository.prototype._getFeaturesByIdsInternal = FunctionUtils.unimplemented;

    SingleRepository.prototype.searchByNames = function(names) {
        return this._searchByNamesInternal(names).pipe(function(rets) {
            rets.forEach(function(ret) {
                ret.forEach(function(item) {
                    while (item) {
                        item.featureId = appendId.call(this, item.featureId);
                        item = item.parent;
                    }
                }, this);
            }, this);

            return rets;
        }.bind(this));
    };

    SingleRepository.prototype._searchByNamesInternal = FunctionUtils.unimplemented;

    SingleRepository.prototype._processFeatures = function(feature) {
        var obj = ObjectUtils.extend(null, feature);
        obj.id = appendId.call(this, feature.id);
        return obj;
    };

    function appendId(featureId) {
        return featureId + ',' + this._id;
    }

    return SingleRepository;
});

define('sap/viz/geo/IFeatureResolver',[],
/* global d3:false */
function Setup() {

    /**
     * Getter/setter for the geo data resource path This MUST be called in order
     * to use this class as it initializes the feature look up tables
     */

    function IFeatureResolver() {

    }
    /**
     * Getter/setter for the geo data resource path This MUST be called in order
     * to use this class as it initializes the feature look up tables
     */
    IFeatureResolver.prototype.properties = function(_) {

    };

    /**
     * Getter/setter for GeoFeatureSearcher This MUST be called on order to
     * resolve detail map and load detail features
     */
    IFeatureResolver.prototype.featureSearcher = function(_) {

    };

    /**
     * Given a list of feature ID's, this method will return a list of geoJSON
     * features
     * 
     * @param featureIdList
     *            Array of feature IDs (string)
     * @param callback
     *            [function(featureIDMap)] callback invoked when features are
     *            loaded
     * 
     */
    IFeatureResolver.prototype.getFeatures = function(featureIdList, callback) {

    };

    /**
     * Given a search target box {x:x, y:y, w:width, h:height}, this method will
     * return a list of features those contains the specified box
     * 
     * @param searchTarget
     * @param callback
     *            [function(featureJsonMap)] callback invoked when features are
     *            loaded
     * 
     */
    IFeatureResolver.prototype.searchDetailFeatures = function(searchTarget, simplifyFactor, callback) {

    };

    /**
     * Given a feature list, this method will return a list of detail features
     * 
     * @param features
     *            feature list
     * @param callback
     *            [function(featureJsonMap)] callback invoked when features are
     *            loaded
     * 
     */
    IFeatureResolver.prototype.detailFeatures = function(features, simplifyFactor, callback) {

    };

    /**
     * Given a list of feature ID's, this method returns features that need to
     * be included in the base layer.
     * 
     * @param featureIdList
     *            Array of feature IDs (string)
     * @param callback
     *            [function(featureIDMap)] callback invoked when features are
     *            loaded
     * 
     */
    IFeatureResolver.prototype.baseLayerFeatures = function(featureIdList, callback) {

    };

    /**
     * get detail map id
     * 
     */
    IFeatureResolver.prototype.detailWorldMapId = function() {

    };

    IFeatureResolver.prototype.supportLoadOnDemand = function() {
        return false;
    };

    return IFeatureResolver;

});
define('sap/viz/geo/repository/nokia/LocalFeatureResolver',[
    'sap/viz/framework/common/util/TypeUtils', 'sap/viz/framework/common/util/FunctionUtils',
    'sap/viz/framework/common/util/ObjectUtils', 'sap/viz/framework/common/util/ObjectUtils',
    'sap/viz/geo/IFeatureResolver', 'sap/viz/framework/common/util/oo'
],
/* global d3:false */
function Setup(TypeUtils, FunctionUtils, ObjectUtils, Objects, IFeatureResolver, oo) {

    function isPointFeature(f) {
        var feat = f || {}, type = feat.type;
        return type === 'Point' || (type === 'Feature' && isPointFeature(feat.geometry));
    }

    function LocalFeatureResolver(prop) {
        this.navteqMapPath = 'navteq/';

        // TODO: for now, hard code here.
        this.detailMapSuffix = 'D';
        this.worldMapId = '0_L0';
        this._detailWorldMapId = this.worldMapId + this.detailMapSuffix;
        this.oceanMapId = "0_OCEAN";

        this.featureMapRequested = false;
        this.featureMap = null;
        this.featureSearcher_ = null;
        this.cacheBuster = '';
        this.mapCache = {};
        // name -> { queue:[], map: <geoJSON>}
        this.queue = []; // queue of 'getFeatures' requests
        this._properties = prop;
    }
    oo.extend(LocalFeatureResolver, IFeatureResolver);
    LocalFeatureResolver.prototype.loadFeatureMap = function() {
        if (!this.featureMapRequested) {
            var path = [
                this._properties.resourcePath, 'featureMap.json', this.cacheBuster
            ].join('');
            var self = this;
            d3.json(path, function(result) {
                self.featureMapRequested = false;
                self.featureMap = result;
                self.processQueue();
            });

            this.featureMapRequested = true;
        }
    };

    LocalFeatureResolver.prototype.processQueue = function() {
        var self = this;
        ObjectUtils.each(self.queue, function(i, queueObj) {
            self.resolveFeatures(queueObj.args[0], queueObj.args[1], self);
        });

        self.queue = [];
    };

    LocalFeatureResolver.prototype.resolveMapId = function(featureId) {
        if (!this.featureMap) {
            FunctionUtils.error('FeatureResolver: feature map was never initialized');
        }

        var mapIdx = this.featureMap.features[featureId], map = this.featureMap.maps[mapIdx];

        return map;
    };

    LocalFeatureResolver.prototype.featuresToMapName = function(featureIdList, unresolvedFeatures, requiredMaps,
        isDetail) {
        var self = this;
        // resolve the feature IDs from the location paths
        ObjectUtils.each(featureIdList, function(i, featureId) {
            var shortId = featureId, mapId = self.resolveMapId(shortId);

            if (mapId) {
                if (isDetail) {
                    mapId = mapId + this.detailMapSuffix;
                }

                if (!requiredMaps[mapId]) {
                    requiredMaps[mapId] = {};
                }

                requiredMaps[mapId][featureId] = true;
            } else {
                unresolvedFeatures.push(featureId);
            }
        });
    };

    LocalFeatureResolver.prototype.loadFeatureMaps = function(requiredMaps, geoJSONFeatures, featureCallback) {
        var self = this;
        var size = Object.keys(requiredMaps).length;
        var index = 0;

        if ((0 === size) && !TypeUtils.isEmptyObject(geoJSONFeatures) && TypeUtils.isFunction(featureCallback)) {
            featureCallback(geoJSONFeatures);
        }

        this.loadMaps(Object.keys(requiredMaps),
            function(mapIdList) {

                // get the geoJSON features from the cached maps
                ObjectUtils.each(mapIdList, function(i, mapId) {
                    var map = self.mapCache[mapId].map, featureIdMap = requiredMaps[mapId];

                    ObjectUtils.each(map.features, function(i, feature) {
                        if (featureIdMap[feature.id]) {
                            geoJSONFeatures[feature.id] = feature;

                            // break early if we've found all the
                            // features
                            delete featureIdMap[feature.id];
                            if (TypeUtils.isEmptyObject(featureIdMap)) {
                                return false; // break ObjectUtils.each
                            }
                        }
                    });
                });
                index += mapIdList.length;
                // callback with resolved features
                if ((index === size) && !TypeUtils.isEmptyObject(geoJSONFeatures) &&
                    TypeUtils.isFunction(featureCallback)) {
                    featureCallback(geoJSONFeatures);
                }
            });
    };

    LocalFeatureResolver.prototype.resolveFeatures = function(featureIdList, featureCallback, self) {
        var unresolvedFeatures = [], requiredMaps = {};

        // resolve the feature IDs from the location paths
        self.featuresToMapName(featureIdList, unresolvedFeatures, requiredMaps, false);

        // load necessary maps
        var geoJSONFeatures = {};
        ObjectUtils.each(unresolvedFeatures, function(i, featureId) {
            geoJSONFeatures[featureId] = null;
        });

        // load necessary maps
        self.loadFeatureMaps(requiredMaps, geoJSONFeatures, featureCallback);

        return unresolvedFeatures;
    };

    LocalFeatureResolver.prototype.mapLoaded = function(id, map) {
        var cacheEntry = this.mapCache[id], queue = cacheEntry.queue || [];

        map.features.forEach(function(f){
            var id = f.id;
            f.id = id.substring(0, id.indexOf(","));
        });

        // cache the map
        cacheEntry.map = map;

        // clear the queue from the cache entry
        cacheEntry.queue = [];

        // invoke the callbacks in the queue
        queue.forEach(function(cb) {
            cb([
                id
            ]);
        });
    };

    LocalFeatureResolver.prototype.loadMaps = function(mapList, callback) {
        var loadedMaps = [], _callback = TypeUtils.isFunction(callback) ? callback : FunctionUtils.noop;
        var self = this;
        ObjectUtils.each(mapList, function(i, mapId) {
            var path;

            if (!self.mapCache[mapId]) {
                // initialize a cache item with a queue containing the current
                // callback function
                self.mapCache[mapId] = {
                    queue : [
                        _callback
                    ],
                    map : null
                };

                // request the map
                path = [
                    self._properties.resourcePath, self.navteqMapPath, mapId, '.json', self.cacheBuster
                ].join('');
                d3.json(path, function(map) {
                    self.mapLoaded(mapId, map);
                });
            } else if (!self.mapCache[mapId].map) {
                // the map has been requested but the response not yet recieved.
                // add the callback to the queue
                self.mapCache[mapId].queue.push(_callback);
            } else {
                loadedMaps.push(mapId);
                // _callback([]);
            }
        });
        if (loadedMaps.length) {
            _callback(loadedMaps);
        }
    };

    LocalFeatureResolver.prototype.getDetailFeatures = function(featureIdList, callback) {
        if (!this.featureMap) {
            // send feature map request
            this.loadFeatureMap();

            // queue this call to be processed later
            this.queue.push({
                args : arguments
            });
        } else {
            var unresolvedFeatures = [], requiredMaps = {};
            // resolve map name
            this.featuresToMapName(featureIdList, unresolvedFeatures, requiredMaps, true);

            // load necessary maps
            var geoJSONFeatures = {};
            ObjectUtils.each(unresolvedFeatures, function(i, featureId) {
                geoJSONFeatures[featureId] = null;
            });

            // load features
            this.loadFeatureMaps(requiredMaps, geoJSONFeatures, callback);
        }
    };

    LocalFeatureResolver.prototype.simplifyFeatures = function(requiredFeatures, simplifyFactor, callback) {
        var resolvedFeature = {};
        this.getDetailFeatures(requiredFeatures, function(featureGeoMap) {
            ObjectUtils.each(requiredFeatures, function(index, featureId) {
                if (featureGeoMap[featureId]) {
                    var featureData = featureGeoMap[featureId];
                    if (simplifyFactor !== 0 && !isPointFeature(featureData)) {
                        resolvedFeature[featureId] = this.simplifyFeature(featureData, simplifyFactor);
                    } else {
                        resolvedFeature[featureId] = featureData;
                    }
                }
            });

            if (TypeUtils.isFunction(callback)) {
                callback(resolvedFeature);
            }
        });
    };

    LocalFeatureResolver.prototype.simplifyFeature = function(feature, simplifyFactor) {
        var simplifyObject = {}, arrayData;
        ObjectUtils.extendByRepalceArray(true, simplifyObject, feature);
        if (simplifyObject) {
            var coordinates = simplifyObject.geometry.coordinates;
            ObjectUtils.each(coordinates, function(index, coordinate) {
                if (coordinate) {
                    for (var i = 0; i < coordinate.length; i++) {
                        arrayData = coordinate[i];
                        coordinate[i] = this.simplify(arrayData, simplifyFactor, false);
                    }
                }
            });
        }

        return simplifyObject;
    };

    /**
     * Getter/setter for the geo data resource path This MUST be called in order
     * to use this class as it initializes the feature look up tables
     */
    LocalFeatureResolver.prototype.properties = function(_) {
        if (!arguments.length) {
            return this._properties;
        }
        this._properties = _;

        return this;
    };

    /**
     * Getter/setter for GeoFeatureSearcher This MUST be called on order to
     * resolve detail map and load detail features
     */
    LocalFeatureResolver.prototype.featureSearcher = function(_) {
        if (!arguments.length) {
            return this.featureSearcher_;
        }

        this.featureSearcher_ = _;

        return this;
    };

    /**
     * Given a list of feature ID's, this method will return a list of geoJSON
     * features
     * 
     * @param featureIdList
     *            Array of feature IDs (string)
     * @param callback
     *            [function(featureIDMap)] callback invoked when features are
     *            loaded
     * 
     */
    LocalFeatureResolver.prototype.getFeatures = function(featureIdList, callback) {
        if (!this.featureMap) {
            // send feature map request
            this.loadFeatureMap();

            // queue this call to be processed later
            this.queue.push({
                args : arguments
            });
        } else {
            this.resolveFeatures(featureIdList, callback, this);
        }
    };

    /**
     * Given a list of feature ID's, this method returns features that need to
     * be included in the base layer.
     * 
     * @param featureIdList
     *            Array of feature IDs (string)
     * @param callback
     *            [function(featureIDMap)] callback invoked when features are
     *            loaded
     * 
     */
    LocalFeatureResolver.prototype.baseLayerFeatures = function(featureIdList, callback) {
        var mapId = this.worldMapId;
        if (featureIdList && featureIdList.length > 0) {
            mapId = featureIdList[0];
        }
        var self = this;
        this.loadMaps([
            mapId
        ], function() {
            if (TypeUtils.isFunction(callback)) {
                if (!self.mapCache[self.oceanMapId]) {
                    var path = [
                        self._properties.resourcePath, self.navteqMapPath, self.oceanMapId, '.json', this.cacheBuster
                    ].join('');
                    d3.json(path, function(map) {
                        self.mapCache[self.oceanMapId] = map;
                        callback(self.mapCache[mapId].map.features, self.mapCache[self.oceanMapId].features);
                    });
                } else {
                    callback(self.mapCache[mapId].map.features, self.mapCache[self.oceanMapId].features);
                }
            }
        });
    };

    /**
     * get detail map id
     * 
     */
    LocalFeatureResolver.prototype.detailWorldMapId = function() {
        return this._detailWorldMapId;
    };

    LocalFeatureResolver.prototype.destroy = function() {
        this.featureMap = null;
        this.queue.length = 0;
    };

    return LocalFeatureResolver;

});
define('sap/viz/geo/repository/nokia/NameSearch',[
    'sap/viz/framework/common/util/TypeUtils', 'sap/viz/framework/common/util/FunctionUtils', 'jquery'
], function Setup(TypeUtils, FunctionUtils, $) {

    var cacheBust = false;
    var FCols = {
        ID: 0,
        Names: 1,
        GeoLevel: 2,
        Parent: 3
    };

    var SearchMatch = function(feat, namesMap) {
        var parentIdx = feat[FCols.Parent];
        var parentFeature = !isNaN(parentIdx) ? namesMap.features[parentIdx] : null;
        var parent;

        if (parentFeature) {
            parent = new SearchMatch(parentFeature, namesMap);
        }

        this.featureId = feat[FCols.ID];
        this.level = feat[FCols.GeoLevel];
        this.parent = parent;
        this.names = feat[FCols.Names];
    };

    function normalizeName(name) {
        var n = name || '';
        return n.trim().toLowerCase();
    }

    function featureAncestors(map, feature) {
        var heirarchy = [],
            features = map.features,
            feat = feature;

        while (!!(feat = features[feat[FCols.Parent]])) {
            var featureId = feat[FCols.ID];
            heirarchy.push(featureId);
        }

        return heirarchy;
    }

    function checkCommonAncestors(featureAncestors, ancestors) {
        if (!ancestors) {
            return true;
        }

        for (var i = 0; i < ancestors.length; i++) {
            var ancestorId = ancestors[i];

            if (featureAncestors.indexOf(ancestorId) !== -1) {
                return true;
            }
        }

        return false;
    }

    function lookupByName(map, name, geoLevel, ancestors) {
        var key = normalizeName(name),
            indices = map.names[key] || [],
            results = [];

        for (var i = 0; i < indices.length; i++) {
            var idx = indices[i],
                matchFeature = map.features[idx],
                matchLevel = matchFeature[FCols.GeoLevel];
            var levelsAreSame = typeof (geoLevel) !== 'string' || geoLevel === matchLevel;
            var matchAncestors = featureAncestors(map, matchFeature),
                commonAncestors = checkCommonAncestors(
                    matchAncestors, ancestors);

            if (levelsAreSame && commonAncestors) {
                var match = new SearchMatch(matchFeature, map);
                results.push(match);
            }
        }

        return results;
    }

    var NameSearch = function(dataPath) {
        this._dataPath = dataPath;
    };

    NameSearch.prototype.searchByPath = function(path) {
        var d = this._loadNamesMapDeferred;
        if (!d) {
            var cacheBuster = cacheBust ? '?' + Date.now() : '';
            var namesPath = [
                this._dataPath, 'namesMap.json', cacheBuster
            ].join('');

            d = this._loadNamesMapDeferred = $.Deferred();
            d3.json(namesPath, function(result) {
                if (!result) {
                    FunctionUtils.error('NameSearch could not load resource: ' + namesPath);
                }

                d.resolve(result);
            });
        }
        return d.pipe(function(namesMap) {
            var results = [];

            if (path) {
                var ancestors = null;
                for (var i = 0; i < path.length; i++) {
                    var item = path[i],
                        isObj = TypeUtils.isPlainObject(item),
                        name = isObj ? item.name : item;
                    var geoLevel = isObj && item.level ? item.level : null;
                    var features = lookupByName(namesMap, name,
                        geoLevel, ancestors);

                    results.push(features);

                    ancestors = [];
                    for (var j = 0; j < features.length; j++) {
                        ancestors.push(features[j].featureId);
                    }
                }
            }

            return results.length ? results[results.length - 1] : [];
        });
    };

    return NameSearch;
});
define('sap/viz/geo/repository/nokia/NokiaRepository',[
    'sap/viz/framework/common/util/oo',
    'sap/viz/geo/repository/SingleRepository',
    'sap/viz/geo/repository/nokia/LocalFeatureResolver',
    'sap/viz/geo/repository/nokia/NameSearch',
    'jquery',
    'exports'
], function(oo, SingleRepository, LocalFeatureResolver, NameSearch, $) {
    var NavteqRepository = function(resourcePath, version) {
        SingleRepository.call(this, 'NAVTEQ', version);
        this._resourcePath = resourcePath;
        this._featureResolver = new LocalFeatureResolver({
            resourcePath: resourcePath
        });
        this._nameSearch = new NameSearch(resourcePath);
    };

    oo.extend(NavteqRepository, SingleRepository);

    NavteqRepository.prototype._getFeaturesByIdsInternal = function(featureIds) {
        var d = $.Deferred();
        this._featureResolver.getFeatures(featureIds, d.resolve.bind(d));
        return d.promise();
    };

    NavteqRepository.prototype._searchByNamesInternal = function(names) {
        var d = $.Deferred();
        $.when.apply(null, names.map(function(name) {
            return this._nameSearch.searchByPath(name);
        }, this)).then(function() {
            d.resolve(Array.prototype.slice.call(arguments));
        });
        return d.promise();
    };

    NavteqRepository.prototype.getResourcePath = function() {
        return this._resourcePath;
    };

    NavteqRepository.prototype.getWorldMapFeatures = function() {
        var d = $.Deferred();
        this._featureResolver.baseLayerFeatures(null, function(rets, oceanFeatures) {
            d.resolve(rets.map(this._processFeatures, this), oceanFeatures);
        }.bind(this));
        return d.promise();
    };

    return NavteqRepository;
});
define('sap/viz/geo/repository/ExtensionRepository',[
    'sap/viz/framework/common/util/oo',
    'sap/viz/api/env/Resource',
    'sap/viz/geo/repository/nokia/NokiaRepository',
    'sap/viz/framework/common/util/ObjectUtils',
    'exports'
], function(oo, Resource, NavteqRepository, ObjectUtils) {
    var ExtensionRepository = function(meta) {
        NavteqRepository.call(this, meta.framework.bundleUrl + '/' + meta.customProperties.path + '/',
            meta.framework.bundleVersion);
        this._meta = meta;
    };

    oo.extend(ExtensionRepository, NavteqRepository);

    ExtensionRepository.prototype.getExtensionServiceMeta = function() {
        return this._meta;
    };

    ExtensionRepository.discover = function() {
        var bf = ObjectUtils.getObject('sap.bi.framework');
        return bf ?
            bf.getServiceMetadata(['*', 'sap.viz.geo.content']).map(function(meta) {
                return new ExtensionRepository(meta);
            }) : [];

    };

    return ExtensionRepository;
});
define('sap/viz/geo/repository/BuiltinRepository',[
    'sap/viz/framework/common/util/oo',
    'sap/viz/api/env/Resource',
    'sap/viz/geo/repository/nokia/NokiaRepository',
    'exports'
], function(oo, Resource, NavteqRepository) {
    var BuiltinRepository = function() {
        var path = Resource.path('sap.viz.geo.geographicInfo.localStorage.resourcePath') || // compatible with "old geo"
            Resource.path('sap.viz.map.Resources') + '/data/geo/';
        NavteqRepository.call(this, path);
    };

    oo.extend(BuiltinRepository, NavteqRepository);

    return BuiltinRepository;
});
define('sap/viz/geo/repository/DefaultRepository',['sap/viz/framework/common/util/oo',
    'sap/viz/geo/repository/CompositeRepository',
    'sap/viz/geo/repository/ExtensionRepository',
    'sap/viz/geo/repository/BuiltinRepository',
    'exports'
], function(oo, CompositeRepository, ExtensionRepository, BuiltinRepository) {
    var DefaultRepository = function(resourcesPath) {
        CompositeRepository.call(this);        
        ExtensionRepository.discover().forEach(this.addRepository, this);
        this.addRepository(new BuiltinRepository());
    };

    oo.extend(DefaultRepository, CompositeRepository);

    return DefaultRepository;
});

define('sap/viz/geo/repository/GlobalRepositoryHolder',[
    'sap/viz/geo/repository/DefaultRepository',
    'exports'
], function(DefaultRepository) {
    var repository;
    return {
        get: function() {
            if (!repository) {
                repository = new DefaultRepository();
            }

            return repository;
        }
    };
});

define('sap/viz/geo/Map',[
    "sap/viz/geo/Constants",
    "sap/viz/framework/core/BaseApp",
    "sap/viz/geo/OverlayPane",
    "sap/viz/geo/dataviz/SelectionModel",
    "sap/viz/geo/dispatch",
    "sap/viz/geo/GeoLegendManager",
    "sap/viz/geo/Bounds",
    "sap/viz/geo/MapControl",
    "sap/viz/geo/utils/Logger",
    "sap/viz/geo/EventSource",
    "sap/viz/framework/common/util/TypeUtils",
    "sap/viz/geo/OperationQueue",
    "sap/viz/geo/interaction/create",
    "sap/viz/geo/createEffectManager",
    "sap/viz/geo/dataviz/Tooltip",
    "sap/viz/geo/BasemapSwitcher",
    "sap/viz/framework/common/util/IdProducer",    
    "sap/viz/geo/utils/Serialization",
    "sap/viz/geo/TemplateManager",
    "sap/viz/geo/repository/GlobalRepositoryHolder",
    "exports"
], function(
    Constants,
    BaseApp,
    OverlayPane,
    SelectionModel,
    dispatch,
    LegendManager,
    Bounds,
    MapControl,
    Logger,
    EventSource,
    TypeUtils,
    OperationQueue,
    createInteraction,
    createEffectManager,
    Tooltip,
    BasemapSwitcher,
    IdProducer,
    Serialization,
    TemplateManager,
    GlobalRepositoryHolder
) {

    function onBaseMapRender(bounds, callback) {
        // Logger.profiling("Map:initialization-basemap_rendering");

        Logger.profiling("Map:initialization");

        var mapProvider = this._baseMap;
        mapProvider.on("panStart.map", panStart.bind(this)).on("pan.map", pan.bind(this)).on("panEnd.map",
            panEnd.bind(this)).on("zoomStart.map", zoomStart.bind(this)).on("zoomEnd.map", zoomEnd.bind(this)).on(
            "basemapChange.map", function() {
                this._basemapSwitcher._setCurrent(this._baseMap.getBasemap());
            }.bind(this));
        this._dispatch.baseMapChanged(this._baseMap);

        if (bounds) {
            applyBounds.call(this, bounds);
        }

        if (!this._initBounds) {
            this._initBounds = new Bounds(this.bounds());
        }

        var mapControlContainer = this._mapControlContainer;
        if (!mapControlContainer) {
            mapControlContainer = this._rootContainer.appendChild(document.createElement("div"));
            mapControlContainer.className = "mapControlContainer";
            this._mapControl = new MapControl(mapControlContainer);
            this._mapControlContainer = mapControlContainer;
            this.toggleMapControl(this._showMapControls);
        }

        this._basemapSwitcher._setBasemapConfigs(mapProvider.getBasemapConfigs())._setCurrent(mapProvider.getBasemap());

        this._legendManager.reservedSpace(this._showMapControls ? (mapControlContainer.offsetHeight +
            mapControlContainer.offsetTop + 45) : 30);

        callback();
    }

    function applyBounds(bounds, cb) {
        var zoomEndEvt = "zoomEnd.applyBounds";
        var zoomEnd = false;
        this._baseMap.on(zoomEndEvt, function() {
            zoomEnd = true;
        }).bounds(bounds).then(function() {
            if (!zoomEnd) {
                this._layers.forEach(doRenderLayer, this);
            }
            if (cb) {
                cb();
            }
            this._baseMap.off(zoomEndEvt);
        }.bind(this));
    }

    function renderLayers(layers, bounds) {
        var callbacks = layers.reduce(function(pv, cv) {
            return pv.concat(cv.callbacks);
        }, []);
        var cb = function(){
            callbacks.forEach(function(cb){
                if(cb){
                    cb();
                }
            });
        };
        layers = layers.map(function(o){
            return o.layer;
        });
        if (bounds) {
            var hasRenderedLayer = this._layers.some(function(o) {
                return (o._isRendered() || o._toBeRendered) && layers.indexOf(o) === -1;
            });
            layers.forEach(function(o){
                o._toBeRendered = true;
            });
            if (!hasRenderedLayer) {
                applyBounds.call(this, bounds, cb);
            } else {
                if (this.bounds().contain(bounds)) {
                    layers.forEach(doRenderLayer, this);
                    cb();
                } else {
                    var mapBounds = new Bounds(2).union(bounds);
                    this._layers.filter(function(layer) {
                        return layers.indexOf(layer) === -1;
                    }).forEach(function(layer) {
                        mapBounds.union(layer._getBounds());
                    });
                    applyBounds.call(this, mapBounds, cb);
                }
            }
        } else {
            layers.forEach(doRenderLayer, this);
            cb();
        }
    }

    function renderLayer(layer, adjustBounds, callback) {
        var o, layerRenderQueue = this._layerRenderQueue, find = false;
        for (var i = 0, len = layerRenderQueue.length; i < len; i++) {
            var renderParams = layerRenderQueue[i];
            if (renderParams.layer === layer) {
                o = renderParams;
                delete o.dataResolved;
                o.callbacks.push(callback);
                find = true;
                break;
            }
        }

        if (!find) {
            o = {
                layer : layer,
                callbacks : [callback]
            };
            layerRenderQueue.push(o);
        }

        o.adjustBounds = adjustBounds;

        if (layer._canRender()) {
            layer._resolveData(function() {
                o.dataResolved = true;
                processLayerRenderQueue.call(this);
            }, this);
        } else {
            processLayerRenderQueue.call(this);
        }
    }

    function doRenderLayer(layer) {
        if (layer) {
            delete layer._toBeRendered;
            Logger.profiling("Layer:rendering");

            var layers = this._layers;

            var nextNonEmptyLayer;
            var find = false;
            for (var i = 0, len = layers.length; i < len; i++) {
                var target = layers[i];
                if (!find) {
                    find = (layer === target);
                } else if (!target._isEmpty()) {
                    nextNonEmptyLayer = target;
                    break;
                }
            }
            layer._render(nextNonEmptyLayer, this._currentSize);
            this._fireEvent("layerRendered", layer);
            Logger.profiling("Layer:rendering");
        }
    }

    function processLayerRenderQueue() {
        var boundsLayers = [], layerRenderQueue = this._layerRenderQueue;
        var i;
        var len = layerRenderQueue.length;
        for (i = 0; i < len; i++) {
            var renderParams = layerRenderQueue[i];
            var layer = renderParams.layer;
            if (renderParams.adjustBounds && layer._canRender()) {
                if (!renderParams.hasOwnProperty("dataResolved")) {
                    return;
                }

                boundsLayers.push(layer);
            }
        }

        var mapBounds;
        if (boundsLayers.length > 0) {
            boundsLayers.forEach(function(layer) {
                var layerBounds = layer._getBounds();
                if (layerBounds) {
                    if (!mapBounds) {
                        mapBounds = new Bounds(2);
                    }
                    mapBounds.union(layerBounds);
                }
            });
        }

        // layers wait for data resolved
        var newlayerRenderQueue = [];
        // layers could be rendered
        var layersToRender = [];

        for (i = 0; i < len; ++i) {
            var o = layerRenderQueue[i];
            if (o.layer._canRender()) {
                (o.dataResolved ? layersToRender : newlayerRenderQueue).push(o);
            } else {
                o.callbacks.forEach(function(cb) {
                    if (cb) {
                        cb();
                    }
                });
            }
        }

        this._layerRenderQueue = newlayerRenderQueue;
        renderLayers.call(this, layersToRender, mapBounds);
    }

    function panStart() {
        this._fireEvent("panStart");
    }

    function pan(delta) {
        this._overlaysPane.translate(delta);
    }

    function panEnd(delta) {
        if (this._baseMap.needRenderOnPan()) {
            this._overlaysPane.translate(false);
            this._layers.forEach(doRenderLayer, this);
        } else {
            this._overlaysPane.translate(delta, true);
        }
        var evtName = "panComplete.map";
        var provider = this._baseMap;
        provider.on(evtName, function(){
            provider.off(evtName);
            this._fireEvent("panComplete");
        }.bind(this));
    }

    function zoomStart() {
        this._overlaysPane.setVisibility(false);
        this._fireEvent("zoomStart");
        Logger.profiling("Map:zoom");
    }

    function zoomEnd() {
        this._layers.forEach(doRenderLayer, this);
        this._overlaysPane.setVisibility(true);

        var evtName = "zoomComplete.map";
        var provider = this._baseMap;
        provider.on(evtName, function(){
            provider.off(evtName);
            this._fireEvent("zoomComplete");
            Logger.profiling("Map:zoom");
        }.bind(this));
    }

    function getEventName(name) {
        return name + "." + this._id;
    }

    /**
     * Create a new geo map object. Event {@link sap.viz.geo.Map#event:mapInitialized|"mapInitialized"}
     * will be fired when the map is created and rendered.
     *
     * @constructor
     * @alias sap.viz.geo.Map
     * @param {HTMLElement}
     *            container the DOM element to place geo map
     * @param {Object}
     *            [options] the geo map initial configuration:
     * @param {sap.viz.geo.basemap.AbstractProvider}
     *            [options.baseMap] Provide a base map provider object which
     *            should be an implementation of <a
     *            href="sap.viz.geo.basemap.AbstractProvider.html">AbstractProvider</a>.
     *
     * @param {Object}
     *            [options.selectionModel] Settings of the selectionModel.
     * @param {string}
     *            [options.selectionModel.mode="inclusive"] The selection mode
     *            to set.
     * @param {Object}
     *            [options.tooltip] the options of tooltip
     * @param {boolean}
     *            [options.mapControls=true] whether to show the map control
     *            which is a group of control buttons including zoom in/out,
     *            reset and lasso enabling
     * @param {boolean}
     *            [options.basemapSwitcher=true] whether to show the basemap
     *            switcher
     * @param {string}
     *            [options.template] the id of template to apply.
     * @augments sap.viz.geo.EventSource
     * @fires sap.viz.geo.Map#mapInitialized
     */
    var Map = function(container, options) {
        this._id = "map-" + IdProducer.get();

        options = options || {};
        Logger.profiling("Map:initialization");
        BaseApp.call(this);
        EventSource.init.call(this);

        this._layerRenderQueue = [];

        this._dispatch = dispatch();

        var document = container.ownerDocument;

        this._container = container;

        var rootContainer = this._rootContainer = container.appendChild(document.createElement("div"));
        rootContainer.setAttribute("class", Constants.CSS_CLASS.ROOT);
        rootContainer.id = this._id;

        this._effectManager = createEffectManager(rootContainer);

        this._interaction = createInteraction(this);

        this._baseMapContainer = rootContainer.appendChild(document.createElement("div"));
        this._baseMapContainer.setAttribute("class", Constants.CSS_CLASS.MAP_CONTAINER);

        this._setDefaultSize();

        this._legendManager = new LegendManager(rootContainer.appendChild(document.createElement("div")), this);
        this._legendManager.reservedSpace(30);

        this._layers = [];

        var tm = this._templateManager = new TemplateManager(this._id);

        this._tooltip = new Tooltip(this, options.tooltip);

        this._overlaysPane = new OverlayPane(this);
        this._selectionModel = new SelectionModel(this, options.selectionModel);
        this._initBounds = null;
        this._showMapControls = (options.mapControls !== false);
        this._showBasemapSwitcher = (options.basemapSwitcher !== false);

        var basemapSwitcherContainer = this._rootContainer.appendChild(document.createElement("div"));
        basemapSwitcherContainer.className = "basemapSwitcherContainer";
        var basemapSwitcher = new BasemapSwitcher(basemapSwitcherContainer);
        this._basemapSwitcher = basemapSwitcher.on("switch.map", function(newName) {
            return this._baseMap.setBasemap(newName);
        }.bind(this)).visible(options.basemapSwitcher !== false);        
        
        this._repository = options.repository || GlobalRepositoryHolder.get();

        this._operationQueue = new OperationQueue();

        tm.templateId(options.template).then(function() {
            var fn = function() {
                setTimeout(function(){
                    this._fireEvent("mapInitialized");
                }.bind(this));
            }.bind(this);

            var mapProvider = options.baseMap;
            if (mapProvider) {
                this.baseMap(mapProvider, fn);
            } else {
                fn();
            }
        }.bind(this));
    };

    /**
     * Fired when the map is initialized.
     * @event sap.viz.geo.Map#mapInitialized
     */
    /**
     * Fired when zooming on map is finished.
     * @event sap.viz.geo.Map#zoomComplete
     */
    /**
     * Fired when panning on map is finished.
     * @event sap.viz.geo.Map#panComplete
     */
    /**
     * Fired when resizing on map is finished.
     * @event sap.viz.geo.Map#resizeComplete
     */

    Map.prototype = EventSource.mixin.call(Object.create(BaseApp.prototype));
    Map.prototype.constructor = Map;
    Map.prototype._renderLayer = function(layer, adjustBounds, cb){
        renderLayer.call(this, layer, adjustBounds, cb);
    };

    Map.prototype.getRepository = function(){
        return this._repository;
    };

    /**
     * Get/set base map.
     *
     * @ignore
     * @param {sap.viz.geo.basemap.AbstractProvider}
     *            [baseMap] the base map provider object to be set
     * @returns the base map provider object(getting) or the map object
     *          itself(setting)
     */
    Map.prototype.baseMap = function(baseMap, completedCallback) {

        if (!arguments.length) {
            return this._baseMap;
        }

        this._operationQueue.offerOp({
            level : 0,
            name : "Map:initialization-basemap_rendering",
            op : setBaseMap.bind(this, baseMap, completedCallback)
        });

        return this;
    };

    function setBaseMap(baseMap, completedCallback, callback) {
        var bounds;
        if (this._baseMap) {
            bounds = this.bounds();
            this._overlaysPane.detach();
            this._baseMap.destroy();
            this._baseMap = null;
        }
        this._baseMap = baseMap;

        baseMap._setTemplateManager(this._templateManager);

        this._baseMap.render(this._baseMapContainer, onBaseMapRender.bind(this, bounds, function() {
            callback();
            if (completedCallback) {
                completedCallback();
            }
        }), this._repository);
    }

    Map.prototype.refresh = function(cb) {
        this._operationQueue.offerOp({
            level : 0,
            name : "Map:refresh",
            op : refresh.bind(this, cb)
        });
        return this;
    };

    function refresh(cb, callback) {

        var style = this._rootContainer.style;

        var flag = !(style['display'] === 'none' || style['visibility'] === 'hidden' ||
            this._rootContainer.offsetWidth === 0 || this._rootContainer.offsetHeight === 0);
        if (flag) {

            // Todo Investigate why BITSDC1-3897
            // For now, revert the change for BITSDC1-3741(CL6448531), To
            // Fix BITSDC1-3741, use root node to judge
            // height will be changed to small size and then back to
            // original size in case BITSDC1-3897
            var baseMapRoot = this.baseMap().getMapRootNode ? this.baseMap().getMapRootNode() : null;
            if (!baseMapRoot || (baseMapRoot.offsetWidth > 0 && baseMapRoot.offsetHeight > 0)) {
                var promise = this._baseMap.refresh();
                this._layers.forEach(doRenderLayer, this);
                promise.always(cb).always(callback);
                return;
            }
        }
        if (cb) {
            cb();
        }
        callback();
    }

    /**
     * Get/set the bounds of map.
     *
     * @param {sap.viz.geo.Bounds}
     *            [bounds] the bounds to set
     *
     * @returns the current bounds(getting) or the map object itself(setting)
     *
     */
    Map.prototype.bounds = function(bounds) {
        if (arguments.length === 0) {
            return this._baseMap.bounds();
        }

        this._operationQueue.offerOp({
            level : 0,
            name : "Map:set_bounds",
            op : setBounds.bind(this, bounds)
        });

        return this;
    };

    function setBounds(bounds, callback) {
        applyBounds.call(this, bounds);
        callback();
    }

    /**
     * Reset the init bounds of map
     *
     * @ignore
     */
    Map.prototype.reset = function() {
        this.bounds(this._initBounds);
        return this;
    };

    Map.prototype.zoom = function(delta) {
        var mapProvider = this._baseMap;
        if (mapProvider) {
            mapProvider.zoom(delta);
        }
        return this;
    };

    /**
     * Return the layer by index.
     *
     * @param {Number}
     *            index the index number
     * @returns {sap.viz.geo.dataviz.Layer} the layer
     */
    Map.prototype.getLayer = function(index) {
        return this._layers[index];
    };

    Map.prototype.layerIndexOf = function(layer) {
        return this._layers.indexOf(layer);
    };

    /**
     * Return all layers.
     *
     * @returns {array} of {sap.viz.geo.dataviz.Layer} the layer
     */
    Map.prototype.getLayers = function() {
        return this._layers.slice(0);
    };

    /**
     * Add a layer.
     *
     * @param {sap.viz.geo.dataviz.Layer}
     *            layer the layer to be added
     * @param {Boolean}
     *            [adjustBounds] if true, the bounding box of map will be
     *            adjusted to fully show this layer.
     * @returns the map object itself
     */
    Map.prototype.addLayer = function(layer, adjustBounds) {

        this._operationQueue.offerOp({
            level : 10,
            name : "Map:add_layer",
            op : addLayer.bind(this, layer, adjustBounds)
        });

        return this;
    };

    function addLayer(layer, adjustBounds, callback) {
        if (!layer._attach()) {
            this._layers.push(layer);
            layer._map = this;
            layer.on(getEventName("beforeDestroyDataModel"), function() {
                this._fireEvent("beforeDestroyLayerDataModel", layer);
            }.bind(this));
            this._overlaysPane.attachLayer(layer);
            renderLayer.apply(this, arguments);
        } else {
            callback();
        }
    }

    /**
     * Remove a layer.
     *
     * @param {sap.viz.geo.dataviz.Layer}
     *            layer the layer to be removed
     *
     * @returns the map object itself
     */
    Map.prototype.removeLayer = function(layer) {
        Logger.profiling("Map:remove_layer");

        this._operationQueue.offerOp({
            level : 30,
            name : "Map:remove_layer",
            op : removeLayer.bind(this, layer)
        });

        Logger.profiling("Map:remove_layer");
        return this;
    };

    function removeLayer(layer, callback) {
        var index = this._layers.indexOf(layer);
        if (index >= 0) {
            this._layers.splice(index, 1);
            this._overlaysPane.detachLayer(layer);
            layer.off(getEventName("beforeDestroyDataModel"));
            this._fireEvent("layerRemoved", layer);
            delete layer._map;
        }
        callback();
    }

    function getLegendNumbers(layers, oldIndex, index) {
        var legendNumber = 0;
        if (oldIndex > index) {
            for (var i = oldIndex - 1; i >= index; i--) {
                if (layers[i].getLegend() !== null) {
                    --legendNumber;
                }
            }
        } else {
            for (var j = oldIndex + 1; j <= index; j++) {
                if (layers[j].getLegend() !== null) {
                    ++legendNumber;
                }
            }
        }
        return legendNumber;
    }
    /**
     * Reorder a layer by a given index.
     *
     * @param {sap.viz.geo.dataviz.Layer}
     *            layer the layer to be reordered
     * @param {Number}
     *            index the index position the layer is reordered to
     *
     * @returns the map object itself
     */
    Map.prototype.reorderLayer = function(layer, index) {
        // Logger.profiling("Map:reorder_layer");

        this._operationQueue.offerOp({
            level : 0,
            name : "Map:reorder_layer",
            op : reorderLayer.bind(this, layer, index)
        });

        // Logger.profiling("Map:reorder_layer");
        return this;
    };

    function reorderLayer(layer, index, callback) {
        if (index < 0) {
            index = 0;
        } else {
            var maxIndex = this._layers.length - 1;
            if (index > maxIndex) {
                index = maxIndex;
            }
        }
        var oldIndex = this._layers.indexOf(layer);
        var legendNumber = 0;
        if (oldIndex !== index) {
            var layers = this._layers;
            layers.splice(oldIndex, 1);
            layers.splice(index, 0, layer);
            if (layer.getLegend() !== null) {
                legendNumber = getLegendNumbers(this._layers, oldIndex, index);
            }
            if (legendNumber !== 0) {
                this._legendManager.reorderLegend(layer.getLegend(), -legendNumber);
            }

            var target;
            while ((target = layers[++index]) != null) {
                if (!target._isEmpty()) {
                    break;
                }
            }

            layer._insertBefore(target);

            callback();
        }
    }

    /**
     * Convert a geographic coordinate to screen coordinate.
     *
     * @param {Array}
     *            lnglat an array holding longitude and latitude values
     *
     * @returns {Array} an array holding x and y values
     *
     */
    Map.prototype.toPixel = function(lnglat) {
        return this._baseMap.toPixel(lnglat);
    };

    /**
     * Convert a screen coordinate to geographic coordinate.
     *
     * @param {Array}
     *            point an array holding x and y values to be converted
     *
     * @returns {Array} an array holding longitude and latitude values
     *
     */
    Map.prototype.toLngLat = function(point, linear) {
        return this._baseMap.toLngLat(point, linear);
    };

    /**
     * Return the selection model of map.
     *
     * @returns {sap.viz.geo.dataviz.SelectionModel}
     */
    Map.prototype.getSelectionModel = function() {
        return this._selectionModel;
    };

    /**
     * Show/hide the map control
     *
     * @param {boolean}
     *            show if true, the map control will be shown otherwise hidden.
     */
    Map.prototype.toggleMapControl = function(show) {
        this._showMapControls = show = !!show;
        var mapControl = this._mapControl;
        if (mapControl) {
            mapControl[show ? "show" : "hide"]();
        }
    };

    /**
     * Return the base map switcher object.
     *
     * @returns {sap.viz.geo.BasemapSwitcher}
     */
    Map.prototype.getBasemapSwitcher = function() {
        return this._basemapSwitcher;
    };

    /**
     * Return the map's template manager object.
     *
     * @returns {sap.viz.geo.TemplateManager}
     */
    Map.prototype.getTemplateManager = function() {
        return this._templateManager;
    };

    /**
     * Destroy the map.
     *
     * @returns the map object itself
     */
    Map.prototype.destroy = function() {

        if (this.__instance) {
            var ins = this.__instance;
            this.__instance = null;
            ins.destroy();
        } else {
            // Logger.profiling("Map:destroy");

            this._operationQueue.offerOp({
                level : 0,
                name : "Map:destroy",
                op : destroy.bind(this)
            });

            // Logger.profiling("Map:destroy");
        }

        return this;
    };

    function destroy(callback) {
        BaseApp.prototype.destroy.call(this);

        if (this._baseMap) {
            this._baseMap.destroy();
        }

        this._container.removeChild(this._rootContainer);

        if (this._mapControl) {
            this._mapControl.destroy();
        }

        var basemapSwitcher = this._basemapSwitcher;
        if (basemapSwitcher) {
            basemapSwitcher._destroy();
        }

        if (this._selectionModel) {
            this._selectionModel.destroy();
        }

        if (this._overlaysPane) {
            this._overlaysPane.destroy();
        }

        EventSource.destroy.call(this);

        this._tooltip.destroy();

        this._interaction.destroy();

        this._templateManager._destroy();
        delete this._templateManager;

        callback();
    }

    Map.prototype.then = function(fn) {
        this._operationQueue.offerOp({
            level : 0,
            name : "Map:then",
            op : then.bind(this, fn)
        });

        return this;
    };

    function then(fn, callback) {
        fn();
        callback();
    }

    Map.prototype._getCurrentSize = function() {
        return {
            width : this._currentSize[0],
            height : this._currentSize[1]
        };
    };

    Map.prototype._setCurrentSize = function(sizeInfo) {
        this._currentSize = [
            sizeInfo.width, sizeInfo.height
        ];
        var style = this._rootContainer.style;
        style.width = sizeInfo.width + "px";
        style.height = sizeInfo.height + "px";
    };

    function onSizeChangeComplete(){
        this._fireEvent("resizeComplete");
    }

    Map.prototype._onSizeChange = function(sizeInfo) {
        this.refresh(onSizeChangeComplete.bind(this));
    };

    Map.prototype._localeChanged = function() {
        this.refresh();
    };

    /**
     * Return the tooltip object.
     *
     * @returns {sap.viz.geo.dataviz.Tooltip}
     */
    Map.prototype.getTooltip = function() {
        return this._tooltip;
    };

    /**
     * Save the map as a plain object.
     *
     * @static
     * @param {sap.viz.geo.Map}
     *            map the map instance to be saved.
     * @param {Object} options the options
     * @param {boolean}
     *            [options.discardData=false] if true, the result will not
     *            include the dataset infomations.
     *
     * @returns {Object} the saved object
     */
    Map.save = function(map, options){
        return Serialization._serialize(map, options);
    };


    /**
     * Restore a map from saved object.
     *
     * @static
     * @param {Object}
     *            serialization the saved object of a map.
     * @param {HTMLElement}
     *            container the dom element to place the map.
     *
     * @returns {Promise} a promise object which will be resolved with the
     *          restored map instance when loading is over.
     */
    Map.load = function(serialization, container){
        var map = new Map(container);
        return Serialization._deserialize(map, serialization).then(function() {
            return map;
        });
    };

    return Map;
});

define('sap/viz/geo/AdminLevel',["exports"], function() {

    /**
     * Enumeration of GEO admin levels.
     * 
     * @class sap.viz.geo.AdminLevel
     */
    var adminLevel = {
        /**
         * the country level
         * 
         * @readonly
         * @default
         * @memberof sap.viz.geo.AdminLevel
         */
        COUNTRY : '0',
        /**
         * the sub-admin-1 level
         * 
         * @readonly
         * @default
         * @memberof sap.viz.geo.AdminLevel
         */
        SUBADMIN1 : '1',
        /**
         * the sub-admin-2 level
         * 
         * @readonly
         * @default
         * @memberof sap.viz.geo.AdminLevel
         */
        SUBADMIN2 : '2',
        /**
         * the city level
         * 
         * @readonly
         * @default
         * @memberof sap.viz.geo.AdminLevel
         */
        CITY : 'c'
    };

    return adminLevel;
});
define('sap/viz/geo/basemap/cvom/GeoUtils',[
    'sap/viz/chart/components/util/BoundingBoxUtils', 'sap/viz/framework/common/util/TypeUtils'
], function Setup(BoundingBox, TypeUtils) {

    var centralCache = {};
    // for a SVG path element, return an array of bounding boxes corresponding
    // to
    // the polygons that make up the path. this function only supports paths
    // using
    // M/L/Z commands (i.e. created by d3.geo.path)
    function getPathBoundingBoxes(p) {
        var segs = p.pathSegList, currentBox, seg, boxes = [], mmin = Math.min, mmax = Math.max;

        for (var i = 0, len = segs.numberOfItems; i < len; i++) {
            seg = segs.getItem(i);
            switch (seg.pathSegType) {
            case 1: // Z
                boxes.push({
                    x : currentBox.x1,
                    y : currentBox.y1,
                    width : currentBox.x2 - currentBox.x1,
                    height : currentBox.y2 - currentBox.y1
                });
                break;

            case 2: // M
                currentBox = {
                    x1 : seg.x,
                    x2 : seg.x,
                    y1 : seg.y,
                    y2 : seg.y
                };
                break;

            case 4: // L
                currentBox.x1 = mmin(seg.x, currentBox.x1);
                currentBox.x2 = mmax(seg.x, currentBox.x2);
                currentBox.y1 = mmin(seg.y, currentBox.y1);
                currentBox.y2 = mmax(seg.y, currentBox.y2);
                break;

            default:
            }
        }

        return boxes;
    }

    function checkPathIntersection(path, box) {
        var boxes = getPathBoundingBoxes(path);
        for (var i = 0, len = boxes.length; i < len; i++) {
            if (BoundingBox.intersects(boxes[i], box)) {
                return true;
            }
        }
        return false;
    }

    function checkIntersection(elem, rect) {
        var elementBox = elem.getBBox();

        if (BoundingBox.intersects(rect, elementBox)) {
            if (elem.tagName === 'path') {
                return checkPathIntersection(elem, rect);
            } else {
                // e.g. circle elements
                return true;
            }
        }

        return false;
    }

    function isCoordinate(obj) {
        return TypeUtils.isArray(obj) && obj.length >= 2 && TypeUtils.isNumber(obj[0]) && TypeUtils.isNumber(obj[1]) &&
            (obj[1] >= -90 && obj[1] <= 90); // limit latitude to [ -90, 90 ]
    }

    function isPointFeature(f) {
        var feat = f || {}, type = feat.type;
        return type === 'Point' || (type === 'Feature' && isPointFeature(feat.geometry));
    }

    var geopath = d3.geo.path().projection(null);
    function bounds(obj) {
        // TODO performance issue.
        return geopath.bounds ? geopath.bounds(obj) : d3.geo.bounds(obj);
    }

    function resolveCentroid(feature, projection) {

        var path = d3.geo.path().projection(projection);

        if (feature) {

            var geometry = feature.geometry || {}, properties = feature.properties || {}, id = feature.rdf_carto_id;

            if (id) {
                if (!centralCache[id]) {
                    var bbox = bounds(geometry);
                    centralCache[id] = [
                        bbox[0][0] + (bbox[1][0] - bbox[0][0]) / 2, bbox[0][1] + (bbox[1][1] - bbox[0][1]) / 2
                    ];
                }

                return projection(centralCache[id]);
            }

            if (geometry.type === 'Point') {
                return projection(geometry.coordinates);
            } else if (isCoordinate(properties.centroid)) {
                return projection(properties.centroid);
            } else {
                return path.centroid(feature);
            }
        }
        return null;
    }
    return {
        checkIntersection : checkIntersection,
        boxIntersection : BoundingBox.intersection,
        isCoordinate : isCoordinate,
        isPointFeature : isPointFeature,
        resolveCentroid : resolveCentroid,
        bounds : bounds
    };
});
define('sap/viz/geo/basemap/cvom/GeoFeatureLayer',[
    'sap/viz/chart/components/util/TextUtils', 'sap/viz/framework/common/util/ObjectUtils',
    'sap/viz/geo/basemap/cvom/GeoUtils', "sap/viz/framework/common/lang/LangManager"
],
    function Setup(TextUtils, ObjectUtils, GeoUtils, langManager) {

        var defaults = {
            pointRadius : 4.5,
            strokeWidth : 1,
            attributes : {
                fill : 'transparent',
                'fill-rule' : 'evenodd'
            },
            dataAdapter : function(d) {
                return d;
            }
        }, clipPathIdx = 0;
        var randomSuffix = ObjectUtils.guid();

        function GeoFeatureLayer(selection, data, options, oceanData, fn) {
            this.sel = selection;
            this.data = data;
            this.oceanData = oceanData;
            this.options = ObjectUtils.extendByRepalceArray({}, defaults, options);

            this.zoomlevel = 0;

            // copy the data adapter function from the options
            this.getFeatureFromData = this.options.dataAdapter;

            // if the projection scale is too small, IE will trigger mouse
            // events on
            // path bounding box (BITVIZB-417)
            this.projection = d3.geo.mercator().scale(1000).translate([
                0, 0
            ]);
            // compatible with d3 v3 and d3 v2
            if (this.projection.precision) {
                this.projection.precision(0);
            }

            this.path = d3.geo.path().projection(this.projection);

            this.path.pointRadius(0);

            this.size = {
                height : this.options.height || 0,
                width : this.options.width || 0
            };

            this.svg = this.sel.append('g').attr('display', 'none').attr('class', 'v-datashapesgroup');

            var clipPathId = 'featclip' + clipPathIdx;
            clipPathIdx += 1;

            this.defs = this.svg.append('defs');
            this.clipRect = this.defs.append('clipPath').attr('id', clipPathId).append('rect').attr('width',
                this.size.width).attr('height', this.size.height);
            this.svg.append('rect').attr('x', 0).attr('y', 0).attr('width', this.size.width).attr('height',
                this.size.height).attr('opacity', 0).attr('id', 'event-rect' + randomSuffix);
            this.svg.attr('clip-path', 'url(#' + clipPathId + ')');

            this.g = this.svg.append('g').attr('class', 'v-geopath');

            this.scale = null;

            this._useSmallFontSize = false;
            if (oceanData) {
                var oceanStyle = options.oceanStyle || {};
                this.oceang = this.svg.append('g').attr('class', 'v-oceanlabel').attr('font-family',
                    oceanStyle['font-family']).attr('font-size', oceanStyle['font-size']).attr('font-weight',
                    oceanStyle['font-weight']).attr('font-style', oceanStyle['font-style']).attr('fill',
                    oceanStyle.fill).attr('stroke', oceanStyle.stroke).attr('display',
                    this.options.oceanName && this.options.oceanName.visible === false ? 'none' : 'block');
            }

            this.render(fn);
        }

        var extension = {
            render : function(fn) {
                var data = this.data, pointFeatures = [], pathFeatures = [];
                var paths, circles, names, oceanData = this.oceanData, ocean;

                // split features into points or paths
                for (var i = data.length - 1; i >= 0; i--) {
                    var d = data[i], feature = this.getFeatureFromData(d);

                    if (feature) {
                        if (GeoUtils.isPointFeature(feature)) {
                            pointFeatures.push(d);
                        } else {
                            pathFeatures.push(d);
                        }
                    }
                }

                // render path elements
                if (pathFeatures.length) {
                    paths = this.g.selectAll('path').data(pathFeatures);
                    paths.enter().append('path');
                    paths.exit().remove();

                    this.renderPaths(paths);
                    this.applyAttributes(paths);
                }

                // render circle elements
                if (pointFeatures.length && this.options.pointRadius > 0) {
                    circles = this.g.selectAll('circle').data(pointFeatures);
                    circles.enter().append('circle');
                    circles.exit().remove();

                    this.renderCircles(circles);
                    this.applyAttributes(circles);
                }
                if (pathFeatures.length && this.options.showFeatureName) {
                    names = this.g.selectAll('text').data(pathFeatures);
                    names.enter().append('text');
                    names.exit().remove();
                    this.renderNames(names);
                }

                // render ocean
                if (oceanData) {
                    ocean = this.oceang.selectAll('text').data(oceanData);
                    ocean.enter().append('text');
                    ocean.exit().remove();
                    this.renderOcean(ocean, this.projection);
                } else {
                    this.renderDropShadow(this.projection);
                }

                if (fn) {
                    fn('baseLayer');
                }

            },

            showName : function(_) {
                this.options.showFeatureName = _;
            },

            useSmallFontSize : function(_) {
                this._useSmallFontSize = _;
            },
            renderPaths : function(sel) {
                var self = this;

                sel.attr('d', function(d) {
                    var feature = self.getFeatureFromData(d);
                    return self.path(feature);
                });
            },

            renderCircles : function(sel) {
                var radius = this.scale && this.options.pointRadius ? this.options.pointRadius / this.scale : 0;
                var self = this;

                sel.each(function() {
                    var el = d3.select(this), feat = self.getFeatureFromData(el.datum());
                    var coords = feat.geometry.coordinates, p = self.projection(coords);

                    el.attr('cx', p[0]).attr('cy', p[1]).attr('r', radius);
                });
            },

            renderOcean : function(sel, projection) {
                var self = this;

                sel
                    .each(function() {
                        var el = d3.select(this), feat = el.datum(), centroid = feat.centroid, t = projection
                            .translate(), p = projection(centroid);
                        var fontSize = self.oceang.attr('font-size'), fontWeight = self.oceang.attr('font-weight');
                        var fontFamily = self.oceang.attr('font-family');

                        var oceanName = langManager.get(feat.name);
                        var labelSize = TextUtils.fastMeasure(oceanName, fontSize, fontWeight, fontFamily);

                        el.attr('x', p[0] - t[0] - labelSize.width / 2).attr('y', p[1] - t[1] - labelSize.height / 2)
                            .text(oceanName);
                    });
            },

            createDropShadow : function(lineWidth) {
                if (!this.filter) {
                    this.filter = this.defs.append('filter').attr('id', 'dynaDropShadow');
                    this.feGaussianBlur = this.filter.append('feGaussianBlur').attr('in', 'SourceAlpha').attr('result',
                        'blur').attr('stdDeviation', lineWidth);
                    var _componentTransfer = this.filter.append('feComponentTransfer').attr('result', 'transferBlur');
                    _componentTransfer.append('feFuncA').attr('type', 'linear').attr('slope', '1');
                    var feMerge = this.filter.append('feMerge');
                    feMerge.append('feMergeNode').attr('in', 'transferBlur');
                    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');
                }
            },

            deleteDropShadow : function() {
                if (this.filter) {
                    this.filter.remove();
                    this.filter = null;
                    this.feGaussianBlur = null;
                }
            },

            renderDropShadow : function(projection) {
                var self = this;
                var projectionScale = 1000, scale = projection.scale();
                var adjustedScale = scale / projectionScale, lineWidth = 1 / adjustedScale;

                if (self.feGaussianBlur) {
                    self.feGaussianBlur.attr('stdDeviation', lineWidth);
                }
            },

            applyAttributes : function(sel) {
                ObjectUtils.each(this.options.attributes, function(name, value) {
                    sel.attr(name, value);
                });
            },

            move : function(t, s) {
                var hidden = this.scale === null;

                this.scale = s;
                var adjustedScale = this.adjustElementScale(s);

                this.g.attr('transform', 'translate(' + (t[0]) + ',' + (t[1]) + ') scale(' + adjustedScale + ')');

                var projection = d3.geo.mercator().scale(s).translate(t);
                if (this.oceang) {
                    this.oceang.attr('transform', 'translate(' + (t[0]) + ',' + (t[1]) + ')');
                    var ocean = this.oceang.selectAll('text');
                    this.renderOcean(ocean, projection);
                } else {
                    this.renderDropShadow(projection);
                }

                if (hidden) {
                    this.svg.attr('display', null);
                }
            },

            height : function(x) {
                if (!arguments.length) {
                    return this.size.height;
                }

                this.size.height = x;
                this.clipRect.attr('height', x);

                return this;
            },

            width : function(x) {
                if (!arguments.length) {
                    return this.size.width;
                }

                this.size.width = x;
                this.clipRect.attr('width', x);

                return this;
            },

            getFeatureElements : function() {
                return d3.selectAll(this.g.node().childNodes);
            },

            remove : function() {
                this.svg.remove();
                this.svg = null;
            },

            getMapBoundingBox : function(root) {
                var rect = this.g.node().getBoundingClientRect();
                var rootRect = root.getBoundingClientRect();

                return [
                    [
                        rect.left - rootRect.left, rect.top - rootRect.top
                    ], [
                        rect.right - rootRect.left, rect.bottom - rootRect.top
                    ]
                ];
            },

            switchLayer : function(geodata) {
                if (geodata.length > 0) {
                    this.data = geodata;

                    // clear all circles and path
                    this.getFeatureElements().remove();

                    this.render();
                    this.adjustElementScale();
                }
            },

            zoomLevel : function(_) {
                if (!arguments.length) {
                    return this.zoomlevel;
                }

                this.zoomlevel = _;
                return this;
            },

            adjustElementScale : function() {
                var projectionScale = this.projection.scale(), adjustedScale = this.scale / projectionScale;
                var radius = this.options.pointRadius / adjustedScale, lineWidth = this.options.strokeWidth /
                    adjustedScale, features = this.getFeatureElements();

                var fontSize;
                if (this._useSmallFontSize) {
                    fontSize = 12 / adjustedScale;
                } else {
                    fontSize = 10 / adjustedScale;
                }

                features.filter('circle').attr('r', radius).attr('stroke-width', function(d) {
                    return d.selected ? lineWidth * 2 : lineWidth;
                });

                features.filter('path').attr('stroke-width', function(d) {
                    return d.selected ? lineWidth * 2 : lineWidth;
                });

                features.filter('text').attr('font-size', fontSize + 'px');
                return adjustedScale;
            },

            show : function(show) {
                if (show) {
                    this.g.attr("display", "block");
                } else {
                    this.g.attr("display", "none");
                }

                return this;
            },

            showOceanName : function(show) {
                if (show) {
                    this.oceang.attr("display", "block");
                } else {
                    this.oceang.attr("display", "none");
                }

                return this;
            },

            renderNames : function(sel) {
                var namesIndex = 0;
                var self = this;

                sel.each(function() {
                    namesIndex++;
                    if (self._useSmallFontSize) {
                        if (namesIndex % 10 !== 0) {
                            return;
                        }
                    } else {
                        if (namesIndex % 2 !== 0) {
                            return;
                        }
                    }

                    var el = d3.select(this);
                    var feat = self.getFeatureFromData(el.datum());
                    var p = GeoUtils.resolveCentroid(feat, self.projection);
                    var name = feat.properties ? feat.properties.name : feat.description;

                    el.attr('x', p[0]).attr('y', p[1]).text(name).attr('font-size', "2px")
                        .attr("font-weight", "normal").attr("font-family", "Arial").attr("fill", "#C0C0C0").attr(
                            "stroke", "none");
                });
            },

            destroy : function() {

                this.clipRect = null;
                this.data = null;
                this.oceanData = null;
                this.defs = null;

                if (this.oceang) {
                    this.oceang.remove();
                    this.oceang = null;
                }
                if (this.g) {
                    this.g.selectAll('path').remove();
                    this.g.selectAll('circle').remove();
                    this.g.selectAll('text').remove();
                    this.g.remove();
                    this.g = null;
                }
                if (this.svg) {
                    this.svg.remove();
                    this.svg = null;
                }

            }

        };
        ObjectUtils.extend(GeoFeatureLayer.prototype, extension);
        return GeoFeatureLayer;
    });

define('sap/viz/geo/basemap/cvom/Provider',[
    "sap/viz/geo/basemap/AbstractProvider",
    "sap/viz/geo/Bounds",
    "sap/viz/geo/basemap/cvom/GeoFeatureLayer",
    "sap/viz/geo/utils/Logger",
    "jquery",
    "exports"
], function(
    AbstractProvider,
    Bounds,
    GeoFeatureLayer,
    Logger,
    $
) {

    var MAX_BOUNDS = new Bounds([
        180, 85
    ], [
        -180, -65
    ]);

    /**
     * Create a new CVOM(SVG) base map provider object.
     * 
     * @constructor
     * @alias sap.viz.geo.basemap.cvom.Provider
     * @augments sap.viz.geo.basemap.AbstractProvider
     * @param {Object}
     *            [options] the options object
     * @param {Array}
     *            [options.bounds=[[180, 85],[-180, -65]]] The initial bounds of
     *            the map view. It should be a 2-dimensions array including the
     *            longitude and latitude of diagonal apexes. If bounds is not
     *            provided, the default bounds will be the world.
     * @param {boolean}
     *            [options.disableInteraction=false] a boolean value to indicate
     *            whether we can do pan and zoom on map
     */
    // OO style
    var CVOMBasemapProvider = function(options) {
        AbstractProvider.call(this, options, null, "sap.viz.geo.basemap.cvom.Provider");

        var bounds = this._options.bounds;

        this._bounds = bounds ? new Bounds(bounds[0], bounds[1]) : MAX_BOUNDS;

        this._scale = null;
        this._minScale = null;
        this._maxScale = 100000;
        this._translate = [
            0, 0
        ];

        this._projection = d3.geo.mercator();
        // compatible with d3 v3 and d3 v2, disable re-sampling in d3
        if (this._projection.precision) {
            this._projection.precision(0);
        }

        this._center = this._calculateCenter(this._bounds);

        this._enablePan = true;
    };

    CVOMBasemapProvider.prototype = Object.create(AbstractProvider.prototype);

    CVOMBasemapProvider.prototype.constructor = CVOMBasemapProvider;

    // override parent methods
    CVOMBasemapProvider.prototype.render = function(container, cb, repository) {

        Logger.profiling("Map:initialization-basemap_rendering-cvom_basemap_rendering");

        this.initContainer(container);

        repository.getWorldMapFeatures().then(this.renderBaseLayer.bind(this, cb));

        return this;
    };

    CVOMBasemapProvider.prototype.destroy = function() {
        AbstractProvider.prototype.destroy.call(this);
        this._svg.remove();
        this._rootEl = null;
        this._root.remove();

        this._baseLayer = null;
        return this;
    };

    CVOMBasemapProvider.prototype.bounds = function(_) {
        if (!arguments.length) {

            var leftTop = this._projection.invert([
                0, 0
            ]);
            var rightBottom = this._projection.invert([
                this._width, this._height
            ]);
            this._bounds = new Bounds(leftTop, rightBottom);

            return this._bounds;
        }

        var d = $.Deferred();

        this._bounds = this._adjustBound(_);
        this._center = this._calculateCenter(this._bounds);
        var oldT = [
            this._translate[0], this._translate[1]
        ];
        var oldS = this._scale;
        this.computeTS();
        var t = this._translate;
        var s = this._scale;

        var zoom = false, pan = false, boundsChanged = false;
        if (s !== oldS) {
            zoom = true;
            boundsChanged = true;
        } else if (t[0] !== oldT[0] || t[1] !== oldT[1]) {
            pan = true;
            boundsChanged = true;
        }

        if (zoom) {
            this._onZoomStart();
        } else if (pan) {
            this._onPanStart();
        }
        this.moveInternal(t, s);
        if (zoom) {
            this._onZoomEnd();
            this._onZoomComplete();
        } else if (pan) {
            t = this._translate;
            this._onPanEnd([
                t[0] - oldT[0], t[1] - oldT[1]
            ]);
            this._onPanComplete();
        }

        d.resolve();
        return d.promise();
    };

    CVOMBasemapProvider.prototype._adjustBound = function(bound) {
        var bounds = MAX_BOUNDS.intersects(bound);
        return bounds;
    };

    CVOMBasemapProvider.prototype._calculateCenter = function(bound) {
        var centerX = (bound.max()[0] + bound.min()[0]) / 2;
        var projection = this._projection ? this._projection : d3.geo.mercator();
        var centerY = projection.invert([
            0, (projection(bound.max())[1] + projection(bound.min())[1]) / 2
        ])[1];
        return [
            centerX, centerY
        ];
    };

    CVOMBasemapProvider.prototype.zoomInOut = function(direction, loc) {
        var zoomFactor = 5 / 4;
        var scale = this.scale(), s = Math.pow(zoomFactor, direction) * scale, newScale = Math.min(Math.max(
            this._minScale, s), this._maxScale);

        if (scale === newScale) {
            return;
        }

        // either use the supplied loc parameter or the middle of the container
        // as
        // the
        // zoom focal point
        var location = loc || [
            this._width / 2, this._height / 2
        ],

        // get current center-point longitude/latitude
        locationCoords = this._projection.invert(location);
        this._projection.scale(newScale);
        var newLocation = this._projection(locationCoords);
        var diff = [
            newLocation[0] - location[0], newLocation[1] - location[1]
        ];
        var translate = this.translate();
        while (Math.abs(diff[0]) > 1 || Math.abs(diff[1]) > 1) {
            translate[0] -= diff[0];
            translate[1] -= diff[1];
            this._projection.translate(translate);
            newLocation = this._projection(locationCoords);
            diff = [
                newLocation[0] - location[0], newLocation[1] - location[1]
            ];
        }

        // derive new translate values from the midpoint offsets
        this._onZoomStart();
        this.translate(translate);
        this._scale = newScale;
        this._bounds = null;
        this.moveInternal(translate, newScale);
        this._onZoomEnd();
        this._onZoomComplete();
    };

    CVOMBasemapProvider.prototype.zoom = function(direction) {
        this.zoomInOut(direction);
    };

    CVOMBasemapProvider.prototype.pan = function(offsets) {
        var translate = this.translate();
        translate[0] += offsets[0];
        translate[1] += offsets[1];
        this.translate(translate);
        this.moveInternal(this.translate(), this._scale);
    };

    CVOMBasemapProvider.prototype.resetZoom = function() {
        this.computeTS();
        this._onZoomStart();
        this.moveInternal(this._translate, this._scale);
        this._onZoomEnd();
        this._onZoomComplete();
    };

    function resize() {
        var container = this._container.node();

        var prevWidth = this._width;
        var prevHeight = this._height;

        this._width = container.clientWidth;
        this._height = container.clientHeight;

        this._svg.style('width', this._width + 'px');
        this._svg.style('height', this._height + 'px');

        this._backgroundEl.attr('width', this._width);
        this._backgroundEl.attr('height', this._height);

        this._baseLayer.width(this._width);
        this._baseLayer.height(this._height);

        var centerPoint = [
            prevWidth / 2, prevHeight / 2
        ];
        var mapCenter = this.toLngLat(centerPoint);
        this.center(mapCenter);

        this._onPanEnd([
            (this._width - prevWidth) / 2, (this._height - prevHeight) / 2
        ]);
        this._onPanComplete();
    }

    CVOMBasemapProvider.prototype.refresh = function() {
        var d = $.Deferred();
        resize.call(this);
        d.resolve();
        return d.promise();
    };

    // private methods
    CVOMBasemapProvider.prototype.initContainer = function(container) {
        // only init containers one time
        if (this._rootEl) {
            return;
        }

        this._width = container.clientWidth;
        this._height = container.clientHeight;
        this.computeTS();

        // create root element
        var parent = this._container = d3.select(container);
        this._root = parent.append('div').attr('class', 'cvomRoot');
        this._svg = this._root.append('svg').attr('transform', "translate(0, 0)").attr('style',
            "left: 0px; top: 0px; width:" + this._width + "px; height:" + this._height + "px;");

        this._rootEl = this._svg.append('g').attr('class', 'v-geo-container');

        // ocean background
        this._backgroundEl = this._rootEl.append('rect').attr('width', this._width).attr('height', this._height).attr(
            'class', 'viz-geo-container-background v-geo-container-background').attr('fill', '#8bb5d2').attr('opacity',
            '1');

        if (this.borderVisible()) {
            this._backgroundEl.attr('stroke', '#CCC');
        }

        // create base map layer
        this._baseEl = this._rootEl.append('g').attr('class', 'viz-geo-container-base v-geo-container-base').attr(
            'fill', '#ffffff').attr('stroke', '#c2c2c2');

        if (!this._options.disableInteraction) {
            this.initZoomAndPan();
        }
    };

    CVOMBasemapProvider.prototype.initZoomAndPan = function() {
        var dom = this._root.node();
        var self = this;
        // pan
        dom.addEventListener("mousedown", function(event) {
            if (!self._enablePan) {
                return;
            }
            var panStart = false;
            var initX = event.pageX;
            var initY = event.pageY;
            var deltaX = 0;
            var deltaY = 0;
            // event.stopPropagation();
            event.preventDefault();
            function onMousemove(event) {
                if (!panStart) {
                    panStart = true;
                    self._onPanStart();
                }

                var offsets = [];
                offsets[0] = event.pageX - initX;
                offsets[1] = event.pageY - initY;
                offsets = self._validatePan(offsets);
                if (offsets[0] !== 0 || offsets[1] !== 0) {
                    deltaX += offsets[0];
                    deltaY += offsets[1];
                    initX += offsets[0];
                    initY += offsets[1];
                    self.pan(offsets);
                    self._onPan([
                        deltaX, deltaY
                    ]);
                }
                // event.stopPropagation();
                event.preventDefault();
            }
            function onMouseup(event) {
                if (panStart) {
                    self._onPanEnd([
                        deltaX, deltaY
                    ]);
                    self._onPanComplete();
                }
                event.preventDefault();
                window.removeEventListener("mousemove", onMousemove);
                window.removeEventListener("mouseup", onMouseup);
            }
            window.addEventListener("mousemove", onMousemove);
            window.addEventListener("mouseup", onMouseup);
        });

        // zoom
        function onZoom(event) {
            var target = event.currentTarget;
            var rect = target.getBoundingClientRect();
            var x = event.clientX - rect.left - target.clientLeft;
            var y = event.clientY - rect.top - target.clientTop;
            var point = self.toLngLat([
                x, y
            ]);
            var loc;
            if (self.intersects(new Bounds(point, point))) {
                loc = [
                    x, y
                ];
            }
            var direction = 1;
            if (event.type === "mousewheel") {
                if (event.wheelDelta < 0) {
                    direction = -1;
                }
            }
            self.zoomInOut(direction, loc);
            event.preventDefault();
        }
        dom.addEventListener("dblclick", onZoom);
        dom.addEventListener("mousewheel", onZoom);
    };

    CVOMBasemapProvider.prototype._validatePan = function(offset) {
        var left = false, right = false, top = false, bottom = false;
        var leftTop = this._projection.invert([
            0, 0
        ]);
        var rightBottom = this._projection.invert([
            this._width, this._height
        ]);
        var geoBounds = this.getGeoBounds();
        /*
         * if(this.intersects(new Bounds(leftTop, [leftTop[0],
         * rightBottom[1]]))) { left = true; }
         */
        if (geoBounds.min()[0] <= leftTop[0]) {
            left = true;
        }
        if (geoBounds.max()[0] >= rightBottom[0]) {
            right = true;
        }
        if (geoBounds.max()[1] >= leftTop[1]) {
            top = true;
        }
        if (geoBounds.min()[1] <= rightBottom[1]) {
            bottom = true;
        }
        var newLeft = false, newRight = false, newTop = false, newBottom = false;
        this._projection.translate([
            this._translate[0] + offset[0], this._translate[1] + offset[1]
        ]);
        leftTop = this._projection.invert([
            0, 0
        ]);
        rightBottom = this._projection.invert([
            this._width, this._height
        ]);
        this._projection.translate(this._translate);
        if (geoBounds.min()[0] <= leftTop[0]) {
            newLeft = true;
        }
        if (geoBounds.max()[0] >= rightBottom[0]) {
            newRight = true;
        }
        if (geoBounds.max()[1] >= leftTop[1]) {
            newTop = true;
        }
        if (geoBounds.min()[1] <= rightBottom[1]) {
            newBottom = true;
        }
        if ((left && right) || (!left && !right)) {
            if (left !== newLeft) {
                offset[0] = -this._projection(geoBounds.min())[0];
            } else if (right !== newRight) {
                offset[0] = this._width - this._projection(geoBounds.max())[0];
            }
        } else if (left && !right) {
            offset[0] = offset[0] > 0 ? Math.min(offset[0], this._width - this._projection(geoBounds.max())[0]) : 0;
        } else if (!left && right) {
            offset[0] = offset[0] < 0 ? Math.max(offset[0], -this._projection(geoBounds.min())[0]) : 0;
        }

        if ((top && bottom) || (!top && !bottom)) {
            if (top !== newTop) {
                offset[1] = -this._projection(geoBounds.max())[1];
            } else if (bottom !== newBottom) {
                offset[1] = this._height - this._projection(geoBounds.min())[1];
            }
        } else if (top && !bottom) {
            offset[1] = offset[1] > 0 ? Math.min(offset[1], this._height - this._projection(geoBounds.min())[1]) : 0;
        } else if (!top && bottom) {
            offset[1] = offset[1] < 0 ? Math.max(offset[1], -this._projection(geoBounds.max())[1]) : 0;
        }
        return offset;
    };

    CVOMBasemapProvider.prototype.renderBaseLayer = function(callback, features, oceanFeatures) {
        if (!this._baseLayer) {
            var options = {
                attributes : {
                    stroke : 'inherit',
                    'class' : 'viz-geo-base-layer-feature'
                },
                width : this._width,
                height : this._height,
                pointRadius : 0,
                showFeatureName : false,
                nameSize : 12,
                oceanStyle : {
                    'fill' : '#dceaf7',
                    'font-family' : 'Arial, Helvetica',
                    'font-size' : '11px',
                    'font-weight' : 'normal',
                    'font-style' : 'italic',
                    'stroke' : 'none'
                }
            };
            this._baseLayer = new GeoFeatureLayer(this._baseEl, features, options, oceanFeatures);
        }
        this._baseLayer.render();
        var t = this.translate();
        var s = this.scale();

        this.moveInternal(t, s);
        Logger.profiling("Map:initialization-basemap_rendering-cvom_basemap_rendering");
        callback.call();
    };

    CVOMBasemapProvider.prototype.moveInternal = function(t, s) {
        if (this._baseLayer) {
            this._baseLayer.move(t, s);
        }
    };

    CVOMBasemapProvider.prototype.computeTS = function() {
        // compute scale
        if (this._bounds) {
            var padding = 40;
            var minWidth = 50;
            var scale = 500;
            this._projection.scale(scale).translate([
                0, 0
            ]);
            if (!this._minScale) {
                // use min width scale as min scale to contain whole world
                var maxScreenBounds = MAX_BOUNDS.transform(this._projection);
                var maxlp = maxScreenBounds.min();
                var maxhp = maxScreenBounds.max();
                var minWidthScale = (scale / (maxhp[0] - maxlp[0])) * Math.max(this._width, minWidth);
                this._minScale = minWidthScale < 0 ? -minWidthScale : minWidthScale;
            }

            var screenBounds = this._bounds.transform(this._projection);
            var lp = screenBounds.min();
            var hp = screenBounds.max();
            var widthScale, heightScale;
            if (hp[0] !== lp[0]) {
                widthScale = (scale / (hp[0] - lp[0])) * Math.max(this._width, minWidth);
            } else {
                widthScale = this._maxScale;
            }

            if (hp[1] !== lp[1]) {
                heightScale = (scale / (lp[1] - hp[1])) * Math.max(this._height, minWidth);
            } else {
                heightScale = this._maxScale;
            }

            widthScale = widthScale < 0 ? -widthScale : widthScale;
            heightScale = heightScale < 0 ? -heightScale : heightScale;
            this._scale = Math.min(this._maxScale, Math.max(this._minScale, Math.min(widthScale, heightScale)));
        }

        // compute translate
        this._projection.scale(this._scale).translate([
            0, 0
        ]);
        var center = this._projection(this._center);
        var translate = [
            this._width / 2 - center[0], this._height / 2 - center[1]
        ];
        this._translate = translate;
        this._projection.translate(translate);

    };

    CVOMBasemapProvider.prototype.borderVisible = function() {
        return !(this._options.border && this._options.border.hidden);
    };

    CVOMBasemapProvider.prototype.translate = function(_) {
        if (!arguments.length) {
            return this._translate;
        }
        this._translate[0] = _[0];
        this._translate[1] = _[1];
        this._projection.translate(this._translate);
    };

    CVOMBasemapProvider.prototype.center = function(_) {
        if (!arguments.length) {
            return this._center;
        }
        this._center = _;

        this._bounds = null;
        this.computeTS();

        var t = this._translate;
        var s = this._scale;
        this.moveInternal(t, s);
        return this;
    };

    CVOMBasemapProvider.prototype.scale = function(_) {
        if (!arguments.length) {
            return this._scale;
        }
        this._scale = _;
        this._projection.scale(_);
        this._bounds = null;
        this.computeTS();

        var t = this._translate;
        var s = this._scale;
        this.moveInternal(t, s);
        return this;
    };

    CVOMBasemapProvider.prototype.getOverlayContainerRootNode = function() {
        return this._root.node();
    };

    CVOMBasemapProvider.prototype.getGeoBounds = function() {
        var mapBoundingBox = this._baseLayer.getMapBoundingBox(this._root.node());
        return new Bounds(this.toLngLat(mapBoundingBox[0]), this.toLngLat(mapBoundingBox[1]));
    };
    CVOMBasemapProvider.prototype.toPixel = function(lngLat) {
        return this._projection(lngLat);
    };

    CVOMBasemapProvider.prototype.toLngLat = function(point) {
        return this._projection.invert(point);
    };

    CVOMBasemapProvider.prototype.intersects = function(boundingBox) {
        var res = boundingBox.intersects(this.getGeoBounds());
        return res;
    };

    CVOMBasemapProvider.prototype.togglePan = function(enablePan) {
        if (enablePan === true || enablePan === false) {
            this._enablePan = enablePan;
        } else {
            return this._enablePan;
        }
    };
    CVOMBasemapProvider.prototype.toJSON = function() {
        var json = AbstractProvider.prototype.toJSON.call(this);
        var bounds = this.bounds();
        json.options.bounds = [
            bounds.min(), bounds.max()
        ];
        return json;
    };
    
    CVOMBasemapProvider.prototype.setBasemap = function(basemap) {
        //do not support
        return this;
    };

    return CVOMBasemapProvider;
});

define('sap/viz/geo/basemap/esri/Provider',[
    "sap/viz/geo/basemap/AbstractProvider",
    "sap/viz/geo/Bounds",
    "sap/viz/api/env/Resource",
    "sap/viz/geo/utils/Logger",
    'sap/viz/framework/common/util/ObjectUtils', 
    'require', 
    "jquery",
    'sap/viz/framework/common/util/UADetector',
    "exports"
], function(
    AbstractProvider,
    Bounds,
    Resource,
    Logger,
    ObjectUtils,
    req,
    $,
    UADetector
) {

    var r = req || require;

    var toBounds = function(box) {
        if (!box) {
            return null;
        }
        return new Bounds([
            box.xmin, box.ymin, box.xmax, box.ymax
        ]);
    };

    var defaultOptions = {
        basemap : "topo",
        slider : false,
        wrapAround180 : false,
        autoResize : false
    };

    var fromBounds = function(_) {
        var min = _.min();
        var max = _.max();
        return new esri.geometry.Extent(min[0], min[1], max[0], max[1]);
    };

    /**
     * Create a new {@link http://www.esri.com/|ESRI} base map provider object.
     * 
     * @constructor
     * @alias sap.viz.geo.basemap.esri.Provider
     * @augments sap.viz.geo.basemap.AbstractProvider
     * 
     * @param {Object}
     *            options the configuration object. Get more information from
     *            {@link https://developers.arcgis.com/en/javascript/jsapi/map.html#map1|here}.
     * @param {Object}
     *            [webMap] the configuration to use the web map. EsriProvider
     *            allows user to use the web map stored in ArcGIS online
     *            platform as base map. When use this option, user need require
     *            "esri/arcgis/utils" module.
     * @param {String}
     *            webMap.id the web map id.
     * @param {String}
     *            [webMap.url=http://www.arcgis.com/sharing/content/items]
     *            Specify the domain where the map associated with the web map
     *            id is located.
     * @param {Array}
     *            [esriLayers] the configurations of services in ArcGIS online
     *            platform. EsriProvider also allows user to use the services
     *            hosted in ArcGIS online or ArcGIS server as predefined layers
     *            of base map.
     * @param {String}
     *            esriLayers.type the service type. Available types:
     *            <ul>
     *            <li>EsriProvider.ARCGIS_SERVICE_TYPE_DYNAMIC_MAP</li>
     *            <li>EsriProvider.ARCGIS_SERVICE_TYPE_IMAGE</li>
     *            <li>EsriProvider.ARCGIS_SERVICE_TYPE_TILED_MAP</li>
     *            <li>EsriProvider.ARCGIS_SERVICE_TYPE_FEATURE</li>
     *            </ul>
     * @param {String}
     *            esriLayers.url the url of service.
     * @param {Object}
     *            [esriLayers.options] the options of service.
     */
    var EsriProvider = function(options, webMap, esriLayers) {
        if (Array.isArray(webMap)) {
            this._esriLayers = webMap;
        } else {
            this._webMap = webMap;
            this._esriLayers = esriLayers;
        }

        AbstractProvider.call(this, options, defaultOptions, "sap.viz.geo.basemap.esri.Provider");
    };

    /**
     * The ArcGIS service type: dynamic map service.
     * 
     * @see {@link https://developers.arcgis.com/en/javascript/jsapi/arcgisdynamicmapservicelayer-amd.html}
     * @readonly
     * @default
     * @memberof sap.viz.geo.basemap.esri.Provider
     */
    EsriProvider.ARCGIS_SERVICE_TYPE_DYNAMIC_MAP = "dynamicMapService";
    /**
     * The ArcGIS service type: image service.
     * 
     * @see {@link https://developers.arcgis.com/en/javascript/jsapi/arcgisimageservicelayer-amd.html}
     * @readonly
     * @default
     * @memberof sap.viz.geo.basemap.esri.Provider
     */
    EsriProvider.ARCGIS_SERVICE_TYPE_IMAGE = "imageService";
    /**
     * The ArcGIS service type: tiled map service.
     * 
     * @see {@link https://developers.arcgis.com/en/javascript/jsapi/arcgistiledmapservicelayer-amd.html}
     * @readonly
     * @default
     * @memberof sap.viz.geo.basemap.esri.Provider
     */
    EsriProvider.ARCGIS_SERVICE_TYPE_TILED_MAP = "tiledMapService";
    /**
     * The ArcGIS service type: feature service. When using this type of
     * service, user need require "esri/layers/FeatureLayer" module.
     * 
     * @see {@link https://developers.arcgis.com/en/javascript/jsapi/featurelayer-amd.html}
     * @readonly
     * @default
     * @memberof sap.viz.geo.basemap.esri.Provider
     */
    EsriProvider.ARCGIS_SERVICE_TYPE_FEATURE = "featureLayer";

    EsriProvider.prototype = Object.create(AbstractProvider.prototype);
    EsriProvider.prototype.constructor = EsriProvider;

    function addEsriLayer(layerConfig) {
        var layer;
        switch (layerConfig.type) {
        case EsriProvider.ARCGIS_SERVICE_TYPE_DYNAMIC_MAP:
            layer = new esri.layers.ArcGISDynamicMapServiceLayer(layerConfig.url, layerConfig.options);
            break;
        case EsriProvider.ARCGIS_SERVICE_TYPE_IMAGE:
            layer = new esri.layers.ArcGISImageServiceLayer(layerConfig.url, layerConfig.options);
            break;
        case EsriProvider.ARCGIS_SERVICE_TYPE_TILED_MAP:
            layer = new esri.layers.ArcGISTiledMapServiceLayer(layerConfig.url, layerConfig.options);
            break;
        case EsriProvider.ARCGIS_SERVICE_TYPE_FEATURE:
            layer = new esri.layers.FeatureLayer(layerConfig.url, layerConfig.options);

            try {
                var renderer;
                if (layerConfig.color) {
                    if (layerConfig.color.type === "gradient") {
                        renderer = new esri.renderer.SimpleRenderer(new esri.symbol.SimpleFillSymbol()
                            .setOutline(new esri.symbol.SimpleLineSymbol().setWidth(0.5)));
                        renderer.setColorInfo({
                            field : layerConfig.color.bindedField,
                            minDataValue : layerConfig.color.start.val,
                            maxDataValue : layerConfig.color.end.val,
                            colors : [
                                new dojo.Color(layerConfig.color.start.color),
                                new dojo.Color(layerConfig.color.end.color)
                            ]
                        });
                        layer.setRenderer(renderer);
                    }

                } else {

                    // prevent exception now
                    var symbol = new esri.symbol.SimpleFillSymbol();
                    symbol.setColor([
                        150, 150, 150, 0.5
                    ]);

                    renderer = new esri.renderer.ClassBreaksRenderer(symbol, layerConfig.fieldId);

                    renderer.addBreak(0, 25, new esri.symbol.SimpleFillSymbol().setColor([
                        56, 168, 0, 0.5
                    ]));
                    renderer.addBreak(25, 75, new esri.symbol.SimpleFillSymbol().setColor([
                        139, 209, 0, 0.5
                    ]));
                    renderer.addBreak(75, 175, new esri.symbol.SimpleFillSymbol().setColor([
                        255, 255, 0, 0.5
                    ]));
                    renderer.addBreak(175, 400, new esri.symbol.SimpleFillSymbol().setColor([
                        255, 128, 0, 0.5
                    ]));
                    renderer.addBreak(400, Infinity, new esri.symbol.SimpleFillSymbol().setColor([
                        255, 0, 0, 0.5
                    ]));

                    layer.setRenderer(renderer);

                }
            } catch (e) {

            }

            break;
        }

        if (layer) {
            this._instance.addLayer(layer);
        }
    }

    function applyEsriLayers() {
        var layers = this._esriLayers;
        if (layers) {
            layers.forEach(addEsriLayer, this);
        }
    }

    function createESRIMapInstance(container, cb) {
        var serverMapConfig = this._serverMapConfig, serverMapType;
        if (serverMapConfig) {
            serverMapType = serverMapConfig.type;
        }
        var webMap = this._webMap;
        if (webMap) {
            var arcgisUtils = esri.arcgis.utils;
            arcgisUtils.arcgisUrl = webMap.url || "http://www.arcgis.com/sharing/content/items";
            arcgisUtils.createMap(webMap.id, container, {
                mapOptions : ObjectUtils.clone(this._options)
            }).then(function(response) {
                this._instance = response.map;
                afterCreateInstance.call(this, container, cb);
            }.bind(this));
        } else {
            this._instance = new esri.Map(container, this._options);
            afterCreateInstance.apply(this, arguments);
        }
    }

    function afterCreateInstance(container, cb) {
        applyEsriLayers.call(this);
        
        var instance = this._instance;
        var onUpdateEnd = instance.on("update-end", function() {
            onUpdateEnd.remove();
            Logger.profiling("Map:initialization-basemap_rendering-esri_basemap_rendering");
            var element = this._instance.graphics._div.rawNode.parentNode.parentNode.appendChild(document
                .createElement("div"));
            element.setAttribute("style", "width:100%;height:100%;position:absolute");
            this._overlayContainerRootNode = element;
            if (cb) {
                cb.call();
            }
        }.bind(this));
        instance.on("pan-start", this._onPanStart.bind(this));
        instance.on("pan", function(evt) {
            if(!this._instance){
                return;
            }
            var delta = evt.delta;
            this._onPan([
                delta.x, delta.y
            ]);
        }.bind(this));
        instance.on("pan-end", function(evt) {
            if(!this._instance){
                return;
            }
            saveMapCenter.call(this);
            var delta = evt.delta;
            this._onPanEnd([delta.x, delta.y]);
            waitUpdateEnd.call(this).then(this._onPanComplete.bind(this));
        }.bind(this));
        instance.on("zoom-start", this._onZoomStart.bind(this));
        instance.on("zoom-end", function(){
            if(!this._instance){
                return;
            }
            saveMapCenter.call(this);
            this._onZoomEnd();
            waitUpdateEnd.call(this).then(this._onZoomComplete.bind(this));
        }.bind(this));
        
        instance.on("basemap-change", function(){
            this._onBasemapChange();
        }.bind(this));
        instance.on("update-end", mapUpdateEnd.bind(this));
        instance.on("resize", resize.bind(this));
    }
    
    function waitUpdateEnd() {
        var d = $.Deferred();
        var instance = this._instance;
        
        var registerUpdateEnd = function() {
            var updateEnd = instance.on('update-end', function() {
                updateEnd.remove();
                d.resolve();
            });
        };

        if (!this._root.hasAttribute('data-updating')) {
            var updateStart = instance.on('update-start', function() {
                updateStart.remove();
                registerUpdateEnd();
            });
        } else {
            registerUpdateEnd();
        }

        return d.promise();
    }

    EsriProvider.prototype.render = function(container, cb) {
        Logger.profiling("Map:initialization-basemap_rendering-esri_basemap_rendering");
        r([
            'esri/map', 'esri/arcgis/utils', 'esri/layers/FeatureLayer'
        ], function() {
            this._root = container = container.appendChild(document.createElement("div"));
            container.className = "esriRoot";
            createESRIMapInstance.call(this, container, cb);
        }.bind(this));

        return this;
    };

    function mapUpdateEnd() {
        
        if (this._isResized && this._mapCenter) {
            this._isResized = false;
            this._instance.centerAt(this._mapCenter);
        } else {
            saveMapCenter.call(this);
        }
    }

    function saveMapCenter() {
        var instance = this._instance;
        if (instance) {
            this._mapCenter = instance.extent.getCenter();
        }
    }

    function resize() {
        this._isResized = true;
    }

    EsriProvider.prototype._onPropertiesChange = function() {
        var d = $.Deferred();
        var instance = this._instance;
        var resolveImmediately = true;
        if (instance) {
            var basemap = this._options.basemap;
            if (basemap !== instance.getBasemap()) {
                resolveImmediately = false;
                instance.setBasemap(this._options.basemap);
                waitUpdateEnd.call(this).then(d.resolve.bind(d));
            }
        }

        if (resolveImmediately) {
            d.resolve();
        }

        return d.promise();
    };

    EsriProvider.prototype.destroy = function() {
        AbstractProvider.prototype.destroy.call(this);
        this._instance.destroy();
        this._instance = null;
        this._root.parentNode.removeChild(this._root);
        this._root = null;
        return this;
    };

    EsriProvider.prototype.bounds = function(_) {
        if (!arguments.length) {
            var bounds = this._instance.geographicExtent;
            return toBounds(bounds);
        }

        var d = $.Deferred();
        var suffix = "." + ObjectUtils.guid();
        var panCompleteEventName = "_panCompleteDone" + suffix;
        var zoomCompleteEventName = "_zoomCompleteDone" + suffix;
        var fn = function(){
            this.off(panCompleteEventName).off(zoomCompleteEventName);
            d.resolve();
        };
        this.on(panCompleteEventName, fn).on(zoomCompleteEventName, fn);

        this._instance.setExtent(fromBounds(_), true);
        return d.promise();
    };

    EsriProvider.prototype.refresh = function() {
        var instance = this._instance;
        instance.resize(true);
        if (UADetector.isChrome()) {
            var onResize = instance.on("resize", function(){
                onResize.remove();
                var root = instance.root;
                var display = root.style.display;
                root.style.display = "none";
                var width = root.offsetWidth;
                root.style.display = display;
            });
        }
        return waitUpdateEnd.call(this);
    };

    EsriProvider.prototype.getOverlayContainerRootNode = function() {
        return this._overlayContainerRootNode;
    };

    EsriProvider.prototype.getGeoBounds = function() {
        var bounds = this._instance.geographicExtent;
        return toBounds(bounds);
    };

    EsriProvider.prototype.toPixel = function(lngLat) {
        var point = this._instance.toScreen(new esri.geometry.Point(lngLat));
        return [
            point.x, point.y
        ];
    };

    EsriProvider.prototype.getMapRootNode = function() {
        return this._instance.root;
    };

    EsriProvider.prototype.toLngLat = function(point, linear) {
        var val;
        if (linear === true) {
            val = this._instance.toMap(new esri.geometry.Point(point));
            return esri.geometry.xyToLngLat(val.x, val.y, true);
        } else {
            val = this._instance.toMap(new esri.geometry.Point(point));
            return [
                val.getLongitude(), val.getLatitude()
            ];
        }
    };

    EsriProvider.prototype.intersects = function(boundingBox) {
        var xMin = boundingBox.min()[0];
        var xMax = boundingBox.max()[0];
        var yMin = boundingBox.min()[1];
        var yMax = boundingBox.max()[1];
        var extent = this._instance.geographicExtent.intersects(new esri.geometry.Extent(xMin, yMin, xMax, yMax));
        if (extent) {
            return new Bounds([
                extent.xmin, extent.ymin
            ], [
                extent.xmax, extent.ymax
            ]);
        }
        return null;
    };

    EsriProvider.prototype.zoom = function(direction) {
        var level = this._instance.getZoom();
        if (level != -1) {
            level += direction;
            this._instance.setZoom(level);
        } else {
            if (direction > 0) {
                this._instance.setZoom(0);
            } else {
                this._instance.setZoom(1);
            }
        }
    };

    EsriProvider.prototype.togglePan = function(enablePan) {
        if (arguments.length === 0) {
            return this._instance.isPan;
        }

        if (enablePan) {
            this._instance.enablePan();
        } else {
            this._instance.disablePan();
        }
    };

    EsriProvider.prototype.toJSON = function() {
        var json = AbstractProvider.prototype.toJSON.call(this);
        if (this._instance && this._instance.geographicExtent) {
            json.options.center = this.bounds().getCenter();
            json.options.zoom = this._instance.getZoom();
        }

        json.webMap = ObjectUtils.clone(this._webMap);
        json.esriLayers = ObjectUtils.clone(this._esriLayers);

        return json;
    };

    EsriProvider.prototype.getBasemapConfigs = function() {
        var imagePrefix = Resource.path("sap.viz.map.Resources") + "/images/";
        return [
            {
                'name' : 'topo',
                'langCode' : 'IDS_TOPO',
                'img' : imagePrefix + "topo.png"
            }, {
                'name' : 'gray',
                'langCode' : 'IDS_GRAY',
                'img' : imagePrefix + "gray.png"
            }, {
                'name' : 'streets',
                'langCode' : 'IDS_STREETS',
                'img' : imagePrefix + "streets.png"
            }, {
                'name' : 'satellite',
                'langCode' : 'IDS_SATELLITE',
                'img' : imagePrefix + "satellite.png"
            }
        ];
    };
    
    EsriProvider._buildConstructorArgsFromSerialization = function(o) {
        var ret = AbstractProvider._buildConstructorArgsFromSerialization(o);
        ret.push(o.webMap, o.esriLayers);
        return ret;
    };
    
    return EsriProvider;
});

define('sap/viz/geo/basemap/esri/Authentication',[
    "jquery", 
    "exports"
], function($) {

    /**
     * ESRI Authentication Util
     * 
     * 
     * @constructor
     * @alias sap.viz.geo.basemap.esri.Authentication
     */
    var Authentication = {
        
    };

    var LOGIN_URL = "https://www.arcgis.com/sharing/generateToken";
    var PORTAL_URL = "https://www.arcgis.com/sharing/rest/portals/self";
    var TIME_OUT = 10000, MAX_EXPIRATION = 60 * 24 * 14;
    var ERROR_MESSAGE = {
        "invaldUser" : "Not a subscription user",
        "invalidUsernamePassword" : "Invalid user name or password",
        "emptyUsername" : "Username may not be blank",
        "emptyPassword" : "Password may not be blank",
        "emptyUsernamePassword" : "Username and password may not be blank",
        "canNotLogin" : "Can not log in to esri",
        "unknown" : "Unknown error"
    };
    var STATE = {
        "waitingForResponse" : 1,
        "pendingSuccess" : 2,
        "pendingFailure" : 4,
        "loginSuccess" : 8
    };
    var accessToken_ = null;
    var errorMessage_ = null;
    var loginState_ = null;

    var username_ = null;

    var disabled_ = null;
  
    var description_ = "";

    /**
     * ESRI login on api
     * 
     * 
     * @memberof sap.viz.geo.basemap.esri.Authentication
     * @param {Object}
     *            [option] the object for login.
     * @param {Object}
     *            [option.credential] the username/password used to log in.
     * @param {Object}
     *            [option.credential.username] the username used to log in.
     * @param {Object}
     *            [option.credential.password] the password used to log in.
     * @param {Function}
     *            [onSuccess] call back when log on success. token will be
     *            return as parameter in call back
     * @param {Function}
     *            [onFail] call back when log on fail. error message will be
     *            return as parameter in call back
     */
    Authentication.login = function(option, onSuccess, onFailure) {

        function loginAction(username, password) {
            $.ajax({
                url : LOGIN_URL,
                type : "POST",
                data : {
                    username : username,
                    password : password,
                    referer : window.location.host,
                    expiration : MAX_EXPIRATION,
                    f : "json"
                },
                dataType : "json",
                success : function(response) {
                    if (response.token) {
                        var token = response.token;
                        // console.log("token:" + token);
                        $.ajax({
                            url : PORTAL_URL,
                            data : {
                                token : token,
                                f : "json"
                            },
                            dataType : "json",
                            type : "POST",
                            success : function(response) {
                                if (response.id) {
                                    accessToken_ = token;
                                    username_ = username;
                                    onSuccess(token);
                                } else {
                                    onFailure(ERROR_MESSAGE.invaldUser);
                                }
                            },
                            error : function(jqXHR, textStatus, errorThrown) {
                                // console.log("Error: "+textStatus);
                                onFailure(errorThrown);
                            },
                            timeout : TIME_OUT
                        });
                    } else {
                        var error = response.error;
                        if (error) {
                            onFailure(error.details.toString());
                        } else {
                            onFailure(ERROR_MESSAGE.unknown);
                        }
                    }
                },
                error : function(jqXHR, textStatus, errorThrown) {
                    onFailure(errorThrown);
                    // console.log("Error: ", error);
                },
                timeout : TIME_OUT
            });
        }

        loginAction(option.credential.username, option.credential.password);
    };

    function checkToken() {
        return true;
    }

    /**
     * Esri token validation api
     * 
     * 
     * @memberof sap.viz.geo.basemap.esri.Authentication
     * @param {String}
     *            [token] the token to be verified.
     * @param {Function}
     *            [onSuccess] call back if token is valid.
     * @param {Function}
     *            [onFail] call back if token is not valid. error message will
     *            be return as parameter in call back
     */
    Authentication.checkLoginStatus = function(token, onSuccess, onFailure) {
        $.ajax({
            url : PORTAL_URL,
            data : {
                token : token,
                f : "json"
            },
            dataType : "json",
            type : "POST",
            success : function(response) {
                if (response.id) {
                    onSuccess();
                } else {
                    onFailure(response.error.message);
                }
            },
            error : function(jqXHR, textStatus, errorThrown) {
                // console.log("Error: "+textStatus);
                onFailure(errorThrown);
            },
            timeout : TIME_OUT
        });
    };

    /**
     * Set/Get ESRI Credential. If no parameter is passed, only username &
     * accessToken will be returned if available
     * 
     * 
     * @memberof sap.viz.geo.basemap.esri.Authentication
     * @param {Object}
     *            [credential] the object for credential.
     * @param {Object}
     *            [credential.username] the username/password used to log in.
     * @param {Object}
     *            [credential.password] the username used to log in.
     * @param {Object}
     *            [credential.accessToken] the accessToken which is got by logon
     *            api.
     */

    Authentication.credential = function(credential) {
        if (!arguments.length) {
            return {
                username : username_,
                accessToken : accessToken_,
                disabled : disabled_,
                description : description_
            };
        } else {
            username_ = credential.username;
            accessToken_ = credential.accessToken;
            disabled_ = credential.disabled;
            description_ = credential.description;
        }

    };

    Authentication.BASEMAP_ACCESSTOKEN_NEEDED = true;

    return Authentication;
});
define('sap/viz/geo/basemap/navteq/Provider',[
    "sap/viz/geo/Bounds",
    "sap/viz/api/env/Resource",
    "sap/viz/geo/basemap/AbstractProvider",
    "sap/viz/framework/common/util/ObjectUtils",
    "require",
    "exports"
], function(
    Bounds,
    Resource,
    AbstractProvider,
    ObjectUtils,
    req
) {
    var r = req || require;

    var toLngLat = function(c) {
        return [
            c.lng, c.lat
        ];
    };

    var toBounds = function(box) {
        return new Bounds(toLngLat(box.getTopLeft()), toLngLat(box.getBottomRight()));
    };

    var fromLngLat = function(_) {
        return new H.geo.Point(_[1], _[0]);
    };

    var fromBounds = function(_) {
        var min = _.min(), max = _.max();
        return H.geo.Rect.fromPoints(fromLngLat([
            min[0], max[1]
        ]), fromLngLat([
            max[0], min[1]
        ]));
    };

    // Check whether the environment should use hi-res maps
    var hidpi = ('devicePixelRatio' in window && window.devicePixelRatio > 1);
    var defaultOptions = {
        basemap : "normal-map",
        pixelRatio : hidpi ? 2 : 1,
        zoom : 3
    };

    var ZERO = 0, PAN = 1, ZOOM = 2;

    function trigerlistener(type, name, e) {
        this._evtType |= type;

        if (('dragstart' === name || 'touchstart' === name) && this.togglePan()) {
            this._draging++;
            this._dragStartPoint = [
                e.currentPointer.viewportX, e.currentPointer.viewportY
            ];
            if (!this._panning) {
                this._delta = [
                    0, 0
                ];
            }
            this._panning = true;
        } else if ('wheel' === name) {
            this.zoom(-1 * e.delta);
        } else if ('dbltap' === name || 'dblclick' === name) {
            this.zoom(1);
        }
    }

    function eventListener(name, e) {
        var offset = [
            e.currentPointer.viewportX - this._dragStartPoint[0], e.currentPointer.viewportY - this._dragStartPoint[1]
        ];
        if (!(this._evtType & 2) && (this._evtType & 1) && this.togglePan()) {
            var fnName;
            switch (name) {
            case "dragstart":
            case "touchstart":
                fnName = "_onPanStart";
                break;
            case "drag":
            case "touch":
                fnName = "_onPan";
                break;
            case "dragend":
            case "touchend":
                fnName = "_onPanEnd";
                break;
            }
            this[fnName](offset);
        }

        if (('dragend' === name || 'touchend' === name) && this.togglePan()) {
            this._draging--;
            this._delta[0] += offset[0];
            this._delta[1] += offset[1];
            if (!(this._evtType & 2) && this._evtType & 1 && !this._panning) {
                this._evtType = 0;
            }
        }
    }

    function eventStartListener() {
        if (this._evtType & 2) {
            this._onZoomStart();
        }
    }

    function eventEndListener() {
        var zeroPoint = zeroToPoint.call(this);
        if (this._evtType & 2) {
            this._onZoomEnd();
            this._evtType = 0;
        } else if (this._evtType & 1) {
            if (!this._draging && this.togglePan()) {
                this._panStartPoint = this._panStartPoint || zeroPoint;
                var offset = [
                    zeroPoint[0] - this._panStartPoint[0] - this._delta[0],
                    zeroPoint[1] - this._panStartPoint[1] - this._delta[1]
                ];
                this._evtType = 0;
            }
        }
        this._panning = false;
        this._panStartPoint = zeroPoint;
    }

    function zeroToPoint() {
        var c = this._instance.geoToScreen(new H.geo.Point(0, 0));
        return [
            c.x, c.y
        ];
    }

    var MAP_TYPE_NORMAL_MAP = 'normal-map';
    var MAP_TYPE_SATELLITE_MAP = 'satellite-map';
    var MAP_TYPE_TERRAIN_MAP = 'terrain-map';
    var MAP_TYPE_NORMAL_XBASE = 'normal-xbase';
    var MAP_TYPES = [
        MAP_TYPE_NORMAL_MAP, MAP_TYPE_SATELLITE_MAP, MAP_TYPE_TERRAIN_MAP, MAP_TYPE_NORMAL_XBASE
    ];

    function getBaseLayer(baseLayerName) {
        if (!baseLayerName || MAP_TYPES.indexOf(baseLayerName) === -1) {
            return this._maptypes.normal.map;
        }
        var name = baseLayerName.split('-');
        return this._maptypes[name[0]][name[1]];
    }

    var MAP_SIZE_BASE = [
        256, 256
    ];
    function createMaskCanvas(zoomLevel) {
        var canvas = this._overlayContainerRootNode.firstChild;
        var ctx;
        if (!this._maskCanvas) {
            this._maskCanvas = document.createElement('CANVAS');
            this._maskCanvas.setAttribute('style', 'position: absolute; left: 0px; top: 0px; pointer-events: none');
            this._overlayContainerRootNode.insertBefore(this._maskCanvas, canvas.nextSibling);
            this._maskCanvas.setAttribute('width', this._overlayContainerRootNode.clientWidth);
            this._maskCanvas.setAttribute('height', this._overlayContainerRootNode.clientHeight);
            ctx = this._maskCanvas.getContext('2d');
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, this._maskCanvas.width, this._maskCanvas.height);
            return;
        }

        ctx = this._maskCanvas.getContext('2d');
        zoomLevel = zoomLevel >= 0 ? zoomLevel : 0;
        for (var level = 1, i = 0; i < zoomLevel; i++) {
            level *= 2;
        }
        var mapW = MAP_SIZE_BASE[0] * level;
        var mapH = MAP_SIZE_BASE[1] * level;
        if (mapW <= this._maskCanvas.width || mapH <= this._maskCanvas.height) {
            var center = this.toPixel([
                this._instance.getCenter().lng, this._instance.getCenter().lat
            ]);
            if (this._center) {
                this._instance.setCenter(this._center);
                var newCenter = this.toPixel([
                    this._instance.getCenter().lng, this._instance.getCenter().lat
                ]);
                var offset = [
                    newCenter[0] - center[0], newCenter[1] - center[1]
                ];
                this._onPanEnd(offset);
            }

            ctx.clearRect(0, 0, this._maskCanvas.width, this._maskCanvas.height);
            this._maskCanvas.setAttribute('width', this._overlayContainerRootNode.clientWidth);
            this._maskCanvas.setAttribute('height', this._overlayContainerRootNode.clientHeight);
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, this._maskCanvas.width, this._maskCanvas.height);
            ctx.globalCompositeOperation = "destination-out";
            ctx.fillStyle = "#ffffff";
            var x = center[0] - mapW / 2;
            var y = center[1] - mapH / 2;
            if (mapH > this._maskCanvas.height) {
                y -= mapH - this._maskCanvas.height;
            }
            ctx.fillRect(x, y, mapW, mapH);
            ctx.globalCompositeOperation = "source-over";

            this._behavior.disable(H.mapevents.Behavior.DRAGGING);
        } else {
            ctx.clearRect(0, 0, this._maskCanvas.width, this._maskCanvas.height);
            if (this._enablePan) {
                this._behavior.enable(H.mapevents.Behavior.DRAGGING);
            }
        }
    }

    /**
     * Create a new {@link http://here.com/|NAVTEQ} base map provider object.
     * 
     * @constructor
     * @alias sap.viz.geo.basemap.navteq.Provider
     * @augments sap.viz.geo.basemap.AbstractProvider
     * 
     * @param {Object}
     *            [options] The configuration object. The next properties are
     *            most often used. You can get more information from
     *            {@link https://developer.here.com/docs/maps_js/#topics_api_pub/nokia.maps.map.Display.html|here}.
     * @param {Array}
     *            [options.center] This property contains the coordinates of the
     *            map center. The format is [Latitude, Longitude]
     * @param {Number}
     *            [options.zoom] This property holds the zoom level of the
     *            current view.
     * @param {String}
     *            [options.basemap] This property holds the current base map
     *            type to be used for display (such as normal-map,
     *            satellite-map, terrain-map and normal-xbase).
     */
    var NavteqProvider = function(options) {
        AbstractProvider.call(this, options, defaultOptions, "sap.viz.geo.basemap.navteq.Provider");
        this._evtType = 0;
        this._draging = 0;
    };

    NavteqProvider.prototype = Object.create(AbstractProvider.prototype);
    NavteqProvider.prototype.constructor = NavteqProvider;

    NavteqProvider.prototype.render = function(container, cb) {
        r([
            "//js.api.here.com/v3/3.0/mapsjs-core.js"
        ], function() {// This module forms the core of the API and is a
            // dependency of all other modules.
            r([
                "//js.api.here.com/v3/3.0/mapsjs-service.js", "//js.cit.api.here.com/v3/3.0/mapsjs-mapevents.js"
            ], function() {
                var platform = new H.service.Platform({
                    'useCIT' : true,
                    'app_id' : '6f9zvttupJVjj8l8eHNL',
                    'app_code' : '-TKlD3f_P0juUtru250M7g'
                });

                this._maptypes = platform.createDefaultLayers(hidpi ? 512 : 256, hidpi ? 320 : null);
                var options = ObjectUtils.extendByRepalceArray(true, null, this._options, {});
                if (this._options && this._options.center) {
                    options.center = new H.geo.Point(this._options.center[0], this._options.center[1]);
                }
                this._instance = new H.Map(container, getBaseLayer.call(this,
                    this._options && this._options.basemap ? this._options.basemap : null), options);
                var mapevents = new H.mapevents.MapEvents(this._instance);
                this._behavior = new H.mapevents.Behavior(mapevents, {
                    'kinetics' : {
                        'duration' : 1,
                        'ease' : H.util.animation.ease.LINEAR
                    }
                });// Currently I didn't found the option to disable animation,
                // so give a very small duration for it.
                this._behavior.disable(H.mapevents.Behavior.WHEELZOOM);
                this._behavior.disable(H.mapevents.Behavior.DBLTAPZOOM);
                this._enablePan = true;
                this._overlayContainerRootNode = container.firstChild.firstChild.firstChild;
                createMaskCanvas.call(this);

                // When pan or zoom in/out, the map instance will always
                // dispatch the mapview change event, so we need to identify the
                // drag and zoom event by ourselves
                this._instance.addEventListener("mapviewchangestart", eventStartListener.bind(this));
                this._instance.addEventListener("mapviewchangeend", eventEndListener.bind(this));

                this._instance.addEventListener("mapviewchangeend", trigerlistener.bind(this, ZERO, 'displayready'));
                this._instance.addEventListener("dblclick", trigerlistener.bind(this, ZOOM, 'dblclick'));
                this._instance.addEventListener("dbltap", trigerlistener.bind(this, ZOOM, 'dbltap'));
                this._instance.addEventListener("wheel", trigerlistener.bind(this, ZOOM, 'wheel'));
                this._instance.addEventListener("dragstart", trigerlistener.bind(this, PAN, 'dragstart'));
                this._instance.addEventListener("touchstart", trigerlistener.bind(this, PAN, 'touchstart'));

                this._instance.addEventListener("drag", eventListener.bind(this, 'drag'));
                this._instance.addEventListener("dragend", eventListener.bind(this, 'dragend'));
                this._instance.addEventListener("touch", eventListener.bind(this, 'touch'));
                this._instance.addEventListener("touchend", eventListener.bind(this, 'touchend'));

                var that = this;
                var fn = function() {
                    that._instance.removeEventListener("mapviewchangeend", fn);
                    if (cb) {
                        cb.call();
                    }
                    that._center = that._instance.getCenter();
                    createMaskCanvas.call(that, that._instance.getZoom());
                };
                this._instance.addEventListener("mapviewchangeend", fn);
            }.bind(this));
        }.bind(this));

        return this;
    };

    NavteqProvider.prototype.refresh = function() {
        this._instance.getViewPort().resize();
        createMaskCanvas.call(this, this._instance.getZoom());
        return this;
    };

    NavteqProvider.prototype.getOverlayContainerRootNode = function() {
        return this._overlayContainerRootNode;
    };

    NavteqProvider.prototype.destroy = function() {
        AbstractProvider.prototype.destroy.call(this);
        this._behavior.dispose();
        var mapElement = this._instance.getElement();
        mapElement.parentNode.removeChild(mapElement);
        this._overlayContainerRootNode = null;
        this._instance = null;
        return this;
    };

    NavteqProvider.prototype.bounds = function(_, cb) {
        if (!arguments.length) {
            var bounds = this._instance.getViewBounds();
            return toBounds(bounds);
        }
        trigerlistener.call(this, ZOOM, 'bounds');
        this._instance.setViewBounds(fromBounds(_));
        if (cb) {
            cb();
        }
        var that = this;
        var fn = function() {
            that._instance.removeEventListener("mapviewchangeend", fn);
            that._center = that._instance.getCenter();
            createMaskCanvas.call(that, that._instance.getZoom());
        };
        this._instance.addEventListener("mapviewchangeend", fn);
        return this;
    };

    NavteqProvider.prototype.toPixel = function(lngLat) {
        var point = this._instance.geoToScreen(fromLngLat(lngLat));
        var x = point.x, sp;
        var cp = this._instance.geoToScreen(fromLngLat([
            0, 0
        ]));
        if (x < cp.x && lngLat[0] > 0) {
            sp = this._instance.geoToScreen(fromLngLat([
                -180, 0
            ]));
            x += Math.abs(cp.x - sp.x) * 2;
        } else if (x > cp.x && lngLat[0] < 0) {
            sp = this._instance.geoToScreen(fromLngLat([
                -180, 0
            ]));
            x -= Math.abs(cp.x - sp.x) * 2;
        }

        return [
            x, point.y
        ];
    };

    NavteqProvider.prototype.toLngLat = function(point) {
        return toLngLat(this._instance.screenToGeo(point[0], point[1]));
    };

    NavteqProvider.prototype.zoom = function(direction) {
        var level = this._instance.getZoom();
        level += direction;
        createMaskCanvas.call(this, level);
        trigerlistener.call(this, ZOOM, 'zoom');
        this._instance.setZoom(level);
        return this;
    };

    NavteqProvider.prototype.togglePan = function(enablePan) {
        if (arguments.length === 0) {
            return this._behavior.isEnabled(H.mapevents.Behavior.DRAGGING);
        }
        if (enablePan) {
            this._behavior.enable(H.mapevents.Behavior.DRAGGING);
        } else {
            this._behavior.disable(H.mapevents.Behavior.DRAGGING);
        }
        this._enablePan = enablePan;
        return this;
    };

    NavteqProvider.prototype.intersects = function(boundingBox) {
        var xMin = boundingBox.min()[0];
        var xMax = boundingBox.max()[0];
        var yMin = boundingBox.min()[1];
        var yMax = boundingBox.max()[1];
        var bounds = this._instance.getViewBounds().intersects((new H.geo.Rect(yMin, xMin, yMax, xMax)));
        if (bounds) {
            return boundingBox;
        }
        return null;
    };

    NavteqProvider.prototype.getGeoBounds = function() {
        var bounds = this._instance.getViewBounds();
        return toBounds(bounds);
    };

    NavteqProvider.prototype.toJSON = function() {
        var json = AbstractProvider.prototype.toJSON.call(this);
        if (this._instance) {
            var c = this._instance.getCenter();
            json.options.center = [
                c.lat, c.lng
            ];
            json.options.zoom = this._instance.getZoom();
        }
        return json;
    };

    NavteqProvider.prototype.needRenderOnPan = function() {
        return true;
    };

    NavteqProvider.prototype.getBasemapConfigs = function() {
        var imagePrefix = Resource.path("sap.viz.map.Resources") + "/images/";
        return [
            {
                'name' : 'normal-map',
                'langCode' : 'IDS_NORMAL_MAP',
                'img' : imagePrefix + "normal-map.png"
            }, {
                'name' : 'satellite-map',
                'langCode' : 'IDS_SATELLITE_MAP',
                'img' : imagePrefix + "satellite-map.png"
            }, {
                'name' : 'terrain-map',
                'langCode' : 'IDS_TERRAIN_MAP',
                'img' : imagePrefix + "terrain-map.png"
            }, {
                'name' : 'normal-xbase',
                'langCode' : 'IDS_NORMAL_XBASE',
                'img' : imagePrefix + "normal-xbase.png"
            }
        ];
    };

    NavteqProvider.prototype._onPropertiesChange = function() {
        var options = this._options;
        this._instance.setBaseLayer(getBaseLayer.call(this, options.basemap));
        this._onBasemapChange();
        return this;
    };

    return NavteqProvider;
});

define('sap/viz/geo/dataviz/AbstractVizImpl',[
    "sap/viz/framework/common/util/ObjectUtils",
    "sap/viz/geo/Bounds",
    'sap/viz/api/env/Locale',
    'sap/viz/geo/LocationType'
], function(Objects,
        Bounds,
        Locale, 
        LocationType) {

    var location = "location";
    /**
     * @constructor
     * @alias sap.viz.geo.dataviz.AbstractVizImpl
     * @param {Object}
     *            viz the viz object
     * @ignore
     */
    var AbstractVizImpl = function(viz) {
        this._dispatch = d3.dispatch("propertiesChange");
        this._viz = viz;
    };

    Object.defineProperty(AbstractVizImpl.prototype, "_props", {
        get : function() {
            return this._viz._props;
        }
    });

    /**
     * Prepare data. Don't do anything by default. The implementation can
     * override this function if need do some processing on data before
     * rendering.
     * 
     * @abstract
     * @param {Array}
     *            data the array of the data to be processed
     * @param {Function}
     *            toPixel a function converting geo coordinate to screen
     *            coordinate
     * @param {Array}
     *            mapSize an array including the width and height of map
     * @param {Object}
     *            the meta data and feeding info
     * @returns {Array} array of the data after processing
     * @ignore
     */
    AbstractVizImpl.prototype._prepareData = function(data, toPixel, mapSize) {
        return data;
    };

    /**
     * Build DOM structures for elements. The implementation should implement
     * this function.
     * 
     * @abstract
     * @param {d3.selection}
     *            selection a D3 selection to be append child elements
     * @param {String}
     *            eventTargetClassName the class name for the elements which can
     *            be marked as event target. The implementation should mark this
     *            class name on the elements which are sensitive to interaction
     *            events.
     * @returns the visualization object itself
     * @ignore
     */
    AbstractVizImpl.prototype._buildDom = function(selection, eventTargetClassName) {
        return this;
    };

    /**
     * Calculate the left, top of element by given data. The implementation
     * should implement this function.
     * 
     * @abstract
     * @param {Object}
     *            data the data object
     * @param {Function}
     *            toPixel a function converting geo coordinate to screen
     *            coordinate
     * 
     * @returns {Array} the left, top of element.
     * @ignore
     */

    AbstractVizImpl.prototype._getLeftTop = function(data, toPixel) {
        return [
            0, 0
        ];
    };

    /**
     * Update DOM structures for elements. The implementation should implement
     * this function.The bounds of elements has been attached to the data and
     * can be accessed by ".box".
     * 
     * @abstract
     * @param {d3.selection}
     *            selection a D3 selection to be updated
     * @param {Function}
     *            toPixel a function converting geo coordinate to screen
     *            coordinate
     * @param {Object}
     *            effectManager the EffectManager object
     * @returns the visualization object itself
     * @ignore
     */
    AbstractVizImpl.prototype._update = function(selection, toPixel, effectManager) {
        return this;
    };

    AbstractVizImpl.prototype.getDispatch = function() {
        return this._dispatch;
    };

    /**
     * Generate legend this this viz type. The implementation should implement
     * this function.
     * 
     * @abstract
     * @param {Array}
     *            [data] the data array.
     * @param {Object}
     *            [legend] the legend of this viz type.
     * @ignore
     * 
     */
    AbstractVizImpl.prototype._generateLegend = function(data, legend, effectManager) {
        return null;
    };

    /**
     * Get Tooltip Content for this viz type. The implementation should
     * implement this function.
     * 
     * @abstract
     * @param {Object}
     *            data the data object
     * @param {Array}
     *            metadata the metadata for feeding definition
     * @ignore
     */
    AbstractVizImpl.prototype._getTooltipContent = function(data, metaFeedingMapping) {
        var loc = {
            name : {},
            value : [],
            type : "otherInfo"
        }, otherInfo = [];
        var locationValue = this._getLocationValue(data, metaFeedingMapping);
        var locationName = metaFeedingMapping[location].name;
        loc.name = locationName;
        loc.value.push(locationValue);
        otherInfo.push(loc);
        return {
            dimension : [],
            measure : [],
            otherInfo : otherInfo
        };
    };

    AbstractVizImpl.prototype._setMetaFeedingMapping = function(metaFeedingMapping) {
        this._metaFeedingMapping = metaFeedingMapping;
    };

    var isOverlappedWith = function(srcLabel, desLabel) {

        var left1 = srcLabel.left, top1 = srcLabel.top, right1 = srcLabel.right, bottom1 = srcLabel.bottom;
        var left2 = desLabel.left, top2 = desLabel.top, right2 = desLabel.right, bottom2 = desLabel.bottom;

        if (!((left1 >= right2) || (top1 >= bottom2) || (right1 <= left2) || (bottom1 <= top2))) {
            return true;
        }
        return false;
    };
    var ProcessGroupLabelsOverlap = function(srcLabels, desLabels) {

        var bOverlapped = false;
        for (var i = 0; i < srcLabels.length && !bOverlapped; ++i) {
            if (srcLabels[i].visible === false) {
                break;
            }

            for (var j = 0; j < desLabels.length && !bOverlapped; ++j) {
                if (isOverlappedWith(srcLabels[i], desLabels[j])) {
                    bOverlapped = true;
                }
            }
        }

        if (bOverlapped) {
            desLabels.forEach(function(element) {
                element.visible = false;
                element.dom.style.display = "none";
            });
        }
    };

    function processLabelOverlap(labelsRect) {
        var len = labelsRect.length;
        for (var i = 1; i < len; ++i) {

            for (var j = 0; j < i; ++j) {

                ProcessGroupLabelsOverlap(labelsRect[j], labelsRect[i]);
            }
        }
    }
    AbstractVizImpl.prototype._generateLabelsRect = function(selections) {
        var labelsRect = [];
        selections.selectAll(".dataLabelContainer .dataLabel").each(function(d, i) {
            if (this.textContent !== "") {
                this.style.display = "";
                var elementBBox = this.getBoundingClientRect();
                var rect = {};
                rect.top = elementBBox.top;
                rect.left = elementBBox.left;
                rect.right = rect.left + parseFloat(this.style.width);
                rect.bottom = rect.top + parseFloat(this.style.height);
                rect.dom = this;
                labelsRect.unshift([
                    rect
                ]);
            }
        });

        return labelsRect;
    };

    AbstractVizImpl.prototype._postRender = function(selections) {
        var props = this._viz.properties().dataLabel;
        // to improve performance, avoid unnecessary d3.select
        if(props && props.visible){
            var labelsRect = this._generateLabelsRect(selections);
            processLabelOverlap(labelsRect);
        }
    };

    AbstractVizImpl.prototype._getLocationValue = function(data, metaFeedingMapping) {
        var locationId = metaFeedingMapping[location].id;
        var locationValue = data.raw[locationId];
        if (data.raw.geoInfo && data.raw.geoInfo.type === LocationType.FEATURE_ID) {
            var locale = Locale.get();
            var officialNames = data.feature.properties.officialNames;
            locationValue = (officialNames && (officialNames[locale] || officialNames.en)) ||
                data.feature.properties.name;
        }
        return locationValue;
    };

    AbstractVizImpl.prototype._applyPadding = function(bounds) {
        return bounds;
    };

    return AbstractVizImpl;
});

define('sap/viz/geo/utils/RTree',[
    "jquery"
], function Setup($) {
    /**
     * @ignore
     * @constructor
     * @param number
     *            pageSize
     */
    function RTree(pageSize) {
        this._pageSize = pageSize;
        this._splitAlgorithm = "linear";
        this._minPageSize = Math.ceil(0.3 * this._pageSize);
        this._root = null;
        this._indexed = false;
    }

    /**
     * @ignore
     * @param {x1,x2,y1,y2}
     *            rect object data
     */
    RTree.prototype.insert = function(rect, data) {
        var node = {
            rect : rect,
            data : data
        };
        if (this._root === null) {
            this._root = {
                rect : $.extend(true, {}, node.rect)
            };
            this._root.childs = [];
            this._root.childs.push(node);
            node.parent = this._root;
            node.isLeaf = true;
            return;
        }
        var rectForInsert = this._searchBestRectForInsert(rect);
        rectForInsert.childs.push(node);
        node.parent = rectForInsert;
        node.isLeaf = true;

        if (rectForInsert.childs.length > this._pageSize) {
            this._split(rectForInsert);
        } else {
            var cur = rectForInsert;
            while (cur) {
                this._expandRect(cur.rect, rect);
                cur = cur.parent;
            }
        }
        this._indexed = false;
    };

    /**
     * @ignore
     * @param {x1,x2,y1,y2}
     *            rect object data(optional)
     */
    RTree.prototype.deleteNode = function(rect, data) {
        var curNode = this._root;
        var mergeSet = [];
        var rectList = [];
        var success = false;
        while (curNode) {
            if (this._intersect(curNode.rect, rect)) {
                if (curNode.childs[0].isLeaf) {
                    for (var i = curNode.childs.length - 1; i >= 0; i--) {
                        if (this._intersect(curNode.childs[i].rect, rect)) {
                            if (data) {
                                if (curNode.childs[i].data === data) {
                                    curNode.childs.splice(i, 1);
                                    success = true;
                                }
                            } else {
                                curNode.childs.splice(i, 1);
                                success = true;
                            }
                        }
                    }
                    if (curNode.childs.length < this._minPageSize) {
                        mergeSet.push(curNode);
                    } else {
                        this._recalculateBoundings(curNode);
                    }
                } else {
                    rectList = rectList.concat(curNode.childs);
                }
            }
            curNode = rectList.pop();
        }

        while (mergeSet.length > 0) {
            var node = mergeSet.shift();
            this._merge(node);
        }

        if (success) {
            this._indexed = false;
        }
    };

    /**
     * @ignore
     * @param {x1,
     *            x2, y1, y2} rect
     * @returns all data whose bounding box intersects the rect
     */
    RTree.prototype.search = function(rect) {
        if (this._indexed) {
            var multi = Math.abs(rect.x1 - rect.x2) / Math.abs(this._root.rect.x1 - this._root.rect.x2) *
                Math.abs(rect.y1 - rect.y2) / Math.abs(this._root.rect.y1 - this._root.rect.y2);
            if (multi < 0.01) {
                return this._searchIntersect(rect);
            } else {
                return this._searchContain(rect);
                // return this._searchIntersect(rect);
            }
        } else {
            return this._searchIntersect(rect);
        }
    };

    /**
     * @ignore
     * @returns the root node of the rtree
     */
    RTree.prototype.getTree = function() {
        return this._root;
    };

    RTree.prototype.buildIndex = function() {
        var node = this._root;
        var nodeList = [
            this._root
        ];
        var oneLevel = [];
        var temp = [];
        var i;
        while (!node.childs[0].isLeaf) {
            while (node) {
                for (i = node.childs.length - 1; i >= 0; i--) {
                    oneLevel.push(node.childs[i]);
                    nodeList.push(node.childs[i]);
                }
                node = temp.shift();
            }
            temp = oneLevel;
            oneLevel = [];
            node = temp.shift();
        }
        node = nodeList.pop();
        var lastNode = null;
        while (node) {
            if (node.childs[0].isLeaf) {
                node.start = node.childs[0];
                if (lastNode) {
                    lastNode.next = node.childs[0];
                }
                var len = node.childs.length;
                for (i = 0; i < len - 1;) {
                    node.childs[i++].next = node.childs[i];
                }
                node.end = node.childs[node.childs.length - 1];
                lastNode = node.end;
            } else {
                node.start = node.childs[0].start;
                node.end = node.childs[node.childs.length - 1].end;
            }
            node = nodeList.pop();
        }
        delete this._root.end.next;
        this._indexed = true;
    };

    RTree.prototype._searchIntersect = function(rect) {
        var curNode = this._root;
        var resultSet = [];
        var rectList = [];
        while (curNode) {
            if (this._intersect(curNode.rect, rect)) {
                if (curNode.childs[0].isLeaf) {
                    for (var i = 0, len = curNode.childs.length; i < len; i++) {
                        if (this._intersect(curNode.childs[i].rect, rect)) {
                            resultSet.push(curNode.childs[i].data);
                        }
                    }
                } else {
                    rectList = rectList.concat(curNode.childs);
                }
            }
            curNode = rectList.pop();
        }
        return resultSet;
    };

    RTree.prototype._searchContain = function(rect) {
        var curNode = this._root;
        var resultSet = [];
        var rectList = [];
        while (curNode) {
            if (this._contain(rect, curNode.rect)) {
                var cur = curNode.start;
                while (cur !== curNode.end) {
                    resultSet.push(cur.data);
                    cur = cur.next;
                }
                resultSet.push(curNode.end.data);
            } else if (this._intersect(curNode.rect, rect)) {
                if (curNode.childs[0].isLeaf) {
                    for (var i = 0, len = curNode.childs.length; i < len; i++) {
                        if (this._intersect(curNode.childs[i].rect, rect)) {
                            resultSet.push(curNode.childs[i].data);
                        }
                    }
                } else {
                    rectList = rectList.concat(curNode.childs);
                }
            }
            curNode = rectList.pop();
        }
        return resultSet;
    };

    RTree.prototype._merge = function(node) {
        if (node === this._root) {
            if (node.childs.length === 1 && !node.childs[0].isLeaf) {
                this._root = node.childs[0];
                delete this._root.parent;
            } else if (node.childs.length === 0) {
                this._root = null;
            } else {
                this._recalculateBoundings(node);
            }
        } else {
            var parent = node.parent;
            for (var i = 0; i < parent.childs.length; i++) {
                if (parent.childs[i] === node) {
                    parent.childs.splice(i, 1);
                    break;
                }
            }
            this._reinsert(node);
            this._recalculateBoundings(node.parent);

            if (parent.childs.length < this._minPageSize && parent !== this._root) {
                this._merge(parent);
            } else if (parent.childs.length === 1 && parent === this._root && !parent.childs[0].isLeaf) {
                this._root = parent.childs[0];
                delete this._root.parent;
            } else if (parent.childs.length === 0 && parent === this._root) {
                this._root = null;
            }
        }
    };

    RTree.prototype._reinsert = function(node) {
        var brothers = node.parent.childs;
        delete node.parent;
        var nodes = node.childs;
        for (var j = 0; j < nodes.length; j++) {
            var minExpand = null;
            var index;
            for (var i = 0; i < brothers.length; i++) {
                if (minExpand === null) {
                    minExpand = this._expandArea(brothers[i].rect, nodes[j].rect);
                    index = i;
                } else {
                    var area = this._expandArea(brothers[i].rect, nodes[j].rect);
                    if (area < minExpand) {
                        minExpand = area;
                        index = i;
                    }
                }
            }
            this._appendChild(brothers[index], nodes[j]);

            if (brothers[index].childs.length > this._pageSize) {
                var toSplit = brothers[index];
                brothers.splice(index, 1);
                var splited = this._split(toSplit);
                brothers = brothers.concat(splited);
            } else {
                this._recalculateBoundings(brothers[index].parent);
            }
        }
    };

    RTree.prototype._recalculateBoundings = function(cur) {
        while (cur) {
            cur.rect = $.extend(true, {}, cur.childs[0].rect);
            for (var i = 1; i < cur.childs.length; i++) {
                this._expandRect(cur.rect, cur.childs[i].rect);
            }
            cur = cur.parent;
        }
    };

    RTree.prototype._appendChild = function(parent, child) {
        this._expandRect(parent.rect, child.rect);
        parent.childs.push(child);
        child.parent = parent;
    };

    RTree.prototype._searchBestRectForInsert = function(rect) {
        // minimum the expand area
        var node = this._root;
        while (!node.childs[0].isLeaf) {
            var childs = node.childs;
            var minArea = null;
            var selectedNode;
            for (var i = 0, len = childs.length; i < len; i++) {
                if (minArea === null) {
                    minArea = this._expandArea(childs[i].rect, rect);
                    selectedNode = childs[i];
                } else {
                    var area = this._expandArea(childs[i].rect, rect);
                    if (area < minArea) {
                        minArea = area;
                        selectedNode = childs[i];
                    }
                }
            }
            node = selectedNode;
        }
        return node;
    };

    RTree.prototype._expandRect = function(parentRect, childRect) {
        var newX1 = Math.min(parentRect.x1, childRect.x1);
        var newX2 = Math.max(parentRect.x2, childRect.x2);
        var newY1 = Math.min(parentRect.y1, childRect.y1);
        var newY2 = Math.max(parentRect.y2, childRect.y2);
        parentRect.x1 = newX1;
        parentRect.x2 = newX2;
        parentRect.y1 = newY1;
        parentRect.y2 = newY2;
    };

    RTree.prototype._expandArea = function(parentRect, childRect) {
        var newX1 = Math.min(parentRect.x1, childRect.x1);
        var newX2 = Math.max(parentRect.x2, childRect.x2);
        var newY1 = Math.min(parentRect.y1, childRect.y1);
        var newY2 = Math.max(parentRect.y2, childRect.y2);
        return (newX2 - newX1) * (newY2 - newY1) - (parentRect.x2 - parentRect.x1) * (parentRect.y2 - parentRect.y1);
    };

    RTree.prototype._split = function(node) {
        // linear split
        if (this._splitAlgorithm === "linear") {
            return this._linearSplit(node);
        }
    };

    RTree.prototype._linearSplit = function(node) {
        var childs = node.childs;
        var parent;
        if (node !== this._root) {
            parent = node.parent;
            for (var i = 0, len = parent.childs.length; i < len; i++) {
                if (parent.childs[i] === node) {
                    parent.childs.splice(i, 1);
                    break;
                }
            }
        } else {
            parent = {};
            parent.childs = [];
            this._root = parent;
        }

        var seeds = this._linearPickSeeds(childs);
        var nodes = [];
        nodes[0] = {
            rect : $.extend(true, {}, seeds[0].rect)
        };
        nodes[0].childs = [
            seeds[0]
        ];
        seeds[0].parent = nodes[0];
        nodes[1] = {
            rect : $.extend(true, {}, seeds[1].rect)
        };
        nodes[1].childs = [
            seeds[1]
        ];
        seeds[1].parent = nodes[1];
        this._splitRestChilds(nodes, childs);
        parent.childs.push(nodes[0]);
        parent.childs.push(nodes[1]);
        nodes[0].parent = parent;
        nodes[1].parent = parent;
        if (parent.childs.length <= this._pageSize) {
            this._recalculateBoundings(parent);
        } else {
            this._linearSplit(parent);
        }
        return nodes;
    };

    RTree.prototype._splitRestChilds = function(nodes, childs) {
        var len = childs.length;
        for (var i = 0; i < len; i++) {
            if (nodes[i % 2].childs.length < this._minPageSize) {
                var parent = nodes[i % 2];
                var minExpand = null;
                var index;
                for (var j = 0; j < childs.length; j++) {
                    if (minExpand === null) {
                        minExpand = this._expandArea(parent.rect, childs[j].rect);
                        index = j;
                    } else {
                        var area = this._expandArea(parent.rect, childs[j].rect);
                        if (area < minExpand) {
                            minExpand = area;
                            index = j;
                        }
                    }
                }
                this._appendChild(parent, childs[index]);
                childs.splice(index, 1);
            } else {
                var child = childs.pop();
                if (this._expandArea(nodes[0].rect, child.rect) > this._expandArea(nodes[1].rect, child.rect)) {
                    this._appendChild(nodes[1], child);
                } else {
                    this._appendChild(nodes[0], child);
                }
            }
        }
    };

    RTree.prototype._linearPickSeeds = function(nodes) {
        var pair = [
            [], []
        ];
        var sep = [];
        var max = null;
        var min = null;
        var secMin = null;
        var secMax = null;
        var secMinIdx = null;
        var secMaxIdx = null;
        for (var i = 0; i < nodes.length; i++) {
            if (max === null) {
                min = nodes[i].rect.x1;
                max = nodes[i].rect.x2;
                pair[0][0] = i;
                pair[0][1] = i;
            } else {
                if (nodes[i].rect.x1 <= min) {
                    secMin = min;
                    secMinIdx = pair[0][0];
                    min = nodes[i].rect.x1;
                    pair[0][0] = i;
                } else if (secMin === null) {
                    secMin = nodes[i].rect.x1;
                    secMinIdx = i;
                }
                if (nodes[i].rect.x2 > max) {
                    secMax = max;
                    secMaxIdx = pair[0][1];
                    max = nodes[i].rect.x2;
                    pair[0][1] = i;
                } else if (secMax === null) {
                    secMax = nodes[i].rect.x2;
                    secMaxIdx = i;
                }
            }
        }
        if (pair[0][0] === pair[0][1]) {
            if (max - secMax > secMin - min) {
                min = secMin;
                pair[0][1] = secMinIdx;
            } else {
                max = secMax;
                pair[0][0] = secMaxIdx;
            }
        }
        sep[0] = Math.abs((max - min) / (nodes[0].parent.rect.x2 - nodes[0].parent.rect.x1));

        max = null;
        min = null;
        secMin = null;
        secMax = null;
        secMinIdx = null;
        secMaxIdx = null;
        for (i = 0; i < nodes.length; i++) {
            if (max === null) {
                min = nodes[i].rect.y1;
                max = nodes[i].rect.y2;
                pair[1][0] = i;
                pair[1][1] = i;
            } else {
                if (nodes[i].rect.y1 <= min) {
                    secMin = min;
                    secMinIdx = pair[1][0];
                    min = nodes[i].rect.y1;
                    pair[1][0] = i;
                } else if (secMin === null) {
                    secMin = nodes[i].rect.y1;
                    secMinIdx = i;
                }
                if (nodes[i].rect.y2 > max) {
                    secMax = max;
                    secMaxIdx = pair[1][1];
                    max = nodes[i].rect.y2;
                    pair[1][1] = i;
                } else if (secMax === null) {
                    secMax = nodes[i].rect.y2;
                    secMaxIdx = i;
                }
            }
        }

        if (pair[1][0] === pair[1][1]) {
            if (max - secMax > secMin - min) {
                min = secMin;
                pair[1][1] = secMinIdx;
            } else {
                max = secMax;
                pair[1][0] = secMaxIdx;
            }
        }
        sep[1] = Math.abs((max - min) / (nodes[0].parent.rect.y2 - nodes[0].parent.rect.y1));

        var resultPair, index;
        if (sep[0] > sep[1]) {
            resultPair = [
                nodes[pair[0][0]], nodes[pair[0][1]]
            ];
            index = 0;
        } else {
            resultPair = [
                nodes[pair[1][0]], nodes[pair[1][1]]
            ];
            index = 1;
        }
        if (pair[index][0] > pair[index][1]) {
            nodes.splice(pair[index][0], 1);
            nodes.splice(pair[index][1], 1);
        } else if (pair[index][0] < pair[index][1]) {
            nodes.splice(pair[index][1], 1);
            nodes.splice(pair[index][0], 1);
        }
        return resultPair;
    };

    RTree.prototype._intersect = function(rect1, rect2) {
        return rect1.x1 <= rect2.x2 && rect1.x2 >= rect2.x1 && rect1.y1 <= rect2.y2 && rect1.y2 >= rect2.y1;
    };

    RTree.prototype._contain = function(rect1, rect2) {
        return rect2.x1 >= rect1.x1 && rect2.x2 <= rect1.x2 && rect2.y1 >= rect1.y1 && rect2.y2 <= rect1.y2;
    };

    return RTree;
});
define('sap/viz/geo/utils/Dbscan',[
    "sap/viz/geo/utils/RTree"
], function Setup(RTree) {
    /**
     * 
     * @ignore
     * @constructor
     * @param number
     *            distance number minPts
     */
    function DBScan(distance, minPts) {
        this._maxDistance = distance.maxDistance;
        this._minDistance = distance.minDistance;
        this._minPts = minPts;
        this._resultSet = [];
        this._rtree = new RTree(10);
    }

    /**
     * @ignore
     * @param {centroPoint,
     *            data} data
     */
    DBScan.prototype.setData = function(data) {
        this._data = data;
        for (var i = 0, len = data.length; i < len; i++) {
            data[i].key = i;
            this._rtree.insert({
                x1 : data[i].centroPoint[0],
                x2 : data[i].centroPoint[0],
                y1 : data[i].centroPoint[1],
                y2 : data[i].centroPoint[1]
            }, data[i]);
        }
        this._rtree.buildIndex();
        this._chooseDistance();
    };

    DBScan.prototype._chooseDistance = function() {
        var i, len = this._data.length, num = this._minPts;
        if (this._data && len > num * 3) {
            var data = this._data;
            var disArray = [];
            for (i = 0; i < len; i++) {
                var distances = [];
                var initDistance = 5;
                var res = [];
                while (res.length < num) {
                    res = this._rtree.search({
                        x1 : data[i].centroPoint[0] - initDistance,
                        x2 : data[i].centroPoint[0] + initDistance,
                        y1 : data[i].centroPoint[1] - initDistance,
                        y2 : data[i].centroPoint[1] + initDistance
                    });
                    initDistance *= 2;
                }
                for (var j = 0; j < res.length; j++) {
                    distances.push(Math.sqrt(Math.pow(data[i].centroPoint[0] - res[j].centroPoint[0], 2) +
                        Math.pow(data[i].centroPoint[1] - res[j].centroPoint[1], 2)));
                }
                distances.sort(function(a, b) {
                    return a - b;
                });
                disArray.push(distances[num - 1]);
            }
            disArray.sort(function(a, b) {
                return a - b;
            });

            var max = 0, min = 0;
            var length = Math.ceil(len / 20);
            length = length > num ? length : num;
            for (i = 0; i < length; i++) {
                max += disArray[len - 1 - i];
                min += disArray[i];
            }
            var k = (max - min) / length / (len - 1 - length);

            length = Math.ceil(len / 50);
            length = length > num ? length : num;
            for (i = Math.floor(len * 2 / 3); i < len; i++) {
                length = len - i > length ? length : len - i;
                if ((disArray[i + length] - disArray[i]) / length > k * 1.1) {
                    if (disArray[i] > this._maxDistance) {
                        this._distance = this._maxDistance;
                    } else if (disArray[i] < this._minDistance) {
                        this._distance = this._minDistance;
                    } else {
                        this._distance = disArray[i];
                    }
                    return;
                }
            }
        }
        this._distance = (this._maxDistance + this._minDistance) / 2;
    };

    /**
     * @ignore
     * @param number
     *            distance
     */
    DBScan.prototype.setDistance = function(distance) {
        this._distance = distance;
    };

    /**
     * @ignore
     * @param number
     *            minPts
     */
    DBScan.prototype.setMinPts = function(minPts) {
        this._minPts = minPts;
    };

    /**
     * @ignore
     * @returns resultSet the array of {centroPoint, cluster(data)}
     */
    DBScan.prototype.cluster = function() {
        // var start = new Date().getTime();
        var cluster;
        for (var i = 0, len = this._data.length; i < len; i++) {
            if (!this._data[i].visited) {
                this._data[i].visited = true;
                var centrioPoint = this._data[i].centroPoint;
                var x = centrioPoint[0];
                var y = centrioPoint[1];
                var neighborPts = this._calNeighborPts(this._rtree.search({
                    x1 : x - this._distance,
                    x2 : x + this._distance,
                    y1 : y - this._distance,
                    y2 : y + this._distance
                }), this._data[i]);
                if (neighborPts.length < this._minPts) {
                    this._data[i].isNoise = true;
                } else {
                    cluster = [];
                    this._resultSet.push(cluster);
                    this._expandCluster(this._data[i], neighborPts, cluster);
                }
            }
        }
        for (i = 0, len = this._data.length; i < len; i++) {
            if (!this._data[i].isClustered && this._data[i].isNoise) {
                cluster = [];
                cluster.push(this._data[i]);
                this._resultSet.push(cluster);
            }
        }
        for (i = 0, len = this._resultSet.length; i < len; i++) {
            this._resultSet[i].centroPoint = this._calCentroPoint(this._resultSet[i]);
        }
        this._resetStatus();
        var that = this;
        // var end = new Date().getTime();
        // alert(end-start);
        return this._resultSet.map(function(d) {
            return {
                centroPoint : that._calCentroPoint(d),
                cluster : d
            };
        });
    };

    DBScan.prototype._calNeighborPts = function(points, self) {
        for (var i = points.length - 1; i >= 0; i--) {
            if (points[i] === self) {
                points.splice(i, 1);
            } else if (this._calDistance(points[i].centroPoint, self.centroPoint) > this._distance * this._distance) {
                points.splice(i, 1);
            }
        }
        return points;
    };

    DBScan.prototype._resetStatus = function() {
        for (var i = 0, len = this._data.length; i < len; i++) {
            delete this._data[i].isNoise;
            delete this._data[i].visited;
            delete this._data[i].isClustered;
        }
    };

    DBScan.prototype._expandCluster = function(p, pts, cluster) {
        cluster.push(p);
        p.isClustered = true;
        var point = pts.pop();
        var refPts = [];
        for (var i = 0, len = pts.length; i < len; i++) {
            refPts[pts[i].key] = pts[i];
        }
        while (point) {
            if (!point.visited) {
                point.visited = true;
                var centroPoint = point.centroPoint;
                var x = centroPoint[0];
                var y = centroPoint[1];
                var neighborPts = this._calNeighborPts(this._rtree.search({
                    x1 : x - this._distance,
                    x2 : x + this._distance,
                    y1 : y - this._distance,
                    y2 : y + this._distance
                }), point);
                if (neighborPts.length >= this._minPts) {
                    for (i = 0, len = neighborPts.length; i < len; i++) {
                        if (!neighborPts[i].isClustered) {
                            if (refPts[neighborPts[i].key] === undefined) {
                                refPts[neighborPts[i].key] = neighborPts[i];
                                pts.push(neighborPts[i]);
                            }
                        }
                    }
                }
            }
            if (!point.isClustered) {
                cluster.push(point);
                point.isClustered = true;
            }
            point = pts.pop();
        }
    };

    DBScan.prototype._calCentroPoint = function(points) {
        var p;
        var centrioX = 0, centrioY = 0;
        var len = points.length;
        for (var i = 0; i < len; i++) {
            p = points[i].centroPoint;
            centrioX += p[0];
            centrioY += p[1];
        }
        centrioX = centrioX / len;
        centrioY = centrioY / len;

        var nearest = null;
        var index = null;
        for (i = 0; i < len; i++) {
            p = points[i].centroPoint;
            if (nearest === null) {
                nearest = Math.pow(Math.abs(p[0] - centrioX), 2) + Math.pow(Math.abs(p[1] - centrioY), 2);
                index = i;
            } else {
                var distance = Math.pow(Math.abs(p[0] - centrioX), 2) + Math.pow(Math.abs(p[1] - centrioY), 2);
                if (distance < nearest) {
                    nearest = distance;
                    index = i;
                }
            }
        }
        return points[index].centroPoint;
    };

    DBScan.prototype._calDistance = function(pointA, pointB) {
        return Math.pow(Math.abs(pointA[0] - pointB[0]), 2) + Math.pow(Math.abs(pointA[1] - pointB[1]), 2);
    };

    return DBScan;

});
define('sap/viz/geo/dataviz/ClusterManager',[],function Setup() {
    /**
     * @ignore
     * @constructor
     * @param {centroPoint,
     *            data} data
     * @param {The
     *            cluster method} clusterMethod
     */
    function ClusterManager(data, clusterMethod) {
        this._data = data;
        this._clusterMethod = clusterMethod;
        if (this._clusterMethod && this._data) {
            this._clusterMethod.setData(this._data);
        }
    }

    /**
     * @ignore
     * @param {centroPoint,
     *            data} data
     */
    ClusterManager.prototype.setData = function(data) {
        this._data = data;
        this._clusterMethod.setData(this._data);
    };

    ClusterManager.prototype.setClusterMethod = function(clusterMethod) {
        this._clusterMethod = clusterMethod;
        if (this._data) {
            this._clusterMethod.setDada(this._data);
        }
    };

    ClusterManager.prototype.cluster = function() {
        return this._clusterMethod.cluster();
    };

    ClusterManager.prototype.insert = function(point) {

    };

    ClusterManager.prototype.deleteNode = function(point) {

    };

    return ClusterManager;

});
define('sap/viz/geo/dataviz/ColorUtils',[
    "sap/viz/framework/common/util/TypeUtils",
    'sap/viz/chart/components/util/ColorUtil'
], function(
    TypeUtils,
    ColorUtil
) {
    var RE_COLOR_FUNC = /^(darken|lighten|desaturate|greyscale)\((.*)\)$/;

    return {
        getDataLabelColor : function(frontColor, backColor, frontOpacity) {
            var LIGHTCOLOR = "#f0f0f0";
            var DARKCOLOR = "#333333";
            var DEFAULTBUBBLECOLOR = "#748cb2";
            if (!frontColor) {
                frontColor = DEFAULTBUBBLECOLOR;
            }
            var color = ColorUtil.getMixedColor(frontColor, backColor, frontOpacity);
            var refValue = ColorUtil.getReferenceColorValue(color);
            if (refValue > 137.5) {
                return DARKCOLOR;
            } else {
                return LIGHTCOLOR;
            }
        },

        getEffectedFill : function(color, effectMgr, params) {
            var o = {
                fillColor : color
            };
            var i;
            for (i in params) {
                if (params.hasOwnProperty(i)) {
                    o[i] = params[i];
                }
            }
            return effectMgr.register(o);
        },

        evalColor : function(currentColor, expr, effectMgr) {
            var ret = currentColor;
            if (TypeUtils.isFunction(expr)) {
                ret = expr(ret);
            } else if (TypeUtils.isString(expr)) {
                var execRet = RE_COLOR_FUNC.exec(expr);
                if (execRet) {
                    var funcName = execRet[1];
                    var val;
                    if (funcName !== "greyscale") {
                        val = execRet[2];
                        if (val === "") {
                            val = 0.2;
                        } else {
                            var len = val.length;
                            var lastChar = val[len - 1];
                            if (lastChar === "%") {
                                val = val.substring(0, len - 1);
                            }
                            val = val / 100;
                        }
                    }
                    ret = effectMgr[funcName](ret, val);
                } else {
                    ret = effectMgr.color2rgba(expr).toString();
                }
            }

            return ret;
        }
    };
});

define('sap/viz/geo/dataviz/LocationBasedVizImpl',[
    "jquery", "sap/viz/geo/dataviz/AbstractVizImpl", "sap/viz/geo/utils/Dbscan", "sap/viz/geo/dataviz/ClusterManager",
    "sap/viz/geo/Bounds", "sap/viz/framework/common/lang/LangManager", 'sap/viz/api/env/Locale',
    "sap/viz/geo/utils/Logger", 'sap/viz/geo/LocationType', 'sap/viz/geo/dataviz/ColorUtils', 
    'sap/viz/chart/components/util/TextUtils',"sap/viz/framework/common/format/FormatManager",
    "sap/viz/framework/common/util/TypeUtils"
], function($, AbstractVizImpl, DBScan, ClusterManager, Bounds, langManager, Locale, Logger, LocationType, ColorUtils,
            TextUtils, FormatManager, TypeUtils) {
    var LABEL_MAX_LENGTH = 100;
    var LABEL_MIN_LENGTH = 15;
    var LOCATION = "location";

    /**
     * Create a new location based Viz visualization object.
     * 
     * @constructor
     * @alias sap.viz.geo.dataviz.LocationBasedVizImpl
     * @augments sap.viz.geo.dataviz.AbstractVizImpl
     * @param {Object}
     *            viz the viz object.
     * @ignore
     */
    var LocationBasedVizImpl = function(viz) {
        AbstractVizImpl.call(this, viz);
    };

    LocationBasedVizImpl.prototype = Object.create(AbstractVizImpl.prototype);
    LocationBasedVizImpl.prototype.constructor = LocationBasedVizImpl;

    LocationBasedVizImpl.prototype._clusterData = function(data, props) {
        if (!props.enabled) {
            // only use for hana in playground. Has not been completed yet.
            return data.map(function(d) {
                if (d.raw.geoInfo && d.raw.geoInfo.isCluster) {
                    return {
                        centroPoint : d.centroPoint,
                        data : [
                            d
                        ],
                        isCluster : true
                    };
                } else {
                    return d;
                }
            });
        }

        if (!data.length) {
            return data;
        }

        var sources = data.map(function(d) {
            return {
                centroPoint : d.centroPoint,
                data : d
            };
        });
        var dbscan = new DBScan(props.distance, props.minPts);
        var manager = new ClusterManager(sources, dbscan);
        return manager.cluster().map(function(d) {
            var x = d.cluster.map(function(d) {
                return d.data;
            });
            return x.length === 1 ? x[0] : {
                centroPoint : d.centroPoint,
                data : x,
                isCluster : true
            };
        });
    };

    /**
     * Prepare single data.
     * 
     * @abstract
     * @param {Array}
     *            data the non-cluster data.
     * @param {Array}
     *            mapSize an array including the width and height of map
     * @param {Object}
     *            the meta data and feeding info
     * @ignore
     */
    LocationBasedVizImpl.prototype._prepareSingleData = function(data, mapSize) {
        return data;
    };

    LocationBasedVizImpl.prototype._ClusterData = function(o) {
        for ( var i in o) {
            if (o.hasOwnProperty(i)) {
                this[i] = o[i];
            }
        }
    };

    LocationBasedVizImpl.prototype._ClusterData.prototype = Object.create(null, {
        raw : {
            get : function() {
                return this.data.map(function(x) {
                    return x.raw;
                });
            }
        }
    });

    LocationBasedVizImpl.prototype._prepareClusterData = function(clusterData, mapSize) {
        return clusterData;
    };

    LocationBasedVizImpl.prototype._prepareData = function(data, toPixel, mapSize) {
        data.forEach(function(d) {
            d.centroPoint = toPixel(d.centroid);
        });
        var orginalData = data;
        Logger.profiling("Layer:rendering-rendering_viz-clustering_data");
        data = this._clusterData(data, this._viz.properties().cluster);
        Logger.profiling("Layer:rendering-rendering_viz-clustering_data");

        var invert = toPixel.invert;
        var clusteredData = data.filter(this._viz._isCluster).map(function(d) {
            d.centroid = invert(d.centroPoint);
            return new this._ClusterData(d);
        }.bind(this));
        var nonClusterData = data.filter(this._viz._isNonCluster);
        var clusterPart = this._prepareClusterData(clusteredData, mapSize);

        return clusterPart.concat(this._prepareSingleData(nonClusterData, mapSize));
    };

    LocationBasedVizImpl.prototype._buildClusterDom = function(elements, eventTargetClassName) {
        return this;
    };

    /**
     * Build DOM structures for non-cluster elements. The implementation should
     * implement this function.
     * 
     * @abstract
     * @param {d3.selection}
     *            selection a D3 selection to be append child elements
     * @param {String}
     *            eventTargetClassName the class name for the elements which can
     *            be marked as event target. The implementation should mark this
     *            class name on the elements which are sensitive to interaction
     *            events.
     * @returns the visualization object itself
     * @ignore
     */
    LocationBasedVizImpl.prototype._buildSingleDom = function(elements, eventTargetClassName) {
        return this;
    };

    LocationBasedVizImpl.prototype._buildDom = function(elements, eventTargetClassName) {
        return this._buildClusterDom(elements.filter(this._viz._isCluster), eventTargetClassName)._buildSingleDom(
            elements.filter(this._viz._isNonCluster), eventTargetClassName);
    };
    LocationBasedVizImpl.prototype._updateClusterDataLabel = function(elements) {

    };
    LocationBasedVizImpl.prototype._getLocaltionLabel = function(data, metaFeedingMapping) {
        var locationId = metaFeedingMapping[LOCATION].id;
        var locationValue = data.raw[locationId];
        if (data.raw.geoInfo && data.raw.geoInfo.type === LocationType.FEATURE_ID) {
            var locale = Locale.get();
            var officialNames = data.feature.properties.officialNames;
            locationValue = (officialNames && (officialNames[locale] || officialNames.en)) ||
                data.feature.properties.name;
        } else if (data.raw.geoInfo && data.raw.geoInfo.type === LocationType.COORDINATE) {
            locationValue = "(" + locationValue + ")";
        }
        return locationValue;
    };

    LocationBasedVizImpl.prototype._getClusterLocationLabel = function(d, metaFeedingMapping) {
        var locationValue = this._getLocaltionLabel(d.data[0], metaFeedingMapping);
        if (d.data.length === 2) {
            locationValue += "," + this._getLocaltionLabel(d.data[1], metaFeedingMapping);
        } else {
            locationValue += " and " + (d.data.length - 1) + " others";
        }
        return locationValue;
    };

    LocationBasedVizImpl.prototype._updateCluster = function(elements, effectManager) {
        var clusterProps = this._viz.properties().cluster;
        var format = clusterProps.format;

        var tempWidth = (LABEL_MAX_LENGTH + 2 * Number(clusterProps.xmargin)) + 'px';
        var tempHeight = (LABEL_MAX_LENGTH + 2 * Number(clusterProps.ymargin)) + 'px';
        elements.select('div.labelContainer').style('width', tempWidth).style('width', tempHeight).select('.label')
            .text(function(d) {
                var value = d.data.length;
                return format ? format(value) : value;
            });

        elements.select('div.labelContainer').style("height", function(d) {
            var node = d3.select(this).select('.label').node();
            var maxSize = Math.ceil(d3.min([
                LABEL_MAX_LENGTH, d3.max([
                    node.offsetWidth, node.offsetHeight, LABEL_MIN_LENGTH
                ])
            ]));
            d.xoffset = maxSize / 2 + clusterProps.xmargin;
            d.yoffset = maxSize / 2 + clusterProps.ymargin;
            return d.yoffset * 2 + "px";
        }).style('width', null);

        elements.select('div.imageContainer').attr('style', function(d) {
            return 'height:' + d.yoffset * 2 + 'px;';
        }).select("img").attr("src", clusterProps.url).attr("width", function(d) {
            return d.xoffset * 2 + 'px';
        }).attr("height", function(d) {
            return d.yoffset * 2 + 'px';
        });
        var selectedElements = elements.filter(function() {
            if (this.className.indexOf("selected") >= 0) {
                return true;
            } else {
                return false;
            }
        });
        selectedElements.select("div.imageContainer").select("img").attr("src", clusterProps.highlightUrl);
        this._updateClusterDataLabel(elements);

        return this;
    };

    /**
     * Update DOM structures for non-cluster elements. The implementation should
     * implement this function.
     * 
     * @abstract
     * @param {d3.selection}
     *            selection a D3 selection to be updated
     * 
     * @returns the visualization object itself
     * @ignore
     */
    LocationBasedVizImpl.prototype._updateSingle = function(elements, effectManager) {
        return this;
    };

    LocationBasedVizImpl.prototype._update = function(elements, toPixel, effectManager) {
        return this._updateCluster(elements.filter(this._viz._isCluster), effectManager)._updateSingle(
            elements.filter(this._viz._isNonCluster), effectManager);
    };

    /**
     * Calculate the left, top of non-cluster element by given data.
     * 
     * @abstract
     * @param {Object}
     *            data the data object
     * @param {Function}
     *            toPixel a function converting geo coordinate to screen
     *            coordinate
     * 
     * @returns {Array} the left, top of element.
     * @ignore
     */
    LocationBasedVizImpl.prototype._getSingleLeftTop = function(d, toPixel) {
        return [
            0, 0
        ];
    };

    LocationBasedVizImpl.prototype._getClusterLeftTop = function(d, toPixel) {
        var p = d.centroPoint;
        var topLeft = [
            p[0] - d.xoffset, p[1] - d.yoffset
        ];
        delete d.xoffset;
        delete d.yoffset;
        return topLeft;
    };

    LocationBasedVizImpl.prototype._getLeftTop = function(d, toPixel) {
        var p = d.centroPoint;
        if (d.isCluster) {
            return this._getClusterLeftTop(d, toPixel);
        }
        return this._getSingleLeftTop(d, p);
    };

    /**
     * Get Tooltip Content for this viz type.
     * 
     * @param {Object}
     *            data the data object
     * @param {Array}
     *            metadata the metadata for feeding definition
     * @ignore
     */
    LocationBasedVizImpl.prototype._getTooltipContent = function(data, metaFeedingMapping) {
        if (data.isCluster) {
            var locationValues = [], locationValue;
            var locationId = metaFeedingMapping[LOCATION].id, locationName = metaFeedingMapping[LOCATION].name;
            var count = data.data.length;
            for (var i = 0; i < d3.min([
                count, 3
            ]); i++) {
                var d = data.data[i];
                locationValue = this._getLocationValue(d, metaFeedingMapping);
                locationValues.push(locationValue);
            }
            if (count > 3) {
                locationValues.push(langManager.get('IDS_GEOETC'));
            }
            var otherInfo = [];
            otherInfo.push({
                name : locationName + " " + langManager.get('IDS_GEOCLUSTERED'),
                value : [
                    count
                ],
                type : "otherInfo"
            });
            otherInfo.push({
                name : locationName,
                value : locationValues,
                type : "otherInfo"
            });
            return {
                dimension : [],
                measure : [],
                otherInfo : otherInfo
            };
        } else {
            return AbstractVizImpl.prototype._getTooltipContent.apply(this, arguments);
        }
    };

    return LocationBasedVizImpl;
});

define('sap/viz/geo/dataviz/VizUtils',[
    "sap/viz/framework/common/util/TypeUtils"
], function(
    TypeUtils
) {
    var VizUtils = {};

    VizUtils.getColorByCategory = function(value, values, colorScale) {
        for (var i = 0, len = values.length; i < len; i++) {
            if (value === values[i]) {
                return colorScale(i);
            }
        }
        return null;
    };

    VizUtils.getValueByFeedId = function(data, feedId) {
        return data.dataHolder[feedId];
    };
    
    VizUtils.getDataShapeColor = function(data, scale, getDomainData) {
        var isString = TypeUtils.isString(scale);
        data.forEach(function(d) {
            var domainData = getDomainData ? getDomainData(d) : d;
            d.color = isString ? scale : scale.scale.scale(VizUtils.getValueByFeedId(domainData, scale.feedId));
        });
    };
    
    return VizUtils;
});

define('sap/viz/geo/legend/BaseLegend',[
    "sap/viz/framework/common/util/DOM"
], function(DOM) {

    function BaseLegend() {
    }

    BaseLegend.prototype.render = function(node) {

    };

    BaseLegend.prototype.width = function(_) {
        if (!arguments.length) {
            return this._width;
        }
        this._width = _;
        return this;
    };

    BaseLegend.prototype.reRender = function() {
        this.render();
    };

    BaseLegend.prototype.hasRendered = function() {
        return this._node != null;
    };

    BaseLegend.prototype.height = function(_) {
        if (!arguments.length) {
            return this._height;
        }
        this._height = _;
        return this;
    };

    BaseLegend.prototype.setDispatch = function(_) {
        this._dispatch = _;
    };

    BaseLegend.prototype.setLayer = function(_) {
        this._layer = _;
    };

    BaseLegend.prototype.getPreferredSize = function() {
        return {
            width : 0,
            height : 0,
            minHeight : 0,
            minWidth : 0
        };
    };

    BaseLegend.prototype.node = function() {
        return this._node;
    };

    BaseLegend.prototype.destroy = function() {
        var node = this.node();
        if (node) {
            DOM.empty(node);
        }
    };

    return BaseLegend;
});

define('sap/viz/geo/legend/AbstractSingleLegend',[
    "sap/viz/framework/common/util/oo",
    "sap/viz/framework/common/util/DOM",
    'sap/viz/framework/common/util/ObjectUtils',
    "sap/viz/geo/legend/BaseLegend"
], function(
    oo,
    DOM,
    ObjectUtils,
    BaseLegend
) {
    var defaultProps = {
        top : 8,
        left : 12,
        right : 0,
        bottom : 8,
        isShowTitle : true
    };
    function AbstractSingleLegend(options, effectManager) {
        AbstractSingleLegend.superclass.constructor.apply(this);
        this._effectManager = effectManager;

        var arr = [
            true, {}
        ].concat(this._getDefaultPropertiesChain());
        this._defaultProperties = ObjectUtils.extendByRepalceArray.apply(this, arr);
        this.setProperties(options);
    }

    oo.extend(AbstractSingleLegend, BaseLegend);

    AbstractSingleLegend.prototype._getDefaultPropertiesChain = function() {
        return [
            defaultProps
        ];
    };

    AbstractSingleLegend.prototype._calculatePreferredSize = function() {
        var options = this._options;
        return {
            width : options.left + options.right,
            height : options.top + options.bottom,
            minHeight : options.top + options.bottom,
            minWidth : options.left + options.right
        };
    };

    AbstractSingleLegend.prototype.getPreferredSize = function() {
        var preferredSize = this._preferredSize;
        if (!preferredSize) {
            this._preferredSize = preferredSize = this._calculatePreferredSize();
        }
        return preferredSize;
    };

    AbstractSingleLegend.prototype.setLegendInfo = function(data) {
        delete this._preferredSize;
        this._legendData = data;
    };

    AbstractSingleLegend.prototype.setProperties = function(props) {
        delete this._preferredSize;
        this._options = ObjectUtils.extendByRepalceArray(true, null, this._defaultProperties, props);
    };

    return AbstractSingleLegend;
});
define('sap/viz/geo/legend/AbstractDelegateLegend',[
    "sap/viz/framework/common/util/oo",
    "sap/viz/geo/legend/AbstractSingleLegend",
    "sap/viz/framework/common/util/SVG"
], function(
    oo,
    AbstractSingleLegend,
    SVG
) {
    var defaultProps = {
        titleStyle : {
            fontFamily : "'Open Sans', Arial, Helvetica, sans-serif",
            fontSize : '14px',
            color : '#333333',
            fontWeight : 'bold'
        },
        labelStyle : {
            fontFamily : "'Open Sans', Arial, Helvetica, sans-serif",
            fontSize : '12px',
            color : '#333',
            fontWeight : 'normal'
        },
        drawingEffect : "normal"
    };

    var AbstractDelegateLegend = function(delegatedConstructor, properties, effectManager) {
        this._delegatedConstructor = delegatedConstructor;
        AbstractDelegateLegend.superclass.constructor.call(this, properties, effectManager);
    };

    oo.extend(AbstractDelegateLegend, AbstractSingleLegend);

    AbstractDelegateLegend.prototype._getDefaultPropertiesChain = function() {
        var ret = AbstractDelegateLegend.superclass._getDefaultPropertiesChain.apply(this, arguments);
        ret.push(defaultProps);
        return ret;
    };

    AbstractDelegateLegend.prototype._getOrCreateDelegate = function() {
        var delegate = this._delegate;
        if (!delegate) {
            this._delegate = delegate = new (this._delegatedConstructor)(null, {
                effectManager : this._effectManager
            });
            this._afterCreateDelegate();
        }
        return delegate;
    };

    AbstractDelegateLegend.prototype._calculatePreferredSize = function() {
        var ret = AbstractDelegateLegend.superclass._calculatePreferredSize.apply(this, arguments);
        var delegateSize = this._getOrCreateDelegate().getPreferredSize();
        ret.width += delegateSize.width;
        ret.height += delegateSize.height;
        ret.minHeight += delegateSize.minHeight;
        ret.minWidth += delegateSize.minWidth;
        return ret;
    };

    AbstractDelegateLegend.prototype.setLegendInfo = function(data) {
        AbstractDelegateLegend.superclass.setLegendInfo.apply(this, arguments);
        this._getOrCreateDelegate().data(data);
    };

    AbstractDelegateLegend.prototype.render = function(container) {
        var svg = this._svg, g;
        if (container && container !== this.node()) {
            svg = this._svg = container.appendChild(SVG.create("svg"));
            g = SVG.create("g", svg);
        } else {
            g = svg.firstChild;
        }

        var w = this.width(), h = this.height();
        svg.setAttribute("width", w);
        svg.setAttribute("height", h);
        g.setAttribute("transform", "translate(" + this._options.left + "," + this._options.top + ")");
        this._getOrCreateDelegate().width(w - this._options.left - this._options.right).height(
            h - this._options.top - this._options.bottom).render(d3.select(g));
    };

    AbstractDelegateLegend.prototype.setProperties = function(props) {
        AbstractDelegateLegend.superclass.setProperties.apply(this, arguments);
        this._getOrCreateDelegate().properties(this._buildDelegateProperties());
    };

    AbstractDelegateLegend.prototype._afterCreateDelegate = function() {
    };

    AbstractDelegateLegend.prototype.node = function() {
        var svg = this._svg;
        return svg && svg.parentNode;
    };

    AbstractDelegateLegend.prototype.destroy = function() {
        var delegate = this._delegate;
        if (delegate) {
            delegate.destroy();
        }
        AbstractDelegateLegend.superclass.destroy.apply(this, arguments);
    };

    AbstractDelegateLegend.prototype._buildDelegateProperties = function() {
        var options = this._options;
        var titleStyle = options.titleStyle, labelStyle = options.labelStyle;
        return {
            title : {
                visible : options.isShowTitle,
                text : options.titleText,
                style : {
                    fontFamily : titleStyle.fontFamily,
                    fontSize : titleStyle.fontSize,
                    color : titleStyle.color,
                    fontWeight : titleStyle.fontWeight
                }
            },
            label : {
                style : {
                    fontFamily : labelStyle.fontFamily,
                    fontSize : labelStyle.fontSize,
                    color : labelStyle.color,
                    fontWeight : labelStyle.fontWeight
                }
            },
            formatString : options.formatString,
            unitFormatType : options.unitFormatType,
            drawingEffect : options.drawingEffect
        };
    };

    return AbstractDelegateLegend;
});
define('sap/viz/geo/legend/SizeLegend',[
    "sap/viz/framework/common/util/oo",
    'sap/viz/geo/legend/AbstractDelegateLegend',
    'sap/viz/chart/components/legend/SizeLegend'
], function(
    oo,
    AbstractDelegateLegend,
    SizeLegendComp
) {
    var defaultProps = {
        color : null
    };
    function SizeLegend(options, effectManager) {
        SizeLegend.superclass.constructor.call(this, SizeLegendComp, options, effectManager);
    }
    oo.extend(SizeLegend, AbstractDelegateLegend);

    SizeLegend.prototype._getDefaultPropertiesChain = function() {
        var ret = SizeLegend.superclass._getDefaultPropertiesChain.apply(this, arguments);
        ret.push(defaultProps);
        return ret;
    };

    SizeLegend.prototype._calculatePreferredSize = function(container) {
        var preferredSize = SizeLegend.superclass._calculatePreferredSize.apply(this, arguments);

        // SizeLegendArea return the height exceed 15px
        preferredSize.height -= 15;
        preferredSize.minHeight -= 15;
        preferredSize.minWidth = preferredSize.width;
        return preferredSize;
    };

    SizeLegend.prototype._buildDelegateProperties = function() {
        var props = SizeLegend.superclass._buildDelegateProperties.apply(this, arguments);
        props.plotArea = {
            colorPalette : [
                this._options.color
            ]
        };
        return props;
    };

    return SizeLegend;
});
define('sap/viz/geo/legend/AbstractColorLegend',[
    "sap/viz/framework/common/util/oo",
    'sap/viz/geo/legend/AbstractDelegateLegend',
    'sap/viz/chart/components/legend/ColorLegend'
], function(
    oo,
    AbstractDelegateLegend,
    ColorLegend
) {
    function AbstractColorLegend(options, effectManager) {
        AbstractColorLegend.superclass.constructor.call(this, ColorLegend, options, effectManager);
    }
    oo.extend(AbstractColorLegend, AbstractDelegateLegend);

    AbstractColorLegend.prototype._getDefaultPropertiesChain = function() {
        var ret = AbstractColorLegend.superclass._getDefaultPropertiesChain.apply(this, arguments);
        var delegateProps = this._getOrCreateDelegate().properties();
        ret.push({
            marker : {
                size : delegateProps.marker.size
            },
            itemMargin : delegateProps.itemMargin
        });
        return ret;
    };

    AbstractColorLegend.prototype._buildDelegateProperties = function() {
        var props = AbstractColorLegend.superclass._buildDelegateProperties.apply(this, arguments);
        props.marker = {
            size : this._options.marker.size
        };
        props.itemMargin = this._options.itemMargin;
        return props;
    };

    AbstractColorLegend.prototype._calculatePreferredSize = function() {
        var preferredSize = AbstractColorLegend.superclass._calculatePreferredSize.apply(this, arguments);

        preferredSize.minHeight = preferredSize.height;
        return preferredSize;
    };

    return AbstractColorLegend;
});
define('sap/viz/geo/legend/addToBehavior',[
    "sap/viz/geo/GeoLegendManager", "sap/viz/geo/interaction/addToBehavior"
], function(GeoLegendManager, addToBehavior, DataSelector) {
    var getTargets = function(ctx, event, service) {
        return GeoLegendManager.getLegendFromChild(event.data.currentTarget)._layer._queryDataPointIds(ctx);
    };

    return function(oriConfig) {
        addToBehavior({
            oriConfig : oriConfig,
            handlerExtension : {
                _getTargets : getTargets
            }
        });
    };
});
define('sap/viz/geo/legend/ColorLegend',[
    "sap/viz/framework/common/util/oo",
    'sap/viz/geo/legend/AbstractColorLegend',
    "sap/viz/framework/scale/ColorScale",
    "sap/viz/chart/behavior/config/LegendBehaviorConfig",
    'sap/viz/geo/legend/addToBehavior'
], function(
    oo,
    AbstractColorLegend,
    ColorScale,
    LegendBehaviorConfig,
    addToBehavior
) {

    addToBehavior(LegendBehaviorConfig[0]);

    function ColorLegend(options, effectManager) {
        ColorLegend.superclass.constructor.call(this, options, effectManager);
    }
    oo.extend(ColorLegend, AbstractColorLegend);

    ColorLegend.prototype._getDefaultPropertiesChain = function() {
        var ret = ColorLegend.superclass._getDefaultPropertiesChain.apply(this, arguments);
        var delegateProps = this._getOrCreateDelegate().properties();
        ret.push({
            marker : {
                shape : delegateProps.marker.shape
            }
        });
        return ret;
    };
    ColorLegend.prototype.setLegendInfo = function(obj) {
        var domain = [], rowArray = [];
        obj.data.forEach(function(d) {
            domain.push([
                d.originalVal
            ]);
            var row = [
                d.originalVal
            ];
            row.mndIndex = -1;
            rowArray.push(row);
        });
        return ColorLegend.superclass.setLegendInfo.call(this, {
            color : {
                scale : new ColorScale(domain, obj.color),
                rowArray : rowArray,
                metaData : [
                    obj.metaData
                ]
            }
        });
    };

    ColorLegend.prototype._buildDelegateProperties = function() {
        var props = ColorLegend.superclass._buildDelegateProperties.apply(this, arguments);
        props.marker.shape = this._options.marker.shape;
        return props;
    };

    return ColorLegend;
});

define('sap/viz/geo/legend/MbcLegend',[
    "sap/viz/framework/common/util/oo", 'sap/viz/chart/components/legend/MBCLegend',
    'sap/viz/geo/legend/AbstractDelegateLegend', 'sap/viz/geo/legend/addToBehavior',
    "sap/viz/chart/behavior/config/MBCLegendBehaviorConfig"
], function(oo, MBCLegend, AbstractDelegateLegend, addToBehavior, MBCLegendBehaviorConfig) {

    addToBehavior(MBCLegendBehaviorConfig[0]);

    function MbcLegend(options, effectManager) {
        MbcLegend.superclass.constructor.call(this, MBCLegend, options, effectManager);
    }

    oo.extend(MbcLegend, AbstractDelegateLegend);

    MbcLegend.prototype._afterCreateDelegate = function() {
        this._delegate.setOrientation("bottom");
    };

    MbcLegend.prototype._calculatePreferredSize = function(container) {
        var preferredSize = MbcLegend.superclass._calculatePreferredSize.apply(this, arguments);

        preferredSize.minHeight = preferredSize.height;
        preferredSize.mbcWidth = preferredSize.width;
        preferredSize.width = preferredSize.minWidth;
        return preferredSize;
    };

    MbcLegend.prototype.bMbcOnly = function() {
        return true;
    };

    return MbcLegend;
});

define('sap/viz/geo/legend/ComposedLegend',[
    'sap/viz/framework/common/util/ObjectUtils', 'sap/viz/chart/components/util/TextUtils',
    'sap/viz/geo/legend/BaseLegend', 'sap/viz/geo/legend/SizeLegend', 'sap/viz/geo/legend/MbcLegend',
    'sap/viz/geo/legend/ColorLegend'
], function(ObjectUtils, TextUtils, BaseLegend, SizeLegend, MbcLegend, ColorLegend) {

    function ComposedLegend(legends) {
        this._legends = legends;
        this.calculatePreferredSize();
    }
    ComposedLegend.prototype = Object.create(BaseLegend.prototype);
    ComposedLegend.prototype.constructor = ComposedLegend;

    /**
     * render legend in a node
     * 
     * @ignore
     * @param {node}
     *            the node to be append child elements.
     */

    ComposedLegend.prototype.render = function(node) {
        var legends;
        if (node) {
            this._node = node;
        }
        legends = d3.select(this._node).selectAll("div").data(this._legends);
        legends.enter().append("div");
        legends.exit().remove();

        this._node.style.display = "";

        for (var i = 0; i < this._legends.length; ++i) {
            this._legends[i].width(this._width);
            var height = this._legendsHeight[i];
            this._legends[i].height(this._legendsHeight[i]);
            this._legends[i].render(legends[0][i]);
        }
        return this;
    };

    ComposedLegend.prototype.hasRendered = function() {
        if (this._node && this._legends.length && this._legends[0].hasRendered()) {
            return true;
        }

        return false;
    };

    ComposedLegend.prototype.reRender = function() {
        for (var i = 0; i < this._legends.length; ++i) {
            this._legends[i].width(this._width);
            this._legends[i].height(this._legendsHeight[i]);

            this._legends[i].reRender();
        }
    };

    ComposedLegend.prototype.setLayer = function(layer) {
        BaseLegend.prototype.setLayer.call(this, layer);
        for (var i = 0; i < this._legends.length; ++i) {
            this._legends[i].setLayer(layer);
        }
    };

    ComposedLegend.prototype.setDispatch = function(dispatch) {
        for (var i = 0; i < this._legends.length; ++i) {
            this._legends[i].setDispatch(dispatch);
        }
    };

    ComposedLegend.prototype.recreate = function(legends) {

        this.destroy();
        this._legends = legends;
        this.calculatePreferredSize();
        return this;
    };

    ComposedLegend.prototype.destroy = function() {
        for (var i = 0; i < this._legends.length; ++i) {
            this._legends[i].destroy();

        }
        this._legends = [];
        d3.select(this._node).selectAll("div").remove();

    };

    ComposedLegend.prototype.calculatePreferredSize = function() {
        this._preferredAreaSize = {
            width : 0,
            height : 0,
            minWidth : 0,
            minHeight : 0,
            mbcWidth : 0
        };
        this._bMbcOnly = true;
        this._legendsHeight = [];
        for (var i = 0; i < this._legends.length; ++i) {
            var legend = this._legends[i];
            var curSize = legend.getPreferredSize();
            if (!(legend.bMbcOnly && legend.bMbcOnly())) {
                this._bMbcOnly = false;
            } else {
                this._preferredAreaSize.mbcWidth = Math.max(this._preferredAreaSize.mbcWidth, curSize.mbcWidth);
            }

            this._preferredAreaSize.width = curSize.width > this._preferredAreaSize.width ? curSize.width
                : this._preferredAreaSize.width;
            this._preferredAreaSize.height += curSize.height;
            this._preferredAreaSize.minWidth = curSize.minWidth > this._preferredAreaSize.minWidth ? curSize.minWidth
                : this._preferredAreaSize.minWidth;
            this._preferredAreaSize.minHeight += curSize.minHeight;
            this._legendsHeight.push(curSize.minHeight);
        }

        return this._preferredAreaSize;
    };

    ComposedLegend.prototype.getPreferredSize = function() {
        return this._preferredAreaSize;
    };

    ComposedLegend.prototype.bMbcOnly = function() {
        return this._bMbcOnly;
    };

    return ComposedLegend;
});
define('sap/viz/geo/legend/ImageLegend',[
    "sap/viz/framework/common/util/oo",
    'sap/viz/geo/legend/AbstractColorLegend',
    'sap/viz/geo/legend/AbstractSingleLegend',
    'sap/viz/framework/common/util/Constants'
], function(
    oo,
    AbstractColorLegend,
    AbstractSingleLegend,
    Constants
) {

    var CLASS_LEGEND_ITEM_INTERACTION = Constants.CSS.CLASS.LEGENDITEM;
    var RE_TRANSLATE = /translate\(\s*([^\s,)]+)[ ,]([^\s,)]+)/;

    function ImageLegend(options, effectManager) {
        ImageLegend.superclass.constructor.call(this, options, effectManager);
    }
    oo.extend(ImageLegend, AbstractColorLegend);

    var MockColorShapeScale = function(items) {
        this._items = items;
    };

    MockColorShapeScale.prototype.getLength = function() {
        return this._items.length;
    };

    MockColorShapeScale.prototype.getItem = function(i) {
        return this._items[i];
    };

    ImageLegend.prototype._getDefaultPropertiesChain = function() {
        var ret = ImageLegend.superclass._getDefaultPropertiesChain.apply(this, arguments);
        ret.push({
            marker : {
                size : 12
            }
        });
        return ret;
    };

    ImageLegend.prototype.setLegendInfo = function(obj) {
        AbstractSingleLegend.prototype.setLegendInfo.apply(this, arguments);
        var delegate = this._getOrCreateDelegate();
        delegate._colorShapeScale = new MockColorShapeScale(obj.map(function(o) {
            return {
                data : o.text
            };
        }));
    };

    ImageLegend.prototype.render = function() {
        ImageLegend.superclass.render.apply(this, arguments);

        var transforms = [];
        var svg = d3.select(this._svg);
        var legendItems = svg.selectAll(".v-legend-element");
        legendItems.select("path").each(function(d, i) {
            var xforms = this.getAttribute('transform');
            var parts = RE_TRANSLATE.exec(this.getAttribute('transform'));
            transforms[i] = [
                parts[1], parts[2]
            ];
        }).remove();

        legendItems.select(".img").remove();

        var textHeight = parseInt(this._delegate._labelFont.fontSize, 10);
        var markerSize = this._options.marker.size;
        var overallHeight = Math.max(markerSize, textHeight);

        var legendData = this._legendData;
        legendItems.insert("g", "text").attr("class", "img").attr(
            "transform",
            function(d, i) {
                return "translate(" + (transforms[i][0] - markerSize / 2) + "," +
                    (transforms[i][1] - overallHeight / 2) + ")";
            }).each(
            function(d, i) {
                d = legendData[i];
                var g = d3.select(this);
                var render = d.render;
                if (render) {
                    render(g);
                } else {
                    g.append("image").attr("width", markerSize).attr("height", markerSize).node().setAttributeNS(
                        "http://www.w3.org/1999/xlink", "xlink:href", d.url);
                }
            });

        svg.selectAll("." + CLASS_LEGEND_ITEM_INTERACTION).classed(CLASS_LEGEND_ITEM_INTERACTION, false);
    };

    return ImageLegend;
});
define('sap/viz/geo/dataviz/MBCHelper',[
    "sap/viz/framework/common/util/NumberUtils",
    'sap/viz/framework/scale/QuantizeScaleUtil',
    'sap/viz/framework/scale/QuantizeScale',
    'sap/viz/geo/legend/MbcLegend',
    "sap/viz/geo/dataviz/VizUtils",
    'sap/viz/framework/common/util/ObjectUtils'
], function(
    NumberUtils,
    QuantizeScaleUtil,
    QuantizeScale,
    MbcLegend,
    VizUtils,
    ObjectUtils
) {
    function MBCHelper(meta, feedId, vizProps) {
        this._meta = meta;
        this._feedId = feedId;
        this._vizProps = vizProps;
    }

    MBCHelper.prototype.getScale = function() {
        var scale = this._scale;
        if (!scale) {
            var values = this._values;
            var validValues = values.filter(function(d) {
                return !NumberUtils.isNoValue(d);
            });

            var validValuesLen = validValues.length;
            var extent = this._valueExtent = validValuesLen > 0 ? d3.extent(validValues) : [
                undefined, undefined
            ];

            var vizProps = this._vizProps;
            scale = this._scale = new QuantizeScale(QuantizeScaleUtil.getColorScale(extent[0], extent[1],
                values.length > validValuesLen, {
                    nullColor : vizProps.nullColor,
                    numOfSegments : vizProps.numOfSegments,
                    palette : this._getColorPalette(),
                    startColor : vizProps.startColor,
                    endColor : vizProps.endColor,
                    legendValues : vizProps.legendValues
                }));
        }
        return scale;
    };

    MBCHelper.prototype._getColorPalette = function() {
        return this._vizProps.colorPalette;
    };

    MBCHelper.prototype.setData = function(data) {
        var feedId = this._feedId;
        this._values = data.map(function(d) {
            return VizUtils.getValueByFeedId(d, feedId);
        });
        this._scale = null;
        this._valueExtent = null;
    };

    MBCHelper.prototype.createOrUpdateLgend = function(effectManager, legend) {
        var meta = this._meta;
        var legendOptions = ObjectUtils.extendByRepalceArray(true, {
            titleText : meta.name
        }, this._vizProps.mbcLegend);
        if (legend) {
            legend.setProperties(legendOptions);
        } else {
            legend = new MbcLegend(legendOptions, effectManager);
        }

        legend.setLegendInfo({
            color : {
                scale : this.getScale(),
                metaData : [
                    meta
                ],
                range : [
                    this._valueExtent
                ],
                values : this._values
            }
        });
        return legend;
    };

    return MBCHelper;
});
define('sap/viz/geo/dataviz/FormatUtils',["sap/viz/framework/common/util/TypeUtils"
	],function( TypeUtils ) {
    return {
        getFormatString : function(formatinfo , key) {
                if(!formatinfo){
                    return null;
                }
                if(TypeUtils.isString(formatinfo)){
                    return formatinfo;
                } else if (!TypeUtils.isEmptyObject(formatinfo)) {
                    return formatinfo[key];
                }
                return formatinfo;
            } 
    };

});
define('sap/viz/geo/dataviz/DatalabelUtils',[ 
    'sap/viz/geo/dataviz/ColorUtils',
    'sap/viz/chart/components/util/TextUtils',
    'sap/viz/framework/common/format/UnitFormat',
    "sap/viz/geo/dataviz/FormatUtils"

], function(
    ColorUtils,
    TextUtils,
    UnitFormat,
    FormatUtils
) {
    return {
        updateDataLabel : function (props, feedings, locationLabel, d, container, isCluster) {
            var PADDING = 2;
            var EXTRA_BORDER = 8;      
            var style = props.dataLabel.style;
            var labelProps = props.dataLabel;
            var baseContainer = container.querySelector(".mainShape").parentNode.parentNode;
            var labelContainer = baseContainer.querySelector(".dataLabelContainer");
            var colorNode = baseContainer.querySelector(".dataLabel.color");
            var measureNode = baseContainer.querySelector(".dataLabel.measure");
            var locationNode = baseContainer.querySelector(".dataLabel.location");
            var isBubble = d.isMaxValue === undefined ? true : false;
            var ICON_WIDTH = isBubble? 14 : 0;
            var ICON_HEIGHT = isBubble? 14 : 0;
            var extra_border = isCluster ? EXTRA_BORDER : 0;

            if ((labelProps.visible || isCluster) && d.isMaxValue !==false) {
                if (!labelContainer) {
                    labelContainer = document.createElement("div");
                    labelContainer.setAttribute("class",
                            "dataLabelContainer");
                    baseContainer.appendChild(labelContainer);
                }
                labelContainer.setAttribute("style", "font-family:" + style.fontFamily + ";font-size:" +
                    style.fontSize + ";font-weight:" + style.fontWeight + ";font-style:" + style.fontStyle +
                    ";color:" + style.color);
                if (!colorNode) {
                    colorNode = document.createElement("span");
                    colorNode.setAttribute("class", "dataLabel color");
                    colorNode.setAttribute("style", "position:absolute");
                    measureNode = document.createElement("span");
                    measureNode.setAttribute("class", "dataLabel measure");
                    measureNode.setAttribute("style", "position:absolute");
                    locationNode = document.createElement("span");
                    locationNode.setAttribute("class", "dataLabel location");
                    locationNode.setAttribute("style", "position:absolute");
                    labelContainer.appendChild(colorNode);
                    labelContainer.appendChild(measureNode);
                    labelContainer.appendChild(locationNode);
                }

            }

            var measureSize = {
                width : 0,
                height : 0
            }, locationSize = {
                width : 0,
                height : 0
            }, colorSize = {
                width : 0,
                height : 0
            };
            var measureText = "", colorText = "", locationText = "";
            var iconWidth = 0, iconHeight = 0;
            var totalWidth = d.r * 2;
            var showMeasure = false, showLocation = false, showColor = false;
            var showIcon = false;
        
            var fontColor = (style.color === "") ? ColorUtils.getDataLabelColor(d.color, "#808080", 0.75) : style.color;
            var fontColorWithoutSize = (style.color ? style.color : "#333333");
            var hasSizeFeed = false;
            if (feedings.size) {
                hasSizeFeed = true;
            }
            if (colorNode) {
                colorNode.style.color = hasSizeFeed ? fontColor : fontColorWithoutSize;
                colorNode.textContent = "";            
            }
            if (measureNode) {
                measureNode.style.color = fontColor;
                measureNode.textContent = "";
            }
            if (locationNode) {
                locationNode.style.color = hasSizeFeed ? fontColor : fontColorWithoutSize;
                locationNode.textContent = "";    
            }

           
            var measurePos = 0, locationPos = 0, colorPos = 0, size;
            var iconNode = container.querySelector(".warningIcon");
            if (iconNode) {
                iconNode.setAttribute("class", "warningIcon"); 
            }
        
            var minTextSize = TextUtils
                .superFastMeasure("...", style["fontSize"], style["fontWeight"], style["fontFamily"]);
            // var fontColor = getDataLabelColor(d.color, "#808080", 0.75);
            var format = labelProps.format;
            var formatType = labelProps.unitFormatType;

            if (hasSizeFeed) {
                var value = isCluster ? d.size : d.dataHolder.size;
                if (isBubble && value < 0) {
                    iconHeight = ICON_HEIGHT;
                    iconWidth = ICON_WIDTH;
                    showIcon = true;
                    if (!iconNode) {
                        if (!labelContainer) {
                            labelContainer = document.createElement("div");
                            labelContainer.setAttribute("class","dataLabelContainer");
                            labelContainer.setAttribute("style", "font-family:" + style.fontFamily + 
                                ";font-size:" + style.fontSize + ";font-weight:" + style.fontWeight + 
                                ";font-style:" + style.fontStyle);
                            baseContainer.appendChild(labelContainer);
                        }
                        iconNode = document.createElement("div");
                        iconNode.setAttribute("class", "warningIcon");
                        iconNode.setAttribute("style", "position:absolute;");
                        if (labelContainer.firstChild) {
                            labelContainer.insertBefore(iconNode,
                                    labelContainer.firseChild);
                        } else {
                            labelContainer.appendChild(iconNode);
                        }
                    }
                }                           

                if (isCluster || (labelProps.visible && labelProps.showSizeValue && d.isMaxValue !==false)) {
                    measureText = d.percent ? d.percent : ((isCluster && !labelProps.visible) ? d.data.length : 
                        UnitFormat.format(value, FormatUtils.getFormatString(format, feedings.size.id),
                        FormatUtils.getFormatString(formatType, feedings.size.id)));
                    size = TextUtils.superFastMeasure(measureText, style["fontSize"], style["fontWeight"],
                        style["fontFamily"]);
                    measureSize.width = size.width;
                    measureSize.height = size.height;
                    // if(MeasureText !== ""){
                    showMeasure = true;
                    // }
                }

            } else if (isCluster) {
                measureText = "" + d.data.length;
                measureSize = TextUtils.superFastMeasure(measureText, style["fontSize"], style["fontWeight"],
                    style["fontFamily"]);
                showMeasure = true;
            }

            if (feedings.location && labelProps.visible && labelProps.showLocationName && d.isMaxValue !==false) {
                locationText = locationLabel;
                // if(locationText !== ""){
                showLocation = true;
                // }

                size = TextUtils
                    .superFastMeasure(locationText, style["fontSize"], style["fontWeight"], style["fontFamily"]);
                locationSize.width = size.width;
                locationSize.height = size.height;
            }

            if (feedings.color && labelProps.visible && labelProps.showColorValue && d.isMaxValue !==false) {
                colorText = isCluster ? d.data[0].dataHolder.color : d.dataHolder.color;
                if (feedings.color.semanticType === "Measure") {
                    colorText = UnitFormat.format(colorText, FormatUtils.getFormatString(format, feedings.color.id),
                        FormatUtils.getFormatString(formatType, feedings.color.id));
                }
                size = TextUtils.superFastMeasure(colorText, style["fontSize"], 
                    style["fontWeight"], style["fontFamily"]);
                colorSize.width = size.width;
                colorSize.height = size.height;
                showColor = true;
            }

            if (!hasSizeFeed) { // special process to no size feed, label will
                // display up the bubble
                if (isCluster) {
                    measurePos = -minTextSize.height / 2;
                }
                if (showLocation) {
                    locationPos = -(d.r + PADDING + extra_border + minTextSize.height);
                }
                if (showColor) {
                    colorPos = -(d.r + PADDING + extra_border) - (showLocation ? 2 : 1) * minTextSize.height;
                }
            } else if (showMeasure || showIcon) {
                if (showLocation && showColor) {
                    measurePos = -minTextSize.height / 2;
                    colorPos = -minTextSize.height * 3 / 2;
                    locationPos = minTextSize.height / 2;
                } else if (showLocation) {
                    measurePos = -minTextSize.height;
                    locationPos = 0;
                } else if (showColor) {
                    measurePos = 0;
                    colorPos = -minTextSize.height;
                } else {
                    measurePos = -minTextSize.height / 2;
                }
            } else if (showLocation && showColor) {
                colorPos = -minTextSize.height;
                locationPos = 0;
            } else if (showLocation) {
                locationPos = -minTextSize.height / 2;
            } else if (showColor) {
                colorPos = -minTextSize.height / 2;
            }
            var height, powerWidth, realWidth;
            if (showMeasure || showIcon) {
                height = (measurePos >= 0 ? measurePos + measureSize.height : Math.abs(measurePos));
                powerWidth = totalWidth * totalWidth - 4 * height * height;
                if (powerWidth > 0) {
                    realWidth = Math.sqrt(powerWidth);
                    if (measureSize.width + iconWidth > realWidth) {
                        if (minTextSize.width + iconWidth <= realWidth) {
                            measureText = "...";
                            measureSize.width = minTextSize.width;
                        } else if (minTextSize.width + iconWidth > realWidth) {
                            measureText = "";
                            measureSize.width = 0;
                            measureSize.height = 0;
                        }
                    }
                } else {
                    measureText = "";
                    measureSize.width = 0;
                    measureSize.height = 0;
                }
            }

            if (hasSizeFeed && showLocation) {
                height = (locationPos >= 0 ? locationPos + locationSize.height : Math.abs(locationPos));
                powerWidth = totalWidth * totalWidth - 4 * height * height;
                if (powerWidth > 0) {
                    realWidth = Math.sqrt(powerWidth);
                    if (locationSize.width > realWidth) {

                        if (locationSize.width >= minTextSize.width) {
                            locationText = TextUtils.ellipsis(locationText, null, realWidth, 
                                "font-family:" + style.fontFamily + ";font-size:" + style.fontSize + 
                                ";font-weight:" + style.fontWeight);
                            locationSize.width = realWidth;
                        } else {
                            locationText = "";
                            locationSize.width = 0;
                        }
                    }
                } else {
                    locationText = "";
                }
            }

            if (hasSizeFeed && showColor) {
                height = (colorPos >= 0 ? colorPos + colorSize.hegiht : Math.abs(colorPos));
                powerWidth = totalWidth * totalWidth - 4 * height * height;
                if (powerWidth > 0) {
                    realWidth = Math.sqrt(powerWidth);
                    if (colorSize.width > realWidth) {

                        if (colorSize.width >= minTextSize.width) {
                            colorText = TextUtils.ellipsis(
                                colorText, null, realWidth, "font-family:" + style.fontFamily +
                                ";font-size:" + style.fontSize + ";font-weight:" + style.fontWeight);
                            colorSize.width = realWidth;
                        } else {
                            colorText = "";
                            colorSize.width = 0;
                        }
                    }
                } else {
                    colorText = "";
                }
            }

            if (showIcon) {
                iconNode.setAttribute("class", "warningIcon show");
                var locationTop = d.r + PADDING + extra_border + measurePos;
                if (measureText === "" && colorText === "" && locationText === "") {
                    locationTop = d.r + PADDING + extra_border - iconHeight / 2;
                }
                iconNode.style.left = d.r + PADDING + extra_border - (measureSize.width + iconWidth) / 2 + "px";
                iconNode.style.top = locationTop + "px";
            }

            if (measureText !== "") {
                measureNode.textContent = measureText;
                measureNode.style.left = d.r + PADDING + extra_border + (-measureSize.width / 2 + iconWidth / 2) + "px";
                measureNode.style.top = d.r + PADDING + extra_border + measurePos + "px";
                measureNode.style.width = measureSize.width + "px";
                measureNode.style.height = measureSize.height + "px";
            }

            if (colorText !== "") {
                colorNode.textContent = colorText;
                colorNode.style.left = d.r + PADDING + extra_border - (colorSize.width) / 2 + "px";
                colorNode.style.top = d.r + PADDING + extra_border + colorPos + "px";
                colorNode.style.width = colorSize.width + "px";
                colorNode.style.height = colorSize.height + "px";
            }

            if (locationText !== "") {
                locationNode.textContent = locationText;
                locationNode.style.left = d.r + PADDING + extra_border - locationSize.width / 2 + "px";
                locationNode.style.top = d.r + PADDING + extra_border + locationPos + "px";
                locationNode.style.width = locationSize.width + "px";
                locationNode.style.height = locationSize.height + "px";
            }    
        },
        generateLabelsRect : function (selections, dataLabelProps, sizeFeed) {
            var labelsRect = [];

            if (!sizeFeed && dataLabelProps.visible &&
                (dataLabelProps.showLocationName || dataLabelProps.showColorValue)) {
                selections.each(function(d) {
                    
                    var top = parseFloat(this.style.top);
                    var left = parseFloat(this.style.left);
                    var dataLabelNode = this.querySelector(".dataLabelContainer");
                    var nodes = [
                        dataLabelNode.childNodes[0], dataLabelNode.childNodes[2]
                    ];
                    var rectGroup = [];
                    for (var i = 0, len = nodes.length; i < len; ++i) {
                        if (nodes[i].textContent !== "") {
                            nodes[i].style.display = "";
                            var nodeStyle = nodes[i].style;
                            var rect = {};
                            rect.top = parseFloat(nodeStyle.top) + top;
                            rect.left = parseFloat(nodeStyle.left) + left;
                            rect.right = rect.left + parseFloat(nodeStyle.width);
                            rect.bottom = rect.top + parseFloat(nodeStyle.height);
                            rect.dom = nodes[i];
                            nodes[i].style.display = "";
                            rectGroup.push(rect);
                        }
                    }
                    labelsRect.unshift(rectGroup);
                });
            }
            return labelsRect;
        }     
    };

});
define('sap/viz/geo/dataviz/BubbleImpl',[
    "sap/viz/geo/dataviz/AbstractVizImpl",
    "sap/viz/geo/dataviz/LocationBasedVizImpl",
    "sap/viz/geo/Bounds",
    'sap/viz/framework/common/util/ObjectUtils',
    'sap/viz/geo/dataviz/VizUtils',
    'sap/viz/geo/legend/SizeLegend',
    'sap/viz/geo/legend/ColorLegend',
    'sap/viz/framework/common/util/NumberUtils',
    "sap/viz/framework/common/lang/LangManager",
    'sap/viz/geo/legend/ComposedLegend',
    'sap/viz/geo/legend/ImageLegend',
    'sap/viz/chart/components/util/TextUtils',
    "sap/viz/framework/common/format/FormatManager",
    "sap/viz/framework/common/util/TypeUtils",
    'sap/viz/geo/dataviz/MBCHelper',
    'sap/viz/geo/dataviz/DatalabelUtils',
    "sap/viz/framework/common/util/oo"
], function(
    AbstractVizImpl,
    LocationBasedVizImpl,
    Bounds,
    ObjectUtils,
    VizUtils,
    SizeLegend,
    ColorLegend,
    NumberUtils,
    langManager,
    ComposedLegend,
    ImageLegend,
    TextUtils,
    FormatManager,
    TypeUtils,
    MBCHelper,
    DatalabelUtils,
    oo
) {
    var MAX_RADIUS_RATIO = 1 / 20;

    var PADDING = 2;
    var EXTRA_BORDER = 8;
    var MARGIN = 5;
    var DEFAULT_SIZE = 6;
    var ZERO_SIZE = 4;
    var DEFAULT_CLUSTER_SIZE = 13.5;

    var ICON_WIDTH = 14;
    var ICON_HEIGHT = 14;

    var SIZE = 'size';
    var COLOR = 'color';
    var LOCATION = 'location';

    /**
     * @constructor
     * @alias sap.viz.geo.dataviz.BubbleImpl
     * @augments sap.viz.geo.dataviz.LocationBasedVizImpl
     * @param {Object}
     *            bubble the viz object.
     * @ignore
     */
    var BubbleImpl = function(bubble) {
        LocationBasedVizImpl.call(this, bubble);
    };

    oo.extend(BubbleImpl, LocationBasedVizImpl);

    BubbleImpl.prototype._buildSingleDom = function(elements, eventTargetClassName) {
        var div = elements.append("div").attr("class", "bubble single");
        div.append("svg").append("circle").attr("class", eventTargetClassName + " mainShape");

        return this;
    };

    function equalVal(val1, val2) {
        if (val1 == null && val2 == null) {
            return true;
        }

        if (val1 == null || val2 == null) {
            return false;
        }

        return val1 === val2;
    }

    function bubbleSizeScale(vMax, range) {
        // even 0 value for bubble size, still render a small size shape
        return function(value) {
            if (NumberUtils.isNoValue(value)) {
                return ZERO_SIZE * 2;
            }
            var r = Math.pow(Math.abs(value) / vMax, 0.5) * range * MAX_RADIUS_RATIO;
            r = r > ZERO_SIZE ? r : ZERO_SIZE;
            return 2 * r;
        };
    }

    BubbleImpl.prototype._buildClusterDom = function(elements, eventTargetClassName) {
        var div = elements.append("div").attr("class", "bubble cluster");
        var svg = div.append("svg");
        svg.append("circle").attr("class", eventTargetClassName + " mainShape");
        svg.append("path").attr("class", eventTargetClassName + " extraBorder");

        return this;
    };

    function compareValue(a, b) {
        var valueA = a.isCluster ? getTotal(a.data) : a.dataHolder[SIZE];
        var valueB = b.isCluster ? getTotal(b.data) : b.dataHolder[SIZE];
        if (NumberUtils.isNoValue(valueA)) {
            valueA = 0;
        }
        if (NumberUtils.isNoValue(valueB)) {
            valueB = 0;
        }
        return Math.abs(valueB) - Math.abs(valueA);
    }

    function compareCount(a, b) {
        var valueA = a.isCluster ? a.data.length : 1;
        var valueB = b.isCluster ? b.data.length : 1;
        return valueB - valueA;
    }

    function getTotal(data) {
        var total = 0;
        for (var i = 0; i < data.length; i++) {
            var x = data[i].dataHolder[SIZE];
            if (NumberUtils.isNoValue(x)) {
                x = 0;
            }
            total += x;
        }
        return total;
    }

    function BubbleMBCHelper(meta, props) {
        BubbleMBCHelper.superclass.constructor.call(this, meta, COLOR, props);
    }
    oo.extend(BubbleMBCHelper, MBCHelper);
    BubbleMBCHelper.prototype._getColorPalette = function() {
        return this._vizProps.mbcColorPalette;
    };

    BubbleImpl.prototype._prepareData = function(data, toPixel, mapSize) {
        this._sizeScale = null;
        this._colorData = null;
        this._mapSize = mapSize;

        var metaFeedingMapping = this._metaFeedingMapping;
        if (metaFeedingMapping[SIZE]) {
            generateSizeScale.apply(this, [
                data
            ]);
        }

        var mbcHelper = this._mbcHelper = null;
        var colorMeta = metaFeedingMapping[COLOR];
        if (colorMeta) {
            var colorMetaType = metaFeedingMapping[COLOR].semanticType;
            if (colorMetaType === "Dimension") {
                generateDimensionColorScale.apply(this, [
                    data
                ]);
            } else if (colorMetaType === "Measure") {
                mbcHelper = this._mbcHelper = new BubbleMBCHelper(colorMeta, this._viz.properties());
                mbcHelper.setData(data);
            }
        }
        var resData = LocationBasedVizImpl.prototype._prepareData.apply(this, arguments);

        if (resData.length > 0) {
            var colorPalette = this._viz.properties().colorPalette;

            var colorScale;
            if (metaFeedingMapping[COLOR]) {
                if (metaFeedingMapping[COLOR].semanticType === "Dimension") {
                    colorScale = {
                        scale : {
                            scale : function(d) {
                                return colorPalette[this._distinctValues.indexOf(d === undefined ? null : d) %
                                    colorPalette.length];
                            }.bind(this)
                        },
                        feedId : COLOR
                    };
                } else {
                    if (mbcHelper) {
                        colorScale = {
                            scale : mbcHelper.getScale(),
                            feedId : COLOR
                        };
                    }
                }
            } else {
                colorScale = colorPalette[0];
            }

            VizUtils.getDataShapeColor(resData, colorScale, function(d) {
                return d.isCluster ? d.data[0] : d;
            });
        }

        if (metaFeedingMapping[SIZE]) {
            resData.sort(compareValue);
        } else if (this._hasCluster) {
            resData.sort(compareCount);
        }
        return resData;
    };

    BubbleImpl.prototype._prepareClusterData = function(clusterData, mapSize) {
        if (this._metaFeedingMapping[SIZE]) {
            var maxLimit = this._wMax * 9;
            clusterData.forEach(function(d) {
                var total = 0;
                for (var i = 0, len = d.data.length; i < len; i++) {
                    var x = d.data[i].dataHolder[SIZE];
                    if (NumberUtils.isNoValue(x)) {
                        continue;
                    }
                    total += x;
                }
                if (total > maxLimit) {
                    d.r = this._sizeScale(maxLimit) / 2;
                } else {
                    d.r = this._sizeScale(total) / 2;
                }
                d[SIZE] = total;
            }.bind(this));
        } else {
            clusterData.forEach(function(d) {
                d.r = DEFAULT_CLUSTER_SIZE;
            });
        }

        return clusterData;
    };

    BubbleImpl.prototype._prepareSingleData = function(data, mapSize) {
        var metaFeedingMapping = this._metaFeedingMapping;
        if (metaFeedingMapping[SIZE]) {
            data.forEach(function(d) {
                d.r = this._sizeScale(d.dataHolder[SIZE]) / 2;
            }.bind(this));
        } else {
            data.forEach(function(d) {
                d.r = DEFAULT_SIZE;
            });
        }

        return data;
    };

    function generateDimensionColorScale(data) {
        var inputValues = [];
        data.forEach(function(d) {
            inputValues.push(d.dataHolder[COLOR]);
        });
        this._distinctValues = getDistinctValues(inputValues);
        this._colorData = this._distinctValues.map(function(value) {
            return {
                val : (value == null ? "No value" : value + ""),
                originalVal : value
            };
        });
    }

    function generateSizeScale(orginalData) {
        var range = d3.min(this._mapSize);
        this._calculateSizeData(orginalData);
        var sizeScale = bubbleSizeScale(this._wMax, range);
        this._sizeScale = sizeScale;
    }

    function getDistinctValues(data) {
        var distinctValues = {};
        var resData = [];
        data.forEach(function(d) {

            if (d === undefined) {
                d = null;
            }
            if (!distinctValues[d]) {
                distinctValues[d] = true;
                resData.push(d);
            }
        });
        return resData;
    }

    BubbleImpl.prototype._calculateSizeData = function(data) {
        var distinctValuesObj = {};
        var i;
        this._wMax = null;
        this._wMin = null;
        for (i = 0; i < data.length; i++) {
            var x = data[i].dataHolder[SIZE];
            if (NumberUtils.isNoValue(x)) {
                continue;
            }
            var w = Math.abs(x);
            distinctValuesObj[w] = w;
            this._wMax = (this._wMax === null || w > this._wMax) ? w : this._wMax;
            this._wMin = (this._wMin === null || w < this._wMin) ? w : this._wMin;
        }

        var wDistinctValues = 0;
        for (i in distinctValuesObj) {
            if (distinctValuesObj.hasOwnProperty(i)) {
                wDistinctValues++;
            }
        }
        if (wDistinctValues === 0) {
            this._sizeData = [];
        } else if (wDistinctValues === 1) {
            this._sizeData = [
                this._wMax
            ];
        } else if (wDistinctValues === 2) {
            this._sizeData = [
                this._wMax, this._wMin
            ];
        } else {
            this._sizeData = [
                this._wMax, (this._wMax + this._wMin) / 2, this._wMin
            ];
        }
    };
    
    BubbleImpl.prototype._update = function(elements, toPixel, effectManager) {
        LocationBasedVizImpl.prototype._update.apply(this, arguments);
        this._viz._setElementsDefaultStyle(elements, effectManager);
    };

    BubbleImpl.prototype._updateSingle = function(elements, effectManager) {
        elements.select("svg").attr("width", function(d) {
            return (d.r + PADDING) * 2;
        }).attr("height", function(d) {
            return (d.r + PADDING) * 2;
        }).select("circle").attr("cx", function(d) {
            return d.r + PADDING;
        }).attr("cy", function(d) {
            return d.r + PADDING;
        }).attr("r", function(d) {
            return d.r;
        });

        var that = this;
        var props = that._viz.properties();
        var feedings = that._metaFeedingMapping;
        elements.each(function(d) {
            var locationLabel = that._getLocaltionLabel(d, feedings);
            DatalabelUtils.updateDataLabel(props, feedings, locationLabel, d, this);
        });
        return this;
    };

    BubbleImpl.prototype._updateCluster = function(elements, effectManager) {
        var that = this;
        var svg = elements.select("svg").attr("width", function(d) {
            return (d.r + PADDING + EXTRA_BORDER) * 2;
        }).attr("height", function(d) {
            return (d.r + PADDING + EXTRA_BORDER) * 2;
        });

        elements.select("circle").attr("cx", function(d) {
            return d.r + PADDING + EXTRA_BORDER;
        }).attr("cy", function(d) {
            return d.r + PADDING + EXTRA_BORDER;
        }).attr("r", function(d) {
            return d.r;
        });
        
        var arc = d3.svg.arc();
        arc.innerRadius(function(d) {
            return d.r;
        });
        arc.outerRadius(function(d) {
            return d.r + EXTRA_BORDER;
        });
        arc.startAngle(0);
        arc.endAngle(360);
        elements.select("path").attr("d", arc).attr("transform", function(d) {
            return "translate(" + (d.r + PADDING + EXTRA_BORDER) + "," + (d.r + PADDING + EXTRA_BORDER) + ")";
        });
        var props = that._viz.properties();
        var feedings = that._metaFeedingMapping;
        elements.each(function(d) {

            var locationLabel = that._getClusterLocationLabel(d, feedings);
            DatalabelUtils.updateDataLabel(props, feedings, locationLabel, d, this, true);
        });
        return this;
    };

    BubbleImpl.prototype._generateLabelsRect = function(selections) {
        var dataLabelProps = this._viz.properties().dataLabel;
        var sizeFeed = this._metaFeedingMapping.size;
        return DatalabelUtils.generateLabelsRect(selections, dataLabelProps, sizeFeed);
    };

    BubbleImpl.prototype._clusterData = function(data, props) {
        var resData = [];
        this._hasCluster = false;
        if (props.enabled) {
            if (this._metaFeedingMapping[COLOR]) {
                if (this._metaFeedingMapping[COLOR].semanticType === "Measure") {
                    return data;
                } else {
                    var inputValues = [];
                    data.forEach(function(d) {
                        inputValues.push(d.dataHolder[COLOR]);
                    });
                    var distinctValues = getDistinctValues(inputValues);
                    for (var i = 0; i < distinctValues.length; i++) {
                        var part = data.filter(function(d) {
                            return equalVal(d.dataHolder[COLOR], distinctValues[i]);
                        });
                        part = LocationBasedVizImpl.prototype._clusterData.apply(this, [
                            part, props
                        ]);
                        resData = resData.concat(part);
                    }
                    this._hasCluster = hasClusterData(resData);
                    return resData;
                }
            }
        }
        resData = LocationBasedVizImpl.prototype._clusterData.apply(this, arguments);
        this._hasCluster = hasClusterData(resData);
        return resData;
    };

    function hasClusterData(data) {
        for (var i = 0; i < data.length; i++) {
            if (data[i].isCluster) {
                return true;
            }
        }
        return false;
    }

    BubbleImpl.prototype._getLeftTop = function(d) {
        var p = d.centroPoint;
        var topLeft;
        if (d.isCluster) {
            topLeft = [
                p[0] - (d.r + PADDING + EXTRA_BORDER), p[1] - (d.r + PADDING + EXTRA_BORDER)
            ];
        } else {
            topLeft = [
                p[0] - (d.r + PADDING), p[1] - (d.r + PADDING)
            ];
        }
        delete d.r;
        return topLeft;
    };

    BubbleImpl.prototype._getTooltipContent = function(data, metaFeedingMapping) {
        var result = LocationBasedVizImpl.prototype._getTooltipContent.apply(this, arguments);
        var measure = result.measure, dimension = result.dimension;
        var labelFormat = this._viz.properties().labelFormat;
        var measureName, measureValue, dimName, dimValue;
        if (data.isCluster) {
            if (metaFeedingMapping[SIZE]) {
                measureName = metaFeedingMapping[SIZE].name;
                measureValue = data[SIZE];
                measure.push({
                    id : metaFeedingMapping[SIZE].id,
                    name : measureName,
                    value : measureValue,
                    type : "Measure"
                });
            }
            if (metaFeedingMapping[COLOR]) {
                dimName = metaFeedingMapping[COLOR].name;
                dimValue = data.data[0].dataHolder[COLOR];
                dimension.push({
                    name : dimName,
                    value : dimValue,
                    type : "Dimension"
                });
            }
        } else {
            if (metaFeedingMapping[SIZE]) {
                measureName = metaFeedingMapping[SIZE].name;
                measureValue = data.dataHolder[SIZE];
                measure.push({
                    id : metaFeedingMapping[SIZE].id,
                    name : measureName,
                    value : measureValue,
                    type : "Measure"
                });
            }
            var colorMeta = metaFeedingMapping[COLOR];
            if (colorMeta) {
                dimName = colorMeta.name;
                dimValue = data.dataHolder[COLOR];
                var isMeasure = colorMeta.semanticType === "Measure";
                (isMeasure ? measure : dimension).push({
                    name : dimName,
                    value : dimValue,
                    type : isMeasure ? "Measure" : "Dimension",
                    id : metaFeedingMapping[COLOR].id
                });
            }
        }

        return result;
    };

    /**
     * @ignore
     * @param data
     *            data to
     * @param legend
     *            the legend to update. if not exist, we will create a new
     *            MbcLegend
     * @returns legend
     */
    BubbleImpl.prototype._generateLegend = function(data, legend, effectManager) {
        var metaFeedingMapping = this._metaFeedingMapping;
        var subLegends = [];
        var result = null;
        var clusterLegend = null;
        if (this._sizeScale && this._sizeData.length > 0) {
            var sizeLegend = new SizeLegend(ObjectUtils.extendByRepalceArray(true, {
                titleText : metaFeedingMapping[SIZE].name,
                color : this._mbcHelper ? this._viz.properties().endColor : this._props.colorPalette[0]
            }, this._props.sizeLegend), effectManager);
            sizeLegend.setLegendInfo({
                scale : this._sizeScale,
                labels : this._sizeData
            });
            subLegends.push(sizeLegend);
        }

        if (this._hasCluster) {
            clusterLegend = new ImageLegend(ObjectUtils.extendByRepalceArray(true, {
                titleText : metaFeedingMapping[LOCATION].name
            }, this._props.clusterLegend), effectManager);
            var color = this._props.colorPalette[0];
            clusterLegend.setLegendInfo([
                {
                    render : function(g) {
                        g.append("circle").attr("cx", 6).attr("cy", 6).attr("r", 6).attr("fill-opacity", 0.25).attr(
                            "fill", color);
                        g.append("circle").attr("cx", 6).attr("cy", 6).attr("r", 4).attr("fill", "#fff");
                        g.append("circle").attr("cx", 6).attr("cy", 6).attr("r", 3).attr("fill", color);
                    },
                    text : langManager.get('IDS_GEOCLUSTER')
                },
                {
                    render : function(g) {
                        g.append("circle").attr("cx", 6).attr("cy", 6).attr("r", 6).attr("fill", color);
                    },
                    text : langManager.get('IDS_GEOLOCATION')
                }
            ]);
            subLegends.push(clusterLegend);
        }

        if (this._colorData) {
            var colorLegend = new ColorLegend(ObjectUtils.extendByRepalceArray(true, {
                titleText : metaFeedingMapping[COLOR].name
            }, this._props.colorLegend, {
                marker : {
                    shape : "circle"
                }
            }), effectManager);

            colorLegend.setLegendInfo({
                metaData : this._metaFeedingMapping[COLOR],
                data : this._colorData,
                color : this._viz.properties().colorPalette
            });
            subLegends.push(colorLegend);
        }

        var mbcHelper = this._mbcHelper;
        if (mbcHelper) {
            subLegends.push(mbcHelper.createOrUpdateLgend(effectManager));
        }

        result = legend ? legend.recreate(subLegends) : new ComposedLegend(subLegends);

        return result;
    };

    BubbleImpl.prototype._applyPadding = function(bounds) {
        var projection = d3.geo.mercator();
        var min = projection(bounds.min());
        var max = projection(bounds.max());
        var distance = [];
        for (var i = 0; i < min.length; i++) {
            distance[i] = Math.abs(min[i] - max[i]);
            min[i] = min[i] > max[i] ? min[i] + distance[i] / (1 / MAX_RADIUS_RATIO - 2) : min[i] - distance[i] /
                (1 / MAX_RADIUS_RATIO - 2);
            max[i] = max[i] > min[i] ? max[i] + distance[i] / (1 / MAX_RADIUS_RATIO - 2) : max[i] - distance[i] /
                (1 / MAX_RADIUS_RATIO - 2);
        }
        bounds.min(projection.invert(min));
        bounds.max(projection.invert(max));
        return bounds;
    };
    return BubbleImpl;
});

define('sap/viz/geo/dataviz/LocationBasedViz',[
    "sap/viz/geo/dataviz/AbstractViz", "sap/viz/framework/common/util/ObjectUtils"
], function(AbstractViz, ObjectUtils) {
    /**
     * Create a new location based Viz visualization object.
     * 
     * @constructor
     * @alias sap.viz.geo.dataviz.LocationBasedViz
     * @augments sap.viz.geo.dataviz.AbstractViz
     * @param {Object}
     *            [options] the configuration object. For example,
     * @param {Object}
     *            [options.cluster] the configuration object for cluster.
     * @param {Boolean}
     *            [options.cluster.enabled] whether enable clustering
     * @param {String}
     *            [options.cluster.url] the URL of image
     * @param {Number}
     *            [options.cluster.xmargin] the distance between image border
     *            and label in horizontal
     * @param {Number}
     *            [options.cluster.ymargin] the distance between image border
     *            and label in vertical
     * @param {Number}
     *            [cluster.distance.maxDistance] the max distance(num of
     *            pixels), 80 by default. The actual distance value will between
     *            the max and min.
     * @param {Number}
     *            [cluster.distance.minDistance] the min distance(num of
     *            pixels), 20 by default.
     * @ignore
     */
    var LocationBasedViz = function(options, feedDef, implConstructor, id, defaultOptions) {
        AbstractViz.call(this, options, feedDef, implConstructor, id, ObjectUtils.extendByRepalceArray(true, {
            cluster : {
                enabled : false,
                xmargin : 15,
                ymargin : 15,
                distance : {
                    minDistance : 20,
                    maxDistance : 80
                },
                minPts : 3,
                format : null
            }
        }, defaultOptions));
    };

    LocationBasedViz.prototype = Object.create(AbstractViz.prototype);
    LocationBasedViz.prototype.constructor = LocationBasedViz;

    LocationBasedViz.prototype._isCluster = function(d) {
        return d.isCluster;
    };

    LocationBasedViz.prototype._isNonCluster = function(d) {
        return !d.isCluster;
    };

    return LocationBasedViz;
});

define('sap/viz/geo/dataviz/SVGViz',[
    "sap/viz/geo/dataviz/ColorUtils", "sap/viz/geo/dataviz/SelectionModel"
], function(ColorUtils, SelectionModel) {
    var SELECTION_STATUS_DESELECTED = SelectionModel.ELEMENT_STATUS.DESELECTED;
    var SELECTION_STATUS_SELECTED = SelectionModel.ELEMENT_STATUS.SELECTED;
    var SELECTION_STATUS_DEFAULT = SelectionModel.ELEMENT_STATUS.DEFAULT;

    function createMainShapeFillEffectParams() {
        return {
            drawingEffect : this._props.drawingEffect
        };
    }

    function setElementsStyle(selection, effectManager, colorFn) {
        var effectParams = this._createMainShapeFillEffectParams();
        var fn = this._setElementStyle.bind(this);
        selection.each(function(d) {
            fn(this, effectManager, colorFn(this, d, effectManager), effectParams);
        });
        return this;
    }

    function setElementStyle(node, effectManager, color, effectParams) {
        node.querySelector(".mainShape").setAttribute("fill",
            ColorUtils.getEffectedFill(color, effectManager, effectParams));
    }

    function setElementsDefaultStyle(selection, effectManager) {
        return setElementsStyle.call(this, selection, effectManager, getFillColor.bind(this, false,
            SELECTION_STATUS_DEFAULT, null));
    }

    function getFillColor(hoverStatus, selectionStatus, selectionModel, node, datum, effectManager) {
        var colorProp, props = this._props;
        if (hoverStatus) {
            colorProp = props.hover.color;
        } else {
            if (selectionStatus == null) {
                selectionStatus = selectionModel._getSelectionStatus(node);
            }

            if (selectionStatus === SELECTION_STATUS_DESELECTED) {
                colorProp = props.deselected.color;
            } else if (selectionStatus === SELECTION_STATUS_SELECTED) {
                colorProp = props.selected.color;
            }
        }

        var color = datum.color;
        if (colorProp) {
            color = ColorUtils.evalColor(color, colorProp, effectManager);
        }

        return color;
    }

    function setStyleByInteraction(node, effectManager, hoverStatus, selectionStatus, selectionModel) {
        return setElementsStyle.call(this, d3.select(node), effectManager, getFillColor.bind(this, hoverStatus,
            selectionStatus, selectionModel));
    }

    function onHover(node, hover, effectManager, selectionModel) {
        return setStyleByInteraction.call(this, node, effectManager, hover, undefined, selectionModel);
    }

    function onSelectionChanged(node, selectionStatus, effectManager) {
        return setStyleByInteraction.call(this, node, effectManager, undefined, selectionStatus, null);
    }

    return {
        addDefaultOptions : function(options) {
            options.hover = {
                color : null
            };
            options.deselected = {
                color : null
            };
            options.selected = {
                color : null
            };
            return options;
        },
        mixin : function(o) {
            o._createMainShapeFillEffectParams = createMainShapeFillEffectParams;
            o._setElementStyle = setElementStyle;
            o._setElementsDefaultStyle = setElementsDefaultStyle;
            o._onHover = onHover;
            o._onSelectionChanged = onSelectionChanged;
            return o;
        }
    };
});
define('sap/viz/geo/dataviz/Bubble',[
    "sap/viz/geo/dataviz/BubbleImpl",
    "sap/viz/geo/dataviz/LocationBasedViz",
    'sap/viz/geo/dataviz/Constants',
    "sap/viz/geo/dataviz/SVGViz",
    'sap/viz/geo/dataviz/ColorUtils',
    "exports"
], function(
    BubbleImpl,
    LocationBasedViz,
    Constants,
    SVGViz,
    ColorUtils
) {
    /**
     * Create a new bubble visualization object. It will show bubbles at geo
     * locations specified by data and the sizes of bubbles depend on values in
     * data.
     * 
     * <p>
     * Feeding Information:
     * 
     * <pre>
     * {
     *     location : FieldId1,
     *     size : FieldId2,
     *     color : FieldId3
     * }
     * </pre>
     * 
     * </p>
     * 
     * @example <caption>add a new bubble layer</caption>
     * 
     * <pre>
     * ... //get map using viz api
     * 
     * var data = {
     *    &quot;metadata&quot; : {
     *      &quot;fields&quot; : [{
     *        &quot;id&quot; : &quot;Location&quot;,
     *        &quot;name&quot; : &quot;City&quot;,
     *        &quot;semanticType&quot; : &quot;Dimension&quot;, 
     *        &quot;dataType&quot; : &quot;String&quot;
     *      }, {
     *        &quot;id&quot; : &quot;Measure&quot;,
     *        &quot;name&quot; : &quot;Sales&quot;,
     *        &quot;semanticType&quot; : &quot;Measure&quot;
     *      }]
     *    },
     *    &quot;data&quot; : [[&quot;Los Angeles&quot;, 30.12], [&quot;Long Beach&quot;, 50.0],
     *            [&quot;Washington&quot;, 40.32]]
     *  };
     * var feeding = {location: 'Location', size: 'Measure'};
     * var viz = new sap.viz.geo.dataviz.Bubble({
     *   cluster: {enabled : true, distance : 80}
     * });
     * var ds = new sap.viz.api.data.FlatTableDataset(data);
     * var layer = new sap.viz.geo.dataviz.Layer({
     *   viz : viz,
     *   data : ds,
     *   feeding: feeding
     * });
     * 
     * ... //add lay into map
     * </pre>
     * 
     * @constructor
     * @alias sap.viz.geo.dataviz.Bubble
     * @augments sap.viz.geo.dataviz.LocationBasedViz
     * @param {Object}
     *            [options] the configuration object.
     * @param {Object}
     *            [options.cluster] the configuration object for cluster.
     * @param {Boolean}
     *            [options.cluster.enabled] whether enable clustering, false by
     *            default.
     * @param {Number}
     *            [options.cluster.distance.maxDistance] the max distance(num of
     *            pixels), 120 by default. The actual distance value will
     *            between the max and min.
     * @param {Number}
     *            [options.cluster.distance.minDistance] the min distance(num of
     *            pixels), 50 by default.
     * @param [options.colorPalette]
     *            the array of colors
     * @param [options.mbcColorPalette]
     *            the array of colors when a measure is fed as color
     * @param {Object}
     *            [options.sizeLegend] the settings of size legend
     * @param {String}
     *            [options.sizeLegend.formatString] Set the format pattern to be
     *            applied for numbers in size legend
     * @param {String}
     *            [options.sizeLegend.unitFormatType] Set the type of format pattern to be
     *            applied for numbers in the size legend
     * @param {Object}
     *            [options.mbcLegend] Set the MBC(MeasureValue-Based-Color)
     *            legend configuration.
     * @param {String}
     *            [options.mbcLegend.formatString] Set the format pattern to be
     *            applied for numbers in the MBC legend
     * @param {String}
     *            [options.mbcLegend.unitFormatType] Set the type of format pattern to be
     *            applied for numbers in the MBC legend
     * @param {Object}
     *            [options.dataLabel] the configuration object for data label.
     * @param {Boolean}
     *            [options.dataLabel.visible] whether enable data labels, false
     *            by default.
     * @param {Boolean}
     *            [options.dataLabel.showColorValue] whether color value show in
     *            data label, false by default. It take effect only when visible
     *            is true.
     * @param {Boolean}
     *            [options.dataLabel.showLocationName] whether geo location name
     *            show in data label, true by default. It take effect only when
     *            visible is true.
     * @param {Boolean}
     *            [options.dataLabel.showSizeValue] whether size value show in
     *            data label, true by default. It take effect only when visible
     *            is true.
     * @param {String|Object}
     *            [options.dataLabel.format] a string to indicate the format
     *            pattern of numbers in data label. It can be also an object
     *            keys of which are ids of measures to specify the patterns
     *            separately.
     * @param {String|Object}
     *            [options.dataLabel.unitFormatType] a string to indicate the 
     *            type of format pattern of numbers in data label. It can be also an object
     *            keys of which are ids of measures to specify the patterns separately.
     * @param {Object}
     *            [options.hover]           
     * @param {string}
     *            [options.hover.color=null] Set hovered data point color
     *            effect. Four operation functions will be supported. -
     *            darken/lighten/desaturate/greyscale
     * @param {Object}
     *            [options.selected]
     * @param {string}
     *            [options.selected.color=null] Set selected data point color
     *            effect. Four operation functions will be supported. -
     *            darken/lighten/desaturate/greyscale
     * @param {Object}
     *            [options.deselected]
     * @param {string}
     *            [options.deselected.color=null] Set deselected data point
     *            color effect. Four operation functions will be supported. -
     *            darken/lighten/desaturate/greyscale
     */
    var defaultOptions = SVGViz.addDefaultOptions({
        startColor : '#fac99e',
        endColor : '#703C10',
        nullColor : 'rgb(204,204,204)',
        colorPalette : Constants.COLOR_PALETTE,
        mbcColorPalette : Constants.MBC_COLOR_PALETTE,
        numOfSegments : 5,
        isShowDataLabel : false,
        cluster : {
            enabled : false,
            distance : {
                minDistance : 50,
                maxDistance : 120
            },
            minPts : 2
        },
        sizeLegend : {
            unitFormatType : "FinancialUnits",
            formatString : null
        },
        mbcLegend : {
            unitFormatType : "FinancialUnits",
            formatString : null
        },
        clusterLegend : {
        },
        colorLegend : {  
        },
        dataLabel : {
            visible : false,
            showColorValue : false,
            showLocationName : true,
            showSizeValue : true,
            format : null,
            unitFormatType : "FinancialUnits",
            style : {
                color : "",
                fontFamily : "Open Sans, Arial, Helvetica, sans-serif",
                fontSize : "12px",
                fontWeight : "normal",
                fontStyle : "normal"
            }
        }
    });

    var feedDef = [
        {
            id : 'location',
            required : true
        }, {
            id : 'size',
            required : false
        }, {
            id : 'color',
            required : false
        }
    ];

    var Bubble = function(options) {
        LocationBasedViz.call(this, options, feedDef, BubbleImpl, "sap.viz.geo.dataviz.Bubble", defaultOptions);
    };

    Bubble.prototype = SVGViz.mixin(Object.create(LocationBasedViz.prototype));
    Bubble.prototype.constructor = Bubble;
    
    var oriCreateMainShapeFillEffectParams = Bubble.prototype._createMainShapeFillEffectParams;
    Bubble.prototype._createMainShapeFillEffectParams = function() {
        var params = oriCreateMainShapeFillEffectParams.call(this);
        params.graphType = "circle";
        return params;
    };
    
    var setElementStyle = Bubble.prototype._setElementStyle;
    Bubble.prototype._setElementStyle = function(node, effectManager, color, effectParams) {
        setElementStyle.apply(this, arguments);
        var border = node.querySelector(".extraBorder");
        if (border) {
            border.setAttribute("fill", ColorUtils.getEffectedFill(color, effectManager));
        }
    };

    return Bubble;
});

define('sap/viz/geo/dataviz/PieImpl',[
    "sap/viz/geo/dataviz/AbstractVizImpl",
    "sap/viz/geo/dataviz/LocationBasedVizImpl",
    "sap/viz/geo/Bounds",
    'sap/viz/framework/common/util/ObjectUtils',
    'sap/viz/geo/dataviz/VizUtils',
    'sap/viz/geo/legend/SizeLegend',
    'sap/viz/geo/legend/ColorLegend',
    'sap/viz/framework/common/util/NumberUtils',
    "sap/viz/framework/common/lang/LangManager",
    'sap/viz/geo/legend/ComposedLegend',
    "sap/viz/framework/common/util/TypeUtils",
    'sap/viz/geo/dataviz/DatalabelUtils'
], function(
    AbstractVizImpl,
    LocationBasedVizImpl,
    Bounds,
    ObjectUtils,
    VizUtils,
    SizeLegend,
    ColorLegend,
    NumberUtils,
    langManager,
    ComposedLegend,
    TypeUtils,
    DatalabelUtils
) {
        var MAX_RADIUS_RATIO = 1 / 20;
        var PADDING = 2;
        var ZERO_SIZE = 4;
        var LOCATION = 'location';
        var COLOR = 'color';
        var VALUE = 'size';

        /**
         * @constructor
         * @alias sap.viz.geo.dataviz.PieImpl
         * @augments sap.viz.geo.dataviz.LocationBasedVizImpl
         * @param {Object}
         *            Pie the viz object.
         * @ignore
         */
        var PieImpl = function(pie) {
            LocationBasedVizImpl.call(this, pie);
        };

        PieImpl.prototype = Object.create(LocationBasedVizImpl.prototype);
        PieImpl.prototype.constructor = PieImpl;

        PieImpl.prototype._buildDom = function(elements, eventTargetClassName) {
            elements.append("svg").attr("class", "pie sector").append("path")
                .attr("class", eventTargetClassName + " mainShape");
            var style = this._viz.properties().dataLabel.style;
            return this;   
        };

        // generate size, location,and pie data to PieImpl object
        PieImpl.prototype._prepareData = function(data, toPixel, mapSize) {
            var metaFeedingMapping, resData;
            this._sizeScale = null;
            this._colorData = null;
            this._mapSize = mapSize;
            metaFeedingMapping = this._metaFeedingMapping;

            if (metaFeedingMapping[LOCATION]) {
                resData = generatePieDataByLocation(data);
            }
            if (metaFeedingMapping[COLOR]) {
                generateDimensionColorScale.call(this, data);
                var colorPalette = this._viz.properties().colorPalette;
                resData.forEach(function(d) {
                    d.color = colorPalette[this._distinctColorValues.indexOf(d.dataHolder[COLOR] === undefined ? null
                        : d.dataHolder[COLOR]) %
                        colorPalette.length];
                }.bind(this));
            }
            if (metaFeedingMapping[VALUE]) {
                generateSizeScale.call(this, resData);
                resData.forEach(function(d) {
                    d.r = this._sizeScale(d.size) / 2;
                }.bind(this));
            }
            var resultData = LocationBasedVizImpl.prototype._prepareData.call(this, resData, toPixel);
            return resultData;
        };

        PieImpl.prototype._update = function(elements, toPixel, effectManager) {
            var that = this;
            elements.select("svg").attr("width", function(d) {
                return (d.r + PADDING) * 2;
            }).attr("height", function(d) {
                return (d.r + PADDING) * 2;
            }).select("path").attr("transform", function(d) {
                var p = d.r + PADDING;
                return "translate(" + p + "," + p + ")";
            }).attr(
                "d",
                d3.svg.arc().outerRadius(function(d) {
                    return d.r;
                }).innerRadius(
                    function(d) {
                        return that._viz.properties().donut && that._viz.properties().donut.isDonut ? d.r *
                            that._viz.properties().donut.innerRadiusRatio : null;
                    }));
            
            this._viz._setElementsDefaultStyle(elements, effectManager);
            
            elements.each(function (d) {
                var props = that._viz.properties();
                var feedings = that._metaFeedingMapping;
                var locationLabel = that._getLocaltionLabel(d, feedings);
                DatalabelUtils.updateDataLabel(props,feedings,locationLabel, d, this);
            });
            return this;
        };
        PieImpl.prototype._generateLabelsRect = function(selections) {
            var dataLabelProps = this._viz.properties().dataLabel;
            var sizeFeed = this._metaFeedingMapping.size;
            return DatalabelUtils.generateLabelsRect(selections, dataLabelProps, sizeFeed);
        };

        // calculate original data to the target data that d3.arc can use to
        // draw a pie.
        function generatePieDataByLocation( data ) {    
            var i, j, m, n, k, inputLocations = [], pieData = [], arcData = [], resData = [];
        
            var tempData=[].concat(data);      
            for (j = 0; j < tempData.length; j++) {
                var dataLocation = tempData[j].feature.properties.name;
                var pieNum = inputLocations.indexOf(dataLocation);
                if (pieNum === -1) {
                    inputLocations.push(dataLocation);
                    pieNum=inputLocations.indexOf(dataLocation);
                    pieData[pieNum] = { location:'', pData:[], size:0, distinctCategories:[]};
                    pieData[pieNum].location = dataLocation[pieNum];
                    pieData[pieNum].pData.push(tempData[j]);
                    pieData[pieNum].distinctCategories.push(tempData[j].dataHolder[COLOR]);
                } else {          
                    var dIndex = pieData[pieNum].distinctCategories.indexOf(tempData[j].dataHolder[COLOR]);          
                    if (dIndex === -1) {
                        pieData[pieNum].pData.push(tempData[j]);            
                        pieData[pieNum].distinctCategories.push(tempData[j].dataHolder[COLOR]);
                    } else {           
                        pieData[pieNum].pData[dIndex] = tempData[j];           
                    }
                }          
                tempData.splice(j,1);
                j--;
            }
            for (i=0; i<pieData.length;i++) {
                //handle negative data,if not all value negative in this pie,just skip those negative 
                //value.if all value negative,handle them as positive value.
                var pie, categoryValue, posData=[];
                pieData[i].maxValue = 0;
                pieData[i].minValue = 0;
                for (k=0;k<pieData[i].pData.length;k++) {
                    categoryValue = pieData[i].pData[k].dataHolder[VALUE];        
                    if (categoryValue === null) {
                        categoryValue = 0;  
                    }
                    if (categoryValue > pieData[i].maxValue) {
                        pieData[i].maxValue = categoryValue;
                    } else if (categoryValue < pieData[i].minValue) {
                        pieData[i].minValue = categoryValue;
                    } 
                    if (categoryValue>0) {
                        pieData[i].size += categoryValue;
                        posData.push(pieData[i].pData[k]);
                    }        
                }
  
                if (posData.length === 0 && pieData[i].minValue !== 0) {
                    for (m=0;m<pieData[i].pData.length;m++) {
                        pieData[i].pData[m].originalValue = pieData[i].pData[m].dataHolder[VALUE];
                        pieData[i].pData[m].dataHolder[VALUE] = Math.abs(pieData[i].pData[m].dataHolder[VALUE]);
                        pieData[i].size += pieData[i].pData[m].dataHolder[VALUE];
                    }
                } else {        
                    pieData[i].pData=[].concat(posData);
                }
      
                //generate pie arc data
                pie = d3.layout.pie().sort(null).value(function( d ) {
                                                            return d.dataHolder[VALUE];
                                                        });
                arcData[i] = pie(pieData[i].pData); 
                for (n=0; n<pieData[i].pData.length; n++) {
                    pieData[i].pData[n].startAngle=arcData[i][n].startAngle;
                    pieData[i].pData[n].endAngle=arcData[i][n].endAngle;
                    pieData[i].pData[n].size=pieData[i].size;
                    if (pieData[i].size === 0){   
                        pieData[i].pData[n].percent = "N/A" ;
                    } else {
                        pieData[i].pData[n].percent = (
                            (pieData[i].pData[n].dataHolder[VALUE]/pieData[i].size)*100
                        ).toFixed(2) + "%"; 
                    }               
                }
                pieData[i].pData.sort(function (a,b) { return a.dataHolder[VALUE] - b.dataHolder[VALUE]; });
                for (k=0;k<pieData[i].pData.length;k++) {
                    if (k === pieData[i].pData.length - 1) {
                        pieData[i].pData[k].isMaxValue = true;
                    } else {
                        pieData[i].pData[k].isMaxValue = false;
                    }
                } 
   
            }
            //sort the pie by size,make the smaller one shown prior above the bigger one
            pieData.sort(function (a,b) { return b.size - a.size; });
            for(i=0; i<pieData.length;i++){
                resData=resData.concat(pieData[i].pData);                    
            }
            return resData;    
        }

        function generateSizeScale(data) {
            var range = d3.min(this._mapSize);
            this._calculateSizeData(data);
            var sizeScale = bubbleSizeScale(this._wMax, range);
            this._sizeScale = sizeScale;
        }

        // even 0 value for bubble size, still render a small size shape
        function bubbleSizeScale(vMax, range) {
            return function(value) {
                if (NumberUtils.isNoValue(value)) {
                    return ZERO_SIZE * 2;
                }
                var r = Math.pow(Math.abs(value) / vMax, 0.5) * range * MAX_RADIUS_RATIO;
                r = r > ZERO_SIZE ? r : ZERO_SIZE;
                return 2 * r;
            };
        }

        function generateDimensionColorScale(data) {
            var inputValues = [];

            data.forEach(function(d) {
                inputValues.push(d.dataHolder[COLOR]);
            });
            this._distinctColorValues = getDistinctValues(inputValues);
            this._colorData = this._distinctColorValues.map(function(value) {
                return {
                    val : (value === null ? "No value" : value + ""),
                    originalVal : value
                };
            });
        }

        // get distinct values in the data and make them a array.
        function getDistinctValues(data) {
            var distinctValues = {}, resData = [];

            data.forEach(function(d) {

                if (d === undefined) {
                    d = null;
                }
                if (!distinctValues[d]) {
                    distinctValues[d] = true;
                    resData.push(d);
                }
            });
            return resData;
        }

        PieImpl.prototype._calculateSizeData = function(data) {
            var i, w, x, distinctValuesObj = {}, wDistinctValues = 0;

            this._wMax = null;
            this._wMin = null;

            for (i = 0; i < data.length; i++) {
                x = data[i].size;
                if (NumberUtils.isNoValue(x)) {
                    continue;
                }
                w = Math.abs(x);
                distinctValuesObj[w] = w;
                this._wMax = (this._wMax === null || w > this._wMax) ? w : this._wMax;
                this._wMin = (this._wMin === null || w < this._wMin) ? w : this._wMin;
            }

            for (i in distinctValuesObj) {
                if (distinctValuesObj.hasOwnProperty(i)) {
                    wDistinctValues++;
                }
            }
            if (wDistinctValues === 0) {
                this._sizeData = [];
            } else if (wDistinctValues === 1) {
                this._sizeData = [
                    this._wMax
                ];
            } else if (wDistinctValues === 2) {
                this._sizeData = [
                    this._wMax, this._wMin
                ];
            } else {
                this._sizeData = [
                    this._wMax, (this._wMax + this._wMin) / 2, this._wMin
                ];
            }
        };

        PieImpl.prototype._getLeftTop = function(d) {
            var p = d.centroPoint, topLeft = [
                p[0] - (d.r + PADDING), p[1] - (d.r + PADDING)
            ];
            return topLeft;
        };

        // used to generate the lable attached on the selected sector
        PieImpl.prototype._getTooltipContent = function(data, metaFeedingMapping) {
            var result = LocationBasedVizImpl.prototype._getTooltipContent.apply(this, arguments);
            var measure = result.measure, dimension = result.dimension, otherInfo = result.otherInfo;
            var labelFormat = this._viz.properties().labelFormat;
            var measureName, measureValue, measurePortion, dimName, dimValue;

            if (metaFeedingMapping[VALUE]) {
                measureName = metaFeedingMapping[VALUE].name;
                measureValue = data.originalValue? data.originalValue : data.dataHolder[VALUE];

                measure.push({
                    id : metaFeedingMapping[VALUE].id,
                    name : measureName,
                    value : measureValue,
                    type : "Measure"
                });
                otherInfo.push({
                    name : "Portion",
                    type : "otherInfo",
                    value : [
                        data.percent
                    ]
                });
            }
            if (metaFeedingMapping[COLOR]) {
                dimName = metaFeedingMapping[COLOR].name;
                dimValue = data.dataHolder[COLOR];

                (this._colorData ? dimension : measure).push({
                    name : dimName,
                    value : dimValue,
                    type : this._colorData ? "Dimension" : "Measure",
                    id : metaFeedingMapping[COLOR].id
                });
            }

            return result;
        };

        PieImpl.prototype._generateLegend = function(data, legend, effectManager) {
            var metaFeedingMapping = this._metaFeedingMapping, subLegends = [], result = null;

            var colorPalette = this._props.colorPalette;
            if (this._sizeScale && this._sizeData.length > 0) {
                var sizeLegend = new SizeLegend(ObjectUtils.extendByRepalceArray(true, {
                    titleText : metaFeedingMapping[VALUE].name,
                    color : colorPalette[0]
                }, this._props.sizeLegend), effectManager);
                sizeLegend.setLegendInfo({
                    scale : this._sizeScale,
                    labels : this._sizeData
                });
                subLegends.push(sizeLegend);
            }
            if (this._colorData) {
                var colorLegend = new ColorLegend(ObjectUtils.extendByRepalceArray(true, {
                    titleText : metaFeedingMapping[COLOR].name
                }, this._props.colorLegend), effectManager);

                
                colorLegend.setLegendInfo({
                    metaData : this._metaFeedingMapping[COLOR],
                    data : this._colorData,
                    color : colorPalette
                });
                subLegends.push(colorLegend);
            }
            result = legend ? legend.recreate(subLegends) : new ComposedLegend(subLegends);
            return result;
        };

        PieImpl.prototype._applyPadding = function(bounds) {
            var projection = d3.geo.mercator();
            var min = projection(bounds.min()), max = projection(bounds.max()), distance = [];

            for (var i = 0; i < min.length; i++) {
                distance[i] = Math.abs(min[i] - max[i]);
                min[i] = min[i] > max[i] ? min[i] + distance[i] / (1 / MAX_RADIUS_RATIO - 2) : min[i] - distance[i] /
                    (1 / MAX_RADIUS_RATIO - 2);
                max[i] = max[i] > min[i] ? max[i] + distance[i] / (1 / MAX_RADIUS_RATIO - 2) : max[i] - distance[i] /
                    (1 / MAX_RADIUS_RATIO - 2);
            }
            bounds.min(projection.invert(min));
            bounds.max(projection.invert(max));
            return bounds;
        };

        return PieImpl;
    });

define('sap/viz/geo/dataviz/Pie',[
    "sap/viz/geo/dataviz/PieImpl",
    "sap/viz/geo/dataviz/LocationBasedViz",
    'sap/viz/geo/dataviz/Constants',
    "sap/viz/geo/dataviz/SVGViz",
    "sap/viz/chart/behavior/config/handler/LassoBehaviorHandler",
    "exports"
], function(
    PieImpl,
    LocationBasedViz,
    Constants,
    SVGViz,
    LassoBehaviorHandler
) {
    /**
     * Create a new pie visualization object. It will show pies at geo
     * locations specified by data and the sizes of pies depend on values in
     * data.
     * 
     * <p>
     * Feeding Information:
     * 
     * <pre>
     * {
     *     location : FieldId1,
     *     size : FieldId2,
     *     color : FieldId3
     * }
     * </pre>
     * 
     * </p>
     * 
     * @example <caption>add a new pie layer</caption>
     * 
     * <pre>
     * ... //get map using viz api
     * 
     * var data = {
     *    &quot;metadata&quot; : {
     *      &quot;fields&quot; : [{
     *        &quot;id&quot; : &quot;Location&quot;,
     *        &quot;name&quot; : &quot;City&quot;,
     *        &quot;semanticType&quot; : &quot;Dimension&quot;, 
     *        &quot;dataType&quot; : &quot;String&quot;
     *      }, {
     *        &quot;id&quot; : &quot;Measure&quot;,
     *        &quot;name&quot; : &quot;Sales&quot;,
     *        &quot;semanticType&quot; : &quot;Measure&quot;
     *      }, {
     *        &quot;id&quot; : &quot;Category&quot;,
     *        &quot;name&quot; : &quot;Sales&quot;,
     *        &quot;semanticType&quot; : &quot;Dimension&quot;
     *      }]
     *    },
     *    &quot;data&quot; : [[&quot;Los Angeles&quot;, 30.12 ,&quot;car&quot;], 
                             [&quot;Los Angeles&quot;, 50.0, &quot;motor&quot;],
     *                       [&quot;Los Angeles&quot;, 40.32, ,&quot;truck&quot]]
     *  };
     * var feeding = {location: 'Location', size: 'Measure', color : 'Category'};
     * var viz = new sap.viz.geo.dataviz.Pie({
     *   donut: {isDonut : true, innerRadiusRatio : 0.5}
     * });
     * var ds = new sap.viz.api.data.FlatTableDataset(data);
     * var layer = new sap.viz.geo.dataviz.Layer({
     *   viz : viz,
     *   data : ds,
     *   feeding: feeding
     * });
     * 
     * ... //add lay into map
     * </pre>
     * 
     * @constructor
     * @alias sap.viz.geo.dataviz.Pie
     * @augments sap.viz.geo.dataviz.LocationBasedViz
     * @param {Object}
     *            [options] the configuration object.
     * @param {Object}
     *            [options.donut] the configuration object for cluster.
     * @param {Boolean}
     *            [options.donut.isDonut] whether is shown by Donut, false by
     *            default.
     * @param {Number}
     *            [options.donut.innerRadiusRatio] the ratio of the inner Radius/outer Radius.
     * @param [options.colorPalette]
     *            the array of colors
     * @param {Object}
     *            [options.sizeLegend] the settings of size legend
     * @param {String}
     *            [options.sizeLegend.formatString] Set the format pattern to be
     *            applied for numbers in size legend
     * @param {String}
     *            [options.sizeLegend.unitFormatType] Set the type of format pattern to be
     *            applied for numbers in the size legend
     * @param {Object}
     *            [options.dataLabel] the configuration object for data label.
     * @param {Boolean}
     *            [options.dataLabel.visible] whether enable data labels, false
     *            by default.
     * @param {Boolean}
     *            [options.dataLabel.showColorValue] whether color value show in
     *            data label, true by default. It take effect only when visible
     *            is true.
     * @param {Boolean}
     *            [options.dataLabel.showLocationName] whether geo location name
     *            show in data label, true by default. It take effect only when
     *            visible is true.
     * @param {Boolean}
     *            [options.dataLabel.showSizeValue] whether the biggest portion is 
     *            shown in data label, true by default. It take effect only when 
     *            visible is true.
     * @param {String|Object}
     *            [options.dataLabel.format] a string to indicate the format
     *            pattern of numbers in data label. It can be also an object
     *            keys of which are ids of measures to specify the patterns
     *            separately.
     * @param {String|Object}
     *            [options.dataLabel.unitFormatType] a string to indicate the 
     *            type of format pattern of numbers in data label. It can be also an object
     *            keys of which are ids of measures to specify the patterns separately.
     * @param {Object}
     *            [options.hover]           
     * @param {string}
     *            [options.hover.color=null] Set hovered data point color
     *            effect. Four operation functions will be supported. -
     *            darken/lighten/desaturate/greyscale
     * @param {Object}
     *            [options.selected]
     * @param {string}
     *            [options.selected.color=null] Set selected data point color
     *            effect. Four operation functions will be supported. -
     *            darken/lighten/desaturate/greyscale
     * @param {Object}
     *            [options.deselected]
     * @param {string}
     *            [options.deselected.color=null] Set deselected data point
     *            color effect. Four operation functions will be supported. -
     *            darken/lighten/desaturate/greyscale
     */

    var defaultOptions = SVGViz.addDefaultOptions({
        isShowDataLabel : false,
        colorPalette : Constants.COLOR_PALETTE,
        sizeLegend : {
            formatString : null,
            unitFormatType : "FinancialUnits"
        },
        colorLegend : {
        },
        donut : {
            isDonut : false,
            innerRadiusRatio : null
        },
        dataLabel : {
            visible : false,
            showColorValue : true,
            showLocationName : true,
            showSizeValue : true,
            format : null,
            unitFormatType : "FinancialUnits",
            style : {
                color : "",
                fontFamily : "Open Sans, Arial, Helvetica, sans-serif",
                fontSize : "12px",
                fontWeight : "normal",
                fontStyle : "normal"
            }
        }
    });
    var Pie = function(options) {
        LocationBasedViz.call(this, options, [
            {
                id : 'location',
                required : true
            }, {
                id : 'color',
                required : true
            }, {
                id : 'size',
                required : true
            }
        ], PieImpl, "sap.viz.geo.dataviz.Pie", defaultOptions);
    };

    Pie.prototype = SVGViz.mixin(Object.create(LocationBasedViz.prototype));
    Pie.prototype.constructor = Pie;

    var oriCreateMainShapeFillEffectParams = Pie.prototype._createMainShapeFillEffectParams;
    Pie.prototype._createMainShapeFillEffectParams = function() {
        var params = oriCreateMainShapeFillEffectParams.call(this);
        return params;
    };

    Pie.prototype._filterByLassoRect = function(elements, lassoRect, map) {
        return elements.filter(function() {
            var node = this.childNodes[0].childNodes[0];
            return LassoBehaviorHandler.prototype._isCovered(node, [
                lassoRect
            ]);
        });
    };
    return Pie;
});
define('sap/viz/geo/dataviz/ChoroplethImpl',[
    "sap/viz/geo/dataviz/AbstractVizImpl",
    'sap/viz/framework/common/util/TypeUtils',
    'sap/viz/geo/dataviz/MBCHelper',
    'sap/viz/framework/common/util/ObjectUtils',
    'sap/viz/chart/components/util/TextUtils',
    'sap/viz/framework/common/format/UnitFormat',
    "sap/viz/geo/dataviz/VizUtils",
    "sap/viz/geo/dataviz/FormatUtils"
], function(
    AbstractVizImpl,
    TypeUtils,
    MBCHelper,
    ObjectUtils,
    TextUtils,
    UnitFormat,
    VizUtils,
    FormatUtils
) {

    var hasD3Resampling = d3.version.split(".")[0] >= 3;

    var PADDING = 2;

    var POINT_RADIUS = 5;

    var geoPath = d3.geo.path().pointRadius(POINT_RADIUS);

    var LABEL = {
        margin : 4,
        padding : 0
    // line space between color and location
    };

    var LOCATION = 'location';
    var COLOR = 'color';

    /**
     * @constructor
     * @alias sap.viz.geo.dataviz.ChoroplethImpl
     * @augments sap.viz.geo.dataviz.AbstractVizImpl
     * @param {Object}
     *            viz the viz object
     * @ignore
     */
    var ChoroplethImpl = function(viz) {
        AbstractVizImpl.call(this, viz);
    };

    ChoroplethImpl.prototype = Object.create(AbstractVizImpl.prototype);
    ChoroplethImpl.prototype.constructor = ChoroplethImpl;

    ChoroplethImpl.prototype._buildDom = function(elements, eventTargetClassName) {
        elements.append("svg").attr("class", "choropleth").append("path").attr("class",
            "mainShape " + eventTargetClassName);

        return this;
    };

    function sortByBBox(a, b) {
        return a.feature.bbox.contain(b.feature.bbox) ? -1 : 1;
    }

    ChoroplethImpl.prototype._prepareData = function(data) {
        this._mbcHelper = null;
        var colorMeta = this._metaFeedingMapping[COLOR];
        var props = this._viz.properties();
        var scale;
        if (colorMeta) {
            var mbcHelper = this._mbcHelper = new MBCHelper(colorMeta, COLOR, props);
            mbcHelper.setData(data);
            scale = {
                scale : mbcHelper.getScale(),
                feedId : COLOR
            };
        } else {
            scale = props.colorPalette[0] || props.startColor;
        }

        VizUtils.getDataShapeColor(data, scale);
        data.sort(sortByBBox);

        return data;
    };

    ChoroplethImpl.prototype._getLeftTop = function(d, toPixel) {
        var min = d.box.min();
        delete d.box;
        return min;
    };

    ChoroplethImpl.prototype._calculateDisplayText = function(d, labelProp) {
        var texts = [];
        var colorText = "", locationText = "";
        var obj;
        var width = d.box.getLength(0) - LABEL.margin;
        var height = d.box.getLength(1);
        if (this._metaFeedingMapping[COLOR] && labelProp.showColorValue && (d.dataHolder.color + "" !== "")) {
            var format = labelProp.format;
            var formatType = labelProp.unitFormatType;
            var propKey = this._metaFeedingMapping[COLOR].id;
            colorText = UnitFormat.format(d.dataHolder.color, FormatUtils.getFormatString(format,propKey), 
                FormatUtils.getFormatString(formatType,propKey));
        }
        if (labelProp.showLocationName) {
            locationText = "" + this._getLocationValue(d, this._metaFeedingMapping);
        }
        var colorHeight = 0, locationHeight = 0, colorWidth = 0, locationWidth = 0;
        var size;

        if (colorText !== "") {
            size = TextUtils.fastMeasure(colorText, labelProp.style.fontSize, labelProp.style.fontWeight,
                labelProp.style.fontFamily);
            colorHeight = size.height;
            colorWidth = size.width;
        }

        if (locationText !== "") {
            size = TextUtils.fastMeasure(locationText, labelProp.style.fontSize, labelProp.style.fontWeight,
                labelProp.style.fontFamily);
            locationHeight = size.height;
            locationWidth = size.width;
        }
        if (labelProp.autoHide) {
            if (colorWidth > width || colorHeight > height) {
                colorText = "";
                colorHeight = 0;
            }

            if (locationText !== "") {
                if (locationHeight > height ||
                    (colorHeight > 0 && colorHeight + locationHeight * (1 + LABEL.padding) > height)) {
                    locationText = "";
                }
            }

            if (locationText !== "") {
                if (locationWidth > width) {
                    // var cssString = StyleUtils.convertToCss(LABEL);
                    var truncateText = TextUtils.ellipsis(locationText, null, width, "font-family:" +
                        labelProp.style.fontFamily + ";font-size:" + labelProp.style.fontSize + ";font-weight:" +
                        labelProp.style.fontWeight);
                    if (truncateText.length < 6) {
                        locationText = "";
                        locationWidth = 0;
                    } else {
                        locationText = truncateText;
                        locationWidth = width;
                    }

                }
            }
        }

        if (colorText !== "") {
            obj = {
                text : colorText,
                width : colorWidth,
                height : colorHeight
            };
            texts.push(obj);
        }
        if (locationText !== "") {
            obj = {
                text : locationText,
                width : locationWidth,
                height : locationHeight
            };
            texts.push(obj);

        }

        return texts;
    };

    ChoroplethImpl.prototype._update = function(elements, toPixel, effectManager) {

        geoPath.projection(hasD3Resampling ? d3.geo.transform({
            point : function(x, y) {
                var ret = toPixel([
                    x, y
                ]);
                this.stream.point(ret[0], ret[1]);
            }
        }) : toPixel);

        var bounds;
        elements.select("svg").attr("width", function(d) {
            var feature = d.feature;
            var offset = (feature.geometry.type === "Point" ? POINT_RADIUS : 0) + PADDING;

            bounds = feature.bbox.transform(toPixel);
            var min = bounds.min();
            var max = bounds.max();
            min[0] -= offset;
            min[1] -= offset;
            max[0] += offset;
            max[1] += offset;
            d.box = bounds;

            return d.box.getLength(0);
        }).attr("height", function(d) {
            return d.box.getLength(1);
        }).select("path").attr("d", function(d) {
            return geoPath(d.feature);
        }).attr("transform", function(d) {
            var p = d.box.min();
            return "translate(" + -p[0] + "," + -p[1] + ")";
        });
        
        geoPath.projection(null);
        
        this._viz._setElementsDefaultStyle(elements, effectManager);
        // show data label
        var labelProp = this._viz._props.dataLabel;
        var that = this;
        var style = labelProp.style;
        if (labelProp.visible && elements.select(".dataLabelContainer").empty()) {
            var labelContainer = elements.append("div").attr("class", "dataLabelContainer");
            labelContainer.append("span").attr("class", "dataLabel measure");
            labelContainer.append("span").attr("class", "dataLabel location");
        }

        // To improve performance. if previous and current dataLabel visible all
        // false.
        // That mean we need not update dataLabel DOM text, since text hide
        // already
        if (labelProp.visible || this._viz._lastLabelVisible) {
            elements.select(".dataLabelContainer").attr(
                "style",
                "font-family:" + style.fontFamily + ";font-size:" + style.fontSize + ";font-weight:" +
                    style.fontWeight + ";font-style:" + style.fontStyle + ";color:" + style.color).attr(
                "transform",
                function(d) {
                    var labels = this.childNodes;
                    labels[0].textContent = "";
                    labels[1].textContent = "";

                    if (labelProp.visible) {
                        var min = d.box.min(), max = d.box.max();
                        var centerX = (max[0] - max[0]) / 2, centerY = (max[1] - min[1]) / 2;
                        if (d.centroid) {
                            var centerPoint = toPixel(d.centroid);
                            centerX = centerPoint[0] - min[0];
                            centerY = centerPoint[1] - min[1];

                        }
                        var texts = that._calculateDisplayText(d, labelProp);
                        if (texts.length > 0) {
                            labels[0].textContent = texts[0].text;
                            labels[0].setAttribute("style", "position:absolute;left:" +
                                (centerX - texts[0].width / 2) +
                                "px;top:" +
                                ((texts.length === 1 ? centerY - texts[0].height / 2 : centerY - texts[0].height *
                                    (1 + LABEL.padding / 2))) + "px;width:" + texts[0].width + 
                                    "px;height:"+ texts[0].height + "px;");
                            if (texts.length === 2) {
                                labels[1].textContent = texts[1].text;
                                labels[1].setAttribute("style", "position:absolute;left:" +
                                    (centerX - texts[1].width / 2) + "px;top:" +
                                    (centerY + (texts[1].height * LABEL.padding) / 2) + "px;width:" + texts[1].width +
                                    "px;height:"+ texts[1].height + "px;");
                            }
                        }
                    }

                });
        }

        // elements.order();
        return this;
    };

    /**
     * @ignore
     * @param data
     *            data to
     * @param legend
     *            the legend to update. if not exist, we will create a new
     *            MbcLegend
     * @returns legend
     */
    ChoroplethImpl.prototype._generateLegend = function(data, legend, effectManager) {
        var mbcHelper = this._mbcHelper;
        if (mbcHelper) {
            legend = mbcHelper.createOrUpdateLgend(effectManager, legend);
        } else if (legend) {
            legend.destroy();
            legend = null;
        }
        return legend;
    };

    ChoroplethImpl.prototype._getTooltipContent = function(data, metaFeedingMapping) {
        var result = AbstractVizImpl.prototype._getTooltipContent.apply(this, arguments);
        var measure = result.measure;
        if (metaFeedingMapping[COLOR]) {
            var measureName = metaFeedingMapping[COLOR].name;
            var measureValue = data.dataHolder[COLOR];
            measure.push({
                id : metaFeedingMapping[COLOR].id,
                name : measureName,
                value : measureValue,
                type : "Measure"
            });
        }
        return result;
    };

    return ChoroplethImpl;
});

define('sap/viz/geo/dataviz/Choropleth',[
    "sap/viz/geo/dataviz/AbstractViz",
    "sap/viz/geo/dataviz/ChoroplethImpl",
    'sap/viz/geo/dataviz/Constants',
    "sap/viz/geo/Bounds",
    "sap/viz/geo/dataviz/SVGViz",
    "exports"
], function(
    AbstractViz,
    ChoroplethImpl,
    Constants,
    Bounds,
    SVGViz
) {
    var defaultOptions = SVGViz.addDefaultOptions({
        startColor : '#fac99e',
        endColor : '#703C10',
        nullColor : 'rgb(204,204,204)',
        colorPalette : Constants.MBC_COLOR_PALETTE,
        numOfSegments : 5,
        mbcLegend : {
            unitFormatType : "FinancialUnits",
            formatString : null
        },
        dataLabel : {
            unitFormatType : "FinancialUnits",
            format : null,
            visible : false,
            showColorValue : true,
            showLocationName : true,
            autoHide : false,
            style : {
                color : "#333333",
                fontFamily : "Open Sans, Arial, Helvetica, sans-serif",
                fontSize : "12px",
                fontWeight : "normal",
                fontStyle : "normal"
            }
        }
    });

    var feedingDef = [
        {
            id : 'location',
            required : true
        }, {
            id : 'color',
            required : false
        }
    ];

    /**
     * Create a new choropleth visualization object. It will show polygons of
     * geo locations specified by data and fill them with different colors by
     * values in data.
     * 
     * <p>
     * Feeding Information:
     * 
     * <pre>
     * {
     *     location : FieldId1,
     *     color : FieldId2
     * }
     * </pre>
     * 
     * </p>
     * 
     * @example <caption>add a new choropleth layer</caption>
     * 
     * <pre>
     * ... //get map using viz api
     * 
     * var data = {
     *    &quot;metadata&quot; : {
     *      &quot;fields&quot; : [{
     *        &quot;id&quot; : &quot;Location&quot;,
     *        &quot;name&quot; : &quot;City&quot;,
     *        &quot;semanticType&quot; : &quot;Dimension&quot;, 
     *        &quot;dataType&quot; : &quot;String&quot;
     *      }, {
     *        &quot;id&quot; : &quot;Measure&quot;,
     *        &quot;name&quot; : &quot;Sales&quot;,
     *        &quot;semanticType&quot; : &quot;Measure&quot;
     *      }]
     *    },
     *    &quot;data&quot; : [[&quot;Los Angeles&quot;, 30.12], [&quot;Long Beach&quot;, 50.0],
     *        [&quot;Washington&quot;, 40.32]]
     *  };
     * var feeding = {location: 'Location', color: 'Measure'};
     * var viz = new sap.viz.geo.dataviz.Choropleth({
     *  startColor : 'rgb(194,227,00)',
     *  endColor : 'rgb(115,192,60)',
     *   nullColor : 'rgb(204,204,204)',
     *   numOfSegments : 4,
     *   colorPalette:[],
     *   legendValues:[0,34,56,122,123,234]
     *  });
     * 
     * var ds = new sap.viz.api.data.FlatTableDataset(data);
     * var layer = new sap.viz.geo.dataviz.Layer({
     *   viz : viz,
     *   data : ds,
     *   feeding: feeding
     * });
     * map.addLayer(layer);
     * 
     * ... //add lay into map
     * </pre>
     * 
     * @constructor
     * @alias sap.viz.geo.dataviz.Choropleth
     * @augments sap.viz.geo.dataviz.AbstractViz
     * @param {Object}
     *            [options] the configuration object.
     * @param {Color}
     *            [options.startColor] Choropleth start color, default
     *            value:"#fac99e"
     * @param {Color}
     *            [options.endColor] Choropleth end color, default
     *            value:"#703C10"
     * @param {Array}
     *            [options.colorPalette] Set colorPalette for choropleth. If
     *            this array length greater than numOfSegments, we will ignore
     *            startColor and endColor. Default is ["#fAC99E","#f7A660",
     *            "#f48323", "#b7621a","#703c10" ]. Set to [] if you want to use
     *            startColor and endColor .
     * @param {Number}
     *            [options.numOfSegments] Set Interval number for choropleth.
     *            value range[1~9], default value is 5
     * @param {Number}
     *            [options.legendValues] Set Interval values for choropleth.
     *            number array in ascending order
     * @param {Object}
     *            [options.mbcLegend] Set the MBC(MeasureValue-Based-Color)
     *            legend configuration.
     * @param {String}
     *            [options.mbcLegend.formatString] Set the format pattern to be
     *            applied for numbers in the MBC legend
     * @param {String}
     *            [options.mbcLegend.unitFormatType] Set the type of format pattern to be
     *            applied for numbers in the MBC legend
     * @param {Object}
     *            [options.dataLabel] the configuration object for data label.
     * @param {Boolean}
     *            [options.dataLabel.visible] whether enable data labels, false
     *            by default.
     * @param {Boolean}
     *            [options.dataLabel.showColorValue] whether color value show in
     *            data label, true by default. It take effect only when visible
     *            is true.
     * @param {Boolean}
     *            [options.dataLabel.showLocationName] whether geo location name
     *            show in data label, true by default. It take effect only when
     *            visible is true.
     * @param {Boolean}
     *            [options.dataLabel.autoHide] when data label exceed polygon
     *            bound box, weather hide or truncate labels, false by default.
     * @param {String|Object}
     *            [options.dataLabel.format] a string to indicate the format
     *            pattern of numbers in data label. It can be also an object
     *            keys of which are ids of measures to specify the patterns
     *            separately.
     * @param {String|Object}
     *            [options.dataLabel.unitFormatType] a string to indicate the 
     *            type of format pattern of numbers in data label. It can be also an object
     *            keys of which are ids of measures to specify the patterns separately.
     * @param {Object}
     *            [options.hover]           
     * @param {string}
     *            [options.hover.color=null] Set hovered data point color
     *            effect. Four operation functions will be supported. -
     *            darken/lighten/desaturate/greyscale
     * @param {Object}
     *            [options.selected]
     * @param {string}
     *            [options.selected.color=null] Set selected data point color
     *            effect. Four operation functions will be supported. -
     *            darken/lighten/desaturate/greyscale
     * @param {Object}
     *            [options.deselected]
     * @param {string}
     *            [options.deselected.color=null] Set deselected data point
     *            color effect. Four operation functions will be supported. -
     *            darken/lighten/desaturate/greyscale
     */
    var Choropleth = function(options) {
        AbstractViz.call(this, options, feedingDef, ChoroplethImpl, "sap.viz.geo.dataviz.Choropleth", defaultOptions);
    };

    Choropleth.prototype = SVGViz.mixin(Object.create(AbstractViz.prototype));
    Choropleth.prototype.constructor = Choropleth;

    Choropleth.prototype.verifyProperties = function(properties) {
        if (properties.numOfSegments < 1) {
            properties.numOfSegments = 1;
        } else if (properties.numOfSegments > 9) {
            properties.numOfSegments = 9;
        }
    };

    Choropleth.prototype._filterByLassoRect = function(elements, lassoRect, map) {
        elements = AbstractViz.prototype._filterByLassoRect.call(this, elements, lassoRect, map);
        if (!elements.empty()) {
            var rootRect = map._rootContainer.getBoundingClientRect();
            var x = lassoRect.x - rootRect.left, y = lassoRect.y - rootRect.top;
            var bounds = new Bounds(map.toLngLat([
                x, y
            ], true), map.toLngLat([
                x + lassoRect.width, y + lassoRect.height
            ], true));
            elements = elements.filter(function(d) {
                var geometry = d.feature.geometry;
                var coordinates = geometry.coordinates;
                switch (geometry.type) {
                case "Point":
                    return bounds.containPoint(coordinates[0]);
                case "Polygon":
                    return isPolygonIntersectantWith(coordinates, bounds);
                case "MultiPolygon":
                    return coordinates.some(function(polygon) {
                        return isPolygonIntersectantWith(polygon, bounds);
                    });
                }

                return false;
            });
        }
        return elements;
    };

    function isPolygonIntersectantWith(polygon, bounds) {
        var points = polygon[0];
        var min = bounds.min(), max = bounds.max(), horiLine = min;
        var count = 0;
        for (var i = 0; i < points.length; i++) {
            var point = points[i];
            var prevPoint;
            if (i === 0) {
                prevPoint = points[points.length - 1];
            } else {
                prevPoint = points[i - 1];
            }
            var seg = [
                prevPoint, point
            ];
            if (segIntersect(seg, [
                min, [
                    max[0], min[1]
                ]
            ])) {
                return true;
            }
            if (segIntersect(seg, [
                [
                    max[0], min[1]
                ], max
            ])) {
                return true;
            }
            if (segIntersect(seg, [
                max, [
                    min[0], max[1]
                ]
            ])) {
                return true;
            }
            if (segIntersect(seg, [
                [
                    min[0], max[1]
                ], min
            ])) {
                return true;
            }

            if (segHoriLineIntersect(seg, horiLine)) {
                count++;
            }
        }

        // one is inside another
        if (count % 2 !== 0) {
            return true;
        } else {
            count = 0;
            horiLine = points[0];
            if (segHoriLineIntersect([
                min, [
                    max[0], min[1]
                ]
            ], horiLine)) {
                count++;
            }
            if (segHoriLineIntersect([
                [
                    max[0], min[1]
                ], max
            ], horiLine)) {
                count++;
            }
            if (segHoriLineIntersect([
                max, [
                    min[0], max[1]
                ]
            ], horiLine)) {
                count++;
            }
            if (segHoriLineIntersect([
                [
                    min[0], max[1]
                ], min
            ], horiLine)) {
                count++;
            }
            if (count % 2 !== 0) {
                return true;
            } else {
                return false;
            }
        }
    }

    function segIntersect(segA, segB) {
        var A = [], B = [];
        if (segA[0][0] === segA[1][0]) {
            A[0] = 0;
            A[1] = 1;
            A[2] = -segA[0][0];
        } else {
            A[0] = 1;
            A[1] = (segA[0][1] - segA[1][1]) / (segA[0][0] - segA[1][0]);
            A[2] = segA[0][1] - A[1] * segA[0][0];
        }
        if (segB[0][0] === segB[1][0]) {
            B[0] = 0;
            B[1] = 1;
            B[2] = -segB[0][0];
        } else {
            B[0] = 1;
            B[1] = (segB[0][1] - segB[1][1]) / (segB[0][0] - segB[1][0]);
            B[2] = segB[0][1] - B[1] * segB[0][0];
        }
        var x, y;
        if (A[0] === 0) {
            if (B[0] === 0) {
                if (A[2] !== B[2]) {
                    return false;
                } else {
                    return isBetween(segA[0][1], segB[0][1], segB[1][1]) ||
                        isBetween(segA[1][1], segB[0][1], segB[1][1]);
                }
            } else {
                x = -A[2];
                y = B[1] * x + B[2];
            }
        } else {
            if (B[0] === 0) {
                x = -B[2];
                y = A[1] * x + A[2];
            } else {
                if (A[1] === B[1]) {
                    if (A[2] !== B[2]) {
                        return false;
                    } else {
                        if (isBetween(segA[0][0], segB[0][0], segB[1][0]) ||
                            isBetween(segA[1][0], segB[0][0], segB[1][0])) {
                            return true;
                        } else {
                            return false;
                        }
                    }
                } else {
                    x = (A[2] - B[2]) / (B[1] - A[1]);
                    y = A[1] * x + A[2];
                }
            }
        }
        if (isBetween(x, segA[0][0], segA[1][0]) && isBetween(x, segB[0][0], segB[1][0]) &&
            isBetween(y, segA[0][1], segA[1][1]) && isBetween(y, segB[0][1], segB[1][1])) {
            return true;
        } else {
            return false;
        }
    }

    function isBetween(x, a, b) {
        var min = Math.min(a, b);
        var max = Math.max(a, b);
        var error = 0.01;
        if (x >= min - error && x <= max + error) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * Below function is used to check if the segment intersects with the
     * horizontol half-line Because the points will used twice in the polygon,
     * so to avoid dulpication, the end point of the segment is not included in
     * the current segment. This end point will be the start point of next
     * segment.
     */
    function segHoriLineIntersect(seg, horiLine) {
        if (seg[0][0] - seg[1][0] !== 0) {
            var k1 = (seg[0][1] - seg[1][1]) / (seg[0][0] - seg[1][0]);
            var b1 = seg[0][1] - k1 * seg[0][0];
            var k2 = 0;
            var b2 = horiLine[1];
            var x;
            if (k2 - k1 !== 0) {
                x = (b1 - b2) / (k2 - k1);
                var y = k1 * x + b1;
                if (seg[0][1] <= seg[1][1]) {
                    return y >= seg[0][1] && y < seg[1][1] && x >= horiLine[0];
                } else {
                    return y <= seg[0][1] && y > seg[1][1] && x >= horiLine[0];
                }
            } else {
                x = horiLine[0];
                if (seg[1][0] === horiLine[1] && (x <= seg[0][0] || x < seg[1][0])) {
                    return true;
                }
                return false;
            }
        } else {
            if (horiLine[0] <= seg[0][0]) {
                if ((horiLine[1] >= seg[0][1] && horiLine[1] < seg[1][1]) ||
                    (horiLine[1] <= seg[0][1] && horiLine[1] > seg[1][1])) {
                    return true;
                } else {
                    return false;
                }
            } else {
                return false;
            }
        }
    }
    
    var oriCreateMainShapeFillEffectParams = Choropleth.prototype._createMainShapeFillEffectParams;
    Choropleth.prototype._createMainShapeFillEffectParams = function() {
        var params = oriCreateMainShapeFillEffectParams.call(this);
        delete params.drawingEffect;
        return params;
    };

    return Choropleth;
});

define('sap/viz/geo/dataviz/MarkerImpl',[
    "sap/viz/geo/dataviz/LocationBasedVizImpl",
    "sap/viz/geo/legend/ImageLegend",
    'sap/viz/framework/common/lang/LangManager',
    'sap/viz/api/env/Locale',
    'sap/viz/framework/common/util/ObjectUtils',
    'sap/viz/chart/components/util/TextUtils',
    'sap/viz/geo/LocationType'
], function(
    LocationBasedVizImpl,
    ImageLegend,
    langManager,
    Locale,
    ObjectUtils,
    TextUtils,
    LocationType
) {
    var location = 'location';
    var LABEL = {
        padding : 2
    };
    /**
     * @constructor
     * @alias sap.viz.geo.dataviz.MarkerImpl
     * @augments sap.viz.geo.dataviz.LocationBasedVizImpl
     * @param {Object}
     *            viz the viz object.
     * @ignore
     */
    var MarkerImpl = function(viz) {
        LocationBasedVizImpl.call(this, viz);
    };

    MarkerImpl.prototype = Object.create(LocationBasedVizImpl.prototype);
    MarkerImpl.prototype.constructor = MarkerImpl;

    MarkerImpl.prototype._prepareSingleData = function(data, mapSize) {
        return data;
    };
    MarkerImpl.prototype._buildSingleDom = function(elements, eventTargetClassName) {
        var style = this._viz.properties().dataLabel.style;
        elements.append('div').attr("class", "marker single").append("img").attr("class",
            "imageMarker mainShape " + eventTargetClassName);
        return this;
    };

    MarkerImpl.prototype._buildClusterDom = function(elements, eventTargetClassName) {
        var clusterProps = this._viz.properties().cluster;
        var style = this._viz.properties().dataLabel.style;

        var div = elements.append('div').attr("class", "marker cluster");
        div.append('div').attr("class", "imageContainer").append("img").attr('class',
            'imageCluster mainShape ' + eventTargetClassName);

        div.append("div").attr("class", "labelContainer").append("span").attr("class", "label");
        return this;
    };

    MarkerImpl.prototype._updateClusterDataLabel = function(elements, bSingle) {

        var props = this._viz.properties().dataLabel;
        var markerWidth = this._viz.properties().width;
        var style = props.style;
        var that = this;
        if (props.visible) {
            elements.each(function() {
                var sel = d3.select(this);
                if (sel.select(".dataLabelContainer").empty()) {
                    sel.append('div').attr("class", "dataLabelContainer").append("span").attr("class", "dataLabel");
                }
            });
        }

        if (props.visible || this._viz._lastLabelVisible) {
            elements.select('div.dataLabelContainer').attr(
                "style",
                "font-family:" + style.fontFamily + ";font-size:" + style.fontSize + ";font-weight:" +
                    style.fontWeight + ";color:" + style.color).select('.dataLabel').attr(
                    "transform",
                    function(d) {
                        this.textContent = "";
                        if (props.visible) {
                            var locationValue = bSingle ? that._getLocaltionLabel(d, that._metaFeedingMapping) : that
                                ._getClusterLocationLabel(d, that._metaFeedingMapping);
                            var size = TextUtils.superFastMeasure(locationValue, style.fontSize, style.fontWeight,
                                style.fontFamily);
                            var positionLeft = bSingle ? (-size.width + markerWidth) / 2
                                : (-size.width / 2 + d.xoffset);
                            this.setAttribute("style", "position:absolute;left:" + positionLeft + "px;top:" +
                                -(LABEL.padding + size.height) + "px;width:" + size.width +
                                "px;height:" + size.height + "px;" );
                            this.textContent = locationValue;
                        }
                    });
        }
    };

    MarkerImpl.prototype._updateSingle = function(elements) {
        var c = this._viz.properties();
        var style = c.dataLabel.style;
        var that = this;
        elements.select('div.single').select("img").attr("src", c.url).attr("width", c.width).attr("height", c.height);
        var selectedElements = elements.filter(function() {
            if (this.className.indexOf("selected") >= 0) {
                return true;
            } else {
                return false;
            }
        });
        selectedElements.select("div.single").select("img").attr("src", c.highlightUrl);
        if (c.dataLabel.visible || this._viz._lastLabelVisible) {
            this._updateClusterDataLabel(elements, true);
        }

        return this;
    };

    MarkerImpl.prototype._getSingleLeftTop = function(d, p) {
        var c = this._viz.properties();
        var left = p[0] + c.xoffset, top = p[1] + c.yoffset;
        return [
            left, top
        ];
    };

    MarkerImpl.prototype._generateLegend = function(data, legend, effectMananger) {
        var metaFeedingMapping = this._metaFeedingMapping;
        var c = this._viz.properties();

        var hasCluster = data.some(function(o) {
            return o.isCluster;
        });
        var hasMarker = data.some(function(o) {
            return !o.isCluster;
        });
        var legendData = [];
        if (hasCluster) {
            legendData.push({
                text : langManager.get('IDS_GEOCLUSTER'),
                url : c.cluster.url
            });
        }
        if (hasMarker) {
            legendData.push({
                text : langManager.get('IDS_GEOLOCATION'),
                url : c.url
            });
        }

        var legendOptions = ObjectUtils.extendByRepalceArray(true, {
            titleText : metaFeedingMapping[location].name
        }, c.legend);

        var result = legend;
        if (result) {
            result.setProperties(legendOptions);
        } else {
            result = new ImageLegend(legendOptions, effectMananger);
        }
        result.setLegendInfo(legendData);
        return result;
    };

    return MarkerImpl;
});
define('sap/viz/geo/dataviz/Marker',[
    "sap/viz/geo/dataviz/LocationBasedViz",
    "sap/viz/api/env/Resource",
    "sap/viz/geo/dataviz/MarkerImpl",
    "sap/viz/framework/common/util/ObjectUtils",
    "sap/viz/geo/dataviz/SelectionModel",
    "exports"
], function(
    LocationBasedViz,
    Resource,
    MarkerImpl,
    ObjectUtils,
    SelectionModel
) {

    var defaultProps = {
        width : 12,
        height : 18,
        xoffset : -6,
        yoffset : -18,
        dataLabel : {
            visible : false,
            style : {
                color : "#333333",
                fontFamily : "Open Sans, Arial, Helvetica, sans-serif",
                fontSize : "12px",
                fontWeight : "normal",
                fontStyle : "normal"
            }
        },
        legend : {
            marker : {
                size : 12
            }
        }
    };
    var feedingDef = [
        {
            id : 'location',
            required : true
        }
    ];
    /**
     * Create a new image marker visualization object. It will show images in
     * geo locations specified by data.
     * 
     * <p>
     * Feeding Information:
     * 
     * <pre>
     * {
     *     location : FieldId1
     * }
     * </pre>
     * 
     * </p>
     * 
     * @example <caption>add a new marker layer</caption> ... //get map using
     *          viz api
     * 
     * var data = { "metadata" : { "fields" : [{ "id" : "Location", "name" :
     * "City", "semanticType" : "Dimension", "dataType" : "String" }] }, "data" :
     * [["Los Angeles"], ["Long Beach"], ["Washington"]] }; var feeding =
     * {location: 'Location'}; var viz = new sap.viz.geo.dataviz.Marker({
     * cluster: {enabled : true} });
     * 
     * var ds = new sap.viz.api.data.FlatTableDataset(data); var layer = new
     * sap.viz.geo.dataviz.Layer({ viz : viz, data : ds, feeding: feeding });
     * 
     * ... //add lay into map
     * 
     * @constructor
     * @alias sap.viz.geo.dataviz.Marker
     * @augments sap.viz.geo.dataviz.LocationBasedViz
     * @param {Object}
     *            [options] the configuration object.
     * @param {String}
     *            [options.url] the URL of image. default value indicates by
     *            Path("sap.viz.map.Resources") + "/images/marker.png". Path
     *            could be set by
     *            sap.viz.api.env.Resource.path("sap.viz.map.Resources",
     *            "../../resources/data/geo/");
     * @param {String}
     *            [options.highlightUrl] the URL of highlight image. default
     *            value = Path("sap.viz.map.Resources") +
     *            "/images/marker_highlight.png". Path could be set by
     *            sap.viz.api.env.Resource.path("sap.viz.map.Resources",
     *            "../../resources/data/geo/");
     * @param {Number}
     *            [options.width] the width of image. default value = 12.
     * @param {Number}
     *            [options.height] the height of image. default value = 18.
     * @param {Number}
     *            [options.xoffset] the offset in horizontal. default value =
     *            -6.
     * @param {Number}
     *            [options.yoffset] the offset in vertical. default value = -8.
     * @param {Object}
     *            [options.cluster] the configuration object for cluster.
     * @param {Boolean}
     *            [options.cluster.enabled] whether enable clustering . default
     *            value = false.
     * @param {String}
     *            [options.cluster.url] the URL of image. default value
     *            indicates by Path("sap.viz.map.Resources") +
     *            "/images/cluster.png". Path could be set by
     *            sap.viz.api.env.Resource.path("sap.viz.map.Resources",
     *            "../../resources/data/geo/");
     * @param {String}
     *            [options.cluster.highlightUrl] the URL of image. default value
     *            indicates by Path("sap.viz.map.Resources") +
     *            "/images/cluster_highlight.png". Path could be set by
     *            sap.viz.api.env.Resource.path("sap.viz.map.Resources",
     *            "../../resources/data/geo/");
     * @param {Number}
     *            [options.cluster.xmargin] the distance between image border
     *            and label in horizontal. default value = 15.
     * @param {Number}
     *            [options.cluster.ymargin] the distance between image border
     *            and label in vertical. default value = 15.
     * @param {Number}
     *            [options.cluster.minPts] min points in cluster. default value =
     *            3.
     * @param {Number}
     *            [options.cluster.distance.maxDistance] the max distance(num of
     *            pixels), 80 by default.
     * @param {Number}
     *            [options.cluster.distance.minDistance] the min distance(num of
     *            pixels), 20 by default.
     * @param {Object}
     *            [options.dataLabel] the configuration object for data label.
     * @param {Boolean}
     *            [options.dataLabel.visible] whether enable data labels, false
     *            by default.
     */
    var Marker = function(options) {
        var resourcesPath = Resource.path("sap.viz.map.Resources");
        LocationBasedViz.call(this, options, feedingDef, MarkerImpl, "sap.viz.geo.dataviz.Marker", ObjectUtils
            .extendByRepalceArray(true, {
                url : resourcesPath + "/images/marker.png",
                highlightUrl : resourcesPath + "/images/marker_highlight.png",
                cluster : {
                    url : resourcesPath + "/images/cluster.png",
                    highlightUrl : resourcesPath + "/images/cluster_highlight.png"
                }
            }, defaultProps));
    };

    Marker.prototype = Object.create(LocationBasedViz.prototype);
    Marker.prototype.constructor = Marker;

    var SELECTION_STATUS_SELECTED = SelectionModel.ELEMENT_STATUS.SELECTED;
    
    Marker.prototype._onSelectionChanged = function(node, selectionStatus, effectManager, datum) {
        LocationBasedViz.prototype._onSelectionChanged.apply(this, arguments);
        var properties = this.properties(), selector;
        if (this._isCluster(datum)) {
            selector = "div.imageContainer img";
            properties = properties.cluster;
        } else {
            selector = "div.single img";
        }
        node.querySelector(selector).src = properties[selectionStatus === SELECTION_STATUS_SELECTED ? "highlightUrl"
            : "url"];
        return this;
    };

    return Marker;
});

define('sap/viz/geo/export/processImage',[
    "jquery"
], function($) {
    var xlinkNS = "http://www.w3.org/1999/xlink";
    var canvas = document.createElement('CANVAS'), ctx = canvas.getContext('2d');

    var imageCORS = (new Image()).hasOwnProperty("crossOrigin");

    return function(img, parentG, expectSize) {
        var d = $.Deferred();

        var url = img, isSVGImage = false;
        if (img instanceof window.HTMLImageElement) {
            url = img.src;
            expectSize = expectSize || [
                img.width, img.height
            ];
        } else if (img instanceof SVGImageElement) {
            isSVGImage = true;
            url = img.getAttributeNS(xlinkNS, "href");
            expectSize = expectSize || [
                img.getAttribute("width"), img.getAttribute("height")
            ];
        }

        function resolve(dataURL) {
            var node;
            if (isSVGImage) {
                node = img;
            } else {
                node = parentG.appendChild(parentG.ownerDocument.createElementNS(parentG.namespaceURI, "image"));
                node.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", xlinkNS);
            }
            
            node.setAttributeNS(xlinkNS, "xlink:href", dataURL);

            node.setAttribute("width", expectSize[0]);
            node.setAttribute("height", expectSize[1]);
            d.resolve(node);
        }

        if (url.indexOf("data:") === 0) {
            resolve(url);
        } else {
            var image = new window.Image();

            var onImageLoad = function() {
                var imageW = this.width, imageH = this.height;

                if (imageW + imageH === 0) {
                    this.onerror(new Error("Error in loading image"));
                    return;
                }

                ctx.clearRect(0, 0, canvas.width, canvas.height);

                expectSize = expectSize || [
                    imageW, imageH
                ];

                var cw = expectSize[0], ch = expectSize[1];

                canvas.width = cw;
                canvas.height = ch;

                ctx.drawImage(this, 0, 0, cw, ch);

                var dataURL;
                try {
                    dataURL = canvas.toDataURL();
                } catch (e) {
                    d.reject(e);
                    return;
                }

                resolve(dataURL);
            };
            image.onerror = function(e) {
                d.reject(e);
            };

            if (imageCORS || typeof URL === "undefined") {
                image.crossOrigin = 'Anonymous';
                image.onload = onImageLoad;
                image.src = url;
            } else {
                var req = new XMLHttpRequest();
                req.open("GET", url, true);
                req.responseType = "blob";
                req.onreadystatechange = function() {
                    if (req.readyState === 4) {
                        var s = req.status, res = req.response;
                        if (!s && res || s >= 200 && s < 300 || s === 304) {
                            url = URL.createObjectURL(res);
                            image.onload = function() {
                                onImageLoad.call(this);
                                URL.revokeObjectURL(url);
                            };
                            image.src = url;
                        }
                    }
                };
                req.send();
            }
        }

        return d.promise();
    };
});
define('sap/viz/geo/export/esriBaseMap',[
    'sap/viz/geo/export/processImage',
    'jquery'
], function(
    processImage,
    $
) {
    var cachedURL, cachedImageNode;
    return function(baseMap, parentG) {
        var instance = baseMap._instance;
        if (!instance) {
            return;
        }
        var bbox = instance.extent;
        var width = instance.width, height = instance.height;
        var url = instance.getLayer(instance.layerIds[0]).url + "/export?f=image&transparent=true&format=png32&bbox=" +
            bbox.xmin + "," + bbox.ymin + "," + bbox.xmax + "," + bbox.ymax + "&bboxSR=" + bbox.spatialReference.wkid +
            "&size=" + width + "," + height;

        if (url === cachedURL) {
            var d = $.Deferred();
            parentG.appendChild(cachedImageNode);
            d.resolve();
            return d.promise();
        }

        return processImage(url, parentG).then(function(node) {
            cachedImageNode = node.cloneNode();
            cachedURL = url;
        });
    };
});
define('sap/viz/geo/export/cvom',[],function() {
    var styles = {
        ".v-geo-container-background" : [
            "fill"
        ],
        ".v-geo-container-base" : [
            "fill", "stroke"
        ],
        ".v-oceanlabel" : [
            "fill"
        ]
    };

    return function(baseMap, parentG) {
        var srcNode = baseMap._rootEl.node();
        var targetNode = srcNode.cloneNode(true);

        for ( var i in styles) {
            if (styles.hasOwnProperty(i)) {
                var node = srcNode.querySelector(i);
                if (node) {
                    var computedStyle = getComputedStyle(node, null);
                    var selectNode = targetNode.querySelector(i);
                    var str = "";
                    styles[i].forEach(function(prop) {
                        str += prop + ":" + computedStyle[prop] + ";";
                    });
                    selectNode.setAttribute("style", str);
                }
            }
        }

        parentG.appendChild(targetNode);
    };
});
define('sap/viz/geo/export/legends',[
    "sap/viz/geo/legend/ImageLegend",
    "sap/viz/geo/legend/ComposedLegend",
    'sap/viz/geo/export/processImage',
    "jquery"
], function(
    ImageLegend,
    ComposedLegend,
    processImage,
    $
) {

    function processLegend(legend, parentG, drawSepLine) {
        var ret = [];

        var document = parentG.ownerDocument;
        var namespaceURI = parentG.namespaceURI;

        var node = legend.node();

        var line;
        if (drawSepLine) {
            var style = window.getComputedStyle(node, null);
            line = document.createElementNS(namespaceURI, "line");
            line.setAttribute("stroke", style.borderTopColor);
            line.setAttribute("stroke-width", style.borderTopWidth);
            line.setAttribute("x1", node.offsetWidth);
            line.setAttribute("transform", "translate(" + node.offsetLeft + "," + node.offsetTop + ")");
            parentG.appendChild(line);
        }

        var g = document.createElementNS(namespaceURI, "g");
        parentG.appendChild(g);

        if (legend instanceof ComposedLegend) {
            legend._legends.forEach(function(legend) {
                ret = ret.concat(processLegend(legend, g));
            });
        } else {
            g.setAttribute("transform", "translate(" + node.offsetLeft + "," + node.offsetTop + ")");
            g.appendChild(node.firstChild.firstChild.cloneNode(true));

            if (legend instanceof ImageLegend) {
                Array.prototype.forEach.call(g.querySelectorAll("image"), function(imageNode) {
                    ret.push(processImage(imageNode));
                });
            }
        }

        return ret;
    }

    return function(map, parentG, guid) {
        var promises = [];
        var legendManager = map._legendManager;
        var rootNode = legendManager._rootNode;
        if (rootNode.style.display !== "none") {
            var document = parentG.ownerDocument;
            var namespaceURI = parentG.namespaceURI;

            var g = document.createElementNS(namespaceURI, "g");
            parentG.appendChild(g);
            g.setAttribute("transform", "translate(" + rootNode.offsetLeft + "," + rootNode.offsetTop + ")");

            var borders = document.createElementNS(namespaceURI, "rect");
            g.appendChild(borders);

            borders.setAttribute("width", rootNode.offsetWidth);
            borders.setAttribute("height", rootNode.offsetHeight);

            var clipPath = document.createElementNS(namespaceURI, "clipPath");
            g.appendChild(clipPath);
            var clipPathId = "legends-clipPath-" + guid;
            clipPath.setAttribute("id", clipPathId);
            clipPath.appendChild(borders.cloneNode());

            g.setAttribute("clip-path", "url(#" + clipPathId + ")");

            var style = window.getComputedStyle(rootNode, null);
            borders.setAttribute("fill", style.backgroundColor);
            borders.setAttribute("stroke", style.borderTopColor);
            borders.setAttribute("stroke-width", style.borderTopWidth);

            var isFirst = true;

            legendManager._legends.forEach(function(legend) {
                var node = legend.node();
                if (node.style.display === "none") {
                    return;
                }

                promises = promises.concat(processLegend(legend, g, !isFirst));
                isFirst = false;
            });
        }
        return $.when.apply(null, promises).then(function() {
            var hovers = parentG.querySelectorAll(".v-hovershadow");
            for (var i = 0, len = hovers.length; i < len; i++) {
                var hover = hovers[i];
                hover.parentNode.removeChild(hover);
            }
        });
    };
});
define('sap/viz/geo/export/text',[],function() {
    return function(textNode, g) {
        if (!textNode) {
            return;
        }
        var textContent = textNode.textContent;
        if (textContent === "" || (textNode.style && textNode.style.display === "none")) {
            return;
        }

        var document = g.ownerDocument;
        var namespaceURI = g.namespaceURI;
        var svgTextNode = document.createElementNS(namespaceURI, "text");
        svgTextNode.textContent = textNode.textContent;
        var textNodeStyle = window.getComputedStyle(textNode, null);
        svgTextNode.setAttribute("font-family", textNodeStyle.fontFamily);
        svgTextNode.setAttribute("font-size", textNodeStyle.fontSize);
        svgTextNode.setAttribute("font-weight", textNodeStyle.fontWeight);
        svgTextNode.setAttribute("fill", textNodeStyle.color);
        svgTextNode.setAttribute("transform", "translate(" + textNode.offsetLeft + "," +
            (textNode.offsetTop + textNode.offsetHeight) + ")");
        g.appendChild(svgTextNode);
    };
});
define('sap/viz/geo/export/marker',[
    "sap/viz/geo/export/processImage",
    "sap/viz/geo/export/text"
], function(
    processImage,
    text
) {
    return function(element, g) {
        var d = d3.select(element).datum(), prop = d.layer.viz().properties();
        if (d.isCluster) {
            prop = prop.cluster;
        }

        var imageNode = element.querySelector("img");

        return processImage(prop.url, g, [
            imageNode.width, imageNode.height
        ]).then(
            function(svgImageNode) {
                if (svgImageNode) {
                    svgImageNode.setAttribute("transform", "translate(" + imageNode.offsetLeft + "," +
                        imageNode.offsetTop + ")");
                }
                text(element.querySelector(".labelContainer span.label"), g);
                text(element.querySelector(".dataLabelContainer span.dataLabel"), g);
            });
    };
});
define('sap/viz/geo/export/svgOverlay',[],function() {
    return function(svg, targetG, parseClassName) {
        var childNodes = svg.childNodes;
        for (var j = 0, childNodesLen = childNodes.length; j < childNodesLen; j++) {
            targetG.appendChild(childNodes[j].cloneNode(true));
        }

        parseClassName("mainShape", targetG);
    };
});
define('sap/viz/geo/export/bubble',[
    "sap/viz/geo/export/svgOverlay",
    "sap/viz/geo/export/text",
    "sap/viz/geo/export/processImage", 
    "jquery"
], function(
    svgOverlay,
    text,
    processImage,
    $
) {
    return function(element, g, parseClassName) {
        var promise;
        svgOverlay(element.firstChild.firstChild, g, parseClassName);
        var mainShape = g.querySelector("." + parseClassName("mainShape"));
        mainShape.setAttribute("class", mainShape.getAttribute("class") + " " + parseClassName("bubble-mainShape"));
        parseClassName("extraBorder", g);

        var labelContainerG = g.appendChild(g.ownerDocument.createElementNS(g.namespaceURI, "g"));
        var labelContainer = element.querySelector(".dataLabelContainer");
        if (labelContainer) {
            text(labelContainer.querySelector("span.dataLabel.color"), labelContainerG);
            text(labelContainer.querySelector("span.dataLabel.measure"), labelContainerG);
            text(labelContainer.querySelector("span.dataLabel.location"), labelContainerG);
            var warningIcon = labelContainer.querySelector(".warningIcon.show");
            if (warningIcon) {
                var bgImg = window.getComputedStyle(warningIcon, null).backgroundImage;
                bgImg = bgImg.substring(4, bgImg.length - 1);
                var c = bgImg.charAt(0);
                if (c === '"' || c === "'") {
                    bgImg = bgImg.substring(1, bgImg.length - 1);
                }
                promise = processImage(bgImg, labelContainerG).then(
                    function(svgImgNode) {
                        if (svgImgNode) {
                            svgImgNode.setAttribute("transform", "translate(" + warningIcon.offsetLeft + "," +
                                warningIcon.offsetTop + ")");
                        }
                    });
            }
        }

        return $.when(promise);
    };
});
define('sap/viz/geo/export/overlays',[
    "jquery", "sap/viz/geo/export/marker", "sap/viz/geo/export/svgOverlay", "sap/viz/geo/export/bubble",
    "sap/viz/geo/export/text"
], function($, marker, svgOverlay, bubble, text) {
    return function(map, parentG, parseClassName) {
        var document = parentG.ownerDocument;
        var namespaceURI = parentG.namespaceURI;

        var promises = [];
        var overlaysPane = map._overlaysPane._dom;
        parentG.setAttribute("transform", "translate(" + overlaysPane.offsetLeft + "," + overlaysPane.offsetTop + ")");
        var elements = overlaysPane.childNodes;
        for (var i = 0, len = elements.length; i < len; i++) {
            var element = elements[i];

            if (window.getComputedStyle(element, null).visibility === "hidden") {
                continue;
            }

            var g = parentG.appendChild(document.createElementNS(namespaceURI, "g"));
            g.setAttribute("transform", "translate(" + element.offsetLeft + "," + element.offsetTop + ")");

            var firstChild = element.firstChild, classList = firstChild.getAttribute("class").split(" ");

            if (classList.indexOf("choropleth") !== -1) {
                svgOverlay(firstChild, g, parseClassName);
                text(element.querySelector(".dataLabelContainer span.dataLabel.measure"), g);
                text(element.querySelector(".dataLabelContainer span.dataLabel.location"), g);
            } else if (classList.indexOf("bubble") !== -1) {
                promises.push(bubble(element, g, parseClassName));
            } else if (classList.indexOf("marker") !== -1) {
                promises.push(marker(element, g));
            } else if (classList.indexOf("pie") !== -1) {
                svgOverlay(firstChild, g, parseClassName);
                text(element.querySelector(".dataLabelContainer span.dataLabel.color"), g);
                text(element.querySelector(".dataLabelContainer span.dataLabel.measure"), g);
                text(element.querySelector(".dataLabelContainer span.dataLabel.location"), g);
            }
        }

        return $.when.apply(null, promises);
    };
});

define('sap/viz/geo/export/guid',[
    "sap/viz/framework/common/util/ObjectUtils"
], function(ObjectUtils) {
    return ObjectUtils.guid;
});
define('sap/viz/geo/export/css',[],function() {
    var cssText = ".mainShape{0}{opacity: 0.8;stroke-width: 1px;stroke: #fff;}";
    cssText += " .extraBorder{0}{opacity:0.25;}";

    return function(guid, svg) {
        var surfix = "-" + guid;
        svg.appendChild(svg.ownerDocument.createElementNS(svg.namespaceURI, "style")).textContent = cssText.replace(
            /\{0\}/g, surfix);
        return function(name, dom) {
            var newName = name + surfix;
            if (!dom) {
                return newName;
            }

            var els = dom.querySelectorAll("." + name);
            for (var i = 0, len = els.length; i < len; i++) {
                var el = els[i];
                el.setAttribute("class", el.getAttribute("class").split(" ").map(function(n) {
                    return n === name ? newName : name;
                }).join(" "));
            }
        };
    };
});
define('sap/viz/geo/export/svg',[
    'sap/viz/geo/basemap/esri/Provider',
    'sap/viz/geo/basemap/cvom/Provider',
    "sap/viz/geo/export/esriBaseMap",
    "sap/viz/geo/export/cvom",
    "sap/viz/geo/export/legends",
    "sap/viz/geo/export/overlays",
    "sap/viz/geo/export/guid",
    "sap/viz/geo/export/css",
    "jquery",
    "exports"
], function(
    EsriProvider,
    CVOMProvider,
    esri,
    cvom,
    legends,
    overlays,
    guidGen,
    css,
    $
) {

    var xmlSerializer;

    var svgNS = 'http://www.w3.org/2000/svg';

    return function(map, options) {
        var d = $.Deferred();
        var baseMap = map.baseMap();
        var mapExporter;
        
        if (baseMap instanceof EsriProvider) {
            mapExporter = esri;
        }else if(baseMap instanceof CVOMProvider) {
            mapExporter = cvom;
        }
        
        if (mapExporter) {
            options = options || {};

            var mapSize = map.size(), mapW = mapSize.width, mapH = mapSize.height;
            var w = options.width || mapW, h = options.height || mapH;
            var svgDoc = document.implementation.createDocument(svgNS, 'svg', null);
            var svg = svgDoc.documentElement;
            svg.setAttribute("width", w);
            svg.setAttribute("height", h);
            svg.setAttribute("viewBox", "0 0 " + mapW + " " + mapH);

            svg.appendChild(map._effectManager.container().node().cloneNode(true));

            var guid = guidGen();
            var cssFn = css(guid, svg);

            var clipPath = document.createElementNS(svgNS, "clipPath");
            svg.appendChild(clipPath);
            var clipPathId = "global-clipPath-" + guid;
            clipPath.setAttribute("id", clipPathId);
            var rect = clipPath.appendChild(document.createElementNS(svgNS, "rect"));
            rect.setAttribute("width", mapW);
            rect.setAttribute("height", mapH);

            var g = svg.appendChild(svgDoc.createElementNS(svgNS, "g"));
            g.setAttribute("clip-path", "url(#" + clipPathId + ")");
            g.setAttribute("text-rendering", "geometricPrecision");

            var promises = [
                mapExporter(baseMap, g.appendChild(svgDoc.createElementNS(svgNS, "g")))
            ];

            promises.push(overlays(map, g.appendChild(svgDoc.createElementNS(svgNS, "g")), cssFn));

            if (!options.hideTitleLegend) {
                promises.push(legends(map, g.appendChild(svgDoc.createElementNS(svgNS, "g")), guid));
            }

            $.when.apply(null, promises).then(function() {
                d.resolve((xmlSerializer || (xmlSerializer = new window.XMLSerializer())).serializeToString(svg));
            }, function(e) {
                d.reject(e);
            });
        } else {
            d.reject(new Error("only support exporting the map with esri/cvom as map provider"));
        }

        return d.promise();
    };
});
(function(){
    var list = define && define.__autoLoad;
    if(list && list.length){
        define.__autoLoad = [];
        require(list);
    }
})();
sap.viz.extapi.env.Language.register({id:'language',value: {IDS_OCEAN_NAME_PACIFIC:"Pacific Ocean",IDS_OCEAN_NAME_ATLANTIC:"Atlantic Ocean",IDS_GEOAGGREGATED_LOCATIONS:"Aggregated locations",IDS_GEOCLUSTERED_LOCATIONS:"Clustered locations",IDS_GEOCOLOR:"Color",IDS_NORMAL_MAP:"Normal",IDS_ZOOM_OUT:"Zoom out",IDS_ZOOM_IN:"Zoom in",IDS_SATELLITE_MAP:"Satellite",IDS_RESET:"Reset",IDS_GEOMAP:"Geo Map",IDS_GEOLOCATION:"Location",IDS_SATELLITE:"Satellite",IDS_OCEAN_NAME_ARCTIC:"Arctic Ocean",IDS_MARQUEE_SELECTION:"Marquee selection",IDS_MULTIGEOBUBBLE:"Multiple Geo Bubble Chart",IDS_GEOBUBBLE:"Geo Bubble Chart",IDS_TOPO:"Topo",IDS_GEOFEATURES:"Geo Features",IDS_GEOFEATURESANALYSIS:"Geo Feature Analysis",IDS_CHOROPLETH:"Geo Choropleth Chart",IDS_GEOETC:"...",IDS_GEOCLUSTERED:"clustered",IDS_STREETS:"Streets",IDS_NORMAL_XBASE:"XBase",IDS_GEOFEATURESVALUES:"Geo Feature Values",IDS_TERRAIN_MAP:"Terrain",IDS_OCEAN_NAME_SOUTHERN:"Southern Ocean",IDS_GEOPIE:"Geo Pie Chart",IDS_GRAY:"Gray",IDS_MULTICHOROPLETH:"Multiple Geo Choropleth Chart",IDS_OCEAN_NAME_INDIAN:"Indian Ocean",IDS_GEOCLUSTER:"Cluster",}});if(define && define.__exportNS){
    define = define.__exportNS;
}
if (window.__sap_viz_internal_requirejs_nextTick__ !== undefined) {
    if (requirejs && requirejs.s && requirejs.s.contexts && requirejs.s.contexts._) {
        requirejs.s.contexts._.nextTick = window.__sap_viz_internal_requirejs_nextTick__;
    }
    window.__sap_viz_internal_requirejs_nextTick__ = undefined;
}if(!sap){
    window.sap={};
}
if(!sap.viz){
    sap.viz={};
}
if(!sap.viz.api){
    sap.viz.api = {};
}
if(!sap.viz.extapi){
    sap.viz.extapi = {};
}

Object.defineProperty(sap.viz.api, 'VERSION', { value: '5.20.0', writable: false });
Object.defineProperty(sap.viz.extapi, 'VERSION', { value: '5.20.0', writable: false });