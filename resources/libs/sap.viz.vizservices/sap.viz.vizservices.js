/* SAP CVOM 4.0 © <2012-2014> SAP SE. All rights reserved. Build Version 1.1.0, Build context N/A */
if (requirejs && requirejs.s && requirejs.s.contexts && requirejs.s.contexts._) {
    window.__sap_viz_internal_requirejs_nextTick__ = requirejs.s.contexts._.nextTick;
    requirejs.s.contexts._.nextTick = function(fn) {fn();};
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
    var exportNamespaces = {
        'sap/viz/vizservices/service/bvr/BVRService' : 'sap/viz/vizservices/BVRService',
        'sap/viz/vizservices/service/feed/FeedService' : 'sap/viz/vizservices/FeedValidationService',
        'sap/viz/vizservices/service/binding/BindingService' : 'sap/viz/vizservices/__internal__/BindingService',
        'sap/viz/vizservices/service/property/PropertyService' : 'sap/viz/vizservices/__internal__/PropertyService',
        'sap/viz/vizservices/service/scale/ScaleService' : 'sap/viz/vizservices/__internal__/ScaleService',
        'sap/viz/vizservices/common/Version' : 'sap/viz/vizservices/VERSION'
    };
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
                    exportNamespace(exportNamespaces[mod.id] || mod.id, result);
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

define('sap/viz/vizservices/common/utils/OOUtil',[],function() {

    var OOUtil = {};

    /**
     * Extend class, superClz's constructor will be applied with no parameters.
     *
     * @para {function} subClz the sub class
     * @para {function} superClz the super class to be extended
     * @return {function} the extended subClz
     * @public
     * @static
     */
    OOUtil.extend = function(subClz, superClz) {
        var subClzPrototype = subClz.prototype;

        // add the superclass prototype to the subclass definition
        subClz.superclass = superClz.prototype;

        // copy prototype
        var F = function() {
        };
        F.prototype = superClz.prototype;

        subClz.prototype = new F();
        for(var prop in subClzPrototype) {
            if(subClzPrototype.hasOwnProperty(prop)) {
                subClz.prototype[prop] = subClzPrototype[prop];
            }
        }
        subClz.prototype.constructor = subClz;
        if(superClz.prototype.constructor == Object.prototype.constructor) {
            superClz.prototype.constructor = superClz;
        }
        return subClz;
    };
    return OOUtil;
});

define('sap/viz/vizservices/common/data/DatasetTypeConst',[], function() {
    /**
     * Dataset Types.
     */
    var DatasetTypeConst = {};    

    DatasetTypeConst.FLAT_TABLE ='FlatTableDataset';
 
    DatasetTypeConst.CROSS_TABLE ='CrossTableDataset';

    DatasetTypeConst.RAW ='RawDataset';
    
    DatasetTypeConst.ARRAY_FLAT_TABLE = 'ArrayOfFlatTableDataset';

    return DatasetTypeConst;
});

define('sap/viz/vizservices/common/metadata/MetadataBase',[
    'sap/viz/vizservices/common/data/DatasetTypeConst'
// @formatter:off
], function(DatasetTypeConst){
// @formatter:on
    /**
     * MetadataBase Class
     */
    var MetadataBase = function(raw) {
        this._raw = raw;
        this._support = {dataset : {}};
        this._support.dataset[DatasetTypeConst.CROSS_TABLE] = false;
        this._support.dataset[DatasetTypeConst.FLAT_TABLE] = false;
        this._bindingDefs = null;
    };

    MetadataBase.prototype.raw = function() {
        return this._raw;
    };

    MetadataBase.prototype.support = function() {
        return this._support;
    };

    MetadataBase.prototype.removeInvalidProperty = function(srcProperties) {
        var allProperties = this.getRawPropertiesDef();
        var type = this._raw.type;
        //Add internal properties
        this._removeInvalidProperty(srcProperties, allProperties);
    };
     
     MetadataBase.prototype.dataType = function() {
        if(!this._raw ){
            return null;
        }
        if(this._raw.dataType === "sap.viz.api.data.CrosstableDataset"){
            return DatasetTypeConst.CROSS_TABLE;
        } else if (this._raw.dataType === "sap.viz.api.data.FlatTableDataset") {
            return DatasetTypeConst.FLAT_TABLE;
        } else if(this._raw.dataType === "raw") {
            return DatasetTypeConst.RAW;
        } else {
            return null;
        }
    };

    return MetadataBase;
});

define('sap/viz/vizservices/common/feed/FeedConst',[],function() {
    var FeedConst = {};
    
    FeedConst.ID_TRELLIS_ROW = 'trellisRow';
    FeedConst.ID_TRELLIS_COLUMN = 'trellisColumn';
    FeedConst.ID_DATAFRAME = 'dataFrame';
    FeedConst.ID_TIME_AXIS = 'timeAxis';

    // Types on AnalysisObject
    FeedConst.TYPE_DIMENSION = 'Dimension';
    FeedConst.TYPE_MEASURE = 'Measure';
    FeedConst.TYPE_MND = 'MND';

    // DataTypes on AnalysisObject
    FeedConst.DATA_TYPE_STRING = 'String';
    FeedConst.DATA_TYPE_NUMBER = 'Number';
    FeedConst.DATA_TYPE_DATE = 'Date';
    
    return FeedConst;
});

define('sap/viz/vizservices/common/metadata/bindingdef/BindingDefConst',[],function() {
    var BindingDefConst = {};

    BindingDefConst.TYPE_DIMENSION = 'Dimension';
    BindingDefConst.TYPE_MEASURE = 'Measure';

    BindingDefConst.MND_MODE_NONE = 'none';
    BindingDefConst.MND_MODE_SUPPORT_EXCLUSIVELY = 'supportExclusively',
    BindingDefConst.MND_MODE_SUPPORT = 'support';
    
    return BindingDefConst;
});

define('sap/viz/vizservices/common/metadata/bindingdef/BindingDef',[
    'sap/viz/vizservices/common/metadata/bindingdef/BindingDefConst'
    ],
    function(
        BindingDefConst
        ) {
    /**
     * BindingDef Class
     *
     * @param {Object} settings
     *  id {String}
     *  name {String}
     *  type {String} Bindable analysis object type
     *      Enumeration: Dimension, Measure, universal
     *  min {int} Min number of binding analysis objects
     *  max {int} Max number of binding analysis objects
     *  mndEnumerable {Boolean} A flag indicate the measure def whether could enumerate as mnd
     *  mndMode {String} A flag indicate the dimension def whether accept the mnd
     *      Enumeration:
     *      none: Not support MND
     *      support: Support MND and dimensions
     *      supportExclusively: Support MND and MND will confict with other dimensions
     *  bvrMNDPriority {int} The smaller the higher priority when auto feeding
     *  bvrPriority {int} The smaller the higher priority when auto feeding
     */
    var BindingDef = function(settings) {
        this._id = settings.id;
        this._name = settings.name;

        this._type = settings.type;

        this._min = settings.min || 0;
        this._max = settings.max || Infinity;

        this._mndEnumerable = settings.mndEnumerable !== undefined ? settings.mndEnumerable : false;
        this._mndMode = settings.mndMode || BindingDefConst.MND_MODE_NONE;

        this._bvrPriority = settings.bvrPriority !== undefined ? settings.bvrPriority : Number.POSITIVE_INFINITY;
        this._bvrMNDPriority = settings.bvrMNDPriority !== undefined ? settings.bvrMNDPriority : Number.POSITIVE_INFINITY;
    };

    BindingDef.prototype.id = function() {
        return this._id;
    };

    BindingDef.prototype.name = function() {
        return this._name;
    };

    BindingDef.prototype.type = function() {
        return this._type;
    };

    BindingDef.prototype.min = function() {
        return this._min;
    };

    BindingDef.prototype.max = function() {
        return this._max;
    };

    BindingDef.prototype.mndEnumerable = function() {
        return this._mndEnumerable;
    };

    BindingDef.prototype.mndMode = function() {
        return this._mndMode;
    };

    BindingDef.prototype.bvrPriority = function() {
        return this._bvrPriority;
    };

    BindingDef.prototype.bvrMNDPriority = function() {
        return this._bvrMNDPriority;
    };

    BindingDef.prototype.equal = function(def) {
        var equal = true;
        equal = equal && this._id === def.id();
        equal = equal && this._name === def.name();
        equal = equal && this._type === def.type();
        equal = equal && this._min === def.min();
        equal = equal && this._max === def.max();
        equal = equal && this._mndMode === def.mndMode();
        equal = equal && this._bvrPriority === def.bvrPriority();
        equal = equal && this._bvrMNDPriority === def.bvrMNDPriority();
        return equal;
    };

    return BindingDef;
});

define('sap/viz/vizservices/common/metadata/bindingdef/InfoBindingDefAdaptor',[
// @formatter:off
    'sap/viz/vizservices/common/feed/FeedConst',
    'sap/viz/vizservices/common/metadata/bindingdef/BindingDef',
    'sap/viz/vizservices/common/metadata/bindingdef/BindingDefConst'
], function(FeedConst, BindingDef, BindingDefConst){
// @formatter:on
    var _rolesSorting = ['layout', 'mark', 'trellis', 'frame'];
    var _rolesSortingMND = ['mark', 'layout', 'trellis', 'frame'];

    return {
        'adapt' : function(infoDefs, type) {
            var sortedDefs = infoDefs.slice(0).sort(function(infoDef1, infoDef2) {
                if (infoDef1.role === 'trellis.rowCategory' && infoDef2.role === 'trellis.columnCategory') {
                    return -1;
                } else if (infoDef1.role === 'trellis.columnCategory' && infoDef2.role === 'trellis.rowCategory') {
                    return 1;
                } else {
                    return _rolesSorting.indexOf(infoDef1.role.split('.')[0]) - _rolesSorting.indexOf(infoDef2.role.split('.')[0]);
                }
            });
            var defs = [];
            infoDefs.forEach(function(infoDef) {
                defs.push(new BindingDef({
                    'id' : infoDef.id,
                    'name' : infoDef.name,
                    'type' : infoDef.type,
                    'min' : infoDef.min,
                    'max' : infoDef.max,
                    'mndEnumerable' : infoDef.type === BindingDefConst.TYPE_MEASURE && infoDef.role.split('.')[0] === 'layout',
                    'mndMode' : infoDef.acceptMND === true ? BindingDefConst.MND_MODE_SUPPORT : BindingDefConst.MND_MODE_NONE,
                    'bvrPriority' : sortedDefs.indexOf(infoDef),
                    'bvrMNDPriority' : _rolesSortingMND.indexOf(infoDef.role.split('.')[0]) * 1000 + sortedDefs.indexOf(infoDef)
                }));
            });

            return defs;
        }
    };
});


define('sap/viz/vizservices/common/metadata/InfoMetadata',[
// @formatter:off
    'sap/viz/vizservices/common/utils/OOUtil',
    'sap/viz/vizservices/common/metadata/MetadataBase',
    'sap/viz/vizservices/common/metadata/bindingdef/InfoBindingDefAdaptor',
    'sap/viz/vizservices/common/data/DatasetTypeConst',
    'require'
], function(
    OOUtil, 
    MetadataBase, 
    InfoBindingDefAdaptor, 
    DatasetTypeConst
) {
// @formatter:on
    /**
     * InfoMetadata Class
     */
    var InfoMetadata = function(settings) {
        InfoMetadata.superclass.constructor.apply(this, arguments);
        this._support.dataset[DatasetTypeConst.FLAT_TABLE] = true;

        this._isEnablePlayField = null;
    };
    OOUtil.extend(InfoMetadata, MetadataBase);

    InfoMetadata.prototype.getBindingDefs = function() {
        var isEnablePlayField = window.__sap_viz_internal_enable_play_field_for_all_charts === true;
        if ((isEnablePlayField !== this._isEnablePlayField) || !this._bindingDefs) {
            this._isEnablePlayField = isEnablePlayField;
            this._bindingDefs = InfoBindingDefAdaptor.adapt(this._raw.bindings, this._raw.type);
        }
        return this._bindingDefs;
    };
    InfoMetadata.prototype.getBindingDefsWithBVRSorting = function() {
        if (!this._bindingDefsWithBVRSorting) {
            this._bindingDefsWithBVRSorting = this.getBindingDefs().slice(0).sort(function(def1, def2){
                return def1.bvrPriority() - def2.bvrPriority();
            });
        }
        return this._bindingDefsWithBVRSorting;
    };

    // TODO
    InfoMetadata.prototype.getRawPropertiesDef = function() {
        return this._raw.properties;
    };

    InfoMetadata.prototype.getPropertiesDef = function() {
        if (!this._propertiesDef) {
            
            this._propertiesDef = InfoMetadata._adaptInfoPropertiesDef(this._raw.properties)
        }
        return this._propertiesDef;
    };
    InfoMetadata._adaptInfoPropertiesDef = function (rawProperties) {
        var retProp = {};
        for (var propKey in rawProperties) {
            if (rawProperties.hasOwnProperty(propKey)) {
                var propValue = rawProperties[propKey];
                if (propValue.hasOwnProperty('children')) {
                    retProp[propKey] = InfoMetadata._adaptInfoPropertiesDef(propValue.children);
                } else {
                    retProp[propKey] = null;
                }
            }
        }
        return retProp;
    };
    
    
    InfoMetadata.prototype.isBuiltIn = function() {
        return this._raw.isBuiltIn;
    };


    InfoMetadata.prototype.getName = function() {
        return this._raw.name || this._raw.type;
    };

    InfoMetadata.prototype._removeInvalidProperty = function(srcProperties, defaultProperties) {
        if (!defaultProperties) {
            return;
        }

        var propertyName;
        for (propertyName in srcProperties) {
            if (!defaultProperties.hasOwnProperty(propertyName)) {
                delete srcProperties[propertyName];
            } else if (!defaultProperties[propertyName].supportedValueType) {
                var children = defaultProperties[propertyName].children;
                if (children) {
                    this._removeInvalidProperty(srcProperties[propertyName], children);
                }
            }
        }
    };

    InfoMetadata.prototype.dataScale = function() {
        return this._raw.scales;
    };
    
    InfoMetadata.prototype.dataType = function() {
        var dataType = InfoMetadata.superclass.dataType.apply(this);
        if(dataType){
            return dataType;
        } else {
            return DatasetTypeConst.FLAT_TABLE;
        }
    };
    

    return InfoMetadata;
});

define('sap/viz/vizservices/common/metadata/bindingdef/VizFeedingDefAdaptor',[
// @formatter:off
    'sap/viz/vizservices/common/feed/FeedConst',
    'sap/viz/vizservices/common/metadata/bindingdef/BindingDef',
    'sap/viz/vizservices/common/metadata/bindingdef/BindingDefConst'
], function(
    FeedConst, 
    BindingDef,
    BindingDefConst
) {
// @formatter:on
    var VizFeedingDefAdaptor = {};

    VizFeedingDefAdaptor.adapt = function(feedingDefs) {
        var defs = [];
        feedingDefs.forEach(function(feedingDef, index, array) {
            if (feedingDef.id === 'multiplier') {
                defs = defs.concat(_adaptTrellis(feedingDef));
            } else if (feedingDef.type === BindingDefConst.TYPE_DIMENSION) {
                defs.push(_adaptDimension(feedingDef));
            } else if (feedingDef.type === BindingDefConst.TYPE_MEASURE) {
                defs.push(_adaptMeasure(feedingDef));
            }
        });
        return defs;
    };

    var _adaptMeasure = function(feedingDef) {
        return new BindingDef({
            'id' : feedingDef.id,
            'name' : feedingDef.name,
            'type' : BindingDefConst.TYPE_MEASURE,
            'min' : feedingDef.min,
            'max' : feedingDef.max,
            'mndEnumerable': true,
            'mndMode' : BindingDefConst.MND_MODE_NONE,
            'bvrPriority' : feedingDef.mgIndex,
            'bvrMNDPriority' : undefined
        });
    };

    var _adaptDimension = function(feedingDef) {
        var min = feedingDef.minStackedDims !== undefined ? feedingDef.minStackedDims : feedingDef.min;
        var max = feedingDef.maxStackedDims !== undefined ? feedingDef.maxStackedDims : Number.POSITIVE_INFINITY;
        var mnd = _adaptMND(feedingDef);
        return new BindingDef({
            'id' : feedingDef.id,
            'name' : feedingDef.name,
            'type' : BindingDefConst.TYPE_DIMENSION,
            'min' : min,
            'max' : max,
            'mndMode' : mnd.mode,
            'bvrPriority' : feedingDef.aaIndex,
            'bvrMNDPriority' : mnd.priority
        });
    };

    var _adaptTrellis = function(feedingDef) {
        var mnd = _adaptMND(feedingDef);
        return [new BindingDef({
            'id' : FeedConst.ID_TRELLIS_ROW,
            'name' : feedingDef.name,
            'type' : BindingDefConst.TYPE_DIMENSION,
            'min' : 0,
            'max' : 3,
            'mndMode' : mnd.mode,
            'bvrPriority' : Number.POSITIVE_INFINITY,
            'bvrMNDPriority' : mnd.priority
        }), new BindingDef({
            'id' : FeedConst.ID_TRELLIS_COLUMN,
            'name' : feedingDef.name,
            'type' : BindingDefConst.TYPE_DIMENSION,
            'min' : 0,
            'max' : 3,
            'mndMode' : mnd.mode,
            'bvrPriority' : Number.POSITIVE_INFINITY,
            'bvrMNDPriority' : mnd.priority
        })];
    };

    var _adaptMND = function(feedingDef) {
        var mode, priority;
        if (feedingDef.acceptMND !== undefined && feedingDef.acceptMND !== -1 && feedingDef.acceptMND !== false) {
            mode = feedingDef.max === 1 ? BindingDefConst.MND_MODE_SUPPORT_EXCLUSIVELY : BindingDefConst.MND_MODE_SUPPORT;
            priority = feedingDef.acceptMND * -1;
        } else {
            mode = BindingDefConst.MND_MODE_NONE;
            priority = undefined;
        }
        return {
            'mode' : mode,
            'priority' : priority
        };
    };

    return VizFeedingDefAdaptor;
});

define('sap/viz/vizservices/common/metadata/VizMetadata',[
// @formatter:off
    'sap/viz/vizservices/common/utils/OOUtil',
    'sap/viz/vizservices/common/metadata/MetadataBase',
    'sap/viz/vizservices/common/metadata/bindingdef/VizFeedingDefAdaptor',
    'sap/viz/vizservices/common/data/DatasetTypeConst'
], function(OOUtil, 
    MetadataBase, 
    VizFeedingDefAdaptor, 
    DatasetTypeConst
) {
// @formatter:on
    /**
     * VizMetadata Class
     */
    var VizMetadata = function() {
        VizMetadata.superclass.constructor.apply(this, arguments);
        
        this._support.dataset[DatasetTypeConst.CROSS_TABLE] = true;
    };
    OOUtil.extend(VizMetadata, MetadataBase);

    VizMetadata.prototype.getBindingDefs = function() {
        if (!this._bindingDefs) {
            this._bindingDefs = VizFeedingDefAdaptor.adapt(this._raw.allFeeds());
        }
        return this._bindingDefs;
    };
    VizMetadata.prototype.getBindingDefsWithBVRSorting = function() {
        if (!this._bindingDefsWithBVRSorting) {
            this._bindingDefsWithBVRSorting = this.getBindingDefs().slice(0).sort(function(def1, def2){
                return def1.bvrPriority() - def2.bvrPriority();
            });
        }
        return this._bindingDefsWithBVRSorting;
    };

    VizMetadata.prototype.getRawPropertiesDef = function() {
        return this._raw.allProperties();
    };

    VizMetadata.prototype.getPropertiesDef = function () {
        if (!this._propertiesDef) {

            this._propertiesDef = VizMetadata._adaptVizPropertiesDef(this._raw.allProperties())
        }
        return this._propertiesDef;
    };
    VizMetadata._adaptVizPropertiesDef = function (rawProperties) {
        var retProp = {};
        for (var propKey in rawProperties) {
            if (rawProperties.hasOwnProperty(propKey)) {
                var propValue = rawProperties[propKey];
                if (propValue.hasOwnProperty('name')) {
                    retProp[propKey] = null;
                } else {
                    retProp[propKey] = VizMetadata._adaptVizPropertiesDef(propValue);
                }
            }
        }
        return retProp;
    };
            
    VizMetadata.prototype.isBuiltIn = function() {
        return this._raw.isBuiltIn;
    };

    VizMetadata.prototype.getCategoryAxis = function() {
        return this._raw.categoryAxis;
    };

    VizMetadata.prototype.getValueAxis = function() {
        return this._raw.valueAxis;
    };

    VizMetadata.prototype.getName = function() {
        return this._raw.name;
    };

    VizMetadata.prototype._removeInvalidProperty = function(srcProperties, defaultProperties) {
        var propertyName;
        for (propertyName in srcProperties) {
            if (!defaultProperties.hasOwnProperty(propertyName)) {
                delete srcProperties[propertyName];
            } else if (!defaultProperties[propertyName].supportedValueType) {
                this._removeInvalidProperty(srcProperties[propertyName], defaultProperties[propertyName]);
            }
        }
    };

    VizMetadata.prototype.dataScale = function() {
        return this._raw.dataScale;
    };
    
    VizMetadata.prototype.dataType = function() {
        var dataType = VizMetadata.superclass.dataType.apply(this);
        if(dataType){
            return dataType;
        } else {
            return DatasetTypeConst.CROSS_TABLE;
        }
    };

    return VizMetadata;
});

define('sap/viz/vizservices/common/metadata/MetadataFactory',[
// @formatter:off
    'sap/viz/vizservices/common/metadata/InfoMetadata',
    'sap/viz/vizservices/common/metadata/VizMetadata'
], function(InfoMetadata, VizMetadata){
// @formatter:on
    var _cache = {};
    return {
        'get' : function(visualizationType) {
            if (_cache[visualizationType] !== undefined) {
                return _cache[visualizationType];
            }
            var raw, metadata = null;
            try {
                raw = sap.viz.api.metadata.Viz.get(visualizationType);
                if (raw && raw.type) {
                    metadata = new InfoMetadata(raw);
                }
            } catch(err) {
            }
            if (!metadata) {
                try {
                    raw = sap.viz.api.manifest.Viz.get(visualizationType);
                    if (raw && raw[0]) {
                        metadata = new VizMetadata(raw[0]);
                    }
                } catch(err) {
                }
            }
            return (_cache[visualizationType] = metadata);
        }
    };
});

define('sap/viz/vizservices/common/feed/FeedUtil',[
// @formatter:off
    'sap/viz/vizservices/common/feed/FeedConst',
    'sap/viz/vizservices/common/metadata/MetadataFactory'
], function( 
    FeedConst,
    MetadataFactory
) {
// @formatter:on
    /**
     * FeedUtil Class
     */
    var FeedUtil = {};

    FeedUtil.genFeedItem = function(id, values) {
        return {
            'id' : id,
            'values' : values
        };
    };

    FeedUtil.genAnalysisObject = function(id, type, dataType) {
        return {
            'id' : id,
            'type' : type,
            'dataType' : dataType
        };
    };

    FeedUtil.hasMND = function(feeds) {
        return FeedUtil.countAnalyses(feeds, FeedConst.TYPE_MND) > 0;
    };
    FeedUtil.countAnalyses = function(feeds, type) {
        var number = 0;

        for (var i = 0; i < feeds.length; i++) {
            var feed = feeds[i];
            var values = feed.values;
            if (type) {
                for (var j = 0; j < values.length; j++) {
                    var analysis = values[j];
                    if (analysis.type === type) {
                        number++;
                    }
                }
            } else {
                number += values.length;
            }
        }
        return number;
    };

    /**
     * Justify whether valus has mnd
     */
    FeedUtil.hasMNDInValues = function(values) {
        return (FeedUtil.indexOfMNDInValues(values) !== -1);
    };
    /**
     * Get mnd value index of values of src feedItem's values
     */
    FeedUtil.indexOfMNDInValues = function(values) {
        if (!values || !values.length) {
            return -1;
        }
        var indexMND = -1;
        for (var i = 0; i < values.length; i++) {
            var value/*AnalysisObject*/ = values[i];
            if (value.type === FeedConst.TYPE_MND) {
                indexMND = i;
                break;
            }
        }
        return indexMND;
    };

    /**
     * generate empty feeds if has empty fromFeeds
     * @param{String} vizType
     * @return{Object} emptyFeeds
     */
    FeedUtil.buildEmptyFeeds = function(visualizationType) {
        var metadata = MetadataFactory.get(visualizationType);
        var defs = metadata.getBindingDefs();
        var feeds = [];
        defs.forEach(function(def) {
            feeds.push(FeedUtil.genFeedItem(def.id(), []));
        });

        return feeds;
    };

    FeedUtil.merge = function(host, client) {
        var clientMap = FeedUtil._getFeedsValuesMap(client);
        for (var i = 0; i < host.length; i++) {
            // FeedItem
            var fi = host[i];
            if (clientMap[fi.id]) {
                fi.values = fi.values.concat(clientMap[fi.id]);
            }
        }
        return host;
    };

    FeedUtil._getFeedsValuesMap = function(feeds) {
        var feedsValuesMap = {};
        for (var i = 0; i < feeds.length; i++) {
            var feed = feeds[i];
            var id = feed.id;
            if (!feedsValuesMap[id]) {
                feedsValuesMap[id] = feed.values;
            } else {
                feedsValuesMap[id] = feedsValuesMap[id].concat(feed.values);
            }
        }
        return feedsValuesMap;
    };

    FeedUtil.getFeed = function(feeds, id) {
        for (var i = 0; i < feeds.length; i++) {
            var fi = feeds[i];
            if (fi.id === id) {
                return fi;
            }
        }
        return null;
    };

    FeedUtil.getFeedValues = function(feeds, id) {
        var feed = FeedUtil.getFeed(feeds, id);
        return feed ? feed.values : null;
    };

    FeedUtil.spliceAnalysisObjects = function(feeds, feedId, index, howMany, analysisObject1, analysisObject2) {
        var args = Array.prototype.slice.call(arguments, 2);
        var spliced = false;
        feeds.forEach(function(feedItem) {
            if (feedItem.id === feedId) {
                var values = feedItem.values || [];
                values.splice.apply(values, args);
                spliced = true;
            }
        });
        if (!spliced && analysisObject1) {
            var values = [];
            values.splice.apply(values, args);
            feeds.push(FeedUtil.genFeedItem(feedId, values));
        }
        return feeds;
    };

    FeedUtil.cloneFeeds = function(feedItems) {
        return JSON.parse(JSON.stringify(feedItems));
    };

    return FeedUtil;
});

// @formatter:off
define('sap/viz/vizservices/service/bvr/feeders/MNDFeeder',[
    'sap/viz/vizservices/common/metadata/MetadataFactory',
    'sap/viz/vizservices/common/feed/FeedUtil',
    'sap/viz/vizservices/common/metadata/bindingdef/BindingDefConst'
],
function(MetadataFactory, FeedUtils, BindingDefConst) {
// @formatter:on
    var MNDFeeder = {};
    MNDFeeder.feed = function(visualizationType, feeds, analysisObjects) {
        var i, def;
        var index = FeedUtils.indexOfMNDInValues(analysisObjects);
        if (index === -1 || FeedUtils.hasMND(feeds)) {
            return;
        }
        var mnd = analysisObjects.splice(index, 1)[0],values;
        // Get binding defs
        var defs = MetadataFactory.get(visualizationType).getBindingDefs();
        defs = defs.slice(0).sort(function(def1, def2) {
            return def1.bvrMNDPriority() - def2.bvrMNDPriority();
        });

        // Feed when min validate failed
        for ( i = 0; i < defs.length; i++) {
            def = defs[i];
            values = FeedUtils.getFeedValues(feeds, def.id());
            if (def.mndMode() !== BindingDefConst.MND_MODE_NONE && def.min() > values.length) {
                if (def.mndMode() === BindingDefConst.MND_MODE_SUPPORT || (def.mndMode() === BindingDefConst.MND_MODE_SUPPORT_EXCLUSIVELY && values.length === 0)) {
                    values.push(mnd);
                    return;
                }
            }
        }
        // Feed when empty
        for ( i = 0; i < defs.length; i++) {
            def = defs[i];
            values = FeedUtils.getFeedValues(feeds, def.id());
            if (def.mndMode() !== BindingDefConst.MND_MODE_NONE && values.length === 0) {
                values.push(mnd);
                return;
            }
        }
        // Feed to else
        for ( i = 0; i < defs.length; i++) {
            def = defs[i];
            values = FeedUtils.getFeedValues(feeds, def.id());
            if (def.mndMode() === BindingDefConst.MND_MODE_SUPPORT || (def.mndMode() === BindingDefConst.MND_MODE_SUPPORT_EXCLUSIVELY && values.length === 0)) {
                values.push(mnd);
                return;
            }
        }
    };
    return MNDFeeder;
});

define('sap/viz/vizservices/common/metadata/bindingdef/BindingDefUtils',[
// @formatter:off
    'sap/viz/vizservices/common/metadata/MetadataFactory',
    'sap/viz/vizservices/common/metadata/bindingdef/BindingDefConst',
    'sap/viz/vizservices/common/feed/FeedConst'
], function( 
    MetadataFactory,
    BindingDefConst,
    FeedConst
) {
// @formatter:on
    /**
     * BindingDef Class
     */
    var BindingDefUtils = {};

    BindingDefUtils.supportMND = function(visualizationType) {
        var support = false;
        var defs = MetadataFactory.get(visualizationType).getBindingDefs();
        defs.forEach(function(def) {
            support = support || (def.mndMode() !== BindingDefConst.MND_MODE_NONE);
        });
        return support;
    };

    BindingDefUtils.equal = function(visualizationType1, visualizationType2) {
        if (visualizationType1 === visualizationType2) {
            return true;
        }
        var metadata1 = MetadataFactory.get(visualizationType1), metadata2 = MetadataFactory.get(visualizationType2);
        if (metadata1 && metadata2) {
            var defs1 = metadata1.getBindingDefs(), defs2 = metadata2.getBindingDefs();
            if (defs1.length !== defs2.length) {
                return false;
            }
            var equal = true;
            defs1.forEach(function(def1, index, array) {
                equal = equal && def1.equal(defs2[index]);
            });
            return equal;
        } else {
            return false;
        }
    };

    BindingDefUtils.has = function(visualizationType, id) {
        return !!BindingDefUtils.get(visualizationType, id);
    };

    BindingDefUtils.get = function(visualizationType, id) {
        var got;
        var defs = MetadataFactory.get(visualizationType).getBindingDefs();
        defs.forEach(function(def) {
            if (!got && def.id() === id) {
                got = def;
            }
        });
        return got;
    };

    BindingDefUtils.support = function(def, analysisType) {
        if (def.type() === BindingDefConst.TYPE_DIMENSION) {
            if (def.mndMode() === BindingDefConst.MND_MODE_NONE) {
                return analysisType === FeedConst.TYPE_DIMENSION;
            } else {
                return analysisType === FeedConst.TYPE_DIMENSION || analysisType === FeedConst.TYPE_MND;
            }
        } else if (def.type() === BindingDefConst.TYPE_MEASURE) {
            return analysisType === FeedConst.TYPE_MEASURE;
        } else {
            return false;
        }
    };

    return BindingDefUtils;
});

define('sap/viz/vizservices/common/viz/ChartConst',[
], function() {
     /**
     * Chart Types.
     */
    var ChartConst = {};

    // Chart types
    ChartConst.TYPE_COLUMN = "info/column";

    /**
     * Stacked column chart, the dataset is sap.viz.api.data.FlatTableDataset.
     */
    ChartConst.TYPE_STACKED_COLUMN = "info/stacked_column";

    /**
     * Dual column chart, the dataset is sap.viz.api.data.FlatTableDataset.
     */
    ChartConst.TYPE_DUAL_COLUMN = "info/dual_column";

    /**
     * 3D column chart, the dataset is sap.viz.api.data.CrosstableDataset.
     */
    ChartConst.TYPE_3D_COLUMN = "viz/3d_column";

    /**
     * Time Line chart, the dataset is sap.viz.api.data.FlatTableDataset.
     */
    ChartConst.TYPE_TIMESERIES_LINE = "info/timeseries_line";

    /**
     * Time Line chart, the dataset is sap.viz.api.data.FlatTableDataset.
     */
    ChartConst.TYPE_TIMESERIES_SCATTER = "info/timeseries_scatter";

    /**
     * Time Line chart, the dataset is sap.viz.api.data.FlatTableDataset.
     */
    ChartConst.TYPE_TIMESERIES_BUBBLE = "info/timeseries_bubble";

    /**
     * Line chart, the dataset is sap.viz.api.data.FlatTableDataset.
     */
    ChartConst.TYPE_LINE = "info/line";

     /**
     * Area chart, the dataset is sap.viz.api.data.FlatTableDataset.
     */
    ChartConst.TYPE_AREA = "info/area";

     /**
     * Combination chart, the dataset is sap.viz.api.data.FlatTableDataset.
     */
    ChartConst.TYPE_COMBINATION = "info/combination";

     /**
     * Dual line chart, the dataset is sap.viz.api.data.FlatTableDataset.
     */
    ChartConst.TYPE_DUAL_LINE = "info/dual_line";

     /**
     * Dual combination chart, the dataset is sap.viz.api.data.FlatTableDataset.
     */
    ChartConst.TYPE_DUAL_COMBINATION = "info/dual_combination";
    
    /**
     * Combined stacked chart, the dataset is sap.viz.api.data.FlatTableDataset.
     */
    ChartConst.TYPE_STACKED_COMBINATION = "info/stacked_combination";
    
    /**
     * Combined horizontal stacked chart, the dataset is sap.viz.api.data.FlatTableDataset
     */
    ChartConst.TYPE_HORIZONTAL_STACKED_COMBINATION = "info/horizontal_stacked_combination";
    
      /**
     * Dual stacked combination chart, the dataset is sap.viz.api.data.FlatTableDataset.
     */
    ChartConst.TYPE_DUAL_STACKED_COMBINATION = "info/dual_stacked_combination";
   
    /**
     * Pie chart, the dataset is sap.viz.api.data.FlatTableDataset.
     */
    ChartConst.TYPE_PIE = "info/pie";

     /**
     * Donut chart, the dataset is sap.viz.api.data.FlatTableDataset.
     */
    ChartConst.TYPE_DONUT = "info/donut";

     /**
     * Pie with depth chart, the dataset is sap.viz.api.data.CrosstableDataset.
     */
    ChartConst.TYPE_PIE_WITH_DEPTH = "viz/pie_with_depth";

     /**
     * Scatter chart, the dataset is sap.viz.api.data.FlatTableDataset.
     */
    ChartConst.TYPE_SCATTER = "info/scatter";

     /**
     * Bubble chart, the dataset is sap.viz.api.data.FlatTableDataset.
     */
    ChartConst.TYPE_BUBBLE = "info/bubble";

     /**
     * Scatter matrix chart, the dataset is sap.viz.api.data.CrosstableDataset.
     */
    ChartConst.TYPE_SCATTER_MATRIX = "viz/scatter_matrix";

     /**
     * Heatmap chart, the dataset is sap.viz.api.data.CrosstableDataset.
     */
    ChartConst.TYPE_HEATMAP = "info/heatmap";


    ChartConst.TYPE_TREEMAP = "info/treemap";

     /**
     * @memberof sap.viz.controls.common.constants.ChartConst
     * @member TYPE_CROSSTAB
     * @static
     */
    ChartConst.TYPE_CROSSTAB = "viz/ext/crosstab";


     /**
     * Radar chart, the dataset is sap.viz.api.data.CrosstableDataset.
     */
    ChartConst.TYPE_RADAR = "viz/radar";

     /**
     * Boxplot chart, the dataset is sap.viz.api.data.CrosstableDataset.
     */
    ChartConst.TYPE_BOXPLOT = "viz/boxplot";

     /**
     * Waterfall chart, the dataset is sap.viz.api.data.CrosstableDataset.
     */
    ChartConst.TYPE_WATERFALL = "viz/waterfall";

     /**
     * Tag Cloud chart, the dataset is sap.viz.api.data.CrosstableDataset.
     */
    ChartConst.TYPE_TAG_CLOUD = "info/tagcloud";

     /**
     * Tree chart, the dataset is sap.viz.api.data.CrosstableDataset.
     */
    ChartConst.TYPE_TREE = "viz/tree";
     /**
     * Network chart, the dataset is sap.viz.api.data.CrosstableDataset.
     */
    ChartConst.TYPE_NETWORK = "viz/network";

     /**
     * funnel chart, the dataset is sap.viz.api.data.CrosstableDataset.
     */
    ChartConst.TYPE_FUNNEL = 'viz/ext/pa/funnel';
     /**
     */
    ChartConst.TYPE_PC = 'viz/ext/pa/pc';
    /**
     * Number chart, the dataset is sap.viz.api.data.CrosstableDataset.
     */
    ChartConst.TYPE_NUMBER = 'info/number';

    // Chart direction
    ChartConst.DIRECTION_HORIZONTAL = "horizontal";
    ChartConst.DIRECTION_VERTICAL = "vertical";

    // Chart stacking
    ChartConst.STACKING_FULL = "full";
    ChartConst.STACKING_NORMAL = "normal";

    // Peer charts
    /**
     * Bar chart, the dataset is sap.viz.api.data.FlatTableDataset.
     */
    ChartConst.TYPE_BAR = "info/bar";

    ChartConst.TYPE_BULLET = "info/bullet";
    ChartConst.TYPE_VERTICALBULLET = "info/vertical_bullet";

    /**
     * Stacked Bar chart, the dataset is sap.viz.api.data.FlatTableDataset.
     */
    ChartConst.TYPE_STACKED_BAR = "info/stacked_bar";
    ChartConst.TYPE_100_STACKED_COLUMN = "info/100_stacked_column";
    ChartConst.TYPE_100_STACKED_BAR = "info/100_stacked_bar";

    /**
     * Dual Bar chart, the dataset is sap.viz.api.data.FlatTableDataset.
     */
    ChartConst.TYPE_DUAL_BAR = "info/dual_bar";

    /**
     * 3D Bar chart, the dataset is sap.viz.api.data.CrosstableDataset.
     */
    ChartConst.TYPE_3D_BAR = "viz/3d_bar";

    ChartConst.TYPE_HORIZONTAL_LINE = "info/horizontal_line";

    ChartConst.TYPE_HORIZONTAL_AREA = "info/horizontal_area";
    ChartConst.TYPE_100_AREA = "info/100_area";
    ChartConst.TYPE_100_HORIZONTAL_AREA = "info/100_horizontal_area";

    ChartConst.TYPE_HORIZONTAL_COMBINATION = "info/horizontal_combination";

    ChartConst.TYPE_DUAL_HORIZONTAL_LINE = "info/dual_horizontal_line";

    ChartConst.TYPE_DUAL_HORIZONTAL_COMBINATION = "info/dual_horizontal_combination";
    
    ChartConst.TYPE_DUAL_HORIZONTAL_STACKED_COMBINATION = "info/dual_horizontal_stacked_combination";

    ChartConst.TYPE_HORIZONTAL_BOXPLOT = "viz/horizontal_boxplot";

    ChartConst.TYPE_HORIZONTAL_WATERFALL = "viz/horizontal_waterfall";

    /**
     * @memberof sap.viz.controls.common.constants.ChartConst
     * @member TYPE_MEKKO
     * @static
     */

    ChartConst.TYPE_MEKKO = "info/mekko";
    ChartConst.TYPE_100_MEKKO = "info/100_mekko";
    ChartConst.TYPE_HORIZONTAL_MEKKO = "info/horizontal_mekko";
    ChartConst.TYPE_100_HORIZONTAL_MEKKO = "info/100_horizontal_mekko";

    //Trellis chart
    ChartConst.TYPE_TRELLIS_BAR = "info/trellis_bar";
    ChartConst.TYPE_TRELLIS_LINE = "info/trellis_line";
    ChartConst.TYPE_TRELLIS_HORIZONTAL_LINE = "info/trellis_horizontal_line";
    ChartConst.TYPE_TRELLIS_COLUMN = "info/trellis_column";
    ChartConst.TYPE_TRELLIS_DUAL_COLUMN = "info/trellis_dual_column";
    ChartConst.TYPE_TRELLIS_DUAL_LINE = "info/trellis_dual_line";
    ChartConst.TYPE_TRELLIS_DUAL_HORIZONTAL_LINE = "info/trellis_dual_horizontal_line";
    ChartConst.TYPE_TRELLIS_DUAL_BAR = "info/trellis_dual_bar";
    ChartConst.TYPE_TRELLIS_SCATTER = "info/trellis_scatter";
    ChartConst.TYPE_TRELLIS_BUBBLE = "info/trellis_bubble";
    ChartConst.TYPE_TRELLIS_100_STACKED_COLUMN = "info/trellis_100_stacked_column";
    ChartConst.TYPE_TRELLIS_STACKED_COLUMN = "info/trellis_stacked_column";
    ChartConst.TYPE_TRELLIS_STACKED_BAR = "info/trellis_stacked_bar";
    ChartConst.TYPE_TRELLIS_100_STACKED_BAR = "info/trellis_100_stacked_bar";
    //ChartConst.TYPE_TRELLIS_COMBINATION = "info/trellis_combination";
    //ChartConst.TYPE_TRELLIS_HORIZONTAL_COMBINATION = "info/trellis_horizontal_combination";
    ChartConst.TYPE_TRELLIS_PIE = "info/trellis_pie";
    ChartConst.TYPE_TRELLIS_DONUT = "info/trellis_donut";
    ChartConst.TYPE_TRELLIS_PIE_WITH_DEPTH = "viz/multi_pie_with_depth";
    ChartConst.TYPE_TRELLIS_AREA = "info/trellis_area";
    ChartConst.TYPE_TRELLIS_HORIZONTAL_AREA = "info/trellis_horizontal_area";
    ChartConst.TYPE_TRELLIS_100_AREA = "info/trellis_100_area";
    ChartConst.TYPE_TRELLIS_100_HORIZONTAL_AREA = "info/trellis_100_horizontal_area";

    // Chart feeding
    ChartConst.FEEDING_PRIMARY_VALUES = "primaryValues";
    ChartConst.FEEDING_SECONDARY_VALUES = "secondaryValues";
    ChartConst.FEEDING_AXIS_LABELS = "axisLabels";

    ChartConst.MEASURE_NAMES_DIMENSION = "measureNamesDimension";
    ChartConst.MEASURE_VALUES_GROUP = "measureValuesGroup";
    ChartConst.ANALYSIS_AXIS = "analysisAxis";

    // infoChart feeding
    ChartConst.VALUE_AXIS = "valueAxis";
    ChartConst.SECOND_VALUE_AXIS = "valueAxis2";
    ChartConst.CATEGORY_AXIS = "categoryAxis";
    ChartConst.TIME_AXIS = "timeAxis";
    ChartConst.SIZE = "size";
    ChartConst.WEIGHT = "weight";

    ChartConst.INVALID = "Invalid";

    // Chart axis
    ChartConst.AXIS_XAXIS = "xAxis";
    ChartConst.AXIS_XAXIS1 = "xAxis1";
    ChartConst.AXIS_XAXIS2 = "xAxis2";
    ChartConst.AXIS_YAXIS = "yAxis";
    ChartConst.AXIS_YAXIS1 = "yAxis1";
    ChartConst.AXIS_YAXIS2 = "yAxis2";
    ChartConst.COLOR = "color";
    ChartConst.DATA_FRAME = "dataFrame";
    ChartConst.TEMPLATE_INCOMPLETE = "incomplete_ghost";
    ChartConst.TEMPLATE_DEFAULT = "default";
    ChartConst.TEMPLATE_EMPTY = "empty_ghost";
    ChartConst.PLAY_FIELD = "playField";
    ChartConst.SHAPE = "shape";
    ChartConst.TITLE = "title";

    ChartConst.KEY_COUNT = "__keysCount";

    //bit operation
    ChartConst.TRELLIS_NONE = 0;
    ChartConst.TRELLIS_COLUMN = 1;
    ChartConst.TRELLIS_ROW = 2;
    ChartConst.TRELLIS_COLUMN_AND_ROW = 3;

    return ChartConst;
});

// @formatter:off
define('sap/viz/vizservices/service/bvr/feeders/TimeFeeder',[
    'sap/viz/vizservices/common/feed/FeedConst',
    'sap/viz/vizservices/common/metadata/MetadataFactory',
    'sap/viz/vizservices/common/metadata/bindingdef/BindingDefUtils',
    'sap/viz/vizservices/common/viz/ChartConst'
], 
function(FeedConst, 
    MetadataFactory, 
    BindingDefUtils, 
    ChartConst
) {
// @formatter:on
    function isTimeSeriesType(type){
        return [
            ChartConst.TYPE_TIMESERIES_LINE,
            ChartConst.TYPE_TIMESERIES_SCATTER,
            ChartConst.TYPE_TIMESERIES_BUBBLE
        ].indexOf(type) >= 0;
    }
    var TimeFeeder = {};
    TimeFeeder.feed = function(visualizationType, feeds, analysisObjects) {
        if (!isTimeSeriesType(visualizationType)) {
            return;
        }
        var feed, i;
        for ( i = 0; i < feeds.length; i++) {
            if (feeds[i].id === FeedConst.ID_TIME_AXIS) {
                feed = feeds[i];
            }
        }
        if (!feed) {
            return;
        }
        var bindingDef = BindingDefUtils.get(visualizationType, feed.id);
        if (feed.values.length >= bindingDef.max) {
            return;
        }

        for ( i = 0; i < analysisObjects.length; i++) {
            if (analysisObjects[i].dataType === FeedConst.DATA_TYPE_DATE) {
                feed.values = [analysisObjects[i]];
                analysisObjects.splice(i, 1);
                break;
            }
        }
    };
    return TimeFeeder;
});

// @formatter:off
define('sap/viz/vizservices/service/feed/validators/AAValidator',[
    'sap/viz/vizservices/common/feed/FeedConst',
    'sap/viz/vizservices/common/feed/FeedUtil',
    'sap/viz/vizservices/common/viz/ChartConst',
    'sap/viz/vizservices/common/metadata/bindingdef/BindingDefConst'
], function(
    FeedConst, 
    FeedUtils, 
    ChartConst,
    BindingDefConst
) {
// @formatter:on
    var AAValidator = {};

    AAValidator.validate = function(defs, feedItems) {
        var numPreFilledAA = 0;
        defs.forEach(function(def) {
            if (def.type() === BindingDefConst.TYPE_DIMENSION) {
                var values = FeedUtils.getFeedValues(feedItems, def.id()) || [];
                if (values.length === 0 && def.min() > 0) {
                    if (def.mndMode() === BindingDefConst.MND_MODE_NONE || FeedUtils.hasMND(feedItems)) {
                        numPreFilledAA++;
                    }
                }
            }
        });
        return (_countAAOfFeeds(feedItems) + numPreFilledAA) <= 2;
    };

    var _countAAOfFeeds = function(feedItems) {
        var numDimension = 0;
        var numMultiplier = 0;
        for (var i = 0; i < feedItems.length; i++) {
            var feedItem = feedItems[i];
            if (_countAAOfFeedItem(feedItem)) {
                if (feedItem.id === FeedConst.ID_TRELLIS_ROW || feedItem.id === FeedConst.ID_TRELLIS_COLUMN) {
                    numMultiplier = Math.min(1, numMultiplier + 1);
                } else {
                    numDimension++;
                }
            }
        }
        //CVOM CrossTab DataSet limitation: Max Dimension set count is 2.
        return (numMultiplier + numDimension);
    };
    var _countAAOfFeedItem = function(feedItem) {
        if (!feedItem || !( feedItem.values && feedItem.values.length > 0 ) || feedItem.id === ChartConst.DATA_FRAME) {
            return 0;
        }
        var values = feedItem.values;
        return _countAAOfValues(values);
    };

    var _countAAOfValues = function(values) {
        if (!values || !values.length) {
            return 0;
        }
        var hasMND = FeedUtils.hasMNDInValues(values);
        if (values[0].type === FeedConst.TYPE_MND && values.length === 1) {
            return 0;
        } else if (values[0].type === FeedConst.TYPE_DIMENSION || values[0].type === FeedConst.TYPE_MND){
            return 1;
        } else {
            return 0;
        }
    };
    return AAValidator;
});

// @formatter:off
define('sap/viz/vizservices/service/feed/validators/DuplicateValidator',[
    'sap/viz/vizservices/common/feed/FeedUtil'
], 
function(FeedUtils) {
// @formatter:on
    var DuplicateValidator = {};
    DuplicateValidator.validate = function(defs, feedItems) {
        var validate = true;
        var trellisValues = [], trellisDef;
        defs.forEach(function(def) {
            var values = FeedUtils.getFeedValues(feedItems, def.id()) || [];
            validate = validate && _validateOne(def, values);
        });

        return validate;
    };
    /**
     * Validate whether number of analysis objects exceed the max
     *
     * @param {Object} def
     * @param {Object} analysisObjects
     */
    var _validateOne = function(def, analysisObjects) {
        var validate = true, map = {};
        analysisObjects.forEach(function(analysisObject) {
            var id = analysisObject.id;
            if (map[id]) {
                validate = false;
            }
            map[id] = true;
        });
        return validate;
    };
    return DuplicateValidator;
});

// @formatter:off
define('sap/viz/vizservices/service/feed/validators/TypeValidator',[
    'sap/viz/vizservices/common/feed/FeedConst',
    'sap/viz/vizservices/common/feed/FeedUtil',
    'sap/viz/vizservices/common/metadata/bindingdef/BindingDefUtils'
], function(
    FeedConst, 
    FeedUtils,
    BindingDefUtils
) {
// @formatter:on
    var TypeValidator = {};
    TypeValidator.validate = function(defs, feedItems) {
        var validate = true;
        defs.forEach(function(def) {
            var values = FeedUtils.getFeedValues(feedItems, def.id()) || [];
            validate = validate && _validateOne(def, values);
        });
        return validate;
    };
    
    var _validateOne = function(def, analysisObjects) {
        var validate = true;
        analysisObjects.forEach(function(analysisObject) {
            validate = validate && BindingDefUtils.support(def, analysisObject.type);

            // Check for the time_series chart, the analysisObject's dataType of time_series chart must be "date"
            if (def.id() === FeedConst.ID_TIME_AXIS) {
                validate = validate && (analysisObject.dataType === FeedConst.DATA_TYPE_DATE);
            }
        });
        return validate;
    };


    return TypeValidator;
});

// @formatter:off
define('sap/viz/vizservices/service/feed/validators/MaxValidator',[
    'sap/viz/vizservices/common/feed/FeedUtil'
], 
function(FeedUtils) {
// @formatter:on
    var MaxValidator = {};
    MaxValidator.validate = function(defs, feedItems) {
        var validate = true;
        var numRemainingAnalyses = FeedUtils.countAnalyses(feedItems);
        defs.forEach(function(def) {
            var values = FeedUtils.getFeedValues(feedItems, def.id()) || [];
            validate = validate && _validateOne(def, values);
            numRemainingAnalyses -= values.length;
        });
	validate = validate && numRemainingAnalyses === 0;
        return validate;
    };
    var _validateOne = function(def, analysisObjects) {
        var length = analysisObjects.length;
        if (FeedUtils.hasMNDInValues(analysisObjects)) {
            length = length - 1;
        }
        return length <= def.max();
    };
    return MaxValidator;
});

// @formatter:off
define('sap/viz/vizservices/service/feed/validators/MinValidator',[
    'sap/viz/vizservices/common/feed/FeedUtil'
], 
function(FeedUtils) {
// @formatter:on
    var MinValidator = {};
    MinValidator.validate = function(defs, feedItems) {
        var validate = true;
        defs.forEach(function(def) {
            validate = validate && _validateOne(def, FeedUtils.getFeedValues(feedItems, def.id()) || []);
        });
        return validate;
    };
    var _validateOne = function(def, analysisObjects) {
        var length = analysisObjects.length;
        return length >= def.min();
    };
    return MinValidator;
});

// @formatter:off
define('sap/viz/vizservices/service/feed/validators/MNDValidator',[
    'sap/viz/vizservices/common/feed/FeedConst',
    'sap/viz/vizservices/common/feed/FeedUtil',
    'sap/viz/vizservices/common/metadata/bindingdef/BindingDefConst'
], function( 
    FeedConst, 
    FeedUtils,
    BindingDefConst
) {
// @formatter:on
    var MNDValidator = {};
    MNDValidator.validate = function(defs, feedItems) {
        var validate = true;

        // Enable MND when measure fed
        var numMeasures = 0;
        defs.forEach(function(def) {
            if (def.mndEnumerable()) {
                var values = FeedUtils.getFeedValues(feedItems, def.id()) || [];
                numMeasures += values.length;
            }
        });
        if (FeedUtils.countAnalyses(feedItems, FeedConst.TYPE_MND) > (numMeasures > 0 ? 1 : 0)) {
            return false;
        }
        // Validate
        var trellisValues = [], trellisDef;
        defs.forEach(function(def) {
            if (def.type() === BindingDefConst.TYPE_DIMENSION) {
                var values = FeedUtils.getFeedValues(feedItems, def.id()) || [];
                if ((def.id() === FeedConst.ID_TRELLIS_ROW || def.id() === FeedConst.ID_TRELLIS_COLUMN)) {
                    trellisValues = trellisValues.concat(values);
                    trellisDef = def;
                } else {
                    validate = validate && _validateOne(def, values);
                }
            }
        });

        if (trellisDef) {
            validate = validate && _validateOne(trellisDef, trellisValues);
        }
        return validate;
    };
    /**
     * Validate whether number of analysis objects exceed the max
     *
     * @param {Object} def
     * @param {Object} analysisObjects
     */
    var _validateOne = function(def, analysisObjects) {
        if (FeedUtils.hasMNDInValues(analysisObjects)) {
            if (def.mndMode() === BindingDefConst.MND_MODE_NONE) {
                return false;
            } else if (def.mndMode() === BindingDefConst.MND_MODE_SUPPORT_EXCLUSIVELY) {
                return analysisObjects.length === 1;
            }
        }
        return true;
    };
    return MNDValidator;
});

// @formatter:off
define('sap/viz/vizservices/service/feed/FeedService',[
    'sap/viz/vizservices/common/metadata/bindingdef/BindingDefUtils',
    'sap/viz/vizservices/common/metadata/bindingdef/BindingDefConst',
    'sap/viz/vizservices/common/feed/FeedUtil',
    'sap/viz/vizservices/common/feed/FeedConst',
    'sap/viz/vizservices/common/data/DatasetTypeConst',
    'sap/viz/vizservices/common/metadata/MetadataFactory',
    'sap/viz/vizservices/service/feed/validators/AAValidator',
    'sap/viz/vizservices/service/feed/validators/DuplicateValidator',
    'sap/viz/vizservices/service/feed/validators/TypeValidator',
    'sap/viz/vizservices/service/feed/validators/MaxValidator',
    'sap/viz/vizservices/service/feed/validators/MinValidator',
    'sap/viz/vizservices/service/feed/validators/MNDValidator',
    'exports'
], function(
    BindingDefUtils,
    BindingDefConst,
    FeedUtil,
    FeedConst,
    DatasetTypeConst,
    MetadataFactory,
    AAValidator,
    DuplicateValidator, 
    TypeValidator, 
    MaxValidator, 
    MinValidator, 
    MNDValidator
) {
// @formatter:on
    /**
     * The FeedService check the validity of feed status.
     */
    var FeedService = {};

    FeedService.validate = function(vizType, feedItems) {
        var metadata = MetadataFactory.get(vizType);
        var defs = metadata.getBindingDefs();
        var validate = true;
        validate = validate && DuplicateValidator.validate(defs, feedItems);
        validate = validate && TypeValidator.validate(defs, feedItems);
        validate = validate && MinValidator.validate(defs, feedItems);
        validate = validate && MaxValidator.validate(defs, feedItems);
        validate = validate && MNDValidator.validate(defs, feedItems);
        return {
            'validate' : validate
        };
    };

    /**
     *
     * @param {Object} visualizationType
     * @param {Object} feedItems
     * @param {String} addTo Feed id will be added
     * @param {Object} adding Analysis object will be added
     */
    FeedService.addable = function(visualizationType, feedItems, addTo, adding) {
        if (!adding) {
            var feed = FeedUtil.getFeed(feedItems, addTo);
            var type, dataType;
            
            if (BindingDefUtils.get(visualizationType, feed.id).type() === BindingDefConst.TYPE_DIMENSION) {
                type = FeedConst.TYPE_DIMENSION;
            } else {
                type = FeedConst.TYPE_MEASURE;
            }

            if (addTo === FeedConst.ID_TIME_AXIS) {
                dataType = FeedConst.DATA_TYPE_DATE;
            } else {
                dataType = undefined;
            }
            var id = '__sapVizServicesReserved_' + type + '_' + _unique++;
            adding = FeedUtil.genAnalysisObject(id, type, dataType);
        }

        // Validate overflow
        var feeds = FeedUtil.spliceAnalysisObjects(FeedUtil.cloneFeeds(feedItems), addTo, 0, 0, adding);
        return FeedService.validateOverflow(visualizationType, feeds);
    };

    FeedService.validateOverflow = function(visualizationType, feedItems) {
        var metadata = MetadataFactory.get(visualizationType);
        var defs = metadata.getBindingDefs();
        var validate = true;
        validate = validate && DuplicateValidator.validate(defs, feedItems);
        validate = validate && TypeValidator.validate(defs, feedItems);

        if (metadata.support().dataset[DatasetTypeConst.CROSS_TABLE] && !metadata.support().dataset[DatasetTypeConst.FLAT_TABLE]) {
            validate = validate && AAValidator.validate(defs, feedItems);
        }
        validate = validate && MaxValidator.validate(defs, feedItems);
        validate = validate && MNDValidator.validate(defs, feedItems);
        return validate;
    };


    FeedService.switchable = function (visualizationType, feedItems, switchTo, switching) {
        // Validate switching
        var feeds = FeedUtil.spliceAnalysisObjects(FeedUtil.cloneFeeds(feedItems), switchTo, 0, 0, switching);
        return FeedService.validateSwitching(visualizationType, feeds);
    };

    FeedService.validateSwitching = function(visualizationType, feedItems) {
        var metadata = MetadataFactory.get(visualizationType);
        var defs = metadata.getBindingDefs();
        var validate = true;
        validate = validate && MaxValidator.validate(defs, feedItems);
        validate = validate && MNDValidator.validate(defs, feedItems);
        return validate;
    }

    var _unique = 0;

    return FeedService;
});

// @formatter:off
define('sap/viz/vizservices/service/bvr/feeders/CommonFeeder',[
    'sap/viz/vizservices/common/metadata/MetadataFactory',
    'sap/viz/vizservices/common/metadata/bindingdef/BindingDefUtils',
    'sap/viz/vizservices/common/feed/FeedUtil',
    'sap/viz/vizservices/common/feed/FeedConst',
    'sap/viz/vizservices/service/feed/FeedService'
],
 function(MetadataFactory, 
     BindingDefUtils,
     FeedUtils, 
     FeedConst, 
     FeedService
) {
// @formatter:on
    var CommonFeeder = {};
    CommonFeeder.feed = function(visualizationType, feeds, analysisObjects, inScopeFeeds) {
        inScopeFeeds = inScopeFeeds || feeds;
        var copyAnalysisObjects = analysisObjects.slice(0), feed, feedOneSuccess;
        // Get binding defs
        var defs = MetadataFactory.get(visualizationType).getBindingDefsWithBVRSorting();

        var i, def;

        // Feed when min validate failed
        for ( i = 0; i < defs.length && analysisObjects.length > 0; i++) {
            def = defs[i], feed = FeedUtils.getFeed(inScopeFeeds, def.id()), feedOneSuccess = true;
            while (feedOneSuccess && feed && def.min() > feed.values.length) {
                feedOneSuccess = _feedOne(visualizationType, feeds, feed, analysisObjects);
            }
        }
        // Feed when empty
        for ( i = 0; i < defs.length && analysisObjects.length > 0; i++) {
            def = defs[i], feed = FeedUtils.getFeed(inScopeFeeds, def.id()), feedOneSuccess = true;
            if (feed && feed.values.length === 0) {
                _feedOne(visualizationType, feeds, feed, analysisObjects);
            }

        }
        // Feed to else
        for ( i = 0; i < defs.length && analysisObjects.length > 0; i++) {
            def = defs[i], feed = FeedUtils.getFeed(inScopeFeeds, def.id()), feedOneSuccess = true;
            while (feedOneSuccess && feed && def.max() > feed.values.length) {
                feedOneSuccess = _feedOne(visualizationType, feeds, feed, analysisObjects);
            }
        }

        //Adjust orders
        _reorder(visualizationType, inScopeFeeds, copyAnalysisObjects);
    };

    /**
     * Reorder added AnalysisObjects for feedItems
     *
     * @param visualizationType
     * @param {Array<FeedItem>} feeds
     *          An array of feedItems whose analysisObjects will be reordered
     * @param {Array<AnalysisObject>} allAnalysisObjects
     *          An array of all analysisObjects in the pool
     *
     * @private
     */
    var _reorder = function(visualizationType, feeds, allAnalysisObjects) {
        //addAos record all new analysisObjects added to feeds
        //aoCountDict record the count of analysisObjects of every feeditem before adding
        var addAos = [], aoCountDict = {};

        //loop through all analysisObjects of feeds
        feeds.forEach(function(feed){
            var fFirst = true;
            //Initial for aoCountDict of feed.id
            aoCountDict[feed.id] = feed.values.length;
            feed.values.forEach(function(ao, aoIndex){
                if (allAnalysisObjects.indexOf(ao) !== -1){
                    addAos.push(ao);
                    if (fFirst){
                        fFirst = false;
                        aoCountDict[feed.id] = aoIndex;
                    }
                }
            });
        });

        //reorder addAos base on the sequence of allAnalysisObjects
        var tempAos = [];
        allAnalysisObjects.forEach(function(ao){
            if (addAos.indexOf(ao) !== -1){
                tempAos.push(ao);
            }
        });
        addAos = tempAos;

        var i, currentAo, currentFeed;
        //Reorder analysisObjects with the same ID
        for (i = 0; i < addAos.length; i++){
            currentAo = addAos[i];
            currentFeed = _findFeed(feeds, currentAo);
            _loopThroughAddedAos(visualizationType, feeds, aoCountDict, function(feed, aoToBeSwitch){
                if (aoToBeSwitch === currentAo){
                    return true;
                }
                if (aoToBeSwitch.id == currentAo.id && aoToBeSwitch !== currentAo && addAos.indexOf(aoToBeSwitch) > i ){
                    //switch
                    _switchAo(currentFeed, currentAo, feed, aoToBeSwitch);
                    return true;
                }
            });
        }
        //Reorder
        for (i = 0; i < addAos.length; i++){
            currentAo = addAos[i];
            currentFeed = _findFeed(feeds, currentAo);
            _loopThroughAddedAos(visualizationType, feeds, aoCountDict, function(feed, aoToBeSwitch){
                if (aoToBeSwitch === currentAo){
                        return true;
                }
                if (_validateTypeAndDuplicate(visualizationType, feed, currentAo)){
                    if (_validateTypeAndDuplicate(visualizationType, currentFeed, aoToBeSwitch) && addAos.indexOf(aoToBeSwitch) > i){
                        _switchAo(currentFeed, currentAo, feed, aoToBeSwitch);
                        return true;
                    }
                }
            });
        }
    };

    /**
     * Loop Through All Added AnalysisObjects of FeedItems base of bvrPriority
     * @param visualizationType
     * @param {Array<FeedItems>} feeds
     * @param {Object} aoCountDict
     *          A dict indicate the previous count of analysisObjects of feedItem
     *          e.g. {'primaryValue':2, 'axisLabel': 1}
     * @param {function(FeedItem, AnalysisObject)} func
     *          CallBack Function, return YES if stop loop
     * @private
     */
    var _loopThroughAddedAos = function(visualizationType, feeds, aoCountDict, func){
        // Get binding defs
        var j, k, defs = MetadataFactory.get(visualizationType).getBindingDefsWithBVRSorting();

        //Loop
        for (j = 0; j < defs.length; j++){
            var def = defs[j], feed = FeedUtils.getFeed(feeds, def.id());
            if (feed == null) { continue; }
            var fIsToBreak = false;
            for (k = aoCountDict[feed.id]; k < feed.values.length; k++){
                var aoToBeSwitch = feed.values[k];
                var fRet = func(feed, aoToBeSwitch);
                if (fRet){
                    return;
                }
            }
        }
    };

    /**
     * Switch analysisObjects of two feedItems
     * @param {FeedItem} feed1
     * @param {AnalysisObject} ao1
     * @param {FeedItem} feed2
     * @param {AnalysisObject} ao2
     * @private
     */
    var _switchAo = function(feed1, ao1, feed2, ao2){
        var iIndex1 = feed1.values.indexOf(ao1);
        var iIndex2 = feed2.values.indexOf(ao2);
        if (iIndex1 != -1 && iIndex2 != -1){
            var tempAo = feed1.values[iIndex1];
            feed1.values[iIndex1] = feed2.values[iIndex2];
            feed2.values[iIndex2] = tempAo;
        }
    };

    var _validateTypeAndDuplicate = function(type, feed, analysisObject) {
        if (!BindingDefUtils.support(BindingDefUtils.get(type, feed.id), analysisObject.type)) {
            return false;
        }
        var feedAos = feed.values;
        for (var i = 0; i < feedAos.length; i++) {
            var tempAo = feedAos[i];
            if (tempAo.id == analysisObject.id) {
                return false;
            }
        }
        return true;
    };

    var _findFeed = function(feeds, analysisObject) {
        var tempFeedIndex;
        for (tempFeedIndex in feeds) {
            if (feeds[tempFeedIndex].values.indexOf(analysisObject) != -1) {
                return feeds[tempFeedIndex];
            }
        }
        return null;
    };

    var _feedOne = function(visualizationType, feeds, feed, analysisObjects) {
        for (var i = 0; i < analysisObjects.length; i++) {
            var analysisObject = analysisObjects[i];
            if (FeedService.addable(visualizationType, feeds, feed.id, analysisObject)) {
                feed.values.push(analysisObject);
                analysisObjects.splice(i, 1);
                return true;
            }
        }
        return false;
    };


    return CommonFeeder;
});



// @formatter:off
define('sap/viz/vizservices/service/bvr/switch/AliasMapping',[
    'sap/viz/vizservices/common/feed/FeedUtil',
    'sap/viz/vizservices/service/feed/FeedService',
    'sap/viz/vizservices/common/metadata/bindingdef/BindingDefUtils',
    'sap/viz/vizservices/common/metadata/bindingdef/BindingDefConst'
], function(
    FeedUtil,
    FeedService,
    BindingDefUtils,
    BindingDefConst
) {
// @formatter:on
    var AliasMapping = {};
    var _mapping = {
        //XY, XYY, Bubble, Pie, Scatter, TreeMap, HeatMap, TagCloud, TimeLine, TimeScatter, Numeric, Radar, Bullet, Waterfall, StackedWaterfall.
        "XY" : {
            "mapTo" : [
                "TimeScatter",
                "Pie", 
                "Scatter", 
                "Bubble", 
                "TreeMap", 
                "HeatMap", 
                "TagCloud", 
                "Numeric", 
                "Bullet"
                ],
            "categoryAxis" : {
                 "Bullet,HeatMap" : "categoryAxis",
                 "Bubble,Pie,Scatter,TimeScatter" : "color",
                 "TreeMap" : "title",
                 "TagCloud" : "text"
             },
             "color" : {
                 "Bullet" : "color",
                 "Bubble,Scatter,TimeScatter" : "shape",
                 "HeatMap" : "categoryAxis2"
             },
            "valueAxis" : {
                 "Bubble,Scatter,TimeScatter": "valueAxis",
                 "Pie" : "size",
                 "TreeMap,TagCloud" : "weight",
                 "HeatMap" : "color",
                 "Numeric" : "value",
                 "Bullet" : "actualValues"
             },
            "dataFrame" : {
                 "Bubble,Pie,Scatter,TagCloud" : "dataFrame"
             },
            "trellisRow" : {
                 "Bubble,Scatter,Pie" : "trellisRow"
            },
            "trellisColumn" : {
                 "Bubble,Scatter,Pie" : "trellisColumn"
            }
         },
         "Pie" : {
            "mapTo" : [ 
                "XYY",
                "Scatter", 
                "Bubble",
                "TreeMap", 
                "HeatMap", 
                "TagCloud", 
                "TimeLine",
                "TimeScatter",
                "Numeric", 
                "Radar", 
                "Bullet", 
                "Waterfall", 
                "StackedWaterfall"
                ],
            "size" : {
                "XYY,Scatter,Bubble,Radar,Waterfall,StackedWaterfall,TimeLine,TimeScatter" : "valueAxis",
                "Numeric" : "value",
                "Bullet" : "actualValues",
                "TreeMap,TagCloud" : "weight",
                "HeatMap" : "color",
            },
            "color" : {
                "XYY,Bullet,HeatMap,Radar,Waterfall,StackedWaterfall" : "categoryAxis",
                "TreeMap" : "title",
                "TagCloud" : "text",
                "Scatter,Bubble,TimeLine,TimeScatter" : "color"
            },
            "dataFrame" : {
                "XYY,Scatter,Bubble,TagCloud,Radar" : "dataFrame",
                "HeatMap" : "categoryAxis2",
                "Bullet" : "color"
            },
            "trellisRow" : {
                 "XYY,Scatter,Bubble,Radar" : "trellisRow"
            },
            "trellisColumn" : {
                 "XYY,Scatter,Bubble,Radar" : "trellisColumn"
            }
        },
        "XYY" : {
            "mapTo" : [
                "TreeMap", 
                "HeatMap", 
                "TagCloud", 
                "Numeric", 
                "Bullet"
                ],
            "categoryAxis" : {
                "Bullet,HeatMap" : "categoryAxis",
                "TreeMap" : "title",
                "TagCloud" : "text"
            },
            "color" : {
                "Bullet" : "color",
                "HeatMap" : "categoryAxis2"
            },
            "valueAxis" : {
                "TreeMap,TagCloud" : "weight",
                "HeatMap" : "color",
                "Numeric" : "value",
                "Bullet" : "actualValues"
            },
            "valueAxis2" : {
                "Bullet" : "targetValues"
            },
            "dataFrame" : {
                "TagCloud" : "dataFrame"
            }
        },
        "TimeLine" : {
            "mapTo" : [
                "TagCloud",
                "TreeMap",
                "HeatMap",
                "Bullet", 
                "Radar", 
                "Waterfall", 
                "StackedWaterfall",
                "Numeric"
                ],
            "valueAxis" : {
                "Radar,Waterfall,StackedWaterfall" : "valueAxis",
                "HeatMap" : "color",
                "Bullet" : "actualValues",
                "TreeMap,TagCloud" : "weight",
                "Numeric" : "value"
            },
            "color" : {
                "HeatMap,Bullet,Radar,Waterfall,StackedWaterfall" : "categoryAxis",
                "TreeMap" : "title",
                "TagCloud" : "text"
            }
        },
        "TimeScatter" : {
            "mapTo" : [
                "Scatter",
                "TagCloud",
                "TreeMap",
                "HeatMap",
                "Bullet", 
                "Radar", 
                "Waterfall", 
                "StackedWaterfall",
                "Numeric"
                ],
            "valueAxis" : {
                "Scatter,Radar,Waterfall,StackedWaterfall" : "valueAxis",
                "HeatMap" : "color",
                "Bullet" : "actualValues",
                "TreeMap,TagCloud" : "weight",
                "Numeric" : "value"
            },
            "color" : {
                "Scatter" : "color",
                "HeatMap,Bullet,Radar,Waterfall,StackedWaterfall" : "categoryAxis",
                "TreeMap" : "title",
                "TagCloud" : "text"
            },
            "shape" : {
                "Scatter" : "shape",
                "HeatMap" : "categoryAxis2",
                "Bullet,Radar,StackedWaterfall" : "color"
            },
            "bubbleWidth" : {
                "Scatter" : "valueAxis2",
                "TagCloud,TreeMap" : "color",
                "Bullet" : "targetValues"
            }
        },
        "Bubble" : {
            "mapTo" : [
                "TreeMap", 
                "HeatMap", 
                "TagCloud", 
                "Numeric", 
                "Radar", 
                "Bullet", 
                "Waterfall", 
                "StackedWaterfall"
                ],
            "valueAxis" : {
                "Radar,Waterfall,StackedWaterfall" : "valueAxis",
                "HeatMap" : "color",
                "Bullet" : "actualValues",
                "TreeMap,TagCloud" : "weight",
                "Numeric" : "value"
            },
            "valueAxis2" : {
                "Bullet" : "targetValues",
                "TreeMap,TagCloud" : "color"
            },
            "shape" : {
                "Bullet,Radar,StackedWaterfall" : "color",
                "HeatMap" : "categoryAxis2"
            },
            "color" : {
                "HeatMap,Bullet,Radar,Waterfall,StackedWaterfall" : "categoryAxis",
                "TreeMap" : "title",
                "TagCloud" : "text"
            },
            "bubbleWidth" : {
                "Bullet" : "additionalValues"
            },
            "dataFrame" : {
                "TagCloud,Radar" : "dataFrame"
            },
            "trellisRow" : {
                 "Radar" : "trellisRow"
            },
            "trellisColumn" : {
                 "Radar" : "trellisColumn"
            }
        },
        "Scatter" : {
            "mapTo" : [
                "TreeMap", 
                "HeatMap", 
                "TagCloud", 
                "Numeric", 
                "Radar", 
                "Bullet", 
                "Waterfall", 
                "StackedWaterfall"
                ],
            "valueAxis" : {
                "Radar,Waterfall,StackedWaterfall" : "valueAxis",
                "HeatMap" : "color",
                "Bullet" : "actualValues",
                "TreeMap,TagCloud" : "weight",
                "Numeric" : "value"
            },
            "valueAxis2" : {
                "Bullet" : "targetValues",
                "TreeMap,TagCloud" : "color"
            },
            "shape" : {
                "Bullet,Radar,StackedWaterfall" : "color",
                "HeatMap" : "categoryAxis2"
            },
            "color" : {
                "Bullet,HeatMap,Radar,Waterfall,StackedWaterfall" : "categoryAxis",
                "TreeMap" : "title",
                "TagCloud" : "text",
                
            },
            "dataFrame" : {
                "Pie,TagCloud,Radar" : "dataFrame"
            },
            "trellisRow" : {
                 "Radar" : "trellisRow"
            },
            "trellisColumn" : {
                 "Radar" : "trellisColumn"
            }
        },
        "TreeMap" : {
            "mapTo" : [
                "HeatMap", 
                "TagCloud", 
                "Numeric", 
                "Radar", 
                "Bullet", 
                "Waterfall", 
                "StackedWaterfall"
                ],
            "title" : {
                "Bullet,HeatMap,Radar,Waterfall,StackedWaterfall" : "categoryAxis",
                "TagCloud" : "text"
            },
            "color" : {
                "HeatMap,TagCloud" : "color",
                "Bullet" : "targetValues"
            },
            "weight" : {
                "Radar,Waterfall,StackedWaterfall" : "valueAxis",
                "Bullet" : "actualValues",
                "Numeric" : "value",
                "TagCloud" : "weight"
            }
        },
        "TagCloud" : {
            "mapTo" : [
                "Numeric", 
                "Radar", 
                "Bullet", 
                "HeatMap",
                "Waterfall", 
                "StackedWaterfall"
                ],
            "text" : {
                "Bullet,Radar,HeatMap,Waterfall,StackedWaterfall" : "categoryAxis"
            },
            "color" : {
                "HeatMap" : "color",
                "Bullet" : "targetValues"
            },
            "weight" : {
                "Waterfall,Radar,StackedWaterfall" : "valueAxis",
                "Bullet" : "actualValues",
                "Numeric" : "value"
            },
            "dataFrame" : {
                "Radar" : "dataFrame",
                "HeatMap" : "categoryAxis2"
            }
        },
        "HeatMap" : {
            "mapTo" : [
                "Numeric", 
                "Radar", 
                "Bullet",
                "Waterfall", 
                "StackedWaterfall"
                ],
            "categoryAxis" : {
                "Bullet,Radar,Waterfall,StackedWaterfall" : "categoryAxis"
            },
            "color" : {
                "Radar,Waterfall,StackedWaterfall" : "valueAxis",
                "Numeric" : "value",
                "Bullet" : "actualValues"
            },
            "categoryAxis2" : {
                "Bullet,Radar,StackedWaterfall" : "color"
            }
        },
        "Bullet" : {
            "mapTo" : [
                "Numeric",
                "Radar",
                "Waterfall", 
                "StackedWaterfall"
                ],
            "categoryAxis" : {
                "Radar,Waterfall,StackedWaterfall" : "categoryAxis"
            },
            "color" : {
                "Radar,StackedWaterfall" : "color"
            },
            "actualValues" : {
                "Radar,Waterfall,StackedWaterfall" : "valueAxis",
                "Numeric" : "value"
            }
        },
        "Radar" : {
            "mapTo" : [
                "Numeric"
                ],
            "valueAxis" : {
                "Numeric" : "value"
            }
        },
        "Waterfall" : {
            "mapTo" : [
                "Numeric"
                ],
            "valueAxis" : {
                "Numeric" : "value"
            }
        },
        "StackedWaterfall" : {
            "mapTo" : [
                "Numeric"
                ],
            "valueAxis" : {
                "Numeric" : "value"
            }
        }
    };
    
    var _addReversedCategory = function (fromCategory, toCategory) {
        if (!fromCategory || !toCategory) {
            return;
        }
        if (!_mapping.hasOwnProperty(toCategory)) {
            _mapping[toCategory] = {
                "mapTo" : [fromCategory]
            };
        } else {
            var mapTo = _mapping[toCategory].mapTo || [];
            if (mapTo.indexOf(fromCategory) === -1) {
                mapTo.push(fromCategory);
            }
            _mapping[toCategory].mapTo = mapTo;
        }
    };

    var _traverseAndCreate = function (tree) {
        if (arguments.length === 1) {
            return tree;
        }
        var level = arguments[1];
        if (!tree.hasOwnProperty(level)) {
            tree[level] = {};
        }
        var args = Array.prototype.slice.call(arguments, 0);
        args.splice(0, 2, tree[level]);
        return _traverseAndCreate.apply(null, args);
    };

    var _addMapping = function(fromCategory, fromFeed, toCategory, toFeed) {
        if (!fromCategory || !toCategory || fromCategory === toCategory) {
            return;
        }
        // mapping.fromCategory.fromFeed
        var Mapping_fromCategory_fromFeed = _traverseAndCreate(_mapping, fromCategory, fromFeed);

        // If already exists other fromFeed->toFeed for fromCategory, update the mapping.
        var alreadyExist = Object.keys(Mapping_fromCategory_fromFeed).some(function(existingToCategories) {
            if (Mapping_fromCategory_fromFeed[existingToCategories] === toFeed) {
                // Mapping does not exists.
                if (existingToCategories.split(',').indexOf(toCategory) < 0) {
                    Mapping_fromCategory_fromFeed[existingToCategories + ',' + toCategory] = toFeed;
                    delete Mapping_fromCategory_fromFeed[existingToCategories];
                }
                return true;
            }
        });
        // Not exists fromFeed -> toFeed for fromCategory, add new one.
        if (!alreadyExist) {
            Mapping_fromCategory_fromFeed[toCategory] = toFeed;
        }
    }; 

    // Generate reverse mapping: fromCategory.fromFeed.toCategories.toFeed -> toCategory.toFeed.fromCategories.fromFeed
    var fromCategory, toCategories, fromFeed, toFeed, toCategoriesArray;

    for (fromCategory in _mapping) {
        for (fromFeed in _mapping[fromCategory]) {
            if (fromFeed === "mapTo") {
                _mapping[fromCategory][fromFeed].forEach(function(toCategory) {
                    _addReversedCategory(fromCategory, toCategory);
                });
                continue;
            }
            for (toCategories in _mapping[fromCategory][fromFeed]) {
                toFeed = _mapping[fromCategory][fromFeed][toCategories];
                toCategoriesArray = toCategories.split(',');

                toCategoriesArray.forEach(function(toCategory) {
                    _addMapping(toCategory, toFeed, fromCategory, fromFeed);
                });
            }
        }
    }
    
    AliasMapping.aliasExisted = function(fromCategory, toCategory) {
        if (!fromCategory || !toCategory) {
            return false;
        }
        var mapTo = _mapping[fromCategory] ? _mapping[fromCategory].mapTo || [] : [];
        return mapTo.indexOf(toCategory) === -1 ? false : true;
    }; 

    var _map = function (fromCategory, toCategory, toType, fromFeedItems, toFeedItems, defType) {
        var fromIds = Object.keys(_mapping[fromCategory]);

        fromIds.forEach(function (fromId) {
            var id = _findId(_mapping[fromCategory][fromId], toCategory);
            var def = BindingDefUtils.get(toType, id);
            if (id && def && def.type() === defType) {
                var values = FeedUtil.getFeedValues(fromFeedItems, fromId);
                if (values) {
                    var newFeed = {
                        'id' : id,
                        'values' : []
                    };
                    toFeedItems.push(newFeed);
                    values.forEach(function (ao) {
                        if (FeedService.switchable(toType, toFeedItems, newFeed.id, ao)) {
                            newFeed.values.push(ao);
                        }
                    });
                }
            }
        });
        return toFeedItems;
    };

    AliasMapping.map = function(fromCategory, toCategory, toType, fromFeedItems) {
        if (!fromCategory || !toCategory) {
            return [];
        }
        var toFeedItems = [];
        //Map measure before dimension to avoid incorrect check in MNDValidator
        toFeedItems = _map(fromCategory, toCategory, toType, fromFeedItems, toFeedItems, BindingDefConst.TYPE_MEASURE);
        toFeedItems = _map(fromCategory, toCategory, toType, fromFeedItems, toFeedItems, BindingDefConst.TYPE_DIMENSION);
        return toFeedItems;
    };

    var _findId = function(categoriesGroupMap, category) {
        for (var group in categoriesGroupMap) {
            if (group.split(',').indexOf(category) !== -1) {
                return categoriesGroupMap[group];
            }
        }
        return null;
    };

    return AliasMapping;
});

// @formatter:off
define('sap/viz/vizservices/service/bvr/switch/ChartCategories',[], function() {
// @formatter:on
    var ChartCategories = {};
    
    var _categories = {
        "XY" : [
            "info/bar", 
            "info/column", 
            "info/stacked_bar", 
            "info/stacked_column", 
            "info/100_stacked_bar", 
            "info/100_stacked_column", 
            "info/line", 
            "info/horizontal_line", 
            "info/combination", 
            "info/horizontal_combination", 
            "info/area", 
            "info/horizontal_area",
            "info/100_area", 
            "info/100_horizontal_area",
            "info/mekko", 
            "info/100_mekko", 
            "info/horizontal_mekko", 
            "info/100_horizontal_mekko",
            "info/trellis_bar", 
            "info/trellis_column", 
            "info/trellis_stacked_bar", 
            "info/trellis_stacked_column", 
            "info/trellis_100_stacked_bar", 
            "info/trellis_100_stacked_column", 
            "info/trellis_line", 
            "info/trellis_horizontal_line", 
            "info/trellis_combination", 
            "info/trellis_horizontal_combination"
        ],
        "XYY" : [
            "info/dual_bar", 
            "info/dual_column", 
            "info/dual_line", 
            "info/dual_horizontal_line", 
            "info/dual_combination", 
            "info/dual_horizontal_combination", 
            "info/dual_stacked_combination", 
            "info/dual_horizontal_stacked_combination",
            "info/trellis_dual_bar", 
            "info/trellis_dual_column", 
            "info/trellis_dual_line", 
            "info/trellis_dual_horizontal_line"
        ],
        "Bubble" : ["info/bubble", "info/trellis_bubble"],
        "Pie" : ["info/pie", "info/donut", "info/trellis_donut", "info/trellis_pie"],
        "Scatter" : ["info/scatter", "info/trellis_scatter"],
        "Bullet" : ["info/bullet", "info/vertical_bullet"],
        "TreeMap" : ["info/treemap"],
        "HeatMap" : ["info/heatmap"],
        "TagCloud" : ["info/tagcloud"],
        "TimeLine" : ["info/timeseries_line"],
        "TimeScatter" : ["info/timeseries_scatter", "info/timeseries_bubble"],
        "Numeric" : ["info/number"],
        "Radar" : ["info/radar", "info/trellis_radar"],
        "Waterfall" : ["info/waterfall", "info/horizontal_waterfall"],
        "StackedWaterfall" : ["info/stacked_waterfall", "info/horizontal_stacked_waterfall"]
    }; 

    
    ChartCategories.findCategory = function(type) {
        for (var key in _categories) {
            if (_categories.hasOwnProperty(key)) {
                if (_categories[key].indexOf(type) >= 0) {
                    return key;
                }
            }
        }
    };
    return ChartCategories;
});

// @formatter:off
define('sap/viz/vizservices/service/bvr/switch/NameMapping',[
    'sap/viz/vizservices/common/feed/FeedUtil',
    'sap/viz/vizservices/service/feed/FeedService',
    'sap/viz/vizservices/common/metadata/bindingdef/BindingDefUtils',
    'sap/viz/vizservices/common/metadata/bindingdef/BindingDefConst'
], function(
    FeedUtil,
    FeedService,
    BindingDefUtils,
    BindingDefConst
) {
// @formatter:on
    var NameMapping = {};
    
    var _map = function(type, fromFeedItems, toFeedItems, defType) {
        var temp = FeedUtil.buildEmptyFeeds(type);
        temp.forEach(function(toFeed) {
            var toFeedId = toFeed.id;
            if (BindingDefUtils.get(type, toFeedId).type() !== defType) {
                return;
            }
            fromFeedItems.forEach(function(fromFeed) {
                if (fromFeed.id == toFeedId) {
                    var values = FeedUtil.getFeedValues(fromFeedItems, fromFeed.id);
                    if (values) {
                        var newFeed = {
                            'id': fromFeed.id,
                            'values': []
                        };
                        toFeedItems.push(newFeed);
                        values.forEach(function(ao) {
                            if (FeedService.switchable(type, toFeedItems, newFeed.id, ao)) {
                                newFeed.values.push(ao);
                            }
                        });
                    }
                }
            });
        });
        return toFeedItems;
    };

    NameMapping.map = function(type, fromFeedItems) {
        var toFeedItems = [];
        toFeedItems = _map(type, fromFeedItems, toFeedItems, BindingDefConst.TYPE_MEASURE);
        toFeedItems = _map(type, fromFeedItems, toFeedItems, BindingDefConst.TYPE_DIMENSION);
        return toFeedItems;
    }; 

    return NameMapping;
});

// @formatter:off
define('sap/viz/vizservices/service/bvr/BVRService',[
    'sap/viz/vizservices/common/metadata/MetadataFactory',
    'sap/viz/vizservices/common/feed/FeedUtil',
    'sap/viz/vizservices/service/bvr/feeders/MNDFeeder',
    'sap/viz/vizservices/service/bvr/feeders/TimeFeeder',
    'sap/viz/vizservices/service/bvr/feeders/CommonFeeder',
    'sap/viz/vizservices/service/bvr/switch/AliasMapping',
    'sap/viz/vizservices/service/bvr/switch/ChartCategories',
    'sap/viz/vizservices/service/bvr/switch/NameMapping',
    'sap/viz/vizservices/service/feed/FeedService',
    'exports'
], function(MetadataFactory,
    FeedUtil,
    MNDFeeder,
    TimeFeeder,
    CommonFeeder,
    AliasMapping,
    ChartCategories,
    NameMapping,
    FeedService
    ) {
// @formatter:on
    // window.sap.viz.vizservices.service.BVRService
    /**
     * The BVRService recommend the best visualization by provided conditions of type, feedItems, etc.
     */
    var BVRService = {};

    BVRService.switchFeeds = function(fromType, fromFeedItems, toType) {
        var result = FeedUtil.buildEmptyFeeds(toType);
        
        var fromCategory = ChartCategories.findCategory(fromType);
        var toCategory = ChartCategories.findCategory(toType);

        if (fromCategory && toCategory && AliasMapping.aliasExisted(fromCategory, toCategory)) {
            result = FeedUtil.merge(result, AliasMapping.map(fromCategory, toCategory, toType, fromFeedItems));
        } else {
            //For extension chart
            result = FeedUtil.merge(result, NameMapping.map(toType, fromFeedItems));
        }
        
        return {
            'type' : toType,
            'feedItems' : result
        };
    };

    BVRService.suggestFeeds = function(type, feedItems, analysisObjects, scope) {
        feedItems = FeedUtil.merge(FeedUtil.buildEmptyFeeds(type), feedItems);
        feedItems = FeedUtil.cloneFeeds(feedItems);

        // Remove feedItems out of scope
        var inScopeFeedItems;
        if (scope && scope.length) {
            inScopeFeedItems = [];
            feedItems.forEach(function(feed) {
                if (scope.indexOf(feed.id) !== -1) {
                    inScopeFeedItems.push(feed);
                }
            });
        } else {
            inScopeFeedItems = feedItems;
        }
        // Auto feeding
        _autoFeeding(type, feedItems, analysisObjects.slice(0), inScopeFeedItems);

        return {
            'type' : type,
            'feedItems' : feedItems
        };
    };

    var _autoFeeding = function(type, feedItems, remainings, inScopeFeedItems) {
        inScopeFeedItems = inScopeFeedItems || feedItems;
        MNDFeeder.feed(type, inScopeFeedItems, remainings);
        TimeFeeder.feed(type, inScopeFeedItems, remainings);
        CommonFeeder.feed(type, feedItems, remainings, inScopeFeedItems);
    };

    return BVRService;
});

// @formatter:off
define('sap/viz/vizservices/api/BVRService',[
    'sap/viz/vizservices/service/bvr/BVRService',
    'require'
], function(BVRService) {
// @formatter:on

    /**
     * The BVRService recommend the best visualization by provided conditions of vizType, feedItems, etc.
     * BVRService provides auto-binding functionality for info Charts.
     * @namespace sap.viz.vizservices.BVRService
     */
    var BVRServiceAPI = sap.viz.vizservices.BVRService = {};

    /**
     * Suggest new feeds when new analysis objects are added to existing viz and feeds<br />
     * @memberOf sap.viz.vizservices.BVRService
     * @function suggestFeeds
     * @param {String} type
     * @param {Array<FeedItem>} feedItems
     * FeedItem: JSON data structure with id and values. <br />
     * FeedItem.id is a string which indicate the feed id.<br />
     * FeedItem.values is an array of AnalysisObject. values indicate the Dimensions or Measures which fed on the feed id.<br />
     * @param {Array<AnalysisObject>} analysisObjects
     * AnalysisObject: JSON data structure with id, type and dataType.<br />
     * AnalysisObject.id is a string which indicate the analysis object id.<br />
     * AnalysisObject.type is a string which indicate the analysis object type. Available values are: Dimension, Measure, MND<br />
     * AnalysisObject.dataType is a string which indicate the analysis object data type. Available values are: String, Number, Date<br />
     * <br/ >
     * @return {Object<String, Array<FeedItem>>} Object with type and feedItems
     * <br/ >
     * @example <caption>Sample Code:</caption>
     * //1. When invoke suggestFeeds with parameters for bar chart.
     * //SuggestFeeds will suggest dim_0 to categoryAxis, dim_1 to color and dim_2 to dataFrame.
     * //Result will be
     * //{
     * //  "type":"info/bar",
     * //  "feedItems":[
     * //       {"id":"dataFrame","values":[
     * //           {"id":"dim_2","type":"Dimension","dataType":"String"}
     * //       ]},
     * //       {"id":"categoryAxis","values":[
     * //           {"id":"dim_0","type":"Dimension","dataType":"String"}
     * //       ]},
     * //       {"id":"color","values":[
     * //           {"id":"dim_1","type":"Dimension","dataType":"String"}
     * //       ]},
     * //       {"id":"valueAxis","values":[]}
     * //   ]
     * //}
     * var type = "info/bar";
     * var feedItems = [];
     * var analysisObjects = [
     *     {"id":"dim_0", "type":"Dimension", "dataType":"String"},
     *     {"id":"dim_1", "type":"Dimension", "dataType":"String"},
     *     {"id":"dim_2", "type":"Dimension", "dataType":"String"}
     * ];
     * BVRService.suggestFeeds(type, feedItems, analysisObjects);
     * 
     * 
     * //2. When invoke suggestFeeds for column chart with non-empty current feed.
     * //SuggestFeeds will suggest mea_1 to valueAxis, dim_0 to categoryAxis and dim_1 to color no matter what current feed is.
     * //Result will be
     * //{
     * //  "type":"info/column",
     * //  "feedItems":[
     * //       {"id":"dataFrame","values":[]},
     * //       {"id":"categoryAxis","values":[
     * //           {"id":"dim_0","type":"Dimension","dataType":"String"}
     * //       ]},
     * //       {"id":"color","values":[
     * //           {"id":"dim_1","type":"Dimension","dataType":"String"}
     * //       ]},
     * //       {"id":"valueAxis","values":[
     * //           {"id":"mea_1","type":"Measure","dataType":"Number"}
     * //       ]}
     * //   ]
     * //}
     * var type = "info/column";
     * var feedItem = [
     *      {"id":"size", values:[{"id":"mea_1", "type":"Measure", "dataType":"Number"}]},
     *      {"id":"color", values:[{"id":"dim_1", "type":"Dimension", "dataType":"String"}]}
     * ];
     * var analysisObjects = [
     * {"id":"dim_0", "type":"Dimension", "dataType":"String"},
     * {"id":"dim_1", "type":"Dimension", "dataType":"String"}, 
     * {"id":"mea_1", "type":"Measure", "dataType":"Number"}
     * ];
     * BVRService.suggestFeeds(type, feedItems, analysisObjects);
     * 
     */
    BVRServiceAPI.suggestFeeds = function(type, feedItems, analysisObjects) {
        return BVRService.suggestFeeds(type, feedItems, analysisObjects);
    };

    /**
     * Switch to new feeds by existing feeds after type changed<br/ >
     * Change the feeds for corresponding chart type. <br/ >
     * @memberOf sap.viz.vizservices.BVRService
     * @function switchFeeds
     * @param {String} fromType
     * @param {Array<FeedItem>} fromFeeds
     * FeedItem: JSON data structure with id and values. <br />
     * FeedItem.id is a string which indicate the feed id.<br />
     * FeedItem.values is an array of AnalysisObject. values indicate the Dimensions or Measures which fed on the feed id.<br />
     * @param {String} toType
     * @return {Object<String, Array<FeedItem>>} Object with toType and feeds
     * <br/ >
     * @example <caption>Sample Code:</caption>
     * //1. When invoke switchFeeds with parameters, if chart type switched to pie chart.
     * //SwitchFeeds will switch mea_0  to size, and dim_0 to color.
     * //Result will be
     * //{
     * //  "type":"info/pie",
     * //  "feedItems":[
     * //       {"id":"dataFrame","values":[]},
     * //       {"id":"size","values":[
     * //           {"id":"mea_0","type":"Measure"}
     * //       ]},
     * //       {"id":"color","values":[
     * //           {"id":"dim_0","type":"Dimension"}
     * //       ]}
     * //   ]
     * //}
     * var fromType = "info/bar";
     * var fromFeedItems = [
     *     {"id":"valueAxis","values":[{"id":"mea_0","type":"Measure"}]},
     *     {"id":"categoryAxis","values":[{"id":"dim_0","type":"Dimension"}]}
     * ];
     * var toType = "info/pie";
     * BVRService.switchFeeds(fromType, fromFeedItems, toType); 
     * 
     * 
     * //2. When invoke switchFeeds with parameters, if chart type switched to column chart.
     * //SwitchFeeds will switch mea_0 to valueAxis, and dim_0 to categoryAxis.
     * //Result will be
     * //{
     * //  "type":"info/column",
     * //  "feedItems":[
     * //      {"id":"dataFrame","values":[]},
     * //      {"id":"categoryAxis","values":[
     * //          {"id":"dim_0","type":"Dimension"}
     * //      ]},
     * //      {"id":"color","values":[]},
     * //      {"id":"valueAxis","values":[
     * //          {"id":"mea_0","type":"Measure"}
     * //      ]}
     * //   ]
     * //}
     * var fromType = "info/pie";
     * var fromFeedItems = [
     *      {"id":"size","values":[{"id":"mea_0","type":"Measure"}]},
     *      {"id":"color","values":[{"id":"dim_0","type":"Dimension"}]}
     * ];
     * var toType = "info/column";
     * BVRService.switchFeeds(fromType, fromFeedItems, toType);
     * 
     */
    BVRServiceAPI.switchFeeds = function(fromType, fromFeedItems, toType) {
        return BVRService.switchFeeds(fromType, fromFeedItems, toType);
    };
    
    return BVRServiceAPI;
});

define('sap/viz/vizservices/common/Version',[],function() {
    /** sap.viz.vizservices.VERSION
     */

    /**
     * Constant, the current version of sap.viz.vizservices.
     * @static
     * @example
     * var verion = sap.viz.vizservices.VERSION;
     */
    return '1.1.0';
});

// @formatter:off
define('sap/viz/vizservices/api/Version',[
    'sap/viz/vizservices/common/Version',
    'require'
], function(Version) {
// @formatter:on
    /** sap.viz.vizservices.VERSION
     * @namespace sap.viz.vizservices.VERSION
     */
    sap.viz.vizservices.VERSION = Version;
    return Version;

    /**
     * Constant, the current version of sap.viz.vizservices.
     * @member VERSION
     * @memberof sap.viz.vizservices.VERSION
     * @static
     * @example
     * var version = sap.viz.vizservices.VERSION;
     */
});

define('sap/viz/vizservices/common/binding/generators/BindingGeneratorBase',[
// @formatter:off
    'sap/viz/vizservices/common/metadata/MetadataFactory'
], function(MetadataFactory){
// @formatter:on
    /**
     * BindingGeneratorBase Class
     */
    var BindingGeneratorBase = function(settings) {
        this._visualizationType = settings.visualizationType;
        this._bindingDefs = MetadataFactory.get(settings.visualizationType).getBindingDefs();
    };

    BindingGeneratorBase.prototype.generate = function(feedItems) {

    };

    return BindingGeneratorBase;
});

define('sap/viz/vizservices/common/binding/generators/FTBindingGenerator',[
// @formatter:off
    'sap/viz/vizservices/common/utils/OOUtil',
    'sap/viz/vizservices/common/metadata/bindingdef/BindingDefUtils',
    'sap/viz/vizservices/common/feed/FeedConst',
    'sap/viz/vizservices/common/viz/ChartConst',
    'sap/viz/vizservices/common/binding/generators/BindingGeneratorBase'
], function(OOUtil, BindingDefUtils, FeedConst, ChartConst, BindingGeneratorBase){
// @formatter:on

    var FTBindingGenerator = function(settings) {
        FTBindingGenerator.superclass.constructor.apply(this, arguments);
    };
    OOUtil.extend(FTBindingGenerator, BindingGeneratorBase);

    function collectValueAxisNames(visualizationType, feedItems) {
        return feedItems.reduce(function(list, feedItem) {
            if (feedItem.values.length) {
                var def = BindingDefUtils.get(visualizationType, feedItem.id);
                if (def && def.mndEnumerable()) {
                    list.push(feedItem.id);
                }
            }
            return list;
        }, []);
    }


    FTBindingGenerator.prototype.generate = function(feedItems) {
        var valueAxisNames = collectValueAxisNames(this._visualizationType, feedItems);
        var visualizationType = this._visualizationType;
        var bindings = [];
        feedItems.forEach(function(feed) {
            var values = feed.values || [];
            var list = [];
            if (values.length === 0) {
                return;
            }

            for (var j = 0; j < values.length; j++) {
                var aaObj = values[j];
                if (aaObj.type === FeedConst.TYPE_MND) {
                    list.push({
                        measureNames : valueAxisNames
                    });
                } else {
                    list.push(aaObj.id);
                }
            }
            bindings.push({
                feed : feed.id,
                source : list
            });
        });
        return bindings;
    };

    return FTBindingGenerator;
});

define('sap/viz/vizservices/common/binding/BindingConst',[],function() {
    var BindingConst = {};

    BindingConst.ANALYSIS_AXIS = "analysisAxis";
    BindingConst.MEASURE_VALUES_GROUP = "measureValuesGroup";
    BindingConst.MEASURE_NAMES_DIMENSION= "measureNamesDimension";
    
    return BindingConst;
});

define('sap/viz/vizservices/common/utils/Utils',[],function() {

    var utils = {};

    // static private in global to make sure id is not duplicated
    var _vc_util_GEN_UID = 0;
    var hasOwn = Object.prototype.hasOwnProperty;

    /**
     * return the global uid for HTML elements in the same window scope.
     *
     */
    utils.genUID = function() {
        if (!_vc_util_GEN_UID) {
            _vc_util_GEN_UID = 0;
        }
        return "vcgen_" + (_vc_util_GEN_UID++);
    };
    var class2type = {
        '[object Boolean]' : 'boolean',
        '[object Number]' : 'number',
        '[object String]' : 'string',
        '[object Function]' : 'function',
        '[object Array]' : 'array',
        '[object Date]' : 'date',
        '[object RegExp]' : 'regexp',
        '[object Object]' : 'object'
    };
    
    utils.encodingToken = "_encoded_";
    
    /**
     * apply function when object property is function or else set property value
     *
     */
    utils.applyObjectProperty = function(object, propertyName, propertyValue) {
        try {
            if (utils.isFunction(object[propertyName])) {
                object[propertyName](propertyValue);
            } else {
                object[propertyName] = propertyValue;
            }
        } catch(e) {
            //if (console) {
            //    console.log(e);
            //}
        }

    };
    /**
     * apply properties to a item
     *
     * @name utils.utils.SpreadSheetBindingManager.applyProperties
     * @memberOf Function.prototype
     * @function
     * @param {Object}
     *            the item to apply properties
     * @param {Array}
     *            the properties array
     * */
    utils.applyProperties = function(item, properties/*Array*/) {
        if (properties) {// apply the passed properties
            var len = properties.length;
            for (var i = 0; i < len; i++) {
                var property = properties[i];
                if (property) {
                    utils.applyObjectProperty(item, property.name, property.value);
                }
            }
        }
    };
    /**
     * get object property value
     * @param {object} object
     * @param {String} propertyName
     */
    utils.getObjectProperty = function(object, propertyName) {
        try {
            if (utils.isFunction(object[propertyName])) {
                return object[propertyName]();
            } else if (object.hasOwnProperty(propertyName)) {
                return object[propertyName];
            }

        } catch(e) {
            //if (console) {
            //    console.log(e);
            //}
        }
    };
    /**
     * judge object type
     * @param {object}
     */
    utils.type = function(obj) {
        return obj == null ? String(obj) : class2type[Object.prototype.toString.call(obj)] || "object";
    };
    /**
     * judge object type is or not Object
     * @param {object}
     */
    utils.isObject = function(obj) {
        var type = typeof obj;
        return type === 'function' || type === 'object' && !!obj;
    };
    /**
     * judge object type is or not Function
     * @param {object}
     */
    utils.isFunction = function(obj) {
        return utils.type(obj) === "function";
    };
    /**
     * judge object type is or not Boolean
     * @param {object}
     */
    utils.isBoolean = function(obj) {
        return utils.type(obj) === "boolean";
    };
    /**
     * judge object type is or not String
     * @param {object}
     */
    utils.isString = function(obj) {
        return utils.type(obj) === "string";
    };
    /**
     * judge object type is or not Array
     * @param {object}
     */
    utils.isArray = function(obj) {
        return utils.type(obj) === "array";
    };
    /**
     * judge object type is or not Number
     * @param {object}
     */
    utils.isNumber = function(obj) {
        return utils.type(obj) === "number";
    };
    /**
     * judge object type is or not Object
     * @param {object}
     */
    utils.isObject = function(obj) {
        return utils.type(obj) === "object";
    };

    /**
     * Returns a boolean value indicating whether the parameter is a plain
     * object
     *
     * @param {object}
     * @returns {boolean} Caution: A plain object is an object that has no
     *          prototype method and no parent class. Null, undefined, DOM
     *          nodes and window object are not considered as plain object.
     */
    utils.isPlainObject = function(obj) {
        // Must be an Object.
        // Because of IE, we also have to check the presence of the
        // constructor property.
        // Make sure that DOM nodes and window objects don't pass through,
        // as well
        if (!obj || utils.type(obj) !== "object" || obj.nodeType || (obj && typeof obj === "object" &&
            "setInterval" in obj)) {
            return false;
        }

        // Not own constructor property must be Object
        if (obj.constructor && !hasOwn.call(obj, "constructor") && !hasOwn.call(obj.constructor.prototype,
            "isPrototypeOf")) {
            return false;
        }

        // Own properties are enumerated firstly, so to speed up,
        // if last one is own, then all properties are own.

        var key;
        for (key in obj) {} // jshint ignore:line

        return key === undefined || hasOwn.call(obj, key);
    },

    /**
     * Returns a boolean value indicating whether the parameter is an empty
     * object
     *
     * @param {object}
     * @returns {boolean} Caution: An empty is a plain object without any
     *          properties.
     */
    utils.isEmptyObject = function(obj) {
        for (var name in obj) {
            if (obj.hasOwnProperty(name)) {
                return false;
            }

        }
        return utils.isPlainObject(obj);
    },
    /**
     * judge object type is or not RegExp
     * @param {object}
     */
    utils.isRegExp = function(obj) {
        return utils.type(obj) === "regexp";
    };
    /**
     * Sort an object Array.
     *
     * @param {Array} arr The object Array to sort.
     * @param {String} prop The object field for the sort.
     * @param {Boolean} [desc] Sort by ASC or DESC, by default is ASC.
     *
     */
    utils.sortArrayOn = function(arr, prop, desc) {
        if (utils.isArray(arr) && utils.isString(prop)) {
            arr.sort(function(a, b) {
                return desc ? (a[prop] < b[prop]) - (a[prop] > b[prop]) : (a[prop] > b[prop]) - (a[prop] < b[prop]);
            });
        }
    };
    /**
     * An empty function doing nothing.
     */
    utils.noop = function() {
    };
    /**
     * Delay to call the function
     *
     * @param {Object} handler
     * @param {Object} wait
     */
    utils.delay = function(handler, wait) {
        return setTimeout(function() {
            return handler.apply(null);
        }, wait);
    };
    /**
     * Delay 1ms to call the function
     *
     * @param {Object} handler
     * @param {Object} wait
     */
    utils.defer = function(handler) {
        return utils.delay.call(null, handler, 1);
    };
    /**
     * get event positon
     * @param {Object} event
     */
    utils.getEventPosition = function(event) {
        var pageX = null;
        var pageY = null;
        if (event.originalEvent && event.originalEvent.targetTouches && event.originalEvent.targetTouches.length !== 0) {
            pageX = event.originalEvent.targetTouches[0].pageX;
            pageY = event.originalEvent.targetTouches[0].pageY;
        } else {
            pageX = event.pageX;
            pageY = event.pageY;
        }
        var position = {};
        position.pageX = pageX;
        position.pageY = pageY;
        return position;

    };
    function clone (obj) {
        if (obj === null || typeof (obj) !== 'object') {
            return obj;
        }
        if (typeof (obj) === 'object' && obj.clone && utils.isFunction(obj.clone)) {
            return obj.clone();
        }
        var o = utils.isArray(obj) ? [] : {};
        for (var i in obj) {
            if (obj.hasOwnProperty(i)) {
                o[i] = clone(obj[i]);
            }
        }
        return o;
    }
    /**
     * clone object
     * @param {Object} obj
     */
    utils.clone = clone;

    utils.toJSON = function(instance, processor) {
        if (utils.isArray(instance)) {
            var result = [];
            for (var i = 0; i < instance.length; i++) {
                result.push(processor.call(null, instance[i]));
            }
            return result;
        } else if (instance) {
            return processor.call(null, instance);
        } else {
            return null;
        }
    };
    utils.fromJSON = function(json, processor) {
        if (utils.isArray(json)) {
            var result = [];
            for (var i = 0; i < json.length; i++) {
                result.push(processor.call(null, json[i]));
            }
            return result;
        } else if (json) {
            return processor.call(null, json);
        } else {
            return undefined;
        }
    };
    utils.updateJSON = function(srcJSON, newJSON) {
        // utils.updateJSON is mainly used to handle properties update.
        // It will update all properties from newJSON to srcJSON recursively regardless 
        // the properties is valid or invalid, newJSON will have higher piority
        // In the future, it may also check whether the properties of newJSON is valid 
        // before update
        var retJSON = utils.clone(srcJSON);
        retJSON = retJSON || {};
        var replaceSpecialPropertyValue = function(prop) {
            var propValue = utils.getPropValue(newJSON, prop);
            if (propValue) {
                utils.setPropValue(retJSON, prop, propValue);
            }
        };
        replaceSpecialPropertyValue("plotArea.window.start.categoryAxis");
        replaceSpecialPropertyValue("plotArea.window.end.categoryAxis");
        var _update = function(srcObj, newObj) {
            for (var pro in newObj) {
                if (newObj.hasOwnProperty(pro)) {
                    var newVal = newObj[pro];
                    if (newVal !== undefined) {
                        if ( typeof (newVal) !== "object" || newVal instanceof (Array) || newVal === null) {
                            srcObj[pro] = newVal;
                        } else {
                            var srcVal = srcObj[pro];
                            if (!srcVal) {
                                if (newVal === null) {
                                    srcVal = newVal;
                                } else {
                                    srcVal = srcObj[pro] = {};
                                }
                            } else if (!utils.isObject(srcVal)) {
                                srcVal = srcObj[pro] = {};
                            }
                            _update(srcVal, newVal);
                        }
                    }
                }
            }
        };
        _update(retJSON, newJSON);
        return retJSON;
    };

    utils.substitute = function(str, rest) {
        if (!str) { return ''; }

        for (var i = 1; i < arguments.length; i++) {
            str = str.replace(new RegExp("\\{" + (i - 1) + "\\}", "g"), arguments[i]);
        }

        return str;
    };

    utils.invert = function(object) {
        var result = {};
        for (var key in object) {
            var value = object[key];
            result[value] = key;
        }
        return result;
    };


    /**
     * updates an id with a coding delimeter and a suffix
     * @param {String} id
     * @param {String} suffix
     */
    utils.encode = function(id, suffix) {
        // check to see if the encoding token already exists as we do not want to 
        // encode multiple times
        if( id.indexOf( utils.encodingToken ) > -1 ) {
            return id;
        } else {
            var encodedId = id + utils.encodingToken + suffix;
            return encodedId;
        }
    };
    
    /**
     * decodes an id that has been encoded using utils.encode
     * @param {String} idToDecode
     * @return {Array.<String>} First entry will be decoded id, second entry will be suffix.used to encode
     * 
     * If coding delimeter is not present in the idToDecode then only one entry (idToDecode) will exist in the returned array.
     */
    utils.decode = function(idToDecode) {
        var result = idToDecode.split(utils.encodingToken);
        return result;
    };

    utils.deepEqual = function(source, target) {
        if ( typeof source === 'object' && typeof target === 'object' && utils.isExist(source) && utils.isExist(target)) {
            var key = null;
            for (key in source) {
                if (source.hasOwnProperty(key)) {
                    if (!target.hasOwnProperty(key)) {
                        return false;
                    } else if (!utils.deepEqual(source[key], target[key])) {
                        return false;
                    }
                }
            }
            for (key in target) {
                if (target.hasOwnProperty(key)) {
                    if (!source.hasOwnProperty(key)) {
                        return false;
                    }
                }
            }
            return true;
        } else {
            return source === target;
        }
    };
    
    utils.hasCommonKeyValue = function(source, target) {
        if ( typeof source === 'object' && typeof target === 'object') {
            var key = null;
            for (key in source) {
                if (source.hasOwnProperty(key)) {
                    if (target.hasOwnProperty(key) && utils.deepEqual(source[key], target[key])) {
                        return true;
                    }
                }
            }
            return false;
        }
    };

    utils.isExist = function(o) {
        if ((typeof (o) === 'undefined') || (o === null)) {
            return false;
        }
        return true;
    };

    var genGetterSetter = utils.genGetterSetter = function (name) {
        return function (value) {
            if (arguments.length > 0) {
                this[name] = value;
                return this;
            } else {
                return this[name];
            }
        };
    };

    utils.genGetterSetters = function (prototype, names) {
        names.forEach(function (e) {
            prototype[ e.substring(1) ] = genGetterSetter(e);
        });
    };

    utils.currying = function (fn) {
        var carryArgs = Array.prototype.slice.call(arguments, 1);
        return function () {
            return fn.apply(this, carryArgs.concat( Array.prototype.slice.call(arguments) ) );
        };
    };

    utils.getPropValue = function (obj, propPath) {
        if (obj == null) {
            return undefined;
        }
        var path = propPath.split('.'),
            lastPropName = path.pop(),
            i, len, prop = obj;

        for (i = 0, len = path.length; i < len; i++) {
            prop = prop[ path[i] ];
           if ( prop == null) {
                return undefined;
            }
        }
        return prop[ lastPropName ];
    };

    /**
     * set value to obj on propPath, example:
     * setPropValue({}, "a.b.c", 99) -> {a: {b: {c: 99}}}
     * this function overwrite the existing value(s) if value already exists in obj
    */
    utils.setPropValue = function (obj, propPath, value) {
        var path = propPath.split('.'),
            lastPropName = path.pop(),
            propName, type,
            i, len, prop = obj;
        
        for (i = 0, len = path.length; i < len; i++) {
            propName = path[i];
            type = typeof prop[ propName];

            if ( type !== "object" && type !== "function" ) { // if not object or funciton, give a new object
                prop[ propName ] = {};
            }
            prop = prop[ propName ];
        }
        prop[ lastPropName ] = value;
        return obj;
    };

    /**
     * Delete last node of path from obj
     */
    utils.deletePropValue = function (obj, propPath) {
        var path = propPath.split('.'),
            propName, i, prop = obj;
        for (i = 0; i < path.length; i++) {
            propName = path[i];
            if (prop.hasOwnProperty(propName)) {
                if (i === path.length - 1) {
                    delete prop[propName];
                    break;
                }
                prop = prop[ propName ];
            } else {
                return obj;
            }
        }
        return obj;   
    };
    
    return utils;
});

define('sap/viz/vizservices/common/binding/generators/XTBindingGenerator',[
// @formatter:off
    'sap/viz/vizservices/common/utils/OOUtil',
    'sap/viz/vizservices/common/viz/ChartConst',
    'sap/viz/vizservices/common/feed/FeedConst',
    'sap/viz/vizservices/common/metadata/bindingdef/BindingDefConst',
    'sap/viz/vizservices/common/binding/BindingConst',
    'sap/viz/vizservices/common/binding/generators/BindingGeneratorBase',
    'sap/viz/vizservices/common/utils/Utils'
], function(OOUtil, 
    ChartConst, 
    FeedConst, 
    BindingDefConst,
    BindingConst,
    BindingGeneratorBase, 
    Utils
) {
// @formatter:on

    var XTBindingGenerator = function(settings) {
        XTBindingGenerator.superclass.constructor.apply(this, arguments);
    };
    OOUtil.extend(XTBindingGenerator, BindingGeneratorBase);

    XTBindingGenerator.prototype.generate = function(feedItems) {
        var bindingMapping = map(feedItems);
        return genBinding(this._bindingDefs, bindingMapping);
    };

    var map = function(feedItems) {
        var bindingMapping = {};
        feedItems.forEach(function(feedItem) {
            var values = feedItem.values;
            if (values.length === 0) { return; }

            var feedId = feedItem.id.indexOf('multiplier') !== -1 ? feedItem.id.split('.')[0] : feedItem.id;
            bindingMapping[ feedId ] = [];

            for (var i = 0; i < values.length; ++i) {
                var analysis = values[i];
                var objId;
                //if the analysisObj type is MND
                if (analysis.type === FeedConst.TYPE_MND) {
                    objId = ":mnd";
                } else {
                    objId = analysis.id;
                }
                bindingMapping[ feedId ].push(objId);
            }
        });
        return bindingMapping;
    };

    var genBinding = function(bindingDefs, mapping) {
        var binding = [],
            order = [BindingDefConst.TYPE_MEASURE, BindingDefConst.TYPE_DIMENSION],
            measureIndex = 1,
            dimensionIndex = 1;

        bindingDefs = bindingDefs
            .map(function (def) {
                return {
                    id: def.id(),
                    name: def.name(),
                    type: def.type(),
                    min: def.min(),
                    max: def.max(),
                    mndMode: def.mndMode(),
                    bvrPriority: def.bvrPriority(),
                    bvrMNDPriority: def.bvrMNDPriority()
                };
            })
            .sort(function (a, b) {
                if (a.type !== b.type) {
                    return order.indexOf(a.type) - order.indexOf(b.type);
                }
                else {
                    return a.bvrPriority - b.bvrPriority;
                }
            });

        bindingDefs.filter(function (feed) {
            if (feed.type !== BindingDefConst.TYPE_MEASURE) { return true; }

            // deal measure
            var info = mapping[ feed.id ];
            if ( !info ) {
                // not feed
                // binding.push({ feed: feed.id, source: [] });
                return false;
            }

            binding.push({
                feed: feed.id,
                source: [
                    {
                        "type": BindingConst.MEASURE_VALUES_GROUP,
                        "index": measureIndex ++
                    }
                ]
            });
            return false;
        })
        .filter(function (feed) {
            if (feed.type !== BindingDefConst.TYPE_DIMENSION) { return true; }

            // deal dimension
            var info = mapping[ feed.id ];
            if ( !info ) {
                // not feed
                // binding.push({ feed: feed.id, source: [] });
                return false;
            }

            binding.push({
                feed: feed.id,
                source: [
                    {
                        "type": BindingConst.ANALYSIS_AXIS,
                        "index": dimensionIndex ++
                    }
                ]
            });

            if ( info.indexOf(":mnd") > -1) {
                if ( info[0] === ":mnd" ) {
                    binding[ binding.length -1 ].source.unshift({
                        "type": BindingConst.MEASURE_NAMES_DIMENSION
                    });
                }
                else {
                    binding[ binding.length -1 ].source.push({
                        "type": BindingConst.MEASURE_NAMES_DIMENSION
                    });
                }
            }

            return false;
        });

        return binding;
    };

    return XTBindingGenerator;
});

define('sap/viz/vizservices/common/binding/BindingGeneratorFactory',[
// @formatter:off
    'sap/viz/vizservices/common/binding/generators/FTBindingGenerator',
    'sap/viz/vizservices/common/binding/generators/XTBindingGenerator'
], function(FTBindingGenerator, XTBindingGenerator, InfoFeedingGenerator){
// @formatter:on
    var BindingGeneratorFactory = {
        'create' : function(visualizationType, datasetType) {
            var generator;
            var settings = {
                'visualizationType' : visualizationType
            };
            if ("FlatTableDataset" === datasetType) {
                generator = new FTBindingGenerator(settings);
            } else if ("CrossTableDataset" === datasetType) {
                generator = new XTBindingGenerator(settings);
            }
            return generator;
        }
    };

    return BindingGeneratorFactory;
});

// @formatter:off
define('sap/viz/vizservices/service/binding/BindingService',[
    'sap/viz/vizservices/common/binding/BindingGeneratorFactory',
    'exports'
], function(BindingGeneratorFactory) {
// @formatter:on
    // window.sap.viz.vizservices.service.__internal__.BindingService

    var BindingService = {};

    BindingService.generateBindings = function(type, feedItems, datasetType) {
        var generator = BindingGeneratorFactory.create(type, datasetType);
        return generator.generate(feedItems);
    };

    return BindingService;
});

define( "jquery", [], function () { return jQuery; } );

// @formatter:off
define('sap/viz/vizservices/common/viz/VizUtils',[
    'jquery',
    'sap/viz/vizservices/common/metadata/MetadataFactory',
    'sap/viz/vizservices/common/utils/Utils',
],
function(
    $,
    MetadataFactory, 
    Utils
) {
// @formatter:on
    var VizUtils = {};

    /**
     * remove invalid properties according to chart type
     * @param {object} srcProperties, (string)type
     * @return (object)valid properties object
     */
    VizUtils.getValidProperties = function(srcProperties, type) {
        var reProperties = Utils.clone(srcProperties);
        MetadataFactory.get(type).removeInvalidProperty(reProperties);
        return reProperties;
    };

    /**
     * VizUtils.mergeProperties = function(vizType, destination, src1, ..., srcN) {
     * merge properties src1, src2 ... srcN of vizType into destination
     * @param {string} vizType  vizType of properties
     * @param {object} destination  target properties to be merged into
     * @return {object} src1, src2 ... srcN  properties to be merged from
     */
    VizUtils.mergeProperties = function(vizType, destination, src) {
        var metadata = vizType && MetadataFactory.get(vizType);
        var propDef;
        if (metadata) {
            propDef = metadata.getPropertiesDef();
        }
        destination = destination || {};
        for (var i = 2; i < arguments.length; i++) {
            var srcProp = arguments[i];
            VizUtils._mergePropertiesByDef(propDef, destination, srcProp);
        }
        return destination;
    };
    
    VizUtils.mergeScales = function(target, scales) {
        target = target || [];
        var added = [];
        var found = false;
        for (var i in scales) {
            found = false;
            for (var j in target)  {
                if (target[j].feed === scales[i].feed) {
                    target[j] = scales[i];
                    found = true;
                    break;
                }
            }
            if (!found) {
                added.push(scales[i]);
            }
        }
        if (added.length > 0) {
            target = target.concat(added);
        }
        return target;
    };

    VizUtils._mergePropertiesByDef = function(definition, destination, source) {
        for (var sourceKey in source) {
            var sourceVal = source[sourceKey];
            var subDef = definition ? definition[sourceKey] : definition;
            if (sourceVal !== undefined) {
                if (subDef === null || !$.isPlainObject(sourceVal)) {
                    destination[sourceKey] = sourceVal;
                } else {
                    var destVal = destination[sourceKey];
                    if (!destVal || !$.isPlainObject(destVal)) {
                        destVal = destination[sourceKey] = {};
                    }
                    VizUtils._mergePropertiesByDef(subDef, destVal, sourceVal);
                }
            }
        }
    };
    
    return VizUtils;
});

// @formatter:off
define('sap/viz/vizservices/service/property/PropertyService',[
    'sap/viz/vizservices/common/viz/VizUtils',
    'exports'
], function(VizUtils) {
// @formatter:on
    // window.sap.viz.vizservices.service.__internal__.PropertyService

    var PropertyService = {};

    PropertyService.removeInvalid = function(type, properties) {
        return VizUtils.getValidProperties(properties, type);
    };
    
    PropertyService.mergeProperties = function(type, destinationProperties, srcProperties1, srcProperties2/*, ... srcPropertiesn*/) {
        return VizUtils.mergeProperties.apply(null, arguments);
    };
    
    return PropertyService;
});

// @formatter:off
define('sap/viz/vizservices/service/scale/ScaleService',[
    'sap/viz/vizservices/common/viz/VizUtils',
    'exports'
], function(VizUtils) {
// @formatter:on
    // window.sap.viz.vizservices.service.__internal__.ScaleService

    var ScaleService = {};

    ScaleService.mergeScales = function(type, destinationSclaes, srcSclaes) {
        return VizUtils.mergeScales(destinationSclaes, srcSclaes);
    };
    
    return ScaleService;
});
(function(){
    var list = define && define.__autoLoad;
    if(list && list.length){
        define.__autoLoad = [];
        require(list);
    }
})();
if(define && define.__exportNS){
    define = define.__exportNS;
}
if (window.__sap_viz_internal_requirejs_nextTick__ !== undefined) {
    if (requirejs && requirejs.s && requirejs.s.contexts && requirejs.s.contexts._) {
        requirejs.s.contexts._.nextTick = window.__sap_viz_internal_requirejs_nextTick__;
    }
    window.__sap_viz_internal_requirejs_nextTick__ = undefined;
}