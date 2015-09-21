/* SAP CVOM 4.0 © <2012-2014> SAP SE. All rights reserved. Build Version 5.20.0, Build Context N/A *//** vim: et:ts=4:sw=4:sts=4
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
sap.viz.extapi.env.Language.register({id:'language',value: {IDS_ERROR_NOT_DETERMINE_AXIS_INDEX:"Could not determine measure value axis index",IDS_ERROR_WRONG_MEASURE_AXIS_INDEX:"The measure axis index in the feed definition {0} is incorrect.",IDS_ERROR_WRONG_TYPE:"Data type is incorrect.",IDS_ERROR_FLATTABLE_MANNUAL_FEED_WRONG_BINDING:"Field IDs in manual feeding are missing or are not in array format.",IDS_ERROR_NOT_CHILD_NODE_INSERT:"The node to be inserted is not a child of this node.",IDS_ERROR_DIMENSION_NOT_ZERO:"Length of dimension cannot be zero.",IDS_ERROR_NOT_ACCEPT:"Could not accept {0}",IDS_ERROR_NOT_SUPPORTED:"Not supported",IDS_ERROR_WRONG_VALUES_COUNT_IN_AA2:"The values count {0} in the second analysis axis (aa2) should be {1}.",IDS_ERROR_DIMENSION_NOT_FOUND:"dimension index {0} not found",IDS_ERROR_NOT_DETERMINE_DEMENSION:"Cannot determine the dimension after transform is applied",IDS_ERROR_NOT_MEET_NUMBER_OF_FEED:"{0} : does not meet the minimum or maximum number of feeds definition.",IDS_ERROR_WRONG_VALUES_COUNT_IN_AA1:"The values count {0} in the first analysis axis (aa1) should be {1}.",IDS_ERROR_UNKNOWN_STATE:"Unknown state",IDS_ERROR_CATEGORY_NAME_NOT_EMPTY:"The category name must be a non-empty string.",IDS_ERROR_NOT_CREATE_CHAIN_FOR_NON_FUNCTION_OBJECT:"Could not create a call chain for a non-function object.",IDS_ERROR_NO_FEED_ID:"Invalid feeding: no feed ID",IDS_FEED:"feed",IDS_ERROR_NOT_REGISTER_WITHOUT_VALID_ID:"Cannot register without a valid ID.",IDS_ERROR_FLATTABLE_FEED_DEF_FIELD_INDEX_MISSING:"The field index in feed definition {0} is missing.",IDS_ERROR_DIMENSION_WRONG_COUNT:"{0} is an incorrect dimension count.",IDS_ERROR_NODE_DIV_IN_SVG:"Cannot add <div> tag under <svg> tag.",IDS_ERROR_INVALID_FEEDING:"Invalid feeding: the feed {0} has exceeded the maximum stacked dimension number.",IDS_ERROR_INVALID_PATH_DEFINITION:"Invalid path definition: {0}.",IDS_ERROR_NOT_FIND_FEED_DEFINITION:"Could not find the feed definition of {0}.",IDS_ERROR_NODE_IS_NOT_CHILD_OF_THIS_NODE:"Node is not a child of this node",IDS_ERROR_DIMENSIONS_INCOMPLETE_BINDING:"Incomplete dimensions binding.",IDS_ERROR_NOT_ACCEPT_2_OR_MORE_AXES:"Could not accept more than 2 axes",IDS_ERROR_DIMENSIONS_OR_MEASURES_DUPLICATED_BINDING:"The dimensions/measures binding is duplicated.",IDS_ERROR_CUSTOMIZATION_ID:"Customization {0} does not exist for chart type {1}.",IDS_ERROR_AXIS_INDEX_SHOULD_BE_1_OR_2:"Axis index should be 1 or 2",IDS_ERROR_WRONG_FEED_TYPE:"The feed type of {0} is incorrect.",IDS_ERROR_CATEGORY_FACTORY_MUST_BE_FUNCTION:"The category factory must be a function.",IDS_ERROR_NEED_SPECIFY_OPTIONS_TO_INITIALIZE:"You must specify the chart or component options to initialize.",IDS_ERROR_NOT_INITIALIZE_WITHOUT_UICONTROLLER:"Cannot initialize without a root UIController <DIV>.",IDS_ERROR_CAN_NOT_FIND_CATEGORY:"Cannot find {0} in category {1}.",IDS_ERROR_CHART_TYPE_FOR_CUSTOMIZATION:"Chart type {0} does not support customization API. ",IDS_WARN_PARAMETER_NOT_CORRECT:"Input parameter is not correct.",IDS_ERROR_NOT_REGISTER_UNDEFINED_OBJECT:"Cannot register a undefined object.",IDS_ERROR_WRONG_AXIS_INDEX:"The analysis axis index in the feed definition {0} is incorrect.",IDS_ERROR_WRONG_FEED_TYPE_IN_DEFINTION:"The feed type in the feed definition {0} is incorrect.",IDS_WRONG_EXTENSIONVERSION:"Extension is not supported by current SDK version.",IDS_ALREADY_EXISTS:"{0} already exists",IDS_ERROR_NOT_FIND_JQUERY:"Cannot find 'jQuery' library",IDS_ERROR_NEED_SPECIFY_HOLDER_FOR_VISUALIZATION:"The target <DIV> is not specified for rendering the visualization.",IDS_ERROR_EXIST_CATEGORY_NAME:"A category named {0} already exists.",IDS_ERROR_UNKNOWN_ERROR:"Unknown error.",IDS_ERROR_BUNDLE_VERSION_DOES_NOT_MATCH:"Failed to initialize [{0}], which requires a version equal to or greater than {1}. The current version is {2}.",IDS_ERROR_AXIS_ALREADY_EXIST:"Axis {0} already exists.",IDS_ERROR_DIMENSION_WRONG_LABELS_COUNT:"{0} is an incorrect dimension labels count.",IDS_ERROR_INVALID_FEEDING_NUMBER:"Invalid feeding: the correct number  is {0} feed.",IDS_ERROR_LOADING_TEMPLATE_FAIL:"Loading template {0} failed.",IDS_ERROR_PARSE_ERROR_EXPECT_TO:"An error occurred when parsing {0}; it should be: {1}.",IDS_ERROR_FEED_NOT_ACCEPT_DATA:"Feed {0} could not accept more data containers.",IDS_WRONG_MISSINGEXTENSIONMETADATA:"Extension metadata is incomplete.",IDS_ERROR_NO_AXIS:"Could not find axis {0} in the dataset {1} feed.",IDS_ERROR_NEED_PROVIDE_CONTAINER_FOR_FRAME:"You must provide a container <DIV> for the visualization.",IDS_ERROR_FLATTABLE_INVALID_DATA_PARAM:"Invalid parameter, parameter must have metadata and data.",IDS_ERROR_ALREADY_EXIST_IN_CATEGORY:"There is already an item named {0} in category {1}.",IDS_WARN_LOCALE_NOT_CORRECT:"Input locale is not correct.",IDS_ERROR_NOT_ADD_SELF_AS_CHILD:"An ID cannot add itself as a child.",IDS_ERROR_NODE_NOT_IN_SAME_ROOT:"Node is not in the same root.",IDS_ERROR_NOT_ADD_ANCESTOR_AS_CHILD:"Cannot add ancestor as a child",IDS_ERROR_INVALID_BINDING:"Invalid data binding",IDS_ERROR_NOT_FIND_MEASURE_GROUP:"Could not find measure values group {0} in the dataset {1} feed.",IDS_ERROR_SDK_VERSION_DOES_NOT_MATCH:"[{0}] requires sap.viz.api's version is equal to or greater than {1}; While the current version of sap.viz.api is {2}.",IDS_ERROR_SELECTOR_NOT_NULL:"Selector string cannot be null.",}});sap.viz.extapi.env.Language.register({id:'language',value: {IDS_HICHERTSTACKEDVERTICALBARCHART:"Hichert Stacked Column Chart",IDS_HICHERTSTACKEDBARCHART:"Hichert Stacked Bar Chart",IDS_HICHERTVERTICALBARCHART:"Hichert Column Chart",IDS_HICHERTBARCHART:"Hichert Bar Chart",IDS_HICHERTLINECHART:"Hichert Line Chart",IDS_HICHERTVARIANCELINECHART:"Hichert Variance Line Chart",IDS_PATTERN:"Pattern",}});
define('propertyDefs_Hichert',[], function(){
return {
    "": {
        "categoryAxis.axisLine.visible": true,
        "categoryAxis.color": "#6c6c6c",
        "categoryAxis.hoverShadow.color": "#cccccc",
        "categoryAxis.label.angle": {
            "defaultValue": 90,
            "readonly": true,
            "serializable": false
        },
        "categoryAxis.label.rotation": {
            "defaultValue": "auto",
            "readonly": true,
            "serializable": false
        },
        "categoryAxis.label.style.color": "#333333",
        "categoryAxis.label.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "categoryAxis.label.style.fontSize": "12px",
        "categoryAxis.label.style.fontStyle": "normal",
        "categoryAxis.label.style.fontWeight": "normal",
        "categoryAxis.label.truncatedLabelRatio": {
            "defaultValue": 0.2,
            "readonly": true,
            "serializable": false
        },
        "categoryAxis.label.visible": true,
        "categoryAxis.layout.height": null,
        "categoryAxis.layout.maxHeight": 0.3,
        "categoryAxis.layout.maxWidth": 0.3,
        "categoryAxis.layout.width": null,
        "categoryAxis.title.applyAxislineColor": false,
        "categoryAxis.title.style.color": "#000000",
        "categoryAxis.title.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "categoryAxis.title.style.fontSize": "14px",
        "categoryAxis.title.style.fontStyle": "normal",
        "categoryAxis.title.style.fontWeight": "bold",
        "categoryAxis.title.text": null,
        "categoryAxis.title.visible": false,
        "categoryAxis.visible": true,
        "embeddedLegend.hoverShadow.color": "#cccccc",
        "embeddedLegend.label.style.color": "#000000",
        "embeddedLegend.label.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "embeddedLegend.label.style.fontSize": "12px",
        "embeddedLegend.label.style.fontStyle": "normal",
        "embeddedLegend.label.style.fontWeight": "bold",
        "embeddedLegend.mouseDownShadow.color": "#808080",
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
        "general.groupData": false,
        "general.layout.padding": 24,
        "general.layout.paddingBottom": null,
        "general.layout.paddingLeft": null,
        "general.layout.paddingRight": null,
        "general.layout.paddingTop": null,
        "interaction.behaviorType": "hichertBehavior",
        "interaction.decorations": {
            "defaultValue": null,
            "serializable": false
        },
        "interaction.deselected.opacity": 0.2,
        "interaction.hover.opacity": 1,
        "interaction.hover.stroke.color": "#3FA9F5",
        "interaction.hover.stroke.visible": true,
        "interaction.hover.stroke.width": "2px",
        "interaction.noninteractiveMode": false,
        "interaction.selectability.axisLabelSelection": true,
        "interaction.selectability.legendSelection": true,
        "interaction.selectability.mode": "INCLUSIVE",
        "interaction.selectability.plotLassoSelection": true,
        "interaction.selectability.plotStdSelection": true,
        "interaction.selected.stroke.color": "#3FA9F5",
        "interaction.selected.stroke.visible": true,
        "interaction.selected.stroke.width": "2px",
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
        "legend.mouseDownShadow.color": "#808080",
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
        "legend.visible": false,
        "legendGroup.forceToShow": false,
        "legendGroup.layout.alignment": "topLeft",
        "legendGroup.layout.height": null,
        "legendGroup.layout.maxHeight": 0.25,
        "legendGroup.layout.maxWidth": 0.25,
        "legendGroup.layout.position": "right",
        "legendGroup.layout.respectPlotPosition": true,
        "legendGroup.layout.width": null,
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
        "plotArea.dataLabel.background.opacity": 0.8,
        "plotArea.dataLabel.formatString": null,
        "plotArea.dataLabel.hideWhenOverlap": true,
        "plotArea.dataLabel.position": "outsideFirst",
        "plotArea.dataLabel.style.color": null,
        "plotArea.dataLabel.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "plotArea.dataLabel.style.fontSize": "12px",
        "plotArea.dataLabel.style.fontStyle": "normal",
        "plotArea.dataLabel.style.fontWeight": "normal",
        "plotArea.dataLabel.unitFormatType": "FinancialUnits",
        "plotArea.dataLabel.visible": true,
        "plotArea.dataPoint.stroke.color": "#000000",
        "plotArea.dataPoint.stroke.visible": false,
        "plotArea.dataPointStyle": null,
        "plotArea.dataPointStyleMode": "override",
        "plotArea.defaultOthersStyle.color": "#000000",
        "plotArea.drawingEffect": "normal",
        "plotArea.gridline.color": "#d8d8d8",
        "plotArea.gridline.size": 1,
        "plotArea.gridline.type": "line",
        "plotArea.gridline.visible": false,
        "plotArea.gridline.zeroLine.color": null,
        "plotArea.gridline.zeroLine.highlight": true,
        "plotArea.gridline.zeroLine.unhighlightAxis": true,
        "plotArea.isFixedDataPointSize": false,
        "plotArea.referenceLine.defaultStyle.background.opacity": 0.5,
        "plotArea.referenceLine.defaultStyle.color": "#666666",
        "plotArea.referenceLine.defaultStyle.label.background": "#7a7a7a",
        "plotArea.referenceLine.defaultStyle.label.color": "#ffffff",
        "plotArea.referenceLine.defaultStyle.label.fontFamily": "\"Open Sans\", Arial, Helvetica, sans-serif",
        "plotArea.referenceLine.defaultStyle.label.fontSize": "12px",
        "plotArea.referenceLine.defaultStyle.label.fontStyle": "normal",
        "plotArea.referenceLine.defaultStyle.label.fontWeight": "normal",
        "plotArea.referenceLine.defaultStyle.label.opacity": 0.8,
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
        "title.alignment": "center",
        "title.layout.height": null,
        "title.layout.maxHeight": 0.2,
        "title.style.color": "#333333",
        "title.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "title.style.fontSize": "16px",
        "title.style.fontStyle": "normal",
        "title.style.fontWeight": "bold",
        "title.text": null,
        "title.visible": false,
        "tooltip.background.borderColor": "#cccccc",
        "tooltip.background.color": "#ffffff",
        "tooltip.formatString": null,
        "tooltip.layinChart": true,
        "tooltip.unitFormatType": "FinancialUnits",
        "tooltip.visible": false,
        "valueAxis.axisLine.size": 1,
        "valueAxis.axisLine.visible": false,
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
        "valueAxis.visible": false
    },
    "_bullet": {},
    "_dual": {},
    "_pie": {},
    "_scatter": {},
    "_trellis": {},
    "_xy": {},
    "_xySimple": {},
    "info/hichert_bar": {
        "embeddedLegend.layout.bottomHeight": null,
        "embeddedLegend.layout.topHeight": null,
        "legend.marker.shape": "squareWithRadius",
        "plotArea.dataPointSize.max": 96,
        "plotArea.dataPointSize.min": 20,
        "plotArea.differenceMarker.enable": false,
        "plotArea.gap.barSpacing": 1,
        "plotArea.gap.groupSpacing": 1,
        "plotArea.gap.innerGroupSpacing": 0.125,
        "plotArea.overlap.offsetPercentage": 0.5,
        "variance1.axisLine.color": "#ffffff",
        "variance1.axisLine.size": "1px",
        "variance1.axisLine.style": "solid",
        "variance1.layout.proportion": 0.25,
        "variance1.title.style.color": "#000000",
        "variance1.title.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "variance1.title.style.fontSize": "12px",
        "variance1.title.style.fontStyle": "normal",
        "variance1.title.style.fontWeight": "bold",
        "variance1.type": "absolute",
        "variance1.visible": true,
        "variance2.axisLine.color": "#ffffff",
        "variance2.axisLine.size": "1px",
        "variance2.axisLine.style": "solid",
        "variance2.layout.proportion": 0.25,
        "variance2.title.style.color": "#000000",
        "variance2.title.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "variance2.title.style.fontSize": "12px",
        "variance2.title.style.fontStyle": "normal",
        "variance2.title.style.fontWeight": "bold",
        "variance2.type": "percentage",
        "variance2.visible": true
    },
    "info/hichert_column": {
        "embeddedLegend.layout.leftMaxWidth": null,
        "embeddedLegend.layout.leftWidth": null,
        "embeddedLegend.layout.rightMaxWidth": null,
        "embeddedLegend.layout.rightWidth": null,
        "legend.marker.shape": "squareWithRadius",
        "plotArea.dataPointSize.max": 96,
        "plotArea.dataPointSize.min": 32,
        "plotArea.differenceMarker.enable": false,
        "plotArea.gap.barSpacing": 1,
        "plotArea.gap.groupSpacing": 1,
        "plotArea.gap.innerGroupSpacing": 0.125,
        "plotArea.overlap.offsetPercentage": 0.5,
        "variance1.axisLine.color": "#ffffff",
        "variance1.axisLine.size": "1px",
        "variance1.axisLine.style": "solid",
        "variance1.layout.proportion": 0.25,
        "variance1.title.style.color": "#000000",
        "variance1.title.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "variance1.title.style.fontSize": "12px",
        "variance1.title.style.fontStyle": "normal",
        "variance1.title.style.fontWeight": "bold",
        "variance1.type": "absolute",
        "variance1.visible": true,
        "variance2.axisLine.color": "#ffffff",
        "variance2.axisLine.size": "1px",
        "variance2.axisLine.style": "solid",
        "variance2.layout.proportion": 0.25,
        "variance2.title.style.color": "#000000",
        "variance2.title.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "variance2.title.style.fontSize": "12px",
        "variance2.title.style.fontStyle": "normal",
        "variance2.title.style.fontWeight": "bold",
        "variance2.type": "percentage",
        "variance2.visible": true
    },
    "info/hichert_line": {
        "embeddedLegend.layout.maxWidth": null,
        "embeddedLegend.layout.position": "right",
        "embeddedLegend.layout.width": null,
        "plotArea.dataLabel.position": null,
        "plotArea.lineVisible": true,
        "plotArea.marker.displayMode": "manual",
        "plotArea.marker.shape": "circle",
        "plotArea.marker.size": 10,
        "plotArea.marker.visible": true
    },
    "info/hichert_stacked_bar": {
        "embeddedLegend.layout.height": null,
        "embeddedLegend.layout.position": "top",
        "legend.marker.shape": "squareWithRadius",
        "plotArea.dataLabel.position": "outside",
        "plotArea.dataLabel.showTotal": true,
        "plotArea.dataPointSize.max": 96,
        "plotArea.dataPointSize.min": 20,
        "plotArea.gap.barSpacing": 1,
        "plotArea.gap.groupSpacing": 1,
        "plotArea.gap.innerGroupSpacing": 0.125
    },
    "info/hichert_stacked_column": {
        "embeddedLegend.layout.maxWidth": null,
        "embeddedLegend.layout.position": "right",
        "embeddedLegend.layout.width": null,
        "legend.marker.shape": "squareWithRadius",
        "plotArea.dataLabel.position": "outside",
        "plotArea.dataLabel.showTotal": true,
        "plotArea.dataPointSize.max": 96,
        "plotArea.dataPointSize.min": 32,
        "plotArea.gap.barSpacing": 1,
        "plotArea.gap.groupSpacing": 1,
        "plotArea.gap.innerGroupSpacing": 0.125
    },
    "info/hichert_variance_line": {
        "embeddedLegend.layout.leftMaxWidth": null,
        "embeddedLegend.layout.leftWidth": null,
        "embeddedLegend.layout.rightMaxWidth": null,
        "embeddedLegend.layout.rightWidth": null,
        "plotArea.dataLabel.position": null,
        "plotArea.lineVisible": true,
        "plotArea.marker.displayMode": "manual",
        "plotArea.marker.shape": "circle",
        "plotArea.marker.size": 10,
        "plotArea.marker.visible": true,
        "plotArea.overlap.offsetPercentage": 0.5,
        "variance1.axisLine.color": "#ffffff",
        "variance1.axisLine.size": "1px",
        "variance1.axisLine.style": "solid",
        "variance1.layout.proportion": 0.25,
        "variance1.title.style.color": "#000000",
        "variance1.title.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "variance1.title.style.fontSize": "12px",
        "variance1.title.style.fontStyle": "normal",
        "variance1.title.style.fontWeight": "bold",
        "variance1.type": "absolute",
        "variance1.visible": true,
        "variance2.axisLine.color": "#ffffff",
        "variance2.axisLine.size": "1px",
        "variance2.axisLine.style": "solid",
        "variance2.layout.proportion": 0.25,
        "variance2.title.style.color": "#000000",
        "variance2.title.style.fontFamily": "'Open Sans', Arial, Helvetica, sans-serif",
        "variance2.title.style.fontSize": "12px",
        "variance2.title.style.fontStyle": "normal",
        "variance2.title.style.fontWeight": "bold",
        "variance2.type": "percentage",
        "variance2.visible": true
    }
};
});
define('propertyDefs',['propertyDefs_Hichert'], function(){ return Array.prototype.slice.apply(arguments); });
define('sap/viz/hichert/components/datalabels/LineDataLabels',[
    'sap/viz/framework/common/util/oo',
    'sap/viz/framework/common/util/Constants',
    'sap/viz/chart/components/datalabels/DataLabels',
    "sap/viz/chart/components/util/ColorUtil",
    'sap/viz/framework/common/util/SVG',
    'sap/viz/framework/common/util/DOM',
    "sap/viz/chart/components/util/DataPointUtils",
    "sap/viz/framework/common/util/TypeUtils",
    "sap/viz/framework/common/util/DataGraphics",
    "sap/viz/framework/common/util/GeometryUtils"
], function(
    oo, 
    Constants, 
    DataLabels,
    ColorUtil,
    SVG,
    DOM,
    DataPointUtils,
    TypeUtils,
    DataGraphics,
    GeometryUtils
) {
    
    var DATA_LABEL_CLASS = Constants.CSS.CLASS.DATALABEL + " " + Constants.CSS.CLASS.MORPHABLELABEL,
        DATA_LABELS_GROUP_CLASS = Constants.CSS.CLASS.DATALABEL_GROUP,
        DATA_LABELS_GROUP_TAG = "g";
    
    function defaultRenderer(config) {
        var text = SVG.create("text");
        text.textContent = config.text;
        return text;
    }
    
    function getDataLabelInfo(parentNodeDOM, lblNode, dpNode, translate, dataLabelInfo) {
        var x = translate[0],
            y = translate[1];
        var ctm = dpNode.getTransformToElement(parentNodeDOM);
        var referColor = getReferColor(parentNodeDOM, dpNode);
        var labelBBox = GeometryUtils.getBBox(lblNode);
        return {
            node: lblNode,
            referColor: referColor,
            dataPoint: dpNode,
            center:{
                x: ctm.e,
                y: ctm.f
            },
            info: dataLabelInfo,
            left: x + labelBBox.x,
            right: x + labelBBox.x + labelBBox.width,
            top: y + labelBBox.y,
            bottom: y + labelBBox.y + labelBBox.height
        };
    }
    
    function getReferColor(parentNodeDOM, dp) {
        var dataPointColor;
        var dataPointColorOpacity = 1;
        var eData = DataGraphics.getData(dp);
        if (eData) {
            dataPointColor = eData.color;
            if (eData.fillOpacity !== undefined) {
                dataPointColorOpacity = eData.fillOpacity;
            }
        }
        var backgroundColor = ColorUtil.getBackgroundColor(parentNodeDOM);
        return ColorUtil.getMixedColor(dataPointColor, backgroundColor,
            dataPointColorOpacity);
    }
    
    var LineDataLabels = function(runtime, options) {
        LineDataLabels.superclass.constructor.call(this, runtime, options);
        this.isHorizontal = options.isHorizontal;
        this._labelPosition = "up";
        this._labelPositionConstant = ["up", "down"];
        this._labelInfos = [];
    };
    
    oo.extend(LineDataLabels, DataLabels);
    
    LineDataLabels.prototype._render = function(selection, dataPoints) {
        var parentNodeDOM = selection.node();
        var dataShapesGroupNode = this._dataShapesGroupNode;
        var size = this._size;
        var props = this._properties;

        var showDataLabel = props.get('visible');
        if (!showDataLabel && this.runtime().semanticManager().hasDataPointDataLabelStyle()) {
            showDataLabel = dataPoints.length > 0;
        }

        if (showDataLabel) {
            
            var bound;

            if (this._isTrellis) {
                bound = {
                    left: 0 - this._trellisPadding.left,
                    width: this._trellisCellSize.width,
                    top: 0 - this._trellisPadding.top,
                    height: this._trellisCellSize.height
                };
            } else {
                bound = {
                    left: 0,
                    width: this._realSize.width,
                    top: 0,
                    height: this._realSize.height
                };
            }
            
            var dataLabelsGroup = parentNodeDOM.querySelector("." + DATA_LABELS_GROUP_CLASS);
            if(!dataLabelsGroup){
                dataLabelsGroup = SVG.create(DATA_LABELS_GROUP_TAG, parentNodeDOM);
                dataLabelsGroup.setAttribute("class", DATA_LABELS_GROUP_CLASS);
            }

            var labelRenderer = props.get('renderer') || defaultRenderer;
            var hideWhenOverlap = props.get('hideWhenOverlap');
            var dataLabelStyle = this._getStyle();
            for (var j in dataLabelStyle) {
                if (dataLabelStyle.hasOwnProperty(j)) {
                    dataLabelsGroup.setAttribute(j, dataLabelStyle[j]);
                }
            }

            var formatPatterns = props.get('formatString');

            var labelInfos = [];
            
            var existDataLabelNodes = dataLabelsGroup.querySelectorAll("." + Constants.CSS.CLASS.DATALABEL);
            for (var i = 0, len = dataPoints.length; i < len; i++) {
                var dp = dataPoints[i];
                var dataLabelInfo = this._getDataLabelInfo(dp);
                var formatPattern = formatPatterns;

                if (dataLabelInfo.value !== null && formatPatterns != null) {
                    if (formatPatterns[0] && TypeUtils.isArray(formatPatterns[0])) {
                        formatPattern = formatPatterns[0][0];
                    } else if (!TypeUtils.isString(formatPatterns)) {
                        formatPattern = formatPatterns[dataLabelInfo.key];
                    }
                }

                var dataLabelCtx = DataPointUtils.getContext(dp);
                var dataLabelText = this.buildDataLabelText(dataLabelInfo, formatPattern, dataLabelCtx, dp);

                if(this._ignoreEmptyDataLabel === true && (dataLabelText === null || dataLabelText === undefined)){
                    continue;
                }
                if(TypeUtils.isExist(dataLabelText) && dataLabelText && dataLabelText.text) {
                    //dataLabelText is a object. Use string and record formattedValue.
                    dataLabelInfo.formattedValue = dataLabelText.formattedValue;
                    dataLabelText = dataLabelText.text;
                }

                var datapointId = DataPointUtils.getDataPointId(dp);
                var dataLabelGroup = DataPointUtils.findByDataPointIds(existDataLabelNodes, datapointId);
                if (dataLabelGroup.length){
                    dataLabelGroup = dataLabelGroup[0];
                    //reset dom structure
                    var child = dataLabelGroup.firstChild;
                    while(child){
                        dataLabelGroup.removeChild(child);
                        child = dataLabelGroup.firstChild;
                    }
                } else {
                    dataLabelGroup = SVG.create("g", dataLabelsGroup);
                    DataPointUtils.setDataPointId(dataLabelGroup, datapointId);
                    DataGraphics.setContext(dataLabelGroup, dataLabelCtx);
                    DataGraphics.setData(dataLabelGroup, {
                        "id": DataPointUtils.getDataId(dp)
                    });
                    dataLabelGroup.setAttribute("class", DATA_LABEL_CLASS);
                }

                if (!dataLabelCtx) {
                    dataLabelCtx = this._data.rawData.dataModel.getDataPoint( datapointId ).context();
                }
                var config = {
                    val: dataLabelInfo.value,
                    text: dataLabelText,
                    ctx: dataLabelCtx,
                    info: dataLabelInfo,
                    styles: dataLabelStyle,
                    horizontal: this._horizontal,
                    // both _processDataLabelRendererConfig and _fixBBoxWhenInvisible need dpBBox,
                    // so calculate it for only one time here
                    dpBBox: GeometryUtils.getBBox(dp),
                    plotSize: this.getSize()
                };

                this._processDataLabelRendererConfig(config, dp);

                var labelContentNode = labelRenderer(config) || defaultRenderer(config);

                if (labelContentNode) {
                    dataLabelGroup.appendChild(labelContentNode);
                    if (this.getDataLabelDefaultPosition){
                        this.getDataLabelDefaultPosition(dp);
                    }

                    var labelBBox = GeometryUtils.getBBox(dataLabelGroup);
                    var ctm = dp.getTransformToElement(parentNodeDOM);
                    
                    var labelTranslate = this._computeDataLabelTranslateByDp(dp, ctm,
                            labelBBox, config, dataPoints, labelInfos, bound);

                    if (!labelTranslate) {
                        dataLabelGroup.removeChild(labelContentNode);
                        continue;
                    }
                    var x = labelTranslate[0];
                    var y = labelTranslate[1];
                    dataLabelGroup.setAttribute("transform", "translate(" + x + "," + y + ")");

                     // specify for pie and dount
                    if(this.setExtraDataOfDataPoint){
                        dp = this.setExtraDataOfDataPoint(DataGraphics, dp, dataLabelGroup);
                    }
                }
            }

        }else{
            //  remove the decoras of data point, current it only supports pie and donut chart.
            //  for other info chart, add the function also.
            if (this.removeExtraDataOfDataPoint) {
                var existDataPoints = DataPointUtils.findAll(dataShapesGroupNode);
                for (var m = 0, length = existDataPoints.length; m < length; m++) {
                    var datapoint = existDataPoints[m];
                    this.removeExtraDataOfDataPoint(DataGraphics, datapoint);
                }
            }
        }
    };
    
    LineDataLabels.prototype.hideConditional = function(dataLabelInfos) {
    };

    LineDataLabels.prototype._computeDataLabelTranslateByDp = function(node, ctm, 
            labelBBox, config, dataPointsNode, dataLabelInfos, bound) {
        
        if (this.isHorizontal) {
            return this._computeDataLabelTranslate(node, ctm, "right", labelBBox);
        }
        
        var labelPositions = this._labelPositionConstant;
        
        var translate;
        
        for (var i = 0; i < labelPositions.length; i++) {
            var pos = this._computeDataLabelTranslate(node, ctm, labelPositions[i], labelBBox);
            
            if (pos) {
                
                if (labelPositions[i] === "down") {
                    pos[1] += labelBBox.height;
                }
                
                if (this._hitTest(pos, labelBBox, dataPointsNode, dataLabelInfos, labelPositions[i], bound)) {
                    continue;
                }
                
                translate = pos;
                break;
            }
        }
        
        return translate;
    };
    
    LineDataLabels.prototype._hitTest = function(labelPos, 
            labelBBox, dataPointsNode, dataLabelInfos, labelPosition, bound) {
        
        var i;
        
        var centerY = labelPos[1] + labelBBox.height / 2;
        
        if (labelPosition === "up") {
            centerY -= 5;
        }
        
        var obb = new OBB(new Vector2(labelPos[0] + labelBBox.width / 2, centerY), 
                labelBBox.width, labelBBox.height, 0);
        
        for (i = 0; i < dataLabelInfos.length; i++) {
            
            var obbDest = dataLabelInfos[i];
            
            if (CollisionDetector.hitTest(obb, obbDest)) {
                return true;
            }
        }
        
        for (i = 0; i < dataPointsNode.length; i++) {
            
            var node = dataPointsNode[i];
            
            var matrix = node.getTransformToElement(node.parentNode);
            
            var nodeRect = node.getBoundingClientRect();
            
            var nodeObb = new OBB(new Vector2(matrix.e + nodeRect.width / 2, matrix.f + nodeRect.height / 2), 
                    nodeRect.width, nodeRect.height, 0);
            
            if (CollisionDetector.hitTest(obb, nodeObb)) {
                return true;
            }
        }
        
        if (labelPos[0] < bound.left ||
            labelPos[0] > bound.left + bound.width - labelBBox.width ||
            labelPos[1] < bound.top ||
            labelPos[1] > bound.top + bound.height - labelBBox.height) {
            return true;
        }
        
        dataLabelInfos.push(obb);
        
        return false;
    };

    var Vector2 = function (x, y) {
        this.x = x || 0;
        this.y = y || 0;
    };

    Vector2.prototype = {
        sub: function (v) {
            return new Vector2(this.x - v.x, this.y - v.y);
        },
        dot: function (v) {
            return this.x * v.x + this.y * v.y;
        }
    };
    
    var OBB = function (centerPoint, width, height, rotation) {

        this.centerPoint = centerPoint;
        this.extents = [width / 2, height / 2];
        this.axis = [new Vector2(Math.cos(rotation), Math.sin(rotation)), 
                     new Vector2(-1 * Math.sin(rotation), Math.cos(rotation))];

        this._width = width;
        this._height = height;
        this._rotation = rotation;
    };
    
    OBB.prototype = {
        getProjectionRadius: function (axis) {
            return this.extents[0] * Math.abs(axis.dot(this.axis[0])) + 
                    this.extents[1] * Math.abs(axis.dot(this.axis[1]));
        }
    };
    
    var CollisionDetector = {

        hitTest: function (obb1, obb2) {
            var centerLine = obb1.centerPoint.sub(obb2.centerPoint);
            var axisA1 = obb1.axis[0];
            if (obb1.getProjectionRadius(axisA1) + obb2.getProjectionRadius(axisA1) <= 
                Math.abs(centerLine.dot(axisA1))) {
                return false;
            }
            var axisA2 = obb1.axis[1];
            if (obb1.getProjectionRadius(axisA2) + obb2.getProjectionRadius(axisA2) <= 
                Math.abs(centerLine.dot(axisA2))) {
                return false;
            }
            var axisB1 = obb2.axis[0];
            if (obb1.getProjectionRadius(axisB1) + obb2.getProjectionRadius(axisB1) <= 
                Math.abs(centerLine.dot(axisB1))) {
                return false;
            }
            var axisB2 = obb2.axis[1];
            if (obb1.getProjectionRadius(axisB2) + obb2.getProjectionRadius(axisB2) <= 
                Math.abs(centerLine.dot(axisB2))) {
                return false;
            }
            return true;
        }
    };
    
    return LineDataLabels;
});
define('sap/viz/hichert/components/referenceline/HichertReferenceLine',[
	'sap/viz/framework/common/util/ObjectUtils',
	'sap/viz/chart/components/renderers/ReferenceLineRenderer',
	'sap/viz/framework/common/util/SVG',
	"sap/viz/framework/common/util/DataGraphics",
	'sap/viz/framework/common/util/Math',
	'sap/viz/framework/common/util/TypeUtils'
], function(ObjectUtils, ReferenceLineRenderer, SVG, DataGraphics, Math, TypeUtils) {

	var HichertReferenceLine = ObjectUtils.extend({}, ReferenceLineRenderer);

	var CSS_CLASS_REFERENCE_LINE_BACKGROUND = "v-referenceline-background";

	HichertReferenceLine._checkLabelVisible = function(currentSetting, config) {
		if (currentSetting.label && currentSetting.label.visible === false) {
			config.label.visible = false;
			return config;
		}
		if ((!currentSetting.label || !currentSetting.label.text)) {
			currentSetting.label = currentSetting.label ? currentSetting.label : {};
			currentSetting.label.text = currentSetting.value;
		}
		return config;
	};

	HichertReferenceLine._renderSub = function(lineStyles, xHandlers, yHandlers, key, isPercentage, defaultStyle,
		props, referenceLineGroup, height, width) {

		//make the value of bottom color reference line be -Infinity
		//and other invalid value be Infinity in order to be sorted correctly
		function computeValue(lineStyle) {
			var value = lineStyle.value;
			if (lineStyle.value == null || isNaN(lineStyle.value) ||
				lineStyle.value === "") {
				if (lineStyle.value === undefined && lineStyle.bottomColor) {
					value = Number.NEGATIVE_INFINITY;
				} else {
					value = Number.POSITIVE_INFINITY;
				}
			}
			return value;
		}
		lineStyles[key].sort(function(a, b) {
			return computeValue(a) - computeValue(b);
		});
		ReferenceLineRenderer._renderSub.apply(this, arguments);
	};

	HichertReferenceLine._getLabelStyle = function(config, currentSetting, labelStyle) {
		for (var key in labelStyle) {
			if (labelStyle.hasOwnProperty(key)) {
				if (currentSetting.label.style && currentSetting.label.style.hasOwnProperty(key)) {
					config.label[key] = currentSetting.label.style[key];
					continue;
				} else if (currentSetting.label.hasOwnProperty(key)) {
					config.label[key] = currentSetting.label[key];
					continue;
				}
				config.label[key] = labelStyle[key];
			}
		}
		return config;
	};

	HichertReferenceLine._drawBackground = function(xHandlers, yHandlers, width, height,
		referenceLine, selection, isPercentage) {
		var backgroundGroup = selection.querySelector("." + CSS_CLASS_REFERENCE_LINE_BACKGROUND);
		var plotBound = selection.querySelector('.v-plot-bound');
		if (!backgroundGroup) {
			backgroundGroup = SVG.create('g');
		}
		backgroundGroup.setAttribute('x', 0);
		backgroundGroup.setAttribute('y', 0);
		backgroundGroup.setAttribute('width', width);
		backgroundGroup.setAttribute('height', height);
		backgroundGroup.setAttribute("class", CSS_CLASS_REFERENCE_LINE_BACKGROUND);
		backgroundGroup.setAttribute("opacity", 1);

		var lineStyles = referenceLine.line;

		for (var key in lineStyles) {
			if (lineStyles.hasOwnProperty(key)) {
				var axis = ReferenceLineRenderer._searchXYAxisHandler(xHandlers, yHandlers, key);
				if (axis === null) {
					continue;
				}
				var referenceLineClass = axis.isHorizontal ?
					".v-referenceline-horizontal" : ".v-referenceline-vertical";
				var referenceLineGroup = selection.querySelectorAll(referenceLineClass);

				var nextContext, nextPosition, clipNode, rectNode, rectX, rectY,
					rectWidth, rectHeight, groupNode, rectFill;
				var rectOpacity = referenceLine.defaultStyle.background.opacity;

				for (var i = 0; i < referenceLineGroup.length; i++) {
					var context = DataGraphics.getData(referenceLineGroup[i]);
					var config = lineStyles[key][context.id];
					var position = context.pos;
					if (config.aboveColor) {
						rectFill = config.aboveColor;
						groupNode = SVG.create("g", backgroundGroup);
						clipNode = SVG.create("rect", groupNode);
						rectNode = SVG.create("rect", groupNode);
						if (i !== referenceLineGroup.length - 1) {
							nextContext = DataGraphics.getData(referenceLineGroup[i + 1]);
							nextPosition = nextContext.pos;
						} else {
							nextPosition = axis.isHorizontal ? 0 : width;
						}
						if (axis.isHorizontal) {
							rectX = 0;
							rectY = nextPosition;
							rectWidth = width;
							rectHeight = position - nextPosition;
						} else {
							rectX = position;
							rectY = 0;
							rectWidth = nextPosition - position;
							rectHeight = height;
						}
						//draw clipNode to avoid the mixture color of plotarea background 
						//and reference line background color
						clipNode = this._drawRect(clipNode, rectX, rectY, rectWidth, rectHeight, "#ffffff", 1);
						rectNode = this._drawRect(rectNode, rectX, rectY, rectWidth, rectHeight, rectFill, rectOpacity);
					}

				}
				var lineConfigs = lineStyles[key];

				if (lineConfigs.length > 0) {
					rectFill = null;
					if (referenceLineGroup.length > 0) {
						//case: reference line exists in the plot
						nextContext = DataGraphics.getData(referenceLineGroup[0]);
						nextPosition = nextContext.pos;
					} else {
						//case: no reference lline in the plot
						nextPosition = axis.isHorizontal ? 0 : width;
					}

					//case: value of reference line out of value scale
					if(referenceLineGroup.length < lineConfigs.length - 1) {
						//check whether the value < min valueAxis scale or not
						var pos, nextPos;
						for (var j = 0; j < lineConfigs.length; j++) {
							if (TypeUtils.isNaN(pos)) {
								pos = ReferenceLineRenderer._calculatePosition(isPercentage, axis,
									lineConfigs[j].value);
							}
							if(!TypeUtils.isNaN(pos)){
								if (pos < 0) {
									if (lineConfigs[j + 1]) {
										nextPos = ReferenceLineRenderer._calculatePosition(isPercentage,
											axis, lineConfigs[j + 1].value);
										if(TypeUtils.isNaN(nextPos)){
											continue;
										}
										if (nextPos >= 0) {
											rectFill = lineConfigs[j].aboveColor;
											break;
										}
										pos = nextPos;
									} else {
										rectFill = lineConfigs[j].aboveColor;
										break;
									}
								}
							}
						}
					}
					if (axis.isHorizontal) {
						rectX = 0;
						rectY = nextPosition;
						rectWidth = width;
						rectHeight = height - Math.abs(nextPosition);
					} else {
						rectX = 0;
						rectY = 0;
						rectWidth = Math.abs(nextPosition);
						rectHeight = height;
					}

					if (!rectFill && !lineConfigs[0].hasOwnProperty("value") && lineConfigs[0].bottomColor) {
						rectFill = lineConfigs[0].bottomColor;
					}
					//draw clipNode to avoid the mixture color of plotarea background 
					//and reference line background color
					if (rectFill) {
						groupNode = SVG.create("g", backgroundGroup);
						clipNode = SVG.create("rect", groupNode);
						rectNode = SVG.create("rect", groupNode);
						clipNode = this._drawRect(clipNode, rectX, rectY, rectWidth, rectHeight, "#ffffff", 1);
						rectNode = this._drawRect(rectNode, rectX, rectY, rectWidth, rectHeight, rectFill, rectOpacity);
					}
				}
			}
		}
		plotBound.parentNode.insertBefore(backgroundGroup, plotBound.nextSibling);
	};

	HichertReferenceLine._drawRect = function(rectNode, x, y, width, height, fill, opacity) {
		rectNode.setAttribute("x", x);
		rectNode.setAttribute("y", y);
		rectNode.setAttribute("width", width);
		rectNode.setAttribute("height", height);
		rectNode.setAttribute("fill", fill);
		rectNode.setAttribute("opacity", opacity);
		return rectNode;
	};

	HichertReferenceLine.render = function(xHandlers, yHandlers, props,
		width, height, selection, isPercentage) {
		ReferenceLineRenderer.render.apply(this, arguments);
		this._drawBackground(xHandlers, yHandlers, width, height, props.referenceLine,
			selection, isPercentage);
	};

	return HichertReferenceLine;
});
define('sap/viz/hichert/components/plots/LinePlot',[
    "sap/viz/framework/common/util/oo",
    "sap/viz/chart/components/plots/LinePlot",
    "sap/viz/hichert/components/datalabels/LineDataLabels",
    "sap/viz/hichert/components/referenceline/HichertReferenceLine"
], function(
    oo,
    InfoLinePlot,
    LineDataLabels,
    HichertReferenceLine
) {

    var LinePlot = function() {
        LinePlot.superclass.constructor.apply(this, arguments);
    };

    oo.extend(LinePlot, InfoLinePlot);

    LinePlot.prototype._drawReferenceLine = function(){
        var referenceLine = this._properties.get('referenceLine');
        if (null == referenceLine || !HichertReferenceLine) {
            return;
        }
        var props = {
            referenceLine: referenceLine
        };
        var lines = referenceLine.line;
        for(var key in lines) {
            if(lines.hasOwnProperty(key)) {
                props[key + 'Color'] = this._properties.origin.get(key + '.color');
            }
        }
        HichertReferenceLine.render(this._xHandlers, this._yHandlers, props,
                this._size.width, this._size.height, this._selection.node(),
                this._data._seriesType === 'percentage');

    };

    LinePlot.prototype._buildWrapperConfig = function(data, position, context){
        var config = LinePlot.superclass._buildWrapperConfig.apply(this, arguments);
        this.dpInfos = {
            stroke: config.graphic.stroke,
            strokeWidth: config.graphic.strokeWidth
        };
        return config;
    };

    LinePlot.prototype.mappingDataPointInfo = function() {        
        return this.dpInfos;
    };

    return LinePlot;
});
define('sap/viz/hichert/components/plots/HichertBasePlot',["sap/viz/framework/common/util/oo",
        'sap/viz/framework/common/util/ObjectUtils'
], function(oo, ObjectUtils) {
    
    function createBasePlotClazz() {
        
        var basePlotClazz = function(runtime, option) {
            basePlotClazz.superclass.constructor.call(this, runtime, option);
        };
        
        basePlotClazz.prototype = {
            getLayoutOption: function() {
                return {};
            }
        };
        
        return basePlotClazz;
    }
    
    /**
     * Proxy wrapper class
     */
    var hichertBase = {
        extend: function(subClazz, superClazz) {
        
            var basePlotClazz = createBasePlotClazz();
            
            oo.extend(basePlotClazz, superClazz);
            
            return oo.extend(subClazz, basePlotClazz);
        }
    };

    return hichertBase;
});
define('sap/viz/hichert/components/datalabels/DataLabelUtils',[
    'sap/viz/framework/common/util/Constants',
    "sap/viz/framework/common/util/DataGraphics",
    'sap/viz/framework/common/util/SVG',
    'sap/viz/framework/common/util/GeometryUtils'
], function(
    Constants,
    DataGraphics,
    SVG,
    GeometryUtils
    ) {
   
    var DatalabelUtils = {};


    DatalabelUtils.getOverlapInfos = function(dataPointBoxes, allDataPoints) {
        var overDataPoints = [];
        var overdataPointBoxes = [];
        for (var i = 0; i < dataPointBoxes.length; i++) {
            //parse only the over layer dataPoints.
            var extraData = DataGraphics.getData(allDataPoints[i]);
            if( extraData && extraData.isFront) {
                overDataPoints.push(allDataPoints[i]);
                overdataPointBoxes.push(dataPointBoxes[i]);
            }
        }
        return {
            dataPoints : overDataPoints,
            dataPointsBoxes : overdataPointBoxes
        };
    };    

    DatalabelUtils.addTextBackground = function(dataPoint, dataLabelGroup, dataLabelProps, patternShow){
        var data, dpRect, labelRect,
            backProp = dataLabelProps.background,
            labelStyle = dataLabelProps.style,
            textColor = labelStyle.color || '#000000';
        if(!dataPoint || !backProp){
            return;
        }
        data = DataGraphics.getData(dataPoint);  
        backProp.color = backProp.color || '#ffffff';

        if(!data || data.dataLabelLocation !== "inside"){
            //add opacity background when outside
            this._addTextBackground(dataLabelGroup, backProp.color, backProp.opacity);

        }else if(patternShow){
            dpRect = dataPoint.getElementsByTagName('rect');
            if (dpRect && dpRect.length >0 &&
                /url\(/i.exec(dpRect[0].getAttribute('fill'))){
                //add opacity background when inside and hatching 
                this._addTextBackground(dataLabelGroup, backProp.color, backProp.opacity, 
                    data.dataLabelLocation === "inside"? textColor: null);

            }else{//'inside here' just means eithor horizontal or vertical, not 'Both'
                dpRect = GeometryUtils.getBBox(dataPoint.getElementsByTagName('rect')[0]);
                labelRect = GeometryUtils.getBBox(dataLabelGroup);
                if(labelRect.width > dpRect.width || labelRect.height > dpRect.height){
                    this._addTextBackground(dataLabelGroup, backProp.color, backProp.opacity, textColor);
                }
            } 
        }
    };

    DatalabelUtils._addTextBackground = function(dataLabelGroup, color, opacity, textColor){
        var dataLabelText, dataLabelBackground, size;
        if(!dataLabelGroup){
            return;
        }
        size = GeometryUtils.getBBox(dataLabelGroup);
        dataLabelText = dataLabelGroup.getElementsByTagName('text');
        if(dataLabelText.length>0){
            dataLabelText = dataLabelText[0];
            dataLabelBackground = SVG.create('rect');
            dataLabelBackground.setAttribute('fill', color);
            dataLabelBackground.setAttribute('fill-opacity', opacity);
            dataLabelBackground.setAttribute('y', size.y);
            dataLabelBackground.setAttribute('width', size.width);
            dataLabelBackground.setAttribute('height', size.height);
            dataLabelGroup.insertBefore(dataLabelBackground, dataLabelText);
            if(textColor){
                dataLabelText.setAttribute('fill', textColor);
            }
        }
    };
    return DatalabelUtils;
});

define('sap/viz/hichert/components/datalabels/ColumnDataLabels',[
    'sap/viz/framework/common/util/oo',
    'sap/viz/chart/components/datalabels/ColumnDataLabels',
    'sap/viz/framework/common/util/DataGraphics',
    'sap/viz/framework/common/util/Constants',
    'sap/viz/chart/components/util/DataPointUtils',
    'sap/viz/hichert/components/datalabels/DataLabelUtils',
    'sap/viz/framework/common/util/DOM'
], function (
    oo,
    BaseDataLabels,
    DataGraphics,
    Constants,
    DataPointUtils,
    DataLabelUtils,
    DOM
) {
    var ColumnDataLabels = function (ctx, options) {
        ColumnDataLabels.superclass.constructor.apply(this, arguments);
    };

    oo.extend(ColumnDataLabels, BaseDataLabels);

    var prot = ColumnDataLabels.prototype;
    
    prot.render = function (selection) {
        var dataShapesGroupNode = this._dataShapesGroupNode;
        var allDataPoints = dataShapesGroupNode.querySelectorAll("." + Constants.CSS.CLASS.DATAPOINT);
        var filteredDataPoints = Array.prototype.filter.call(allDataPoints, function(node){
            return DataGraphics.getData(node).isFront;
        });
        this._render(selection, filteredDataPoints);
        this._afterRender(selection);
    };

    prot.update = function (selection, dataPoints) {
        var dataShapesGroupNode = this._dataShapesGroupNode;
        var allDataPoints = dataShapesGroupNode.querySelectorAll("." + Constants.CSS.CLASS.DATAPOINT);
        var filteredDataPoints = Array.prototype.filter.call(allDataPoints, function(node){
            return DataGraphics.getData(node).isFront;
        });
        this._render(selection, filteredDataPoints);
        this._afterRender(selection);
    };
    
    prot.indexOfDataLabelIntersectDataPoints = function (dataLabelBBox,
        dataPointBoxes, allDataPoints, currectDataPoint) {
        var overlapDatapoints = DataLabelUtils.getOverlapInfos(dataPointBoxes, allDataPoints);
        return ColumnDataLabels.superclass.indexOfDataLabelIntersectDataPoints.call(this, dataLabelBBox,
            overlapDatapoints.dataPointsBoxes, overlapDatapoints.dataPoints, currectDataPoint
        );
    };
    

    prot._renderAfterPositioning = function(dataPoint, dataLabelGroup){  
        DataLabelUtils.addTextBackground(dataPoint, 
            dataLabelGroup, 
            this.properties(), 
            this._data && (this._data.pattern || this._data.pattern2)
        );
    };

    

    return ColumnDataLabels;
});
define('sap/viz/hichert/components/datalabels/BarDataLabels',[
    'sap/viz/framework/common/util/oo',
    'sap/viz/chart/components/datalabels/BarDataLabels',
    'sap/viz/framework/common/util/DataGraphics',
    'sap/viz/framework/common/util/Constants',
    'sap/viz/chart/components/util/DataPointUtils',
    'sap/viz/hichert/components/datalabels/DataLabelUtils',
    'sap/viz/framework/common/util/DOM'
], function(
    oo,
    BaseBarDataLabels,
    DataGraphics,
    Constants,
    DataPointUtils,
    DataLabelUtils,
    DOM
) {
    var BarDataLabels = function(ctx, options) {
        BarDataLabels.superclass.constructor.apply(this, arguments);
        this._labelPosition = "outsideFirst";
    };

    oo.extend(BarDataLabels, BaseBarDataLabels);

    var prot = BarDataLabels.prototype;
    
    // it needs an offset because of the requirement of UX
    prot.labelOffset = 2;
    
    prot.render = function(selection){
        var dataShapesGroupNode = this._dataShapesGroupNode;
        var allDataPoints = dataShapesGroupNode.querySelectorAll("." + Constants.CSS.CLASS.DATAPOINT);
        var filteredDataPoints = Array.prototype.filter.call(allDataPoints, function(node){
            return DataGraphics.getData(node).isFront;
        });
        this._render(selection, filteredDataPoints);
        this._afterRender(selection);
    };

    prot.update = function(selection, dataPoints) {
        var dataShapesGroupNode = this._dataShapesGroupNode;
        var allDataPoints = dataShapesGroupNode.querySelectorAll("." + Constants.CSS.CLASS.DATAPOINT);
        var filteredDataPoints = Array.prototype.filter.call(allDataPoints, function(node){
            return DataGraphics.getData(node).isFront;
        });
        this._render(selection, filteredDataPoints);
        this._afterRender(selection);
    };
    
    prot.indexOfDataLabelIntersectDataPoints = function(dataLabelBBox,
        dataPointBoxes, allDataPoints, currectDataPoint) {
        var overlapDatapoints = DataLabelUtils.getOverlapInfos(dataPointBoxes, allDataPoints);
        return BarDataLabels.superclass.indexOfDataLabelIntersectDataPoints.call(this, dataLabelBBox,
                overlapDatapoints.dataPointsBoxes, overlapDatapoints.dataPoints, currectDataPoint);
    };

    prot._renderAfterPositioning = function(dataPoint, dataLabelGroup){  
        DataLabelUtils.addTextBackground(dataPoint, 
            dataLabelGroup, 
            this.properties(), 
            this._data && (this._data.pattern || this._data.pattern2)
        ); 
    };


    return BarDataLabels;
});

define('sap/viz/hichert/components/plots/BaseColumnPlot',["sap/viz/hichert/components/plots/HichertBasePlot",
    "sap/viz/chart/components/plots/ColumnPlot",
    'sap/viz/hichert/components/datalabels/ColumnDataLabels',
    'sap/viz/hichert/components/datalabels/BarDataLabels',
    'sap/viz/hichert/components/referenceline/HichertReferenceLine'
], function(hichertBase,
    InfoColumnPlot,
    ColumnDataLabels,
    BarDataLabels,
    HichertReferenceLine) {

    var BaseColumnPlot = function(runtime, option) {
        BaseColumnPlot.superclass.constructor.apply(this, arguments);
    };

    hichertBase.extend(BaseColumnPlot, InfoColumnPlot);

    var prot = BaseColumnPlot.prototype;

    prot._preShowDataPoints = function() {
        return InfoColumnPlot.superclass._preShowDataPoints.apply(this, arguments);
    };

    prot._showDataPoints = function() {
        return InfoColumnPlot.superclass._showDataPoints.apply(this, arguments);
    };

    prot._buildWrapperConfig = function() {
        return InfoColumnPlot.superclass._buildWrapperConfig.apply(this, arguments);
    };

    prot._applyScroll = function() {
        return InfoColumnPlot.superclass._applyScroll.apply(this, arguments);
    };

    prot._getSeriesRenderer = function() {
        return null;
    };
    // override super class method
    prot._updateNegativeDatapoint = function() {};

    prot._getBarProperties = function() {
        var barProp = BaseColumnPlot.superclass._getBarProperties.call(this);
        var offsetPercentage = this._properties.get("overlap.offsetPercentage");
        barProp.offsetPercentage = offsetPercentage;
        return barProp;
    };
    
    prot._drawDataLabels = function(parent, dataShapesGroupNode) {
        this._dataLabels.setDataShapesGroupNode(dataShapesGroupNode);
        this._parent_trellis = parent;
        var dataLabels = this._dataLabels;
        if (this._options.inTrellis === true) {
            //don't draw datalabel now, because parent is not append to dom yet currently.
        } else {
            dataLabels.render(parent);
        }
    };

    prot.getPreferredSize = function() {
        var returnValue = BaseColumnPlot.superclass.getPreferredSize.call(this);

        if (this._dataLabels) {
            this._dataLabels.setRealSize({
                width: this._realSize.width,
                height: this._realSize.height
            });
        }
        
        return returnValue;
    };

    prot._drawReferenceLine = function(){
        var referenceLine = this._properties.get('referenceLine');
        if (null == referenceLine || !HichertReferenceLine) {
            return;
        }
        var props = {
            referenceLine: referenceLine
        };
        var lines = referenceLine.line;
        for(var key in lines) {
            if(lines.hasOwnProperty(key)) {
                props[key + 'Color'] = this._properties.origin.get(key + '.color');
            }
        }
        //need only valueAxis, remove valueAxis2
        HichertReferenceLine.render([this._xHandlers[0]], [this._yHandlers[0]], props,
                this._size.width, this._size.height, this._selection.node(),
                this._data._seriesType === 'percentage');

    };

    return BaseColumnPlot;
});

define('sap/viz/hichert/components/plots/BarWidthUtils',[], function(){
    
    var utils = {};
    utils.getOverlapBarInfo = function(seriesCount, options) {
        
        var offsetPercentage = options.offsetPercentage;
        var barSpacing = options.barSpacing || 1;
        var barStep = 1;
        
        var barWidth = 1 / (barSpacing + ((seriesCount - 1) + Math.abs(offsetPercentage)));
        var gap = barWidth * (barSpacing / barStep) / 2;
        return {
            barWidth: barWidth,
            gap: gap
        };
    };
    
    return utils;
});
define('sap/viz/hichert/components/plots/OverlapItemScaleHandler',['sap/viz/chart/components/plots/ItemScaleHandler',
        "sap/viz/hichert/components/plots/BarWidthUtils"], 
function Setup(ItemScaleHandler, 
                BarWidthUtil) {
    
    var OverlapItemScale = function(options) {
        OverlapItemScale.superclass.constructor.call(this, options);
    };
    
    ItemScaleHandler.extend(OverlapItemScale);
    
    OverlapItemScale.prototype.init = function(seriesCount) {
        if(seriesCount === 1){
            //If only one series, keep the core chart's logic.
            OverlapItemScale.superclass.init.apply(this, arguments);
        }else{
            var result = this._result = [];
            
            var barInfo = BarWidthUtil.getOverlapBarInfo(seriesCount, this._options);
            
            var barWidth = barInfo.barWidth;
            var gap = barInfo.gap;
            var offsetPercentage = this._options.offsetPercentage;
            
            var isMinus = offsetPercentage < 0;
            offsetPercentage = Math.abs(offsetPercentage);

            for (var i = 0; i < seriesCount; i++) {

                var index = isMinus ? seriesCount - i - 1 : i;

                var start = gap + index * barWidth * offsetPercentage;
                result[i] = [start, start + barWidth];
            }            
        }

    };
    
    return OverlapItemScale;
});
define('sap/viz/hichert/components/plots/ColumnPlot',["sap/viz/framework/common/util/oo",
        "sap/viz/chart/components/plots/ScaleHandler",
        'sap/viz/chart/components/plots/SeriesIterator',
        "sap/viz/hichert/components/plots/BaseColumnPlot",
        "sap/viz/framework/common/util/Constants",
        "sap/viz/hichert/components/plots/OverlapItemScaleHandler",
        "sap/viz/chart/components/util/TextUtils",
        "sap/viz/framework/scale/ScaleConstant",
        "sap/viz/framework/common/util/DataGraphics",
        'sap/viz/hichert/components/datalabels/ColumnDataLabels',
        'sap/viz/hichert/components/datalabels/BarDataLabels',
        "sap/viz/hichert/components/plots/BarWidthUtils",
        "sap/viz/framework/common/util/ObjectUtils",
], function(oo, 
        ScaleHandler,
        SeriesIterator,
        BaseColumnPlot, 
        Constants,
        OverlapItemScaleHandler,
        TextUtils,
        ScaleConstant,
        DataGraphics,
        ColumnDataLabels,
        BarDataLabels,
        BarWidthUtils,
        ObjectUtils
        ) {
    
    var ColumnPlot = function(runtime, option) {
        ColumnPlot.superclass.constructor.apply(this, arguments);
        this._dpInfos = {};
    };
    
    oo.extend(ColumnPlot, BaseColumnPlot);

    var prot = ColumnPlot.prototype;

    prot._getDataLabels = function (name, runtime) {
        var isOverviewMode = !this._properties.get('isFixedDataPointSize');
        if (this.isHorizontal()) {
            return new BarDataLabels(runtime, {
                name: name,
                isOverviewMode: isOverviewMode
            });
        } else {
            return new ColumnDataLabels(runtime, {
                name: name,
                isOverviewMode: isOverviewMode
            });
        }
    };
    
    prot._getCategoryScaleHandlers = function(isHorizontal) {
        var barProp = this._getBarProperties();
        
        this._categoryScaleHandler = ScaleHandler.getCategoryScaleHandler("categoryAxis", {
            isHorizontal: isHorizontal,
            itemScaleHandler: new OverlapItemScaleHandler(barProp)
        });
        return [this._categoryScaleHandler];
    };
    
    prot.getLayoutOption = function() {
        
        var valueData = this._data["valueAxis"];
        var valueDomain = valueData.scale.getDomain();
        
        var valueData2 = this._data["valueAxis2"];
        var valueDomain2 = valueData.scale.getDomain();
        
        var minRange = Math.min(valueDomain[0], valueDomain2[0]);
        var maxRange = Math.max(valueDomain[1], valueDomain2[1]);
        
        return {
            beforeGap: 0,
            afterGap: 0,
            range: [minRange, maxRange],
            delta: maxRange - minRange
        };
    };
    
    prot.createSeriesIterator = function(len) {
        return SeriesIterator.create(len, "reverse");
    };
    
    prot._buildConfig = function(data, position, context, effectManager) {
        
        var config = ColumnPlot.superclass._buildConfig.call(this, data, position, context, effectManager);
        
        var pattern = this._getPattern(data);
        
        if (pattern == null) {
            return config;
        }
        
        if (pattern.color) {
            config.graphic.fill = pattern.color;
        }
        
        config.graphic.pattern = pattern.pattern;
        config.graphic.stroke = pattern.stroke;
        config.graphic.strokeWidth = pattern.strokeWidth;
        
        return config;
    };
    
    prot._getPattern = function(data) {
        if (data.hasOwnProperty("valueAxis2")) {
            if(data.hasOwnProperty("pattern2")){
                return this._data.pattern2.scale.scale(data.pattern2);
            }else{
                return this._data.pattern2.scale.scale(ScaleConstant.DEFAULTPATTERN2);
            }
        } else {
            if(data.hasOwnProperty("pattern")){
                return this._data.pattern.scale.scale(data.pattern);
            }else{
                return this._data.pattern.scale.scale(ScaleConstant.DEFAULTPATTERN);
            }
        }
    };

    prot._getColumnWidth = function(columnCount, categoryCount,
            isHorizontal) {
        var step = 1;
        var categoryWidth = isHorizontal ?
            (this._size.height / categoryCount) :
            (this._size.width / categoryCount);
        var barInfo = BarWidthUtils.getOverlapBarInfo(columnCount, this._getBarProperties());
        return  categoryWidth * barInfo.barWidth;
    };
    
    prot.sizeByFixedDPSize = function(dpSize, nColumn, nCategory) {
        nColumn = nColumn || this._getColumnCount();
        nCategory = nCategory || this._getCategoryCount();
        var barInfo = BarWidthUtils.getOverlapBarInfo(nColumn, this._getBarProperties());
        return dpSize * nCategory / barInfo.barWidth;
    };
    
    prot._drawDataPoint = function (dpRenderer, dataPoint) {
        this._dpInfos[dataPoint.getDataId()] = dataPoint;
        var dp = ColumnPlot.superclass._drawDataPoint.call(this, dpRenderer, dataPoint);
        var extraData = DataGraphics.getData(dp);
        if(dataPoint.getSeriesIndex() === 0) {
            extraData.isFront = true;
        }else{
            extraData.isFront = false;
        }
        DataGraphics.setData(dp,extraData);
        return dp;
    };
    prot._preShowDataPoints  = function(){
        ColumnPlot.superclass._preShowDataPoints.call(this);
        this._visibleRange = this._calcVisibleRange();
    };

    prot._calcVisibleRange = function(){
        var seriesIter = this.createSeriesIterator(this._series.length),
            mergedRange = { min: Number.POSITIVE_INFINITY, 
                            max: Number.NEGATIVE_INFINITY
                        };

        while (seriesIter.hasNext()) {
            var seriesIndex = seriesIter.next();
            var seriesModel = this._series[seriesIndex];
            if (!seriesModel) {
                continue;
            }            
            var dataPoints = seriesModel.getDataPoints();
            var range = ColumnPlot.superclass._getVisibleRange.call(this, dataPoints);
            mergedRange.min = range.min < mergedRange.min ? range.min : mergedRange.min;
            mergedRange.max = range.max > mergedRange.max ? range.max : mergedRange.max;
        }
        
        return mergedRange;
    };

    prot._getVisibleRange = function(){
        return this._visibleRange;
    };

    function buildDataPointInfo(dpInfo) {
        var config = dpInfo.getConfig();
        var graphic = config.graphic;
        var position = dpInfo.getPosition();
        var measureNames = config.ctx['measureNames'];
        var value = config.ctx[measureNames];
        var context = ObjectUtils.clone(dpInfo.getContext());
        delete context[measureNames];
        // var dataLabelProp = this._properties.get("dataLabel");
        // var dataLabelColor = this.runtime().effectManager().register({
        //     fillColor: dataLabelProp.style.color
        // });
        // dataLabelProp.style.color = dataLabelColor;

        return {
            value: value,
            x: position.x,
            y: position.y,
            width: position.width,
            height: position.height,
            fill: config.effectManager.register({
                drawingEffect : graphic.drawingEffect,
                fillColor : graphic.fill,
                patternEffect: graphic.pattern,
                direction : config.horizontal ? 'vertical' : 'horizontal'
            }),
            stroke: graphic.stroke,
            strokeWidth: graphic.strokeWidth,
            dimensionalContext: context
            // dataLabelProp: dataLabelProp
        };
    }

    prot.mappingdataPointInfoByCtx = function(context) {
        var dpInfos = this._dpInfos,
            dpInfo = Object.keys(dpInfos).reduce(function(previous, current) {
            var currentDpInfo = dpInfos[current],
                config = currentDpInfo.getConfig(),
                measureNames = config.ctx["measureNames"],
                currentContext = currentDpInfo.getContext(),
                keys = Object.keys(currentContext),
                key;
            for(var i = 0, len = keys.length; i < len; i++) {
                key = keys[i];
                if(key !== measureNames && currentContext[key] !== context[key]) {
                    return previous;
                }
            }
            return currentDpInfo;
        }, null);
        return dpInfo ? buildDataPointInfo(dpInfo) : null;
    };

    prot.mappingDataPointInfo = function(dataId) {
        return buildDataPointInfo(this._dpInfos[dataId]);
    };
    return ColumnPlot;
});

define('sap/viz/hichert/components/plots/StackedColumnPlot',["sap/viz/hichert/components/plots/HichertBasePlot",
    "sap/viz/chart/components/plots/StackedColumnPlot",
    "sap/viz/chart/components/datalabels/StackedDataLabels",
    'sap/viz/chart/components/plots/BarWidthUtils',
    'sap/viz/chart/components/util/TextUtils',
    'sap/viz/framework/common/util/DataUtils',
    'sap/viz/hichert/components/referenceline/HichertReferenceLine'
], function (hichertBase,
    BaseColumnPlot,
    StackedDataLabels,
    BarWidthUtils,
    TextUtils,
    DataUtils,
    HichertReferenceLine
    ) {

    var MEASURE_NAMES = "measureNames";

    var StackedColumnPlot = function (runtime, option) {
        StackedColumnPlot.superclass.constructor.apply(this, arguments);
        this.runtime().semanticManager().bindAxisProperty("plotArea.axisStyle");
    };

    hichertBase.extend(StackedColumnPlot, BaseColumnPlot);

    StackedColumnPlot.prototype._getDataLabels = function (name, runtime) {
        return new StackedDataLabels(runtime, {
            name: name,
            horizontal: this.isHorizontal(),
            isOverviewMode: !this._properties.get('isFixedDataPointSize')
        });
    };

    StackedColumnPlot.prototype._drawDataLabels = function (parent, dataShapesGroupNode) {
        this._dataLabels.setDataShapesGroupNode(dataShapesGroupNode);
        if (this._options.inTrellis === true) {
            //don't draw datalabel now, because parent is not append to dom yet currently.
        } else {
            this._dataLabels.render(parent);
        }
    };

    StackedColumnPlot.prototype.getPreferredSize = function () {
        var returnValue = BaseColumnPlot.superclass.getPreferredSize.call(this);

        if (this._dataLabels) {
            this._dataLabels.setRealSize({
                width: this._realSize.width,
                height: this._realSize.height
            });
        }
        return returnValue;
    };

    StackedColumnPlot.prototype._drawReferenceLine = function(){
        var referenceLine = this._properties.get('referenceLine');
        if (null == referenceLine || !HichertReferenceLine) {
            return;
        }
        var props = {
            referenceLine: referenceLine
        };
        var lines = referenceLine.line;
        for(var key in lines) {
            if(lines.hasOwnProperty(key)) {
                props[key + 'Color'] = this._properties.origin.get(key + '.color');
            }
        }
        HichertReferenceLine.render(this._xHandlers, this._yHandlers, props,
                this._size.width, this._size.height, this._selection.node(),
                this._data._seriesType === 'percentage');

    };

    StackedColumnPlot.prototype._buildWrapperConfig = function(data, position, context){
        var config = StackedColumnPlot.superclass._buildWrapperConfig.apply(this, arguments);
        this.dpInfos = {
            stroke: config.graphic.stroke,
            strokeWidth: config.graphic.strokeWidth
        };
        return config;
    };

    StackedColumnPlot.prototype.mappingDataPointInfo = function() {     
        return this.dpInfos;
    };

    return StackedColumnPlot;
});
define('sap/viz/hichert/components/datalabels/VarianceColumnDataLabels',[
    'sap/viz/framework/common/util/oo',
    'sap/viz/chart/components/datalabels/ColumnDataLabels',
    'sap/viz/chart/components/util/DataPointUtils',
    'sap/viz/framework/common/format/UnitFormat',
    'sap/viz/framework/common/util/Constants',
    'sap/viz/framework/common/util/DOM'
], function(
    oo,
    ColumnDataLabels,
    DataPointUtils,
    UnitFormat,
    Constants,
    DOM
) {
    var VarianceColumnDataLabels = function(ctx, options) {
        VarianceColumnDataLabels.superclass.constructor.call(this, ctx, options);
    };

    oo.extend(VarianceColumnDataLabels, ColumnDataLabels);

    var prot = VarianceColumnDataLabels.prototype;
    
    prot.render = function(selection) {
        var dataShapesGroupNode = this._dataShapesGroupNode;
        var filteredDataPoints = this._beforeRender(DataPointUtils.findAll(dataShapesGroupNode));
        this._render(selection, filteredDataPoints);
        this._afterRender(selection);
    };

    prot.update = function (selection, dataPoints) {
        var dataShapesGroupNode = this._dataShapesGroupNode;
        var allDataPoints = dataShapesGroupNode.querySelectorAll("." + Constants.CSS.CLASS.DATAPOINT);
        this._render(selection, allDataPoints);
        this._afterRender(selection);
    };
    
    /**
     * Down grade buildDataLabelText method of DataLabels to prohabit calling _getFormattedDataLabel method.
     */
    prot.buildDataLabelText = function(dataLabelInfo, formatPattern, dataLabelCtx, dp) {
        var dataLabelText = dataLabelInfo.value;
        if (dataLabelText === 0 && !this.drawZero(dp)) {
            return null;
        }
        
        if (dataLabelText !== null) {
            dataLabelText = this.formatDataLabelText(dataLabelText, formatPattern);
        }
        return dataLabelText;
    };
    
    prot.formatDataLabelText = function(dataLabelText, formatPattern) {
        
        var props = this._properties;
        
        formatPattern = formatPattern || props.get('formatString');
        
        var result = UnitFormat.format(dataLabelText, formatPattern, props.get('unitFormatType'));
        
        if (+dataLabelText > 0) {
            result = "+" + result;
        }
        return result;
    };
    
    prot._computeDataLabelPosition = function (ctm, shapeBBox, labelPosition, labelBBox,
            config, node) {
        var exData;
        var position = ColumnDataLabels.superclass._computeDataLabelPosition.apply(this, arguments);

        if (labelPosition === "up") {
            var nodeY = shapeBBox.y + ctm.f;
            var y = position[1];
            if (config.val < 0) {
                y = nodeY + shapeBBox.height + labelBBox.height;
            } else {
                y = nodeY - (labelBBox.y + labelBBox.height);
            }
            
            position[1] = y;
        }
        return position;
    };
    
    prot.hideConditional = function(dataLabelInfos) {
        var len = dataLabelInfos.length;

        var realSize = this._realSize;
        
        var bound = {
            left: 0,
            width: realSize.width,
            top: 0,
            height: realSize.height
        };
        
        this.sortDataLabelInfos(dataLabelInfos);

        var offset = this._plotOffset;
        
        for (var k = 0; k < len; k++) {
            var info = dataLabelInfos[k];
            // for variance bar chart, just judge horizontal location
            if (info.left < bound.left || info.right > bound.width) {
                info.skip = true;
            }
        }
        
        var fontSize = parseFloat(this._properties.get('style.fontSize'));
        var horizontalPadding = fontSize * Constants.DATALABEL.HORIZONTAL_OVERLAPPING_PADDING;
        for (var i = len - 1; i >= 0; --i) {
            var src = dataLabelInfos[i];
            if (src.skip) {
                continue;
            }
            for (var j = i - 1; j >= 0; --j) {
                var dest = dataLabelInfos[j];
                if (!dest.skip) {
                    dest.skip = (src.top < dest.bottom &&
                            src.bottom > dest.top &&
                            src.right > (dest.left - horizontalPadding) &&
                            src.left < (dest.right + horizontalPadding));
                }
            }
        }

        dataLabelInfos.forEach(function(info) {
            if (info.skip) {
                DOM.remove(info.node);
            }
        });
    };
    
    return VarianceColumnDataLabels;
});

define('sap/viz/hichert/components/util/Constants',[ 
	"sap/viz/framework/common/util/ObjectUtils", 
	"sap/viz/framework/common/util/Constants"
], function( ObjectUtils, Constants) {
	var HichertConstants = ObjectUtils.extend({}, Constants);

	HichertConstants.AXIS.TICK_SIZE = 5;
	HichertConstants.AXIS.LINE_SIZE = 4;
    HichertConstants.CSS.CLASS.DATAPOINT_OVERLAP = "v-overlap-datapoint";
    HichertConstants.CSS.CLASS.VARIANCE_DATAPOINT = "v-variance-datapoint";
    HichertConstants.CSS.CLASS.EMBEDDED_LEGEND = "v-embeddedLegend-item";
	HichertConstants.CSS.CLASS.AXIS_ITEM = "v-axis-item";
	HichertConstants.CSS.CLASS.VARIANCE_TITLE = "v-variance-title";

    HichertConstants.CSS.ALIGNMENTLINE_WIDTH = "1px";
    HichertConstants.CSS.ALIGNMENTLINE_COLOR = "#B3B3B3";
    HichertConstants.CSS.ALIGNMENTLINE_DASHARRAY = "3, 2";
    HichertConstants.PADDING_IN_PLOTS = 10;

    HichertConstants.DELTA_PLOT = {
        SCALE : {
            colors : {
                "up":  "#8CB300",
                "down": "#FF2500"
            }
        },
        MAX_GAP_SIZE : 7
    };

    HichertConstants.PINRECT_PLOT = {
        SCALE : {
            colors : {
                "up":  "#8CB300",
                "down": "#FF2500"
            }
        }
    };

    HichertConstants.DUAL_LINE_COLOR = "#000000";

    HichertConstants.VARIANCE_DEF_RATIO = 0.25;
    HichertConstants.VARIANCE_MAX_RATIO = 0.4;
    HichertConstants.VARIANCE_BAR_LABEL_OFFSET = 2;

    HichertConstants.CSS.CLASS.DIFFERENCE_MARKER_GROUP = "v-differencemarker-group";
    HichertConstants.CSS.CLASS.DIFFERENCE_MARKER_ITEM = "v-differencemarker-item";
    HichertConstants.CSS.CLASS.DIFFERENCE_MARKER_LABEL_GROUP = "v-differencemarker-labelGroup";
    HichertConstants.CSS.CLASS.DIFFERENCE_MARKER_LABEL = "v-differencemarker-label";
    HichertConstants.CSS.CLASS.DIFFERENCE_MARKER_CONTROLLER = "v-differencemarker-controller";
    HichertConstants.CSS.CLASS.DIFFERENCE_MARKER_LABEL_CONTROLLER = "v-differencemarker-label-controller";
    HichertConstants.CSS.CLASS.DIFFERENCE_MARKER_CROSS = "v-differencemarker-cross";
    HichertConstants.CSS.CLASS.DIFFERENCE_MARKER_LABEL_BG = "v-differencemarker-label-bg";
    HichertConstants.CSS.CLASS.DIFFERENCE_MARKER_CROSS_BG = "v-differencemarker-cross-bg";
    
	return HichertConstants;
});

define('sap/viz/hichert/components/datalabels/VarianceBarDataLabels',[
    'sap/viz/framework/common/util/oo',
    'sap/viz/chart/components/datalabels/BarDataLabels',
    'sap/viz/chart/components/util/DataPointUtils',
    'sap/viz/framework/common/format/UnitFormat',
    'sap/viz/hichert/components/util/Constants',
    'sap/viz/framework/common/util/DataGraphics',
    'sap/viz/framework/common/util/DOM'
], function(
    oo,
    BarDataLabels,
    DataPointUtils,
    UnitFormat,
    Constants,
    DataGraphics,
    DOM
) {
    var VarianceBarDataLabels = function(ctx, options) {
        VarianceBarDataLabels.superclass.constructor.call(this, ctx, options);
    };

    oo.extend(VarianceBarDataLabels, BarDataLabels);

    var prot = VarianceBarDataLabels.prototype;

    // it needs an offset because of the requirement of UX
    prot.labelOffset = Constants.VARIANCE_BAR_LABEL_OFFSET;
    
    prot.render = function(selection) {
        var dataShapesGroupNode = this._dataShapesGroupNode;
        var filteredDataPoints = this._beforeRender(DataPointUtils.findAll(dataShapesGroupNode));
        this._render(selection, filteredDataPoints);
        this._afterRender(selection);
    };

    prot.update = function(selection, dataPoints) {
        var dataShapesGroupNode = this._dataShapesGroupNode;
        var allDataPoints = dataShapesGroupNode.querySelectorAll("." + Constants.CSS.CLASS.DATAPOINT);
        this._render(selection, allDataPoints);
        this._afterRender(selection);
    };
    
    prot._computeDataLabelPosition = function(ctm, shapeBBox, labelPosition, labelBBox,
                                                            config, node) {
        var x, y;
        var nodeX = shapeBBox.x + ctm.e;
        var nodeY = shapeBBox.y + ctm.f;
        
        var exData = DataGraphics.getData(node);

        var labelOffset = this.labelOffset;

        // outside by default
        y = (nodeY + shapeBBox.height / 2) -
            (labelBBox.y + labelBBox.height / 2);
        if (config.val >= 0) {
            x = nodeX + shapeBBox.width + labelOffset;
        } else {
            x = nodeX - (labelBBox.x + labelBBox.width) - labelOffset;
        }

        return [x, y];
    };
    
    /**
     * Down grade buildDataLabelText method of DataLabels to prohabit calling _getFormattedDataLabel method.
     */
    prot.buildDataLabelText = function(dataLabelInfo, formatPattern, dataLabelCtx, dp) {
        var dataLabelText = dataLabelInfo.value;
        if (dataLabelText === 0 && !this.drawZero(dp)) {
            return null;
        }
        
        if (dataLabelText !== null) {
            dataLabelText = this.formatDataLabelText(dataLabelText, formatPattern);
        }
        
        if (dataLabelText.length > Constants.DELTA_PLOT.MAX_GAP_SIZE) {
            dataLabelText = null;
        }
        
        return dataLabelText;
    };
    
    prot.formatDataLabelText = function(dataLabelText, formatPattern) {
        
        var props = this._properties;
        
        formatPattern = formatPattern || props.get('formatString');
        
        var result = UnitFormat.format(dataLabelText, formatPattern, props.get('unitFormatType'));
        
        if (+dataLabelText > 0) {
            result = "+" + result;
        }
        return result;
    };
    
    prot.hideConditional = function(dataLabelInfos) {
        var len = dataLabelInfos.length;

        var realSize = this._realSize;
        
        var bound = {
            left: 0,
            width: realSize.width,
            top: 0,
            height: realSize.height
        };
        
        this.sortDataLabelInfos(dataLabelInfos);

        for (var k = 0; k < len; k++) {
            var info = dataLabelInfos[k];
            if (info.top < bound.top || info.bottom > bound.height) {
                info.skip = true;
            }
        }
        
        var fontSize = parseFloat(this._properties.get('style.fontSize'));
        var horizontalPadding = fontSize * Constants.DATALABEL.HORIZONTAL_OVERLAPPING_PADDING;
        for (var i = len - 1; i >= 0; --i) {
            var src = dataLabelInfos[i];
            if (src.skip) {
                continue;
            }
            
            for (var j = i - 1; j >= 0; --j) {
                var dest = dataLabelInfos[j];
                if (!dest.skip) {
                    dest.skip = (src.top < dest.bottom &&
                            src.bottom > dest.top &&
                            src.right > (dest.left - horizontalPadding) &&
                            src.left < (dest.right + horizontalPadding));
                }
            }
        }

        dataLabelInfos.forEach(function(info) {
            if (info.skip) {
                DOM.remove(info.node);
            }
        });
    };
    
    return VarianceBarDataLabels;
});

define('sap/viz/hichert/components/renderers/GridlineRenderer',[
    "sap/viz/framework/common/util/NumberUtils",
    "sap/viz/framework/common/util/DataGraphics",
    "sap/viz/framework/common/util/DOM"
], function(NumberUtils, DataGraphics, DOM) {

    var CLASS_ZEROLINE_GROUP = "v-zeroline-group";
    var CLASS_ZEROLINE = "v-zeroline";
    var boundLineSize = 1,
        boundLineColor = '#000000';

    var ret = {};

    function drawLine(line, color, strokeWidth, x1, x2, y1, y2){
        line.attr("stroke", color)
            .attr("stroke-width", strokeWidth)
            .attr('x1', x1)
            .attr('x2', x2)
            .attr('y1', y1)
            .attr('y2', y2);            
    }

    ret.drawZeroLine = function(selection, plot, scale, isHorizontal){
        
        var prop = plot._properties.origin;

        var node, halfStyleSize,
            color = prop.get(plot.alias + ".axisLine.color"),
            styleSize = parseFloat(prop.get(plot.alias + ".axisLine.size")),
            style = prop.get(plot.alias + ".axisLine.style");

        if (!color) {
            color = prop.get("categoryAxis.color");
        }
        if (styleSize < 3) {
            style = null;
        } else {
            styleSize = styleSize - 1;
            halfStyleSize = styleSize / 2;
        }
        node = selection.select("." + CLASS_ZEROLINE_GROUP);

        var g, rect, line, line2, lines, fill;
        if (!node.node()){
            node = selection.append("g").attr("class", CLASS_ZEROLINE_GROUP).attr("style", "pointer-events:none");
        }
        g = node.select("." + CLASS_ZEROLINE);
        if(g.node()) {
            rect = g.select("rect");
            lines = g.selectAll("line");
            line = d3.select(lines[0][0]);
            line2 = d3.select(lines[0][1]);
        }else {
            g = node.append("g").attr("class", CLASS_ZEROLINE);            
        }

        var clipPath, clipPathId, x1, x2, y1, y2, pos;
        clipPath = selection.node().getElementsByTagName('clipPath');
        if(clipPath && clipPath.length > 0) {
            clipPathId = clipPath[0].getAttribute('id');
            node.attr("clip-path", "url(#" + clipPathId + ")");
        }
        pos = NumberUtils.preciseSimple(scale.scale(0));

        if (style) {//with style fill            
            if(!rect || !rect.node()) {
                rect = g.append("rect");
            }
            if(!line2 || !line2.node()) {
                line2 = g.append("line");
            }
            if(!line || !line.node()) {
                line = g.append("line");
            }
            
            if (isHorizontal) {
                y1 = 0;
                y2 = NumberUtils.preciseSimple(plot._realSize.height);
                x1 = x2 = pos;
                x1 -= halfStyleSize;
                x2 += halfStyleSize;
                rect.attr('width', styleSize)
                    .attr('height', plot._realSize.height)
                    .attr('x', x1 )
                    .attr("stroke-width", 0);
                drawLine(line, boundLineColor, boundLineSize, x1, x1, y1, y2);
                drawLine(line2, boundLineColor, boundLineSize, x2, x2, y1, y2); 
            } else {
                x1 = 0;
                x2 = NumberUtils.preciseSimple(plot._realSize.width);
                y1 = y2 = pos;
                y1 -= halfStyleSize;
                y2 += halfStyleSize;
                rect.attr('height', styleSize)
                    .attr('width', plot._realSize.width)
                    .attr('y', y1 )
                    .attr("stroke-width", 0);
                drawLine(line, boundLineColor, boundLineSize, x1, x2, y1, y1);
                drawLine(line2, boundLineColor, boundLineSize, x1, x2, y2, y2);
            }

            if (plot._effectManager) {
                fill = plot._effectManager.register({
                    drawingEffect : plot.properties('drawingEffect'),
                    fillColor : color,
                    patternEffect: style,
                    direction : isHorizontal ? 'vertical' : 'horizontal'
                });
                rect.attr('fill', fill);
            }            
        } else {//just draw line
            if(rect){
                DOM.remove(rect);
            }
            if(line2){
                DOM.remove(line2);
            }
            if(!line || !line.node()) {
                line = g.append("line");
            }
            if (isHorizontal) {
                y1 = 0;
                y2 = NumberUtils.preciseSimple(plot._realSize.height);
                x1 = x2 = pos;
            } else {
                x1 = 0;
                x2 = NumberUtils.preciseSimple(plot._realSize.width);
                y1 = y2 = pos;                
            }
            drawLine(line, boundLineColor, boundLineSize, x1, x2, y1, y2);
        }        
    };
    
    return ret;
});
define('sap/viz/hichert/components/plots/VarianceColumnPlot',["sap/viz/framework/common/util/oo",
        "sap/viz/hichert/components/plots/BaseColumnPlot",
        'sap/viz/hichert/components/datalabels/VarianceColumnDataLabels',
        'sap/viz/hichert/components/datalabels/VarianceBarDataLabels',
        'sap/viz/chart/components/plots/ScaleHandler',
        "sap/viz/framework/scale/ValueScale",
        "sap/viz/framework/common/util/DOM",
        'sap/viz/hichert/components/util/Constants',
        'sap/viz/hichert/components/renderers/GridlineRenderer',
        'sap/viz/chart/components/util/TextUtils',
        'sap/viz/framework/common/util/ObjectUtils'
], function(oo, 
        BaseColumnPlot, 
        VarianceColumnDataLabels,
        VarianceBarDataLabels,
        ScaleHandler,
        ValueScale,
        DOM,
        Constants,
        GridlineRenderer,
        TextUtils,
        ObjectUtils) {
    
    var VarianceColumnPlot = function(runtime, option) {
        VarianceColumnPlot.superclass.constructor.apply(this, arguments);
        this._appendDataPointClass(Constants.CSS.CLASS.VARIANCE_DATAPOINT);
        this._maxGapSize = 0;
    };
    
    oo.extend(VarianceColumnPlot, BaseColumnPlot);

    var prot = VarianceColumnPlot.prototype;
    
    prot._getDataLabels = function (name, runtime) {
        if (this.isHorizontal()) {
            return new VarianceBarDataLabels(runtime, {
                name: name
            });
        } else {
            return new VarianceColumnDataLabels(runtime, {
                name: name
            });
        }
    };

    prot._getMaxGapSize = function(){
        if (this._maxGapSize){
            return this._maxGapSize;
        }

        var text = '';
        for(var i = 0; i < Constants.DELTA_PLOT.MAX_GAP_SIZE; i++ ){
            text += 'A';
        }

        var dataLabelOpt = this._properties.get('dataLabel'),
            refProp = this.isHorizontal() ? "width" : "height";

        this._maxGapSize = TextUtils.fastMeasure(text, 
                    dataLabelOpt.style.fontSize, 
                    dataLabelOpt.style.fontWeight, dataLabelOpt.style.fontFamily, 
                    dataLabelOpt.style.fontStyle)[refProp];
        return this._maxGapSize;
    };

    prot._getClipPathSize = function(width, height) {
        
        var isHorizontal = this.isHorizontal();
        
        var refPosProp = isHorizontal ? "x" : "y";
        var refProp = isHorizontal ? "width" : "height";
        var posOptionName = isHorizontal ? "beforeGap" : "afterGap";
        
        var option = this.getLayoutOption();
        
        var defaultSize = {
            x: 0,
            y: -1,
            width: width,
            height: height
        };
        
        defaultSize[refPosProp] -= option[posOptionName];
        defaultSize[refProp] += option.afterGap + option.beforeGap;

        this._clippathSize = defaultSize;
        
        return defaultSize;
    };

    prot.render = function(selection) {
        
        var sizeInfo = this._size;
        
        if (sizeInfo.width === 0 || sizeInfo.height === 0) {
            var selectionNode = selection.node();
            DOM.empty(selectionNode);
            return;
        }
        
        VarianceColumnPlot.superclass.render.call(this, selection);

        // Adjust background position as some dp and datalabel may be out of boundary.
        if (this._background && this._clippathSize) {
            this._background.adjustPosition(this._selection, this._clippathSize);
        }
    };
    

    prot._applyChanges = function() {
        var size = this._realSize;
        
        var seriesCount = this._data.targetSeriesCount;
        this._initXHandler(this._xHandlers, this._data, size.width, seriesCount);
        this._initYHandler(this._yHandlers, this._data, size.height, seriesCount);
    };
    
    prot._getGridLineScale = function(range) {
        
        var axisKey = this.alias;

        var valueAxis = this._data[axisKey];
        var scale = new ValueScale(valueAxis.scale.getDomain(), range);
        scale.setTickHint(valueAxis.tickHint);
        
        return scale;
    };
    
    prot._getValueScaleHandlers = function(isHorizontal) {

        return [ScaleHandler.getValueScaleHandler(this.alias, {
            isHorizontal: isHorizontal
        })];
    };
    
    prot._getPattern = function(data) {
        if (data.hasOwnProperty("pattern")) {
            return this._data.pattern.scale.scale(data.pattern);
        } else {
            return this._data.pattern2.scale.scale(data.pattern2);
        }
    };

    prot._drawReferenceLine = function(){
        // nothing
    };
    
    prot._drawGridlines = function(parent) {
        var size = this._realSize;
        var isHorizontal = this.isHorizontal();
        
        var range = isHorizontal ? [0, size.width] : [size.height, 0];
        var scale = this._getGridLineScale(range);

        GridlineRenderer.drawZeroLine(parent, this, scale, isHorizontal);
    };
    
    prot.setRealSize = function(size) {
        VarianceColumnPlot.superclass.setRealSize.call(this, size);
        
        if (this._dataLabels) {
            this._dataLabels.setRealSize(size);
        }
        
    };
    
    prot._postRender = function(dataPointG) {
    };

    prot._getFillColorConfig = function(config, context, disableSemantic) {
        return VarianceColumnPlot.superclass._getFillColorConfig.call(this, config, context, true);
    };

    prot._buildConfig = function(data, position, context, effectManager) {

        //delete useless version2 context from variance chart
        if(data.pattern2){
            for(var key in context) {
                if(context.hasOwnProperty(key)){
                    if(key === this._data.pattern2.metaData[0].id) {
                        delete context[key];
                        if(context[key + ".d"]) {
                            delete context[key + ".d"];
                        }
                    }
                }
            }
        }

        var config = VarianceColumnPlot.superclass._buildConfig.call(this, data, position, 
            context, effectManager);

        return config;
    };
    
    return VarianceColumnPlot;
});

define('sap/viz/hichert/components/plots/SubordinateItemScaleHandler',['sap/viz/chart/components/plots/ItemScaleHandler',
        "sap/viz/hichert/components/plots/BarWidthUtils",
        "sap/viz/chart/components/plots/BarWidthUtils"], 
function Setup(ItemScaleHandler, 
                BarWidthUtils,
                InfoBarWidthUtils) {
    
    var SubordinateItemScale = function(options, overlapMode) {
        SubordinateItemScale.superclass.constructor.call(this, options);
        this._isOverlapMode = overlapMode;
    };
    
    ItemScaleHandler.extend(SubordinateItemScale);
    
    SubordinateItemScale.prototype.init = function(seriesCount) {
        var result = this._result = [];
        var barInfo;
        if (this._isOverlapMode) {
            barInfo = BarWidthUtils.getOverlapBarInfo(seriesCount, this._options);
        } else {
            barInfo = InfoBarWidthUtils.getBarInfo(seriesCount, this._options);
        }
        
        var barWidth = barInfo.barWidth;

        for (var i = 0; i < seriesCount; i++) {
            var start = (1 - barWidth) / 2;
            result[i] = [start, start + barWidth];
        }
    };
    
    return SubordinateItemScale;
});
define('sap/viz/hichert/components/plots/DeltaPlot',["sap/viz/framework/common/util/oo",
        'sap/viz/chart/components/plots/ScaleHandler',
        "sap/viz/hichert/components/plots/VarianceColumnPlot",
        'sap/viz/chart/components/util/TextUtils',
        "sap/viz/hichert/components/plots/SubordinateItemScaleHandler",
        'sap/viz/hichert/components/util/Constants'
], function(oo, 
        ScaleHandler, 
        VarianceColumnPlot, 
        TextUtils,
        SubordinateItemScaleHandler,
        Constants) {
    
    var DeltaPlot = function(runtime, option) {
        DeltaPlot.superclass.constructor.apply(this, arguments);
    };
    
    oo.extend(DeltaPlot, VarianceColumnPlot);

    DeltaPlot.prototype.getLayoutOption = function() {
        
        var valueData = this._data[this.alias];
        var valueScale = valueData.scale;
        var valueDomain = valueScale.getDomain();
        var autoDomain = valueScale.getAutoDomain();
        
        var dataLabelOpt = this._properties.get('dataLabel');
        var refProp = this.isHorizontal() ? "width" : "height";
        
        var maxGapSize = this._getMaxGapSize();

        var beforeGap = 1;
        if (autoDomain[0] < 0) {
            beforeGap = TextUtils.fastMeasure(this._dataLabels.formatDataLabelText(autoDomain[0]), 
                    dataLabelOpt.style.fontSize, 
                    dataLabelOpt.style.fontWeight, dataLabelOpt.style.fontFamily, 
                    dataLabelOpt.style.fontStyle)[refProp];
            if (beforeGap > maxGapSize){
                beforeGap = maxGapSize;
            }
        }
        
        var afterGap = 0;
        if (autoDomain[1] >= 0) {
            afterGap = TextUtils.fastMeasure(this._dataLabels.formatDataLabelText(autoDomain[1]), 
                    dataLabelOpt.style.fontSize, 
                    dataLabelOpt.style.fontWeight, dataLabelOpt.style.fontFamily, 
                    dataLabelOpt.style.fontStyle)[refProp];
            if (afterGap > maxGapSize){
                afterGap = maxGapSize;
            }
        }

        if (this.isHorizontal()) {
            beforeGap += Constants.VARIANCE_BAR_LABEL_OFFSET;
            afterGap += Constants.VARIANCE_BAR_LABEL_OFFSET;
        }
        
        var axisLineSize = parseFloat(this._properties.origin.get(this.alias + ".axisLine.size")) / 2 || 0;
        
        return {
            beforeGap: Math.max(beforeGap, axisLineSize) + Constants.PADDING_IN_PLOTS,
            afterGap: Math.max(afterGap, axisLineSize),
            range: [valueDomain[0], valueDomain[1]],
            delta: valueDomain[1] - valueDomain[0]
        };
    };
    
    DeltaPlot.prototype._getCategoryScaleHandlers = function(isHorizontal) {
        var barProp = this._getBarProperties();
        
        var option = {
            isHorizontal: isHorizontal,
            itemScaleHandler: new SubordinateItemScaleHandler(barProp, true)
        };
        
        this._categoryScaleHandler = ScaleHandler.getCategoryScaleHandler("categoryAxis", option);
        return [this._categoryScaleHandler];
    };
    
    DeltaPlot.prototype._buildConfig = function(data, position, context, effectManager) {
        
        var config = DeltaPlot.superclass._buildConfig.call(this, data, position, context, effectManager);
        
        var scaleOption = this._data[this.alias].scale.getOption() || Constants.DELTA_PLOT.SCALE;
        if (!scaleOption.colors) {
            scaleOption.colors = Constants.DELTA_PLOT.SCALE.colors;
        }
        
        var labelValue = context[context["measureNames"]];
        
        config.graphic.fill = labelValue >= 0 ? scaleOption.colors.up : scaleOption.colors.down;
        
        var isApplyPattern = true;//this._properties.get("showPattern");
        
        if (!isApplyPattern) {
            return config;
        }
        
        var pattern = this._getPattern(data);
        
        if (pattern == null) {
            return config;
        }
        
        config.graphic.pattern = pattern.pattern;
        config.graphic.stroke = pattern.stroke;
        config.graphic.strokeWidth = pattern.strokeWidth;

        return config;
    };

    DeltaPlot.prototype._adjustPosition = function(position, seriesIndex) {
        var isHorizontal = this.isHorizontal();
        if (isHorizontal){
            if (position.width < 0){
                position.width = Math.max(-position.width, 1);
                position.x -= position.width;
            }
        }else{
            if (position.height < 0){
                position.y += position.height; 
                position.height = Math.max(-position.height, 1);
            }
        }        
    };

    return DeltaPlot;
});

define('sap/viz/hichert/components/plots/PinPlot',["sap/viz/framework/common/util/oo",
        'sap/viz/chart/components/plots/ScaleHandler',
        "sap/viz/hichert/components/plots/VarianceColumnPlot",
        'sap/viz/chart/components/util/TextUtils',
        'sap/viz/chart/components/util/DrawUtil',
        'sap/viz/framework/common/util/Constants'
], function(oo, 
        ScaleHandler, 
        VarianceColumnPlot, 
        TextUtils,
        DrawUtil,
        GridlineRenderer,
        Constants) {
    
    var BAR_WIDTH = 4;
    var PinPlot = function(runtime, option) {
        PinPlot.superclass.constructor.apply(this, arguments);
    };
    
    oo.extend(PinPlot, VarianceColumnPlot);
    
    var CategoryScaleHandler = function(id, options) {
        CategoryScaleHandler.superclass.constructor.call(this, id, options);
    };
    
    ScaleHandler.extend(CategoryScaleHandler);

    CategoryScaleHandler.prototype.init = function (categoryScale, seriesCount) {
        CategoryScaleHandler.superclass.init.apply(this, arguments);
        if (!categoryScale) {
            this._scaleByIndex = null;
            return;
        }
        var domain = categoryScale.getDomain();
        var scale = categoryScale.scale.bind(categoryScale);
        this._scaleByIndex = [];
        for (var i = 0; i < domain.length; i++) {
            this._scaleByIndex[i] = scale(domain[i]);
        }
        this._seriesCount = seriesCount;
    };

    CategoryScaleHandler.prototype.destroy = function() {
        CategoryScaleHandler.superclass.destroy.call(this);
        this._scaleByIndex = null;
    };
    
    CategoryScaleHandler.prototype.scale = function(value, options) {
        var index = options.index,
            seriesIndex = options.seriesIndex;
        var range = this._scaleByIndex ? this._scaleByIndex[index] : [0, 1];
        var step = range[1] - range[0];
        var barWidth = BAR_WIDTH;
        var start = this._range*(range[0] + step/2) - barWidth/2;
        return [start, barWidth];
    };

    PinPlot.prototype._getCategoryScaleHandlers = function(isHorizontal) {
        var barProp = this._getBarProperties();
        barProp.isHorizontal = isHorizontal;
        this._categoryScaleHandler = new CategoryScaleHandler("categoryAxis", barProp);
        return [this._categoryScaleHandler];
    };

    PinPlot.prototype._adjustPosition = function(position, seriesIndex) {
        var isHorizontal = this.isHorizontal();
        if (isHorizontal){
            if (position.width < 0){
                position.width = Math.max(-position.width, 1);
                position.x -= position.width;        
            }
        }else{
            if (position.height < 0){
                position.height = Math.max(-position.height, 1); 
                position.y -= position.height;
            }
        }       
    };

    return PinPlot;
});
define('sap/viz/hichert/components/renderers/PinRectRender',[ "sap/viz/framework/common/util/SVG" ], function(SVG) {
    var pinRectRender = function(config) {
        var node = SVG.create("g");
        //bar or column
        var rect1 = SVG.create("rect");
        var graphic = config.graphic;
        rect1.setAttribute("width", graphic.width < 1 && graphic.width !== 0 ? 1 : graphic.width);
        rect1.setAttribute("height", graphic.height < 1 && graphic.height !== 0 ? 1 : graphic.height);
        var fill1 = graphic.fill;
        if (config.effectManager) {
            fill1 = config.effectManager.register({
                drawingEffect : graphic.drawingEffect,
                fillColor : graphic.fill,
                patternEffect: graphic.pattern,
                direction : config.horizontal ? 'vertical' : 'horizontal'
            });
        }
        rect1.setAttribute("fill", fill1);
        if(graphic.shapeRendering) {
            rect1.setAttribute('shape-rendering', graphic.shapeRendering);
        } 
        if(graphic.stroke) {
            rect1.setAttribute('stroke', graphic.stroke);
            rect1.setAttribute('stroke-width', graphic.strokeWidth);
        }
        
        //small rect
        var rect2 = SVG.create("rect");
        rect2.setAttribute("x", graphic.rect.x);
        rect2.setAttribute("y", graphic.rect.y);
        rect2.setAttribute("width", graphic.rect.width < 1 && graphic.rect.width !== 0 ? 1 : graphic.rect.width);
        rect2.setAttribute("height", graphic.rect.height < 1 && graphic.rect.height !== 0 ? 1 : graphic.rect.height);
        var fill2 = graphic.rect.fill;
        if (config.effectManager) {
            fill2 = config.effectManager.register({
                drawingEffect : graphic.drawingEffect,
                fillColor : graphic.rect.fill,
                patternEffect: graphic.rect.pattern,
                direction : config.horizontal ? 'vertical' : 'horizontal'
            });
        }
        rect1.setAttribute("fill", fill1);
        rect2.setAttribute("fill", fill2);

        if (graphic.rect.stroke) {
            rect2.setAttribute('stroke', graphic.rect.stroke);
        }
        if (graphic.rect.strokeWidth) {
            rect2.setAttribute('stroke-width', graphic.rect.strokeWidth);
        }

        node.appendChild(rect2);
        node.appendChild(rect1);
        return node;
    };

    pinRectRender.update = function(node, config) {

    };

    return pinRectRender;
});
define('sap/viz/hichert/components/plots/PinRectPlot',["sap/viz/framework/common/util/oo",
        'sap/viz/chart/components/plots/ScaleHandler',
        "sap/viz/hichert/components/plots/PinPlot",
        'sap/viz/chart/components/util/TextUtils',
        'sap/viz/hichert/components/renderers/PinRectRender',
        'sap/viz/chart/components/util/DrawUtil',
        'sap/viz/hichert/components/util/Constants'
], function(oo, 
        ScaleHandler, 
        PinPlot, 
        TextUtils,
        PinRectRender,
        DrawUtil,
        Constants) {
    
    var BAR_WIDTH = 4, RECT_WIDTH = 10, RECT_HEIGHT = 10; 
    var PinRectPlot = function(runtime, option) {
        PinRectPlot.superclass.constructor.apply(this, arguments);
        this._dataPointRenderer = PinRectRender;
    };
    
    oo.extend(PinRectPlot, PinPlot);

    PinRectPlot.prototype._buildConfig = function(data, position, context, effectManager) {
        if (this.isHorizontal()) {
            position.height = BAR_WIDTH;
        } else {
            position.width = BAR_WIDTH;
        }

        var config = PinRectPlot.superclass._buildConfig.call(this, data, position, context, effectManager);
        var scaleOption = this._data[this.alias].scale.getOption() || Constants.PINRECT_PLOT.SCALE;
        if (!scaleOption.colors) {
            scaleOption.colors = Constants.PINRECT_PLOT.SCALE.colors;
        }
        
        var labelValue = context[context["measureNames"]];
        config.graphic.fill = labelValue >= 0 ? scaleOption.colors.up : scaleOption.colors.down;
        config.graphic.rect = {};
        var pattern = this._getPattern(data);
        if (pattern == null) {
            return config;
        }
        if (pattern.color) {
            config.graphic.rect.fill = pattern.color;
        }
        config.graphic.rect.width = RECT_WIDTH;
        config.graphic.rect.height = RECT_HEIGHT;
        if (this.isHorizontal()) {
            config.graphic.rect.x = position.width - RECT_WIDTH/2;
            config.graphic.rect.y = BAR_WIDTH/2 - RECT_WIDTH/2;
            if (data[this.alias] < 0) {
                config.graphic.rect.x = - RECT_WIDTH/2;
            }
        } else {
            config.graphic.rect.x = BAR_WIDTH/2 - RECT_WIDTH/2;
            config.graphic.rect.y = position.height- RECT_HEIGHT/2;
            if (data[this.alias] > 0) {
                config.graphic.rect.y = - RECT_HEIGHT/2;
            }
        }

        var isApplyPattern = true;//this._properties.get("showPattern");
        if (isApplyPattern) {
            config.graphic.rect.pattern = pattern.pattern;
            config.graphic.rect.stroke = pattern.stroke;
            config.graphic.rect.strokeWidth = pattern.strokeWidth;
        }
        return config;
    };

    PinRectPlot.prototype.getLayoutOption = function() {
        
        var valueData = this._data[this.alias];
        var valueScale = valueData.scale;
        var valueDomain = valueScale.getDomain();
        var autoDomain = valueScale.getAutoDomain();
        
        var dataLabelOpt = this._properties.get('dataLabel');
        var refProp = this.isHorizontal() ? "width" : "height";

        var maxGapSize = this._getMaxGapSize() + RECT_HEIGHT / 2;

        var beforeGap = RECT_HEIGHT / 2;
        
        if (autoDomain[0] < 0) {
            beforeGap += TextUtils.fastMeasure(this._dataLabels.formatDataLabelText(autoDomain[0]), 
                    dataLabelOpt.style.fontSize, 
                    dataLabelOpt.style.fontWeight, 
                    dataLabelOpt.style.fontFamily, 
                    dataLabelOpt.style.fontStyle)[refProp];
            if (beforeGap > maxGapSize){
                beforeGap = maxGapSize;
            }
        }
        
        var afterGap = RECT_HEIGHT / 2;
        
        if (autoDomain[1] >= 0) {
            afterGap += TextUtils.fastMeasure(this._dataLabels.formatDataLabelText(autoDomain[1]), 
                    dataLabelOpt.style.fontSize, 
                    dataLabelOpt.style.fontWeight, 
                    dataLabelOpt.style.fontFamily, 
                    dataLabelOpt.style.fontStyle)[refProp];
            if (afterGap > maxGapSize){
                afterGap = maxGapSize;
            }
        }
        if (this.isHorizontal()) {
            beforeGap += Constants.VARIANCE_BAR_LABEL_OFFSET;
            afterGap += Constants.VARIANCE_BAR_LABEL_OFFSET;
        }
        var axisLineSize = parseFloat(this._properties.origin.get(this.alias + ".axisLine.size")) / 2 || 0;
        
        var fixedRatio = this._properties.origin.get(this.alias + ".layout.proportion");
        if (fixedRatio === undefined || fixedRatio === null || fixedRatio <= 0) {
            fixedRatio = Constants.VARIANCE_DEF_RATIO;
        } else if (fixedRatio > Constants.VARIANCE_MAX_RATIO) {
            fixedRatio = Constants.VARIANCE_MAX_RATIO;
        }

        return {
            fixedRatio: fixedRatio,
            beforeGap: Math.max(beforeGap, axisLineSize) + Constants.PADDING_IN_PLOTS,
            afterGap: Math.max(afterGap, axisLineSize),
            range: [valueDomain[0], valueDomain[1]],
            delta: valueDomain[1] - valueDomain[0]
        };
    };
    
    return PinRectPlot;
});

define('sap/viz/hichert/components/renderers/PinCircleRender',[ "sap/viz/framework/common/util/SVG" ], function(SVG) {
    var pinRender = function(config) {
        var node = SVG.create("g");
        //bar or column
        var rect = SVG.create("rect");
        var graphic = config.graphic;
        rect.setAttribute("width", graphic.width < 1 && graphic.width !== 0 ? 1 : graphic.width);
        rect.setAttribute("height", graphic.height < 1 && graphic.height !== 0 ? 1 : graphic.height);
        var fill1 = graphic.fill;
        if (config.effectManager) {
            fill1 = config.effectManager.register({
                drawingEffect : graphic.drawingEffect,
                fillColor : graphic.fill,
                patternEffect: graphic.pattern,
                direction : config.horizontal ? 'vertical' : 'horizontal'
            });
        }
        rect.setAttribute("fill", fill1);
        if(graphic.shapeRendering) {
            rect.setAttribute('shape-rendering', graphic.shapeRendering);
        } 
        if(graphic.stroke) {
            rect.setAttribute('stroke', graphic.stroke);
            rect.setAttribute('stroke-width', graphic.strokeWidth);
        }
        
        //small circle
        var circleGraphic = graphic.circle;
        var circle = SVG.create("circle");
        circle.setAttribute("cx", circleGraphic.x);
        circle.setAttribute("cy", circleGraphic.y);
        circle.setAttribute("r", circleGraphic.radius);
        var fill2 = circleGraphic.fill;
        if (config.effectManager) {
            fill2 = config.effectManager.register({
                drawingEffect : graphic.drawingEffect,
                fillColor : circleGraphic.fill,
                patternEffect: circleGraphic.pattern,
                direction : config.horizontal ? 'vertical' : 'horizontal'
            });
        }
        rect.setAttribute("fill", fill1);
        circle.setAttribute("fill", fill2);

        if (circleGraphic.stroke) {
            circle.setAttribute('stroke', circleGraphic.stroke);
        }
        if (circleGraphic.strokeWidth) {
            circle.setAttribute('stroke-width', circleGraphic.strokeWidth);
        }
        
        node.appendChild(circle);
        node.appendChild(rect);
        return node;
    };

    pinRender.update = function(node, config) {

    };

    return pinRender;
});
define('sap/viz/hichert/components/plots/PinCirclePlot',["sap/viz/framework/common/util/oo",
        'sap/viz/chart/components/plots/ScaleHandler',
        "sap/viz/hichert/components/plots/PinPlot",
        'sap/viz/chart/components/util/TextUtils',
        'sap/viz/hichert/components/renderers/PinCircleRender',
        'sap/viz/chart/components/util/DrawUtil',
        'sap/viz/hichert/components/util/Constants'
], function(oo, 
        ScaleHandler, 
        PinPlot, 
        TextUtils,
        PinCircleRender,
        DrawUtil,
        Constants) {
    
    var BAR_WIDTH = 4, CIRCLE_RADIUS = 6; 
    var PinCirclePlot = function(runtime, option) {
        PinCirclePlot.superclass.constructor.apply(this, arguments);
        this._dataPointRenderer = PinCircleRender;
    };
    
    oo.extend(PinCirclePlot, PinPlot);

    PinCirclePlot.prototype._buildConfig = function(data, position, context, effectManager) {
        if (this.isHorizontal()) {
            position.height = BAR_WIDTH;
        } else {
            position.width = BAR_WIDTH;
        }

        var config = PinCirclePlot.superclass._buildConfig.call(this, data, position, context, effectManager);
        var scaleOption = this._data[this.alias].scale.getOption() || Constants.PINRECT_PLOT.SCALE;
        if (!scaleOption.colors) {
            scaleOption.colors = Constants.PINRECT_PLOT.SCALE.colors;
        }

        var labelValue = context[context["measureNames"]];
        config.graphic.fill = labelValue >= 0 ? scaleOption.colors.up : scaleOption.colors.down;
        config.graphic.circle = {};
        var pattern = this._getPattern(data);
        if (pattern == null) {
            return config;
        }
        if (pattern.color) {
            config.graphic.circle.fill = pattern.color;
        }
        config.graphic.circle.radius = CIRCLE_RADIUS;
        if (this.isHorizontal()) {
            config.graphic.circle.x = data[this.alias] > 0 ? position.width : 0;
            config.graphic.circle.y = BAR_WIDTH / 2;
        } else {
            config.graphic.circle.x = BAR_WIDTH / 2;
            config.graphic.circle.y = data[this.alias] > 0 ? 0 : position.height;
        }
        
        config.graphic.circle.pattern = pattern.pattern;
        config.graphic.circle.stroke = pattern.stroke;
        config.graphic.circle.strokeWidth = pattern.strokeWidth;
        
        return config;
    };

    PinCirclePlot.prototype.getLayoutOption = function() {
        
        var valueData = this._data[this.alias];
        var valueDomain = valueData.scale.getDomain();
        
        var dataLabelOpt = this._properties.get('dataLabel');
        var refProp = this.isHorizontal() ? "width" : "height";
        
        var maxGapSize = this._getMaxGapSize() + CIRCLE_RADIUS;
        var beforeGap = CIRCLE_RADIUS;
        
        if (valueDomain[0] < 0) {
            beforeGap += TextUtils.fastMeasure(this._dataLabels.formatDataLabelText(valueDomain[0]), 
                    dataLabelOpt.style.fontSize, 
                    dataLabelOpt.style.fontWeight, 
                    dataLabelOpt.style.fontFamily, 
                    dataLabelOpt.style.fontStyle)[refProp];
            if (beforeGap > maxGapSize){
                beforeGap = maxGapSize;
            }
        }
        
        var afterGap = CIRCLE_RADIUS;
        
        if (valueDomain[1] >= 0) {
            afterGap += TextUtils.fastMeasure(this._dataLabels.formatDataLabelText(valueDomain[1]), 
                    dataLabelOpt.style.fontSize, 
                    dataLabelOpt.style.fontWeight,
                    dataLabelOpt.style.fontFamily, 
                    dataLabelOpt.style.fontStyle)[refProp];
            if (afterGap > maxGapSize){
                afterGap = maxGapSize;
            }
        }
        
        var fixedRatio = this._properties.origin.get(this.alias + ".layout.proportion");
        if (fixedRatio === undefined || fixedRatio === null || fixedRatio <= 0) {
            fixedRatio = Constants.VARIANCE_DEF_RATIO;
        } else if (fixedRatio > Constants.VARIANCE_MAX_RATIO) {
            fixedRatio = Constants.VARIANCE_MAX_RATIO;
        }

        if (this.isHorizontal()) {
            beforeGap += Constants.VARIANCE_BAR_LABEL_OFFSET;
            afterGap += Constants.VARIANCE_BAR_LABEL_OFFSET;
        }
        
        return {
            fixedRatio: fixedRatio,
            beforeGap: beforeGap + Constants.PADDING_IN_PLOTS,
            afterGap: afterGap,
            range: [valueDomain[0], valueDomain[1]],
            delta: valueDomain[1] - valueDomain[0]
        };
    };
    
    return PinCirclePlot;
});
define('sap/viz/hichert/components/plots/DualLinePlot',[
    "sap/viz/framework/common/util/oo",
    "sap/viz/chart/components/plots/LinePlot",
    'sap/viz/chart/components/plots/SeriesIterator',
    'sap/viz/chart/components/util/TextUtils',
    "sap/viz/framework/scale/ValueScale",
    "sap/viz/framework/scale/CategoryScale",
    'sap/viz/chart/components/renderers/GridlineRenderer',
    'sap/viz/hichert/components/util/Constants',
    "sap/viz/hichert/components/referenceline/HichertReferenceLine"
], function(
    oo, 
    InfoLinePlot,
    SeriesIterator,
    TextUtils,
    ValueScale,
    CategoryScale,
    GridlineRenderer,
    Constants,
    HichertReferenceLine    
) {
    
    var DualLinePlot = function() {
        DualLinePlot.superclass.constructor.apply(this, arguments);
        this._dpInfos = {};
    };
    
    oo.extend(DualLinePlot, InfoLinePlot);
    
    DualLinePlot.prototype.getLayoutOption = function() {
        
        var valueData = this._data["valueAxis"];
        var valueDomain = valueData.scale.getDomain();
        
        var valueData2 = this._data["valueAxis2"];
        var valueDomain2 = valueData.scale.getDomain();
        
        var minRange = Math.min(valueDomain[0], valueDomain2[0]);
        var maxRange = Math.max(valueDomain[1], valueDomain2[1]);
        
        return {
            beforeGap: 0,
            afterGap: 0,
            range: [minRange, maxRange],
            delta: maxRange - minRange
        };
    };
    
    DualLinePlot.prototype._buildConfig = function(data, position, context, effectManager) {
        
        var config = DualLinePlot.superclass._buildConfig.call(this, data, position, context, effectManager);
        
        var pattern = this._getPattern(data);
        
        if (pattern == null) {
            return config;
        }
        
        if (pattern.color) {
            config.graphic.fill = pattern.color;
        }
        
        var isApplyPattern = true;//this._properties.get("showPattern");
        
        if (isApplyPattern) {
            config.graphic.pattern = pattern.pattern;
            config.graphic.stroke = pattern.stroke;
            config.graphic.strokeWidth = pattern.strokeWidth;
        }

        config.seriesColor = Constants.DUAL_LINE_COLOR;
        return config;
    };
    
    DualLinePlot.prototype._getPattern = function(data) {
        if (data.hasOwnProperty("valueAxis2")) {
            if(data.hasOwnProperty("pattern2")){
                return this._data.pattern2.scale.scale(data.pattern2);
            }else{
                return this._data.pattern2.scale.scale(Constants.DEFAULTPATTERN2);
            }
        } else {
            if(data.hasOwnProperty("pattern")){
                return this._data.pattern.scale.scale(data.pattern);
            }else{
                return this._data.pattern.scale.scale(Constants.DEFAULTPATTERN);
            }
        }
    };

    DualLinePlot.prototype._drawReferenceLine = function(){
        var referenceLine = this._properties.get('referenceLine');
        if (null == referenceLine || !HichertReferenceLine) {
            return;
        }
        var props = {
            referenceLine: referenceLine
        };
        var lines = referenceLine.line;
        for(var key in lines) {
            if(lines.hasOwnProperty(key)) {
                props[key + 'Color'] = this._properties.origin.get(key + '.color');
            }
        }
        HichertReferenceLine.render(this._xHandlers, this._yHandlers, props,
                this._size.width, this._size.height, this._selection.node(),
                this._data._seriesType === 'percentage');

    };

    DualLinePlot.prototype.createSeriesIterator = function(len) {
        return SeriesIterator.create(len, "reverse_with_series");
    };

    DualLinePlot.prototype._drawDataPoint = function(dpRenderer, dataPoint){
        this._dpInfos[dataPoint.getDataId()] = dataPoint;
        var dp = DualLinePlot.superclass._drawDataPoint.apply(this, arguments);
        return dp;
    };

    DualLinePlot.prototype.mappingDataPointInfo = function(dataId) {
        var dpInfo = this._dpInfos[dataId];
        
        var config = dpInfo.getConfig();
        var graphic = config.graphic;
        
        return {
            stroke: graphic.stroke,
            strokeWidth: graphic.strokeWidth
        };
    };

    return DualLinePlot;
});
define('sap/viz/hichert/components/plots/PlotFactory',[
    'sap/viz/chart/components/plots/PlotFactory',
    'sap/viz/hichert/components/plots/LinePlot',
    'sap/viz/hichert/components/plots/ColumnPlot',
    'sap/viz/hichert/components/plots/StackedColumnPlot',
    'sap/viz/hichert/components/plots/DeltaPlot',
    'sap/viz/hichert/components/plots/PinRectPlot',
    'sap/viz/hichert/components/plots/PinCirclePlot',
    'sap/viz/hichert/components/plots/DualLinePlot'
], function Setup(PlotFactory, 
        LinePlot,
        ColumnPlot, 
        StackedColumnPlot, 
        DeltaPlot,
        PinRectPlot,
        PinCirclePlot,
        DualLinePlot) {
    
    var plotMapping = {
        "hichert_bar": {
            plotClazz: ColumnPlot,
            options: {
                isHorizontal: true
            }
        },
        "hichert_column": {
            plotClazz: ColumnPlot,
            options: {
                isHorizontal: false
            }
        },
        "hichert_delta_variance": {
            plotClazz: DeltaPlot,
            options: {}
        },
        "hichert_percentage_delta_variance": {
            plotClazz: PinRectPlot,
            options: {}
        },
        'hichert_line': {
            plotClazz: LinePlot,
            options: {
                isHorizontal: false
            }
        },
        'hichert_variance_line': {
            plotClazz: DualLinePlot,
            options: {
                isHorizontal: false
            }
        },
        "hichert_delta_percentage_line_variance": {
            plotClazz: PinCirclePlot,
            options: {}
        },
        "hichert_delta_line_variance": {
            plotClazz: DeltaPlot,
            options: {}
        },
        "hichert_stacked_column": {
            plotClazz: StackedColumnPlot,
            options: {
                isHorizontal: false
            }
        },
        "hichert_stacked_bar": {
            plotClazz: StackedColumnPlot,
            options: {
                isHorizontal: true
            }
        }
    };
    
    for (var name in plotMapping) {
        if (plotMapping.hasOwnProperty(name)) {
            PlotFactory.register(name, plotMapping[name]);
        }
    }
    
    return {
        create: function(renderType, runtime, options) {
            return PlotFactory.create(renderType, runtime, options);
        },
        getOptions: function(renderType) {
            return PlotFactory.getOptions(renderType);
        }
    };

});

define('sap/viz/hichert/components/axis/renderer/DefaultCategoryLabelRenderer',["sap/viz/hichert/components/util/Constants",
    "sap/viz/framework/common/util/SVG",
    "sap/viz/framework/common/util/NumberUtils",
    "sap/viz/chart/components/util/StyleUtils",
    "sap/viz/chart/components/util/TextUtils",
    "sap/viz/framework/common/util/DataGraphics"
], function(Constants, SVG, NumberUtils, StyleUtils, TextUtils, DataGraphics) {

    function measureTextSize(text, style) {
        var textSize = TextUtils.canvasMeasure(text, style['fontSize'], style['fontWeight'],
            style['fontFamily']);
        return textSize;
    }

    function defaultLabelRenderer(config) {
        var textNode = SVG.create("text");
        var text = config.text,
            style = config.styles;
        textNode.textContent = text;
        var offset = TextUtils.getTextBaselineOffset({
            fontSize: style['fontSize'],
            fontWeight: style['fontWeight'],
            fontFamily: style['fontFamily']
        });
        
        var textSize = measureTextSize(text, style);
        var textWidth = NumberUtils.preciseSimple(textSize.width);
        var textHeight = NumberUtils.preciseSimple(textSize.height);
        
        var sizeLimit = config.sizeLimit;
        if (sizeLimit >= 0 && textWidth > sizeLimit) {
            TextUtils.ellipsis(text, textNode, sizeLimit, StyleUtils.convertToCss(style));
        }
        var textPos = defaultLabelRenderer.calculatePosition(config, offset, textWidth, textHeight);
        textNode.setAttribute("x", textPos.x);
        textNode.setAttribute("y", textPos.y);
        textNode.setAttribute("text-anchor", textPos.textAnchor);
        if (config.rotated) {
            var textHeightOffset = getRotatedTextHeightOffset(textHeight, config.rotationAngle);
            textNode.setAttribute("transform", 
                "translate(0," + textHeightOffset + ") rotate(-" + config.rotationAngle + "," + 
                    textPos.x + "," + textPos.y + ")");
            var rotation = {
                'r' : '-'+config.rotationAngle,
                'x' : textPos.x, 
                'y' : textPos.y
            };
            DataGraphics.setData(textNode, rotation);
        }
        return textNode;
    }

    var getRotatedTextHeightOffset = function(textHeight, textAngle) {
        return (textHeight * Math.cos(textAngle * Math.PI/180) * 0.7);
    };

    var hasUnfilteredFirstChild = function(config) {
        return !!config.unfilteredFirstChild;
    };

    var getUnfilteredFirstLeaf = function(config) {
        var firstChild = config.unfilteredFirstChild;
        while(firstChild.children && firstChild.children.length) {
            firstChild = firstChild.children[0];
        }
        return firstChild;
    };

    defaultLabelRenderer.calculatePosition = function(config, offset, textWidth, textHeight) {
        var x, y, textAnchor, firstChild;
        var size = config.size;
        var LABEL_OFFSET = 6;
        var textOffset = LABEL_OFFSET;
        var labelOffset = config.labelOffset;
        var needRowAxisOffset = config.needRowAxisOffset;
        
        switch (config.position) {
            case Constants.POSITION.LEFT:
            case Constants.POSITION.RIGHT:
                y = textHeight / 2 - offset;
                if (needRowAxisOffset) {
                    y += textHeight / 2 - offset + labelOffset;
                } else {
                    if (hasUnfilteredFirstChild(config)) {
                        firstChild = getUnfilteredFirstLeaf(config);
                        y += Math.max(firstChild.cellHeight / 2, LABEL_OFFSET);
                    } else {
                        y += size.height / 2;
                    }
                }

                if (config.position === Constants.POSITION.LEFT) {
                    x = size.width - textOffset;
                    textAnchor = "end";
                } else {
                    x = textOffset;
                    textAnchor = "start";
                }
                break;
            case Constants.POSITION.TOP:
                if (config.rotated) {
                    textAnchor = "start";
                    x = Math.min(size.width / 2 + textHeight / 2 - offset, 2*LABEL_OFFSET);
                    y = size.height - textOffset;
                } else {
                    if (hasUnfilteredFirstChild(config)) {
                        firstChild = getUnfilteredFirstLeaf(config);
                        x = Math.max((firstChild.cellWidth - textWidth) / 2, 1);
                        textAnchor = "start";
                    } else {
                        textAnchor = "middle";
                        x = size.width / 2;
                    }
                    y = size.height - textOffset - offset;
                }
                break;
            case Constants.POSITION.BOTTOM:
                if (config.rotated) {
                    textAnchor = "end";
                    x = Math.min(size.width / 2 + textHeight / 2 - offset, 2*LABEL_OFFSET);
                    y = textOffset;
                } else {
                    if (hasUnfilteredFirstChild(config)) {
                        firstChild = getUnfilteredFirstLeaf(config);
                        x = Math.max((firstChild.cellWidth - textWidth) / 2, 1);
                        textAnchor = "start";
                    } else {
                        textAnchor = "middle";
                        x = size.width / 2;
                    }
                    y = textOffset + textHeight - offset;
                }
                break;
        }
        return {
            x: x,
            y: y,
            textAnchor: textAnchor
        };
    };

    defaultLabelRenderer.update = function(textNode, config) {
        var text = config.text;
        var style = config.styles;
        var offset = TextUtils.getTextBaselineOffset({
            fontSize: style.fontSize,
            fontWeight: style.fontWeight,
            fontFamily: style.fontFamily
        });
        var textSize = measureTextSize(text, style);
        var textWidth = NumberUtils.preciseSimple(textSize.width);
        var textHeight = NumberUtils.preciseSimple(textSize.height);
        var textPos = defaultLabelRenderer.calculatePosition(config, offset, textWidth, textHeight);
        var sizeLimit = config.sizeLimit;
        if (sizeLimit >= 0 && textWidth > sizeLimit) {
            TextUtils.ellipsis(text, textNode, sizeLimit, StyleUtils.convertToCss(style));
        } else {
            textNode.textContent = text;
        }
        textNode.setAttribute("x", textPos.x);
        textNode.setAttribute("y", textPos.y);
        textNode.setAttribute("text-anchor", textPos.textAnchor);
        if (config.rotated) {
            var textHeightOffset = getRotatedTextHeightOffset(textHeight, config.rotationAngle);
            textNode.setAttribute("transform", 
                "translate(0," + textHeightOffset + ") rotate(-" + config.rotationAngle + "," + 
                    textPos.x + "," + textPos.y + ")");
            var rotation = {
                'r' : '-'+config.rotationAngle,
                'x' : textPos.x, 
                'y' : textPos.y
            };
            DataGraphics.setData(textNode, rotation);
        } else {
            textNode.removeAttribute("transform");
        }
    };

    defaultLabelRenderer.getPreferredSize = function(config) {
        var VERTICAL_ANGLE = 90;
        var LABEL_OFFSET = 6;
        var text = config.text,
            style = config.styles;

        var MIN_TEXT_WIDTH = measureTextSize("M...", style).width;
        var textSize = measureTextSize(text, style);

        var textHeight = textSize.height;
        var textHeightOffset = getRotatedTextHeightOffset(textHeight, config.rotationAngle);
        var cellHeight = textSize.height,
            cellWidth = textSize.width,
            rotated;
        if ((config.rotated || textSize.width > config.size) &&
            (config.position === Constants.POSITION.TOP || config.position === Constants.POSITION
                .BOTTOM)) {
            if(!config.rotated && config.disableAutoRotation) {
                //keep horizontal, but update cellWidth
                rotated = false;
                cellWidth = config.size;
            }
            else {
                //rotation
                rotated = true;
                cellWidth = textSize.height;
                if(config.rotationAngle === VERTICAL_ANGLE) {
                    cellHeight = textSize.width;
                }
                else {
                    var labelLocation = config.cellWidth/2 + config.cellStart;
                    var labelSize = labelLocation/(Math.cos(config.rotationAngle * Math.PI/180));
                    if(textSize.width < labelSize) {
                        labelSize = textSize.width;
                    }

                    cellHeight = labelSize * (Math.sin(config.rotationAngle * Math.PI/180));
                    cellHeight += textHeightOffset;

                    //cellWidth should consider rotation angle
                    var cellWidthPlusRotation = (cellWidth / Math.sin(config.rotationAngle * Math.PI/180)) * 0.9;
                    if(cellWidthPlusRotation > cellWidth) {
                        cellWidth = cellWidthPlusRotation;
                    }
                }
                if (cellWidth > config.size && config.layer > 0) {
                    cellHeight = 0;
                }
            }
        }
        var ret = {
            cellWidth: cellWidth,
            cellHeight: cellHeight,
            rotated: rotated
        };
        if (config.position === Constants.POSITION.TOP || config.position === Constants.POSITION
            .BOTTOM) { //horizontal
            if(rotated) {
                ret['minCellHeight'] = Math.min(MIN_TEXT_WIDTH, textSize.width);
                if(config.rotationAngle !== VERTICAL_ANGLE) {
                    ret['minCellHeight'] = ret['minCellHeight'] * 
                                           Math.sin(config.rotationAngle * Math.PI/180);
                    ret['minCellHeight'] += (2*textHeightOffset - 2*LABEL_OFFSET + 1);
                }
            }
            else {
                ret['minCellHeight'] = textSize.height;
                if(ret.cellWidth < Math.min(MIN_TEXT_WIDTH, textSize.width)) {
                    ret.noLabelSpace = true;
                }
            }
        } else { //vertical
            ret['minCellWidth'] = Math.min(MIN_TEXT_WIDTH, textSize.width);
        }
        return ret;
    };

    defaultLabelRenderer.autoHide = function(isVertical, layer) {
        return true;
    };

    return defaultLabelRenderer;
});

define('sap/viz/hichert/components/axis/renderer/CategoryBodyRenderer',["sap/viz/chart/components/axis/renderer/OrdinalCommonBodyRenderer",
    "sap/viz/hichert/components/util/Constants",
    "sap/viz/framework/common/util/TypeUtils",
    "sap/viz/framework/common/util/NameColorUtils",
    "sap/viz/framework/common/util/NumberUtils",
    "sap/viz/hichert/components/axis/renderer/DefaultCategoryLabelRenderer",
    "sap/viz/framework/common/util/oo"
], function(OrdinalCommonBodyRenderer,
    Constants,
    TypeUtils,
    NameColorUtils,
    NumberUtils,
    DefaultCategoryLabelRenderer,
    oo) {

    var AXIS_CLASS_NAMES = Constants.CSS.CLASS.AXIS;

    var HichertCategoryBodyRenderer = function() {
        HichertCategoryBodyRenderer.superclass.constructor.apply(this, arguments);
        this.defaultCategoryLabelRenderer = DefaultCategoryLabelRenderer;
        this._isShowPattern = false;
    };

    oo.extend(HichertCategoryBodyRenderer, OrdinalCommonBodyRenderer);

    function getLayersBand(layers, depth) {
        var ret = 0;
        for (var i = 0; i < depth; ++i) {
            ret += layers[i].layerBand;
        }
        return ret;
    }

    HichertCategoryBodyRenderer.prototype.isShowPattern = function(_) {
        if(arguments.length) {
            this._isShowPattern = _;
        }
        return this._isShowPattern;
    };

    HichertCategoryBodyRenderer.prototype.drawLines = function(selection, range, width, height, position, props,
        effectManager) {
        var isShowPattern = this.isShowPattern();
        var lineClass = AXIS_CLASS_NAMES.PERIMETER;
        lineClass = lineClass + " " + AXIS_CLASS_NAMES.LINE;
        var x1 = 0,
            y1 = 0,
            x2 = 0,
            y2 = 0;
        var stroke = effectManager.register({
            fillColor: NameColorUtils.convertColor(props.color)
        });
        var strokeWidth = props.axisLine.size;
        if (!TypeUtils.isNumber(strokeWidth)) {
            strokeWidth = 1;
        }
        var start, end;
        if (range[0] < range[1]) {
            start = range[0] - strokeWidth / 2;
            end = range[1] + strokeWidth / 2;
        } else {
            start = range[1] - strokeWidth / 2;
            end = range[0] + strokeWidth / 2;
        }

        var parentNode = selection.node();
        var lines = selection.node().querySelectorAll("." + AXIS_CLASS_NAMES.LINE);

        var lineTag = [];
        var lineLength = isShowPattern ? 2 : 1;

        for (var i = lines.length; i < lineLength; i++) {
            lineTag[i] = selection.append("line")
                .attr("class", lineClass)
                .attr("stroke", stroke)
                .attr("stroke-width", strokeWidth)
                .attr("shape-rendering", "crispEdges");
        }
        var padding = Constants.AXIS.LINE_SIZE + strokeWidth;


        for (var index = 0; index < lineLength; index++) {

            var x, y;

            switch (position) {
                case Constants.POSITION.LEFT:
                    x = width - padding * index;
                    x1 = x;
                    y1 = start;
                    x2 = x;
                    y2 = end;
                    break;
                case Constants.POSITION.RIGHT:
                    x = padding * index;
                    x1 = x;
                    y1 = start;
                    x2 = x;
                    y2 = end;
                    break;
                case Constants.POSITION.TOP:
                    y = height - padding * index;
                    x1 = start;
                    y1 = y;
                    x2 = end;
                    y2 = y;
                    break;
                case Constants.POSITION.BOTTOM:
                    y = padding * index;
                    x1 = start;
                    y1 = y;
                    x2 = end;
                    y2 = y;
                    break;
            }

            lineTag[index].attr("x1", x1).attr("y1", y1)
                .attr("x2", x2).attr("y2", y2);
        }

        return lineTag;
    };

    HichertCategoryBodyRenderer.prototype.drawTicks = function(
        selection, layers, ticks, bound, position, props, effectManager,
        tickProps, lastLayer) {
        var width = bound.width,
            height = bound.height;
        this._drawPattern(selection, width, height, position, effectManager, tickProps, lastLayer);
        if (!layers.length || !ticks.length) {
            return;
        }

        function getTicksLength(layers, ticks) {
            var ticksNumber = ticks[0].length;
            var ticksLength = [];
            var tick, depth, layersNumber = layers.length;
            for (var i = 0; i < ticksNumber; ++i) {
                depth = 0;
                tick = ticks[depth][i];
                while (depth < layersNumber && ticks[depth].indexOf(tick) > -1) {
                    depth++;
                }
                var tickLength = Constants.AXIS.TICK_SIZE;
                var isLongTick = false;
                if (depth === layers.length && depth !== 1) {
                    tickLength = getLayersBand(layers, depth);
                    isLongTick = true;
                }
                ticksLength.push({
                    length: tickLength,
                    isLongTick: isLongTick
                });
            }
            return ticksLength;
        }


        var ticksReversed = ticks.slice().reverse();
        var layersReversed = layers.slice().reverse();
        var ticksLength = getTicksLength(layersReversed, ticksReversed);
        this._drawTicks(selection, ticksReversed[0], width, height, position, ticksLength,
            props, effectManager, props.axisLine.size, layersReversed);

    };

    HichertCategoryBodyRenderer.prototype._drawPattern = function(selection, width, height, position, effectManager, 
        tickProps, lastLayer) {
        if (this.isShowPattern()) {
            var rectangles = [];
            var valueAxisRectClassPrefix = "v-valueaxisrect";
            var fill,
                x = 0,
                y = 0;
            for (var j = 0; j < lastLayer.cells.length; j++) {
                fill = effectManager.register({
                    drawingEffect: 'normal',
                    fillColor: tickProps[j].color,
                    patternEffect: tickProps[j].pattern,
                    direction: 'vertical'
                });

                if (position === Constants.POSITION.LEFT) {
                    x = width - Constants.AXIS.TICK_SIZE;
                    rectangles.push({
                        fill: fill,
                        x: x,
                        y: lastLayer.cells[j].cellStart,
                        width: Constants.AXIS.TICK_SIZE,
                        height: lastLayer.cells[j].cellHeight
                    });
                } else if (position === Constants.POSITION.RIGHT) {
                    x = 0;
                    rectangles.push({
                        fill: fill,
                        x: x,
                        y: lastLayer.cells[j].cellStart,
                        width: Constants.AXIS.TICK_SIZE,
                        height: lastLayer.cells[j].cellHeight
                    });
                } else if (position === Constants.POSITION.TOP) {
                    y = height - Constants.AXIS.TICK_SIZE;
                    rectangles.push({
                        fill: fill,
                        x: lastLayer.cells[j].cellStart,
                        y: y,
                        width: lastLayer.cells[j].cellWidth,
                        height: Constants.AXIS.TICK_SIZE
                    });
                } else {
                    y = 0;
                    rectangles.push({
                        fill: fill,
                        x: lastLayer.cells[j].cellStart,
                        y: y,
                        width: lastLayer.cells[j].cellWidth,
                        height: Constants.AXIS.TICK_SIZE
                    });
                }
            }
            var tickRectSelections = selection.selectAll("." + valueAxisRectClassPrefix).data(rectangles);
            tickRectSelections.enter().append("rect")
                .each(function(d, i) {
                    var className = valueAxisRectClassPrefix;
                    this.setAttribute("class", className);
                    this.setAttribute("shape-rendering", "crispEdges");
                    this.setAttribute("fill", d.fill);
                });
            tickRectSelections.exit().remove();
            tickRectSelections.each(function(d, i) {
                this.setAttribute("x", d.x);
                this.setAttribute("y", d.y);
                this.setAttribute("width", d.width);
                this.setAttribute("height", d.height);
            });
        }
    };

    HichertCategoryBodyRenderer.prototype._drawTicks = function(selection, ticksToDraw, width, height,
        position, ticksLength, props, effectManager, strokeWidth, layersReversed) {
        var isShowPattern = this.isShowPattern();
        var commonClassPrefix = AXIS_CLASS_NAMES.PERIMETER;
        var tickClass = commonClassPrefix + " " + AXIS_CLASS_NAMES.TICK;
        var longTickClass = commonClassPrefix + " " + AXIS_CLASS_NAMES.LONGTICK;


        var isShowPatternDivider = props.axisLine.visible && props.axisLine.showPatternDivider;

        var stroke = effectManager.register({
            fillColor: props.color
        });

        var i = 0,
            length = ticksToDraw.length;
        var lines = [];
        var tickOffset = isShowPattern ? Constants.AXIS.TICK_SIZE : 0;

        switch (position) {
            case Constants.POSITION.LEFT:
                for (; i < length; ++i) {
                    if (ticksLength[i].isLongTick && isShowPattern) {
                        lines.push({
                            x1: width - tickOffset,
                            y1: ticksToDraw[i],
                            x2: width - ticksLength[i].length - tickOffset,
                            y2: ticksToDraw[i]
                        });
                    }
                }
                break;
            case Constants.POSITION.RIGHT:

                for (; i < length; ++i) {
                    if (ticksLength[i].isLongTick && isShowPattern) {
                        lines.push({
                            x1: tickOffset,
                            y1: ticksToDraw[i],
                            x2: ticksLength[i].length + tickOffset,
                            y2: ticksToDraw[i]
                        });
                    }
                }
                break;

            case Constants.POSITION.TOP:
                for (; i < length; ++i) {
                    if (ticksLength[i].isLongTick && isShowPattern) {
                        lines.push({
                            x1: ticksToDraw[i],
                            y1: height - tickOffset,
                            x2: ticksToDraw[i],
                            y2: height - ticksLength[i].length - tickOffset
                        });
                    }
                }
                break;
            case Constants.POSITION.BOTTOM:

                for (; i < length; ++i) {
                    if (ticksLength[i].isLongTick && isShowPattern) {
                        lines.push({
                            x1: ticksToDraw[i],
                            y1: tickOffset,
                            x2: ticksToDraw[i],
                            y2: ticksLength[i].length + tickOffset
                        });
                    }
                }
                break;
        }

        if (isShowPatternDivider) {
            var tickSelections = selection.selectAll("." + commonClassPrefix).data(lines);
            tickSelections.enter().append("line")
                .each(function(d, i) {
                    var className = tickClass;
                    if (ticksLength[i].isLongTick) {
                        className = longTickClass;
                    }
                    this.setAttribute("class", className);
                    this.setAttribute("stroke", stroke);
                    this.setAttribute("stroke-width", strokeWidth);
                    this.setAttribute("shape-rendering", "crispEdges");
                });
            tickSelections.exit().remove();
            tickSelections.each(function(d, i) {
                this.setAttribute("x1", d.x1);
                this.setAttribute("y1", d.y1);
                this.setAttribute("x2", d.x2);
                this.setAttribute("y2", d.y2);
            });
        } else {
            selection.selectAll("." + commonClassPrefix).remove();
        }
    };

    HichertCategoryBodyRenderer.prototype.getAxisLineSize = function() {
        return Constants.AXIS.LINE_SIZE;
    };

    HichertCategoryBodyRenderer.prototype._setLabelParameters = function(labels, position, baseline,
        width, height, textOffset, layer) {
        var LABEL_OFFSET = Constants.AXIS.TICK_SIZE,
            isShowPattern = this.isShowPattern();
        HichertCategoryBodyRenderer.superclass._setLabelParameters.apply(this, arguments);
        labels.forEach(function(label) {
            if(position === Constants.POSITION.BOTTOM && isShowPattern) {
                label.y += LABEL_OFFSET;
            }
        });
    };

    return HichertCategoryBodyRenderer;
});
define('sap/viz/hichert/components/util/HichertBuildLayerUtil',[
    "sap/viz/chart/components/util/BuildLayerUtil",
    "sap/viz/framework/common/util/ObjectUtils",
    "sap/viz/framework/common/util/DataUtils"
], function(BuildLayerUtil,
    ObjectUtils,
    DataUtils) {
    var HichertBuildLayerUtil = ObjectUtils.extend({}, BuildLayerUtil);
    
    HichertBuildLayerUtil._mergeCtx = function(ctx, bindingFieldIds) {
        var length = ctx.length;
        var ret = {};
        var value;
        var additionalDomainCount = ctx.length - bindingFieldIds.length;
        length -= additionalDomainCount;
        for (var i = 0; i < length; ++i) {
            value = ctx[i + additionalDomainCount];
            if (!DataUtils.isPlainValue(value)) {
                ret[bindingFieldIds[i]] = DataUtils.getDimensionValue(value);
                ret[bindingFieldIds[i] + DataUtils.DIMENSION_DISPLAYNAME_SUFFIX] =
                    DataUtils.getDimensionDisplayName(value);
            } else {
                ret[bindingFieldIds[i]] = value;
            }
        }
        return ret;
    };

    return HichertBuildLayerUtil;
});
define('sap/viz/hichert/components/axis/sub/CategoryAxisBody',[
    "sap/viz/framework/common/util/oo",
    "sap/viz/chart/components/axis/sub/OrdinalCommonAxisBody",
    "sap/viz/hichert/components/axis/renderer/CategoryBodyRenderer",
    "sap/viz/chart/components/axis/renderer/DefaultCategoryLabelRenderer",
    "sap/viz/hichert/components/util/Constants",
    "sap/viz/framework/common/util/NumberUtils",
    "sap/viz/framework/common/util/DataUtils",
    "sap/viz/hichert/components/util/HichertBuildLayerUtil"
], function(oo,
    BaseCategoryAxisBody,
    CategoryBodyRenderer,
    DefaultCategoryLabelRenderer,
    Constants,
    NumberUtils,
    DataUtils,
    HichertBuildLayerUtil) {

    var AXIS_CLASS_NAMES = Constants.CSS.CLASS.AXIS;

    var CategoryAxisBody = function() {
        CategoryAxisBody.superclass.constructor.apply(this, arguments);
        this.setBodyRenderer(new CategoryBodyRenderer());
        this.setBuildLayerUtil(HichertBuildLayerUtil);
        this._patternData = null;
    };
    oo.extend(CategoryAxisBody, BaseCategoryAxisBody);

    CategoryAxisBody.prototype._drawAxisLine = function(
        layers, width, height, position, properties, selection, effectManager) {
        if (properties.axisLine && properties.axisLine.visible) {
            var group = selection.append("g").attr("class", AXIS_CLASS_NAMES.LINE_GROUP);
            var axisSize = this._isVertical() ? height : width;
            var range = [0, axisSize];
            var line = this._bodyRenderer.drawLines(group, range, width, height,
                position, properties, effectManager);
        }
    };



    CategoryAxisBody.prototype._updateShowPattern = function() {
        var properties = this._properties.get();
        var isShowPattern = false;
        if (properties.axisLine.visible && properties.axisLine.showPattern &&
            this._patternData && this._patternData.values) {
            isShowPattern = true;
        }
        this._bodyRenderer.isShowPattern(isShowPattern);
        this._isShowPattern = isShowPattern;
    };

    CategoryAxisBody.prototype._drawTicks = function(
        layers, width, height, position, properties, selection, effectManager, bound) {

        var ticks = this._ticks = this._getTicks(layers);
        this._tickGroupNode = selection.append("g").attr("class", AXIS_CLASS_NAMES.TICK_GROUP);
        this._bodyRenderer.drawTicks(this._tickGroupNode, layers, ticks, bound,
            position, properties, effectManager, createTickFill.call(this),
            this._rawLayers[this._rawLayers.length - 1]);
    };

    CategoryAxisBody.prototype.update = function() {
        CategoryAxisBody.superclass.update.apply(this, arguments);
        this._updateShowPattern();
    };

    CategoryAxisBody.prototype._update = function(rebuildUI) {
        if (!this._tickGroupNode && !this._labelGroupNode) {
            return;
        }
        var properties = this._properties.get();
        if (this._data && properties.visible) {
            var width = this._size.width;
            var height = this._size.height;
            var position = this._position;

            if (rebuildUI) {
                this._layers = this._buildLayers(this._data);
                this.layout();
            }
            var layers = this._getAvailableLayers();
            var realLayers = layers.length > 0 ? layers : this._layers;

            var originProps = this._properties.origin;
            var unhighlightAxis = originProps.get("plotArea.gridline.zeroLine.unhighlightAxis");

            if (this._hasNegativeValue === true && unhighlightAxis === true) {
                properties.color = originProps.get("plotArea.gridline.color");
            }

            if (this._isSpaceEnough()) {
                var bound = {
                    width: width,
                    height: height,
                    offset: this._offset,
                    windowSize: this._windowSize,
                    positionInWindow: this._positionInWindow
                };
                if (properties.axisTick && properties.axisTick.visible) {
                    if (rebuildUI) {
                        this._ticks = this._getTicks(realLayers);
                        var ticks = this._ticks;
                        this._bodyRenderer.drawTicks(this._tickGroupNode, realLayers, ticks, bound,
                            position, properties, this.runtime().effectManager(), createTickFill.call(this),
                            this._rawLayers[this._rawLayers.length - 1]);
                    }
                }
                if (properties.label && properties.label.visible) {
                    var needRowAxisOffset = this._needRowAxisOffset();
                    this._bodyRenderer.drawLabels(this._labelGroupNode, layers, bound, position,
                        properties, this.runtime().effectManager(), needRowAxisOffset, this._labelOffset);
                    if (this._bodyRenderer && this._bodyRenderer.applyLabelStyle) {
                        this._bodyRenderer.applyLabelStyle(this._labelGroupNode);
                    }
                }
            }
        }
    };

    CategoryAxisBody.prototype.setPatternData = function(data) {
        this._patternData = data;
        this._updateShowPattern();
    };
    CategoryAxisBody.prototype._getScaleDomain = function(scale) {

        var domain = scale.getDomain();

        var isShowPatternLabel = this._properties.get("axisLine.showPatternLabel");

        if (isShowPatternLabel && this._patternData.values) {
            var patternValues = this._patternData.values;

            var checkNovalue = function(patternArr) {
                if(!Array.isArray(patternArr)) {
                    return patternArr;
                }
                for (var j = 0; j < patternArr.length; j++) {
                    if (patternArr[j] !== null && patternArr[j] !== undefined) {
                        return patternArr[j];
                    }
                }
            };
            return domain.map(function(d, i) {
                var arr = d.slice();
                if (patternValues[i]) {
                    arr.unshift(checkNovalue(patternValues[i]));
                }
                return arr;
            });
        } else {
            return domain;
        }
    };

    CategoryAxisBody.prototype.getPreferredSize = function(refSize) {
        var layers;
        if (this._data && this._properties.get('visible')) {
            layers = (this._layers = this._buildLayers(this._data));
        }
        var pfdSize = {
            minWidth: 0,
            maxWidth: 0,
            minHeight: 0,
            maxHeight: 0,
            spacings: [{
                "interval": 0,
                "type": Constants.SPACING_TYPE.STEP
            }]
        };
        var isShowPattern = this._isShowPattern;
        // Set a nonzeron value to make sure the axis line is always drawn
        if (this._isVertical()) {
            pfdSize.minWidth = pfdSize.maxWidth = isShowPattern ?
                Constants.AXIS.TICK_SIZE : 0.1;
        } else {
            pfdSize.minHeight = pfdSize.maxHeight = isShowPattern ?
                Constants.AXIS.TICK_SIZE : 0.1;
        }
        if (layers) {
            var range = this._data.getRange();
            var rangeLong = Math.abs(range[0] - range[1]);

            var field = this._isVertical() ? "height" : "width";
            rangeLong *= this._realSize[field];
            var viewportWidth = refSize ? refSize[field] : (this._size[field] || rangeLong);

            var i, length = layers.length;
            var minSize, maxSize, spacings, layer;
            if (length) {
                spacings = (pfdSize.spacings = []);
                for (i = 0; i < length; ++i) {
                    layer = layers[i];
                    if (i === 0 &&
                        layer.minLayerBand < layer.layerBand) {
                        spacings.push({
                            "interval": layer.minLayerBand,
                            "type": Constants.SPACING_TYPE.STEP
                        });
                        spacings.push({
                            "interval": layer.layerBand - layer.minLayerBand,
                            "type": Constants.SPACING_TYPE.RANGE
                        });
                    } else {
                        spacings.push({
                            "interval": layer.layerBand,
                            "type": Constants.SPACING_TYPE.STEP
                        });
                    }
                }

                if (isShowPattern === true) {
                    var axisLineSize = this._bodyRenderer.getAxisLineSize();
                    if (axisLineSize > 0) {
                        spacings.unshift({
                            "interval": axisLineSize,
                            "type": "line"
                        });
                    }
                }

                minSize = this._getMinLayersSize(spacings);
                var sizeLimit = refSize && refSize[this._isVertical() ? 'width' : 'height'];
                maxSize = this._getMaxLayersSize(spacings, sizeLimit);
                if (this._isVertical()) {
                    pfdSize.minWidth = minSize;
                    pfdSize.maxWidth = maxSize;
                    pfdSize.minHeight = viewportWidth;
                    pfdSize.maxHeight = viewportWidth;
                } else {
                    pfdSize.minWidth = viewportWidth;
                    pfdSize.maxWidth = viewportWidth;
                    pfdSize.minHeight = minSize;
                    pfdSize.maxHeight = maxSize;
                }
            }
        }
        var precisedSize = NumberUtils.preciseObject(pfdSize);
        this._updatePfdSize(precisedSize);
        return precisedSize;
    };

    CategoryAxisBody.prototype._getMinLayersSize = function(spacings) {
        var sum = 0;

        for (var i = 0; i < spacings.length; i++) {
            sum += spacings[i].interval;
            if (spacings[i].type !== "line") {
                break;
            }
        }

        return sum;
    };

    function createTickFill() {

        var semanticMgr = this.runtime().semanticManager();

        if (semanticMgr.hasAxisStyle()) {

            var tickContext = getTickContext.call(this);

            return tickContext.map(function(context) {
                return semanticMgr.analyzeAxisLabel(context);
            });
        }

        return pickPatternByScale.call(this);
    }

    function pickPatternByScale() {

        var patternData = this._patternData;

        var values = patternData.values;
        var pattern = patternData.scale;
        if (!values || !pattern) {
            return this._data._domain.map(function(d) {
                return {};
            });
        }
        return values.map(function(value) {
            return pattern.scale(value);
        });
    }

    function getTickContext() {
        var layers = this._rawLayers;

        var maxCells = layers[layers.length - 1].cells;

        if (!this._patternData.metaData || !this._patternData.values) {
            return maxCells;
        }

        var metaData = this._patternData.metaData;

        var values = this._patternData.values;

        return maxCells.map(function(cell, i) {

            var ctx = cell.ctx;

            for (var index = 0; index < metaData.length; index++) {
                ctx[metaData[index].id] = DataUtils.getDimensionValue(values[i][index]);
            }

            return cell.ctx;
        });
    }

    return CategoryAxisBody;
});
define('sap/viz/hichert/components/axis/sub/AxisTitle',[
    "sap/viz/chart/components/axis/sub/AxisTitle",
    "sap/viz/framework/common/util/oo"
], function(AxisTitle, oo) {
    var HichertAxisTitle = function() {
        HichertAxisTitle.superclass.constructor.apply(this, arguments);
    };
    oo.extend(HichertAxisTitle, AxisTitle);

    HichertAxisTitle.prototype._adjustTitleItems = function(items, layerNumber) {
        var i;
        if(this._patternData && this._patternData.values && this._options.isShowPatternLabel) {
            layerNumber--;
        }
        for (i = 0; i < items.length; i++) {
            if (i >= layerNumber) {
                items[i].isHidden = true;
            } else {
                items[i].isHidden = false;
            }
        }
    };

    HichertAxisTitle.prototype.setPatternData = function(patternData) {
        this._patternData = patternData;
    };

    return HichertAxisTitle;
});

define('sap/viz/hichert/components/axis/CategoryAxis',[
    "sap/viz/framework/common/util/oo",
    "sap/viz/chart/components/axis/CategoryAxis",
    "sap/viz/hichert/components/axis/sub/CategoryAxisBody",
    "sap/viz/hichert/components/axis/sub/AxisTitle",
    "sap/viz/framework/common/util/Constants"
], function(oo,
    AxisContainer,
    CategoryAxisBody,
    AxisTitle,
    Constants) {

    var CategoryAxis = function(runtime, options) {
        CategoryAxis.superclass.constructor.apply(this, arguments);
        this._needOtherSize = false;
        if (!this._disableTitle) {
            options.isShowPatternLabel = this._properties.get("axisLine.showPatternLabel");
            this.setChild("axisTitle", new AxisTitle(runtime, options), {
                order: 3,
                priority: 1,
                offset: Constants.AXIS.SPACING_TO_ROOT
            });
        }
    };
    oo.extend(CategoryAxis, AxisContainer);

    CategoryAxis.prototype._setAxisBody = function(runtime, options) {
        this.setChild("axisBody", new CategoryAxisBody(runtime, options), {
            order: 1,
            priority: 2,
            offset: 0
        });
    };
    
    CategoryAxis.prototype.setData = function(data, hasNegativeValue, pattern) {
        CategoryAxis.superclass.setData.call(this, data, hasNegativeValue);
        if(pattern){
            this._patternData = pattern;
        }
        
    };

    CategoryAxis.prototype._updateData = function(info) {
        CategoryAxis.superclass._updateData.call(this, info);
        if (this._patternData) {
            var axisBody = this.getChild("axisBody").module;
            if (axisBody.setPatternData) {
                axisBody.setPatternData(this._patternData);
            }
            var axisTitle = this.getChild("axisTitle").module;
            if(axisTitle.setPatternData) {
                axisTitle.setPatternData(this._patternData);
            }
        }
    };
    return CategoryAxis;

});

define('sap/viz/hichert/layout/LayoutItem',[], function(){

    /**
     * An abstraction of an layout item for the Layout strategy.
     * It can be either an ordinary component or a sub-layout
     */
    function LayoutItem(config, components){
        this._config = config;
        this._components = components;
        this._component = components[this.name()];
    }

    var prot = LayoutItem.prototype;

    /**
     * Get the unique name of this item
     */
    prot.name = function(){
        return this._config.name;
    };

    /**
     * Get the component of this item if any
     */
    prot.component = function(){
        return this._component;
    };

    /**
     * Get the layout config of this item
     */
    prot.config = function(){
        return this._config || {};
    };

    /**
     * Get the child items of thie item if this is a sub-layout item.
     */
    prot.children = function(){
        if(!this._children){
            if(!this._component && this._config.layout){
                var items = this._config.items || [];
                var components = this._components;
                this._children = items.map(function(itemConfig){
                    return new LayoutItem(itemConfig, components);
                });
            }
        }
        return this._children || [];
    };

    /**
     * Measure the required size of this item.
     * Do layout and directly return reference size if this is a sub-layout item.
     */
    prot.measure = function(refSize){
        if(this._component){
            var mod = this._component.module;
            if(mod.getPreferredSize){
                return mod.getPreferredSize(refSize);
            }
        }else{
            var layout = this._config.layout;
            if(layout){
                layout.config.set({
                    offsetX: refSize.x,
                    offsetY: refSize.y,
                    totalWidth: refSize.width,
                    totalHeight: refSize.height
                });
                layout._layoutSelf(this.children());
                return refSize;
            }
        }
        return null;
    };

    /**
     * Set the result size of this item
     */
    prot.setSize = function(size){
        this._result = size;
        var mod = this._component && this._component.module;
        if(mod && mod.setSize){
            mod.setSize(size);
        }
    };

    /**
     * Return the result size of this item.
     */
    prot.result = function(){
        return this._result;
    };

    return LayoutItem;
});

define('sap/viz/hichert/layout/ShadowLayoutItem',["sap/viz/framework/common/util/oo",
        "sap/viz/hichert/layout/LayoutItem"
], function(
    oo,
    LayoutItem
) {

    /**
     * An abstraction of an layout item for the Shadow Layout strategy.
     * It can be either an ordinary component or a sub-layout
     */
    function ShadowLayoutItem(config, components){
        this._config = config;
        this._components = components;
        this._component = components[this.name()];
    }

    oo.extend(ShadowLayoutItem, LayoutItem);
    
    var prot = ShadowLayoutItem.prototype;

    /**
     * Get the unique name of this item
     */
    prot.name = function() {
        return this._config.shadow.preferredSizeRef;
    };

    /**
     * Get the component of this item if any
     */
    prot.component = function(){
        return this._component;
    };


    /**
     * Measure the required size of this item.
     * Do layout and directly return reference size if this is a sub-layout item.
     */
    prot.measure = function(refSize){
        
        var mod = this._component.module;
        if(mod.getPreferredSize){
            return mod.getPreferredSize(refSize);
        }
        
        return null;
    };

    /**
     * Set the result size of this item
     */
    prot.setSize = function(size) {
        // nothing
    };
    
    return ShadowLayoutItem;
});

define('sap/viz/hichert/layout/Layout',[
    "sap/viz/framework/common/util/oo",
    "sap/viz/chart/layout/BaseLayout",
    "sap/viz/hichert/layout/LayoutItem",
    "sap/viz/hichert/layout/ShadowLayoutItem"
], function(oo, BaseLayout, LayoutItem, ShadowLayoutItem){

    /**
     * Abstract layout algorithm.
     * It is the base class for concrete layout algorithms.
     * It can also be instantiated to contain concrete layout algorithms.
     */
    function Layout(){
        Layout.superclass.constructor.apply(this, arguments);
        this.config.add({
            offsetX: 0,
            offsetY: 0,
            layout: null,
            items: []
        });
    }

    oo.extend(Layout, BaseLayout);

    var prot = Layout.prototype;

    /**
     * Main layout interface. Overriden from base class.
     */
    prot.layout = function(components){
        var items = this.config.get('items').map(function(itemConfig){
            
            if (itemConfig.shadow) {
                
                if (itemConfig.shadow.preferredSizeRef == null) {
                    throw "If you use shadow component, the preferredSizeRef property is required.";
                }
                
                return new ShadowLayoutItem(itemConfig, components);
            }
            
            return new LayoutItem(itemConfig, components);
        }, this);

        this._layoutSelf(items);

        var result = {};
        var q = items;
        while(q.length){
            var item = q.shift();
            
            if (item instanceof ShadowLayoutItem) {
                continue;
            }
            
            var children = item.children();
            
            if(children.length){
                q = q.concat(children);
            }else{
                result[item.name()] = item.result();
            }
        }
        return result;
    };

    /**
     * Do concrete layout if any.
     */
    prot._layoutSelf = function(items){
        var layout = this.config.get('layout');
        if(layout){
            layout.config.set(this.config.get());
            layout._layoutSelf(items);
        }
    };

    return Layout;
});


define('sap/viz/hichert/layout/SliceLayout',[
    "sap/viz/framework/common/util/oo",
    'sap/viz/framework/common/util/Constants',
    'sap/viz/framework/common/util/TypeUtils',
    "sap/viz/hichert/layout/Layout"
], function(
    oo,
    Constants,
    TypeUtils,
    Layout
){

    /**
     * Slice items one by one to do layout.
     * items: [{
     *      name: '',
     *      shadow: {// optional
     *          preferredSizeRef: "String"
     *      }
     *      position: top|bottom|left|right,
     *      size: ...,
     *      sizeType: fixed|percent|auto(default)
     *      maxSize: ...,
     *      maxType: fixed|percent(default)|auto
     *      paddings: {
     *          left:
     *          right:
     *          top:
     *          bottom:
     *      },
     *      sizeExcludePadding: true|false(default),
     *      percentRef: "...",
     *      remains: "...",
     *      pendingOn: [],
     *      overlap: {
     *          renderedIn: "layout component name",
     *          alignWith: {
     *              name: "layout component name"//optional,
     *              direct: "horizontal" | "vertical",
     *              includePadding: true | false
     *          }
     *      }
     * }, ...]
     */
    function SliceLayout(){
        SliceLayout.superclass.constructor.apply(this, arguments);
        this.config.add({
            paddings: {
                left: 0,
                right: 0,
                top: 0,
                bottom: 0
            }
        });
    }

    var SIZE_TYPE = SliceLayout.SIZE_TYPE = {
        FIXED: 'fixed',
        PERCENT: 'percent',
        AUTO: 'auto'
    };

    oo.extend(SliceLayout, Layout);

    var prot = SliceLayout.prototype;

    prot._layoutSelf = function(items) {
        var config = this.config;
        var remainRect = new Rect(
            config.get('offsetX'), 
            config.get('offsetY'), 
            config.get('totalWidth'),
            config.get('totalHeight'),
            config.get('paddings')
        );
        var remainRectCache = {
            total: remainRect.clone()
        };
        var sliceItems = [];
        var pendingItems = [];
        var overlappedItems = [];
        var i, item;
        for(i = 0; i < items.length; ++i){
            item = items[i];
            if(item.config().overlap){
                overlappedItems.push(item);
            } else {
                sliceItems.push(new SliceItem(item));
            }
        }
        var sliceLength = sliceItems.length - 1;
        for(i = 0; i < sliceLength; ++i){
            item = sliceItems[i];
            var cutPos = item.getSize(remainRect, remainRectCache, sliceItems.slice(i));
            var itemRect = remainRect.cut(cutPos, item.position);

            pendingItems.forEach(function(pendingItem){
                if(pendingItem.pendingOn(item)){
                    pendingItem.result.cut(cutPos, item.position);
                }
            });

            if(item.hasPending()){
                pendingItems.push(item);
            }

            item.result = itemRect;
            if(item.remains){
                remainRectCache[item.remains] = remainRect.clone();
            }
        }

        var last = sliceItems[sliceLength];
        if (last) {
            last.result = remainRect;
            if(!last._item.component()){
                last.getSize(remainRect, remainRectCache);
            }
        }

        var cache = {};
        sliceItems.forEach(function(item){
            item.result.setPaddings(item.paddings);
            item.setSize(item.result);
            cache[item.name] = item.result;
        });
        overlappedItems.forEach(function(item){
            
            var overlap = item.config().overlap;
            var refRect;
            
            if (TypeUtils.isString(overlap)) {
                refRect = cache[overlap];
            } else if (TypeUtils.isString(overlap.renderedIn)) {
                
                // support {
                //     overlap: {renderedIn "valueAxis", 
                //               alignWidth: {
                //                   name: "variance1",
                //                   direct: "vertical/horizontal"
                //     }}}
                refRect = cache[overlap.renderedIn];
                
                if (overlap.alignWith && TypeUtils.isString(overlap.alignWith.name)) {
                    
                    var alignWith = overlap.alignWith;
                    var direct = alignWith.direct;
                    var alignRect = cache[alignWith.name];
                    
                    if (alignRect == null) {
                        refRect = new Rect(0, 0, 0, 0, refRect.paddings);
                    } else {
                        
                        var x, y, w, h, alignX, alignY, alignW, alignH;
                        
                        if (alignWith.includePadding) {
                            x = refRect.x;
                            y = refRect.y;
                            w = refRect.w;
                            h = refRect.h;
                            
                            alignX = alignRect.x;
                            alignY = alignRect.y;
                            alignW = alignRect.w;
                            alignH = alignRect.h;
                        } else {
                            x = refRect.clientX;
                            y = refRect.clientY;
                            w = refRect.clientW;
                            h = refRect.clientH;
                            
                            alignX = alignRect.clientX;
                            alignY = alignRect.clientY;
                            alignW = alignRect.clientW;
                            alignH = alignRect.clientH;
                        }
                        
                        if (direct === "vertical") {
                            y = Math.max(Math.min(alignY, h + y), y);
                            h = Math.min(h - y, alignH);
                        } else {
                            x = Math.max(Math.min(alignX, w + x), x);
                            w = Math.min(w - x, alignW);
                        }
                        
                        refRect = new Rect(x, y, w, h);
                    }
                }
            }
            
            if (refRect) {
                item.setSize(refRect.toClient());
            }
        });
    };

    // SliceItem -----------------------------------------------

    function SliceItem(item){
        var component = item.component();
        var itemConfig = item.config();
        var option = component && component.option || {};

        this.name = itemConfig.name;
        this.position = itemConfig.position || option.position;
        this.paddings = itemConfig.paddings || {
            left: option.paddingLeft,
            right: option.paddingRight,
            top: option.paddingTop,
            bottom: option.paddingBottom
        };
        
        var isHorizontal = this.isHorizontal = /^(left|right)$/.test(this.position);
        this.size = isValidSize(itemConfig.size) ? itemConfig.size :
                isHorizontal ? option.width : option.height;
        this.maxSize = isValidSize(itemConfig.maxSize) ? itemConfig.maxSize :
                isHorizontal ? option.maxWidth : option.maxHeight;

        this.sizeType = itemConfig.sizeType;
        if(!this.sizeType && !isValidSize(this.size)){
            this.sizeType = SIZE_TYPE.AUTO;
        }
        this.maxType = itemConfig.maxType;
        if(this.maxType !== SIZE_TYPE.FIXED){
            this.maxType = SIZE_TYPE.PERCENT;
        }

        this._item = item;
        this._pending = itemConfig.pendingOn || [];
        this.remains = itemConfig.remains;
        this.percentRef = itemConfig.percentRef;
        this.sizeExcludePadding = itemConfig.sizeExcludePadding;
    }

    var SliceItemProt = SliceItem.prototype;

    SliceItemProt.getSize = function(boundingRect, percentRefRects, remainItems){
        var isHorizontal = this.isHorizontal;
        var size = this.size;
        var maxSize = this._getMaxSize(boundingRect, percentRefRects, remainItems);
        if(this.sizeType === SIZE_TYPE.PERCENT){
            size *= this._getPercentRefSize(boundingRect, percentRefRects, remainItems);
        }else if(this.sizeType === SIZE_TYPE.AUTO){
            var refSize = boundingRect.clone().cut(maxSize, this.position).toClient();
            size = this._item.measure(refSize);
            size = size && (isHorizontal ? size.width : size.height) || 0;
        }

        var paddingSize = getPaddingOnSingleDirection(this, isHorizontal);
        if(this.sizeExcludePadding){
            size += paddingSize;
        }
        size = Math.min(size, maxSize);

        return (size < paddingSize || isNaN(size)) ? 0 : size;
    };

    SliceItemProt.setSize = function(sizeRect){
        this._item.setSize(sizeRect.toClient());
    };

    SliceItemProt.hasPending = function(){
        return this._pending.length > 0;
    };

    SliceItemProt.pendingOn = function(item){
        return this._pending.indexOf(item.name) > -1;
    };

    SliceItemProt._getMaxSize = function(boundingRect, percentRefRects, remainItems){
        var boundingSize = this.isHorizontal ? boundingRect.clientW : boundingRect.clientH;
        var result = this.maxSize;
        if(isValidSize(result)){
            if(this.maxType === SIZE_TYPE.PERCENT){
                result *= this._getPercentRefSize(boundingRect, percentRefRects, remainItems);
                if(this.sizeExcludePadding){
                    result += getPaddingOnSingleDirection(this, this.isHorizontal);
                }
            }
            return Math.min(result, boundingSize);
        }
        return boundingSize;
    };

    SliceItemProt._getPercentRefSize = function(boundingRect, percentRefRects, remainItems){
        var isHorizontal = this.isHorizontal;
        var percentRefRect = percentRefRects[this.percentRef] || boundingRect;
        var refSize = isHorizontal ? percentRefRect.clientW : percentRefRect.clientH;
        if(this.sizeExcludePadding){
            for(var i = 0; i < remainItems.length; ++i){
                if(remainItems[i].isHorizontal === isHorizontal){
                    refSize -= getPaddingOnSingleDirection(remainItems[i], isHorizontal);
                }else{
                    break;
                }
            }
        }
        return refSize;
    };

    function getPaddingOnSingleDirection(sliceItem, isHorizontal){
        var paddings = sliceItem.paddings;
        return isHorizontal ?
                (paddings.left || 0) + (paddings.right || 0) :
                (paddings.top || 0) + (paddings.bottom || 0);
    }

    // Rect -----------------------------------------------------

    function Rect(x, y, w, h, paddings){
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.setPaddings(paddings);
    }

    var RectProt = Rect.prototype;

    Rect.prototype.setPaddings = function(paddings){
        this.paddings = paddings || {};
        this._updateClient();
    };

    Rect.prototype._updateClient = function(){
        var paddings = this.paddings;
        var pl = paddings.left || 0;
        var pr = paddings.right || 0;
        var pt = paddings.top || 0;
        var pb = paddings.bottom || 0;
        this.clientX = this.x + pl;
        this.clientY = this.y + pt;
        this.clientW = Math.max(0, this.w - pl - pr);
        this.clientH = Math.max(0, this.h - pt - pb);
    };

    Rect.prototype.cut = function(cutPos, direction){
        var x = this.x = this.clientX;
        var y = this.y = this.clientY;
        var w = this.w = this.clientW;
        var h = this.h = this.clientH;
        this.paddings = {};

        switch(direction){
            case 'left':
                this.x += cutPos;
                this.w -= cutPos;
                w = cutPos;
                break;
            case 'right':
                x = this.x + this.w - cutPos;
                this.w -= cutPos;
                w = cutPos;
                break;
            case 'top':
                this.y += cutPos;
                this.h -= cutPos;
                h = cutPos;
                break;
            default: // bottom
                y = this.y + this.h - cutPos;
                this.h -= cutPos;
                h = cutPos;
                break;
        }
        this._updateClient();

        return new Rect(x, y, w, h);
    };

    Rect.prototype.clone = function(){
        return new Rect(this.x, this.y, this.w, this.h, this.paddings);
    };

    Rect.prototype.toClient = function(){
        return {
            x: this.clientX,
            y: this.clientY,
            width: this.clientW,
            height: this.clientH
        };
    };

    // Utils ------------------------------------------------------

    function isValidSize(value){
        return typeof value === 'number' && value >= 0;
    }

    return SliceLayout;
});

define('sap/viz/hichert/components/util/EmbeddedLegendUtil',[
    'sap/viz/framework/common/util/DataUtils',
    'sap/viz/framework/common/util/TypeUtils'
], function(
    DataUtils,
    TypeUtils
){

    var EmbeddedLegendUtil = {};

    EmbeddedLegendUtil.isHeadTailSame = function(legendData){
        var headValue, tailValue;
        var series = legendData.series;
        var bindingName = legendData.key;
        var bindingData = legendData.bindingData;
        if(series){
            var headDataPoint = series[0];
            var tailDataPoint = series[series.length - 1];
            headValue = headDataPoint && this.getDimensionValue(headDataPoint[bindingName], bindingData);
            tailValue = tailDataPoint && this.getDimensionValue(tailDataPoint[bindingName], bindingData);
        }
        return headValue === tailValue;
    };
    
    EmbeddedLegendUtil.getDimensionValue = function(value, bindingData){
        if(!TypeUtils.isArray(value)){
            value = [value];
        }
        var converter = DataUtils.getDisplayTextsConverter(bindingData.metaData);
        var texts = converter(value);
        return texts.join(" / ");
    };

    return EmbeddedLegendUtil;
});

define('sap/viz/hichert/components/legend/BaseEmbeddedLegend',[
    'sap/viz/framework/common/util/oo',
    'sap/viz/chart/components/UIComponent',
    'sap/viz/framework/common/util/DataUtils',
    'sap/viz/framework/common/util/TypeUtils',
    'sap/viz/framework/common/util/SVG',
    'sap/viz/chart/components/util/TextUtils',
    'sap/viz/chart/components/util/DataPointUtils',
    'sap/viz/chart/components/util/StyleUtils',
    'sap/viz/chart/components/util/BoundingBoxUtils',
    'sap/viz/hichert/components/util/Constants',
    'sap/viz/framework/common/util/GeometryUtils',
    'sap/viz/framework/common/util/NumberUtils',
    'sap/viz/hichert/components/util/EmbeddedLegendUtil'
], function(
    oo,
    UIComponent,
    DataUtils,
    TypeUtils,
    SVG,
    TextUtils,
    DataPointUtils,
    StyleUtils,
    BoundingBox,
    Constants,
    GeometryUtils,
    NumberUtils,
    EmbeddedLegendUtil
){

    function BaseEmbeddedLegend(){
        BaseEmbeddedLegend.superclass.constructor.apply(this, arguments);
        this._position = '';
        this._legendMargin = 2;
        this._major = true;
        this._legendData = [];
    }

    oo.extend(BaseEmbeddedLegend, UIComponent);

    var prot = BaseEmbeddedLegend.prototype;

    prot.setPosition = function(position){
        this._position = position;
        this._isHorizontal = /^(top|bottom)$/.test(position);
        this._isLeading = /^(top|left)$/.test(position);
    };

    // Major embedded legend usually shows legends with explicit reference
    // node (not data point)
    prot.setMajor = function(isMajor){
        this._major = isMajor;
    };

    prot.isMajor = function(){
        return this._major;
    };

    prot.addFixedData = function(legendText, refNode){
        var data = {
            refNode: refNode,
            legend: legendText,
            style: this._getLegendStyle()
        };
        var style = data.style;
        data.size = TextUtils.fastMeasure(legendText,
                style.fontSize, style.fontWeight, style.fontFamily, style.fontStyle);
        this._legendData.push(data);
    };

    prot.addData = function(series, bindingName, bindingData, useMetadata, refNode){
        if (TypeUtils.isExist(bindingData.values)) {
            var data = {
                key: bindingName,
                series: series,
                bindingData: bindingData,
                useMetadata: useMetadata,
                refNode: refNode
            };
            this._legendData.push(data);
            if(series){
                data.refDataPoint = this._isLeading ? series[0] : series[series.length - 1];
            }
            data.legend = this._getLegendText(data);
            
            data.ctx = {};
            var legendContext = this._getLegendContext(data);
            var legendName = bindingData.metaData[0].name;
            if(!DataUtils.isPlainValue(legendContext)){
                data.ctx[legendName + ".d"] = data.legend;
            }
            data.ctx[legendName] = DataUtils.getDimensionValue(legendContext);

            var style = data.style = this._getLegendStyle(data);
            data.size = TextUtils.fastMeasure(data.legend,
                    style.fontSize, style.fontWeight, style.fontFamily, style.fontStyle);
        }
    };

    // Overriden ------------------------------------

    prot.getPreferredSize = function(refSize){
        var pos = String(this._properties.get('embeddedLegend.layout.position')).toLowerCase();
        var layoutWidth, layoutHeight, maxLayoutWidth;
        var legendPrefix = 'embeddedLegend';
        if (this.alias === 'embeddedLegend1') {
            layoutWidth = this._properties.get('embeddedLegend.layout.leftWidth');
            layoutHeight = this._properties.get('embeddedLegend.layout.topHeight');
            maxLayoutWidth = this._properties.get('embeddedLegend.layout.leftMaxWidth');
        } else if (this.alias === 'embeddedLegend2') {
            layoutWidth = this._properties.get('embeddedLegend.layout.rightWidth');
            layoutHeight = this._properties.get('embeddedLegend.layout.bottomHeight');
            maxLayoutWidth = this._properties.get('embeddedLegend.layout.rightMaxWidth');
        } else if (this.alias === 'embeddedLegend') {
            layoutWidth = this._properties.get('embeddedLegend.layout.width');
            layoutHeight = this._properties.get('embeddedLegend.layout.height');
            maxLayoutWidth = this._properties.get('embeddedLegend.layout.maxWidth');
        }

        var isHorizontal = this._isHorizontal;
        var sizeProp = isHorizontal ? 'height' : 'width';
        var isMajor = this._major;

        // Get the size of the largest legend
        var sizes = this._legendData.map(function(legendData){
            if(isMajor || !legendData.useMetadata){
                var size = legendData.size;
                var returnValue;
                if (isHorizontal) {
                    if (TypeUtils.isNumber(layoutHeight)) {
                        returnValue = Number(layoutHeight);
                    } else {
                        returnValue = size.height;
                    }
                } else {
                    if (TypeUtils.isNumber(layoutWidth)) {
                        returnValue = Number(layoutWidth);
                    } else if (TypeUtils.isNumber(maxLayoutWidth) && size.width > Number(maxLayoutWidth)) {
                        returnValue = Number(maxLayoutWidth);
                    } else {
                        returnValue = size.width;
                    }
                }
                return returnValue;
            }
            return 0;
        });
        // ensure size is larger than zero
        sizes.push(0);
        var maxSize = Math.max.apply(Math, sizes);

        // Ensure size does not exceed boundary
        var boundSize = refSize[sizeProp];
        var maxBoundSize = isHorizontal ? Infinity : maxLayoutWidth;
        if (TypeUtils.isExist(maxBoundSize)) {
            if(maxBoundSize < 1){
                boundSize *= maxBoundSize;
            }else{
                boundSize = Math.min(boundSize, maxBoundSize);
            }
        }
        if(maxSize > boundSize){
            maxSize = boundSize;
        }

        var ret = {};
        ret[sizeProp] = maxSize;
        return ret;
    };

    prot._getRenderClass = function() {
        return Constants.CSS.CLASS.LEGENDITEM + " " + Constants.CSS.CLASS.EMBEDDED_LEGEND;
    };

    prot.render = function(selection){
        this._selection = selection;
        if(!this._size.width || !this._size.height){
            return;
        }
        var rect = selection.append('rect');
        var height = this._size.height;
        rect.attr({
            'class': 'v-bound',
            x: 0,
            y: 0,
            width: this._size.width,
            height: height,
            fill: 'transparent'
        });
        var horizontal = this._isHorizontal;
        //valueaxis is visible, hide plot embeddedLegend1, variance embeddedLegend1 width < valueAxis width
        if (!horizontal) {
            for (var i = 0; i < this._legendData.length; i++) {
                if (this._legendData[i].size.width > this._size.width) {
                    this._legendData[i].size.width = this._size.width;
                }
            }
        } else {
            this._legendData = this._legendData.filter(function(e) {
                var style = e.style;
                var getMeasure = TextUtils.fastMeasure(e.legend, style.fontSize, style.fontWeight, 
                    style.fontFamily, style.fontStyle);
                if (getMeasure.height <= height) {
                    return e;
                }
            });
        }

        var nodes = selection.selectAll('g').data(this._legendData);
        nodes.enter().append('g').attr('class', this._getRenderClass());
        nodes.exit().remove();
        var size = this._size;
        nodes.each(function(d){
            var style = d.style;
            var cssString = StyleUtils.convertToCss(style);
            var textNode = SVG.create('text');
            var rectNode = SVG.create('rect');

            TextUtils.ellipsis(d.legend, textNode, size.width, cssString);
            textNode.setAttribute('fill', style.color);
            textNode.setAttribute('font-family',  style.fontFamily);
            textNode.setAttribute('font-size', style.fontSize);
            textNode.setAttribute('font-weight', style.fontWeight);
            textNode.setAttribute('font-style', style.fontStyle);

            this.appendChild(textNode);
            var textBBox = GeometryUtils.getBBox(textNode);
            rectNode.setAttribute('width', textBBox.width);
            rectNode.setAttribute('height', textBBox.height);
            rectNode.setAttribute('y', 0 - NumberUtils.getSizeValue(style.fontSize));
            rectNode.setAttribute('fill', 'transparent');

            this.insertBefore(rectNode, textNode);
            d.node = this;
        });
    };

    function removeNode(node){
        if(node.parentNode){
            node.parentNode.removeChild(node);
        }
    }
    
    function getBoundingBox(node) {
        var rect = node.getBoundingClientRect();
        return {
            x: rect.left,
            y: rect.top,
            height: rect.height,
            width: rect.width
        };
    }
    
    function showLegend(visibleLegend, currentLegend) {
        for (var i = 0; i < visibleLegend.length; i++) {
            if (BoundingBox.intersects(visibleLegend[i], currentLegend)) {
                return false;
            }
        }
        return true;
    }
    
    prot.afterRender = function(selection){
        if(!this._size.width || !this._size.height){
            return;
        }
        selection = selection || this._selection;
        var parentNode = selection.node().parentNode;
        var parentPos = selection.select('rect').node().getBoundingClientRect();
        var position = this._position;

        this._legendData.forEach(function(legendData){
            var node = legendData.refNode;
            if(TypeUtils.isFunction(node)){
                node = node();
            }
            if(!node && legendData.refDataPoint){
                var dpId = legendData.refDataPoint.dp.id;
                node = DataPointUtils.findByDataPointId(parentNode, dpId);
            }
            if(node){
                var pos = node.getBoundingClientRect();

                if(pos.width > 0 || pos.height > 0 || !legendData.key){
                    var legendPos;
                    if(legendData.key){
                        legendPos = this._getLegendPosition(legendData.size, pos, parentPos,
                            true);
                    }else{
                        legendPos = this._getFixedLegendPosition(legendData.size, pos, parentPos);
                    }
                    legendData.parentPos = parentPos;
                    legendData.refNodePos = pos;
                    legendData.pos = legendPos;
                }
            }
        }, this);
        this._adjustLegendPosition(selection);
        var visibleLegend = [];
        this._legendData.forEach(function(legendData){
            var node = legendData.node;
            var refNodePos = legendData.refNodePos;
            if(node && legendData.pos && !legendData.hidden){
                if(legendData.refDataPoint && (
                        (position === 'top' && refNodePos.top < parentPos.bottom) ||
                        (position === 'bottom' && refNodePos.bottom > parentPos.top) ||
                        (position === 'left' && refNodePos.left < parentPos.right) ||
                        (position === 'right' && refNodePos.right > parentPos.left)
                    )){
                    removeNode(node);
                }else{
                    node.setAttribute('transform', 'translate(' + legendData.pos.left + ',' + legendData.pos.top + ')');
                    node.setAttribute('visibility', 'hidden');
                    selection.node().appendChild(node);
                    var bBox = getBoundingBox(node);
                    if (showLegend(visibleLegend, bBox)) {
                        visibleLegend.push(bBox);
                        node.setAttribute('visibility', 'visible');
                    }
                }
            }else{
                removeNode(node);
            }
        });
    };

    // Private ---------------------------------------------

    prot._getFixedLegendPosition = function(legendSize, refNodePos, baseNodePos){
        var x, y;
        if(this._isHorizontal){
            x = refNodePos.left + refNodePos.width / 2 - legendSize.width / 2 - baseNodePos.left;
            if(this._isLeading){
                y = refNodePos.top - legendSize.height / 2 - baseNodePos.top;
            }else{
                y = refNodePos.bottom + legendSize.height - baseNodePos.top;
            }
        }else{
            y = refNodePos.top - baseNodePos.top + refNodePos.height / 2 + legendSize.height / 2;
            // FIXME: why do we have to -3px to align the the legend?
            y -= 3;
            if(this._isLeading){
                x = refNodePos.left - legendSize.width - baseNodePos.left;
            }else{
                x = refNodePos.right - baseNodePos.left;
            }
        }
        if(!this._isHorizontal){
            var margin = this._legendMargin;
            x += this._isLeading ? -margin : margin;
        }
        return {
            left: x,
            top: y
        };
    };

    prot._getLegendPosition = function(legendSize, refNodePos, baseNodePos, withInLegendArea){
        var x, y;
        if(this._isHorizontal){
            x = refNodePos.left + refNodePos.width / 2 - legendSize.width / 2 - baseNodePos.left;
            if(withInLegendArea){
                y = legendSize.height;
            }else{
                if(this._isLeading){
                    y = refNodePos.top - legendSize.height / 2 - baseNodePos.top;
                }else{
                    y = refNodePos.bottom + legendSize.height - baseNodePos.top;
                }
            }
        }else{
            y = refNodePos.top - baseNodePos.top + refNodePos.height / 2 + legendSize.height / 2;
            // FIXME: why do we have to -3px to align the the legend?
            y -= 3;
            if(this._isLeading){
                x = withInLegendArea ? baseNodePos.right - legendSize.width - baseNodePos.left :
                        refNodePos.left - legendSize.width - baseNodePos.left;
            }else{
                x = withInLegendArea ? 0 : refNodePos.right - baseNodePos.left;
            }
        }
        // add some margin between the data point and legend
        if(!this._isHorizontal){
            var margin = this._legendMargin;
            x += this._isLeading ? -margin : margin;
        }
        return {
            left: x,
            top: y
        };
    };

    prot._adjustLegendPosition = function(){
    };

    prot._getLegendContext = function(legendData){
        var context;
        if(legendData.useMetadata){
            context = legendData.bindingData.metaData[0].name;
        }else{
            context = legendData.refDataPoint && legendData.refDataPoint[legendData.key];
        }
        if(TypeUtils.isArray(context)){
            context = context[0];
        }
        return context;
    };

    prot._getLegendText = function(legendData){
        if(legendData.useMetadata){
            return legendData.bindingData.metaData[0].name;
        }
        var value = legendData.refDataPoint && legendData.refDataPoint[legendData.key];

        return EmbeddedLegendUtil.getDimensionValue(value, legendData.bindingData);
    };

    prot._getLegendStyle = function(legendData){
        var props = this._properties.proxy('embeddedLegend.label.style');
        var fontFamily = props.get("fontFamily");
        // add a "px" suffix to fontSize, otherwise IE & Firefox will incorrectly measures texts
        
        var fontSize = parseFloat(props.get("fontSize"));
        if (TypeUtils.isNumber(fontSize)) {
            fontSize += "px";
        } else {
            fontSize = null;
        }
        var fontWeight = props.get("fontWeight");
        var fontStyle = props.get("fontStyle");
        var color = props.get("color");
        if(!color && legendData && legendData.key === 'color' && legendData.refDataPoint){
            color = legendData.bindingData.scale.scale(legendData.refDataPoint.color);
        }
        return {
            color: color,
            fontFamily: fontFamily,
            fontSize: fontSize,
            fontWeight: fontWeight,
            fontStyle: fontStyle
        };
    };

    prot.supportFixedLayout = true;
    return BaseEmbeddedLegend;
});

define('sap/viz/hichert/components/legend/BarEmbeddedLegend',[
    'sap/viz/framework/common/util/oo',
    "sap/viz/hichert/components/legend/BaseEmbeddedLegend",
    'sap/viz/chart/components/plots/BarWidthUtils',
    'sap/viz/hichert/components/plots/BarWidthUtils',
    "sap/viz/hichert/components/util/EmbeddedLegendUtil",
    'sap/viz/framework/common/util/ObjectUtils'
], function(
    oo, 
    BaseEmbeddedLegend, 
    InfoBarWidthUtils,
    HichertBarWidthUtils,
    EmbeddedLegendUtil,
    ObjectUtils
) {

    function BarEmbeddedLegend(){
        BarEmbeddedLegend.superclass.constructor.apply(this, arguments);
        this._itemCount = 0;
        this._seriesCount = 0;
    }

    oo.extend(BarEmbeddedLegend, BaseEmbeddedLegend);

    var prot = BarEmbeddedLegend.prototype;

    prot.addData = function(series, bindingName, bindingData, useMetadata, refNode){
        if (this._isLeading || !useMetadata){
            BarEmbeddedLegend.superclass.addData.apply(this, arguments);
            if (series != null) {
                this._seriesCount++;
                this._itemCount = Math.max(this._itemCount, series.length);
            }
        }
    };

    prot.getPreferredSize = function(refSize) {
        
        var result = BarEmbeddedLegend.superclass.getPreferredSize.call(this, refSize);
        
        var sizeProp = this._isHorizontal ? 'height' : 'width';
        
        if (!result || (result[sizeProp] === 0 || this._itemSize === 0)) {
            return result;
        }
        
        //result[sizeProp] = this._cutSize(refSize[sizeProp], result[sizeProp]);
        
        return result;
    };
    
    prot._cutSize = function(boundSize, resultSize) {
        
        var props = this._properties;
        
        var minRange = 0.1;
        
        if (this._isLeading) {
            // if embedded legend is in leading area && plot area is horizontal, don't do slice size
            if (this._isHorizontal) {
                return resultSize;
            } else {
                // if embedded legend is in leading area && plot area is vertical,
                // the min range is max width of legend item using metadata
                for (var i = 0; i < this._legendData.length; i++) {
                    var legendItem = this._legendData[i];
                    if (!legendItem.useMetadata) {
                        continue;
                    }
                    minRange = Math.max(minRange, legendItem.size["width"]);
                }
            }
        }
        
        var barProps = InfoBarWidthUtils.getBarProperties(props);
        
        var barOption, barWidth;
        var isOverLapMode = props.get("plotArea.overlap.available");
        
        if (isOverLapMode) {
            barProps.percent = props.get("plotArea.overlap.percentage");
            barOption = HichertBarWidthUtils.getOverlapBarInfo(this._seriesCount, barProps);
            barWidth = (boundSize - resultSize) / (this._itemCount - barOption.gap);
        } else {
            barOption = InfoBarWidthUtils.getBarInfo(this._seriesCount, barProps);
            barWidth = (boundSize - resultSize) / (this._itemCount - barOption.gap);
        }
        
        var sliceWidth = barWidth * barOption.gap;
        
        return Math.max(resultSize - sliceWidth, minRange);
    };
    
    prot._adjustLegendPosition = function(){
        var legendsByPos = {};
        var cache;
        var i;
        var leading = this._isLeading;
        var isHorizontal = this._isHorizontal;
        var refPos = isHorizontal ? 'left' : 'bottom';
        var valuePos = isHorizontal ? 'right' : 'top';
        var sidePos = isHorizontal ? 'top' : 'left';
        var basePos = isHorizontal ? 'left' : 'top';
        var sizeProp = isHorizontal ? 'width' : 'height';
        
        var minPositive, minNegative, minNegativeNumber = -1;
        var posKey, newRefPos, refNodePos, context;
        //if have both positive and negative value, adjust position and make sure smallest abs 
        //of positive and negative value's position are same value and they are in same hash bucket, 
        //so cache.lenght > 1
        //before modification, in this case, they may in two hash buckets and will show together
        for (i = 0; i < this._legendData.length; i++) {
            refNodePos = this._legendData[i].refNodePos;
            if(refNodePos){
                context = this._legendData[i].refDataPoint.dp.context();
                if (context[context['measureNames']] < 0) {
                    newRefPos = refPos === 'left' ? 'right' : 'top';
                    posKey = refNodePos[newRefPos];
                    if (minNegative === undefined || minNegative > posKey) {
                        minNegative = posKey;
                        minNegativeNumber = i;
                    }
                } else {
                    posKey = refNodePos[refPos];
                    if (minPositive === undefined || minPositive > posKey) {
                        minPositive = posKey;
                    }
                }
            }
        }

        if (minNegative !== undefined && minPositive !== undefined) {
            newRefPos = refPos === 'left' ? 'right' : 'top';
            //hasOwnProperty fails with ClientRect, so hard code here
            var oldRef = this._legendData[minNegativeNumber].refNodePos;
            this._legendData[minNegativeNumber].refNodePos = {};
            this._legendData[minNegativeNumber].refNodePos.top = oldRef.top;
            this._legendData[minNegativeNumber].refNodePos.bottom = oldRef.bottom;
            this._legendData[minNegativeNumber].refNodePos.left = oldRef.left;
            this._legendData[minNegativeNumber].refNodePos.right = oldRef.right;
            this._legendData[minNegativeNumber].refNodePos.width = oldRef.width;
            this._legendData[minNegativeNumber].refNodePos.height = oldRef.height;
            this._legendData[minNegativeNumber].refNodePos[newRefPos] = minPositive;
        }
        
        this._legendData.forEach(function(legendData){
            legendData.hidden = false;
            var refNodePos = legendData.refNodePos;
            if(refNodePos){
                var context = legendData.refDataPoint.dp.context();
                var posKey, newRefPos;
                if (context[context['measureNames']] < 0) {
                    newRefPos = refPos === 'left' ? 'right' : 'top';
                    posKey = parseInt(refNodePos[newRefPos], 10);
                } else {
                    posKey = parseInt(refNodePos[refPos], 10);
                }
                cache = legendsByPos[posKey] = legendsByPos[posKey] || [];
                cache.push(legendData);
            }
        });

        for(var key in legendsByPos){
            if(legendsByPos.hasOwnProperty(key)){
                cache = legendsByPos[key];
                if(cache.length > 1){
                    cache.sort(function(a, b){
                        var diff = a.refNodePos[valuePos] - b.refNodePos[valuePos];
                        return isHorizontal ? diff : -diff;
                    });
                    var visibleOrder = cache.slice().sort(function(a, b){
                        var diff = a.refNodePos[sidePos] - b.refNodePos[sidePos];
                        return leading ? diff : -diff;
                    });
                    var outerMost = visibleOrder[0];
                    var base = cache[0].refNodePos[refPos];
                    var firstDone = false;
                    var parentBase = cache[0].parentPos[basePos];
                    for(i = 0; i < cache.length; ++i){
                        var legendData = cache[i];
                        if(legendData === outerMost || !EmbeddedLegendUtil.isHeadTailSame(legendData)){
                            var value = legendData.refNodePos[valuePos];
                            var pos = (base + value) / 2 - legendData.size[sizeProp] / 2 - parentBase;
                            if(firstDone){
                                pos = isHorizontal ?
                                        Math.max(base - parentBase, pos) :
                                        Math.min(base - parentBase, pos);
                            }
                            firstDone = true;
                            // FIXME: why need adjustment for vertical case?
                            if(!isHorizontal){
                                pos += legendData.size[sizeProp] - 3;
                            }
                            legendData.pos[basePos] = pos;
                            base = value;
                        }else{
                            legendData.hidden = true;
                        }
                    }
                }
            }
        }
    };

    prot._getLegendStyle = function(legendData){
        var style = BarEmbeddedLegend.superclass._getLegendStyle.apply(this, arguments);
        return style;
    };

    return BarEmbeddedLegend;
});

define('sap/viz/hichert/components/legend/StackedBarEmbeddedLegend',[
    'sap/viz/framework/common/util/oo',
    "sap/viz/hichert/components/legend/BarEmbeddedLegend",
    'sap/viz/chart/components/plots/BarWidthUtils'
], function(oo, BarEmbeddedLegend, BarWidthUtils){

    function StackedBarEmbeddedLegend(){
        StackedBarEmbeddedLegend.superclass.constructor.apply(this, arguments);
    }

    oo.extend(StackedBarEmbeddedLegend, BarEmbeddedLegend);

    var prot = StackedBarEmbeddedLegend.prototype;

    prot._adjustLegendPosition = function(){
    };
    
    return StackedBarEmbeddedLegend;
});

define('sap/viz/hichert/components/plotareas/XYPlotArea',[
    "sap/viz/framework/common/util/oo",
    "sap/viz/chart/components/plotareas/XYPlotArea",
    "sap/viz/hichert/components/plots/PlotFactory",
    'sap/viz/hichert/components/axis/CategoryAxis',
    "sap/viz/hichert/layout/SliceLayout",
    "sap/viz/hichert/components/legend/StackedBarEmbeddedLegend",
    'sap/viz/framework/common/util/DataUtils'
], function(
    oo,
    BasePlotArea,
    PlotFactory,
    CategoryAxis,
    SliceLayout,
    StackedBarEmbeddedLegend,
    DataUtils
) {
    
    var XYPlotArea = function(runtime, option) {
        XYPlotArea.superclass.constructor.apply(this, arguments);
    };
    
    oo.extend(XYPlotArea, BasePlotArea);

    XYPlotArea.prototype._getPlotFactory = function() {
        return PlotFactory;
    };
    
    XYPlotArea.prototype._init = function() {
        XYPlotArea.superclass._init.call(this);

        this._createLegends();
    };

    XYPlotArea.prototype._getLegendClass = function(){
        return StackedBarEmbeddedLegend;
    };

    XYPlotArea.prototype._createLegends = function(){
        var legendCls = this._getLegendClass();
        this._legend = new legendCls(this.runtime());
        var position = this._getEmbeddedLegendPosition();
        this._legend.setPosition(position);
        this.setChild("embeddedLegend", this._legend, {
            position: position
        });
    };

    XYPlotArea.prototype._getEmbeddedLegendPosition = function(){
        var pos = String(this._properties.get('embeddedLegend.layout.position')).toLowerCase();
        var isHorizontal = this._plot.isHorizontal();
        if((isHorizontal && /^(top|bottom)$/.test(pos)) ||
                (!isHorizontal && /^(left|right)$/.test(pos))){
            return pos;
        }
        return isHorizontal ? 'top' : 'right';
    };

    XYPlotArea.prototype._embeddedLegendVisible = function(){
        var pos = String(this._properties.get('embeddedLegend.layout.position')).toLowerCase();
        var valueAxisVisible = this._properties.get('valueAxis.visible') === true;
        var isHorizontal = this._plot.isHorizontal();
        if((valueAxisVisible && isHorizontal && pos === "bottom") ||
                (valueAxisVisible && !isHorizontal && pos === "left")){
            return false;
        }
        return true;
    };

    XYPlotArea.prototype.setData = function(data){
        XYPlotArea.superclass.setData.apply(this, arguments);
        var legendVisible = this._embeddedLegendVisible();
        
        for(var i = 0; i < data.series.length; ++i){
            var series = data.series[i];
            if(data.color && data.color.values && legendVisible){
                this._legend.addData(series, 'color', data.color);
            }
        }
    };
    
    XYPlotArea.prototype._getCategoryAxisClass = function() {
        return CategoryAxis;
    };
    
    XYPlotArea.prototype._getLayoutDefinition = function() {
        return SliceLayout;
    };
    
    XYPlotArea.prototype._isColumnChart = function(){
        return (this._renderType === "hichert_column");
    };

    XYPlotArea.prototype._isStackedChart = function(){
        return (this._renderType === "hichert_stacked_column") || (this._renderType === "hichert_stacked_bar");
    }; 
    
  

    XYPlotArea.prototype._setAxisData = function(data){
        this._categoryAxis.setData(data.categoryAxis, DataUtils.hasNegativeValue(data), data.pattern);
    };

    XYPlotArea.prototype._configLayout = function() {
        XYPlotArea.superclass._configLayout.call(this);

        var prop = this._properties;
        
        var isHorizontal = this._plot.isHorizontal();
        
        var embeddedLegendPosition = prop.get('embeddedLegend.layout.position');
        var isValueAxisVisible = prop.get('valueAxis.visible') === true;
        var isLegendAxisOverlap = isValueAxisVisible && ((isHorizontal && embeddedLegendPosition === "bottom") ||
                (!isHorizontal && embeddedLegendPosition === "left"));
        var direct = isHorizontal === true ? "horizontal" : "vertical";
        
        var valueAxis = {
            name: 'valueAxis',
            overlap: {
                renderedIn: "shadowArea",
                alignWith: {
                    name: "plot",
                    direct: direct
                }
            }
        };
        
        var embeddedLegend = {
            name: 'embeddedLegend',
            overlap: {
                renderedIn: "shadowArea",
                alignWith: {
                    name: "plot",
                    direct: direct
                }
            }
        };
        
        var shadowArea = {
            name: "shadowArea",
            shadow: {
                preferredSizeRef: "embeddedLegend"
            }
        };
        
        var sliceOrder = [shadowArea, valueAxis, embeddedLegend, {
            name: 'scrollbar'
        }];
        
        if (isValueAxisVisible) {
            if (isLegendAxisOverlap) {
                shadowArea.shadow.preferredSizeRef = "valueAxis";
            } else {
                sliceOrder.push({
                    name: "shadowAreaOther",
                    shadow: {
                        preferredSizeRef: "valueAxis"
                    }
                });
                
                valueAxis.overlap.renderedIn = "shadowAreaOther";
            }
        }
        
        sliceOrder = sliceOrder.concat([{
            name: 'categoryAxis'
        }, {
            name: 'plot'
        }, {
            name: 'referenceLine',
            overlap: 'plot'
        }]);
        
        this._layoutAlgorithm.config.set({
            items: sliceOrder
        });
    };

    XYPlotArea.prototype._renderSub = function() {
        var children = this._children;
        var selections = this._selections;
        var name;
        var child;

        for (name in children){
            if (children.hasOwnProperty(name)){
                child = children[name].module;
                child.render(selections[child.alias]);
            }
        }

        for (name in children) {
            if (children.hasOwnProperty(name)) {
                child = children[name].module;
                if (child.afterRender) {
                    child.afterRender(selections[child.alias]);
                }
            }
        }
        //relocate zero line's position
        this._plot._repositionZeroline();
    };

    XYPlotArea.prototype._scroll = function(offset) {
        XYPlotArea.superclass._scroll.apply(this, arguments);
        if (this._legend) {
            this._legend.afterRender();
        }
    };

    return XYPlotArea;
});

define('sap/viz/hichert/components/legend/LineEmbeddedLegend',[
    'sap/viz/framework/common/util/oo',
    "sap/viz/hichert/components/legend/BaseEmbeddedLegend",
    "sap/viz/hichert/components/util/EmbeddedLegendUtil"
], function(oo, BaseEmbeddedLegend, EmbeddedLegendUtil){

    function LineEmbeddedLegend(){
        LineEmbeddedLegend.superclass.constructor.apply(this, arguments);
        this._legendMargin = 2;
    }

    oo.extend(LineEmbeddedLegend, BaseEmbeddedLegend);

    var prot = LineEmbeddedLegend.prototype;

    prot.addData = function(series, bindingName, bindingData, useMetadata, refNode){
        var isHeadTailSame = EmbeddedLegendUtil.isHeadTailSame({
            key: bindingName,
            series: series,
            bindingData: bindingData
        });
        if(this._major || (!useMetadata && !isHeadTailSame)){
            LineEmbeddedLegend.superclass.addData.apply(this, arguments);
        }
    };

    prot._adjustLegendPosition = function(selection){
        var refPos = this._isHorizontal ? 'left' : 'top';
        var sizeProp = this._isHorizontal ? 'width' : 'height';
        var lastEndPos = null;
        var overlapped = false;
        var boundingPos = selection.node().getBoundingClientRect();
        var minPos = boundingPos[refPos];
        var maxPos = minPos + boundingPos[sizeProp];

        function getCenterPos(items){
            var sum = 0;
            items.forEach(function(legendData){
                sum += legendData.refNodePos[refPos] + legendData.refNodePos[sizeProp] / 2;
            });
            return sum / items.length;
        }

        function getTotalSize(items){
            var sum = 0;
            items.forEach(function(legendData){
                sum += legendData.size[sizeProp];
            });
            return sum;
        }

        function calcHeadTail(slot){
            var items = slot.items;
            var center = getCenterPos(items);
            var size = getTotalSize(items);
            var head = center - size / 2;
            var tail = center + size / 2;
            if(head < minPos){
                head = minPos;
                tail = head + size;
            }else if(tail > maxPos){
                tail = maxPos;
                head = tail - size;
            }
            slot.head = head;
            slot.tail = tail;
            return slot;
        }

        // To split overlapped legends and make them not overlapped.
        // This will make them occupy more space, so they will overlap with
        // other legends. So this is a recursive process. The following logic
        // solves this by grouping legends into slots. Slots never overlap by
        // definition.

        // Initially every legend is in its own slot, sorted by by
        // their reference position.
        var slots = this._legendData.filter(function(legendData){
            return legendData.refNodePos;
        }).sort(function(a, b){
            return a.refNodePos[refPos] - b.refNodePos[refPos];
        });
        slots = slots.map(function(legendData){
            if(lastEndPos !== null && legendData.pos[refPos] < lastEndPos){
                overlapped = true;
            }
            var slot = calcHeadTail({
                items: [legendData]
            });
            lastEndPos = slot.tail;
            return slot;
        });

        while(overlapped){
            overlapped = false;

            // Overlap exists, start to create new slots
            var mergedSlots = [slots[0]];
            for(var i = 1; i < slots.length; ++i){
                var slot = slots[i];
                var lastSlot = mergedSlots[mergedSlots.length - 1];
                if(slot.head < lastSlot.tail){
                    // Put overlapped legends in to existing slot
                    overlapped = true;
                    lastSlot.items = lastSlot.items.concat(slot.items);
                    calcHeadTail(lastSlot);
                }else{
                    // Otherwise create a new slot
                    mergedSlots.push(slot);
                }
            }
            slots = mergedSlots;
        }

        // For every slot, linearly place the legends in it, and align the
        // reference node with the center of these legends.
        slots.forEach(function(slot){
            var pos = slot.head;
            // Only for non-trivial slot we need to update legends positions
            if(slot.items.length > 1){
                slot.items.forEach(function(legendData){
                    var legendPos = pos - legendData.parentPos[refPos] + legendData.refNodePos[sizeProp] / 2;
                    if(refPos === 'top'){
                        legendPos += legendData.size[sizeProp] / 2;
                    }
                    legendData.pos[refPos] = legendPos;
                    pos += legendData.size[sizeProp];
                });
            }
        });
    };

    return LineEmbeddedLegend;
});

define('sap/viz/hichert/components/plotareas/LinePlotArea',[
    "sap/viz/framework/common/util/oo",
    "sap/viz/hichert/components/plotareas/XYPlotArea",
    "sap/viz/hichert/components/legend/LineEmbeddedLegend"
], function(
    oo,
    XYPlotArea,
    LineEmbeddedLegend
) {

    var LinePlotArea = function(runtime, option) {
        LinePlotArea.superclass.constructor.apply(this, arguments);
    };

    oo.extend(LinePlotArea, XYPlotArea);

    LinePlotArea.prototype._init = function() {
        LinePlotArea.superclass._init.call(this);
    };

    LinePlotArea.prototype._getLegendClass = function(){
        return LineEmbeddedLegend;
    };

    LinePlotArea.prototype.updateValueScale = function() {
        var data = this._data;
        var width = this._roughSize.width;
        var height = this._roughSize.height;
        if (!data || width <= 0 || height <= 0) {
            return data;
        }
        var range = [0, 1];
        if (this._plot.isHorizontal()) {
            range[1] = width;
        } else {
            range[1] = height;
        }
        range[1] *= 0.8;

        var newData = LinePlotArea.superclass.updateValueScale.call(this);

        var valueAxisData = this._calcValueAxisScale("valueAxis", range);
        data.valueAxis.scale = valueAxisData.scale;
        data.valueAxis.tickHint = valueAxisData.tickHint;
        data.valueAxis.scale.setRange([0, 1]);
        newData["valueAxis"] = data.valueAxis;
        this._valueAxis.setData(data.valueAxis);
        return newData;
    };

    return LinePlotArea;
});

define('sap/viz/hichert/components/legend/VarianceTitle',[
    'sap/viz/framework/common/util/oo',
    'sap/viz/hichert/components/legend/BaseEmbeddedLegend',
    'sap/viz/hichert/components/util/Constants',
    'sap/viz/chart/components/util/StyleUtils',
    'sap/viz/chart/components/util/TextUtils'
], function(
    oo, 
    BaseEmbeddedLegend,
    Constants,
    StyleUtils,
    TextUtils
) {

    function VarianceTitle(){
        VarianceTitle.superclass.constructor.apply(this, arguments);
    }

    oo.extend(VarianceTitle, BaseEmbeddedLegend);

    var prot = VarianceTitle.prototype;

    prot._getRenderClass = function() {
        return Constants.CSS.CLASS.VARIANCE_TITLE;
    };

    prot._getLegendStyle = function(legendData){
        var props;
        if (this.alias === "varianceTitle1") {
            props = this._properties.proxy('variance1.title.style');
        } else {
            props = this._properties.proxy('variance2.title.style');
        }
        var fontFamily = props.get("fontFamily");
        // add a "px" suffix to fontSize, otherwise IE & Firefox will incorrectly measures texts
        var fontSize = parseFloat(props.get("fontSize")) + "px";
        var fontWeight = props.get("fontWeight");
        var fontStyle = props.get("fontStyle");
        var color = props.get("color");
        if(!color && legendData && legendData.key === 'color' && legendData.refDataPoint){
            color = legendData.bindingData.scale.scale(legendData.refDataPoint.color);
        }
        return {
            color: color,
            fontFamily: fontFamily,
            fontSize: fontSize,
            fontWeight: fontWeight,
            fontStyle: fontStyle
        };
    };
    
    prot._adjustLegendPosition = function(selection){
        if (this._isHorizontal) {
            var parentNode = selection.node().parentNode;
            var width, cssString, textNode, text;
            this._legendData.forEach(function(legendData){
                
                if (!legendData.pos) {
                    return;
                }
                
                legendData.pos.left = Math.max(0, legendData.pos.left);
                
                if (legendData.key === "variance1") {
                    width = parentNode.querySelector(".v-m-variance1").getBoundingClientRect().width;
                    if (legendData.pos.left + legendData.size.width > width) {
                        if (width < legendData.size.width) {
                            setText(width, legendData);
                        }
                        legendData.pos.left = width - legendData.size.width;
                    }
                } else if (legendData.key === "variance2") {
                    width = parentNode.querySelector(".v-m-variance2").getBoundingClientRect().width;
                    if (legendData.pos.left < Constants.PADDING_IN_PLOTS) {
                        if (width < legendData.size.width) {
                            setText(width, legendData);
                        }
                        legendData.pos.left = Constants.PADDING_IN_PLOTS;
                    }
                }
            });
        }
    };
    
    function setText(width, legendData) {
        legendData.size.width = width;
        var node = legendData.node;
        var cssString = StyleUtils.convertToCss(legendData.style);
        var textNode = node.querySelector('text');
        var text = textNode.textContent;
        node.querySelector('text').textContent = TextUtils.ellipsis(text, textNode, width, cssString);
    }
    
    prot.supportFixedLayout = false;
    return VarianceTitle;
});

define('sap/viz/hichert/components/plotareas/XYYPlotArea',[
    'sap/viz/framework/common/util/oo',
    'sap/viz/chart/components/plotareas/XYYPlotArea',
    'sap/viz/chart/components/axis/ValueAxis',
    'sap/viz/hichert/components/axis/CategoryAxis',
    "sap/viz/hichert/components/plots/PlotFactory",
    'sap/viz/chart/components/util/TextUtils',
    "sap/viz/hichert/layout/SliceLayout",
    "sap/viz/hichert/components/legend/BarEmbeddedLegend",
    'sap/viz/chart/components/scrollbar/Scrollbar',
    "sap/viz/framework/scale/ValueScale",
    "sap/viz/framework/scale/ValueScaleUtil",
    "sap/viz/framework/common/util/DataUtils",
    "sap/viz/hichert/components/legend/VarianceTitle"
], function(
    oo,
    BasePlotArea,
    ValueAxis,
    CategoryAxis,
    PlotFactory,
    TextUtils,
    SliceLayout,
    BarEmbeddedLegend,
    Scrollbar,
    ValueScale,
    ValueScaleUtil,
    DataUtils,
    VarianceTitle
) {

    var SLICE_LAYOUT_KEY = "sliceOrder";
    
    var XYYPlotArea = function(runtime, options) {
        this._displayPlots = [];
        this._varianceTitles = [];
        this._isHorizontal = false;
        XYYPlotArea.superclass.constructor.apply(this, arguments);
        this._plotSeriesCount = 0;
    };

    oo.extend(XYYPlotArea, BasePlotArea);

    XYYPlotArea.prototype._getVarianceTypeMapping = function() {
        return {};
    };

    XYYPlotArea.prototype._getPlotFactory = function() {
        return PlotFactory;
    };

    XYYPlotArea.prototype._getLayoutDefinition = function() {
        return SliceLayout;
    };

    XYYPlotArea.prototype._getCategoryAxisClass = function() {
        return CategoryAxis;
    };

    XYYPlotArea.prototype._setAxisData = function(data){
        this._categoryAxis.setData(data.categoryAxis, DataUtils.hasNegativeValue(data), data.pattern);
    };

    XYYPlotArea.prototype.updateValueScale = function() {
        var data = this._data;
        var width = this._roughSize.width;
        var height = this._roughSize.height;
        if (!data || width <= 0 || height <= 0) {
            return data;
        }
        
        var variancePlotType = this._getVariancePlotType();
        
        var series = data["series"];
        
        var variancePlotCount = 0;
        if (variancePlotType.length > 0) {
            series.forEach(function(everySeries, seriesIndex) {
                for (var i = 0; i < variancePlotType.length; i++) {
                    if (this._hasBindingValue(everySeries, variancePlotType[i].key)) {
                        this._createVariancePlot(variancePlotType[i], seriesIndex);
                        variancePlotCount++;
                        break;
                    }
                }
            }, this);
        }
        
        this._plotSeriesCount = series.length - variancePlotCount;
        
        for (var name in data) {
            if (data.hasOwnProperty(name)) {

                if (data[name].scale == null || !(data[name].scale instanceof ValueScale)) {
                    continue;
                }

                var scale = data[name].scale;

                var domain = scale.getDomain();

                if (domain[0] > 0) {
                    scale.setDomain([0, domain[1]]);
                } else if (domain[1] < 0) {
                    scale.setDomain([domain[0], 0]);
                }
            }
        }
        var range = [0, 1],
            that = this;
        if (this._plot.isHorizontal()) {
            range[1] = width;
        } else {
            range[1] = height;
        }
        range[1] *= 0.8;

        var dataLabelOpt = this._properties.get('plotArea.dataLabel');
        var fixedRangeOpt = this._properties.get('plotArea.primaryScale.fixedRange');
        var valueScale = this._data.valueAxis.scale;
        var valueAxisDomain = valueScale.getDomain().slice(); 

        var valueAxisData;
        if((!(fixedRangeOpt || valueScale.getDomainFixed()[1])) && dataLabelOpt.visible && 
            valueAxisDomain && valueAxisDomain[1] > 0){
            var size = TextUtils.fastMeasure('M', dataLabelOpt.style.fontSize, 
                dataLabelOpt.style.fontWeight, dataLabelOpt.style.fontFamily, 
                dataLabelOpt.style.fontStyle);
            size.width = size.width * 4;
            valueAxisData = that._calcValueAxisScale("valueAxis", range, 
                ValueScaleUtil.extendDomainForDataLabel(valueAxisDomain, range, 
                        [size, size], this._plot.isHorizontal()));
        }else{
            valueAxisData = that._calcValueAxisScale("valueAxis", range);
        }
        
        ["valueAxis", "valueAxis2"].forEach(function(va){
          
            data[va].scale = valueAxisData.scale;
            data[va].tickHint = valueAxisData.tickHint;

            data[va].scale.setRange([0, 1]);
            if(that['_' + va]){
                that['_' + va].setData(data[va]);
            }            
        });

        return data;
    };
    XYYPlotArea.prototype._getVariancePlotType = function() {
        
        var type = [];
        
        var plotTypeMapping = this._getVarianceTypeMapping();
        
        for (var i = 1; i <= 2; i++) {
            
            var key = "variance" + i;
            var variance = this._properties.get(key);
            
            if (variance == null ||
                variance.visible !== true ||
                variance.type == null ||
                plotTypeMapping[variance.type] == null ||
                this._children[key]) {
                continue;
            }
            
            type.push({
                type: plotTypeMapping[variance.type],
                key: key
            });
        }
        
        return type;
    };
    
    XYYPlotArea.prototype._createVariancePlot = function(variance, seriesIndex) {
        
        if (this._children[variance.key]) {
            return;
        }
        
        var plot = PlotFactory.create(variance.type, this.runtime(), {
            disableClipPath: false,
            alias: variance.key,
            isHorizontal: this._isHorizontal
        });
        
        var option = {
            seriesIndex: seriesIndex,
            dataItems: ["categoryAxis", variance.key, "pattern", "pattern2"]
        };
        
        this.setChild(variance.key, plot, option);
        
        this._displayPlots.push({
            key: variance.key,
            plot: plot
        });
        this._createVarianceTitles(variance.key);
    };

    XYYPlotArea.prototype._applyDefaultProperties = function(data) {
    };

    XYYPlotArea.prototype._init = function() {

        var PlotFactory = this._getPlotFactory();

        var plotKey = "plot";
        this._plot = PlotFactory.create(this._renderType, this.runtime(), this._getPlotOptions());
        this.setChild(plotKey, this._plot, {
            dataItems: ["valueAxis", "valueAxis2", "categoryAxis", "pattern", "pattern2"]
        });

        this._displayPlots.push({
            key: plotKey,
            plot: this._plot
        });

        var isHorizontal = this._isHorizontal = this._plot.isHorizontal();
        this._plot.getDispatch().on("reRenderComplete.plotarea", this._reRenderComplete.bind(this));

        var CategoryAxis = this._getCategoryAxisClass();

        if (isHorizontal) {
            this.setLayoutSequence(['bottom', 'top', 'left', 'right']);
            this._categoryAxis = new CategoryAxis(this.runtime(), {
                name: "categoryAxis"
            });

            this.setChild("categoryAxis", this._categoryAxis, {
                position: "left"
            });
            this._valueAxis = new ValueAxis(this.runtime(), {
                name: "valueAxis"
            });
            this.setChild("valueAxis", this._valueAxis, {
                position: "bottom"
            });

            this._vScrollbar = new Scrollbar(this.runtime(), {
                name: "plotArea.scrollbar"
            });

            this.setChild("scrollbar", this._vScrollbar, {
                position: "right"
            });
        } else {
            this.setLayoutSequence(['left', 'right', 'bottom', 'top']);

            this._categoryAxis = new CategoryAxis(this.runtime(), {
                name: "categoryAxis",
                hasScrollbar: true
            });
            this.setChild("categoryAxis", this._categoryAxis, {
                position: "bottom"
            });
            this._hScrollbar = this._categoryAxis.getChild("axisScrollbar").module;
            this._vScrollbar = new Scrollbar(this.runtime(), {
                name: "plotArea.scrollbar"
            });
            this.setChild("scrollbar", this._vScrollbar, {
                position: "right"
            });

            this._valueAxis = new ValueAxis(this.runtime(), {
                name: "valueAxis"
            });
            this.setChild("valueAxis", this._valueAxis, {
                position: "left"
            });
        }

        this._createLegends();

        this.getZoomer().init({
            main: this,
            plot: this._plot,
            axisByDirection: {
                x: isHorizontal ? [] : [this._categoryAxis],
                y: isHorizontal ? [this._categoryAxis] : []
            },
            isHorizontal: isHorizontal
        });

        this._properties._props['plotArea.overlap.offsetPercentage'].set = function(val){

            val = parseFloat(val);
            
            if(val >= 1){
                return 1;
            }else if(val <= -1){
                return -1;
            }else if( val < 1 && val > -1 ){
                return val;
            }
        };
    };
    XYYPlotArea.prototype._getLegendClass = function(){
        return BarEmbeddedLegend;
    };
    XYYPlotArea.prototype._createLegends = function(){
        var legendCls = this._getLegendClass();
        this._legends = [
            new legendCls(this.runtime()),
            new legendCls(this.runtime())
        ];
        var position = this._isHorizontal ? 'top' : 'left';
        var legend = this._legends[0];
        legend.setPosition(position);
        legend.setMajor(true);
        this.setChild("embeddedLegend1", legend, {
            position: position
        });

        position = this._isHorizontal ? 'bottom' : 'right';
        legend = this._legends[1];
        legend.setPosition(position);
        legend.setMajor(false);
        this.setChild("embeddedLegend2", legend, {
            position: position
        });
    };
    XYYPlotArea.prototype._createVarianceTitles = function(alias){
        var varianceTitle = new VarianceTitle(this.runtime());
        var name = "varianceTitle" + alias[alias.length - 1];
        var position = this._isHorizontal ? 'top' : 'left';
        this._varianceTitles.push(varianceTitle);
        varianceTitle.setPosition(position);
        varianceTitle.setMajor(true);
        this.setChild(name, varianceTitle, {
            position: position
        });
    };
    
    XYYPlotArea.prototype._preRender = function() {
        
        XYYPlotArea.superclass._preRender.call(this);
        
        if (this._hasScrollbar()) {
            
            var updatedRealSize = {};
            var refPropName = this._isHorizontal ? "height" : "width";
            updatedRealSize[refPropName] = this._plot.getRealSize()[refPropName];
            
            for (var i = 1; i < this._displayPlots.length; i++) {
                this._displayPlots[i].plot.setRealSize(updatedRealSize);
            }
            
            var size = this._plot.getSize();
            var realSize = this._plot.getRealSize();
            if (this._vScrollbar) {
                this._vScrollbar.setTrackSize(size.height).setContentSize(realSize.height);
                this._vScrollbar.getDispatch().on("scroll.xycontainer", _onVScroll.bind(this));
            }
            if (this._hScrollbar) {
                this._hScrollbar.setTrackSize(size.width).setContentSize(realSize.width);
                this._hScrollbar.getDispatch().on("scroll.xycontainer", _onHScroll.bind(this));
            }
            
        }
    };
    
    XYYPlotArea.prototype.getChildByPosition = function(name) {
        
        if (name === "center") {
            return this._plot;
        }
        
        return XYYPlotArea.superclass.getChildByPosition.call(this, name);
    };
    XYYPlotArea.prototype._scroll = function(offset) {
        if (!offset) {
            return;
        }
        if (offset.x != null) {
            var offsetX = {
                x: offset.x,
                y: 0
            };
            var topChild = this.getChildByPosition("top");
            if (topChild && topChild.scroll) {
                topChild.scroll(offsetX);
            }
            var bottomChild = this.getChildByPosition("bottom");
            if (bottomChild && bottomChild.scroll) {
                bottomChild.scroll(offsetX);
            }
        }

        if (offset.y != null) {
            var offsetY = {
                x: 0,
                y: offset.y
            };
            var leftChild = this.getChildByPosition("left");
            if (leftChild && leftChild.scroll) {
                leftChild.scroll(offsetY);
            }
            var rightChild = this.getChildByPosition("right");
            if (rightChild && rightChild.scroll) {
                rightChild.scroll(offsetY);
            }
        }

        var i, len;
        for (i = 0, len = this._displayPlots.length; i < len; i++) {
            var plot = this._displayPlots[i].plot;
            if (plot.scroll) {
                plot.scroll(offset);
            }
        }
        for (i = 0, len = this._legends.length; i < len; i++) {
            this._legends[i].afterRender();
        }
        
        this.runtime().fireInteractionEvent('plotScroll', offset);
        this.runtime().eventDispatcher().fire('plotScroll', offset);
    };
    
    function _onVScroll(e) {
        this._scroll({
            y: e.offset
        });
    }

    function _onHScroll(e) {
        this._scroll({
            x: e.offset
        });
    }

    XYYPlotArea.prototype._configLayout = function() {
        
        XYYPlotArea.superclass._configLayout.call(this);

        var i;
        var flowOrder = [];
        var tempOptions = {};
        var plotLayoutOptions = [];
        var plotOption;
        var plotLayoutOption;
        var sum = 0;
        var fixedRatio = 0;
        
        for (i = 0; i < this._displayPlots.length; i++) {
            plotLayoutOption = plotLayoutOptions[i] = this._displayPlots[i].plot.getLayoutOption();
            if (plotLayoutOption.fixedRatio == null) {
                sum += plotLayoutOption.delta;
            } else {
                fixedRatio += plotLayoutOption.fixedRatio;
            }
        }

        if (fixedRatio >= 1) {
            throw "The width or height of fixed ratio plot is over 100%";
        }

        var sizeRatioSum = 0;
        var sizeRatios = [];
        for (i = 0; i < this._displayPlots.length; ++i) {
            plotLayoutOption = plotLayoutOptions[i];
            var sizeRatio = plotLayoutOption.fixedRatio || (plotLayoutOption.delta / sum * (1 - fixedRatio));
            sizeRatioSum += sizeRatio;
            sizeRatios.push(sizeRatio / sizeRatioSum);
        }

        var sliceOrder = this._getSliceOrder();
        var paddingBefore = this._isHorizontal ? 'left' : 'bottom';
        var paddingAfter = this._isHorizontal ? 'right' : 'top';
        var position = this._isHorizontal ? 'right' : 'top';
        for (i = this._displayPlots.length; i--;) {

            plotLayoutOption = plotLayoutOptions[i];
            var paddings = {};
            paddings[paddingBefore] = plotLayoutOption.beforeGap > 0 ? (plotLayoutOption.beforeGap) : 0;
            paddings[paddingAfter] = plotLayoutOption.afterGap > 0 ? (plotLayoutOption.afterGap) : 0;

            sliceOrder.push({
                name: this._displayPlots[i].key,
                position: position,
                sizeType: SliceLayout.SIZE_TYPE.PERCENT,
                size: sizeRatios[i],
                paddings: paddings,
                sizeExcludePadding: true
            });
        }

        this._layoutAlgorithm.config.set({
            items: sliceOrder
        });
    };

    XYYPlotArea.prototype._getSliceOrder = function() {
        
        var direct = this._isHorizontal === true ? "horizontal" : "vertical";
        
        var legend1 = {
            name: 'embeddedLegend1',
            overlap: {
                renderedIn: "shadowArea",
                alignWith: {
                    name: "plot",
                    direct: direct
                }
            }
        };
        var legend2 = {
            name: 'embeddedLegend2',
            percentRef: 'total'
        };
        var varianceTitle1 = {
            name: 'varianceTitle1',
            overlap: {
                renderedIn: "shadowArea",
                alignWith: {
                    name: "variance1",
                    direct: direct,
                    includePadding: true
                }
            }
        };
        var varianceTitle2 = {
            name: 'varianceTitle2',
            overlap: {
                renderedIn: "shadowArea",
                alignWith: {
                    name: "variance2",
                    direct: direct,
                    includePadding: true
                }
            }
        };
        
        var isValueAxisVisible = this._properties.get('valueAxis.visible') === true;
        
        var shadowArea = {
            name: "shadowArea",
            shadow: {
                preferredSizeRef: isValueAxisVisible && !this._isHorizontal ? "valueAxis" : "embeddedLegend1"
            }
        };
        
        var valueAxis, shadowAreaBottom;
        var sliceSetting = [shadowArea];
        
        if (this._isHorizontal) {
            
            shadowAreaBottom = {
                name: "shadowAreaBottom",
                shadow: {
                    preferredSizeRef: "valueAxis"
                }
            };

            valueAxis = {
                name: 'valueAxis',
                overlap: {
                    renderedIn: "shadowAreaBottom",
                    alignWith: {
                        name: "plot",
                        direct: direct
                    }
                }
            };
            
            sliceSetting.push(shadowAreaBottom);
        } else {

            valueAxis = {
                name: 'valueAxis',
                overlap: {
                    renderedIn: "shadowArea",
                    alignWith: {
                        name: "plot",
                        direct: direct
                    }
                }
            };
        }
        
        sliceSetting = sliceSetting.concat([legend1, legend2, varianceTitle1, varianceTitle2, {
            name: 'scrollbar'
        }, valueAxis, {
            name: 'categoryAxis'
        }]);
        
        return sliceSetting;
    };
    XYYPlotArea.prototype._renderSub = function() {
        
        var children = this._children;
        var selections = this._selections;
        var name;
        var child;

        for (name in children){
            if (children.hasOwnProperty(name)){
                child = children[name].module;
                child.render(selections[child.alias]);
            }
        }

        for (name in children) {
            if (children.hasOwnProperty(name)) {
                child = children[name].module;
                if (child.afterRender) {
                    child.afterRender(selections[child.alias]);
                }
            }
        }

        this._plot._repositionZeroline();
    };

    XYYPlotArea.prototype._setPlotData = function(data) {
        this._updateChildData(data);
    };

    XYYPlotArea.prototype._hasBindingValue = function(series, name) {

        for (var i = 0; i < series.length; i++) {
            if (series[i] && series[i].hasOwnProperty(name)) {
                return true;
            }
        }
        return false;
    };

    XYYPlotArea.prototype._updateChildData = function(updatedData) {

        var seriesIndex = 0;

        for (var key in this._children) {
            if (this._children.hasOwnProperty(key)) {

                var child = this.getChild(key);
                var dataItems = child.option.dataItems;
                
                if (!dataItems) {
                    child.module.setData(updatedData);
                    continue;
                }
                
                var data = {};
                
                for (var i = 0; i < dataItems.length; i++) {
                    
                    var name = dataItems[i];
                    
                    data[name] = updatedData[name];
                    
                    if (data[name].scale && data[name].scale instanceof ValueScale) {
                        
                        var series = updatedData["series"];
                        
                        if (child.option.seriesIndex != null) {
                            
                            data["series"] = [series[child.option.seriesIndex]];
                            
                            data.targetSeriesCount = this._plotSeriesCount;
                            
                        } else {
                            var updatedSeries = series.filter(function(everySeries) {
                                return this._hasBindingValue(everySeries, name);
                            }, this);
                            
                            if (data["series"]) {
                                data["series"] = data["series"].concat(updatedSeries);
                            } else {
                                data["series"] = updatedSeries;
                            }
                        }
                    }
                    
                }
                
                child.module.setData(data);
            }
        }
    };

    var mapPropertyName = function(propName, moduleName, isHorizontal, propDefName) {
        propDefName = propDefName.replace(/\b\w+\b/g, function(word) {
                return word.substring(0,1).toUpperCase() + word.substring(1);
            }
        );
        if (moduleName === "embeddedLegend1") {
            if (isHorizontal) {
                propName = "embeddedLegend.layout.up" + propDefName;
            } else {
                propName = "embeddedLegend.layout.left" + propDefName;
            }
        } else if (moduleName === "embeddedLegend2") {
            if (isHorizontal) {
                propName = "embeddedLegend.layout.bottom" + propDefName;
            } else {
                propName = "embeddedLegend.layout.right" + propDefName;
            }
        }
        return propName;
    };

    XYYPlotArea.prototype.addAutoLayoutProperties = function(subModuleName) {
        var properties = this._properties;
        var isHorizontal = this._plot.isHorizontal();
        var that = this;
        [{
            name: "autoWidth",
            key: "width"
        }, {
            name: "autoHeight",
            key: "height"
        }].forEach(function(propDef) {
            var propName = subModuleName + ".layout." + propDef.name;
            propName = mapPropertyName(propName, subModuleName, isHorizontal, propDef.name);
            properties.origin.add(propName, {
                defaultValue: 0,
                readonly: true,
                serializable: false,
                get: function() {
                    var layoutResult = that._layoutResult;
                    if (layoutResult) {
                        var moduleResult = layoutResult[subModuleName];
                        if (moduleResult && moduleResult[propDef.key]) {
                            return moduleResult[propDef.key];
                        }
                    }
                    return 0;
                }
            });
        });
    };

    XYYPlotArea.prototype.destroy = function() {
        XYYPlotArea.superclass.destroy.call(this);
        this._displayPlots = null;
    };

    return XYYPlotArea;
});

define('sap/viz/hichert/components/plotareas/VarianceLinePlotArea',[
    'sap/viz/framework/common/util/oo',
    'sap/viz/hichert/components/plotareas/XYYPlotArea',
    'sap/viz/hichert/components/legend/LineEmbeddedLegend',
    'sap/viz/chart/components/axis/ValueAxis',
    "sap/viz/framework/scale/ValueScaleUtil",
    'sap/viz/hichert/components/util/EmbeddedLegendUtil'
    
], function(
    oo,
    XYYPlotArea,
    LineEmbeddedLegend,
    ValueAxis,
    ValueScaleUtil,
    EmbeddedLegendUtil
) {
    
    var VarianceLinePlotArea = function(runtime, options) {
        VarianceLinePlotArea.superclass.constructor.call(this, runtime, options);
    };

    oo.extend(VarianceLinePlotArea, XYYPlotArea);

    var plotTypeMapping = {
        "absolute" : "hichert_delta_line_variance",
        "percentage" : "hichert_delta_percentage_line_variance"
    };
    
    VarianceLinePlotArea.prototype._getVarianceTypeMapping = function() {
        return plotTypeMapping;
    };
    
    VarianceLinePlotArea.prototype.updateValueScale = function() {
        
        var data = this._data;
        var width = this._roughSize.width;
        var height = this._roughSize.height;
        if (!data || width <= 0 || height <= 0) {
            return data;
        }
        var range = [0, 1];
        if (this._plot.isHorizontal()) {
            range[1] = width;
        } else {
            range[1] = height;
        }
        range[1] *= 0.8;
        
        VarianceLinePlotArea.superclass.updateValueScale.call(this);
        
        var valueAxisData = this._calcValueAxisScale("valueAxis", range);
        var valueAxisData2 = this._calcValueAxisScale("valueAxis2", range);
        
        ValueScaleUtil.syncTicks(valueAxisData.scale, valueAxisData2.scale);
        var autoScale = valueAxisData.autoScale;
        var autoScale2 = valueAxisData2.autoScale;
        ValueScaleUtil.syncTicks(autoScale, autoScale2);
        valueAxisData.scale.setAutoDomain(autoScale.getDomain());
        valueAxisData2.scale.setAutoDomain(autoScale2.getDomain());

        var replacedData = {
            valueAxis: valueAxisData,
            valueAxis2: valueAxisData2
        };

        [valueAxisData, valueAxisData2].forEach(function(e, i) {
            var key = "valueAxis" + (i ? "2" : "");
            data[key].scale = e.scale;
            e.tickHint = data[key].tickHint = e.scale._tickHint;
            data[key].scale.setRange([0, 1]);
            var currentAxisData = replacedData[key];
            currentAxisData.metaData = data[key].metaData;
            
            var component = this["_" + key];
            if (component) {
                component.setData(currentAxisData);
            }
            
        }, this);

        return this._cloneData(replacedData);
    };
    
    VarianceLinePlotArea.prototype._init = function() {
        VarianceLinePlotArea.superclass._init.apply(this, arguments);
        var isHorizontal = this._plot.isHorizontal();

        if (isHorizontal) {
            this._valueAxis = new ValueAxis(this.runtime(), {
                name: "valueAxis",
                hasScrollbar:true
            });
            this.setChild("valueAxis", this._valueAxis, {
                position: "bottom"
            });
            this._hScrollbar = this._valueAxis.getChild("axisScrollbar").module;
        } else {
            this._valueAxis = new ValueAxis(this.runtime(), {
                name: "valueAxis"
            });
            this.setChild("valueAxis", this._valueAxis, {
                position: "left"
            });
            
            this._hScrollbar = this._categoryAxis.getChild("axisScrollbar").module;
        }
        
        this.getZoomer().init({
            main: this,
            plot: this._plot,
            axisByDirection: {
                x: isHorizontal ? [this._valueAxis] : [this._categoryAxis],
                y: isHorizontal ? [this._categoryAxis] : [this._valueAxis]
            },
            isHorizontal: isHorizontal
        });
    };

    VarianceLinePlotArea.prototype._getLegendClass = function(){
        return LineEmbeddedLegend;
    };

    VarianceLinePlotArea.prototype._setAxisData = function(data) {
        VarianceLinePlotArea.superclass._setAxisData.call(this, data);
        this._valueAxis.setData(data.valueAxis);
    };
   
    VarianceLinePlotArea.prototype._updateChildData = function(updatedData) {
        VarianceLinePlotArea.superclass._updateChildData.call(this, updatedData);
        var legends = this._legends;
        var varianceTitles = this._varianceTitles;
        this._displayPlots.forEach(function(displayPlot){
            var key = displayPlot.key;
            var plotData = displayPlot.plot.getData();
            var series = plotData.series;
            var visible = this._runtime.propertyManager().get('valueAxis.visible');
            legends.forEach(function(legend){
                var _this = this;
                if (key === 'plot') {
                    if (!this._isHorizontal) {
                        if (legend.alias === 'embeddedLegend1' && !visible) {
                            legend.addData(series[0], 'pattern', plotData.pattern, false);
                            legend.addData(series[1], 'pattern2', plotData.pattern2, false);
                        }
                        if (legend.alias === 'embeddedLegend2') {
                            var legendData = {};
                            legendData.series = series[0];
                            legendData.key = 'pattern';
                            legendData.bindingData = plotData.pattern;
                            if (!EmbeddedLegendUtil.isHeadTailSame(legendData)) {
                                legend.addData(series[0], 'pattern', plotData.pattern, false);
                            }
                            legendData.series = series[1];
                            legendData.key = 'pattern2';
                            legendData.bindingData = plotData.pattern2;
                            if (!EmbeddedLegendUtil.isHeadTailSame(legendData)) {
                                legend.addData(series[1], 'pattern2', plotData.pattern2, false);
                            }
                        }
                    }
                }
            }, this);
            varianceTitles.forEach(function(varianceTitle) {
                var _this = this;
                if (key[key.length - 1] === varianceTitle.alias[varianceTitle.alias.length - 1]) {
                    varianceTitle.addData(null, key, plotData[key], true, function(){
                        return _this._selections[key].node().querySelector('.v-zeroline-group');
                    });
                }
            }, this);
        }, this);
    };
   
    return VarianceLinePlotArea;
});

define('sap/viz/hichert/components/plotareas/StackedColumnPlotArea',[
    "sap/viz/framework/common/util/oo",
    "sap/viz/hichert/components/plotareas/XYPlotArea",
    "sap/viz/hichert/components/legend/StackedBarEmbeddedLegend"
], function(
    oo,
    XYPlotArea,
    StackedBarEmbeddedLegend
) {
    
    var StackedColumnPlotArea = function(runtime, option) {
        StackedColumnPlotArea.superclass.constructor.apply(this, arguments);
    };
    
    oo.extend(StackedColumnPlotArea, XYPlotArea);

    var prot = StackedColumnPlotArea.prototype;
    
    prot._getLegendClass = function(){
        return StackedBarEmbeddedLegend;
    };
    
    prot._init = function() {
        
        this._properties.set("valueAxis.visible", false);
        this._properties.set("categoryAxis.title.visible", false);
        
        StackedColumnPlotArea.superclass._init.call(this);
    };

    return StackedColumnPlotArea;
});

define('sap/viz/hichert/components/differenceMarker/renderer/DifferenceMarkerRenderer',[
    'sap/viz/framework/common/util/oo',
    'sap/viz/chart/components/UIComponent',
    'sap/viz/framework/common/util/SVG',
    "sap/viz/chart/components/util/TextUtils",
    'sap/viz/framework/common/format/UnitFormat',
    'sap/viz/hichert/components/util/Constants',
    "sap/viz/framework/common/util/GeometryUtils",
    "sap/viz/framework/common/util/DataGraphics",
    'sap/viz/framework/common/util/DOM'
], function(oo, UIComponent, SVG, TextUtils, UnitFormat, Constants,
    GeometryUtils, DataGraphics, DOM) {

    function DifferenceMarker() {
        DifferenceMarker.superclass.constructor.apply(this, arguments);
    }

    oo.extend(DifferenceMarker, UIComponent);

    var prot = DifferenceMarker.prototype;
    var OFFSET_LINE_WIDTH = 3;
    var REFENRENCE_LINE_WIDTH = 1,
        DIFFERENCE_LINE_COLOR = "#808080";
    var POSITIVE_LINE_COLOR = "#008000",
        NEGATIVE_LINE_COLOR = "#FF0000";
    var CIRCLE_COLOR = "black",
        CIRCLE_STROKE_COLOR = "white",
        CIRCLE_RADIUS = 3,
        CIRCLE_STROKE_WIDTH = 1.5;
    var DIFFERENCE_MARKER_PADDING = 10;
    var LABEL_PADDING = 3;
    var DL_LAYER = "differenceMarker";

    prot.render = function(config, renderPlot, selectionConfig) {
        var actionLayer, dlLayer, diffMarkerGroup, diffMarkerLabelGroup, diffMarkerNode, markerPosition;
        var plotBBox = {};
        if (!renderPlot) {
            actionLayer = config[0].actionLayer;
            actionLayer.clear(DL_LAYER);
            dlLayer = actionLayer.createLayer(DL_LAYER, config[0].offset);
            plotBBox.width = config[0].plotMainBBox.width;
            plotBBox.height = config[0].plotMainBBox.height;
            var maskMgr = dlLayer.getMaskManager();
            var mask = {
                width: plotBBox.width,
                height: plotBBox.height
            };
            maskMgr.addRect(mask);
            config[0].start.x += config[0].scrollOffset.x;
            config[0].start.y += config[0].scrollOffset.y;
            config[0].end.x += config[0].scrollOffset.x;
            config[0].end.y += config[0].scrollOffset.y;
        } else {
            var plotNode = d3.select(selectionConfig.node[0]).node();
            diffMarkerGroup = plotNode.querySelector("." + Constants.CSS.CLASS.DIFFERENCE_MARKER_GROUP);
            if (diffMarkerGroup) {
                DOM.remove(diffMarkerGroup);
            }
            diffMarkerGroup = SVG.create('g');
            diffMarkerGroup.setAttribute("class", Constants.CSS.CLASS.DIFFERENCE_MARKER_GROUP);
            plotNode.appendChild(diffMarkerGroup);
            var clipPath = plotNode.getElementsByTagName('clipPath');
            if (clipPath && clipPath.length > 0) {
                var clipPathId = clipPath[0].getAttribute('id');
                diffMarkerGroup.setAttribute("clip-path", "url(#" + clipPathId + ")");
            }
            diffMarkerNode = SVG.create("g", diffMarkerGroup);
            diffMarkerNode.setAttribute("class", Constants.CSS.CLASS.DIFFERENCE_MARKER_ITEM);
            diffMarkerLabelGroup = SVG.create("g", diffMarkerGroup);
            diffMarkerLabelGroup.setAttribute("class", Constants.CSS.CLASS.DIFFERENCE_MARKER_LABEL_GROUP);
            plotBBox = selectionConfig.size;
        }

        for (var i = 0; i < config.length; i++) {
            var lineHeight;
            var markerConfig = config[i];
            if (markerConfig.isHorizontal) {
                if (markerConfig.end.value * markerConfig.start.value < 0) {
                    lineHeight = Math.abs(markerConfig.end.width +
                        markerConfig.start.width) + REFENRENCE_LINE_WIDTH;
                } else {
                    lineHeight = Math.abs(markerConfig.end.width -
                        markerConfig.start.width) + REFENRENCE_LINE_WIDTH;
                }
            } else {
                if (markerConfig.end.value * markerConfig.start.value < 0) {
                    lineHeight = Math.abs(markerConfig.end.height +
                        markerConfig.start.height) + REFENRENCE_LINE_WIDTH;
                } else {
                    lineHeight = Math.abs(markerConfig.end.height -
                        markerConfig.start.height) + REFENRENCE_LINE_WIDTH;
                }
            }

            markerPosition = this._renderMarker(markerConfig, lineHeight, plotBBox, dlLayer, diffMarkerNode);

            if (renderPlot) {
                this._renderLabel(markerConfig, lineHeight, plotBBox, dlLayer, diffMarkerLabelGroup, markerPosition);
            } else {
                this._renderLabel(markerConfig, lineHeight, plotBBox, dlLayer, diffMarkerNode, markerPosition);
            }
        }
        if (!renderPlot) {
            actionLayer.drawLayer(dlLayer);
        }
    };

    prot._renderMarker = function(config, lineHeight, plotBBox, dlLayer, diffMarkerNode) {
        var end = config.end,
            start = config.start;
        var lineFill, isRender;
        var differenceMarkerConfig, differenceMarkerTopY, differenceMarkerTopConfig,
            differenceMarkerBottomX, differenceMarkerBottomY, differenceMarkerBottom;
        var differenceMarkerCircleTopY, differenceMarkerCircleTopConfig, differenceMarkerCircleBottomX,
            differenceMarkerCircleBottomY, differenceMarkerCircleBottomConfig;
        var differenceMarkerCircleTop2Config, differenceMarkerCircleBottom2Config;
        var startY, endY;
        if (config.value > 0) {
            lineFill = POSITIVE_LINE_COLOR;
        } else if (config.value < 0) {
            lineFill = NEGATIVE_LINE_COLOR;
        } else {
            lineFill = DIFFERENCE_LINE_COLOR;
        }

        if (config.isHorizontal) {
            var startX = start.value < 0 ? start.x : start.x + start.width;
            var endX = end.value < 0 ? end.x : end.x + end.width;
            differenceMarkerConfig = {
                x: Math.min(startX, endX),
                width: lineHeight,
                height: OFFSET_LINE_WIDTH,
                fill: lineFill
            };

            differenceMarkerTopConfig = {
                x: startX,
                width: REFENRENCE_LINE_WIDTH,
                height: (Math.abs(end.y - start.y) + end.height / 2 + DIFFERENCE_MARKER_PADDING),
                fill: DIFFERENCE_LINE_COLOR
            };

            differenceMarkerBottom = {
                x: endX,
                width: REFENRENCE_LINE_WIDTH,
                height: (end.height / 2 + DIFFERENCE_MARKER_PADDING),
                fill: DIFFERENCE_LINE_COLOR
            };

            differenceMarkerCircleTopConfig = {
                cy: end.y + end.height / 2,
                cx: endX,
                r: CIRCLE_RADIUS,
                fill: CIRCLE_COLOR,
                stroke: CIRCLE_STROKE_COLOR,
                strokeWidth: CIRCLE_STROKE_WIDTH
            };

            differenceMarkerCircleBottomConfig = {
                cy: start.y + start.height / 2,
                cx: startX,
                r: CIRCLE_RADIUS,
                fill: CIRCLE_COLOR,
                stroke: CIRCLE_STROKE_COLOR,
                strokeWidth: CIRCLE_STROKE_WIDTH
            };

            differenceMarkerCircleTop2Config = {
                cx: Math.min(endX, startX),
                r: CIRCLE_RADIUS,
                fill: CIRCLE_COLOR,
                stroke: CIRCLE_STROKE_COLOR,
                strokeWidth: CIRCLE_STROKE_WIDTH
            };

            differenceMarkerCircleBottom2Config = {
                cx: (Math.min(endX, startX) + lineHeight),
                r: CIRCLE_RADIUS,
                fill: CIRCLE_COLOR,
                stroke: CIRCLE_STROKE_COLOR,
                strokeWidth: CIRCLE_STROKE_WIDTH
            };

            if (end.y > start.y) {
                differenceMarkerConfig.y = end.y + end.height + DIFFERENCE_MARKER_PADDING;
                if (differenceMarkerConfig.y + OFFSET_LINE_WIDTH > plotBBox.height) {
                    differenceMarkerConfig.y = end.y + end.height;
                }
                differenceMarkerTopConfig.y = start.y + end.height / 2;
                differenceMarkerBottom.y = end.y + end.height / 2;
                differenceMarkerCircleTop2Config.cy = differenceMarkerConfig.y + OFFSET_LINE_WIDTH / 2;
                differenceMarkerCircleBottom2Config.cy = differenceMarkerCircleTop2Config.cy;

            } else {
                differenceMarkerConfig.y = end.y - DIFFERENCE_MARKER_PADDING;
                if (differenceMarkerConfig.y < 0) {
                    differenceMarkerConfig.y = end.y;
                }
                differenceMarkerTopConfig.y = differenceMarkerConfig.y;
                differenceMarkerBottom.y = differenceMarkerConfig.y;
                differenceMarkerCircleTop2Config.cy = differenceMarkerConfig.y + OFFSET_LINE_WIDTH / 2;
                differenceMarkerCircleBottom2Config.cy = differenceMarkerCircleTop2Config.cy;
            }
        } else {
            startY = start.value > 0 ? start.y : start.y + start.height;
            endY = end.value > 0 ? end.y : end.y + end.height;
            differenceMarkerConfig = {
                y: Math.min(endY, startY),
                width: OFFSET_LINE_WIDTH,
                height: lineHeight,
                fill: lineFill
            };

            differenceMarkerTopConfig = {
                y: startY,
                width: (Math.abs(end.x - start.x) + end.width / 2 + DIFFERENCE_MARKER_PADDING),
                height: REFENRENCE_LINE_WIDTH,
                fill: DIFFERENCE_LINE_COLOR
            };

            differenceMarkerBottom = {
                y: endY,
                width: (end.width / 2 + DIFFERENCE_MARKER_PADDING),
                height: REFENRENCE_LINE_WIDTH,
                fill: DIFFERENCE_LINE_COLOR
            };

            differenceMarkerCircleTopConfig = {
                cx: end.x + end.width / 2,
                cy: endY,
                r: CIRCLE_RADIUS,
                fill: CIRCLE_COLOR,
                stroke: CIRCLE_STROKE_COLOR,
                strokeWidth: CIRCLE_STROKE_WIDTH
            };

            differenceMarkerCircleBottomConfig = {
                cx: start.x + start.width / 2,
                cy: startY,
                r: CIRCLE_RADIUS,
                fill: CIRCLE_COLOR,
                stroke: CIRCLE_STROKE_COLOR,
                strokeWidth: CIRCLE_STROKE_WIDTH
            };

            differenceMarkerCircleTop2Config = {
                cy: Math.min(endY, startY),
                r: CIRCLE_RADIUS,
                fill: CIRCLE_COLOR,
                stroke: CIRCLE_STROKE_COLOR,
                strokeWidth: CIRCLE_STROKE_WIDTH
            };

            differenceMarkerCircleBottom2Config = {
                cy: (Math.min(endY, startY) + lineHeight),
                r: CIRCLE_RADIUS,
                fill: CIRCLE_COLOR,
                stroke: CIRCLE_STROKE_COLOR,
                strokeWidth: CIRCLE_STROKE_WIDTH
            };

            if (end.x > start.x) {
                differenceMarkerConfig.x = end.x + end.width + DIFFERENCE_MARKER_PADDING;
                if (differenceMarkerConfig.x + OFFSET_LINE_WIDTH > plotBBox.width) {
                    differenceMarkerConfig.x = end.x + end.width;
                }
                differenceMarkerTopConfig.x = start.x + end.width / 2;
                differenceMarkerBottom.x = end.x + end.width / 2;
                differenceMarkerCircleTop2Config.cx = differenceMarkerConfig.x + OFFSET_LINE_WIDTH / 2;
                differenceMarkerCircleBottom2Config.cx = differenceMarkerCircleTop2Config.cx;

            } else {
                differenceMarkerConfig.x = end.x - DIFFERENCE_MARKER_PADDING;
                if (differenceMarkerConfig.x < 0) {
                    differenceMarkerConfig.x = end.x;
                }
                differenceMarkerTopConfig.x = differenceMarkerConfig.x;
                differenceMarkerBottom.x = differenceMarkerConfig.x;
                differenceMarkerCircleTop2Config.cx = differenceMarkerConfig.x + OFFSET_LINE_WIDTH / 2;
                differenceMarkerCircleBottom2Config.cx = differenceMarkerCircleTop2Config.cx;
            }
        }

        if (dlLayer) {
            dlLayer.addRect(differenceMarkerConfig);
            dlLayer.addRect(differenceMarkerTopConfig);
            dlLayer.addRect(differenceMarkerBottom);
            dlLayer.addCircle(differenceMarkerCircleTopConfig);
            dlLayer.addCircle(differenceMarkerCircleBottomConfig);
            dlLayer.addCircle(differenceMarkerCircleTop2Config);
            dlLayer.addCircle(differenceMarkerCircleBottom2Config);
        } else {
            var diffMarkerShapeNode = SVG.create("g", diffMarkerNode);
            this._drawRect(differenceMarkerConfig, diffMarkerShapeNode);
            this._drawRect(differenceMarkerTopConfig, diffMarkerShapeNode);
            this._drawRect(differenceMarkerBottom, diffMarkerShapeNode);
            this._drawCircle(differenceMarkerCircleTopConfig, diffMarkerShapeNode);
            this._drawCircle(differenceMarkerCircleBottomConfig, diffMarkerShapeNode);
            this._drawCircle(differenceMarkerCircleTop2Config, diffMarkerShapeNode);
            this._drawCircle(differenceMarkerCircleBottom2Config, diffMarkerShapeNode);
        }
        return differenceMarkerConfig;
    };

    prot._renderLabel = function(config, lineHeight, plotBBox, dlLayer, diffMarkerNode, markerPosition) {
        var end = config.end,
            start = config.start;
        var dataLabelProps = config.props;
        var fontFamily = dataLabelProps.style.fontFamily;
        var fontSize = dataLabelProps.style.fontSize;
        var fontWeight = dataLabelProps.style.fontWeight;
        var fontColor = dataLabelProps.style.color;
        var fontStyle = dataLabelProps.style.fontStyle;

        var labelText = UnitFormat.format(config.value, dataLabelProps.formatString,
            dataLabelProps.unitFormatType);
        var labelSize = TextUtils.fastMeasure(labelText, fontSize, fontWeight, fontFamily);
        var diffMarkerLabelRect, diffMarkerLabelText;
        if (config.isHorizontal) {
            var startX = start.value < 0 ? start.x : start.x + start.width;
            var endX = end.value < 0 ? end.x : end.x + end.width;
            diffMarkerLabelRect = {
                x: (Math.min(endX, startX) + lineHeight / 2 - labelSize.width / 2),
                width: labelSize.width + 2,
                height: labelSize.height,
                fill: 'white',
                opacity: dataLabelProps.background.opacity,
                pointerEvent: "none"
            };

            diffMarkerLabelText = {
                x: (Math.min(endX, startX) + lineHeight / 2 - labelSize.width / 2),
                fontFamily: fontFamily,
                fontSize: fontSize,
                fontWeight: fontWeight,
                fontColor: fontColor,
                fontStyle: fontStyle,
                text: labelText,
                pointerEvent: "none"
            };

            if (end.y > start.y) {
                diffMarkerLabelRect.y = end.y + end.height + DIFFERENCE_MARKER_PADDING +
                    LABEL_PADDING + OFFSET_LINE_WIDTH;
                if (diffMarkerLabelRect.y + labelSize.height + OFFSET_LINE_WIDTH > plotBBox.height) {
                    diffMarkerLabelRect.y = markerPosition.y - labelSize.height - LABEL_PADDING;
                }
            } else {
                diffMarkerLabelRect.y = end.y - labelSize.height - DIFFERENCE_MARKER_PADDING - LABEL_PADDING;
                if (diffMarkerLabelRect.y < 0) {
                    diffMarkerLabelRect.y = markerPosition.y + OFFSET_LINE_WIDTH + LABEL_PADDING;
                }
            }
            diffMarkerLabelText.y = diffMarkerLabelRect.y - labelSize.y;
        } else {
            var startY = start.value > 0 ? start.y : start.y + start.height;
            var endY = end.value > 0 ? end.y : end.y + end.height;
            diffMarkerLabelRect = {
                y: (Math.min(endY, startY) + lineHeight / 2 - labelSize.height / 2),
                width: labelSize.width + 2,
                height: labelSize.height,
                fill: 'white',
                fillOpacity: dataLabelProps.background.opacity
            };

            diffMarkerLabelText = {
                y: (Math.min(endY, startY) + lineHeight / 2 + labelSize.y + labelSize.height),
                fontFamily: fontFamily,
                fontSize: fontSize,
                fontWeight: fontWeight,
                text: labelText
            };

            if (end.x > start.x) {
                diffMarkerLabelRect.x = end.x + end.width + LABEL_PADDING +
                    OFFSET_LINE_WIDTH + DIFFERENCE_MARKER_PADDING;
                if (diffMarkerLabelRect.x + labelSize.width + OFFSET_LINE_WIDTH > plotBBox.width) {
                    diffMarkerLabelRect.x = markerPosition.x - labelSize.width - OFFSET_LINE_WIDTH - LABEL_PADDING;
                }
            } else {
                diffMarkerLabelRect.x = end.x - OFFSET_LINE_WIDTH - LABEL_PADDING -
                    labelSize.width - DIFFERENCE_MARKER_PADDING;
                if (diffMarkerLabelRect.x < 0) {
                    diffMarkerLabelRect.x = markerPosition.x + OFFSET_LINE_WIDTH + LABEL_PADDING;
                }
            }
            diffMarkerLabelText.x = diffMarkerLabelRect.x;
        }
        if (dlLayer) {
            dlLayer.addRect(diffMarkerLabelRect);
            dlLayer.addText(diffMarkerLabelText);
        } else {
            var diffMarkerLabelNode = SVG.create("g", diffMarkerNode);
            diffMarkerLabelNode.setAttribute("class", Constants.CSS.CLASS.DIFFERENCE_MARKER_LABEL);
            DataGraphics.setData(diffMarkerLabelNode, {
                start: start.dimensionalContext,
                end: end.dimensionalContext
            });
            this._drawRect(diffMarkerLabelRect, diffMarkerLabelNode);
            this._drawText(diffMarkerLabelText, diffMarkerLabelNode);
        }
    };

    function setAttribute(node, attr) {
        for (var name in attr) {
            if (attr.hasOwnProperty(name)) {
                if (attr[name] == null) {
                    node.removeAttribute(name);
                } else {
                    node.setAttribute(name, attr[name]);
                }
            }
        }
    }

    prot._drawRect = function(config, parent) {
        var rectNode = SVG.create('rect');
        setAttribute(rectNode, {
            "x": config.x,
            "y": config.y,
            "width": config.width,
            "height": config.height,
            "fill": config.fill,
            "stroke": config.stroke,
            "stroke-width": config.strokeWidth,
            "opacity": config.opacity
        });
        parent.appendChild(rectNode);
    };

    prot._drawCircle = function(config, parent) {
        var circleNode = SVG.create('circle');
        setAttribute(circleNode, {
            "cx": config.cx,
            "cy": config.cy,
            "r": config.r,
            "fill": config.fill,
            "stroke": config.stroke,
            "stroke-width": config.strokeWidth
        });
        parent.appendChild(circleNode);
    };

    prot._drawText = function(config, parent) {
        var textNode = SVG.create("text");
        setAttribute(textNode, {
            "x": config.x,
            "y": config.y,
            "fill": config.fontColor,
            "font-size": config.fontSize,
            "font-weight": config.fontWeight,
            "font-Style": config.fontStyle,
            "font-family": config.fontFamily,
            "text-anchor": config.textAnchor
        });
        textNode.textContent = config.text;
        parent.appendChild(textNode);
    };

    prot.clear = function(actionLayer) {
        actionLayer.clear(DL_LAYER);
    };

    prot.destroy = function() {
        DifferenceMarker.superclass.destroy.call(this);
    };

    return DifferenceMarker;
});
define('sap/viz/hichert/components/differencemarker/DifferenceMarker',[
    'sap/viz/framework/common/util/oo',
    'sap/viz/chart/components/UIComponent',
    "sap/viz/hichert/components/differenceMarker/renderer/DifferenceMarkerRenderer"
], function(oo, UIComponent, DifferenceMarkerRenderer) {

    function DifferenceMarker(runtime, option) {
        DifferenceMarker.superclass.constructor.apply(this, arguments);
        var that = this,
            statusMgr = this.runtime().statusManager();
        statusMgr.add("plot.differenceMarker.markerContexts", {
            defaultValue: []
        });
        this._markerContextHandler = statusMgr.watch("plot.differenceMarker.markerContexts", function() {
            updateMarkers.apply(that, arguments);
        });
    }

    function buildMarkerConfigs(offset) {
        var statusMgr = this.runtime().statusManager(),
            markerContexts = statusMgr.get("plot.differenceMarker.markerContexts"),
            that = this,
            props = this.properties().plotArea.dataLabel,
            plotModule = this._plotModule,
            markerConfigs;
        markerConfigs = markerContexts.map(function(markerContext) {
            var start = plotModule.mappingdataPointInfoByCtx(markerContext.start),
                end = plotModule.mappingdataPointInfoByCtx(markerContext.end);
            //return only valid marker contexts
            if(start !== null && end !== null) {
                start.x += offset.x || 0;
                start.y += offset.y || 0;
                end.x += offset.x || 0;
                end.y += offset.y || 0;
                return {
                    end: end,
                    start: start,
                    value: start.value - end.value,
                    props: props,
                    isHorizontal: plotModule.isHorizontal()
                };
            } else {
                return null;
            }
        });
        markerConfigs = markerConfigs.reduce(function(previous, current) {
            if(current !== null) {
                previous.push(current);
            }
            return previous;
        }, []);
        return markerConfigs;
    }

    function updateMarkers() {
        var config = buildMarkerConfigs.call(this, this._offset || {});
        var selectionConfig = {
            node: this._plotSelection,
            size: this._plotModule.getSize()
        };
        this._getRenderer().render(config, true, selectionConfig);
    }

    oo.extend(DifferenceMarker, UIComponent);

    var prot = DifferenceMarker.prototype;

    prot._getRenderer = function() {
        if(!this.differenceMarkerRenderer) {
            this.differenceMarkerRenderer = new DifferenceMarkerRenderer();
        }
        return this.differenceMarkerRenderer;
    };

    prot.setPlotInfo = function(plotSelections, plotModule) {
        this._plotSelection = plotSelections[0];
        this._plotModule = plotModule;
        updateMarkers.apply(this);
    };

    prot.setSize = function() {
        //No size needed
    };

    prot.scroll = function(offset) {
        this._offset = offset;
        updateMarkers.apply(this);
    };

    prot.destroy = function() {
        this._markerContextHandler.remove();
        DifferenceMarker.superclass.destroy.apply(this, arguments);
    };

    return DifferenceMarker;
});
define('sap/viz/hichert/components/plotareas/ColumnPlotArea',[
    'sap/viz/framework/common/util/oo',
    'sap/viz/hichert/components/plotareas/XYYPlotArea',
    'sap/viz/hichert/components/util/EmbeddedLegendUtil',
    "sap/viz/hichert/components/differencemarker/DifferenceMarker"
], function(
    oo,
    XYYPlotArea,
    EmbeddedLegendUtil,
    DifferenceMarker
) {
    
    var ColumnPlotArea = function(runtime, options) {
        ColumnPlotArea.superclass.constructor.call(this, runtime, options);
        this._differenceMarker = new DifferenceMarker(runtime, options);
        this.setChild("differenceMarker", this._differenceMarker, {});
    };

    oo.extend(ColumnPlotArea, XYYPlotArea);

    var plotTypeMapping = {
        "absolute" : "hichert_delta_variance",
        "percentage" : "hichert_percentage_delta_variance"
    };
    
    ColumnPlotArea.prototype._getVarianceTypeMapping = function() {
        return plotTypeMapping;
    };
    
    ColumnPlotArea.prototype._updateChildData = function(updatedData) {
        ColumnPlotArea.superclass._updateChildData.call(this, updatedData);
        var legends = this._legends;
        var varianceTitles = this._varianceTitles;
        this._displayPlots.forEach(function(displayPlot){
            var key = displayPlot.key;
            var plotData = displayPlot.plot.getData();
            var series = plotData.series;
            var overlap = this._runtime.propertyManager().get('plotArea.overlap.offsetPercentage');
            var visible = this._runtime.propertyManager().get('valueAxis.visible');
            // if only one series, outermost cannot take effect in adjustLegendPosition function
            if (series.length === 1) {
                legends.forEach(function(legend){
                    if (key === 'plot') {
                        if (!this._isHorizontal) {
                            if (legend.alias === 'embeddedLegend1' && !visible) {
                                legend.addData(series[0], 'pattern', plotData.pattern, false);
                            }
                            if (legend.alias === 'embeddedLegend2') {
                                addLegend2Data(legend, plotData);
                            }
                        } else {
                            if (legend.alias === 'embeddedLegend1') {
                                legend.addData(series[0], 'pattern', plotData.pattern, false);
                            }
                            if (legend.alias === 'embeddedLegend2' && !visible) {
                                addLegend2Data(legend, plotData);
                            }
                        }
                    }
                }, this);
            } else {
                legends.forEach(function(legend){
                    if (key === 'plot') {
                        if (!this._isHorizontal) {
                            if ((legend.alias === 'embeddedLegend1' && !visible) || 
                                (legend.alias === 'embeddedLegend2')) {
                                legend.addData(series[0], 'pattern', plotData.pattern, false);
                                legend.addData(series[1], 'pattern2', plotData.pattern2, false);
                            }
                        } else {
                            if ((legend.alias === 'embeddedLegend2' && !visible) || 
                                legend.alias === 'embeddedLegend1') {
                                legend.addData(series[0], 'pattern', plotData.pattern, false);
                                legend.addData(series[1], 'pattern2', plotData.pattern2, false);
                            }
                        }
                    }
                }, this);
            }
            varianceTitles.forEach(function(varianceTitle) {
                var _this = this;
                if (key[key.length - 1] === varianceTitle.alias[varianceTitle.alias.length - 1]) {
                    varianceTitle.addData(null, key, plotData[key], true, function(){
                        return _this._selections[key].node().querySelector('.v-zeroline-group');
                    });
                }
            }, this);
        }, this);
    };

    function updateDifferenceMaker() {
        var plotModule = this.getChild("plot").module;
        this.getChild("differenceMarker").module.setPlotInfo(this._selections["plot"], plotModule);
    }

    ColumnPlotArea.prototype._postRender = function() {
        ColumnPlotArea.superclass._postRender.apply(this, arguments);
        updateDifferenceMaker.apply(this);
    };

    ColumnPlotArea.prototype._scroll = function(offset) {
        ColumnPlotArea.superclass._scroll.apply(this, arguments);
        this.getChild("differenceMarker").module.scroll(offset);
    };
    
    //If only one series, legend2 only contain different text
    function addLegend2Data(legend, plotData) {
        var legendData = {}, series = plotData.series;
        legendData.series = series[0];
        legendData.key = 'pattern';
        legendData.bindingData = plotData.pattern;
        if (!EmbeddedLegendUtil.isHeadTailSame(legendData)) {
            legend.addData(series[0], 'pattern', plotData.pattern, false);
        }
    }
    
    return ColumnPlotArea;
});

define('sap/viz/hichert/components/plotareas/PlotAreaFactory',[
    "sap/viz/hichert/components/plotareas/LinePlotArea",
    "sap/viz/hichert/components/plotareas/VarianceLinePlotArea",
    "sap/viz/hichert/components/plotareas/StackedColumnPlotArea",
    "sap/viz/hichert/components/plotareas/ColumnPlotArea"
], function(
    LinePlotArea,
    VarianceLinePlotArea,
    StackedColumnPlotArea,
    ColumnPlotArea
) {
    
    var plotAreaMapping = {
        "hichert_stacked_column": {
            "plotClazz": StackedColumnPlotArea
        },
        "hichert_stacked_bar": {
            "plotClazz": StackedColumnPlotArea
        },
        "hichert_line": {
            "plotClazz": LinePlotArea
        },
        "hichert_variance_line": {
            "plotClazz": VarianceLinePlotArea
        },
        "hichert_bar": {
            "plotClazz": ColumnPlotArea
        },
        "hichert_column": {
            "plotClazz": ColumnPlotArea
        }
    };
    
    return {
        create: function(renderType, runtime, options) {
            
            var PlotAreaClazz = plotAreaMapping[renderType].plotClazz;
            
            options = options || {};
            
            options.renderType = renderType;
            
            return new PlotAreaClazz(runtime, options);
        }
    };
    
});
define('sap/viz/hichert/components/legend/PatternLegend',[
    'sap/viz/framework/common/util/oo',
    'sap/viz/chart/components/legend/ColorLegend',
    'sap/viz/framework/scale/ColorScale',
    'sap/viz/framework/common/log/Logger',
    "sap/viz/framework/common/util/DataUtils",
    "sap/viz/framework/common/util/TypeUtils"
], function(
    oo,
    BaseLegend,
    ColorScale ,
    Logger,
    DataUtils,
    TypeUtils
    ) {

    

    var ID_CLASS = "v-legend-element";

    var PatternLegend = function(runtime, options) {

        PatternLegend.superclass.constructor.apply(this, arguments);
        this._type = "PatternLegend";
    };

    oo.extend(PatternLegend, BaseLegend);

    function createScaleAndBinding(patternLegend, dataModel) {

        var domains, ranges,
            patt, data, colorScale,
            colorScales = [];
            
        var domainMap;
        
        var effectMgr = patternLegend.runtime().effectManager();
        var direction = patternLegend.properties('position') || 'horizontal';
        
        for (var key in dataModel) {
            if (dataModel.hasOwnProperty(key)) {
                data = dataModel[key];
    
                if (data == null || data.scale == null) {
                    continue;
                }
    
                var dataValues = data.values;
                if (data.scale._type === "pattern" && dataValues && dataValues.length) {
                    domainMap = {};
                    colorScale = {
                        metaData : null,
                        rowArray : []
                    };
                    domains = [];
                    ranges = [];
                    colorScale.metaData = data.metaData; 
                    
                    for (var index = 0; index < dataValues.length; index++) {
                        
                        var currentData = dataValues[index];
                        
                        if (TypeUtils.isArray(currentData)) {
                            
                            var tempData;
                            
                            for (var i = 0; i < currentData.length; i++) {
                                
                                if (currentData[i] != null) {
                                    tempData = currentData[i];
                                    break;
                                }
                                
                            }
                            
                            if (tempData) {
                                currentData = tempData;
                            } else {
                                Logger.error('unknown pattern value. ', currentData);
                            }
                            
                        }
                        
                        var doVal = DataUtils.getDimensionValue(currentData);
                            
                        if (doVal == null) {
                            Logger.error('unknown pattern value. ', doVal);
                            continue;
                        }
                        
                        if (!domainMap[doVal]) {
                            
                            patt = data.scale.scale(doVal);
                            
                            // filter out invalid pattern name
                            if (Object.keys(patt).length === 0) {
                                Logger.error('unknown pattern value. ', doVal);
                                continue;
                            }
                            
                            domainMap[doVal] = currentData;
                            domains.push([currentData]);
                            
                            ranges.push(effectMgr.register({
                                drawingEffect : 'normal',
                                fillColor : patt.color,
                                patternEffect: patt.pattern,
                                direction : direction
                            }));                            
                        }
                    }
                    colorScale.scale = new ColorScale(domains, ranges);
                    colorScales.push(colorScale);
                } else if (data.scale._type === "shape") {
                    patternLegend.setShapeScale(data);
                }
            }
        }
        
        patternLegend.setColorScale(colorScales);
    }

    PatternLegend.prototype.setData = function(value) {

        this._data = value;

        createScaleAndBinding(this, value);
        
        return this;
    };
    
    return PatternLegend;
});

define('sap/viz/hichert/layout/GridLayout',[
    "sap/viz/framework/common/util/oo",
    'sap/viz/framework/common/util/Constants',
    'sap/viz/framework/common/util/TypeUtils',
    'sap/viz/framework/common/util/NumberUtils',
    'sap/viz/framework/common/util/PositionUtil',
    "sap/viz/chart/layout/DockLayout"
], function(oo, Constants, TypeUtils, NumberUtils, PositionUtils, DockLayout) {

    var GridLayout = function() {
        GridLayout.superclass.constructor.apply(this, arguments);
    };

    oo.extend(GridLayout, DockLayout);
    
    
    /*
     * modules:
     * [{
     *      module: null,
     *      priority: 1,
     *      maxHeight: 1,
     *      maxWidth: 1,
     *      position: 1
     * }]
     */
    GridLayout.prototype.layout = function(components) {
        
        var positionDef = DockLayout.Position;
        
        var results = GridLayout.superclass.layout.call(this, components);
        
        var centerKey = this._getCenterModuleKey(components, positionDef);
        
        if (centerKey == null) {
            
            for (var itemKey in components) {
                if (components.hasOwnProperty(itemKey)) {
                    var current = components[itemKey].module;
                    current.setSize(results[itemKey]);
                    if (current.layout) {
                        current.layout();
                    }
                }
            }
            
            return results;
        }
        
        var centerSize = results[centerKey];
        var centerModule = components[centerKey].module;
        centerModule.setSize(centerSize);
        if (centerModule.layout){
            centerModule.layout();
        }
        
        for (var key in components) {
            if (components.hasOwnProperty(key)) {
                
                if (key === centerKey) {
                    continue;
                }
                
                var currentModule = components[key].module;
                currentModule.setSize(results[key]);
                if (currentModule.layout) {
                    currentModule.layout();
                }
            }
        }
        
        return results;
    };

    GridLayout.prototype._getCenterModuleKey = function(components, positionDef) {
        
        for (var key in components) {
            if (components.hasOwnProperty(key)) {
                
                var option = components[key].option;
                var position = option.position || option.defaultPosition;
                
                if (positionDef[position] == null) {
                    return key;
                }
            }
        }
        return null;
    };
    
    return GridLayout;
});

define('sap/viz/hichert/behavior/config/utils/HichertDataSelector',[
	"sap/viz/framework/common/util/oo",
	'sap/viz/framework/chartmodel/DataSelector'
], function(oo, DataSelector) {
	var HichertDataSelector = function(selector, dataModel) {
		HichertDataSelector.superclass.constructor.apply(this, arguments);
	};

	oo.extend(HichertDataSelector, DataSelector);

	HichertDataSelector.prototype.getDataPoints = function(dataModel) {
		var dps = this._dataPoints;
		if (!dps) {
			var model = this._model = dataModel || this._model;
			if (!model) {
				return [];
			}
			var allDps = model._dataPoints;
			if (allDps) {
				dps = this._dataPoints = [];
				if (this._selector) {
					var expr = this._expr = this._expr || this._createExpr(this._selector);
					Object.keys(allDps).forEach(function(dpId) {
						var dp = allDps[dpId];
						if (!dp.ignore && expr(dp.getContext(), dp)) {
							dps.push(dp);
						}
					});
				}
			}
		}
		return dps;
	};

	return HichertDataSelector;
});
define('sap/viz/hichert/behavior/config/utils/HichertSelectionUtil',[
	"sap/viz/chart/behavior/config/SelectionUtil",
	'sap/viz/framework/common/util/ObjectUtils',
	'sap/viz/hichert/behavior/config/utils/HichertDataSelector',
	'sap/viz/framework/chartmodel/DataSelector',
	'sap/viz/chart/components/util/DataPointUtils',
	"sap/viz/framework/common/util/TypeUtils"
], function(SelectionUtil, ObjectUtils, HichertDataSelector, DataSelector, DataPointUtils) {

	var HichertSelectionUtil = ObjectUtils.extend({}, SelectionUtil);

	HichertSelectionUtil.getDataPointIds = function(condition, service) {
		var dataPoints = this._getDataPointsByCondition(condition, service);
		var id;
		return dataPoints.map(function(dp) {
			if (dp.getDataPointId) {
				id = dp.getDataPointId();
			} else {
				id = dp.id;
			}
			return id;
		});
	};

	HichertSelectionUtil._getDataPointsByCondition = function(condition, service) {
		var dataModel;
		var selector;
		if (service.enableOnlyMainPlot) {
			var plotModule = service.getModule("main.plot");
			var dataSeries = plotModule.getSeries();
			if (dataSeries.length > 0) {
				var dataPoints = dataSeries[0].getDataPoints();
				for (var i = 1; i < dataSeries.length; i++) {
					dataPoints = dataPoints.concat(dataSeries[i].getDataPoints());
				}
				dataModel = {};
				dataModel._dataPoints = dataPoints;
			}
			selector = new HichertDataSelector(condition, dataModel);
		}
		if (!dataModel) {
			dataModel = service.getDataModel();
			selector = new DataSelector(condition, dataModel);
		}
		return selector.getDataPoints();
	};

	HichertSelectionUtil.getDataPointNodes = function(condition, service) {
		var dpIds;
		if (service.enableOnlyMainPlot) {
			dpIds = this.getDataPointIds(condition, service);
		} else {
			dpIds = SelectionUtil.getDataPointIds(condition, service);
		}
		var dataPointNodes = service.getNodes(service.NodeType.DATA_POINT, false);
		var targets = DataPointUtils.findByDataPointIds(dataPointNodes, dpIds);
		// Ensure targets is a normal array
		return [].slice.apply(targets);
	};

	return HichertSelectionUtil;
});
define('sap/viz/hichert/behavior/config/DataPointBehaviorConfigForLine',[
    'sap/viz/framework/common/util/Constants',
    "sap/viz/hichert/components/util/Constants",
    "sap/viz/framework/common/util/TypeUtils",
    "sap/viz/chart/behavior/config/HighlightHelper",
    'sap/viz/chart/components/renderers/LineRenderer',
    "sap/viz/chart/components/util/DataPointUtils",
    "sap/viz/framework/common/util/DataGraphics",
    'sap/viz/framework/common/util/SVG',
    'sap/viz/framework/common/util/DOM',
    "sap/viz/hichert/behavior/config/utils/HichertSelectionUtil",
    "sap/viz/chart/components/util/ChartTypeUtils",
    "sap/viz/framework/common/util/GeometryUtils",
    "sap/viz/framework/common/util/NumberUtils"
], function(
    Constants,
    HichertConstants,
    TypeUtils,
    HighlightHelper,
    LineRenderer,
    DataPoints,
    DataGraphics,
    SVG,
    DOM,
    SelectionUtil,
    ChartTypeUtils,
    GeometryUtils,
    NumberUtils
) {
    var lineType = [
        "info/hichert_line",
        "info/hichert_variance_line"
    ];

    var DATAPOINT_SCALED = "v-datapoint-scaled";
    var CLASS_LIGHT_LINE = "v-lightLine";
    var DATA_ATTR_FROM = "data-from";
    var DATA_ATTR_TO = "data-to";
    var dataPointPattern = "v-datapoint";
    var dataLabelPattern = "v-datalabel";
    var DEFAULT_STROKE_WIDTH = 2;

    var CSS_CLASS = Constants.CSS.CLASS;

    var DL_LAYER = "dataline";
    var DP_LAYER = "datapoint";

    function lightLine(node, before, flag, customizedColor) {
        var data = DataGraphics.getData(node);

        var anotherNodeId = data[before ? "next" : "prev"];

        if (!anotherNodeId) {
            return;
        }

        var parentNode = node.parentNode;
        var anotherNode = DataPoints.find(parentNode, anotherNodeId);

        var nodeId = DataPoints.getDataId(node);
        var ids = before ? [anotherNodeId, nodeId] : [nodeId, anotherNodeId];

        var lightLineNode = parentNode.querySelector("." + CLASS_LIGHT_LINE +
            "[" + DATA_ATTR_FROM + "='" + ids[0] + "'][" + DATA_ATTR_TO + "='" +
            ids[1] + "']");

        if (flag && anotherNode && DataPoints.isHighlighted(anotherNode)) {
            var lineNode = parentNode.querySelector(".v-lines, .v-combination-lines");
            var lineData = DataGraphics.getData(lineNode);

            var lightLineContent = LineRenderer({
                graphic: {
                    color: (customizedColor ? customizedColor : lineData.color),
                    width: lineData.width
                },
                points: [
                    data.translate,
                    DataGraphics.getData(anotherNode).translate
                ]
            });

            if (lightLineContent) {
                if (lightLineNode) {
                    DOM.empty(lightLineNode);
                } else {
                    lightLineNode = SVG.create("g");
                    lightLineNode.setAttribute("class", CLASS_LIGHT_LINE);
                    lightLineNode.setAttribute("fill-opacity", "1");
                    lightLineNode.setAttribute("stroke-opacity", "1");
                }
                lightLineNode.setAttribute(DATA_ATTR_FROM, ids[0]);
                lightLineNode.setAttribute(DATA_ATTR_TO, ids[1]);
                lightLineNode.appendChild(lightLineContent);
                parentNode.insertBefore(lightLineNode, parentNode.firstChild.nextElementSibling);
            }
        } else {
            if (lightLineNode) {
                parentNode.removeChild(lightLineNode);
            }
        }
    }

    function renderLightLine(node, flag, customizedColor) {
        lightLine(node, true, flag, customizedColor);
        lightLine(node, false, flag, customizedColor);
    }

    function setMakerOpacity(service, e) {
        var props = service.getProperties().get("plotArea");
        var markerVisible = props.line ? props.line.marker.visible : props.marker.visible;

        var plotModule = service.getModule("main.plot");
        if (plotModule && plotModule.isMarkerVisible) {
            markerVisible = plotModule.isMarkerVisible();
        }
        var child = e.firstChild;
        if (!markerVisible) {
            child.setAttribute("fill-opacity", "0");
            child.setAttribute("stroke-opacity", "0");
        }
    }

    function drawAlignmentLine(event, service, targets) {
        var plotModule = service.getModule("main");
        var linePlotModule = service.getModule("main.plot");
        var rootNode = service._rootNode.node();
        var currentTarget = event.data.currentTarget;
        var currentTargetTransform = currentTarget.getTransformToElement(rootNode);
        var currentTargetBBox = GeometryUtils.getBBox(currentTarget);
        var ctm;
        var targetBBox;
        var dpInfo = [];

        targets.forEach(function(target) {
            ctm = target.getTransformToElement(rootNode);
            targetBBox = GeometryUtils.getBBox(target);
            dpInfo.push({
                top: ctm.f + targetBBox.y,
                bottom: ctm.f + targetBBox.y + targetBBox.height,
                width: targetBBox.width,
                height: targetBBox.height
            });
        });

        var actionLayer = service._getActionLayer();
        actionLayer.clear("alignmentline");
        var alLayer = actionLayer.createLayer("alignmentline");

        var matrix = service.getOffsetMatrix(service.OffsetType.PLOT_NODE, true);
        var matrixMain = service.getOffsetMatrix(service.OffsetType.MAIN_NODE, true);
        var plotMainBBox = plotModule.getSize();
        var linePlotBBox = linePlotModule.getSize();

        var maskMgr = alLayer.getMaskManager();
        var mask = {
            x: matrix.e,
            y: matrixMain.f,
            width: linePlotBBox.width,
            height: plotMainBBox.height
        };

        maskMgr.addRect(mask);

        var x1, x2, y1, y2, i;
        dpInfo.sort(function(a, b) {
            return b.top - a.top;
        });

        for (i = 0; i < dpInfo.length; i++) {
            if (i === 1 && dpInfo[i].bottom >= dpInfo[i - 1].top) {
                continue;
            }
            y1 = dpInfo[i].bottom;
            y2 = i === 0 ? currentTargetTransform.f + currentTargetBBox.y : dpInfo[i - 1].top;
            x1 = x2 = currentTargetTransform.e + currentTargetBBox.width / 2 + currentTargetBBox.x;
            alLayer.addPolyLine({
                points: [
                    [x1, y1],
                    [x2, y2]
                ],
                width: HichertConstants.CSS.ALIGNMENTLINE_WIDTH,
                color: HichertConstants.CSS.ALIGNMENTLINE_COLOR,
                strokeDashArray: HichertConstants.CSS.ALIGNMENTLINE_DASHARRAY
            });
        }
        actionLayer.drawLayer(alLayer);
    }

    function clearCurrentSelections(service) {
        var targets = service.getStatus("hoveringDataPoints");
        if (targets) {
            service.fireEvent("unhoverOnDataPoint", {
                targets: targets
            }).setStatus("hoveringDataPoints", null);
        }
        var actionLayer = service._getActionLayer();
        actionLayer.clear("alignmentline");
    }

    function drawStroke(service, e, prop, defaultWidth) {
        if (prop.stroke && prop.stroke.width) {
            var width = prop.stroke.width;
            if (!TypeUtils.isNumber(width) && +width.match(/[0-9]+/) > 4) {
                prop.stroke.width = 4;
            }
        }
        HighlightHelper.drawStroke(service, e, 'path', prop.stroke, defaultWidth);
        HighlightHelper.drawStroke(service, e, 'rect', prop.stroke, defaultWidth);
        HighlightHelper.drawStroke(service, e, 'circle', prop.stroke, defaultWidth);
    }

    function setOpacity(e, opacity) {
        if (TypeUtils.isNumber(opacity)) {
            e.setAttribute("fill-opacity", opacity);
            e.setAttribute("stroke-opacity", opacity);
        } else {
            e.removeAttribute("fill-opacity");
            e.removeAttribute("stroke-opacity");
        }
    }

    function getOriginalStroke(plotModule, e) {
        return plotModule.mappingDataPointInfo(DataPoints.getDataId(e));
    }

    return [{
        "id": "selectDataPoint_hichertLine",
        "triggerEvent": {
            "name": "selectDataPoint",
            "supportedChartTypes": lineType
        },
        "handler": function(event, service) {
            var elements = HighlightHelper.turnToArray(event.data.targets);
            var plotModule = service.getModule("main.plot");
            service.fireEvent(event, true);
            var prop = service.getProperties().get('interaction.selected');
            var originStroke = {};
            elements.forEach(function(e) {
                originStroke = getOriginalStroke(plotModule, e).strokeWidth;
                DataPoints.highlight(e);
                renderLightLine(e, true);
                drawStroke(service, e, prop, originStroke);
                setOpacity(e, 1);
            });
        }
    }, {
        "id": "deselectDataPoint_hichertLine",
        "triggerEvent": {
            "name": "deselectDataPoint",
            "supportedChartTypes": lineType
        },
        "handler": function(event, service) {

            var plotModule = service.getModule("main.plot");
            var originStroke = {};
            service.fireEvent(event, true);
            var elements = HighlightHelper.turnToArray(event.data.targets);
            var prop;
            elements.forEach(function(e) {
                originStroke = getOriginalStroke(plotModule, e);
                DataPoints.unhighlight(e);
                renderLightLine(e, false);
                var properties = service.getProperties();
                prop = {
                    stroke:{
                        visible: true,
                        color: originStroke.stroke
                    }
                };
                if(event.data.isAnyOtherSelected) {
                    setOpacity(e, service.getProperties().get('interaction.deselected.opacity'));
                }else{
                    setOpacity(e, null);
                }
                drawStroke(service, e, prop, originStroke.strokeWidth);
                setMakerOpacity(service, e);
            });
        }
    }, {
        "id": "hoverOnDataPoint_hichertLine",
        "triggerEvent": {
            "name": "hoverOnDataPoint",
            "supportedChartTypes": lineType
        },
        "handler": function(event, service) {
            service.fireEvent(event, true);
            var elements = HighlightHelper.turnToArray(event.data.targets);
            var prop = service.getProperties().get('interaction.hover');
            var plotModule = service.getModule("main.plot");
            var originStroke = {};
            elements.forEach(function(e) {
                originStroke = getOriginalStroke(plotModule, e).strokeWidth;
                drawStroke(service, e, prop, originStroke);
                setOpacity(e, prop.opacity);
            });
        }
    }, {
        "id": "unhoverOnDataPoint_hichertLine",
        "triggerEvent": {
            "name": "unhoverOnDataPoint",
            "supportedChartTypes": lineType
        },
        "handler": function(event, service) {
            service.fireEvent(event, true);
            var plotModule = service.getModule("main.plot");
            var elements = HighlightHelper.turnToArray(event.data.targets);
            var properties = service.getProperties();
            var prop;
            var originStroke = {};
            elements.forEach(function(e) {
                var visible;
                originStroke = getOriginalStroke(plotModule, e);
                if (d3.select(e).classed(Constants.CSS.CLASS.DATAPOINTSELECTED)) {
                    prop = properties.get('interaction.selected');
                    visible = true;
                } else {
                    prop = {
                        stroke:{
                            visible: true,
                            color: originStroke.stroke
                        }
                    };                     
                    var selectedDataPoints = service.getStatus("selectedDataPoints");
                    if(selectedDataPoints.length){
                        setOpacity(e, service.getProperties().get('interaction.deselected.opacity'));
                    }else{
                        setOpacity(e, null);
                    }
                    visible = false;
                }
                drawStroke(service, e, prop, originStroke.strokeWidth);
                if (!visible) {
                    setMakerOpacity(service, e);
                }
            });
        }
    }, {
        "id": "clearPlot_hichertLine",
        "triggerEvent": {
            "name": "clearPlot",
            "supportedChartTypes": lineType
        },
        "handler": function(event, service) {
            service.fireEvent(event, true);
            var gray = event.data.isGray;
            var properties = service.getProperties();
            var plotModule = service.getModule("main.plot");
            var lineNodes = service.getNodes(service.NodeType.LINE, false);
            var originStroke = {};
            lineNodes.forEach(function(e) {
                var colors = HighlightHelper.getColors(service, e);
                if (gray && colors.customizedColor) {
                    e.setAttribute('stroke', colors.customizedColor);
                } else {
                    e.setAttribute('stroke', colors.defaultColor);
                }
            });

            var mainNode = service.getNodes(service.NodeType.DATA_POINT, false);
            if (!mainNode || !mainNode.length) {
                return;
            }
            mainNode.forEach(function(e) {
                originStroke = getOriginalStroke(plotModule, e);
                var prop = {
                    stroke: {
                        visible: true,
                        color: originStroke.stroke
                    }
                };
                if(gray) {
                    setOpacity(e, service.getProperties().get('interaction.deselected.opacity'));
                } else{
                    setOpacity(e, null);
                }
                drawStroke(service, e, prop, originStroke.strokeWidth);
                setMakerOpacity(service, e);
            });
        }
    }, {
        "id": "showTooltipHoverOnPlot",
        "triggerEvent": {
            "name": "showTooltipHoverOnPlot"
        },
        "handler": function(event, service) {
            service.fireEvent("showDetail", event.data);
        }
    }, {
        "id": "hideTooltipHoverOnPlot",
        "triggerEvent": {
            "name": "hideTooltipHoverOnPlot"
        },
        "handler": function(event, service) {
            service.fireEvent("hideDetail", event.data);
        }
    }, {
        "id": "hoverOnCategorySeries",
        "triggerEvent": {
            "name": "hoverOnCategorySeries",
            "supportedChartTypes": lineType
        },
        "handler": function(event, service) {
            var ctx = event.data.ctx;
            var targets = SelectionUtil.getDataPointNodes(ctx, service);
            clearCurrentSelections(service);
            service.fireEvent("hoverOnDataPoint", {
                targets: targets
            }).setStatus("hoveringDataPoints", targets);
            if (!event.data.flag) {
                drawAlignmentLine(event, service, targets);
            }
        }
    }, {
        "id": "clearHoverOnCategorySeries",
        "triggerEvent": {
            "name": "clearHoverOnCategorySeries",
            "supportedChartTypes": lineType
        },
        "handler": function(event, service) {
            clearCurrentSelections(service);
        }
    }, {
        "id": "hoverOnEmbeddedLegend",
        "triggerEvent": {
            "name": "hoverOnEmbeddedLegend",
            "supportedChartTypes": lineType
        },
        "handler": function(event, service) {
            var ctx = event.data.ctx;
            service.enableOnlyMainPlot = true;
            var targets = SelectionUtil.getDataPointNodes(ctx, service);
            service.enableOnlyMainPlot = false;
            clearCurrentSelections(service);
            service.fireEvent("hoverOnDataPoint", {
                targets: targets
            }).setStatus("hoveringDataPoints", targets);
        }
    }, {
        "id": "cleanHoverOnEmbeddedLegend",
        "triggerEvent": {
            "name": "cleanHoverOnEmbeddedLegend",
            "supportedChartTypes": lineType
        },
        "handler": function(event, service) {
            clearCurrentSelections(service);
        }
    }];
});
define('sap/viz/hichert/behavior/config/handler/BarDataPointHandler',[
    "sap/viz/framework/common/util/Constants",
    "sap/viz/hichert/components/util/Constants",
    "sap/viz/chart/components/util/DataPointUtils",
    "sap/viz/framework/common/util/DataGraphics",
    "sap/viz/framework/common/util/SVG",
    "sap/viz/chart/behavior/config/HighlightHelper",
    "sap/viz/framework/common/util/TypeUtils",
    "sap/viz/hichert/behavior/config/utils/HichertSelectionUtil",
    "sap/viz/framework/common/util/GeometryUtils",
    "sap/viz/chart/components/util/TextUtils",
    'sap/viz/framework/common/format/UnitFormat',
    'sap/viz/hichert/components/datalabels/DataLabelUtils',
    "sap/viz/hichert/components/differenceMarker/renderer/DifferenceMarkerRenderer",
    "sap/viz/framework/common/util/ObjectUtils",
    'sap/viz/framework/interaction/Constants'
], function(
    Constants,
    HichertConstants,
    DataPointUtils,
    DataGraphics,
    SVG,
    HighlightHelper,
    TypeUtils,
    SelectionUtil,
    GeometryUtils,
    TextUtils,
    UnitFormat,
    DataLabelUtils,
    DifferenceMarkerRenderer,
    ObjectUtils,
    SDKConstants
) {

    var DP_HICHERT_BAR = "dp_hichert_bar";
    var MEASURE_NAMES = "measureNames";
    var SELECTION_MODE = SDKConstants.SELECTION_MODE;

    function BarDataPointHandler() {}

    function getDpInfo(plotModule, e) {
        var dpInfo = plotModule.mappingDataPointInfo(DataPointUtils.getDataId(e));
        if (TypeUtils.isEmptyObject(dpInfo)) {
            dpInfo = {
                visible: true,
                stroke: "#ffffff",
                strokeWidth: "1"
            };
        }
        return dpInfo;
    }

    function drawStroke(service, e, prop, defaultWidth) {
        if (prop.stroke && prop.stroke.width) {
            var width = prop.stroke.width;
            if (!TypeUtils.isNumber(width) && +width.match(/[0-9]+/) > 4) {
                prop.stroke.width = 4;
            }
        }
        HighlightHelper.drawStroke(service, e, 'rect', prop.stroke, defaultWidth);
    }

    function setOpacity(e, opacity) {
        if (TypeUtils.isNumber(opacity)) {
            e.setAttribute("fill-opacity", opacity);
            e.setAttribute("stroke-opacity", opacity);
        } else {
            e.removeAttribute("fill-opacity");
            e.removeAttribute("stroke-opacity");
        }
    }

    function getContext(element) {
        return DataGraphics.getData(element);
    }

    function clearCurrentSelections(service) {
        var targets = service.getStatus("hoveringDataPoints");
        if (targets) {
            service.fireEvent("unhoverOnDataPoint", {
                targets: targets
            }).setStatus("hoveringDataPoints", null);
        }
        var actionLayer = service._getActionLayer();
        actionLayer.clear("alignmentline");
    }

    function getDataLabelConfig(element, dpInfo, plotModule, offset, plotMainBBox) {
        var dpData = DataGraphics.getContext(element);
        var measureNames = dpData[MEASURE_NAMES];
        var dataLabelText = dpData[measureNames];
        var config = {};
        var rectConfig = {};
        var dataLabelConfig = {};
        var props = dpInfo.dataLabelProp;
        if (props.visible === false || dataLabelText == null) {
            return config;
        }
        var HORIZONTAL_PADDING = 2;
        var VERTICAL_PADDING = 2;

        var formatPattern = props.formatString;
        dataLabelText = UnitFormat.format(dataLabelText, formatPattern,
            props.unitFormatType);

        var fontSize = props.style.fontSize;
        var fontWeight = props.style.fontWeight;
        var fontFamily = props.style.fontFamily;
        var size = TextUtils.fastMeasure(dataLabelText, fontSize, fontWeight, fontFamily);
        var positionX = dpInfo.x + offset.x;
        var positionY = dpInfo.y + offset.y;
        var textAnchor;
        var rectPositionX;
        var rectPositionY;
        if (plotModule.isHorizontal()) {
            positionY += dpInfo.height / 2 - (size.height / 2 + size.y);
            if (dataLabelText > 0) {
                positionX += dpInfo.width;
                if (positionX + size.width + HORIZONTAL_PADDING >
                    plotMainBBox.width + offset.x) {
                    positionX = positionX - size.width - HORIZONTAL_PADDING - 2;
                    if (size.width > dpInfo.width) {
                        dataLabelText = null;
                    }
                } else {
                    positionX += HORIZONTAL_PADDING;
                }
            } else {
                if (positionX - size.width - HORIZONTAL_PADDING > offset.x) {
                    positionX = positionX - size.width - HORIZONTAL_PADDING;
                } else {
                    if (size.width > dpInfo.width) {
                        dataLabelText = null;
                    }
                }
            }
            rectPositionX = positionX + HORIZONTAL_PADDING / 2;
            rectPositionY = positionY + size.y;
        } else {
            textAnchor = "middle";
            positionX += dpInfo.width / 2;
            if (dataLabelText > 0) {
                if (positionY - size.height < offset.y) {
                    positionY = positionY - size.y + VERTICAL_PADDING;
                    if (size.height > dpInfo.height) {
                        dataLabelText = null;
                    }
                } else {
                    positionY = positionY - size.height - size.y;
                }
            } else {
                positionY += dpInfo.height;
                if (positionY + size.height <
                    offset.y + plotMainBBox.height) {
                    positionY = positionY - size.y;
                } else {
                    if (size.height > dpInfo.height) {
                        dataLabelText = null;
                    }
                    positionY = positionY + size.y + size.height / 2 - VERTICAL_PADDING;
                }
            }
            rectPositionX = positionX - size.width / 2;
            rectPositionY = positionY + size.y - VERTICAL_PADDING / 2;
        }

        if (dataLabelText) {
            dataLabelConfig = {
                text: dataLabelText,
                fontFamily: fontFamily,
                fontSize: fontSize,
                fontWeight: fontWeight,
                fontStyle: props.style.fontStyle,
                fontColor: props.style.color,
                x: positionX,
                y: positionY,
                textAnchor: textAnchor
            };

            if (props.background) {
                rectConfig = {
                    x: rectPositionX,
                    y: rectPositionY,
                    width: size.width + 2,
                    height: size.height,
                    fill: props.background.color || "#ffffff",
                    opacity: props.background.opacity
                };
            }
        }

        config = {
            labelConfig: dataLabelConfig,
            labelRectConfig: rectConfig
        };
        return config;

    }

    function drawAlignmentLine(event, service, targets) {
        var plotModule = service.getModule("main");
        var coloumnPlotModule = service.getModule("main.plot");
        var rootNode = service._rootNode.node();
        var isHorizontal = service.isHorizontal();
        var currentTarget = event.data.currentTarget;
        var currentTargetTransform = currentTarget.getTransformToElement(rootNode);
        var currentTargetBBox = GeometryUtils.getBBox(currentTarget);
        var dpInfo = [];
        var ctm;
        var targetBBox;
        if (isHorizontal) {
            targets.forEach(function(target) {
                ctm = target.getTransformToElement(rootNode);
                targetBBox = GeometryUtils.getBBox(target);
                dpInfo.push({
                    left: ctm.e + targetBBox.x,
                    right: ctm.e + targetBBox.x + targetBBox.width,
                    width: targetBBox.width,
                    height: targetBBox.height
                });
            });
        } else {
            targets.forEach(function(target) {
                ctm = target.getTransformToElement(rootNode);
                targetBBox = GeometryUtils.getBBox(target);
                dpInfo.push({
                    top: ctm.f + targetBBox.y,
                    bottom: ctm.f + targetBBox.y + targetBBox.height,
                    width: targetBBox.width,
                    height: targetBBox.height
                });
            });
        }

        var plotMainBBox = plotModule.getSize();
        var coloumnPlotBBox = coloumnPlotModule.getSize();
        var actionLayer = service._getActionLayer();
        actionLayer.clear("alignmentline");
        var alLayer = actionLayer.createLayer("alignmentline");
        var matrix = service.getOffsetMatrix(service.OffsetType.PLOT_NODE, true);
        var matrixMain = service.getOffsetMatrix(service.OffsetType.MAIN_NODE, true);
        var maskMgr = alLayer.getMaskManager();
        var mask = {};
        if (isHorizontal) {
            mask.x = matrixMain.e;
            mask.y = matrix.f;
            mask.width = plotMainBBox.width;
            mask.height = coloumnPlotBBox.height;
        } else {
            mask.x = matrix.e;
            mask.y = matrixMain.f;
            mask.width = coloumnPlotBBox.width;
            mask.height = plotMainBBox.height;
        }
        maskMgr.addRect(mask);

        var x1, x2, y1, y2, i;
        if (isHorizontal) {
            dpInfo.sort(function(a, b) {
                return a.right - b.right;
            });
        } else {
            dpInfo.sort(function(a, b) {
                return b.top - a.top;
            });
        }

        for (i = 1; i < dpInfo.length; i++) {
            if (isHorizontal) {
                if (i === 1) {
                    x1 = dpInfo[i - 1].left;
                    x2 = currentTargetTransform.e + currentTargetBBox.x + currentTargetBBox.width;
                } else {
                    x1 = dpInfo[i].left;
                    x2 = dpInfo[i - 1].right;
                }
                y1 = y2 = currentTargetTransform.f + currentTargetBBox.height / 2 + currentTargetBBox.y;
            } else {
                if (i === 1) {
                    y1 = dpInfo[i - 1].bottom;
                    y2 = currentTargetTransform.f + currentTargetBBox.y;
                } else {
                    y1 = dpInfo[i].bottom;
                    y2 = dpInfo[i - 1].top;
                }
                x1 = x2 = currentTargetTransform.e + currentTargetBBox.width / 2 + currentTargetBBox.x;
            }
            alLayer.addPolyLine({
                points: [
                    [x1, y1],
                    [x2, y2]
                ],
                width: HichertConstants.CSS.ALIGNMENTLINE_WIDTH,
                color: HichertConstants.CSS.ALIGNMENTLINE_COLOR,
                strokeDashArray: HichertConstants.CSS.ALIGNMENTLINE_DASHARRAY
            });
        }
        actionLayer.drawLayer(alLayer);
    }

    function drawLine(event, service) {
        var enable = service.getProperties().get('plotArea.differenceMarker.enable');
        var lastSelected = service.getStatus("selectedDataPoints");
        if (enable && lastSelected.length === 1) {
            var props = service.getProperties().get("plotArea.dataLabel");
            var barPlotNode = service.getNodes(service.NodeType.PLOT_NODE).node();
            var lastSelectedNode = DataPointUtils.findByDataPointId(barPlotNode, lastSelected);
            var currentNode = event.data.targets;
            var currentDpId = DataPointUtils.getDataPointId(currentNode);
            var currentNodeById = DataPointUtils.findByDataPointId(barPlotNode, currentDpId);
            var horizontal = service.isHorizontal();

            //draw line on different data points in main plot
            if (lastSelectedNode && currentNodeById && lastSelected[0] !== currentDpId) {
                var plotModule = service.getModule("main.plot");
                var lastSelectedInfo = plotModule.mappingDataPointInfo(DataPointUtils.getDataId(lastSelectedNode));
                var currentSelectedInfo = plotModule.mappingDataPointInfo(DataPointUtils.getDataId(currentNode));
                var value = lastSelectedInfo.value - currentSelectedInfo.value;
                var actionLayer = service._getActionLayer();
                var matrix = service.getOffsetMatrix(service.OffsetType.PLOT_NODE, true);
                var scrollOffset = plotModule.getOffset();
                var plotMainBBox = plotModule.getSize();
                var offset = {
                    x: matrix.e,
                    y: matrix.f
                };
                if (!this.differenceMarkerRenderer) {
                    this.differenceMarkerRenderer = new DifferenceMarkerRenderer();
                }
                this.differenceMarkerRenderer.render([{
                    "end": currentSelectedInfo,
                    "start": lastSelectedInfo,
                    "value": value,
                    "offset": offset,
                    "actionLayer": actionLayer,
                    "props": props,
                    "plotMainBBox": plotMainBBox,
                    "isHorizontal": horizontal,
                    "scrollOffset": scrollOffset
                }]);
            }
        }
    }

    function hasDuplicate(markerContexts, markerContext) {
        for (var i = 0, len = markerContexts.length; i < len; i++) {
            if (ObjectUtils.deepEqual(markerContexts[i], markerContext)) {
                return true;
            }
        }
        return false;
    }

    function pinDiffMarker(event, service) {
        var targets = event.data.targets,
            plotModule = service.getModule("main.plot"),
            startDataPointId = service.getStatus("selectedDataPoints")[0];
        // we only handle the first two data points
        if (targets.length == 2) {
            var target0 = getDpInfo(plotModule, targets[0]).dimensionalContext,
                target1 = getDpInfo(plotModule, targets[1]).dimensionalContext,
                currentMarkers = ObjectUtils.clone(service._getStatusManager()
                    .get("plot.differenceMarker.markerContexts")),
                markerContext,
                start,
                end;
            if (DataPointUtils.getDataPointId(targets[0]) === startDataPointId) {
                start = target0;
                end = target1;
            } else {
                start = target1;
                end = target0;
            }
            markerContext = {
                start: start,
                end: end
            };
            if (!hasDuplicate(currentMarkers, markerContext)) {
                currentMarkers.push({
                    start: start,
                    end: end
                });
                service._statusMgr.set("plot.differenceMarker.markerContexts", currentMarkers);
            }
        }
    }

    BarDataPointHandler.prototype = {
        differenceMarkerRenderer: null,
        hoverOnDataPoint: function(event, service) {
            service.fireEvent(event, true);
            var elements = HighlightHelper.turnToArray(event.data.targets);
            var prop = service.getProperties().get('interaction.hover');
            var plotModule = service.getModule("main.plot");
            var originStroke = {};
            elements.forEach(function(e) {
                originStroke = getDpInfo(plotModule, e).strokeWidth;
                drawStroke(service, e, prop, originStroke);
                setOpacity(e, prop.opacity);
            });
            var selectionMode = service.getProperties().get('interaction.selectability.mode');
            if ((selectionMode === SELECTION_MODE.MULTIPLE ||
                selectionMode === SELECTION_MODE.INCLUSIVE) &&
                !TypeUtils.isArray(event.data.targets)) {
                drawLine.call(this, event, service);
            }
        },
        unhoverOnDataPoint: function(event, service) {
            service.fireEvent(event, true);
            var actionLayer = service._getActionLayer();
            if (this.differenceMarkerRenderer && service.getStatus('selectedDataPoints').length !== 2) {
                this.differenceMarkerRenderer.clear(actionLayer);
            }
            var plotModule = service.getModule("main.plot");
            var elements = HighlightHelper.turnToArray(event.data.targets);
            var prop;
            elements.forEach(function(e) {
                var plotModule = service.getModule("main.plot");
                var originStroke = getDpInfo(plotModule, e);
                if (d3.select(e).classed(Constants.CSS.CLASS.DATAPOINTSELECTED)) {
                    prop = service.getProperties().get('interaction.selected');
                } else {
                    prop = {
                        stroke: {
                            visible: true,
                            color: originStroke.stroke
                        }
                    };
                    var selectedDataPoints = service.getStatus("selectedDataPoints");
                    if (selectedDataPoints.length) {
                        setOpacity(e, service.getProperties().get('interaction.deselected.opacity'));
                    } else {
                        setOpacity(e, null);
                    }
                }
                drawStroke(service, e, prop, originStroke.strokeWidth);
            });
            actionLayer.clear(DP_HICHERT_BAR);
        },
        selectDataPoint: function(event, service) {
            service.fireEvent(event, true);
            var plotModule = service.getModule("main.plot");
            var prop = service.getProperties().get('interaction.selected');
            var elements = HighlightHelper.turnToArray(event.data.targets);
            var originStroke = {};
            elements.forEach(function(e) {
                originStroke = getDpInfo(plotModule, e).strokeWidth;
                drawStroke(service, e, prop, originStroke);
                setOpacity(e, 1);
            });
            var actionLayer = service._getActionLayer();
            if (actionLayer && actionLayer._groupDict) {
                var diffMarker = actionLayer._groupDict.differenceMarker;
                if (diffMarker) {
                    this.differenceMarkerRenderer.clear(actionLayer);
                    pinDiffMarker(event, service);
                    setTimeout(function() {
                        service.fireEvent("deselectDataPoint", {
                            targets: event.data.targets,
                            isAnyOtherSelected: false
                        }).setStatus("selectedDataPoints", []);
                        service.fireEvent("clearPlot", {
                            isGray: false
                        });
                    }, 0);
                }
            }
        },
        deselectDataPoint: function(event, service) {
            var actionLayer = service._getActionLayer();
            actionLayer.clear(DP_HICHERT_BAR);
            service.fireEvent(event, true);
            var plotModule = service.getModule("main.plot");
            var elements = HighlightHelper.turnToArray(event.data.targets);
            var prop;
            var originStroke = {};
            elements.forEach(function(e) {
                originStroke = getDpInfo(plotModule, e);
                prop = {
                    stroke: {
                        visible: true,
                        color: originStroke.stroke
                    }
                };
                if (event.data.isAnyOtherSelected) {
                    setOpacity(e, service.getProperties().get('interaction.deselected.opacity'));
                } else {
                    setOpacity(e, null);
                }
                drawStroke(service, e, prop, originStroke.strokeWidth);
            });
        },
        processOverlap: function(element, service, prop, originStroke) {
            if (element.length > 1) {
                return;
            }
            var context = getContext(element);
            if (context && context.isFront === false) {
                var actionLayer = service._getActionLayer();
                actionLayer.clear(DP_HICHERT_BAR);

                var plotModule = service.getModule("main.plot");
                if (!plotModule) {
                    return;
                }

                var matrix = service.getOffsetMatrix(service.OffsetType.PLOT_NODE, true);
                var offset = plotModule.getOffset();
                offset.x += matrix.e;
                offset.y += matrix.f;

                var plotMainBBox = plotModule.getSize();

                var dpLayer = actionLayer.createLayer(DP_HICHERT_BAR);
                var maskMgr = dpLayer.getMaskManager();
                var mask = {
                    x: matrix.e,
                    y: matrix.f,
                    width: plotMainBBox.width,
                    height: plotMainBBox.height
                };
                maskMgr.addRect(mask);

                //draw datapoint with stroke
                var dpInfo = getDpInfo(plotModule, element);
                var width = prop.stroke.width;
                if (prop.stroke.visible === false) {
                    width = undefined;
                    prop.stroke.color = undefined;
                } else {
                    if (!TypeUtils.isNumber(prop.stroke.width)) {
                        if (+width.match(/[0-9]+/) > 4) {
                            width = dpInfo.strokeWidth;
                        }
                    }
                }
                dpLayer.addRect({
                    x: offset.x + dpInfo.x,
                    y: offset.y + dpInfo.y,
                    width: dpInfo.width,
                    height: dpInfo.height,
                    fill: dpInfo.fill,
                    pointerEvent: "none",
                    stroke: prop.stroke.color,
                    strokeWidth: width,
                    opacity: prop.opacity
                });

                //draw datalabel
                var dataLabelConfig = getDataLabelConfig(element, dpInfo, plotModule, offset, plotMainBBox);
                if (dataLabelConfig && dataLabelConfig.labelConfig) {
                    if (dataLabelConfig.labelRectConfig) {
                        dpLayer.addRect(dataLabelConfig.labelRectConfig);
                    }
                    dpLayer.addText(dataLabelConfig.labelConfig);
                }
                actionLayer.drawLayer(dpLayer);
            }

        },
        hoverOnCategorySeries: function(event, service) {
            var ctx = event.data.ctx;
            var targets = SelectionUtil.getDataPointNodes(ctx, service);
            clearCurrentSelections(service);
            service.fireEvent("hoverOnDataPoint", {
                targets: targets
            }).setStatus("hoveringDataPoints", targets);
            // one category unit contains > 2 data points.
            if (!event.data.flag && targets && targets.length > 2) {
                drawAlignmentLine(event, service, targets);
            }
        },
        clearHoverOnCategorySeries: function(event, service) {
            clearCurrentSelections(service);
        },
        hoverOnEmbeddedLegend: function(event, service) {
            var ctx = event.data.ctx;
            service.enableOnlyMainPlot = true;
            var targets = SelectionUtil.getDataPointNodes(ctx, service);
            service.enableOnlyMainPlot = false;
            clearCurrentSelections(service);
            service.fireEvent("hoverOnDataPoint", {
                targets: targets
            }).setStatus("hoveringDataPoints", targets);
        },
        cleanHoverOnEmbeddedLegend: function(event, service) {
            clearCurrentSelections(service);
        },
        clearPlot: function(event, service) {
            service.fireEvent(event, true);
            var mainNode = service.getNodes(service.NodeType.DATA_POINT, false);
            if (mainNode == null || mainNode.length === 0) {
                return;
            }
            var plotModule = service.getModule("main.plot");
            var prop;
            var gray = event.data.isGray;
            var originStroke = {};
            mainNode.forEach(function(e) {
                originStroke = getDpInfo(plotModule, e);
                var prop = {
                    stroke: {
                        visible: true,
                        color: originStroke.stroke
                    }
                };
                if (gray) {
                    setOpacity(e, service.getProperties().get('interaction.deselected.opacity'));
                } else {
                    setOpacity(e, null);
                }
                drawStroke(service, e, prop, originStroke.strokeWidth);
            });
        }
    };
    return BarDataPointHandler;
});
define('sap/viz/hichert/behavior/config/DataPointBehaviorConfigForBar',[
    "sap/viz/hichert/behavior/config/handler/BarDataPointHandler"
], function(
    BarDataPointHandler
) {
    var supportedChartTypes = ["info/hichert_bar", "info/hichert_column",
        "info/hichert_stacked_column", "info/hichert_stacked_bar"];
    return [{
        "id": "hichertBarDataPointDefinition",
        "handler": BarDataPointHandler,
        "handlerType": "class",
        "supportedChartTypes": supportedChartTypes,
        "triggerEvent": [{
            "name": "hoverOnDataPoint",
            "method": "hoverOnDataPoint"
        }, {
            "name": "unhoverOnDataPoint",
            "method": "unhoverOnDataPoint"
        }, {
            "name": "selectDataPoint",
            "method": "selectDataPoint"
        }, {
            "name": "deselectDataPoint",
            "method": "deselectDataPoint"
        }, {
            "name": "hoverOnCategorySeries",
            "method": "hoverOnCategorySeries"
        }, {
            "name": "clearHoverOnCategorySeries",
            "method": "clearHoverOnCategorySeries"
        }, {
            "name": "hoverOnEmbeddedLegend",
            "method": "hoverOnEmbeddedLegend"
        }, {
            "name": "cleanHoverOnEmbeddedLegend",
            "method": "cleanHoverOnEmbeddedLegend"
        },{
            "name": "clearPlot",
            "method": "clearPlot"
        }]
    }];
    
});
define('sap/viz/hichert/behavior/config/AxisBehaviorConfig',[
    "sap/viz/framework/common/util/DOM",
    "sap/viz/chart/components/util/DataPointUtils",
    "sap/viz/framework/common/util/ObjectUtils",
    "sap/viz/framework/common/util/TypeUtils",
    "sap/viz/framework/common/util/Constants",
    "sap/viz/framework/interaction/Constants"
], function(
    DOM,
    DataPointUtils,
    ObjectUtils,
    TypeUtils,
    Constants,
    InteractionConstants) {
    var axisItemPattern = "v-axis-item";
    var CSS_CLASS = Constants.CSS.CLASS;
    var charts = ["info/hichert_bar", "info/hichert_column", "hichert_stacked_column",
        "hichert_stacked_bar", "info/hichert_variance_line", "info/hichert_line"];

    function isTriggerable(service) {
        var selectability = service.getProperties().get("interaction.selectability");
        var selectionMode = selectability.mode ? selectability.mode.toUpperCase() : selectability.mode;
        var axisNode = service.getNodes(service.NodeType.AXIS_ITEM);
        if (!selectability.axisLabelSelection || selectionMode === InteractionConstants.SELECTION_MODE.NONE ||
            selectionMode === InteractionConstants.SELECTION_MODE.SINGLE || !axisNode.node()) {
            return false;
        } else {
            return true;
        }
    }

    function getAxisRoot(axisItem){
        var axisRoot = axisItem; // find axis container
        while (axisRoot && axisRoot.getAttribute) {
            if (DOM.hasClass(axisRoot, CSS_CLASS.AXIS.CONTAINER)) {
                break;
            }
            axisRoot = axisRoot.parentNode;
        }
        
        return axisRoot;
    }
    
    function getAxisName(event){
        var axisItem = event.data.currentTarget;
        var axisRoot = getAxisRoot(axisItem);
        var rootCtx = DataPointUtils.getContext(axisRoot);
        if(rootCtx && rootCtx.name){
            return rootCtx.name;
        } else{
            return "categoryAxis";
        }
    }

    function getLabelEventContext(event, service) {
        var axisItem = event.data.currentTarget;
        var axisRoot = getAxisRoot(axisItem); // find axis container

        var ctx1 = ObjectUtils.extendByRepalceArray({}, DataPointUtils.getContext(axisItem).ctx);
        if (axisRoot) {
            //special handling for trellis chart: attach axis container's context if available
            var rootCtx = DataPointUtils.getContext(axisRoot);
            if (rootCtx) {
                if (ctx1 && ctx1.or && TypeUtils.isArray(ctx1.or)) {
                    ctx1.or.forEach(function(c) {
                        ObjectUtils.extendByRepalceArray(c, rootCtx.ctx);
                    });
                } else {
                    ObjectUtils.extendByRepalceArray(ctx1, rootCtx.ctx);
                }
            }
        }
        return ctx1;
    }

    function getLeafLabelInfos(config) {
        var children = config.children;
        if(!children || !children.length) {
            return [{
                x: config.x,
                y: config.y,
                height: config.cellHeight,
                width: config.cellWidth
            }];
        } else {
            var ret = [];
            config.children.forEach(function(child) {
                ret = ret.concat(getLeafLabelInfos(child));
            });
            return ret;
        }
    }
    
    return [{
        "id": "hover_on_axis_label",
        "supportedChartTypes": charts,
        "triggerEvent": {
            "name": "hover",
            "targets": axisItemPattern
        },
        "handler": function(event, service) {
            if (!isTriggerable(service)) {
                return;
            }
            service.fireEvent("cleanAxisHoverEffect");
            service.fireEvent("cleanHoverOnEmbeddedLegend")
                .setStatus("hoverintEmbeddedLegendItem", null);

            var axisName = getAxisName(event);
            var color = service.getProperties().get(axisName + ".hoverShadow.color");
            if (color) {
                d3.select(event.data.currentTarget).select("rect")
                    .attr("fill", color)
                    .classed(CSS_CLASS.HOVER_SHADOW, true);
            }
            var data = event.data.currentTarget.__data__;
            service.fireEvent("hoverOnCategorySeries", {
                ctx: getLabelEventContext(event, service),
                cellInfos: getLeafLabelInfos(data),
                flag : data.children ? data.children.length : 0,
                currentTarget : event.data.currentTarget
            });
        }
    }, {
        "id": "hover_on_non_axis_label",
        "supportedChartTypes": charts,
        "triggerEvent": {
            "name": "hover",
            "excludeTargets": axisItemPattern
        },
        "handler": function(event, service) {
            if (!isTriggerable(service)) {
                return;
            }
            service.fireEvent("cleanAxisHoverEffect");
            service.fireEvent("clearHoverOnCategorySeries");
        }
    }];
    
});
define('sap/viz/hichert/behavior/config/EmbeddedLegendBehaviorConfig',[
    "sap/viz/hichert/components/util/Constants",
    "sap/viz/chart/components/util/DataPointUtils",
    "sap/viz/framework/common/util/UADetector"
], function(
    Constants,
    DataPointUtils,
    UADetector
) {
    var supportedChartTypes = ["info/hichert_bar", "info/hichert_column",
        "info/hichert_stacked_column", "info/hichert_stacked_bar", 
        "info/hichert_line", "info/hichert_variance_line"];
    var embeddedLegendItemClass = Constants.CSS.CLASS.EMBEDDED_LEGEND;
    var categoryAxisItemClass = Constants.CSS.CLASS.AXIS_ITEM;
    
    return [{
        "id": "hoverEmbeddedLegend",
        "triggerEvent": {
            "name": "hover",
            "targets": [embeddedLegendItemClass],
            "supportedChartTypes": supportedChartTypes
        },
        "handler": function(event, service) {
            var props = service.getProperties();
            if(!props.get("interaction.selectability.legendSelection")) {
                return;
            }
            var context = DataPointUtils.getContext(event.data.currentTarget);
            var color = service.getProperties().get("embeddedLegend.hoverShadow.color");
            if(color) {
                d3.select(event.data.currentTarget).select("rect")
                    .attr("fill", color)
                    .classed(Constants.CSS.CLASS.HOVER_SHADOW, true);
            }
            service.fireEvent("hoverOnEmbeddedLegend", {
                ctx: context.ctx
            }).setStatus("hoveringEmbeddedLegendItem", event.data.currentTarget);
        }
    }, {
        "id": "unhoverEmbeddedLegend",
        "triggerEvent": {
            "name": "hover",
            //should keep the hover effect of categoryAxis
            "excludeTargets": [embeddedLegendItemClass, categoryAxisItemClass],
            "supportedChartTypes": supportedChartTypes
        },
        "handler": function(event, service) {
            var props = service.getProperties();
            if(!props.get("interaction.selectability.legendSelection")) {
                return;
            }
            var currentTarget = service.getStatus("hoveringEmbeddedLegendItem");
            if(currentTarget) {
                d3.select(currentTarget).select("rect")
                    .attr("fill", "transparent")
                    .classed(Constants.CSS.CLASS.HOVER_SHADOW, true);
            }
            service.fireEvent("cleanHoverOnEmbeddedLegend")
                .setStatus("hoveringEmbeddedLegendItem", null);
        }
    },{
        "id": "mouseDownEmbeddedLegend",
        "triggerEvent": {
            "name": "down",
            "targets": [embeddedLegendItemClass],
            "supportedChartTypes": supportedChartTypes
        },
        "handler": function(event, service) {
            var props = service.getProperties();
            if(!props.get("interaction.selectability.legendSelection")) {
                return;
            }
            var color = props.get("embeddedLegend.mouseDownShadow.color");
            if(color){
                d3.select(event.data.currentTarget).select("rect")
                    .attr("fill", color);
            }
        }
    }, {
        "id": "mouseUpEmbeddedLegend",
        "triggerEvent": {
            "name": "up",
            "targets": [embeddedLegendItemClass],
            "supportedChartTypes": supportedChartTypes
        },
        "handler": function(event, service) {
            var props = service.getProperties();
            if(!props.get("interaction.selectability.legendSelection")) {
                return;
            }
            var color = props.get("embeddedLegend.hoverShadow.color");
            if (!UADetector.isMobile() && color) {
                d3.select(event.data.currentTarget).select("rect")
                    .attr("fill", color);
            }
        }
    }];
});

define('sap/viz/hichert/behavior/config/handler/DifferenceMarkerHandler',[
	'sap/viz/hichert/components/util/Constants',
	'sap/viz/framework/common/util/SVG',
	"sap/viz/framework/common/util/GeometryUtils",
	"sap/viz/framework/common/util/DataGraphics",
	"sap/viz/framework/common/util/ObjectUtils",
	'sap/viz/framework/common/util/DOM'
], function(
	Constants,
	SVG,
	GeometryUtils,
	DataGraphics,
	ObjectUtils,
	DOM
) {
	var labelClass = Constants.CSS.CLASS.DIFFERENCE_MARKER_LABEL;
	var crossClass = Constants.CSS.CLASS.DIFFERENCE_MARKER_CROSS;
	var controllerClass = Constants.CSS.CLASS.DIFFERENCE_MARKER_CONTROLLER;
	var labelBgClass = Constants.CSS.CLASS.DIFFERENCE_MARKER_LABEL_BG;
	var crossBgClass = Constants.CSS.CLASS.DIFFERENCE_MARKER_CROSS_BG;
	var labelControllerClass = Constants.CSS.CLASS.DIFFERENCE_MARKER_LABEL_CONTROLLER;
	var STROKE_WIDTH = "2px";
	var CROSS_STROKE_WIDTH = "4px";
	var STROKE_COLOR = "#CCCCCC";

	function DifferenceMarkerHandler() {}

	function drawDiffMarkerController(event, service) {
		var target = event.data.target.parentNode;
		var barPlotNode = service.getNodes(service.NodeType.PLOT_NODE).node();
		var controllerNode = barPlotNode.querySelector("." + controllerClass);
		if (controllerNode) {
			DOM.remove(controllerNode);
		}
		controllerNode = SVG.create("g", barPlotNode);
		controllerNode.setAttribute("class", controllerClass);
		var rectNode = target.querySelector("rect");
		var bbox = GeometryUtils.getBBox(rectNode);

		var plotModule = service.getModule("main.plot");
		var plotMainBBox = plotModule.getSize();

		var height = bbox.height + 2;
		if(height > bbox.width) {
			bbox.width = height;
		}
		if (bbox.x + bbox.width + height > plotMainBBox.width) {
			bbox.x = plotMainBBox.width - bbox.width - height - 5;
		}
		var x = bbox.x;
		var y = bbox.y - 1;

		//draw label controller
		var width = bbox.width + 5;
		var Cx = x - 10;

		var path = "M" + (x + width) + "," + (y + height) +
			"H" + x +
			"C" + Cx + "," + (y + height) + " " +
			Cx + "," + y + " " +
			x + "," + y +
			"H" + (x + width);
		var pathBg = path + "z";

		var labelPathNode = SVG.create("path", controllerNode);
		labelPathNode.setAttribute("d", path);
		labelPathNode.setAttribute("stroke", STROKE_COLOR);
		labelPathNode.setAttribute("stroke-width", STROKE_WIDTH);
		labelPathNode.setAttribute("class", labelControllerClass);
		labelPathNode.setAttribute("fill", "white");

		//draw separate line
		var separateLineNode = SVG.create("line", controllerNode);
		d3.select(separateLineNode).attr("x1", x + width).attr("y1", y)
			.attr("x2", x + width).attr("y2", y + height)
			.attr("stroke", STROKE_COLOR).attr("stroke-width", "3px");

		//draw cross part in controller
		var y1 = y + height * 0.3;
		var length = height * 0.4;

		var controllerX = x + width + length * 1.5 + 10;
		var controllerCrossPath = "M" + (x + width) + "," + y +
			"H" + (x + width + length * 1.5) +
			"C" + controllerX + ", " + y + " " +
			controllerX + "," + (y + height) + " " +
			(x + width + length * 1.5) + "," + (y + height) +
			"H" + (x + width);
		var controllerCrossBg = controllerCrossPath + "z";

		var controllerCrossNode = SVG.create("path", controllerNode);
		controllerCrossNode.setAttribute("class", crossClass);
		controllerCrossNode.setAttribute("d", controllerCrossPath);
		controllerCrossNode.setAttribute("stroke", STROKE_COLOR);
		controllerCrossNode.setAttribute("stroke-width", STROKE_WIDTH);
		controllerCrossNode.setAttribute("fill", "white");

		var controllerBBox = GeometryUtils.getBBox(controllerNode);
		var crossX = (x + width) + 
			(length + (controllerBBox.width - width - length * 1.5) / 2 - length) / 2;

		var crossPath = "M" + crossX + "," + y1 +
			"L" + (crossX + length) + "," + (y1 + length) +
			"M" + (crossX + length) + "," + y1 +
			"L" + crossX + "," + (y1 + length);

		var crossNode = SVG.create("path", controllerNode);
		crossNode.setAttribute("class", crossClass);
		crossNode.setAttribute("d", crossPath);
		crossNode.setAttribute("stroke", STROKE_COLOR);
		crossNode.setAttribute("stroke-width", CROSS_STROKE_WIDTH);
		crossNode.setAttribute("fill", "white");

		//to fill color in controller
		var labelPathBgNode = SVG.create("path", labelPathNode, true);
		labelPathBgNode.setAttribute("d", pathBg);
		labelPathBgNode.setAttribute("class", labelBgClass);
		labelPathBgNode.setAttribute("fill", "white");

		var crosssBgNode = SVG.create("path", labelPathNode, true);
		crosssBgNode.setAttribute("d", controllerCrossBg);
		crosssBgNode.setAttribute("class", crossBgClass);
		crosssBgNode.setAttribute("fill", "white");

		var cloneNode = target.querySelector("text").cloneNode(true);
		var context = DataGraphics.getData(target);
		DataGraphics.setData(cloneNode, context);
		cloneNode.setAttribute("class", labelControllerClass);
		cloneNode.setAttribute("x", bbox.x);
		controllerNode.appendChild(cloneNode);

		var labelControllerNodes = [labelPathNode, separateLineNode];
		return labelControllerNodes;
	}

	function deleteDiffMarker(event, service) {
		var currentStatus = service._getStatusManager().get("plot.differenceMarker.markerContexts");
		var labelNode = event.data.target.parentNode.querySelector("text");
		var context = DataGraphics.getData(labelNode);
		var newStatus = [];
		for (var i = 0; i < currentStatus.length; i++) {
			if (!ObjectUtils.deepEqual(currentStatus[i].start, context.start) ||
				!ObjectUtils.deepEqual(currentStatus[i].end, context.end)) {
				newStatus.push(currentStatus[i]);
			}
		}
		service._getStatusManager().set("plot.differenceMarker.markerContexts", newStatus);
		DOM.remove(labelNode.parentNode);
	}

	function highlightNodes(nodes, color) {
		if (nodes.length) {
			for (var i = 0; i < nodes.length; i++) {
				nodes[i].setAttribute("stroke", color);
			}
		} else {
			nodes.setAttribute("stroke", color);
		}
	}

	function unhighlightNodes(nodes) {
		if (nodes.length) {
			for (var i = 0; i < nodes.length; i++) {
				nodes[i].setAttribute("stroke", STROKE_COLOR);
			}
		} else {
			nodes.setAttribute("stroke", STROKE_COLOR);
		}
	}

	function contextEqual(lastLabel, currentLabel) {
		var lastLabelContext = DataGraphics.getData(lastLabel.parentNode);
		var currentLabelContext = DataGraphics.getData(currentLabel.parentNode);
		return ObjectUtils.deepEqual(lastLabelContext, currentLabelContext);
	}

	DifferenceMarkerHandler.prototype = {
		hoverOnDiffMarkerLabel: function(event, service) {
			var selectedDataPoints = service.getStatus("selectedDataPoints");
			if (selectedDataPoints && selectedDataPoints.length) {
				return;
			}
			var target = event.data.target;
			var labelControllerNodes;
			var color = service.getProperties().get('interaction.hover.stroke.color');
			if (!DOM.hasClass(target, labelControllerClass)) {
				var lastHoveringDiffMarkerLabel = service.getStatus("hoveringDiffMarkerLabel");
				var currentHoveringDiffMarkerLabel = target;
				if (lastHoveringDiffMarkerLabel &&
					contextEqual(lastHoveringDiffMarkerLabel, currentHoveringDiffMarkerLabel)) {
					return;
				} else {
					labelControllerNodes = drawDiffMarkerController(event, service);
				}
			} else {
				labelControllerNodes = target.parentNode.querySelector("." + labelControllerClass);
			}
			if (labelControllerNodes) {
				highlightNodes(labelControllerNodes, color);
			}
			service.setStatus("hoveringDiffMarkerLabel", target);
		},
		unhoverOnDiffMarkerLabel: function(event, service) {
			var barPlotNode = service.getNodes(service.NodeType.PLOT_NODE).node();
			var controllerNode = barPlotNode.querySelector("." + controllerClass);
			if (controllerNode) {
				DOM.remove(controllerNode);
				service.setStatus("hoveringDiffMarkerLabel", null);
			}
		},
		hoverOnDiffMarkerCross: function(event, service) {
			var target = event.data.target;
			var crossNodes = target.parentNode.querySelectorAll("." + crossClass);
			var labelNodes = target.parentNode.querySelector("." + labelControllerClass);
			var lineNode;
			var color = service.getProperties().get('interaction.hover.stroke.color');
			if (crossNodes) {
				highlightNodes(crossNodes, color);
				lineNode = target.parentNode.querySelector("line");
				highlightNodes(lineNode, color);
				unhighlightNodes(labelNodes);
			}
		},
		unhoverOnDiffMarkerCross: function(event, service) {
			var target = event.data.target;
			var crossNodes = target.parentNode.querySelectorAll("." + crossClass);
			if (crossNodes) {
				unhighlightNodes(crossNodes);
			}
		},
		deleteDiffMarker: function(event, service) {
			deleteDiffMarker(event, service);
			service.setStatus("hoveringDiffMarkerLabel", null);
		}
	};
	return DifferenceMarkerHandler;
});
define('sap/viz/hichert/behavior/config/DifferenceMarkerBehaviorConfig',[
	"sap/viz/hichert/behavior/config/handler/DifferenceMarkerHandler",
	'sap/viz/hichert/components/util/Constants'
], function(DifferenceMarkerHandler, Constants) {
	var supportedChartTypes = ["info/hichert_bar", "info/hichert_column"];
	var labelClass = Constants.CSS.CLASS.DIFFERENCE_MARKER_LABEL;
	var crossClass = Constants.CSS.CLASS.DIFFERENCE_MARKER_CROSS;
	var controllerClass = Constants.CSS.CLASS.DIFFERENCE_MARKER_CONTROLLER;
	var labelControllerClass = Constants.CSS.CLASS.DIFFERENCE_MARKER_LABEL_CONTROLLER;

	return [{
		"id": "differenceMarkerBehaviorDefinition",
		"handler": DifferenceMarkerHandler,
		"handlerType": "class",
		"supportedChartTypes": supportedChartTypes,
		"triggerEvent": [{
			"name": "hover",
			"targets": [labelClass, labelControllerClass],
			"method": "hoverOnDiffMarkerLabel"
		}, {
			"name": "hover",
			"excludeTargets": [labelClass, controllerClass, labelControllerClass],
			"method": "unhoverOnDiffMarkerLabel"
		}, {
			"name": "hover",
			"targets": crossClass,
			"method": "hoverOnDiffMarkerCross"
		}, {
			"name": "hover",
			"targets": labelControllerClass,
			"method": "unhoverOnDiffMarkerCross"
		}, {
			"name": "click",
			"targets": crossClass,
			"method": "deleteDiffMarker"
		}]
	}];
});
define('sap/viz/hichert/behavior/config/handler/LegendBehaviorHandler',[
	"sap/viz/framework/common/util/oo",
	"sap/viz/chart/behavior/config/handler/LegendBehaviorHandler",
	"sap/viz/chart/components/util/DataPointUtils",
	"sap/viz/hichert/behavior/config/utils/HichertSelectionUtil"
], function(oo, LegendBehaviorHandler, DataPointUtils, HichertSelectionUtil) {
	var HichertLegendBehaviorHandler = function() {
		HichertLegendBehaviorHandler.superclass.constructor.apply(this, arguments);
	};

	oo.extend(HichertLegendBehaviorHandler, LegendBehaviorHandler);

	HichertLegendBehaviorHandler.prototype._getTargets = function(ctx, event, service) {
		service.enableOnlyMainPlot = true;
		var targets = HichertSelectionUtil.getDataPointIds(ctx, service);
		service.enableOnlyMainPlot = false;
		return targets;
	};

	return HichertLegendBehaviorHandler;
});
define('sap/viz/hichert/behavior/config/LegendBehaviorConfig',[
    "sap/viz/hichert/behavior/config/handler/LegendBehaviorHandler"
], function(LegendBehaviorHandler) {
    
    var CLASS_LEGEND_ITEM = "v-legend-item";

    return [
        {
            "id": "legendBehaviorDefinition",
            "handler": LegendBehaviorHandler,
            "handlerType": "class",
            "triggerEvent": [{
                "name": "standAloneInitialized",
                "method": "standAloneInitialized"
            },  {
                "name": "hover",
                "targets": CLASS_LEGEND_ITEM,
                "method": "hover"
            }, {
                "name": "hover",
                "excludeTargets": CLASS_LEGEND_ITEM,
                "method": "nonHover"
            }, {
                "name": "cleanLegendHoverEffect",
                "method": "cleanLegendHoverEffect"
            }, {
                "name": "click",
                "targets": CLASS_LEGEND_ITEM,
                "method": "click"
            }, {
                "name": "down",
                "targets": CLASS_LEGEND_ITEM,
                "method": "mouseDown"
            }, {
                "name": "up",
                "targets": CLASS_LEGEND_ITEM,
                "method": "mouseUp"
            }]
        }
    ];
});

define('sap/viz/hichert/behavior/config/ContextualDataConfig',[], function() {
    return [{
        "id": "right_click_on_axis",
        "declaredEvents": "contextualData",
        "triggerEvent": {
            "name": "contextmenu"
        },
        "handler": function() {

        }
    }, {
        "id": "right_click_on_axis_label",
        "declaredEvents": "contextualData",
        "triggerEvent": {
            "name": "contextmenu"
        },
        "handler": function() {

        }
    }, {
        "id": "right_click_on_legend",
        "declaredEvents": "contextualData",
        "triggerEvent": {
            "name": "contextmenu"
        },
        "handler": function() {

        }
    }, {
        "id": "right_click_on_title",
        "declaredEvents": "contextualData",
        "triggerEvent": {
            "name": "contextmenu"
        },
        "handler": function() {

        }
    }, {
        "id": "right_click_on_chartarea",
        "declaredEvents": "contextualData",
        "triggerEvent": {
            "name": "contextmenu"
        },
        "handler": function() {

        }
    }, {
        "id": "right_click_on_datapoint",
        "declaredEvents": "contextualData",
        "triggerEvent": {
            "name": "contextmenu"
        },
        "handler": function() {

        }
    }, {
        "id": "right_click_on_area",
        "declaredEvents": "contextualData",
        "triggerEvent": {
            "name": "contextmenu"
        },
        "handler": function() {

        }
    }, {
        "id": "right_click_on_ref_line",
        "declaredEvents": "contextualData",
        "triggerEvent": {
            "name": "contextmenu"
        },
        "handler": function() {

        }
    }, {
        "id": "right_click_on_plot",
        "declaredEvents": "contextualData",
        "triggerEvent": {
            "name": "contextmenu"
        },
        "handler": function() {

        }
    }];
});
define('sap/viz/hichert/behavior/HichertBehavior',[
    "sap/viz/framework/interaction/BehaviorManager",
    "sap/viz/chart/behavior/DefaultBehavior",
    "sap/viz/hichert/behavior/config/DataPointBehaviorConfigForLine",
    "sap/viz/hichert/behavior/config/DataPointBehaviorConfigForBar",
    "sap/viz/hichert/behavior/config/AxisBehaviorConfig",
    "sap/viz/hichert/behavior/config/EmbeddedLegendBehaviorConfig",
    "sap/viz/hichert/behavior/config/DifferenceMarkerBehaviorConfig",
    "sap/viz/hichert/behavior/config/LegendBehaviorConfig",
    "sap/viz/hichert/behavior/config/ContextualDataConfig"
], function(
    BehaviorManager,
    DefaultBehaviorRegistry, // To make sure default behavior is loaded before hichert behavior is loaded.
    DataPointBehaviorConfigForLine,
    DataPointBehaviorConfigForBar,
    AxisBehaviorConfig,
    EmbeddedLegendBehaviorConfig,
    DifferenceMarkerBehaviorConfig,
    LegendBehaviorConfig,
    ContextualDataConfig
) {

    var hichertBehavior = BehaviorManager.get("default").clone();

    var config = Array.prototype.slice.call(arguments, 2);

    for (var i = 0; i < config.length; i++) {
        config[i].forEach(function(e) {
            hichertBehavior.addActionByDef(e);
        });
    }

    BehaviorManager.register("hichertBehavior", hichertBehavior);
});
define('sap/viz/hichert/views/XYYChartView',["sap/viz/framework/common/util/oo",
        "sap/viz/chart/views/XYYChartView",
        "sap/viz/hichert/components/plotareas/PlotAreaFactory",
        "sap/viz/hichert/components/legend/PatternLegend",
        "sap/viz/hichert/layout/GridLayout",
        "sap/viz/hichert/behavior/HichertBehavior"
], function(oo, BaseChartView, PlotAreaFactory, PatternLegend, GridLayout, HichertBehavior) {
    
    var XYYChartView = function(runtime, option) {
        XYYChartView.superclass.constructor.apply(this, arguments);
        runtime.propertyManager().set({
            'interaction.behaviorType': 'hichertBehavior'
        });
    };
    
    oo.extend(XYYChartView, BaseChartView);

    XYYChartView.prototype._createPlotContainer = function(isTrellis) {
        this._plotArea = PlotAreaFactory.create(this._renderType, this.runtime());
        
        this._plotArea.setRoughSize(this._size);
        this.setChild("main", this._plotArea, {
            priority: 3
        });
    };    
    
    XYYChartView.prototype._getLayoutDefinition = function () {
        return GridLayout;
    };
    
    XYYChartView.prototype._getDataItems = function () {
        return ["valueAxis", "valueAxis2", "categoryAxis", "series", "pattern", "pattern2", "variance1", "variance2"];
    };

    XYYChartView.prototype._getLegendDefinition = function () {
        return [PatternLegend];
    };

    return XYYChartView;
});
define('sap/viz/hichert/metadata/bindings/XYYBindings',[], function Setup() {


    var feeds = [{
        "id": "pattern",
        "name": "IDS_PATTERN",
        "type": "Dimension",
        "min": 0,
        "max": 1,
        "acceptMND": false,
        "role": "mark.pattern"
    }, {
        "id": "categoryAxis",
        "name": "IDS_CATEGORY_AXIS",
        "type": "Dimension",
        "min": 1,
        "max": Number.POSITIVE_INFINITY,
        "acceptMND": false,
        "role": "layout.category"
    }, {
        "id": "valueAxis",
        "name": "IDS_VALUE_AXIS",
        "type": "Measure",
        "min": 1,
        "max": 1,
        "role": "layout.value"
    }, {
        "id": "pattern2",
        "name": "IDS_PATTERN2",
        "type": "Dimension",
        "min": 0,
        "max": 1,
        "acceptMND": false,
        "role": "mark.pattern"
    }, {
        "id": "valueAxis2",
        "name": "IDS_VALUE_AXIS2",
        "type": "Measure",
        "min": 0,
        "max": 1,
        "role": "layout.value"
    }, {
        "id": "variance1",
        "name": "IDS_VARIANCE1",
        "type": "Measure",
        "min": 0,
        "max": 1,
        "role": "layout.value"
    }, {
        "id": "variance2",
        "name": "IDS_VARIANCE2",
        "type": "Measure",
        "min": 0,
        "max": 1,
        "role": "layout.value"
    }];

    return feeds;
});
define('sap/viz/hichert/components/legend/LegendGroup',[
    'sap/viz/framework/common/util/oo',
    'sap/viz/chart/components/legend/LegendGroup'
], function(oo, BaseLegendGroup){

    function LegendGroup(){
        LegendGroup.superclass.constructor.apply(this, arguments);
    }

    oo.extend(LegendGroup, BaseLegendGroup);

    var prot = LegendGroup.prototype;

    prot.setPosition = function (position) {
        this._position = position;
    };

    prot.getPreferredSize = function(bound, isTrellis) {
        var result = LegendGroup.superclass.getPreferredSize.apply(this, arguments);
        var pos = String(this._properties.get('layout.position')).toLowerCase();
        return result;
    };

    return LegendGroup;
});

define('sap/viz/hichert/views/XYChartView',["sap/viz/framework/common/util/oo",
    "sap/viz/chart/views/XYChartView",
    "sap/viz/hichert/components/plotareas/XYPlotArea",
    "sap/viz/hichert/components/legend/LegendGroup",
], function (oo, BaseChartView, PlotArea, LegendGroup) {

    var XYChartView = function (runtime, option) {
        XYChartView.superclass.constructor.apply(this, arguments);
        //Hide these properties for phase 1.
        this._properties.add({
            "categoryAxis.axisLine": {
                "showPattern": {
                    "defaultValue": true,
                    "readonly": true,
                    "serializable": false
                },
                "showPatternDivider": {
                    "defaultValue": true,
                    "readonly": true,
                    "serializable": false
                },
                "showPatternLabel": {
                    "defaultValue": true,
                    "readonly": true,
                    "serializable": false
                }
            }
        });
        runtime.propertyManager().set({
            'interaction.behaviorType': 'hichertBehavior'
        });
    };

    oo.extend(XYChartView, BaseChartView);

    XYChartView.prototype._createPlotContainer = function (isTrellis) {
        this._plotArea = new PlotArea(this.runtime(), {
            renderType: this._renderType
        });
        this._plotArea.setRoughSize(this._size);
        this.setChild("main", this._plotArea, {
            priority: 3
        });
    };

    XYChartView.prototype._getLegendGroupDefinition = function () {
        return LegendGroup;
    };

    XYChartView.prototype._getDataItems = function () {
        return ["valueAxis", "categoryAxis", "color", "series", "pattern"];
    };

    return XYChartView;
});

define('sap/viz/hichert/metadata/bindings/XYBindings',[], function Setup() {

    
    var feeds = [{
        "id": "pattern",
        "name": "IDS_PATTERN",
        "type": "Dimension",
        "min": 0,
        "max": 1,
        "acceptMND": false,
        "role": "mark.pattern"
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
    }];

    return feeds;
});
(function(){
    var list = define && define.__autoLoad;
    if(list && list.length){
        define.__autoLoad = [];
        require(list);
    }
})();
(function(components){
    var chartBundle = sap.bi.framework.declareBundle( {
        id: "sap.viz.hichert",
        components: components
    });

    (chartBundle.components || []).forEach(function(component) {
        component.instance = component.instance || {};
        window._cvom_kernel.register(component);
    });
})([
    {
        "id": "info/hichert_bar",
        "provide": "sap.viz.impls",
        "instance": {
            "view": "sap/viz/hichert/views/XYYChartView",
            "renderType": "hichert_bar",
            "family": "xyy.hichert",
            "name": "IDS_HICHERTBARCHART",
            "vender": "sap.viz",
            "bindings": "sap/viz/hichert/metadata/bindings/XYYBindings"
        },
        "customProperties": {
            "resources": [
                {
                    "key": "sap.viz.api.env.Template.loadPaths",
                    "path": "./resources/chart/templates"
                },
                {
                    "key": "sap.viz.api.env.Language.loadPaths",
                    "path": "./resources/chart/langs"
                },
                {
                    "key": "sap.viz.api.env.Language.loadPaths",
                    "path": "./resources/framework/langs"
                }
            ]
        }
    },
    {
        "id": "info/hichert_column",
        "provide": "sap.viz.impls",
        "instance": {
            "view": "sap/viz/hichert/views/XYYChartView",
            "renderType": "hichert_column",
            "family": "xyy.hichert",
            "name": "IDS_HICHERTVERTICALBARCHART",
            "vender": "sap.viz",
            "bindings": "sap/viz/hichert/metadata/bindings/XYYBindings"
        },
        "customProperties": {
            "resources": [
                {
                    "key": "sap.viz.api.env.Template.loadPaths",
                    "path": "./resources/chart/templates"
                },
                {
                    "key": "sap.viz.api.env.Language.loadPaths",
                    "path": "./resources/chart/langs"
                },
                {
                    "key": "sap.viz.api.env.Language.loadPaths",
                    "path": "./resources/framework/langs"
                }
            ]
        }
    },
    {
        "id": "info/hichert_line",
        "provide": "sap.viz.impls",
        "instance": {
            "view": "sap/viz/hichert/views/XYChartView",
            "renderType": "hichert_line",
            "family": "xy.hichert",
            "name": "IDS_HICHERTLINECHART",
            "vender": "sap.viz",
            "bindings": "sap/viz/hichert/metadata/bindings/XYBindings"
        },
        "customProperties": {
            "resources": [
                {
                    "key": "sap.viz.api.env.Template.loadPaths",
                    "path": "./resources/chart/templates"
                },
                {
                    "key": "sap.viz.api.env.Language.loadPaths",
                    "path": "./resources/chart/langs"
                },
                {
                    "key": "sap.viz.api.env.Language.loadPaths",
                    "path": "./resources/framework/langs"
                }
            ]
        }
    },
    {
        "id": "info/hichert_variance_line",
        "provide": "sap.viz.impls",
        "instance": {
            "view": "sap/viz/hichert/views/XYYChartView",
            "renderType": "hichert_variance_line",
            "family": "xyy.hichert",
            "name": "IDS_HICHERTVARIANCELINECHART",
            "vender": "sap.viz",
            "bindings": "sap/viz/hichert/metadata/bindings/XYYBindings"
        },
        "customProperties": {
            "resources": [
                {
                    "key": "sap.viz.api.env.Template.loadPaths",
                    "path": "./resources/chart/templates"
                },
                {
                    "key": "sap.viz.api.env.Language.loadPaths",
                    "path": "./resources/chart/langs"
                },
                {
                    "key": "sap.viz.api.env.Language.loadPaths",
                    "path": "./resources/framework/langs"
                }
            ]
        }
    },
    {
        "id": "info/hichert_stacked_bar",
        "provide": "sap.viz.impls",
        "instance": {
            "view": "sap/viz/hichert/views/XYChartView",
            "renderType": "hichert_stacked_bar",
            "family": "xy.hichert",
            "name": "IDS_HICHERTSTACKEDBARCHART",
            "vender": "sap.viz",
            "bindings": "sap/viz/hichert/metadata/bindings/XYBindings"
        },
        "customProperties": {
            "resources": [
                {
                    "key": "sap.viz.api.env.Template.loadPaths",
                    "path": "./resources/chart/templates"
                },
                {
                    "key": "sap.viz.api.env.Language.loadPaths",
                    "path": "./resources/chart/langs"
                },
                {
                    "key": "sap.viz.api.env.Language.loadPaths",
                    "path": "./resources/framework/langs"
                }
            ]
        }
    },
    {
        "id": "info/hichert_stacked_column",
        "provide": "sap.viz.impls",
        "instance": {
            "view": "sap/viz/hichert/views/XYChartView",
            "renderType": "hichert_stacked_column",
            "family": "xy.hichert",
            "name": "IDS_HICHERTSTACKEDVERTICALBARCHART",
            "vender": "sap.viz",
            "bindings": "sap/viz/hichert/metadata/bindings/XYBindings"
        },
        "customProperties": {
            "resources": [
                {
                    "key": "sap.viz.api.env.Template.loadPaths",
                    "path": "./resources/chart/templates"
                },
                {
                    "key": "sap.viz.api.env.Language.loadPaths",
                    "path": "./resources/chart/langs"
                },
                {
                    "key": "sap.viz.api.env.Language.loadPaths",
                    "path": "./resources/framework/langs"
                }
            ]
        }
    }
]);
if(define && define.__exportNS){
    define = define.__exportNS;
}
try {
    var ChartViewRegistry = require("sap/viz/framework/core/ChartViewRegistry");
    
    if (ChartViewRegistry && ChartViewRegistry.registerAll) {
        ChartViewRegistry.registerAll();
    }
} catch(e) {}

require([
    "sap/viz/chart/metadata/properties/PropertyLoader",
    "propertyDefs_Hichert"
], function(propertyLoader, propertyDefs_Hichert) {
    if (propertyLoader && propertyLoader.addPropertyDefs && propertyDefs_Hichert) {
        propertyLoader.addPropertyDefs(propertyDefs_Hichert);
    }
});if (window.__sap_viz_internal_requirejs_nextTick__ !== undefined) {
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