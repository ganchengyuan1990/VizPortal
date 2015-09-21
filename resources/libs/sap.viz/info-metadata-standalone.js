/** vim: et:ts=4:sw=4:sts=4
 * @license RequireJS 2.1.5 Copyright (c) 2010-2012, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/requirejs for details
 */
//Not using strict: uneven strict support in browsers, #392, and causes
//problems with requirejs.exec()/transpiler plugins that may not be strict.
/*jslint regexp: true, nomen: true, sloppy: true */
/*global window, navigator, document, importScripts, setTimeout, opera */

var requirejs, require, define;
(function (global) {
    var req, s, head, baseElement, dataMain, src,
        interactiveScript, currentlyAddingScript, mainScript, subPath,
        version = '2.1.5',
        commentRegExp = /(\/\*([\s\S]*?)\*\/|([^:]|^)\/\/(.*)$)/mg,
        cjsRequireRegExp = /[^.]\s*require\s*\(\s*["']([^'"\s]+)["']\s*\)/g,
        jsSuffixRegExp = /\.js$/,
        currDirRegExp = /^\.\//,
        op = Object.prototype,
        ostring = op.toString,
        hasOwn = op.hasOwnProperty,
        ap = Array.prototype,
        apsp = ap.splice,
        isBrowser = !!(typeof window !== 'undefined' && navigator && document),
        isWebWorker = !isBrowser && typeof importScripts !== 'undefined',
        //PS3 indicates loaded and complete, but need to wait for complete
        //specifically. Sequence is 'loading', 'loaded', execution,
        // then 'complete'. The UA check is unfortunate, but not sure how
        //to feature test w/o causing perf issues.
        readyRegExp = isBrowser && navigator.platform === 'PLAYSTATION 3' ?
                      /^complete$/ : /^(complete|loaded)$/,
        defContextName = '_',
        //Oh the tragedy, detecting opera. See the usage of isOpera for reason.
        isOpera = typeof opera !== 'undefined' && opera.toString() === '[object Opera]',
        contexts = {},
        cfg = {},
        globalDefQueue = [],
        useInteractive = false;

    function isFunction(it) {
        return ostring.call(it) === '[object Function]';
    }

    function isArray(it) {
        return ostring.call(it) === '[object Array]';
    }

    /**
     * Helper function for iterating over an array. If the func returns
     * a true value, it will break out of the loop.
     */
    function each(ary, func) {
        if (ary) {
            var i;
            for (i = 0; i < ary.length; i += 1) {
                if (ary[i] && func(ary[i], i, ary)) {
                    break;
                }
            }
        }
    }

    /**
     * Helper function for iterating over an array backwards. If the func
     * returns a true value, it will break out of the loop.
     */
    function eachReverse(ary, func) {
        if (ary) {
            var i;
            for (i = ary.length - 1; i > -1; i -= 1) {
                if (ary[i] && func(ary[i], i, ary)) {
                    break;
                }
            }
        }
    }

    function hasProp(obj, prop) {
        return hasOwn.call(obj, prop);
    }

    function getOwn(obj, prop) {
        return hasProp(obj, prop) && obj[prop];
    }

    /**
     * Cycles over properties in an object and calls a function for each
     * property value. If the function returns a truthy value, then the
     * iteration is stopped.
     */
    function eachProp(obj, func) {
        var prop;
        for (prop in obj) {
            if (hasProp(obj, prop)) {
                if (func(obj[prop], prop)) {
                    break;
                }
            }
        }
    }

    /**
     * Simple function to mix in properties from source into target,
     * but only if target does not already have a property of the same name.
     */
    function mixin(target, source, force, deepStringMixin) {
        if (source) {
            eachProp(source, function (value, prop) {
                if (force || !hasProp(target, prop)) {
                    if (deepStringMixin && typeof value !== 'string') {
                        if (!target[prop]) {
                            target[prop] = {};
                        }
                        mixin(target[prop], value, force, deepStringMixin);
                    } else {
                        target[prop] = value;
                    }
                }
            });
        }
        return target;
    }

    //Similar to Function.prototype.bind, but the 'this' object is specified
    //first, since it is easier to read/figure out what 'this' will be.
    function bind(obj, fn) {
        return function () {
            return fn.apply(obj, arguments);
        };
    }

    function scripts() {
        return document.getElementsByTagName('script');
    }

    //Allow getting a global that expressed in
    //dot notation, like 'a.b.c'.
    function getGlobal(value) {
        if (!value) {
            return value;
        }
        var g = global;
        each(value.split('.'), function (part) {
            g = g[part];
        });
        return g;
    }

    /**
     * Constructs an error with a pointer to an URL with more information.
     * @param {String} id the error ID that maps to an ID on a web page.
     * @param {String} message human readable error.
     * @param {Error} [err] the original error, if there is one.
     *
     * @returns {Error}
     */
    function makeError(id, msg, err, requireModules) {
        var e = new Error(msg + '\nhttp://requirejs.org/docs/errors.html#' + id);
        e.requireType = id;
        e.requireModules = requireModules;
        if (err) {
            e.originalError = err;
        }
        return e;
    }

    if (typeof define !== 'undefined') {
        //If a define is already in play via another AMD loader,
        //do not overwrite.
        return;
    }

    if (typeof requirejs !== 'undefined') {
        if (isFunction(requirejs)) {
            //Do not overwrite and existing requirejs instance.
            return;
        }
        cfg = requirejs;
        requirejs = undefined;
    }

    //Allow for a require config object
    if (typeof require !== 'undefined' && !isFunction(require)) {
        //assume it is a config object.
        cfg = require;
        require = undefined;
    }

    function newContext(contextName) {
        var inCheckLoaded, Module, context, handlers,
            checkLoadedTimeoutId,
            config = {
                //Defaults. Do not set a default for map
                //config to speed up normalize(), which
                //will run faster if there is no default.
                waitSeconds: 7,
                baseUrl: './',
                paths: {},
                pkgs: {},
                shim: {},
                config: {}
            },
            registry = {},
            //registry of just enabled modules, to speed
            //cycle breaking code when lots of modules
            //are registered, but not activated.
            enabledRegistry = {},
            undefEvents = {},
            defQueue = [],
            defined = {},
            urlFetched = {},
            requireCounter = 1,
            unnormalizedCounter = 1;

        /**
         * Trims the . and .. from an array of path segments.
         * It will keep a leading path segment if a .. will become
         * the first path segment, to help with module name lookups,
         * which act like paths, but can be remapped. But the end result,
         * all paths that use this function should look normalized.
         * NOTE: this method MODIFIES the input array.
         * @param {Array} ary the array of path segments.
         */
        function trimDots(ary) {
            var i, part;
            for (i = 0; ary[i]; i += 1) {
                part = ary[i];
                if (part === '.') {
                    ary.splice(i, 1);
                    i -= 1;
                } else if (part === '..') {
                    if (i === 1 && (ary[2] === '..' || ary[0] === '..')) {
                        //End of the line. Keep at least one non-dot
                        //path segment at the front so it can be mapped
                        //correctly to disk. Otherwise, there is likely
                        //no path mapping for a path starting with '..'.
                        //This can still fail, but catches the most reasonable
                        //uses of ..
                        break;
                    } else if (i > 0) {
                        ary.splice(i - 1, 2);
                        i -= 2;
                    }
                }
            }
        }

        /**
         * Given a relative module name, like ./something, normalize it to
         * a real name that can be mapped to a path.
         * @param {String} name the relative name
         * @param {String} baseName a real name that the name arg is relative
         * to.
         * @param {Boolean} applyMap apply the map config to the value. Should
         * only be done if this normalization is for a dependency ID.
         * @returns {String} normalized name
         */
        function normalize(name, baseName, applyMap) {
            var pkgName, pkgConfig, mapValue, nameParts, i, j, nameSegment,
                foundMap, foundI, foundStarMap, starI,
                baseParts = baseName && baseName.split('/'),
                normalizedBaseParts = baseParts,
                map = config.map,
                starMap = map && map['*'];

            //Adjust any relative paths.
            if (name && name.charAt(0) === '.') {
                //If have a base name, try to normalize against it,
                //otherwise, assume it is a top-level require that will
                //be relative to baseUrl in the end.
                if (baseName) {
                    if (getOwn(config.pkgs, baseName)) {
                        //If the baseName is a package name, then just treat it as one
                        //name to concat the name with.
                        normalizedBaseParts = baseParts = [baseName];
                    } else {
                        //Convert baseName to array, and lop off the last part,
                        //so that . matches that 'directory' and not name of the baseName's
                        //module. For instance, baseName of 'one/two/three', maps to
                        //'one/two/three.js', but we want the directory, 'one/two' for
                        //this normalization.
                        normalizedBaseParts = baseParts.slice(0, baseParts.length - 1);
                    }

                    name = normalizedBaseParts.concat(name.split('/'));
                    trimDots(name);

                    //Some use of packages may use a . path to reference the
                    //'main' module name, so normalize for that.
                    pkgConfig = getOwn(config.pkgs, (pkgName = name[0]));
                    name = name.join('/');
                    if (pkgConfig && name === pkgName + '/' + pkgConfig.main) {
                        name = pkgName;
                    }
                } else if (name.indexOf('./') === 0) {
                    // No baseName, so this is ID is resolved relative
                    // to baseUrl, pull off the leading dot.
                    name = name.substring(2);
                }
            }

            //Apply map config if available.
            if (applyMap && map && (baseParts || starMap)) {
                nameParts = name.split('/');

                for (i = nameParts.length; i > 0; i -= 1) {
                    nameSegment = nameParts.slice(0, i).join('/');

                    if (baseParts) {
                        //Find the longest baseName segment match in the config.
                        //So, do joins on the biggest to smallest lengths of baseParts.
                        for (j = baseParts.length; j > 0; j -= 1) {
                            mapValue = getOwn(map, baseParts.slice(0, j).join('/'));

                            //baseName segment has config, find if it has one for
                            //this name.
                            if (mapValue) {
                                mapValue = getOwn(mapValue, nameSegment);
                                if (mapValue) {
                                    //Match, update name to the new value.
                                    foundMap = mapValue;
                                    foundI = i;
                                    break;
                                }
                            }
                        }
                    }

                    if (foundMap) {
                        break;
                    }

                    //Check for a star map match, but just hold on to it,
                    //if there is a shorter segment match later in a matching
                    //config, then favor over this star map.
                    if (!foundStarMap && starMap && getOwn(starMap, nameSegment)) {
                        foundStarMap = getOwn(starMap, nameSegment);
                        starI = i;
                    }
                }

                if (!foundMap && foundStarMap) {
                    foundMap = foundStarMap;
                    foundI = starI;
                }

                if (foundMap) {
                    nameParts.splice(0, foundI, foundMap);
                    name = nameParts.join('/');
                }
            }

            return name;
        }

        function removeScript(name) {
            if (isBrowser) {
                each(scripts(), function (scriptNode) {
                    if (scriptNode.getAttribute('data-requiremodule') === name &&
                            scriptNode.getAttribute('data-requirecontext') === context.contextName) {
                        scriptNode.parentNode.removeChild(scriptNode);
                        return true;
                    }
                });
            }
        }

        function hasPathFallback(id) {
            var pathConfig = getOwn(config.paths, id);
            if (pathConfig && isArray(pathConfig) && pathConfig.length > 1) {
                removeScript(id);
                //Pop off the first array value, since it failed, and
                //retry
                pathConfig.shift();
                context.require.undef(id);
                context.require([id]);
                return true;
            }
        }

        //Turns a plugin!resource to [plugin, resource]
        //with the plugin being undefined if the name
        //did not have a plugin prefix.
        function splitPrefix(name) {
            var prefix,
                index = name ? name.indexOf('!') : -1;
            if (index > -1) {
                prefix = name.substring(0, index);
                name = name.substring(index + 1, name.length);
            }
            return [prefix, name];
        }

        /**
         * Creates a module mapping that includes plugin prefix, module
         * name, and path. If parentModuleMap is provided it will
         * also normalize the name via require.normalize()
         *
         * @param {String} name the module name
         * @param {String} [parentModuleMap] parent module map
         * for the module name, used to resolve relative names.
         * @param {Boolean} isNormalized: is the ID already normalized.
         * This is true if this call is done for a define() module ID.
         * @param {Boolean} applyMap: apply the map config to the ID.
         * Should only be true if this map is for a dependency.
         *
         * @returns {Object}
         */
        function makeModuleMap(name, parentModuleMap, isNormalized, applyMap) {
            var url, pluginModule, suffix, nameParts,
                prefix = null,
                parentName = parentModuleMap ? parentModuleMap.name : null,
                originalName = name,
                isDefine = true,
                normalizedName = '';

            //If no name, then it means it is a require call, generate an
            //internal name.
            if (!name) {
                isDefine = false;
                name = '_@r' + (requireCounter += 1);
            }

            nameParts = splitPrefix(name);
            prefix = nameParts[0];
            name = nameParts[1];

            if (prefix) {
                prefix = normalize(prefix, parentName, applyMap);
                pluginModule = getOwn(defined, prefix);
            }

            //Account for relative paths if there is a base name.
            if (name) {
                if (prefix) {
                    if (pluginModule && pluginModule.normalize) {
                        //Plugin is loaded, use its normalize method.
                        normalizedName = pluginModule.normalize(name, function (name) {
                            return normalize(name, parentName, applyMap);
                        });
                    } else {
                        normalizedName = normalize(name, parentName, applyMap);
                    }
                } else {
                    //A regular module.
                    normalizedName = normalize(name, parentName, applyMap);

                    //Normalized name may be a plugin ID due to map config
                    //application in normalize. The map config values must
                    //already be normalized, so do not need to redo that part.
                    nameParts = splitPrefix(normalizedName);
                    prefix = nameParts[0];
                    normalizedName = nameParts[1];
                    isNormalized = true;

                    url = context.nameToUrl(normalizedName);
                }
            }

            //If the id is a plugin id that cannot be determined if it needs
            //normalization, stamp it with a unique ID so two matching relative
            //ids that may conflict can be separate.
            suffix = prefix && !pluginModule && !isNormalized ?
                     '_unnormalized' + (unnormalizedCounter += 1) :
                     '';

            return {
                prefix: prefix,
                name: normalizedName,
                parentMap: parentModuleMap,
                unnormalized: !!suffix,
                url: url,
                originalName: originalName,
                isDefine: isDefine,
                id: (prefix ?
                        prefix + '!' + normalizedName :
                        normalizedName) + suffix
            };
        }

        function getModule(depMap) {
            var id = depMap.id,
                mod = getOwn(registry, id);

            if (!mod) {
                mod = registry[id] = new context.Module(depMap);
            }

            return mod;
        }

        function on(depMap, name, fn) {
            var id = depMap.id,
                mod = getOwn(registry, id);

            if (hasProp(defined, id) &&
                    (!mod || mod.defineEmitComplete)) {
                if (name === 'defined') {
                    fn(defined[id]);
                }
            } else {
                getModule(depMap).on(name, fn);
            }
        }

        function onError(err, errback) {
            var ids = err.requireModules,
                notified = false;

            if (errback) {
                errback(err);
            } else {
                each(ids, function (id) {
                    var mod = getOwn(registry, id);
                    if (mod) {
                        //Set error on module, so it skips timeout checks.
                        mod.error = err;
                        if (mod.events.error) {
                            notified = true;
                            mod.emit('error', err);
                        }
                    }
                });

                if (!notified) {
                    req.onError(err);
                }
            }
        }

        /**
         * Internal method to transfer globalQueue items to this context's
         * defQueue.
         */
        function takeGlobalQueue() {
            //Push all the globalDefQueue items into the context's defQueue
            if (globalDefQueue.length) {
                //Array splice in the values since the context code has a
                //local var ref to defQueue, so cannot just reassign the one
                //on context.
                apsp.apply(defQueue,
                           [defQueue.length - 1, 0].concat(globalDefQueue));
                globalDefQueue = [];
            }
        }

        handlers = {
            'require': function (mod) {
                if (mod.require) {
                    return mod.require;
                } else {
                    return (mod.require = context.makeRequire(mod.map));
                }
            },
            'exports': function (mod) {
                mod.usingExports = true;
                if (mod.map.isDefine) {
                    if (mod.exports) {
                        return mod.exports;
                    } else {
                        return (mod.exports = defined[mod.map.id] = {});
                    }
                }
            },
            'module': function (mod) {
                if (mod.module) {
                    return mod.module;
                } else {
                    return (mod.module = {
                        id: mod.map.id,
                        uri: mod.map.url,
                        config: function () {
                            return (config.config && getOwn(config.config, mod.map.id)) || {};
                        },
                        exports: defined[mod.map.id]
                    });
                }
            }
        };

        function cleanRegistry(id) {
            //Clean up machinery used for waiting modules.
            delete registry[id];
            delete enabledRegistry[id];
        }

        function breakCycle(mod, traced, processed) {
            var id = mod.map.id;

            if (mod.error) {
                mod.emit('error', mod.error);
            } else {
                traced[id] = true;
                each(mod.depMaps, function (depMap, i) {
                    var depId = depMap.id,
                        dep = getOwn(registry, depId);

                    //Only force things that have not completed
                    //being defined, so still in the registry,
                    //and only if it has not been matched up
                    //in the module already.
                    if (dep && !mod.depMatched[i] && !processed[depId]) {
                        if (getOwn(traced, depId)) {
                            mod.defineDep(i, defined[depId]);
                            mod.check(); //pass false?
                        } else {
                            breakCycle(dep, traced, processed);
                        }
                    }
                });
                processed[id] = true;
            }
        }

        function checkLoaded() {
            var map, modId, err, usingPathFallback,
                waitInterval = config.waitSeconds * 1000,
                //It is possible to disable the wait interval by using waitSeconds of 0.
                expired = waitInterval && (context.startTime + waitInterval) < new Date().getTime(),
                noLoads = [],
                reqCalls = [],
                stillLoading = false,
                needCycleCheck = true;

            //Do not bother if this call was a result of a cycle break.
            if (inCheckLoaded) {
                return;
            }

            inCheckLoaded = true;

            //Figure out the state of all the modules.
            eachProp(enabledRegistry, function (mod) {
                map = mod.map;
                modId = map.id;

                //Skip things that are not enabled or in error state.
                if (!mod.enabled) {
                    return;
                }

                if (!map.isDefine) {
                    reqCalls.push(mod);
                }

                if (!mod.error) {
                    //If the module should be executed, and it has not
                    //been inited and time is up, remember it.
                    if (!mod.inited && expired) {
                        if (hasPathFallback(modId)) {
                            usingPathFallback = true;
                            stillLoading = true;
                        } else {
                            noLoads.push(modId);
                            removeScript(modId);
                        }
                    } else if (!mod.inited && mod.fetched && map.isDefine) {
                        stillLoading = true;
                        if (!map.prefix) {
                            //No reason to keep looking for unfinished
                            //loading. If the only stillLoading is a
                            //plugin resource though, keep going,
                            //because it may be that a plugin resource
                            //is waiting on a non-plugin cycle.
                            return (needCycleCheck = false);
                        }
                    }
                }
            });

            if (expired && noLoads.length) {
                //If wait time expired, throw error of unloaded modules.
                err = makeError('timeout', 'Load timeout for modules: ' + noLoads, null, noLoads);
                err.contextName = context.contextName;
                return onError(err);
            }

            //Not expired, check for a cycle.
            if (needCycleCheck) {
                each(reqCalls, function (mod) {
                    breakCycle(mod, {}, {});
                });
            }

            //If still waiting on loads, and the waiting load is something
            //other than a plugin resource, or there are still outstanding
            //scripts, then just try back later.
            if ((!expired || usingPathFallback) && stillLoading) {
                //Something is still waiting to load. Wait for it, but only
                //if a timeout is not already in effect.
                if ((isBrowser || isWebWorker) && !checkLoadedTimeoutId) {
                    checkLoadedTimeoutId = setTimeout(function () {
                        checkLoadedTimeoutId = 0;
                        checkLoaded();
                    }, 50);
                }
            }

            inCheckLoaded = false;
        }

        Module = function (map) {
            this.events = getOwn(undefEvents, map.id) || {};
            this.map = map;
            this.shim = getOwn(config.shim, map.id);
            this.depExports = [];
            this.depMaps = [];
            this.depMatched = [];
            this.pluginMaps = {};
            this.depCount = 0;

            /* this.exports this.factory
               this.depMaps = [],
               this.enabled, this.fetched
            */
        };

        Module.prototype = {
            init: function (depMaps, factory, errback, options) {
                options = options || {};

                //Do not do more inits if already done. Can happen if there
                //are multiple define calls for the same module. That is not
                //a normal, common case, but it is also not unexpected.
                if (this.inited) {
                    return;
                }

                this.factory = factory;

                if (errback) {
                    //Register for errors on this module.
                    this.on('error', errback);
                } else if (this.events.error) {
                    //If no errback already, but there are error listeners
                    //on this module, set up an errback to pass to the deps.
                    errback = bind(this, function (err) {
                        this.emit('error', err);
                    });
                }

                //Do a copy of the dependency array, so that
                //source inputs are not modified. For example
                //"shim" deps are passed in here directly, and
                //doing a direct modification of the depMaps array
                //would affect that config.
                this.depMaps = depMaps && depMaps.slice(0);

                this.errback = errback;

                //Indicate this module has be initialized
                this.inited = true;

                this.ignore = options.ignore;

                //Could have option to init this module in enabled mode,
                //or could have been previously marked as enabled. However,
                //the dependencies are not known until init is called. So
                //if enabled previously, now trigger dependencies as enabled.
                if (options.enabled || this.enabled) {
                    //Enable this module and dependencies.
                    //Will call this.check()
                    this.enable();
                } else {
                    this.check();
                }
            },

            defineDep: function (i, depExports) {
                //Because of cycles, defined callback for a given
                //export can be called more than once.
                if (!this.depMatched[i]) {
                    this.depMatched[i] = true;
                    this.depCount -= 1;
                    this.depExports[i] = depExports;
                }
            },

            fetch: function () {
                if (this.fetched) {
                    return;
                }
                this.fetched = true;

                context.startTime = (new Date()).getTime();

                var map = this.map;

                //If the manager is for a plugin managed resource,
                //ask the plugin to load it now.
                if (this.shim) {
                    context.makeRequire(this.map, {
                        enableBuildCallback: true
                    })(this.shim.deps || [], bind(this, function () {
                        return map.prefix ? this.callPlugin() : this.load();
                    }));
                } else {
                    //Regular dependency.
                    return map.prefix ? this.callPlugin() : this.load();
                }
            },

            load: function () {
                var url = this.map.url;

                //Regular dependency.
                if (!urlFetched[url]) {
                    urlFetched[url] = true;
                    context.load(this.map.id, url);
                }
            },

            /**
             * Checks if the module is ready to define itself, and if so,
             * define it.
             */
            check: function () {
                if (!this.enabled || this.enabling) {
                    return;
                }

                var err, cjsModule,
                    id = this.map.id,
                    depExports = this.depExports,
                    exports = this.exports,
                    factory = this.factory;

                if (!this.inited) {
                    this.fetch();
                } else if (this.error) {
                    this.emit('error', this.error);
                } else if (!this.defining) {
                    //The factory could trigger another require call
                    //that would result in checking this module to
                    //define itself again. If already in the process
                    //of doing that, skip this work.
                    this.defining = true;

                    if (this.depCount < 1 && !this.defined) {
                        if (isFunction(factory)) {
                            //If there is an error listener, favor passing
                            //to that instead of throwing an error.
                            if (this.events.error) {
                                try {
                                    exports = context.execCb(id, factory, depExports, exports);
                                } catch (e) {
                                    err = e;
                                }
                            } else {
                                exports = context.execCb(id, factory, depExports, exports);
                            }

                            if (this.map.isDefine) {
                                //If setting exports via 'module' is in play,
                                //favor that over return value and exports. After that,
                                //favor a non-undefined return value over exports use.
                                cjsModule = this.module;
                                if (cjsModule &&
                                        cjsModule.exports !== undefined &&
                                        //Make sure it is not already the exports value
                                        cjsModule.exports !== this.exports) {
                                    exports = cjsModule.exports;
                                } else if (exports === undefined && this.usingExports) {
                                    //exports already set the defined value.
                                    exports = this.exports;
                                }
                            }

                            if (err) {
                                err.requireMap = this.map;
                                err.requireModules = [this.map.id];
                                err.requireType = 'define';
                                return onError((this.error = err));
                            }

                        } else {
                            //Just a literal value
                            exports = factory;
                        }

                        this.exports = exports;

                        if (this.map.isDefine && !this.ignore) {
                            defined[id] = exports;

                            if (req.onResourceLoad) {
                                req.onResourceLoad(context, this.map, this.depMaps);
                            }
                        }

                        //Clean up
                        cleanRegistry(id);

                        this.defined = true;
                    }

                    //Finished the define stage. Allow calling check again
                    //to allow define notifications below in the case of a
                    //cycle.
                    this.defining = false;

                    if (this.defined && !this.defineEmitted) {
                        this.defineEmitted = true;
                        this.emit('defined', this.exports);
                        this.defineEmitComplete = true;
                    }

                }
            },

            callPlugin: function () {
                var map = this.map,
                    id = map.id,
                    //Map already normalized the prefix.
                    pluginMap = makeModuleMap(map.prefix);

                //Mark this as a dependency for this plugin, so it
                //can be traced for cycles.
                this.depMaps.push(pluginMap);

                on(pluginMap, 'defined', bind(this, function (plugin) {
                    var load, normalizedMap, normalizedMod,
                        name = this.map.name,
                        parentName = this.map.parentMap ? this.map.parentMap.name : null,
                        localRequire = context.makeRequire(map.parentMap, {
                            enableBuildCallback: true
                        });

                    //If current map is not normalized, wait for that
                    //normalized name to load instead of continuing.
                    if (this.map.unnormalized) {
                        //Normalize the ID if the plugin allows it.
                        if (plugin.normalize) {
                            name = plugin.normalize(name, function (name) {
                                return normalize(name, parentName, true);
                            }) || '';
                        }

                        //prefix and name should already be normalized, no need
                        //for applying map config again either.
                        normalizedMap = makeModuleMap(map.prefix + '!' + name,
                                                      this.map.parentMap);
                        on(normalizedMap,
                            'defined', bind(this, function (value) {
                                this.init([], function () { return value; }, null, {
                                    enabled: true,
                                    ignore: true
                                });
                            }));

                        normalizedMod = getOwn(registry, normalizedMap.id);
                        if (normalizedMod) {
                            //Mark this as a dependency for this plugin, so it
                            //can be traced for cycles.
                            this.depMaps.push(normalizedMap);

                            if (this.events.error) {
                                normalizedMod.on('error', bind(this, function (err) {
                                    this.emit('error', err);
                                }));
                            }
                            normalizedMod.enable();
                        }

                        return;
                    }

                    load = bind(this, function (value) {
                        this.init([], function () { return value; }, null, {
                            enabled: true
                        });
                    });

                    load.error = bind(this, function (err) {
                        this.inited = true;
                        this.error = err;
                        err.requireModules = [id];

                        //Remove temp unnormalized modules for this module,
                        //since they will never be resolved otherwise now.
                        eachProp(registry, function (mod) {
                            if (mod.map.id.indexOf(id + '_unnormalized') === 0) {
                                cleanRegistry(mod.map.id);
                            }
                        });

                        onError(err);
                    });

                    //Allow plugins to load other code without having to know the
                    //context or how to 'complete' the load.
                    load.fromText = bind(this, function (text, textAlt) {
                        /*jslint evil: true */
                        var moduleName = map.name,
                            moduleMap = makeModuleMap(moduleName),
                            hasInteractive = useInteractive;

                        //As of 2.1.0, support just passing the text, to reinforce
                        //fromText only being called once per resource. Still
                        //support old style of passing moduleName but discard
                        //that moduleName in favor of the internal ref.
                        if (textAlt) {
                            text = textAlt;
                        }

                        //Turn off interactive script matching for IE for any define
                        //calls in the text, then turn it back on at the end.
                        if (hasInteractive) {
                            useInteractive = false;
                        }

                        //Prime the system by creating a module instance for
                        //it.
                        getModule(moduleMap);

                        //Transfer any config to this other module.
                        if (hasProp(config.config, id)) {
                            config.config[moduleName] = config.config[id];
                        }

                        try {
                            req.exec(text);
                        } catch (e) {
                            return onError(makeError('fromtexteval',
                                             'fromText eval for ' + id +
                                            ' failed: ' + e,
                                             e,
                                             [id]));
                        }

                        if (hasInteractive) {
                            useInteractive = true;
                        }

                        //Mark this as a dependency for the plugin
                        //resource
                        this.depMaps.push(moduleMap);

                        //Support anonymous modules.
                        context.completeLoad(moduleName);

                        //Bind the value of that module to the value for this
                        //resource ID.
                        localRequire([moduleName], load);
                    });

                    //Use parentName here since the plugin's name is not reliable,
                    //could be some weird string with no path that actually wants to
                    //reference the parentName's path.
                    plugin.load(map.name, localRequire, load, config);
                }));

                context.enable(pluginMap, this);
                this.pluginMaps[pluginMap.id] = pluginMap;
            },

            enable: function () {
                enabledRegistry[this.map.id] = this;
                this.enabled = true;

                //Set flag mentioning that the module is enabling,
                //so that immediate calls to the defined callbacks
                //for dependencies do not trigger inadvertent load
                //with the depCount still being zero.
                this.enabling = true;

                //Enable each dependency
                each(this.depMaps, bind(this, function (depMap, i) {
                    var id, mod, handler;

                    if (typeof depMap === 'string') {
                        //Dependency needs to be converted to a depMap
                        //and wired up to this module.
                        depMap = makeModuleMap(depMap,
                                               (this.map.isDefine ? this.map : this.map.parentMap),
                                               false,
                                               !this.skipMap);
                        this.depMaps[i] = depMap;

                        handler = getOwn(handlers, depMap.id);

                        if (handler) {
                            this.depExports[i] = handler(this);
                            return;
                        }

                        this.depCount += 1;

                        on(depMap, 'defined', bind(this, function (depExports) {
                            this.defineDep(i, depExports);
                            this.check();
                        }));

                        if (this.errback) {
                            on(depMap, 'error', this.errback);
                        }
                    }

                    id = depMap.id;
                    mod = registry[id];

                    //Skip special modules like 'require', 'exports', 'module'
                    //Also, don't call enable if it is already enabled,
                    //important in circular dependency cases.
                    if (!hasProp(handlers, id) && mod && !mod.enabled) {
                        context.enable(depMap, this);
                    }
                }));

                //Enable each plugin that is used in
                //a dependency
                eachProp(this.pluginMaps, bind(this, function (pluginMap) {
                    var mod = getOwn(registry, pluginMap.id);
                    if (mod && !mod.enabled) {
                        context.enable(pluginMap, this);
                    }
                }));

                this.enabling = false;

                this.check();
            },

            on: function (name, cb) {
                var cbs = this.events[name];
                if (!cbs) {
                    cbs = this.events[name] = [];
                }
                cbs.push(cb);
            },

            emit: function (name, evt) {
                each(this.events[name], function (cb) {
                    cb(evt);
                });
                if (name === 'error') {
                    //Now that the error handler was triggered, remove
                    //the listeners, since this broken Module instance
                    //can stay around for a while in the registry.
                    delete this.events[name];
                }
            }
        };

        function callGetModule(args) {
            //Skip modules already defined.
            if (!hasProp(defined, args[0])) {
                getModule(makeModuleMap(args[0], null, true)).init(args[1], args[2]);
            }
        }

        function removeListener(node, func, name, ieName) {
            //Favor detachEvent because of IE9
            //issue, see attachEvent/addEventListener comment elsewhere
            //in this file.
            if (node.detachEvent && !isOpera) {
                //Probably IE. If not it will throw an error, which will be
                //useful to know.
                if (ieName) {
                    node.detachEvent(ieName, func);
                }
            } else {
                node.removeEventListener(name, func, false);
            }
        }

        /**
         * Given an event from a script node, get the requirejs info from it,
         * and then removes the event listeners on the node.
         * @param {Event} evt
         * @returns {Object}
         */
        function getScriptData(evt) {
            //Using currentTarget instead of target for Firefox 2.0's sake. Not
            //all old browsers will be supported, but this one was easy enough
            //to support and still makes sense.
            var node = evt.currentTarget || evt.srcElement;

            //Remove the listeners once here.
            removeListener(node, context.onScriptLoad, 'load', 'onreadystatechange');
            removeListener(node, context.onScriptError, 'error');

            return {
                node: node,
                id: node && node.getAttribute('data-requiremodule')
            };
        }

        function intakeDefines() {
            var args;

            //Any defined modules in the global queue, intake them now.
            takeGlobalQueue();

            //Make sure any remaining defQueue items get properly processed.
            while (defQueue.length) {
                args = defQueue.shift();
                if (args[0] === null) {
                    return onError(makeError('mismatch', 'Mismatched anonymous define() module: ' + args[args.length - 1]));
                } else {
                    //args are id, deps, factory. Should be normalized by the
                    //define() function.
                    callGetModule(args);
                }
            }
        }

        context = {
            config: config,
            contextName: contextName,
            registry: registry,
            defined: defined,
            urlFetched: urlFetched,
            defQueue: defQueue,
            Module: Module,
            makeModuleMap: makeModuleMap,
            nextTick: req.nextTick,
            onError: onError,

            /**
             * Set a configuration for the context.
             * @param {Object} cfg config object to integrate.
             */
            configure: function (cfg) {
                //Make sure the baseUrl ends in a slash.
                if (cfg.baseUrl) {
                    if (cfg.baseUrl.charAt(cfg.baseUrl.length - 1) !== '/') {
                        cfg.baseUrl += '/';
                    }
                }

                //Save off the paths and packages since they require special processing,
                //they are additive.
                var pkgs = config.pkgs,
                    shim = config.shim,
                    objs = {
                        paths: true,
                        config: true,
                        map: true
                    };

                eachProp(cfg, function (value, prop) {
                    if (objs[prop]) {
                        if (prop === 'map') {
                            if (!config.map) {
                                config.map = {};
                            }
                            mixin(config[prop], value, true, true);
                        } else {
                            mixin(config[prop], value, true);
                        }
                    } else {
                        config[prop] = value;
                    }
                });

                //Merge shim
                if (cfg.shim) {
                    eachProp(cfg.shim, function (value, id) {
                        //Normalize the structure
                        if (isArray(value)) {
                            value = {
                                deps: value
                            };
                        }
                        if ((value.exports || value.init) && !value.exportsFn) {
                            value.exportsFn = context.makeShimExports(value);
                        }
                        shim[id] = value;
                    });
                    config.shim = shim;
                }

                //Adjust packages if necessary.
                if (cfg.packages) {
                    each(cfg.packages, function (pkgObj) {
                        var location;

                        pkgObj = typeof pkgObj === 'string' ? { name: pkgObj } : pkgObj;
                        location = pkgObj.location;

                        //Create a brand new object on pkgs, since currentPackages can
                        //be passed in again, and config.pkgs is the internal transformed
                        //state for all package configs.
                        pkgs[pkgObj.name] = {
                            name: pkgObj.name,
                            location: location || pkgObj.name,
                            //Remove leading dot in main, so main paths are normalized,
                            //and remove any trailing .js, since different package
                            //envs have different conventions: some use a module name,
                            //some use a file name.
                            main: (pkgObj.main || 'main')
                                  .replace(currDirRegExp, '')
                                  .replace(jsSuffixRegExp, '')
                        };
                    });

                    //Done with modifications, assing packages back to context config
                    config.pkgs = pkgs;
                }

                //If there are any "waiting to execute" modules in the registry,
                //update the maps for them, since their info, like URLs to load,
                //may have changed.
                eachProp(registry, function (mod, id) {
                    //If module already has init called, since it is too
                    //late to modify them, and ignore unnormalized ones
                    //since they are transient.
                    if (!mod.inited && !mod.map.unnormalized) {
                        mod.map = makeModuleMap(id);
                    }
                });

                //If a deps array or a config callback is specified, then call
                //require with those args. This is useful when require is defined as a
                //config object before require.js is loaded.
                if (cfg.deps || cfg.callback) {
                    context.require(cfg.deps || [], cfg.callback);
                }
            },

            makeShimExports: function (value) {
                function fn() {
                    var ret;
                    if (value.init) {
                        ret = value.init.apply(global, arguments);
                    }
                    return ret || (value.exports && getGlobal(value.exports));
                }
                return fn;
            },

            makeRequire: function (relMap, options) {
                options = options || {};

                function localRequire(deps, callback, errback) {
                    var id, map, requireMod;

                    if (options.enableBuildCallback && callback && isFunction(callback)) {
                        callback.__requireJsBuild = true;
                    }

                    if (typeof deps === 'string') {
                        if (isFunction(callback)) {
                            //Invalid call
                            return onError(makeError('requireargs', 'Invalid require call'), errback);
                        }

                        //If require|exports|module are requested, get the
                        //value for them from the special handlers. Caveat:
                        //this only works while module is being defined.
                        if (relMap && hasProp(handlers, deps)) {
                            return handlers[deps](registry[relMap.id]);
                        }

                        //Synchronous access to one module. If require.get is
                        //available (as in the Node adapter), prefer that.
                        if (req.get) {
                            return req.get(context, deps, relMap, localRequire);
                        }

                        //Normalize module name, if it contains . or ..
                        map = makeModuleMap(deps, relMap, false, true);
                        id = map.id;

                        if (!hasProp(defined, id)) {
                            return onError(makeError('notloaded', 'Module name "' +
                                        id +
                                        '" has not been loaded yet for context: ' +
                                        contextName +
                                        (relMap ? '' : '. Use require([])')));
                        }
                        return defined[id];
                    }

                    //Grab defines waiting in the global queue.
                    intakeDefines();

                    //Mark all the dependencies as needing to be loaded.
                    context.nextTick(function () {
                        //Some defines could have been added since the
                        //require call, collect them.
                        intakeDefines();

                        requireMod = getModule(makeModuleMap(null, relMap));

                        //Store if map config should be applied to this require
                        //call for dependencies.
                        requireMod.skipMap = options.skipMap;

                        requireMod.init(deps, callback, errback, {
                            enabled: true
                        });

                        checkLoaded();
                    });

                    return localRequire;
                }

                mixin(localRequire, {
                    isBrowser: isBrowser,

                    /**
                     * Converts a module name + .extension into an URL path.
                     * *Requires* the use of a module name. It does not support using
                     * plain URLs like nameToUrl.
                     */
                    toUrl: function (moduleNamePlusExt) {
                        var ext,
                            index = moduleNamePlusExt.lastIndexOf('.'),
                            segment = moduleNamePlusExt.split('/')[0],
                            isRelative = segment === '.' || segment === '..';

                        //Have a file extension alias, and it is not the
                        //dots from a relative path.
                        if (index !== -1 && (!isRelative || index > 1)) {
                            ext = moduleNamePlusExt.substring(index, moduleNamePlusExt.length);
                            moduleNamePlusExt = moduleNamePlusExt.substring(0, index);
                        }

                        return context.nameToUrl(normalize(moduleNamePlusExt,
                                                relMap && relMap.id, true), ext,  true);
                    },

                    defined: function (id) {
                        return hasProp(defined, makeModuleMap(id, relMap, false, true).id);
                    },

                    specified: function (id) {
                        id = makeModuleMap(id, relMap, false, true).id;
                        return hasProp(defined, id) || hasProp(registry, id);
                    }
                });

                //Only allow undef on top level require calls
                if (!relMap) {
                    localRequire.undef = function (id) {
                        //Bind any waiting define() calls to this context,
                        //fix for #408
                        takeGlobalQueue();

                        var map = makeModuleMap(id, relMap, true),
                            mod = getOwn(registry, id);

                        delete defined[id];
                        delete urlFetched[map.url];
                        delete undefEvents[id];

                        if (mod) {
                            //Hold on to listeners in case the
                            //module will be attempted to be reloaded
                            //using a different config.
                            if (mod.events.defined) {
                                undefEvents[id] = mod.events;
                            }

                            cleanRegistry(id);
                        }
                    };
                }

                return localRequire;
            },

            /**
             * Called to enable a module if it is still in the registry
             * awaiting enablement. A second arg, parent, the parent module,
             * is passed in for context, when this method is overriden by
             * the optimizer. Not shown here to keep code compact.
             */
            enable: function (depMap) {
                var mod = getOwn(registry, depMap.id);
                if (mod) {
                    getModule(depMap).enable();
                }
            },

            /**
             * Internal method used by environment adapters to complete a load event.
             * A load event could be a script load or just a load pass from a synchronous
             * load call.
             * @param {String} moduleName the name of the module to potentially complete.
             */
            completeLoad: function (moduleName) {
                var found, args, mod,
                    shim = getOwn(config.shim, moduleName) || {},
                    shExports = shim.exports;

                takeGlobalQueue();

                while (defQueue.length) {
                    args = defQueue.shift();
                    if (args[0] === null) {
                        args[0] = moduleName;
                        //If already found an anonymous module and bound it
                        //to this name, then this is some other anon module
                        //waiting for its completeLoad to fire.
                        if (found) {
                            break;
                        }
                        found = true;
                    } else if (args[0] === moduleName) {
                        //Found matching define call for this script!
                        found = true;
                    }

                    callGetModule(args);
                }

                //Do this after the cycle of callGetModule in case the result
                //of those calls/init calls changes the registry.
                mod = getOwn(registry, moduleName);

                if (!found && !hasProp(defined, moduleName) && mod && !mod.inited) {
                    if (config.enforceDefine && (!shExports || !getGlobal(shExports))) {
                        if (hasPathFallback(moduleName)) {
                            return;
                        } else {
                            return onError(makeError('nodefine',
                                             'No define call for ' + moduleName,
                                             null,
                                             [moduleName]));
                        }
                    } else {
                        //A script that does not call define(), so just simulate
                        //the call for it.
                        callGetModule([moduleName, (shim.deps || []), shim.exportsFn]);
                    }
                }

                checkLoaded();
            },

            /**
             * Converts a module name to a file path. Supports cases where
             * moduleName may actually be just an URL.
             * Note that it **does not** call normalize on the moduleName,
             * it is assumed to have already been normalized. This is an
             * internal API, not a public one. Use toUrl for the public API.
             */
            nameToUrl: function (moduleName, ext, skipExt) {
                var paths, pkgs, pkg, pkgPath, syms, i, parentModule, url,
                    parentPath;

                //If a colon is in the URL, it indicates a protocol is used and it is just
                //an URL to a file, or if it starts with a slash, contains a query arg (i.e. ?)
                //or ends with .js, then assume the user meant to use an url and not a module id.
                //The slash is important for protocol-less URLs as well as full paths.
                if (req.jsExtRegExp.test(moduleName)) {
                    //Just a plain path, not module name lookup, so just return it.
                    //Add extension if it is included. This is a bit wonky, only non-.js things pass
                    //an extension, this method probably needs to be reworked.
                    url = moduleName + (ext || '');
                } else {
                    //A module that needs to be converted to a path.
                    paths = config.paths;
                    pkgs = config.pkgs;

                    syms = moduleName.split('/');
                    //For each module name segment, see if there is a path
                    //registered for it. Start with most specific name
                    //and work up from it.
                    for (i = syms.length; i > 0; i -= 1) {
                        parentModule = syms.slice(0, i).join('/');
                        pkg = getOwn(pkgs, parentModule);
                        parentPath = getOwn(paths, parentModule);
                        if (parentPath) {
                            //If an array, it means there are a few choices,
                            //Choose the one that is desired
                            if (isArray(parentPath)) {
                                parentPath = parentPath[0];
                            }
                            syms.splice(0, i, parentPath);
                            break;
                        } else if (pkg) {
                            //If module name is just the package name, then looking
                            //for the main module.
                            if (moduleName === pkg.name) {
                                pkgPath = pkg.location + '/' + pkg.main;
                            } else {
                                pkgPath = pkg.location;
                            }
                            syms.splice(0, i, pkgPath);
                            break;
                        }
                    }

                    //Join the path parts together, then figure out if baseUrl is needed.
                    url = syms.join('/');
                    url += (ext || (/\?/.test(url) || skipExt ? '' : '.js'));
                    url = (url.charAt(0) === '/' || url.match(/^[\w\+\.\-]+:/) ? '' : config.baseUrl) + url;
                }

                return config.urlArgs ? url +
                                        ((url.indexOf('?') === -1 ? '?' : '&') +
                                         config.urlArgs) : url;
            },

            //Delegates to req.load. Broken out as a separate function to
            //allow overriding in the optimizer.
            load: function (id, url) {
                req.load(context, id, url);
            },

            /**
             * Executes a module callack function. Broken out as a separate function
             * solely to allow the build system to sequence the files in the built
             * layer in the right sequence.
             *
             * @private
             */
            execCb: function (name, callback, args, exports) {
                return callback.apply(exports, args);
            },

            /**
             * callback for script loads, used to check status of loading.
             *
             * @param {Event} evt the event from the browser for the script
             * that was loaded.
             */
            onScriptLoad: function (evt) {
                //Using currentTarget instead of target for Firefox 2.0's sake. Not
                //all old browsers will be supported, but this one was easy enough
                //to support and still makes sense.
                if (evt.type === 'load' ||
                        (readyRegExp.test((evt.currentTarget || evt.srcElement).readyState))) {
                    //Reset interactive script so a script node is not held onto for
                    //to long.
                    interactiveScript = null;

                    //Pull out the name of the module and the context.
                    var data = getScriptData(evt);
                    context.completeLoad(data.id);
                }
            },

            /**
             * Callback for script errors.
             */
            onScriptError: function (evt) {
                var data = getScriptData(evt);
                if (!hasPathFallback(data.id)) {
                    return onError(makeError('scripterror', 'Script error', evt, [data.id]));
                }
            }
        };

        context.require = context.makeRequire();
        return context;
    }

    /**
     * Main entry point.
     *
     * If the only argument to require is a string, then the module that
     * is represented by that string is fetched for the appropriate context.
     *
     * If the first argument is an array, then it will be treated as an array
     * of dependency string names to fetch. An optional function callback can
     * be specified to execute when all of those dependencies are available.
     *
     * Make a local req variable to help Caja compliance (it assumes things
     * on a require that are not standardized), and to give a short
     * name for minification/local scope use.
     */
    req = requirejs = function (deps, callback, errback, optional) {

        //Find the right context, use default
        var context, config,
            contextName = defContextName;

        // Determine if have config object in the call.
        if (!isArray(deps) && typeof deps !== 'string') {
            // deps is a config object
            config = deps;
            if (isArray(callback)) {
                // Adjust args if there are dependencies
                deps = callback;
                callback = errback;
                errback = optional;
            } else {
                deps = [];
            }
        }

        if (config && config.context) {
            contextName = config.context;
        }

        context = getOwn(contexts, contextName);
        if (!context) {
            context = contexts[contextName] = req.s.newContext(contextName);
        }

        if (config) {
            context.configure(config);
        }

        return context.require(deps, callback, errback);
    };

    /**
     * Support require.config() to make it easier to cooperate with other
     * AMD loaders on globally agreed names.
     */
    req.config = function (config) {
        return req(config);
    };

    /**
     * Execute something after the current tick
     * of the event loop. Override for other envs
     * that have a better solution than setTimeout.
     * @param  {Function} fn function to execute later.
     */
    req.nextTick = typeof setTimeout !== 'undefined' ? function (fn) {
        setTimeout(fn, 4);
    } : function (fn) { fn(); };

    /**
     * Export require as a global, but only if it does not already exist.
     */
    if (!require) {
        require = req;
    }

    req.version = version;

    //Used to filter out dependencies that are already paths.
    req.jsExtRegExp = /^\/|:|\?|\.js$/;
    req.isBrowser = isBrowser;
    s = req.s = {
        contexts: contexts,
        newContext: newContext
    };

    //Create default context.
    req({});

    //Exports some context-sensitive methods on global require.
    each([
        'toUrl',
        'undef',
        'defined',
        'specified'
    ], function (prop) {
        //Reference from contexts instead of early binding to default context,
        //so that during builds, the latest instance of the default context
        //with its config gets used.
        req[prop] = function () {
            var ctx = contexts[defContextName];
            return ctx.require[prop].apply(ctx, arguments);
        };
    });

    if (isBrowser) {
        head = s.head = document.getElementsByTagName('head')[0];
        //If BASE tag is in play, using appendChild is a problem for IE6.
        //When that browser dies, this can be removed. Details in this jQuery bug:
        //http://dev.jquery.com/ticket/2709
        baseElement = document.getElementsByTagName('base')[0];
        if (baseElement) {
            head = s.head = baseElement.parentNode;
        }
    }

    /**
     * Any errors that require explicitly generates will be passed to this
     * function. Intercept/override it if you want custom error handling.
     * @param {Error} err the error object.
     */
    req.onError = function (err) {
        throw err;
    };

    /**
     * Does the request to load a module for the browser case.
     * Make this a separate function to allow other environments
     * to override it.
     *
     * @param {Object} context the require context to find state.
     * @param {String} moduleName the name of the module.
     * @param {Object} url the URL to the module.
     */
    req.load = function (context, moduleName, url) {
        var config = (context && context.config) || {},
            node;
        if (isBrowser) {
            //In the browser so use a script tag
            node = config.xhtml ?
                    document.createElementNS('http://www.w3.org/1999/xhtml', 'html:script') :
                    document.createElement('script');
            node.type = config.scriptType || 'text/javascript';
            node.charset = 'utf-8';
            node.async = true;

            node.setAttribute('data-requirecontext', context.contextName);
            node.setAttribute('data-requiremodule', moduleName);

            //Set up load listener. Test attachEvent first because IE9 has
            //a subtle issue in its addEventListener and script onload firings
            //that do not match the behavior of all other browsers with
            //addEventListener support, which fire the onload event for a
            //script right after the script execution. See:
            //https://connect.microsoft.com/IE/feedback/details/648057/script-onload-event-is-not-fired-immediately-after-script-execution
            //UNFORTUNATELY Opera implements attachEvent but does not follow the script
            //script execution mode.
            if (node.attachEvent &&
                    //Check if node.attachEvent is artificially added by custom script or
                    //natively supported by browser
                    //read https://github.com/jrburke/requirejs/issues/187
                    //if we can NOT find [native code] then it must NOT natively supported.
                    //in IE8, node.attachEvent does not have toString()
                    //Note the test for "[native code" with no closing brace, see:
                    //https://github.com/jrburke/requirejs/issues/273
                    !(node.attachEvent.toString && node.attachEvent.toString().indexOf('[native code') < 0) &&
                    !isOpera) {
                //Probably IE. IE (at least 6-8) do not fire
                //script onload right after executing the script, so
                //we cannot tie the anonymous define call to a name.
                //However, IE reports the script as being in 'interactive'
                //readyState at the time of the define call.
                useInteractive = true;

                node.attachEvent('onreadystatechange', context.onScriptLoad);
                //It would be great to add an error handler here to catch
                //404s in IE9+. However, onreadystatechange will fire before
                //the error handler, so that does not help. If addEventListener
                //is used, then IE will fire error before load, but we cannot
                //use that pathway given the connect.microsoft.com issue
                //mentioned above about not doing the 'script execute,
                //then fire the script load event listener before execute
                //next script' that other browsers do.
                //Best hope: IE10 fixes the issues,
                //and then destroys all installs of IE 6-9.
                //node.attachEvent('onerror', context.onScriptError);
            } else {
                node.addEventListener('load', context.onScriptLoad, false);
                node.addEventListener('error', context.onScriptError, false);
            }
            node.src = url;

            //For some cache cases in IE 6-8, the script executes before the end
            //of the appendChild execution, so to tie an anonymous define
            //call to the module name (which is stored on the node), hold on
            //to a reference to this node, but clear after the DOM insertion.
            currentlyAddingScript = node;
            if (baseElement) {
                head.insertBefore(node, baseElement);
            } else {
                head.appendChild(node);
            }
            currentlyAddingScript = null;

            return node;
        } else if (isWebWorker) {
            try {
                //In a web worker, use importScripts. This is not a very
                //efficient use of importScripts, importScripts will block until
                //its script is downloaded and evaluated. However, if web workers
                //are in play, the expectation that a build has been done so that
                //only one script needs to be loaded anyway. This may need to be
                //reevaluated if other use cases become common.
                importScripts(url);

                //Account for anonymous modules
                context.completeLoad(moduleName);
            } catch (e) {
                context.onError(makeError('importscripts',
                                'importScripts failed for ' +
                                    moduleName + ' at ' + url,
                                e,
                                [moduleName]));
            }
        }
    };

    function getInteractiveScript() {
        if (interactiveScript && interactiveScript.readyState === 'interactive') {
            return interactiveScript;
        }

        eachReverse(scripts(), function (script) {
            if (script.readyState === 'interactive') {
                return (interactiveScript = script);
            }
        });
        return interactiveScript;
    }

    //Look for a data-main script attribute, which could also adjust the baseUrl.
    if (isBrowser) {
        //Figure out baseUrl. Get it from the script tag with require.js in it.
        eachReverse(scripts(), function (script) {
            //Set the 'head' where we can append children by
            //using the script's parent.
            if (!head) {
                head = script.parentNode;
            }

            //Look for a data-main attribute to set main script for the page
            //to load. If it is there, the path to data main becomes the
            //baseUrl, if it is not already set.
            dataMain = script.getAttribute('data-main');
            if (dataMain) {
                //Set final baseUrl if there is not already an explicit one.
                if (!cfg.baseUrl) {
                    //Pull off the directory of data-main for use as the
                    //baseUrl.
                    src = dataMain.split('/');
                    mainScript = src.pop();
                    subPath = src.length ? src.join('/')  + '/' : './';

                    cfg.baseUrl = subPath;
                    dataMain = mainScript;
                }

                //Strip off any trailing .js since dataMain is now
                //like a module name.
                dataMain = dataMain.replace(jsSuffixRegExp, '');

                //Put the data-main script in the files to load.
                cfg.deps = cfg.deps ? cfg.deps.concat(dataMain) : [dataMain];

                return true;
            }
        });
    }

    /**
     * The function that handles definitions of modules. Differs from
     * require() in that a string for the module should be the first argument,
     * and the function to execute after dependencies are loaded should
     * return a value to define the module corresponding to the first argument's
     * name.
     */
    define = function (name, deps, callback) {
        var node, context;

        //Allow for anonymous modules
        if (typeof name !== 'string') {
            //Adjust args appropriately
            callback = deps;
            deps = name;
            name = null;
        }

        //This module may not have dependencies
        if (!isArray(deps)) {
            callback = deps;
            deps = [];
        }

        //If no name, and callback is a function, then figure out if it a
        //CommonJS thing with dependencies.
        if (!deps.length && isFunction(callback)) {
            //Remove comments from the callback string,
            //look for require calls, and pull them into the dependencies,
            //but only if there are function args.
            if (callback.length) {
                callback
                    .toString()
                    .replace(commentRegExp, '')
                    .replace(cjsRequireRegExp, function (match, dep) {
                        deps.push(dep);
                    });

                //May be a CommonJS thing even without require calls, but still
                //could use exports, and module. Avoid doing exports and module
                //work though if it just needs require.
                //REQUIRES the function to expect the CommonJS variables in the
                //order listed below.
                deps = (callback.length === 1 ? ['require'] : ['require', 'exports', 'module']).concat(deps);
            }
        }

        //If in IE 6-8 and hit an anonymous define() call, do the interactive
        //work.
        if (useInteractive) {
            node = currentlyAddingScript || getInteractiveScript();
            if (node) {
                if (!name) {
                    name = node.getAttribute('data-requiremodule');
                }
                context = contexts[node.getAttribute('data-requirecontext')];
            }
        }

        //Always save off evaluating the def call until the script onload handler.
        //This allows multiple modules to be in a file without prematurely
        //tracing dependencies, and allows for anonymous module support,
        //where the module name is not known until the script onload event
        //occurs. If no context, use the global queue, and get it processed
        //in the onscript load callback.
        (context ? context.defQueue : globalDefQueue).push([name, deps, callback]);
    };

    define.amd = {
        jQuery: true
    };


    /**
     * Executes the text. Normally just uses eval, but can be modified
     * to use a better, environment-specific call. Only used for transpiling
     * loader plugins, not for plain JS modules.
     * @param {String} text the text to execute/evaluate.
     */
    req.exec = function (text) {
        /*jslint evil: true */
        return eval(text);
    };

    //Set up with config info.
    req(cfg);
}(this));
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
define('sap/viz/chart/metadata/bindings/XYBindings',[], function Setup() {

    var feeds = [{
        "id": "dataFrame",
        "name": "IDS_DATA_FRAME",
        "type": "Dimension",
        "min": 0,
        "max": 1,
        "acceptMND": false,
        "role": "frame.data"
    }, {
        "id": "trellisColumn",
        "name": "IDS_TRELLIS_COLUMN",
        "type": "Dimension",
        "min": 0,
        "max": Number.POSITIVE_INFINITY,
        "acceptMND": true,
        "role": "trellis.columnCategory",
    }, {
        "id": "trellisRow",
        "name": "IDS_TRELLIS_ROW",
        "type": "Dimension",
        "min": 0,
        "max": Number.POSITIVE_INFINITY,
        "acceptMND": true,
        "role": "trellis.rowCategory"
    }, {
        "id": "categoryAxis",
        "name": "IDS_CATEGORY_AXIS",
        "type": "Dimension",
        "min": 1,
        "max": Number.POSITIVE_INFINITY,
        "acceptMND": true,
        "role": "layout.category"
    }, {
        "id": "color",
        "name": "IDS_COLOR",
        "type": "Dimension",
        "min": 0,
        "max": Number.POSITIVE_INFINITY,
        "acceptMND": true,
        "role": "mark.color"
    }, {
        "id": "valueAxis",
        "name": "IDS_VALUE_AXIS",
        "type": "Measure",
        "min": 1,
        "max": Number.POSITIVE_INFINITY,
        "role": "layout.value"
    }];

    return feeds;
});
define('sap/viz/chart/metadata/bindings/CombinationBindings',[], function Setup() {

    var feeds = [{
        "id": "dataFrame",
        "name": "IDS_DATA_FRAME",
        "type": "Dimension",
        "min": 0,
        "max": 1,
        "acceptMND": false,
        "role": "frame.data"
    }, {
        "id": "trellisColumn",
        "name": "IDS_TRELLIS_COLUMN",
        "type": "Dimension",
        "min": 0,
        "max": Number.POSITIVE_INFINITY,
        "acceptMND": false,
        "role": "trellis.columnCategory"
    }, {
        "id": "trellisRow",
        "name": "IDS_TRELLIS_ROW",
        "type": "Dimension",
        "min": 0,
        "max": Number.POSITIVE_INFINITY,
        "acceptMND": false,
        "role": "trellis.rowCategory"
    }, {
        "id": "categoryAxis",
        "name": "IDS_CATEGORY_AXIS",
        "type": "Dimension",
        "min": 1,
        "max": Number.POSITIVE_INFINITY,
        "acceptMND": false,
        "role": "layout.category"
    }, {
        "id": "color",
        "name": "IDS_COLOR",
        "type": "Dimension",
        "min": 0,
        "max": Number.POSITIVE_INFINITY,
        "acceptMND": true,
        "role": "mark.color"
    }, {
        "id": "valueAxis",
        "name": "IDS_VALUE_AXIS",
        "type": "Measure",
        "min": 2,
        "max": Number.POSITIVE_INFINITY,
        "role": "layout.value"
    }];

    return feeds;
});
define('sap/viz/chart/metadata/bindings/XYYCombinationBindings',[], function Setup() {

    var feeds = [{
        "id": "dataFrame",
        "name": "IDS_DATA_FRAME",
        "type": "Dimension",
        "min": 0,
        "max": 1,
        "acceptMND": false,
        "role": "frame.data"
    }, {
        "id": "trellisColumn",
        "name": "IDS_TRELLIS_COLUMN",
        "type": "Dimension",
        "min": 0,
        "max": Number.POSITIVE_INFINITY,
        "acceptMND": false,
        "role": "trellis.columnCategory"
    }, {
        "id": "trellisRow",
        "name": "IDS_TRELLIS_ROW",
        "type": "Dimension",
        "min": 0,
        "max": Number.POSITIVE_INFINITY,
        "acceptMND": false,
        "role": "trellis.rowCategory"
    }, {
        "id": "categoryAxis",
        "name": "IDS_CATEGORY_AXIS",
        "type": "Dimension",
        "min": 1,
        "max": Number.POSITIVE_INFINITY,
        "acceptMND": false,
        "role": "layout.category"
    }, {
        "id": "color",
        "name": "IDS_COLOR",
        "type": "Dimension",
        "min": 0,
        "max": Number.POSITIVE_INFINITY,
        "acceptMND": true,
        "role": "mark.color"
    }, {
        "id": "valueAxis",
        "name": "IDS_VALUE_AXIS",
        "type": "Measure",
        "min": 1,
        "max": Number.POSITIVE_INFINITY,
        "role": "layout.value"
    }, {
        "id": "valueAxis2",
        "name": "IDS_VALUE_AXIS2",
        "type": "Measure",
        "min": 1,
        "max": Number.POSITIVE_INFINITY,
        "role": "layout.secondValue"
    }];

    return feeds;
});
define('sap/viz/chart/metadata/bindings/YYBindings',[], function Setup() {
    var feeds = [{
        "id": "dataFrame",
        "name": "IDS_DATA_FRAME",
        "type": "Dimension",
        "min": 0,
        "max": 1,
        "acceptMND": false,
        "role": "frame.data"
    }, {
        "id": "trellisColumn",
        "name": "IDS_TRELLIS_COLUMN",
        "type": "Dimension",
        "min": 0,
        "max": Number.POSITIVE_INFINITY,
        "acceptMND": true,
        "role": "trellis.columnCategory"
    }, {
        "id": "trellisRow",
        "name": "IDS_TRELLIS_ROW",
        "type": "Dimension",
        "min": 0,
        "max": Number.POSITIVE_INFINITY,
        "acceptMND": true,
        "role": "trellis.rowCategory"
    }, {
        "id": "color",
        "name": "IDS_COLOR",
        "type": "Dimension",
        "min": 0,
        "max": Number.POSITIVE_INFINITY,
        "acceptMND": false,
        "role": "mark.color"
    }, {
        "id": "shape",
        "name": "IDS_SHAPE",
        "type": "Dimension",
        "min": 0,
        "max": Number.POSITIVE_INFINITY,
        "acceptMND": false,
        "role": "mark.shape"
    }, {
        "id": "valueAxis",
        "name": "IDS_VALUE_AXIS",
        "type": "Measure",
        "min": 1,
        "max": 1,
        "role": "layout.value"
    }, {
        "id": "valueAxis2",
        "name": "IDS_VALUE_AXIS2",
        "type": "Measure",
        "min": 1,
        "max": 1,
        "role": "layout.secondValue"
    }, {
        "id": "bubbleWidth",
        "name": "IDS_BUBBLESIZE",
        "type": "Measure",
        "min": 1,
        "max": 1,
        "role": "mark.size"
    }];
    return feeds;
});

define('sap/viz/chart/metadata/bindings/XYYBindings',[], function Setup() {
    var feeds = [{
        "id": "dataFrame",
        "name": "IDS_DATA_FRAME",
        "type": "Dimension",
        "min": 0,
        "max": 1,
        "acceptMND": false,
        "role": "frame.data"
    }, {
        "id": "trellisColumn",
        "name": "IDS_TRELLIS_COLUMN",
        "type": "Dimension",
        "min": 0,
        "max": Number.POSITIVE_INFINITY,
        "acceptMND": false,
        "role": "trellis.columnCategory"
    }, {
        "id": "trellisRow",
        "name": "IDS_TRELLIS_ROW",
        "type": "Dimension",
        "min": 0,
        "max": Number.POSITIVE_INFINITY,
        "acceptMND": false,
        "role": "trellis.rowCategory"
    }, {
        "id": "categoryAxis",
        "name": "IDS_CATEGORY_AXIS",
        "type": "Dimension",
        "min": 1,
        "max": Number.POSITIVE_INFINITY,
        "acceptMND": false,
        "role": "layout.category"
    }, {
        "id": "color",
        "name": "IDS_COLOR",
        "type": "Dimension",
        "min": 1,
        "max": Number.POSITIVE_INFINITY,
        "acceptMND": true,
        "role": "mark.color"
    }, {
        "id": "valueAxis",
        "name": "IDS_VALUE_AXIS",
        "type": "Measure",
        "min": 1,
        "max": Number.POSITIVE_INFINITY,
        "role": "layout.value"
    }, {
        "id": "valueAxis2",
        "name": "IDS_VALUE_AXIS2",
        "type": "Measure",
        "min": 1,
        "max": Number.POSITIVE_INFINITY,
        "role": "layout.secondValue"
    }];

    return feeds;
});
define('sap/viz/chart/metadata/bindings/MekkoBindings',[], function Setup() {
    var feeds = [{
        "id": "categoryAxis",
        "name": "IDS_CATEGORY_AXIS",
        "type": "Dimension",
        "min": 1,
        "max": Number.POSITIVE_INFINITY,
        "acceptMND": false,
        "role": "layout.mekkoCategory"
    }, {
        "id": "color",
        "name": "IDS_COLOR",
        "type": "Dimension",
        "min": 0,
        "max": Number.POSITIVE_INFINITY,
        "acceptMND": false,
        "role": "mark.color"
    }, {
        "id": "valueAxis",
        "name": "IDS_VALUE_AXIS",
        "type": "Measure",
        "min": 1,
        "max": 1,
        "role": "layout.value"
    }, {
        "id": "valueAxis2",
        "name": "IDS_VALUE_AXIS2",
        "type": "Measure",
        "min": 1,
        "max": 1,
        "role": "layout.mekko"
    }];

    return feeds;
});

define('sap/viz/chart/metadata/bindings/XXBindings',[], function Setup() {
    var feeds = [{
        "id": "categoryAxis",
        "name": "IDS_CATEGORY_AXIS",
        "type": "Dimension",
        "min": 1,
        "max": Number.POSITIVE_INFINITY,
        "acceptMND": false,
        "role": "layout.category"
    }, {
        "id": "categoryAxis2",
        "name": "IDS_CATEGORY_AXIS2",
        "type": "Dimension",
        "min": 0,
        "max": Number.POSITIVE_INFINITY,
        "acceptMND": false,
        "role": "layout.secondCategory"
    }, {
        "id": "color",
        "name": "IDS_COLOR",
        "type": "Measure",
        "min": 1,
        "max": 1,
        "role": "mark.quantizeColor"
    }];

    return feeds;
});

define('sap/viz/chart/metadata/bindings/PieBindings',[], function Setup() {
    var PieBindings = [{
        "id": "dataFrame",
        "name": "IDS_DATA_FRAME",
        "type": "Dimension",
        "min": 0,
        "max": 1,
        "acceptMND": false,
        "role": "frame.data"
    }, {
        "id": "size",
        "name": "IDS_SIZE",
        "type": "Measure",
        "min": 1,
        "max": 1,
        "role": "layout.value"
    }, {
        "id": "color",
        "name": "IDS_COLOR",
        "type": "Dimension",
        "min": 1,
        "max": Number.POSITIVE_INFINITY,
        "role": "mark.color",
        "acceptMND": false
    }];


    return PieBindings;
});

define('sap/viz/chart/metadata/bindings/TrellisPieBindings',[], function Setup() {
    var PieBindings = [{
        "id": "trellisColumn",
        "name": "IDS_TRELLIS_COLUMN",
        "type": "Dimension",
        "min": 0,
        "max": Number.POSITIVE_INFINITY,
        "acceptMND": true,
        "role": "trellis.columnCategory"
    }, {
        "id": "trellisRow",
        "name": "IDS_TRELLIS_ROW",
        "type": "Dimension",
        "min": 0,
        "max": Number.POSITIVE_INFINITY,
        "acceptMND": true,
        "role": "trellis.rowCategory"
    }, {
        "id": "size",
        "name": "IDS_SIZE",
        "type": "Measure",
        "min": 1,
        "max": Number.POSITIVE_INFINITY,
        "role": "layout.value"
    }, {
        "id": "color",
        "name": "IDS_COLOR",
        "type": "Dimension",
        "min": 1,
        "max": Number.POSITIVE_INFINITY,
        "role": "mark.color",
        "acceptMND": false
    }];


    return PieBindings;
});

define( 'sap/viz/chart/metadata/bindings/TreeBindings',[], function Setup() {
    var feeds = [ {
        "id" : "title",
        "name" : "IDS_TITLE",
        "type" : "Dimension",
        "min" : 1,
        "max" : Number.POSITIVE_INFINITY,
        "role" : "layout.tree",
        "acceptMND" : false
    }, {
        "id" : "color",
        "name" : "IDS_COLOR",
        "type" : "Measure",
        "min" : 0,
        "max" : 1,
        "role" : "mark.quantizeColor"
    }, {
        "id" : "weight",
        "name" : "IDS_WEIGHT",
        "type" : "Measure",
        "min" : 1,
        "max" : 1,
        "role" : "layout.value"
    } ];

    return feeds;
});

define('sap/viz/chart/metadata/bindings/TagCloudBindings',[], function Setup() {
    var feeds = [{
        "id": "dataFrame",
        "name": "IDS_DATA_FRAME",
        "type": "Dimension",
        "min": 0,
        "max": 1,
        "acceptMND": false,
        "role": "frame.data"
    }, {
        'id' : 'text',
        'name' : 'IDS_TEXT',
        'type' : "Dimension",
        'min' : 1,
        'max' : 1,
        'role' : 'layout',
        'acceptMND' : false,

    }, {
        'id' : 'weight',
        'name' : 'IDS_WEIGHT',
        'type' : "Measure",
        'min' : 1,
        'max' : 1,
        'role' : 'layout.value'
    }, {
        'id' : 'color',
        'name' : 'IDS_COLOR',
        'type' : "Measure",
        'min' : 0,
        'max' : 1,
        'role' : 'mark.quantizeColor'
    }];

    return feeds;
});

define('sap/viz/chart/metadata/bindings/BulletBindings',[], function Setup() {

    var feeds = [ {
        "id": "trellisColumn",
        "name": "IDS_TRELLIS_COLUMN",
        "type": "Dimension",
        "min": 0,
        "max": Number.POSITIVE_INFINITY,
        "acceptMND": false,
        "role": "trellis.columnCategory"
    }, {
        "id": "trellisRow",
        "name": "IDS_TRELLIS_ROW",
        "type": "Dimension",
        "min": 0,
        "max": Number.POSITIVE_INFINITY,
        "acceptMND": false,
        "role": "trellis.rowCategory"
    }, {
        "id" : "categoryAxis",
        "name" : "IDS_CATEGORY_AXIS",
        "type" : "Dimension",
        "min" : 1,
        "max" :  Number.POSITIVE_INFINITY,
        "acceptMND" : false,
        "role" : "layout.category"
    }, {
        "id": "color",
        "name": "IDS_COLOR",
        "type": "Dimension",
        "min": 0,
        "max": Number.POSITIVE_INFINITY,
        "acceptMND": false,
        "role": "mark.color"
    },
    {
        "id" : "actualValues",
        "name" : "IDS_PRIMARY_VALE",
        "type" : "Measure",
        "min" : 1,
        "max" :  Number.POSITIVE_INFINITY,
        "role" : "layout.value"
    },{
        "id" : "additionalValues",
        "name" : "IDS_ADDITIONAL_VALE",
        "type" : "Measure",
        "min" : 0,
        "max" :  Number.POSITIVE_INFINITY,
        "role" : "layout.value"
    },{
        "id" : "targetValues",
        "name" : "IDS_TARGETVALUES",
        "type" : "Measure",
        "min" : 0,
        "max" : Number.POSITIVE_INFINITY,
        "role" : "mark.target"
    }, {
        "id" : "forecastValues",
        "name" : "ID_FORECAST_VALUES",
        "type" : "Measure",
        "min" : 0,
        "max" : Number.POSITIVE_INFINITY,
        "role" : "mark.forecast"
    } ];

    return feeds;
});
define('sap/viz/chart/metadata/bindings/NumericBindings',[], function Setup() {
    var feeds = [{
        'id' : 'value',
        'name' : 'IDS_NUMBERCHART_VALUE',
        'type' : "Measure",
        'min' : 1,
        'max' : 1,
        'role' : 'mark.size'
    }];

    return feeds;
});

define('sap/viz/chart/metadata/bindings/TimeYBindings',[], function Setup() {

    var feeds = [{
        "id": "timeAxis",
        "name": "IDS_TIME_AXIS",
        "type": "Dimension",
        "min": 1,
        "max": 1,
        "acceptMND": false,
        "continuous": true,
        "sort": true,
        "role": "layout.time"
    }, {
        "id": "color",
        "name": "IDS_COLOR",
        "type": "Dimension",
        "min": 0,
        "max": Number.POSITIVE_INFINITY,
        "acceptMND": true,
        "role": "mark.color"
    }, {
        "id": "valueAxis",
        "name": "IDS_VALUE_AXIS",
        "type": "Measure",
        "min": 1,
        "max": Number.POSITIVE_INFINITY,
        "role": "layout.value"
    }];

    return feeds;
});
define('sap/viz/chart/metadata/bindings/YYTimeBindings',[], function Setup() {
    var feeds = [/*{
        "id": "dataFrame",
        "name": "IDS_DATA_FRAME",
        "type": "Dimension",
        "min": 0,
        "max": 1,
        "acceptMND": false,
        "role": "frame.data"
    }, {
        "id": "trellisColumn",
        "name": "IDS_TRELLIS_COLUMN",
        "type": "Dimension",
        "min": 0,
        "max": Number.POSITIVE_INFINITY,
        "acceptMND": true,
        "role": "trellis.columnCategory"
    }, {
        "id": "trellisRow",
        "name": "IDS_TRELLIS_ROW",
        "type": "Dimension",
        "min": 0,
        "max": Number.POSITIVE_INFINITY,
        "acceptMND": true,
        "role": "trellis.rowCategory"
    }, */
        {
            "id": "color",
            "name": "IDS_COLOR",
            "type": "Dimension",
            "min": 0,
            "max": Number.POSITIVE_INFINITY,
            "acceptMND": false,
            "role": "mark.color"
        }, {
            "id": "shape",
            "name": "IDS_SHAPE",
            "type": "Dimension",
            "min": 0,
            "max": Number.POSITIVE_INFINITY,
            "acceptMND": false,
            "role": "mark.shape"
        }, {
            "id": "valueAxis",
            "name": "IDS_VALUE_AXIS",
            "type": "Measure",
            "min": 1,
            "max": 1,
            "role": "layout.value"
        }, {
            "id": "timeAxis",
            "name": "IDS_TIME_AXIS",
            "type": "Dimension",
            "min": 1,
            "max": 1,
            "acceptMND": false,
            "continuous": true,
            "sort": false,
            "role": "layout.time"
        }, {
            "id": "bubbleWidth",
            "name": "IDS_BUBBLESIZE",
            "type": "Measure",
            "min": 1,
            "max": 1,
            "role": "mark.size"
        }
    ];
    return feeds;
});

define('sap/viz/chart/metadata/bindings/WaterFallBindings',[], function Setup() {
    var feeds = [{
        "id" : "categoryAxis",
        "name" : "IDS_CATEGORY_AXIS",
        "type" : "Dimension",
        "min" : 1,
        "max" : Number.POSITIVE_INFINITY,
        "acceptMND" : false,
        "role" : "layout.category"
    }, {
        "id" : "waterfallType",
        "name" : "IDS_WATERFALLTYPE",
        "type" : "Dimension",
        "min" : 0,
        "max" : 1,
        "acceptMND" : false,
        "role" : "mark.waterfallType"
    }, {
        "id" : "valueAxis",
        "name" : "IDS_VALUE_AXIS",
        "type" : "Measure",
        "min" : 1,
        "max" : 1,
        "role" : "layout.value"
    }];

    return feeds;
});

define('sap/viz/chart/metadata/bindings/StackedWaterFallBindings',[], function Setup() {
    var feeds = [{
        "id" : "categoryAxis",
        "name" : "IDS_CATEGORY_AXIS",
        "type" : "Dimension",
        "min" : 1,
        "max" : Number.POSITIVE_INFINITY,
        "acceptMND" : true,
        "role" : "layout.category"
    }, {
        "id" : "color",
        "name" : "IDS_COLOR",
        "type" : "Dimension",
        "min" : 0,
        "max" : Number.POSITIVE_INFINITY,
        "acceptMND" : true,
        "role" : "mark.color"
    }, {
        "id" : "waterfallType",
        "name" : "IDS_WATERFALLTYPE",
        "type" : "Dimension",
        "min" : 0,
        "max" : 1,
        "acceptMND" : false,
        "role" : "mark.waterfallType"
    }, {
        "id" : "valueAxis",
        "name" : "IDS_VALUE_AXIS",
        "type" : "Measure",
        "min" : 1,
        "max" : Number.POSITIVE_INFINITY,
        "role" : "layout.value"
    }];

    return feeds;
});

define('sap/viz/framework/common/util/TypeUtils',[],
    function Setup() {
        var class2type = {
            '[object Boolean]': 'boolean',
            '[object Number]': 'number',
            '[object String]': 'string',
            '[object Function]': 'function',
            '[object Array]': 'array',
            '[object Date]': 'date',
            '[object RegExp]': 'regexp',
            '[object Object]': 'object'
        };

        var hasOwn = Object.prototype.hasOwnProperty;
        // Used for trimming whitespace
        var rdigit = /\d/;

        var type = function(obj) {
            return obj == null ? String(obj) : class2type[Object.prototype.toString.call(obj)] || "object";
        };

        /**
         * Type Utilities for common variable type related tasks
         *
         * @name sap.viz.base.utils.TypeUtils
         * @class
         */
        var typeUtils = {

            /**
             * Returns a boolean value indicating whether the parameter is of type
             * function
             *
             * @param {object}
             * @returns {boolean}
             */
            // See test/unit/core.js for details concerning isFunction.
            // Since version 1.3, DOM methods and functions like alert
            // aren't supported. They return false on IE (#2968).
            isFunction: function(obj) {
                return type(obj) === "function";
            },

            /**
             * Returns a boolean value indicating whether the parameter is of type
             * array
             *
             * @param {object}
             * @returns {boolean}
             */
            isArray: Array.isArray || function(obj) {
                return type(obj) === "array";
            },

            /**
             * Returns a boolean value indicating whether the parameter is of type
             * string
             *
             * @param {object}
             * @returns {boolean}
             */
            isString: function(obj) {
                return type(obj) === "string";
            },

            /**
             * Returns a boolean value indicating whether the parameter is a
             * non-empty string
             *
             * @param {object}
             * @returns {boolean}
             */
            isNonEmptyString: function(obj) {
                return this.isString(obj) && obj.length !== 0;
            },


            /**
             * Returns a boolean value indicating whether the parameter is NaN
             *
             * @param {object}
             * @returns {boolean}
             */
            isNaN: function(obj) {
                return obj === null || obj === undefined || !rdigit.test(obj) || isNaN(obj);
            },

            /**
             * Returns a boolean value indicating whether the parameter is a number
             *
             * @param {object}
             * @returns {boolean} 
             * 
             * Caution: isNumber(Infinity) returns false;
             * Caution: isNumber([0,1]) returns true.
             */
            isNumber: function(n) {
                return !typeUtils.isNaN(parseFloat(n)) && isFinite(n);
            },
            
            /**
             * Returns a boolean value indicating whether the parameter is a number
             * This method fixed an issue of TypeUtils.isNumber, where an array with 
             * all numeric elements will be considered as a number. 
             * 
             * @param {object}
             * @returns {boolean} Caution: isNumeric(Infinity) returns false.
             */
            isNumeric: function(n) {
                return !typeUtils.isArray( n ) && (n - parseFloat( n ) + 1) >= 0;
            },

            /**
             * Returns a boolean value indicating whether the parameter is defined
             *
             * @param {object}
             * @returns {boolean}
             */
            isDefined: function(v) {
                return typeof(v) !== 'undefined';
            },

            /**
             * Returns a boolean value indicating whether the parameter is undefined
             *
             * @param {object}
             * @returns {boolean}
             */
            isUndefined: function(v) {
                return typeof(v) === 'undefined';
            },

            /**
             * Returns a boolean value indicating whether the parameter is a plain
             * object
             *
             * @param {object}
             * @returns {boolean} Caution: A plain object is an object that has no
             *          prototype method and no parent class. Null, undefined, DOM
             *          nodes and window object are not considered as plain object.
             */
            isPlainObject: function(obj) {
                // Must be an Object.
                // Because of IE, we also have to check the presence of the
                // constructor property.
                // Make sure that DOM nodes and window objects don't pass through,
                // as well
                if (!obj || type(obj) !== "object" || obj.nodeType || (obj && typeof obj === "object" &&
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
            isEmptyObject: function(obj) {
                for (var name in obj) {
                    if (obj.hasOwnProperty(name)) {
                        return false;
                    }

                }
                return typeUtils.isPlainObject(obj);
            },

            equals: function(x, y) {
                var p;
                if (x === y) {
                    return true;
                }
                if (!(x instanceof Object) || !(y instanceof Object) || (x.constructor !== y.constructor)) {
                    return false;
                }

                for (p in x) {
                    if (x.hasOwnProperty(p)) {

                        if (!y.hasOwnProperty(p)) {
                            return false;
                        }
                        if (x[p] === y[p]) {
                            continue;
                        }
                        if (typeof(x[p]) !== "object" || !typeUtils.equals(x[p], y[p])) {
                            return false;
                        }
                    }
                }

                for (p in y) {
                    if (y.hasOwnProperty(p) && !x.hasOwnProperty(p)) {
                        {
                            return false;
                        }
                    }
                }
                return true;
            },

            /**
             * Returns a boolean value indicating whether the parameter is undefined or null
             *
             * @param {object}
             * @returns {boolean}
             */
            isExist: function(o) {
                if ((typeof(o) === 'undefined') || (o === null)) {
                    {
                        return false;
                    }
                }
                return true;
            }
        };

        return typeUtils;
    });
define('sap/viz/framework/common/util/ObjectUtils',['sap/viz/framework/common/util/TypeUtils'], function Setup(TypeUtils) {
    // JSON RegExp
    var rvalidchars = /^[\],:{}\s]*$/,
        rvalidescape = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,
        rvalidtokens = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,
        rvalidbraces = /(?:^|:|,)(?:\s*\[)+/g;

    /**
     * Frequently used object utilities
     *
     * @name sap.viz.base.utils.ObjectUtils
     * @class
     */
    var ObjectUtils = {
        // Copy from jQuery
        extend: function() {
            var options, name, src, copy, copyIsArray, clone, target = arguments[0] || {},
                i = 1,
                length = arguments.length,
                deep = false;

            // Handle a deep copy situation
            if (typeof target === "boolean") {
                deep = target;
                target = arguments[1] || {};
                // skip the boolean and the target
                i = 2;
            }

            // Handle case when target is a string or something (possible in
            // deep
            // copy)
            if (typeof target !== "object" && !TypeUtils.isFunction(target)) {
                target = {};
            }

            // extend jQuery itself if only one argument is passed
            if (length === i) {
                target = this;
                --i;
            }

            for (; i < length; i++) {
                // Only deal with non-null/undefined values
                if ((options = arguments[i]) != null) {
                    // Extend the base object
                    for (name in options) {
                        if (options.hasOwnProperty(name)) {
                            src = target[name];
                            copy = options[name];

                            // Prevent never-ending loop
                            if (target === copy) {
                                continue;
                            }

                            // Recurse if we're merging plain objects or arrays
                            if (deep && copy && (TypeUtils.isPlainObject(copy) || (copyIsArray = TypeUtils.isArray(
                                copy)))) {
                                if (copyIsArray) {
                                    copyIsArray = false;
                                    clone = src && TypeUtils.isArray(src) ? src : [];

                                } else {
                                    clone = src && TypeUtils.isPlainObject(src) ? src : {};
                                }
                                // Never move original objects, clone them
                                target[name] = ObjectUtils.extend(deep, clone, copy);
                                // Don't bring in undefined values
                            } else if (copy !== undefined) {
                                target[name] = copy;
                            }
                        }
                    }
                }
            }
            // Return the modified object
            return target;
        },

        // in this version, when target is array, just use src replace target
        extendByRepalceArray: function() {
            var options, name, src, copy, copyIsArray, clone, target = arguments[0] || {},
                i = 1,
                length = arguments.length,
                deep = false;

            // Handle a deep copy situation
            if (typeof target === "boolean") {
                deep = target;
                target = arguments[1] || {};
                // skip the boolean and the target
                i = 2;
            }

            // Handle case when target is a string or something (possible in
            // deep
            // copy)
            if (typeof target !== "object" && !TypeUtils.isFunction(target)) {
                target = {};
            }

            // extend itself if only one argument is passed
            if (length === i) {
                target = this;
                --i;
            }

            for (; i < length; i++) {
                // Only deal with non-null/undefined values
                if ((options = arguments[i]) !== null) {
                    // Extend the base object
                    for (name in options) {
                        if (options.hasOwnProperty(name)) {
                            src = target[name];
                            copy = options[name];

                            // Prevent never-ending loop
                            if (target === copy) {
                                continue;
                            }

                            // Recurse if we're merging plain objects or arrays
                            // in this version, when target is array, just src replace target
                            if (deep && copy && (TypeUtils.isPlainObject(copy))) {
                                if (copyIsArray) {
                                    copyIsArray = false;
                                    clone = src && TypeUtils.isArray(src) ? src : [];

                                } else {
                                    clone = src && TypeUtils.isPlainObject(src) ? src : {};
                                }
                                // Never move original objects, clone them
                                target[name] = ObjectUtils.extendByRepalceArray(deep, clone, copy);
                                // Don't bring in undefined values
                            } else if (copy !== undefined) {
                                target[name] = copy;
                            }
                        }
                    }
                }
            }
            // Return the modified object
            return target;
        },

        // args is for internal usage only
        each: function(object, callback, args) {
            var name, i = 0,
                length = object.length,
                isObj = length === undefined || TypeUtils.isFunction(object);

            if (args) {
                if (isObj) {
                    for (name in object) {
                        if (callback.apply(object[name], args) === false) {
                            break;
                        }
                    }
                } else {
                    for (; i < length;) {
                        if (callback.apply(object[i++], args) === false) {
                            break;
                        }
                    }
                }

                // A special, fast, case for the most common use of each
            } else {
                if (isObj) {
                    for (name in object) {
                        if (callback.call(object[name], name, object[name]) === false) {
                            break;
                        }
                    }
                } else {
                    for (var value = object[0]; i < length && callback.call(value, i, value) !== false; value =
                        object[++i]) {}
                }
            }
            return object;
        },

        parseJSON: function(data) {
            if (typeof data !== "string" || !data) {
                return null;
            }

            // Make sure leading/trailing whitespace is removed (IE can't handle
            // it)
            data = data.trim();

            // Make sure the incoming data is actual JSON
            // Logic borrowed from http://json.org/json2.js
            if (rvalidchars.test(data.replace(rvalidescape, "@").replace(rvalidtokens, "]").replace(
                rvalidbraces, ""))) {

                // Try to use the native JSON parser first
                return window && window.JSON && window.JSON.parse ? window.JSON.parse(data) : (new Function("return " + data))(); // jshint ignore:line

            } else {
                TypeUtils.error("Invalid JSON: " + data);
            }
        },

        /**
         * Generate a guid
         *
         * @name sap.viz.base.utils.ObjectUtils#guid
         * @function
         * @return {String}
         */
        guid: function() { // guid generator
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                var r = Math.random() * 16 | 0,
                    v = c == 'x' ? r : r & 0x3 | 0x8;
                return v.toString(16);
            });
        },

        /**
         * Clone object
         * @param {obj} clone source
         * @param {isFullClone} clone all the items even undefined in the array
         */
        clone: function(obj, isFullClone) {
            if (typeof(obj) !== 'object') {
                return obj;
            }
            if (obj === null) {
                return obj;
            }
            var isArrayFlag = obj.constructor === Array ? true : false;
            var o = isArrayFlag ? [] : {};
            var i;
            if (isArrayFlag && isFullClone) {
                for (i = 0; i < obj.length; i ++) {
                    o[i] = typeof obj[i] === "object" ? arguments.callee.call(null, obj[i], isFullClone) : obj[i];
                }
            } else {
                for (i in obj) {
                    if (obj.hasOwnProperty(i)) {
                        if(obj[i] instanceof Date) {
                            o[i] = new Date(obj[i]);
                        }
                        else {
                            o[i] = typeof obj[i] === "object" ? 
                                    arguments.callee.call(null, obj[i], isFullClone) : obj[i];
                        }                        
                    }
                }
            }
            return o;
        },

        deepEqual: function(source, target) {
            if (typeof source === 'object' && typeof target === 'object') {
                var key = null;
                for (key in source) {
                    if (source.hasOwnProperty(key)) {
                        if (!target || !target.hasOwnProperty(key)) {
                            return false;
                        } else if (!this.deepEqual(source[key], target[key])) {
                            return false;
                        }
                    }
                }
                for (key in target) {
                    if (target.hasOwnProperty(key)) {
                        if (!source || !source.hasOwnProperty(key)) {
                            return false;
                        }
                    }
                }
                return true;
            } else {
                return source === target;
            }
        },

        leftEqual: function(source, target) {
            if (typeof source === 'object' && typeof target === 'object') {
                var key = null;
                for (key in source) {
                    if (source.hasOwnProperty(key)) {
                        if (!target.hasOwnProperty(key)) {
                            return false;
                        } else if (!this.leftEqual(source[key], target[key])) {
                            return false;
                        }
                    }
                }
                return true;
            } else {
                return source === target;
            }
        },

        hasElement: function(array, element) {
            for (var i = 0; i < array.length; i++) {
                if (this.deepEqual(array[i], element)) {
                    return true;
                }
            }
            return false;
        },

        /**
         * Set value to a name path that starts from a base object
         * @param {string} name
         * @param {*} value
         * @param {object} [base=window]
         * @param {string} [separator='.']
         */
        setObject: function(name, value, base, separator) {
            for (var i = 0, parts = name.split(separator || '.'), last = parts.length - 1, p = base || window,
                    c;
                (c = parts[i]); ++i) {
                if (i < last) {
                    p[c] = p[c] || {};
                } else {
                    p[c] = value;
                }
                p = p[c];
            }
        },

        /**
         * Get value of a name path that starts from a base object
         * @param {string} name
         * @param {object} [base=window]
         * @param {string} [separator='.']
         * @returns {*} return undefined if path not found
         */
        getObject: function(name, base, separator) {
            for (var i = 0, parts = name.split(separator || '.'), last = parts.length - 1, p = base || window,
                    c;
                (c = parts[i]); ++i) {
                if (i < last && !p[c]) {
                    return undefined;
                }
                p = p[c];
            }
            return p;
        }
    };
    return ObjectUtils;
});
define('sap/viz/chart/metadata/bindingDef',[
    "sap/viz/chart/metadata/bindings/XYBindings",
    "sap/viz/chart/metadata/bindings/CombinationBindings",
    "sap/viz/chart/metadata/bindings/XYYCombinationBindings",
    "sap/viz/chart/metadata/bindings/YYBindings",
    "sap/viz/chart/metadata/bindings/XYYBindings",
    "sap/viz/chart/metadata/bindings/MekkoBindings",
    "sap/viz/chart/metadata/bindings/XXBindings",
    "sap/viz/chart/metadata/bindings/PieBindings",
    "sap/viz/chart/metadata/bindings/TrellisPieBindings",
    "sap/viz/chart/metadata/bindings/TreeBindings",
    "sap/viz/chart/metadata/bindings/TagCloudBindings",
    "sap/viz/chart/metadata/bindings/BulletBindings",
    "sap/viz/chart/metadata/bindings/NumericBindings",
    "sap/viz/chart/metadata/bindings/TimeYBindings",
    "sap/viz/chart/metadata/bindings/YYTimeBindings",
    "sap/viz/chart/metadata/bindings/WaterFallBindings",
    "sap/viz/chart/metadata/bindings/StackedWaterFallBindings",
    "sap/viz/framework/common/util/ObjectUtils"
], function(XYBindings, CombinationBindings, XYYCombinationBindings, YYBindings,
        XYYBindings, MekkoBindings, XXBindings, PieBindings, TrellisPieBindings,
        TreeBindings, TagCloudBindings, BulletBindings, NumericBindings, TimeYBindings,
        YYTimeBindings,WaterFallBindings, StackedWaterFallBindings, ObjectUtils) {

    var xYBindings = ObjectUtils.clone(XYBindings);
    var combinationBindings = ObjectUtils.clone(CombinationBindings);
    var xYYCombinationBindings = ObjectUtils.clone(XYYCombinationBindings);
    var yYBindings = ObjectUtils.clone(YYBindings);
    var xYYBindings = ObjectUtils.clone(XYYBindings);
    var xXBindings = ObjectUtils.clone(XXBindings);
    var xXYBindings = ObjectUtils.clone(MekkoBindings);
    var pieBindings = ObjectUtils.clone(PieBindings);
    var treeBindings = ObjectUtils.clone(TreeBindings);
    var tagcloudBindings = ObjectUtils.clone(TagCloudBindings);
    var bulletBindings = ObjectUtils.clone(BulletBindings);
    var trellisPieBindings = ObjectUtils.clone(TrellisPieBindings);
    var numericBindings =  ObjectUtils.clone(NumericBindings);
    var timeYBindings =  ObjectUtils.clone(TimeYBindings);
    var yYTimeBindings =  ObjectUtils.clone(YYTimeBindings);
    var waterfallBindings =  ObjectUtils.clone(WaterFallBindings);
    var stacked_waterfallBindings =  ObjectUtils.clone(StackedWaterFallBindings);

    var deleteName = function(data) {
        var i = data.length;
        while(i--) {
            delete data[i].name;
        }
        return data;
    };

    xYBindings = deleteName(xYBindings);
    combinationBindings = deleteName(combinationBindings);
    xYYCombinationBindings = deleteName(xYYCombinationBindings);
    yYBindings = deleteName(yYBindings);
    xYYBindings = deleteName(xYYBindings);
    xXYBindings = deleteName(xXYBindings);
    xXBindings = deleteName(xXBindings);
    pieBindings = deleteName(pieBindings);
    treeBindings = deleteName(treeBindings);
    bulletBindings = deleteName(bulletBindings);
    trellisPieBindings = deleteName(trellisPieBindings);
    numericBindings = deleteName(numericBindings);
    timeYBindings = deleteName(timeYBindings);
    yYTimeBindings = deleteName(yYTimeBindings);
    waterfallBindings = deleteName(WaterFallBindings);
    stacked_waterfallBindings = deleteName(StackedWaterFallBindings);
    
    return {
        "info/bar": {
            "renderType": "bar",
            "family": "xy",
            "name": "IDS_BARCHART",
            "vender": "sap.viz",
            "bindings": xYBindings
        },
        "info/trellis_bar": {
            "renderType": "bar",
            "family": "xy",
            "name": "IDS_TRELLISBARCHART",
            "vender": "sap.viz",
            "bindings": xYBindings
        },
        "info/stacked_bar": {
            "renderType": "stacked_bar",
            "family": "xy",
            "name": "IDS_STACKEDBARCHART",
            "vender": "sap.viz",
            "bindings": xYBindings
        },
        "info/trellis_stacked_bar": {
            "renderType": "stacked_bar",
            "family": "xy",
            "name": "IDS_TRELLISSTACKEDBARCHART",
            "vender": "sap.viz",
            "bindings": xYBindings
        },
        "info/100_stacked_bar": {
            "renderType": "100_stacked_bar",
            "family": "xy",
            "name": "IDS_PERCENTAGESTACKEDBARCHART",
            "vender": "sap.viz",
            "bindings": xYBindings
        },
        "info/trellis_100_stacked_bar": {
            "renderType": "100_stacked_bar",
            "family": "xy",
            "name": "IDS_TRELLISPERCENTAGESTACKEDBARCHART",
            "vender": "sap.viz",
            "bindings": xYBindings
        },
        "info/column": {
            "renderType": "column",
            "family": "xy",
            "name": "IDS_VERTICALBARCHART",
            "vender": "sap.viz",
            "bindings": xYBindings
        },
        "info/trellis_column": {
            "renderType": "column",
            "family": "xy",
            "name": "IDS_TRELLISCOLUMNCHART",
            "vender": "sap.viz",
            "bindings": xYBindings
        },
        "info/stacked_column": {
            "renderType": "stacked_column",
            "family": "xy",
            "name": "IDS_STACKEDVERTICALBARCHART",
            "vender": "sap.viz",
            "bindings": xYBindings
        },
        "info/trellis_stacked_column": {
            "renderType": "stacked_column",
            "family": "xy",
            "name": "IDS_TRELLISSTACKEDCOLUMNCHART",
            "vender": "sap.viz",
            "bindings": xYBindings
        },
        "info/100_stacked_column": {
            "renderType": "100_stacked_column",
            "family": "xy",
            "name": "IDS_PERCENTAGESTACKEDVERTICALBARCHART",
            "vender": "sap.viz",
            "bindings": xYBindings
        },
        "info/trellis_100_stacked_column": {
            "renderType": "100_stacked_column",
            "family": "xy",
            "name": "IDS_TRELLISPERCENTAGESTACKEDCOLUMNCHART",
            "vender": "sap.viz",
            "bindings": xYBindings
        },
        "info/line": {
            "renderType": "line",
            "family": "xy",
            "name": "IDS_LINECHART",
            "vender": "sap.viz",
            "bindings": xYBindings
        },
        "info/trellis_line": {
            "renderType": "line",
            "family": "xy",
            "name": "IDS_TRELLISLINECHART",
            "vender": "sap.viz",
            "bindings": xYBindings
        },
        "info/horizontal_line": {
            "renderType": "horizontal_line",
            "family": "xy",
            "name": "IDS_HORIZONTALLINECHART",
            "vender": "sap.viz",
            "bindings": xYBindings
        },
        "info/dual_horizontal_line": {
            "renderType": "horizontal_line",
            "family": "xy",
            "name": "IDS_DUALHORIZONTALLINECHART",
            "vender": "sap.viz",
            "bindings": xYYBindings
        },
        "info/trellis_dual_horizontal_line": {
            "renderType": "horizontal_line",
            "family": "xy",
            "name": "IDS_TRELLISDUALHORIZONTALLINECHART",
            "vender": "sap.viz",
            "bindings": xYYBindings
        },
        "info/trellis_horizontal_line": {
            "renderType": "horizontal_line",
            "family": "xy",
            "name": "IDS_TRELLISHORIZONTALLINECHART",
            "vender": "sap.viz",
            "bindings": xYBindings
        },
        "info/area": {
            "renderType": "area",
            "family": "xy",
            "name": "IDS_AREACHART",
            "vender": "sap.viz",
            "bindings": xYBindings
        },
        "info/horizontal_area": {
            "renderType": "horizontal_area",
            "family": "xy",
            "name": "IDS_HORIZONTALAREACHART",
            "vender": "sap.viz",
            "bindings": xYBindings
        },
        "info/trellis_area": {
            "renderType": "area",
            "family": "xy",
            "name": "IDS_TRELLISAREACHART",
            "vender": "sap.viz",
            "bindings": xYBindings
        },
        "info/trellis_horizontal_area": {
            "renderType": "horizontal_area",
            "family": "xy",
            "name": "IDS_TRELLISHORIZONTALAREACHART",
            "vender": "sap.viz",
            "bindings": xYBindings
        },
        "info/100_area": {
            "renderType": "100_area",
            "family": "xy",
            "name": "IDS_PERCENTAGEAREACHART",
            "vender": "sap.viz",
            "bindings": xYBindings
        },
        "info/trellis_100_area": {
            "renderType": "100_area",
            "family": "xy",
            "name": "IDS_TRELLISPERCENTAGEAREACHART",
            "vender": "sap.viz",
            "bindings": xYBindings
        },
        "info/100_horizontal_area": {
            "renderType": "100_horizontal_area",
            "family": "xy",
            "name": "IDS_PERCENTAGEHORIZONTALAREACHART",
            "vender": "sap.viz",
            "bindings": xYBindings
        },
        "info/trellis_100_horizontal_area": {
            "renderType": "100_horizontal_area",
            "family": "xy",
            "name": "IDS_TRELLISPERCENTAGEHORIZONTALAREACHART",
            "vender": "sap.viz",
            "bindings": xYBindings
        },
        "info/combination": {
            "renderType": "combination",
            "family": "xy",
            "name": "IDS_COMBINATIONCHART",
            "vender": "sap.viz",
            "bindings": combinationBindings
        },
        "info/trellis_combination": {
            "renderType": "combination",
            "family": "xy",
            "name": "IDS_TRELLISCOMBINATIONCHART",
            "vender": "sap.viz",
            "bindings": combinationBindings
        },
        "info/horizontal_combination": {
            "renderType": "horizontal_combination",
            "family": "xy",
            "name": "IDS_HORIZONTALCOMBINATIONCHART",
            "vender": "sap.viz",
            "bindings": combinationBindings
        },
        "info/trellis_horizontal_combination": {
            "renderType": "horizontal_combination",
            "family": "xy",
            "name": "IDS_TRELLISHORIZONTALCOMBINATIONCHART",
            "vender": "sap.viz",
            "bindings": combinationBindings
        },
        "info/bubble": {
            "renderType": "bubble",
            "family": "yy",
            "name": "IDS_BUBBLECHART",
            "vender": "sap.viz",
            "bindings": yYBindings
        },
        "info/trellis_bubble": {
            "renderType": "bubble",
            "family": "yy",
            "name": "IDS_TRELLISBUBBLECHART",
            "vender": "sap.viz",
            "bindings": yYBindings
        },
        "info/scatter": {
            "renderType": "scatter",
            "family": "yy",
            "name": "IDS_SCATTERCHART",
            "vender": "sap.viz",
            "bindings": yYBindings
        },
        "info/trellis_scatter": {
            "renderType": "scatter",
            "family": "yy",
            "name": "IDS_TRELLISSCATTERCHART",
            "vender": "sap.viz",
            "bindings": yYBindings
        },
        "info/dual_column": {
            "renderType": "column",
            "family": "xyy",
            "name": "IDS_DUALVERTICALBARCHART",
            "vender": "sap.viz",
            "bindings": xYYBindings
        },
        "info/trellis_dual_column": {
            "renderType": "column",
            "family": "xyy",
            "name": "IDS_TRELLISDUALCOLUMNCHART",
            "vender": "sap.viz",
            "bindings": xYYBindings
        },
        "info/dual_stacked_column": {
            "renderType": "stacked_column",
            "family": "xyy",
            "name": "IDS_DUALSTACKEDVERTICALBARCHART",
            "vender": "sap.viz",
            "bindings": xYYBindings
        },
        "info/trellis_dual_stacked_column": {
            "renderType": "stacked_column",
            "family": "xyy",
            "name": "IDS_TRELLISDUALSTACKEDCOLUMNCHART",
            "vender": "sap.viz",
            "bindings": xYYBindings
        },
        "info/100_dual_stacked_column": {
            "renderType": "100_stacked_column",
            "family": "xyy",
            "name": "IDS_DUALPERCENTAGESTACKEDVERTICALBARCHART",
            "vender": "sap.viz",
            "bindings": xYYBindings
        },
        "info/trellis_100_dual_stacked_column": {
            "renderType": "100_stacked_column",
            "family": "xyy",
            "name": "IDS_TRELLISDUALPERCENTAGESTACKEDCOLUMNCHART",
            "vender": "sap.viz",
            "bindings": xYYBindings
        },
        "info/dual_bar": {
            "renderType": "bar",
            "family": "xyy",
            "name": "IDS_DUALBARCHART",
            "vender": "sap.viz",
            "bindings": xYYBindings
        },
        "info/trellis_dual_bar": {
            "renderType": "bar",
            "family": "xyy",
            "name": "IDS_TRELLISDUALBARCHART",
            "vender": "sap.viz",
            "bindings": xYYBindings
        },
        "info/dual_stacked_bar": {
            "renderType": "stacked_bar",
            "family": "xyy",
            "name": "IDS_DUALSTACKEDBARCHART",
            "vender": "sap.viz",
            "bindings": xYYBindings
        },
        "info/trellis_dual_stacked_bar": {
            "renderType": "stacked_bar",
            "family": "xyy",
            "name": "IDS_TRELLISDUALSTACKEDBARCHART",
            "vender": "sap.viz",
            "bindings": xYYBindings
        },
        "info/100_dual_stacked_bar": {
            "renderType": "100_stacked_bar",
            "family": "xyy",
            "name": "IDS_DUALPERCENTAGESTACKEDBARCHART",
            "vender": "sap.viz",
            "bindings": xYYBindings
        },
        "info/trellis_100_dual_stacked_bar": {
            "renderType": "100_stacked_bar",
            "family": "xyy",
            "name": "IDS_TRELLISDUALPERCENTAGESTACKEDBARCHART",
            "vender": "sap.viz",
            "bindings": xYYBindings
        },
        "info/dual_line": {
            "renderType": "line",
            "family": "xyy",
            "name": "IDS_DUALLINECHART",
            "vender": "sap.viz",
            "bindings": xYYBindings
        },
        "info/trellis_dual_line": {
            "renderType": "line",
            "family": "xyy",
            "name": "IDS_TRELLISDUALLINECHART",
            "vender": "sap.viz",
            "bindings": xYYBindings
        },
        "info/pie": {
            "renderType": "pie",
            "family": "pie",
            "name": "IDS_PIECHART",
            "vender": "sap.viz",
            "bindings": pieBindings
        },
        "info/time_bubble" :{
            "renderType": "time_bubble",
            "family": "yy",
            "name" : 'IDS_TIMEBUBBLECHART',
            "vender" : "sap.viz",
            "bindings": yYBindings
        },
        "info/bullet": {
            "renderType": "bullet",
            "family": "bullet",
            "name": 'IDS_BULLETCHART',
            "vender": "sap.viz",
            "bindings": bulletBindings
        },
        "info/trellis_pie": {
            "renderType": "pie",
            "family": "pie",
            "name": "IDS_TRELLISPIECHART",
            "vender": "sap.viz",
            "bindings": trellisPieBindings
        },
        "info/donut": {
            "renderType": "donut",
            "family": "pie",
            "name": "IDS_DONUTCHART",
            "vender": "sap.viz",
            "bindings": pieBindings
        },
        "info/trellis_donut": {
            "renderType": "donut",
            "family": "pie",
            "name": "IDS_TRELLISDONUTCHART",
            "vender": "sap.viz",
            "bindings": trellisPieBindings
        },
        "info/treemap": {
            "renderType": "treemap",
            "family": "treemap",
            "name": "IDS_TREEMAPCHART",
            "vender": "sap.viz",
            "bindings": treeBindings
        },
        "info/tagcloud": {
            "renderType": "tagcloud",
            "family": "tagcloud",
            "name": "IDS_TAGCLOUDCHART",
            "vender": "sap.viz",
            "bindings": tagcloudBindings
        },
        "info/heatmap": {
            "renderType": "heatmap",
            "family": "heatmap",
            "name": "IDS_HEATMAPCHART",
            "vender": "sap.viz",
            "bindings": xXBindings
        },
        "info/vertical_bullet": {
            "renderType": "bullet",
            "family": "bullet",
            "name": "IDS_VERTICALBULLETCHART",
            "vender": "sap.viz",
            "bindings": bulletBindings
        },
        "info/stacked_combination": {
            "renderType": "stacked_combination",
            "family": "xy",
            "name": "IDS_STACKEDCOMBINATIONCHART",
            "vender": "sap.viz",
            "bindings": combinationBindings
        },
        "info/horizontal_stacked_combination": {
            "renderType": "horizontal_stacked_combination",
            "family": "xy",
            "name": "IDS_HORIZONTALSTACKEDCOMBINATIONCHART",
            "vender": "sap.viz",
            "bindings": combinationBindings
        },
        "info/dual_stacked_combination": {
            "renderType": "stacked_combination",
            "family": "xyy",
            "name": "IDS_DUALSTACKEDCOMBINATIONCHART",
            "vender": "sap.viz",
            "bindings": xYYCombinationBindings
        },
        "info/dual_horizontal_stacked_combination": {
            "renderType": "horizontal_stacked_combination",
            "family": "xyy",
            "name": "IDS_DUALHORIZONTALSTACKEDCOMBINATIONCHART",
            "vender": "sap.viz",
            "bindings": xYYCombinationBindings
        },
        "info/trellis_bullet": {
            "renderType": "bullet",
            "family": "bullet",
            "name": "IDS_TRELLISBULLETCHART",
            "vender": "sap.viz",
            "bindings": bulletBindings
        },
        "info/trellis_vertical_bullet": {
            "renderType": "bullet",
            "family": "bullet",
            "name": "IDS_TRELLISVERTICALBULLETCHART",
            "vender": "sap.viz",
            "bindings": bulletBindings
        },
        "info/mekko": {
            "renderType": "mekko",
            "family": "xxy",
            "name": "IDS_MEKKOCHART",
            "vender": "sap.viz",
            "bindings": xXYBindings
        },
        "info/100_mekko": {
            "renderType": "100_mekko",
            "family": "xxy",
            "name": "IDS_PERCENTAGEMEKKOCHART",
            "vender": "sap.viz",
            "bindings": xXYBindings
        },
        "info/horizontal_mekko": {
            "renderType": "horizontal_mekko",
            "family": "xxy",
            "name": "IDS_HORIZONTALMEKKOCHART",
            "vender": "sap.viz",
            "bindings": xXYBindings
        },
        "info/100_horizontal_mekko": {
            "renderType": "100_horizontal_mekko",
            "family": "xxy",
            "name": "IDS_PERCENTAGEHORIZONTALMEKKOCHART",
            "vender": "sap.viz",
            "bindings": xXYBindings
        },
        "info/dual_combination": {
            "renderType": "combination",
            "family": "xyy",
            "name": "IDS_DUALCOMBINATIONCHART",
            "vender": "sap.viz",
            "bindings": xYYCombinationBindings
        },
        "info/dual_horizontal_combination": {
            "renderType": "horizontal_combination",
            "family": "xyy",
            "name": "IDS_DUALHORIZONTALCOMBINATIONCHART",
            "vender": "sap.viz",
            "bindings": xYYCombinationBindings
        },
        "info/number" :{
            "renderType" : "number",
            "family" : "number",
            "name" : "IDS_NUMBERCHART",
            "vender" : "sap.viz",
            "bindings" : numericBindings
        },
        "info/timeseries_line" :{
            "renderType": "timeseries_line",
            "family": "ty",
            "name" : 'IDS_TIMELINECHART',
            "vender" : "sap.viz",
            "bindings": timeYBindings
        },
        "info/timeseries_scatter" :{
            "renderType": "timeseries_scatter",
            "family": "ty",
            "name" : 'IDS_TIMESERIESSCATTERCHART',
            "vender" : "sap.viz",
            "bindings": yYTimeBindings
        },
        "info/timeseries_bubble" :{
            "renderType": "timeseries_bubble",
            "family": "ty",
            "name" : 'IDS_TIMESERIESBUBBLECHART',
            "vender" : "sap.viz",
            "bindings": yYTimeBindings
        },
        "info/waterfall": {
            "renderType": "waterfall",
            "family": "waterfall",
            "name": "IDS_WATERFALLCHART",
            "vender": "sap.viz",
            "bindings": waterfallBindings
        },
        "info/stacked_waterfall": {
            "renderType": "stacked_waterfall",
            "family": "waterfall",
            "name": "IDS_STACKEDWATERFALLCHART",
            "vender": "sap.viz",
            "bindings": stacked_waterfallBindings
        },
        "info/horizontal_waterfall": {
            "renderType": "horizontal_waterfall",
            "family": "waterfall",
            "name": "IDS_HORIZONTALWATERFALLCHART",
            "vender": "sap.viz",
            "bindings": waterfallBindings
        },
        "info/horizontal_stacked_waterfall": {
            "renderType": "horizontal_stacked_waterfall",
            "family": "waterfall",
            "name": "IDS_HORIZONTALSTACKEDWATERFALL",
            "vender": "sap.viz",
            "bindings": stacked_waterfallBindings
        },
        "info/radar": {
            "renderType": "radar",
            "family": "radar",
            "name": "IDS_RADARCHART",
            "vender": "sap.viz",
            "bindings": xYBindings
        },
        "info/trellis_radar": {
            "renderType": "radar",
            "family": "radar",
            "name": "IDS_TRELLISRADARCHART",
            "vender": "sap.viz",
            "bindings": xYBindings
        }
    };
});

define('sap/viz/chart/metadata/properties/chartTypes',[], function(){
    return [
        "DEFAULT",
        "100_dual_stacked_bar",
        "100_dual_stacked_column",
        "mekko",
        "100_mekko",
        "horizontal_mekko",
        "100_horizontal_mekko",
        "100_stacked_bar",
        "100_stacked_column",
        "100_area",
        "100_horizontal_area",
        "bar",
        "bullet",
        "vertical_bullet",
        "column",
        "combination",
        "dual_bar",
        "dual_column",
        "dual_horizontal_line",
        "dual_line",
        "dual_stacked_bar",
        "dual_stacked_column",
        "horizontal_combination",
        "horizontal_line",
        "line",
        "area",
        "horizontal_area",
        "timeseries_line",
        "stacked_bar",
        "stacked_column",
        "pie",
        "donut",
        "scatter",
        "bubble",
        "time_bubble",
        "timeseries_scatter",
        "timeseries_bubble",
        "treemap",
        "heatmap",
        "tagcloud",
        "number",
        "radar",
        "trellis_100_dual_stacked_bar",
        "trellis_100_dual_stacked_column",
        "trellis_100_stacked_bar",
        "trellis_100_stacked_column",
        "trellis_100_area",
        "trellis_100_horizontal_area",
        "trellis_bar",
        "trellis_column",
        "trellis_combination",
        "trellis_dual_bar",
        "trellis_dual_column",
        "trellis_dual_horizontal_line",
        "trellis_dual_line",
        "trellis_dual_stacked_bar",
        "trellis_dual_stacked_column",
        "trellis_horizontal_combination",
        "trellis_horizontal_line",
        "trellis_horizontal_area",
        "trellis_line",
        "trellis_area",
        "trellis_stacked_bar",
        "trellis_stacked_column",
        "trellis_pie",
        "trellis_scatter",
        "trellis_bubble",
        "trellis_donut",
        "trellis_bullet",
        "trellis_vertical_bullet",
        "stacked_combination",
        "horizontal_stacked_combination",
        "dual_stacked_combination",
        "dual_horizontal_stacked_combination",
        "dual_combination",
        "dual_horizontal_combination",
        "waterfall",
        "stacked_waterfall",
        "horizontal_waterfall",
        "horizontal_stacked_waterfall",
        "trellis_radar"
    ];
});


define('propertyDefs',[], function(){
return {
    "": {
        "general.background.border.bottom.visible": false,
        "general.background.border.left.visible": false,
        "general.background.border.right.visible": false,
        "general.background.border.stroke": "#d8d8d8",
        "general.background.border.strokeWidth": 1,
        "general.background.border.top.visible": false,
        "general.background.color": "transparent",
        "general.background.drawingEffect": "normal",
        "general.background.gradientDirection": "vertical",
        "general.background.visible": true,
        "general.layout.padding": 24,
        "general.layout.paddingBottom": null,
        "general.layout.paddingLeft": null,
        "general.layout.paddingRight": null,
        "general.layout.paddingTop": null,
        "general.tabIndex": 0,
        "title.alignment": "center",
        "title.layout.maxHeight": 0.2,
        "title.style.color": "#333333",
        "title.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "title.style.fontSize": "16px",
        "title.style.fontStyle": "normal",
        "title.style.fontWeight": "bold",
        "title.text": null,
        "title.visible": false
    },
    "_bullet": {
        "categoryAxis.axisLine.size": 1,
        "categoryAxis.axisLine.visible": true,
        "categoryAxis.axisTick.visible": true,
        "categoryAxis.color": "#6c6c6c",
        "categoryAxis.hoverShadow.color": "#cccccc",
        "categoryAxis.label.hideSubLevels": false,
        "categoryAxis.label.style.color": "#333333",
        "categoryAxis.label.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "categoryAxis.label.style.fontSize": "12px",
        "categoryAxis.label.style.fontStyle": "normal",
        "categoryAxis.label.style.fontWeight": "normal",
        "categoryAxis.label.visible": true,
        "categoryAxis.labelRenderer": null,
        "categoryAxis.layout.maxHeight": 0.3,
        "categoryAxis.layout.maxWidth": 0.3,
        "categoryAxis.mouseDownShadow.color": "#808080",
        "categoryAxis.title.applyAxislineColor": false,
        "categoryAxis.title.style.color": "#000000",
        "categoryAxis.title.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "categoryAxis.title.style.fontSize": "14px",
        "categoryAxis.title.style.fontStyle": "normal",
        "categoryAxis.title.style.fontWeight": "bold",
        "categoryAxis.title.text": null,
        "categoryAxis.title.visible": false,
        "categoryAxis.visible": true,
        "feedingZone": {
            "defaultValue": [
                {
                    "bindDef": [
                        {
                            "id": null
                        }
                    ],
                    "bound": [
                        [
                            [
                                0,
                                0
                            ],
                            [
                                0,
                                0
                            ],
                            [
                                0,
                                0
                            ],
                            [
                                0,
                                0
                            ]
                        ]
                    ],
                    "name": null
                }
            ],
            "readonly": true,
            "serializable": false
        },
        "general.groupData": false,
        "interaction.behaviorType": null,
        "interaction.decorations": {
            "defaultValue": null,
            "serializable": false
        },
        "interaction.deselected.opacity": 0.4,
        "interaction.deselected.stroke.color": "darken(20%)",
        "interaction.deselected.stroke.visible": false,
        "interaction.deselected.stroke.width": "1px",
        "interaction.hover.opacity": 1,
        "interaction.hover.stroke.color": "darken(20%)",
        "interaction.hover.stroke.visible": true,
        "interaction.hover.stroke.width": "2px",
        "interaction.selectability.axisLabelSelection": true,
        "interaction.selectability.mode": "INCLUSIVE",
        "interaction.selectability.plotLassoSelection": true,
        "interaction.selectability.plotStdSelection": true,
        "interaction.selected.stroke.color": "darken(20%)",
        "interaction.selected.stroke.visible": true,
        "interaction.selected.stroke.width": "1px",
        "legend.drawingEffect": "normal",
        "legend.isScrollable": false,
        "legend.itemMargin": 0.5,
        "legend.label.style.color": "#000000",
        "legend.label.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "legend.label.style.fontSize": "12px",
        "legend.label.style.fontStyle": "normal",
        "legend.label.style.fontWeight": "normal",
        "legend.label.text.negativeGap": "Below is Bad",
        "legend.label.text.positiveGap": "Above is Good",
        "legend.label.text.target": "Target",
        "legend.marker.size": null,
        "legend.maxNumOfItems": null,
        "legend.order": {
            "defaultValue": null,
            "serializable": false
        },
        "legend.postRenderer": null,
        "legend.scrollbar.border.color": "white",
        "legend.scrollbar.border.width": 0,
        "legend.scrollbar.spacing": 0,
        "legend.scrollbar.thumb.fill": "#e5e5e5",
        "legend.scrollbar.thumb.hoverFill": "#dedede",
        "legend.scrollbar.track.fill": "#f7f7f7",
        "legend.showFullLabel": true,
        "legend.title.style.color": "#000000",
        "legend.title.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "legend.title.style.fontSize": "14px",
        "legend.title.style.fontStyle": "normal",
        "legend.title.style.fontWeight": "bold",
        "legend.title.text": null,
        "legend.title.visible": false,
        "legend.visible": true,
        "legendGroup.computedVisibility": {
            "defaultValue": true,
            "readonly": true,
            "serializable": false
        },
        "legendGroup.layout.alignment": "topLeft",
        "legendGroup.layout.maxHeight": 0.25,
        "legendGroup.layout.maxWidth": 0.25,
        "legendGroup.layout.position": "right",
        "legendGroup.layout.respectPlotPosition": true,
        "legendGroup.renderTo": null,
        "plotArea.actualColor": [
            "#748CB2",
            "#9CC677",
            "#EACF5E",
            "#F9AD79",
            "#D16A7C",
            "#8873A2",
            "#3A95B3",
            "#B6D949",
            "#FDD36C",
            "#F47958",
            "#A65084",
            "#0063B1",
            "#0DA841",
            "#FCB71D",
            "#F05620",
            "#B22D6E",
            "#3C368E"
        ],
        "plotArea.additionalColor": [
            "#A7BFE5",
            "#CFF9AA",
            "#FFFF91",
            "#FFE0AC",
            "#FF9DAF",
            "#BBA6D5",
            "#6DC8E6",
            "#E9FF7C",
            "#FFFF9F",
            "#FFAC8B",
            "#D983B7",
            "#3396E4",
            "#40DB74",
            "#FFEA50",
            "#FF8953",
            "#E560A1",
            "#6F69C1"
        ],
        "plotArea.background.border.stroke": "#d8d8d8",
        "plotArea.background.border.strokeWidth": 1,
        "plotArea.background.color": "transparent",
        "plotArea.background.drawingEffect": "normal",
        "plotArea.background.gradientDirection": "vertical",
        "plotArea.background.visible": true,
        "plotArea.dataPoint.stroke.color": "#ffffff",
        "plotArea.dataPoint.stroke.visible": true,
        "plotArea.dataPointStyle": null,
        "plotArea.dataPointStyleMode": "update",
        "plotArea.defaultOthersStyle.color": "#000000",
        "plotArea.forecastColor": [
            "#D5DADC"
        ],
        "plotArea.gap.negativeColor": "#e34352",
        "plotArea.gap.positiveColor": "#87c27e",
        "plotArea.gap.type": "both",
        "plotArea.gap.visible": false,
        "plotArea.gridline.color": "#d8d8d8",
        "plotArea.gridline.size": 1,
        "plotArea.gridline.type": "line",
        "plotArea.gridline.visible": false,
        "plotArea.primaryScale.autoMaxValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.primaryScale.autoMinValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.primaryScale.maxValue": {
            "defaultValue": null,
            "serializable": false
        },
        "plotArea.primaryScale.minValue": {
            "defaultValue": null,
            "serializable": false
        },
        "plotArea.scrollbar.border.color": "white",
        "plotArea.scrollbar.border.width": 0,
        "plotArea.scrollbar.spacing": 0,
        "plotArea.scrollbar.thumb.fill": "#e5e5e5",
        "plotArea.scrollbar.thumb.hoverFill": "#dedede",
        "plotArea.scrollbar.track.fill": "#f7f7f7",
        "plotArea.target.shadowColor": "",
        "plotArea.target.valueColor": "#333333",
        "propertyZone": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "tooltip.background.borderColor": "#cccccc",
        "tooltip.background.color": "#ffffff",
        "tooltip.bodyDimensionLabel.color": "#666666",
        "tooltip.bodyDimensionValue.color": "#666666",
        "tooltip.bodyMeasureLabel.color": "#666666",
        "tooltip.bodyMeasureValue.color": "#000000",
        "tooltip.closeButton.backgroundColor": "#ffffff",
        "tooltip.closeButton.borderColor": "#cccccc",
        "tooltip.footerLabel.color": "#000000",
        "tooltip.formatString": null,
        "tooltip.layinChart": true,
        "tooltip.postRender": null,
        "tooltip.preRender": {
            "defaultValue": null,
            "serializable": false
        },
        "tooltip.separationLine.color": "#a7a9ac",
        "tooltip.unitFormatType": "FinancialUnits",
        "tooltip.visible": true,
        "valueAxis.axisLine.size": 1,
        "valueAxis.axisLine.visible": true,
        "valueAxis.axisTick.visible": true,
        "valueAxis.color": "#6c6c6c",
        "valueAxis.label.formatString": null,
        "valueAxis.label.style.color": "#333333",
        "valueAxis.label.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "valueAxis.label.style.fontSize": "12px",
        "valueAxis.label.style.fontStyle": "normal",
        "valueAxis.label.style.fontWeight": "normal",
        "valueAxis.label.unitFormatType": "FinancialUnits",
        "valueAxis.label.visible": true,
        "valueAxis.layout.maxHeight": 0.25,
        "valueAxis.layout.maxWidth": 0.25,
        "valueAxis.title.applyAxislineColor": false,
        "valueAxis.title.style.color": "#000000",
        "valueAxis.title.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "valueAxis.title.style.fontSize": "14px",
        "valueAxis.title.style.fontStyle": "normal",
        "valueAxis.title.style.fontWeight": "bold",
        "valueAxis.title.text": null,
        "valueAxis.title.visible": false,
        "valueAxis.visible": true
    },
    "_dual": {
        "categoryAxis.axisLine.size": 1,
        "categoryAxis.axisLine.visible": true,
        "categoryAxis.axisTick.visible": true,
        "categoryAxis.color": "#6c6c6c",
        "categoryAxis.hoverShadow.color": "#cccccc",
        "categoryAxis.label.hideSubLevels": false,
        "categoryAxis.label.style.color": "#333333",
        "categoryAxis.label.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "categoryAxis.label.style.fontSize": "12px",
        "categoryAxis.label.style.fontStyle": "normal",
        "categoryAxis.label.style.fontWeight": "normal",
        "categoryAxis.label.visible": true,
        "categoryAxis.labelRenderer": null,
        "categoryAxis.layout.maxHeight": 0.3,
        "categoryAxis.layout.maxWidth": 0.3,
        "categoryAxis.mouseDownShadow.color": "#808080",
        "categoryAxis.title.applyAxislineColor": false,
        "categoryAxis.title.style.color": "#000000",
        "categoryAxis.title.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "categoryAxis.title.style.fontSize": "14px",
        "categoryAxis.title.style.fontStyle": "normal",
        "categoryAxis.title.style.fontWeight": "bold",
        "categoryAxis.title.text": null,
        "categoryAxis.title.visible": false,
        "categoryAxis.visible": true,
        "feedingZone": {
            "defaultValue": [
                {
                    "bindDef": [
                        {
                            "id": null
                        }
                    ],
                    "bound": [
                        [
                            [
                                0,
                                0
                            ],
                            [
                                0,
                                0
                            ],
                            [
                                0,
                                0
                            ],
                            [
                                0,
                                0
                            ]
                        ]
                    ],
                    "name": null
                }
            ],
            "readonly": true,
            "serializable": false
        },
        "general.groupData": false,
        "interaction.behaviorType": null,
        "interaction.decorations": {
            "defaultValue": null,
            "serializable": false
        },
        "interaction.deselected.color": null,
        "interaction.deselected.opacity": 0.4,
        "interaction.deselected.stroke.color": "darken(20%)",
        "interaction.deselected.stroke.visible": false,
        "interaction.deselected.stroke.width": "1px",
        "interaction.hover.color": null,
        "interaction.hover.opacity": 1,
        "interaction.hover.stroke.color": "darken(20%)",
        "interaction.hover.stroke.visible": true,
        "interaction.hover.stroke.width": "2px",
        "interaction.selectability.axisLabelSelection": true,
        "interaction.selectability.legendSelection": true,
        "interaction.selectability.mode": "INCLUSIVE",
        "interaction.selectability.plotLassoSelection": true,
        "interaction.selectability.plotStdSelection": true,
        "interaction.selected.color": null,
        "interaction.selected.stroke.color": "darken(20%)",
        "interaction.selected.stroke.visible": true,
        "interaction.selected.stroke.width": "1px",
        "legend.drawingEffect": "normal",
        "legend.hoverShadow.color": "#cccccc",
        "legend.isScrollable": false,
        "legend.itemMargin": 0.5,
        "legend.label.style.color": "#000000",
        "legend.label.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "legend.label.style.fontSize": "12px",
        "legend.label.style.fontStyle": "normal",
        "legend.label.style.fontWeight": "normal",
        "legend.marker.size": null,
        "legend.maxNumOfItems": null,
        "legend.mouseDownShadow.color": "#808080",
        "legend.order": {
            "defaultValue": null,
            "serializable": false
        },
        "legend.postRenderer": null,
        "legend.scrollbar.border.color": "white",
        "legend.scrollbar.border.width": 0,
        "legend.scrollbar.spacing": 0,
        "legend.scrollbar.thumb.fill": "#e5e5e5",
        "legend.scrollbar.thumb.hoverFill": "#dedede",
        "legend.scrollbar.track.fill": "#f7f7f7",
        "legend.showFullLabel": true,
        "legend.title.style.color": "#000000",
        "legend.title.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "legend.title.style.fontSize": "14px",
        "legend.title.style.fontStyle": "normal",
        "legend.title.style.fontWeight": "bold",
        "legend.title.text": null,
        "legend.title.visible": false,
        "legend.visible": true,
        "legendGroup.computedVisibility": {
            "defaultValue": true,
            "readonly": true,
            "serializable": false
        },
        "legendGroup.layout.alignment": "topLeft",
        "legendGroup.layout.maxHeight": 0.25,
        "legendGroup.layout.maxWidth": 0.25,
        "legendGroup.layout.position": "right",
        "legendGroup.layout.respectPlotPosition": true,
        "legendGroup.renderTo": null,
        "plotArea.background.border.bottom.visible": true,
        "plotArea.background.border.left.visible": true,
        "plotArea.background.border.right.visible": true,
        "plotArea.background.border.stroke": "#d8d8d8",
        "plotArea.background.border.strokeWidth": 1,
        "plotArea.background.border.top.visible": true,
        "plotArea.background.color": "transparent",
        "plotArea.background.drawingEffect": "normal",
        "plotArea.background.gradientDirection": "vertical",
        "plotArea.background.visible": true,
        "plotArea.dataLabel.formatString": null,
        "plotArea.dataLabel.hideWhenOverlap": false,
        "plotArea.dataLabel.renderer": null,
        "plotArea.dataLabel.style.color": "#333333",
        "plotArea.dataLabel.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "plotArea.dataLabel.style.fontSize": "12px",
        "plotArea.dataLabel.style.fontStyle": "normal",
        "plotArea.dataLabel.style.fontWeight": "normal",
        "plotArea.dataLabel.unitFormatType": "FinancialUnits",
        "plotArea.dataLabel.visible": false,
        "plotArea.dataPoint.stroke.color": "#000000",
        "plotArea.dataPoint.stroke.visible": false,
        "plotArea.dataPointStyle": null,
        "plotArea.dataPointStyleMode": "update",
        "plotArea.defaultOthersStyle.color": "#000000",
        "plotArea.drawingEffect": "normal",
        "plotArea.gridline.color": "#d8d8d8",
        "plotArea.gridline.size": 1,
        "plotArea.gridline.type": "line",
        "plotArea.gridline.visible": true,
        "plotArea.gridline.zeroLine.color": null,
        "plotArea.gridline.zeroLine.highlight": true,
        "plotArea.gridline.zeroLine.unhighlightAxis": true,
        "plotArea.markerRenderer": null,
        "plotArea.primaryValuesColorPalette": {
            "defaultValue": [
                "#8FBADD",
                "#B8D4E9",
                "#7AAED6",
                "#A3C7E3",
                "#3D88C4",
                "#66A1D0",
                "#297CBE",
                "#5295CA",
                "#005BA3",
                "#146FB7",
                "#005395",
                "#0063B1"
            ],
            "serializable": false
        },
        "plotArea.referenceLine.defaultStyle.color": "#666666",
        "plotArea.referenceLine.defaultStyle.label.background": "#ffffff",
        "plotArea.referenceLine.defaultStyle.label.color": "#333333",
        "plotArea.referenceLine.defaultStyle.label.fontFamily": "\"Open Sans\", Arial, Helvetica, sans-serif",
        "plotArea.referenceLine.defaultStyle.label.fontSize": "12px",
        "plotArea.referenceLine.defaultStyle.label.fontStyle": "normal",
        "plotArea.referenceLine.defaultStyle.label.fontWeight": "normal",
        "plotArea.referenceLine.defaultStyle.size": 1,
        "plotArea.referenceLine.defaultStyle.type": "dotted",
        "plotArea.referenceLine.line": null,
        "plotArea.scrollbar.border.color": "white",
        "plotArea.scrollbar.border.width": 0,
        "plotArea.scrollbar.spacing": 0,
        "plotArea.scrollbar.thumb.fill": "#e5e5e5",
        "plotArea.scrollbar.thumb.hoverFill": "#dedede",
        "plotArea.scrollbar.track.fill": "#f7f7f7",
        "plotArea.secondaryValuesColorPalette": {
            "defaultValue": [
                "#F6A09B",
                "#F9C3C0",
                "#F58E88",
                "#F8B1AD",
                "#F05B52",
                "#F37D76",
                "#EE4A40",
                "#F16C64",
                "#D92419",
                "#ED382D",
                "#C52117",
                "#EB271B"
            ],
            "serializable": false
        },
        "propertyZone": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "tooltip.background.borderColor": "#cccccc",
        "tooltip.background.color": "#ffffff",
        "tooltip.bodyDimensionLabel.color": "#666666",
        "tooltip.bodyDimensionValue.color": "#666666",
        "tooltip.bodyMeasureLabel.color": "#666666",
        "tooltip.bodyMeasureValue.color": "#000000",
        "tooltip.closeButton.backgroundColor": "#ffffff",
        "tooltip.closeButton.borderColor": "#cccccc",
        "tooltip.footerLabel.color": "#000000",
        "tooltip.formatString": null,
        "tooltip.layinChart": true,
        "tooltip.postRender": null,
        "tooltip.preRender": {
            "defaultValue": null,
            "serializable": false
        },
        "tooltip.separationLine.color": "#a7a9ac",
        "tooltip.unitFormatType": "FinancialUnits",
        "tooltip.visible": true,
        "valueAxis.axisLine.size": 1,
        "valueAxis.axisLine.visible": true,
        "valueAxis.axisTick.visible": true,
        "valueAxis.color": "#8FBADD",
        "valueAxis.label.formatString": null,
        "valueAxis.label.style.color": "#333333",
        "valueAxis.label.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "valueAxis.label.style.fontSize": "12px",
        "valueAxis.label.style.fontStyle": "normal",
        "valueAxis.label.style.fontWeight": "normal",
        "valueAxis.label.unitFormatType": "FinancialUnits",
        "valueAxis.label.visible": true,
        "valueAxis.layout.maxHeight": 0.25,
        "valueAxis.layout.maxWidth": 0.25,
        "valueAxis.title.applyAxislineColor": true,
        "valueAxis.title.style.color": "#000000",
        "valueAxis.title.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "valueAxis.title.style.fontSize": "14px",
        "valueAxis.title.style.fontStyle": "normal",
        "valueAxis.title.style.fontWeight": "bold",
        "valueAxis.title.text": null,
        "valueAxis.title.visible": false,
        "valueAxis.visible": true,
        "valueAxis2.axisLine.size": 1,
        "valueAxis2.axisLine.visible": true,
        "valueAxis2.axisTick.visible": true,
        "valueAxis2.color": "#F6A09B",
        "valueAxis2.label.formatString": null,
        "valueAxis2.label.style.color": "#333333",
        "valueAxis2.label.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "valueAxis2.label.style.fontSize": "12px",
        "valueAxis2.label.style.fontStyle": "normal",
        "valueAxis2.label.style.fontWeight": "normal",
        "valueAxis2.label.unitFormatType": "FinancialUnits",
        "valueAxis2.label.visible": true,
        "valueAxis2.layout.maxHeight": 0.25,
        "valueAxis2.layout.maxWidth": 0.25,
        "valueAxis2.title.applyAxislineColor": true,
        "valueAxis2.title.style.color": "#000000",
        "valueAxis2.title.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "valueAxis2.title.style.fontSize": "14px",
        "valueAxis2.title.style.fontStyle": "normal",
        "valueAxis2.title.style.fontWeight": "bold",
        "valueAxis2.title.text": null,
        "valueAxis2.title.visible": false,
        "valueAxis2.visible": true
    },
    "_pie": {
        "feedingZone": {
            "defaultValue": [
                {
                    "bindDef": [
                        {
                            "id": null
                        }
                    ],
                    "bound": [
                        [
                            [
                                0,
                                0
                            ],
                            [
                                0,
                                0
                            ],
                            [
                                0,
                                0
                            ],
                            [
                                0,
                                0
                            ]
                        ]
                    ],
                    "name": null
                }
            ],
            "readonly": true,
            "serializable": false
        },
        "general.groupData": false,
        "interaction.behaviorType": null,
        "interaction.decorations": {
            "defaultValue": null,
            "serializable": false
        },
        "interaction.deselected.color": null,
        "interaction.deselected.opacity": 0.4,
        "interaction.deselected.stroke.color": "darken(20%)",
        "interaction.deselected.stroke.visible": false,
        "interaction.deselected.stroke.width": "1px",
        "interaction.hover.color": null,
        "interaction.hover.opacity": 1,
        "interaction.hover.stroke.color": "darken(20%)",
        "interaction.hover.stroke.visible": true,
        "interaction.hover.stroke.width": "2px",
        "interaction.selectability.axisLabelSelection": true,
        "interaction.selectability.legendSelection": true,
        "interaction.selectability.mode": "INCLUSIVE",
        "interaction.selectability.plotLassoSelection": true,
        "interaction.selectability.plotStdSelection": true,
        "interaction.selected.color": null,
        "interaction.selected.stroke.color": "darken(20%)",
        "interaction.selected.stroke.visible": true,
        "interaction.selected.stroke.width": "1px",
        "legend.drawingEffect": "normal",
        "legend.hoverShadow.color": "#cccccc",
        "legend.isScrollable": false,
        "legend.itemMargin": 0.5,
        "legend.label.style.color": "#000000",
        "legend.label.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "legend.label.style.fontSize": "12px",
        "legend.label.style.fontStyle": "normal",
        "legend.label.style.fontWeight": "normal",
        "legend.marker.shape": "squareWithRadius",
        "legend.marker.size": null,
        "legend.maxNumOfItems": null,
        "legend.mouseDownShadow.color": "#808080",
        "legend.order": {
            "defaultValue": null,
            "serializable": false
        },
        "legend.postRenderer": null,
        "legend.scrollbar.border.color": "white",
        "legend.scrollbar.border.width": 0,
        "legend.scrollbar.spacing": 0,
        "legend.scrollbar.thumb.fill": "#e5e5e5",
        "legend.scrollbar.thumb.hoverFill": "#dedede",
        "legend.scrollbar.track.fill": "#f7f7f7",
        "legend.showFullLabel": true,
        "legend.title.style.color": "#000000",
        "legend.title.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "legend.title.style.fontSize": "14px",
        "legend.title.style.fontStyle": "normal",
        "legend.title.style.fontWeight": "bold",
        "legend.title.text": null,
        "legend.title.visible": false,
        "legend.visible": true,
        "legendGroup.computedVisibility": {
            "defaultValue": true,
            "readonly": true,
            "serializable": false
        },
        "legendGroup.layout.alignment": "topLeft",
        "legendGroup.layout.maxHeight": 0.25,
        "legendGroup.layout.maxWidth": 0.25,
        "legendGroup.layout.position": "right",
        "legendGroup.renderTo": null,
        "plotArea.background.border.stroke": "#d8d8d8",
        "plotArea.background.border.strokeWidth": 1,
        "plotArea.background.color": "transparent",
        "plotArea.background.drawingEffect": "normal",
        "plotArea.background.gradientDirection": "vertical",
        "plotArea.background.visible": true,
        "plotArea.colorPalette": {
            "defaultValue": [
                "#748CB2",
                "#9CC677",
                "#EACF5E",
                "#F9AD79",
                "#D16A7C",
                "#8873A2",
                "#3A95B3",
                "#B6D949",
                "#FDD36C",
                "#F47958",
                "#A65084",
                "#0063B1",
                "#0DA841",
                "#FCB71D",
                "#F05620",
                "#B22D6E",
                "#3C368E",
                "#8FB2CF",
                "#95D4AB",
                "#EAE98F",
                "#F9BE92",
                "#EC9A99",
                "#BC98BD",
                "#1EB7B2",
                "#73C03C",
                "#F48323",
                "#EB271B",
                "#D9B5CA",
                "#AED1DA",
                "#DFECB2",
                "#FCDAB0",
                "#F5BCB4"
            ],
            "serializable": false
        },
        "plotArea.dataLabel.formatString": null,
        "plotArea.dataLabel.hideWhenOverlap": false,
        "plotArea.dataLabel.renderer": null,
        "plotArea.dataLabel.style.color": "#333333",
        "plotArea.dataLabel.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "plotArea.dataLabel.style.fontSize": "12px",
        "plotArea.dataLabel.style.fontStyle": "normal",
        "plotArea.dataLabel.style.fontWeight": "normal",
        "plotArea.dataLabel.type": "colorAndPercentage",
        "plotArea.dataLabel.unitFormatType": "FinancialUnits",
        "plotArea.dataLabel.visible": false,
        "plotArea.dataPoint.stroke.color": "#000000",
        "plotArea.dataPoint.stroke.visible": false,
        "plotArea.dataPointStyle": null,
        "plotArea.dataPointStyleMode": "update",
        "plotArea.defaultOthersStyle.color": "#000000",
        "plotArea.drawingEffect": "normal",
        "propertyZone": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "tooltip.background.borderColor": "#cccccc",
        "tooltip.background.color": "#ffffff",
        "tooltip.bodyDimensionLabel.color": "#666666",
        "tooltip.bodyDimensionValue.color": "#666666",
        "tooltip.bodyMeasureLabel.color": "#666666",
        "tooltip.bodyMeasureValue.color": "#000000",
        "tooltip.closeButton.backgroundColor": "#ffffff",
        "tooltip.closeButton.borderColor": "#cccccc",
        "tooltip.footerLabel.color": "#000000",
        "tooltip.formatString": null,
        "tooltip.layinChart": true,
        "tooltip.postRender": null,
        "tooltip.preRender": {
            "defaultValue": null,
            "serializable": false
        },
        "tooltip.separationLine.color": "#a7a9ac",
        "tooltip.unitFormatType": "FinancialUnits",
        "tooltip.visible": true
    },
    "_scatter": {
        "feedingZone": {
            "defaultValue": [
                {
                    "bindDef": [
                        {
                            "id": null
                        }
                    ],
                    "bound": [
                        [
                            [
                                0,
                                0
                            ],
                            [
                                0,
                                0
                            ],
                            [
                                0,
                                0
                            ],
                            [
                                0,
                                0
                            ]
                        ]
                    ],
                    "name": null
                }
            ],
            "readonly": true,
            "serializable": false
        },
        "general.groupData": false,
        "interaction.behaviorType": null,
        "interaction.decorations": {
            "defaultValue": null,
            "serializable": false
        },
        "interaction.deselected.color": null,
        "interaction.deselected.opacity": 0.4,
        "interaction.deselected.stroke.color": "darken(20%)",
        "interaction.deselected.stroke.visible": false,
        "interaction.deselected.stroke.width": "1px",
        "interaction.hover.color": null,
        "interaction.hover.opacity": 1,
        "interaction.hover.stroke.color": "darken(20%)",
        "interaction.hover.stroke.visible": true,
        "interaction.hover.stroke.width": "2px",
        "interaction.selectability.legendSelection": true,
        "interaction.selectability.mode": "INCLUSIVE",
        "interaction.selectability.plotLassoSelection": true,
        "interaction.selectability.plotStdSelection": true,
        "interaction.selected.color": null,
        "interaction.selected.stroke.color": "darken(20%)",
        "interaction.selected.stroke.visible": true,
        "interaction.selected.stroke.width": "1px",
        "legend.drawingEffect": "normal",
        "legend.hoverShadow.color": "#cccccc",
        "legend.isScrollable": false,
        "legend.itemMargin": 0.5,
        "legend.label.style.color": "#000000",
        "legend.label.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "legend.label.style.fontSize": "12px",
        "legend.label.style.fontStyle": "normal",
        "legend.label.style.fontWeight": "normal",
        "legend.marker.size": null,
        "legend.maxNumOfItems": null,
        "legend.mouseDownShadow.color": "#808080",
        "legend.order": {
            "defaultValue": null,
            "serializable": false
        },
        "legend.postRenderer": null,
        "legend.scrollbar.border.color": "white",
        "legend.scrollbar.border.width": 0,
        "legend.scrollbar.spacing": 0,
        "legend.scrollbar.thumb.fill": "#e5e5e5",
        "legend.scrollbar.thumb.hoverFill": "#dedede",
        "legend.scrollbar.track.fill": "#f7f7f7",
        "legend.showFullLabel": true,
        "legend.title.style.color": "#000000",
        "legend.title.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "legend.title.style.fontSize": "14px",
        "legend.title.style.fontStyle": "normal",
        "legend.title.style.fontWeight": "bold",
        "legend.title.text": null,
        "legend.title.visible": false,
        "legend.visible": true,
        "legendGroup.computedVisibility": {
            "defaultValue": true,
            "readonly": true,
            "serializable": false
        },
        "legendGroup.layout.alignment": "topLeft",
        "legendGroup.layout.maxHeight": 0.25,
        "legendGroup.layout.maxWidth": 0.25,
        "legendGroup.layout.position": "right",
        "legendGroup.layout.respectPlotPosition": true,
        "legendGroup.renderTo": null,
        "plotArea.background.border.stroke": "#d8d8d8",
        "plotArea.background.border.strokeWidth": 1,
        "plotArea.background.color": "transparent",
        "plotArea.background.drawingEffect": "normal",
        "plotArea.background.gradientDirection": "vertical",
        "plotArea.background.visible": true,
        "plotArea.colorPalette": {
            "defaultValue": [
                "#748CB2",
                "#9CC677",
                "#EACF5E",
                "#F9AD79",
                "#D16A7C",
                "#8873A2",
                "#3A95B3",
                "#B6D949",
                "#FDD36C",
                "#F47958",
                "#A65084",
                "#0063B1",
                "#0DA841",
                "#FCB71D",
                "#F05620",
                "#B22D6E",
                "#3C368E",
                "#8FB2CF",
                "#95D4AB",
                "#EAE98F",
                "#F9BE92",
                "#EC9A99",
                "#BC98BD",
                "#1EB7B2",
                "#73C03C",
                "#F48323",
                "#EB271B",
                "#D9B5CA",
                "#AED1DA",
                "#DFECB2",
                "#FCDAB0",
                "#F5BCB4"
            ],
            "serializable": false
        },
        "plotArea.dataLabel.formatString": null,
        "plotArea.dataLabel.hideWhenOverlap": false,
        "plotArea.dataLabel.renderer": null,
        "plotArea.dataLabel.style.color": "#333333",
        "plotArea.dataLabel.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "plotArea.dataLabel.style.fontSize": "12px",
        "plotArea.dataLabel.style.fontStyle": "normal",
        "plotArea.dataLabel.style.fontWeight": "normal",
        "plotArea.dataLabel.unitFormatType": "FinancialUnits",
        "plotArea.dataLabel.visible": false,
        "plotArea.dataPoint.opacity": 0.8,
        "plotArea.dataPoint.stroke.color": "#000000",
        "plotArea.dataPoint.stroke.visible": false,
        "plotArea.dataPointStyle": null,
        "plotArea.dataPointStyleMode": "update",
        "plotArea.defaultOthersStyle.color": "#000000",
        "plotArea.drawingEffect": "normal",
        "plotArea.gridline.color": "#d8d8d8",
        "plotArea.gridline.size": 1,
        "plotArea.gridline.type": "line",
        "plotArea.gridline.visible": true,
        "plotArea.markerRenderer": null,
        "plotArea.primaryScale.autoMaxValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.primaryScale.autoMinValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.primaryScale.fixedRange": {
            "defaultValue": false,
            "serializable": false
        },
        "plotArea.primaryScale.maxValue": {
            "defaultValue": null,
            "serializable": false
        },
        "plotArea.primaryScale.minValue": {
            "defaultValue": null,
            "serializable": false
        },
        "plotArea.referenceLine.defaultStyle.color": "#666666",
        "plotArea.referenceLine.defaultStyle.label.background": "#ffffff",
        "plotArea.referenceLine.defaultStyle.label.color": "#333333",
        "plotArea.referenceLine.defaultStyle.label.fontFamily": "\"Open Sans\", Arial, Helvetica, sans-serif",
        "plotArea.referenceLine.defaultStyle.label.fontSize": "12px",
        "plotArea.referenceLine.defaultStyle.label.fontStyle": "normal",
        "plotArea.referenceLine.defaultStyle.label.fontWeight": "normal",
        "plotArea.referenceLine.defaultStyle.size": 1,
        "plotArea.referenceLine.defaultStyle.type": "dotted",
        "plotArea.referenceLine.line": null,
        "plotArea.scrollbar.border.color": "white",
        "plotArea.scrollbar.border.width": 0,
        "plotArea.scrollbar.spacing": 0,
        "plotArea.scrollbar.thumb.fill": "#e5e5e5",
        "plotArea.scrollbar.thumb.hoverFill": "#dedede",
        "plotArea.scrollbar.track.fill": "#f7f7f7",
        "plotArea.shapePalette": {
            "defaultValue": [
                "circle",
                "square",
                "diamond",
                "triangleUp",
                "triangleDown",
                "triangleLeft",
                "triangleRight",
                "cross",
                "intersection"
            ],
            "serializable": false
        },
        "propertyZone": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "tooltip.background.borderColor": "#cccccc",
        "tooltip.background.color": "#ffffff",
        "tooltip.bodyDimensionLabel.color": "#666666",
        "tooltip.bodyDimensionValue.color": "#666666",
        "tooltip.bodyMeasureLabel.color": "#666666",
        "tooltip.bodyMeasureValue.color": "#000000",
        "tooltip.closeButton.backgroundColor": "#ffffff",
        "tooltip.closeButton.borderColor": "#cccccc",
        "tooltip.footerLabel.color": "#000000",
        "tooltip.formatString": null,
        "tooltip.layinChart": true,
        "tooltip.postRender": null,
        "tooltip.preRender": {
            "defaultValue": null,
            "serializable": false
        },
        "tooltip.separationLine.color": "#a7a9ac",
        "tooltip.unitFormatType": "FinancialUnits",
        "tooltip.visible": true,
        "valueAxis.axisLine.size": 1,
        "valueAxis.axisLine.visible": true,
        "valueAxis.axisTick.visible": true,
        "valueAxis.color": "#6c6c6c",
        "valueAxis.label.style.color": "#333333",
        "valueAxis.label.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "valueAxis.label.style.fontSize": "12px",
        "valueAxis.label.style.fontStyle": "normal",
        "valueAxis.label.style.fontWeight": "normal",
        "valueAxis.label.unitFormatType": "FinancialUnits",
        "valueAxis.label.visible": true,
        "valueAxis.layout.maxHeight": 0.25,
        "valueAxis.layout.maxWidth": 0.25,
        "valueAxis.title.applyAxislineColor": false,
        "valueAxis.title.style.color": "#000000",
        "valueAxis.title.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "valueAxis.title.style.fontSize": "14px",
        "valueAxis.title.style.fontStyle": "normal",
        "valueAxis.title.style.fontWeight": "bold",
        "valueAxis.title.text": null,
        "valueAxis.title.visible": false,
        "valueAxis.visible": true
    },
    "_trellis": {
        "columnAxis.axisLine.visible": false,
        "columnAxis.hoverShadow.color": "#cccccc",
        "columnAxis.hoverShadowMouseDown.color": "#808080",
        "columnAxis.label.style.color": "#333333",
        "columnAxis.label.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "columnAxis.label.style.fontSize": "12px",
        "columnAxis.label.style.fontStyle": "normal",
        "columnAxis.label.style.fontWeight": "normal",
        "columnAxis.label.visible": true,
        "columnAxis.layout.maxHeight": 0.3,
        "columnAxis.mouseDownShadow.color": "#808080",
        "columnAxis.title.style.color": "#000000",
        "columnAxis.title.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "columnAxis.title.style.fontSize": "14px",
        "columnAxis.title.style.fontStyle": "normal",
        "columnAxis.title.style.fontWeight": "bold",
        "columnAxis.title.text": null,
        "columnAxis.title.visible": true,
        "columnAxis.visible": true,
        "plotArea.background.border.bottom.visible": false,
        "plotArea.background.border.left.visible": false,
        "plotArea.background.border.right.visible": false,
        "plotArea.background.border.top.visible": false,
        "plotArea.grid.background.alternateColors": [],
        "plotArea.grid.background.alternatePattern": "byRow",
        "plotArea.grid.background.color": "transparent",
        "plotArea.grid.background.drawingEffect": "normal",
        "plotArea.grid.background.gradientDirection": "vertical",
        "plotArea.grid.background.visible": true,
        "plotArea.grid.line.color": "#d8d8d8",
        "plotArea.grid.line.size": 1,
        "plotArea.grid.line.visible": true,
        "rowAxis.axisLine.visible": false,
        "rowAxis.hiddenTitle.color": "#a6a6a6",
        "rowAxis.hoverShadow.color": "#cccccc",
        "rowAxis.hoverShadowMouseDown.color": "#808080",
        "rowAxis.label.disableAutoHide": true,
        "rowAxis.label.style.color": "#333333",
        "rowAxis.label.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "rowAxis.label.style.fontSize": "12px",
        "rowAxis.label.style.fontStyle": "normal",
        "rowAxis.label.style.fontWeight": "normal",
        "rowAxis.label.visible": true,
        "rowAxis.layout.maxWidth": 0.3,
        "rowAxis.mouseDownShadow.color": "#808080",
        "rowAxis.title.style.color": "#000000",
        "rowAxis.title.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "rowAxis.title.style.fontSize": "14px",
        "rowAxis.title.style.fontStyle": "normal",
        "rowAxis.title.style.fontWeight": "bold",
        "rowAxis.title.text": null,
        "rowAxis.title.visible": true,
        "rowAxis.visible": true
    },
    "_xy": {
        "feedingZone": {
            "defaultValue": [
                {
                    "bindDef": [
                        {
                            "id": null
                        }
                    ],
                    "bound": [
                        [
                            [
                                0,
                                0
                            ],
                            [
                                0,
                                0
                            ],
                            [
                                0,
                                0
                            ],
                            [
                                0,
                                0
                            ]
                        ]
                    ],
                    "name": null
                }
            ],
            "readonly": true,
            "serializable": false
        },
        "general.groupData": false,
        "interaction.behaviorType": null,
        "interaction.decorations": {
            "defaultValue": null,
            "serializable": false
        },
        "interaction.deselected.color": null,
        "interaction.deselected.opacity": 0.4,
        "interaction.deselected.stroke.color": "darken(20%)",
        "interaction.deselected.stroke.visible": false,
        "interaction.deselected.stroke.width": "1px",
        "interaction.hover.color": null,
        "interaction.hover.opacity": 1,
        "interaction.hover.stroke.color": "darken(20%)",
        "interaction.hover.stroke.visible": true,
        "interaction.hover.stroke.width": "2px",
        "interaction.selectability.legendSelection": true,
        "interaction.selectability.mode": "INCLUSIVE",
        "interaction.selectability.plotLassoSelection": true,
        "interaction.selectability.plotStdSelection": true,
        "interaction.selected.color": null,
        "interaction.selected.stroke.color": "darken(20%)",
        "interaction.selected.stroke.visible": true,
        "interaction.selected.stroke.width": "1px",
        "legend.drawingEffect": "normal",
        "legend.hoverShadow.color": "#cccccc",
        "legend.isScrollable": false,
        "legend.itemMargin": 0.5,
        "legend.label.style.color": "#000000",
        "legend.label.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "legend.label.style.fontSize": "12px",
        "legend.label.style.fontStyle": "normal",
        "legend.label.style.fontWeight": "normal",
        "legend.marker.size": null,
        "legend.maxNumOfItems": null,
        "legend.mouseDownShadow.color": "#808080",
        "legend.order": {
            "defaultValue": null,
            "serializable": false
        },
        "legend.postRenderer": null,
        "legend.scrollbar.border.color": "white",
        "legend.scrollbar.border.width": 0,
        "legend.scrollbar.spacing": 0,
        "legend.scrollbar.thumb.fill": "#e5e5e5",
        "legend.scrollbar.thumb.hoverFill": "#dedede",
        "legend.scrollbar.track.fill": "#f7f7f7",
        "legend.showFullLabel": true,
        "legend.title.style.color": "#000000",
        "legend.title.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "legend.title.style.fontSize": "14px",
        "legend.title.style.fontStyle": "normal",
        "legend.title.style.fontWeight": "bold",
        "legend.title.text": null,
        "legend.title.visible": false,
        "legend.visible": true,
        "legendGroup.computedVisibility": {
            "defaultValue": true,
            "readonly": true,
            "serializable": false
        },
        "legendGroup.layout.alignment": "topLeft",
        "legendGroup.layout.maxHeight": 0.25,
        "legendGroup.layout.maxWidth": 0.25,
        "legendGroup.layout.position": "right",
        "legendGroup.layout.respectPlotPosition": true,
        "legendGroup.renderTo": null,
        "plotArea.background.border.bottom.visible": true,
        "plotArea.background.border.left.visible": true,
        "plotArea.background.border.right.visible": true,
        "plotArea.background.border.stroke": "#d8d8d8",
        "plotArea.background.border.strokeWidth": 1,
        "plotArea.background.border.top.visible": true,
        "plotArea.background.color": "transparent",
        "plotArea.background.drawingEffect": "normal",
        "plotArea.background.gradientDirection": "vertical",
        "plotArea.background.visible": true,
        "plotArea.colorPalette": {
            "defaultValue": [
                "#748CB2",
                "#9CC677",
                "#EACF5E",
                "#F9AD79",
                "#D16A7C",
                "#8873A2",
                "#3A95B3",
                "#B6D949",
                "#FDD36C",
                "#F47958",
                "#A65084",
                "#0063B1",
                "#0DA841",
                "#FCB71D",
                "#F05620",
                "#B22D6E",
                "#3C368E",
                "#8FB2CF",
                "#95D4AB",
                "#EAE98F",
                "#F9BE92",
                "#EC9A99",
                "#BC98BD",
                "#1EB7B2",
                "#73C03C",
                "#F48323",
                "#EB271B",
                "#D9B5CA",
                "#AED1DA",
                "#DFECB2",
                "#FCDAB0",
                "#F5BCB4"
            ],
            "serializable": false
        },
        "plotArea.dataLabel.formatString": null,
        "plotArea.dataLabel.hideWhenOverlap": false,
        "plotArea.dataLabel.renderer": null,
        "plotArea.dataLabel.style.color": "#333333",
        "plotArea.dataLabel.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "plotArea.dataLabel.style.fontSize": "12px",
        "plotArea.dataLabel.style.fontStyle": "normal",
        "plotArea.dataLabel.style.fontWeight": "normal",
        "plotArea.dataLabel.unitFormatType": "FinancialUnits",
        "plotArea.dataLabel.visible": false,
        "plotArea.dataPoint.stroke.color": "#000000",
        "plotArea.dataPoint.stroke.visible": false,
        "plotArea.dataPointStyle": null,
        "plotArea.dataPointStyleMode": "update",
        "plotArea.defaultOthersStyle.color": "#000000",
        "plotArea.drawingEffect": "normal",
        "plotArea.gridline.color": "#d8d8d8",
        "plotArea.gridline.size": 1,
        "plotArea.gridline.type": "line",
        "plotArea.gridline.visible": true,
        "plotArea.gridline.zeroLine.color": null,
        "plotArea.gridline.zeroLine.highlight": true,
        "plotArea.gridline.zeroLine.unhighlightAxis": true,
        "plotArea.markerRenderer": null,
        "plotArea.referenceLine.defaultStyle.color": "#666666",
        "plotArea.referenceLine.defaultStyle.label.background": "#ffffff",
        "plotArea.referenceLine.defaultStyle.label.color": "#333333",
        "plotArea.referenceLine.defaultStyle.label.fontFamily": "\"Open Sans\", Arial, Helvetica, sans-serif",
        "plotArea.referenceLine.defaultStyle.label.fontSize": "12px",
        "plotArea.referenceLine.defaultStyle.label.fontStyle": "normal",
        "plotArea.referenceLine.defaultStyle.label.fontWeight": "normal",
        "plotArea.referenceLine.defaultStyle.size": 1,
        "plotArea.referenceLine.defaultStyle.type": "dotted",
        "plotArea.referenceLine.line": null,
        "plotArea.scrollbar.border.color": "white",
        "plotArea.scrollbar.border.width": 0,
        "plotArea.scrollbar.spacing": 0,
        "plotArea.scrollbar.thumb.fill": "#e5e5e5",
        "plotArea.scrollbar.thumb.hoverFill": "#dedede",
        "plotArea.scrollbar.track.fill": "#f7f7f7",
        "propertyZone": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "tooltip.background.borderColor": "#cccccc",
        "tooltip.background.color": "#ffffff",
        "tooltip.bodyDimensionLabel.color": "#666666",
        "tooltip.bodyDimensionValue.color": "#666666",
        "tooltip.bodyMeasureLabel.color": "#666666",
        "tooltip.bodyMeasureValue.color": "#000000",
        "tooltip.closeButton.backgroundColor": "#ffffff",
        "tooltip.closeButton.borderColor": "#cccccc",
        "tooltip.footerLabel.color": "#000000",
        "tooltip.formatString": null,
        "tooltip.layinChart": true,
        "tooltip.postRender": null,
        "tooltip.preRender": {
            "defaultValue": null,
            "serializable": false
        },
        "tooltip.separationLine.color": "#a7a9ac",
        "tooltip.unitFormatType": "FinancialUnits",
        "tooltip.visible": true,
        "valueAxis.axisLine.size": 1,
        "valueAxis.axisLine.visible": true,
        "valueAxis.axisTick.visible": true,
        "valueAxis.color": "#6c6c6c",
        "valueAxis.label.formatString": null,
        "valueAxis.label.style.color": "#333333",
        "valueAxis.label.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "valueAxis.label.style.fontSize": "12px",
        "valueAxis.label.style.fontStyle": "normal",
        "valueAxis.label.style.fontWeight": "normal",
        "valueAxis.label.unitFormatType": "FinancialUnits",
        "valueAxis.label.visible": true,
        "valueAxis.layout.maxHeight": 0.25,
        "valueAxis.layout.maxWidth": 0.25,
        "valueAxis.title.applyAxislineColor": false,
        "valueAxis.title.style.color": "#000000",
        "valueAxis.title.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "valueAxis.title.style.fontSize": "14px",
        "valueAxis.title.style.fontStyle": "normal",
        "valueAxis.title.style.fontWeight": "bold",
        "valueAxis.title.text": null,
        "valueAxis.title.visible": false,
        "valueAxis.visible": true
    },
    "_xySimple": {
        "interaction.enableKeyboard": false,
        "interaction.noninteractiveMode": false,
        "interaction.zoom.direction": "all",
        "interaction.zoom.enablement": "auto",
        "legendGroup.forceToShow": false,
        "legendGroup.layout.height": null,
        "legendGroup.layout.width": null,
        "plotArea.window.end": null,
        "plotArea.window.start": null,
        "title.layout.height": null,
        "valueAxis.layout.height": null,
        "valueAxis.layout.width": null
    },
    "info/100_area": {
        "categoryAxis.axisLine.size": 1,
        "categoryAxis.axisLine.visible": true,
        "categoryAxis.axisTick.visible": true,
        "categoryAxis.color": "#6c6c6c",
        "categoryAxis.hoverShadow.color": "#cccccc",
        "categoryAxis.label.angle": 90,
        "categoryAxis.label.hideSubLevels": false,
        "categoryAxis.label.rotation": "auto",
        "categoryAxis.label.style.color": "#333333",
        "categoryAxis.label.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "categoryAxis.label.style.fontSize": "12px",
        "categoryAxis.label.style.fontStyle": "normal",
        "categoryAxis.label.style.fontWeight": "normal",
        "categoryAxis.label.truncatedLabelRatio": 0.2,
        "categoryAxis.label.visible": true,
        "categoryAxis.labelRenderer": null,
        "categoryAxis.layout.height": null,
        "categoryAxis.layout.maxHeight": 0.3,
        "categoryAxis.layout.maxWidth": 0.3,
        "categoryAxis.layout.width": null,
        "categoryAxis.mouseDownShadow.color": "#808080",
        "categoryAxis.title.applyAxislineColor": false,
        "categoryAxis.title.style.color": "#000000",
        "categoryAxis.title.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "categoryAxis.title.style.fontSize": "14px",
        "categoryAxis.title.style.fontStyle": "normal",
        "categoryAxis.title.style.fontWeight": "bold",
        "categoryAxis.title.text": null,
        "categoryAxis.title.visible": false,
        "categoryAxis.visible": true,
        "feedingZone": {
            "defaultValue": [
                {
                    "bindDef": [
                        {
                            "id": null
                        }
                    ],
                    "bound": [
                        [
                            [
                                0,
                                0
                            ],
                            [
                                0,
                                0
                            ],
                            [
                                0,
                                0
                            ],
                            [
                                0,
                                0
                            ]
                        ]
                    ],
                    "name": null
                }
            ],
            "readonly": true,
            "serializable": false
        },
        "general.groupData": false,
        "interaction.behaviorType": null,
        "interaction.decorations": {
            "defaultValue": null,
            "serializable": false
        },
        "interaction.deselected.color": null,
        "interaction.deselected.opacity": 0.4,
        "interaction.hover.color": null,
        "interaction.hover.stroke.color": "darken(20%)",
        "interaction.hover.stroke.visible": true,
        "interaction.hover.stroke.width": "2px",
        "interaction.noninteractiveMode": false,
        "interaction.selectability.axisLabelSelection": true,
        "interaction.selectability.legendSelection": true,
        "interaction.selectability.mode": "INCLUSIVE",
        "interaction.selectability.plotLassoSelection": true,
        "interaction.selectability.plotStdSelection": true,
        "interaction.selected.color": null,
        "interaction.selected.stroke.color": "darken(20%)",
        "interaction.selected.stroke.visible": true,
        "interaction.selected.stroke.width": "1px",
        "interaction.zoom.direction": "all",
        "interaction.zoom.enablement": "auto",
        "legend.drawingEffect": "normal",
        "legend.hoverShadow.color": "#cccccc",
        "legend.isScrollable": false,
        "legend.itemMargin": 0.5,
        "legend.label.style.color": "#000000",
        "legend.label.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "legend.label.style.fontSize": "12px",
        "legend.label.style.fontStyle": "normal",
        "legend.label.style.fontWeight": "normal",
        "legend.marker.size": null,
        "legend.maxNumOfItems": null,
        "legend.mouseDownShadow.color": "#808080",
        "legend.order": {
            "defaultValue": null,
            "serializable": false
        },
        "legend.postRenderer": null,
        "legend.scrollbar.border.color": "white",
        "legend.scrollbar.border.width": 0,
        "legend.scrollbar.spacing": 0,
        "legend.scrollbar.thumb.fill": "#e5e5e5",
        "legend.scrollbar.thumb.hoverFill": "#dedede",
        "legend.scrollbar.track.fill": "#f7f7f7",
        "legend.showFullLabel": true,
        "legend.title.style.color": "#000000",
        "legend.title.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "legend.title.style.fontSize": "14px",
        "legend.title.style.fontStyle": "normal",
        "legend.title.style.fontWeight": "bold",
        "legend.title.text": null,
        "legend.title.visible": false,
        "legend.visible": true,
        "legendGroup.computedVisibility": {
            "defaultValue": true,
            "readonly": true,
            "serializable": false
        },
        "legendGroup.forceToShow": false,
        "legendGroup.layout.alignment": "topLeft",
        "legendGroup.layout.height": null,
        "legendGroup.layout.maxHeight": 0.25,
        "legendGroup.layout.maxWidth": 0.25,
        "legendGroup.layout.position": "right",
        "legendGroup.layout.respectPlotPosition": true,
        "legendGroup.layout.width": null,
        "legendGroup.renderTo": null,
        "plotArea.areaRenderer": null,
        "plotArea.background.border.bottom.visible": true,
        "plotArea.background.border.left.visible": true,
        "plotArea.background.border.right.visible": true,
        "plotArea.background.border.stroke": "#d8d8d8",
        "plotArea.background.border.strokeWidth": 1,
        "plotArea.background.border.top.visible": true,
        "plotArea.background.color": "transparent",
        "plotArea.background.drawingEffect": "normal",
        "plotArea.background.gradientDirection": "vertical",
        "plotArea.background.visible": true,
        "plotArea.colorPalette": {
            "defaultValue": [
                "#748CB2",
                "#9CC677",
                "#EACF5E",
                "#F9AD79",
                "#D16A7C",
                "#8873A2",
                "#3A95B3",
                "#B6D949",
                "#FDD36C",
                "#F47958",
                "#A65084",
                "#0063B1",
                "#0DA841",
                "#FCB71D",
                "#F05620",
                "#B22D6E",
                "#3C368E",
                "#8FB2CF",
                "#95D4AB",
                "#EAE98F",
                "#F9BE92",
                "#EC9A99",
                "#BC98BD",
                "#1EB7B2",
                "#73C03C",
                "#F48323",
                "#EB271B",
                "#D9B5CA",
                "#AED1DA",
                "#DFECB2",
                "#FCDAB0",
                "#F5BCB4"
            ],
            "serializable": false
        },
        "plotArea.dataLabel.formatString": null,
        "plotArea.dataLabel.hideWhenOverlap": false,
        "plotArea.dataLabel.renderer": null,
        "plotArea.dataLabel.style.color": "#333333",
        "plotArea.dataLabel.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "plotArea.dataLabel.style.fontSize": "12px",
        "plotArea.dataLabel.style.fontStyle": "normal",
        "plotArea.dataLabel.style.fontWeight": "normal",
        "plotArea.dataLabel.type": "value",
        "plotArea.dataLabel.unitFormatType": "FinancialUnits",
        "plotArea.dataLabel.visible": false,
        "plotArea.dataPoint.stroke.color": "#000000",
        "plotArea.dataPoint.stroke.visible": false,
        "plotArea.drawingEffect": "normal",
        "plotArea.gridline.color": "#d8d8d8",
        "plotArea.gridline.size": 1,
        "plotArea.gridline.type": "line",
        "plotArea.gridline.visible": true,
        "plotArea.gridline.zeroLine.color": null,
        "plotArea.gridline.zeroLine.highlight": true,
        "plotArea.gridline.zeroLine.unhighlightAxis": true,
        "plotArea.isFixedDataPointSize": false,
        "plotArea.markerRenderer": null,
        "plotArea.referenceLine.defaultStyle.color": "#666666",
        "plotArea.referenceLine.defaultStyle.label.background": "#ffffff",
        "plotArea.referenceLine.defaultStyle.label.color": "#333333",
        "plotArea.referenceLine.defaultStyle.label.fontFamily": "\"Open Sans\", Arial, Helvetica, sans-serif",
        "plotArea.referenceLine.defaultStyle.label.fontSize": "12px",
        "plotArea.referenceLine.defaultStyle.label.fontStyle": "normal",
        "plotArea.referenceLine.defaultStyle.label.fontWeight": "normal",
        "plotArea.referenceLine.defaultStyle.size": 1,
        "plotArea.referenceLine.defaultStyle.type": "dotted",
        "plotArea.referenceLine.line": null,
        "plotArea.scrollbar.border.color": "white",
        "plotArea.scrollbar.border.width": 0,
        "plotArea.scrollbar.spacing": 0,
        "plotArea.scrollbar.thumb.fill": "#e5e5e5",
        "plotArea.scrollbar.thumb.hoverFill": "#dedede",
        "plotArea.scrollbar.track.fill": "#f7f7f7",
        "propertyZone": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "title.layout.height": null,
        "tooltip.background.borderColor": "#cccccc",
        "tooltip.background.color": "#ffffff",
        "tooltip.bodyDimensionLabel.color": "#666666",
        "tooltip.bodyDimensionValue.color": "#666666",
        "tooltip.bodyMeasureLabel.color": "#666666",
        "tooltip.bodyMeasureValue.color": "#000000",
        "tooltip.closeButton.backgroundColor": "#ffffff",
        "tooltip.closeButton.borderColor": "#cccccc",
        "tooltip.footerLabel.color": "#000000",
        "tooltip.formatString": "0.00%",
        "tooltip.layinChart": true,
        "tooltip.postRender": null,
        "tooltip.preRender": {
            "defaultValue": null,
            "serializable": false
        },
        "tooltip.separationLine.color": "#a7a9ac",
        "tooltip.unitFormatType": "FinancialUnits",
        "tooltip.visible": true,
        "valueAxis.axisLine.size": 1,
        "valueAxis.axisLine.visible": true,
        "valueAxis.axisTick.visible": true,
        "valueAxis.color": "#6c6c6c",
        "valueAxis.label.formatString": null,
        "valueAxis.label.style.color": "#333333",
        "valueAxis.label.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "valueAxis.label.style.fontSize": "12px",
        "valueAxis.label.style.fontStyle": "normal",
        "valueAxis.label.style.fontWeight": "normal",
        "valueAxis.label.unitFormatType": "FinancialUnits",
        "valueAxis.label.visible": true,
        "valueAxis.layout.height": null,
        "valueAxis.layout.maxHeight": 0.25,
        "valueAxis.layout.maxWidth": 0.25,
        "valueAxis.layout.width": null,
        "valueAxis.title.applyAxislineColor": false,
        "valueAxis.title.style.color": "#000000",
        "valueAxis.title.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "valueAxis.title.style.fontSize": "14px",
        "valueAxis.title.style.fontStyle": "normal",
        "valueAxis.title.style.fontWeight": "bold",
        "valueAxis.title.text": null,
        "valueAxis.title.visible": false,
        "valueAxis.visible": true
    },
    "info/100_dual_stacked_bar": {
        "categoryAxis.layout.height": null,
        "categoryAxis.layout.width": null,
        "legend.marker.shape": "squareWithRadius",
        "plotArea.background.gradientDirection": "horizontal",
        "plotArea.dataLabel.type": "value",
        "plotArea.dataPointSize.max": 96,
        "plotArea.dataPointSize.min": 24,
        "plotArea.gap.groupSpacing": 1,
        "plotArea.gap.innerGroupSpacing": 0.125,
        "plotArea.isFixedDataPointSize": false,
        "tooltip.formatString": "0.00%",
        "valueAxis2.layout.height": null,
        "valueAxis2.layout.width": null
    },
    "info/100_dual_stacked_column": {
        "categoryAxis.label.angle": 90,
        "categoryAxis.label.rotation": "auto",
        "categoryAxis.label.truncatedLabelRatio": 0.2,
        "categoryAxis.layout.height": null,
        "categoryAxis.layout.width": null,
        "legend.marker.shape": "squareWithRadius",
        "plotArea.dataLabel.type": "value",
        "plotArea.dataPointSize.max": 96,
        "plotArea.dataPointSize.min": 24,
        "plotArea.gap.groupSpacing": 1,
        "plotArea.gap.innerGroupSpacing": 0.125,
        "plotArea.isFixedDataPointSize": false,
        "tooltip.formatString": "0.00%",
        "valueAxis2.layout.height": null,
        "valueAxis2.layout.width": null
    },
    "info/100_horizontal_area": {
        "categoryAxis.axisLine.size": 1,
        "categoryAxis.axisLine.visible": true,
        "categoryAxis.axisTick.visible": true,
        "categoryAxis.color": "#6c6c6c",
        "categoryAxis.hoverShadow.color": "#cccccc",
        "categoryAxis.label.hideSubLevels": false,
        "categoryAxis.label.style.color": "#333333",
        "categoryAxis.label.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "categoryAxis.label.style.fontSize": "12px",
        "categoryAxis.label.style.fontStyle": "normal",
        "categoryAxis.label.style.fontWeight": "normal",
        "categoryAxis.label.visible": true,
        "categoryAxis.labelRenderer": null,
        "categoryAxis.layout.height": null,
        "categoryAxis.layout.maxHeight": 0.3,
        "categoryAxis.layout.maxWidth": 0.3,
        "categoryAxis.layout.width": null,
        "categoryAxis.mouseDownShadow.color": "#808080",
        "categoryAxis.title.applyAxislineColor": false,
        "categoryAxis.title.style.color": "#000000",
        "categoryAxis.title.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "categoryAxis.title.style.fontSize": "14px",
        "categoryAxis.title.style.fontStyle": "normal",
        "categoryAxis.title.style.fontWeight": "bold",
        "categoryAxis.title.text": null,
        "categoryAxis.title.visible": false,
        "categoryAxis.visible": true,
        "feedingZone": {
            "defaultValue": [
                {
                    "bindDef": [
                        {
                            "id": null
                        }
                    ],
                    "bound": [
                        [
                            [
                                0,
                                0
                            ],
                            [
                                0,
                                0
                            ],
                            [
                                0,
                                0
                            ],
                            [
                                0,
                                0
                            ]
                        ]
                    ],
                    "name": null
                }
            ],
            "readonly": true,
            "serializable": false
        },
        "general.groupData": false,
        "interaction.behaviorType": null,
        "interaction.decorations": {
            "defaultValue": null,
            "serializable": false
        },
        "interaction.deselected.color": null,
        "interaction.deselected.opacity": 0.4,
        "interaction.hover.color": null,
        "interaction.hover.stroke.color": "darken(20%)",
        "interaction.hover.stroke.visible": true,
        "interaction.hover.stroke.width": "2px",
        "interaction.noninteractiveMode": false,
        "interaction.selectability.axisLabelSelection": true,
        "interaction.selectability.legendSelection": true,
        "interaction.selectability.mode": "INCLUSIVE",
        "interaction.selectability.plotLassoSelection": true,
        "interaction.selectability.plotStdSelection": true,
        "interaction.selected.color": null,
        "interaction.selected.stroke.color": "darken(20%)",
        "interaction.selected.stroke.visible": true,
        "interaction.selected.stroke.width": "1px",
        "interaction.zoom.direction": "all",
        "interaction.zoom.enablement": "auto",
        "legend.drawingEffect": "normal",
        "legend.hoverShadow.color": "#cccccc",
        "legend.isScrollable": false,
        "legend.itemMargin": 0.5,
        "legend.label.style.color": "#000000",
        "legend.label.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "legend.label.style.fontSize": "12px",
        "legend.label.style.fontStyle": "normal",
        "legend.label.style.fontWeight": "normal",
        "legend.marker.size": null,
        "legend.maxNumOfItems": null,
        "legend.mouseDownShadow.color": "#808080",
        "legend.order": {
            "defaultValue": null,
            "serializable": false
        },
        "legend.postRenderer": null,
        "legend.scrollbar.border.color": "white",
        "legend.scrollbar.border.width": 0,
        "legend.scrollbar.spacing": 0,
        "legend.scrollbar.thumb.fill": "#e5e5e5",
        "legend.scrollbar.thumb.hoverFill": "#dedede",
        "legend.scrollbar.track.fill": "#f7f7f7",
        "legend.showFullLabel": true,
        "legend.title.style.color": "#000000",
        "legend.title.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "legend.title.style.fontSize": "14px",
        "legend.title.style.fontStyle": "normal",
        "legend.title.style.fontWeight": "bold",
        "legend.title.text": null,
        "legend.title.visible": false,
        "legend.visible": true,
        "legendGroup.computedVisibility": {
            "defaultValue": true,
            "readonly": true,
            "serializable": false
        },
        "legendGroup.forceToShow": false,
        "legendGroup.layout.alignment": "topLeft",
        "legendGroup.layout.height": null,
        "legendGroup.layout.maxHeight": 0.25,
        "legendGroup.layout.maxWidth": 0.25,
        "legendGroup.layout.position": "right",
        "legendGroup.layout.respectPlotPosition": true,
        "legendGroup.layout.width": null,
        "legendGroup.renderTo": null,
        "plotArea.areaRenderer": null,
        "plotArea.background.border.bottom.visible": true,
        "plotArea.background.border.left.visible": true,
        "plotArea.background.border.right.visible": true,
        "plotArea.background.border.stroke": "#d8d8d8",
        "plotArea.background.border.strokeWidth": 1,
        "plotArea.background.border.top.visible": true,
        "plotArea.background.color": "transparent",
        "plotArea.background.drawingEffect": "normal",
        "plotArea.background.gradientDirection": "vertical",
        "plotArea.background.visible": true,
        "plotArea.colorPalette": {
            "defaultValue": [
                "#748CB2",
                "#9CC677",
                "#EACF5E",
                "#F9AD79",
                "#D16A7C",
                "#8873A2",
                "#3A95B3",
                "#B6D949",
                "#FDD36C",
                "#F47958",
                "#A65084",
                "#0063B1",
                "#0DA841",
                "#FCB71D",
                "#F05620",
                "#B22D6E",
                "#3C368E",
                "#8FB2CF",
                "#95D4AB",
                "#EAE98F",
                "#F9BE92",
                "#EC9A99",
                "#BC98BD",
                "#1EB7B2",
                "#73C03C",
                "#F48323",
                "#EB271B",
                "#D9B5CA",
                "#AED1DA",
                "#DFECB2",
                "#FCDAB0",
                "#F5BCB4"
            ],
            "serializable": false
        },
        "plotArea.dataLabel.formatString": null,
        "plotArea.dataLabel.hideWhenOverlap": false,
        "plotArea.dataLabel.renderer": null,
        "plotArea.dataLabel.style.color": "#333333",
        "plotArea.dataLabel.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "plotArea.dataLabel.style.fontSize": "12px",
        "plotArea.dataLabel.style.fontStyle": "normal",
        "plotArea.dataLabel.style.fontWeight": "normal",
        "plotArea.dataLabel.type": "value",
        "plotArea.dataLabel.unitFormatType": "FinancialUnits",
        "plotArea.dataLabel.visible": false,
        "plotArea.dataPoint.stroke.color": "#000000",
        "plotArea.dataPoint.stroke.visible": false,
        "plotArea.drawingEffect": "normal",
        "plotArea.gridline.color": "#d8d8d8",
        "plotArea.gridline.size": 1,
        "plotArea.gridline.type": "line",
        "plotArea.gridline.visible": true,
        "plotArea.gridline.zeroLine.color": null,
        "plotArea.gridline.zeroLine.highlight": true,
        "plotArea.gridline.zeroLine.unhighlightAxis": true,
        "plotArea.isFixedDataPointSize": false,
        "plotArea.markerRenderer": null,
        "plotArea.referenceLine.defaultStyle.color": "#666666",
        "plotArea.referenceLine.defaultStyle.label.background": "#ffffff",
        "plotArea.referenceLine.defaultStyle.label.color": "#333333",
        "plotArea.referenceLine.defaultStyle.label.fontFamily": "\"Open Sans\", Arial, Helvetica, sans-serif",
        "plotArea.referenceLine.defaultStyle.label.fontSize": "12px",
        "plotArea.referenceLine.defaultStyle.label.fontStyle": "normal",
        "plotArea.referenceLine.defaultStyle.label.fontWeight": "normal",
        "plotArea.referenceLine.defaultStyle.size": 1,
        "plotArea.referenceLine.defaultStyle.type": "dotted",
        "plotArea.referenceLine.line": null,
        "plotArea.scrollbar.border.color": "white",
        "plotArea.scrollbar.border.width": 0,
        "plotArea.scrollbar.spacing": 0,
        "plotArea.scrollbar.thumb.fill": "#e5e5e5",
        "plotArea.scrollbar.thumb.hoverFill": "#dedede",
        "plotArea.scrollbar.track.fill": "#f7f7f7",
        "propertyZone": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "title.layout.height": null,
        "tooltip.background.borderColor": "#cccccc",
        "tooltip.background.color": "#ffffff",
        "tooltip.bodyDimensionLabel.color": "#666666",
        "tooltip.bodyDimensionValue.color": "#666666",
        "tooltip.bodyMeasureLabel.color": "#666666",
        "tooltip.bodyMeasureValue.color": "#000000",
        "tooltip.closeButton.backgroundColor": "#ffffff",
        "tooltip.closeButton.borderColor": "#cccccc",
        "tooltip.footerLabel.color": "#000000",
        "tooltip.formatString": "0.00%",
        "tooltip.layinChart": true,
        "tooltip.postRender": null,
        "tooltip.preRender": {
            "defaultValue": null,
            "serializable": false
        },
        "tooltip.separationLine.color": "#a7a9ac",
        "tooltip.unitFormatType": "FinancialUnits",
        "tooltip.visible": true,
        "valueAxis.axisLine.size": 1,
        "valueAxis.axisLine.visible": true,
        "valueAxis.axisTick.visible": true,
        "valueAxis.color": "#6c6c6c",
        "valueAxis.label.formatString": null,
        "valueAxis.label.style.color": "#333333",
        "valueAxis.label.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "valueAxis.label.style.fontSize": "12px",
        "valueAxis.label.style.fontStyle": "normal",
        "valueAxis.label.style.fontWeight": "normal",
        "valueAxis.label.unitFormatType": "FinancialUnits",
        "valueAxis.label.visible": true,
        "valueAxis.layout.height": null,
        "valueAxis.layout.maxHeight": 0.25,
        "valueAxis.layout.maxWidth": 0.25,
        "valueAxis.layout.width": null,
        "valueAxis.title.applyAxislineColor": false,
        "valueAxis.title.style.color": "#000000",
        "valueAxis.title.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "valueAxis.title.style.fontSize": "14px",
        "valueAxis.title.style.fontStyle": "normal",
        "valueAxis.title.style.fontWeight": "bold",
        "valueAxis.title.text": null,
        "valueAxis.title.visible": false,
        "valueAxis.visible": true
    },
    "info/100_horizontal_mekko": {
        "categoryAxis.axisLine.size": 1,
        "categoryAxis.axisLine.visible": true,
        "categoryAxis.axisTick.visible": true,
        "categoryAxis.color": "#6c6c6c",
        "categoryAxis.hoverShadow.color": "#cccccc",
        "categoryAxis.label.hideSubLevels": false,
        "categoryAxis.label.style.color": "#333333",
        "categoryAxis.label.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "categoryAxis.label.style.fontSize": "12px",
        "categoryAxis.label.style.fontStyle": "normal",
        "categoryAxis.label.style.fontWeight": "normal",
        "categoryAxis.label.visible": true,
        "categoryAxis.labelRenderer": null,
        "categoryAxis.layout.height": null,
        "categoryAxis.layout.maxHeight": 0.3,
        "categoryAxis.layout.maxWidth": 0.3,
        "categoryAxis.layout.width": null,
        "categoryAxis.mouseDownShadow.color": "#808080",
        "categoryAxis.title.applyAxislineColor": false,
        "categoryAxis.title.style.color": "#000000",
        "categoryAxis.title.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "categoryAxis.title.style.fontSize": "14px",
        "categoryAxis.title.style.fontStyle": "normal",
        "categoryAxis.title.style.fontWeight": "bold",
        "categoryAxis.title.text": null,
        "categoryAxis.title.visible": false,
        "categoryAxis.visible": true,
        "feedingZone": {
            "defaultValue": [
                {
                    "bindDef": [
                        {
                            "id": null
                        }
                    ],
                    "bound": [
                        [
                            [
                                0,
                                0
                            ],
                            [
                                0,
                                0
                            ],
                            [
                                0,
                                0
                            ],
                            [
                                0,
                                0
                            ]
                        ]
                    ],
                    "name": null
                }
            ],
            "readonly": true,
            "serializable": false
        },
        "general.groupData": false,
        "interaction.behaviorType": null,
        "interaction.decorations": {
            "defaultValue": null,
            "serializable": false
        },
        "interaction.deselected.color": null,
        "interaction.deselected.opacity": 0.4,
        "interaction.deselected.stroke.color": "darken(20%)",
        "interaction.deselected.stroke.visible": false,
        "interaction.deselected.stroke.width": "1px",
        "interaction.hover.color": null,
        "interaction.hover.opacity": 1,
        "interaction.hover.stroke.color": "darken(20%)",
        "interaction.hover.stroke.visible": true,
        "interaction.hover.stroke.width": "2px",
        "interaction.noninteractiveMode": false,
        "interaction.selectability.axisLabelSelection": true,
        "interaction.selectability.legendSelection": true,
        "interaction.selectability.mode": "INCLUSIVE",
        "interaction.selectability.plotLassoSelection": true,
        "interaction.selectability.plotStdSelection": true,
        "interaction.selected.color": null,
        "interaction.selected.stroke.color": "darken(20%)",
        "interaction.selected.stroke.visible": true,
        "interaction.selected.stroke.width": "1px",
        "interaction.zoom.direction": "all",
        "interaction.zoom.enablement": "auto",
        "legend.drawingEffect": "normal",
        "legend.hoverShadow.color": "#cccccc",
        "legend.isScrollable": false,
        "legend.itemMargin": 0.5,
        "legend.label.style.color": "#000000",
        "legend.label.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "legend.label.style.fontSize": "12px",
        "legend.label.style.fontStyle": "normal",
        "legend.label.style.fontWeight": "normal",
        "legend.marker.shape": "squareWithRadius",
        "legend.marker.size": null,
        "legend.maxNumOfItems": null,
        "legend.mouseDownShadow.color": "#808080",
        "legend.order": {
            "defaultValue": null,
            "serializable": false
        },
        "legend.postRenderer": null,
        "legend.scrollbar.border.color": "white",
        "legend.scrollbar.border.width": 0,
        "legend.scrollbar.spacing": 0,
        "legend.scrollbar.thumb.fill": "#e5e5e5",
        "legend.scrollbar.thumb.hoverFill": "#dedede",
        "legend.scrollbar.track.fill": "#f7f7f7",
        "legend.showFullLabel": true,
        "legend.title.style.color": "#000000",
        "legend.title.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "legend.title.style.fontSize": "14px",
        "legend.title.style.fontStyle": "normal",
        "legend.title.style.fontWeight": "bold",
        "legend.title.text": null,
        "legend.title.visible": false,
        "legend.visible": true,
        "legendGroup.computedVisibility": {
            "defaultValue": true,
            "readonly": true,
            "serializable": false
        },
        "legendGroup.forceToShow": false,
        "legendGroup.layout.alignment": "topLeft",
        "legendGroup.layout.height": null,
        "legendGroup.layout.maxHeight": 0.25,
        "legendGroup.layout.maxWidth": 0.25,
        "legendGroup.layout.position": "right",
        "legendGroup.layout.respectPlotPosition": true,
        "legendGroup.layout.width": null,
        "legendGroup.renderTo": null,
        "plotArea.background.border.bottom.visible": true,
        "plotArea.background.border.left.visible": true,
        "plotArea.background.border.right.visible": true,
        "plotArea.background.border.stroke": "#d8d8d8",
        "plotArea.background.border.strokeWidth": 1,
        "plotArea.background.border.top.visible": true,
        "plotArea.background.color": "transparent",
        "plotArea.background.drawingEffect": "normal",
        "plotArea.background.gradientDirection": "vertical",
        "plotArea.background.visible": true,
        "plotArea.colorPalette": {
            "defaultValue": [
                "#748CB2",
                "#9CC677",
                "#EACF5E",
                "#F9AD79",
                "#D16A7C",
                "#8873A2",
                "#3A95B3",
                "#B6D949",
                "#FDD36C",
                "#F47958",
                "#A65084",
                "#0063B1",
                "#0DA841",
                "#FCB71D",
                "#F05620",
                "#B22D6E",
                "#3C368E",
                "#8FB2CF",
                "#95D4AB",
                "#EAE98F",
                "#F9BE92",
                "#EC9A99",
                "#BC98BD",
                "#1EB7B2",
                "#73C03C",
                "#F48323",
                "#EB271B",
                "#D9B5CA",
                "#AED1DA",
                "#DFECB2",
                "#FCDAB0",
                "#F5BCB4"
            ],
            "serializable": false
        },
        "plotArea.dataLabel.formatString": null,
        "plotArea.dataLabel.hideWhenOverlap": false,
        "plotArea.dataLabel.renderer": null,
        "plotArea.dataLabel.style.color": "#333333",
        "plotArea.dataLabel.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "plotArea.dataLabel.style.fontSize": "12px",
        "plotArea.dataLabel.style.fontStyle": "normal",
        "plotArea.dataLabel.style.fontWeight": "normal",
        "plotArea.dataLabel.type": "valueAxis",
        "plotArea.dataLabel.unitFormatType": "FinancialUnits",
        "plotArea.dataLabel.visible": false,
        "plotArea.dataPoint.stroke.color": "#000000",
        "plotArea.dataPoint.stroke.visible": false,
        "plotArea.dataPointStyle": null,
        "plotArea.dataPointStyleMode": "update",
        "plotArea.defaultOthersStyle.color": "#000000",
        "plotArea.drawingEffect": "normal",
        "plotArea.gridline.color": "#d8d8d8",
        "plotArea.gridline.size": 1,
        "plotArea.gridline.type": "line",
        "plotArea.gridline.visible": true,
        "plotArea.isFixedDataPointSize": false,
        "plotArea.markerRenderer": null,
        "plotArea.referenceLine.defaultStyle.color": "#666666",
        "plotArea.referenceLine.defaultStyle.label.background": "#ffffff",
        "plotArea.referenceLine.defaultStyle.label.color": "#333333",
        "plotArea.referenceLine.defaultStyle.label.fontFamily": "\"Open Sans\", Arial, Helvetica, sans-serif",
        "plotArea.referenceLine.defaultStyle.label.fontSize": "12px",
        "plotArea.referenceLine.defaultStyle.label.fontStyle": "normal",
        "plotArea.referenceLine.defaultStyle.label.fontWeight": "normal",
        "plotArea.referenceLine.defaultStyle.size": 1,
        "plotArea.referenceLine.defaultStyle.type": "dotted",
        "plotArea.referenceLine.line": null,
        "plotArea.scrollbar.border.color": "white",
        "plotArea.scrollbar.border.width": 0,
        "plotArea.scrollbar.spacing": 0,
        "plotArea.scrollbar.thumb.fill": "#e5e5e5",
        "plotArea.scrollbar.thumb.hoverFill": "#dedede",
        "plotArea.scrollbar.track.fill": "#f7f7f7",
        "plotArea.window.end": null,
        "plotArea.window.start": null,
        "propertyZone": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "title.layout.height": null,
        "tooltip.background.borderColor": "#cccccc",
        "tooltip.background.color": "#ffffff",
        "tooltip.bodyDimensionLabel.color": "#666666",
        "tooltip.bodyDimensionValue.color": "#666666",
        "tooltip.bodyMeasureLabel.color": "#666666",
        "tooltip.bodyMeasureValue.color": "#000000",
        "tooltip.closeButton.backgroundColor": "#ffffff",
        "tooltip.closeButton.borderColor": "#cccccc",
        "tooltip.footerLabel.color": "#000000",
        "tooltip.formatString": null,
        "tooltip.layinChart": true,
        "tooltip.postRender": null,
        "tooltip.preRender": {
            "defaultValue": null,
            "serializable": false
        },
        "tooltip.separationLine.color": "#a7a9ac",
        "tooltip.unitFormatType": "FinancialUnits",
        "tooltip.visible": true,
        "valueAxis.axisLine.size": 1,
        "valueAxis.axisLine.visible": true,
        "valueAxis.axisTick.visible": true,
        "valueAxis.color": "#6c6c6c",
        "valueAxis.label.formatString": null,
        "valueAxis.label.style.color": "#333333",
        "valueAxis.label.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "valueAxis.label.style.fontSize": "12px",
        "valueAxis.label.style.fontStyle": "normal",
        "valueAxis.label.style.fontWeight": "normal",
        "valueAxis.label.unitFormatType": "FinancialUnits",
        "valueAxis.label.visible": true,
        "valueAxis.layout.height": null,
        "valueAxis.layout.maxHeight": 0.25,
        "valueAxis.layout.maxWidth": 0.25,
        "valueAxis.layout.width": null,
        "valueAxis.title.applyAxislineColor": false,
        "valueAxis.title.style.color": "#000000",
        "valueAxis.title.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "valueAxis.title.style.fontSize": "14px",
        "valueAxis.title.style.fontStyle": "normal",
        "valueAxis.title.style.fontWeight": "bold",
        "valueAxis.title.text": null,
        "valueAxis.title.visible": false,
        "valueAxis.visible": true,
        "valueAxis2.axisLine.size": 1,
        "valueAxis2.axisLine.visible": true,
        "valueAxis2.axisTick.visible": true,
        "valueAxis2.color": "#6c6c6c",
        "valueAxis2.label.formatString": null,
        "valueAxis2.label.style.color": "#333333",
        "valueAxis2.label.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "valueAxis2.label.style.fontSize": "12px",
        "valueAxis2.label.style.fontStyle": "normal",
        "valueAxis2.label.style.fontWeight": "normal",
        "valueAxis2.label.unitFormatType": "FinancialUnits",
        "valueAxis2.label.visible": true,
        "valueAxis2.layout.height": null,
        "valueAxis2.layout.maxHeight": 0.25,
        "valueAxis2.layout.maxWidth": 0.25,
        "valueAxis2.layout.width": null,
        "valueAxis2.title.applyAxislineColor": false,
        "valueAxis2.title.style.color": "#000000",
        "valueAxis2.title.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "valueAxis2.title.style.fontSize": "14px",
        "valueAxis2.title.style.fontStyle": "normal",
        "valueAxis2.title.style.fontWeight": "bold",
        "valueAxis2.title.text": null,
        "valueAxis2.title.visible": false,
        "valueAxis2.visible": true
    },
    "info/100_mekko": {
        "categoryAxis.axisLine.size": 1,
        "categoryAxis.axisLine.visible": true,
        "categoryAxis.axisTick.visible": true,
        "categoryAxis.color": "#6c6c6c",
        "categoryAxis.hoverShadow.color": "#cccccc",
        "categoryAxis.label.angle": 90,
        "categoryAxis.label.hideSubLevels": false,
        "categoryAxis.label.rotation": "auto",
        "categoryAxis.label.style.color": "#333333",
        "categoryAxis.label.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "categoryAxis.label.style.fontSize": "12px",
        "categoryAxis.label.style.fontStyle": "normal",
        "categoryAxis.label.style.fontWeight": "normal",
        "categoryAxis.label.truncatedLabelRatio": 0.2,
        "categoryAxis.label.visible": true,
        "categoryAxis.labelRenderer": null,
        "categoryAxis.layout.height": null,
        "categoryAxis.layout.maxHeight": 0.3,
        "categoryAxis.layout.maxWidth": 0.3,
        "categoryAxis.layout.width": null,
        "categoryAxis.mouseDownShadow.color": "#808080",
        "categoryAxis.title.applyAxislineColor": false,
        "categoryAxis.title.style.color": "#000000",
        "categoryAxis.title.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "categoryAxis.title.style.fontSize": "14px",
        "categoryAxis.title.style.fontStyle": "normal",
        "categoryAxis.title.style.fontWeight": "bold",
        "categoryAxis.title.text": null,
        "categoryAxis.title.visible": false,
        "categoryAxis.visible": true,
        "feedingZone": {
            "defaultValue": [
                {
                    "bindDef": [
                        {
                            "id": null
                        }
                    ],
                    "bound": [
                        [
                            [
                                0,
                                0
                            ],
                            [
                                0,
                                0
                            ],
                            [
                                0,
                                0
                            ],
                            [
                                0,
                                0
                            ]
                        ]
                    ],
                    "name": null
                }
            ],
            "readonly": true,
            "serializable": false
        },
        "general.groupData": false,
        "interaction.behaviorType": null,
        "interaction.decorations": {
            "defaultValue": null,
            "serializable": false
        },
        "interaction.deselected.color": null,
        "interaction.deselected.opacity": 0.4,
        "interaction.deselected.stroke.color": "darken(20%)",
        "interaction.deselected.stroke.visible": false,
        "interaction.deselected.stroke.width": "1px",
        "interaction.hover.color": null,
        "interaction.hover.opacity": 1,
        "interaction.hover.stroke.color": "darken(20%)",
        "interaction.hover.stroke.visible": true,
        "interaction.hover.stroke.width": "2px",
        "interaction.noninteractiveMode": false,
        "interaction.selectability.axisLabelSelection": true,
        "interaction.selectability.legendSelection": true,
        "interaction.selectability.mode": "INCLUSIVE",
        "interaction.selectability.plotLassoSelection": true,
        "interaction.selectability.plotStdSelection": true,
        "interaction.selected.color": null,
        "interaction.selected.stroke.color": "darken(20%)",
        "interaction.selected.stroke.visible": true,
        "interaction.selected.stroke.width": "1px",
        "interaction.zoom.direction": "all",
        "interaction.zoom.enablement": "auto",
        "legend.drawingEffect": "normal",
        "legend.hoverShadow.color": "#cccccc",
        "legend.isScrollable": false,
        "legend.itemMargin": 0.5,
        "legend.label.style.color": "#000000",
        "legend.label.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "legend.label.style.fontSize": "12px",
        "legend.label.style.fontStyle": "normal",
        "legend.label.style.fontWeight": "normal",
        "legend.marker.shape": "squareWithRadius",
        "legend.marker.size": null,
        "legend.maxNumOfItems": null,
        "legend.mouseDownShadow.color": "#808080",
        "legend.order": {
            "defaultValue": null,
            "serializable": false
        },
        "legend.postRenderer": null,
        "legend.scrollbar.border.color": "white",
        "legend.scrollbar.border.width": 0,
        "legend.scrollbar.spacing": 0,
        "legend.scrollbar.thumb.fill": "#e5e5e5",
        "legend.scrollbar.thumb.hoverFill": "#dedede",
        "legend.scrollbar.track.fill": "#f7f7f7",
        "legend.showFullLabel": true,
        "legend.title.style.color": "#000000",
        "legend.title.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "legend.title.style.fontSize": "14px",
        "legend.title.style.fontStyle": "normal",
        "legend.title.style.fontWeight": "bold",
        "legend.title.text": null,
        "legend.title.visible": false,
        "legend.visible": true,
        "legendGroup.computedVisibility": {
            "defaultValue": true,
            "readonly": true,
            "serializable": false
        },
        "legendGroup.forceToShow": false,
        "legendGroup.layout.alignment": "topLeft",
        "legendGroup.layout.height": null,
        "legendGroup.layout.maxHeight": 0.25,
        "legendGroup.layout.maxWidth": 0.25,
        "legendGroup.layout.position": "right",
        "legendGroup.layout.respectPlotPosition": true,
        "legendGroup.layout.width": null,
        "legendGroup.renderTo": null,
        "plotArea.background.border.bottom.visible": true,
        "plotArea.background.border.left.visible": true,
        "plotArea.background.border.right.visible": true,
        "plotArea.background.border.stroke": "#d8d8d8",
        "plotArea.background.border.strokeWidth": 1,
        "plotArea.background.border.top.visible": true,
        "plotArea.background.color": "transparent",
        "plotArea.background.drawingEffect": "normal",
        "plotArea.background.gradientDirection": "vertical",
        "plotArea.background.visible": true,
        "plotArea.colorPalette": {
            "defaultValue": [
                "#748CB2",
                "#9CC677",
                "#EACF5E",
                "#F9AD79",
                "#D16A7C",
                "#8873A2",
                "#3A95B3",
                "#B6D949",
                "#FDD36C",
                "#F47958",
                "#A65084",
                "#0063B1",
                "#0DA841",
                "#FCB71D",
                "#F05620",
                "#B22D6E",
                "#3C368E",
                "#8FB2CF",
                "#95D4AB",
                "#EAE98F",
                "#F9BE92",
                "#EC9A99",
                "#BC98BD",
                "#1EB7B2",
                "#73C03C",
                "#F48323",
                "#EB271B",
                "#D9B5CA",
                "#AED1DA",
                "#DFECB2",
                "#FCDAB0",
                "#F5BCB4"
            ],
            "serializable": false
        },
        "plotArea.dataLabel.formatString": null,
        "plotArea.dataLabel.hideWhenOverlap": false,
        "plotArea.dataLabel.renderer": null,
        "plotArea.dataLabel.style.color": "#333333",
        "plotArea.dataLabel.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "plotArea.dataLabel.style.fontSize": "12px",
        "plotArea.dataLabel.style.fontStyle": "normal",
        "plotArea.dataLabel.style.fontWeight": "normal",
        "plotArea.dataLabel.type": "valueAxis",
        "plotArea.dataLabel.unitFormatType": "FinancialUnits",
        "plotArea.dataLabel.visible": false,
        "plotArea.dataPoint.stroke.color": "#000000",
        "plotArea.dataPoint.stroke.visible": false,
        "plotArea.dataPointStyle": null,
        "plotArea.dataPointStyleMode": "update",
        "plotArea.defaultOthersStyle.color": "#000000",
        "plotArea.drawingEffect": "normal",
        "plotArea.gridline.color": "#d8d8d8",
        "plotArea.gridline.size": 1,
        "plotArea.gridline.type": "line",
        "plotArea.gridline.visible": true,
        "plotArea.isFixedDataPointSize": false,
        "plotArea.markerRenderer": null,
        "plotArea.referenceLine.defaultStyle.color": "#666666",
        "plotArea.referenceLine.defaultStyle.label.background": "#ffffff",
        "plotArea.referenceLine.defaultStyle.label.color": "#333333",
        "plotArea.referenceLine.defaultStyle.label.fontFamily": "\"Open Sans\", Arial, Helvetica, sans-serif",
        "plotArea.referenceLine.defaultStyle.label.fontSize": "12px",
        "plotArea.referenceLine.defaultStyle.label.fontStyle": "normal",
        "plotArea.referenceLine.defaultStyle.label.fontWeight": "normal",
        "plotArea.referenceLine.defaultStyle.size": 1,
        "plotArea.referenceLine.defaultStyle.type": "dotted",
        "plotArea.referenceLine.line": null,
        "plotArea.scrollbar.border.color": "white",
        "plotArea.scrollbar.border.width": 0,
        "plotArea.scrollbar.spacing": 0,
        "plotArea.scrollbar.thumb.fill": "#e5e5e5",
        "plotArea.scrollbar.thumb.hoverFill": "#dedede",
        "plotArea.scrollbar.track.fill": "#f7f7f7",
        "plotArea.window.end": null,
        "plotArea.window.start": null,
        "propertyZone": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "title.layout.height": null,
        "tooltip.background.borderColor": "#cccccc",
        "tooltip.background.color": "#ffffff",
        "tooltip.bodyDimensionLabel.color": "#666666",
        "tooltip.bodyDimensionValue.color": "#666666",
        "tooltip.bodyMeasureLabel.color": "#666666",
        "tooltip.bodyMeasureValue.color": "#000000",
        "tooltip.closeButton.backgroundColor": "#ffffff",
        "tooltip.closeButton.borderColor": "#cccccc",
        "tooltip.footerLabel.color": "#000000",
        "tooltip.formatString": null,
        "tooltip.layinChart": true,
        "tooltip.postRender": null,
        "tooltip.preRender": {
            "defaultValue": null,
            "serializable": false
        },
        "tooltip.separationLine.color": "#a7a9ac",
        "tooltip.unitFormatType": "FinancialUnits",
        "tooltip.visible": true,
        "valueAxis.axisLine.size": 1,
        "valueAxis.axisLine.visible": true,
        "valueAxis.axisTick.visible": true,
        "valueAxis.color": "#6c6c6c",
        "valueAxis.label.formatString": null,
        "valueAxis.label.style.color": "#333333",
        "valueAxis.label.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "valueAxis.label.style.fontSize": "12px",
        "valueAxis.label.style.fontStyle": "normal",
        "valueAxis.label.style.fontWeight": "normal",
        "valueAxis.label.unitFormatType": "FinancialUnits",
        "valueAxis.label.visible": true,
        "valueAxis.layout.height": null,
        "valueAxis.layout.maxHeight": 0.25,
        "valueAxis.layout.maxWidth": 0.25,
        "valueAxis.layout.width": null,
        "valueAxis.title.applyAxislineColor": false,
        "valueAxis.title.style.color": "#000000",
        "valueAxis.title.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "valueAxis.title.style.fontSize": "14px",
        "valueAxis.title.style.fontStyle": "normal",
        "valueAxis.title.style.fontWeight": "bold",
        "valueAxis.title.text": null,
        "valueAxis.title.visible": false,
        "valueAxis.visible": true,
        "valueAxis2.axisLine.size": 1,
        "valueAxis2.axisLine.visible": true,
        "valueAxis2.axisTick.visible": true,
        "valueAxis2.color": "#6c6c6c",
        "valueAxis2.label.formatString": null,
        "valueAxis2.label.style.color": "#333333",
        "valueAxis2.label.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "valueAxis2.label.style.fontSize": "12px",
        "valueAxis2.label.style.fontStyle": "normal",
        "valueAxis2.label.style.fontWeight": "normal",
        "valueAxis2.label.unitFormatType": "FinancialUnits",
        "valueAxis2.label.visible": true,
        "valueAxis2.layout.height": null,
        "valueAxis2.layout.maxHeight": 0.25,
        "valueAxis2.layout.maxWidth": 0.25,
        "valueAxis2.layout.width": null,
        "valueAxis2.title.applyAxislineColor": false,
        "valueAxis2.title.style.color": "#000000",
        "valueAxis2.title.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "valueAxis2.title.style.fontSize": "14px",
        "valueAxis2.title.style.fontStyle": "normal",
        "valueAxis2.title.style.fontWeight": "bold",
        "valueAxis2.title.text": null,
        "valueAxis2.title.visible": false,
        "valueAxis2.visible": true
    },
    "info/100_stacked_bar": {
        "categoryAxis.axisLine.size": 1,
        "categoryAxis.axisLine.visible": true,
        "categoryAxis.axisTick.visible": true,
        "categoryAxis.color": "#6c6c6c",
        "categoryAxis.hoverShadow.color": "#cccccc",
        "categoryAxis.label.hideSubLevels": false,
        "categoryAxis.label.style.color": "#333333",
        "categoryAxis.label.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "categoryAxis.label.style.fontSize": "12px",
        "categoryAxis.label.style.fontStyle": "normal",
        "categoryAxis.label.style.fontWeight": "normal",
        "categoryAxis.label.visible": true,
        "categoryAxis.labelRenderer": null,
        "categoryAxis.layout.height": null,
        "categoryAxis.layout.maxHeight": 0.3,
        "categoryAxis.layout.maxWidth": 0.3,
        "categoryAxis.layout.width": null,
        "categoryAxis.mouseDownShadow.color": "#808080",
        "categoryAxis.title.applyAxislineColor": false,
        "categoryAxis.title.style.color": "#000000",
        "categoryAxis.title.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "categoryAxis.title.style.fontSize": "14px",
        "categoryAxis.title.style.fontStyle": "normal",
        "categoryAxis.title.style.fontWeight": "bold",
        "categoryAxis.title.text": null,
        "categoryAxis.title.visible": false,
        "categoryAxis.visible": true,
        "interaction.selectability.axisLabelSelection": true,
        "legend.marker.shape": "squareWithRadius",
        "plotArea.background.gradientDirection": "horizontal",
        "plotArea.dataLabel.type": "value",
        "plotArea.dataPointSize.max": 96,
        "plotArea.dataPointSize.min": 24,
        "plotArea.gap.barSpacing": 1,
        "plotArea.isFixedDataPointSize": false,
        "tooltip.formatString": "0.00%"
    },
    "info/100_stacked_column": {
        "categoryAxis.axisLine.size": 1,
        "categoryAxis.axisLine.visible": true,
        "categoryAxis.axisTick.visible": true,
        "categoryAxis.color": "#6c6c6c",
        "categoryAxis.hoverShadow.color": "#cccccc",
        "categoryAxis.label.angle": 90,
        "categoryAxis.label.hideSubLevels": false,
        "categoryAxis.label.rotation": "auto",
        "categoryAxis.label.style.color": "#333333",
        "categoryAxis.label.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "categoryAxis.label.style.fontSize": "12px",
        "categoryAxis.label.style.fontStyle": "normal",
        "categoryAxis.label.style.fontWeight": "normal",
        "categoryAxis.label.truncatedLabelRatio": 0.2,
        "categoryAxis.label.visible": true,
        "categoryAxis.labelRenderer": null,
        "categoryAxis.layout.height": null,
        "categoryAxis.layout.maxHeight": 0.3,
        "categoryAxis.layout.maxWidth": 0.3,
        "categoryAxis.layout.width": null,
        "categoryAxis.mouseDownShadow.color": "#808080",
        "categoryAxis.title.applyAxislineColor": false,
        "categoryAxis.title.style.color": "#000000",
        "categoryAxis.title.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "categoryAxis.title.style.fontSize": "14px",
        "categoryAxis.title.style.fontStyle": "normal",
        "categoryAxis.title.style.fontWeight": "bold",
        "categoryAxis.title.text": null,
        "categoryAxis.title.visible": false,
        "categoryAxis.visible": true,
        "interaction.selectability.axisLabelSelection": true,
        "legend.marker.shape": "squareWithRadius",
        "plotArea.dataLabel.type": "value",
        "plotArea.dataPointSize.max": 96,
        "plotArea.dataPointSize.min": 24,
        "plotArea.gap.barSpacing": 1,
        "plotArea.isFixedDataPointSize": false,
        "tooltip.formatString": "0.00%"
    },
    "info/DEFAULT": {
        "legend.drawingEffect": "normal",
        "legend.hoverShadow.color": "#cccccc",
        "legend.isScrollable": false,
        "legend.itemMargin": 0.5,
        "legend.label.style.color": "#000000",
        "legend.label.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "legend.label.style.fontSize": "12px",
        "legend.label.style.fontStyle": "normal",
        "legend.label.style.fontWeight": "normal",
        "legend.marker.size": null,
        "legend.maxNumOfItems": null,
        "legend.mouseDownShadow.color": "#808080",
        "legend.order": {
            "defaultValue": null,
            "serializable": false
        },
        "legend.postRenderer": null,
        "legend.scrollbar.border.color": "white",
        "legend.scrollbar.border.width": 0,
        "legend.scrollbar.spacing": 0,
        "legend.scrollbar.thumb.fill": "#e5e5e5",
        "legend.scrollbar.thumb.hoverFill": "#dedede",
        "legend.scrollbar.track.fill": "#f7f7f7",
        "legend.showFullLabel": true,
        "legend.title.style.color": "#000000",
        "legend.title.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "legend.title.style.fontSize": "14px",
        "legend.title.style.fontStyle": "normal",
        "legend.title.style.fontWeight": "bold",
        "legend.title.text": null,
        "legend.title.visible": false,
        "legend.visible": true,
        "legendGroup.computedVisibility": {
            "defaultValue": true,
            "readonly": true,
            "serializable": false
        },
        "legendGroup.forceToShow": false,
        "legendGroup.layout.alignment": "topLeft",
        "legendGroup.layout.height": null,
        "legendGroup.layout.maxHeight": 0.25,
        "legendGroup.layout.maxWidth": 0.25,
        "legendGroup.layout.position": "right",
        "legendGroup.layout.respectPlotPosition": true,
        "legendGroup.layout.width": null,
        "legendGroup.renderTo": null,
        "plotArea.colorPalette": {
            "defaultValue": [
                "#748CB2",
                "#9CC677",
                "#EACF5E",
                "#F9AD79",
                "#D16A7C",
                "#8873A2",
                "#3A95B3",
                "#B6D949",
                "#FDD36C",
                "#F47958",
                "#A65084",
                "#0063B1",
                "#0DA841",
                "#FCB71D",
                "#F05620",
                "#B22D6E",
                "#3C368E",
                "#8FB2CF",
                "#95D4AB",
                "#EAE98F",
                "#F9BE92",
                "#EC9A99",
                "#BC98BD",
                "#1EB7B2",
                "#73C03C",
                "#F48323",
                "#EB271B",
                "#D9B5CA",
                "#AED1DA",
                "#DFECB2",
                "#FCDAB0",
                "#F5BCB4"
            ],
            "serializable": false
        },
        "plotArea.dataPoint.stroke.color": "#000000",
        "plotArea.dataPoint.stroke.visible": false,
        "title.layout.height": null,
        "tooltip.background.borderColor": "#cccccc",
        "tooltip.background.color": "#ffffff",
        "tooltip.bodyDimensionLabel.color": "#666666",
        "tooltip.bodyDimensionValue.color": "#666666",
        "tooltip.bodyMeasureLabel.color": "#666666",
        "tooltip.bodyMeasureValue.color": "#000000",
        "tooltip.closeButton.backgroundColor": "#ffffff",
        "tooltip.closeButton.borderColor": "#cccccc",
        "tooltip.footerLabel.color": "#000000",
        "tooltip.formatString": null,
        "tooltip.layinChart": true,
        "tooltip.postRender": null,
        "tooltip.preRender": {
            "defaultValue": null,
            "serializable": false
        },
        "tooltip.separationLine.color": "#a7a9ac",
        "tooltip.unitFormatType": "FinancialUnits",
        "tooltip.visible": true
    },
    "info/area": {
        "categoryAxis.axisLine.size": 1,
        "categoryAxis.axisLine.visible": true,
        "categoryAxis.axisTick.visible": true,
        "categoryAxis.color": "#6c6c6c",
        "categoryAxis.hoverShadow.color": "#cccccc",
        "categoryAxis.label.angle": 90,
        "categoryAxis.label.hideSubLevels": false,
        "categoryAxis.label.rotation": "auto",
        "categoryAxis.label.style.color": "#333333",
        "categoryAxis.label.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "categoryAxis.label.style.fontSize": "12px",
        "categoryAxis.label.style.fontStyle": "normal",
        "categoryAxis.label.style.fontWeight": "normal",
        "categoryAxis.label.truncatedLabelRatio": 0.2,
        "categoryAxis.label.visible": true,
        "categoryAxis.labelRenderer": null,
        "categoryAxis.layout.height": null,
        "categoryAxis.layout.maxHeight": 0.3,
        "categoryAxis.layout.maxWidth": 0.3,
        "categoryAxis.layout.width": null,
        "categoryAxis.mouseDownShadow.color": "#808080",
        "categoryAxis.title.applyAxislineColor": false,
        "categoryAxis.title.style.color": "#000000",
        "categoryAxis.title.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "categoryAxis.title.style.fontSize": "14px",
        "categoryAxis.title.style.fontStyle": "normal",
        "categoryAxis.title.style.fontWeight": "bold",
        "categoryAxis.title.text": null,
        "categoryAxis.title.visible": false,
        "categoryAxis.visible": true,
        "feedingZone": {
            "defaultValue": [
                {
                    "bindDef": [
                        {
                            "id": null
                        }
                    ],
                    "bound": [
                        [
                            [
                                0,
                                0
                            ],
                            [
                                0,
                                0
                            ],
                            [
                                0,
                                0
                            ],
                            [
                                0,
                                0
                            ]
                        ]
                    ],
                    "name": null
                }
            ],
            "readonly": true,
            "serializable": false
        },
        "general.groupData": false,
        "interaction.behaviorType": null,
        "interaction.decorations": {
            "defaultValue": null,
            "serializable": false
        },
        "interaction.deselected.color": null,
        "interaction.deselected.opacity": 0.4,
        "interaction.hover.color": null,
        "interaction.hover.stroke.color": "darken(20%)",
        "interaction.hover.stroke.visible": true,
        "interaction.hover.stroke.width": "2px",
        "interaction.noninteractiveMode": false,
        "interaction.selectability.axisLabelSelection": true,
        "interaction.selectability.legendSelection": true,
        "interaction.selectability.mode": "INCLUSIVE",
        "interaction.selectability.plotLassoSelection": true,
        "interaction.selectability.plotStdSelection": true,
        "interaction.selected.color": null,
        "interaction.selected.stroke.color": "darken(20%)",
        "interaction.selected.stroke.visible": true,
        "interaction.selected.stroke.width": "1px",
        "interaction.zoom.direction": "all",
        "interaction.zoom.enablement": "auto",
        "legend.drawingEffect": "normal",
        "legend.hoverShadow.color": "#cccccc",
        "legend.isScrollable": false,
        "legend.itemMargin": 0.5,
        "legend.label.style.color": "#000000",
        "legend.label.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "legend.label.style.fontSize": "12px",
        "legend.label.style.fontStyle": "normal",
        "legend.label.style.fontWeight": "normal",
        "legend.marker.size": null,
        "legend.maxNumOfItems": null,
        "legend.mouseDownShadow.color": "#808080",
        "legend.order": {
            "defaultValue": null,
            "serializable": false
        },
        "legend.postRenderer": null,
        "legend.scrollbar.border.color": "white",
        "legend.scrollbar.border.width": 0,
        "legend.scrollbar.spacing": 0,
        "legend.scrollbar.thumb.fill": "#e5e5e5",
        "legend.scrollbar.thumb.hoverFill": "#dedede",
        "legend.scrollbar.track.fill": "#f7f7f7",
        "legend.showFullLabel": true,
        "legend.title.style.color": "#000000",
        "legend.title.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "legend.title.style.fontSize": "14px",
        "legend.title.style.fontStyle": "normal",
        "legend.title.style.fontWeight": "bold",
        "legend.title.text": null,
        "legend.title.visible": false,
        "legend.visible": true,
        "legendGroup.computedVisibility": {
            "defaultValue": true,
            "readonly": true,
            "serializable": false
        },
        "legendGroup.forceToShow": false,
        "legendGroup.layout.alignment": "topLeft",
        "legendGroup.layout.height": null,
        "legendGroup.layout.maxHeight": 0.25,
        "legendGroup.layout.maxWidth": 0.25,
        "legendGroup.layout.position": "right",
        "legendGroup.layout.respectPlotPosition": true,
        "legendGroup.layout.width": null,
        "legendGroup.renderTo": null,
        "plotArea.areaRenderer": null,
        "plotArea.background.border.bottom.visible": true,
        "plotArea.background.border.left.visible": true,
        "plotArea.background.border.right.visible": true,
        "plotArea.background.border.stroke": "#d8d8d8",
        "plotArea.background.border.strokeWidth": 1,
        "plotArea.background.border.top.visible": true,
        "plotArea.background.color": "transparent",
        "plotArea.background.drawingEffect": "normal",
        "plotArea.background.gradientDirection": "vertical",
        "plotArea.background.visible": true,
        "plotArea.colorPalette": {
            "defaultValue": [
                "#748CB2",
                "#9CC677",
                "#EACF5E",
                "#F9AD79",
                "#D16A7C",
                "#8873A2",
                "#3A95B3",
                "#B6D949",
                "#FDD36C",
                "#F47958",
                "#A65084",
                "#0063B1",
                "#0DA841",
                "#FCB71D",
                "#F05620",
                "#B22D6E",
                "#3C368E",
                "#8FB2CF",
                "#95D4AB",
                "#EAE98F",
                "#F9BE92",
                "#EC9A99",
                "#BC98BD",
                "#1EB7B2",
                "#73C03C",
                "#F48323",
                "#EB271B",
                "#D9B5CA",
                "#AED1DA",
                "#DFECB2",
                "#FCDAB0",
                "#F5BCB4"
            ],
            "serializable": false
        },
        "plotArea.dataLabel.formatString": null,
        "plotArea.dataLabel.hideWhenOverlap": false,
        "plotArea.dataLabel.renderer": null,
        "plotArea.dataLabel.style.color": "#333333",
        "plotArea.dataLabel.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "plotArea.dataLabel.style.fontSize": "12px",
        "plotArea.dataLabel.style.fontStyle": "normal",
        "plotArea.dataLabel.style.fontWeight": "normal",
        "plotArea.dataLabel.unitFormatType": "FinancialUnits",
        "plotArea.dataLabel.visible": false,
        "plotArea.dataPoint.stroke.color": "#000000",
        "plotArea.dataPoint.stroke.visible": false,
        "plotArea.drawingEffect": "normal",
        "plotArea.gridline.color": "#d8d8d8",
        "plotArea.gridline.size": 1,
        "plotArea.gridline.type": "line",
        "plotArea.gridline.visible": true,
        "plotArea.gridline.zeroLine.color": null,
        "plotArea.gridline.zeroLine.highlight": true,
        "plotArea.gridline.zeroLine.unhighlightAxis": true,
        "plotArea.isFixedDataPointSize": false,
        "plotArea.markerRenderer": null,
        "plotArea.primaryScale.autoMaxValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.primaryScale.autoMinValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.primaryScale.fixedRange": {
            "defaultValue": false,
            "serializable": false
        },
        "plotArea.primaryScale.maxValue": {
            "defaultValue": null,
            "serializable": false
        },
        "plotArea.primaryScale.minValue": {
            "defaultValue": null,
            "serializable": false
        },
        "plotArea.referenceLine.defaultStyle.color": "#666666",
        "plotArea.referenceLine.defaultStyle.label.background": "#ffffff",
        "plotArea.referenceLine.defaultStyle.label.color": "#333333",
        "plotArea.referenceLine.defaultStyle.label.fontFamily": "\"Open Sans\", Arial, Helvetica, sans-serif",
        "plotArea.referenceLine.defaultStyle.label.fontSize": "12px",
        "plotArea.referenceLine.defaultStyle.label.fontStyle": "normal",
        "plotArea.referenceLine.defaultStyle.label.fontWeight": "normal",
        "plotArea.referenceLine.defaultStyle.size": 1,
        "plotArea.referenceLine.defaultStyle.type": "dotted",
        "plotArea.referenceLine.line": null,
        "plotArea.scrollbar.border.color": "white",
        "plotArea.scrollbar.border.width": 0,
        "plotArea.scrollbar.spacing": 0,
        "plotArea.scrollbar.thumb.fill": "#e5e5e5",
        "plotArea.scrollbar.thumb.hoverFill": "#dedede",
        "plotArea.scrollbar.track.fill": "#f7f7f7",
        "propertyZone": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "title.layout.height": null,
        "tooltip.background.borderColor": "#cccccc",
        "tooltip.background.color": "#ffffff",
        "tooltip.bodyDimensionLabel.color": "#666666",
        "tooltip.bodyDimensionValue.color": "#666666",
        "tooltip.bodyMeasureLabel.color": "#666666",
        "tooltip.bodyMeasureValue.color": "#000000",
        "tooltip.closeButton.backgroundColor": "#ffffff",
        "tooltip.closeButton.borderColor": "#cccccc",
        "tooltip.footerLabel.color": "#000000",
        "tooltip.formatString": null,
        "tooltip.layinChart": true,
        "tooltip.postRender": null,
        "tooltip.preRender": {
            "defaultValue": null,
            "serializable": false
        },
        "tooltip.separationLine.color": "#a7a9ac",
        "tooltip.unitFormatType": "FinancialUnits",
        "tooltip.visible": true,
        "valueAxis.axisLine.size": 1,
        "valueAxis.axisLine.visible": true,
        "valueAxis.axisTick.visible": true,
        "valueAxis.color": "#6c6c6c",
        "valueAxis.label.formatString": null,
        "valueAxis.label.style.color": "#333333",
        "valueAxis.label.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "valueAxis.label.style.fontSize": "12px",
        "valueAxis.label.style.fontStyle": "normal",
        "valueAxis.label.style.fontWeight": "normal",
        "valueAxis.label.unitFormatType": "FinancialUnits",
        "valueAxis.label.visible": true,
        "valueAxis.layout.height": null,
        "valueAxis.layout.maxHeight": 0.25,
        "valueAxis.layout.maxWidth": 0.25,
        "valueAxis.layout.width": null,
        "valueAxis.title.applyAxislineColor": false,
        "valueAxis.title.style.color": "#000000",
        "valueAxis.title.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "valueAxis.title.style.fontSize": "14px",
        "valueAxis.title.style.fontStyle": "normal",
        "valueAxis.title.style.fontWeight": "bold",
        "valueAxis.title.text": null,
        "valueAxis.title.visible": false,
        "valueAxis.visible": true
    },
    "info/bar": {
        "categoryAxis.axisLine.size": 1,
        "categoryAxis.axisLine.visible": true,
        "categoryAxis.axisTick.visible": true,
        "categoryAxis.color": "#6c6c6c",
        "categoryAxis.hoverShadow.color": "#cccccc",
        "categoryAxis.label.hideSubLevels": false,
        "categoryAxis.label.style.color": "#333333",
        "categoryAxis.label.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "categoryAxis.label.style.fontSize": "12px",
        "categoryAxis.label.style.fontStyle": "normal",
        "categoryAxis.label.style.fontWeight": "normal",
        "categoryAxis.label.visible": true,
        "categoryAxis.labelRenderer": null,
        "categoryAxis.layout.height": null,
        "categoryAxis.layout.maxHeight": 0.3,
        "categoryAxis.layout.maxWidth": 0.3,
        "categoryAxis.layout.width": null,
        "categoryAxis.mouseDownShadow.color": "#808080",
        "categoryAxis.title.applyAxislineColor": false,
        "categoryAxis.title.style.color": "#000000",
        "categoryAxis.title.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "categoryAxis.title.style.fontSize": "14px",
        "categoryAxis.title.style.fontStyle": "normal",
        "categoryAxis.title.style.fontWeight": "bold",
        "categoryAxis.title.text": null,
        "categoryAxis.title.visible": false,
        "categoryAxis.visible": true,
        "interaction.selectability.axisLabelSelection": true,
        "legend.marker.shape": "squareWithRadius",
        "plotArea.background.gradientDirection": "horizontal",
        "plotArea.dataLabel.position": "outsideFirst",
        "plotArea.dataLabel.type": "value",
        "plotArea.dataPoint.savingMode": false,
        "plotArea.dataPointSize.max": 96,
        "plotArea.dataPointSize.min": 24,
        "plotArea.gap.barSpacing": 1,
        "plotArea.gap.groupSpacing": 1,
        "plotArea.gap.innerGroupSpacing": 0.125,
        "plotArea.isFixedDataPointSize": false,
        "plotArea.primaryScale.autoMaxValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.primaryScale.autoMinValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.primaryScale.fixedRange": {
            "defaultValue": false,
            "serializable": false
        },
        "plotArea.primaryScale.maxValue": {
            "defaultValue": null,
            "serializable": false
        },
        "plotArea.primaryScale.minValue": {
            "defaultValue": null,
            "serializable": false
        }
    },
    "info/bubble": {
        "interaction.enableKeyboard": false,
        "interaction.noninteractiveMode": false,
        "interaction.selectability.axisLabelSelection": true,
        "interaction.zoom.enablement": "auto",
        "legendGroup.forceToShow": false,
        "legendGroup.layout.height": null,
        "legendGroup.layout.width": null,
        "plotArea.background.border.bottom.visible": true,
        "plotArea.background.border.left.visible": true,
        "plotArea.background.border.right.visible": true,
        "plotArea.background.border.top.visible": true,
        "plotArea.dataLabel.respectShapeWidth": false,
        "plotArea.dataLabel.type": "bubbleWidth",
        "plotArea.minMarkerSize": null,
        "plotArea.secondaryScale.autoMaxValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.secondaryScale.autoMinValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.secondaryScale.fixedRange": {
            "defaultValue": false,
            "serializable": false
        },
        "plotArea.secondaryScale.maxValue": {
            "defaultValue": null,
            "serializable": false
        },
        "plotArea.secondaryScale.minValue": {
            "defaultValue": null,
            "serializable": false
        },
        "plotArea.showNegativeValues": true,
        "plotArea.window.end": null,
        "plotArea.window.start": null,
        "sizeLegend.drawingEffect": "normal",
        "sizeLegend.formatString": null,
        "sizeLegend.label.style.color": "#000000",
        "sizeLegend.label.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "sizeLegend.label.style.fontSize": "12px",
        "sizeLegend.label.style.fontStyle": "normal",
        "sizeLegend.label.style.fontWeight": "normal",
        "sizeLegend.title.style.color": "#000000",
        "sizeLegend.title.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "sizeLegend.title.style.fontSize": "14px",
        "sizeLegend.title.style.fontStyle": "normal",
        "sizeLegend.title.style.fontWeight": "bold",
        "sizeLegend.title.text": null,
        "sizeLegend.title.visible": false,
        "sizeLegend.unitFormatType": "FinancialUnits",
        "sizeLegend.visible": true,
        "title.layout.height": null,
        "valueAxis.label.formatString": null,
        "valueAxis.layout.height": null,
        "valueAxis.layout.width": null,
        "valueAxis2.axisLine.size": 1,
        "valueAxis2.axisLine.visible": true,
        "valueAxis2.axisTick.visible": true,
        "valueAxis2.color": "#6c6c6c",
        "valueAxis2.label.formatString": null,
        "valueAxis2.label.style.color": "#333333",
        "valueAxis2.label.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "valueAxis2.label.style.fontSize": "12px",
        "valueAxis2.label.style.fontStyle": "normal",
        "valueAxis2.label.style.fontWeight": "normal",
        "valueAxis2.label.unitFormatType": "FinancialUnits",
        "valueAxis2.label.visible": true,
        "valueAxis2.layout.height": null,
        "valueAxis2.layout.maxHeight": 0.25,
        "valueAxis2.layout.maxWidth": 0.25,
        "valueAxis2.layout.width": null,
        "valueAxis2.title.applyAxislineColor": false,
        "valueAxis2.title.style.color": "#000000",
        "valueAxis2.title.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "valueAxis2.title.style.fontSize": "14px",
        "valueAxis2.title.style.fontStyle": "normal",
        "valueAxis2.title.style.fontWeight": "bold",
        "valueAxis2.title.text": null,
        "valueAxis2.title.visible": false,
        "valueAxis2.visible": true
    },
    "info/bullet": {
        "categoryAxis.layout.height": null,
        "categoryAxis.layout.width": null,
        "interaction.enableKeyboard": false,
        "interaction.noninteractiveMode": false,
        "interaction.zoom.direction": "all",
        "interaction.zoom.enablement": "auto",
        "legendGroup.forceToShow": false,
        "legendGroup.layout.height": null,
        "legendGroup.layout.width": null,
        "plotArea.background.border.bottom.visible": false,
        "plotArea.background.border.left.visible": true,
        "plotArea.background.border.right.visible": false,
        "plotArea.background.border.top.visible": true,
        "plotArea.dataPointSize.max": 96,
        "plotArea.dataPointSize.min": 24,
        "plotArea.isFixedDataPointSize": false,
        "plotArea.window.end": null,
        "plotArea.window.start": null,
        "title.layout.height": null,
        "valueAxis.layout.height": null,
        "valueAxis.layout.width": null
    },
    "info/column": {
        "categoryAxis.axisLine.size": 1,
        "categoryAxis.axisLine.visible": true,
        "categoryAxis.axisTick.visible": true,
        "categoryAxis.color": "#6c6c6c",
        "categoryAxis.hoverShadow.color": "#cccccc",
        "categoryAxis.label.angle": 90,
        "categoryAxis.label.hideSubLevels": false,
        "categoryAxis.label.rotation": "auto",
        "categoryAxis.label.style.color": "#333333",
        "categoryAxis.label.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "categoryAxis.label.style.fontSize": "12px",
        "categoryAxis.label.style.fontStyle": "normal",
        "categoryAxis.label.style.fontWeight": "normal",
        "categoryAxis.label.truncatedLabelRatio": 0.2,
        "categoryAxis.label.visible": true,
        "categoryAxis.labelRenderer": null,
        "categoryAxis.layout.height": null,
        "categoryAxis.layout.maxHeight": 0.3,
        "categoryAxis.layout.maxWidth": 0.3,
        "categoryAxis.layout.width": null,
        "categoryAxis.mouseDownShadow.color": "#808080",
        "categoryAxis.title.applyAxislineColor": false,
        "categoryAxis.title.style.color": "#000000",
        "categoryAxis.title.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "categoryAxis.title.style.fontSize": "14px",
        "categoryAxis.title.style.fontStyle": "normal",
        "categoryAxis.title.style.fontWeight": "bold",
        "categoryAxis.title.text": null,
        "categoryAxis.title.visible": false,
        "categoryAxis.visible": true,
        "interaction.selectability.axisLabelSelection": true,
        "legend.marker.shape": "squareWithRadius",
        "plotArea.dataLabel.position": "outside",
        "plotArea.dataPoint.savingMode": false,
        "plotArea.dataPointSize.max": 96,
        "plotArea.dataPointSize.min": 24,
        "plotArea.gap.barSpacing": 1,
        "plotArea.gap.groupSpacing": 1,
        "plotArea.gap.innerGroupSpacing": 0.125,
        "plotArea.isFixedDataPointSize": false,
        "plotArea.primaryScale.autoMaxValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.primaryScale.autoMinValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.primaryScale.fixedRange": {
            "defaultValue": false,
            "serializable": false
        },
        "plotArea.primaryScale.maxValue": {
            "defaultValue": null,
            "serializable": false
        },
        "plotArea.primaryScale.minValue": {
            "defaultValue": null,
            "serializable": false
        }
    },
    "info/combination": {
        "categoryAxis.axisLine.size": 1,
        "categoryAxis.axisLine.visible": true,
        "categoryAxis.axisTick.visible": true,
        "categoryAxis.color": "#6c6c6c",
        "categoryAxis.hoverShadow.color": "#cccccc",
        "categoryAxis.label.angle": 90,
        "categoryAxis.label.hideSubLevels": false,
        "categoryAxis.label.rotation": "auto",
        "categoryAxis.label.style.color": "#333333",
        "categoryAxis.label.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "categoryAxis.label.style.fontSize": "12px",
        "categoryAxis.label.style.fontStyle": "normal",
        "categoryAxis.label.style.fontWeight": "normal",
        "categoryAxis.label.truncatedLabelRatio": 0.2,
        "categoryAxis.label.visible": true,
        "categoryAxis.labelRenderer": null,
        "categoryAxis.layout.height": null,
        "categoryAxis.layout.maxHeight": 0.3,
        "categoryAxis.layout.maxWidth": 0.3,
        "categoryAxis.layout.width": null,
        "categoryAxis.mouseDownShadow.color": "#808080",
        "categoryAxis.title.applyAxislineColor": false,
        "categoryAxis.title.style.color": "#000000",
        "categoryAxis.title.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "categoryAxis.title.style.fontSize": "14px",
        "categoryAxis.title.style.fontStyle": "normal",
        "categoryAxis.title.style.fontWeight": "bold",
        "categoryAxis.title.text": null,
        "categoryAxis.title.visible": false,
        "categoryAxis.visible": true,
        "interaction.selectability.axisLabelSelection": true,
        "legend.groupByShape": false,
        "legend.marker.shape": "squareWithRadius",
        "plotArea.dataPointSize.max": 96,
        "plotArea.dataPointSize.min": 24,
        "plotArea.dataShape.primaryAxis": [
            "bar",
            "line",
            "line"
        ],
        "plotArea.gap.barSpacing": 1,
        "plotArea.gap.groupSpacing": 1,
        "plotArea.gap.innerGroupSpacing": 0.125,
        "plotArea.isFixedDataPointSize": false,
        "plotArea.line.lineRenderer": null,
        "plotArea.line.marker.shape": "circle",
        "plotArea.line.marker.size": 6,
        "plotArea.line.marker.visible": true,
        "plotArea.line.style": null,
        "plotArea.line.visible": true,
        "plotArea.line.width": 2,
        "plotArea.primaryScale.autoMaxValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.primaryScale.autoMinValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.primaryScale.fixedRange": {
            "defaultValue": false,
            "serializable": false
        },
        "plotArea.primaryScale.maxValue": {
            "defaultValue": null,
            "serializable": false
        },
        "plotArea.primaryScale.minValue": {
            "defaultValue": null,
            "serializable": false
        }
    },
    "info/donut": {
        "interaction.enableKeyboard": false,
        "interaction.noninteractiveMode": false,
        "legendGroup.forceToShow": false,
        "legendGroup.layout.height": null,
        "legendGroup.layout.width": null,
        "plotArea.background.border.bottom.visible": false,
        "plotArea.background.border.left.visible": false,
        "plotArea.background.border.right.visible": false,
        "plotArea.background.border.top.visible": false,
        "plotArea.highlight.centerName.style.color": null,
        "plotArea.highlight.centerName.style.fontFamily": "Arial, Helvetica, sans-serif",
        "plotArea.highlight.centerName.style.fontSize": "14px",
        "plotArea.highlight.centerName.style.fontStyle": "normal",
        "plotArea.highlight.centerName.style.fontWeight": "normal",
        "plotArea.highlight.centerName.visible": true,
        "plotArea.highlight.centerValue.style.color": null,
        "plotArea.highlight.centerValue.style.fontFamily": "Arial, Helvetica, sans-serif",
        "plotArea.highlight.centerValue.style.fontSize": "22px",
        "plotArea.highlight.centerValue.style.fontStyle": "normal",
        "plotArea.highlight.centerValue.style.fontWeight": "normal",
        "plotArea.highlight.centerValue.visible": true,
        "plotArea.highlight.contextInfos": [],
        "plotArea.highlight.highlightContext": [],
        "plotArea.highlight.unhighlightSliceColor": "#dddddd",
        "plotArea.innerRadiusRatio": 0.5,
        "plotArea.sliceRenderer": null,
        "title.layout.height": null
    },
    "info/dual_bar": {
        "categoryAxis.layout.height": null,
        "categoryAxis.layout.width": null,
        "legend.marker.shape": "squareWithRadius",
        "plotArea.background.gradientDirection": "horizontal",
        "plotArea.dataLabel.position": "outsideFirst",
        "plotArea.dataLabel.type": "value",
        "plotArea.dataPoint.savingMode": false,
        "plotArea.dataPointSize.max": 96,
        "plotArea.dataPointSize.min": 24,
        "plotArea.gap.groupSpacing": 1,
        "plotArea.gap.innerGroupSpacing": 0.125,
        "plotArea.isFixedDataPointSize": false,
        "plotArea.primaryScale.autoMaxValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.primaryScale.autoMinValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.primaryScale.fixedRange": {
            "defaultValue": false,
            "serializable": false
        },
        "plotArea.primaryScale.maxValue": {
            "defaultValue": null,
            "serializable": false
        },
        "plotArea.primaryScale.minValue": {
            "defaultValue": null,
            "serializable": false
        },
        "plotArea.secondaryScale.autoMaxValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.secondaryScale.autoMinValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.secondaryScale.fixedRange": {
            "defaultValue": false,
            "serializable": false
        },
        "plotArea.secondaryScale.maxValue": {
            "defaultValue": null,
            "serializable": false
        },
        "plotArea.secondaryScale.minValue": {
            "defaultValue": null,
            "serializable": false
        },
        "valueAxis2.layout.height": null,
        "valueAxis2.layout.width": null
    },
    "info/dual_column": {
        "categoryAxis.label.angle": 90,
        "categoryAxis.label.rotation": "auto",
        "categoryAxis.label.truncatedLabelRatio": 0.2,
        "categoryAxis.layout.height": null,
        "categoryAxis.layout.width": null,
        "legend.marker.shape": "squareWithRadius",
        "plotArea.dataLabel.position": "outside",
        "plotArea.dataPoint.savingMode": false,
        "plotArea.dataPointSize.max": 96,
        "plotArea.dataPointSize.min": 24,
        "plotArea.gap.groupSpacing": 1,
        "plotArea.gap.innerGroupSpacing": 0.125,
        "plotArea.isFixedDataPointSize": false,
        "plotArea.primaryScale.autoMaxValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.primaryScale.autoMinValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.primaryScale.fixedRange": {
            "defaultValue": false,
            "serializable": false
        },
        "plotArea.primaryScale.maxValue": {
            "defaultValue": null,
            "serializable": false
        },
        "plotArea.primaryScale.minValue": {
            "defaultValue": null,
            "serializable": false
        },
        "plotArea.secondaryScale.autoMaxValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.secondaryScale.autoMinValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.secondaryScale.fixedRange": {
            "defaultValue": false,
            "serializable": false
        },
        "plotArea.secondaryScale.maxValue": {
            "defaultValue": null,
            "serializable": false
        },
        "plotArea.secondaryScale.minValue": {
            "defaultValue": null,
            "serializable": false
        },
        "valueAxis2.layout.height": null,
        "valueAxis2.layout.width": null
    },
    "info/dual_combination": {
        "categoryAxis.label.angle": 90,
        "categoryAxis.label.rotation": "auto",
        "categoryAxis.label.truncatedLabelRatio": 0.2,
        "categoryAxis.layout.height": null,
        "categoryAxis.layout.width": null,
        "legend.groupByShape": false,
        "legend.marker.shape": "squareWithRadius",
        "plotArea.dataPointSize.max": 96,
        "plotArea.dataPointSize.min": 24,
        "plotArea.dataShape.primaryAxis": [
            "bar",
            "line",
            "line"
        ],
        "plotArea.dataShape.secondaryAxis": [
            "line",
            "line",
            "line"
        ],
        "plotArea.gap.barSpacing": 1,
        "plotArea.gap.groupSpacing": 1,
        "plotArea.gap.innerGroupSpacing": 0.125,
        "plotArea.isFixedDataPointSize": false,
        "plotArea.line.lineRenderer": null,
        "plotArea.line.marker.shape": "circle",
        "plotArea.line.marker.size": 6,
        "plotArea.line.marker.visible": true,
        "plotArea.line.style": null,
        "plotArea.line.visible": true,
        "plotArea.line.width": 2,
        "plotArea.primaryScale.autoMaxValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.primaryScale.autoMinValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.primaryScale.fixedRange": {
            "defaultValue": false,
            "serializable": false
        },
        "plotArea.primaryScale.maxValue": {
            "defaultValue": null,
            "serializable": false
        },
        "plotArea.primaryScale.minValue": {
            "defaultValue": null,
            "serializable": false
        },
        "plotArea.secondaryScale.autoMaxValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.secondaryScale.autoMinValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.secondaryScale.fixedRange": {
            "defaultValue": false,
            "serializable": false
        },
        "plotArea.secondaryScale.maxValue": {
            "defaultValue": null,
            "serializable": false
        },
        "plotArea.secondaryScale.minValue": {
            "defaultValue": null,
            "serializable": false
        },
        "valueAxis.color": "#6c6c6c",
        "valueAxis.title.applyAxislineColor": false,
        "valueAxis2.layout.height": null,
        "valueAxis2.layout.width": null
    },
    "info/dual_horizontal_combination": {
        "categoryAxis.layout.height": null,
        "categoryAxis.layout.width": null,
        "legend.groupByShape": false,
        "legend.marker.shape": "squareWithRadius",
        "plotArea.background.gradientDirection": "horizontal",
        "plotArea.dataPointSize.max": 96,
        "plotArea.dataPointSize.min": 24,
        "plotArea.dataShape.primaryAxis": [
            "bar",
            "line",
            "line"
        ],
        "plotArea.dataShape.secondaryAxis": [
            "line",
            "line",
            "line"
        ],
        "plotArea.gap.barSpacing": 1,
        "plotArea.gap.groupSpacing": 1,
        "plotArea.gap.innerGroupSpacing": 0.125,
        "plotArea.isFixedDataPointSize": false,
        "plotArea.line.lineRenderer": null,
        "plotArea.line.marker.shape": "circle",
        "plotArea.line.marker.size": 6,
        "plotArea.line.marker.visible": true,
        "plotArea.line.style": null,
        "plotArea.line.visible": true,
        "plotArea.line.width": 2,
        "plotArea.primaryScale.autoMaxValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.primaryScale.autoMinValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.primaryScale.fixedRange": {
            "defaultValue": false,
            "serializable": false
        },
        "plotArea.primaryScale.maxValue": {
            "defaultValue": null,
            "serializable": false
        },
        "plotArea.primaryScale.minValue": {
            "defaultValue": null,
            "serializable": false
        },
        "plotArea.secondaryScale.autoMaxValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.secondaryScale.autoMinValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.secondaryScale.fixedRange": {
            "defaultValue": false,
            "serializable": false
        },
        "plotArea.secondaryScale.maxValue": {
            "defaultValue": null,
            "serializable": false
        },
        "plotArea.secondaryScale.minValue": {
            "defaultValue": null,
            "serializable": false
        },
        "valueAxis.color": "#6c6c6c",
        "valueAxis.title.applyAxislineColor": false,
        "valueAxis2.layout.height": null,
        "valueAxis2.layout.width": null
    },
    "info/dual_horizontal_line": {
        "categoryAxis.layout.height": null,
        "categoryAxis.layout.width": null,
        "plotArea.isFixedDataPointSize": false,
        "plotArea.lineRenderer": null,
        "plotArea.lineStyle": null,
        "plotArea.lineVisible": true,
        "plotArea.marker.displayMode": "manual",
        "plotArea.marker.shape": "circle",
        "plotArea.marker.size": 6,
        "plotArea.marker.visible": true,
        "plotArea.primaryScale.autoMaxValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.primaryScale.autoMinValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.primaryScale.fixedRange": {
            "defaultValue": false,
            "serializable": false
        },
        "plotArea.primaryScale.maxValue": {
            "defaultValue": null,
            "serializable": false
        },
        "plotArea.primaryScale.minValue": {
            "defaultValue": null,
            "serializable": false
        },
        "plotArea.secondaryScale.autoMaxValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.secondaryScale.autoMinValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.secondaryScale.fixedRange": {
            "defaultValue": false,
            "serializable": false
        },
        "plotArea.secondaryScale.maxValue": {
            "defaultValue": null,
            "serializable": false
        },
        "plotArea.secondaryScale.minValue": {
            "defaultValue": null,
            "serializable": false
        },
        "plotArea.width": 2,
        "valueAxis2.layout.height": null,
        "valueAxis2.layout.width": null
    },
    "info/dual_horizontal_stacked_combination": {
        "categoryAxis.layout.height": null,
        "categoryAxis.layout.width": null,
        "legend.groupByShape": false,
        "legend.marker.shape": "squareWithRadius",
        "plotArea.background.gradientDirection": "horizontal",
        "plotArea.dataPointSize.max": 96,
        "plotArea.dataPointSize.min": 24,
        "plotArea.dataShape.primaryAxis": [
            "bar",
            "line",
            "line"
        ],
        "plotArea.dataShape.secondaryAxis": [
            "bar",
            "line",
            "line"
        ],
        "plotArea.gap.barSpacing": 1,
        "plotArea.gap.groupSpacing": 1,
        "plotArea.gap.innerGroupSpacing": 0.125,
        "plotArea.isFixedDataPointSize": false,
        "plotArea.line.lineRenderer": null,
        "plotArea.line.marker.shape": "circle",
        "plotArea.line.marker.size": 6,
        "plotArea.line.marker.visible": true,
        "plotArea.line.style": null,
        "plotArea.line.visible": true,
        "plotArea.line.width": 2,
        "plotArea.primaryScale.autoMaxValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.primaryScale.autoMinValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.primaryScale.fixedRange": {
            "defaultValue": false,
            "serializable": false
        },
        "plotArea.primaryScale.maxValue": {
            "defaultValue": null,
            "serializable": false
        },
        "plotArea.primaryScale.minValue": {
            "defaultValue": null,
            "serializable": false
        },
        "plotArea.secondaryScale.autoMaxValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.secondaryScale.autoMinValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.secondaryScale.fixedRange": {
            "defaultValue": false,
            "serializable": false
        },
        "plotArea.secondaryScale.maxValue": {
            "defaultValue": null,
            "serializable": false
        },
        "plotArea.secondaryScale.minValue": {
            "defaultValue": null,
            "serializable": false
        },
        "valueAxis.color": "#6c6c6c",
        "valueAxis.title.applyAxislineColor": false,
        "valueAxis2.layout.height": null,
        "valueAxis2.layout.width": null
    },
    "info/dual_line": {
        "categoryAxis.label.angle": 90,
        "categoryAxis.label.rotation": "auto",
        "categoryAxis.label.truncatedLabelRatio": 0.2,
        "categoryAxis.layout.height": null,
        "categoryAxis.layout.width": null,
        "plotArea.isFixedDataPointSize": false,
        "plotArea.lineRenderer": null,
        "plotArea.lineStyle": null,
        "plotArea.lineVisible": true,
        "plotArea.marker.displayMode": "manual",
        "plotArea.marker.shape": "circle",
        "plotArea.marker.size": 6,
        "plotArea.marker.visible": true,
        "plotArea.primaryScale.autoMaxValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.primaryScale.autoMinValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.primaryScale.fixedRange": {
            "defaultValue": false,
            "serializable": false
        },
        "plotArea.primaryScale.maxValue": {
            "defaultValue": null,
            "serializable": false
        },
        "plotArea.primaryScale.minValue": {
            "defaultValue": null,
            "serializable": false
        },
        "plotArea.secondaryScale.autoMaxValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.secondaryScale.autoMinValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.secondaryScale.fixedRange": {
            "defaultValue": false,
            "serializable": false
        },
        "plotArea.secondaryScale.maxValue": {
            "defaultValue": null,
            "serializable": false
        },
        "plotArea.secondaryScale.minValue": {
            "defaultValue": null,
            "serializable": false
        },
        "plotArea.width": 2,
        "valueAxis2.layout.height": null,
        "valueAxis2.layout.width": null
    },
    "info/dual_stacked_bar": {
        "categoryAxis.layout.height": null,
        "categoryAxis.layout.width": null,
        "legend.marker.shape": "squareWithRadius",
        "plotArea.background.gradientDirection": "horizontal",
        "plotArea.dataLabel.showTotal": false,
        "plotArea.dataPointSize.max": 96,
        "plotArea.dataPointSize.min": 24,
        "plotArea.gap.groupSpacing": 1,
        "plotArea.gap.innerGroupSpacing": 0.125,
        "plotArea.isFixedDataPointSize": false,
        "plotArea.primaryScale.autoMaxValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.primaryScale.autoMinValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.primaryScale.fixedRange": {
            "defaultValue": false,
            "serializable": false
        },
        "plotArea.primaryScale.maxValue": {
            "defaultValue": null,
            "serializable": false
        },
        "plotArea.primaryScale.minValue": {
            "defaultValue": null,
            "serializable": false
        },
        "plotArea.secondaryScale.autoMaxValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.secondaryScale.autoMinValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.secondaryScale.fixedRange": {
            "defaultValue": false,
            "serializable": false
        },
        "plotArea.secondaryScale.maxValue": {
            "defaultValue": null,
            "serializable": false
        },
        "plotArea.secondaryScale.minValue": {
            "defaultValue": null,
            "serializable": false
        },
        "valueAxis2.layout.height": null,
        "valueAxis2.layout.width": null
    },
    "info/dual_stacked_column": {
        "categoryAxis.label.angle": 90,
        "categoryAxis.label.rotation": "auto",
        "categoryAxis.label.truncatedLabelRatio": 0.2,
        "categoryAxis.layout.height": null,
        "categoryAxis.layout.width": null,
        "legend.marker.shape": "squareWithRadius",
        "plotArea.dataLabel.showTotal": false,
        "plotArea.dataPointSize.max": 96,
        "plotArea.dataPointSize.min": 24,
        "plotArea.gap.groupSpacing": 1,
        "plotArea.gap.innerGroupSpacing": 0.125,
        "plotArea.isFixedDataPointSize": false,
        "plotArea.primaryScale.autoMaxValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.primaryScale.autoMinValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.primaryScale.fixedRange": {
            "defaultValue": false,
            "serializable": false
        },
        "plotArea.primaryScale.maxValue": {
            "defaultValue": null,
            "serializable": false
        },
        "plotArea.primaryScale.minValue": {
            "defaultValue": null,
            "serializable": false
        },
        "plotArea.secondaryScale.autoMaxValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.secondaryScale.autoMinValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.secondaryScale.fixedRange": {
            "defaultValue": false,
            "serializable": false
        },
        "plotArea.secondaryScale.maxValue": {
            "defaultValue": null,
            "serializable": false
        },
        "plotArea.secondaryScale.minValue": {
            "defaultValue": null,
            "serializable": false
        },
        "valueAxis2.layout.height": null,
        "valueAxis2.layout.width": null
    },
    "info/dual_stacked_combination": {
        "categoryAxis.label.angle": 90,
        "categoryAxis.label.rotation": "auto",
        "categoryAxis.label.truncatedLabelRatio": 0.2,
        "categoryAxis.layout.height": null,
        "categoryAxis.layout.width": null,
        "legend.groupByShape": false,
        "legend.marker.shape": "squareWithRadius",
        "plotArea.dataPointSize.max": 96,
        "plotArea.dataPointSize.min": 24,
        "plotArea.dataShape.primaryAxis": [
            "bar",
            "line",
            "line"
        ],
        "plotArea.dataShape.secondaryAxis": [
            "bar",
            "line",
            "line"
        ],
        "plotArea.gap.barSpacing": 1,
        "plotArea.gap.groupSpacing": 1,
        "plotArea.gap.innerGroupSpacing": 0.125,
        "plotArea.isFixedDataPointSize": false,
        "plotArea.line.lineRenderer": null,
        "plotArea.line.marker.shape": "circle",
        "plotArea.line.marker.size": 6,
        "plotArea.line.marker.visible": true,
        "plotArea.line.style": null,
        "plotArea.line.visible": true,
        "plotArea.line.width": 2,
        "plotArea.primaryScale.autoMaxValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.primaryScale.autoMinValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.primaryScale.fixedRange": {
            "defaultValue": false,
            "serializable": false
        },
        "plotArea.primaryScale.maxValue": {
            "defaultValue": null,
            "serializable": false
        },
        "plotArea.primaryScale.minValue": {
            "defaultValue": null,
            "serializable": false
        },
        "plotArea.secondaryScale.autoMaxValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.secondaryScale.autoMinValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.secondaryScale.fixedRange": {
            "defaultValue": false,
            "serializable": false
        },
        "plotArea.secondaryScale.maxValue": {
            "defaultValue": null,
            "serializable": false
        },
        "plotArea.secondaryScale.minValue": {
            "defaultValue": null,
            "serializable": false
        },
        "valueAxis.color": "#6c6c6c",
        "valueAxis.title.applyAxislineColor": false,
        "valueAxis2.layout.height": null,
        "valueAxis2.layout.width": null
    },
    "info/heatmap": {
        "categoryAxis.axisLine.size": 1,
        "categoryAxis.axisLine.visible": true,
        "categoryAxis.axisTick.visible": true,
        "categoryAxis.color": "#6c6c6c",
        "categoryAxis.hoverShadow.color": "#cccccc",
        "categoryAxis.label.angle": 90,
        "categoryAxis.label.hideSubLevels": false,
        "categoryAxis.label.rotation": "auto",
        "categoryAxis.label.style.color": "#333333",
        "categoryAxis.label.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "categoryAxis.label.style.fontSize": "12px",
        "categoryAxis.label.style.fontStyle": "normal",
        "categoryAxis.label.style.fontWeight": "normal",
        "categoryAxis.label.truncatedLabelRatio": 0.2,
        "categoryAxis.label.visible": true,
        "categoryAxis.labelRenderer": null,
        "categoryAxis.layout.height": null,
        "categoryAxis.layout.maxHeight": 0.3,
        "categoryAxis.layout.maxWidth": 0.3,
        "categoryAxis.layout.width": null,
        "categoryAxis.mouseDownShadow.color": "#808080",
        "categoryAxis.title.applyAxislineColor": false,
        "categoryAxis.title.style.color": "#000000",
        "categoryAxis.title.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "categoryAxis.title.style.fontSize": "14px",
        "categoryAxis.title.style.fontStyle": "normal",
        "categoryAxis.title.style.fontWeight": "bold",
        "categoryAxis.title.text": null,
        "categoryAxis.title.visible": false,
        "categoryAxis.visible": true,
        "categoryAxis2.axisLine.size": 1,
        "categoryAxis2.axisLine.visible": true,
        "categoryAxis2.axisTick.visible": true,
        "categoryAxis2.color": "#6c6c6c",
        "categoryAxis2.hoverShadow.color": "#cccccc",
        "categoryAxis2.label.hideSubLevels": false,
        "categoryAxis2.label.style.color": "#333333",
        "categoryAxis2.label.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "categoryAxis2.label.style.fontSize": "12px",
        "categoryAxis2.label.style.fontStyle": "normal",
        "categoryAxis2.label.style.fontWeight": "normal",
        "categoryAxis2.label.visible": true,
        "categoryAxis2.labelRenderer": null,
        "categoryAxis2.layout.height": null,
        "categoryAxis2.layout.maxHeight": 0.3,
        "categoryAxis2.layout.maxWidth": 0.3,
        "categoryAxis2.layout.width": null,
        "categoryAxis2.mouseDownShadow.color": "#808080",
        "categoryAxis2.title.applyAxislineColor": false,
        "categoryAxis2.title.style.color": "#000000",
        "categoryAxis2.title.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "categoryAxis2.title.style.fontSize": "14px",
        "categoryAxis2.title.style.fontStyle": "normal",
        "categoryAxis2.title.style.fontWeight": "bold",
        "categoryAxis2.title.text": null,
        "categoryAxis2.title.visible": false,
        "categoryAxis2.visible": true,
        "feedingZone": {
            "defaultValue": [
                {
                    "bindDef": [
                        {
                            "id": null
                        }
                    ],
                    "bound": [
                        [
                            [
                                0,
                                0
                            ],
                            [
                                0,
                                0
                            ],
                            [
                                0,
                                0
                            ],
                            [
                                0,
                                0
                            ]
                        ]
                    ],
                    "name": null
                }
            ],
            "readonly": true,
            "serializable": false
        },
        "general.groupData": false,
        "interaction.behaviorType": null,
        "interaction.decorations": {
            "defaultValue": null,
            "serializable": false
        },
        "interaction.deselected.color": null,
        "interaction.deselected.opacity": 0.4,
        "interaction.deselected.stroke.color": "darken(20%)",
        "interaction.deselected.stroke.visible": false,
        "interaction.deselected.stroke.width": "1px",
        "interaction.enableKeyboard": false,
        "interaction.hover.color": null,
        "interaction.hover.opacity": 1,
        "interaction.hover.stroke.color": "darken(20%)",
        "interaction.hover.stroke.visible": true,
        "interaction.hover.stroke.width": "2px",
        "interaction.noninteractiveMode": false,
        "interaction.selectability.axisLabelSelection": true,
        "interaction.selectability.legendSelection": true,
        "interaction.selectability.mode": "INCLUSIVE",
        "interaction.selectability.plotLassoSelection": true,
        "interaction.selectability.plotStdSelection": true,
        "interaction.selected.color": null,
        "interaction.selected.stroke.color": "darken(20%)",
        "interaction.selected.stroke.visible": true,
        "interaction.selected.stroke.width": "1px",
        "legend.drawingEffect": "normal",
        "legend.formatString": null,
        "legend.hoverShadow.color": "#cccccc",
        "legend.label.style.color": "#000000",
        "legend.label.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "legend.label.style.fontSize": "12px",
        "legend.label.style.fontStyle": "normal",
        "legend.label.style.fontWeight": "normal",
        "legend.mouseDownShadow.color": "#808080",
        "legend.postRenderer": null,
        "legend.title.style.color": "#000000",
        "legend.title.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "legend.title.style.fontSize": "14px",
        "legend.title.style.fontStyle": "normal",
        "legend.title.style.fontWeight": "bold",
        "legend.title.text": null,
        "legend.title.visible": false,
        "legend.unitFormatType": "FinancialUnits",
        "legend.visible": true,
        "legendGroup.computedVisibility": {
            "defaultValue": true,
            "readonly": true,
            "serializable": false
        },
        "legendGroup.forceToShow": false,
        "legendGroup.layout.alignment": "topLeft",
        "legendGroup.layout.height": null,
        "legendGroup.layout.maxHeight": 0.25,
        "legendGroup.layout.maxWidth": 0.25,
        "legendGroup.layout.position": "right",
        "legendGroup.layout.width": null,
        "legendGroup.renderTo": null,
        "plotArea.background.border.bottom.visible": true,
        "plotArea.background.border.left.visible": true,
        "plotArea.background.border.right.visible": true,
        "plotArea.background.border.stroke": "#d8d8d8",
        "plotArea.background.border.strokeWidth": 1,
        "plotArea.background.border.top.visible": true,
        "plotArea.background.color": "transparent",
        "plotArea.background.drawingEffect": "normal",
        "plotArea.background.gradientDirection": "vertical",
        "plotArea.background.visible": true,
        "plotArea.border.visible": true,
        "plotArea.colorPalette": {
            "defaultValue": [],
            "serializable": false
        },
        "plotArea.dataLabel.formatString": "0.0",
        "plotArea.dataLabel.hideWhenOverlap": false,
        "plotArea.dataLabel.renderer": null,
        "plotArea.dataLabel.style.color": "white",
        "plotArea.dataLabel.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "plotArea.dataLabel.style.fontSize": "12px",
        "plotArea.dataLabel.style.fontStyle": "normal",
        "plotArea.dataLabel.style.fontWeight": "normal",
        "plotArea.dataLabel.unitFormatType": "FinancialUnits",
        "plotArea.dataLabel.visible": false,
        "plotArea.dataPoint.stroke.color": "#000000",
        "plotArea.dataPoint.stroke.visible": false,
        "plotArea.dataPointStyle": null,
        "plotArea.dataPointStyleMode": "update",
        "plotArea.dimensionLabel.renderer": null,
        "plotArea.dimensionLabel.style.color": null,
        "plotArea.dimensionLabel.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "plotArea.dimensionLabel.style.fontSize": "12px",
        "plotArea.dimensionLabel.style.fontStyle": "normal",
        "plotArea.dimensionLabel.style.fontWeight": "normal",
        "plotArea.dimensionLabel.visible": true,
        "plotArea.endColor": {
            "defaultValue": "#73C03C",
            "serializable": false
        },
        "plotArea.legendValues": {
            "defaultValue": [],
            "serializable": false
        },
        "plotArea.startColor": "#C2E3A9",
        "propertyZone": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "title.layout.height": null,
        "tooltip.background.borderColor": "#cccccc",
        "tooltip.background.color": "#ffffff",
        "tooltip.bodyDimensionLabel.color": "#666666",
        "tooltip.bodyDimensionValue.color": "#666666",
        "tooltip.bodyMeasureLabel.color": "#666666",
        "tooltip.bodyMeasureValue.color": "#000000",
        "tooltip.closeButton.backgroundColor": "#ffffff",
        "tooltip.closeButton.borderColor": "#cccccc",
        "tooltip.footerLabel.color": "#000000",
        "tooltip.formatString": null,
        "tooltip.layinChart": true,
        "tooltip.postRender": null,
        "tooltip.preRender": {
            "defaultValue": null,
            "serializable": false
        },
        "tooltip.separationLine.color": "#a7a9ac",
        "tooltip.unitFormatType": "FinancialUnits",
        "tooltip.visible": true
    },
    "info/horizontal_area": {
        "categoryAxis.axisLine.size": 1,
        "categoryAxis.axisLine.visible": true,
        "categoryAxis.axisTick.visible": true,
        "categoryAxis.color": "#6c6c6c",
        "categoryAxis.hoverShadow.color": "#cccccc",
        "categoryAxis.label.hideSubLevels": false,
        "categoryAxis.label.style.color": "#333333",
        "categoryAxis.label.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "categoryAxis.label.style.fontSize": "12px",
        "categoryAxis.label.style.fontStyle": "normal",
        "categoryAxis.label.style.fontWeight": "normal",
        "categoryAxis.label.visible": true,
        "categoryAxis.labelRenderer": null,
        "categoryAxis.layout.height": null,
        "categoryAxis.layout.maxHeight": 0.3,
        "categoryAxis.layout.maxWidth": 0.3,
        "categoryAxis.layout.width": null,
        "categoryAxis.mouseDownShadow.color": "#808080",
        "categoryAxis.title.applyAxislineColor": false,
        "categoryAxis.title.style.color": "#000000",
        "categoryAxis.title.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "categoryAxis.title.style.fontSize": "14px",
        "categoryAxis.title.style.fontStyle": "normal",
        "categoryAxis.title.style.fontWeight": "bold",
        "categoryAxis.title.text": null,
        "categoryAxis.title.visible": false,
        "categoryAxis.visible": true,
        "feedingZone": {
            "defaultValue": [
                {
                    "bindDef": [
                        {
                            "id": null
                        }
                    ],
                    "bound": [
                        [
                            [
                                0,
                                0
                            ],
                            [
                                0,
                                0
                            ],
                            [
                                0,
                                0
                            ],
                            [
                                0,
                                0
                            ]
                        ]
                    ],
                    "name": null
                }
            ],
            "readonly": true,
            "serializable": false
        },
        "general.groupData": false,
        "interaction.behaviorType": null,
        "interaction.decorations": {
            "defaultValue": null,
            "serializable": false
        },
        "interaction.deselected.color": null,
        "interaction.deselected.opacity": 0.4,
        "interaction.hover.color": null,
        "interaction.hover.stroke.color": "darken(20%)",
        "interaction.hover.stroke.visible": true,
        "interaction.hover.stroke.width": "2px",
        "interaction.noninteractiveMode": false,
        "interaction.selectability.axisLabelSelection": true,
        "interaction.selectability.legendSelection": true,
        "interaction.selectability.mode": "INCLUSIVE",
        "interaction.selectability.plotLassoSelection": true,
        "interaction.selectability.plotStdSelection": true,
        "interaction.selected.color": null,
        "interaction.selected.stroke.color": "darken(20%)",
        "interaction.selected.stroke.visible": true,
        "interaction.selected.stroke.width": "1px",
        "interaction.zoom.direction": "all",
        "interaction.zoom.enablement": "auto",
        "legend.drawingEffect": "normal",
        "legend.hoverShadow.color": "#cccccc",
        "legend.isScrollable": false,
        "legend.itemMargin": 0.5,
        "legend.label.style.color": "#000000",
        "legend.label.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "legend.label.style.fontSize": "12px",
        "legend.label.style.fontStyle": "normal",
        "legend.label.style.fontWeight": "normal",
        "legend.marker.size": null,
        "legend.maxNumOfItems": null,
        "legend.mouseDownShadow.color": "#808080",
        "legend.order": {
            "defaultValue": null,
            "serializable": false
        },
        "legend.postRenderer": null,
        "legend.scrollbar.border.color": "white",
        "legend.scrollbar.border.width": 0,
        "legend.scrollbar.spacing": 0,
        "legend.scrollbar.thumb.fill": "#e5e5e5",
        "legend.scrollbar.thumb.hoverFill": "#dedede",
        "legend.scrollbar.track.fill": "#f7f7f7",
        "legend.showFullLabel": true,
        "legend.title.style.color": "#000000",
        "legend.title.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "legend.title.style.fontSize": "14px",
        "legend.title.style.fontStyle": "normal",
        "legend.title.style.fontWeight": "bold",
        "legend.title.text": null,
        "legend.title.visible": false,
        "legend.visible": true,
        "legendGroup.computedVisibility": {
            "defaultValue": true,
            "readonly": true,
            "serializable": false
        },
        "legendGroup.forceToShow": false,
        "legendGroup.layout.alignment": "topLeft",
        "legendGroup.layout.height": null,
        "legendGroup.layout.maxHeight": 0.25,
        "legendGroup.layout.maxWidth": 0.25,
        "legendGroup.layout.position": "right",
        "legendGroup.layout.respectPlotPosition": true,
        "legendGroup.layout.width": null,
        "legendGroup.renderTo": null,
        "plotArea.areaRenderer": null,
        "plotArea.background.border.bottom.visible": true,
        "plotArea.background.border.left.visible": true,
        "plotArea.background.border.right.visible": true,
        "plotArea.background.border.stroke": "#d8d8d8",
        "plotArea.background.border.strokeWidth": 1,
        "plotArea.background.border.top.visible": true,
        "plotArea.background.color": "transparent",
        "plotArea.background.drawingEffect": "normal",
        "plotArea.background.gradientDirection": "vertical",
        "plotArea.background.visible": true,
        "plotArea.colorPalette": {
            "defaultValue": [
                "#748CB2",
                "#9CC677",
                "#EACF5E",
                "#F9AD79",
                "#D16A7C",
                "#8873A2",
                "#3A95B3",
                "#B6D949",
                "#FDD36C",
                "#F47958",
                "#A65084",
                "#0063B1",
                "#0DA841",
                "#FCB71D",
                "#F05620",
                "#B22D6E",
                "#3C368E",
                "#8FB2CF",
                "#95D4AB",
                "#EAE98F",
                "#F9BE92",
                "#EC9A99",
                "#BC98BD",
                "#1EB7B2",
                "#73C03C",
                "#F48323",
                "#EB271B",
                "#D9B5CA",
                "#AED1DA",
                "#DFECB2",
                "#FCDAB0",
                "#F5BCB4"
            ],
            "serializable": false
        },
        "plotArea.dataLabel.formatString": null,
        "plotArea.dataLabel.hideWhenOverlap": false,
        "plotArea.dataLabel.renderer": null,
        "plotArea.dataLabel.style.color": "#333333",
        "plotArea.dataLabel.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "plotArea.dataLabel.style.fontSize": "12px",
        "plotArea.dataLabel.style.fontStyle": "normal",
        "plotArea.dataLabel.style.fontWeight": "normal",
        "plotArea.dataLabel.unitFormatType": "FinancialUnits",
        "plotArea.dataLabel.visible": false,
        "plotArea.dataPoint.stroke.color": "#000000",
        "plotArea.dataPoint.stroke.visible": false,
        "plotArea.drawingEffect": "normal",
        "plotArea.gridline.color": "#d8d8d8",
        "plotArea.gridline.size": 1,
        "plotArea.gridline.type": "line",
        "plotArea.gridline.visible": true,
        "plotArea.gridline.zeroLine.color": null,
        "plotArea.gridline.zeroLine.highlight": true,
        "plotArea.gridline.zeroLine.unhighlightAxis": true,
        "plotArea.isFixedDataPointSize": false,
        "plotArea.markerRenderer": null,
        "plotArea.primaryScale.autoMaxValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.primaryScale.autoMinValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.primaryScale.fixedRange": {
            "defaultValue": false,
            "serializable": false
        },
        "plotArea.primaryScale.maxValue": {
            "defaultValue": null,
            "serializable": false
        },
        "plotArea.primaryScale.minValue": {
            "defaultValue": null,
            "serializable": false
        },
        "plotArea.referenceLine.defaultStyle.color": "#666666",
        "plotArea.referenceLine.defaultStyle.label.background": "#ffffff",
        "plotArea.referenceLine.defaultStyle.label.color": "#333333",
        "plotArea.referenceLine.defaultStyle.label.fontFamily": "\"Open Sans\", Arial, Helvetica, sans-serif",
        "plotArea.referenceLine.defaultStyle.label.fontSize": "12px",
        "plotArea.referenceLine.defaultStyle.label.fontStyle": "normal",
        "plotArea.referenceLine.defaultStyle.label.fontWeight": "normal",
        "plotArea.referenceLine.defaultStyle.size": 1,
        "plotArea.referenceLine.defaultStyle.type": "dotted",
        "plotArea.referenceLine.line": null,
        "plotArea.scrollbar.border.color": "white",
        "plotArea.scrollbar.border.width": 0,
        "plotArea.scrollbar.spacing": 0,
        "plotArea.scrollbar.thumb.fill": "#e5e5e5",
        "plotArea.scrollbar.thumb.hoverFill": "#dedede",
        "plotArea.scrollbar.track.fill": "#f7f7f7",
        "propertyZone": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "title.layout.height": null,
        "tooltip.background.borderColor": "#cccccc",
        "tooltip.background.color": "#ffffff",
        "tooltip.bodyDimensionLabel.color": "#666666",
        "tooltip.bodyDimensionValue.color": "#666666",
        "tooltip.bodyMeasureLabel.color": "#666666",
        "tooltip.bodyMeasureValue.color": "#000000",
        "tooltip.closeButton.backgroundColor": "#ffffff",
        "tooltip.closeButton.borderColor": "#cccccc",
        "tooltip.footerLabel.color": "#000000",
        "tooltip.formatString": null,
        "tooltip.layinChart": true,
        "tooltip.postRender": null,
        "tooltip.preRender": {
            "defaultValue": null,
            "serializable": false
        },
        "tooltip.separationLine.color": "#a7a9ac",
        "tooltip.unitFormatType": "FinancialUnits",
        "tooltip.visible": true,
        "valueAxis.axisLine.size": 1,
        "valueAxis.axisLine.visible": true,
        "valueAxis.axisTick.visible": true,
        "valueAxis.color": "#6c6c6c",
        "valueAxis.label.formatString": null,
        "valueAxis.label.style.color": "#333333",
        "valueAxis.label.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "valueAxis.label.style.fontSize": "12px",
        "valueAxis.label.style.fontStyle": "normal",
        "valueAxis.label.style.fontWeight": "normal",
        "valueAxis.label.unitFormatType": "FinancialUnits",
        "valueAxis.label.visible": true,
        "valueAxis.layout.height": null,
        "valueAxis.layout.maxHeight": 0.25,
        "valueAxis.layout.maxWidth": 0.25,
        "valueAxis.layout.width": null,
        "valueAxis.title.applyAxislineColor": false,
        "valueAxis.title.style.color": "#000000",
        "valueAxis.title.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "valueAxis.title.style.fontSize": "14px",
        "valueAxis.title.style.fontStyle": "normal",
        "valueAxis.title.style.fontWeight": "bold",
        "valueAxis.title.text": null,
        "valueAxis.title.visible": false,
        "valueAxis.visible": true
    },
    "info/horizontal_combination": {
        "categoryAxis.axisLine.size": 1,
        "categoryAxis.axisLine.visible": true,
        "categoryAxis.axisTick.visible": true,
        "categoryAxis.color": "#6c6c6c",
        "categoryAxis.hoverShadow.color": "#cccccc",
        "categoryAxis.label.hideSubLevels": false,
        "categoryAxis.label.style.color": "#333333",
        "categoryAxis.label.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "categoryAxis.label.style.fontSize": "12px",
        "categoryAxis.label.style.fontStyle": "normal",
        "categoryAxis.label.style.fontWeight": "normal",
        "categoryAxis.label.visible": true,
        "categoryAxis.labelRenderer": null,
        "categoryAxis.layout.height": null,
        "categoryAxis.layout.maxHeight": 0.3,
        "categoryAxis.layout.maxWidth": 0.3,
        "categoryAxis.layout.width": null,
        "categoryAxis.mouseDownShadow.color": "#808080",
        "categoryAxis.title.applyAxislineColor": false,
        "categoryAxis.title.style.color": "#000000",
        "categoryAxis.title.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "categoryAxis.title.style.fontSize": "14px",
        "categoryAxis.title.style.fontStyle": "normal",
        "categoryAxis.title.style.fontWeight": "bold",
        "categoryAxis.title.text": null,
        "categoryAxis.title.visible": false,
        "categoryAxis.visible": true,
        "interaction.selectability.axisLabelSelection": true,
        "legend.groupByShape": false,
        "legend.marker.shape": "squareWithRadius",
        "plotArea.background.gradientDirection": "horizontal",
        "plotArea.dataPointSize.max": 96,
        "plotArea.dataPointSize.min": 24,
        "plotArea.dataShape.primaryAxis": [
            "bar",
            "line",
            "line"
        ],
        "plotArea.gap.barSpacing": 1,
        "plotArea.gap.groupSpacing": 1,
        "plotArea.gap.innerGroupSpacing": 0.125,
        "plotArea.isFixedDataPointSize": false,
        "plotArea.line.lineRenderer": null,
        "plotArea.line.marker.shape": "circle",
        "plotArea.line.marker.size": 6,
        "plotArea.line.marker.visible": true,
        "plotArea.line.style": null,
        "plotArea.line.visible": true,
        "plotArea.line.width": 2,
        "plotArea.primaryScale.autoMaxValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.primaryScale.autoMinValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.primaryScale.fixedRange": {
            "defaultValue": false,
            "serializable": false
        },
        "plotArea.primaryScale.maxValue": {
            "defaultValue": null,
            "serializable": false
        },
        "plotArea.primaryScale.minValue": {
            "defaultValue": null,
            "serializable": false
        }
    },
    "info/horizontal_line": {
        "categoryAxis.axisLine.size": 1,
        "categoryAxis.axisLine.visible": true,
        "categoryAxis.axisTick.visible": true,
        "categoryAxis.color": "#6c6c6c",
        "categoryAxis.hoverShadow.color": "#cccccc",
        "categoryAxis.label.hideSubLevels": false,
        "categoryAxis.label.style.color": "#333333",
        "categoryAxis.label.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "categoryAxis.label.style.fontSize": "12px",
        "categoryAxis.label.style.fontStyle": "normal",
        "categoryAxis.label.style.fontWeight": "normal",
        "categoryAxis.label.visible": true,
        "categoryAxis.labelRenderer": null,
        "categoryAxis.layout.height": null,
        "categoryAxis.layout.maxHeight": 0.3,
        "categoryAxis.layout.maxWidth": 0.3,
        "categoryAxis.layout.width": null,
        "categoryAxis.mouseDownShadow.color": "#808080",
        "categoryAxis.title.applyAxislineColor": false,
        "categoryAxis.title.style.color": "#000000",
        "categoryAxis.title.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "categoryAxis.title.style.fontSize": "14px",
        "categoryAxis.title.style.fontStyle": "normal",
        "categoryAxis.title.style.fontWeight": "bold",
        "categoryAxis.title.text": null,
        "categoryAxis.title.visible": false,
        "categoryAxis.visible": true,
        "interaction.selectability.axisLabelSelection": true,
        "plotArea.background.gradientDirection": "horizontal",
        "plotArea.isFixedDataPointSize": false,
        "plotArea.lineRenderer": null,
        "plotArea.lineStyle": null,
        "plotArea.lineVisible": true,
        "plotArea.marker.displayMode": "manual",
        "plotArea.marker.shape": "circle",
        "plotArea.marker.size": 6,
        "plotArea.marker.visible": true,
        "plotArea.primaryScale.autoMaxValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.primaryScale.autoMinValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.primaryScale.fixedRange": {
            "defaultValue": false,
            "serializable": false
        },
        "plotArea.primaryScale.maxValue": {
            "defaultValue": null,
            "serializable": false
        },
        "plotArea.primaryScale.minValue": {
            "defaultValue": null,
            "serializable": false
        },
        "plotArea.width": 2
    },
    "info/horizontal_mekko": {
        "categoryAxis.axisLine.size": 1,
        "categoryAxis.axisLine.visible": true,
        "categoryAxis.axisTick.visible": true,
        "categoryAxis.color": "#6c6c6c",
        "categoryAxis.hoverShadow.color": "#cccccc",
        "categoryAxis.label.hideSubLevels": false,
        "categoryAxis.label.style.color": "#333333",
        "categoryAxis.label.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "categoryAxis.label.style.fontSize": "12px",
        "categoryAxis.label.style.fontStyle": "normal",
        "categoryAxis.label.style.fontWeight": "normal",
        "categoryAxis.label.visible": true,
        "categoryAxis.labelRenderer": null,
        "categoryAxis.layout.height": null,
        "categoryAxis.layout.maxHeight": 0.3,
        "categoryAxis.layout.maxWidth": 0.3,
        "categoryAxis.layout.width": null,
        "categoryAxis.mouseDownShadow.color": "#808080",
        "categoryAxis.title.applyAxislineColor": false,
        "categoryAxis.title.style.color": "#000000",
        "categoryAxis.title.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "categoryAxis.title.style.fontSize": "14px",
        "categoryAxis.title.style.fontStyle": "normal",
        "categoryAxis.title.style.fontWeight": "bold",
        "categoryAxis.title.text": null,
        "categoryAxis.title.visible": false,
        "categoryAxis.visible": true,
        "feedingZone": {
            "defaultValue": [
                {
                    "bindDef": [
                        {
                            "id": null
                        }
                    ],
                    "bound": [
                        [
                            [
                                0,
                                0
                            ],
                            [
                                0,
                                0
                            ],
                            [
                                0,
                                0
                            ],
                            [
                                0,
                                0
                            ]
                        ]
                    ],
                    "name": null
                }
            ],
            "readonly": true,
            "serializable": false
        },
        "general.groupData": false,
        "interaction.behaviorType": null,
        "interaction.decorations": {
            "defaultValue": null,
            "serializable": false
        },
        "interaction.deselected.color": null,
        "interaction.deselected.opacity": 0.4,
        "interaction.deselected.stroke.color": "darken(20%)",
        "interaction.deselected.stroke.visible": false,
        "interaction.deselected.stroke.width": "1px",
        "interaction.hover.color": null,
        "interaction.hover.opacity": 1,
        "interaction.hover.stroke.color": "darken(20%)",
        "interaction.hover.stroke.visible": true,
        "interaction.hover.stroke.width": "2px",
        "interaction.noninteractiveMode": false,
        "interaction.selectability.axisLabelSelection": true,
        "interaction.selectability.legendSelection": true,
        "interaction.selectability.mode": "INCLUSIVE",
        "interaction.selectability.plotLassoSelection": true,
        "interaction.selectability.plotStdSelection": true,
        "interaction.selected.color": null,
        "interaction.selected.stroke.color": "darken(20%)",
        "interaction.selected.stroke.visible": true,
        "interaction.selected.stroke.width": "1px",
        "interaction.zoom.direction": "all",
        "interaction.zoom.enablement": "auto",
        "legend.drawingEffect": "normal",
        "legend.hoverShadow.color": "#cccccc",
        "legend.isScrollable": false,
        "legend.itemMargin": 0.5,
        "legend.label.style.color": "#000000",
        "legend.label.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "legend.label.style.fontSize": "12px",
        "legend.label.style.fontStyle": "normal",
        "legend.label.style.fontWeight": "normal",
        "legend.marker.shape": "squareWithRadius",
        "legend.marker.size": null,
        "legend.maxNumOfItems": null,
        "legend.mouseDownShadow.color": "#808080",
        "legend.order": {
            "defaultValue": null,
            "serializable": false
        },
        "legend.postRenderer": null,
        "legend.scrollbar.border.color": "white",
        "legend.scrollbar.border.width": 0,
        "legend.scrollbar.spacing": 0,
        "legend.scrollbar.thumb.fill": "#e5e5e5",
        "legend.scrollbar.thumb.hoverFill": "#dedede",
        "legend.scrollbar.track.fill": "#f7f7f7",
        "legend.showFullLabel": true,
        "legend.title.style.color": "#000000",
        "legend.title.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "legend.title.style.fontSize": "14px",
        "legend.title.style.fontStyle": "normal",
        "legend.title.style.fontWeight": "bold",
        "legend.title.text": null,
        "legend.title.visible": false,
        "legend.visible": true,
        "legendGroup.computedVisibility": {
            "defaultValue": true,
            "readonly": true,
            "serializable": false
        },
        "legendGroup.forceToShow": false,
        "legendGroup.layout.alignment": "topLeft",
        "legendGroup.layout.height": null,
        "legendGroup.layout.maxHeight": 0.25,
        "legendGroup.layout.maxWidth": 0.25,
        "legendGroup.layout.position": "right",
        "legendGroup.layout.respectPlotPosition": true,
        "legendGroup.layout.width": null,
        "legendGroup.renderTo": null,
        "plotArea.background.border.bottom.visible": true,
        "plotArea.background.border.left.visible": true,
        "plotArea.background.border.right.visible": true,
        "plotArea.background.border.stroke": "#d8d8d8",
        "plotArea.background.border.strokeWidth": 1,
        "plotArea.background.border.top.visible": true,
        "plotArea.background.color": "transparent",
        "plotArea.background.drawingEffect": "normal",
        "plotArea.background.gradientDirection": "vertical",
        "plotArea.background.visible": true,
        "plotArea.colorPalette": {
            "defaultValue": [
                "#748CB2",
                "#9CC677",
                "#EACF5E",
                "#F9AD79",
                "#D16A7C",
                "#8873A2",
                "#3A95B3",
                "#B6D949",
                "#FDD36C",
                "#F47958",
                "#A65084",
                "#0063B1",
                "#0DA841",
                "#FCB71D",
                "#F05620",
                "#B22D6E",
                "#3C368E",
                "#8FB2CF",
                "#95D4AB",
                "#EAE98F",
                "#F9BE92",
                "#EC9A99",
                "#BC98BD",
                "#1EB7B2",
                "#73C03C",
                "#F48323",
                "#EB271B",
                "#D9B5CA",
                "#AED1DA",
                "#DFECB2",
                "#FCDAB0",
                "#F5BCB4"
            ],
            "serializable": false
        },
        "plotArea.dataLabel.formatString": null,
        "plotArea.dataLabel.hideWhenOverlap": false,
        "plotArea.dataLabel.renderer": null,
        "plotArea.dataLabel.style.color": "#333333",
        "plotArea.dataLabel.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "plotArea.dataLabel.style.fontSize": "12px",
        "plotArea.dataLabel.style.fontStyle": "normal",
        "plotArea.dataLabel.style.fontWeight": "normal",
        "plotArea.dataLabel.unitFormatType": "FinancialUnits",
        "plotArea.dataLabel.visible": false,
        "plotArea.dataPoint.stroke.color": "#000000",
        "plotArea.dataPoint.stroke.visible": false,
        "plotArea.dataPointStyle": null,
        "plotArea.dataPointStyleMode": "update",
        "plotArea.defaultOthersStyle.color": "#000000",
        "plotArea.drawingEffect": "normal",
        "plotArea.gridline.color": "#d8d8d8",
        "plotArea.gridline.size": 1,
        "plotArea.gridline.type": "line",
        "plotArea.gridline.visible": true,
        "plotArea.isFixedDataPointSize": false,
        "plotArea.markerRenderer": null,
        "plotArea.primaryScale.autoMaxValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.primaryScale.autoMinValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.primaryScale.fixedRange": {
            "defaultValue": false,
            "serializable": false
        },
        "plotArea.primaryScale.maxValue": {
            "defaultValue": null,
            "serializable": false
        },
        "plotArea.primaryScale.minValue": {
            "defaultValue": null,
            "serializable": false
        },
        "plotArea.referenceLine.defaultStyle.color": "#666666",
        "plotArea.referenceLine.defaultStyle.label.background": "#ffffff",
        "plotArea.referenceLine.defaultStyle.label.color": "#333333",
        "plotArea.referenceLine.defaultStyle.label.fontFamily": "\"Open Sans\", Arial, Helvetica, sans-serif",
        "plotArea.referenceLine.defaultStyle.label.fontSize": "12px",
        "plotArea.referenceLine.defaultStyle.label.fontStyle": "normal",
        "plotArea.referenceLine.defaultStyle.label.fontWeight": "normal",
        "plotArea.referenceLine.defaultStyle.size": 1,
        "plotArea.referenceLine.defaultStyle.type": "dotted",
        "plotArea.referenceLine.line": null,
        "plotArea.scrollbar.border.color": "white",
        "plotArea.scrollbar.border.width": 0,
        "plotArea.scrollbar.spacing": 0,
        "plotArea.scrollbar.thumb.fill": "#e5e5e5",
        "plotArea.scrollbar.thumb.hoverFill": "#dedede",
        "plotArea.scrollbar.track.fill": "#f7f7f7",
        "plotArea.window.end": null,
        "plotArea.window.start": null,
        "propertyZone": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "title.layout.height": null,
        "tooltip.background.borderColor": "#cccccc",
        "tooltip.background.color": "#ffffff",
        "tooltip.bodyDimensionLabel.color": "#666666",
        "tooltip.bodyDimensionValue.color": "#666666",
        "tooltip.bodyMeasureLabel.color": "#666666",
        "tooltip.bodyMeasureValue.color": "#000000",
        "tooltip.closeButton.backgroundColor": "#ffffff",
        "tooltip.closeButton.borderColor": "#cccccc",
        "tooltip.footerLabel.color": "#000000",
        "tooltip.formatString": null,
        "tooltip.layinChart": true,
        "tooltip.postRender": null,
        "tooltip.preRender": {
            "defaultValue": null,
            "serializable": false
        },
        "tooltip.separationLine.color": "#a7a9ac",
        "tooltip.unitFormatType": "FinancialUnits",
        "tooltip.visible": true,
        "valueAxis.axisLine.size": 1,
        "valueAxis.axisLine.visible": true,
        "valueAxis.axisTick.visible": true,
        "valueAxis.color": "#6c6c6c",
        "valueAxis.label.formatString": null,
        "valueAxis.label.style.color": "#333333",
        "valueAxis.label.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "valueAxis.label.style.fontSize": "12px",
        "valueAxis.label.style.fontStyle": "normal",
        "valueAxis.label.style.fontWeight": "normal",
        "valueAxis.label.unitFormatType": "FinancialUnits",
        "valueAxis.label.visible": true,
        "valueAxis.layout.height": null,
        "valueAxis.layout.maxHeight": 0.25,
        "valueAxis.layout.maxWidth": 0.25,
        "valueAxis.layout.width": null,
        "valueAxis.title.applyAxislineColor": false,
        "valueAxis.title.style.color": "#000000",
        "valueAxis.title.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "valueAxis.title.style.fontSize": "14px",
        "valueAxis.title.style.fontStyle": "normal",
        "valueAxis.title.style.fontWeight": "bold",
        "valueAxis.title.text": null,
        "valueAxis.title.visible": false,
        "valueAxis.visible": true,
        "valueAxis2.axisLine.size": 1,
        "valueAxis2.axisLine.visible": true,
        "valueAxis2.axisTick.visible": true,
        "valueAxis2.color": "#6c6c6c",
        "valueAxis2.label.formatString": null,
        "valueAxis2.label.style.color": "#333333",
        "valueAxis2.label.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "valueAxis2.label.style.fontSize": "12px",
        "valueAxis2.label.style.fontStyle": "normal",
        "valueAxis2.label.style.fontWeight": "normal",
        "valueAxis2.label.unitFormatType": "FinancialUnits",
        "valueAxis2.label.visible": true,
        "valueAxis2.layout.height": null,
        "valueAxis2.layout.maxHeight": 0.25,
        "valueAxis2.layout.maxWidth": 0.25,
        "valueAxis2.layout.width": null,
        "valueAxis2.title.applyAxislineColor": false,
        "valueAxis2.title.style.color": "#000000",
        "valueAxis2.title.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "valueAxis2.title.style.fontSize": "14px",
        "valueAxis2.title.style.fontStyle": "normal",
        "valueAxis2.title.style.fontWeight": "bold",
        "valueAxis2.title.text": null,
        "valueAxis2.title.visible": false,
        "valueAxis2.visible": true
    },
    "info/horizontal_stacked_combination": {
        "categoryAxis.axisLine.size": 1,
        "categoryAxis.axisLine.visible": true,
        "categoryAxis.axisTick.visible": true,
        "categoryAxis.color": "#6c6c6c",
        "categoryAxis.hoverShadow.color": "#cccccc",
        "categoryAxis.label.hideSubLevels": false,
        "categoryAxis.label.style.color": "#333333",
        "categoryAxis.label.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "categoryAxis.label.style.fontSize": "12px",
        "categoryAxis.label.style.fontStyle": "normal",
        "categoryAxis.label.style.fontWeight": "normal",
        "categoryAxis.label.visible": true,
        "categoryAxis.labelRenderer": null,
        "categoryAxis.layout.height": null,
        "categoryAxis.layout.maxHeight": 0.3,
        "categoryAxis.layout.maxWidth": 0.3,
        "categoryAxis.layout.width": null,
        "categoryAxis.mouseDownShadow.color": "#808080",
        "categoryAxis.title.applyAxislineColor": false,
        "categoryAxis.title.style.color": "#000000",
        "categoryAxis.title.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "categoryAxis.title.style.fontSize": "14px",
        "categoryAxis.title.style.fontStyle": "normal",
        "categoryAxis.title.style.fontWeight": "bold",
        "categoryAxis.title.text": null,
        "categoryAxis.title.visible": false,
        "categoryAxis.visible": true,
        "interaction.selectability.axisLabelSelection": true,
        "legend.groupByShape": false,
        "legend.marker.shape": "squareWithRadius",
        "plotArea.background.gradientDirection": "horizontal",
        "plotArea.dataPointSize.max": 96,
        "plotArea.dataPointSize.min": 24,
        "plotArea.dataShape.primaryAxis": [
            "bar",
            "line",
            "line"
        ],
        "plotArea.gap.barSpacing": 1,
        "plotArea.isFixedDataPointSize": false,
        "plotArea.line.lineRenderer": null,
        "plotArea.line.marker.shape": "circle",
        "plotArea.line.marker.size": 6,
        "plotArea.line.marker.visible": true,
        "plotArea.line.style": null,
        "plotArea.line.visible": true,
        "plotArea.line.width": 2,
        "plotArea.primaryScale.autoMaxValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.primaryScale.autoMinValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.primaryScale.fixedRange": {
            "defaultValue": false,
            "serializable": false
        },
        "plotArea.primaryScale.maxValue": {
            "defaultValue": null,
            "serializable": false
        },
        "plotArea.primaryScale.minValue": {
            "defaultValue": null,
            "serializable": false
        }
    },
    "info/horizontal_stacked_waterfall": {
        "categoryAxis.axisLine.size": 1,
        "categoryAxis.axisLine.visible": true,
        "categoryAxis.axisTick.visible": true,
        "categoryAxis.color": "#6c6c6c",
        "categoryAxis.hoverShadow.color": "#cccccc",
        "categoryAxis.label.hideSubLevels": false,
        "categoryAxis.label.style.color": "#333333",
        "categoryAxis.label.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "categoryAxis.label.style.fontSize": "12px",
        "categoryAxis.label.style.fontStyle": "normal",
        "categoryAxis.label.style.fontWeight": "normal",
        "categoryAxis.label.visible": true,
        "categoryAxis.labelRenderer": null,
        "categoryAxis.layout.height": null,
        "categoryAxis.layout.maxHeight": 0.3,
        "categoryAxis.layout.maxWidth": 0.3,
        "categoryAxis.layout.width": null,
        "categoryAxis.mouseDownShadow.color": "#808080",
        "categoryAxis.title.applyAxislineColor": false,
        "categoryAxis.title.style.color": "#000000",
        "categoryAxis.title.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "categoryAxis.title.style.fontSize": "14px",
        "categoryAxis.title.style.fontStyle": "normal",
        "categoryAxis.title.style.fontWeight": "bold",
        "categoryAxis.title.text": null,
        "categoryAxis.title.visible": false,
        "categoryAxis.visible": true,
        "feedingZone": {
            "defaultValue": [
                {
                    "bindDef": [
                        {
                            "id": null
                        }
                    ],
                    "bound": [
                        [
                            [
                                0,
                                0
                            ],
                            [
                                0,
                                0
                            ],
                            [
                                0,
                                0
                            ],
                            [
                                0,
                                0
                            ]
                        ]
                    ],
                    "name": null
                }
            ],
            "readonly": true,
            "serializable": false
        },
        "general.groupData": false,
        "interaction.behaviorType": null,
        "interaction.decorations": {
            "defaultValue": null,
            "serializable": false
        },
        "interaction.deselected.color": null,
        "interaction.deselected.opacity": 0.4,
        "interaction.deselected.stroke.color": "darken(20%)",
        "interaction.deselected.stroke.visible": false,
        "interaction.deselected.stroke.width": "1px",
        "interaction.enableKeyboard": false,
        "interaction.hover.color": null,
        "interaction.hover.opacity": 1,
        "interaction.hover.stroke.color": "darken(20%)",
        "interaction.hover.stroke.visible": true,
        "interaction.hover.stroke.width": "2px",
        "interaction.noninteractiveMode": false,
        "interaction.selectability.axisLabelSelection": true,
        "interaction.selectability.legendSelection": true,
        "interaction.selectability.mode": "INCLUSIVE",
        "interaction.selectability.plotLassoSelection": true,
        "interaction.selectability.plotStdSelection": true,
        "interaction.selected.color": null,
        "interaction.selected.stroke.color": "darken(20%)",
        "interaction.selected.stroke.visible": true,
        "interaction.selected.stroke.width": "1px",
        "interaction.zoom.direction": "all",
        "interaction.zoom.enablement": "auto",
        "legend.drawingEffect": "normal",
        "legend.hoverShadow.color": "#cccccc",
        "legend.isScrollable": false,
        "legend.itemMargin": 0.5,
        "legend.label.style.color": "#000000",
        "legend.label.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "legend.label.style.fontSize": "12px",
        "legend.label.style.fontStyle": "normal",
        "legend.label.style.fontWeight": "normal",
        "legend.label.text.total": "Total",
        "legend.marker.shape": "squareWithRadius",
        "legend.marker.size": null,
        "legend.maxNumOfItems": null,
        "legend.mouseDownShadow.color": "#808080",
        "legend.order": {
            "defaultValue": null,
            "serializable": false
        },
        "legend.postRenderer": null,
        "legend.scrollbar.border.color": "white",
        "legend.scrollbar.border.width": 0,
        "legend.scrollbar.spacing": 0,
        "legend.scrollbar.thumb.fill": "#e5e5e5",
        "legend.scrollbar.thumb.hoverFill": "#dedede",
        "legend.scrollbar.track.fill": "#f7f7f7",
        "legend.showFullLabel": true,
        "legend.title.style.color": "#000000",
        "legend.title.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "legend.title.style.fontSize": "14px",
        "legend.title.style.fontStyle": "normal",
        "legend.title.style.fontWeight": "bold",
        "legend.title.text": null,
        "legend.title.visible": false,
        "legend.visible": true,
        "legendGroup.computedVisibility": {
            "defaultValue": true,
            "readonly": true,
            "serializable": false
        },
        "legendGroup.forceToShow": false,
        "legendGroup.layout.alignment": "topLeft",
        "legendGroup.layout.height": null,
        "legendGroup.layout.maxHeight": 0.25,
        "legendGroup.layout.maxWidth": 0.25,
        "legendGroup.layout.position": "right",
        "legendGroup.layout.respectPlotPosition": true,
        "legendGroup.layout.width": null,
        "legendGroup.renderTo": null,
        "plotArea.background.border.bottom.visible": true,
        "plotArea.background.border.left.visible": true,
        "plotArea.background.border.right.visible": true,
        "plotArea.background.border.stroke": "#d8d8d8",
        "plotArea.background.border.strokeWidth": 1,
        "plotArea.background.border.top.visible": true,
        "plotArea.background.color": "transparent",
        "plotArea.background.drawingEffect": "normal",
        "plotArea.background.gradientDirection": "horizontal",
        "plotArea.background.visible": true,
        "plotArea.colorPalette": {
            "defaultValue": [
                "#748CB2",
                "#9CC677",
                "#EACF5E",
                "#F9AD79",
                "#D16A7C",
                "#8873A2",
                "#3A95B3",
                "#B6D949",
                "#FDD36C",
                "#F47958",
                "#A65084",
                "#0063B1",
                "#0DA841",
                "#FCB71D",
                "#F05620",
                "#B22D6E",
                "#3C368E",
                "#8FB2CF",
                "#95D4AB",
                "#EAE98F",
                "#F9BE92",
                "#EC9A99",
                "#BC98BD",
                "#1EB7B2",
                "#73C03C",
                "#F48323",
                "#EB271B",
                "#D9B5CA",
                "#AED1DA",
                "#DFECB2",
                "#FCDAB0",
                "#F5BCB4"
            ],
            "serializable": false
        },
        "plotArea.dataLabel.formatString": null,
        "plotArea.dataLabel.hideWhenOverlap": false,
        "plotArea.dataLabel.renderer": null,
        "plotArea.dataLabel.style.color": "#333333",
        "plotArea.dataLabel.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "plotArea.dataLabel.style.fontSize": "12px",
        "plotArea.dataLabel.style.fontStyle": "normal",
        "plotArea.dataLabel.style.fontWeight": "normal",
        "plotArea.dataLabel.unitFormatType": "FinancialUnits",
        "plotArea.dataLabel.visible": false,
        "plotArea.dataPoint.color.total": "#848f94",
        "plotArea.dataPoint.stroke.color": "#000000",
        "plotArea.dataPoint.stroke.visible": false,
        "plotArea.dataPointSize.max": 96,
        "plotArea.dataPointSize.min": 24,
        "plotArea.dataPointStyle": null,
        "plotArea.dataPointStyleMode": "update",
        "plotArea.defaultOthersStyle.color": "#000000",
        "plotArea.drawingEffect": "normal",
        "plotArea.gap.barSpacing": 1,
        "plotArea.gridline.color": "#d8d8d8",
        "plotArea.gridline.size": 1,
        "plotArea.gridline.type": "line",
        "plotArea.gridline.visible": true,
        "plotArea.gridline.zeroLine.color": null,
        "plotArea.gridline.zeroLine.highlight": true,
        "plotArea.gridline.zeroLine.unhighlightAxis": true,
        "plotArea.isFixedDataPointSize": false,
        "plotArea.linkline.color": "#333333",
        "plotArea.linkline.size": 1,
        "plotArea.linkline.type": "line",
        "plotArea.linkline.visible": true,
        "plotArea.markerRenderer": null,
        "plotArea.primaryScale.autoMaxValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.primaryScale.autoMinValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.primaryScale.fixedRange": {
            "defaultValue": false,
            "serializable": false
        },
        "plotArea.primaryScale.maxValue": {
            "defaultValue": null,
            "serializable": false
        },
        "plotArea.primaryScale.minValue": {
            "defaultValue": null,
            "serializable": false
        },
        "plotArea.referenceLine.defaultStyle.color": "#666666",
        "plotArea.referenceLine.defaultStyle.label.background": "#ffffff",
        "plotArea.referenceLine.defaultStyle.label.color": "#333333",
        "plotArea.referenceLine.defaultStyle.label.fontFamily": "\"Open Sans\", Arial, Helvetica, sans-serif",
        "plotArea.referenceLine.defaultStyle.label.fontSize": "12px",
        "plotArea.referenceLine.defaultStyle.label.fontStyle": "normal",
        "plotArea.referenceLine.defaultStyle.label.fontWeight": "normal",
        "plotArea.referenceLine.defaultStyle.size": 1,
        "plotArea.referenceLine.defaultStyle.type": "dotted",
        "plotArea.referenceLine.line": null,
        "plotArea.scrollbar.border.color": "white",
        "plotArea.scrollbar.border.width": 0,
        "plotArea.scrollbar.spacing": 0,
        "plotArea.scrollbar.thumb.fill": "#e5e5e5",
        "plotArea.scrollbar.thumb.hoverFill": "#dedede",
        "plotArea.scrollbar.track.fill": "#f7f7f7",
        "plotArea.window.end": null,
        "plotArea.window.start": null,
        "propertyZone": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "title.layout.height": null,
        "tooltip.background.borderColor": "#cccccc",
        "tooltip.background.color": "#ffffff",
        "tooltip.bodyDimensionLabel.color": "#666666",
        "tooltip.bodyDimensionValue.color": "#666666",
        "tooltip.bodyMeasureLabel.color": "#666666",
        "tooltip.bodyMeasureValue.color": "#000000",
        "tooltip.closeButton.backgroundColor": "#ffffff",
        "tooltip.closeButton.borderColor": "#cccccc",
        "tooltip.footerLabel.color": "#000000",
        "tooltip.formatString": null,
        "tooltip.layinChart": true,
        "tooltip.postRender": null,
        "tooltip.preRender": {
            "defaultValue": null,
            "serializable": false
        },
        "tooltip.separationLine.color": "#a7a9ac",
        "tooltip.unitFormatType": "FinancialUnits",
        "tooltip.visible": true,
        "valueAxis.axisLine.size": 1,
        "valueAxis.axisLine.visible": true,
        "valueAxis.axisTick.visible": true,
        "valueAxis.color": "#6c6c6c",
        "valueAxis.label.formatString": null,
        "valueAxis.label.style.color": "#333333",
        "valueAxis.label.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "valueAxis.label.style.fontSize": "12px",
        "valueAxis.label.style.fontStyle": "normal",
        "valueAxis.label.style.fontWeight": "normal",
        "valueAxis.label.unitFormatType": "FinancialUnits",
        "valueAxis.label.visible": true,
        "valueAxis.layout.height": null,
        "valueAxis.layout.maxHeight": 0.25,
        "valueAxis.layout.maxWidth": 0.25,
        "valueAxis.layout.width": null,
        "valueAxis.title.applyAxislineColor": false,
        "valueAxis.title.style.color": "#000000",
        "valueAxis.title.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "valueAxis.title.style.fontSize": "14px",
        "valueAxis.title.style.fontStyle": "normal",
        "valueAxis.title.style.fontWeight": "bold",
        "valueAxis.title.text": null,
        "valueAxis.title.visible": false,
        "valueAxis.visible": true
    },
    "info/horizontal_waterfall": {
        "categoryAxis.axisLine.size": 1,
        "categoryAxis.axisLine.visible": true,
        "categoryAxis.axisTick.visible": true,
        "categoryAxis.color": "#6c6c6c",
        "categoryAxis.hoverShadow.color": "#cccccc",
        "categoryAxis.label.hideSubLevels": false,
        "categoryAxis.label.style.color": "#333333",
        "categoryAxis.label.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "categoryAxis.label.style.fontSize": "12px",
        "categoryAxis.label.style.fontStyle": "normal",
        "categoryAxis.label.style.fontWeight": "normal",
        "categoryAxis.label.visible": true,
        "categoryAxis.labelRenderer": null,
        "categoryAxis.layout.height": null,
        "categoryAxis.layout.maxHeight": 0.3,
        "categoryAxis.layout.maxWidth": 0.3,
        "categoryAxis.layout.width": null,
        "categoryAxis.mouseDownShadow.color": "#808080",
        "categoryAxis.title.applyAxislineColor": false,
        "categoryAxis.title.style.color": "#000000",
        "categoryAxis.title.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "categoryAxis.title.style.fontSize": "14px",
        "categoryAxis.title.style.fontStyle": "normal",
        "categoryAxis.title.style.fontWeight": "bold",
        "categoryAxis.title.text": null,
        "categoryAxis.title.visible": false,
        "categoryAxis.visible": true,
        "feedingZone": {
            "defaultValue": [
                {
                    "bindDef": [
                        {
                            "id": null
                        }
                    ],
                    "bound": [
                        [
                            [
                                0,
                                0
                            ],
                            [
                                0,
                                0
                            ],
                            [
                                0,
                                0
                            ],
                            [
                                0,
                                0
                            ]
                        ]
                    ],
                    "name": null
                }
            ],
            "readonly": true,
            "serializable": false
        },
        "general.groupData": false,
        "interaction.behaviorType": null,
        "interaction.decorations": {
            "defaultValue": null,
            "serializable": false
        },
        "interaction.deselected.color": null,
        "interaction.deselected.opacity": 0.4,
        "interaction.deselected.stroke.color": "darken(20%)",
        "interaction.deselected.stroke.visible": false,
        "interaction.deselected.stroke.width": "1px",
        "interaction.enableKeyboard": false,
        "interaction.hover.color": null,
        "interaction.hover.opacity": 1,
        "interaction.hover.stroke.color": "darken(20%)",
        "interaction.hover.stroke.visible": true,
        "interaction.hover.stroke.width": "2px",
        "interaction.noninteractiveMode": false,
        "interaction.selectability.axisLabelSelection": true,
        "interaction.selectability.legendSelection": true,
        "interaction.selectability.mode": "INCLUSIVE",
        "interaction.selectability.plotLassoSelection": true,
        "interaction.selectability.plotStdSelection": true,
        "interaction.selected.color": null,
        "interaction.selected.stroke.color": "darken(20%)",
        "interaction.selected.stroke.visible": true,
        "interaction.selected.stroke.width": "1px",
        "interaction.zoom.direction": "all",
        "interaction.zoom.enablement": "auto",
        "legend.drawingEffect": "normal",
        "legend.hoverShadow.color": "#cccccc",
        "legend.isScrollable": false,
        "legend.itemMargin": 0.5,
        "legend.label.style.color": "#000000",
        "legend.label.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "legend.label.style.fontSize": "12px",
        "legend.label.style.fontStyle": "normal",
        "legend.label.style.fontWeight": "normal",
        "legend.label.text.negativeValue": "Decreasing",
        "legend.label.text.positiveValue": "Increasing",
        "legend.label.text.total": "Total",
        "legend.marker.shape": "squareWithRadius",
        "legend.marker.size": null,
        "legend.maxNumOfItems": null,
        "legend.mouseDownShadow.color": "#808080",
        "legend.order": {
            "defaultValue": null,
            "serializable": false
        },
        "legend.postRenderer": null,
        "legend.scrollbar.border.color": "white",
        "legend.scrollbar.border.width": 0,
        "legend.scrollbar.spacing": 0,
        "legend.scrollbar.thumb.fill": "#e5e5e5",
        "legend.scrollbar.thumb.hoverFill": "#dedede",
        "legend.scrollbar.track.fill": "#f7f7f7",
        "legend.showFullLabel": true,
        "legend.title.style.color": "#000000",
        "legend.title.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "legend.title.style.fontSize": "14px",
        "legend.title.style.fontStyle": "normal",
        "legend.title.style.fontWeight": "bold",
        "legend.title.text": null,
        "legend.title.visible": false,
        "legend.visible": true,
        "legendGroup.computedVisibility": {
            "defaultValue": true,
            "readonly": true,
            "serializable": false
        },
        "legendGroup.forceToShow": false,
        "legendGroup.layout.alignment": "topLeft",
        "legendGroup.layout.height": null,
        "legendGroup.layout.maxHeight": 0.25,
        "legendGroup.layout.maxWidth": 0.25,
        "legendGroup.layout.position": "right",
        "legendGroup.layout.respectPlotPosition": true,
        "legendGroup.layout.width": null,
        "legendGroup.renderTo": null,
        "plotArea.background.border.bottom.visible": true,
        "plotArea.background.border.left.visible": true,
        "plotArea.background.border.right.visible": true,
        "plotArea.background.border.stroke": "#d8d8d8",
        "plotArea.background.border.strokeWidth": 1,
        "plotArea.background.border.top.visible": true,
        "plotArea.background.color": "transparent",
        "plotArea.background.drawingEffect": "normal",
        "plotArea.background.gradientDirection": "horizontal",
        "plotArea.background.visible": true,
        "plotArea.colorPalette": {
            "defaultValue": [
                "#748CB2",
                "#9CC677",
                "#EACF5E",
                "#F9AD79",
                "#D16A7C",
                "#8873A2",
                "#3A95B3",
                "#B6D949",
                "#FDD36C",
                "#F47958",
                "#A65084",
                "#0063B1",
                "#0DA841",
                "#FCB71D",
                "#F05620",
                "#B22D6E",
                "#3C368E",
                "#8FB2CF",
                "#95D4AB",
                "#EAE98F",
                "#F9BE92",
                "#EC9A99",
                "#BC98BD",
                "#1EB7B2",
                "#73C03C",
                "#F48323",
                "#EB271B",
                "#D9B5CA",
                "#AED1DA",
                "#DFECB2",
                "#FCDAB0",
                "#F5BCB4"
            ],
            "serializable": false
        },
        "plotArea.dataLabel.formatString": null,
        "plotArea.dataLabel.hideWhenOverlap": false,
        "plotArea.dataLabel.renderer": null,
        "plotArea.dataLabel.style.color": "#333333",
        "plotArea.dataLabel.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "plotArea.dataLabel.style.fontSize": "12px",
        "plotArea.dataLabel.style.fontStyle": "normal",
        "plotArea.dataLabel.style.fontWeight": "normal",
        "plotArea.dataLabel.unitFormatType": "FinancialUnits",
        "plotArea.dataLabel.visible": false,
        "plotArea.dataPoint.color.isSemanticColoring": true,
        "plotArea.dataPoint.color.negative": "#EB271B",
        "plotArea.dataPoint.color.positive": "#67AC36",
        "plotArea.dataPoint.color.total": "#848f94",
        "plotArea.dataPoint.stroke.color": "#000000",
        "plotArea.dataPoint.stroke.visible": false,
        "plotArea.dataPointSize.max": 96,
        "plotArea.dataPointSize.min": 24,
        "plotArea.dataPointStyle": null,
        "plotArea.dataPointStyleMode": "update",
        "plotArea.defaultOthersStyle.color": "#000000",
        "plotArea.drawingEffect": "normal",
        "plotArea.gap.barSpacing": 1,
        "plotArea.gap.groupSpacing": 1,
        "plotArea.gap.innerGroupSpacing": 0.125,
        "plotArea.gridline.color": "#d8d8d8",
        "plotArea.gridline.size": 1,
        "plotArea.gridline.type": "line",
        "plotArea.gridline.visible": true,
        "plotArea.gridline.zeroLine.color": null,
        "plotArea.gridline.zeroLine.highlight": true,
        "plotArea.gridline.zeroLine.unhighlightAxis": true,
        "plotArea.isFixedDataPointSize": false,
        "plotArea.linkline.color": "#333333",
        "plotArea.linkline.size": 1,
        "plotArea.linkline.type": "line",
        "plotArea.linkline.visible": true,
        "plotArea.markerRenderer": null,
        "plotArea.primaryScale.autoMaxValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.primaryScale.autoMinValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.primaryScale.fixedRange": {
            "defaultValue": false,
            "serializable": false
        },
        "plotArea.primaryScale.maxValue": {
            "defaultValue": null,
            "serializable": false
        },
        "plotArea.primaryScale.minValue": {
            "defaultValue": null,
            "serializable": false
        },
        "plotArea.referenceLine.defaultStyle.color": "#666666",
        "plotArea.referenceLine.defaultStyle.label.background": "#ffffff",
        "plotArea.referenceLine.defaultStyle.label.color": "#333333",
        "plotArea.referenceLine.defaultStyle.label.fontFamily": "\"Open Sans\", Arial, Helvetica, sans-serif",
        "plotArea.referenceLine.defaultStyle.label.fontSize": "12px",
        "plotArea.referenceLine.defaultStyle.label.fontStyle": "normal",
        "plotArea.referenceLine.defaultStyle.label.fontWeight": "normal",
        "plotArea.referenceLine.defaultStyle.size": 1,
        "plotArea.referenceLine.defaultStyle.type": "dotted",
        "plotArea.referenceLine.line": null,
        "plotArea.scrollbar.border.color": "white",
        "plotArea.scrollbar.border.width": 0,
        "plotArea.scrollbar.spacing": 0,
        "plotArea.scrollbar.thumb.fill": "#e5e5e5",
        "plotArea.scrollbar.thumb.hoverFill": "#dedede",
        "plotArea.scrollbar.track.fill": "#f7f7f7",
        "plotArea.window.end": null,
        "plotArea.window.start": null,
        "propertyZone": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "title.layout.height": null,
        "tooltip.background.borderColor": "#cccccc",
        "tooltip.background.color": "#ffffff",
        "tooltip.bodyDimensionLabel.color": "#666666",
        "tooltip.bodyDimensionValue.color": "#666666",
        "tooltip.bodyMeasureLabel.color": "#666666",
        "tooltip.bodyMeasureValue.color": "#000000",
        "tooltip.closeButton.backgroundColor": "#ffffff",
        "tooltip.closeButton.borderColor": "#cccccc",
        "tooltip.footerLabel.color": "#000000",
        "tooltip.formatString": null,
        "tooltip.layinChart": true,
        "tooltip.postRender": null,
        "tooltip.preRender": {
            "defaultValue": null,
            "serializable": false
        },
        "tooltip.separationLine.color": "#a7a9ac",
        "tooltip.unitFormatType": "FinancialUnits",
        "tooltip.visible": true,
        "valueAxis.axisLine.size": 1,
        "valueAxis.axisLine.visible": true,
        "valueAxis.axisTick.visible": true,
        "valueAxis.color": "#6c6c6c",
        "valueAxis.label.formatString": null,
        "valueAxis.label.style.color": "#333333",
        "valueAxis.label.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "valueAxis.label.style.fontSize": "12px",
        "valueAxis.label.style.fontStyle": "normal",
        "valueAxis.label.style.fontWeight": "normal",
        "valueAxis.label.unitFormatType": "FinancialUnits",
        "valueAxis.label.visible": true,
        "valueAxis.layout.height": null,
        "valueAxis.layout.maxHeight": 0.25,
        "valueAxis.layout.maxWidth": 0.25,
        "valueAxis.layout.width": null,
        "valueAxis.title.applyAxislineColor": false,
        "valueAxis.title.style.color": "#000000",
        "valueAxis.title.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "valueAxis.title.style.fontSize": "14px",
        "valueAxis.title.style.fontStyle": "normal",
        "valueAxis.title.style.fontWeight": "bold",
        "valueAxis.title.text": null,
        "valueAxis.title.visible": false,
        "valueAxis.visible": true
    },
    "info/line": {
        "categoryAxis.axisLine.size": 1,
        "categoryAxis.axisLine.visible": true,
        "categoryAxis.axisTick.visible": true,
        "categoryAxis.color": "#6c6c6c",
        "categoryAxis.hoverShadow.color": "#cccccc",
        "categoryAxis.label.angle": 90,
        "categoryAxis.label.hideSubLevels": false,
        "categoryAxis.label.rotation": "auto",
        "categoryAxis.label.style.color": "#333333",
        "categoryAxis.label.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "categoryAxis.label.style.fontSize": "12px",
        "categoryAxis.label.style.fontStyle": "normal",
        "categoryAxis.label.style.fontWeight": "normal",
        "categoryAxis.label.truncatedLabelRatio": 0.2,
        "categoryAxis.label.visible": true,
        "categoryAxis.labelRenderer": null,
        "categoryAxis.layout.height": null,
        "categoryAxis.layout.maxHeight": 0.3,
        "categoryAxis.layout.maxWidth": 0.3,
        "categoryAxis.layout.width": null,
        "categoryAxis.mouseDownShadow.color": "#808080",
        "categoryAxis.title.applyAxislineColor": false,
        "categoryAxis.title.style.color": "#000000",
        "categoryAxis.title.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "categoryAxis.title.style.fontSize": "14px",
        "categoryAxis.title.style.fontStyle": "normal",
        "categoryAxis.title.style.fontWeight": "bold",
        "categoryAxis.title.text": null,
        "categoryAxis.title.visible": false,
        "categoryAxis.visible": true,
        "interaction.selectability.axisLabelSelection": true,
        "plotArea.isFixedDataPointSize": false,
        "plotArea.lineRenderer": null,
        "plotArea.lineStyle": null,
        "plotArea.lineVisible": true,
        "plotArea.marker.displayMode": "manual",
        "plotArea.marker.shape": "circle",
        "plotArea.marker.size": 6,
        "plotArea.marker.visible": true,
        "plotArea.primaryScale.autoMaxValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.primaryScale.autoMinValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.primaryScale.fixedRange": {
            "defaultValue": false,
            "serializable": false
        },
        "plotArea.primaryScale.maxValue": {
            "defaultValue": null,
            "serializable": false
        },
        "plotArea.primaryScale.minValue": {
            "defaultValue": null,
            "serializable": false
        },
        "plotArea.width": 2
    },
    "info/mekko": {
        "categoryAxis.axisLine.size": 1,
        "categoryAxis.axisLine.visible": true,
        "categoryAxis.axisTick.visible": true,
        "categoryAxis.color": "#6c6c6c",
        "categoryAxis.hoverShadow.color": "#cccccc",
        "categoryAxis.label.angle": 90,
        "categoryAxis.label.hideSubLevels": false,
        "categoryAxis.label.rotation": "auto",
        "categoryAxis.label.style.color": "#333333",
        "categoryAxis.label.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "categoryAxis.label.style.fontSize": "12px",
        "categoryAxis.label.style.fontStyle": "normal",
        "categoryAxis.label.style.fontWeight": "normal",
        "categoryAxis.label.truncatedLabelRatio": 0.2,
        "categoryAxis.label.visible": true,
        "categoryAxis.labelRenderer": null,
        "categoryAxis.layout.height": null,
        "categoryAxis.layout.maxHeight": 0.3,
        "categoryAxis.layout.maxWidth": 0.3,
        "categoryAxis.layout.width": null,
        "categoryAxis.mouseDownShadow.color": "#808080",
        "categoryAxis.title.applyAxislineColor": false,
        "categoryAxis.title.style.color": "#000000",
        "categoryAxis.title.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "categoryAxis.title.style.fontSize": "14px",
        "categoryAxis.title.style.fontStyle": "normal",
        "categoryAxis.title.style.fontWeight": "bold",
        "categoryAxis.title.text": null,
        "categoryAxis.title.visible": false,
        "categoryAxis.visible": true,
        "feedingZone": {
            "defaultValue": [
                {
                    "bindDef": [
                        {
                            "id": null
                        }
                    ],
                    "bound": [
                        [
                            [
                                0,
                                0
                            ],
                            [
                                0,
                                0
                            ],
                            [
                                0,
                                0
                            ],
                            [
                                0,
                                0
                            ]
                        ]
                    ],
                    "name": null
                }
            ],
            "readonly": true,
            "serializable": false
        },
        "general.groupData": false,
        "interaction.behaviorType": null,
        "interaction.decorations": {
            "defaultValue": null,
            "serializable": false
        },
        "interaction.deselected.color": null,
        "interaction.deselected.opacity": 0.4,
        "interaction.deselected.stroke.color": "darken(20%)",
        "interaction.deselected.stroke.visible": false,
        "interaction.deselected.stroke.width": "1px",
        "interaction.hover.color": null,
        "interaction.hover.opacity": 1,
        "interaction.hover.stroke.color": "darken(20%)",
        "interaction.hover.stroke.visible": true,
        "interaction.hover.stroke.width": "2px",
        "interaction.noninteractiveMode": false,
        "interaction.selectability.axisLabelSelection": true,
        "interaction.selectability.legendSelection": true,
        "interaction.selectability.mode": "INCLUSIVE",
        "interaction.selectability.plotLassoSelection": true,
        "interaction.selectability.plotStdSelection": true,
        "interaction.selected.color": null,
        "interaction.selected.stroke.color": "darken(20%)",
        "interaction.selected.stroke.visible": true,
        "interaction.selected.stroke.width": "1px",
        "interaction.zoom.direction": "all",
        "interaction.zoom.enablement": "auto",
        "legend.drawingEffect": "normal",
        "legend.hoverShadow.color": "#cccccc",
        "legend.isScrollable": false,
        "legend.itemMargin": 0.5,
        "legend.label.style.color": "#000000",
        "legend.label.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "legend.label.style.fontSize": "12px",
        "legend.label.style.fontStyle": "normal",
        "legend.label.style.fontWeight": "normal",
        "legend.marker.shape": "squareWithRadius",
        "legend.marker.size": null,
        "legend.maxNumOfItems": null,
        "legend.mouseDownShadow.color": "#808080",
        "legend.order": {
            "defaultValue": null,
            "serializable": false
        },
        "legend.postRenderer": null,
        "legend.scrollbar.border.color": "white",
        "legend.scrollbar.border.width": 0,
        "legend.scrollbar.spacing": 0,
        "legend.scrollbar.thumb.fill": "#e5e5e5",
        "legend.scrollbar.thumb.hoverFill": "#dedede",
        "legend.scrollbar.track.fill": "#f7f7f7",
        "legend.showFullLabel": true,
        "legend.title.style.color": "#000000",
        "legend.title.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "legend.title.style.fontSize": "14px",
        "legend.title.style.fontStyle": "normal",
        "legend.title.style.fontWeight": "bold",
        "legend.title.text": null,
        "legend.title.visible": false,
        "legend.visible": true,
        "legendGroup.computedVisibility": {
            "defaultValue": true,
            "readonly": true,
            "serializable": false
        },
        "legendGroup.forceToShow": false,
        "legendGroup.layout.alignment": "topLeft",
        "legendGroup.layout.height": null,
        "legendGroup.layout.maxHeight": 0.25,
        "legendGroup.layout.maxWidth": 0.25,
        "legendGroup.layout.position": "right",
        "legendGroup.layout.respectPlotPosition": true,
        "legendGroup.layout.width": null,
        "legendGroup.renderTo": null,
        "plotArea.background.border.bottom.visible": true,
        "plotArea.background.border.left.visible": true,
        "plotArea.background.border.right.visible": true,
        "plotArea.background.border.stroke": "#d8d8d8",
        "plotArea.background.border.strokeWidth": 1,
        "plotArea.background.border.top.visible": true,
        "plotArea.background.color": "transparent",
        "plotArea.background.drawingEffect": "normal",
        "plotArea.background.gradientDirection": "vertical",
        "plotArea.background.visible": true,
        "plotArea.colorPalette": {
            "defaultValue": [
                "#748CB2",
                "#9CC677",
                "#EACF5E",
                "#F9AD79",
                "#D16A7C",
                "#8873A2",
                "#3A95B3",
                "#B6D949",
                "#FDD36C",
                "#F47958",
                "#A65084",
                "#0063B1",
                "#0DA841",
                "#FCB71D",
                "#F05620",
                "#B22D6E",
                "#3C368E",
                "#8FB2CF",
                "#95D4AB",
                "#EAE98F",
                "#F9BE92",
                "#EC9A99",
                "#BC98BD",
                "#1EB7B2",
                "#73C03C",
                "#F48323",
                "#EB271B",
                "#D9B5CA",
                "#AED1DA",
                "#DFECB2",
                "#FCDAB0",
                "#F5BCB4"
            ],
            "serializable": false
        },
        "plotArea.dataLabel.formatString": null,
        "plotArea.dataLabel.hideWhenOverlap": false,
        "plotArea.dataLabel.renderer": null,
        "plotArea.dataLabel.style.color": "#333333",
        "plotArea.dataLabel.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "plotArea.dataLabel.style.fontSize": "12px",
        "plotArea.dataLabel.style.fontStyle": "normal",
        "plotArea.dataLabel.style.fontWeight": "normal",
        "plotArea.dataLabel.unitFormatType": "FinancialUnits",
        "plotArea.dataLabel.visible": false,
        "plotArea.dataPoint.stroke.color": "#000000",
        "plotArea.dataPoint.stroke.visible": false,
        "plotArea.dataPointStyle": null,
        "plotArea.dataPointStyleMode": "update",
        "plotArea.defaultOthersStyle.color": "#000000",
        "plotArea.drawingEffect": "normal",
        "plotArea.gridline.color": "#d8d8d8",
        "plotArea.gridline.size": 1,
        "plotArea.gridline.type": "line",
        "plotArea.gridline.visible": true,
        "plotArea.isFixedDataPointSize": false,
        "plotArea.markerRenderer": null,
        "plotArea.primaryScale.autoMaxValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.primaryScale.autoMinValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.primaryScale.fixedRange": {
            "defaultValue": false,
            "serializable": false
        },
        "plotArea.primaryScale.maxValue": {
            "defaultValue": null,
            "serializable": false
        },
        "plotArea.primaryScale.minValue": {
            "defaultValue": null,
            "serializable": false
        },
        "plotArea.referenceLine.defaultStyle.color": "#666666",
        "plotArea.referenceLine.defaultStyle.label.background": "#ffffff",
        "plotArea.referenceLine.defaultStyle.label.color": "#333333",
        "plotArea.referenceLine.defaultStyle.label.fontFamily": "\"Open Sans\", Arial, Helvetica, sans-serif",
        "plotArea.referenceLine.defaultStyle.label.fontSize": "12px",
        "plotArea.referenceLine.defaultStyle.label.fontStyle": "normal",
        "plotArea.referenceLine.defaultStyle.label.fontWeight": "normal",
        "plotArea.referenceLine.defaultStyle.size": 1,
        "plotArea.referenceLine.defaultStyle.type": "dotted",
        "plotArea.referenceLine.line": null,
        "plotArea.scrollbar.border.color": "white",
        "plotArea.scrollbar.border.width": 0,
        "plotArea.scrollbar.spacing": 0,
        "plotArea.scrollbar.thumb.fill": "#e5e5e5",
        "plotArea.scrollbar.thumb.hoverFill": "#dedede",
        "plotArea.scrollbar.track.fill": "#f7f7f7",
        "plotArea.window.end": null,
        "plotArea.window.start": null,
        "propertyZone": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "title.layout.height": null,
        "tooltip.background.borderColor": "#cccccc",
        "tooltip.background.color": "#ffffff",
        "tooltip.bodyDimensionLabel.color": "#666666",
        "tooltip.bodyDimensionValue.color": "#666666",
        "tooltip.bodyMeasureLabel.color": "#666666",
        "tooltip.bodyMeasureValue.color": "#000000",
        "tooltip.closeButton.backgroundColor": "#ffffff",
        "tooltip.closeButton.borderColor": "#cccccc",
        "tooltip.footerLabel.color": "#000000",
        "tooltip.formatString": null,
        "tooltip.layinChart": true,
        "tooltip.postRender": null,
        "tooltip.preRender": {
            "defaultValue": null,
            "serializable": false
        },
        "tooltip.separationLine.color": "#a7a9ac",
        "tooltip.unitFormatType": "FinancialUnits",
        "tooltip.visible": true,
        "valueAxis.axisLine.size": 1,
        "valueAxis.axisLine.visible": true,
        "valueAxis.axisTick.visible": true,
        "valueAxis.color": "#6c6c6c",
        "valueAxis.label.formatString": null,
        "valueAxis.label.style.color": "#333333",
        "valueAxis.label.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "valueAxis.label.style.fontSize": "12px",
        "valueAxis.label.style.fontStyle": "normal",
        "valueAxis.label.style.fontWeight": "normal",
        "valueAxis.label.unitFormatType": "FinancialUnits",
        "valueAxis.label.visible": true,
        "valueAxis.layout.height": null,
        "valueAxis.layout.maxHeight": 0.25,
        "valueAxis.layout.maxWidth": 0.25,
        "valueAxis.layout.width": null,
        "valueAxis.title.applyAxislineColor": false,
        "valueAxis.title.style.color": "#000000",
        "valueAxis.title.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "valueAxis.title.style.fontSize": "14px",
        "valueAxis.title.style.fontStyle": "normal",
        "valueAxis.title.style.fontWeight": "bold",
        "valueAxis.title.text": null,
        "valueAxis.title.visible": false,
        "valueAxis.visible": true,
        "valueAxis2.axisLine.size": 1,
        "valueAxis2.axisLine.visible": true,
        "valueAxis2.axisTick.visible": true,
        "valueAxis2.color": "#6c6c6c",
        "valueAxis2.label.formatString": null,
        "valueAxis2.label.style.color": "#333333",
        "valueAxis2.label.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "valueAxis2.label.style.fontSize": "12px",
        "valueAxis2.label.style.fontStyle": "normal",
        "valueAxis2.label.style.fontWeight": "normal",
        "valueAxis2.label.unitFormatType": "FinancialUnits",
        "valueAxis2.label.visible": true,
        "valueAxis2.layout.height": null,
        "valueAxis2.layout.maxHeight": 0.25,
        "valueAxis2.layout.maxWidth": 0.25,
        "valueAxis2.layout.width": null,
        "valueAxis2.title.applyAxislineColor": false,
        "valueAxis2.title.style.color": "#000000",
        "valueAxis2.title.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "valueAxis2.title.style.fontSize": "14px",
        "valueAxis2.title.style.fontStyle": "normal",
        "valueAxis2.title.style.fontWeight": "bold",
        "valueAxis2.title.text": null,
        "valueAxis2.title.visible": false,
        "valueAxis2.visible": true
    },
    "info/number": {
        "feedingZone": {
            "defaultValue": [
                {
                    "bindDef": [
                        {
                            "id": null
                        }
                    ],
                    "bound": [
                        [
                            [
                                0,
                                0
                            ],
                            [
                                0,
                                0
                            ],
                            [
                                0,
                                0
                            ],
                            [
                                0,
                                0
                            ]
                        ]
                    ],
                    "name": null
                }
            ],
            "readonly": true,
            "serializable": false
        },
        "general.groupData": false,
        "interaction.behaviorType": null,
        "plotArea.background.border.bottom.visible": false,
        "plotArea.background.border.left.visible": false,
        "plotArea.background.border.right.visible": false,
        "plotArea.background.border.stroke": "#d8d8d8",
        "plotArea.background.border.strokeWidth": 1,
        "plotArea.background.border.top.visible": false,
        "plotArea.background.color": "transparent",
        "plotArea.background.drawingEffect": "normal",
        "plotArea.background.gradientDirection": "vertical",
        "plotArea.background.visible": true,
        "plotArea.valuePoint.label.alignment": "center",
        "plotArea.valuePoint.label.fontColor": "black",
        "plotArea.valuePoint.label.fontFamily": "Arial",
        "plotArea.valuePoint.label.fontSize": 72,
        "plotArea.valuePoint.label.fontStyle": "normal",
        "plotArea.valuePoint.label.fontWeight": "normal",
        "plotArea.valuePoint.label.formatString": null,
        "plotArea.valuePoint.label.unitFormatType": "FinancialUnits",
        "propertyZone": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "title.layout.height": null,
        "title.layout.position": "top"
    },
    "info/pie": {
        "interaction.enableKeyboard": false,
        "interaction.noninteractiveMode": false,
        "legendGroup.forceToShow": false,
        "legendGroup.layout.height": null,
        "legendGroup.layout.width": null,
        "plotArea.background.border.bottom.visible": false,
        "plotArea.background.border.left.visible": false,
        "plotArea.background.border.right.visible": false,
        "plotArea.background.border.top.visible": false,
        "plotArea.highlight.contextInfos": [],
        "title.layout.height": null
    },
    "info/radar": {
        "feedingZone": {
            "defaultValue": [
                {
                    "bindDef": [
                        {
                            "id": null
                        }
                    ],
                    "bound": [
                        [
                            [
                                0,
                                0
                            ],
                            [
                                0,
                                0
                            ],
                            [
                                0,
                                0
                            ],
                            [
                                0,
                                0
                            ]
                        ]
                    ],
                    "name": null
                }
            ],
            "readonly": true,
            "serializable": false
        },
        "general.groupData": false,
        "interaction.behaviorType": null,
        "interaction.decorations": {
            "defaultValue": null,
            "serializable": false
        },
        "interaction.deselected.area.color": null,
        "interaction.deselected.area.opacity": 0.12,
        "interaction.deselected.color": null,
        "interaction.deselected.opacity": 0.4,
        "interaction.deselected.stroke.color": "darken(20%)",
        "interaction.deselected.stroke.visible": false,
        "interaction.deselected.stroke.width": "1px",
        "interaction.hover.color": null,
        "interaction.hover.opacity": 1,
        "interaction.hover.stroke.color": "darken(20%)",
        "interaction.hover.stroke.visible": true,
        "interaction.hover.stroke.width": "2px",
        "interaction.noninteractiveMode": false,
        "interaction.selectability.axisLabelSelection": true,
        "interaction.selectability.legendSelection": true,
        "interaction.selectability.mode": "INCLUSIVE",
        "interaction.selectability.plotLassoSelection": true,
        "interaction.selectability.plotStdSelection": true,
        "interaction.selected.area.color": null,
        "interaction.selected.area.opacity": 0.4,
        "interaction.selected.color": null,
        "interaction.selected.stroke.color": "darken(20%)",
        "interaction.selected.stroke.visible": true,
        "interaction.selected.stroke.width": "1px",
        "legend.drawingEffect": "normal",
        "legend.hoverShadow.color": "#cccccc",
        "legend.isScrollable": false,
        "legend.itemMargin": 0.5,
        "legend.label.style.color": "#000000",
        "legend.label.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "legend.label.style.fontSize": "12px",
        "legend.label.style.fontStyle": "normal",
        "legend.label.style.fontWeight": "normal",
        "legend.marker.size": null,
        "legend.maxNumOfItems": null,
        "legend.mouseDownShadow.color": "#808080",
        "legend.order": {
            "defaultValue": null,
            "serializable": false
        },
        "legend.postRenderer": null,
        "legend.scrollbar.border.color": "white",
        "legend.scrollbar.border.width": 0,
        "legend.scrollbar.spacing": 0,
        "legend.scrollbar.thumb.fill": "#e5e5e5",
        "legend.scrollbar.thumb.hoverFill": "#dedede",
        "legend.scrollbar.track.fill": "#f7f7f7",
        "legend.showFullLabel": true,
        "legend.title.style.color": "#000000",
        "legend.title.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "legend.title.style.fontSize": "14px",
        "legend.title.style.fontStyle": "normal",
        "legend.title.style.fontWeight": "bold",
        "legend.title.text": null,
        "legend.title.visible": false,
        "legend.visible": true,
        "legendGroup.computedVisibility": {
            "defaultValue": true,
            "readonly": true,
            "serializable": false
        },
        "legendGroup.forceToShow": false,
        "legendGroup.layout.alignment": "topLeft",
        "legendGroup.layout.height": null,
        "legendGroup.layout.maxHeight": 0.25,
        "legendGroup.layout.maxWidth": 0.25,
        "legendGroup.layout.position": "right",
        "legendGroup.layout.respectPlotPosition": true,
        "legendGroup.layout.width": null,
        "legendGroup.renderTo": null,
        "plotArea.area.opacity": 0.3,
        "plotArea.area.visible": false,
        "plotArea.background.border.bottom.visible": true,
        "plotArea.background.border.left.visible": true,
        "plotArea.background.border.right.visible": true,
        "plotArea.background.border.stroke": "#d8d8d8",
        "plotArea.background.border.strokeWidth": 1,
        "plotArea.background.border.top.visible": true,
        "plotArea.background.color": "transparent",
        "plotArea.background.drawingEffect": "normal",
        "plotArea.background.gradientDirection": "vertical",
        "plotArea.background.visible": true,
        "plotArea.dataLabel.formatString": null,
        "plotArea.dataLabel.hideWhenOverlap": false,
        "plotArea.dataLabel.renderer": null,
        "plotArea.dataLabel.style.color": "darken(20%)",
        "plotArea.dataLabel.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "plotArea.dataLabel.style.fontSize": "12px",
        "plotArea.dataLabel.style.fontStyle": "normal",
        "plotArea.dataLabel.style.fontWeight": "normal",
        "plotArea.dataLabel.unitFormatType": "FinancialUnits",
        "plotArea.dataLabel.visible": false,
        "plotArea.dataPoint.stroke.color": "#000000",
        "plotArea.dataPoint.stroke.visible": false,
        "plotArea.drawingEffect": "normal",
        "plotArea.gridline.color": "#d8d8d8",
        "plotArea.gridline.size": 1,
        "plotArea.gridline.visible": true,
        "plotArea.line.visible": true,
        "plotArea.line.width": 2,
        "plotArea.marker.shape": "circle",
        "plotArea.marker.size": 6,
        "plotArea.marker.visible": true,
        "plotArea.polarAxis.axisLine.size": 1,
        "plotArea.polarAxis.axisLine.visible": true,
        "plotArea.polarAxis.color": "#999999",
        "plotArea.polarAxis.hoverShadow.color": "#cccccc",
        "plotArea.polarAxis.label.style.color": "#666666",
        "plotArea.polarAxis.label.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "plotArea.polarAxis.label.style.fontSize": "12px",
        "plotArea.polarAxis.label.style.fontStyle": "normal",
        "plotArea.polarAxis.label.style.fontWeight": "normal",
        "plotArea.polarAxis.label.visible": true,
        "plotArea.polarAxis.labelRenderer": null,
        "plotArea.polarAxis.mouseDownShadow.color": "#808080",
        "plotArea.polarAxis.title.style.color": "#000000",
        "plotArea.polarAxis.title.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "plotArea.polarAxis.title.style.fontSize": "14px",
        "plotArea.polarAxis.title.style.fontStyle": "normal",
        "plotArea.polarAxis.title.style.fontWeight": "bold",
        "plotArea.polarAxis.title.text": null,
        "plotArea.polarAxis.title.visible": false,
        "plotArea.polarAxis.visible": true,
        "plotArea.primaryScale.autoMaxValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.primaryScale.autoMinValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.primaryScale.fixedRange": {
            "defaultValue": false,
            "serializable": false
        },
        "plotArea.primaryScale.maxValue": {
            "defaultValue": null,
            "serializable": false
        },
        "plotArea.primaryScale.minValue": {
            "defaultValue": null,
            "serializable": false
        },
        "plotArea.valueAxis.label.formatString": null,
        "plotArea.valueAxis.label.style.color": "#333333",
        "plotArea.valueAxis.label.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "plotArea.valueAxis.label.style.fontSize": "12px",
        "plotArea.valueAxis.label.style.fontStyle": "normal",
        "plotArea.valueAxis.label.style.fontWeight": "normal",
        "plotArea.valueAxis.label.unitFormatType": "FinancialUnits",
        "plotArea.valueAxis.label.visible": true,
        "plotArea.valueAxis.title.style.color": "#000000",
        "plotArea.valueAxis.title.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "plotArea.valueAxis.title.style.fontSize": "14px",
        "plotArea.valueAxis.title.style.fontStyle": "normal",
        "plotArea.valueAxis.title.style.fontWeight": "bold",
        "plotArea.valueAxis.title.text": null,
        "plotArea.valueAxis.title.visible": false,
        "plotArea.valueAxis.visible": true,
        "propertyZone": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "title.layout.height": null,
        "tooltip.background.borderColor": "#cccccc",
        "tooltip.background.color": "#ffffff",
        "tooltip.bodyDimensionLabel.color": "#666666",
        "tooltip.bodyDimensionValue.color": "#666666",
        "tooltip.bodyMeasureLabel.color": "#666666",
        "tooltip.bodyMeasureValue.color": "#000000",
        "tooltip.closeButton.backgroundColor": "#ffffff",
        "tooltip.closeButton.borderColor": "#cccccc",
        "tooltip.footerLabel.color": "#000000",
        "tooltip.formatString": null,
        "tooltip.layinChart": true,
        "tooltip.postRender": null,
        "tooltip.preRender": {
            "defaultValue": null,
            "serializable": false
        },
        "tooltip.separationLine.color": "#a7a9ac",
        "tooltip.unitFormatType": "FinancialUnits",
        "tooltip.visible": true
    },
    "info/scatter": {
        "interaction.enableKeyboard": false,
        "interaction.noninteractiveMode": false,
        "interaction.selectability.axisLabelSelection": true,
        "interaction.zoom.enablement": "auto",
        "legendGroup.forceToShow": false,
        "legendGroup.layout.height": null,
        "legendGroup.layout.width": null,
        "plotArea.background.border.bottom.visible": true,
        "plotArea.background.border.left.visible": true,
        "plotArea.background.border.right.visible": true,
        "plotArea.background.border.top.visible": true,
        "plotArea.markerSize": 10,
        "plotArea.secondaryScale.autoMaxValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.secondaryScale.autoMinValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.secondaryScale.fixedRange": {
            "defaultValue": false,
            "serializable": false
        },
        "plotArea.secondaryScale.maxValue": {
            "defaultValue": null,
            "serializable": false
        },
        "plotArea.secondaryScale.minValue": {
            "defaultValue": null,
            "serializable": false
        },
        "plotArea.window.end": null,
        "plotArea.window.start": null,
        "title.layout.height": null,
        "valueAxis.label.formatString": null,
        "valueAxis.layout.height": null,
        "valueAxis.layout.width": null,
        "valueAxis2.axisLine.size": 1,
        "valueAxis2.axisLine.visible": true,
        "valueAxis2.axisTick.visible": true,
        "valueAxis2.color": "#6c6c6c",
        "valueAxis2.label.formatString": null,
        "valueAxis2.label.style.color": "#333333",
        "valueAxis2.label.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "valueAxis2.label.style.fontSize": "12px",
        "valueAxis2.label.style.fontStyle": "normal",
        "valueAxis2.label.style.fontWeight": "normal",
        "valueAxis2.label.unitFormatType": "FinancialUnits",
        "valueAxis2.label.visible": true,
        "valueAxis2.layout.height": null,
        "valueAxis2.layout.maxHeight": 0.25,
        "valueAxis2.layout.maxWidth": 0.25,
        "valueAxis2.layout.width": null,
        "valueAxis2.title.applyAxislineColor": false,
        "valueAxis2.title.style.color": "#000000",
        "valueAxis2.title.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "valueAxis2.title.style.fontSize": "14px",
        "valueAxis2.title.style.fontStyle": "normal",
        "valueAxis2.title.style.fontWeight": "bold",
        "valueAxis2.title.text": null,
        "valueAxis2.title.visible": false,
        "valueAxis2.visible": true
    },
    "info/stacked_bar": {
        "categoryAxis.axisLine.size": 1,
        "categoryAxis.axisLine.visible": true,
        "categoryAxis.axisTick.visible": true,
        "categoryAxis.color": "#6c6c6c",
        "categoryAxis.hoverShadow.color": "#cccccc",
        "categoryAxis.label.hideSubLevels": false,
        "categoryAxis.label.style.color": "#333333",
        "categoryAxis.label.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "categoryAxis.label.style.fontSize": "12px",
        "categoryAxis.label.style.fontStyle": "normal",
        "categoryAxis.label.style.fontWeight": "normal",
        "categoryAxis.label.visible": true,
        "categoryAxis.labelRenderer": null,
        "categoryAxis.layout.height": null,
        "categoryAxis.layout.maxHeight": 0.3,
        "categoryAxis.layout.maxWidth": 0.3,
        "categoryAxis.layout.width": null,
        "categoryAxis.mouseDownShadow.color": "#808080",
        "categoryAxis.title.applyAxislineColor": false,
        "categoryAxis.title.style.color": "#000000",
        "categoryAxis.title.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "categoryAxis.title.style.fontSize": "14px",
        "categoryAxis.title.style.fontStyle": "normal",
        "categoryAxis.title.style.fontWeight": "bold",
        "categoryAxis.title.text": null,
        "categoryAxis.title.visible": false,
        "categoryAxis.visible": true,
        "interaction.selectability.axisLabelSelection": true,
        "legend.marker.shape": "squareWithRadius",
        "plotArea.background.gradientDirection": "horizontal",
        "plotArea.dataLabel.showTotal": false,
        "plotArea.dataPointSize.max": 96,
        "plotArea.dataPointSize.min": 24,
        "plotArea.gap.barSpacing": 1,
        "plotArea.isFixedDataPointSize": false,
        "plotArea.primaryScale.autoMaxValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.primaryScale.autoMinValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.primaryScale.fixedRange": {
            "defaultValue": false,
            "serializable": false
        },
        "plotArea.primaryScale.maxValue": {
            "defaultValue": null,
            "serializable": false
        },
        "plotArea.primaryScale.minValue": {
            "defaultValue": null,
            "serializable": false
        }
    },
    "info/stacked_column": {
        "categoryAxis.axisLine.size": 1,
        "categoryAxis.axisLine.visible": true,
        "categoryAxis.axisTick.visible": true,
        "categoryAxis.color": "#6c6c6c",
        "categoryAxis.hoverShadow.color": "#cccccc",
        "categoryAxis.label.angle": 90,
        "categoryAxis.label.hideSubLevels": false,
        "categoryAxis.label.rotation": "auto",
        "categoryAxis.label.style.color": "#333333",
        "categoryAxis.label.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "categoryAxis.label.style.fontSize": "12px",
        "categoryAxis.label.style.fontStyle": "normal",
        "categoryAxis.label.style.fontWeight": "normal",
        "categoryAxis.label.truncatedLabelRatio": 0.2,
        "categoryAxis.label.visible": true,
        "categoryAxis.labelRenderer": null,
        "categoryAxis.layout.height": null,
        "categoryAxis.layout.maxHeight": 0.3,
        "categoryAxis.layout.maxWidth": 0.3,
        "categoryAxis.layout.width": null,
        "categoryAxis.mouseDownShadow.color": "#808080",
        "categoryAxis.title.applyAxislineColor": false,
        "categoryAxis.title.style.color": "#000000",
        "categoryAxis.title.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "categoryAxis.title.style.fontSize": "14px",
        "categoryAxis.title.style.fontStyle": "normal",
        "categoryAxis.title.style.fontWeight": "bold",
        "categoryAxis.title.text": null,
        "categoryAxis.title.visible": false,
        "categoryAxis.visible": true,
        "interaction.selectability.axisLabelSelection": true,
        "legend.marker.shape": "squareWithRadius",
        "plotArea.dataLabel.showTotal": false,
        "plotArea.dataPointSize.max": 96,
        "plotArea.dataPointSize.min": 24,
        "plotArea.gap.barSpacing": 1,
        "plotArea.isFixedDataPointSize": false,
        "plotArea.primaryScale.autoMaxValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.primaryScale.autoMinValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.primaryScale.fixedRange": {
            "defaultValue": false,
            "serializable": false
        },
        "plotArea.primaryScale.maxValue": {
            "defaultValue": null,
            "serializable": false
        },
        "plotArea.primaryScale.minValue": {
            "defaultValue": null,
            "serializable": false
        }
    },
    "info/stacked_combination": {
        "categoryAxis.axisLine.size": 1,
        "categoryAxis.axisLine.visible": true,
        "categoryAxis.axisTick.visible": true,
        "categoryAxis.color": "#6c6c6c",
        "categoryAxis.hoverShadow.color": "#cccccc",
        "categoryAxis.label.angle": 90,
        "categoryAxis.label.hideSubLevels": false,
        "categoryAxis.label.rotation": "auto",
        "categoryAxis.label.style.color": "#333333",
        "categoryAxis.label.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "categoryAxis.label.style.fontSize": "12px",
        "categoryAxis.label.style.fontStyle": "normal",
        "categoryAxis.label.style.fontWeight": "normal",
        "categoryAxis.label.truncatedLabelRatio": 0.2,
        "categoryAxis.label.visible": true,
        "categoryAxis.labelRenderer": null,
        "categoryAxis.layout.height": null,
        "categoryAxis.layout.maxHeight": 0.3,
        "categoryAxis.layout.maxWidth": 0.3,
        "categoryAxis.layout.width": null,
        "categoryAxis.mouseDownShadow.color": "#808080",
        "categoryAxis.title.applyAxislineColor": false,
        "categoryAxis.title.style.color": "#000000",
        "categoryAxis.title.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "categoryAxis.title.style.fontSize": "14px",
        "categoryAxis.title.style.fontStyle": "normal",
        "categoryAxis.title.style.fontWeight": "bold",
        "categoryAxis.title.text": null,
        "categoryAxis.title.visible": false,
        "categoryAxis.visible": true,
        "interaction.selectability.axisLabelSelection": true,
        "legend.groupByShape": false,
        "legend.marker.shape": "squareWithRadius",
        "plotArea.dataPointSize.max": 96,
        "plotArea.dataPointSize.min": 24,
        "plotArea.dataShape.primaryAxis": [
            "bar",
            "line",
            "line"
        ],
        "plotArea.gap.barSpacing": 1,
        "plotArea.isFixedDataPointSize": false,
        "plotArea.line.lineRenderer": null,
        "plotArea.line.marker.shape": "circle",
        "plotArea.line.marker.size": 6,
        "plotArea.line.marker.visible": true,
        "plotArea.line.style": null,
        "plotArea.line.visible": true,
        "plotArea.line.width": 2,
        "plotArea.primaryScale.autoMaxValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.primaryScale.autoMinValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.primaryScale.fixedRange": {
            "defaultValue": false,
            "serializable": false
        },
        "plotArea.primaryScale.maxValue": {
            "defaultValue": null,
            "serializable": false
        },
        "plotArea.primaryScale.minValue": {
            "defaultValue": null,
            "serializable": false
        }
    },
    "info/stacked_waterfall": {
        "categoryAxis.axisLine.size": 1,
        "categoryAxis.axisLine.visible": true,
        "categoryAxis.axisTick.visible": true,
        "categoryAxis.color": "#6c6c6c",
        "categoryAxis.hoverShadow.color": "#cccccc",
        "categoryAxis.label.angle": 90,
        "categoryAxis.label.hideSubLevels": false,
        "categoryAxis.label.rotation": "auto",
        "categoryAxis.label.style.color": "#333333",
        "categoryAxis.label.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "categoryAxis.label.style.fontSize": "12px",
        "categoryAxis.label.style.fontStyle": "normal",
        "categoryAxis.label.style.fontWeight": "normal",
        "categoryAxis.label.truncatedLabelRatio": 0.2,
        "categoryAxis.label.visible": true,
        "categoryAxis.labelRenderer": null,
        "categoryAxis.layout.height": null,
        "categoryAxis.layout.maxHeight": 0.3,
        "categoryAxis.layout.maxWidth": 0.3,
        "categoryAxis.layout.width": null,
        "categoryAxis.mouseDownShadow.color": "#808080",
        "categoryAxis.title.applyAxislineColor": false,
        "categoryAxis.title.style.color": "#000000",
        "categoryAxis.title.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "categoryAxis.title.style.fontSize": "14px",
        "categoryAxis.title.style.fontStyle": "normal",
        "categoryAxis.title.style.fontWeight": "bold",
        "categoryAxis.title.text": null,
        "categoryAxis.title.visible": false,
        "categoryAxis.visible": true,
        "feedingZone": {
            "defaultValue": [
                {
                    "bindDef": [
                        {
                            "id": null
                        }
                    ],
                    "bound": [
                        [
                            [
                                0,
                                0
                            ],
                            [
                                0,
                                0
                            ],
                            [
                                0,
                                0
                            ],
                            [
                                0,
                                0
                            ]
                        ]
                    ],
                    "name": null
                }
            ],
            "readonly": true,
            "serializable": false
        },
        "general.groupData": false,
        "interaction.behaviorType": null,
        "interaction.decorations": {
            "defaultValue": null,
            "serializable": false
        },
        "interaction.deselected.color": null,
        "interaction.deselected.opacity": 0.4,
        "interaction.deselected.stroke.color": "darken(20%)",
        "interaction.deselected.stroke.visible": false,
        "interaction.deselected.stroke.width": "1px",
        "interaction.enableKeyboard": false,
        "interaction.hover.color": null,
        "interaction.hover.opacity": 1,
        "interaction.hover.stroke.color": "darken(20%)",
        "interaction.hover.stroke.visible": true,
        "interaction.hover.stroke.width": "2px",
        "interaction.noninteractiveMode": false,
        "interaction.selectability.axisLabelSelection": true,
        "interaction.selectability.legendSelection": true,
        "interaction.selectability.mode": "INCLUSIVE",
        "interaction.selectability.plotLassoSelection": true,
        "interaction.selectability.plotStdSelection": true,
        "interaction.selected.color": null,
        "interaction.selected.stroke.color": "darken(20%)",
        "interaction.selected.stroke.visible": true,
        "interaction.selected.stroke.width": "1px",
        "interaction.zoom.direction": "all",
        "interaction.zoom.enablement": "auto",
        "legend.drawingEffect": "normal",
        "legend.hoverShadow.color": "#cccccc",
        "legend.isScrollable": false,
        "legend.itemMargin": 0.5,
        "legend.label.style.color": "#000000",
        "legend.label.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "legend.label.style.fontSize": "12px",
        "legend.label.style.fontStyle": "normal",
        "legend.label.style.fontWeight": "normal",
        "legend.label.text.total": "Total",
        "legend.marker.shape": "squareWithRadius",
        "legend.marker.size": null,
        "legend.maxNumOfItems": null,
        "legend.mouseDownShadow.color": "#808080",
        "legend.order": {
            "defaultValue": null,
            "serializable": false
        },
        "legend.postRenderer": null,
        "legend.scrollbar.border.color": "white",
        "legend.scrollbar.border.width": 0,
        "legend.scrollbar.spacing": 0,
        "legend.scrollbar.thumb.fill": "#e5e5e5",
        "legend.scrollbar.thumb.hoverFill": "#dedede",
        "legend.scrollbar.track.fill": "#f7f7f7",
        "legend.showFullLabel": true,
        "legend.title.style.color": "#000000",
        "legend.title.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "legend.title.style.fontSize": "14px",
        "legend.title.style.fontStyle": "normal",
        "legend.title.style.fontWeight": "bold",
        "legend.title.text": null,
        "legend.title.visible": false,
        "legend.visible": true,
        "legendGroup.computedVisibility": {
            "defaultValue": true,
            "readonly": true,
            "serializable": false
        },
        "legendGroup.forceToShow": false,
        "legendGroup.layout.alignment": "topLeft",
        "legendGroup.layout.height": null,
        "legendGroup.layout.maxHeight": 0.25,
        "legendGroup.layout.maxWidth": 0.25,
        "legendGroup.layout.position": "right",
        "legendGroup.layout.respectPlotPosition": true,
        "legendGroup.layout.width": null,
        "legendGroup.renderTo": null,
        "plotArea.background.border.bottom.visible": true,
        "plotArea.background.border.left.visible": true,
        "plotArea.background.border.right.visible": true,
        "plotArea.background.border.stroke": "#d8d8d8",
        "plotArea.background.border.strokeWidth": 1,
        "plotArea.background.border.top.visible": true,
        "plotArea.background.color": "transparent",
        "plotArea.background.drawingEffect": "normal",
        "plotArea.background.gradientDirection": "vertical",
        "plotArea.background.visible": true,
        "plotArea.colorPalette": {
            "defaultValue": [
                "#748CB2",
                "#9CC677",
                "#EACF5E",
                "#F9AD79",
                "#D16A7C",
                "#8873A2",
                "#3A95B3",
                "#B6D949",
                "#FDD36C",
                "#F47958",
                "#A65084",
                "#0063B1",
                "#0DA841",
                "#FCB71D",
                "#F05620",
                "#B22D6E",
                "#3C368E",
                "#8FB2CF",
                "#95D4AB",
                "#EAE98F",
                "#F9BE92",
                "#EC9A99",
                "#BC98BD",
                "#1EB7B2",
                "#73C03C",
                "#F48323",
                "#EB271B",
                "#D9B5CA",
                "#AED1DA",
                "#DFECB2",
                "#FCDAB0",
                "#F5BCB4"
            ],
            "serializable": false
        },
        "plotArea.dataLabel.formatString": null,
        "plotArea.dataLabel.hideWhenOverlap": false,
        "plotArea.dataLabel.renderer": null,
        "plotArea.dataLabel.style.color": "#333333",
        "plotArea.dataLabel.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "plotArea.dataLabel.style.fontSize": "12px",
        "plotArea.dataLabel.style.fontStyle": "normal",
        "plotArea.dataLabel.style.fontWeight": "normal",
        "plotArea.dataLabel.unitFormatType": "FinancialUnits",
        "plotArea.dataLabel.visible": false,
        "plotArea.dataPoint.color.total": "#848f94",
        "plotArea.dataPoint.stroke.color": "#000000",
        "plotArea.dataPoint.stroke.visible": false,
        "plotArea.dataPointSize.max": 96,
        "plotArea.dataPointSize.min": 24,
        "plotArea.dataPointStyle": null,
        "plotArea.dataPointStyleMode": "update",
        "plotArea.defaultOthersStyle.color": "#000000",
        "plotArea.drawingEffect": "normal",
        "plotArea.gap.barSpacing": 1,
        "plotArea.gridline.color": "#d8d8d8",
        "plotArea.gridline.size": 1,
        "plotArea.gridline.type": "line",
        "plotArea.gridline.visible": true,
        "plotArea.gridline.zeroLine.color": null,
        "plotArea.gridline.zeroLine.highlight": true,
        "plotArea.gridline.zeroLine.unhighlightAxis": true,
        "plotArea.isFixedDataPointSize": false,
        "plotArea.linkline.color": "#333333",
        "plotArea.linkline.size": 1,
        "plotArea.linkline.type": "line",
        "plotArea.linkline.visible": true,
        "plotArea.markerRenderer": null,
        "plotArea.primaryScale.autoMaxValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.primaryScale.autoMinValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.primaryScale.fixedRange": {
            "defaultValue": false,
            "serializable": false
        },
        "plotArea.primaryScale.maxValue": {
            "defaultValue": null,
            "serializable": false
        },
        "plotArea.primaryScale.minValue": {
            "defaultValue": null,
            "serializable": false
        },
        "plotArea.referenceLine.defaultStyle.color": "#666666",
        "plotArea.referenceLine.defaultStyle.label.background": "#ffffff",
        "plotArea.referenceLine.defaultStyle.label.color": "#333333",
        "plotArea.referenceLine.defaultStyle.label.fontFamily": "\"Open Sans\", Arial, Helvetica, sans-serif",
        "plotArea.referenceLine.defaultStyle.label.fontSize": "12px",
        "plotArea.referenceLine.defaultStyle.label.fontStyle": "normal",
        "plotArea.referenceLine.defaultStyle.label.fontWeight": "normal",
        "plotArea.referenceLine.defaultStyle.size": 1,
        "plotArea.referenceLine.defaultStyle.type": "dotted",
        "plotArea.referenceLine.line": null,
        "plotArea.scrollbar.border.color": "white",
        "plotArea.scrollbar.border.width": 0,
        "plotArea.scrollbar.spacing": 0,
        "plotArea.scrollbar.thumb.fill": "#e5e5e5",
        "plotArea.scrollbar.thumb.hoverFill": "#dedede",
        "plotArea.scrollbar.track.fill": "#f7f7f7",
        "plotArea.window.end": null,
        "plotArea.window.start": null,
        "propertyZone": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "title.layout.height": null,
        "tooltip.background.borderColor": "#cccccc",
        "tooltip.background.color": "#ffffff",
        "tooltip.bodyDimensionLabel.color": "#666666",
        "tooltip.bodyDimensionValue.color": "#666666",
        "tooltip.bodyMeasureLabel.color": "#666666",
        "tooltip.bodyMeasureValue.color": "#000000",
        "tooltip.closeButton.backgroundColor": "#ffffff",
        "tooltip.closeButton.borderColor": "#cccccc",
        "tooltip.footerLabel.color": "#000000",
        "tooltip.formatString": null,
        "tooltip.layinChart": true,
        "tooltip.postRender": null,
        "tooltip.preRender": {
            "defaultValue": null,
            "serializable": false
        },
        "tooltip.separationLine.color": "#a7a9ac",
        "tooltip.unitFormatType": "FinancialUnits",
        "tooltip.visible": true,
        "valueAxis.axisLine.size": 1,
        "valueAxis.axisLine.visible": true,
        "valueAxis.axisTick.visible": true,
        "valueAxis.color": "#6c6c6c",
        "valueAxis.label.formatString": null,
        "valueAxis.label.style.color": "#333333",
        "valueAxis.label.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "valueAxis.label.style.fontSize": "12px",
        "valueAxis.label.style.fontStyle": "normal",
        "valueAxis.label.style.fontWeight": "normal",
        "valueAxis.label.unitFormatType": "FinancialUnits",
        "valueAxis.label.visible": true,
        "valueAxis.layout.height": null,
        "valueAxis.layout.maxHeight": 0.25,
        "valueAxis.layout.maxWidth": 0.25,
        "valueAxis.layout.width": null,
        "valueAxis.title.applyAxislineColor": false,
        "valueAxis.title.style.color": "#000000",
        "valueAxis.title.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "valueAxis.title.style.fontSize": "14px",
        "valueAxis.title.style.fontStyle": "normal",
        "valueAxis.title.style.fontWeight": "bold",
        "valueAxis.title.text": null,
        "valueAxis.title.visible": false,
        "valueAxis.visible": true
    },
    "info/tagcloud": {
        "feedingZone": {
            "defaultValue": [
                {
                    "bindDef": [
                        {
                            "id": null
                        }
                    ],
                    "bound": [
                        [
                            [
                                0,
                                0
                            ],
                            [
                                0,
                                0
                            ],
                            [
                                0,
                                0
                            ],
                            [
                                0,
                                0
                            ]
                        ]
                    ],
                    "name": null
                }
            ],
            "readonly": true,
            "serializable": false
        },
        "interaction.behaviorType": null,
        "interaction.decorations": {
            "defaultValue": null,
            "serializable": false
        },
        "interaction.noninteractiveMode": false,
        "interaction.selectability.legendSelection": true,
        "interaction.selectability.mode": "INCLUSIVE",
        "interaction.selectability.plotLassoSelection": true,
        "interaction.selectability.plotStdSelection": true,
        "legend.drawingEffect": "normal",
        "legend.formatString": null,
        "legend.hoverShadow.color": "#cccccc",
        "legend.label.style.color": "#000000",
        "legend.label.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "legend.label.style.fontSize": "12px",
        "legend.label.style.fontStyle": "normal",
        "legend.label.style.fontWeight": "normal",
        "legend.mouseDownShadow.color": "#808080",
        "legend.postRenderer": null,
        "legend.title.style.color": "#000000",
        "legend.title.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "legend.title.style.fontSize": "14px",
        "legend.title.style.fontStyle": "normal",
        "legend.title.style.fontWeight": "bold",
        "legend.title.text": null,
        "legend.title.visible": false,
        "legend.unitFormatType": "FinancialUnits",
        "legend.visible": true,
        "legendGroup.computedVisibility": {
            "defaultValue": true,
            "readonly": true,
            "serializable": false
        },
        "legendGroup.forceToShow": false,
        "legendGroup.layout.alignment": "topLeft",
        "legendGroup.layout.height": null,
        "legendGroup.layout.maxHeight": 0.25,
        "legendGroup.layout.maxWidth": 0.25,
        "legendGroup.layout.position": "right",
        "legendGroup.layout.width": null,
        "legendGroup.renderTo": null,
        "plotArea.background.border.bottom.visible": false,
        "plotArea.background.border.left.visible": false,
        "plotArea.background.border.right.visible": false,
        "plotArea.background.border.stroke": "#d8d8d8",
        "plotArea.background.border.strokeWidth": 1,
        "plotArea.background.border.top.visible": false,
        "plotArea.background.color": "transparent",
        "plotArea.background.drawingEffect": "normal",
        "plotArea.background.gradientDirection": "vertical",
        "plotArea.background.visible": true,
        "plotArea.colorPalette": {
            "defaultValue": [],
            "serializable": false
        },
        "plotArea.endColor": {
            "defaultValue": "#73C03C",
            "serializable": false
        },
        "plotArea.layout.mode": "Wordle",
        "plotArea.layout.textDirection": "Mixed",
        "plotArea.legendValues": {
            "defaultValue": [],
            "serializable": false
        },
        "plotArea.numOfTruncation": 10,
        "plotArea.startColor": "#C2E3A9",
        "propertyZone": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "title.layout.height": null,
        "tooltip.background.borderColor": "#cccccc",
        "tooltip.background.color": "#ffffff",
        "tooltip.bodyDimensionLabel.color": "#666666",
        "tooltip.bodyDimensionValue.color": "#666666",
        "tooltip.bodyMeasureLabel.color": "#666666",
        "tooltip.bodyMeasureValue.color": "#000000",
        "tooltip.closeButton.backgroundColor": "#ffffff",
        "tooltip.closeButton.borderColor": "#cccccc",
        "tooltip.footerLabel.color": "#000000",
        "tooltip.formatString": null,
        "tooltip.layinChart": true,
        "tooltip.postRender": null,
        "tooltip.preRender": {
            "defaultValue": null,
            "serializable": false
        },
        "tooltip.separationLine.color": "#a7a9ac",
        "tooltip.unitFormatType": "FinancialUnits",
        "tooltip.visible": true
    },
    "info/time_bubble": {
        "interaction.enableKeyboard": false,
        "interaction.noninteractiveMode": false,
        "interaction.selectability.axisLabelSelection": true,
        "interaction.zoom.enablement": "auto",
        "legendGroup.forceToShow": false,
        "legendGroup.layout.height": null,
        "legendGroup.layout.width": null,
        "plotArea.background.border.bottom.visible": true,
        "plotArea.background.border.left.visible": true,
        "plotArea.background.border.right.visible": true,
        "plotArea.background.border.top.visible": true,
        "plotArea.dataLabel.respectShapeWidth": false,
        "plotArea.dataLabel.type": "bubbleWidth",
        "plotArea.minMarkerSize": null,
        "plotArea.secondaryScale.autoMaxValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.secondaryScale.autoMinValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.secondaryScale.fixedRange": {
            "defaultValue": false,
            "serializable": false
        },
        "plotArea.secondaryScale.maxValue": {
            "defaultValue": null,
            "serializable": false
        },
        "plotArea.secondaryScale.minValue": {
            "defaultValue": null,
            "serializable": false
        },
        "plotArea.showNegativeValues": true,
        "plotArea.window.end": null,
        "plotArea.window.start": null,
        "sizeLegend.drawingEffect": "normal",
        "sizeLegend.formatString": null,
        "sizeLegend.label.style.color": "#000000",
        "sizeLegend.label.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "sizeLegend.label.style.fontSize": "12px",
        "sizeLegend.label.style.fontStyle": "normal",
        "sizeLegend.label.style.fontWeight": "normal",
        "sizeLegend.title.style.color": "#000000",
        "sizeLegend.title.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "sizeLegend.title.style.fontSize": "14px",
        "sizeLegend.title.style.fontStyle": "normal",
        "sizeLegend.title.style.fontWeight": "bold",
        "sizeLegend.title.text": null,
        "sizeLegend.title.visible": false,
        "sizeLegend.unitFormatType": "FinancialUnits",
        "sizeLegend.visible": true,
        "title.layout.height": null,
        "valueAxis.axisTick.fixedTicks": null,
        "valueAxis.layout.height": null,
        "valueAxis.layout.width": null,
        "valueAxis2.axisLine.size": 1,
        "valueAxis2.axisLine.visible": true,
        "valueAxis2.axisTick.visible": true,
        "valueAxis2.color": "#6c6c6c",
        "valueAxis2.label.formatString": null,
        "valueAxis2.label.style.color": "#333333",
        "valueAxis2.label.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "valueAxis2.label.style.fontSize": "12px",
        "valueAxis2.label.style.fontStyle": "normal",
        "valueAxis2.label.style.fontWeight": "normal",
        "valueAxis2.label.unitFormatType": "FinancialUnits",
        "valueAxis2.label.visible": true,
        "valueAxis2.layout.height": null,
        "valueAxis2.layout.maxHeight": 0.25,
        "valueAxis2.layout.maxWidth": 0.25,
        "valueAxis2.layout.width": null,
        "valueAxis2.title.applyAxislineColor": false,
        "valueAxis2.title.style.color": "#000000",
        "valueAxis2.title.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "valueAxis2.title.style.fontSize": "14px",
        "valueAxis2.title.style.fontStyle": "normal",
        "valueAxis2.title.style.fontWeight": "bold",
        "valueAxis2.title.text": null,
        "valueAxis2.title.visible": false,
        "valueAxis2.visible": true
    },
    "info/timeseries_bubble": {
        "general.showAsUTC": false,
        "interaction.enableKeyboard": false,
        "interaction.noninteractiveMode": false,
        "interaction.zoom.enablement": "auto",
        "legendGroup.forceToShow": false,
        "legendGroup.layout.height": null,
        "legendGroup.layout.width": null,
        "plotArea.background.border.bottom.visible": true,
        "plotArea.background.border.left.visible": true,
        "plotArea.background.border.right.visible": true,
        "plotArea.background.border.top.visible": true,
        "plotArea.dataLabel.respectShapeWidth": false,
        "plotArea.dataLabel.type": "bubbleWidth",
        "plotArea.minMarkerSize": null,
        "plotArea.window.end": null,
        "plotArea.window.start": null,
        "sizeLegend.drawingEffect": "normal",
        "sizeLegend.formatString": null,
        "sizeLegend.label.style.color": "#000000",
        "sizeLegend.label.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "sizeLegend.label.style.fontSize": "12px",
        "sizeLegend.label.style.fontStyle": "normal",
        "sizeLegend.label.style.fontWeight": "normal",
        "sizeLegend.title.style.color": "#000000",
        "sizeLegend.title.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "sizeLegend.title.style.fontSize": "14px",
        "sizeLegend.title.style.fontStyle": "normal",
        "sizeLegend.title.style.fontWeight": "bold",
        "sizeLegend.title.text": null,
        "sizeLegend.title.visible": false,
        "sizeLegend.unitFormatType": "FinancialUnits",
        "sizeLegend.visible": true,
        "timeAxis.axisLine.size": 1,
        "timeAxis.axisLine.visible": true,
        "timeAxis.axisTick.visible": true,
        "timeAxis.color": "#6c6c6c",
        "timeAxis.label.style.color": "#333333",
        "timeAxis.label.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "timeAxis.label.style.fontSize": "12px",
        "timeAxis.label.style.fontStyle": "normal",
        "timeAxis.label.style.fontWeight": "normal",
        "timeAxis.label.visible": true,
        "timeAxis.layout.height": null,
        "timeAxis.layout.maxHeight": 0.3,
        "timeAxis.levelConfig": null,
        "timeAxis.levels": [
            "day",
            "month",
            "year"
        ],
        "timeAxis.title.style.color": "#000000",
        "timeAxis.title.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "timeAxis.title.style.fontSize": "14px",
        "timeAxis.title.style.fontStyle": "normal",
        "timeAxis.title.style.fontWeight": "bold",
        "timeAxis.title.text": null,
        "timeAxis.title.visible": false,
        "timeAxis.visible": true,
        "title.layout.height": null,
        "valueAxis.label.formatString": null,
        "valueAxis.layout.height": null,
        "valueAxis.layout.width": null
    },
    "info/timeseries_line": {
        "general.showAsUTC": false,
        "interaction.syncValueAxis": false,
        "interaction.zoom.direction": "categoryAxis",
        "plotArea.dataPoint.invalidity": "break",
        "plotArea.lineRenderer": null,
        "plotArea.lineStyle": null,
        "plotArea.lineVisible": true,
        "plotArea.marker.hoverOnlyMode": {
            "defaultValue": true,
            "serializable": false
        },
        "plotArea.marker.shape": "circle",
        "plotArea.marker.size": 6,
        "plotArea.marker.visible": true,
        "plotArea.primaryScale.autoMaxValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.primaryScale.autoMinValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.primaryScale.fixedRange": {
            "defaultValue": false,
            "serializable": false
        },
        "plotArea.primaryScale.maxValue": {
            "defaultValue": null,
            "serializable": false
        },
        "plotArea.primaryScale.minValue": {
            "defaultValue": null,
            "serializable": false
        },
        "plotArea.width": 2,
        "timeAxis.axisLine.size": 1,
        "timeAxis.axisLine.visible": true,
        "timeAxis.axisTick.visible": true,
        "timeAxis.color": "#6c6c6c",
        "timeAxis.interval.keyLabel": null,
        "timeAxis.interval.number": 1,
        "timeAxis.interval.unit": "",
        "timeAxis.label.style.color": "#333333",
        "timeAxis.label.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "timeAxis.label.style.fontSize": "12px",
        "timeAxis.label.style.fontStyle": "normal",
        "timeAxis.label.style.fontWeight": "normal",
        "timeAxis.label.visible": true,
        "timeAxis.layout.height": null,
        "timeAxis.layout.maxHeight": 0.3,
        "timeAxis.levelConfig": null,
        "timeAxis.levels": [
            "day",
            "month",
            "year"
        ],
        "timeAxis.title.style.color": "#000000",
        "timeAxis.title.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "timeAxis.title.style.fontSize": "14px",
        "timeAxis.title.style.fontStyle": "normal",
        "timeAxis.title.style.fontWeight": "bold",
        "timeAxis.title.text": null,
        "timeAxis.title.visible": false,
        "timeAxis.visible": true
    },
    "info/timeseries_scatter": {
        "general.showAsUTC": false,
        "interaction.enableKeyboard": false,
        "interaction.noninteractiveMode": false,
        "interaction.zoom.enablement": "auto",
        "legendGroup.forceToShow": false,
        "legendGroup.layout.height": null,
        "legendGroup.layout.width": null,
        "plotArea.background.border.bottom.visible": true,
        "plotArea.background.border.left.visible": true,
        "plotArea.background.border.right.visible": true,
        "plotArea.background.border.top.visible": true,
        "plotArea.markerSize": 10,
        "plotArea.window.end": null,
        "plotArea.window.start": null,
        "timeAxis.axisLine.size": 1,
        "timeAxis.axisLine.visible": true,
        "timeAxis.axisTick.visible": true,
        "timeAxis.color": "#6c6c6c",
        "timeAxis.label.style.color": "#333333",
        "timeAxis.label.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "timeAxis.label.style.fontSize": "12px",
        "timeAxis.label.style.fontStyle": "normal",
        "timeAxis.label.style.fontWeight": "normal",
        "timeAxis.label.visible": true,
        "timeAxis.layout.height": null,
        "timeAxis.layout.maxHeight": 0.3,
        "timeAxis.levelConfig": null,
        "timeAxis.levels": [
            "day",
            "month",
            "year"
        ],
        "timeAxis.title.style.color": "#000000",
        "timeAxis.title.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "timeAxis.title.style.fontSize": "14px",
        "timeAxis.title.style.fontStyle": "normal",
        "timeAxis.title.style.fontWeight": "bold",
        "timeAxis.title.text": null,
        "timeAxis.title.visible": false,
        "timeAxis.visible": true,
        "title.layout.height": null,
        "valueAxis.label.formatString": null,
        "valueAxis.layout.height": null,
        "valueAxis.layout.width": null
    },
    "info/treemap": {
        "feedingZone": {
            "defaultValue": [
                {
                    "bindDef": [
                        {
                            "id": null
                        }
                    ],
                    "bound": [
                        [
                            [
                                0,
                                0
                            ],
                            [
                                0,
                                0
                            ],
                            [
                                0,
                                0
                            ],
                            [
                                0,
                                0
                            ]
                        ]
                    ],
                    "name": null
                }
            ],
            "readonly": true,
            "serializable": false
        },
        "interaction.behaviorType": null,
        "interaction.decorations": {
            "defaultValue": null,
            "serializable": false
        },
        "interaction.deselected.color": null,
        "interaction.deselected.opacity": 0.4,
        "interaction.deselected.stroke.color": "darken(20%)",
        "interaction.deselected.stroke.visible": false,
        "interaction.deselected.stroke.width": "1px",
        "interaction.hover.color": null,
        "interaction.hover.opacity": 1,
        "interaction.hover.stroke.color": "darken(20%)",
        "interaction.hover.stroke.visible": true,
        "interaction.hover.stroke.width": "2px",
        "interaction.noninteractiveMode": false,
        "interaction.selectability.axisLabelSelection": true,
        "interaction.selectability.legendSelection": true,
        "interaction.selectability.mode": "INCLUSIVE",
        "interaction.selectability.plotLassoSelection": true,
        "interaction.selectability.plotStdSelection": true,
        "interaction.selected.color": null,
        "interaction.selected.stroke.color": "darken(20%)",
        "interaction.selected.stroke.visible": true,
        "interaction.selected.stroke.width": "1px",
        "legend.drawingEffect": "normal",
        "legend.formatString": null,
        "legend.hoverShadow.color": "#cccccc",
        "legend.label.style.color": "#000000",
        "legend.label.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "legend.label.style.fontSize": "12px",
        "legend.label.style.fontStyle": "normal",
        "legend.label.style.fontWeight": "normal",
        "legend.mouseDownShadow.color": "#808080",
        "legend.postRenderer": null,
        "legend.title.style.color": "#000000",
        "legend.title.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "legend.title.style.fontSize": "14px",
        "legend.title.style.fontStyle": "normal",
        "legend.title.style.fontWeight": "bold",
        "legend.title.text": null,
        "legend.title.visible": false,
        "legend.unitFormatType": "FinancialUnits",
        "legend.visible": true,
        "legendGroup.computedVisibility": {
            "defaultValue": true,
            "readonly": true,
            "serializable": false
        },
        "legendGroup.forceToShow": false,
        "legendGroup.layout.alignment": "topLeft",
        "legendGroup.layout.height": null,
        "legendGroup.layout.maxHeight": 0.25,
        "legendGroup.layout.maxWidth": 0.25,
        "legendGroup.layout.position": "right",
        "legendGroup.layout.width": null,
        "legendGroup.renderTo": null,
        "plotArea.background.border.bottom.visible": true,
        "plotArea.background.border.left.visible": true,
        "plotArea.background.border.right.visible": true,
        "plotArea.background.border.stroke": "#d8d8d8",
        "plotArea.background.border.strokeWidth": 1,
        "plotArea.background.border.top.visible": true,
        "plotArea.background.color": "transparent",
        "plotArea.background.drawingEffect": "normal",
        "plotArea.background.gradientDirection": "vertical",
        "plotArea.background.visible": true,
        "plotArea.border.visible": true,
        "plotArea.colorPalette": {
            "defaultValue": [],
            "serializable": false
        },
        "plotArea.dataLabel.formatString": "0.0",
        "plotArea.dataLabel.hideWhenOverlap": false,
        "plotArea.dataLabel.renderer": null,
        "plotArea.dataLabel.style.color": "white",
        "plotArea.dataLabel.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "plotArea.dataLabel.style.fontSize": "12px",
        "plotArea.dataLabel.style.fontStyle": "normal",
        "plotArea.dataLabel.style.fontWeight": "normal",
        "plotArea.dataLabel.unitFormatType": "FinancialUnits",
        "plotArea.dataLabel.visible": false,
        "plotArea.dataPoint.stroke.color": "#000000",
        "plotArea.dataPoint.stroke.visible": false,
        "plotArea.dimensionLabel.renderer": null,
        "plotArea.dimensionLabel.style.color": null,
        "plotArea.dimensionLabel.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "plotArea.dimensionLabel.style.fontSize": "12px",
        "plotArea.dimensionLabel.style.fontStyle": "normal",
        "plotArea.dimensionLabel.style.fontWeight": "normal",
        "plotArea.dimensionLabel.visible": true,
        "plotArea.endColor": {
            "defaultValue": "#73C03C",
            "serializable": false
        },
        "plotArea.labelPosition": "center",
        "plotArea.legendValues": {
            "defaultValue": [],
            "serializable": false
        },
        "plotArea.startColor": "#C2E3A9",
        "propertyZone": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "title.layout.height": null,
        "tooltip.background.borderColor": "#cccccc",
        "tooltip.background.color": "#ffffff",
        "tooltip.bodyDimensionLabel.color": "#666666",
        "tooltip.bodyDimensionValue.color": "#666666",
        "tooltip.bodyMeasureLabel.color": "#666666",
        "tooltip.bodyMeasureValue.color": "#000000",
        "tooltip.closeButton.backgroundColor": "#ffffff",
        "tooltip.closeButton.borderColor": "#cccccc",
        "tooltip.footerLabel.color": "#000000",
        "tooltip.formatString": null,
        "tooltip.layinChart": true,
        "tooltip.postRender": null,
        "tooltip.preRender": {
            "defaultValue": null,
            "serializable": false
        },
        "tooltip.separationLine.color": "#a7a9ac",
        "tooltip.unitFormatType": "FinancialUnits",
        "tooltip.visible": true
    },
    "info/trellis_100_area": {
        "categoryAxis.axisLine.size": 1,
        "categoryAxis.axisLine.visible": true,
        "categoryAxis.axisTick.visible": true,
        "categoryAxis.color": "#d8d8d8",
        "categoryAxis.hoverShadow.color": "#cccccc",
        "categoryAxis.label.hideSubLevels": false,
        "categoryAxis.label.style.color": "#333333",
        "categoryAxis.label.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "categoryAxis.label.style.fontSize": "12px",
        "categoryAxis.label.style.fontStyle": "normal",
        "categoryAxis.label.style.fontWeight": "normal",
        "categoryAxis.label.visible": true,
        "categoryAxis.labelRenderer": null,
        "categoryAxis.layout.maxHeight": 0.3,
        "categoryAxis.layout.maxWidth": 0.3,
        "categoryAxis.mouseDownShadow.color": "#808080",
        "categoryAxis.title.applyAxislineColor": false,
        "categoryAxis.title.style.color": "#000000",
        "categoryAxis.title.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "categoryAxis.title.style.fontSize": "14px",
        "categoryAxis.title.style.fontStyle": "normal",
        "categoryAxis.title.style.fontWeight": "bold",
        "categoryAxis.title.text": null,
        "categoryAxis.title.visible": false,
        "categoryAxis.visible": true,
        "feedingZone": {
            "defaultValue": [
                {
                    "bindDef": [
                        {
                            "id": null
                        }
                    ],
                    "bound": [
                        [
                            [
                                0,
                                0
                            ],
                            [
                                0,
                                0
                            ],
                            [
                                0,
                                0
                            ],
                            [
                                0,
                                0
                            ]
                        ]
                    ],
                    "name": null
                }
            ],
            "readonly": true,
            "serializable": false
        },
        "general.groupData": false,
        "interaction.behaviorType": null,
        "interaction.decorations": {
            "defaultValue": null,
            "serializable": false
        },
        "interaction.deselected.color": null,
        "interaction.deselected.opacity": 0.4,
        "interaction.hover.color": null,
        "interaction.hover.stroke.color": "darken(20%)",
        "interaction.hover.stroke.visible": true,
        "interaction.hover.stroke.width": "2px",
        "interaction.selectability.axisLabelSelection": true,
        "interaction.selectability.legendSelection": true,
        "interaction.selectability.mode": "INCLUSIVE",
        "interaction.selectability.plotLassoSelection": true,
        "interaction.selectability.plotStdSelection": true,
        "interaction.selected.color": null,
        "interaction.selected.stroke.color": "darken(20%)",
        "interaction.selected.stroke.visible": true,
        "interaction.selected.stroke.width": "1px",
        "legend.drawingEffect": "normal",
        "legend.hoverShadow.color": "#cccccc",
        "legend.isScrollable": false,
        "legend.itemMargin": 0.5,
        "legend.label.style.color": "#000000",
        "legend.label.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "legend.label.style.fontSize": "12px",
        "legend.label.style.fontStyle": "normal",
        "legend.label.style.fontWeight": "normal",
        "legend.marker.size": null,
        "legend.maxNumOfItems": null,
        "legend.mouseDownShadow.color": "#808080",
        "legend.order": {
            "defaultValue": null,
            "serializable": false
        },
        "legend.postRenderer": null,
        "legend.scrollbar.border.color": "white",
        "legend.scrollbar.border.width": 0,
        "legend.scrollbar.spacing": 0,
        "legend.scrollbar.thumb.fill": "#e5e5e5",
        "legend.scrollbar.thumb.hoverFill": "#dedede",
        "legend.scrollbar.track.fill": "#f7f7f7",
        "legend.showFullLabel": true,
        "legend.title.style.color": "#000000",
        "legend.title.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "legend.title.style.fontSize": "14px",
        "legend.title.style.fontStyle": "normal",
        "legend.title.style.fontWeight": "bold",
        "legend.title.text": null,
        "legend.title.visible": false,
        "legend.visible": true,
        "legendGroup.computedVisibility": {
            "defaultValue": true,
            "readonly": true,
            "serializable": false
        },
        "legendGroup.layout.alignment": "topLeft",
        "legendGroup.layout.maxHeight": 0.25,
        "legendGroup.layout.maxWidth": 0.25,
        "legendGroup.layout.position": "right",
        "legendGroup.layout.respectPlotPosition": true,
        "legendGroup.renderTo": null,
        "plotArea.areaRenderer": null,
        "plotArea.background.border.stroke": "#d8d8d8",
        "plotArea.background.border.strokeWidth": 1,
        "plotArea.background.color": "transparent",
        "plotArea.background.drawingEffect": "normal",
        "plotArea.background.gradientDirection": "vertical",
        "plotArea.background.visible": true,
        "plotArea.colorPalette": {
            "defaultValue": [
                "#748CB2",
                "#9CC677",
                "#EACF5E",
                "#F9AD79",
                "#D16A7C",
                "#8873A2",
                "#3A95B3",
                "#B6D949",
                "#FDD36C",
                "#F47958",
                "#A65084",
                "#0063B1",
                "#0DA841",
                "#FCB71D",
                "#F05620",
                "#B22D6E",
                "#3C368E",
                "#8FB2CF",
                "#95D4AB",
                "#EAE98F",
                "#F9BE92",
                "#EC9A99",
                "#BC98BD",
                "#1EB7B2",
                "#73C03C",
                "#F48323",
                "#EB271B",
                "#D9B5CA",
                "#AED1DA",
                "#DFECB2",
                "#FCDAB0",
                "#F5BCB4"
            ],
            "serializable": false
        },
        "plotArea.dataLabel.formatString": null,
        "plotArea.dataLabel.hideWhenOverlap": false,
        "plotArea.dataLabel.renderer": null,
        "plotArea.dataLabel.style.color": "#333333",
        "plotArea.dataLabel.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "plotArea.dataLabel.style.fontSize": "12px",
        "plotArea.dataLabel.style.fontStyle": "normal",
        "plotArea.dataLabel.style.fontWeight": "normal",
        "plotArea.dataLabel.type": "value",
        "plotArea.dataLabel.unitFormatType": "FinancialUnits",
        "plotArea.dataLabel.visible": false,
        "plotArea.dataPoint.stroke.color": "#000000",
        "plotArea.dataPoint.stroke.visible": false,
        "plotArea.drawingEffect": "normal",
        "plotArea.gridline.color": "#d8d8d8",
        "plotArea.gridline.size": 1,
        "plotArea.gridline.type": "line",
        "plotArea.gridline.visible": false,
        "plotArea.gridline.zeroLine.color": null,
        "plotArea.gridline.zeroLine.highlight": true,
        "plotArea.gridline.zeroLine.unhighlightAxis": true,
        "plotArea.markerRenderer": null,
        "plotArea.referenceLine.defaultStyle.color": "#666666",
        "plotArea.referenceLine.defaultStyle.label.background": "#ffffff",
        "plotArea.referenceLine.defaultStyle.label.color": "#333333",
        "plotArea.referenceLine.defaultStyle.label.fontFamily": "\"Open Sans\", Arial, Helvetica, sans-serif",
        "plotArea.referenceLine.defaultStyle.label.fontSize": "12px",
        "plotArea.referenceLine.defaultStyle.label.fontStyle": "normal",
        "plotArea.referenceLine.defaultStyle.label.fontWeight": "normal",
        "plotArea.referenceLine.defaultStyle.size": 1,
        "plotArea.referenceLine.defaultStyle.type": "dotted",
        "plotArea.referenceLine.line": null,
        "plotArea.scrollbar.border.color": "white",
        "plotArea.scrollbar.border.width": 0,
        "plotArea.scrollbar.spacing": 0,
        "plotArea.scrollbar.thumb.fill": "#e5e5e5",
        "plotArea.scrollbar.thumb.hoverFill": "#dedede",
        "plotArea.scrollbar.track.fill": "#f7f7f7",
        "propertyZone": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "tooltip.background.borderColor": "#cccccc",
        "tooltip.background.color": "#ffffff",
        "tooltip.bodyDimensionLabel.color": "#666666",
        "tooltip.bodyDimensionValue.color": "#666666",
        "tooltip.bodyMeasureLabel.color": "#666666",
        "tooltip.bodyMeasureValue.color": "#000000",
        "tooltip.closeButton.backgroundColor": "#ffffff",
        "tooltip.closeButton.borderColor": "#cccccc",
        "tooltip.footerLabel.color": "#000000",
        "tooltip.formatString": "0.00%",
        "tooltip.layinChart": true,
        "tooltip.postRender": null,
        "tooltip.preRender": {
            "defaultValue": null,
            "serializable": false
        },
        "tooltip.separationLine.color": "#a7a9ac",
        "tooltip.unitFormatType": "FinancialUnits",
        "tooltip.visible": true,
        "valueAxis.axisLine.size": 1,
        "valueAxis.axisLine.visible": true,
        "valueAxis.axisTick.visible": true,
        "valueAxis.color": null,
        "valueAxis.label.formatString": null,
        "valueAxis.label.style.color": "#333333",
        "valueAxis.label.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "valueAxis.label.style.fontSize": "12px",
        "valueAxis.label.style.fontStyle": "normal",
        "valueAxis.label.style.fontWeight": "normal",
        "valueAxis.label.unitFormatType": "FinancialUnits",
        "valueAxis.label.visible": true,
        "valueAxis.layout.maxHeight": 0.25,
        "valueAxis.layout.maxWidth": 0.25,
        "valueAxis.title.applyAxislineColor": false,
        "valueAxis.title.style.color": "#000000",
        "valueAxis.title.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "valueAxis.title.style.fontSize": "14px",
        "valueAxis.title.style.fontStyle": "normal",
        "valueAxis.title.style.fontWeight": "bold",
        "valueAxis.title.text": null,
        "valueAxis.title.visible": false,
        "valueAxis.visible": true
    },
    "info/trellis_100_dual_stacked_bar": {
        "categoryAxis.color": "#d8d8d8",
        "legend.marker.shape": "squareWithRadius",
        "plotArea.background.gradientDirection": "horizontal",
        "plotArea.dataLabel.type": "value",
        "plotArea.gap.groupSpacing": 1,
        "plotArea.gap.innerGroupSpacing": 0.125,
        "plotArea.grid.background.gradientDirection": "horizontal",
        "plotArea.gridline.visible": false,
        "plotArea.gridline.zeroLine.color": "#f6f6f6",
        "tooltip.formatString": "0.00%"
    },
    "info/trellis_100_dual_stacked_column": {
        "categoryAxis.color": "#d8d8d8",
        "legend.marker.shape": "squareWithRadius",
        "plotArea.dataLabel.type": "value",
        "plotArea.gap.groupSpacing": 1,
        "plotArea.gap.innerGroupSpacing": 0.125,
        "plotArea.gridline.visible": false,
        "plotArea.gridline.zeroLine.color": "#f6f6f6",
        "tooltip.formatString": "0.00%"
    },
    "info/trellis_100_horizontal_area": {
        "categoryAxis.axisLine.size": 1,
        "categoryAxis.axisLine.visible": true,
        "categoryAxis.axisTick.visible": true,
        "categoryAxis.color": "#d8d8d8",
        "categoryAxis.hoverShadow.color": "#cccccc",
        "categoryAxis.label.hideSubLevels": false,
        "categoryAxis.label.style.color": "#333333",
        "categoryAxis.label.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "categoryAxis.label.style.fontSize": "12px",
        "categoryAxis.label.style.fontStyle": "normal",
        "categoryAxis.label.style.fontWeight": "normal",
        "categoryAxis.label.visible": true,
        "categoryAxis.labelRenderer": null,
        "categoryAxis.layout.maxHeight": 0.3,
        "categoryAxis.layout.maxWidth": 0.3,
        "categoryAxis.mouseDownShadow.color": "#808080",
        "categoryAxis.title.applyAxislineColor": false,
        "categoryAxis.title.style.color": "#000000",
        "categoryAxis.title.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "categoryAxis.title.style.fontSize": "14px",
        "categoryAxis.title.style.fontStyle": "normal",
        "categoryAxis.title.style.fontWeight": "bold",
        "categoryAxis.title.text": null,
        "categoryAxis.title.visible": false,
        "categoryAxis.visible": true,
        "feedingZone": {
            "defaultValue": [
                {
                    "bindDef": [
                        {
                            "id": null
                        }
                    ],
                    "bound": [
                        [
                            [
                                0,
                                0
                            ],
                            [
                                0,
                                0
                            ],
                            [
                                0,
                                0
                            ],
                            [
                                0,
                                0
                            ]
                        ]
                    ],
                    "name": null
                }
            ],
            "readonly": true,
            "serializable": false
        },
        "general.groupData": false,
        "interaction.behaviorType": null,
        "interaction.decorations": {
            "defaultValue": null,
            "serializable": false
        },
        "interaction.deselected.color": null,
        "interaction.deselected.opacity": 0.4,
        "interaction.hover.color": null,
        "interaction.hover.stroke.color": "darken(20%)",
        "interaction.hover.stroke.visible": true,
        "interaction.hover.stroke.width": "2px",
        "interaction.selectability.axisLabelSelection": true,
        "interaction.selectability.legendSelection": true,
        "interaction.selectability.mode": "INCLUSIVE",
        "interaction.selectability.plotLassoSelection": true,
        "interaction.selectability.plotStdSelection": true,
        "interaction.selected.color": null,
        "interaction.selected.stroke.color": "darken(20%)",
        "interaction.selected.stroke.visible": true,
        "interaction.selected.stroke.width": "1px",
        "legend.drawingEffect": "normal",
        "legend.hoverShadow.color": "#cccccc",
        "legend.isScrollable": false,
        "legend.itemMargin": 0.5,
        "legend.label.style.color": "#000000",
        "legend.label.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "legend.label.style.fontSize": "12px",
        "legend.label.style.fontStyle": "normal",
        "legend.label.style.fontWeight": "normal",
        "legend.marker.size": null,
        "legend.maxNumOfItems": null,
        "legend.mouseDownShadow.color": "#808080",
        "legend.order": {
            "defaultValue": null,
            "serializable": false
        },
        "legend.postRenderer": null,
        "legend.scrollbar.border.color": "white",
        "legend.scrollbar.border.width": 0,
        "legend.scrollbar.spacing": 0,
        "legend.scrollbar.thumb.fill": "#e5e5e5",
        "legend.scrollbar.thumb.hoverFill": "#dedede",
        "legend.scrollbar.track.fill": "#f7f7f7",
        "legend.showFullLabel": true,
        "legend.title.style.color": "#000000",
        "legend.title.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "legend.title.style.fontSize": "14px",
        "legend.title.style.fontStyle": "normal",
        "legend.title.style.fontWeight": "bold",
        "legend.title.text": null,
        "legend.title.visible": false,
        "legend.visible": true,
        "legendGroup.computedVisibility": {
            "defaultValue": true,
            "readonly": true,
            "serializable": false
        },
        "legendGroup.layout.alignment": "topLeft",
        "legendGroup.layout.maxHeight": 0.25,
        "legendGroup.layout.maxWidth": 0.25,
        "legendGroup.layout.position": "right",
        "legendGroup.layout.respectPlotPosition": true,
        "legendGroup.renderTo": null,
        "plotArea.areaRenderer": null,
        "plotArea.background.border.stroke": "#d8d8d8",
        "plotArea.background.border.strokeWidth": 1,
        "plotArea.background.color": "transparent",
        "plotArea.background.drawingEffect": "normal",
        "plotArea.background.gradientDirection": "vertical",
        "plotArea.background.visible": true,
        "plotArea.colorPalette": {
            "defaultValue": [
                "#748CB2",
                "#9CC677",
                "#EACF5E",
                "#F9AD79",
                "#D16A7C",
                "#8873A2",
                "#3A95B3",
                "#B6D949",
                "#FDD36C",
                "#F47958",
                "#A65084",
                "#0063B1",
                "#0DA841",
                "#FCB71D",
                "#F05620",
                "#B22D6E",
                "#3C368E",
                "#8FB2CF",
                "#95D4AB",
                "#EAE98F",
                "#F9BE92",
                "#EC9A99",
                "#BC98BD",
                "#1EB7B2",
                "#73C03C",
                "#F48323",
                "#EB271B",
                "#D9B5CA",
                "#AED1DA",
                "#DFECB2",
                "#FCDAB0",
                "#F5BCB4"
            ],
            "serializable": false
        },
        "plotArea.dataLabel.formatString": null,
        "plotArea.dataLabel.hideWhenOverlap": false,
        "plotArea.dataLabel.renderer": null,
        "plotArea.dataLabel.style.color": "#333333",
        "plotArea.dataLabel.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "plotArea.dataLabel.style.fontSize": "12px",
        "plotArea.dataLabel.style.fontStyle": "normal",
        "plotArea.dataLabel.style.fontWeight": "normal",
        "plotArea.dataLabel.type": "value",
        "plotArea.dataLabel.unitFormatType": "FinancialUnits",
        "plotArea.dataLabel.visible": false,
        "plotArea.dataPoint.stroke.color": "#000000",
        "plotArea.dataPoint.stroke.visible": false,
        "plotArea.drawingEffect": "normal",
        "plotArea.gridline.color": "#d8d8d8",
        "plotArea.gridline.size": 1,
        "plotArea.gridline.type": "line",
        "plotArea.gridline.visible": false,
        "plotArea.gridline.zeroLine.color": null,
        "plotArea.gridline.zeroLine.highlight": true,
        "plotArea.gridline.zeroLine.unhighlightAxis": true,
        "plotArea.markerRenderer": null,
        "plotArea.referenceLine.defaultStyle.color": "#666666",
        "plotArea.referenceLine.defaultStyle.label.background": "#ffffff",
        "plotArea.referenceLine.defaultStyle.label.color": "#333333",
        "plotArea.referenceLine.defaultStyle.label.fontFamily": "\"Open Sans\", Arial, Helvetica, sans-serif",
        "plotArea.referenceLine.defaultStyle.label.fontSize": "12px",
        "plotArea.referenceLine.defaultStyle.label.fontStyle": "normal",
        "plotArea.referenceLine.defaultStyle.label.fontWeight": "normal",
        "plotArea.referenceLine.defaultStyle.size": 1,
        "plotArea.referenceLine.defaultStyle.type": "dotted",
        "plotArea.referenceLine.line": null,
        "plotArea.scrollbar.border.color": "white",
        "plotArea.scrollbar.border.width": 0,
        "plotArea.scrollbar.spacing": 0,
        "plotArea.scrollbar.thumb.fill": "#e5e5e5",
        "plotArea.scrollbar.thumb.hoverFill": "#dedede",
        "plotArea.scrollbar.track.fill": "#f7f7f7",
        "propertyZone": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "tooltip.background.borderColor": "#cccccc",
        "tooltip.background.color": "#ffffff",
        "tooltip.bodyDimensionLabel.color": "#666666",
        "tooltip.bodyDimensionValue.color": "#666666",
        "tooltip.bodyMeasureLabel.color": "#666666",
        "tooltip.bodyMeasureValue.color": "#000000",
        "tooltip.closeButton.backgroundColor": "#ffffff",
        "tooltip.closeButton.borderColor": "#cccccc",
        "tooltip.footerLabel.color": "#000000",
        "tooltip.formatString": "0.00%",
        "tooltip.layinChart": true,
        "tooltip.postRender": null,
        "tooltip.preRender": {
            "defaultValue": null,
            "serializable": false
        },
        "tooltip.separationLine.color": "#a7a9ac",
        "tooltip.unitFormatType": "FinancialUnits",
        "tooltip.visible": true,
        "valueAxis.axisLine.size": 1,
        "valueAxis.axisLine.visible": true,
        "valueAxis.axisTick.visible": true,
        "valueAxis.color": null,
        "valueAxis.label.formatString": null,
        "valueAxis.label.style.color": "#333333",
        "valueAxis.label.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "valueAxis.label.style.fontSize": "12px",
        "valueAxis.label.style.fontStyle": "normal",
        "valueAxis.label.style.fontWeight": "normal",
        "valueAxis.label.unitFormatType": "FinancialUnits",
        "valueAxis.label.visible": true,
        "valueAxis.layout.maxHeight": 0.25,
        "valueAxis.layout.maxWidth": 0.25,
        "valueAxis.title.applyAxislineColor": false,
        "valueAxis.title.style.color": "#000000",
        "valueAxis.title.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "valueAxis.title.style.fontSize": "14px",
        "valueAxis.title.style.fontStyle": "normal",
        "valueAxis.title.style.fontWeight": "bold",
        "valueAxis.title.text": null,
        "valueAxis.title.visible": false,
        "valueAxis.visible": true
    },
    "info/trellis_100_stacked_bar": {
        "categoryAxis.axisLine.size": 1,
        "categoryAxis.axisLine.visible": true,
        "categoryAxis.axisTick.visible": true,
        "categoryAxis.color": "#d8d8d8",
        "categoryAxis.hoverShadow.color": "#cccccc",
        "categoryAxis.label.hideSubLevels": false,
        "categoryAxis.label.style.color": "#333333",
        "categoryAxis.label.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "categoryAxis.label.style.fontSize": "12px",
        "categoryAxis.label.style.fontStyle": "normal",
        "categoryAxis.label.style.fontWeight": "normal",
        "categoryAxis.label.visible": true,
        "categoryAxis.labelRenderer": null,
        "categoryAxis.layout.maxHeight": 0.3,
        "categoryAxis.layout.maxWidth": 0.3,
        "categoryAxis.mouseDownShadow.color": "#808080",
        "categoryAxis.title.applyAxislineColor": false,
        "categoryAxis.title.style.color": "#000000",
        "categoryAxis.title.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "categoryAxis.title.style.fontSize": "14px",
        "categoryAxis.title.style.fontStyle": "normal",
        "categoryAxis.title.style.fontWeight": "bold",
        "categoryAxis.title.text": null,
        "categoryAxis.title.visible": false,
        "categoryAxis.visible": true,
        "interaction.selectability.axisLabelSelection": true,
        "legend.marker.shape": "squareWithRadius",
        "plotArea.background.gradientDirection": "horizontal",
        "plotArea.dataLabel.type": "value",
        "plotArea.gap.barSpacing": 1,
        "plotArea.grid.background.gradientDirection": "horizontal",
        "plotArea.gridline.visible": false,
        "plotArea.gridline.zeroLine.color": "#f6f6f6",
        "tooltip.formatString": "0.00%",
        "valueAxis.color": "#d8d8d8"
    },
    "info/trellis_100_stacked_column": {
        "categoryAxis.axisLine.size": 1,
        "categoryAxis.axisLine.visible": true,
        "categoryAxis.axisTick.visible": true,
        "categoryAxis.color": "#d8d8d8",
        "categoryAxis.hoverShadow.color": "#cccccc",
        "categoryAxis.label.hideSubLevels": false,
        "categoryAxis.label.style.color": "#333333",
        "categoryAxis.label.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "categoryAxis.label.style.fontSize": "12px",
        "categoryAxis.label.style.fontStyle": "normal",
        "categoryAxis.label.style.fontWeight": "normal",
        "categoryAxis.label.visible": true,
        "categoryAxis.labelRenderer": null,
        "categoryAxis.layout.maxHeight": 0.3,
        "categoryAxis.layout.maxWidth": 0.3,
        "categoryAxis.mouseDownShadow.color": "#808080",
        "categoryAxis.title.applyAxislineColor": false,
        "categoryAxis.title.style.color": "#000000",
        "categoryAxis.title.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "categoryAxis.title.style.fontSize": "14px",
        "categoryAxis.title.style.fontStyle": "normal",
        "categoryAxis.title.style.fontWeight": "bold",
        "categoryAxis.title.text": null,
        "categoryAxis.title.visible": false,
        "categoryAxis.visible": true,
        "interaction.selectability.axisLabelSelection": true,
        "legend.marker.shape": "squareWithRadius",
        "plotArea.dataLabel.type": "value",
        "plotArea.gap.barSpacing": 1,
        "plotArea.gridline.visible": false,
        "plotArea.gridline.zeroLine.color": "#f6f6f6",
        "tooltip.formatString": "0.00%",
        "valueAxis.color": "#d8d8d8"
    },
    "info/trellis_area": {
        "categoryAxis.axisLine.size": 1,
        "categoryAxis.axisLine.visible": true,
        "categoryAxis.axisTick.visible": true,
        "categoryAxis.color": "#d8d8d8",
        "categoryAxis.hoverShadow.color": "#cccccc",
        "categoryAxis.label.hideSubLevels": false,
        "categoryAxis.label.style.color": "#333333",
        "categoryAxis.label.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "categoryAxis.label.style.fontSize": "12px",
        "categoryAxis.label.style.fontStyle": "normal",
        "categoryAxis.label.style.fontWeight": "normal",
        "categoryAxis.label.visible": true,
        "categoryAxis.labelRenderer": null,
        "categoryAxis.layout.maxHeight": 0.3,
        "categoryAxis.layout.maxWidth": 0.3,
        "categoryAxis.mouseDownShadow.color": "#808080",
        "categoryAxis.title.applyAxislineColor": false,
        "categoryAxis.title.style.color": "#000000",
        "categoryAxis.title.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "categoryAxis.title.style.fontSize": "14px",
        "categoryAxis.title.style.fontStyle": "normal",
        "categoryAxis.title.style.fontWeight": "bold",
        "categoryAxis.title.text": null,
        "categoryAxis.title.visible": false,
        "categoryAxis.visible": true,
        "feedingZone": {
            "defaultValue": [
                {
                    "bindDef": [
                        {
                            "id": null
                        }
                    ],
                    "bound": [
                        [
                            [
                                0,
                                0
                            ],
                            [
                                0,
                                0
                            ],
                            [
                                0,
                                0
                            ],
                            [
                                0,
                                0
                            ]
                        ]
                    ],
                    "name": null
                }
            ],
            "readonly": true,
            "serializable": false
        },
        "general.groupData": false,
        "interaction.behaviorType": null,
        "interaction.decorations": {
            "defaultValue": null,
            "serializable": false
        },
        "interaction.deselected.color": null,
        "interaction.deselected.opacity": 0.4,
        "interaction.hover.color": null,
        "interaction.hover.stroke.color": "darken(20%)",
        "interaction.hover.stroke.visible": true,
        "interaction.hover.stroke.width": "2px",
        "interaction.selectability.axisLabelSelection": true,
        "interaction.selectability.legendSelection": true,
        "interaction.selectability.mode": "INCLUSIVE",
        "interaction.selectability.plotLassoSelection": true,
        "interaction.selectability.plotStdSelection": true,
        "interaction.selected.color": null,
        "interaction.selected.stroke.color": "darken(20%)",
        "interaction.selected.stroke.visible": true,
        "interaction.selected.stroke.width": "1px",
        "legend.drawingEffect": "normal",
        "legend.hoverShadow.color": "#cccccc",
        "legend.isScrollable": false,
        "legend.itemMargin": 0.5,
        "legend.label.style.color": "#000000",
        "legend.label.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "legend.label.style.fontSize": "12px",
        "legend.label.style.fontStyle": "normal",
        "legend.label.style.fontWeight": "normal",
        "legend.marker.size": null,
        "legend.maxNumOfItems": null,
        "legend.mouseDownShadow.color": "#808080",
        "legend.order": {
            "defaultValue": null,
            "serializable": false
        },
        "legend.postRenderer": null,
        "legend.scrollbar.border.color": "white",
        "legend.scrollbar.border.width": 0,
        "legend.scrollbar.spacing": 0,
        "legend.scrollbar.thumb.fill": "#e5e5e5",
        "legend.scrollbar.thumb.hoverFill": "#dedede",
        "legend.scrollbar.track.fill": "#f7f7f7",
        "legend.showFullLabel": true,
        "legend.title.style.color": "#000000",
        "legend.title.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "legend.title.style.fontSize": "14px",
        "legend.title.style.fontStyle": "normal",
        "legend.title.style.fontWeight": "bold",
        "legend.title.text": null,
        "legend.title.visible": false,
        "legend.visible": true,
        "legendGroup.computedVisibility": {
            "defaultValue": true,
            "readonly": true,
            "serializable": false
        },
        "legendGroup.layout.alignment": "topLeft",
        "legendGroup.layout.maxHeight": 0.25,
        "legendGroup.layout.maxWidth": 0.25,
        "legendGroup.layout.position": "right",
        "legendGroup.layout.respectPlotPosition": true,
        "legendGroup.renderTo": null,
        "plotArea.areaRenderer": null,
        "plotArea.background.border.stroke": "#d8d8d8",
        "plotArea.background.border.strokeWidth": 1,
        "plotArea.background.color": "transparent",
        "plotArea.background.drawingEffect": "normal",
        "plotArea.background.gradientDirection": "vertical",
        "plotArea.background.visible": true,
        "plotArea.colorPalette": {
            "defaultValue": [
                "#748CB2",
                "#9CC677",
                "#EACF5E",
                "#F9AD79",
                "#D16A7C",
                "#8873A2",
                "#3A95B3",
                "#B6D949",
                "#FDD36C",
                "#F47958",
                "#A65084",
                "#0063B1",
                "#0DA841",
                "#FCB71D",
                "#F05620",
                "#B22D6E",
                "#3C368E",
                "#8FB2CF",
                "#95D4AB",
                "#EAE98F",
                "#F9BE92",
                "#EC9A99",
                "#BC98BD",
                "#1EB7B2",
                "#73C03C",
                "#F48323",
                "#EB271B",
                "#D9B5CA",
                "#AED1DA",
                "#DFECB2",
                "#FCDAB0",
                "#F5BCB4"
            ],
            "serializable": false
        },
        "plotArea.dataLabel.formatString": null,
        "plotArea.dataLabel.hideWhenOverlap": false,
        "plotArea.dataLabel.renderer": null,
        "plotArea.dataLabel.style.color": "#333333",
        "plotArea.dataLabel.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "plotArea.dataLabel.style.fontSize": "12px",
        "plotArea.dataLabel.style.fontStyle": "normal",
        "plotArea.dataLabel.style.fontWeight": "normal",
        "plotArea.dataLabel.unitFormatType": "FinancialUnits",
        "plotArea.dataLabel.visible": false,
        "plotArea.dataPoint.stroke.color": "#000000",
        "plotArea.dataPoint.stroke.visible": false,
        "plotArea.drawingEffect": "normal",
        "plotArea.gridline.color": "#d8d8d8",
        "plotArea.gridline.size": 1,
        "plotArea.gridline.type": "line",
        "plotArea.gridline.visible": false,
        "plotArea.gridline.zeroLine.color": null,
        "plotArea.gridline.zeroLine.highlight": true,
        "plotArea.gridline.zeroLine.unhighlightAxis": true,
        "plotArea.markerRenderer": null,
        "plotArea.primaryScale.autoMaxValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.primaryScale.autoMinValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.primaryScale.fixedRange": {
            "defaultValue": false,
            "serializable": false
        },
        "plotArea.primaryScale.maxValue": {
            "defaultValue": null,
            "serializable": false
        },
        "plotArea.primaryScale.minValue": {
            "defaultValue": null,
            "serializable": false
        },
        "plotArea.referenceLine.defaultStyle.color": "#666666",
        "plotArea.referenceLine.defaultStyle.label.background": "#ffffff",
        "plotArea.referenceLine.defaultStyle.label.color": "#333333",
        "plotArea.referenceLine.defaultStyle.label.fontFamily": "\"Open Sans\", Arial, Helvetica, sans-serif",
        "plotArea.referenceLine.defaultStyle.label.fontSize": "12px",
        "plotArea.referenceLine.defaultStyle.label.fontStyle": "normal",
        "plotArea.referenceLine.defaultStyle.label.fontWeight": "normal",
        "plotArea.referenceLine.defaultStyle.size": 1,
        "plotArea.referenceLine.defaultStyle.type": "dotted",
        "plotArea.referenceLine.line": null,
        "plotArea.scrollbar.border.color": "white",
        "plotArea.scrollbar.border.width": 0,
        "plotArea.scrollbar.spacing": 0,
        "plotArea.scrollbar.thumb.fill": "#e5e5e5",
        "plotArea.scrollbar.thumb.hoverFill": "#dedede",
        "plotArea.scrollbar.track.fill": "#f7f7f7",
        "propertyZone": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "tooltip.background.borderColor": "#cccccc",
        "tooltip.background.color": "#ffffff",
        "tooltip.bodyDimensionLabel.color": "#666666",
        "tooltip.bodyDimensionValue.color": "#666666",
        "tooltip.bodyMeasureLabel.color": "#666666",
        "tooltip.bodyMeasureValue.color": "#000000",
        "tooltip.closeButton.backgroundColor": "#ffffff",
        "tooltip.closeButton.borderColor": "#cccccc",
        "tooltip.footerLabel.color": "#000000",
        "tooltip.formatString": null,
        "tooltip.layinChart": true,
        "tooltip.postRender": null,
        "tooltip.preRender": {
            "defaultValue": null,
            "serializable": false
        },
        "tooltip.separationLine.color": "#a7a9ac",
        "tooltip.unitFormatType": "FinancialUnits",
        "tooltip.visible": true,
        "valueAxis.axisLine.size": 1,
        "valueAxis.axisLine.visible": true,
        "valueAxis.axisTick.visible": true,
        "valueAxis.color": null,
        "valueAxis.label.formatString": null,
        "valueAxis.label.style.color": "#333333",
        "valueAxis.label.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "valueAxis.label.style.fontSize": "12px",
        "valueAxis.label.style.fontStyle": "normal",
        "valueAxis.label.style.fontWeight": "normal",
        "valueAxis.label.unitFormatType": "FinancialUnits",
        "valueAxis.label.visible": true,
        "valueAxis.layout.maxHeight": 0.25,
        "valueAxis.layout.maxWidth": 0.25,
        "valueAxis.title.applyAxislineColor": false,
        "valueAxis.title.style.color": "#000000",
        "valueAxis.title.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "valueAxis.title.style.fontSize": "14px",
        "valueAxis.title.style.fontStyle": "normal",
        "valueAxis.title.style.fontWeight": "bold",
        "valueAxis.title.text": null,
        "valueAxis.title.visible": false,
        "valueAxis.visible": true
    },
    "info/trellis_bar": {
        "categoryAxis.axisLine.size": 1,
        "categoryAxis.axisLine.visible": true,
        "categoryAxis.axisTick.visible": true,
        "categoryAxis.color": "#d8d8d8",
        "categoryAxis.hoverShadow.color": "#cccccc",
        "categoryAxis.label.hideSubLevels": false,
        "categoryAxis.label.style.color": "#333333",
        "categoryAxis.label.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "categoryAxis.label.style.fontSize": "12px",
        "categoryAxis.label.style.fontStyle": "normal",
        "categoryAxis.label.style.fontWeight": "normal",
        "categoryAxis.label.visible": true,
        "categoryAxis.labelRenderer": null,
        "categoryAxis.layout.maxHeight": 0.3,
        "categoryAxis.layout.maxWidth": 0.3,
        "categoryAxis.mouseDownShadow.color": "#808080",
        "categoryAxis.title.applyAxislineColor": false,
        "categoryAxis.title.style.color": "#000000",
        "categoryAxis.title.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "categoryAxis.title.style.fontSize": "14px",
        "categoryAxis.title.style.fontStyle": "normal",
        "categoryAxis.title.style.fontWeight": "bold",
        "categoryAxis.title.text": null,
        "categoryAxis.title.visible": false,
        "categoryAxis.visible": true,
        "interaction.selectability.axisLabelSelection": true,
        "legend.marker.shape": "squareWithRadius",
        "plotArea.background.gradientDirection": "horizontal",
        "plotArea.dataLabel.position": "outsideFirst",
        "plotArea.gap.barSpacing": 1,
        "plotArea.gap.groupSpacing": 1,
        "plotArea.gap.innerGroupSpacing": 0.125,
        "plotArea.grid.background.gradientDirection": "horizontal",
        "plotArea.gridline.visible": false,
        "plotArea.gridline.zeroLine.color": "#f6f6f6",
        "plotArea.primaryScale.autoMaxValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.primaryScale.autoMinValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.primaryScale.fixedRange": {
            "defaultValue": false,
            "serializable": false
        },
        "plotArea.primaryScale.maxValue": {
            "defaultValue": null,
            "serializable": false
        },
        "plotArea.primaryScale.minValue": {
            "defaultValue": null,
            "serializable": false
        },
        "valueAxis.color": "#d8d8d8"
    },
    "info/trellis_bubble": {
        "interaction.selectability.axisLabelSelection": true,
        "plotArea.dataLabel.respectShapeWidth": false,
        "plotArea.dataLabel.type": "bubbleWidth",
        "plotArea.gridline.visible": false,
        "plotArea.minMarkerSize": null,
        "plotArea.secondaryScale.autoMaxValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.secondaryScale.autoMinValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.secondaryScale.fixedRange": {
            "defaultValue": false,
            "serializable": false
        },
        "plotArea.secondaryScale.maxValue": {
            "defaultValue": null,
            "serializable": false
        },
        "plotArea.secondaryScale.minValue": {
            "defaultValue": null,
            "serializable": false
        },
        "plotArea.showNegativeValues": true,
        "sizeLegend.drawingEffect": "normal",
        "sizeLegend.formatString": null,
        "sizeLegend.label.style.color": "#000000",
        "sizeLegend.label.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "sizeLegend.label.style.fontSize": "12px",
        "sizeLegend.label.style.fontStyle": "normal",
        "sizeLegend.label.style.fontWeight": "normal",
        "sizeLegend.title.style.color": "#000000",
        "sizeLegend.title.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "sizeLegend.title.style.fontSize": "14px",
        "sizeLegend.title.style.fontStyle": "normal",
        "sizeLegend.title.style.fontWeight": "bold",
        "sizeLegend.title.text": null,
        "sizeLegend.title.visible": false,
        "sizeLegend.unitFormatType": "FinancialUnits",
        "sizeLegend.visible": true,
        "valueAxis.color": "#d8d8d8",
        "valueAxis.label.formatString": null,
        "valueAxis2.axisLine.size": 1,
        "valueAxis2.axisLine.visible": true,
        "valueAxis2.axisTick.visible": true,
        "valueAxis2.color": "#d8d8d8",
        "valueAxis2.label.formatString": null,
        "valueAxis2.label.style.color": "#333333",
        "valueAxis2.label.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "valueAxis2.label.style.fontSize": "12px",
        "valueAxis2.label.style.fontStyle": "normal",
        "valueAxis2.label.style.fontWeight": "normal",
        "valueAxis2.label.unitFormatType": "FinancialUnits",
        "valueAxis2.label.visible": true,
        "valueAxis2.layout.maxHeight": 0.25,
        "valueAxis2.layout.maxWidth": 0.25,
        "valueAxis2.title.applyAxislineColor": false,
        "valueAxis2.title.style.color": "#000000",
        "valueAxis2.title.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "valueAxis2.title.style.fontSize": "14px",
        "valueAxis2.title.style.fontStyle": "normal",
        "valueAxis2.title.style.fontWeight": "bold",
        "valueAxis2.title.text": null,
        "valueAxis2.title.visible": false,
        "valueAxis2.visible": true
    },
    "info/trellis_bullet": {
        "categoryAxis.color": "#d8d8d8"
    },
    "info/trellis_column": {
        "categoryAxis.axisLine.size": 1,
        "categoryAxis.axisLine.visible": true,
        "categoryAxis.axisTick.visible": true,
        "categoryAxis.color": "#d8d8d8",
        "categoryAxis.hoverShadow.color": "#cccccc",
        "categoryAxis.label.hideSubLevels": false,
        "categoryAxis.label.style.color": "#333333",
        "categoryAxis.label.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "categoryAxis.label.style.fontSize": "12px",
        "categoryAxis.label.style.fontStyle": "normal",
        "categoryAxis.label.style.fontWeight": "normal",
        "categoryAxis.label.visible": true,
        "categoryAxis.labelRenderer": null,
        "categoryAxis.layout.maxHeight": 0.3,
        "categoryAxis.layout.maxWidth": 0.3,
        "categoryAxis.mouseDownShadow.color": "#808080",
        "categoryAxis.title.applyAxislineColor": false,
        "categoryAxis.title.style.color": "#000000",
        "categoryAxis.title.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "categoryAxis.title.style.fontSize": "14px",
        "categoryAxis.title.style.fontStyle": "normal",
        "categoryAxis.title.style.fontWeight": "bold",
        "categoryAxis.title.text": null,
        "categoryAxis.title.visible": false,
        "categoryAxis.visible": true,
        "interaction.selectability.axisLabelSelection": true,
        "legend.marker.shape": "squareWithRadius",
        "plotArea.dataLabel.position": "outside",
        "plotArea.gap.barSpacing": 1,
        "plotArea.gap.groupSpacing": 1,
        "plotArea.gap.innerGroupSpacing": 0.125,
        "plotArea.gridline.visible": false,
        "plotArea.gridline.zeroLine.color": "#f6f6f6",
        "plotArea.primaryScale.autoMaxValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.primaryScale.autoMinValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.primaryScale.fixedRange": {
            "defaultValue": false,
            "serializable": false
        },
        "plotArea.primaryScale.maxValue": {
            "defaultValue": null,
            "serializable": false
        },
        "plotArea.primaryScale.minValue": {
            "defaultValue": null,
            "serializable": false
        },
        "valueAxis.color": "#d8d8d8"
    },
    "info/trellis_combination": {
        "categoryAxis.axisLine.size": 1,
        "categoryAxis.axisLine.visible": true,
        "categoryAxis.axisTick.visible": true,
        "categoryAxis.color": "#d8d8d8",
        "categoryAxis.hoverShadow.color": "#cccccc",
        "categoryAxis.label.hideSubLevels": false,
        "categoryAxis.label.style.color": "#333333",
        "categoryAxis.label.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "categoryAxis.label.style.fontSize": "12px",
        "categoryAxis.label.style.fontStyle": "normal",
        "categoryAxis.label.style.fontWeight": "normal",
        "categoryAxis.label.visible": true,
        "categoryAxis.labelRenderer": null,
        "categoryAxis.layout.maxHeight": 0.3,
        "categoryAxis.layout.maxWidth": 0.3,
        "categoryAxis.mouseDownShadow.color": "#808080",
        "categoryAxis.title.applyAxislineColor": false,
        "categoryAxis.title.style.color": "#000000",
        "categoryAxis.title.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "categoryAxis.title.style.fontSize": "14px",
        "categoryAxis.title.style.fontStyle": "normal",
        "categoryAxis.title.style.fontWeight": "bold",
        "categoryAxis.title.text": null,
        "categoryAxis.title.visible": false,
        "categoryAxis.visible": true,
        "interaction.selectability.axisLabelSelection": true,
        "legend.groupByShape": false,
        "legend.marker.shape": "squareWithRadius",
        "plotArea.dataShape.primaryAxis": [
            "bar",
            "line",
            "line"
        ],
        "plotArea.dataShape.secondaryAxis": [
            "line",
            "line",
            "line"
        ],
        "plotArea.gap.barSpacing": 1,
        "plotArea.gap.groupSpacing": 1,
        "plotArea.gap.innerGroupSpacing": 0.125,
        "plotArea.gridline.visible": false,
        "plotArea.gridline.zeroLine.color": "#f6f6f6",
        "plotArea.line.lineRenderer": null,
        "plotArea.line.marker.shape": "circle",
        "plotArea.line.marker.size": 6,
        "plotArea.line.marker.visible": true,
        "plotArea.line.style": null,
        "plotArea.line.visible": true,
        "plotArea.line.width": 2,
        "plotArea.primaryScale.autoMaxValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.primaryScale.autoMinValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.primaryScale.fixedRange": {
            "defaultValue": false,
            "serializable": false
        },
        "plotArea.primaryScale.maxValue": {
            "defaultValue": null,
            "serializable": false
        },
        "plotArea.primaryScale.minValue": {
            "defaultValue": null,
            "serializable": false
        },
        "valueAxis.color": "#d8d8d8"
    },
    "info/trellis_donut": {
        "plotArea.highlight.centerName.style.color": null,
        "plotArea.highlight.centerName.style.fontFamily": "Arial, Helvetica, sans-serif",
        "plotArea.highlight.centerName.style.fontSize": "14px",
        "plotArea.highlight.centerName.style.fontStyle": "normal",
        "plotArea.highlight.centerName.style.fontWeight": "normal",
        "plotArea.highlight.centerName.visible": true,
        "plotArea.highlight.centerValue.style.color": null,
        "plotArea.highlight.centerValue.style.fontFamily": "Arial, Helvetica, sans-serif",
        "plotArea.highlight.centerValue.style.fontSize": "22px",
        "plotArea.highlight.centerValue.style.fontStyle": "normal",
        "plotArea.highlight.centerValue.style.fontWeight": "normal",
        "plotArea.highlight.centerValue.visible": true,
        "plotArea.highlight.contextInfos": [],
        "plotArea.highlight.highlightContext": [],
        "plotArea.highlight.unhighlightSliceColor": "#dddddd",
        "plotArea.innerRadiusRatio": 0.5,
        "plotArea.scrollbar.border.color": "white",
        "plotArea.scrollbar.border.width": 0,
        "plotArea.scrollbar.spacing": 0,
        "plotArea.scrollbar.thumb.fill": "#e5e5e5",
        "plotArea.scrollbar.thumb.hoverFill": "#dedede",
        "plotArea.scrollbar.track.fill": "#f7f7f7",
        "plotArea.sliceRenderer": null
    },
    "info/trellis_dual_bar": {
        "categoryAxis.color": "#d8d8d8",
        "legend.marker.shape": "squareWithRadius",
        "plotArea.background.gradientDirection": "horizontal",
        "plotArea.dataLabel.position": "outsideFirst",
        "plotArea.gap.groupSpacing": 1,
        "plotArea.gap.innerGroupSpacing": 0.125,
        "plotArea.grid.background.gradientDirection": "horizontal",
        "plotArea.gridline.visible": false,
        "plotArea.gridline.zeroLine.color": "#f6f6f6",
        "plotArea.primaryScale.autoMaxValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.primaryScale.autoMinValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.primaryScale.fixedRange": {
            "defaultValue": false,
            "serializable": false
        },
        "plotArea.primaryScale.maxValue": {
            "defaultValue": null,
            "serializable": false
        },
        "plotArea.primaryScale.minValue": {
            "defaultValue": null,
            "serializable": false
        },
        "plotArea.secondaryScale.autoMaxValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.secondaryScale.autoMinValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.secondaryScale.fixedRange": {
            "defaultValue": false,
            "serializable": false
        },
        "plotArea.secondaryScale.maxValue": {
            "defaultValue": null,
            "serializable": false
        },
        "plotArea.secondaryScale.minValue": {
            "defaultValue": null,
            "serializable": false
        }
    },
    "info/trellis_dual_column": {
        "categoryAxis.color": "#d8d8d8",
        "legend.marker.shape": "squareWithRadius",
        "plotArea.dataLabel.position": "outside",
        "plotArea.gap.groupSpacing": 1,
        "plotArea.gap.innerGroupSpacing": 0.125,
        "plotArea.gridline.visible": false,
        "plotArea.gridline.zeroLine.color": "#f6f6f6",
        "plotArea.primaryScale.autoMaxValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.primaryScale.autoMinValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.primaryScale.fixedRange": {
            "defaultValue": false,
            "serializable": false
        },
        "plotArea.primaryScale.maxValue": {
            "defaultValue": null,
            "serializable": false
        },
        "plotArea.primaryScale.minValue": {
            "defaultValue": null,
            "serializable": false
        },
        "plotArea.secondaryScale.autoMaxValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.secondaryScale.autoMinValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.secondaryScale.fixedRange": {
            "defaultValue": false,
            "serializable": false
        },
        "plotArea.secondaryScale.maxValue": {
            "defaultValue": null,
            "serializable": false
        },
        "plotArea.secondaryScale.minValue": {
            "defaultValue": null,
            "serializable": false
        }
    },
    "info/trellis_dual_horizontal_line": {
        "categoryAxis.color": "#d8d8d8",
        "plotArea.gridline.visible": false,
        "plotArea.gridline.zeroLine.color": "#f6f6f6",
        "plotArea.lineRenderer": null,
        "plotArea.lineStyle": null,
        "plotArea.lineVisible": true,
        "plotArea.marker.displayMode": "manual",
        "plotArea.marker.shape": "circle",
        "plotArea.marker.size": 6,
        "plotArea.marker.visible": true,
        "plotArea.primaryScale.autoMaxValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.primaryScale.autoMinValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.primaryScale.fixedRange": {
            "defaultValue": false,
            "serializable": false
        },
        "plotArea.primaryScale.maxValue": {
            "defaultValue": null,
            "serializable": false
        },
        "plotArea.primaryScale.minValue": {
            "defaultValue": null,
            "serializable": false
        },
        "plotArea.secondaryScale.autoMaxValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.secondaryScale.autoMinValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.secondaryScale.fixedRange": {
            "defaultValue": false,
            "serializable": false
        },
        "plotArea.secondaryScale.maxValue": {
            "defaultValue": null,
            "serializable": false
        },
        "plotArea.secondaryScale.minValue": {
            "defaultValue": null,
            "serializable": false
        },
        "plotArea.width": 2
    },
    "info/trellis_dual_line": {
        "categoryAxis.color": "#d8d8d8",
        "plotArea.gridline.visible": false,
        "plotArea.gridline.zeroLine.color": "#f6f6f6",
        "plotArea.lineRenderer": null,
        "plotArea.lineStyle": null,
        "plotArea.lineVisible": true,
        "plotArea.marker.displayMode": "manual",
        "plotArea.marker.shape": "circle",
        "plotArea.marker.size": 6,
        "plotArea.marker.visible": true,
        "plotArea.primaryScale.autoMaxValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.primaryScale.autoMinValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.primaryScale.fixedRange": {
            "defaultValue": false,
            "serializable": false
        },
        "plotArea.primaryScale.maxValue": {
            "defaultValue": null,
            "serializable": false
        },
        "plotArea.primaryScale.minValue": {
            "defaultValue": null,
            "serializable": false
        },
        "plotArea.secondaryScale.autoMaxValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.secondaryScale.autoMinValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.secondaryScale.fixedRange": {
            "defaultValue": false,
            "serializable": false
        },
        "plotArea.secondaryScale.maxValue": {
            "defaultValue": null,
            "serializable": false
        },
        "plotArea.secondaryScale.minValue": {
            "defaultValue": null,
            "serializable": false
        },
        "plotArea.width": 2
    },
    "info/trellis_dual_stacked_bar": {
        "categoryAxis.color": "#d8d8d8",
        "legend.marker.shape": "squareWithRadius",
        "plotArea.background.gradientDirection": "horizontal",
        "plotArea.gap.groupSpacing": 1,
        "plotArea.gap.innerGroupSpacing": 0.125,
        "plotArea.grid.background.gradientDirection": "horizontal",
        "plotArea.gridline.visible": false,
        "plotArea.gridline.zeroLine.color": "#f6f6f6",
        "plotArea.primaryScale.autoMaxValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.primaryScale.autoMinValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.primaryScale.fixedRange": {
            "defaultValue": false,
            "serializable": false
        },
        "plotArea.primaryScale.maxValue": {
            "defaultValue": null,
            "serializable": false
        },
        "plotArea.primaryScale.minValue": {
            "defaultValue": null,
            "serializable": false
        },
        "plotArea.secondaryScale.autoMaxValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.secondaryScale.autoMinValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.secondaryScale.fixedRange": {
            "defaultValue": false,
            "serializable": false
        },
        "plotArea.secondaryScale.maxValue": {
            "defaultValue": null,
            "serializable": false
        },
        "plotArea.secondaryScale.minValue": {
            "defaultValue": null,
            "serializable": false
        }
    },
    "info/trellis_dual_stacked_column": {
        "categoryAxis.color": "#d8d8d8",
        "legend.marker.shape": "squareWithRadius",
        "plotArea.gap.groupSpacing": 1,
        "plotArea.gap.innerGroupSpacing": 0.125,
        "plotArea.gridline.visible": false,
        "plotArea.gridline.zeroLine.color": "#f6f6f6",
        "plotArea.primaryScale.autoMaxValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.primaryScale.autoMinValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.primaryScale.fixedRange": {
            "defaultValue": false,
            "serializable": false
        },
        "plotArea.primaryScale.maxValue": {
            "defaultValue": null,
            "serializable": false
        },
        "plotArea.primaryScale.minValue": {
            "defaultValue": null,
            "serializable": false
        },
        "plotArea.secondaryScale.autoMaxValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.secondaryScale.autoMinValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.secondaryScale.fixedRange": {
            "defaultValue": false,
            "serializable": false
        },
        "plotArea.secondaryScale.maxValue": {
            "defaultValue": null,
            "serializable": false
        },
        "plotArea.secondaryScale.minValue": {
            "defaultValue": null,
            "serializable": false
        }
    },
    "info/trellis_horizontal_area": {
        "categoryAxis.axisLine.size": 1,
        "categoryAxis.axisLine.visible": true,
        "categoryAxis.axisTick.visible": true,
        "categoryAxis.color": "#d8d8d8",
        "categoryAxis.hoverShadow.color": "#cccccc",
        "categoryAxis.label.hideSubLevels": false,
        "categoryAxis.label.style.color": "#333333",
        "categoryAxis.label.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "categoryAxis.label.style.fontSize": "12px",
        "categoryAxis.label.style.fontStyle": "normal",
        "categoryAxis.label.style.fontWeight": "normal",
        "categoryAxis.label.visible": true,
        "categoryAxis.labelRenderer": null,
        "categoryAxis.layout.maxHeight": 0.3,
        "categoryAxis.layout.maxWidth": 0.3,
        "categoryAxis.mouseDownShadow.color": "#808080",
        "categoryAxis.title.applyAxislineColor": false,
        "categoryAxis.title.style.color": "#000000",
        "categoryAxis.title.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "categoryAxis.title.style.fontSize": "14px",
        "categoryAxis.title.style.fontStyle": "normal",
        "categoryAxis.title.style.fontWeight": "bold",
        "categoryAxis.title.text": null,
        "categoryAxis.title.visible": false,
        "categoryAxis.visible": true,
        "feedingZone": {
            "defaultValue": [
                {
                    "bindDef": [
                        {
                            "id": null
                        }
                    ],
                    "bound": [
                        [
                            [
                                0,
                                0
                            ],
                            [
                                0,
                                0
                            ],
                            [
                                0,
                                0
                            ],
                            [
                                0,
                                0
                            ]
                        ]
                    ],
                    "name": null
                }
            ],
            "readonly": true,
            "serializable": false
        },
        "general.groupData": false,
        "interaction.behaviorType": null,
        "interaction.decorations": {
            "defaultValue": null,
            "serializable": false
        },
        "interaction.deselected.color": null,
        "interaction.deselected.opacity": 0.4,
        "interaction.hover.color": null,
        "interaction.hover.stroke.color": "darken(20%)",
        "interaction.hover.stroke.visible": true,
        "interaction.hover.stroke.width": "2px",
        "interaction.selectability.axisLabelSelection": true,
        "interaction.selectability.legendSelection": true,
        "interaction.selectability.mode": "INCLUSIVE",
        "interaction.selectability.plotLassoSelection": true,
        "interaction.selectability.plotStdSelection": true,
        "interaction.selected.color": null,
        "interaction.selected.stroke.color": "darken(20%)",
        "interaction.selected.stroke.visible": true,
        "interaction.selected.stroke.width": "1px",
        "legend.drawingEffect": "normal",
        "legend.hoverShadow.color": "#cccccc",
        "legend.isScrollable": false,
        "legend.itemMargin": 0.5,
        "legend.label.style.color": "#000000",
        "legend.label.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "legend.label.style.fontSize": "12px",
        "legend.label.style.fontStyle": "normal",
        "legend.label.style.fontWeight": "normal",
        "legend.marker.size": null,
        "legend.maxNumOfItems": null,
        "legend.mouseDownShadow.color": "#808080",
        "legend.order": {
            "defaultValue": null,
            "serializable": false
        },
        "legend.postRenderer": null,
        "legend.scrollbar.border.color": "white",
        "legend.scrollbar.border.width": 0,
        "legend.scrollbar.spacing": 0,
        "legend.scrollbar.thumb.fill": "#e5e5e5",
        "legend.scrollbar.thumb.hoverFill": "#dedede",
        "legend.scrollbar.track.fill": "#f7f7f7",
        "legend.showFullLabel": true,
        "legend.title.style.color": "#000000",
        "legend.title.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "legend.title.style.fontSize": "14px",
        "legend.title.style.fontStyle": "normal",
        "legend.title.style.fontWeight": "bold",
        "legend.title.text": null,
        "legend.title.visible": false,
        "legend.visible": true,
        "legendGroup.computedVisibility": {
            "defaultValue": true,
            "readonly": true,
            "serializable": false
        },
        "legendGroup.layout.alignment": "topLeft",
        "legendGroup.layout.maxHeight": 0.25,
        "legendGroup.layout.maxWidth": 0.25,
        "legendGroup.layout.position": "right",
        "legendGroup.layout.respectPlotPosition": true,
        "legendGroup.renderTo": null,
        "plotArea.areaRenderer": null,
        "plotArea.background.border.stroke": "#d8d8d8",
        "plotArea.background.border.strokeWidth": 1,
        "plotArea.background.color": "transparent",
        "plotArea.background.drawingEffect": "normal",
        "plotArea.background.gradientDirection": "vertical",
        "plotArea.background.visible": true,
        "plotArea.colorPalette": {
            "defaultValue": [
                "#748CB2",
                "#9CC677",
                "#EACF5E",
                "#F9AD79",
                "#D16A7C",
                "#8873A2",
                "#3A95B3",
                "#B6D949",
                "#FDD36C",
                "#F47958",
                "#A65084",
                "#0063B1",
                "#0DA841",
                "#FCB71D",
                "#F05620",
                "#B22D6E",
                "#3C368E",
                "#8FB2CF",
                "#95D4AB",
                "#EAE98F",
                "#F9BE92",
                "#EC9A99",
                "#BC98BD",
                "#1EB7B2",
                "#73C03C",
                "#F48323",
                "#EB271B",
                "#D9B5CA",
                "#AED1DA",
                "#DFECB2",
                "#FCDAB0",
                "#F5BCB4"
            ],
            "serializable": false
        },
        "plotArea.dataLabel.formatString": null,
        "plotArea.dataLabel.hideWhenOverlap": false,
        "plotArea.dataLabel.renderer": null,
        "plotArea.dataLabel.style.color": "#333333",
        "plotArea.dataLabel.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "plotArea.dataLabel.style.fontSize": "12px",
        "plotArea.dataLabel.style.fontStyle": "normal",
        "plotArea.dataLabel.style.fontWeight": "normal",
        "plotArea.dataLabel.unitFormatType": "FinancialUnits",
        "plotArea.dataLabel.visible": false,
        "plotArea.dataPoint.stroke.color": "#000000",
        "plotArea.dataPoint.stroke.visible": false,
        "plotArea.drawingEffect": "normal",
        "plotArea.gridline.color": "#d8d8d8",
        "plotArea.gridline.size": 1,
        "plotArea.gridline.type": "line",
        "plotArea.gridline.visible": false,
        "plotArea.gridline.zeroLine.color": null,
        "plotArea.gridline.zeroLine.highlight": true,
        "plotArea.gridline.zeroLine.unhighlightAxis": true,
        "plotArea.markerRenderer": null,
        "plotArea.primaryScale.autoMaxValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.primaryScale.autoMinValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.primaryScale.fixedRange": {
            "defaultValue": false,
            "serializable": false
        },
        "plotArea.primaryScale.maxValue": {
            "defaultValue": null,
            "serializable": false
        },
        "plotArea.primaryScale.minValue": {
            "defaultValue": null,
            "serializable": false
        },
        "plotArea.referenceLine.defaultStyle.color": "#666666",
        "plotArea.referenceLine.defaultStyle.label.background": "#ffffff",
        "plotArea.referenceLine.defaultStyle.label.color": "#333333",
        "plotArea.referenceLine.defaultStyle.label.fontFamily": "\"Open Sans\", Arial, Helvetica, sans-serif",
        "plotArea.referenceLine.defaultStyle.label.fontSize": "12px",
        "plotArea.referenceLine.defaultStyle.label.fontStyle": "normal",
        "plotArea.referenceLine.defaultStyle.label.fontWeight": "normal",
        "plotArea.referenceLine.defaultStyle.size": 1,
        "plotArea.referenceLine.defaultStyle.type": "dotted",
        "plotArea.referenceLine.line": null,
        "plotArea.scrollbar.border.color": "white",
        "plotArea.scrollbar.border.width": 0,
        "plotArea.scrollbar.spacing": 0,
        "plotArea.scrollbar.thumb.fill": "#e5e5e5",
        "plotArea.scrollbar.thumb.hoverFill": "#dedede",
        "plotArea.scrollbar.track.fill": "#f7f7f7",
        "propertyZone": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "tooltip.background.borderColor": "#cccccc",
        "tooltip.background.color": "#ffffff",
        "tooltip.bodyDimensionLabel.color": "#666666",
        "tooltip.bodyDimensionValue.color": "#666666",
        "tooltip.bodyMeasureLabel.color": "#666666",
        "tooltip.bodyMeasureValue.color": "#000000",
        "tooltip.closeButton.backgroundColor": "#ffffff",
        "tooltip.closeButton.borderColor": "#cccccc",
        "tooltip.footerLabel.color": "#000000",
        "tooltip.formatString": null,
        "tooltip.layinChart": true,
        "tooltip.postRender": null,
        "tooltip.preRender": {
            "defaultValue": null,
            "serializable": false
        },
        "tooltip.separationLine.color": "#a7a9ac",
        "tooltip.unitFormatType": "FinancialUnits",
        "tooltip.visible": true,
        "valueAxis.axisLine.size": 1,
        "valueAxis.axisLine.visible": true,
        "valueAxis.axisTick.visible": true,
        "valueAxis.color": null,
        "valueAxis.label.formatString": null,
        "valueAxis.label.style.color": "#333333",
        "valueAxis.label.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "valueAxis.label.style.fontSize": "12px",
        "valueAxis.label.style.fontStyle": "normal",
        "valueAxis.label.style.fontWeight": "normal",
        "valueAxis.label.unitFormatType": "FinancialUnits",
        "valueAxis.label.visible": true,
        "valueAxis.layout.maxHeight": 0.25,
        "valueAxis.layout.maxWidth": 0.25,
        "valueAxis.title.applyAxislineColor": false,
        "valueAxis.title.style.color": "#000000",
        "valueAxis.title.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "valueAxis.title.style.fontSize": "14px",
        "valueAxis.title.style.fontStyle": "normal",
        "valueAxis.title.style.fontWeight": "bold",
        "valueAxis.title.text": null,
        "valueAxis.title.visible": false,
        "valueAxis.visible": true
    },
    "info/trellis_horizontal_combination": {
        "categoryAxis.axisLine.size": 1,
        "categoryAxis.axisLine.visible": true,
        "categoryAxis.axisTick.visible": true,
        "categoryAxis.color": "#d8d8d8",
        "categoryAxis.hoverShadow.color": "#cccccc",
        "categoryAxis.label.hideSubLevels": false,
        "categoryAxis.label.style.color": "#333333",
        "categoryAxis.label.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "categoryAxis.label.style.fontSize": "12px",
        "categoryAxis.label.style.fontStyle": "normal",
        "categoryAxis.label.style.fontWeight": "normal",
        "categoryAxis.label.visible": true,
        "categoryAxis.labelRenderer": null,
        "categoryAxis.layout.maxHeight": 0.3,
        "categoryAxis.layout.maxWidth": 0.3,
        "categoryAxis.mouseDownShadow.color": "#808080",
        "categoryAxis.title.applyAxislineColor": false,
        "categoryAxis.title.style.color": "#000000",
        "categoryAxis.title.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "categoryAxis.title.style.fontSize": "14px",
        "categoryAxis.title.style.fontStyle": "normal",
        "categoryAxis.title.style.fontWeight": "bold",
        "categoryAxis.title.text": null,
        "categoryAxis.title.visible": false,
        "categoryAxis.visible": true,
        "interaction.selectability.axisLabelSelection": true,
        "legend.groupByShape": false,
        "legend.marker.shape": "squareWithRadius",
        "plotArea.background.gradientDirection": "horizontal",
        "plotArea.dataShape.primaryAxis": [
            "bar",
            "line",
            "line"
        ],
        "plotArea.dataShape.secondaryAxis": [
            "line",
            "line",
            "line"
        ],
        "plotArea.gap.barSpacing": 1,
        "plotArea.gap.groupSpacing": 1,
        "plotArea.gap.innerGroupSpacing": 0.125,
        "plotArea.grid.background.gradientDirection": "horizontal",
        "plotArea.gridline.visible": false,
        "plotArea.gridline.zeroLine.color": "#f6f6f6",
        "plotArea.line.lineRenderer": null,
        "plotArea.line.marker.shape": "circle",
        "plotArea.line.marker.size": 6,
        "plotArea.line.marker.visible": true,
        "plotArea.line.style": null,
        "plotArea.line.visible": true,
        "plotArea.line.width": 2,
        "plotArea.primaryScale.autoMaxValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.primaryScale.autoMinValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.primaryScale.fixedRange": {
            "defaultValue": false,
            "serializable": false
        },
        "plotArea.primaryScale.maxValue": {
            "defaultValue": null,
            "serializable": false
        },
        "plotArea.primaryScale.minValue": {
            "defaultValue": null,
            "serializable": false
        },
        "valueAxis.color": "#d8d8d8"
    },
    "info/trellis_horizontal_line": {
        "categoryAxis.axisLine.size": 1,
        "categoryAxis.axisLine.visible": true,
        "categoryAxis.axisTick.visible": true,
        "categoryAxis.color": "#d8d8d8",
        "categoryAxis.hoverShadow.color": "#cccccc",
        "categoryAxis.label.hideSubLevels": false,
        "categoryAxis.label.style.color": "#333333",
        "categoryAxis.label.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "categoryAxis.label.style.fontSize": "12px",
        "categoryAxis.label.style.fontStyle": "normal",
        "categoryAxis.label.style.fontWeight": "normal",
        "categoryAxis.label.visible": true,
        "categoryAxis.labelRenderer": null,
        "categoryAxis.layout.maxHeight": 0.3,
        "categoryAxis.layout.maxWidth": 0.3,
        "categoryAxis.mouseDownShadow.color": "#808080",
        "categoryAxis.title.applyAxislineColor": false,
        "categoryAxis.title.style.color": "#000000",
        "categoryAxis.title.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "categoryAxis.title.style.fontSize": "14px",
        "categoryAxis.title.style.fontStyle": "normal",
        "categoryAxis.title.style.fontWeight": "bold",
        "categoryAxis.title.text": null,
        "categoryAxis.title.visible": false,
        "categoryAxis.visible": true,
        "interaction.selectability.axisLabelSelection": true,
        "plotArea.background.gradientDirection": "horizontal",
        "plotArea.grid.background.gradientDirection": "horizontal",
        "plotArea.gridline.visible": false,
        "plotArea.gridline.zeroLine.color": "#f6f6f6",
        "plotArea.lineRenderer": null,
        "plotArea.lineStyle": null,
        "plotArea.lineVisible": true,
        "plotArea.marker.displayMode": "manual",
        "plotArea.marker.shape": "circle",
        "plotArea.marker.size": 6,
        "plotArea.marker.visible": true,
        "plotArea.primaryScale.autoMaxValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.primaryScale.autoMinValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.primaryScale.fixedRange": {
            "defaultValue": false,
            "serializable": false
        },
        "plotArea.primaryScale.maxValue": {
            "defaultValue": null,
            "serializable": false
        },
        "plotArea.primaryScale.minValue": {
            "defaultValue": null,
            "serializable": false
        },
        "plotArea.width": 2,
        "valueAxis.color": "#d8d8d8"
    },
    "info/trellis_line": {
        "categoryAxis.axisLine.size": 1,
        "categoryAxis.axisLine.visible": true,
        "categoryAxis.axisTick.visible": true,
        "categoryAxis.color": "#d8d8d8",
        "categoryAxis.hoverShadow.color": "#cccccc",
        "categoryAxis.label.hideSubLevels": false,
        "categoryAxis.label.style.color": "#333333",
        "categoryAxis.label.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "categoryAxis.label.style.fontSize": "12px",
        "categoryAxis.label.style.fontStyle": "normal",
        "categoryAxis.label.style.fontWeight": "normal",
        "categoryAxis.label.visible": true,
        "categoryAxis.labelRenderer": null,
        "categoryAxis.layout.maxHeight": 0.3,
        "categoryAxis.layout.maxWidth": 0.3,
        "categoryAxis.mouseDownShadow.color": "#808080",
        "categoryAxis.title.applyAxislineColor": false,
        "categoryAxis.title.style.color": "#000000",
        "categoryAxis.title.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "categoryAxis.title.style.fontSize": "14px",
        "categoryAxis.title.style.fontStyle": "normal",
        "categoryAxis.title.style.fontWeight": "bold",
        "categoryAxis.title.text": null,
        "categoryAxis.title.visible": false,
        "categoryAxis.visible": true,
        "interaction.selectability.axisLabelSelection": true,
        "plotArea.gridline.visible": false,
        "plotArea.gridline.zeroLine.color": "#f6f6f6",
        "plotArea.lineRenderer": null,
        "plotArea.lineStyle": null,
        "plotArea.lineVisible": true,
        "plotArea.marker.displayMode": "manual",
        "plotArea.marker.shape": "circle",
        "plotArea.marker.size": 6,
        "plotArea.marker.visible": true,
        "plotArea.primaryScale.autoMaxValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.primaryScale.autoMinValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.primaryScale.fixedRange": {
            "defaultValue": false,
            "serializable": false
        },
        "plotArea.primaryScale.maxValue": {
            "defaultValue": null,
            "serializable": false
        },
        "plotArea.primaryScale.minValue": {
            "defaultValue": null,
            "serializable": false
        },
        "plotArea.width": 2,
        "valueAxis.color": "#d8d8d8"
    },
    "info/trellis_pie": {
        "plotArea.scrollbar.border.color": "white",
        "plotArea.scrollbar.border.width": 0,
        "plotArea.scrollbar.spacing": 0,
        "plotArea.scrollbar.thumb.fill": "#e5e5e5",
        "plotArea.scrollbar.thumb.hoverFill": "#dedede",
        "plotArea.scrollbar.track.fill": "#f7f7f7"
    },
    "info/trellis_radar": {
        "feedingZone": {
            "defaultValue": [
                {
                    "bindDef": [
                        {
                            "id": null
                        }
                    ],
                    "bound": [
                        [
                            [
                                0,
                                0
                            ],
                            [
                                0,
                                0
                            ],
                            [
                                0,
                                0
                            ],
                            [
                                0,
                                0
                            ]
                        ]
                    ],
                    "name": null
                }
            ],
            "readonly": true,
            "serializable": false
        },
        "general.groupData": false,
        "interaction.behaviorType": null,
        "interaction.decorations": {
            "defaultValue": null,
            "serializable": false
        },
        "interaction.deselected.area.color": null,
        "interaction.deselected.area.opacity": 0.12,
        "interaction.deselected.color": null,
        "interaction.deselected.opacity": 0.4,
        "interaction.deselected.stroke.color": "darken(20%)",
        "interaction.deselected.stroke.visible": false,
        "interaction.deselected.stroke.width": "1px",
        "interaction.hover.color": null,
        "interaction.hover.opacity": 1,
        "interaction.hover.stroke.color": "darken(20%)",
        "interaction.hover.stroke.visible": true,
        "interaction.hover.stroke.width": "2px",
        "interaction.selectability.axisLabelSelection": true,
        "interaction.selectability.legendSelection": true,
        "interaction.selectability.mode": "INCLUSIVE",
        "interaction.selectability.plotLassoSelection": true,
        "interaction.selectability.plotStdSelection": true,
        "interaction.selected.area.color": null,
        "interaction.selected.area.opacity": 0.4,
        "interaction.selected.color": null,
        "interaction.selected.stroke.color": "darken(20%)",
        "interaction.selected.stroke.visible": true,
        "interaction.selected.stroke.width": "1px",
        "legend.drawingEffect": "normal",
        "legend.hoverShadow.color": "#cccccc",
        "legend.isScrollable": false,
        "legend.itemMargin": 0.5,
        "legend.label.style.color": "#000000",
        "legend.label.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "legend.label.style.fontSize": "12px",
        "legend.label.style.fontStyle": "normal",
        "legend.label.style.fontWeight": "normal",
        "legend.marker.size": null,
        "legend.maxNumOfItems": null,
        "legend.mouseDownShadow.color": "#808080",
        "legend.order": {
            "defaultValue": null,
            "serializable": false
        },
        "legend.postRenderer": null,
        "legend.scrollbar.border.color": "white",
        "legend.scrollbar.border.width": 0,
        "legend.scrollbar.spacing": 0,
        "legend.scrollbar.thumb.fill": "#e5e5e5",
        "legend.scrollbar.thumb.hoverFill": "#dedede",
        "legend.scrollbar.track.fill": "#f7f7f7",
        "legend.showFullLabel": true,
        "legend.title.style.color": "#000000",
        "legend.title.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "legend.title.style.fontSize": "14px",
        "legend.title.style.fontStyle": "normal",
        "legend.title.style.fontWeight": "bold",
        "legend.title.text": null,
        "legend.title.visible": false,
        "legend.visible": true,
        "legendGroup.computedVisibility": {
            "defaultValue": true,
            "readonly": true,
            "serializable": false
        },
        "legendGroup.layout.alignment": "topLeft",
        "legendGroup.layout.maxHeight": 0.25,
        "legendGroup.layout.maxWidth": 0.25,
        "legendGroup.layout.position": "right",
        "legendGroup.layout.respectPlotPosition": true,
        "legendGroup.renderTo": null,
        "plotArea.area.opacity": 0.3,
        "plotArea.area.visible": false,
        "plotArea.background.border.bottom.visible": true,
        "plotArea.background.border.left.visible": true,
        "plotArea.background.border.right.visible": true,
        "plotArea.background.border.stroke": "#d8d8d8",
        "plotArea.background.border.strokeWidth": 1,
        "plotArea.background.border.top.visible": true,
        "plotArea.background.color": "transparent",
        "plotArea.background.drawingEffect": "normal",
        "plotArea.background.gradientDirection": "vertical",
        "plotArea.background.visible": true,
        "plotArea.dataLabel.formatString": null,
        "plotArea.dataLabel.hideWhenOverlap": false,
        "plotArea.dataLabel.renderer": null,
        "plotArea.dataLabel.style.color": "darken(20%)",
        "plotArea.dataLabel.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "plotArea.dataLabel.style.fontSize": "12px",
        "plotArea.dataLabel.style.fontStyle": "normal",
        "plotArea.dataLabel.style.fontWeight": "normal",
        "plotArea.dataLabel.unitFormatType": "FinancialUnits",
        "plotArea.dataLabel.visible": false,
        "plotArea.dataPoint.stroke.color": "#000000",
        "plotArea.dataPoint.stroke.visible": false,
        "plotArea.drawingEffect": "normal",
        "plotArea.gridline.color": "#d8d8d8",
        "plotArea.gridline.size": 1,
        "plotArea.gridline.visible": true,
        "plotArea.line.visible": true,
        "plotArea.line.width": 2,
        "plotArea.marker.shape": "circle",
        "plotArea.marker.size": 6,
        "plotArea.marker.visible": true,
        "plotArea.markerRenderer": null,
        "plotArea.polarAxis.axisLine.size": 1,
        "plotArea.polarAxis.axisLine.visible": true,
        "plotArea.polarAxis.color": "#999999",
        "plotArea.polarAxis.hoverShadow.color": "#cccccc",
        "plotArea.polarAxis.label.style.color": "#666666",
        "plotArea.polarAxis.label.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "plotArea.polarAxis.label.style.fontSize": "12px",
        "plotArea.polarAxis.label.style.fontStyle": "normal",
        "plotArea.polarAxis.label.style.fontWeight": "normal",
        "plotArea.polarAxis.label.visible": true,
        "plotArea.polarAxis.labelRenderer": null,
        "plotArea.polarAxis.mouseDownShadow.color": "#808080",
        "plotArea.polarAxis.title.style.color": "#000000",
        "plotArea.polarAxis.title.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "plotArea.polarAxis.title.style.fontSize": "14px",
        "plotArea.polarAxis.title.style.fontStyle": "normal",
        "plotArea.polarAxis.title.style.fontWeight": "bold",
        "plotArea.polarAxis.title.text": null,
        "plotArea.polarAxis.title.visible": false,
        "plotArea.polarAxis.visible": true,
        "plotArea.primaryScale.autoMaxValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.primaryScale.autoMinValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.primaryScale.fixedRange": {
            "defaultValue": false,
            "serializable": false
        },
        "plotArea.primaryScale.maxValue": {
            "defaultValue": null,
            "serializable": false
        },
        "plotArea.primaryScale.minValue": {
            "defaultValue": null,
            "serializable": false
        },
        "plotArea.scrollbar.border.color": "white",
        "plotArea.scrollbar.border.width": 0,
        "plotArea.scrollbar.spacing": 0,
        "plotArea.scrollbar.thumb.fill": "#e5e5e5",
        "plotArea.scrollbar.thumb.hoverFill": "#dedede",
        "plotArea.scrollbar.track.fill": "#f7f7f7",
        "plotArea.valueAxis.label.formatString": null,
        "plotArea.valueAxis.label.style.color": "#333333",
        "plotArea.valueAxis.label.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "plotArea.valueAxis.label.style.fontSize": "12px",
        "plotArea.valueAxis.label.style.fontStyle": "normal",
        "plotArea.valueAxis.label.style.fontWeight": "normal",
        "plotArea.valueAxis.label.unitFormatType": "FinancialUnits",
        "plotArea.valueAxis.label.visible": true,
        "plotArea.valueAxis.title.style.color": "#000000",
        "plotArea.valueAxis.title.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "plotArea.valueAxis.title.style.fontSize": "14px",
        "plotArea.valueAxis.title.style.fontStyle": "normal",
        "plotArea.valueAxis.title.style.fontWeight": "bold",
        "plotArea.valueAxis.title.text": null,
        "plotArea.valueAxis.title.visible": false,
        "plotArea.valueAxis.visible": true,
        "propertyZone": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "tooltip.background.borderColor": "#cccccc",
        "tooltip.background.color": "#ffffff",
        "tooltip.bodyDimensionLabel.color": "#666666",
        "tooltip.bodyDimensionValue.color": "#666666",
        "tooltip.bodyMeasureLabel.color": "#666666",
        "tooltip.bodyMeasureValue.color": "#000000",
        "tooltip.closeButton.backgroundColor": "#ffffff",
        "tooltip.closeButton.borderColor": "#cccccc",
        "tooltip.footerLabel.color": "#000000",
        "tooltip.formatString": null,
        "tooltip.layinChart": true,
        "tooltip.postRender": null,
        "tooltip.preRender": {
            "defaultValue": null,
            "serializable": false
        },
        "tooltip.separationLine.color": "#a7a9ac",
        "tooltip.unitFormatType": "FinancialUnits",
        "tooltip.visible": true
    },
    "info/trellis_scatter": {
        "interaction.selectability.axisLabelSelection": true,
        "plotArea.gridline.visible": false,
        "plotArea.markerSize": 10,
        "plotArea.secondaryScale.autoMaxValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.secondaryScale.autoMinValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.secondaryScale.fixedRange": {
            "defaultValue": false,
            "serializable": false
        },
        "plotArea.secondaryScale.maxValue": {
            "defaultValue": null,
            "serializable": false
        },
        "plotArea.secondaryScale.minValue": {
            "defaultValue": null,
            "serializable": false
        },
        "valueAxis.color": "#d8d8d8",
        "valueAxis.label.formatString": null,
        "valueAxis2.axisLine.size": 1,
        "valueAxis2.axisLine.visible": true,
        "valueAxis2.axisTick.visible": true,
        "valueAxis2.color": "#d8d8d8",
        "valueAxis2.label.formatString": null,
        "valueAxis2.label.style.color": "#333333",
        "valueAxis2.label.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "valueAxis2.label.style.fontSize": "12px",
        "valueAxis2.label.style.fontStyle": "normal",
        "valueAxis2.label.style.fontWeight": "normal",
        "valueAxis2.label.unitFormatType": "FinancialUnits",
        "valueAxis2.label.visible": true,
        "valueAxis2.layout.maxHeight": 0.25,
        "valueAxis2.layout.maxWidth": 0.25,
        "valueAxis2.title.applyAxislineColor": false,
        "valueAxis2.title.style.color": "#000000",
        "valueAxis2.title.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "valueAxis2.title.style.fontSize": "14px",
        "valueAxis2.title.style.fontStyle": "normal",
        "valueAxis2.title.style.fontWeight": "bold",
        "valueAxis2.title.text": null,
        "valueAxis2.title.visible": false,
        "valueAxis2.visible": true
    },
    "info/trellis_stacked_bar": {
        "categoryAxis.axisLine.size": 1,
        "categoryAxis.axisLine.visible": true,
        "categoryAxis.axisTick.visible": true,
        "categoryAxis.color": "#d8d8d8",
        "categoryAxis.hoverShadow.color": "#cccccc",
        "categoryAxis.label.hideSubLevels": false,
        "categoryAxis.label.style.color": "#333333",
        "categoryAxis.label.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "categoryAxis.label.style.fontSize": "12px",
        "categoryAxis.label.style.fontStyle": "normal",
        "categoryAxis.label.style.fontWeight": "normal",
        "categoryAxis.label.visible": true,
        "categoryAxis.labelRenderer": null,
        "categoryAxis.layout.maxHeight": 0.3,
        "categoryAxis.layout.maxWidth": 0.3,
        "categoryAxis.mouseDownShadow.color": "#808080",
        "categoryAxis.title.applyAxislineColor": false,
        "categoryAxis.title.style.color": "#000000",
        "categoryAxis.title.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "categoryAxis.title.style.fontSize": "14px",
        "categoryAxis.title.style.fontStyle": "normal",
        "categoryAxis.title.style.fontWeight": "bold",
        "categoryAxis.title.text": null,
        "categoryAxis.title.visible": false,
        "categoryAxis.visible": true,
        "interaction.selectability.axisLabelSelection": true,
        "legend.marker.shape": "squareWithRadius",
        "plotArea.background.gradientDirection": "horizontal",
        "plotArea.gap.barSpacing": 1,
        "plotArea.grid.background.gradientDirection": "horizontal",
        "plotArea.gridline.visible": false,
        "plotArea.gridline.zeroLine.color": "#f6f6f6",
        "plotArea.primaryScale.autoMaxValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.primaryScale.autoMinValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.primaryScale.fixedRange": {
            "defaultValue": false,
            "serializable": false
        },
        "plotArea.primaryScale.maxValue": {
            "defaultValue": null,
            "serializable": false
        },
        "plotArea.primaryScale.minValue": {
            "defaultValue": null,
            "serializable": false
        },
        "valueAxis.color": "#d8d8d8"
    },
    "info/trellis_stacked_column": {
        "categoryAxis.axisLine.size": 1,
        "categoryAxis.axisLine.visible": true,
        "categoryAxis.axisTick.visible": true,
        "categoryAxis.color": "#d8d8d8",
        "categoryAxis.hoverShadow.color": "#cccccc",
        "categoryAxis.label.hideSubLevels": false,
        "categoryAxis.label.style.color": "#333333",
        "categoryAxis.label.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "categoryAxis.label.style.fontSize": "12px",
        "categoryAxis.label.style.fontStyle": "normal",
        "categoryAxis.label.style.fontWeight": "normal",
        "categoryAxis.label.visible": true,
        "categoryAxis.labelRenderer": null,
        "categoryAxis.layout.maxHeight": 0.3,
        "categoryAxis.layout.maxWidth": 0.3,
        "categoryAxis.mouseDownShadow.color": "#808080",
        "categoryAxis.title.applyAxislineColor": false,
        "categoryAxis.title.style.color": "#000000",
        "categoryAxis.title.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "categoryAxis.title.style.fontSize": "14px",
        "categoryAxis.title.style.fontStyle": "normal",
        "categoryAxis.title.style.fontWeight": "bold",
        "categoryAxis.title.text": null,
        "categoryAxis.title.visible": false,
        "categoryAxis.visible": true,
        "interaction.selectability.axisLabelSelection": true,
        "legend.marker.shape": "squareWithRadius",
        "plotArea.gap.barSpacing": 1,
        "plotArea.gridline.visible": false,
        "plotArea.gridline.zeroLine.color": "#f6f6f6",
        "plotArea.primaryScale.autoMaxValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.primaryScale.autoMinValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.primaryScale.fixedRange": {
            "defaultValue": false,
            "serializable": false
        },
        "plotArea.primaryScale.maxValue": {
            "defaultValue": null,
            "serializable": false
        },
        "plotArea.primaryScale.minValue": {
            "defaultValue": null,
            "serializable": false
        },
        "valueAxis.color": "#d8d8d8"
    },
    "info/trellis_vertical_bullet": {
        "categoryAxis.color": "#d8d8d8"
    },
    "info/vertical_bullet": {
        "categoryAxis.label.angle": 90,
        "categoryAxis.label.rotation": "auto",
        "categoryAxis.label.truncatedLabelRatio": 0.2,
        "categoryAxis.layout.height": null,
        "categoryAxis.layout.width": null,
        "interaction.enableKeyboard": false,
        "interaction.noninteractiveMode": false,
        "interaction.zoom.direction": "all",
        "interaction.zoom.enablement": "auto",
        "legendGroup.forceToShow": false,
        "legendGroup.layout.height": null,
        "legendGroup.layout.width": null,
        "plotArea.background.border.bottom.visible": true,
        "plotArea.background.border.left.visible": true,
        "plotArea.background.border.right.visible": false,
        "plotArea.background.border.top.visible": false,
        "plotArea.dataPointSize.max": 96,
        "plotArea.dataPointSize.min": 24,
        "plotArea.isFixedDataPointSize": false,
        "plotArea.window.end": null,
        "plotArea.window.start": null,
        "title.layout.height": null,
        "valueAxis.layout.height": null,
        "valueAxis.layout.width": null
    },
    "info/waterfall": {
        "categoryAxis.axisLine.size": 1,
        "categoryAxis.axisLine.visible": true,
        "categoryAxis.axisTick.visible": true,
        "categoryAxis.color": "#6c6c6c",
        "categoryAxis.hoverShadow.color": "#cccccc",
        "categoryAxis.label.angle": 90,
        "categoryAxis.label.hideSubLevels": false,
        "categoryAxis.label.rotation": "auto",
        "categoryAxis.label.style.color": "#333333",
        "categoryAxis.label.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "categoryAxis.label.style.fontSize": "12px",
        "categoryAxis.label.style.fontStyle": "normal",
        "categoryAxis.label.style.fontWeight": "normal",
        "categoryAxis.label.truncatedLabelRatio": 0.2,
        "categoryAxis.label.visible": true,
        "categoryAxis.labelRenderer": null,
        "categoryAxis.layout.height": null,
        "categoryAxis.layout.maxHeight": 0.3,
        "categoryAxis.layout.maxWidth": 0.3,
        "categoryAxis.layout.width": null,
        "categoryAxis.mouseDownShadow.color": "#808080",
        "categoryAxis.title.applyAxislineColor": false,
        "categoryAxis.title.style.color": "#000000",
        "categoryAxis.title.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "categoryAxis.title.style.fontSize": "14px",
        "categoryAxis.title.style.fontStyle": "normal",
        "categoryAxis.title.style.fontWeight": "bold",
        "categoryAxis.title.text": null,
        "categoryAxis.title.visible": false,
        "categoryAxis.visible": true,
        "feedingZone": {
            "defaultValue": [
                {
                    "bindDef": [
                        {
                            "id": null
                        }
                    ],
                    "bound": [
                        [
                            [
                                0,
                                0
                            ],
                            [
                                0,
                                0
                            ],
                            [
                                0,
                                0
                            ],
                            [
                                0,
                                0
                            ]
                        ]
                    ],
                    "name": null
                }
            ],
            "readonly": true,
            "serializable": false
        },
        "general.groupData": false,
        "interaction.behaviorType": null,
        "interaction.decorations": {
            "defaultValue": null,
            "serializable": false
        },
        "interaction.deselected.color": null,
        "interaction.deselected.opacity": 0.4,
        "interaction.deselected.stroke.color": "darken(20%)",
        "interaction.deselected.stroke.visible": false,
        "interaction.deselected.stroke.width": "1px",
        "interaction.enableKeyboard": false,
        "interaction.hover.color": null,
        "interaction.hover.opacity": 1,
        "interaction.hover.stroke.color": "darken(20%)",
        "interaction.hover.stroke.visible": true,
        "interaction.hover.stroke.width": "2px",
        "interaction.noninteractiveMode": false,
        "interaction.selectability.axisLabelSelection": true,
        "interaction.selectability.legendSelection": true,
        "interaction.selectability.mode": "INCLUSIVE",
        "interaction.selectability.plotLassoSelection": true,
        "interaction.selectability.plotStdSelection": true,
        "interaction.selected.color": null,
        "interaction.selected.stroke.color": "darken(20%)",
        "interaction.selected.stroke.visible": true,
        "interaction.selected.stroke.width": "1px",
        "interaction.zoom.direction": "all",
        "interaction.zoom.enablement": "auto",
        "legend.drawingEffect": "normal",
        "legend.hoverShadow.color": "#cccccc",
        "legend.isScrollable": false,
        "legend.itemMargin": 0.5,
        "legend.label.style.color": "#000000",
        "legend.label.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "legend.label.style.fontSize": "12px",
        "legend.label.style.fontStyle": "normal",
        "legend.label.style.fontWeight": "normal",
        "legend.label.text.negativeValue": "Decreasing",
        "legend.label.text.positiveValue": "Increasing",
        "legend.label.text.total": "Total",
        "legend.marker.shape": "squareWithRadius",
        "legend.marker.size": null,
        "legend.maxNumOfItems": null,
        "legend.mouseDownShadow.color": "#808080",
        "legend.order": {
            "defaultValue": null,
            "serializable": false
        },
        "legend.postRenderer": null,
        "legend.scrollbar.border.color": "white",
        "legend.scrollbar.border.width": 0,
        "legend.scrollbar.spacing": 0,
        "legend.scrollbar.thumb.fill": "#e5e5e5",
        "legend.scrollbar.thumb.hoverFill": "#dedede",
        "legend.scrollbar.track.fill": "#f7f7f7",
        "legend.showFullLabel": true,
        "legend.title.style.color": "#000000",
        "legend.title.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "legend.title.style.fontSize": "14px",
        "legend.title.style.fontStyle": "normal",
        "legend.title.style.fontWeight": "bold",
        "legend.title.text": null,
        "legend.title.visible": false,
        "legend.visible": true,
        "legendGroup.computedVisibility": {
            "defaultValue": true,
            "readonly": true,
            "serializable": false
        },
        "legendGroup.forceToShow": false,
        "legendGroup.layout.alignment": "topLeft",
        "legendGroup.layout.height": null,
        "legendGroup.layout.maxHeight": 0.25,
        "legendGroup.layout.maxWidth": 0.25,
        "legendGroup.layout.position": "right",
        "legendGroup.layout.respectPlotPosition": true,
        "legendGroup.layout.width": null,
        "legendGroup.renderTo": null,
        "plotArea.background.border.bottom.visible": true,
        "plotArea.background.border.left.visible": true,
        "plotArea.background.border.right.visible": true,
        "plotArea.background.border.stroke": "#d8d8d8",
        "plotArea.background.border.strokeWidth": 1,
        "plotArea.background.border.top.visible": true,
        "plotArea.background.color": "transparent",
        "plotArea.background.drawingEffect": "normal",
        "plotArea.background.gradientDirection": "vertical",
        "plotArea.background.visible": true,
        "plotArea.colorPalette": {
            "defaultValue": [
                "#748CB2",
                "#9CC677",
                "#EACF5E",
                "#F9AD79",
                "#D16A7C",
                "#8873A2",
                "#3A95B3",
                "#B6D949",
                "#FDD36C",
                "#F47958",
                "#A65084",
                "#0063B1",
                "#0DA841",
                "#FCB71D",
                "#F05620",
                "#B22D6E",
                "#3C368E",
                "#8FB2CF",
                "#95D4AB",
                "#EAE98F",
                "#F9BE92",
                "#EC9A99",
                "#BC98BD",
                "#1EB7B2",
                "#73C03C",
                "#F48323",
                "#EB271B",
                "#D9B5CA",
                "#AED1DA",
                "#DFECB2",
                "#FCDAB0",
                "#F5BCB4"
            ],
            "serializable": false
        },
        "plotArea.dataLabel.formatString": null,
        "plotArea.dataLabel.hideWhenOverlap": false,
        "plotArea.dataLabel.renderer": null,
        "plotArea.dataLabel.style.color": "#333333",
        "plotArea.dataLabel.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "plotArea.dataLabel.style.fontSize": "12px",
        "plotArea.dataLabel.style.fontStyle": "normal",
        "plotArea.dataLabel.style.fontWeight": "normal",
        "plotArea.dataLabel.unitFormatType": "FinancialUnits",
        "plotArea.dataLabel.visible": false,
        "plotArea.dataPoint.color.isSemanticColoring": true,
        "plotArea.dataPoint.color.negative": "#EB271B",
        "plotArea.dataPoint.color.positive": "#67AC36",
        "plotArea.dataPoint.color.total": "#848f94",
        "plotArea.dataPoint.stroke.color": "#000000",
        "plotArea.dataPoint.stroke.visible": false,
        "plotArea.dataPointSize.max": 96,
        "plotArea.dataPointSize.min": 24,
        "plotArea.dataPointStyle": null,
        "plotArea.dataPointStyleMode": "update",
        "plotArea.defaultOthersStyle.color": "#000000",
        "plotArea.drawingEffect": "normal",
        "plotArea.gap.barSpacing": 1,
        "plotArea.gap.groupSpacing": 1,
        "plotArea.gap.innerGroupSpacing": 0.125,
        "plotArea.gridline.color": "#d8d8d8",
        "plotArea.gridline.size": 1,
        "plotArea.gridline.type": "line",
        "plotArea.gridline.visible": true,
        "plotArea.gridline.zeroLine.color": null,
        "plotArea.gridline.zeroLine.highlight": true,
        "plotArea.gridline.zeroLine.unhighlightAxis": true,
        "plotArea.isFixedDataPointSize": false,
        "plotArea.linkline.color": "#333333",
        "plotArea.linkline.size": 1,
        "plotArea.linkline.type": "line",
        "plotArea.linkline.visible": true,
        "plotArea.markerRenderer": null,
        "plotArea.primaryScale.autoMaxValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.primaryScale.autoMinValue": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "plotArea.primaryScale.fixedRange": {
            "defaultValue": false,
            "serializable": false
        },
        "plotArea.primaryScale.maxValue": {
            "defaultValue": null,
            "serializable": false
        },
        "plotArea.primaryScale.minValue": {
            "defaultValue": null,
            "serializable": false
        },
        "plotArea.referenceLine.defaultStyle.color": "#666666",
        "plotArea.referenceLine.defaultStyle.label.background": "#ffffff",
        "plotArea.referenceLine.defaultStyle.label.color": "#333333",
        "plotArea.referenceLine.defaultStyle.label.fontFamily": "\"Open Sans\", Arial, Helvetica, sans-serif",
        "plotArea.referenceLine.defaultStyle.label.fontSize": "12px",
        "plotArea.referenceLine.defaultStyle.label.fontStyle": "normal",
        "plotArea.referenceLine.defaultStyle.label.fontWeight": "normal",
        "plotArea.referenceLine.defaultStyle.size": 1,
        "plotArea.referenceLine.defaultStyle.type": "dotted",
        "plotArea.referenceLine.line": null,
        "plotArea.scrollbar.border.color": "white",
        "plotArea.scrollbar.border.width": 0,
        "plotArea.scrollbar.spacing": 0,
        "plotArea.scrollbar.thumb.fill": "#e5e5e5",
        "plotArea.scrollbar.thumb.hoverFill": "#dedede",
        "plotArea.scrollbar.track.fill": "#f7f7f7",
        "plotArea.window.end": null,
        "plotArea.window.start": null,
        "propertyZone": {
            "defaultValue": null,
            "readonly": true,
            "serializable": false
        },
        "title.layout.height": null,
        "tooltip.background.borderColor": "#cccccc",
        "tooltip.background.color": "#ffffff",
        "tooltip.bodyDimensionLabel.color": "#666666",
        "tooltip.bodyDimensionValue.color": "#666666",
        "tooltip.bodyMeasureLabel.color": "#666666",
        "tooltip.bodyMeasureValue.color": "#000000",
        "tooltip.closeButton.backgroundColor": "#ffffff",
        "tooltip.closeButton.borderColor": "#cccccc",
        "tooltip.footerLabel.color": "#000000",
        "tooltip.formatString": null,
        "tooltip.layinChart": true,
        "tooltip.postRender": null,
        "tooltip.preRender": {
            "defaultValue": null,
            "serializable": false
        },
        "tooltip.separationLine.color": "#a7a9ac",
        "tooltip.unitFormatType": "FinancialUnits",
        "tooltip.visible": true,
        "valueAxis.axisLine.size": 1,
        "valueAxis.axisLine.visible": true,
        "valueAxis.axisTick.visible": true,
        "valueAxis.color": "#6c6c6c",
        "valueAxis.label.formatString": null,
        "valueAxis.label.style.color": "#333333",
        "valueAxis.label.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "valueAxis.label.style.fontSize": "12px",
        "valueAxis.label.style.fontStyle": "normal",
        "valueAxis.label.style.fontWeight": "normal",
        "valueAxis.label.unitFormatType": "FinancialUnits",
        "valueAxis.label.visible": true,
        "valueAxis.layout.height": null,
        "valueAxis.layout.maxHeight": 0.25,
        "valueAxis.layout.maxWidth": 0.25,
        "valueAxis.layout.width": null,
        "valueAxis.title.applyAxislineColor": false,
        "valueAxis.title.style.color": "#000000",
        "valueAxis.title.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "valueAxis.title.style.fontSize": "14px",
        "valueAxis.title.style.fontStyle": "normal",
        "valueAxis.title.style.fontWeight": "bold",
        "valueAxis.title.text": null,
        "valueAxis.title.visible": false,
        "valueAxis.visible": true
    }
};
});
define('sap/viz/framework/core/ChartPropertyRegistry',[], function() {
    /**
     * stores property metadata:
     * {
     *      properties:{},
     *      metadata: {
     *          extendTitle: true/false,
     *          extendLegend: true/false
     *      }
     * } 
     */
    var _properties = {};
    var VALID_PROPERTY_META_ENTRIES = {
        "supportedValueType": false,
        "supportedValues": false,
        "defaultValue": true,
        "readonly": true,
        "serializable": true,
        "description": false
    };

    function isPropertyObject(obj) {
        for(var prop in obj) {
            if(obj.hasOwnProperty(prop) && !(prop in VALID_PROPERTY_META_ENTRIES)) {
                return false;
            }
        }
        return true;
    }

    /**
     * copy properties object recursively, and filter out invalid property metadata
     * @param  {Object} properties to copy
     * @return {Object} the copied properties
     */
    function copy(properties) {
        var ret, prop;
        if(properties instanceof Object) {
            ret = {};
            if(isPropertyObject(properties)) {
                for(prop in properties) {
                    if(properties.hasOwnProperty(prop) && VALID_PROPERTY_META_ENTRIES[prop]) {
                        ret[prop] = properties[prop];
                    }
                }
            } else {
                for(prop in properties) {
                    if(properties.hasOwnProperty(prop)) {
                        ret[prop] = copy(properties[prop]);
                    }
                }
            }
            return ret;
        } else {
            return properties;
        }
    }

    function register(type, properties, metadata) {
        var prop = _properties[type] || {};
        prop.properties = copy(properties);
        prop.metadata = metadata || {};
        _properties[type] = prop;
    }

    // Will never return null values
    function get(type) {
        return _properties[type] || {
            isEmpty: true,
            properties: {},
            metadata: {}
        };
    }

    function unregister(type) {
        _properties[type] = undefined;
    }

    return {
        register: register,
        unregister: unregister,
        get: get
    };
});
define('sap/viz/framework/property/PropertyManager',[
    "sap/viz/framework/common/util/TypeUtils",
    "sap/viz/framework/common/util/ObjectUtils"
], function(TypeUtils, ObjectUtils) {

    var isFunction = TypeUtils.isFunction;
    var isArray = TypeUtils.isArray;

    var configKeywords = {
        customizeValue: 1,
        value: 1,
        appValue: 1,
        templateValue: 1,
        defaultValue: 1,
        set: 1,
        get: 1,
        readonly: 1,
        serializable: 1,
        serialize: 1,
        compare: 1,
        watchers: 1
    };

    var defaultValueStack = [
        'value',
        'templateValue',
        'defaultValue'
    ];

    /**
     * Manage property CRUD operations.
     * The purpose of PropertyManager is to provide a central place for public
     * property access and management. Note that if a property is only
     * accessible by a module itself, it need not be put into property manager.
     * @class
     */
    function PropertyManager() {
        this._props = {};
        this._cache = {};
        this._watchers = {};
        this._flag = 0;
        this._flags = {};
        this.origin = this;
        this._valueStack = defaultValueStack;
        // this property is used when set/reset/serialize values, it's a default attr value if attr is not specified.
        this._defaultValueAttr = undefined;
    }

    /**
     * Check whether it is a valid property value.
     * A valid property value can be set to or get from a property.
     * @param {anything} it
     * @return {boolean}
     */
    PropertyManager.isValidValue = function(it){
        if(!isValue(it)){
            // if it has property which is included in configKeywords, it is not a valid value.
            for(var keyword in configKeywords){
                if(configKeywords.hasOwnProperty(keyword) && it.hasOwnProperty(keyword)){
                    return false;
                }
            }
        }
        return true;
    };

    var prot = PropertyManager.prototype;

    /**
     * Property name level separator
     */
    prot.separator = '.';

    /**
     * Add a new property to this manager, or override an existing property.
     * @param {string} key - the name of the property
     * @param {object} [config] - configuration of this property
     * {
     *      value: user value (level 0, the highest level)
     *      appValue: application value (level 1)
     *      templateValue: template value (level 2)
     *      defaultValue: default value (level 3, the lowest level)
     *      readonly: {Boolean} whether this prop is readonly
     *      serializable: {Boolean} whether this prop is serializable.
     *      get: {Function(value, config):void} user defined get function
     *      set: {Function(value, config):anything} user defined set function
     *      filter: {Function(key, value):boolean} user defined filter function to judge whether to serialize a prop
     *      serialize: {Function(value):anything} user defined serialize function
     *      compare: {Function(a, b):boolean} user defined compare function to check whether a value is changed
     * }
     * @param {boolean} [safe] - if true, existing properties (or prefix) won't be overrided
     * @example
     * propMgr.add("some.prop");
     * propMgr.add("some.prop", { readonly: true });
     * propMgr.add({
     *    "some.prop": { readonly: true }
     * });
     * propMgr.add({
     *    "some": {
     *        "prop": { readonly: true },
     *        "other.prop": { serializable: false }
     *    }
     * });
     * propMgr.add({
     *     "some": {
     *         "prop": "default value"
     *     }
     * });
     */
    prot.add = function(key, config, safe, flag) {
        if (typeof key === 'string') {
            if(key){
                if (this._prefix) {
                    key = this._prefix + this.separator + key;
                }
                addProp(this, key, config, safe, flag);
            }
        } else {
            var obj = key;
            flag = safe;
            safe = config;
            if (this._prefix) {
                var tmp = obj;
                obj = {};
                obj[this._prefix] = tmp;
            }
            addAll(this, obj, '', safe, flag);
        }
    };

    /**
     * Remove a property
     * @param {string} key - the name of the property
     */
    prot.remove = function(key) {
        key = getKey(this, key);
        if (this._allow(key, 'remove')) {
            delete this._props[key];
            // clear watchers
            delete this._watchers[key];
            // clear flag
            delete this._flags[key];

            // also clear all caches for this key
            var parts = parts || key.split(this.separator);
            var prefix = '';
            for(var i = 0; i < parts.length; ++i){
                prefix = prefix ? prefix + this.separator + parts[i] : parts[i];
                var cache = this._cache[prefix];
                if(cache && cache[key]){
                    delete cache[key];
                }
                if(prefix === key){
                    delete this._cache[prefix];
                }
            }
        }
    };

    /**
     * Get/set the current flag of this manager.
     * If any flag exists, this manager only operates on the properties that were added with the matching flag.
     * @param {number} flag - a set of flags represented by bit map.
     * @return {number}
     */
    prot.flag = function(flag, isAdd){
        if(typeof flag === 'number'){
            flag = parseInt(flag, 10);
            this._flag = isAdd ? this._flag | flag : flag;
        }
        return this._flag;
    };

    /**
     * Get an array of property names with the given prefix
     * @param {string} [prefix] - a common prefix of property names
     * @return {array} property full names
     */
    prot.names = function(prefix) {
        prefix = getPrefix(this, prefix);
        var result = [];
        var storage = getCache(this, prefix);
        for (var key in storage) {
            if (storage.hasOwnProperty(key) && this._allow(key, 'names')){
                result.push(key);
            }
        }
        return result;
    };

    /**
     * Check whether a property exists
     * @param {string} key - the name of the property
     * @param {string} [attr] - if provided, check whether the specified attribute exists
     * @return {boolean} whether this property exists
     */
    prot.has = function(key, attr) {
        key = getKey(this, key);
        if(this._allow(key, 'has', attr)){
            var config = this._props[key];
            if (config && configKeywords[attr]) {
                return config.hasOwnProperty(attr);
            }
            return !!config;
        }
        return false;
    };

    /**
     * Get/set the value stack of this manager.
     * The default value stack is (from the hightest level to the lowest level):
     *      ["value", "appValue", "templateValue", "defaultValue"]
     * When a higher level value does not exist, the manager will try to find its corresponding lower level value.
     * @param {string[]} [valueStack] - the value stack to be set
     * @return {string[]} a copy of the value stack.
     */
    prot.valueStack = function(valueStack){
        if (isArray(valueStack)) {
            this._valueStack = valueStack;
        }
        return this._valueStack.slice();
    };

    /**
     * Set/get the default value attr which will be used as the attr value when set/reset/serialize.
     * @param {String} the default attr to be set, if not passed or as undefined/null value, clear it.
     * @return {String} the default attr which will be used when set(if attr is not specified when set) or undefined.
     */
    prot.defaultValueAttr = function (attr) {
        if (arguments.length === 0) {
            return this._valueStack.indexOf(this._defaultValueAttr) > -1 ?
                this._defaultValueAttr : this._valueStack[0];

        } else if (attr === undefined || this._valueStack.indexOf(attr) > -1) {
            this._defaultValueAttr = attr;
        }
    };

    /**
     * Get the value of a property, or get values of a bunch of properties.
     * @param {string} [key] - the name of the property, or a prefix of a bunch of properties.
     * @param {string} [attr] - if provided, get the specified attribute instead of value
     * @param {boolean} [strict] - if set to truthy, only get the value of the specified attr (or default to 'value').
     * If there's no value set to this attr, then will not include this property in the output.
     * @return {*}
     * @example
     * // get a single property:
     * var visible = propMgr.get('title.visible');
     * // get a bunch of properties by prefix:
     * var props = propMgr.get('title');
     * var visible = props.visible;
     * // check whether a property is readonly:
     * var readonly = propMgr.get('title.visible', 'readonly');
     * // check whether a bunch of properties are readonly:
     * var readonlys = propMgr.get('title', 'readonly');
     * var readonly = readonlys.visible;
     * // get all properties in this property manager (or proxy):
     * var props = propMgr.get();
     * // get "templateValue" only, do not fallback to "defaultValue"
     * var props = propMgr.get('title', 'defaultValue', true);
     */
    prot.get = function(key, attr, strict) {
        key = getKey(this, key);
        return (this._props[key] ? get : getMultiple)(this, key, attr, strict);
    };

    /**
     * Set property value, and notify all watchers when the new value is
     * different from the old one.
     * @param {string} key - the name of the property
     * @param {*} value - the new value of the property
     * @param {boolean} [forced=false] - whether force to set even if the property is readonly
     * @param {string} [attr] - if provided, set the specified attribute instead of value
     * @example
     * // set a single property value:
     * propMgr.set('legend.title.color', '#cccccc');
     * // set a bunch of properties by providing a prefix:
     * propMgr.set('legend', {
     *      title: {
     *          visible: true,
     *          color: '#cccccc'
     *      }
     * });
     * // set a bunch of properties withour prividing a prefix:
     * propMgr.set({
     *      legend: {
     *          title: {
     *              visible: true,
     *              color: '#cccccc'
     *          },
     *          "layout.position": right
     *      }
     * });
     * // force to set a readonly property:
     * propMgr.set('legend.title.text', 'abc', true);
     * // set a property to be serializable:
     * propMgr.set('legend.title.color', true, true, 'serializable');
     */
    prot.set = function(key, value, forced, attr) {
        if (typeof key !== 'string') {
            attr = forced;
            forced = value;
            value = key;
            key = '';
        }
        key = getKey(this, key);
        (this._props[key] ? set : setMultiple)(this, key, value, forced, attr);
    };

    /**
     * Reset (delete) a property attribute on a bunch of properties with the given prefix, by default reset the value
     * @param {string} [prefix] - prefix to reset, if omitted, reset all properties
     * @param {string} [attr] - if provided, delete the specified attribute instead of value
     * @param {boolean} [downTo] - if true, reset all value levels above this level, as well as this level.
     * e.g. downTo templateValue means to reset value, appValue and templateValue
     */
    prot.reset = function(prefix, attr, downTo){
        if(configKeywords[prefix]){
            downTo = attr;
            attr = prefix;
            prefix = '';
        }
        prefix = getPrefix(this, prefix);
        var properties = getCache(this, prefix);
        var valueStack = this._valueStack;

        attr = attr || this.defaultValueAttr();
        var startLevel = valueStack.indexOf(attr);
        for(var key in properties){
            if(properties.hasOwnProperty(key)){
                var config = properties[key];
                delete config[attr];

                if(downTo){
                    for(var i = startLevel - 1; i >= 0; --i){
                        delete config[valueStack[i]];
                    }
                }
            }
        }
    };

    /**
     * Watch a property, get notified when it is changed.
     * @param {string} key - the name of the property
     * @param {function} callback
     * @return {object} a handler object holding a remove function to unwatch.
     * @example
     * var handler = propMgr.watch("some.prop", function(newValue, oldValue, key){});
     * handler.remove();
     */
    prot.watch = function(key, callback){
        if (typeof key !== 'string') {
            callback = key;
            key = '';
        }
        key = getKey(this, key);
        var watchers = this._watchers[key] = this._watchers[key] || [];
        if (watchers.indexOf(callback) < 0) {
            watchers.push(callback);
        }
        return {
            remove: function(){
                var idx = watchers.indexOf(callback);
                if (idx >= 0) {
                    watchers.splice(idx, 1);
                }
            }
        };
    };

    /**
     * Load property values from a previously serialized object
     * @param {object} obj
     */
    prot.load = function(obj, prefix) {
        if (obj) {
            prefix = getPrefix(this, prefix);
            var storage = this._props;
            var dict = getPlainDict(this, prefix, obj, this.separator);
            for (var key in obj) {
                if (obj.hasOwnProperty(key) && this._allow(key, 'load')) {
                    storage[key] = storage[key] || {};
                    storage[key].value = obj[key];
                }
            }
        }
    };

    /**
     * Serialize all changed properties to an object
     * @param {object} [args]
     * @return {object}
     * @example
     * // only changed serializable properties are serialized.
     * // it's using defaultValueAttr, the result maybe different from get
     * var obj = propMgr.serialize();
     * // both changed and unchanged serializable properties are serialized.
     * var obj = propMgr.serialize({ all: true });
     * // get specified stack level(vaule level):
     & var obj = propMgr.serialize({ attr: "value" });
     * // customize what to serialize
     * var obj = propMgr.serialize({
     *      filter: function(key, value){
     *          return key != "somestring";
     *      }
     * });
     */
    prot.serialize = function(args) {
        args = args || {};
        var storage = this._props;
        var result = {};
        var hasFilter = isFunction(args.filter);
        var attr = args.attr || this.defaultValueAttr();
        for (var key in storage) {
            if (storage.hasOwnProperty(key) && this._allow(key, 'serialize')) {
                var config = storage[key];
                if (config && (config.serializable || config.serializable === undefined)) {
                    var value = get(this, key);
                    // provide a chance to customize what to serialize
                    if ((hasFilter && args.filter(key, value, config)) ||
                        // Unless explicitly specified, only serialize changed values
                        (!hasFilter && (args.all || config.hasOwnProperty(attr)))) {
                        value = isFunction(config.serialize) ? config.serialize(value) : value;
                        ObjectUtils.setObject(key, value, result, this.separator);
                    }
                }
            }
        }
        return result;
    };

    /**
     * Get the default value of a property
     * @param {string} key - the name of the property
     * @return {*}
     */
    prot.getDefault = function(key) {
        // template value is regarded as default value from user's point of view.
        return this.get(key, 'templateValue');
    };

    /**
     * Set the default value of a property
     * @param {string} key - the name of the property
     * @param {*} value - the default value of the property
     */
    prot.setDefault = function(key, value) {
        if (typeof key !== 'string') {
            value = key;
            key = '';
        }
        this.set(key, value, 1, 'defaultValue');
    };

    /**
     * Return a proxy of this manager that works under a given prefix
     * @param {string} [prefix] - prefix that the result manager will work with
     * @return {PropertyManager}
     */
    prot.proxy = function(prefix) {
        var proxy = new PropertyManager();
        proxy._prefix = getPrefix(this, prefix);
        proxy._props = this._props;
        proxy._cache = this._cache;
        proxy._watchers = this._watchers;
        proxy._allow = this._allow;
        proxy._valueStack = this._valueStack;
        proxy._flags = this._flags;
        proxy._flag = this._flag;
        proxy.parentLevel = this;
        proxy.origin = this.origin;
        proxy._defaultValueAttr = this._defaultValueAttr;
        return proxy;
    };

    /**
     * Return the prefix string of this manager
     * @return {String}
     */
    prot.prefix = function(){
        return this._prefix || '';
    };

    /**
     * Destroy this manager
     */
    prot.destroy = function(){
        this._props = null;
        this._cache = null;
        this._watchers = null;
        this.origin = null;
    };

    /**
     * The original property manager of this proxy. If this is not a proxy,
     * then this.origin is undefined.
     * @member: origin
     */

    // Protected ------------------------------------------------------

    /**
     * Check whether a property is allowed to be accessed.
     * By default it is controlled by flag, but this method can be overrided to
     * provide some additional authorization control.
     * @param {string} key
     * @param {string} operation
     * @param {string} [attr]
     * @return {boolean} anything truthy
     */
    prot._allow = function(key, operation, attr) {
        return this._matchFlag(key);
    };

    prot._matchFlag = function(key) {
        return !this._flag || +(this._flag & this._flags[key]) === +this._flags[key];
    };

    // Private------------------------------------------------------

    function addAll(manager, properties, prefix, safe, flag) {
        var pf = prefix ? prefix + manager.separator : '';
        for (var key in properties) {
            if (key && !configKeywords[key]) {
                addProp(manager, pf + key, properties[key], safe, flag);
            }
        }
    }

    function addProp(manager, key, config, safe, flag) {
        var storage = manager._props;
        var obj = storage[key] || {};
        var isProp, hasSubprop;
        var allow = 1;
        var parts, partsLen, prefix, i;

        if(safe){
            // Safe mode should not override existing properties
            parts = key.split(manager.separator);
            partsLen = parts.length;
            if(manager._cache[key] || manager._props[key]){
                // adding an existing prefix is not allowed
                allow = 0;
            }else{
                for(i = 0; i < partsLen; ++i){
                    prefix = prefix ? prefix + manager.separator + parts[i] : parts[i];
                    if(storage[prefix]){
                        // If any prefix of this key is an existing property, it is not allowed
                        allow = 0;
                        break;
                    }
                }
            }
        }

        if(isValue(config)){
            // Add to user value level if in safe mode
            if(safe){
                config = {
                    value: config
                };
            }else{
                config = {
                    defaultValue: config
                };
            }
        }else{
            config = config || {};
        }
        for (var arg in config) {
            if (configKeywords[arg]) {
                isProp = 1;
                if(allow){
                    obj[arg] = config[arg];
                }
            } else if(arg) {
                hasSubprop = 1;
            }
        }
        // If this is a property, it can not have sub properties
        if(isProp){
            hasSubprop = 0;
        }


        if (allow && key !== manager._prefix && (isProp || !hasSubprop)) {
            if(typeof obj.defaultValue === 'boolean' && !obj.type){
                obj.type = 'boolean';
            }
            if(!storage[key]){
                parts = parts || key.split(manager.separator);
                partsLen = (partsLen || parts.length) - 1; // Don't need to cache key itself
                prefix = '';
                for(i = 0; i < partsLen; ++i){
                    prefix = prefix ? prefix + manager.separator + parts[i] : parts[i];
                    var cache = manager._cache[prefix] = manager._cache[prefix] || {};
                    cache[key] = obj;
                }
                // Flags are only set on the first time "add"
                manager._flags[key] = flag || manager._flag || 0;
                storage[key] = obj;
            }
        }
        if (hasSubprop) {
            // search for hierarchical properties
            addAll(manager, config, key, safe, flag);
        }
    }

    function get(manager, key, attr, strict) {
        var config = manager._props[key];
        if (config && manager._allow(key, 'get', attr)) {
            var valueStack = manager._valueStack;
            attr = attr || valueStack[0];
            if (!strict) {
                var level = valueStack.indexOf(attr);
                if (level >= 0) {
                    return getValue(manager, config, level);
                }
            }
            return config[attr];
        }
        return undefined;
    }

    function set(manager, key, value, forced, attr) {
        var config = manager._props[key];
        if (config && manager._allow(key, 'set', attr) && (!config.readonly || forced)) {
            var defaultValueAttr = manager.defaultValueAttr();
            attr = attr || defaultValueAttr;
            if (manager._valueStack.indexOf(attr) > -1) {
                if (attr === defaultValueAttr) {
                    var oldValue = getValue(manager, config);
                    var newValue = isFunction(config.set) ? config.set(value, config) : value;
                    newValue = config[attr] = normalizeType(newValue, config);
                    if (isValueChanged(config, newValue, oldValue)) {
                        onChange(manager, key, newValue, oldValue);
                    }
                } else {
                    config[attr] = normalizeType(value, config);
                }
            } else {
                config[attr] = value;
            }
        }
    }

    function getPrefix(manager, prefix) {
        return manager._prefix && prefix ?
            manager._prefix + manager.separator + prefix :
            prefix || manager._prefix || '';
    }

    function getKey(manager, key, prefix) {
        prefix = getPrefix(manager, prefix);
        return key ? (prefix ? prefix + manager.separator : '') + key : prefix;
    }

    function getMultiple(manager, prefix, attr, strict) {
        attr = attr || manager._valueStack[0];
        var properties = getCache(manager, prefix, true);
        if(properties){
            var prefixLength = prefix ? prefix.length + manager.separator.length : 0;
            var result = {};
            var valid;
            for (var key in properties) {
                if (!strict || properties[key].hasOwnProperty(attr)) {
                    var path = key.substring(prefixLength);
                    if (path) {
                        valid = true;
                        ObjectUtils.setObject(path, get(manager, key, attr, strict), result, manager.separator);
                    }
                }
            }
            return valid ? result : undefined;
        }
        return undefined;
    }

    function setMultiple(manager, prefix, values, forced, attr) {
        values = getPlainDict(manager, prefix, values, manager.separator);
        for (var key in values) {
            if (values.hasOwnProperty(key)) {
                set(manager, key, values[key], forced, attr);
            }
        }
    }

    function getCache(manager, prefix, forGetMultiple){
        if(prefix){
            var cache = manager._cache[prefix];
            if(!forGetMultiple){
                if(!cache){
                    cache = {};
                }
                if(manager._props[prefix]){
                    cache[prefix] = cache[prefix] || manager._props[prefix];
                }
            }
            return cache;
        }
        return manager._props;
    }

    function getPlainDict(manager, prefix, obj, separator, dict) {
        dict = dict || {};
        if (!isValue(obj)) {
            prefix = prefix ? prefix + separator : '';
            for (var name in obj) {
                if (obj.hasOwnProperty(name)) {
                    var value = obj[name];
                    if (manager._props[prefix + name]) {
                        dict[prefix + name] = value;
                    } else {
                        getPlainDict(manager, prefix + name, value, separator, dict);
                    }
                }
            }
        }
        return dict;
    }

    // Event ----------------------------------------------------------------

    function onChange(manager, key, newValue, oldValue){
        function notify(watchers){
            if(watchers){
                for(var i = 0; i < watchers.length; ++i){
                    watchers[i](newValue, oldValue, key);
                }
            }
        }
        var sep = manager.separator;
        for(var parts = key.split(sep); parts.length; parts.pop()){
            notify(manager._watchers[parts.join(sep)]);
        }
        notify(manager._watchers['']);
    }

    // Utility ---------------------------------------------------------------

    function getValue(manager, config, level){
        level = level >= 0 ? level : 0;
        var valueStack = manager._valueStack;
        var len = valueStack.length;
        var value;
        for(; level < len; ++level){
            var levelName = valueStack[level];
            if(config.hasOwnProperty(levelName)){
                value = config[levelName];
                break;
            }
        }
        return isFunction(config.get) ? config.get(value, config) : value;
    }

    function isValueChanged(config, newValue, oldValue) {
        return isFunction(config.compare) ?
            config.compare(newValue, oldValue) :
            newValue !== oldValue;
    }

    function isValue(it) {
        return Object.prototype.toString.call(it) !== '[object Object]';
    }

    function normalizeType(v, config){
        if(/^boolean$/i.test(config.type)){
            if(/^true$/i.test(v)){
                v = true;
            }else if(/^false$/i.test(v)){
                v = false;
            }
        }
        return v;
    }

    return PropertyManager;
});

define('sap/viz/framework/common/log/Logger',[],
    function Setup() {
        var noop = function() {};
        Date.now = Date.now || function() {
            return +new Date();
        };

        function getLevel() {
            return this.threshold;
        }

        function setLevel(level) {
            if (typeof level === "string") {
                this.threshold = levelStr2Int(level);
            } else if (typeof level === "number") {
                this.threshold = level;
            }
        }

        /**
         * Append log message  into the browse console.
         *
         * @name ConsoleAppender
         * @property  {Number} threshold  The log level number.
         * @property  {DefaultLayout} layout  The log layout format class.
         * @property {function} print The console output function.
         * @method  ConsoleAppender#doAppend
         * @method  ConsoleAppender#setLayout
         * @method  ConsoleAppender#getLevel
         * @method  ConsoleAppender#setLevel
         */
        var ConsoleAppender = function() {
            this.threshold = Logger.LEVEL.INFO;
            this.layout = new Logger.DefaultLayout();
            this.print = typeof console !== undefined ? function(msg) {
                window.console.log(msg);
            } : noop;
        };
        ConsoleAppender.prototype = {
            doAppend: function(logTime, logLevel, logCate, logMsg) {
                this.print(this.layout.format(logTime, logLevel, logCate, logMsg));
            },
            setLayout: function(layout) {
                if (layout.format) {
                    this.layout = layout;
                }
            },
            getLevel: getLevel,
            setLevel: setLevel
        };

        /**
         * The default layout class  ConsoleAppender as console format.
         *
         * @name DefaultLayout
         */

        var DefaultLayout = function() {
            // this.df = Logger.dateFormatter;
        };
        DefaultLayout.prototype.format = function(logTime, logLevel, logCate, logMsg) {
            return "[" + logTime + "]" + "[" + getLevelStr(logLevel) + "]" + "[" + (logCate || "main") + "]-" + logMsg;
        };

        /**
         * Append log message on the DIV page.
         *
         * @name DivAppender
         * @property  {Number} threshold  The log level number.
         * @property  {HTMLLayout} layout  The log layout format class.
         * @property {<Div>} div The html div tag to display the log message.
         * @method  DivAppender#doAppend
         * @method  DivAppender#getLevel
         * @method  DivAppender#setLevel
         */
        var DivAppender = function(div) {
            //        if(!$) {  //remove jQuery dependency.
            //            throw "need jQuery";
            //        }
            this.threshold = Logger.LEVEL.INFO;
            //        this.divSl = $(div);  //remove jQuery dependency.
            this.div = div;
            this.layout = new HTMLLayout();
        };
        DivAppender.prototype = {
            getLevel: getLevel,
            setLevel: setLevel,
            doAppend: function(logTime, logLevel, logCate, logMsg) {
                //            this.divSl.append(this.layout.format(logTime, logLevel, logCate, logMsg));
                this.div.appendChild(this.layout.format(logTime, logLevel, logCate, logMsg));
            }
        };

        /**
         * The layout class specified for DivAppender as html page format.
         *
         * @name HTMLLayout
         */
        var HTMLLayout = function() {
            // this.df = Logger.dateFormatter;
        };
        HTMLLayout.prototype = {
            getStyle: function(logLevel) {
                var style;
                if (logLevel === Logger.LEVEL.ERROR) {
                    style = 'color:red';
                } else if (logLevel === Logger.LEVEL.WARN) {
                    style = 'color:orange';
                } else if (logLevel === Logger.LEVEL.DEBUG) {
                    style = 'color:green';
                } else if (logLevel === Logger.LEVEL.TRACE) {
                    style = 'color:green';
                } else if (logLevel === Logger.LEVEL.INFO) {
                    style = 'color:grey';
                } else {
                    style = 'color:yellow';
                }
                return style;
            },
            format: function(logTime, logLevel, logCate, logMsg) {
                return "<div style=\"" + this.getStyle(logLevel) + "\">[" + logTime + "]" + "[" +
                    getLevelStr(logLevel) + "][" + (logCate || "main") + "]-" + logMsg + "</div>";
            }
        };
        var FifoBuffer = function() {
            this.array = [];
        };

        FifoBuffer.prototype = {

            /**
             * @param {Object} obj any object added to buffer
             */
            push: function(obj) {
                this.array[this.array.length] = obj;
                return this.array.length;
            },
            /**
             * @return first putted in Object
             */
            pull: function() {
                if (this.array.length > 0) {
                    var firstItem = this.array[0];
                    for (var i = 0; i < this.array.length - 1; i++) {
                        this.array[i] = this.array[i + 1];
                    }
                    this.array.length = this.array.length - 1;
                    return firstItem;
                }
                return null;
            },
            length: function() {
                return this.array.length;
            }
        };
        /**
         * Append log message to a remote file via ajax call.
         *
         * @name AjaxAppender
         * @property  {Number} threshold  The log level number.
         * @property  {String} loggingUrl The ajax call url.
         * @property  {Boolean} isInProgress  The process state of ajax call.
         * @property  {Number} bufferSize  Once the log messages reaches the number, it will perform to send ajax call.
         * @property  {Number} timeout  The delayed time to send the ajax call request.
         * @property  {Arrary} loggingEventMap  The array stored the log messages.
         * @property  {JSONLayout} layout  The specified layout for AjaxAppender.
         * @property  {Arrary} loggingEventMap  The array stored the log messages.
         * @property  {httpRequest} httpRequest  The httpRequest to send ajax call.
         * @method  AjaxAppender#doAppend
         * @method  AjaxAppender#getLevel
         * @method  AjaxAppender#setLevel
         * @method  AjaxAppender#send
         * @method  AjaxAppender#onReadyStateChanged
         * @method  AjaxAppender#getXmlHttpRequest
         */

        var AjaxAppender = function(url) {
            this.loggingUrl = url;
            this.isInProgress = false;
            this.threshold = Logger.LEVEL.INFO;
            this.bufferSize = 20;
            this.timeout = 2000;
            this.loggingEventMap = [];
            this.layout = new Logger.JSONLayout();
            this.httpRequest = null;
            this.timer = undefined;
        };

        function tryAppend() {
            var appender = this;
            if (this.isInProgress === true) {
                setTimeout(function() {
                    tryAppend.call(appender);
                }, 100);
            } else {
                this.send();
            }
        }

        AjaxAppender.prototype = {
            getLevel: getLevel,
            setLevel: setLevel,
            doAppend: function(logTime, logLevel, logCate, logMsg) {
                this.loggingEventMap.push([logTime, logLevel, logCate, logMsg]);
                if (this.loggingEventMap.length <= this.bufferSize || this.isInProgress === true) {
                    var appender = this;
                    if (this.timer === undefined) {
                        this.timer = setTimeout(function() {
                            tryAppend.call(appender);
                        }, 100);
                    }
                }

                if (this.loggingEventMap.length >= this.bufferSize && this.isInProgress === false) {
                    //if bufferSize is reached send the events and reset current bufferSize
                    if (this.timer !== undefined) {
                        window.clearTimeout(this.timer);
                    }
                    this.send();
                }
            },
            send: function() {
                if (this.loggingEventMap.length > 0) {
                    this.isInProgress = true;
                    var a = [];
                    var loggingEvent;
                    for (var i = 0, lml = this.loggingEventMap.length; i < lml && i < this.bufferSize; i++) {
                        loggingEvent = this.loggingEventMap.shift();
                        a.push(this.layout.format(loggingEvent[0], loggingEvent[1], loggingEvent[2], loggingEvent[3]));
                    }

                    var content = this.layout.getHeader();
                    content += a.join(this.layout.getSeparator());
                    content += this.layout.getFooter();

                    var appender = this;
                    if (this.httpRequest === null) {
                        this.httpRequest = this.getXmlHttpRequest();
                    }
                    this.httpRequest.onreadystatechange = function() {
                        appender.onReadyStateChanged.call(appender);
                    };

                    this.httpRequest.open("POST", this.loggingUrl, true);
                    // set the request headers.
                    this.httpRequest.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                    this.httpRequest.setRequestHeader("Content-length", content.length);
                    //this.httpRequest.setRequestHeader("Content-type", this.layout.getContentType());
                    this.httpRequest.send(content);
                    appender = this;

                    try {
                        setTimeout(function() {
                            appender.httpRequest.onreadystatechange = function() {};
                            appender.httpRequest.abort();
                            //this.httpRequest = null;
                            appender.isInProgress = false;

                            if (appender.loggingEventMap.length > 0) {
                                appender.send();
                            }
                        }, this.timeout);
                    } catch (e) {}
                }
            },
            onReadyStateChanged: function() {
                var req = this.httpRequest;
                if (this.httpRequest.readyState !== 4) {
                    return;
                }

                var success = ((typeof req.status === "undefined") || req.status === 0 ||
                    (req.status >= 200 && req.status < 300));

                if (success) {

                    //ready sending data
                    this.isInProgress = false;

                } else {}
            },
            getXmlHttpRequest: function() {

                var httpRequest = false;

                try {
                    if (window.XMLHttpRequest) { // Mozilla, Safari, IE7...
                        httpRequest = new window.XMLHttpRequest();
                        if (httpRequest.overrideMimeType) {
                            httpRequest.overrideMimeType(this.layout.getContentType());
                        }
                    } else if (window.ActiveXObject) { // IE
                        try {
                            httpRequest = new window.ActiveXObject("Msxml2.XMLHTTP");
                        } catch (e) {
                            httpRequest = new window.ActiveXObject("Microsoft.XMLHTTP");
                        }
                    }
                } catch (e) {
                    httpRequest = false;
                }

                if (!httpRequest) {
                    throw "browser don't support AJAX";
                }

                return httpRequest;
            }
        };

        /**
         * The layout class specified for AjaxAppender as JSON format.
         *
         * @name JSONLayout
         */
        var JSONLayout = function() {

        };
        JSONLayout.prototype = {
            /**
             * Implement this method to create your own layout format.
             * @param {Log4js.LoggingEvent} loggingEvent loggingEvent to format
             * @return formatted String
             * @type String
             */
            format: function(logTime, logLevel, logCate, logMsg) {

                var jsonString = "{\n \"LoggingEvent\": {\n";
                jsonString += "\t\"category\": \"" + (logCate || "main") + "\",\n";
                jsonString += "\t\"level\": \"" + getLevelStr(logLevel) + "\",\n";
                jsonString += "\t\"message\": \"" + logMsg + "\",\n";
                // jsonString += "\t\"referer\": \"" + referer + "\",\n";
                // jsonString += "\t\"useragent\": \"" + useragent + "\",\n";
                jsonString += "\t\"timestamp\": \"" + logTime + "\"\n";
                jsonString += "}\n}";

                return jsonString;
            },
            /**
             * Returns the content type output by this layout.
             * @return The base class returns "text/xml".
             * @type String
             */
            getContentType: function() {
                return "text/json";
            },
            /**
             * @return Returns the header for the layout format. The base class returns null.
             * @type String
             */
            getHeader: function() {
                var useragent = "unknown";
                try {
                    useragent = window.navigator.userAgent;
                } catch (e) {
                    useragent = "unknown";
                }

                var referer = "unknown";
                try {
                    referer = window.location.href;
                } catch (e) {
                    referer = "unknown";
                }
                return "{" + "\"ClientInfo\" : {\n" + "\t\"useragent\": \"" + useragent + "\",\n" +
                    "\t\"referer\": \"" + referer + "\"\n},\n" + "\"VizLogger\": [\n";
            },
            /**
             * @return Returns the footer for the layout format. The base class returns null.
             * @type String
             */
            getFooter: function() {
                return "\n]}";
            },
            getSeparator: function() {
                return ",\n";
            }
        };

        /**
         * Get the XMLHttpRequest object independent of browser.
         * @private
         */
        var XMLLayout = function() {
            // this.df = Logger.dateFormatter;
        };
        XMLLayout.prototype = {
            format: function(logTime, logLevel, logCate, logMsg) {

                var content = "<vizLogger:event category=\"";
                content += (logCate || "main") + "\" level=\"";
                content += getLevelStr(logLevel) + "\" timestamp=\"";
                content += logTime + "\">\n";
                content += "\t<vizLogger:message><![CDATA[" + this.escapeCdata(logMsg) + "]]></vizLogger:message>\n";
                content += "</vizLogger:event>";

                return content;
            },
            /**
             * Returns the content type output by this layout.
             * @return The base class returns "text/xml".
             * @type String
             */
            getContentType: function() {
                return "text/xml";
            },
            /**
             * @return Returns the header for the layout format. The base class returns null.
             * @type String
             */
            getHeader: function() {
                var useragent = "unknown";
                try {
                    useragent = window.navigator.userAgent;
                } catch (e) {
                    useragent = "unknown";
                }

                var referer = "unknown";
                try {
                    referer = window.location.href;
                } catch (e) {
                    referer = "unknown";
                }
                return "<vizLogger:eventSet useragent=\"" + useragent + "\" referer=\"" +
                    referer.replace(/&/g, "&amp;") + "\">\n";
            },
            /**
             * @return Returns the footer for the layout format. The base class returns null.
             * @type String
             */
            getFooter: function() {
                return "</vizLogger:eventSet>\n";
            },
            getSeparator: function() {
                return "\n";
            },
            /**
             * Escape Cdata messages
             * @param str {String} message to escape
             * @return {String} the escaped message
             * @private
             */
            escapeCdata: function(str) {
                return str.replace(/\]\]>/, "]]>]]&gt;<![CDATA[");
            }
        };

        function getLevelStr(levelInt) {
            switch (levelInt) {
                case Logger.LEVEL.TRACE:
                    return "TRACE";
                case Logger.LEVEL.DEBUG:
                    return "DEBUG";
                case Logger.LEVEL.INFO:
                    return "INFO";
                case Logger.LEVEL.WARN:
                    return "WARN";
                case Logger.LEVEL.ERROR:
                    return "ERROR";
            }
        }

        function levelStr2Int(levelStr) {
            switch (levelStr.toLowerCase()) {
                case "trace":
                    return Logger.LEVEL.TRACE;
                case "debug":
                    return Logger.LEVEL.DEBUG;
                case "info":
                    return Logger.LEVEL.INFO;
                case "warn":
                    return Logger.LEVEL.WARN;
                case "error":
                    return Logger.LEVEL.ERROR;
            }
        }
        var enabled = false;
        var paused = false;
        var MaxBufferSize = 2000;
        var doLog = function(level, category, message, loggerLevel) {
            for (var appenderKey in appenders) {
                if (appenders.hasOwnProperty(appenderKey)) {
                    var appender = appenders[appenderKey];
                    var PnRAppender = appender.hasOwnProperty('profiling') && level <= levelSetting.DEBUG;
                    // pnr Appender (reference to sap.viz.base.utils.log.Analyzer), pnr default level is DEBUG.
                    if (PnRAppender || (appender.threshold >= loggerLevel && level >= appender.threshold)) {
                        // ONLY appender.threshold >= loggerLevel
                        appender.doAppend(Date.now(), level, category, message);
                    }
                }
            }
        };
        var awakeThenLog = function(level, category, message) {
            resume();
            doLog(level, category, message);
        };
        var log = noop;
        var pause = function() {
            paused = true;
            log = awakeThenLog;
        };
        var resume = function() {
            paused = false;
            log = doLog;
        };
        // id for appender
        var id = 0;
        var nextId = function() {
            return id++;
        };
        var appenders = {};
        /*
         * singleton Logger
         *
         */
        var levelSetting = {
            TRACE: 5000,
            DEBUG: 10000,
            INFO: 20000,
            WARN: 30000,
            ERROR: 40000,
            NO: Number.MAX_VALUE
        };
        var Logger = {
            LEVEL: levelSetting,
            isEnabled: function() {
                return enabled;
            },
            enable: function() {
                log = doLog;
                enabled = true;
            },
            disable: function() {
                log = noop;
                enabled = false;
            },
            toggleEnable: function() {
                if (enabled) {
                    this.disable();
                } else {
                    this.enable();
                }
            },
            addAppender: function( /*[key,] appender*/ ) {
                var _nextId = nextId();
                var key, appender;
                if (arguments.length === 1) {
                    key = _nextId;
                    appender = arguments[0];
                } else if (arguments.length >= 2) {
                    key = arguments[0];
                    appender = arguments[1];
                }
                if (typeof appender === "object" && appender.doAppend) {
                    if (appenders[key] !== undefined) {
                        return;
                    }
                    appenders[key] = appender;
                    return key;
                }

            },
            setAppenders: function(apds) {
                appenders = [];
                for (var i = 0, l = apds.length; i < l; i++) {
                    var appender = apds[i];
                    if (appender.appenderKey) {
                        this.addAppender(appender.appenderKey, appender.appender);
                    } else {
                        this.addAppender(appender.appender);
                    }
                }
            },
            removeAppender: function(key) {
                if (appenders[key] === undefined) {
                    return false;
                } else {
                    return (delete appenders[key]);
                }
            },
            getAppender: function(key) {
                return appenders[key];
            },
            getAppenders: function() {
                var appenderArray = [];
                if (appenders) {
                    for (var key in appenders) {
                        if (appenders.hasOwnProperty(key)) {
                            var item = appenders[key];
                            appenderArray.push(item);
                        }
                    }
                }
                return appenderArray;
            },
            ConsoleAppender: ConsoleAppender,
            DivAppender: DivAppender,
            AjaxAppender: AjaxAppender,
            //[time][level][category]-message [yyyy-MM-ddThh:mm:ss:ms][INFO][function1]-this is a piece of log.
            DefaultLayout: DefaultLayout,
            HTMLLayout: HTMLLayout,
            XMLLayout: XMLLayout,
            JSONLayout: JSONLayout,
            level: levelSetting.NO, // default log level.
            trace: function(message, category) {
                log(Logger.LEVEL.TRACE, category, message, this.level);
            },
            debug: function(message, category) {
                log(Logger.LEVEL.DEBUG, category, message, this.level);
            },
            info: function(message, category) {
                log(Logger.LEVEL.INFO, category, message, this.level);
            },
            warn: function(message, category) {
                log(Logger.LEVEL.WARN, category, message, this.level);
            },
            error: function(message, category) {
                log(Logger.LEVEL.ERROR, category, message, this.level);
            }
        };
        appenders["[default]"] = new Logger.ConsoleAppender();
        return Logger;
    });
define('sap/viz/framework/common/util/FunctionUtils',['sap/viz/framework/common/util/TypeUtils', 'sap/viz/framework/common/log/Logger'],
    function Setup(TypeUtils, Logger) {
        var msgparas = /\{(\d+)\}/g;
        var ArraySlice = Array.prototype.slice;

        function emptyFn() {}

        function error(msg) {
            var args = arguments;
            if (args[0]) {
                var message = args[0].replace(msgparas, function(m, n) {
                    return args[parseInt(n) + 1];
                });
                Logger.error(message);
                throw message;
            } else {
                Logger.error('Unknown error!');
                throw 'Unknown error!';
            }
        }

        function createCallChain() {
            var callChain = [];

            function ChainedFunc() {
                for (var i = 0, len = callChain.length; i < len; i++) {
                    callChain[i].apply(this, arguments);
                }
            }

            function buildChain() {
                for (var i = 0, len = arguments.length; i < len; i++) {
                    if (TypeUtils.isFunction(arguments[i])) {
                        callChain.push(arguments[i]);
                    } else {
                        Logger.error('Could not create call chain for non-function object');
                        throw 'Could not create call chain for non-function object';
                    }
                }
            }
            ChainedFunc.chain = function() {
                return createCallChain.apply(null, [].concat(callChain, ArraySlice.call(arguments)));
            };
            buildChain.apply(null, arguments);
            return ChainedFunc;
        }

        var funcUtils = {
            /**
             * empty function
             *
             * @name sap.viz.base.utils.FunctionUtils#noop
             * @function
             */
            noop: emptyFn,

            /**
             * Function throwing unsupported exception with constant error message,
             * or make a new function which could throw exception with specified
             * error message
             *
             * @name sap.viz.base.utils.FunctionUtils#unsupported
             * @function
             *
             * @param {String}
             *            (msg)
             * @return {Function}
             * @throw {Error}
             */
            unsupported: function(msg) {
                if (arguments.length) {
                    return function() {
                        throw new Error(msg || 'Unsupported function!');
                    };
                } else {
                    throw new Error('Unsupported function!');
                }
            },

            /**
             * function throwing unimplemented exception
             *
             * @name sap.viz.base.utils.FunctionUtils#unimplemented
             * @function
             */
            unimplemented: function(msg) {
                if (arguments.length) {
                    return function() {
                        throw new Error(msg || 'Unimplemented function!');
                    };
                } else {
                    throw new Error('Unimplemented function!');
                }
            },

            /**
             * function throwing error
             *
             * @name sap.viz.base.utils.FunctionUtils#error
             * @param {String}
             *            msg the error message
             * @function
             */
            error: error,

            /**
             * Return a number comparator for ascendent sorting
             *
             * @param a
             * @param b
             * @returns todo
             */
            ascending: function(a, b) {
                return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
            },
            /**
             * Return a number comparator for descendent sorting
             *
             * @param a
             * @param b
             * @returns todo
             */
            descending: function(a, b) {
                return b < a ? -1 : b > a ? 1 : b >= a ? 0 : NaN;
            },

            createCallChain: createCallChain
        };

        return funcUtils;
    });
define('sap/viz/framework/common/lang/LangMessageUtil',[],
    function Setup() {

        var number2IDS = {

            // ERROR start with 50000.
            50000: 'IDS_ERROR_DIMENSION_NOT_ZERO',
            50001: 'IDS_ERROR_DIMENSION_WRONG_COUNT',
            50002: 'IDS_ERROR_DIMENSION_WRONG_LABELS_COUNT',
            50003: 'IDS_ERROR_WRONG_VALUES_COUNT_IN_AA2',
            50004: 'IDS_ERROR_WRONG_VALUES_COUNT_IN_AA1',
            50005: 'IDS_ERROR_NOT_MEET_NUMBER_OF_FEED',
            50006: 'IDS_ERROR_WRONG_FEED_TYPE',
            50007: 'IDS_ERROR_WRONG_FEED_TYPE_IN_DEFINTION',
            50008: 'IDS_ERROR_WRONG_AXIS_INDEX',
            50009: 'IDS_ERROR_WRONG_MEASURE_AXIS_INDEX',
            50010: 'IDS_ERROR_INVALID_FEEDING',
            50011: 'IDS_ERROR_NO_FEED_ID',
            50012: 'IDS_ERROR_INVALID_FEEDING_NUMBER',
            50013: 'IDS_ERROR_NO_AXIS',
            50014: 'IDS_ERROR_FEED_NOT_ACCEPT_DATA',
            50015: 'IDS_ERROR_NOT_FIND_MEASURE_GROUP',
            50016: 'IDS_ERROR_NOT_ACCEPT',
            50017: 'IDS_ERROR_INVALID_BINDING',
            50018: 'IDS_ERROR_NOT_FIND_FEED_DEFINITION',
            50019: 'IDS_ERROR_WRONG_TYPE',
            50020: 'IDS_ERROR_NOT_SUPPORTED',
            50021: 'IDS_ERROR_NOT_DETERMINE_AXIS_INDEX',
            50022: 'IDS_ERROR_NOT_ACCEPT_2_OR_MORE_AXES',
            50023: 'IDS_ERROR_AXIS_INDEX_SHOULD_BE_1_OR_2',
            50024: 'IDS_ERROR_NOT_DETERMINE_DEMENSION',
            50025: 'IDS_ERROR_UNKNOWN_STATE',
            50026: 'IDS_ERROR_INVALID_PATH_DEFINITION',
            50027: 'IDS_ERROR_NODE_NOT_IN_SAME_ROOT',
            50028: 'IDS_ERROR_NOT_ADD_SELF_AS_CHILD',
            50029: 'IDS_ERROR_NOT_ADD_ANCESTOR_AS_CHILD',
            50030: 'IDS_ERROR_NOT_CHILD_NODE_INSERT',
            50031: 'IDS_ERROR_NODE_IS_NOT_CHILD_OF_THIS_NODE',
            50032: 'IDS_ERROR_SELECTOR_NOT_NULL',
            50033: 'IDS_ERROR_NOT_FIND_JQUERY',
            50034: 'IDS_ERROR_NEED_SPECIFY_OPTIONS_TO_INITIALIZE',
            50035: 'IDS_ERROR_NEED_SPECIFY_HOLDER_FOR_VISUALIZATION',
            50036: 'IDS_ERROR_NOT_INITIALIZE_WITHOUT_UICONTROLLER',
            50037: 'IDS_ERROR_NEED_PROVIDE_CONTAINER_FOR_FRAME',
            50038: 'IDS_ERROR_CATEGORY_NAME_NOT_EMPTY',
            50039: 'IDS_ERROR_CATEGORY_FACTORY_MUST_BE_FUNCTION',
            50040: 'IDS_ERROR_EXIST_CATEGORY_NAME',
            50041: 'IDS_ERROR_NOT_REGISTER_UNDEFINED_OBJECT',
            50042: 'IDS_ERROR_NOT_REGISTER_WITHOUT_VALID_ID',
            50043: 'IDS_ERROR_UNKNOWN_ERROR',
            50044: 'IDS_ERROR_NOT_CREATE_CHAIN_FOR_NON_FUNCTION_OBJECT',
            50045: 'IDS_ERROR_AXIS_ALREADY_EXIST',
            50046: 'IDS_ERROR_CAN_NOT_FIND_CATEGORY',
            50047: 'IDS_ERROR_ALREADY_EXIST_IN_CATEGORY',
            50048: 'IDS_ERROR_LOADING_TEMPLATE_FAIL',
            50049: 'IDS_ERROR_PARSE_ERROR_EXPECT_TO',
            50050: 'IDS_ERROR_FLATTABLE_FEED_DEF_FIELD_INDEX_MISSING',
            50051: 'IDS_ERROR_FLATTABLE_MANNUAL_FEED_WRONG_BINDING',
            50052: 'IDS_ERROR_FLATTABLE_INVALID_DATA_PARAM',
            50053: 'IDS_ERROR_DIMENSIONS_INCOMPLETE_BINDING',
            50054: 'IDS_ERROR_DIMENSIONS_OR_MEASURES_DUPLICATED_BINDING',
            50055: 'IDS_ERROR_CUSTOMIZATION_ID',
            50056: 'IDS_ERROR_CHART_TYPE_FOR_CUSTOMIZATION',
            50057: 'IDS_ERROR_DIMENSION_NOT_FOUND',
            50058: 'IDS_ERROR_SDK_VERSION_DOES_NOT_MATCH',
            50059: 'IDS_ERROR_BUNDLE_VERSION_DOES_NOT_MATCH',
            
            // warning
            40000: 'IDS_WARN_PARAMETER_NOT_CORRECT',
            40001: 'IDS_WARN_LOCALE_NOT_CORRECT'

        };


        var IDS2Number = null;
        /**
         * create a map for message key to message code.
         */
        function getIDS2NumberMapping() {
            if (IDS2Number == null && number2IDS) {
                IDS2Number = {};
                for (var num in number2IDS) {
                    if (number2IDS.hasOwnProperty(num)) {
                        IDS2Number[number2IDS[num]] = num;
                    }
                }
            }
            return IDS2Number;

        }

        var langMessageUtil = {
            /**
             * Register number/IDS pair for message globalization.
             *
             * @param {Number}
             *          message code.
             * @param {String}
             *          the key string of message content.
             */
            register: function(number, IDS) {
                if (IDS2Number === null) {
                    IDS2Number = getIDS2NumberMapping();
                }
                if (number2IDS && number2IDS.hasOwnProperty(number) === false && IDS2Number.hasOwnProperty(IDS) ===
                    false) {
                    number2IDS[number] = IDS;
                    IDS2Number[IDS] = number;
                } else {
                    // TODO: handle the number or IDS exists.
                }
            },

            /**
             * Get the message key by message code.
             *
             * @param {Number}
             *          message code.
             * @returns {String}
             *          the key string of message content.
             */
            getIDSByNumber: function(num) {
                if (number2IDS && number2IDS.hasOwnProperty(num)) {
                    return number2IDS[num];
                } else {
                    return undefined;
                }
            },
            /**
             * Get the message code by message key.
             *
             * @param {String}
             *          message key.
             * @returns {number}
             *          message code.
             */
            getNumberByIDS: function(IDS) {
                if (IDS2Number === null) {
                    IDS2Number = getIDS2NumberMapping();
                }
                if (IDS2Number && IDS2Number.hasOwnProperty(IDS)) {
                    return IDS2Number[IDS];
                } else {
                    return undefined;
                }
            }

        };
        return langMessageUtil;
    });
define('sap/viz/framework/common/util/DOM',[],function() {
    return {
        remove: function(node){
            if (node && node.parentNode){
                node.parentNode.removeChild(node);
            }
        },
        empty: function(node) {
            var temp;
            while ((temp = node.firstChild)) {
                node.removeChild(temp);
            }
            return node;
        },
        matches: function(node, selector) {
            return (node.matches || node.webkitMatchesSelector ||
                node.msMatchesSelector || node.mozMatchesSelector).call(node,
                selector);
        },
        hasClass: function(node, clz) {
            if (!node || !node.getAttribute) {
                return false;
            }
            var nodeClz = node.getAttribute('class') || "";
            return (' ' + nodeClz + ' ').indexOf(' ' + clz + ' ') >= 0;
        },
        getBrowserComputedStyle: function(target, styleName) {
            var style = window.getComputedStyle ?
                // w3c
                window.getComputedStyle(target, null) :
                // ie
                target.currentStyle;

            return styleName ? style[styleName] : style;
        }
    };
});

define( "jquery", [], function () { return jQuery; } );

define('sap/viz/framework/common/util/ResourceLoader',[
    'sap/viz/framework/common/util/DOM',
    'sap/viz/framework/common/util/ObjectUtils',
    'jquery'
], function(
    DOM,
    ObjectUtils,
    $
    ) {
    var SCRIPT_TYPE = 1,
        STYLESHEET_TYPE = 2;

    // Load a script tag to current page
    function loadScript(url, type, onComplete) {
        var done = 0;
        var head = document.getElementsByTagName("head")[0] || document.documentElement;
        var script;
        if (type == SCRIPT_TYPE) {
            script = document.createElement("script");
            script.type = 'text/javascript';
            script.src = url;
        } else if (type == STYLESHEET_TYPE) {
            onComplete();
            return;
        }

        function complete(err) {
            //clear script
            script.onload = script.onreadystatechange = null;
            DOM.remove(script);
            onComplete(err);
        }

        script.onload = script.onreadystatechange = function() {
            if (!done && (!this.readyState || this.readyState === "loaded" || this.readyState === "complete")) {
                done = 1;
                complete();
            }
        };

        if (script.addEventListener) {
            script.addEventListener('error', complete, true);
        }

        if (head.firstChild) {
            head.insertBefore(script, head.firstChild);
        } else {
            head.appendChild(script);
        }
    }

    var loadingMap = {};
    var loadedUrls = {};

    // Load resource on single path
    function loadForPath(path, id, onComplete, args) {
        function loadForId(id) {
            var urlData = args.getUrl(path, id),
                isObjFlag = typeof urlData === 'object';
            var url = urlData, 
                hasCssFile = false, 
                originalPath = urlData;
            if (isObjFlag) {
                url = urlData.path;
                hasCssFile = urlData.hasCssFile;
                originalPath = urlData.originalPath;
            }
            
            var link, cssFlag = false;
            if (args.getCssFile && hasCssFile) {
                link = args.getCssFile(path, id).path;
                cssFlag = true;
            }
            if (loadedUrls[url]) {
                onComplete(originalPath, id);
            } else {
                loadScript(url, SCRIPT_TYPE, function(err) {
                    if (err) {
                        if (args.degrade) {
                            id = args.degrade(id);
                            if (id) {
                                loadForId(id);
                                return;
                            }
                        }
                        if (cssFlag) {
                            loadScript(link, STYLESHEET_TYPE, function(err2) { 
                                onComplete(originalPath, id, err2, true);
                            });  
                        } else {
                            onComplete(originalPath, id, err);
                        }   
                    } else {
                        loadedUrls[url] = 1;
                        //FIXME (by eddy.zeng) temporary change, since we're using require.js in jsonp, 
                        //delay call callback to make sure jsonp content evaluated before trying to get
                        //language content from setting map.
                        if (cssFlag) {
                            loadScript(link, STYLESHEET_TYPE, function(error) { 
                                setTimeout(function() {
                                    onComplete(originalPath, id, error, true);
                                }, 4);
                            });  
                        } else {
                            setTimeout(function() {
                                onComplete(originalPath, id);
                            }, 4);
                        }    
                    }
                });
            }
        }
        loadForId(id);
    }

    // Load resource on multiple paths
    // example:
    // loadResource({
    //      id: "en_US",
    //      paths: ["path/to/resoruce", "another/path/to/resource"],
    //      degrade: function(id){
    //          // An optional function to degrade to another id if the given id failed to load resource file.
    //          // return another id
    //      },
    //      onPathComplete: function(path, effectiveId, error){
    //          // Callback when one path is loaded
    //          // If degrade is called, effectiveId != id
    //      },
    //      onComplete: function(errors){
    //          // Callback when every path are loaded.
    //          // errors is an array containing error reports on failed paths.
    //          // Each item in errors is of the following format:
    //          // {
    //          //      path: '...'
    //          //      id: effectiveId,
    //          //      err: error object
    //          // }
    //      }
    // });
    function loadResource(args) {
        var id = args.id;
        var paths = args.paths || [];
        var errors = [];
        var uuid = id + "_" + ObjectUtils.guid();

        // load counter for specific uuid
        loadingMap[uuid] = paths.length;

        function onLoadedForPath(path, effectiveId, err, cssFlag) {
            if (err) {
                errors.push({
                    path: path,
                    id: effectiveId,
                    err: err
                });
            } else if (cssFlag) {
                errors.push({
                    path: path,
                    id: effectiveId,
                    cssFlag: cssFlag
                });
            }
            if (args.onPathComplete) {
                args.onPathComplete(path, effectiveId, err);
            }
            if (--loadingMap[uuid] === 0 && args.onComplete) {
                args.onComplete(errors, id);
            }
        }

        if(paths.length){
            for (var i = 0; i < paths.length; ++i) {
                loadForPath(paths[i], id, onLoadedForPath, args);
            }
        }else if(args.onComplete){
            args.onComplete(errors, id);
        }
    }

    return {
        loadScript: loadScript,
        loadResource: loadResource
    };
});

define('sap/viz/framework/common/lang/LangManager',[
    'sap/viz/framework/common/util/FunctionUtils',
    'sap/viz/framework/common/util/ObjectUtils',
    'sap/viz/framework/common/lang/LangMessageUtil',
    'sap/viz/framework/common/util/ResourceLoader'
], function(FunctionUtils, ObjectUtils, LangMessageUtil, ResourceLoader) {

    var listeners = [];
    var languageSetting = {};

    var placeHolder = 'language';
    languageSetting[placeHolder] = {};

    var languageQueue;
    if (window.sap && sap.viz && sap.viz.extapi && sap.viz.extapi.env &&
        sap.viz.extapi.env.language && sap.viz.extapi.env.language._queue) {
        languageQueue = sap.viz.extapi.env.language._queue;
        delete sap.viz.extapi.env.language;
    }

    /**
     * substitute the localized string for resource bundle.
     * @private
     * @example
     *      substitute('The ID {0} is not a valid number', 'NOT_NUMBER')
     * @returns {String} replacedString
     */
    var substitute = function(str /*String*/ , rest /*Array*/ ) {
        if (str == null) {
            return '';
        }

        if (!rest) {
            rest = [];
        }
        var len = rest.length;
        for (var i = 0; i < len; i++) {
            str = str.replace(new RegExp("\\{" + i + "\\}", "g"), rest[i]);
        }
        return str;
    };

    var manager = {
        /** @lends sap.viz.lang.langManager */

        /**
         * The file paths of language folder.
         * @deprecated This function is working in CVOM 4.0, but will not be supported since CVOM 5.0 in the future,
           please consider to use new version of this API instead. You can use sap.viz.api.env.Resource.path instead.
         * @default ["../../../resources/langs/charts/", "../../../resources/langs/sdk"], by default it contains charts
           and sdk language resource.
         * if only contains sap.viz.skd, only reset loadPath for sdk.
         */
        loadPath: [
            "../../../resources/langs/charts/",
            "../../../resources/langs/sdk/"
        ],

        /**
         * File name template of the language resource. ${lang} can be used in the template to represent the language
           name.
         * @default "language_${lang}.js"
         */
        fileNameTemplate: 'language_${lang}.js',

        /**
         * Alias language name mapping. The mapper name will not be tried at all. The mapped name will be used instead.
         * @type Object?
         */
        alias: {
            "ar_AE": "ar",
            "ar_EG": "ar",
            "ar_SA": "ar",

            "bg_BG": "bg",

            "ca_ES": "ca",

            "cs_CZ": "cs",

            "da_DK": "da",

            "de_CH": "de",
            "de_AT": "de",
            "de_BE": "de",
            "de_LU": "de",
            "de_DE": "de",

            "el_CY": "el",
            "el_GR": "el",

            "en_AU": "en",
            "en_CA": "en",
            "en_GB": "en",
            "en_HK": "en",
            "en_ID": "en",
            "en_IE": "en",
            "en_IN": "en",
            "en_IS": "en",
            "en_MY": "en",
            "en_NZ": "en",
            "en_PH": "en",
            "en_SG": "en",
            "en_US": "en",
            "en_ZA": "en",

            "es_AR": "es",
            "es_BO": "es",
            "es_CL": "es",
            "es_CO": "es",
            "es_ES": "es",
            "es_MX": "es",
            "es_PE": "es",
            "es_UY": "es",
            "es_VE": "es",

            "et_EE": "et",

            "fa_IR": "fa",

            "fi_FI": "fi",

            "fr_BE": "fr",
            "fr_CA": "fr",
            "fr_CH": "fr",
            "fr_FR": "fr",
            "fr_LU": "fr",

            "he_IL": "iw",

            "hi_IN": "hi",

            "hr_HR": "hr",

            "hu_HU": "hu",

            "id_ID": "id",

            "it_CH": "it",
            "it_IT": "it",

            "ja_JP": "ja",

            "ko_KR": "ko",

            "lt_LT": "lt",

            "lv_LV": "lv",

            "nb_NO": "nb",

            "nl_BE": "nl",
            "nl_NL": "nl",

            "nn_NO": "nn",

            "pl_PL": "pl",

            "pt_BR": "pt",
            "pt_PT": "pt",

            "ro_RO": "ro",

            "ru_KZ": "ru",
            "ru_RU": "ru",
            "ru_UA": "ru",

            "sh_ME": "sr",
            "sh_RS": "sr",

            "sk_SK": "sk",

            "sl_SL": "sl",
            "sl_SI": "sl",

            "sv_SE": "sv",

            "th_TH": "th",

            "tr_CY": "tk",
            "tr_TR": "tk",

            "uk_UA": "uk",

            "vi_VI": "vi",
            "vi_VN": "vi",

            "zf_TW": "zh_TW",
            "zh_HK": "zh_CN"
        },

        /**
         * Special degrade rules. By default, "xx_yy" degrads to "xx", and "xx" degrads to the default language "en".
         */
        //degrade: {},

        /**
         * Default language
         * If a specific language does not exists, will degrade to this default language.
         * @default 'en'
         */
        defaultLanguage: 'en',

        /**
         * Current language
         */
        currentLanguage: 'en',

        /**
         * Return current applied language Id.
         * @deprecated This function is working in CVOM 4.0, but will not be supported since CVOM 5.0 in the future,
           please consider to use new version of this API instead.
         * @returns {String}
         */
        current: function() {
            return manager.currentLanguage;
        },

        /**
         * Register new language.
         * @deprecated This function is working in CVOM 4.0, but will not be supported since CVOM 5.0 in the future,
           please consider to use new version of this API instead. You ca nuse sap.viz.extapi.env.Language.
           register instead.
         * @param {Object...}
         *
         * @returns {Object} {@link sap.viz.lang.langManager}
         */
        register: function(obj) {
            languageSetting[obj.id] = ObjectUtils.extend(true, languageSetting[obj.id], obj.value);
            return manager;
        },

        /**
         * Apply(switch) language.
         * @deprecated This function is working in CVOM 4.0, but will not be supported since CVOM 5.0 in the future,
           please consider to use new version of this API instead. You ca nuse sap.viz.api.env.Language.set instead.
         * @param {String}
         *          id the language id
         * @param {Function}
         *          [callback] the call back function.
         *
         * @returns {Object} {@link sap.viz.lang.langManager}
         */
        apply: function(id, callback, failedCallback) {
            var aliasId = alias(id);
            var errMsgs = [];

            function onPathComplete(path, effectiveId, err) {
                var errMsg;

                if (!effectiveId) {
                    errMsg = 'Failed to load language ' + id + ' from path ' + path + '.';
                } else if (aliasId !== effectiveId) {
                    errMsg = 'Language ' + id + ' is degraded to ' + effectiveId + ' for path ' + path + '.';
                }

                if (errMsg) {
                    errMsgs.push(errMsg);
                    try {
                        FunctionUtils.error(errMsg);
                    } catch (e) {
                        // Not a fatal error.
                    }
                }
            }

            function onComplete() {
                takeinDefQueue();

                if (errMsgs.length && failedCallback) {
                    failedCallback(id, errMsgs.join('\n'));
                }

                // Honor user's input
                manager.currentLanguage = id;

                // Find the currently effective language resource and pass it to listeners
                id = aliasId;
                var language = languageSetting[id];
                while (!language) {
                    id = degrade(id);
                    language = id && languageSetting[id];
                }

                for (var i = 0; i < listeners.length; ++i) {
                    var listener = listeners[i];
                    listener.fn.apply(listener.scope, [language]);
                }

                // fail to load language will be handled by failedCallback,
                if (callback) {
                    callback();
                }
            }

            if (aliasId) {
                ResourceLoader.loadResource({
                    id: aliasId,
                    paths: manager.loadPath,
                    getUrl: getUrl,
                    degrade: degrade,
                    onPathComplete: onPathComplete,
                    onComplete: onComplete
                });
            } else {
                takeinDefQueue();
            }
            return manager;
        },

        /**
         * Get globalization value.
         * @deprecated This function is working in CVOM 4.0, but will not be supported since CVOM 5.0 in the future,
           please consider to use new version of this API instead. You ca nuse sap.viz.api.env.Language.get instead.
         * @param {String}
         *       id of labels
         *
         * @returns {String}  globalization value
         */
        get: function(ids, lang) {
            var id = alias(lang || manager.currentLanguage);
            var language = languageSetting[id];
            var result = language && language[ids];

            while (id && id !== placeHolder && typeof result !== 'string') {
                id = degrade(id);
                language = id && languageSetting[id];
                result = language && language[ids];
            }

            return result || '';
        },

        /**
         * Get log id and globalization log message.
         * @ignore
         *
         * @param {...Object}
         *       key of log message
         *       variables in the log message
         * @example
         *      // return Invalid feeding: the correct number  is 2.
         *      getLogMessage('IDS_ERROR_INVALID_FEEDING_NUMBER', 2);
         *
         * @returns {String}  log id and globalization log message.
         */
        getLogMessage: function(ids) {
            var num = LangMessageUtil.getNumberByIDS(ids);
            var message = manager.get(ids);

            // Substitute the resouce boundle
            // e.g: ('Invalid feeding: the correct number  is {0}.', '2')
            if (arguments.length > 1) {
                message = substitute(message, Array.prototype.slice.call(arguments, 1));
            }

            return (num ? '[' + num + '] - ' : '') + message;
        },

        /**
         * Get log globalization message value by ID.
         * @deprecated This function is working in CVOM 4.0, but will not be supported since CVOM 5.0 in the future,
           please consider to use new version of this API instead.
         * @param {Number}
         *       message code.
         *
         * @returns {String}  globalization log message value
         */
        getLogMessageByID: function(num) {
            var ids = LangMessageUtil.getIDSByNumber(num);
            if (!ids) {
                FunctionUtils.error('Not exist the log ID {0}.', num);
            }
            return manager.get(ids);
        },

        /**
         * Add language folder path before load language file if the language folder is not default.
         * @deprecated This function is working in CVOM 4.0, but will not be supported since CVOM 5.0 in the future,
           please consider to use new version of this API instead. You can use sap.viz.api.env.Resource.path instead.
         * @param {String}
         *       folder of language files.
         *
         * @returns {Arrary}  all folders of language files.
         */
        addLanguageFolder: function(folder) {
            manager.loadPath.push(folder);
            return manager.loadPath;
        },

        /**
         * Add a listener which will be executed when current language is changed.
         * @deprecated This function is working in CVOM 4.0, but will not be supported since CVOM 5.0 in the future,
           please consider to use new version of this API instead. You ca nuse sap.viz.extapi.env.Language.
           addListener instead.
         * @param {Object}
         *          listener
         * @param {Function}
         *          listener.fn the listener function
         * @param {Object}
         *          listener.scope the "this" object in the listener function
         *
         * @returns {Object} {@link sap.viz.lang.langManager}
         */
        addListener: function(listener) {
            listeners.push(listener);
            return manager;
        },

        /**
         * Remove the listener.
         * @deprecated This function is working in CVOM 4.0, but will not be supported since CVOM 5.0 in the future,
           please consider to use new version of this API instead. You ca nuse sap.viz.extapi.env.Language.
           removeListener instead.
         * @param {Object} listener
         *          the listener reference
         *
         * @returns {Object} {@link sap.viz.lang.langManager}
         */
        removeListener: function(listener) {
            var index = listeners.indexOf(listener);
            if (index >= 0) {
                listeners.splice(index, 1);
            }
            return manager;
        }
    };

    function normalizeLangName(id) {
        return String(id).replace(/-/g, '_');
    }

    function alias(id) {
        id = normalizeLangName(id);
        return (manager.alias && manager.alias[id]) || id;
    }

    function degrade(id) {
        var degradeMap = manager.degrade;
        if (degradeMap && degradeMap[id]) {
            return degradeMap[id];
        }

        var matched = String(id).match(/^([a-zA-Z]+)([_-][a-zA-Z]+)?$/);
        if (matched) {
            var mainLang = matched[1].toLowerCase();

            if (matched[2]) {
                return mainLang;
            } else if (mainLang !== placeHolder) {
                return placeHolder;
            }
        }
        return null;
    }

    function getUrl(path, id) {
        path = /\/$/.test(path) ? path : path + '/';
        var fileName = id === placeHolder ?
                placeHolder + '.js' :
                manager.fileNameTemplate.replace(/\$\{lang\}/gi, id);
        return path + fileName;
    }

    //take in register queue
    function takeinDefQueue() {
        if (languageQueue) {
            for (var i = 0; i < languageQueue.length; ++i) {
                manager.register(languageQueue[i]);
            }
            // For multiple require contexts to work.
            //sap.viz.extapi.manifest._queue.language.registerList = [];
        }
    }

    takeinDefQueue();
    return manager;
});

define('sap/viz/framework/common/util/oo',[], function() {
    var oo = {};

    oo.extend = function(subClz, superClz) {
        var subClzPrototype = subClz.prototype;

        // add the superclass prototype to the subclass definition
        subClz.superclass = superClz.prototype;

        // copy prototype
        var F = function() {};
        F.prototype = superClz.prototype;

        subClz.prototype = new F();
        for (var prop in subClzPrototype) {
            if (subClzPrototype.hasOwnProperty(prop)) {
                subClz.prototype[prop] = subClzPrototype[prop];
            }
        }
        subClz.prototype.constructor = subClz;
        if (superClz.prototype.constructor === Object.prototype.constructor) {
            superClz.prototype.constructor = superClz;
        }
        return subClz;
    };

    return oo;
});
define('sap/viz/framework/extension/BaseChart',[
        'sap/viz/framework/common/util/TypeUtils',
        'sap/viz/framework/property/PropertyManager'
    ],
    function (TypeUtils, PropertyManager) {
        /**
         * @private
         */
        var BaseChart = function () {
            this._builtInComponents = {};
            this._data = null;
            this._bindings = null;
            this._scales = null;
        };

        /**
         * @static
         */
        BaseChart.metadata = {
            id: "",
            // "csv" dataset will position columns by binding definition,
            //      and user can retrieve bindings value to know which columns belong to which binding
            // "raw" dataset could be any data structure passed when createViz(),
            //      in Lumira it will be FlatTableDataset
            dataType: "raw",
            /**
             * binding schema: {
                    "id": "categoryAxis",
                    "name": "IDS_CATEGORY_AXIS",
                    "type": "Dimension",
                    "min": 1,
                    "max": Number.POSITIVE_INFINITY,
                    // optional
                    "acceptMND": true,
                    // optional
                    "role": "layout.category"
                }
             */
            bindingDefinition: [],
            /**
             * {
                    "feed": "valueAxis",
                    "properties": {
                        "min": {
                            "name": "min",
                            "supportedValueType": "Number",
                            "defaultValue": "auto",
                            // optional
                            "description": ""
                        },
                        "max": {
                            "name": "max",
                            "supportedValueType": "Number",
                            "defaultValue": "auto",
                            // optional
                            "description": ""
                        }
                    }
                }
             */
            scales: [],
            css: null,
            /**
             * properties schema: {
                    "supportedValueType": "Object", // Number, String, Boolean, StringArray, NumberArray, BooleanArray
                    "defaultValue": null,
                    // optional, by default read-only is false
                    "readonly": false,
                    // optional, by default serializable is true
                    "serializable": true,
                    // optional
                    "description": "",
                }
             */
            properties: {},
            /**
             * Array of event type String
             */
            events: [],
            /**
             * build-in component schema: {
                    name : sap.viz.extapi.component.TITLE.NAME,
                    properties : {
                        "position": "top"
                    }
                }
             */
            builtInComponents: []
        };

        //-----------------------------
        // Methods to be Overridden
        // No super() support
        //-----------------------------

        /**
         * optional to override
         */
        BaseChart.prototype.init = function () {};

        /**
         * @param {Object} changes {
                                dataChanged : false,
                                bindingChanged : false,
                                scalesChanged : false,
                                propertiesChanged : false,  
                                sizeChanged : false
                           }
         */
        BaseChart.prototype.render = function (changes) {};

        /**
         * optional to override
         */
        BaseChart.prototype.destroy = function () {};

        /**
         * optional to override
         *
         * @return {Array} value Array of DataContext
         */
        BaseChart.prototype.getSelection = function () {
            return [];
        };

        /**
         * optional to override
         *
         * @param {Array} value Array of DataContext
         * @param {Object} [option] supported options: {"clearSelection": true}, {"selectionMode": "exclusive"}
         */
        BaseChart.prototype.setSelection = function (value, option) {};


        /**
         * optional to override
         *
         * @param {String} [propertyName]
         * @return {Array} boundary as the same stracture as VizInstance's propertyZone
         */
        BaseChart.prototype.propertyZone = function (propertyName) {

            return [];
        };


        /**
         * optional to override
         * update to set builtInComponents properties before they start rendering
         * builtInComponents properties can only be set inside updateBuiltInComponents method, 
         * otherwise error will be thrown
         * @param {Object} changes {
                                dataChanged : false,
                                bindingChanged : false,
                                scalesChanged : false,
                                propertiesChanged : false,  
                                sizeChanged : false
                           }
        */
        BaseChart.prototype.updateBuiltInComponents = function(changes) {

        };

        /**
         * optional to override
         *
         * @return {Array} boundary as the same stracture as VizInstance's feedingZone
         */
        BaseChart.prototype.feedingZone = function () {
            //var bindings = this.bindings();
            return [];
        };

        //-----------------------------
        // Public Utility Methods
        //-----------------------------

        /**
         * @return {HTMLDIVElement} the host DIV
         */
        BaseChart.prototype.container = function () {
            return this._container;
        };

        /**
         * @return {Object} the size for the extension
         */
        BaseChart.prototype.size = function () {
            return this._size;
        };
        /**
         * @return {Array} data bindings
         */
        BaseChart.prototype.bindings = function (data) {
            if (data) {
                this._bindings = data;
            } else {
                return this._bindings;
            }
        };

        /**
         * @return {Object}
         *         if BaseChart.metadata.dataType is "raw", return raw dataset.
         *         if BaseChart.metadata.dataType is "csv", return whole CSV 2DArray, or CSV 2DArray by bindingId
         */
        BaseChart.prototype.data = function (data) {
            if (data) {
                this._data = data;
            } else {
                return this._data;
            }
        };

        /**
         * @return {Array} scale settings
         */
        BaseChart.prototype.scales = function (data) {
            if (data) {
                this._scales = data;
            } else {
                return this._scales;
            }
        };

        /**
         * show built-in tooltip
         * VizInstance "showTooltip" event will be auto-dispatched
         *
         * @param {Object} position relative to container
         * @Example: this.showTooltip({
         *      container: this.container.node(),//parnet dom node for the tooltip
         *      position: {x:100, y:100},//(left, top)position for the tooltip
         *      data: dataContexArray // Array of selected data's data context.
         *
         *  })
         */

        BaseChart.prototype.showTooltip = function (position, context) {};

        /**
         * hide built-in tooltip
         * VizInstance "hideTooltip" event will be auto-dispatched
         *
         */
        BaseChart.prototype.hideTooltip = function () {};

        /**
         * @return {Object} properties
         */
        BaseChart.prototype.properties = function (key) {};

        /**
         * dispatch event to VizInstance
         *
         * @param {String} type
         * @param {Object} data
         */
        BaseChart.prototype.dispatchEvent = function (type, data) {};

        return BaseChart;
    });
define('sap/viz/framework/extension/ChartFactory',[
    'sap/viz/framework/common/util/oo',
    'sap/viz/framework/extension/BaseChart',
    'sap/viz/framework/common/lang/LangManager',
    'sap/viz/framework/common/util/FunctionUtils',
    'require'
], function (
    oo,
    BaseChart,
    LangManager,
    FunctionUtils,
    req
) {

    var ChartFactory = {};
    /* global requirejs: true */



    var nextTickBak;

    function requireJSHack() {
        nextTickBak = requirejs.s.contexts._.nextTick;
        requirejs.s.contexts._.nextTick = function (fn) {
            fn();
        };

    }

    function requireJSUnHack() {
        if (nextTickBak) {
            requirejs.s.contexts._.nextTick = nextTickBak;
        }
    }


    function createChartView(chartClazz) {


        requireJSHack();

        var ExtensionChartView = (req||require)("sap/viz/chart/views/ExtensionChartView");
        var newChartView = function () {
            newChartView.superclass.constructor.apply(this, arguments);
        };

        newChartView.prototype.getDefintion = function () {
            return chartClazz;
        };

        oo.extend(newChartView, ExtensionChartView);

        requireJSUnHack();

        return newChartView;



    }


    ChartFactory.createChart = function (chartClazz) {
        var chartView = null;
        try {
            if(chartClazz){
                chartView = createChartView(chartClazz);
            }
        } catch (e) {
            FunctionUtils.error(LangManager.getLogMessage('IDS_WRONG_EXTENSIONVERSION'));
            chartView = null;
        }

        return chartView;

    };

    return ChartFactory;



});
define('sap/viz/framework/extension/Constants',[], function () {

    var EXTENSIONCONSTS = {
        ModuleName: {
            'legend': 'sap.viz.component.ColorLegend',
            'title': 'sap.viz.component.Title',
            'legendGroup': 'sap.viz.component.ColorLegend'
        }
    };

    EXTENSIONCONSTS.ModuleMapping = {
        'sap.viz.component.ColorLegend': {
            id: 'legendGroup',
            extendId: 'extendLegend'
        },
        'sap.viz.component.Title': {
            id: 'title',
            extendId: 'extendTitle'
        }
    };
    EXTENSIONCONSTS.SDK_NAME = 'sap.viz.common.core';
    EXTENSIONCONSTS.BUNDLEID = '*sap.viz.impls.ext';
    EXTENSIONCONSTS.MINVERSION = 5;
    EXTENSIONCONSTS.CSVDATAMODEL = 'csv';
    EXTENSIONCONSTS.RAWDATAMODEL = 'raw';
    return EXTENSIONCONSTS;

});
define('sap/viz/framework/common/util/VersionComparator',[ "sap/viz/framework/common/util/TypeUtils" ], function Setup(TypeUtils) {
    var VERSION_SEP = ".";
    var VERSION_SEG_NUM = 3;
    
    var VersionComparator = {
        compare : function(version1, version2) {
            var v1 = !version1 ? [] : version1.split(VERSION_SEP).slice(0,VERSION_SEG_NUM);
            var v2 = !version2 ? [] : version2.split(VERSION_SEP).slice(0,VERSION_SEG_NUM);
            
            var i;
            for ( i = v1.length; i<VERSION_SEG_NUM; i++ ) {
                v1.push(0);
            }
            for ( i = v2.length; i<VERSION_SEG_NUM; i++ ) {
                v2.push(0);
            }
            
            for (i = 0; i < VERSION_SEG_NUM; i++) {
                if (v1[i] === v2[i]) {
                    continue;
                }
                if (TypeUtils.isNaN(v1[i])) {
                    return 1;
                }
                if (TypeUtils.isNaN(v2[i])) {
                    return -1;
                }
                
                var ret = parseInt(v1[i]) - parseInt(v2[i]);
                if (ret !== 0) {
                    return ret;
                }
            }
            
            return 0;
        }
    };
    return VersionComparator;
});

define('sap/viz/framework/extension/ExtensionUtils',[
    'sap/viz/framework/core/ChartPropertyRegistry',
    'sap/viz/framework/extension/ChartFactory',
    'sap/viz/framework/extension/Constants',
    'sap/viz/framework/common/util/TypeUtils',
    'sap/viz/framework/common/lang/LangManager',
    'sap/viz/framework/common/util/FunctionUtils',
    'sap/viz/framework/common/util/oo',
    'sap/viz/framework/common/util/ObjectUtils',
    "sap/viz/framework/common/util/VersionComparator",
    "sap/viz/framework/common/log/Logger",
], function (
    ChartPropertyRegistry,
    ChartFactory,
    Constants,
    TypeUtils,
    LangManager,
    FunctionUtils,
    oo,
    ObjectUtils,
    VersionComparator,
    Logger
) {


    var ExtensionUtil = {};


    function buildProperties(metadata) {
        var properties = metadata.properties;
        var meta = {};
        var type = metadata.id;
        if (metadata.builtInComponents && TypeUtils.isArray(metadata.builtInComponents)) {
            for (var i = 0, len = metadata.builtInComponents.length; i < len; i++) {
                var id = metadata.builtInComponents[i].name;
                meta[Constants.ModuleMapping[id].extendId] = true;
                if(Constants.ModuleName['legend'] === id){
                    meta['extendInteraction'] = true;
                }
            }
        }
        //For events register.
        //Supoort tooltip by default.
        meta['extendTooltip'] = true;
        meta['extendInteraction'] = true;
   
        
        return [
            metadata.id,
            metadata.properties,
            meta
        ];


    }



    function getMetaData(type) {
        var extensionMetaData = sap.bi.framework.getServiceMetadata(Constants.BUNDLEID);
        return extensionMetaData.filter(function(d) {
            return d.id === type;
        });
    }

    function getRequireSDKVersion(servicesMetaData) {
        if (servicesMetaData.customProperties && servicesMetaData.customProperties.requires) {
            var requires = servicesMetaData.customProperties.requires;
            for (var j = 0, requiresLen = requires.length; j < requiresLen; j++) {
                if (requires[j].id === "sap.viz.common.core") {
                    return requires[j].version;
                }
            }
        }
        return undefined;
    }

    ExtensionUtil.checkVersion = function(servicesMetaData) {
        var result = ExtensionUtil.checkVersionTo(servicesMetaData, sap.viz.api.VERSION);
        if(!result) {
            Logger.warn(LangManager.getLogMessage('IDS_ERROR_SDK_VERSION_DOES_NOT_MATCH', 
                servicesMetaData.id,
                getRequireSDKVersion(servicesMetaData),
                sap.viz.api.VERSION));
        }
        return result;
    };

    ExtensionUtil.checkVersionTo = function(servicesMetaData, targetVersion) {
        var version = getRequireSDKVersion(servicesMetaData);
        if(version && (VersionComparator.compare(version, targetVersion) > 0)) {
            return false;
        }
        return true;
    };
    
    ExtensionUtil.parseSDKVersion = function (type) {
        var extensionMetaData = getMetaData(type);
        if(extensionMetaData.length>0){
            var extensionProperties = extensionMetaData[0].customProperties;
            if(extensionProperties && extensionProperties.requires && extensionProperties.requires.length){
                var sdk = extensionProperties.requires;
                var version = sdk.filter(function(d){
                    return d.id === Constants.SDK_NAME;
                });
                return version[0]&& version[0].version;
            }
        }
        return null;
    };

    ExtensionUtil.isExtension = function (type) {
        var extensionMetaData = getMetaData(type);
        return extensionMetaData.length>0;
    };


    ExtensionUtil.create = function (chartClass, metadata) {
        if (!(chartClass && chartClass.metadata)) {
            FunctionUtils.error(LangManager.getLogMessage('IDS_WRONG_MISSINGEXTENSIONMETADATA'));
        }
        chartClass.metadata.bindingDefinition = chartClass.metadata.bindingDefinition||[];

        if (ExtensionUtil.checkVersion(metadata)) {
            var chartView = ChartFactory.createChart(chartClass);

            if (chartClass.metadata ) {
                var porperties = chartClass.metadata.properties || {};
                ChartPropertyRegistry.register.apply(this, buildProperties(chartClass.metadata));
            } else {

            }

            return chartView;

        } else {
            FunctionUtils.error(LangManager.getLogMessage('IDS_WRONG_EXTENSIONVERSION'));
        }

    };

    ExtensionUtil.extend = function (baseClass) {
        var extension = function () {
            extension.superclass.constructor.apply(this, arguments);
        };
        oo.extend(extension, baseClass);
        extension.metadata = ObjectUtils.extend(true, {}, baseClass.metadata);
        return extension;
    };
    
    ExtensionUtil.getBundleVersion = function(type) {
        function getBundleVersionAt(service, type) {
            var servicesMetaData = sap.bi.framework.getServiceMetadata(service).filter(function(d) {
                return d.id === type;
            });
            if (servicesMetaData.length > 0) {
                if (servicesMetaData[0].framework && servicesMetaData[0].framework.bundleVersion) {
                    return servicesMetaData[0].framework.bundleVersion;
                }
            }
            return null;
        }
        
        var ret = getBundleVersionAt('*sap.viz.impls', type);
        
        if (!ret) {
            ret = getBundleVersionAt('*sap.viz.impls.ext', type);
        } 
        return ret;
    };

    return ExtensionUtil;



});
define('sap/viz/framework/common/util/Constants',[], function Setup() {
    var moduleConstants = {
        CSS : {
            CLASS : {
                AXIS : {
                    CONTAINER : "v-axis",
                    TITLE : "v-title",
                    SCROLLBAR : "v-scrollbar",
                    TITLE_BACKWORD : "viz-axis-title",
                    TITLE_HIDDEN : "v-hidden-title",
                    LINE_GROUP : "v-line-group",
                    TICK_GROUP : "v-tick-group",
                    LABEL_GROUP : "v-label-group",
                    LINE : "v-line",
                    TICK : "v-tick",
                    LONGTICK : "v-longtick",
                    LABEL : "v-label",
                    LABEL_SELECTION : "v-axis-item",
                    LABEL_BACKWORD : "viz-axis-label",
                    MORPHABLE_LABEL : "v-morphable-label",
                    PERIMETER : "v-valueaxisline",
                    FIXED_PERIMETER : "v-fixed-valueaxisline",
                    BACKGROUND_RECT : "viz-axis-label-rect"
                },
                MODULEPREFIX : "v-m-",
                DATAPOINT_GROUP:"v-datapoint-group",
                DATAPOINT : "v-datapoint",
                DATAPOINT_MARKER : "v-datapoint-marker",
                DATAPOINTDEFAULT : "v-datapoint-default",
                DATAPOINTHOVER : "v-datapoint-hover",
                DATAPOINTSELECTED : "v-datapoint-selected",
                STACK : "v-stack",
                AREA : "v-area",
                AREA_SELECTED : "v-selected-area",
                AREA_GROUP_SELECTED : "v-selected-area-group",
                AREADEFAULT : "v-area-default",
                AREAHOVER : "v-area-hover",
                AREASELECTED : "v-area-selected",
                AREA_PATH :"v-area-path",
                AREA_LINE_PATH : "v-area-line-path",
                AREA_DETECTION_PATH : "v-area-detection-path",
                MORPHABLEDATAPOINT : "v-morphable-datapoint",
                MORPHABLELABEL : "v-morphable-label",
                MORPHABLEBACKGROUND : "v-morphable-background",
                MORPHABLELINE : "v-morphable-line",
                MORPHABLEAREABG : "v-morphable-areabg",
                DATALABEL_GROUP:"v-datalabel-group",
                DATALABEL_GROUP_TOTAL:"v-datalabel-group-total",
                DATALABEL:"v-datalabel",
                GRIDLINE_GROUP : "v-gridline-group",
                GRIDLINE : "v-gridline",
                GRIDLINE_INCISED : "v-incised-gridline",
                HOVER_SHADOW : "v-hovershadow",
                FOCUS_SHADOW : "v-hovershadow-mousedown",
                CLIPPATH : 'v-clippath',
                LEGENDITEM : 'v-legend-item',
                RADAR_NET : "v-radar-net",
                RADAR_BRANCH_AXIS : "v-radar-branch-axis",
                RADAR_BRANCH_AXIS_GROUP : "v-radar-branch-axis-group",
                RADAR_BRANCH_LABEL : "v-radar-branch-label",
                RADAR_BRANCH_LABEL_GROUP : "v-radar-branch-label-group",
                RADAR_BRANCH_GROUP : "v-radar-branch-group",
                WATERFALL_LINKLINE : "v-wtf-linkline",
                BAR_SERIES_PATH: "v-bar-series-path"
            }
        },
        LAYOUT_ADJUST_POLICY : {
            APPROXIMATE : 'APPROXIMATE',
            RELAYOUT : 'RELAYOUT'
        },
        Event : {
            SelectData : {
                name : 'selectData',
                desc : 'Event fires when certain data point(s) is(are) selected, data context of selected item(s) would be passed in accordance with the following format.' + '<code>{name: "selectData",' + 'data:[{\n//selected element\'s detail\n' + 'target:"Dom Element",//an object pointed to corresponding dom element\n' + 'data:[{val: "...",//value of this element\n' + 'ctx:{type:"Dimension"||"Measure"||"MND",\n' + '//for Dimension\n' + 'path:{aa:"...",di:"...",dii:"..."},\n' + '//for Measure\n' + 'path:{mg:"...",mi:"...",dii_a1:"...",dii_a2:"..."},\n' + '//for MND\n' + 'path:{mg:"...",mi:"..."}\n' + '//path: analysis path\n' + '//aa: analysis axis index // 0 for analysis axis 1,  1 for analysis 2\n' + '//di: dimension index //zero based\n' + '//dii: dimension item index //zero based\n' + '//mg: measure group index // 0 for measure group 1,1 for measure group 2\n' + '//mi: measure index // measure index in measure group zero based\n' + '//dii_a1: each dii of di in analysis axis 1 index\n' + '//dii_a2: each dii of di in analysis axis 2 index\n' + '}},{\n//for bubble, tagcloud and scatter, there will be more than one values in one selected element.\n' + 'var:"...",ctx:"..."}]},{\n//if under multi selection, there will be more than one selected elements\n' + 'target:"...",data:["..."]}]}' //jshint ignore:line
            },
            DeSelectData : {
                name : 'deselectData',
                desc : 'Event fires when certain data point(s) is(are) deselected, data context of deselected item(s) would be passed in accordance with the following format.' + '<code>{name: "deselectData",' + 'data:["---the same as selectedData---"]}' //jshint ignore:line
            },
            TooltipShow : {
                name : 'showTooltip',
                desc : 'This event is deprecated, please use showDetail decoration (refer to properties: interaction.decorations) instead. Event fires when the mouse hover onto the specific part of chart, data context of tooltip would be passed in accordance with the following format.' + '<code>{name:"showTooltip",data:{body:[{\n//All measures\n' + 'name:"...",val:[{//measure value is an array containing only one item\n' + 'value:"..."}]},"..."],footer:[{label:"...",value:"..."},"..."],' + 'plotArea:{\n//this object specifies the plot area of the chart\n' + 'height:"...",width:"...",x:"...",y:"..."},point:{\n//this object specifies a point which affects the position of tooltip\n' + 'x:"...",y:"..."},selectedValues:...//this number specify how many values are selected}}'//jshint ignore:line
            },
            TooltipHide : {
                name : 'hideTooltip',
                desc : 'This event is deprecated, please use hideDetail decoration (refer to properties: interaction.decorations) instead. Event fires when the mouse hover out of the specific part of chart, no data is passed.' //jshint ignore:line
            },
            Initialized : {
                name : 'initialized',
                desc : 'Event fires when the loading ends. To use the event listener when creating charts, you must use an event that is passed by the events option. For more information on events options, see the usrOptions section of the <a href="sap.viz.core.html#createViz" target="_blank">createViz</a> function in the API document.' //jshint ignore:line
            },
            highlightedByLegend : {
                desc : "Event fires when legend item is clicked, which contains its data context."
            },
            ContextualData : {
                name : 'contextualData',
                desc : 'Event fires when mouse right click, the event format is: <code>{name: "contextualData",\n' + 'type: "target type" //event target type,\n' + 'data:[{\n//selected element\'s detail\n' + 'target:"Dom Element",//an object pointed to corresponding dom element\n' + 'data:{key: "value",//key is usually a category name, value is the data\'s value in this category\n' + '...\n}]}' //jshint ignore:line
            }
        },
        COLOR : {
            SAPColorSingleAxis : ["#748CB2", "#9CC677", "#EACF5E", "#F9AD79", "#D16A7C", "#8873A2", "#3A95B3",
                                  "#B6D949", "#FDD36C", "#F47958", "#A65084", "#0063B1", "#0DA841", "#FCB71D",
                                  "#F05620", "#B22D6E", "#3C368E", "#8FB2CF", "#95D4AB", "#EAE98F", "#F9BE92",
                                  "#EC9A99", "#BC98BD", "#1EB7B2", "#73C03C", "#F48323", "#EB271B", "#D9B5CA",
                                  "#AED1DA", "#DFECB2", "#FCDAB0", "#F5BCB4"],
            SAPColorDualAxis1 : ["#8FBADD", "#B8D4E9", "#7AAED6", "#A3C7E3", "#3D88C4", "#66A1D0",
                                 "#297CBE", "#5295CA", "#005BA3", "#146FB7", "#005395", "#0063B1"],
            SAPColorDualAxis2 : ["#F6A09B", "#F9C3C0", "#F58E88", "#F8B1AD", "#F05B52", "#F37D76",
                                 "#EE4A40", "#F16C64", "#D92419", "#ED382D", "#C52117", "#EB271B"],
            SAPColorBulletReference : ["#CCCCCC", "#ACA8A8", "#838282"]
        },
        SHAPE : ['circle', 'square', 'diamond', 'triangleUp', 'triangleDown',
                 'triangleLeft', 'triangleRight', 'cross', 'intersection'],
        DocExample : {
            SnippetUrl : '/vizdocs_snippet/#',
            TryThisValue : 'Try this.'
        },
        DIRECTION : {
            VERTICAL : "vertical",
            HORIZONTAL : "horizontal"
        },
        POSITION : {
            TOP : "top",
            BOTTOM : "bottom",
            LEFT : "left",
            RIGHT : "right"
        },
        SPACING_TYPE : {
            STEP : "step",
            RANGE : "range"
        },
        GRIDLINE_TYPE : {
            SOLID : "line",
            DASHED : "dotted",
            INCISED : "incised"
        },
        UNITFORMATTYPE : {
            METRICUNITS : 'MetricUnits',
            FINANCIALUNITS : 'FinancialUnits'
        },
        FORMAT : {
            PERCENTAGE_FORMAT : '0.0%'
        },
        PADDING: {
            DEFAULT: 24
        },
        BUBBLE: {
            DEFAULT_WIDTH_RATIO: 1 / 8
        },
        AXIS: {
            HIDDEN_TITLE: {
                COLOR: "#a6a6a6"
            },
            SPACING_TO_ROUGH: 0.05,
            SPACING_TO_ROOT: 0.02,
            SPACING_MAX_IN_PX: 16,
            FIX_TITLE_OFFSET: 8,
            FIX_LAYOUT_TYPE: 'FIX'
        },
        TITLE:{
            SPACING_WITH_MAIN_TO_ROUGH: 0.08,
            SPACING_MAX_IN_PX: 40
        },
        LEGEND_GROUP:{
            KEY: "legendGroup",
            SPACING_WITH_MAIN_TO_ROUGH: 0.04,
            SPACING_MAX_IN_PX: 40,
            AUTO_THRESHOLD: 415
        },
        DATALABEL:{
            HORIZONTAL_OVERLAPPING_PADDING: 0.14,
            HORIZONTAL_TOTAL_LABEL_PADDING: 6,
            VERTICAL_TOTAL_LABEL_PADDING: 3
        },
        LEGEND:{
            HORIZONTAL_OFFSET: 5,
            SEMANTIC_ITEMS_INTERVAL: 0.7
        },
        TREE_MAP : {
            DEFAULT_TICKS : 5,
            NULL_COLOR : "#e0e0e0",
            START_COLOR : "#C2E3A9",
            END_COLOR : "#73C03C",
            PALETTE : [],
            LEGEND_VALUES : [],
            LEFT_PADDING : 7,
            TOP_PADDING : 6
        },
        NULL_VALUE : "Null_Value",
        MEKKO_CHART : {
            MEKKO_VALUE_AXIS2_CLASS : "v-value-axis2-mekko-body"
        },
        LABEL_POSITION: {
            LEFT: "left",
            RIGHT: "right",
            MIDDLE: "middle"
        },
        DATAPOINT_INVALIDITY: {
            IGNORE: 'ignore',
            CONNECT: 'connect',
            BREAK: 'break'
        },
        DATAPOINT_INVALIDITY_SUPPORTED: ['break', 'ignore', 'connect'],
        EXTENSION:{
            FAMILYNAME : 'extensionChart'
        },
        DATA_TYPE:{
            DATE: 'date'
        },
        PROPERTY_FLAGS: {
            CORE: 1,
            CUSTOM: 1 << 1
        },
        PROPERTY: {
            USER_LEVEL: "user"
        }
    };

    return moduleConstants;
});

define('sap/viz/framework/core/ChartViewRegistry',[
    'sap/viz/framework/common/util/FunctionUtils',
    'require',
    'sap/viz/framework/common/lang/LangManager',
    'sap/viz/framework/extension/ExtensionUtils',
    'sap/viz/framework/extension/Constants',
    "sap/viz/framework/common/util/Constants",
    'exports'
], function (
    FunctionUtils,
    require,
    LangManager,
    ExtensionUtils,
    ExtensionConstants,
    Constants
) {
    

    var viewCache = {};
    var bindCache = {};
    var externalCSSCache = {};
    var renderTypeCache = {};
    var loaded = false;
    var usingV3Registry = false;

    function filterBinding(bindDef, chartType) {
        if (!bindDef) {
            return bindDef;
        }
        var tmpBindings = bindDef.slice();
        if (/trellis/i.test(chartType)) {
            //Trellis charts do not need dataFrame
            tmpBindings = tmpBindings.filter(function (item) {
                return item.id !== "dataFrame";
            });
        } else {
            //Non-trellis charts do not need trellisRow and trellisColumn
            tmpBindings = tmpBindings.filter(function (item) {
                return !/trellis/.test(item.id);
            });
        }
        if (/scatter/i.test(chartType)) {
            //Scatter does not need bubbleWidth
            tmpBindings = tmpBindings.filter(function (item) {
                return !/bubble/.test(item.id);
            });
        }
        return tmpBindings;
    }

    function safeRegister(service, serviceMeta, verySafe, extensionMetaData) {
        var needSwitch = false;
        // if it requires earlier version than 5.15.0, then we will switch to v2(viz) flow api
        if (ExtensionUtils.checkVersionTo(serviceMeta, "5.14.*") && window.__sap_v2) {
            needSwitch = true;
        }
        if (needSwitch) {
            sap.viz.extapi.Flow = window.__sap_v2.extapi.Flow;
            //register all manifests first, only called in info's registerAll
            if(verySafe) {
                window.__sap_v2.api.manifest.Viz.get();
            }
        }
        try {
            service.viz.forEach(function(item) {
                if (item && typeof item.init === 'function') {
                    item = item.init();
                }
                //item.metadata doesn't exist for viz extensions so they won't register as info extension.
                if (item && item.metadata && extensionMetaData) {
                    var chartView = ExtensionUtils.create(item, extensionMetaData);
                    if (chartView) {
                        ChartViewRegistry.registerWithChartView(item.metadata,
                            chartView);
                    }
                }
            });
        } catch (e) {
            throw e;
        } finally {
            if (needSwitch) {
                sap.viz.extapi.Flow = window.__sap_v3.extapi.Flow;
            }
        }
    }
    
    var ChartViewRegistry = {

        unregister: function (type) {
            delete viewCache[type];
            delete bindCache[type];
            delete renderTypeCache[type];
        },
        unregisterAll: function () {
            viewCache = {};
            bindCache = {};
            renderTypeCache = {};
        },
        registerAll: function (callback) {
            if (!(sap && sap.bi && sap.bi.framework && sap.bi.framework.getService)) {
                return null;
            }
            var services = sap.bi.framework.getService("*", "*sap.viz.impls");
            var servicesMetaData = sap.bi.framework.getServiceMetadata("*sap.viz.impls");

            var loadedCount = 0;
            var chartViewDefs = [];
            var bindDefs = [];

            // obtain all of binding definition
            for (var i = 0; i < services.length; i++) {
                var service = services[i];
                if (service.viz) {
                    safeRegister(service, servicesMetaData[i], true);
                    continue;
                }
                if (ExtensionUtils.checkVersion(servicesMetaData[i])) {
                    chartViewDefs[i] = service.view;
                    //if(service.bindings){
                    bindDefs[i] = service.bindings;
                    //}
                    renderTypeCache[servicesMetaData[i].id] = service.renderType;
                }
            }

            // calculate the count of module needing loaded.
            var needLoadCount = bindDefs.length + services.length;
            if (needLoadCount > 0) {
                loaded = true;
            }
            chartViewDefs.forEach(function (viewDef, index) {
                doRegister(viewDef, index, viewCache);
            });

            bindDefs.forEach(function (bindDef, index) {
                doRegister(bindDef, index, bindCache, true);
            });

            /* global requirejs: true */
            function doRegister(module, index, target, isBinding) {
                if (!module) {
                    return;
                }
                if (requirejs && requirejs.s && requirejs.s.contexts && requirejs.s.contexts._) {
                    var nextTickBak = requirejs.s.contexts._.nextTick;
                    requirejs.s.contexts._.nextTick = function (fn) {
                        fn();
                    };

                    if (usingV3Registry) {
                        module = module + '/v3';
                    }
                    require([module], function (view) {
                        loadedCount++;
                        if (isBinding) {
                            view = filterBinding(view, services[index].name);
                        }
                        target[servicesMetaData[index].id] = {
                            family: services[index].family,
                            constructor: view,
                            name: LangManager.get(services[index].name),
                            vender: services[index].vender
                        };
                        //  console.log(target[servicesMetaData[index].id]);

                        if (loadedCount === needLoadCount) {
                            if (callback) {
                                callback();
                            }
                        }
                    });

                    requirejs.s.contexts._.nextTick = nextTickBak;
                }
            }
        },

        usingV3Registry: function (isUsingV3) {
            usingV3Registry = isUsingV3;
        },

        registerAllWithV3: function (callback) {
            this.registerAll(callback);
        },
        registerWithChartView: function (metadata, chartView) {
            var ID = metadata.id;
            ChartViewRegistry.registerViewer(ID, chartView);
            if (metadata.css) {
                ChartViewRegistry.registerExternalCSS(ID, metadata.css);
            }
            ChartViewRegistry.registerRenderType(ID, "DIV");
            ChartViewRegistry.registerBind(ID, metadata.bindingDefinition, Constants.EXTENSION.FAMILYNAME,
                metadata.name || ID, metadata.vender, metadata.dataType);
        },
        registerByType: function (type) {

            if (!loaded) {
                this.loadAll();
            }

            if (!(sap && sap.bi && sap.bi.framework && sap.bi.framework.getService)) {
                return null;
            }
            var services = sap.bi.framework.getService("*", "*sap.viz.impls");
            var servicesMetaData = sap.bi.framework.getServiceMetadata("*sap.viz.impls");
            var extensionMetaData = sap.bi.framework.getServiceMetadata(ExtensionConstants.BUNDLEID);

            for (var len = servicesMetaData.length, i = len - 1; i > -1; i--) {
                if (servicesMetaData[i].id === type && ExtensionUtils.checkVersion(servicesMetaData[i])) {
                    break;
                }
            }
            if (i < 0) {
                services = sap.bi.framework.getService("*", ExtensionConstants.BUNDLEID);
                for (len = extensionMetaData.length, i = len - 1; i > -1; i--) {
                    if (extensionMetaData[i].id === type && ExtensionUtils.checkVersion(extensionMetaData[i])) {
                        break;
                    }
                }

            }
            if (i > -1) {
                var chart = services[i];
                if (chart.viz) { //backward for extension
                    safeRegister(chart, servicesMetaData[i], false, extensionMetaData[i]);
                } else { //For new extension API
                    if (typeof chart === 'function' && !chart.metadata) {
                        chart = chart.apply();
                    }
                    if (chart && chart.metadata) {
                        var chartView = ExtensionUtils.create(chart, extensionMetaData[i]);
                        if (chartView) {
                            ChartViewRegistry.registerWithChartView(chart.metadata, chartView);
                        }
                    }
                    //TODO: Support register infochart by type.
                    // var service = services[i];
                    // renderTypeCache[servicesMetaData[i].id] = service.renderType;
                    // doRegister(service.view, i, viewCache);
                    // doRegister(service.bindings, i, bindCache, true);
                }
                return true;

            }
            return false;
        },
        getBindingDefinition: function (type) {
            var definition = bindCache[type];
            if (definition == null && !ChartViewRegistry.registerByType(type)) {
                FunctionUtils
                    .error("can't find binding definition according to type[" + type + "]");
            }
            return bindCache[type];
        },
        getExternalCSS: function (type) {
            return externalCSSCache[type];
        },
        registerBind: function(id, binds, family, name, vender, dataModel) {
            bindCache[id] = {
                constructor: binds,
                family: family,
                name: name,
                vender: vender,
                dataModel: dataModel === ExtensionConstants.CSVDATAMODEL? undefined:dataModel
            };
        },
        registerViewer: function (id, viewer) {
            viewCache[id] = {
                constructor: viewer
            };
        },
        registerExternalCSS: function (id, css) {
            externalCSSCache[id] = css;
        },
        registerRenderType: function (id, innerId) {
            renderTypeCache[id] = innerId;
        },



        loadAll: function () {
            var i, tmp;
            if (requirejs && requirejs.s && requirejs.s.contexts) {
                var hasAIO = false;
                for (i in requirejs.s.contexts) {
                    if (i.indexOf("sap.viz.aio") > -1) {
                        hasAIO = true;
                        break;
                    }
                }
                if (!hasAIO) {
                    i = "_";
                }
                tmp = requirejs.s.contexts[i].nextTick;
                requirejs.s.contexts[i].nextTick = function (fn) {
                    fn();
                };
            }
            if (usingV3Registry) {
                this.registerAllWithV3();
            } else {
                this.registerAll();
            }
            if (requirejs && requirejs.s && requirejs.s.contexts && requirejs.s.contexts[i] && tmp) {
                requirejs.s.contexts[i].nextTick = tmp;
            }
        },


        //TODO: add scale & property get.
        /* global requirejs: true */
        getMetadata: function (type, withFamily) {

            if (!loaded) {

                this.loadAll();

            }

            if (!bindCache[type]) {
                if (!this.registerByType(type)) {
                    return null;
                }
            }

            if (bindCache[type]) {
                var retVal = {
                    "type": type,
                    "name": LangManager.get(bindCache[type].name) || bindCache[type].name,
                    "vender": bindCache[type].vender,
                    "bindings": filterBinding(bindCache[type].constructor, type),
                    "dataType": bindCache[type].dataModel,
                    "isBuiltIn": bindCache[type].family.indexOf('extension') < 0 ? true : false
                };
                if (withFamily) {
                    retVal.family = bindCache[type].family;
                }
                if (retVal.family === "extension") {
                    if (sap.bi.framework && sap.bi.framework.getServiceMetadata) {
                        var arr = sap.bi.framework.getServiceMetadata("*sap.viz.impls"),
                            j;
                        for (j = 0; j < arr.length; j++) {
                            if (arr[j].id === type) {
                                if (!(/^localize\!/.test(arr[j].customProperties.name))) {
                                    retVal.name = arr[j].customProperties.name;
                                }
                                break;
                            }
                        }
                    }
                }
                return retVal;
            } else {
                return null;
            }
        },

        getMetadataWithFamily: function (type) {
            return this.getMetadata(type, true);
        },

        getAllMetadata: function () {

            if (!loaded) {

                this.loadAll();

            }

            var metadata = [];
            for (var i in renderTypeCache) {
                if (renderTypeCache.hasOwnProperty(i)) {
                    var temp = this.getMetadata(i);
                    if (temp) {
                        metadata.push(this.getMetadata(i));
                    }
                }
            }
            return metadata;
        },

        getViewInstance: function (type, runtime) {

            var renderType = renderTypeCache[type];

            var chartViewClazzInfo = viewCache[type];
            if (chartViewClazzInfo == null || renderType == null) {
                FunctionUtils.error("can't find ChartView according to type[" + type + "]");
            }

            var ChartViewClazz = chartViewClazzInfo.constructor;

            return new ChartViewClazz(runtime, {
                chartType: type,
                renderType: renderType
            });
        }
        
    };

    return ChartViewRegistry;
});

define('sap/viz/chart/metadata/properties/PropertyLoader',[
    'propertyDefs',
    'sap/viz/framework/common/util/ObjectUtils',
    'sap/viz/framework/common/util/TypeUtils',
    'sap/viz/framework/core/ChartPropertyRegistry',
    "sap/viz/framework/property/PropertyManager",
    "sap/viz/framework/core/ChartViewRegistry",
    "sap/viz/framework/common/util/Constants"
], function(
    propertyDefs,
    ObjectUtils,
    TypeUtils,
    PropertyRegistry,
    PropertyManager,
    ChartViewRegistry,
    Constants
){

    var propDefsList = [];
    var propsByType = {};

    var blackRegs = ['Title', 'Legend', 'Tooltip', 'Interaction','plotArea'];
    var blackListForBackward = ['Title', 'Legend', 'Tooltip', 'Interaction'];

    function extend(propDefs, chartType, props, category, checker){
        if((!checker || checker(chartType)) && propDefs[category]){
            ObjectUtils.extend(true, props, formatPropertyValue(propDefs[category]));
        }
        return props;
    }

    function formatPropertyValue(propertyDef) {
        for(var name in propertyDef){
            if(PropertyManager.isValidValue(propertyDef[name])) {
                propertyDef[name] = {
                    defaultValue: propertyDef[name]
                };
            }
        }
        return propertyDef;
    }

    function mergeCustomProperties(props, customPropertyMeta, isExtension) {
        if(customPropertyMeta.isEmpty) {
            return props;
        }
        var blackList = blackListForBackward;

        if(isExtension){
            blackList = blackRegs;
        }

        if (blackList.length){
            props = ObjectUtils.extend(true, {}, props);
        }

        blackList.forEach(function(d){
            var flag = customPropertyMeta.metadata['extend'+d];
            if(flag){
                return;
            }
            var reg = new RegExp("^"+d,"i");
            for(var prop in props) {
                if(reg.test(prop)) {
                    delete props[prop];
                }
            }
        });

        return ObjectUtils.extend(false, props, customPropertyMeta.properties);
    }

    function getCoreProperties(type, force){
        var propDefs = getPropertyDefs(type);
        if(!propDefs[type]) {
            type = "info/DEFAULT";
        }
        var props = propsByType[type];
        if(!props || force){
            props = propsByType[type] = {};
            extend(propDefs, type, props, '');
            extend(propDefs, type, props, '_xy', function(type){
                return (/bar|column|line|combination/).test(type) && !(/dual/).test(type);
            });
            extend(propDefs, type, props, '_xySimple', function(type){
                return (/bar|column|line|combination/).test(type) && !(/trellis/).test(type);
            });
            extend(propDefs, type, props, '_dual', function(type){
                return (/dual/).test(type);
            });
            extend(propDefs, type, props, '_trellis', function(type){
                return (/trellis/).test(type);
            });
            extend(propDefs, type, props, '_scatter', function(type){
                return (/scatter|bubble/).test(type);
            });
            extend(propDefs, type, props, '_pie', function(type){
                return (/pie|donut/).test(type);
            });
            extend(propDefs, type, props, '_bullet', function(type){
                return (/bullet/).test(type);
            });
            extend(propDefs, type, props, '_mekko', function(type){
                return (/mekko/).test(type);
            });
            extend(propDefs, type, props, type);
        }
        return props;
    }

    function getProperties(type){
        var metadata = ChartViewRegistry.getMetadataWithFamily(type);
        var isExtension = metadata && metadata.family === Constants.EXTENSION.FAMILYNAME;
        var customPropertyMeta = PropertyRegistry.get(type);
        // If we have more than 1 propDefs, disable cache to allow newly added extension props
        var props = getCoreProperties(type, propDefsList.length > 1);
        return mergeCustomProperties(props, customPropertyMeta, isExtension);
    }

    // Add standalone property defs of new chart types.
    function addPropertyDefs(propDefs) {
        var i;
        for (i = 0; i < propDefsList.length; i++) {
            if (propDefsList[i].propDefs === propDefs) {
                return;
            }
        }

        var content = {
            propDefs: propDefs,
            chartTypes : []
        };

        for (i in propDefs) {
            if (propDefs.hasOwnProperty(i)) {
                if (i.indexOf("info/") >= 0 && i !== "info/DEFAULT") {
                    content.chartTypes.push(i);
                }
            }
        }

        propDefsList.push(content);
    }

    // Get property defs for one chart type.
    function getPropertyDefs(type) {
        var propDefs = propDefsList[0].propDefs;

        if (propDefsList.length > 1) {
            for (var i = 0; i < propDefsList.length; i++) {
                if (propDefsList[i].chartTypes.indexOf(type) >= 0) {
                    propDefs = propDefsList[i].propDefs;
                    break;
                }
            }
        }        
        return propDefs;
    }

    // Add info core chart property defs.
    if (TypeUtils.isArray(propertyDefs)) {
        propertyDefs.forEach(function(defs) {
            addPropertyDefs(defs);
        });
    } else {
        addPropertyDefs(propertyDefs);
    }

    return {
        getProperties: getProperties,
        addPropertyDefs: addPropertyDefs
    };
});

define('sap/viz/chart/metadata/properties/metadata',[
    'sap/viz/chart/metadata/properties/chartTypes',
    'sap/viz/chart/metadata/properties/PropertyLoader'
], function(chartTypes, PropertyLoader){

    function loadProperties(chartType, properties) {
        var chartProps;
        var props = PropertyLoader.getProperties(chartType);
        if (props) {
            chartProps = {};
            for (var name in props) {
                if (props.hasOwnProperty(name)) {
                    var prop = props[name];
                    if (!isPropObj(prop)) {
                        prop = {
                            defaultValue: prop
                        };
                    }
                    setObject(name, prop, chartProps);
                }
            }
        }
        return chartProps;
    }

    function getFullChartType(chartType){
        return 'info/' + chartType;
    }

    function setObject(name, value, root){
        var parts = name.split('.');
        var p = root;
        for(var i = 0; i < parts.length; ++i){
            var part = parts[i];
            if(i < parts.length - 1){
                p[part] = p[part] || {
                    children: {}
                };
                p = p[part].children;
            }else{
                p[part] = value;
            }
        }
    }

    function isPropObj(it){
        return Object.prototype.toString.call(it) === '[object Object]' &&
            (it.hasOwnProperty('defaultValue') || it.hasOwnProperty('readonly') ||
             it.hasOwnProperty('serializable'));
    }

    var propsByChartType = {};

    for(var i = 0; i < chartTypes.length; ++i){
        var chartType = getFullChartType(chartTypes[i]);
        propsByChartType[chartType] = loadProperties(chartType);
    }

    return {
        get: function(chartType){
            if(arguments.length){
                var ret = propsByChartType[chartType];
                // if cache is not hit, look into PropertyLoader again for dynamically registered properties
                if(!ret) {
                    return loadProperties(chartType);
                }
                return ret;
            }
            return propsByChartType;
        }
    };
});

define('scaleDefs',[], function(){
return {
    "column": [
        {
            "feed": "valueAxis",
            "properties": {
                "min": {
                    "defaultValue": "auto"
                },
                "max": {
                    "defaultValue": "auto"
                },
                "type": {
                    "defaultValue": "linear"
                }
            }
        },
        {
            "feed": "color",
            "properties": {
                "palette": {
                    "defaultValue": [
                        "#748CB2",
                        "#9CC677",
                        "#EACF5E",
                        "#F9AD79",
                        "#D16A7C",
                        "#8873A2",
                        "#3A95B3",
                        "#B6D949",
                        "#FDD36C",
                        "#F47958",
                        "#A65084",
                        "#0063B1",
                        "#0DA841",
                        "#FCB71D",
                        "#F05620",
                        "#B22D6E",
                        "#3C368E",
                        "#8FB2CF",
                        "#95D4AB",
                        "#EAE98F",
                        "#F9BE92",
                        "#EC9A99",
                        "#BC98BD",
                        "#1EB7B2",
                        "#73C03C",
                        "#F48323",
                        "#EB271B",
                        "#D9B5CA",
                        "#AED1DA",
                        "#DFECB2",
                        "#FCDAB0",
                        "#F5BCB4"
                    ]
                }
            }
        },
        {
            "feed": "dataFrame",
            "properties": {
                "domain": {
                    "defaultValue": []
                }
            }
        }
    ],
    "donut": [
        {
            "feed": "color",
            "properties": {
                "palette": {
                    "defaultValue": [
                        "#748CB2",
                        "#9CC677",
                        "#EACF5E",
                        "#F9AD79",
                        "#D16A7C",
                        "#8873A2",
                        "#3A95B3",
                        "#B6D949",
                        "#FDD36C",
                        "#F47958",
                        "#A65084",
                        "#0063B1",
                        "#0DA841",
                        "#FCB71D",
                        "#F05620",
                        "#B22D6E",
                        "#3C368E",
                        "#8FB2CF",
                        "#95D4AB",
                        "#EAE98F",
                        "#F9BE92",
                        "#EC9A99",
                        "#BC98BD",
                        "#1EB7B2",
                        "#73C03C",
                        "#F48323",
                        "#EB271B",
                        "#D9B5CA",
                        "#AED1DA",
                        "#DFECB2",
                        "#FCDAB0",
                        "#F5BCB4"
                    ]
                }
            }
        },
        {
            "feed": "dataFrame",
            "properties": {
                "domain": {
                    "defaultValue": []
                }
            }
        }
    ],
    "pie": [
        {
            "feed": "color",
            "properties": {
                "palette": {
                    "defaultValue": [
                        "#748CB2",
                        "#9CC677",
                        "#EACF5E",
                        "#F9AD79",
                        "#D16A7C",
                        "#8873A2",
                        "#3A95B3",
                        "#B6D949",
                        "#FDD36C",
                        "#F47958",
                        "#A65084",
                        "#0063B1",
                        "#0DA841",
                        "#FCB71D",
                        "#F05620",
                        "#B22D6E",
                        "#3C368E",
                        "#8FB2CF",
                        "#95D4AB",
                        "#EAE98F",
                        "#F9BE92",
                        "#EC9A99",
                        "#BC98BD",
                        "#1EB7B2",
                        "#73C03C",
                        "#F48323",
                        "#EB271B",
                        "#D9B5CA",
                        "#AED1DA",
                        "#DFECB2",
                        "#FCDAB0",
                        "#F5BCB4"
                    ]
                }
            }
        },
        {
            "feed": "dataFrame",
            "properties": {
                "domain": {
                    "defaultValue": []
                }
            }
        }
    ],
    "bar": [
        {
            "feed": "valueAxis",
            "properties": {
                "min": {
                    "defaultValue": "auto"
                },
                "max": {
                    "defaultValue": "auto"
                },
                "type": {
                    "defaultValue": "linear"
                }
            }
        },
        {
            "feed": "color",
            "properties": {
                "palette": {
                    "defaultValue": [
                        "#748CB2",
                        "#9CC677",
                        "#EACF5E",
                        "#F9AD79",
                        "#D16A7C",
                        "#8873A2",
                        "#3A95B3",
                        "#B6D949",
                        "#FDD36C",
                        "#F47958",
                        "#A65084",
                        "#0063B1",
                        "#0DA841",
                        "#FCB71D",
                        "#F05620",
                        "#B22D6E",
                        "#3C368E",
                        "#8FB2CF",
                        "#95D4AB",
                        "#EAE98F",
                        "#F9BE92",
                        "#EC9A99",
                        "#BC98BD",
                        "#1EB7B2",
                        "#73C03C",
                        "#F48323",
                        "#EB271B",
                        "#D9B5CA",
                        "#AED1DA",
                        "#DFECB2",
                        "#FCDAB0",
                        "#F5BCB4"
                    ]
                }
            }
        },
        {
            "feed": "dataFrame",
            "properties": {
                "domain": {
                    "defaultValue": []
                }
            }
        }
    ],
    "line": [
        {
            "feed": "valueAxis",
            "properties": {
                "min": {
                    "defaultValue": "auto"
                },
                "max": {
                    "defaultValue": "auto"
                },
                "type": {
                    "defaultValue": "linear"
                }
            }
        },
        {
            "feed": "color",
            "properties": {
                "palette": {
                    "defaultValue": [
                        "#748CB2",
                        "#9CC677",
                        "#EACF5E",
                        "#F9AD79",
                        "#D16A7C",
                        "#8873A2",
                        "#3A95B3",
                        "#B6D949",
                        "#FDD36C",
                        "#F47958",
                        "#A65084",
                        "#0063B1",
                        "#0DA841",
                        "#FCB71D",
                        "#F05620",
                        "#B22D6E",
                        "#3C368E",
                        "#8FB2CF",
                        "#95D4AB",
                        "#EAE98F",
                        "#F9BE92",
                        "#EC9A99",
                        "#BC98BD",
                        "#1EB7B2",
                        "#73C03C",
                        "#F48323",
                        "#EB271B",
                        "#D9B5CA",
                        "#AED1DA",
                        "#DFECB2",
                        "#FCDAB0",
                        "#F5BCB4"
                    ]
                }
            }
        },
        {
            "feed": "dataFrame",
            "properties": {
                "domain": {
                    "defaultValue": []
                }
            }
        }
    ],
    "area": [
        {
            "feed": "valueAxis",
            "properties": {
                "min": {
                    "defaultValue": "auto"
                },
                "max": {
                    "defaultValue": "auto"
                },
                "type": {
                    "defaultValue": "linear"
                }
            }
        },
        {
            "feed": "color",
            "properties": {
                "palette": {
                    "defaultValue": [
                        "#748CB2",
                        "#9CC677",
                        "#EACF5E",
                        "#F9AD79",
                        "#D16A7C",
                        "#8873A2",
                        "#3A95B3",
                        "#B6D949",
                        "#FDD36C",
                        "#F47958",
                        "#A65084",
                        "#0063B1",
                        "#0DA841",
                        "#FCB71D",
                        "#F05620",
                        "#B22D6E",
                        "#3C368E",
                        "#8FB2CF",
                        "#95D4AB",
                        "#EAE98F",
                        "#F9BE92",
                        "#EC9A99",
                        "#BC98BD",
                        "#1EB7B2",
                        "#73C03C",
                        "#F48323",
                        "#EB271B",
                        "#D9B5CA",
                        "#AED1DA",
                        "#DFECB2",
                        "#FCDAB0",
                        "#F5BCB4"
                    ]
                }
            }
        },
        {
            "feed": "dataFrame",
            "properties": {
                "domain": {
                    "defaultValue": []
                }
            }
        }
    ],
    "stacked_column": [
        {
            "feed": "valueAxis",
            "properties": {
                "min": {
                    "defaultValue": "auto"
                },
                "max": {
                    "defaultValue": "auto"
                },
                "type": {
                    "defaultValue": "linear"
                }
            }
        },
        {
            "feed": "color",
            "properties": {
                "palette": {
                    "defaultValue": [
                        "#748CB2",
                        "#9CC677",
                        "#EACF5E",
                        "#F9AD79",
                        "#D16A7C",
                        "#8873A2",
                        "#3A95B3",
                        "#B6D949",
                        "#FDD36C",
                        "#F47958",
                        "#A65084",
                        "#0063B1",
                        "#0DA841",
                        "#FCB71D",
                        "#F05620",
                        "#B22D6E",
                        "#3C368E",
                        "#8FB2CF",
                        "#95D4AB",
                        "#EAE98F",
                        "#F9BE92",
                        "#EC9A99",
                        "#BC98BD",
                        "#1EB7B2",
                        "#73C03C",
                        "#F48323",
                        "#EB271B",
                        "#D9B5CA",
                        "#AED1DA",
                        "#DFECB2",
                        "#FCDAB0",
                        "#F5BCB4"
                    ]
                }
            }
        },
        {
            "feed": "dataFrame",
            "properties": {
                "domain": {
                    "defaultValue": []
                }
            }
        }
    ],
    "stacked_bar": [
        {
            "feed": "valueAxis",
            "properties": {
                "min": {
                    "defaultValue": "auto"
                },
                "max": {
                    "defaultValue": "auto"
                },
                "type": {
                    "defaultValue": "linear"
                }
            }
        },
        {
            "feed": "color",
            "properties": {
                "palette": {
                    "defaultValue": [
                        "#748CB2",
                        "#9CC677",
                        "#EACF5E",
                        "#F9AD79",
                        "#D16A7C",
                        "#8873A2",
                        "#3A95B3",
                        "#B6D949",
                        "#FDD36C",
                        "#F47958",
                        "#A65084",
                        "#0063B1",
                        "#0DA841",
                        "#FCB71D",
                        "#F05620",
                        "#B22D6E",
                        "#3C368E",
                        "#8FB2CF",
                        "#95D4AB",
                        "#EAE98F",
                        "#F9BE92",
                        "#EC9A99",
                        "#BC98BD",
                        "#1EB7B2",
                        "#73C03C",
                        "#F48323",
                        "#EB271B",
                        "#D9B5CA",
                        "#AED1DA",
                        "#DFECB2",
                        "#FCDAB0",
                        "#F5BCB4"
                    ]
                }
            }
        },
        {
            "feed": "dataFrame",
            "properties": {
                "domain": {
                    "defaultValue": []
                }
            }
        }
    ],
    "100_stacked_bar": [
        {
            "feed": "color",
            "properties": {
                "palette": {
                    "defaultValue": [
                        "#748CB2",
                        "#9CC677",
                        "#EACF5E",
                        "#F9AD79",
                        "#D16A7C",
                        "#8873A2",
                        "#3A95B3",
                        "#B6D949",
                        "#FDD36C",
                        "#F47958",
                        "#A65084",
                        "#0063B1",
                        "#0DA841",
                        "#FCB71D",
                        "#F05620",
                        "#B22D6E",
                        "#3C368E",
                        "#8FB2CF",
                        "#95D4AB",
                        "#EAE98F",
                        "#F9BE92",
                        "#EC9A99",
                        "#BC98BD",
                        "#1EB7B2",
                        "#73C03C",
                        "#F48323",
                        "#EB271B",
                        "#D9B5CA",
                        "#AED1DA",
                        "#DFECB2",
                        "#FCDAB0",
                        "#F5BCB4"
                    ]
                }
            }
        },
        {
            "feed": "dataFrame",
            "properties": {
                "domain": {
                    "defaultValue": []
                }
            }
        }
    ],
    "100_stacked_column": [
        {
            "feed": "color",
            "properties": {
                "palette": {
                    "defaultValue": [
                        "#748CB2",
                        "#9CC677",
                        "#EACF5E",
                        "#F9AD79",
                        "#D16A7C",
                        "#8873A2",
                        "#3A95B3",
                        "#B6D949",
                        "#FDD36C",
                        "#F47958",
                        "#A65084",
                        "#0063B1",
                        "#0DA841",
                        "#FCB71D",
                        "#F05620",
                        "#B22D6E",
                        "#3C368E",
                        "#8FB2CF",
                        "#95D4AB",
                        "#EAE98F",
                        "#F9BE92",
                        "#EC9A99",
                        "#BC98BD",
                        "#1EB7B2",
                        "#73C03C",
                        "#F48323",
                        "#EB271B",
                        "#D9B5CA",
                        "#AED1DA",
                        "#DFECB2",
                        "#FCDAB0",
                        "#F5BCB4"
                    ]
                }
            }
        },
        {
            "feed": "dataFrame",
            "properties": {
                "domain": {
                    "defaultValue": []
                }
            }
        }
    ],
    "100_area": [
        {
            "feed": "color",
            "properties": {
                "palette": {
                    "defaultValue": [
                        "#748CB2",
                        "#9CC677",
                        "#EACF5E",
                        "#F9AD79",
                        "#D16A7C",
                        "#8873A2",
                        "#3A95B3",
                        "#B6D949",
                        "#FDD36C",
                        "#F47958",
                        "#A65084",
                        "#0063B1",
                        "#0DA841",
                        "#FCB71D",
                        "#F05620",
                        "#B22D6E",
                        "#3C368E",
                        "#8FB2CF",
                        "#95D4AB",
                        "#EAE98F",
                        "#F9BE92",
                        "#EC9A99",
                        "#BC98BD",
                        "#1EB7B2",
                        "#73C03C",
                        "#F48323",
                        "#EB271B",
                        "#D9B5CA",
                        "#AED1DA",
                        "#DFECB2",
                        "#FCDAB0",
                        "#F5BCB4"
                    ]
                }
            }
        },
        {
            "feed": "dataFrame",
            "properties": {
                "domain": {
                    "defaultValue": []
                }
            }
        }
    ],
    "100_horizontal_area": [
        {
            "feed": "color",
            "properties": {
                "palette": {
                    "defaultValue": [
                        "#748CB2",
                        "#9CC677",
                        "#EACF5E",
                        "#F9AD79",
                        "#D16A7C",
                        "#8873A2",
                        "#3A95B3",
                        "#B6D949",
                        "#FDD36C",
                        "#F47958",
                        "#A65084",
                        "#0063B1",
                        "#0DA841",
                        "#FCB71D",
                        "#F05620",
                        "#B22D6E",
                        "#3C368E",
                        "#8FB2CF",
                        "#95D4AB",
                        "#EAE98F",
                        "#F9BE92",
                        "#EC9A99",
                        "#BC98BD",
                        "#1EB7B2",
                        "#73C03C",
                        "#F48323",
                        "#EB271B",
                        "#D9B5CA",
                        "#AED1DA",
                        "#DFECB2",
                        "#FCDAB0",
                        "#F5BCB4"
                    ]
                }
            }
        },
        {
            "feed": "dataFrame",
            "properties": {
                "domain": {
                    "defaultValue": []
                }
            }
        }
    ],
    "mekko": [
        {
            "feed": "valueAxis",
            "properties": {
                "min": {
                    "defaultValue": "auto"
                },
                "max": {
                    "defaultValue": "auto"
                },
                "type": {
                    "defaultValue": "linear"
                }
            }
        },
        {
            "feed": "color",
            "properties": {
                "palette": {
                    "defaultValue": [
                        "#748CB2",
                        "#9CC677",
                        "#EACF5E",
                        "#F9AD79",
                        "#D16A7C",
                        "#8873A2",
                        "#3A95B3",
                        "#B6D949",
                        "#FDD36C",
                        "#F47958",
                        "#A65084",
                        "#0063B1",
                        "#0DA841",
                        "#FCB71D",
                        "#F05620",
                        "#B22D6E",
                        "#3C368E",
                        "#8FB2CF",
                        "#95D4AB",
                        "#EAE98F",
                        "#F9BE92",
                        "#EC9A99",
                        "#BC98BD",
                        "#1EB7B2",
                        "#73C03C",
                        "#F48323",
                        "#EB271B",
                        "#D9B5CA",
                        "#AED1DA",
                        "#DFECB2",
                        "#FCDAB0",
                        "#F5BCB4"
                    ]
                }
            }
        },
        {
            "feed": "dataFrame",
            "properties": {
                "domain": {
                    "defaultValue": []
                }
            }
        }
    ],
    "horizontal_mekko": [
        {
            "feed": "valueAxis",
            "properties": {
                "min": {
                    "defaultValue": "auto"
                },
                "max": {
                    "defaultValue": "auto"
                },
                "type": {
                    "defaultValue": "linear"
                }
            }
        },
        {
            "feed": "color",
            "properties": {
                "palette": {
                    "defaultValue": [
                        "#748CB2",
                        "#9CC677",
                        "#EACF5E",
                        "#F9AD79",
                        "#D16A7C",
                        "#8873A2",
                        "#3A95B3",
                        "#B6D949",
                        "#FDD36C",
                        "#F47958",
                        "#A65084",
                        "#0063B1",
                        "#0DA841",
                        "#FCB71D",
                        "#F05620",
                        "#B22D6E",
                        "#3C368E",
                        "#8FB2CF",
                        "#95D4AB",
                        "#EAE98F",
                        "#F9BE92",
                        "#EC9A99",
                        "#BC98BD",
                        "#1EB7B2",
                        "#73C03C",
                        "#F48323",
                        "#EB271B",
                        "#D9B5CA",
                        "#AED1DA",
                        "#DFECB2",
                        "#FCDAB0",
                        "#F5BCB4"
                    ]
                }
            }
        },
        {
            "feed": "dataFrame",
            "properties": {
                "domain": {
                    "defaultValue": []
                }
            }
        }
    ],
    "100_mekko": [
        {
            "feed": "valueAxis",
            "properties": {
                "min": {
                    "defaultValue": "auto"
                },
                "max": {
                    "defaultValue": "auto"
                },
                "type": {
                    "defaultValue": "linear"
                }
            }
        },
        {
            "feed": "color",
            "properties": {
                "palette": {
                    "defaultValue": [
                        "#748CB2",
                        "#9CC677",
                        "#EACF5E",
                        "#F9AD79",
                        "#D16A7C",
                        "#8873A2",
                        "#3A95B3",
                        "#B6D949",
                        "#FDD36C",
                        "#F47958",
                        "#A65084",
                        "#0063B1",
                        "#0DA841",
                        "#FCB71D",
                        "#F05620",
                        "#B22D6E",
                        "#3C368E",
                        "#8FB2CF",
                        "#95D4AB",
                        "#EAE98F",
                        "#F9BE92",
                        "#EC9A99",
                        "#BC98BD",
                        "#1EB7B2",
                        "#73C03C",
                        "#F48323",
                        "#EB271B",
                        "#D9B5CA",
                        "#AED1DA",
                        "#DFECB2",
                        "#FCDAB0",
                        "#F5BCB4"
                    ]
                }
            }
        },
        {
            "feed": "dataFrame",
            "properties": {
                "domain": {
                    "defaultValue": []
                }
            }
        }
    ],
    "100_horizontal_mekko": [
        {
            "feed": "valueAxis",
            "properties": {
                "min": {
                    "defaultValue": "auto"
                },
                "max": {
                    "defaultValue": "auto"
                },
                "type": {
                    "defaultValue": "linear"
                }
            }
        },
        {
            "feed": "color",
            "properties": {
                "palette": {
                    "defaultValue": [
                        "#748CB2",
                        "#9CC677",
                        "#EACF5E",
                        "#F9AD79",
                        "#D16A7C",
                        "#8873A2",
                        "#3A95B3",
                        "#B6D949",
                        "#FDD36C",
                        "#F47958",
                        "#A65084",
                        "#0063B1",
                        "#0DA841",
                        "#FCB71D",
                        "#F05620",
                        "#B22D6E",
                        "#3C368E",
                        "#8FB2CF",
                        "#95D4AB",
                        "#EAE98F",
                        "#F9BE92",
                        "#EC9A99",
                        "#BC98BD",
                        "#1EB7B2",
                        "#73C03C",
                        "#F48323",
                        "#EB271B",
                        "#D9B5CA",
                        "#AED1DA",
                        "#DFECB2",
                        "#FCDAB0",
                        "#F5BCB4"
                    ]
                }
            }
        },
        {
            "feed": "dataFrame",
            "properties": {
                "domain": {
                    "defaultValue": []
                }
            }
        }
    ],
    "combination": [
        {
            "feed": "valueAxis",
            "properties": {
                "min": {
                    "defaultValue": "auto"
                },
                "max": {
                    "defaultValue": "auto"
                },
                "type": {
                    "defaultValue": "linear"
                }
            }
        },
        {
            "feed": "color",
            "properties": {
                "palette": {
                    "defaultValue": [
                        "#748CB2",
                        "#9CC677",
                        "#EACF5E",
                        "#F9AD79",
                        "#D16A7C",
                        "#8873A2",
                        "#3A95B3",
                        "#B6D949",
                        "#FDD36C",
                        "#F47958",
                        "#A65084",
                        "#0063B1",
                        "#0DA841",
                        "#FCB71D",
                        "#F05620",
                        "#B22D6E",
                        "#3C368E",
                        "#8FB2CF",
                        "#95D4AB",
                        "#EAE98F",
                        "#F9BE92",
                        "#EC9A99",
                        "#BC98BD",
                        "#1EB7B2",
                        "#73C03C",
                        "#F48323",
                        "#EB271B",
                        "#D9B5CA",
                        "#AED1DA",
                        "#DFECB2",
                        "#FCDAB0",
                        "#F5BCB4"
                    ]
                }
            }
        },
        {
            "feed": "dataFrame",
            "properties": {
                "domain": {
                    "defaultValue": []
                }
            }
        }
    ],
    "stacked_combination": [
        {
            "feed": "valueAxis",
            "properties": {
                "min": {
                    "defaultValue": "auto"
                },
                "max": {
                    "defaultValue": "auto"
                },
                "type": {
                    "defaultValue": "linear"
                }
            }
        },
        {
            "feed": "color",
            "properties": {
                "palette": {
                    "defaultValue": [
                        "#748CB2",
                        "#9CC677",
                        "#EACF5E",
                        "#F9AD79",
                        "#D16A7C",
                        "#8873A2",
                        "#3A95B3",
                        "#B6D949",
                        "#FDD36C",
                        "#F47958",
                        "#A65084",
                        "#0063B1",
                        "#0DA841",
                        "#FCB71D",
                        "#F05620",
                        "#B22D6E",
                        "#3C368E",
                        "#8FB2CF",
                        "#95D4AB",
                        "#EAE98F",
                        "#F9BE92",
                        "#EC9A99",
                        "#BC98BD",
                        "#1EB7B2",
                        "#73C03C",
                        "#F48323",
                        "#EB271B",
                        "#D9B5CA",
                        "#AED1DA",
                        "#DFECB2",
                        "#FCDAB0",
                        "#F5BCB4"
                    ]
                }
            }
        },
        {
            "feed": "dataFrame",
            "properties": {
                "domain": {
                    "defaultValue": []
                }
            }
        }
    ],
    "horizontal_stacked_combination": [
        {
            "feed": "valueAxis",
            "properties": {
                "min": {
                    "defaultValue": "auto"
                },
                "max": {
                    "defaultValue": "auto"
                },
                "type": {
                    "defaultValue": "linear"
                }
            }
        },
        {
            "feed": "color",
            "properties": {
                "palette": {
                    "defaultValue": [
                        "#748CB2",
                        "#9CC677",
                        "#EACF5E",
                        "#F9AD79",
                        "#D16A7C",
                        "#8873A2",
                        "#3A95B3",
                        "#B6D949",
                        "#FDD36C",
                        "#F47958",
                        "#A65084",
                        "#0063B1",
                        "#0DA841",
                        "#FCB71D",
                        "#F05620",
                        "#B22D6E",
                        "#3C368E",
                        "#8FB2CF",
                        "#95D4AB",
                        "#EAE98F",
                        "#F9BE92",
                        "#EC9A99",
                        "#BC98BD",
                        "#1EB7B2",
                        "#73C03C",
                        "#F48323",
                        "#EB271B",
                        "#D9B5CA",
                        "#AED1DA",
                        "#DFECB2",
                        "#FCDAB0",
                        "#F5BCB4"
                    ]
                }
            }
        },
        {
            "feed": "dataFrame",
            "properties": {
                "domain": {
                    "defaultValue": []
                }
            }
        }
    ],
    "dual_bar": [
        {
            "feed": "valueAxis",
            "properties": {
                "min": {
                    "defaultValue": "auto"
                },
                "max": {
                    "defaultValue": "auto"
                },
                "type": {
                    "defaultValue": "linear"
                }
            }
        },
        {
            "feed": "valueAxis2",
            "properties": {
                "min": {
                    "defaultValue": "auto"
                },
                "max": {
                    "defaultValue": "auto"
                },
                "type": {
                    "defaultValue": "linear"
                }
            }
        },
        {
            "feed": "color",
            "properties": {
                "palette": {
                    "defaultValue": [
                        [
                            "#8FBADD",
                            "#B8D4E9",
                            "#7AAED6",
                            "#A3C7E3",
                            "#3D88C4",
                            "#66A1D0",
                            "#297CBE",
                            "#5295CA",
                            "#005BA3",
                            "#146FB7",
                            "#005395",
                            "#0063B1"
                        ],
                        [
                            "#F6A09B",
                            "#F9C3C0",
                            "#F58E88",
                            "#F8B1AD",
                            "#F05B52",
                            "#F37D76",
                            "#EE4A40",
                            "#F16C64",
                            "#D92419",
                            "#ED382D",
                            "#C52117",
                            "#EB271B"
                        ]
                    ]
                }
            }
        },
        {
            "feed": "dataFrame",
            "properties": {
                "domain": {
                    "defaultValue": []
                }
            }
        }
    ],
    "dual_column": [
        {
            "feed": "valueAxis",
            "properties": {
                "min": {
                    "defaultValue": "auto"
                },
                "max": {
                    "defaultValue": "auto"
                },
                "type": {
                    "defaultValue": "linear"
                }
            }
        },
        {
            "feed": "valueAxis2",
            "properties": {
                "min": {
                    "defaultValue": "auto"
                },
                "max": {
                    "defaultValue": "auto"
                },
                "type": {
                    "defaultValue": "linear"
                }
            }
        },
        {
            "feed": "color",
            "properties": {
                "palette": {
                    "defaultValue": [
                        [
                            "#8FBADD",
                            "#B8D4E9",
                            "#7AAED6",
                            "#A3C7E3",
                            "#3D88C4",
                            "#66A1D0",
                            "#297CBE",
                            "#5295CA",
                            "#005BA3",
                            "#146FB7",
                            "#005395",
                            "#0063B1"
                        ],
                        [
                            "#F6A09B",
                            "#F9C3C0",
                            "#F58E88",
                            "#F8B1AD",
                            "#F05B52",
                            "#F37D76",
                            "#EE4A40",
                            "#F16C64",
                            "#D92419",
                            "#ED382D",
                            "#C52117",
                            "#EB271B"
                        ]
                    ]
                }
            }
        },
        {
            "feed": "dataFrame",
            "properties": {
                "domain": {
                    "defaultValue": []
                }
            }
        }
    ],
    "dual_line": [
        {
            "feed": "valueAxis",
            "properties": {
                "min": {
                    "defaultValue": "auto"
                },
                "max": {
                    "defaultValue": "auto"
                },
                "type": {
                    "defaultValue": "linear"
                }
            }
        },
        {
            "feed": "valueAxis2",
            "properties": {
                "min": {
                    "defaultValue": "auto"
                },
                "max": {
                    "defaultValue": "auto"
                },
                "type": {
                    "defaultValue": "linear"
                }
            }
        },
        {
            "feed": "color",
            "properties": {
                "palette": {
                    "defaultValue": [
                        [
                            "#8FBADD",
                            "#B8D4E9",
                            "#7AAED6",
                            "#A3C7E3",
                            "#3D88C4",
                            "#66A1D0",
                            "#297CBE",
                            "#5295CA",
                            "#005BA3",
                            "#146FB7",
                            "#005395",
                            "#0063B1"
                        ],
                        [
                            "#F6A09B",
                            "#F9C3C0",
                            "#F58E88",
                            "#F8B1AD",
                            "#F05B52",
                            "#F37D76",
                            "#EE4A40",
                            "#F16C64",
                            "#D92419",
                            "#ED382D",
                            "#C52117",
                            "#EB271B"
                        ]
                    ]
                }
            }
        },
        {
            "feed": "dataFrame",
            "properties": {
                "domain": {
                    "defaultValue": []
                }
            }
        }
    ],
    "scatter": [
        {
            "feed": "valueAxis",
            "properties": {
                "type": {
                    "defaultValue": "linear"
                },
                "min": {
                    "defaultValue": "auto"
                },
                "max": {
                    "defaultValue": "auto"
                }
            }
        },
        {
            "feed": "valueAxis2",
            "properties": {
                "type": {
                    "defaultValue": "linear"
                },
                "min": {
                    "defaultValue": "auto"
                },
                "max": {
                    "defaultValue": "auto"
                }
            }
        },
        {
            "feed": "color",
            "properties": {
                "palette": {
                    "defaultValue": [
                        "#748CB2",
                        "#9CC677",
                        "#EACF5E",
                        "#F9AD79",
                        "#D16A7C",
                        "#8873A2",
                        "#3A95B3",
                        "#B6D949",
                        "#FDD36C",
                        "#F47958",
                        "#A65084",
                        "#0063B1",
                        "#0DA841",
                        "#FCB71D",
                        "#F05620",
                        "#B22D6E",
                        "#3C368E",
                        "#8FB2CF",
                        "#95D4AB",
                        "#EAE98F",
                        "#F9BE92",
                        "#EC9A99",
                        "#BC98BD",
                        "#1EB7B2",
                        "#73C03C",
                        "#F48323",
                        "#EB271B",
                        "#D9B5CA",
                        "#AED1DA",
                        "#DFECB2",
                        "#FCDAB0",
                        "#F5BCB4"
                    ]
                }
            }
        },
        {
            "feed": "shape",
            "properties": {
                "palette": {
                    "defaultValue": [
                        "circle",
                        "square",
                        "diamond",
                        "triangleUp",
                        "triangleDown",
                        "triangleLeft",
                        "triangleRight",
                        "cross",
                        "intersection"
                    ]
                }
            }
        },
        {
            "feed": "dataFrame",
            "properties": {
                "domain": {
                    "defaultValue": []
                }
            }
        }
    ],
    "bubble": [
        {
            "feed": "valueAxis",
            "properties": {
                "type": {
                    "defaultValue": "linear"
                },
                "min": {
                    "defaultValue": "auto"
                },
                "max": {
                    "defaultValue": "auto"
                }
            }
        },
        {
            "feed": "valueAxis2",
            "properties": {
                "type": {
                    "defaultValue": "linear"
                },
                "min": {
                    "defaultValue": "auto"
                },
                "max": {
                    "defaultValue": "auto"
                }
            }
        },
        {
            "feed": "color",
            "properties": {
                "palette": {
                    "defaultValue": [
                        "#748CB2",
                        "#9CC677",
                        "#EACF5E",
                        "#F9AD79",
                        "#D16A7C",
                        "#8873A2",
                        "#3A95B3",
                        "#B6D949",
                        "#FDD36C",
                        "#F47958",
                        "#A65084",
                        "#0063B1",
                        "#0DA841",
                        "#FCB71D",
                        "#F05620",
                        "#B22D6E",
                        "#3C368E",
                        "#8FB2CF",
                        "#95D4AB",
                        "#EAE98F",
                        "#F9BE92",
                        "#EC9A99",
                        "#BC98BD",
                        "#1EB7B2",
                        "#73C03C",
                        "#F48323",
                        "#EB271B",
                        "#D9B5CA",
                        "#AED1DA",
                        "#DFECB2",
                        "#FCDAB0",
                        "#F5BCB4"
                    ]
                }
            }
        },
        {
            "feed": "shape",
            "properties": {
                "palette": {
                    "defaultValue": [
                        "circle",
                        "square",
                        "diamond",
                        "triangleUp",
                        "triangleDown",
                        "triangleLeft",
                        "triangleRight",
                        "cross",
                        "intersection"
                    ]
                }
            }
        },
        {
            "feed": "dataFrame",
            "properties": {
                "domain": {
                    "defaultValue": []
                }
            }
        }
    ],
    "trellis_column": [
        {
            "feed": "valueAxis",
            "properties": {
                "min": {
                    "defaultValue": "auto"
                },
                "max": {
                    "defaultValue": "auto"
                },
                "type": {
                    "defaultValue": "linear"
                }
            }
        },
        {
            "feed": "color",
            "properties": {
                "palette": {
                    "defaultValue": [
                        "#748CB2",
                        "#9CC677",
                        "#EACF5E",
                        "#F9AD79",
                        "#D16A7C",
                        "#8873A2",
                        "#3A95B3",
                        "#B6D949",
                        "#FDD36C",
                        "#F47958",
                        "#A65084",
                        "#0063B1",
                        "#0DA841",
                        "#FCB71D",
                        "#F05620",
                        "#B22D6E",
                        "#3C368E",
                        "#8FB2CF",
                        "#95D4AB",
                        "#EAE98F",
                        "#F9BE92",
                        "#EC9A99",
                        "#BC98BD",
                        "#1EB7B2",
                        "#73C03C",
                        "#F48323",
                        "#EB271B",
                        "#D9B5CA",
                        "#AED1DA",
                        "#DFECB2",
                        "#FCDAB0",
                        "#F5BCB4"
                    ]
                }
            }
        }
    ],
    "trellis_donut": [
        {
            "feed": "color",
            "properties": {
                "palette": {
                    "defaultValue": [
                        "#748CB2",
                        "#9CC677",
                        "#EACF5E",
                        "#F9AD79",
                        "#D16A7C",
                        "#8873A2",
                        "#3A95B3",
                        "#B6D949",
                        "#FDD36C",
                        "#F47958",
                        "#A65084",
                        "#0063B1",
                        "#0DA841",
                        "#FCB71D",
                        "#F05620",
                        "#B22D6E",
                        "#3C368E",
                        "#8FB2CF",
                        "#95D4AB",
                        "#EAE98F",
                        "#F9BE92",
                        "#EC9A99",
                        "#BC98BD",
                        "#1EB7B2",
                        "#73C03C",
                        "#F48323",
                        "#EB271B",
                        "#D9B5CA",
                        "#AED1DA",
                        "#DFECB2",
                        "#FCDAB0",
                        "#F5BCB4"
                    ]
                }
            }
        }
    ],
    "trellis_pie": [
        {
            "feed": "color",
            "properties": {
                "palette": {
                    "defaultValue": [
                        "#748CB2",
                        "#9CC677",
                        "#EACF5E",
                        "#F9AD79",
                        "#D16A7C",
                        "#8873A2",
                        "#3A95B3",
                        "#B6D949",
                        "#FDD36C",
                        "#F47958",
                        "#A65084",
                        "#0063B1",
                        "#0DA841",
                        "#FCB71D",
                        "#F05620",
                        "#B22D6E",
                        "#3C368E",
                        "#8FB2CF",
                        "#95D4AB",
                        "#EAE98F",
                        "#F9BE92",
                        "#EC9A99",
                        "#BC98BD",
                        "#1EB7B2",
                        "#73C03C",
                        "#F48323",
                        "#EB271B",
                        "#D9B5CA",
                        "#AED1DA",
                        "#DFECB2",
                        "#FCDAB0",
                        "#F5BCB4"
                    ]
                }
            }
        }
    ],
    "trellis_bar": [
        {
            "feed": "valueAxis",
            "properties": {
                "min": {
                    "defaultValue": "auto"
                },
                "max": {
                    "defaultValue": "auto"
                },
                "type": {
                    "defaultValue": "linear"
                }
            }
        },
        {
            "feed": "color",
            "properties": {
                "palette": {
                    "defaultValue": [
                        "#748CB2",
                        "#9CC677",
                        "#EACF5E",
                        "#F9AD79",
                        "#D16A7C",
                        "#8873A2",
                        "#3A95B3",
                        "#B6D949",
                        "#FDD36C",
                        "#F47958",
                        "#A65084",
                        "#0063B1",
                        "#0DA841",
                        "#FCB71D",
                        "#F05620",
                        "#B22D6E",
                        "#3C368E",
                        "#8FB2CF",
                        "#95D4AB",
                        "#EAE98F",
                        "#F9BE92",
                        "#EC9A99",
                        "#BC98BD",
                        "#1EB7B2",
                        "#73C03C",
                        "#F48323",
                        "#EB271B",
                        "#D9B5CA",
                        "#AED1DA",
                        "#DFECB2",
                        "#FCDAB0",
                        "#F5BCB4"
                    ]
                }
            }
        }
    ],
    "trellis_line": [
        {
            "feed": "valueAxis",
            "properties": {
                "min": {
                    "defaultValue": "auto"
                },
                "max": {
                    "defaultValue": "auto"
                },
                "type": {
                    "defaultValue": "linear"
                }
            }
        },
        {
            "feed": "color",
            "properties": {
                "palette": {
                    "defaultValue": [
                        "#748CB2",
                        "#9CC677",
                        "#EACF5E",
                        "#F9AD79",
                        "#D16A7C",
                        "#8873A2",
                        "#3A95B3",
                        "#B6D949",
                        "#FDD36C",
                        "#F47958",
                        "#A65084",
                        "#0063B1",
                        "#0DA841",
                        "#FCB71D",
                        "#F05620",
                        "#B22D6E",
                        "#3C368E",
                        "#8FB2CF",
                        "#95D4AB",
                        "#EAE98F",
                        "#F9BE92",
                        "#EC9A99",
                        "#BC98BD",
                        "#1EB7B2",
                        "#73C03C",
                        "#F48323",
                        "#EB271B",
                        "#D9B5CA",
                        "#AED1DA",
                        "#DFECB2",
                        "#FCDAB0",
                        "#F5BCB4"
                    ]
                }
            }
        }
    ],
    "trellis_area": [
        {
            "feed": "valueAxis",
            "properties": {
                "min": {
                    "defaultValue": "auto"
                },
                "max": {
                    "defaultValue": "auto"
                },
                "type": {
                    "defaultValue": "linear"
                }
            }
        },
        {
            "feed": "color",
            "properties": {
                "palette": {
                    "defaultValue": [
                        "#748CB2",
                        "#9CC677",
                        "#EACF5E",
                        "#F9AD79",
                        "#D16A7C",
                        "#8873A2",
                        "#3A95B3",
                        "#B6D949",
                        "#FDD36C",
                        "#F47958",
                        "#A65084",
                        "#0063B1",
                        "#0DA841",
                        "#FCB71D",
                        "#F05620",
                        "#B22D6E",
                        "#3C368E",
                        "#8FB2CF",
                        "#95D4AB",
                        "#EAE98F",
                        "#F9BE92",
                        "#EC9A99",
                        "#BC98BD",
                        "#1EB7B2",
                        "#73C03C",
                        "#F48323",
                        "#EB271B",
                        "#D9B5CA",
                        "#AED1DA",
                        "#DFECB2",
                        "#FCDAB0",
                        "#F5BCB4"
                    ]
                }
            }
        }
    ],
    "trellis_100_area": [
        {
            "feed": "color",
            "properties": {
                "palette": {
                    "defaultValue": [
                        "#748CB2",
                        "#9CC677",
                        "#EACF5E",
                        "#F9AD79",
                        "#D16A7C",
                        "#8873A2",
                        "#3A95B3",
                        "#B6D949",
                        "#FDD36C",
                        "#F47958",
                        "#A65084",
                        "#0063B1",
                        "#0DA841",
                        "#FCB71D",
                        "#F05620",
                        "#B22D6E",
                        "#3C368E",
                        "#8FB2CF",
                        "#95D4AB",
                        "#EAE98F",
                        "#F9BE92",
                        "#EC9A99",
                        "#BC98BD",
                        "#1EB7B2",
                        "#73C03C",
                        "#F48323",
                        "#EB271B",
                        "#D9B5CA",
                        "#AED1DA",
                        "#DFECB2",
                        "#FCDAB0",
                        "#F5BCB4"
                    ]
                }
            }
        }
    ],
    "trellis_100_horizontal_area": [
        {
            "feed": "color",
            "properties": {
                "palette": {
                    "defaultValue": [
                        "#748CB2",
                        "#9CC677",
                        "#EACF5E",
                        "#F9AD79",
                        "#D16A7C",
                        "#8873A2",
                        "#3A95B3",
                        "#B6D949",
                        "#FDD36C",
                        "#F47958",
                        "#A65084",
                        "#0063B1",
                        "#0DA841",
                        "#FCB71D",
                        "#F05620",
                        "#B22D6E",
                        "#3C368E",
                        "#8FB2CF",
                        "#95D4AB",
                        "#EAE98F",
                        "#F9BE92",
                        "#EC9A99",
                        "#BC98BD",
                        "#1EB7B2",
                        "#73C03C",
                        "#F48323",
                        "#EB271B",
                        "#D9B5CA",
                        "#AED1DA",
                        "#DFECB2",
                        "#FCDAB0",
                        "#F5BCB4"
                    ]
                }
            }
        }
    ],
    "trellis_stacked_column": [
        {
            "feed": "valueAxis",
            "properties": {
                "min": {
                    "defaultValue": "auto"
                },
                "max": {
                    "defaultValue": "auto"
                },
                "type": {
                    "defaultValue": "linear"
                }
            }
        },
        {
            "feed": "color",
            "properties": {
                "palette": {
                    "defaultValue": [
                        "#748CB2",
                        "#9CC677",
                        "#EACF5E",
                        "#F9AD79",
                        "#D16A7C",
                        "#8873A2",
                        "#3A95B3",
                        "#B6D949",
                        "#FDD36C",
                        "#F47958",
                        "#A65084",
                        "#0063B1",
                        "#0DA841",
                        "#FCB71D",
                        "#F05620",
                        "#B22D6E",
                        "#3C368E",
                        "#8FB2CF",
                        "#95D4AB",
                        "#EAE98F",
                        "#F9BE92",
                        "#EC9A99",
                        "#BC98BD",
                        "#1EB7B2",
                        "#73C03C",
                        "#F48323",
                        "#EB271B",
                        "#D9B5CA",
                        "#AED1DA",
                        "#DFECB2",
                        "#FCDAB0",
                        "#F5BCB4"
                    ]
                }
            }
        }
    ],
    "trellis_stacked_bar": [
        {
            "feed": "valueAxis",
            "properties": {
                "min": {
                    "defaultValue": "auto"
                },
                "max": {
                    "defaultValue": "auto"
                },
                "type": {
                    "defaultValue": "linear"
                }
            }
        },
        {
            "feed": "color",
            "properties": {
                "palette": {
                    "defaultValue": [
                        "#748CB2",
                        "#9CC677",
                        "#EACF5E",
                        "#F9AD79",
                        "#D16A7C",
                        "#8873A2",
                        "#3A95B3",
                        "#B6D949",
                        "#FDD36C",
                        "#F47958",
                        "#A65084",
                        "#0063B1",
                        "#0DA841",
                        "#FCB71D",
                        "#F05620",
                        "#B22D6E",
                        "#3C368E",
                        "#8FB2CF",
                        "#95D4AB",
                        "#EAE98F",
                        "#F9BE92",
                        "#EC9A99",
                        "#BC98BD",
                        "#1EB7B2",
                        "#73C03C",
                        "#F48323",
                        "#EB271B",
                        "#D9B5CA",
                        "#AED1DA",
                        "#DFECB2",
                        "#FCDAB0",
                        "#F5BCB4"
                    ]
                }
            }
        }
    ],
    "trellis_100_stacked_bar": [
        {
            "feed": "color",
            "properties": {
                "palette": {
                    "defaultValue": [
                        "#748CB2",
                        "#9CC677",
                        "#EACF5E",
                        "#F9AD79",
                        "#D16A7C",
                        "#8873A2",
                        "#3A95B3",
                        "#B6D949",
                        "#FDD36C",
                        "#F47958",
                        "#A65084",
                        "#0063B1",
                        "#0DA841",
                        "#FCB71D",
                        "#F05620",
                        "#B22D6E",
                        "#3C368E",
                        "#8FB2CF",
                        "#95D4AB",
                        "#EAE98F",
                        "#F9BE92",
                        "#EC9A99",
                        "#BC98BD",
                        "#1EB7B2",
                        "#73C03C",
                        "#F48323",
                        "#EB271B",
                        "#D9B5CA",
                        "#AED1DA",
                        "#DFECB2",
                        "#FCDAB0",
                        "#F5BCB4"
                    ]
                }
            }
        }
    ],
    "trellis_100_stacked_column": [
        {
            "feed": "color",
            "properties": {
                "palette": {
                    "defaultValue": [
                        "#748CB2",
                        "#9CC677",
                        "#EACF5E",
                        "#F9AD79",
                        "#D16A7C",
                        "#8873A2",
                        "#3A95B3",
                        "#B6D949",
                        "#FDD36C",
                        "#F47958",
                        "#A65084",
                        "#0063B1",
                        "#0DA841",
                        "#FCB71D",
                        "#F05620",
                        "#B22D6E",
                        "#3C368E",
                        "#8FB2CF",
                        "#95D4AB",
                        "#EAE98F",
                        "#F9BE92",
                        "#EC9A99",
                        "#BC98BD",
                        "#1EB7B2",
                        "#73C03C",
                        "#F48323",
                        "#EB271B",
                        "#D9B5CA",
                        "#AED1DA",
                        "#DFECB2",
                        "#FCDAB0",
                        "#F5BCB4"
                    ]
                }
            }
        }
    ],
    "trellis_combination": [
        {
            "feed": "valueAxis",
            "properties": {
                "min": {
                    "defaultValue": "auto"
                },
                "max": {
                    "defaultValue": "auto"
                },
                "type": {
                    "defaultValue": "linear"
                }
            }
        },
        {
            "feed": "color",
            "properties": {
                "palette": {
                    "defaultValue": [
                        "#748CB2",
                        "#9CC677",
                        "#EACF5E",
                        "#F9AD79",
                        "#D16A7C",
                        "#8873A2",
                        "#3A95B3",
                        "#B6D949",
                        "#FDD36C",
                        "#F47958",
                        "#A65084",
                        "#0063B1",
                        "#0DA841",
                        "#FCB71D",
                        "#F05620",
                        "#B22D6E",
                        "#3C368E",
                        "#8FB2CF",
                        "#95D4AB",
                        "#EAE98F",
                        "#F9BE92",
                        "#EC9A99",
                        "#BC98BD",
                        "#1EB7B2",
                        "#73C03C",
                        "#F48323",
                        "#EB271B",
                        "#D9B5CA",
                        "#AED1DA",
                        "#DFECB2",
                        "#FCDAB0",
                        "#F5BCB4"
                    ]
                }
            }
        }
    ],
    "trellis_dual_bar": [
        {
            "feed": "valueAxis",
            "properties": {
                "min": {
                    "defaultValue": "auto"
                },
                "max": {
                    "defaultValue": "auto"
                },
                "type": {
                    "defaultValue": "linear"
                }
            }
        },
        {
            "feed": "valueAxis2",
            "properties": {
                "min": {
                    "defaultValue": "auto"
                },
                "max": {
                    "defaultValue": "auto"
                },
                "type": {
                    "defaultValue": "linear"
                }
            }
        },
        {
            "feed": "color",
            "properties": {
                "palette": {
                    "defaultValue": [
                        [
                            "#8FBADD",
                            "#B8D4E9",
                            "#7AAED6",
                            "#A3C7E3",
                            "#3D88C4",
                            "#66A1D0",
                            "#297CBE",
                            "#5295CA",
                            "#005BA3",
                            "#146FB7",
                            "#005395",
                            "#0063B1"
                        ],
                        [
                            "#F6A09B",
                            "#F9C3C0",
                            "#F58E88",
                            "#F8B1AD",
                            "#F05B52",
                            "#F37D76",
                            "#EE4A40",
                            "#F16C64",
                            "#D92419",
                            "#ED382D",
                            "#C52117",
                            "#EB271B"
                        ]
                    ]
                }
            }
        }
    ],
    "trellis_dual_column": [
        {
            "feed": "valueAxis",
            "properties": {
                "min": {
                    "defaultValue": "auto"
                },
                "max": {
                    "defaultValue": "auto"
                },
                "type": {
                    "defaultValue": "linear"
                }
            }
        },
        {
            "feed": "valueAxis2",
            "properties": {
                "min": {
                    "defaultValue": "auto"
                },
                "max": {
                    "defaultValue": "auto"
                },
                "type": {
                    "defaultValue": "linear"
                }
            }
        },
        {
            "feed": "color",
            "properties": {
                "palette": {
                    "defaultValue": [
                        [
                            "#8FBADD",
                            "#B8D4E9",
                            "#7AAED6",
                            "#A3C7E3",
                            "#3D88C4",
                            "#66A1D0",
                            "#297CBE",
                            "#5295CA",
                            "#005BA3",
                            "#146FB7",
                            "#005395",
                            "#0063B1"
                        ],
                        [
                            "#F6A09B",
                            "#F9C3C0",
                            "#F58E88",
                            "#F8B1AD",
                            "#F05B52",
                            "#F37D76",
                            "#EE4A40",
                            "#F16C64",
                            "#D92419",
                            "#ED382D",
                            "#C52117",
                            "#EB271B"
                        ]
                    ]
                }
            }
        }
    ],
    "trellis_dual_line": [
        {
            "feed": "valueAxis",
            "properties": {
                "min": {
                    "defaultValue": "auto"
                },
                "max": {
                    "defaultValue": "auto"
                },
                "type": {
                    "defaultValue": "linear"
                }
            }
        },
        {
            "feed": "valueAxis2",
            "properties": {
                "min": {
                    "defaultValue": "auto"
                },
                "max": {
                    "defaultValue": "auto"
                },
                "type": {
                    "defaultValue": "linear"
                }
            }
        },
        {
            "feed": "color",
            "properties": {
                "palette": {
                    "defaultValue": [
                        [
                            "#8FBADD",
                            "#B8D4E9",
                            "#7AAED6",
                            "#A3C7E3",
                            "#3D88C4",
                            "#66A1D0",
                            "#297CBE",
                            "#5295CA",
                            "#005BA3",
                            "#146FB7",
                            "#005395",
                            "#0063B1"
                        ],
                        [
                            "#F6A09B",
                            "#F9C3C0",
                            "#F58E88",
                            "#F8B1AD",
                            "#F05B52",
                            "#F37D76",
                            "#EE4A40",
                            "#F16C64",
                            "#D92419",
                            "#ED382D",
                            "#C52117",
                            "#EB271B"
                        ]
                    ]
                }
            }
        }
    ],
    "trellis_scatter": [
        {
            "feed": "valueAxis",
            "properties": {
                "type": {
                    "defaultValue": "linear"
                },
                "min": {
                    "defaultValue": "auto"
                },
                "max": {
                    "defaultValue": "auto"
                }
            }
        },
        {
            "feed": "valueAxis2",
            "properties": {
                "type": {
                    "defaultValue": "linear"
                },
                "min": {
                    "defaultValue": "auto"
                },
                "max": {
                    "defaultValue": "auto"
                }
            }
        },
        {
            "feed": "color",
            "properties": {
                "palette": {
                    "defaultValue": [
                        "#748CB2",
                        "#9CC677",
                        "#EACF5E",
                        "#F9AD79",
                        "#D16A7C",
                        "#8873A2",
                        "#3A95B3",
                        "#B6D949",
                        "#FDD36C",
                        "#F47958",
                        "#A65084",
                        "#0063B1",
                        "#0DA841",
                        "#FCB71D",
                        "#F05620",
                        "#B22D6E",
                        "#3C368E",
                        "#8FB2CF",
                        "#95D4AB",
                        "#EAE98F",
                        "#F9BE92",
                        "#EC9A99",
                        "#BC98BD",
                        "#1EB7B2",
                        "#73C03C",
                        "#F48323",
                        "#EB271B",
                        "#D9B5CA",
                        "#AED1DA",
                        "#DFECB2",
                        "#FCDAB0",
                        "#F5BCB4"
                    ]
                }
            }
        },
        {
            "feed": "shape",
            "properties": {
                "palette": {
                    "defaultValue": [
                        "circle",
                        "square",
                        "diamond",
                        "triangleUp",
                        "triangleDown",
                        "triangleLeft",
                        "triangleRight",
                        "cross",
                        "intersection"
                    ]
                }
            }
        }
    ],
    "trellis_bubble": [
        {
            "feed": "valueAxis",
            "properties": {
                "type": {
                    "defaultValue": "linear"
                },
                "min": {
                    "defaultValue": "auto"
                },
                "max": {
                    "defaultValue": "auto"
                }
            }
        },
        {
            "feed": "valueAxis2",
            "properties": {
                "type": {
                    "defaultValue": "linear"
                },
                "min": {
                    "defaultValue": "auto"
                },
                "max": {
                    "defaultValue": "auto"
                }
            }
        },
        {
            "feed": "color",
            "properties": {
                "palette": {
                    "defaultValue": [
                        "#748CB2",
                        "#9CC677",
                        "#EACF5E",
                        "#F9AD79",
                        "#D16A7C",
                        "#8873A2",
                        "#3A95B3",
                        "#B6D949",
                        "#FDD36C",
                        "#F47958",
                        "#A65084",
                        "#0063B1",
                        "#0DA841",
                        "#FCB71D",
                        "#F05620",
                        "#B22D6E",
                        "#3C368E",
                        "#8FB2CF",
                        "#95D4AB",
                        "#EAE98F",
                        "#F9BE92",
                        "#EC9A99",
                        "#BC98BD",
                        "#1EB7B2",
                        "#73C03C",
                        "#F48323",
                        "#EB271B",
                        "#D9B5CA",
                        "#AED1DA",
                        "#DFECB2",
                        "#FCDAB0",
                        "#F5BCB4"
                    ]
                }
            }
        },
        {
            "feed": "shape",
            "properties": {
                "palette": {
                    "defaultValue": [
                        "circle",
                        "square",
                        "diamond",
                        "triangleUp",
                        "triangleDown",
                        "triangleLeft",
                        "triangleRight",
                        "cross",
                        "intersection"
                    ]
                }
            }
        }
    ],
    "horizontal_line": [
        {
            "feed": "valueAxis",
            "properties": {
                "min": {
                    "defaultValue": "auto"
                },
                "max": {
                    "defaultValue": "auto"
                },
                "type": {
                    "defaultValue": "linear"
                }
            }
        },
        {
            "feed": "color",
            "properties": {
                "palette": {
                    "defaultValue": [
                        "#748CB2",
                        "#9CC677",
                        "#EACF5E",
                        "#F9AD79",
                        "#D16A7C",
                        "#8873A2",
                        "#3A95B3",
                        "#B6D949",
                        "#FDD36C",
                        "#F47958",
                        "#A65084",
                        "#0063B1",
                        "#0DA841",
                        "#FCB71D",
                        "#F05620",
                        "#B22D6E",
                        "#3C368E",
                        "#8FB2CF",
                        "#95D4AB",
                        "#EAE98F",
                        "#F9BE92",
                        "#EC9A99",
                        "#BC98BD",
                        "#1EB7B2",
                        "#73C03C",
                        "#F48323",
                        "#EB271B",
                        "#D9B5CA",
                        "#AED1DA",
                        "#DFECB2",
                        "#FCDAB0",
                        "#F5BCB4"
                    ]
                }
            }
        },
        {
            "feed": "dataFrame",
            "properties": {
                "domain": {
                    "defaultValue": []
                }
            }
        }
    ],
    "horizontal_area": [
        {
            "feed": "valueAxis",
            "properties": {
                "min": {
                    "defaultValue": "auto"
                },
                "max": {
                    "defaultValue": "auto"
                },
                "type": {
                    "defaultValue": "linear"
                }
            }
        },
        {
            "feed": "color",
            "properties": {
                "palette": {
                    "defaultValue": [
                        "#748CB2",
                        "#9CC677",
                        "#EACF5E",
                        "#F9AD79",
                        "#D16A7C",
                        "#8873A2",
                        "#3A95B3",
                        "#B6D949",
                        "#FDD36C",
                        "#F47958",
                        "#A65084",
                        "#0063B1",
                        "#0DA841",
                        "#FCB71D",
                        "#F05620",
                        "#B22D6E",
                        "#3C368E",
                        "#8FB2CF",
                        "#95D4AB",
                        "#EAE98F",
                        "#F9BE92",
                        "#EC9A99",
                        "#BC98BD",
                        "#1EB7B2",
                        "#73C03C",
                        "#F48323",
                        "#EB271B",
                        "#D9B5CA",
                        "#AED1DA",
                        "#DFECB2",
                        "#FCDAB0",
                        "#F5BCB4"
                    ]
                }
            }
        },
        {
            "feed": "dataFrame",
            "properties": {
                "domain": {
                    "defaultValue": []
                }
            }
        }
    ],
    "trellis_horizontal_line": [
        {
            "feed": "valueAxis",
            "properties": {
                "min": {
                    "defaultValue": "auto"
                },
                "max": {
                    "defaultValue": "auto"
                },
                "type": {
                    "defaultValue": "linear"
                }
            }
        },
        {
            "feed": "color",
            "properties": {
                "palette": {
                    "defaultValue": [
                        "#748CB2",
                        "#9CC677",
                        "#EACF5E",
                        "#F9AD79",
                        "#D16A7C",
                        "#8873A2",
                        "#3A95B3",
                        "#B6D949",
                        "#FDD36C",
                        "#F47958",
                        "#A65084",
                        "#0063B1",
                        "#0DA841",
                        "#FCB71D",
                        "#F05620",
                        "#B22D6E",
                        "#3C368E",
                        "#8FB2CF",
                        "#95D4AB",
                        "#EAE98F",
                        "#F9BE92",
                        "#EC9A99",
                        "#BC98BD",
                        "#1EB7B2",
                        "#73C03C",
                        "#F48323",
                        "#EB271B",
                        "#D9B5CA",
                        "#AED1DA",
                        "#DFECB2",
                        "#FCDAB0",
                        "#F5BCB4"
                    ]
                }
            }
        }
    ],
    "trellis_horizontal_area": [
        {
            "feed": "valueAxis",
            "properties": {
                "min": {
                    "defaultValue": "auto"
                },
                "max": {
                    "defaultValue": "auto"
                },
                "type": {
                    "defaultValue": "linear"
                }
            }
        },
        {
            "feed": "color",
            "properties": {
                "palette": {
                    "defaultValue": [
                        "#748CB2",
                        "#9CC677",
                        "#EACF5E",
                        "#F9AD79",
                        "#D16A7C",
                        "#8873A2",
                        "#3A95B3",
                        "#B6D949",
                        "#FDD36C",
                        "#F47958",
                        "#A65084",
                        "#0063B1",
                        "#0DA841",
                        "#FCB71D",
                        "#F05620",
                        "#B22D6E",
                        "#3C368E",
                        "#8FB2CF",
                        "#95D4AB",
                        "#EAE98F",
                        "#F9BE92",
                        "#EC9A99",
                        "#BC98BD",
                        "#1EB7B2",
                        "#73C03C",
                        "#F48323",
                        "#EB271B",
                        "#D9B5CA",
                        "#AED1DA",
                        "#DFECB2",
                        "#FCDAB0",
                        "#F5BCB4"
                    ]
                }
            }
        }
    ],
    "horizontal_combination": [
        {
            "feed": "valueAxis",
            "properties": {
                "min": {
                    "defaultValue": "auto"
                },
                "max": {
                    "defaultValue": "auto"
                },
                "type": {
                    "defaultValue": "linear"
                }
            }
        },
        {
            "feed": "color",
            "properties": {
                "palette": {
                    "defaultValue": [
                        "#748CB2",
                        "#9CC677",
                        "#EACF5E",
                        "#F9AD79",
                        "#D16A7C",
                        "#8873A2",
                        "#3A95B3",
                        "#B6D949",
                        "#FDD36C",
                        "#F47958",
                        "#A65084",
                        "#0063B1",
                        "#0DA841",
                        "#FCB71D",
                        "#F05620",
                        "#B22D6E",
                        "#3C368E",
                        "#8FB2CF",
                        "#95D4AB",
                        "#EAE98F",
                        "#F9BE92",
                        "#EC9A99",
                        "#BC98BD",
                        "#1EB7B2",
                        "#73C03C",
                        "#F48323",
                        "#EB271B",
                        "#D9B5CA",
                        "#AED1DA",
                        "#DFECB2",
                        "#FCDAB0",
                        "#F5BCB4"
                    ]
                }
            }
        },
        {
            "feed": "dataFrame",
            "properties": {
                "domain": {
                    "defaultValue": []
                }
            }
        }
    ],
    "trellis_horizontal_combination": [
        {
            "feed": "valueAxis",
            "properties": {
                "min": {
                    "defaultValue": "auto"
                },
                "max": {
                    "defaultValue": "auto"
                },
                "type": {
                    "defaultValue": "linear"
                }
            }
        },
        {
            "feed": "color",
            "properties": {
                "palette": {
                    "defaultValue": [
                        "#748CB2",
                        "#9CC677",
                        "#EACF5E",
                        "#F9AD79",
                        "#D16A7C",
                        "#8873A2",
                        "#3A95B3",
                        "#B6D949",
                        "#FDD36C",
                        "#F47958",
                        "#A65084",
                        "#0063B1",
                        "#0DA841",
                        "#FCB71D",
                        "#F05620",
                        "#B22D6E",
                        "#3C368E",
                        "#8FB2CF",
                        "#95D4AB",
                        "#EAE98F",
                        "#F9BE92",
                        "#EC9A99",
                        "#BC98BD",
                        "#1EB7B2",
                        "#73C03C",
                        "#F48323",
                        "#EB271B",
                        "#D9B5CA",
                        "#AED1DA",
                        "#DFECB2",
                        "#FCDAB0",
                        "#F5BCB4"
                    ]
                }
            }
        }
    ],
    "dual_horizontal_line": [
        {
            "feed": "valueAxis",
            "properties": {
                "min": {
                    "defaultValue": "auto"
                },
                "max": {
                    "defaultValue": "auto"
                },
                "type": {
                    "defaultValue": "linear"
                }
            }
        },
        {
            "feed": "valueAxis2",
            "properties": {
                "min": {
                    "defaultValue": "auto"
                },
                "max": {
                    "defaultValue": "auto"
                },
                "type": {
                    "defaultValue": "linear"
                }
            }
        },
        {
            "feed": "color",
            "properties": {
                "palette": {
                    "defaultValue": [
                        [
                            "#8FBADD",
                            "#B8D4E9",
                            "#7AAED6",
                            "#A3C7E3",
                            "#3D88C4",
                            "#66A1D0",
                            "#297CBE",
                            "#5295CA",
                            "#005BA3",
                            "#146FB7",
                            "#005395",
                            "#0063B1"
                        ],
                        [
                            "#F6A09B",
                            "#F9C3C0",
                            "#F58E88",
                            "#F8B1AD",
                            "#F05B52",
                            "#F37D76",
                            "#EE4A40",
                            "#F16C64",
                            "#D92419",
                            "#ED382D",
                            "#C52117",
                            "#EB271B"
                        ]
                    ]
                }
            }
        },
        {
            "feed": "dataFrame",
            "properties": {
                "domain": {
                    "defaultValue": []
                }
            }
        }
    ],
    "trellis_dual_horizontal_line": [
        {
            "feed": "valueAxis",
            "properties": {
                "min": {
                    "defaultValue": "auto"
                },
                "max": {
                    "defaultValue": "auto"
                },
                "type": {
                    "defaultValue": "linear"
                }
            }
        },
        {
            "feed": "valueAxis2",
            "properties": {
                "min": {
                    "defaultValue": "auto"
                },
                "max": {
                    "defaultValue": "auto"
                },
                "type": {
                    "defaultValue": "linear"
                }
            }
        },
        {
            "feed": "color",
            "properties": {
                "palette": {
                    "defaultValue": [
                        [
                            "#8FBADD",
                            "#B8D4E9",
                            "#7AAED6",
                            "#A3C7E3",
                            "#3D88C4",
                            "#66A1D0",
                            "#297CBE",
                            "#5295CA",
                            "#005BA3",
                            "#146FB7",
                            "#005395",
                            "#0063B1"
                        ],
                        [
                            "#F6A09B",
                            "#F9C3C0",
                            "#F58E88",
                            "#F8B1AD",
                            "#F05B52",
                            "#F37D76",
                            "#EE4A40",
                            "#F16C64",
                            "#D92419",
                            "#ED382D",
                            "#C52117",
                            "#EB271B"
                        ]
                    ]
                }
            }
        }
    ],
    "100_dual_stacked_column": [
        {
            "feed": "color",
            "properties": {
                "palette": {
                    "defaultValue": [
                        [
                            "#8FBADD",
                            "#B8D4E9",
                            "#7AAED6",
                            "#A3C7E3",
                            "#3D88C4",
                            "#66A1D0",
                            "#297CBE",
                            "#5295CA",
                            "#005BA3",
                            "#146FB7",
                            "#005395",
                            "#0063B1"
                        ],
                        [
                            "#F6A09B",
                            "#F9C3C0",
                            "#F58E88",
                            "#F8B1AD",
                            "#F05B52",
                            "#F37D76",
                            "#EE4A40",
                            "#F16C64",
                            "#D92419",
                            "#ED382D",
                            "#C52117",
                            "#EB271B"
                        ]
                    ]
                }
            }
        },
        {
            "feed": "dataFrame",
            "properties": {
                "domain": {
                    "defaultValue": []
                }
            }
        }
    ],
    "trellis_100_dual_stacked_column": [
        {
            "feed": "color",
            "properties": {
                "palette": {
                    "defaultValue": [
                        [
                            "#8FBADD",
                            "#B8D4E9",
                            "#7AAED6",
                            "#A3C7E3",
                            "#3D88C4",
                            "#66A1D0",
                            "#297CBE",
                            "#5295CA",
                            "#005BA3",
                            "#146FB7",
                            "#005395",
                            "#0063B1"
                        ],
                        [
                            "#F6A09B",
                            "#F9C3C0",
                            "#F58E88",
                            "#F8B1AD",
                            "#F05B52",
                            "#F37D76",
                            "#EE4A40",
                            "#F16C64",
                            "#D92419",
                            "#ED382D",
                            "#C52117",
                            "#EB271B"
                        ]
                    ]
                }
            }
        },
        {
            "feed": "dataFrame",
            "properties": {
                "domain": {
                    "defaultValue": []
                }
            }
        }
    ],
    "100_dual_stacked_bar": [
        {
            "feed": "color",
            "properties": {
                "palette": {
                    "defaultValue": [
                        [
                            "#8FBADD",
                            "#B8D4E9",
                            "#7AAED6",
                            "#A3C7E3",
                            "#3D88C4",
                            "#66A1D0",
                            "#297CBE",
                            "#5295CA",
                            "#005BA3",
                            "#146FB7",
                            "#005395",
                            "#0063B1"
                        ],
                        [
                            "#F6A09B",
                            "#F9C3C0",
                            "#F58E88",
                            "#F8B1AD",
                            "#F05B52",
                            "#F37D76",
                            "#EE4A40",
                            "#F16C64",
                            "#D92419",
                            "#ED382D",
                            "#C52117",
                            "#EB271B"
                        ]
                    ]
                }
            }
        },
        {
            "feed": "dataFrame",
            "properties": {
                "domain": {
                    "defaultValue": []
                }
            }
        }
    ],
    "trellis_100_dual_stacked_bar": [
        {
            "feed": "color",
            "properties": {
                "palette": {
                    "defaultValue": [
                        [
                            "#8FBADD",
                            "#B8D4E9",
                            "#7AAED6",
                            "#A3C7E3",
                            "#3D88C4",
                            "#66A1D0",
                            "#297CBE",
                            "#5295CA",
                            "#005BA3",
                            "#146FB7",
                            "#005395",
                            "#0063B1"
                        ],
                        [
                            "#F6A09B",
                            "#F9C3C0",
                            "#F58E88",
                            "#F8B1AD",
                            "#F05B52",
                            "#F37D76",
                            "#EE4A40",
                            "#F16C64",
                            "#D92419",
                            "#ED382D",
                            "#C52117",
                            "#EB271B"
                        ]
                    ]
                }
            }
        }
    ],
    "dual_stacked_column": [
        {
            "feed": "valueAxis",
            "properties": {
                "min": {
                    "defaultValue": "auto"
                },
                "max": {
                    "defaultValue": "auto"
                },
                "type": {
                    "defaultValue": "linear"
                }
            }
        },
        {
            "feed": "valueAxis2",
            "properties": {
                "min": {
                    "defaultValue": "auto"
                },
                "max": {
                    "defaultValue": "auto"
                },
                "type": {
                    "defaultValue": "linear"
                }
            }
        },
        {
            "feed": "color",
            "properties": {
                "palette": {
                    "defaultValue": [
                        [
                            "#8FBADD",
                            "#B8D4E9",
                            "#7AAED6",
                            "#A3C7E3",
                            "#3D88C4",
                            "#66A1D0",
                            "#297CBE",
                            "#5295CA",
                            "#005BA3",
                            "#146FB7",
                            "#005395",
                            "#0063B1"
                        ],
                        [
                            "#F6A09B",
                            "#F9C3C0",
                            "#F58E88",
                            "#F8B1AD",
                            "#F05B52",
                            "#F37D76",
                            "#EE4A40",
                            "#F16C64",
                            "#D92419",
                            "#ED382D",
                            "#C52117",
                            "#EB271B"
                        ]
                    ]
                }
            }
        },
        {
            "feed": "dataFrame",
            "properties": {
                "domain": {
                    "defaultValue": []
                }
            }
        }
    ],
    "trellis_dual_stacked_column": [
        {
            "feed": "valueAxis",
            "properties": {
                "min": {
                    "defaultValue": "auto"
                },
                "max": {
                    "defaultValue": "auto"
                },
                "type": {
                    "defaultValue": "linear"
                }
            }
        },
        {
            "feed": "valueAxis2",
            "properties": {
                "min": {
                    "defaultValue": "auto"
                },
                "max": {
                    "defaultValue": "auto"
                },
                "type": {
                    "defaultValue": "linear"
                }
            }
        },
        {
            "feed": "color",
            "properties": {
                "palette": {
                    "defaultValue": [
                        [
                            "#8FBADD",
                            "#B8D4E9",
                            "#7AAED6",
                            "#A3C7E3",
                            "#3D88C4",
                            "#66A1D0",
                            "#297CBE",
                            "#5295CA",
                            "#005BA3",
                            "#146FB7",
                            "#005395",
                            "#0063B1"
                        ],
                        [
                            "#F6A09B",
                            "#F9C3C0",
                            "#F58E88",
                            "#F8B1AD",
                            "#F05B52",
                            "#F37D76",
                            "#EE4A40",
                            "#F16C64",
                            "#D92419",
                            "#ED382D",
                            "#C52117",
                            "#EB271B"
                        ]
                    ]
                }
            }
        },
        {
            "feed": "dataFrame",
            "properties": {
                "domain": {
                    "defaultValue": []
                }
            }
        }
    ],
    "dual_stacked_bar": [
        {
            "feed": "valueAxis",
            "properties": {
                "min": {
                    "defaultValue": "auto"
                },
                "max": {
                    "defaultValue": "auto"
                },
                "type": {
                    "defaultValue": "linear"
                }
            }
        },
        {
            "feed": "valueAxis2",
            "properties": {
                "min": {
                    "defaultValue": "auto"
                },
                "max": {
                    "defaultValue": "auto"
                },
                "type": {
                    "defaultValue": "linear"
                }
            }
        },
        {
            "feed": "color",
            "properties": {
                "palette": {
                    "defaultValue": [
                        [
                            "#8FBADD",
                            "#B8D4E9",
                            "#7AAED6",
                            "#A3C7E3",
                            "#3D88C4",
                            "#66A1D0",
                            "#297CBE",
                            "#5295CA",
                            "#005BA3",
                            "#146FB7",
                            "#005395",
                            "#0063B1"
                        ],
                        [
                            "#F6A09B",
                            "#F9C3C0",
                            "#F58E88",
                            "#F8B1AD",
                            "#F05B52",
                            "#F37D76",
                            "#EE4A40",
                            "#F16C64",
                            "#D92419",
                            "#ED382D",
                            "#C52117",
                            "#EB271B"
                        ]
                    ]
                }
            }
        },
        {
            "feed": "dataFrame",
            "properties": {
                "domain": {
                    "defaultValue": []
                }
            }
        }
    ],
    "trellis_dual_stacked_bar": [
        {
            "feed": "valueAxis",
            "properties": {
                "min": {
                    "defaultValue": "auto"
                },
                "max": {
                    "defaultValue": "auto"
                },
                "type": {
                    "defaultValue": "linear"
                }
            }
        },
        {
            "feed": "valueAxis2",
            "properties": {
                "min": {
                    "defaultValue": "auto"
                },
                "max": {
                    "defaultValue": "auto"
                },
                "type": {
                    "defaultValue": "linear"
                }
            }
        },
        {
            "feed": "color",
            "properties": {
                "palette": {
                    "defaultValue": [
                        [
                            "#8FBADD",
                            "#B8D4E9",
                            "#7AAED6",
                            "#A3C7E3",
                            "#3D88C4",
                            "#66A1D0",
                            "#297CBE",
                            "#5295CA",
                            "#005BA3",
                            "#146FB7",
                            "#005395",
                            "#0063B1"
                        ],
                        [
                            "#F6A09B",
                            "#F9C3C0",
                            "#F58E88",
                            "#F8B1AD",
                            "#F05B52",
                            "#F37D76",
                            "#EE4A40",
                            "#F16C64",
                            "#D92419",
                            "#ED382D",
                            "#C52117",
                            "#EB271B"
                        ]
                    ]
                }
            }
        }
    ],
    "treemap": [
        {
            "feed": "color",
            "properties": {
                "palette": {
                    "defaultValue": []
                },
                "startColor": {
                    "defaultValue": "#C2E3A9"
                },
                "endColor": {
                    "defaultValue": "#73C03C"
                },
                "legendValues": {
                    "defaultValue": []
                },
                "numOfSegments": {
                    "defaultValue": 5
                },
                "nullColor": {
                    "defaultValue": "#E0E0E0"
                }
            }
        }
    ],
    "heatmap": [
        {
            "feed": "color",
            "properties": {
                "palette": {
                    "defaultValue": []
                },
                "startColor": {
                    "defaultValue": "#C2E3A9"
                },
                "endColor": {
                    "defaultValue": "#73C03C"
                },
                "legendValues": {
                    "defaultValue": []
                },
                "numOfSegments": {
                    "defaultValue": 5
                },
                "nullColor": {
                    "defaultValue": "#E0E0E0"
                }
            }
        }
    ],
    "number": [],
    "tagcloud": [
        {
            "feed": "color",
            "properties": {
                "palette": {
                    "defaultValue": []
                },
                "startColor": {
                    "defaultValue": "#C2E3A9"
                },
                "endColor": {
                    "defaultValue": "#73C03C"
                },
                "legendValues": {
                    "defaultValue": []
                },
                "numOfSegments": {
                    "defaultValue": 5
                },
                "nullColor": {
                    "defaultValue": "#E0E0E0"
                }
            }
        },
        {
            "feed": "dataFrame",
            "properties": {
                "domain": {
                    "defaultValue": []
                }
            }
        }
    ],
    "time_bubble": [
        {
            "feed": "valueAxis",
            "properties": {
                "type": {
                    "defaultValue": "linear"
                },
                "min": {
                    "defaultValue": "auto"
                },
                "max": {
                    "defaultValue": "auto"
                }
            }
        },
        {
            "feed": "valueAxis2",
            "properties": {
                "type": {
                    "defaultValue": "linear"
                },
                "min": {
                    "defaultValue": "auto"
                },
                "max": {
                    "defaultValue": "auto"
                }
            }
        },
        {
            "feed": "color",
            "properties": {
                "palette": {
                    "defaultValue": [
                        "#748CB2",
                        "#9CC677",
                        "#EACF5E",
                        "#F9AD79",
                        "#D16A7C",
                        "#8873A2",
                        "#3A95B3",
                        "#B6D949",
                        "#FDD36C",
                        "#F47958",
                        "#A65084",
                        "#0063B1",
                        "#0DA841",
                        "#FCB71D",
                        "#F05620",
                        "#B22D6E",
                        "#3C368E",
                        "#8FB2CF",
                        "#95D4AB",
                        "#EAE98F",
                        "#F9BE92",
                        "#EC9A99",
                        "#BC98BD",
                        "#1EB7B2",
                        "#73C03C",
                        "#F48323",
                        "#EB271B",
                        "#D9B5CA",
                        "#AED1DA",
                        "#DFECB2",
                        "#FCDAB0",
                        "#F5BCB4"
                    ]
                }
            }
        },
        {
            "feed": "shape",
            "properties": {
                "palette": {
                    "defaultValue": [
                        "circle",
                        "square",
                        "diamond",
                        "triangleUp",
                        "triangleDown",
                        "triangleLeft",
                        "triangleRight",
                        "cross",
                        "intersection"
                    ]
                }
            }
        },
        {
            "feed": "dataFrame",
            "properties": {
                "domain": {
                    "defaultValue": []
                }
            }
        }
    ],
    "bullet": [
        {
            "feed": "actualValues",
            "properties": {
                "type": {
                    "defaultValue": "linear"
                },
                "min": {
                    "defaultValue": "auto"
                },
                "max": {
                    "defaultValue": "auto"
                }
            }
        }
    ],
    "vertical_bullet": [
        {
            "feed": "actualValues",
            "properties": {
                "type": {
                    "defaultValue": "linear"
                },
                "min": {
                    "defaultValue": "auto"
                },
                "max": {
                    "defaultValue": "auto"
                }
            }
        }
    ],
    "dual_combination": [
        {
            "feed": "valueAxis",
            "properties": {
                "min": {
                    "defaultValue": "auto"
                },
                "max": {
                    "defaultValue": "auto"
                },
                "type": {
                    "defaultValue": "linear"
                }
            }
        },
        {
            "feed": "valueAxis2",
            "properties": {
                "min": {
                    "defaultValue": "auto"
                },
                "max": {
                    "defaultValue": "auto"
                },
                "type": {
                    "defaultValue": "linear"
                }
            }
        },
        {
            "feed": "color",
            "properties": {
                "palette": {
                    "defaultValue": [
                        [
                            "#8FBADD",
                            "#B8D4E9",
                            "#7AAED6",
                            "#A3C7E3",
                            "#3D88C4",
                            "#66A1D0",
                            "#297CBE",
                            "#5295CA",
                            "#005BA3",
                            "#146FB7",
                            "#005395",
                            "#0063B1"
                        ],
                        [
                            "#F6A09B",
                            "#F9C3C0",
                            "#F58E88",
                            "#F8B1AD",
                            "#F05B52",
                            "#F37D76",
                            "#EE4A40",
                            "#F16C64",
                            "#D92419",
                            "#ED382D",
                            "#C52117",
                            "#EB271B"
                        ]
                    ]
                }
            }
        },
        {
            "feed": "dataFrame",
            "properties": {
                "domain": {
                    "defaultValue": []
                }
            }
        }
    ],
    "dual_stacked_combination": [
        {
            "feed": "valueAxis",
            "properties": {
                "min": {
                    "defaultValue": "auto"
                },
                "max": {
                    "defaultValue": "auto"
                },
                "type": {
                    "defaultValue": "linear"
                }
            }
        },
        {
            "feed": "valueAxis2",
            "properties": {
                "min": {
                    "defaultValue": "auto"
                },
                "max": {
                    "defaultValue": "auto"
                },
                "type": {
                    "defaultValue": "linear"
                }
            }
        },
        {
            "feed": "color",
            "properties": {
                "palette": {
                    "defaultValue": [
                        [
                            "#8FBADD",
                            "#B8D4E9",
                            "#7AAED6",
                            "#A3C7E3",
                            "#3D88C4",
                            "#66A1D0",
                            "#297CBE",
                            "#5295CA",
                            "#005BA3",
                            "#146FB7",
                            "#005395",
                            "#0063B1"
                        ],
                        [
                            "#F6A09B",
                            "#F9C3C0",
                            "#F58E88",
                            "#F8B1AD",
                            "#F05B52",
                            "#F37D76",
                            "#EE4A40",
                            "#F16C64",
                            "#D92419",
                            "#ED382D",
                            "#C52117",
                            "#EB271B"
                        ]
                    ]
                }
            }
        },
        {
            "feed": "dataFrame",
            "properties": {
                "domain": {
                    "defaultValue": []
                }
            }
        }
    ],
    "dual_horizontal_combination": [
        {
            "feed": "valueAxis",
            "properties": {
                "min": {
                    "defaultValue": "auto"
                },
                "max": {
                    "defaultValue": "auto"
                },
                "type": {
                    "defaultValue": "linear"
                }
            }
        },
        {
            "feed": "valueAxis2",
            "properties": {
                "min": {
                    "defaultValue": "auto"
                },
                "max": {
                    "defaultValue": "auto"
                },
                "type": {
                    "defaultValue": "linear"
                }
            }
        },
        {
            "feed": "color",
            "properties": {
                "palette": {
                    "defaultValue": [
                        [
                            "#8FBADD",
                            "#B8D4E9",
                            "#7AAED6",
                            "#A3C7E3",
                            "#3D88C4",
                            "#66A1D0",
                            "#297CBE",
                            "#5295CA",
                            "#005BA3",
                            "#146FB7",
                            "#005395",
                            "#0063B1"
                        ],
                        [
                            "#F6A09B",
                            "#F9C3C0",
                            "#F58E88",
                            "#F8B1AD",
                            "#F05B52",
                            "#F37D76",
                            "#EE4A40",
                            "#F16C64",
                            "#D92419",
                            "#ED382D",
                            "#C52117",
                            "#EB271B"
                        ]
                    ]
                }
            }
        },
        {
            "feed": "dataFrame",
            "properties": {
                "domain": {
                    "defaultValue": []
                }
            }
        }
    ],
    "dual_horizontal_stacked_combination": [
        {
            "feed": "valueAxis",
            "properties": {
                "min": {
                    "defaultValue": "auto"
                },
                "max": {
                    "defaultValue": "auto"
                },
                "type": {
                    "defaultValue": "linear"
                }
            }
        },
        {
            "feed": "valueAxis2",
            "properties": {
                "min": {
                    "defaultValue": "auto"
                },
                "max": {
                    "defaultValue": "auto"
                },
                "type": {
                    "defaultValue": "linear"
                }
            }
        },
        {
            "feed": "color",
            "properties": {
                "palette": {
                    "defaultValue": [
                        [
                            "#8FBADD",
                            "#B8D4E9",
                            "#7AAED6",
                            "#A3C7E3",
                            "#3D88C4",
                            "#66A1D0",
                            "#297CBE",
                            "#5295CA",
                            "#005BA3",
                            "#146FB7",
                            "#005395",
                            "#0063B1"
                        ],
                        [
                            "#F6A09B",
                            "#F9C3C0",
                            "#F58E88",
                            "#F8B1AD",
                            "#F05B52",
                            "#F37D76",
                            "#EE4A40",
                            "#F16C64",
                            "#D92419",
                            "#ED382D",
                            "#C52117",
                            "#EB271B"
                        ]
                    ]
                }
            }
        },
        {
            "feed": "dataFrame",
            "properties": {
                "domain": {
                    "defaultValue": []
                }
            }
        }
    ],
    "timeseries_line": [
        {
            "feed": "valueAxis",
            "properties": {
                "type": {
                    "defaultValue": "linear"
                },
                "min": {
                    "defaultValue": "auto"
                },
                "max": {
                    "defaultValue": "auto"
                }
            }
        },
        {
            "feed": "color",
            "properties": {
                "palette": {
                    "defaultValue": [
                        "#748CB2",
                        "#9CC677",
                        "#EACF5E",
                        "#F9AD79",
                        "#D16A7C",
                        "#8873A2",
                        "#3A95B3",
                        "#B6D949",
                        "#FDD36C",
                        "#F47958",
                        "#A65084",
                        "#0063B1",
                        "#0DA841",
                        "#FCB71D",
                        "#F05620",
                        "#B22D6E",
                        "#3C368E",
                        "#8FB2CF",
                        "#95D4AB",
                        "#EAE98F",
                        "#F9BE92",
                        "#EC9A99",
                        "#BC98BD",
                        "#1EB7B2",
                        "#73C03C",
                        "#F48323",
                        "#EB271B",
                        "#D9B5CA",
                        "#AED1DA",
                        "#DFECB2",
                        "#FCDAB0",
                        "#F5BCB4"
                    ]
                }
            }
        },
        {
            "feed": "timeAxis",
            "properties": {
                "start": {
                    "defaultValue": "auto"
                },
                "end": {
                    "defaultValue": "auto"
                }
            }
        }
    ],
    "timeseries_scatter": [
        {
            "feed": "valueAxis",
            "properties": {
                "type": {
                    "defaultValue": "linear"
                },
                "min": {
                    "defaultValue": "auto"
                },
                "max": {
                    "defaultValue": "auto"
                }
            }
        },
        {
            "feed": "color",
            "properties": {
                "palette": {
                    "defaultValue": [
                        "#748CB2",
                        "#9CC677",
                        "#EACF5E",
                        "#F9AD79",
                        "#D16A7C",
                        "#8873A2",
                        "#3A95B3",
                        "#B6D949",
                        "#FDD36C",
                        "#F47958",
                        "#A65084",
                        "#0063B1",
                        "#0DA841",
                        "#FCB71D",
                        "#F05620",
                        "#B22D6E",
                        "#3C368E",
                        "#8FB2CF",
                        "#95D4AB",
                        "#EAE98F",
                        "#F9BE92",
                        "#EC9A99",
                        "#BC98BD",
                        "#1EB7B2",
                        "#73C03C",
                        "#F48323",
                        "#EB271B",
                        "#D9B5CA",
                        "#AED1DA",
                        "#DFECB2",
                        "#FCDAB0",
                        "#F5BCB4"
                    ]
                }
            }
        },
        {
            "feed": "timeAxis",
            "properties": {
                "start": {
                    "defaultValue": "auto"
                },
                "end": {
                    "defaultValue": "auto"
                }
            }
        },
        {
            "feed": "shape",
            "properties": {
                "palette": {
                    "defaultValue": [
                        "circle",
                        "square",
                        "diamond",
                        "triangleUp",
                        "triangleDown",
                        "triangleLeft",
                        "triangleRight",
                        "cross",
                        "intersection"
                    ]
                }
            }
        }
    ],
    "timeseries_bubble": [
        {
            "feed": "valueAxis",
            "properties": {
                "type": {
                    "defaultValue": "linear"
                },
                "min": {
                    "defaultValue": "auto"
                },
                "max": {
                    "defaultValue": "auto"
                }
            }
        },
        {
            "feed": "color",
            "properties": {
                "palette": {
                    "defaultValue": [
                        "#748CB2",
                        "#9CC677",
                        "#EACF5E",
                        "#F9AD79",
                        "#D16A7C",
                        "#8873A2",
                        "#3A95B3",
                        "#B6D949",
                        "#FDD36C",
                        "#F47958",
                        "#A65084",
                        "#0063B1",
                        "#0DA841",
                        "#FCB71D",
                        "#F05620",
                        "#B22D6E",
                        "#3C368E",
                        "#8FB2CF",
                        "#95D4AB",
                        "#EAE98F",
                        "#F9BE92",
                        "#EC9A99",
                        "#BC98BD",
                        "#1EB7B2",
                        "#73C03C",
                        "#F48323",
                        "#EB271B",
                        "#D9B5CA",
                        "#AED1DA",
                        "#DFECB2",
                        "#FCDAB0",
                        "#F5BCB4"
                    ]
                }
            }
        },
        {
            "feed": "timeAxis",
            "properties": {
                "start": {
                    "defaultValue": "auto"
                },
                "end": {
                    "defaultValue": "auto"
                }
            }
        },
        {
            "feed": "shape",
            "properties": {
                "palette": {
                    "defaultValue": [
                        "circle",
                        "square",
                        "diamond",
                        "triangleUp",
                        "triangleDown",
                        "triangleLeft",
                        "triangleRight",
                        "cross",
                        "intersection"
                    ]
                }
            }
        }
    ],
    "waterfall": [
        {
            "feed": "valueAxis",
            "properties": {
                "min": {
                    "defaultValue": "auto"
                },
                "max": {
                    "defaultValue": "auto"
                },
                "type": {
                    "defaultValue": "linear"
                }
            }
        },
        {
            "feed": "waterfallType",
            "properties": {}
        }
    ],
    "horizontal_waterfall": [
        {
            "feed": "valueAxis",
            "properties": {
                "min": {
                    "defaultValue": "auto"
                },
                "max": {
                    "defaultValue": "auto"
                },
                "type": {
                    "defaultValue": "linear"
                }
            }
        },
        {
            "feed": "waterfallType",
            "properties": {}
        }
    ],
    "stacked_waterfall": [
        {
            "feed": "valueAxis",
            "properties": {
                "min": {
                    "defaultValue": "auto"
                },
                "max": {
                    "defaultValue": "auto"
                },
                "type": {
                    "defaultValue": "linear"
                }
            }
        },
        {
            "feed": "waterfallType",
            "properties": {}
        },
        {
            "feed": "color",
            "properties": {
                "palette": {
                    "defaultValue": [
                        "#748CB2",
                        "#9CC677",
                        "#EACF5E",
                        "#F9AD79",
                        "#D16A7C",
                        "#8873A2",
                        "#3A95B3",
                        "#B6D949",
                        "#FDD36C",
                        "#F47958",
                        "#A65084",
                        "#0063B1",
                        "#0DA841",
                        "#FCB71D",
                        "#F05620",
                        "#B22D6E",
                        "#3C368E",
                        "#8FB2CF",
                        "#95D4AB",
                        "#EAE98F",
                        "#F9BE92",
                        "#EC9A99",
                        "#BC98BD",
                        "#1EB7B2",
                        "#73C03C",
                        "#F48323",
                        "#EB271B",
                        "#D9B5CA",
                        "#AED1DA",
                        "#DFECB2",
                        "#FCDAB0",
                        "#F5BCB4"
                    ]
                }
            }
        }
    ],
    "horizontal_stacked_waterfall": [
        {
            "feed": "valueAxis",
            "properties": {
                "min": {
                    "defaultValue": "auto"
                },
                "max": {
                    "defaultValue": "auto"
                },
                "type": {
                    "defaultValue": "linear"
                }
            }
        },
        {
            "feed": "waterfallType",
            "properties": {}
        },
        {
            "feed": "color",
            "properties": {
                "palette": {
                    "defaultValue": [
                        "#748CB2",
                        "#9CC677",
                        "#EACF5E",
                        "#F9AD79",
                        "#D16A7C",
                        "#8873A2",
                        "#3A95B3",
                        "#B6D949",
                        "#FDD36C",
                        "#F47958",
                        "#A65084",
                        "#0063B1",
                        "#0DA841",
                        "#FCB71D",
                        "#F05620",
                        "#B22D6E",
                        "#3C368E",
                        "#8FB2CF",
                        "#95D4AB",
                        "#EAE98F",
                        "#F9BE92",
                        "#EC9A99",
                        "#BC98BD",
                        "#1EB7B2",
                        "#73C03C",
                        "#F48323",
                        "#EB271B",
                        "#D9B5CA",
                        "#AED1DA",
                        "#DFECB2",
                        "#FCDAB0",
                        "#F5BCB4"
                    ]
                }
            }
        }
    ],
    "radar": [
        {
            "feed": "valueAxis",
            "properties": {
                "min": {
                    "defaultValue": "auto"
                },
                "max": {
                    "defaultValue": "auto"
                },
                "type": {
                    "defaultValue": "linear"
                }
            }
        },
        {
            "feed": "color",
            "properties": {
                "palette": {
                    "defaultValue": [
                        "#748CB2",
                        "#9CC677",
                        "#EACF5E",
                        "#F9AD79",
                        "#D16A7C",
                        "#8873A2",
                        "#3A95B3",
                        "#B6D949",
                        "#FDD36C",
                        "#F47958",
                        "#A65084",
                        "#0063B1",
                        "#0DA841",
                        "#FCB71D",
                        "#F05620",
                        "#B22D6E",
                        "#3C368E",
                        "#8FB2CF",
                        "#95D4AB",
                        "#EAE98F",
                        "#F9BE92",
                        "#EC9A99",
                        "#BC98BD",
                        "#1EB7B2",
                        "#73C03C",
                        "#F48323",
                        "#EB271B",
                        "#D9B5CA",
                        "#AED1DA",
                        "#DFECB2",
                        "#FCDAB0",
                        "#F5BCB4"
                    ]
                }
            }
        },
        {
            "feed": "dataFrame",
            "properties": {
                "domain": {
                    "defaultValue": []
                }
            }
        }
    ],
    "trellis_radar": [
        {
            "feed": "valueAxis",
            "properties": {
                "min": {
                    "defaultValue": "auto"
                },
                "max": {
                    "defaultValue": "auto"
                },
                "type": {
                    "defaultValue": "linear"
                }
            }
        },
        {
            "feed": "color",
            "properties": {
                "palette": {
                    "defaultValue": [
                        "#748CB2",
                        "#9CC677",
                        "#EACF5E",
                        "#F9AD79",
                        "#D16A7C",
                        "#8873A2",
                        "#3A95B3",
                        "#B6D949",
                        "#FDD36C",
                        "#F47958",
                        "#A65084",
                        "#0063B1",
                        "#0DA841",
                        "#FCB71D",
                        "#F05620",
                        "#B22D6E",
                        "#3C368E",
                        "#8FB2CF",
                        "#95D4AB",
                        "#EAE98F",
                        "#F9BE92",
                        "#EC9A99",
                        "#BC98BD",
                        "#1EB7B2",
                        "#73C03C",
                        "#F48323",
                        "#EB271B",
                        "#D9B5CA",
                        "#AED1DA",
                        "#DFECB2",
                        "#FCDAB0",
                        "#F5BCB4"
                    ]
                }
            }
        }
    ]
};
});
define('sap/viz/chart/metadata/metadata',[
    "sap/viz/chart/metadata/bindingDef",
    "sap/viz/chart/metadata/properties/metadata",
    "scaleDefs",
    'sap/viz/framework/common/lang/LangManager',
    "sap/viz/framework/core/ChartViewRegistry",
    "sap/viz/framework/common/util/ObjectUtils"
], function Setup(bindingDef, propertyMetadata, allChartTypeScales, LangManager, ChartViewRegistry, ObjectUtils) {
    var cutOffCharType = function(type) {
        if (type.search("info/") != -1) {
            var cutOffType = type.slice(5);
            return cutOffType;
        } else {
            return type;
        }
    };

    //flatten scales, remove node properties.
    var flattenScale = function(chartScales) {
        var returnScales = [];
        var i = 0;
        if (chartScales) {
            for (i = 0; i < chartScales.length; ++i) {
                var scales = chartScales[i];
                returnScales[i] = {};
                for (var items in scales) {
                    if (scales.hasOwnProperty(items)) {
                        returnScales[i][items] = scales[items];
                    }
                }
                if (returnScales[i].hasOwnProperty("properties")) {
                    delete returnScales[i].properties;
                    for (var propItem in scales.properties) {
                        if (scales.properties.hasOwnProperty(propItem)) {
                            returnScales[i][propItem] = scales.properties[propItem];
                        }
                    }
                }
            }
        }
        return returnScales;
    };

    var deleteName = function(binding) {
        if(!binding){
            return;
        }
        var data = ObjectUtils.clone(binding);
        for (var i = 0; i < data.length; i++) {
            delete data[i].name;
        }
        return data;
    };

    var adjustMeta = function(metadata){
        var cutType = cutOffCharType(metadata.type);
        if(metadata.isBuiltIn) {
            metadata.bindings = deleteName(metadata.bindings);
        }
        metadata.properties = propertyMetadata.get(metadata.type);
        metadata.scales = flattenScale(allChartTypeScales[cutType]); 
        if(bindingDef[metadata.type] && bindingDef[metadata.type].name){
            metadata.name = LangManager.get(bindingDef[metadata.type].name)||metadata.name;
        }

        return metadata;
    };

    var BaseMetadata = {
        get: function(chartType) {
            var metadata = ChartViewRegistry.getMetadata(chartType);
            if(metadata){
                return adjustMeta(metadata);
            }
            return metadata;
            
        },

        getAll: function() {
            var metadata = ChartViewRegistry.getAllMetadata();

            for (var i in metadata) {
                if (metadata.hasOwnProperty(i)) {
                    adjustMeta(metadata[i]);
                }
            }
            return metadata;
        }
    };

    return BaseMetadata;
});
define('sap/viz/api/metadata/Viz',['sap/viz/chart/metadata/metadata', 'exports'], function Setup(metadataObj, scaleUtil) {

    var metadata =
        /**
         * sap.viz.api.metadata.Viz
         * @namespace sap.viz.api.metadata.Viz
         */
        {


            /**
             * @function get
             * @memberof sap.viz.api.metadata.Viz
             * @static
             * @param {String} [id]
             *                        Returns viz metadata that is associated with the id. If the id is not defined,
              returns all the vizs' metadata.
             * @return {[sap.viz.api.metadata.VizMetadata]} viz metadata, this is a read only object
             *
             * @example <caption>Sample Code:</caption>
             * var viz = sap.viz.api.metadata.Viz.get('info/column'); //Get specified viz by id; returns an array which
              contains one viz object
             * viz manifest returned:
             * {
             *     "type": String, chart type, for info/column is info/column.
             *     "family": String, chart family, for info/column is xy.
             *     "renderType": String,  rendering type, for info/column is column.
             *     "vender": String,  Ddependencies between modules.
             *     "bindings": Array,  get all binding defintion for the chart.
             *     "scales": Array,  get all scale defintion with default scale properties for the chart.
             *     "properties": Object, get all properties of the viz including default and customer setting.
             * }
             *
             */
            get: function(chartType) {
                if (arguments.length) {
                    var getBaseMetadata = metadataObj.get(chartType);
                    return getBaseMetadata;

                } else {
                    var allMetadata = metadataObj.getAll();
                    return allMetadata;

                }

            }
        };


    return metadata;
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
try {
    var ChartViewRegistry = require("sap/viz/framework/core/ChartViewRegistry");
    
    if (ChartViewRegistry && ChartViewRegistry.registerAll) {
        ChartViewRegistry.registerAll();
    }
} catch(e) {}

if (window.__sap_viz_internal_requirejs_nextTick__ !== undefined) {
    if (requirejs && requirejs.s && requirejs.s.contexts && requirejs.s.contexts._) {
        requirejs.s.contexts._.nextTick = window.__sap_viz_internal_requirejs_nextTick__;
        if (requirejs.s.contexts._.definedTmp) {
            for (var i in requirejs.s.contexts._.defined) {
                if (requirejs.s.contexts._.defined.hasOwnProperty(i) && requirejs.s.contexts._.definedTmp.hasOwnProperty(i)) {
                    requirejs.s.contexts._.defined[i + '/v3'] = requirejs.s.contexts._.defined[i];
                    delete requirejs.s.contexts._.defined[i];
                }
            }
            for (var i in requirejs.s.contexts._.definedTmp) {
                if (requirejs.s.contexts._.definedTmp.hasOwnProperty(i)) {
                    requirejs.s.contexts._.defined[i] = requirejs.s.contexts._.definedTmp[i];
                }
            }
            requirejs.s.contexts._.definedTmp = undefined;
        }
    }
    window.__sap_viz_internal_requirejs_nextTick__ = undefined;
}