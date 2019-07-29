var DEV_VERSION = 'v1_0'
var DEV_COMMENT = 'Replicated from agency. By Ruslan';

var MAX_ABSOLUTE_HEIGHT = 1600
var MAX_ABSOLUTE_WIDTH = 1600
var GLOBAL_SCALE = 0.4
var TRANSITION_SPEED = 1

var widthScreen
var heightScreen

var config = (function () {
    "use strict";
    var cfg = {
        isDebug: true,
        isUIDebug: false,
        isLandscape: true,
        isRestartBtnExist: false,
        isBaseSize: false,
        BASE_GAME_WIDTH: 720,
        BASE_GAME_HEIGHT: 520,
        LANG: LANGUAGES['en'],
        get MIN_GAME_WIDTH() {
            return this.isBaseSize ? this.BASE_GAME_WIDTH : (this.isLandscape, 640)
        },
        get MIN_GAME_HEIGHT() {
            return this.isBaseSize ? this.BASE_GAME_HEIGHT : this.isLandscape ? this.BASE_GAME_HEIGHT : 640
        },
        get MAX_GAME_WIDTH() {
            return this.isBaseSize ? this.BASE_GAME_WIDTH : this.isLandscape ? 1136 : 750
        },
        get MAX_GAME_HEIGHT() {
            return this.isBaseSize ? this.BASE_GAME_HEIGHT : this.isLandscape ? this.BASE_GAME_HEIGHT : 1400
        },
        get GAME_CENTER_X() {
            return this.BASE_GAME_WIDTH / 2
        },
        get GAME_CENTER_Y() {
            return this.BASE_GAME_HEIGHT / 2
        },
        CURRENT_HORIZONTAL_MARGIN: 0,
        CURRENT_VERTICAL_MARGIN: 0,
        get VERTICAL_MARGIN_COEFFICIENT() {
            var e = this.MAX_GAME_HEIGHT - this.BASE_GAME_HEIGHT;
            return 0 === e ? 0 : 2 * this.CURRENT_VERTICAL_MARGIN / e
        },
        get HORIZONTAL_MARGIN_COEFFICIENT() {
            var e = this.MAX_GAME_WIDTH - this.BASE_GAME_WIDTH;
            return 0 === e ? 0 : 2 * this.CURRENT_HORIZONTAL_MARGIN / e
        },
        MAX_ABSOLUTE_HEIGHT: 1600,
        MAX_ABSOLUTE_WIDTH: 1600,

        mainState: null,
        get SCALED_WORLD_X() {
            var e = t.game.resizeMan.scaleFactor;
            return t.game.input.x / e - t.game.mainGroup.x / e
        },
        get SCALED_WORLD_Y() {
            var e = t.game.resizeMan.scaleFactor;
            return t.game.input.y / e - t.game.mainGroup.y / e
        }
    }
    return cfg
})();

var utils = (function() {
    "use strict";

    var lib = {
        PIXEL_RATIO: (function() {
            var ctx = document.createElement("canvas").getContext("2d"),
                dpr = window.devicePixelRatio || 1,
                bsr = ctx.webkitBackingStorePixelRatio ||
                ctx.mozBackingStorePixelRatio ||
                ctx.msBackingStorePixelRatio ||
                ctx.oBackingStorePixelRatio ||
                ctx.backingStorePixelRatio || 1;
                return dpr / bsr;
        })(),
        mixin: function(target, source) {
            if (source) {
                for (var key, keys = Object.keys(source), l = keys.length; l--; ) {
                    key = keys[l];

                    if (source.hasOwnProperty(key)) {
                        target[key] = source[key];
                    }
                }
            }
            return target;
        },
        randomRanges: function(min, max) {
            return min + (Math.random() * (max - min));
        },
        randomInts: function(min, max) {
            return min + Math.floor(Math.random() * (max - min + 1));
        },
        getSecondFrom: function(time) {
            return ((new Date().getTime() - time) / 1000) + 's.'
        },
        contains: function(x, y, obj) {
            if (x > (obj.x + 15) && // 15
                x < (obj.x - 5) + (obj.width + 40) && //40
                y > (obj.y - 20) && // 20
                y < (obj.y - 5) + (obj.height)
            )
                return true;
            return false;
        },
        sizeFromNum: function(defaultSize, number) {
            return number > 999999 ? defaultSize * 0.38 : number > 99999 ? defaultSize * 0.46 : number > 9999 ? defaultSize * 0.56 : number > 999 ? defaultSize * 0.7 : number > 99 ? defaultSize * 0.9 : defaultSize
        },
        sizeFromLength: function(defaultSize, text, defaultLength) {
            var curr_length = text.length
            if (curr_length < defaultLength)
                return defaultSize
            return Math.floor((Math.tanh(defaultLength / curr_length)) * defaultSize);
        },
        centerGameObjects: function(e) {
            e.forEach(function(e) {
                e.anchor.setTo(.5)
            })
        },
        setPositionToGameCenter: function(e) {
            e.forEach(function(e) {
                e.position.set(config.GAME_CENTER_X, config.GAME_CENTER_Y)
            })
        },
        setInputPriority: function(e, t) {
            e && (e.input || (e.inputEnabled = true), e.input.priorityID = t)
        },
        PL: function(e, t) {
            return config.isLandscape ? t : e
        },
        makeDraggableGroup: function(e) {
            function i(e) {
                if (e.forEach) e.forEach(i);
                else {
                    e.inputEnabled = true, e.input.enableDrag(), l.setInputPriority(e, 100), e.origin = new Phaser.Point(e.x, e.y);
                    var t = n.forEach ? a : r;
                    t && e.events.onDragUpdate.add(t), o && e.events.onDragStart.add(o), s && e.events.onDragStop.add(s)
                }
            }

            function a(e, t, i, a, o, s) {
                s && (e.startDragPos = new Phaser.Point(e.x, e.y), n.startDragPos = new Phaser.Point(n.x, n.y)), n.x = n.startDragPos.x - e.origin.x + i / game.resizeMan.scaleFactor, n.y = n.startDragPos.y - e.origin.y + a / game.resizeMan.scaleFactor, e.x = e.startDragPos.x, e.y = e.startDragPos.y, r && r(e, t, i, a, o, s)
            }
            var n = e.item,
                o = e.startCallback,
                s = e.stopCallback,
                r = e.updateCallback;
            n.forEach ? n.forEach(i) : i(n)
        },
        makeDraggableSprite: function(e) {
            var t = e.item,
                i = e.startCallback,
                a = e.stopCallback,
                n = e.updateCallback;
            t.inputEnabled = true, t.input.enableDrag(), l.setInputPriority(t, 100), t.origin = new Phaser.Point(t.x, t.y), t.events.onDragUpdate.add(function(e, t, i, a, o, s) {
                s && (e.startWorldPos = new Phaser.Point(e.world.x, e.world.y), e.startDragPos = new Phaser.Point(e.x, e.y)), n && n(e, t, i, a, o, s)
            }), i && t.events.onDragStart.add(i), a && t.events.onDragStop.add(a)
        },
        makeDraggableWithParamsDebug: function(e) {
            e instanceof Phaser.Group ? l.makeDraggableGroup({
                item: e,
                startCallback: function(e) {
                    game.debugMan.addToDebugGuiCommon(e)
                },
                updateCallback: function(e, t, i, a, o, s) {
                    l.log("Parent position x: ".concat(e.parent.position.x, " y: ").concat(e.parent.position.y)), l.log("Parent scale x: ".concat(e.scale.x, " y: ").concat(e.scale.y))
                }
            }) : l.makeDraggableSprite({
                item: e,
                startCallback: function(e) {
                    game.debugMan.addToDebugGuiCommon(e)
                },
                updateCallback: function(e, t, i, a, o, s) {
                    l.log("Object position x: ".concat(e.position.x, " y: ").concat(e.position.y)), l.log("Object scale x: ".concat(e.scale.x, " y: ").concat(e.scale.y))
                }
            })
        },
        clone: function(e) {
            if (null == e || "object" != (t = e, ("function" == typeof Symbol && "symbol" === o(Symbol.iterator) ? function(e) {
                    return o(e)
                } : function(e) {
                    return e && "function" == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : o(e)
                })(t))) return e;
            var t, i = e.constructor();
            for (var a in e) e.hasOwnProperty(a) && (i[a] = e[a]);
            return i
        },
        cloneObject: function(e) {
            var t;
            if (e instanceof Object) {
                for (var i in t = {}, e) e.hasOwnProperty(i) && (t[i] = this.clone(e[i]));
                return t
            }
        },
        getPosInMainGroup: function(e) {
            var t = new Phaser.Point(e.x * e.parent.scale.x, e.y * e.parent.scale.y);
            if (e !== game.mainGroup) {
                var i = this.getPosInMainGroup(e.parent);
                t.x += i.x, t.y += i.y
            } else t.x = 0, t.y = 0;
            return t
        },
        findIndexPolyfill: function() {
            Array.prototype.findIndex || Object.defineProperty(Array.prototype, "findIndex", {
                value: function(e) {
                    if (null == this) throw new TypeError('"this" is null or not defined');
                    var t = Object(this),
                        i = t.length >>> 0;
                    if ("function" != typeof e) throw new TypeError("predicate must be a function");
                    for (var a = arguments[1], o = 0; o < i;) {
                        var s = t[o];
                        if (e.call(a, s, o, t)) return o;
                        o++
                    }
                    return -1
                },
                configurable: true,
                writable: true
            })
        },
        openTargetLink: function() {
            window.TJ_API ? window.TJ_API.click() : window.open("http://no-TJ-API.com", "_blank")
        },
        doNothing: function() {},
        throttle: function(a, o, s) {
            var n, r;
            return o || (o = 250),
                function() {
                    var e = s || this,
                        t = +new Date,
                        i = arguments;
                    n && t < n + o ? (clearTimeout(r), r = setTimeout(function() {
                        n = t
                    }, o)) : (n = t, a.apply(e, i))
                }
        },
        getTimeStamp: function() {
            var e = new Date,
                t = e.getFullYear(),
                i = e.getMonth() + 1,
                a = e.getDate(),
                o = e.getHours(),
                s = e.getMinutes(),
                n = e.getSeconds(),
                r = "";
            return 1 === i.toString().length && (i = "0" + i), 1 === a.toString().length && (a = "0" + a), 1 === o.toString().length && (o = "0" + o), 1 === s.toString().length && (s = "0" + s), 1 === n.toString().length && (n = "0" + n), (r += a + "_" + i + "_" + t) + "___" + o + "_" + s + "_" + n
        },
        drawGameTitleForGoogle: function(title, options) {
            options = options || {}
            options.position = options.position || 4
            title = title || "Google UAC"
            var game_width = config.BASE_GAME_WIDTH + config.CURRENT_HORIZONTAL_MARGIN;
            var game_height= config.BASE_GAME_HEIGHT + config.CURRENT_VERTICAL_MARGIN;
            game.google_game_title_text = game.add.text(game_width * ((options.position == 1 || options.position == 4) ? 0.03 : 0.97), game_height * ((options.position == 1 || options.position == 2) ? 0.03 : 0.97), title);
            game.google_game_title_text.position_index = options.position
            game.google_game_title_text.fill = "#F8896C";
            game.google_game_title_text.fontSize = 80;
            game.google_game_title_text.align = "center";
            game.google_game_title_text.anchor.x = (options.position == 2 || options.position == 3) ? 1 : 0
            game.google_game_title_text.anchor.y = (options.position == 3 || options.position == 4) ? 1 : 0
            game.google_game_title_text.stroke = "#ffffff";
            game.google_game_title_text.strokeThickness = 25;
            game.google_game_title_text.wordWrap = true;
            game.google_game_title_text.lineSpacing  = -50
            game.google_game_title_text.wordWrapWidth = 0.7;
            game.google_game_title_text.reposition = function() {
                var e = config.VERTICAL_MARGIN_COEFFICIENT + .44
                e = Math.min(e, 0.50)
                game.google_game_title_text.fontSize = e * 90;
                game.google_game_title_text.strokeThickness = e * 25;
                var game_width = config.BASE_GAME_WIDTH + config.CURRENT_HORIZONTAL_MARGIN;
                var game_height= config.BASE_GAME_HEIGHT + config.CURRENT_VERTICAL_MARGIN;
                game.google_game_title_text.x = game_width * ((options.position == 1 || options.position == 4) ? 0.03 : 0.97) - config.CURRENT_HORIZONTAL_MARGIN
                game.google_game_title_text.y = game_height * ((options.position == 1 || options.position == 2) ? 0.03 : 0.97)
            }

            game.mainGroup.add(game.google_game_title_text)
        },
        timer : function(callback, delay) {
            var id, started, remaining = delay, running;
        
            this.start = function() {
                running = true
                started = new Date()
                id = game.time.events.add(remaining, callback)
            }
        
            this.pause = function() {
                running = false
                if (id)
                    game.time.events.remove(id)
                remaining -= new Date() - started
            }
        
            this.getTimeLeft = function() {
                if (running) {
                    this.pause()
                    this.start()
                }
        
                return remaining
            }
        
            this.getStateRunning = function() {
                return running
            }
        
            this.start()
        },
        interval : function(callback, delay) {
            var id, started, remaining = delay, running;
        
            this.start = function() {
                running = true
                started = new Date()
                id = game.time.events.loop(remaining, callback)
            }
        
            this.pause = function() {
                running = false
                if (id)
                    game.time.events.remove(id)
            }
        
            this.getTimeLeft = function() {
                if (running) {
                    this.pause()
                    this.start()
                }
        
                return remaining
            }
        
            this.getStateRunning = function() {
                return running
            }
        
            this.start()
        }
    };
    lib.log = config.isDebug ? console.log.bind(window.console) : function() {};
    return lib;
})();

var ExchangeManager = (function() {
    var clicked_install_allready = false
    var exchangeLib = {
        gameIndexInitDelay: GPP_NETWORK == "ironsource" ? 500 : 10,
        installPlayableClicked: function() {
            if (clicked_install_allready)
                return
            clicked_install_allready = true
            setTimeout(function() {
                clicked_install_allready = false
            }, 100)
            if ("ironsource" == GPP_NETWORK) {
                if (typeof mraid !== 'undefined' || window.mraid) {
                    mraid.openStoreUrl()
                } else if (typeof dapi !== 'undefined' || window.dapi) {
                    dapi.openStoreUrl();
                }
            } else {
                "google" == GPP_NETWORK ? ExitApi.exit() : "mintegral" == GPP_NETWORK ? window.install() : "_blank" == GPP_NETWORK ? window.open(GPP_DESTINATION_URL, '_blank') : "preview" == GPP_NETWORK ? window.open(GPP_DESTINATION_URL, "_parent") : "facebook" == GPP_NETWORK ? FbPlayableAd.onCTAClick() : "vungle" == GPP_NETWORK ? callSDK("download") : "unity" == GPP_NETWORK ? mraid.open(GPP_DESTINATION_URL) : "applovin" == GPP_NETWORK ? mraid.open(GPP_DESTINATION_URL) : "appreciate" == GPP_NETWORK ? mraid.open(GPP_DESTINATION_URL) : "adcolony" == GPP_NETWORK ? mraid.openStore(GPP_DESTINATION_URL) : "tapjoy" == GPP_NETWORK ? window.TJ_API && window.TJ_API.click() : "ironsource" == GPP_NETWORK ? mraid.openStoreUrl() : alert("OK: " + GPP_DESTINATION_URL)
                // vungle can be - parent.postMessage('download','*')
            }
        },
        callFinishedPopup: function() {
            if ("tapjoy" == GPP_NETWORK) {
                try {
                    (window.TJ_API && window.TJ_API.objectiveComplete());
                    window.TJ_API && window.TJ_API.playableFinished()
                } catch (e) {
                    var t = "Could not skip ad! | " + e;
                    console.warn(t)
                }
                return 300
            } else if ("mintegral" == GPP_NETWORK)
                window.gameEnd()
            return 0
        },
        checkViewable: function() {
            mraid.removeEventListener("ready", exchangeLib.checkViewable);
            if (!mraid.isViewable() && GPP_NETWORK != "unity") {
                mraid.addEventListener("viewableChange", exchangeLib.isInterstitialDisplayed);
            } else {
                setTimeout(function() {
                    GameIndex.init();
                }, exchangeLib.gameIndexInitDelay)
            }
        },
        audioVolumeChangeCallback: function() {

        },
        adDapiVisibleCallback: function() {
            if (dapi.isViewable()) {
                dapi.removeEventListener("viewableChange", exchangeLib.adDapiVisibleCallback);
                setTimeout(function() {
                    dapi.addEventListener("audioVolumeChange", exchangeLib.audioVolumeChangeCallback);
                    GameIndex.init();
                }, exchangeLib.gameIndexInitDelay)
            }
        },
        onDapiReadyCallback: function() {
            dapi.removeEventListener("ready", exchangeLib.onDapiReadyCallback);
            let isAudioEnabled = !!dapi.getAudioVolume();
            if (dapi.isViewable()) {
                setTimeout(function() {
                    dapi.addEventListener("audioVolumeChange", exchangeLib.audioVolumeChangeCallback);
                    GameIndex.init();
                }, exchangeLib.gameIndexInitDelay)
            } else {
                dapi.addEventListener("viewableChange", exchangeLib.adDapiVisibleCallback);
            }
        },
        initializeNetworkRules: function() {
            document.title = GPP_TITLE
            if ("mintegral" == GPP_NETWORK) {
                window.gameStart = function() {
                    GameIndex.init();
                }
                window.gameClose = function() {
                    game.popupManager.showPopup();
                }
            }

            if (typeof mraid !== 'undefined' || window.mraid) {
                if (mraid.getState() === 'loading') {
                    mraid.addEventListener('ready', this.checkViewable);
                } else if (mraid.getState() === 'default') {
                    this.checkViewable();
                }
            } else if (typeof dapi !== 'undefined' || window.dapi) {
                (dapi.isReady()) ? this.onDapiReadyCallback(): dapi.addEventListener("ready", this.onDapiReadyCallback);
            } else if ("google" == GPP_NETWORK) {
                var scriptTag = document.createElement('script');
                scriptTag.type = 'text/javascript';
                scriptTag.src = "https://tpc.googlesyndication.com/pagead/gadgets/html5/api/exitapi.js";

                setTimeout(function() {
                    document.body.appendChild(scriptTag);
                }, 0)
                setTimeout(function() {
                    GameIndex.init();
                }, exchangeLib.gameIndexInitDelay)
            } else {
                window.onload = function() {
                    if ("mintegral" == GPP_NETWORK) {
                        window.gameReady()
                    } else {
                        GameIndex.init();
                    }
                }
            }

            if ("tapjoy" == GPP_NETWORK) {
                (window.TJ_API && window.TJ_API.setPlayableBuild(GPP_VERSION));
            } else {

            }
        },
        isInterstitialDisplayed(displayed) {
            if (displayed) {
                mraid.removeEventListener("viewableChange", this.isInterstitialDisplayed);
                setTimeout(function() {
                    GameIndex.init();
                }, exchangeLib.gameIndexInitDelay)
            }
        },
        initializeNetworkRulesOnRender: function() {
            if ("tapjoy" == GPP_NETWORK) {
                var t = {
                    skipAd: function() {
                        try {
                            game.popupManager.showPopup();
                        } catch (e) {
                            var t = "Could not skip ad! | " + e;
                            console.warn(t)
                        }
                    }
                };

                window.TJ_API && window.TJ_API.setPlayableAPI ? window.TJ_API.setPlayableAPI(t) : config.isDebug && (window.onkeyup = function(e) {
                    "KeyW" === "e.code" && t.skipAd()
                })
            } else if ("ironsource" == GPP_NETWORK) {
                if (typeof mraid !== 'undefined' || window.mraid) {
                    var wdth = mraid.getMaxSize().width;
                    var hght = mraid.getMaxSize().height;
                } else if (typeof dapi !== 'undefined' || window.dapi) {
                    var screenSize = dapi.getScreenSize();
                }
            } else if ("google" == GPP_NETWORK) {
                utils.drawGameTitleForGoogle(GPP_TITLE)
            } else if ("adcolony" == GPP_NETWORK) {
                if (Phaser.Device.iOS) {
                    mraid.preloadStore(GPP_DESTINATION_URL)
                }
            }
        }
    }
    return exchangeLib;
})();


var ResizeManager = (function() {
    "use strict";
    var manager = {
        init: function() {
            this.scaleFactor = 1;
            this.scaleMethodIndex = 1;
            this.oldWinWidth = 0;
            this.oldWinHeight = 0;
            game.stage.disableVisibilityChange = true;
            game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
            game.scale.fullScreenScaleMode = Phaser.ScaleManager.SHOW_ALL;
            game.scale.onSizeChange.add(this.onSizeChange, this);
            game.scale.setResizeCallback(this.onResize, this);

            if (typeof mraid !== 'undefined' || window.mraid) {
                mraid.addEventListener("sizeChange", this.onResize)
            } else if (typeof dapi !== 'undefined' || window.dapi) {
                dapi.addEventListener("adResized", this.onResize);
            }

            game.clearBeforeRender = false;
            this.forceResize();
            window.addEventListener("scroll", function() {
                document.activeElement === document.body && 0 < window.scrollY && (document.body.scrollTop = 0)
            }, true)
        },
        forceResize: function() {
            this.onResize(void 0, void 0, true)
        },
        onResize: function(e, t) {
            var i = 2 < arguments.length && void 0 !== arguments[2] && arguments[2],
                a = window.devicePixelRatio || 1,
                o = Math.floor(window.innerWidth * a),
                s = Math.floor(window.innerHeight * a);
                if (typeof GPG_TEMPLATE_DEFAULT !== 'undefined') {
                    o = GPG_TEMPLATE_DEFAULT.pWidth,
                    s = GPG_TEMPLATE_DEFAULT.pHeight;
                }
                if (GPP_NETWORK == "ironsource") {
                    var sizeFromLib = {width: o, height: s}
                    if (typeof mraid !== 'undefined' || window.mraid) {
                        sizeFromLib = mraid.getMaxSize()
                    } else if (typeof dapi !== 'undefined' || window.dapi) {
                        sizeFromLib = dapi.getScreenSize()
                    }

                    o = Math.floor(sizeFromLib.width),
                    s = Math.floor(sizeFromLib.height);
                    window.innerWidth = sizeFromLib.width;
                    window.innerHeight = sizeFromLib.height;
                }
            if (manager.updateOrientation(o, s), i || o !== manager.oldWinWidth || s !== manager.oldWinHeight) {
                if (manager.oldWinWidth = o, manager.oldWinHeight = s, !Phaser.Device.desktop)
                    if (!config.isLandscape && s > config.MAX_ABSOLUTE_HEIGHT) {
                        var n = s / config.MAX_ABSOLUTE_HEIGHT;
                        s = config.MAX_ABSOLUTE_HEIGHT, o /= n
                    } else if (config.isLandscape && o > config.MAX_ABSOLUTE_WIDTH) {
                    var r = o / config.MAX_ABSOLUTE_WIDTH;
                    o = config.MAX_ABSOLUTE_WIDTH, s /= r
                }
                var l = Math.min(o / config.MIN_GAME_WIDTH, s / config.MIN_GAME_HEIGHT),
                    g = Math.min(o, config.MAX_GAME_WIDTH * l),
                    u = Math.min(s, config.MAX_GAME_HEIGHT * l);
                if (1 === manager.scaleMethodIndex) {
                    //game.scale.setGameSize(g, u), this.scaleFactor = l, game.mainGroup.scale.set(l), game.mainWorldGroup.scale.set(l), game.mainMiddleGroup.scale.set(l);
                    var c = g - config.BASE_GAME_WIDTH * l;
                    // game..x = c mainGroup/ 2;
                    // game.mainWorldGroup.x = c / 2;
                    // game.mainMiddleGroup.x = c / 2
                    var d = u - config.BASE_GAME_HEIGHT * l;
                    // game.mainGroup.y = d / 2
                    // game.mainWorldGroup.y = d / 2
                    // game.mainMiddleGroup.y = d / 2
                } else {
                    var A = u / l - config.MAX_GAME_HEIGHT,
                        I = g / l - config.MAX_GAME_WIDTH;
                    //game.scale.setGameSize(config.MAX_GAME_WIDTH + I, config.MAX_GAME_HEIGHT + A), this.scaleFactor = 1, game.mainGroup.scale.set(1), game.mainWorldGroup.scale.set(l), game.mainMiddleGroup.scale.set(l), I = g / l - config.BASE_GAME_WIDTH, game.mainGroup.x = I / 2, game.mainMiddleGroup.x = I / 2, game.mainWorldGroup.x = I / 2, A = u / l - config.BASE_GAME_HEIGHT, game.mainGroup.y = A / 2, game.mainMiddleGroup.y = A / 2, game.mainWorldGroup.y = A / 2
                }
                //config.CURRENT_HORIZONTAL_MARGIN = game.mainGroup.x / manager.scaleFactor;
                //config.CURRENT_VERTICAL_MARGIN = game.mainGroup.y / manager.scaleFactor;

                //------------SCALE------------
                config.isLandscape ? GLOBAL_SCALE = game.world.width / 3000 : GLOBAL_SCALE = game.world.width / 2000

                if (game.world.height / game.world.width < 1.85 && !config.isLandscape && VARIATION_MECHANIC == "B") {
                    GLOBAL_SCALE = game.world.height / 3700

                } else if (game.world.height / game.world.width < 1.53 && !config.isLandscape) {
                    GLOBAL_SCALE = game.world.height / 3000
                }
                TRANSITION_SPEED = 40 * GLOBAL_SCALE
                //------------SCALE------------

                game.isInited && (game.uiManager.onResize(), game.worldManager.onResize(), game.levelManager.onResize())
                if (game.isInited && "google" == GPP_NETWORK)
                    game.google_game_title_text.reposition()
                setTimeout(function() {
                    window.scrollTo(0, 1)
                }, 100), window.scrollTo(0, 1)
            }
        },
        onSizeChange: function() {
            config.isDebug
        },
        updateOrientation: function(e, t) {
            var i = e / t;
            config.isLandscape = 1.1 < i
        }
    }
    manager.init()
    return manager
});

var progressOffset
var firstLoad = true

var UiManager = (function () {
    "use strict";
    function getRoundedSprite(bound, color) {
        var grph_background = game.add.graphics(0, 0);
        grph_background.beginFill(color);
        grph_background.drawRoundedRect(0, 0, bound.width, bound.height, bound.radius);
        var sprite = game.add.sprite(bound.x, bound.y, grph_background.generateTexture());
        grph_background.destroy()
        return sprite
    }

    var manager = {
        init: function () {
            this.playableFinished = false;

            game.uiGroup = game.add.group(game.mainGroup, "uiGroup")
            game.headerGroup = game.add.group()
            game.finishGroup = game.add.group()
            game.footerGroup = game.add.group()


            //----install button
            this.install_button = getRoundedSprite({
                x: 0,
                y: 0,
                width: 400,
                height: 130,
                radius: 25,
            }, 0xFF23FF)

            game.headerGroup.add(this.install_button)
            this.install_button_label = game.add.text(0, 0, config.LANG["INSTALL"].toUpperCase())
            this.install_button_label.fill = "#ffffff"
            this.install_button_label.fontSize = utils.sizeFromLength(110, config.LANG["INSTALL"], 7)
            this.install_button.scale.set(0.4)

            this.install_button.addChild(this.install_button_label)
            utils.centerGameObjects([this.install_button, this.install_button_label])

            this.install_button.inputEnabled = true

            this.install_button.events.onInputUp.add(() => {
                this.adClick()
            }, this)


            //-----progress bar
            this.progress_bar = getRoundedSprite({
                x: config.GAME_CENTER_X + config.CURRENT_HORIZONTAL_MARGIN + 50,
                y: 25,
                width: 280,
                height: 18,
                radius: 50
            }, 0xFFFFFF)

            this.progress_bar_fill_grey = getRoundedSprite({
                x: config.GAME_CENTER_X + config.CURRENT_HORIZONTAL_MARGIN + 50,
                y: 25,
                width: 280,
                height: 18,
                radius: 50
            }, 0x757575)

            this.progress_bar_fill_green = getRoundedSprite({
                x: config.GAME_CENTER_X + config.CURRENT_HORIZONTAL_MARGIN + 50,
                y: 25,
                width: 280,
                height: 18,
                radius: 50
            }, 0x66BB6A)
            this.progress_bar_fill_green.alpha = 0  //alpha is 0 to display only grey progresspar

            this.progress_mask = game.add.graphics(-this.progress_bar_fill_grey.width)
            this.progress_mask.beginFill("0xffffff")
            this.progress_mask.drawRect(0, 0, this.progress_bar_fill_grey.width, this.progress_bar_fill_grey.height)

            this.progress_bar_fill_grey.addChild(this.progress_mask)
            this.progress_bar_fill_grey.mask = this.progress_mask

            this.progress_bar_fill_green.addChild(this.progress_mask)
            this.progress_bar_fill_green.mask = this.progress_mask

            game.headerGroup.add(this.progress_bar)
            game.headerGroup.add(this.progress_bar_fill_grey)
            game.headerGroup.add(this.progress_bar_fill_green)
            this.progress_bar.addChild(this.progress_mask)


            //----progress percentage text
            var text = "0%"
            var textAchorX
            if (ADD_NETWORK == "ironsource" || ADD_NETWORK == "tapjoy") {
                textAchorX = 0.5
            } else {
                textAchorX = 1
            }
            if (VARIATION_MECHANIC == "B") text = "0$"
            this.progress_text = game.add.text(0, 0, text, 64)
            this.progress_text.anchor.set(textAchorX, 0)
            this.progress_text.font = 'Arial'
            this.progress_text.fontSize = 70
            this.progress_text.fill = '#ffffff'
            //this.progress_bar.addChild(this.progress_text)

            var animalText

            switch (VARIATION_ANIMAL) {
                case 'A':
                    animalText = 'SHEEP'
                    break
                case 'B':
                    animalText = 'MAMMOTH'
                    break
                case 'C':
                    animalText = 'RABBIT'
                    break
                case 'D':
                    animalText = 'LAMA'
            }

            this.todoText = game.add.text(30, 110, 'PUT THE\n' + animalText + ' IN\nTHE FARM!')
            this.todoText.font = 'Arial'
            this.todoText.fontSize = 55
            this.todoText.fontStyle = 'italic'
            this.todoText.fill = '#ffffff'
            this.todoText.stroke = '#000000';
            this.todoText.strokeThickness = 5;
            game.headerGroup.add(this.todoText)

            this.graphics = game.add.graphics(0, 0)
            this.graphics.anchor.set(0.5)
            this.graphics.lineStyle(14000 * GLOBAL_SCALE)
            this.graphics.alpha = 0
            this.graphics.drawCircle(0, 0, 15000 * GLOBAL_SCALE)
            this.graphics.x = game.width / 2
            this.graphics.y = game.height / 2 + 400 * GLOBAL_SCALE

            //----start level finger
            this.fingerCursor = game.add.sprite(0, 0, 'cursor')
            this.fingerCursor.anchor.set(0.5)
            this.fingerCursor.alpha = 0

            this.pouce = game.add.sprite(0, 0, 'pouce')
            this.pouce.anchor.set(0.5)
            this.pouce.x = 30
            this.pouce.y = 40
            this.fingerCursor.addChild(this.pouce)
            this.fingerCursor.x = game.width / 2
            this.fingerCursor.y = game.height / 2 + 200

            //----last screen
            this.finishBackground = getRoundedSprite({
                x: game.width / 2,
                y: game.height / 2,
                width: game.width * 2.5,
                height: game.height * 2.5,
                radius: 1
            }, 0x1ed37c)
            this.finishBackground.anchor.set(0.5)
            this.finishBackground.alpha = 0

            game.finishGroup.add(this.finishBackground)

            this.finishSheep = game.add.sprite(0, 0, 'sheepSheet')
            this.finishSheep.anchor.set(0.5)
            this.finishBackground.addChild(this.finishSheep)

            var levelText = "Level 3\ncomplete"
            if (VARIATION_MECHANIC == "B") {
                levelText = "Level\ncomplete"
            }

            this.finishLevelText = game.add.text(0, 0, levelText, { align: 'center' })
            this.finishLevelText.anchor.set(0.5)
            this.finishLevelText.font = 'Arial'
            this.finishLevelText.fontSize = 75
            this.finishLevelText.fill = '#ffffff'
            this.finishLevelText.y = -game.height / 2.5
            this.finishBackground.addChild(this.finishLevelText)

            this.finishPercentText = game.add.text(0, 0, '100%', { align: 'center' })
            this.finishPercentText.anchor.set(0.5)
            this.finishPercentText.font = 'Arial'
            this.finishPercentText.fontSize = 200
            this.finishPercentText.fill = '#ffffff'
            this.finishPercentText.y = -game.height / 4
            this.finishBackground.addChild(this.finishPercentText)

            this.continueButton = game.add.sprite(0, 0, 'continueButtonYellow')
            this.continueButton.y = game.height / 3
            this.continueButton.anchor.set(0.5)
            this.finishBackground.addChild(this.continueButton)

            this.continueText = game.add.text(0, 0, 'CONTINUE!', { align: 'center' })
            this.continueText.anchor.set(0.5)
            this.continueText.font = 'Arial'
            this.continueText.fontSize = 90
            this.continueText.fill = '#00C853'
            this.continueText.y = -10
            this.continueButton.addChild(this.continueText)

            this.unlockAnimalsText = game.add.text(0, 0, 'UNLOCK NEW ANIMALS!', { align: 'center' })
            this.unlockAnimalsText.anchor.set(0.5)
            this.unlockAnimalsText.font = 'Arial'
            this.unlockAnimalsText.fontSize = 55
            this.unlockAnimalsText.fill = '#ffffff'
            this.unlockAnimalsText.y = this.continueButton.y - 150
            this.finishBackground.addChild(this.unlockAnimalsText)

            this.jump = this.finishSheep.animations.add('jump');
            this.finishSheep.animations.play('jump', 60, true);

            this.showFingerAndShadow()
            this.onResize()
            //this.showLastScreen() 

            this.lastClick = new Date().getTime()
            this.lastClickInterval = null

            this.setClickInterval()

            game.input.onDown.add(() => {
                this.lastClick = new Date().getTime()
                game.uiManager.todoText.alpha = 0
                cursor.alpha = 0.6

                clearInterval(this.lastClickInterval)
            }, this)

            game.input.onUp.add(() => {
                this.setClickInterval()
                cursor.alpha = 0
            })

            this.checkInterval = new utils.interval(() => {
                if (new Date().getTime() - manager.lastClick > 2000) {
                }
            }, 100)

        },

        setClickInterval: function () {
            this.lastClickInterval = setInterval(() => {
                if (new Date().getTime() - this.lastClick > 5000 && !this.playableFinished) {
                    this.showFinger()
                }
            }, 2000)
        },

        makeFooter: function () {
            game.footerGroup.destroy()

            try {
                this.spawnRateBtn.destroy()
                this.woolValueBtn.destroy()
                this.woolQuantityBtn.destroy()
                this.bigSheepBtn.destroy()
                this.trucksSpeedBtn.destroy()
            } catch (Exception) { }

            game.footerGroup = game.add.group()

            var footerHeight = GLOBAL_SCALE * 545


            //----Tabs----
            this.upgradesTab = getRoundedSprite({
                x: game.width / 2 - game.width / 4 - 20,
                y: game.height - footerHeight - 50 * GLOBAL_SCALE,
                width: game.width / 2,
                height: 200 * GLOBAL_SCALE,
                radius: 20,
            }, 0x00695C)
            this.upgradesTab.anchor.set(0.5)
            game.footerGroup.add(this.upgradesTab)

            this.upgradeText = game.add.text(0, 0, 'UPGRADES', { align: 'center' })
            this.upgradeText.anchor.set(0.5)
            this.upgradeText.font = 'Arial'
            this.upgradeText.fill = '#FFF3C7'
            this.upgradeText.scale.set(GLOBAL_SCALE * 2)
            this.upgradesTab.addChild(this.upgradeText)

            this.boostersTab = getRoundedSprite({
                x: game.width / 2 + game.width / 4 + 20,
                y: game.height - footerHeight - 50 * GLOBAL_SCALE,
                width: game.width / 2,
                height: 200 * GLOBAL_SCALE,
                radius: 20,
            }, 0x004D40)
            this.boostersTab.anchor.set(0.5)
            game.footerGroup.add(this.boostersTab)

            this.boostText = game.add.text(0, 0, 'BOOSTERS', { align: 'center' })
            this.boostText.anchor.set(0.5)
            this.boostText.font = 'Arial'
            this.boostText.fill = '#FFF3C7'
            this.boostText.scale.set(GLOBAL_SCALE * 2)
            this.boostersTab.addChild(this.boostText)

            //----Background----
            this.footerBackground = getRoundedSprite({
                x: game.world.centerX,
                y: game.height - footerHeight / 2,
                width: game.width,
                height: footerHeight,
                radius: 1,
            }, 0x00695C)
            this.footerBackground.anchor.set(0.5)
            game.footerGroup.add(this.footerBackground)
            this.footerBackground.scale.set(1.0)

            //----Buttons----
            var buttonScale = 0.00232 * this.footerBackground.height

            this.spawnRateBtn = game.add.sprite(0, 0, "buttonTall")
            this.spawnRateBtn.inputEnabled = true
            this.spawnRateBtn.anchor.set(0.5)
            this.spawnRateBtn.scale.set(buttonScale)
            this.spawnRateBtn.x = -this.spawnRateBtn.width * 2 - 6

            this.spawnRateText = game.add.text(0, -60, 'SPAWN\nRATE', { align: 'center' })
            this.spawnRateText.anchor.set(0.5, 1)
            this.spawnRateText.font = 'Arial'
            this.spawnRateText.fontSize = 35
            this.spawnRateText.fill = '#00695C'
            this.spawnRateBtn.addChild(this.spawnRateText)

            this.spawnRateNew = game.add.text(-70, 133, 'New', { align: 'center' })
            this.spawnRateNew.anchor.set(0.5)
            this.spawnRateNew.font = 'Arial'
            this.spawnRateNew.fontSize = 30
            this.spawnRateNew.fill = '#00695C'
            this.spawnRateBtn.addChild(this.spawnRateNew)

            this.spawnRateCost = game.add.text(70, 133, '50$', { align: 'center' })
            this.spawnRateCost.anchor.set(0.5)
            this.spawnRateCost.font = 'Arial'
            this.spawnRateCost.fontSize = 30
            this.spawnRateCost.fill = '#00695C'
            this.spawnRateBtn.addChild(this.spawnRateCost)

            this.spawnRateImg = game.add.sprite(0, 20, 'spawnRate')
            this.spawnRateImg.anchor.set(0.5)
            this.spawnRateImg.scale.set(1.2)
            this.spawnRateBtn.addChild(this.spawnRateImg)

            this.spawnRateBtn.events.onInputDown.add(function () {

                if (money >= upgradeCostArray[spawnRateCostIndex]) {

                    game.add.tween(this.spawnRateBtn.scale).to({
                        x: buttonScale * 0.9,
                        y: buttonScale * 0.9
                    }, 100, "Linear", true).onComplete.add(() => {
                        game.add.tween(this.spawnRateBtn.scale).to({
                            x: buttonScale,
                            y: buttonScale
                        }, 100, "Linear", true)
                    })

                    ANIMAL_COUNT = ANIMAL_COUNT * 2
                    money -= upgradeCostArray[spawnRateCostIndex]
                    spawnRateCostIndex++
                    this.spawnRateCost.setText(upgradeCostArray[spawnRateCostIndex])
                    this.increaseProgressIdle()
                }

                console.log("Spawn rate: " + ANIMAL_COUNT)
            }, this);


            this.woolValueBtn = game.add.sprite(-this.spawnRateBtn.width - 3, 0, "buttonTall")
            this.woolValueBtn.inputEnabled = true
            this.woolValueBtn.anchor.set(0.5)
            this.woolValueBtn.scale.set(buttonScale)

            this.woolValueText = game.add.text(0, -60, 'VOOL\nVALUE', { align: 'center' })
            this.woolValueText.anchor.set(0.5, 1)
            this.woolValueText.font = 'Arial'
            this.woolValueText.fontSize = 35
            this.woolValueText.fill = '#00695C'
            this.woolValueBtn.addChild(this.woolValueText)

            this.woolValueNew = game.add.text(-70, 133, 'New', { align: 'center' })
            this.woolValueNew.anchor.set(0.5)
            this.woolValueNew.font = 'Arial'
            this.woolValueNew.fontSize = 30
            this.woolValueNew.fill = '#00695C'
            this.woolValueBtn.addChild(this.woolValueNew)

            this.voolValueCost = game.add.text(70, 133, '50$', { align: 'center' })
            this.voolValueCost.anchor.set(0.5)
            this.voolValueCost.font = 'Arial'
            this.voolValueCost.fontSize = 30
            this.voolValueCost.fill = '#00695C'
            this.woolValueBtn.addChild(this.voolValueCost)

            this.woolValueImg = game.add.sprite(0, 20, 'woolValue')
            this.woolValueImg.anchor.set(0.5)
            this.woolValueImg.scale.set(1.2)
            this.woolValueBtn.addChild(this.woolValueImg)

            this.woolValueBtn.events.onInputDown.add(function () {

                if (money >= upgradeCostArray[woolValueCostIndex]) {

                    game.add.tween(this.woolValueBtn.scale).to({
                        x: buttonScale * 0.9,
                        y: buttonScale * 0.9
                    }, 100, "Linear", true).onComplete.add(() => {
                        game.add.tween(this.woolValueBtn.scale).to({
                            x: buttonScale,
                            y: buttonScale
                        }, 100, "Linear", true)
                    })

                    woolValueNumber += 5
                    money -= upgradeCostArray[woolValueCostIndex]
                    woolValueCostIndex++
                    this.voolValueCost.setText(upgradeCostArray[woolValueCostIndex])
                    this.increaseProgressIdle()
                }
                console.log("Wool value: " + woolValueNumber)
            }, this);


            this.woolQuantityBtn = game.add.sprite(0, 0, "buttonTall")
            this.woolQuantityBtn.inputEnabled = true
            this.woolQuantityBtn.anchor.set(0.5)
            this.woolQuantityBtn.scale.set(buttonScale)

            this.woolQuantityText = game.add.text(0, -60, 'VOOL\nQUANTITY', { align: 'center' })
            this.woolQuantityText.anchor.set(0.5, 1)
            this.woolQuantityText.font = 'Arial'
            this.woolQuantityText.fontSize = 35
            this.woolQuantityText.fill = '#00695C'
            this.woolQuantityBtn.addChild(this.woolQuantityText)

            this.woolQuantityNew = game.add.text(-70, 133, 'New', { align: 'center' })
            this.woolQuantityNew.anchor.set(0.5)
            this.woolQuantityNew.font = 'Arial'
            this.woolQuantityNew.fontSize = 30
            this.woolQuantityNew.fill = '#00695C'
            this.woolQuantityBtn.addChild(this.woolQuantityNew)

            this.woolQuantityCost = game.add.text(70, 133, '50$', { align: 'center' })
            this.woolQuantityCost.anchor.set(0.5)
            this.woolQuantityCost.font = 'Arial'
            this.woolQuantityCost.fontSize = 30
            this.woolQuantityCost.fill = '#00695C'
            this.woolQuantityBtn.addChild(this.woolQuantityCost)

            this.woolQuantityImg = game.add.sprite(0, 20, 'woolQuantity')
            this.woolQuantityImg.anchor.set(0.5)
            this.woolQuantityImg.scale.set(1.2)
            this.woolQuantityBtn.addChild(this.woolQuantityImg)

            this.woolQuantityBtn.events.onInputDown.add(function () {

                if (money >= upgradeCostArray[woolQuantityCostIndex]) {

                    game.add.tween(this.woolQuantityBtn.scale).to({
                        x: buttonScale * 0.9,
                        y: buttonScale * 0.9
                    }, 100, "Linear", true).onComplete.add(() => {
                        game.add.tween(this.woolQuantityBtn.scale).to({
                            x: buttonScale,
                            y: buttonScale
                        }, 100, "Linear", true)
                    })

                    woolQuantityNumber += 5
                    money -= upgradeCostArray[woolQuantityCostIndex]
                    woolQuantityCostIndex++
                    this.woolQuantityCost.setText(upgradeCostArray[woolQuantityCostIndex])
                    this.increaseProgressIdle()
                }
                console.log("Wool quantity: " + woolQuantityNumber)
            }, this);


            this.bigSheepBtn = game.add.sprite(this.spawnRateBtn.width + 3, 0, "buttonTall")
            this.bigSheepBtn.inputEnabled = true
            this.bigSheepBtn.anchor.set(0.5)
            this.bigSheepBtn.scale.set(buttonScale)

            this.bigSheepText = game.add.text(0, -60, 'BIG\nSHEEP', { align: 'center' })
            this.bigSheepText.anchor.set(0.5, 1)
            this.bigSheepText.font = 'Arial'
            this.bigSheepText.fontSize = 35
            this.bigSheepText.fill = '#00695C'
            this.bigSheepBtn.addChild(this.bigSheepText)

            this.bigSheepNew = game.add.text(-70, 133, 'New', { align: 'center' })
            this.bigSheepNew.anchor.set(0.5)
            this.bigSheepNew.font = 'Arial'
            this.bigSheepNew.fontSize = 30
            this.bigSheepNew.fill = '#00695C'
            this.bigSheepBtn.addChild(this.bigSheepNew)

            this.bigSheepCost = game.add.text(70, 133, '50$', { align: 'center' })
            this.bigSheepCost.anchor.set(0.5)
            this.bigSheepCost.font = 'Arial'
            this.bigSheepCost.fontSize = 30
            this.bigSheepCost.fill = '#00695C'
            this.bigSheepBtn.addChild(this.bigSheepCost)

            this.bigSheepTextImg = game.add.sprite(0, 20, 'bigSheep')
            this.bigSheepTextImg.anchor.set(0.5)
            this.bigSheepTextImg.scale.set(1.2)
            this.bigSheepBtn.addChild(this.bigSheepTextImg)

            this.bigSheepBtn.events.onInputDown.add(function () {
                if (money >= upgradeCostArray[bigSheepCostIndex]) {

                    game.add.tween(this.bigSheepBtn.scale).to({
                        x: buttonScale * 0.9,
                        y: buttonScale * 0.9
                    }, 100, "Linear", true).onComplete.add(() => {
                        game.add.tween(this.bigSheepBtn.scale).to({
                            x: buttonScale,
                            y: buttonScale
                        }, 100, "Linear", true)
                    })

                    var animalCount = Math.round(ANIMALS.length * 0.1)
                    bigSheepNumber += 0.25 * GLOBAL_SCALE

                    for (var i = 0; i < animalCount; i++) {
                        var animal = Math.floor((Math.random() * ANIMALS.length));
                        ANIMALS[animal].scale.set(bigSheepNumber)
                        ANIMALS[animal].body.setCircle(25 * bigSheepNumber)
                    }
                    money -= upgradeCostArray[bigSheepCostIndex]
                    bigSheepCostIndex++
                    this.bigSheepCost.setText(upgradeCostArray[bigSheepCostIndex])
                    this.increaseProgressIdle()
                }
                console.log("Big sheep: " + bigSheepNumber)
            }, this);


            this.trucksSpeedBtn = game.add.sprite(this.spawnRateBtn.width * 2 + 6, 0, "buttonTall")
            this.trucksSpeedBtn.inputEnabled = true
            this.trucksSpeedBtn.anchor.set(0.5)
            this.trucksSpeedBtn.scale.set(buttonScale)

            this.trucksSpeedText = game.add.text(0, -60, 'TRUCKS\nSPEED', { align: 'center' })
            this.trucksSpeedText.anchor.set(0.5, 1)
            this.trucksSpeedText.font = 'Arial'
            this.trucksSpeedText.fontSize = 35
            this.trucksSpeedText.fill = '#00695C'
            this.trucksSpeedBtn.addChild(this.trucksSpeedText)

            this.trucksSpeedNew = game.add.text(-70, 133, 'New', { align: 'center' })
            this.trucksSpeedNew.anchor.set(0.5)
            this.trucksSpeedNew.font = 'Arial'
            this.trucksSpeedNew.fontSize = 30
            this.trucksSpeedNew.fill = '#00695C'
            this.trucksSpeedBtn.addChild(this.trucksSpeedNew)

            this.trucksSpeedCost = game.add.text(70, 133, '50$', { align: 'center' })
            this.trucksSpeedCost.anchor.set(0.5)
            this.trucksSpeedCost.font = 'Arial'
            this.trucksSpeedCost.fontSize = 30
            this.trucksSpeedCost.fill = '#00695C'
            this.trucksSpeedBtn.addChild(this.trucksSpeedCost)

            this.trucksSpeedImg = game.add.sprite(0, 20, 'trucksSpeed')
            this.trucksSpeedImg.anchor.set(0.5)
            this.trucksSpeedImg.scale.set(1.2)
            this.trucksSpeedBtn.addChild(this.trucksSpeedImg)

            this.trucksSpeedBtn.events.onInputDown.add(function () {
                if (money >= upgradeCostArray[trucksSpeedCostIndex]) {

                    game.add.tween(this.trucksSpeedBtn.scale).to({
                        x: buttonScale * 0.9,
                        y: buttonScale * 0.9
                    }, 100, "Linear", true).onComplete.add(() => {
                        game.add.tween(this.trucksSpeedBtn.scale).to({
                            x: buttonScale,
                            y: buttonScale
                        }, 100, "Linear", true)
                    })

                    trucksSpeedNumber -= 200
                    game.worldManager.truckTween.updateTweenData('duration', trucksSpeedNumber)
                    money -= upgradeCostArray[trucksSpeedCostIndex]
                    trucksSpeedCostIndex++
                    this.trucksSpeedCost.setText(upgradeCostArray[trucksSpeedCostIndex])
                    this.increaseProgressIdle()
                }
                console.log("Truck speed: " + trucksSpeedNumber)
            }, this);

            if (config.isLandscape) {
                this.footerBackground.alpha = 0
                this.upgradesTab.alpha = 0
                this.boostersTab.alpha = 0

                this.spawnRateBtn.scale.set(GLOBAL_SCALE)
                this.woolValueBtn.scale.set(GLOBAL_SCALE)
                this.woolQuantityBtn.scale.set(GLOBAL_SCALE)
                this.bigSheepBtn.scale.set(GLOBAL_SCALE)
                this.trucksSpeedBtn.scale.set(GLOBAL_SCALE)

                this.spawnRateBtn.x = this.spawnRateBtn.width / 2 + 5 * GLOBAL_SCALE
                this.woolValueBtn.x = this.spawnRateBtn.width / 2 + 5 * GLOBAL_SCALE
                this.woolQuantityBtn.x = game.width - this.spawnRateBtn.width / 2 - 5 * GLOBAL_SCALE
                this.bigSheepBtn.x = game.width - this.spawnRateBtn.width / 2 - 5 * GLOBAL_SCALE
                this.trucksSpeedBtn.x = game.width - this.spawnRateBtn.width / 2 - 5 * GLOBAL_SCALE

                this.spawnRateBtn.y = game.height - this.spawnRateBtn.height / 2
                this.woolValueBtn.y = game.height - this.spawnRateBtn.height * 1.5
                this.woolQuantityBtn.y = game.height - this.spawnRateBtn.height / 2
                this.bigSheepBtn.y = game.height - this.spawnRateBtn.height * 1.5
                this.trucksSpeedBtn.y = game.height - this.spawnRateBtn.height * 2.5
            } else {
                this.footerBackground.addChild(this.spawnRateBtn)
                this.footerBackground.addChild(this.woolValueBtn)
                this.footerBackground.addChild(this.woolQuantityBtn)
                this.footerBackground.addChild(this.bigSheepBtn)
                this.footerBackground.addChild(this.trucksSpeedBtn)

            }

        },

        popupResize: function () {

            if (!config.isLandscape) {

                this.finishBackground.y = game.height / 2

                this.finishLevelText.y = -game.height / 2.5
                this.finishLevelText.scale.set(GLOBAL_SCALE * 2)

                this.finishPercentText.y = -game.height / 3.8
                this.finishPercentText.scale.set(GLOBAL_SCALE * 2)

                this.continueButton.y = game.height / 2.8
                this.continueButton.scale.set(GLOBAL_SCALE * 2)

                this.unlockAnimalsText.y = this.continueButton.y - 400 * GLOBAL_SCALE
                this.unlockAnimalsText.scale.set(GLOBAL_SCALE * 2)

                this.finishSheep.scale.set(GLOBAL_SCALE * 8)
                this.finishSheep.y = 0

            } else {

                this.finishBackground.y = game.height / 2

                this.finishLevelText.y = -game.height / 2.5
                this.finishLevelText.scale.set(GLOBAL_SCALE)

                this.finishPercentText.y = -game.height / 3.8
                this.finishPercentText.scale.set(GLOBAL_SCALE)

                this.continueButton.y = game.height / 2.5
                this.continueButton.scale.set(GLOBAL_SCALE)

                this.unlockAnimalsText.y = this.continueButton.y - GLOBAL_SCALE * 200
                this.unlockAnimalsText.scale.set(GLOBAL_SCALE)

                this.finishSheep.scale.set(GLOBAL_SCALE * 5)
                this.finishSheep.y = 80 * GLOBAL_SCALE
            }
        },

        showLastScreen: function () {
            var t = this
            this.progress_text.alpha = 0

            setTimeout(() => {
                t.finishBackground.scale.set(0.1)

                t.finishBackground.alpha = 1

                game.add.tween(t.finishBackground.scale).to({
                    x: 1,
                    y: 1
                }, 400, "Linear", true)

                this.continueButton.inputEnabled = true
                this.continueButton.events.onInputUp.add(function () {
                    this.adClick()
                }, this)

            }, 200)
        },

        adClick: function () {
            ExchangeManager.callFinishedPopup()
            setTimeout(function () {
                ExchangeManager.CTAClicked()
            }, 10)
        },

        onResize: function () {
            var e = config.VERTICAL_MARGIN_COEFFICIENT + .44
            e = Math.min(e, 0.50)


            this.install_button.scale.set(GLOBAL_SCALE * 1.3)
            config.isLandscape ? this.todoText.scale.set(GLOBAL_SCALE * 1.5) : this.todoText.scale.set(GLOBAL_SCALE * 3)

            this.install_button.x = this.install_button.width / 2 + GLOBAL_SCALE * 70
            this.install_button.y = this.install_button.height / 2 + GLOBAL_SCALE * 70
            this.todoText.x = GLOBAL_SCALE * 70
            this.todoText.y = this.install_button.y + GLOBAL_SCALE * 140

            this.progress_bar.scale.set(GLOBAL_SCALE * 3)
            this.progress_bar_fill_green.scale.set(GLOBAL_SCALE * 3)
            this.progress_bar_fill_grey.scale.set(GLOBAL_SCALE * 3)

            this.progress_bar.x = game.width - this.progress_bar.width - GLOBAL_SCALE * 70
            this.progress_bar_fill_green.x = game.width - this.progress_bar.width - GLOBAL_SCALE * 70
            this.progress_bar_fill_grey.x = game.width - this.progress_bar.width - GLOBAL_SCALE * 70

            this.progress_bar.y = GLOBAL_SCALE * 70
            this.progress_bar_fill_green.y = GLOBAL_SCALE * 70
            this.progress_bar_fill_grey.y = GLOBAL_SCALE * 70

            this.progress_text.scale.set(GLOBAL_SCALE * 2.5)
            this.progress_text.x = game.width - GLOBAL_SCALE * 70
            this.progress_text.y = 120 * GLOBAL_SCALE

            this.finishBackground.x = game.width / 2

            if (ADD_NETWORK == "ironsource" || ADD_NETWORK == "tapjoy") {

                if (!config.isLandscape) {

                    this.install_button.x = game.width / 2
                    this.install_button.y = this.install_button.height / 2 + GLOBAL_SCALE * 40

                    this.progress_bar.x = game.width / 2 - this.progress_bar.width / 2
                    this.progress_bar_fill_green.x = game.width / 2 - this.progress_bar.width / 2
                    this.progress_bar_fill_grey.x = game.width / 2 - this.progress_bar.width / 2

                    this.progress_bar.y = GLOBAL_SCALE * 240
                    this.progress_bar_fill_green.y = GLOBAL_SCALE * 240
                    this.progress_bar_fill_grey.y = GLOBAL_SCALE * 240

                    this.progress_text.x = game.width * 0.525
                    this.progress_text.y = 300 * GLOBAL_SCALE

                } else {

                    this.install_button.x = this.install_button.width / 2 + this.install_button.width
                    this.install_button.y = this.install_button.height / 2 + GLOBAL_SCALE * 70

                    this.progress_bar.x = game.width - this.progress_bar.width - this.install_button.width
                    this.progress_bar_fill_green.x = game.width - this.progress_bar.width - this.install_button.width
                    this.progress_bar_fill_grey.x = game.width - this.progress_bar.width - this.install_button.width

                    this.progress_bar.y = GLOBAL_SCALE * 70
                    this.progress_bar_fill_green.y = GLOBAL_SCALE * 70
                    this.progress_bar_fill_grey.y = GLOBAL_SCALE * 70

                    this.progress_text.x = game.width - this.install_button.width - this.progress_text.width / 2
                    this.progress_text.y = 140 * GLOBAL_SCALE
                }

            }

            if (VARIATION_MECHANIC == "A" || VARIATION_MECHANIC == "C") {
                progressOffset = this.progress_bar_fill_grey.width / ANIMAL_COUNT
            } else {
                progressOffset = this.progress_bar_fill_grey.width / maxMoney
            }

            this.finishLevelText.x = 0

            if (VARIATION_MECHANIC == 'B') this.makeFooter()

            this.popupResize()

            this.fingerCursor.x = game.width / 2
            this.fingerCursor.y = game.height / 2 + 400 * GLOBAL_SCALE

            this.graphics.x = game.width / 2
            this.graphics.y = game.height / 2 + 400 * GLOBAL_SCALE
        },

        showFinger: function () {
            this.fingerTween = game.add.tween(this.fingerCursor.scale).to({
                x: 2 * GLOBAL_SCALE,
                y: 2 * GLOBAL_SCALE
            }, 500, "Linear", true)

            this.fingerTween = game.add.tween(this.fingerCursor).to({
                alpha: 1
            }, 500, "Linear", true).onComplete.add(() => {
                this.fingerTweenOut = game.add.tween(this.fingerCursor.scale).to({
                    x: 3 * GLOBAL_SCALE,
                    y: 3 * GLOBAL_SCALE
                }, 500, "Linear", true, 550)

                this.fingerTweenOut = game.add.tween(this.fingerCursor).to({
                    alpha: 0
                }, 500, "Linear", true, 550)
            })
        },

        showFingerAndShadow: function () {
            this.fingerTween = game.add.tween(this.fingerCursor.scale).to({
                x: 2 * GLOBAL_SCALE,
                y: 2 * GLOBAL_SCALE
            }, 500, "Linear", true, 2000)

            this.fingerTween = game.add.tween(this.fingerCursor).to({
                alpha: 1
            }, 500, "Linear", true, 2000)

            this.shadowTween = game.add.tween(this.graphics).to({
                alpha: 0.5
            }, 500, "Linear", true, 2500).onComplete.add(function () {
                var t = this
                game.time.events.add(500, function () {
                    t.shadowTween = game.add.tween(t.graphics).to({
                        alpha: 0
                    }, 500, "Linear", 2000)
                }, this);

                t.fingerTween = game.add.tween(t.fingerCursor.scale).to({
                    x: 3 * GLOBAL_SCALE,
                    y: 3 * GLOBAL_SCALE
                }, 500, "Linear", true, 100)

                t.fingerTween = game.add.tween(t.fingerCursor).to({
                    alpha: 0
                }, 500, "Linear", true, 100)
            }, this)
        },

        farmScale: 0,
        percentageScale: 0,

        animateFarm: function () {

            this.farmScale = config.isLandscape ? GLOBAL_SCALE * 0.85 : GLOBAL_SCALE
            this.percentageScale = GLOBAL_SCALE * 2.5

            game.add.tween(this.progress_text.scale).to({
                x: this.percentageScale * 1.1,
                y: this.percentageScale * 1.1
            }, 60, "Linear", true).onComplete.add(function () {
                game.add.tween(this.progress_text.scale).to({
                    x: this.percentageScale,
                    y: this.percentageScale
                }, 50, "Linear", true)
            }, this)

            game.add.tween(FARMS[currentLevel - 1].scale).to({
                x: this.farmScale * 1.1,
                y: this.farmScale * 1.1
            }, 60, "Linear", true).onComplete.add(function () {
                game.add.tween(FARMS[currentLevel - 1].scale).to({
                    x: this.farmScale,
                    y: this.farmScale
                }, 50, "Linear", true)
            }, this)
        },

        increaseProgress: function () {

            this.progress_mask.x += progressOffset / GLOBAL_SCALE / 3
            var percentage = Math.round((this.progress_bar_fill_grey.width / GLOBAL_SCALE / 3 + this.progress_mask.x) * 100 / (this.progress_bar_fill_grey.width / GLOBAL_SCALE / 3))
            this.progress_text.setText(percentage + "%")

            if (percentage > 74) this.progress_bar_fill_green.alpha = 1
        },

        setZeroProgress: function () {
            var progressInterval = game.time.events.loop(10, function () {
                this.progress_mask.x -= progressOffset / GLOBAL_SCALE / 3

                if (this.progress_mask.x < -278) {
                    this.progress_bar_fill_green.alpha = 0
                    this.progress_text.setText('0%')
                    game.time.events.remove(progressInterval)
                }
            }, this)
        },

        increaseProgressIdle: function () {

            this.progress_mask.x = -280 + this.progress_bar_fill_grey.width * money / maxMoney
            this.progress_text.setText(money + "$")
        }

    }
    manager.init()
    return manager
})


var FENCEDOTS_1 = []
var FENCEDOTS_1_LAND = []
var FENCEDOTS_2 = []

var FENCES = []
var FENCES_2 = []
var FENCES_3 = []


var OBSTACLEDOTS = []


var OBSTACLE_1 = []
var OBSTACLE_2 = []

var TREES_1 = []
var TREES_1_LAND = []

var TREES_2 = []
var TREES_2_LAND = []

var TREES_3 = []
var TREES_3_LAND = []

var TREES_4 = []
var TREES_4_LAND = []

var TREES_3 = []


var ANIMALS = []
var STUPID_ANIMALS = []


var BACKGROUNDS = []
var FARMS = []
var GROUNDS = []
var RIVERS = []


var sim, sim2
var scale

var physicsBounds = [6]
var physicsBounds2 = [4]

var catchPoint = 0

var centerX
var centerY

var absoluteHeight = 0
var absoluteWidth = 0


var background, backgroundLand
var fence, fenceBottom
var house, houseBottom
var trees
var animalSprite
var obstacle
var door
var farmPanel

var VARIATION_TEMP = null

var WorldManager = (function () {
    "use strict";

    var manager = {

        createFenceArray: function () {
            FENCEDOTS_1.push({ x: this.field.x - 120, y: this.field.y })

            FENCEDOTS_1.push({ x: this.field.x - this.field.width / 2 + 30, y: this.field.y + this.field.height / 3 })
            FENCEDOTS_1.push({ x: this.field.x - this.field.width / 2 + 30, y: this.field.y + this.field.height / 1.7 })
            FENCEDOTS_1.push({ x: this.field.x - this.field.width / 2 + 30, y: this.field.y + this.field.height })
            FENCEDOTS_1.push({ x: this.field.x - 180, y: this.field.y + this.field.height })
            FENCEDOTS_1.push({ x: this.field.x + 180, y: this.field.y + this.field.height })
            FENCEDOTS_1.push({ x: this.field.x + this.field.width / 2 - 30, y: this.field.y + this.field.height })
            FENCEDOTS_1.push({ x: this.field.x + this.field.width / 2 - 30, y: this.field.y + this.field.height / 1.7 })
            FENCEDOTS_1.push({ x: this.field.x + this.field.width / 2 - 30, y: this.field.y + this.field.height / 3 })

            FENCEDOTS_1.push({ x: this.field.x + 120, y: this.field.y })

            FENCEDOTS_1_LAND.push({ x: this.field.x - 170, y: this.field.y })
            FENCEDOTS_1_LAND.push({ x: this.field.x - 170, y: this.field.y + this.field.height / 8 })
            FENCEDOTS_1_LAND.push({ x: this.field.x - 1450, y: this.field.y + this.field.height / 8 })
            FENCEDOTS_1_LAND.push({ x: this.field.x - 1450, y: this.field.y + this.field.height / 1.6 })
            FENCEDOTS_1_LAND.push({ x: this.field.x - 180, y: this.field.y + this.field.height / 1.6 })
            FENCEDOTS_1_LAND.push({ x: this.field.x + 180, y: this.field.y + this.field.height / 1.6 })
            FENCEDOTS_1_LAND.push({ x: this.field.x + 1450, y: this.field.y + this.field.height / 1.6 })
            FENCEDOTS_1_LAND.push({ x: this.field.x + 1450, y: this.field.y + this.field.height / 8 })
            FENCEDOTS_1_LAND.push({ x: this.field.x + 170, y: this.field.y + this.field.height / 8 })
            FENCEDOTS_1_LAND.push({ x: this.field.x + 170, y: this.field.y })

            FENCEDOTS_2.push({ x: this.field.x - 180, y: -1300 })
            FENCEDOTS_2.push({ x: this.field.x - 180, y: this.field.y - 720 })
            FENCEDOTS_2.push({ x: this.field.x - 90, y: this.field.y - 20 })
            FENCEDOTS_2.push({ x: this.field.x + 90, y: this.field.y - 20 })
            FENCEDOTS_2.push({ x: this.field.x + 180, y: this.field.y - 720 })
            FENCEDOTS_2.push({ x: this.field.x + 180, y: -1300 })

            OBSTACLEDOTS.push({ x: this.field.x, y: this.field.y - 360 })
            OBSTACLEDOTS.push({ x: this.field.x - 100, y: this.field.y - 250 })
            OBSTACLEDOTS.push({ x: this.field.x - 100, y: this.field.y + 250 })
            OBSTACLEDOTS.push({ x: this.field.x, y: this.field.y + 360 })
            OBSTACLEDOTS.push({ x: this.field.x + 100, y: this.field.y + 250 })
            OBSTACLEDOTS.push({ x: this.field.x + 100, y: this.field.y - 250 })
        },

        init: function () {

            if (VARIATION_MECHANIC == "B") ANIMAL_COUNT = 5

            game.worldGroup = game.add.group(game.mainGroup)

            game.backgroundGroup1 = game.add.group()
            game.backgroundGroup2 = game.add.group()
            game.backgroundGroup3 = game.add.group()
            game.backgroundGroup1L = game.add.group()
            game.backgroundGroup2L = game.add.group()
            game.backgroundGroup3L = game.add.group()

            game.trees = game.add.group(game.worldGroup)

            game.levelGroup1 = game.add.group()
            game.levelGroup2 = game.add.group()
            game.levelGroup3 = game.add.group()

            //----creating cursor
            cursor = game.add.sprite(0, 0, 'cursor')
            cursor.scale.set(GLOBAL_SCALE * 2)
            cursor.alpha = 0
            cursor.anchor.set(0.5)
            game.physics.p2.enable(cursor)
            cursor.body.setCircle(GLOBAL_SCALE * 470)
            cursor.body.damping = 1
            cursor.body.kinematic = true

            //game.levelGroup1.add(this.leftRectangle)

            this.field = game.add.sprite(0, 200, 'field')
            this.field.anchor.x = 0.5
            this.field.scale.x = 1.8
            this.field.scale.y = this.field.scale.x * 1.3
            this.field.alpha = 0

            this.animals = game.add.physicsGroup(Phaser.Physics.P2JS)

            this.createFenceArray()
            this.loadAssets()
            this.setAnimalSpawnPlace()
            this.onResize()
            this.createAnimals()
        },

        createAnimals: function () {
            if (!canCatch) {

                for (var i = 0; i < ANIMAL_COUNT; i++) {
                    var animal = this.animals.create(this.bounds3.randomX, this.bounds3.randomY, animalSprite)
                    animal.body.setCircle(GLOBAL_SCALE * 40)
                    animal.scale.set(GLOBAL_SCALE * 2)
                    animal.body.mass = 150
                    animal.body.damping = 0.999
                    animal.body.static = true
                    ANIMALS.push(animal)
                }

            } else {

                for (var i = 0; i < ANIMAL_COUNT; i++) {
                    var animal = this.animals.create(this.bounds.randomX, this.bounds.randomY, animalSprite)
                    animal.body.setCircle(GLOBAL_SCALE * 40)
                    animal.scale.set(GLOBAL_SCALE * 2)
                    animal.body.mass = 150
                    animal.body.damping = 0.999
                    ANIMALS.push(animal)
                }
            }
        },

        makeAnimalsKinematic: function () {
            for (var i = 0; i < ANIMAL_COUNT; i++) {

            }

        },

        setDynamicAnimals: function () {
            for (var i = 0; i < ANIMALS.length; i++) {
                ANIMALS[i].body.static = false
                //ANIMALS[i].body.dynamic = true
            }
        },

        createStupidAnimals: function () {
            var x, y

            if (!config.isLandscape) {
                x = game.width / 2 - GLOBAL_SCALE * 100
                y = game.world.height / 2 - game.world.height * 0.4
            } else {
                x = game.width / 2 - GLOBAL_SCALE * 100
                y = game.height / 2 / 8 - 100
            }

            this.bounds1 = new Phaser.Rectangle(
                x,
                y,
                GLOBAL_SCALE * 200,
                500 * GLOBAL_SCALE)
            this.bounds1.anchor = 0.5

            for (var i = 0; i < ANIMAL_COUNT; i++) {
                var animal = this.animals.create(this.bounds1.randomX, this.bounds1.randomY, animalSprite)
                animal.body.setCircle(GLOBAL_SCALE * 10)
                animal.scale.set(GLOBAL_SCALE * 1.5)
                animal.body.damping = 0
                animal.body.angularDamping = 0
                animal.body.static = true
                var speed = Math.floor(Math.random() * 300) + 297
                animal.body.moveForward(speed * GLOBAL_SCALE * 2.2)
                game['levelGroup' + currentLevel].add(animal)
                for (var j = 0; j < 20; j++) animal.moveDown()
                STUPID_ANIMALS.push(animal)
            }
        },

        destroyStupidAnimals: function () {
            for (var i = 0; i < STUPID_ANIMALS.length; i++) {
                STUPID_ANIMALS[i].destroy()
                STUPID_ANIMALS.shift()
            }
        },

        setAnimalSpawnPlace: function () {
            var x, x1, y, y1, height, width, height1, width1

            if (!config.isLandscape) {

                if (VARIATION_MECHANIC == "B") {
                    x = centerX - 200 * GLOBAL_SCALE / 2
                    y = centerY + centerY / 2.5
                    width = 200 * GLOBAL_SCALE
                    height = 400 * GLOBAL_SCALE
                } else {
                    x = centerX - 800 * GLOBAL_SCALE / 2
                    y = centerY + 600 * GLOBAL_SCALE
                    width = 800 * GLOBAL_SCALE
                    height = 400 * GLOBAL_SCALE
                }

                x1 = centerX - 1000 * GLOBAL_SCALE / 2
                y1 = centerY - 1600 * GLOBAL_SCALE * 2.28
                width1 = 1000 * GLOBAL_SCALE
                height1 = 300 * GLOBAL_SCALE

            } else {

                if (VARIATION_MECHANIC == "B") {
                    x = centerX - 200 * GLOBAL_SCALE / 2
                    y = centerY + centerY / 2.5
                    width = 200 * GLOBAL_SCALE
                    height = 400 * GLOBAL_SCALE
                } else {
                    x = centerX - 800 * GLOBAL_SCALE / 2
                    y = centerY
                    width = 800 * GLOBAL_SCALE
                    height = 400 * GLOBAL_SCALE
                }

                x1 = centerX - 1500 * GLOBAL_SCALE / 2
                y1 = centerY - 1600 * GLOBAL_SCALE * 2.46
                width1 = 1500 * GLOBAL_SCALE
                height1 = 150 * GLOBAL_SCALE

            }

            this.bounds = new Phaser.Rectangle(
                x,
                y,
                width,
                height)

            this.bounds3 = new Phaser.Rectangle(
                x1,
                y1,
                width1,
                height1)
        },

        makeVariations: function (VARIATION) {
            var variationLocal

            if (VARIATION != null) variationLocal = VARIATION
            else variationLocal = VARIATION_WORLD

            if (variationLocal == "A") {

                background = "greenBackground"
                backgroundLand = "greenBackgroundLand"
                house = "redHouse"
                houseBottom = "redHouseBottom"
                fence = "orangeFence"
                fenceBottom = "orangeFenceBottom"
                trees = "trees"
                obstacle = "orangeFence"
                door = "orangeFence"
                farmPanel = "woolUnitsPanel"

            } else if (variationLocal == "B") {

                background = "whiteBackground"
                backgroundLand = "whiteBackgroundLand"
                house = "whiteHouse"
                houseBottom = "whiteHouseBottom"
                fence = "whiteFence"
                fenceBottom = "whiteFenceBottom"
                trees = "whiteTrees"
                obstacle = "whiteDoorClose"
                door = "whiteDoor"
                farmPanel = "woolUnitsPanel"


            } else if (variationLocal == "C") {

                background = "yellowBackground"
                backgroundLand = "yellowBackgroundLand"
                house = "yellowHouse"
                houseBottom = "yellowHouseBottom"
                fence = "yellowFence"
                fenceBottom = "yellowFenceBottom"
                trees = "yellowTrees"
                obstacle = "whiteDoorClose"
                door = "yellowDoor"
                farmPanel = "woolUnitsPanel"
            }
        },

        loadAssets: function () {

            this.makeVariations()

            if (VARIATION_ANIMAL == "A") animalSprite = "sheep"
            else if (VARIATION_ANIMAL == "B") animalSprite = "mammoth"
            else if (VARIATION_ANIMAL == "C") animalSprite = "rabbit"
            else if (VARIATION_ANIMAL == "D") animalSprite = "lama"

            if (VARIATION_MECHANIC == "B") {
                this.bottomFarm = game.add.sprite(0, 0, houseBottom)
                this.bottomFarm.scale.set(GLOBAL_SCALE * 3)
                this.bottomFarm.anchor.set(0.5)

                this.road = game.add.sprite(0, 0, "road")
                this.road.anchor.set(0.5)
                for (var i = 0; i < 7; i++) this.road.moveDown()

                this.truck = game.add.sprite(-42, 0, "truck")
                this.truck.anchor.set(0.5)
                this.truck.scale.set(1.3)
                for (var i = 0; i < 7; i++) this.truck.moveDown()
            }


            for (var i = 0; i < 3; i++) {

                if (VARIATION_MECHANIC == "C") {
                    if (i == 0) VARIATION_TEMP = "A"
                    else if (i == 1) VARIATION_TEMP = "B"
                    else if (i == 2) VARIATION_TEMP = "C"
                    this.makeVariations(VARIATION_TEMP)
                }

                BACKGROUNDS.push(game.add.sprite(0, 0, background))
                BACKGROUNDS.push(game.add.sprite(0, 0, backgroundLand))

                if (VARIATION_WORLD == "A") {
                    var ground1 = game.add.sprite(0, 0, 'greenGround1')
                    var ground2 = game.add.sprite(0, 0, 'greenGround2')

                    game['backgroundGroup' + (i + 1)].add(ground1)
                    game['backgroundGroup' + (i + 1)].add(ground2)

                    ground1.x = FENCEDOTS_1[0].x + 65
                    ground1.y = FENCEDOTS_1[0].y + 50
                    ground1.scale.set(GLOBAL_SCALE * 1.3)

                    ground2.x = FENCEDOTS_1[5].x + 100
                    ground2.y = FENCEDOTS_1[5].y - 850
                    ground2.scale.set(GLOBAL_SCALE * 1.3)

                    GROUNDS.push(ground1)
                    GROUNDS.push(ground2)
                }


                var farm = game.add.sprite(0, 0, house)
                var field = game.add.sprite(0, 200, 'field')


                if (VARIATION_MECHANIC == "C") VARIATION_TEMP == "B"

                if ((VARIATION_WORLD == "B" || VARIATION_TEMP == "B") && VARIATION_MECHANIC != "B") {
                    var riverLeft = game.add.sprite(0, 0, 'whiteRiverLeft')
                    var riverRight = game.add.sprite(0, 0, 'whiteRiverRight')
                    riverLeft.anchor.set(1, 0.5)
                    riverLeft.scale.set(0.5)

                    riverRight.anchor.set(0, 0.5)
                    riverRight.scale.set(0.5)


                    if (VARIATION_TEMP == "B") {
                        game['levelGroup2'].add(riverLeft)
                        game['levelGroup2'].add(riverRight)
                    } else {
                        game['levelGroup' + (i + 1)].add(riverLeft)
                        game['levelGroup' + (i + 1)].add(riverRight)
                    }

                    RIVERS.push(riverLeft)
                    RIVERS.push(riverRight)
                }

                farm.scale.set(GLOBAL_SCALE)
                farm.anchor.set(0.5)

                if (VARIATION_MECHANIC != "B") {
                    for (var j = 0; j < 4; j++) {
                        if (VARIATION_WORLD == "B") FENCES_2.push(game.add.sprite(0, 0, "whiteDoorClose"))
                        else FENCES_2.push(game.add.sprite(0, 0, fence))
                    }
                    if (i > 0) {
                        FENCES_3.push(game.add.sprite(0, 0, fence))
                        FENCES_3.push(game.add.sprite(0, 0, fence))
                    }
                }

                field.anchor.x = 0.5
                field.scale.x = 1.8
                field.scale.y = field.scale.x * 1.3
                field.alpha = 0

                FARMS.push(farm)
            }


            if (VARIATION_WORLD != "B") {
                if (VARIATION_MECHANIC != "B") this.createTrees()
                else if (VARIATION_MECHANIC == "B") this.createTreesIdle()
            }

            if (VARIATION_MECHANIC == "B") {
                this.panel = game.add.sprite(0, 0, farmPanel)
                FARMS[0].addChild(this.panel)
                this.panel.anchor.set(0.5, 1)

                this.woolUnitsText = game.add.text(0, -35, '0', { align: 'center' })
                this.woolUnitsText.anchor.set(0.2, 1)
                this.woolUnitsText.font = 'Arial'
                this.woolUnitsText.fontSize = 80
                this.woolUnitsText.fill = '#e57373'
                this.panel.addChild(this.woolUnitsText)
            }
        },

        runTruck: function () {
            if (this.truckTween) {
                this.truckTween.stop()
                this.truck.x = -42
            }

            this.truckTween = game.add.tween(this.truck).to({
                x: game.width + 42
            }, trucksSpeedNumber, 'Linear', true, 1, 6)


            this.truckTween.onComplete.add(() => {
                game.uiManager.showLastScreen()
                game.world.bringToTop(game.finishGroup)
                game.uiManager.playableFinished = true
            })

        },

        createUpperBounds: function () {
            var j = 0
            var scale = GLOBAL_SCALE

            var a, b
            var X, Y
            var offsetY = - 200 * GLOBAL_SCALE
            var offsetX = 0

            for (var i = 0; i < FENCEDOTS_2.length - 1; i++) {
                if (i === 2) continue

                a = FENCEDOTS_2[i]
                b = FENCEDOTS_2[i + 1]

                var lineLength = Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2))
                var angleDeg = Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI

                var X = (a.x + b.x) / 2 * scale + centerX
                var Y = (a.y + b.y) / 2 * scale + centerY / 2

                for (var k = 0; k < 12; k += 4) {
                    if (i < 3) FENCES_2[j + k].x = X + offsetX
                    else FENCES_2[j + k].x = X - offsetX
                    FENCES_2[j + k].y = Y + offsetY
                    FENCES_2[j + k].scale.x = scale
                    FENCES_2[j + k].scale.y = scale * lineLength / 500
                    FENCES_2[j + k].anchor.set(0.5)
                    FENCES_2[j + k].angle = angleDeg - 90

                    game['levelGroup' + (k / 4 + 1)].add(FENCES_2[j + k])
                }
                j++
            }
        },

        createLowerBounds: function () {
            var n = 2

            var X, Y, X1, Y1

            if (config.isLandscape) {
                X = FENCEDOTS_1_LAND[4].x * GLOBAL_SCALE + centerX - 3
                Y = FENCEDOTS_1_LAND[4].y * GLOBAL_SCALE + centerY / 3 - 280 * GLOBAL_SCALE
                X1 = FENCEDOTS_1_LAND[5].x * GLOBAL_SCALE + centerX + 3
                Y1 = FENCEDOTS_1_LAND[5].y * GLOBAL_SCALE + centerY / 3 - 280 * GLOBAL_SCALE
            } else {
                X = FENCEDOTS_1[4].x * GLOBAL_SCALE + centerX - 3
                Y = FENCEDOTS_1[4].y * GLOBAL_SCALE + centerY / 2
                X1 = FENCEDOTS_1[5].x * GLOBAL_SCALE + centerX + 3
                Y1 = FENCEDOTS_1[5].y * GLOBAL_SCALE + centerY / 2
            }

            for (var i = 0; i < FENCES_3.length; i += 2) {
                FENCES_3[i].x = X
                FENCES_3[i].y = Y
                FENCES_3[i].anchor.set(0.3, 0)

                FENCES_3[i + 1].x = X1
                FENCES_3[i + 1].y = Y1
                FENCES_3[i + 1].angle = 180
                FENCES_3[i + 1].anchor.set(0.3, 1)

                game['levelGroup' + n].add(FENCES_3[i])
                game['levelGroup' + n].add(FENCES_3[i + 1])
                n++
            }

            for (var i = 0; i < FENCES_3.length; i++) {
                FENCES_3[i].scale.x = GLOBAL_SCALE
                if (config.isLandscape) FENCES_3[i].scale.y = GLOBAL_SCALE * 4
                else FENCES_3[i].scale.y = GLOBAL_SCALE * 2
            }
        },

        createBounds: function (fencedots) {
            this.destroyBounds()
            this.destroySpriteBounds()

            var scale = GLOBAL_SCALE

            var k = 1
            var n = 0
            var a, b
            var X, Y
            var lineLength
            var angleDeg

            sim = game.physics.p2

            for (var i = 0; i < fencedots.length - 1; i++) {

                var offsetX = 0, offsetY = 0

                a = fencedots[i]
                b = fencedots[i + k]

                X = (a.x + b.x) / 2 * scale + centerX
                Y = (a.y + b.y) / 2 * scale + centerY / 2

                lineLength = Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2)) / 3

                angleDeg = Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI - 1

                if (angleDeg > 88 && angleDeg < 133) offsetX = 20 * GLOBAL_SCALE
                else if (angleDeg < -90 && angleDeg > -134) offsetX = -20 * GLOBAL_SCALE
                else if (angleDeg == -1) offsetY = -60 * GLOBAL_SCALE

                var bound = new p2.Body({ mass: 0, position: [sim.pxmi(X + offsetX), sim.pxmi(Y + offsetY)], angle: angleDeg * Math.PI / 180 })
                bound.addShape(new p2.Plane())
                physicsBounds[i] = bound
                sim.world.addBody(bound)

                n = 0
                var arrLength = FENCES.length

                for (var j = arrLength; j < arrLength + 3; j++) {
                    n++

                    if (VARIATION_MECHANIC == "C") {
                        if (n == 1) {
                            VARIATION_TEMP = "A"
                            this.makeVariations(VARIATION_TEMP)
                        } else if (n == 2) {
                            VARIATION_TEMP = "B"
                            this.makeVariations(VARIATION_TEMP)
                        } else if (n == 3) {
                            VARIATION_TEMP = "C"
                            this.makeVariations(VARIATION_TEMP)
                        }
                    }

                    if (angleDeg == -1) FENCES.push(game.add.sprite(0, 0, fenceBottom))
                    else if (i == 2 || i == 6) FENCES.push(game.add.sprite(0, 0, door))
                    else FENCES.push(game.add.sprite(0, 0, fence))

                    FENCES[j].x = X
                    FENCES[j].y = Y
                    FENCES[j].scale.x = GLOBAL_SCALE
                    FENCES[j].scale.y = scale * lineLength / 164
                    FENCES[j].anchor.set(0.5)

                    if (i == 6 && VARIATION_WORLD != "A") FENCES[j].angle = angleDeg + 90 + 1
                    else FENCES[j].angle = angleDeg - 90 + 1

                    game['levelGroup' + n].add(FENCES[j])
                }
            }
        },

        createLandscapeBounds: function (fencedots) {
            this.destroyLandscapeBounds()
            this.destroySpriteBounds()

            var scale = GLOBAL_SCALE * 0.8
            var k = 1
            var n = 0
            var a, b
            var X, Y
            var lineLength
            var angleDeg

            sim2 = game.physics.p2

            for (var i = 0; i < fencedots.length - 1; i++) {

                var offsetX = 0, offsetY = 0

                a = fencedots[i]
                b = fencedots[i + k]

                X = (a.x + b.x) / 2 * scale + centerX
                Y = (a.y + b.y) / 2 * scale + centerY / 3 + offsetY * GLOBAL_SCALE

                lineLength = Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2)) / 3

                angleDeg = Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI - 1


                if (angleDeg > 88 && angleDeg < 133) offsetX = 25 * GLOBAL_SCALE
                else if (angleDeg < -90 && angleDeg > -134) offsetX = -25 * GLOBAL_SCALE
                else if (angleDeg == -1) offsetY = -15 * GLOBAL_SCALE
                var boundAlpha = 0

                if (i == 1) {
                    this.leftRectangle = game.add.sprite(0, 0, 'leftBound')
                    this.leftRectangle.anchor.set(0.5, 0.5)
                    this.leftRectangle.alpha = boundAlpha

                    this.leftRectangle.x = X - 4880 * GLOBAL_SCALE
                    this.leftRectangle.y = Y - 1190 * GLOBAL_SCALE
                    this.leftRectangle.scale.set(scale * 15)
                    game.physics.p2.enable(this.leftRectangle)
                    this.leftRectangle.body.setRectangleFromSprite(this.leftRectangle)
                    this.leftRectangle.body.static = true

                    this.leftCircle = game.add.sprite(0, 0, 'cursor')
                    this.leftCircle.scale.set(0.75 * GLOBAL_SCALE)
                    this.leftCircle.anchor.set(0.5)
                    this.leftCircle.alpha = boundAlpha
                    this.leftCircle.x = X + 410 * GLOBAL_SCALE
                    this.leftCircle.y = Y - 160 * GLOBAL_SCALE
                    game.physics.p2.enable(this.leftCircle)
                    this.leftCircle.body.setCircle(this.leftCircle.scale.x * 240)
                    this.leftCircle.body.static = true

                } else if (i == 7) {
                    this.rightRectangle = game.add.sprite(0, 0, 'rightBound')
                    this.rightRectangle.anchor.set(0.5, 0.5)
                    this.rightRectangle.alpha = boundAlpha

                    this.rightRectangle.x = X + 4880 * GLOBAL_SCALE
                    this.rightRectangle.y = Y - 1190 * GLOBAL_SCALE
                    this.rightRectangle.scale.set(scale * 15)
                    game.physics.p2.enable(this.rightRectangle)
                    this.rightRectangle.body.setRectangleFromSprite(this.rightRectangle)
                    this.rightRectangle.body.static = true

                    this.rightCircle = game.add.sprite(0, 0, 'cursor')
                    this.rightCircle.scale.set(0.75 * GLOBAL_SCALE)
                    this.rightCircle.anchor.set(0.5)
                    this.rightCircle.alpha = boundAlpha
                    this.rightCircle.x = X - 410 * GLOBAL_SCALE
                    this.rightCircle.y = Y - 160 * GLOBAL_SCALE
                    game.physics.p2.enable(this.rightCircle)
                    this.rightCircle.body.setCircle(this.rightCircle.scale.x * 240)
                    this.rightCircle.body.static = true

                } else if (i > 1 && i < 7) {
                    var bound = new p2.Body({ mass: 0, position: [sim2.pxmi(X + offsetX), sim2.pxmi(Y + offsetY)], angle: angleDeg * Math.PI / 180 })
                    bound.addShape(new p2.Plane())
                    physicsBounds2[i - 2] = bound
                    sim2.world.addBody(bound)
                }

                n = 0
                var arrLength = FENCES.length

                for (var j = arrLength; j < arrLength + 3; j++) {
                    n++

                    if (VARIATION_MECHANIC == "C") {
                        if (n == 1) {
                            VARIATION_TEMP = "A"
                            this.makeVariations(VARIATION_TEMP)
                        } else if (n == 2) {
                            VARIATION_TEMP = "B"
                            this.makeVariations(VARIATION_TEMP)
                        } else if (n == 3) {
                            VARIATION_TEMP = "C"
                            this.makeVariations(VARIATION_TEMP)
                        }
                    }

                    if (i == 4 && (n == 2 || n == 3)) continue
                    else if (angleDeg == -90) FENCES.push(game.add.sprite(0, 0, fenceBottom))
                    else FENCES.push(game.add.sprite(0, 0, fence))

                    FENCES[j].x = X

                    FENCES[j].y = Y
                    FENCES[j].scale.x = GLOBAL_SCALE * 0.8
                    FENCES[j].scale.y = scale * lineLength / 164
                    FENCES[j].anchor.set(0.5)
                    FENCES[j].angle = angleDeg - 90 + 1

                    game['levelGroup' + n].add(FENCES[j])
                }
            }
        },

        createInsideBounds: function () {
            for (var i = 0; i < OBSTACLE_1.length; i++)
                OBSTACLE_1[i].destroy()

            OBSTACLE_1 = []

            for (var i = 0; i < 6; i++) {
                var k = 1
                var scale = GLOBAL_SCALE
                var offsetY = GLOBAL_SCALE * 1000
                var lineScaler = 0

                if (config.isLandscape) {
                    offsetY = GLOBAL_SCALE * 400
                    scale = GLOBAL_SCALE * 0.7
                }

                if (i == 5) k = -5
                var length = Math.sqrt(Math.pow(OBSTACLEDOTS[i].x - OBSTACLEDOTS[i + k].x, 2) + Math.pow(OBSTACLEDOTS[i].y - OBSTACLEDOTS[i + k].y, 2)) / 3

                var fenceX = ((OBSTACLEDOTS[i].x) + (OBSTACLEDOTS[i + k].x)) / 2 * scale + centerX
                var fenceY = (OBSTACLEDOTS[i].y + OBSTACLEDOTS[i + k].y) / 2 * scale + centerY / 2

                var angleDeg = Math.atan2(OBSTACLEDOTS[i + k].y - OBSTACLEDOTS[i].y, OBSTACLEDOTS[i + k].x - OBSTACLEDOTS[i].x) * 180 / Math.PI - 90

                OBSTACLE_1.push(game.add.sprite(0, 0, obstacle))
                OBSTACLE_1[i].anchor.set(0.5)
                OBSTACLE_1[i].scale.x = scale * 0.9
                OBSTACLE_1[i].scale.y = length * scale * 0.006
                OBSTACLE_1[i].x = fenceX
                OBSTACLE_1[i].y = fenceY + offsetY
                OBSTACLE_1[i].angle = angleDeg
                game.levelGroup2.add(OBSTACLE_1[i])
            }

            if (this.rectangle) this.rectangle.destroy()
            this.rectangle = game.add.sprite(0, 0, 'obstacleRect')
            this.rectangle.anchor.set(0.5, 0.5)
            this.rectangle.alpha = 0
            this.rectangle.scale.y = scale
            this.rectangle.scale.x = scale * 2.6

            this.rectangle.x = (OBSTACLEDOTS[1].x + OBSTACLEDOTS[5].x) / 2 * scale + centerX
            this.rectangle.y = (OBSTACLEDOTS[0].y + OBSTACLEDOTS[3].y) / 2 * scale + centerY / 2 + offsetY
            game.levelGroup2.add(this.rectangle)


            if (this.cubeUp) this.cubeUp.destroy()
            this.cubeUp = game.add.sprite(0, 0, 'obstacleCube')
            this.cubeUp.anchor.set(0.5, 0.5)
            this.cubeUp.alpha = 0
            this.cubeUp.scale.set(scale * 1.9)

            this.cubeUp.x = OBSTACLEDOTS[0].x * scale + centerX
            this.cubeUp.y = this.rectangle.y - this.rectangle.width
            game.levelGroup2.add(this.cubeUp)

            if (this.cubeDown) this.cubeDown.destroy()
            this.cubeDown = game.add.sprite(0, 0, 'obstacleCube')
            this.cubeDown.anchor.set(0.5, 0.5)
            this.cubeDown.alpha = 0
            this.cubeDown.scale.set(scale * 1.9)

            this.cubeDown.x = OBSTACLEDOTS[3].x * scale + centerX
            this.cubeDown.y = this.rectangle.y + this.rectangle.width
            game.levelGroup2.add(this.cubeDown)
        },

        createObstacleBounds: function () {

            game.physics.p2.enable(this.rectangle)
            this.rectangle.body.setRectangleFromSprite(this.rectangle)
            this.rectangle.body.static = true

            game.physics.p2.enable(this.cubeUp)
            this.cubeUp.body.setRectangleFromSprite(this.cubeUp)
            this.cubeUp.body.static = true
            this.cubeUp.body.angle = 45

            game.physics.p2.enable(this.cubeDown)
            this.cubeDown.body.setRectangleFromSprite(this.cubeDown)
            this.cubeDown.body.static = true
            this.cubeDown.body.angle = 45
        },

        destroyObstacleBounds: function () {
            this.cubeUp.destroy()
            this.cubeDown.destroy()
            this.rectangle.destroy()
        },

        setBounds: function () {
            if (!config.isLandscape) {
                this.destroyLandscapeBounds()
                this.destroyBounds()
                this.createBounds(FENCEDOTS_1)
            } else {
                this.destroyBounds()
                //this.destroyLandscapeBounds()
                this.createLandscapeBounds(FENCEDOTS_1_LAND)
            }
        },

        destroyBounds: function () {
            try {
                for (var i = 0; i < physicsBounds.length; i++) sim.world.removeBody(physicsBounds[i])
            } catch (Exception) { }
        },

        destroyLandscapeBounds: function () {
            try {
                this.leftRectangle.destroy()
                this.rightRectangle.destroy()
                this.leftCircle.destroy()
                this.rightCircle.destroy()
                for (var i = 0; i < physicsBounds2.length; i++) sim2.world.removeBody(physicsBounds2[i])
            } catch (Exception) { }

        },

        destroySpriteBounds: function () {
            for (var i = 0; i < FENCES.length; i++) {
                FENCES[i].destroy()
            }
        },

        createTrees: function () {
            var offsetY = 0
            var maxTrees = 21
            var maxLandTrees = 21

            if (VARIATION_MECHANIC == "C") {
                offsetY = -20 / GLOBAL_SCALE
                maxTrees = 15
                maxLandTrees = 15
            }

            var treeY = -GLOBAL_SCALE * 600 + offsetY

            for (var j = 0; j < maxTrees; j++) {

                if (j < maxTrees / 3) {

                    if (VARIATION_MECHANIC == "C") VARIATION_TEMP = "A"
                    this.makeVariations(VARIATION_TEMP)

                } else if (j < maxTrees - maxTrees / 3) {

                    if (VARIATION_MECHANIC == "C") VARIATION_TEMP = "B"
                    this.makeVariations(VARIATION_TEMP)

                } else {

                    if (VARIATION_MECHANIC == "C") VARIATION_TEMP = "C"
                    this.makeVariations(VARIATION_TEMP)
                }

                TREES_1.push(game.add.sprite(0, 0, trees))
                var randX = Math.floor(Math.random() * 110) * GLOBAL_SCALE
                TREES_1[j].x = randX - 260 * GLOBAL_SCALE
                TREES_1[j].y = treeY += GLOBAL_SCALE * 200
                TREES_1[j].scale.set(GLOBAL_SCALE * 0.9)


                TREES_2.push(game.add.sprite(0, 0, trees))
                var randX = Math.floor(Math.random() * 110) * GLOBAL_SCALE
                TREES_2[j].x = randX + game.width / 2 + 80
                TREES_2[j].y = treeY
                TREES_2[j].scale.set(GLOBAL_SCALE * 0.9)

                if (j < maxTrees / 3) {
                    game.levelGroup1.add(TREES_2[j])
                    game.levelGroup1.add(TREES_1[j])
                }
                else if (j < maxTrees - maxTrees / 3) {
                    game.levelGroup2.add(TREES_2[j])
                    game.levelGroup2.add(TREES_1[j])
                }
                else {
                    game.levelGroup3.add(TREES_2[j])
                    game.levelGroup3.add(TREES_1[j])
                }

                if (j === maxTrees / 3 - 1 || j === maxTrees - maxTrees / 3 - 1) {
                    var treeY = -GLOBAL_SCALE * 500 + offsetY
                }
            }


            //landscape trees

            var offsetY = 0
            var offsetX


            if (VARIATION_MECHANIC == "C") {
                offsetY = 100
            }

            treeY = -680 * GLOBAL_SCALE + offsetY * GLOBAL_SCALE

            offsetX = 350 * GLOBAL_SCALE

            for (var j = 0; j < maxLandTrees; j++) {

                if (j < maxLandTrees / 3) {

                    if (VARIATION_MECHANIC == "C") VARIATION_TEMP = "A"
                    this.makeVariations(VARIATION_TEMP)

                } else if (j < maxLandTrees - maxLandTrees / 3) {

                    if (VARIATION_MECHANIC == "C") VARIATION_TEMP = "B"
                    this.makeVariations(VARIATION_TEMP)

                } else {

                    if (VARIATION_MECHANIC == "C") VARIATION_TEMP = "C"
                    this.makeVariations(VARIATION_TEMP)
                }

                TREES_1_LAND.push(game.add.sprite(0, 0, trees))
                var randX = Math.floor(Math.random() * 110)
                TREES_1_LAND[j].x = randX * GLOBAL_SCALE - 200 * GLOBAL_SCALE
                TREES_1_LAND[j].y = treeY += 90 * GLOBAL_SCALE
                TREES_1_LAND[j].scale.set(GLOBAL_SCALE * 0.6)

                TREES_3_LAND.push(game.add.sprite(0, 0, trees))
                var randX = Math.floor(Math.random() * 110)
                TREES_3_LAND[j].x = randX * GLOBAL_SCALE - 80 * GLOBAL_SCALE + offsetX
                TREES_3_LAND[j].y = treeY
                TREES_3_LAND[j].scale.set(GLOBAL_SCALE * 0.6)


                TREES_2_LAND.push(game.add.sprite(0, 0, trees))
                var randX = Math.floor(Math.random() * 110)
                TREES_2_LAND[j].x = randX * GLOBAL_SCALE + game.width * 0.75 + 80
                TREES_2_LAND[j].y = treeY
                TREES_2_LAND[j].scale.set(GLOBAL_SCALE * 0.6)

                TREES_4_LAND.push(game.add.sprite(0, 0, trees))
                var randX = Math.floor(Math.random() * 110)
                TREES_4_LAND[j].x = randX * GLOBAL_SCALE + game.width * 0.75 + 80 - offsetX
                TREES_4_LAND[j].y = treeY
                TREES_4_LAND[j].scale.set(GLOBAL_SCALE * 0.6)


                if (j < maxLandTrees / 3) {
                    game.levelGroup1.add(TREES_1_LAND[j])
                    game.levelGroup1.add(TREES_2_LAND[j])
                    game.levelGroup1.add(TREES_3_LAND[j])
                    game.levelGroup1.add(TREES_4_LAND[j])
                }
                else if (j < maxLandTrees - maxLandTrees / 3) {
                    game.levelGroup2.add(TREES_1_LAND[j])
                    game.levelGroup2.add(TREES_2_LAND[j])
                    game.levelGroup2.add(TREES_3_LAND[j])
                    game.levelGroup2.add(TREES_4_LAND[j])
                }
                else {
                    game.levelGroup3.add(TREES_1_LAND[j])
                    game.levelGroup3.add(TREES_2_LAND[j])
                    game.levelGroup3.add(TREES_3_LAND[j])
                    game.levelGroup3.add(TREES_4_LAND[j])
                }

                if (j === maxLandTrees / 3 - 1 || j === maxLandTrees - maxLandTrees / 3 - 1) {
                    treeY = -680 * GLOBAL_SCALE + offsetY * GLOBAL_SCALE
                }
            }

            var treeX = -200 * GLOBAL_SCALE

            for (var j = 0; j < 15; j++) {
                if (VARIATION_MECHANIC == "C") VARIATION_TEMP = "A"
                this.makeVariations(VARIATION_TEMP)

                TREES_3.push(game.add.sprite(0, 0, trees))

                var randX = Math.floor(Math.random() * 50)

                TREES_3[j].x = -randX * GLOBAL_SCALE + treeX
                TREES_3[j].y = game.world.height * 0.84

                game.levelGroup1.add(TREES_3[j])
                treeX += GLOBAL_SCALE * 500
            }
        },

        createTreesIdle: function () {

            for (var i = 0; i < 2; i++) {
                TREES_1.push(game.add.sprite(-50, 110, trees))
                TREES_1[i].scale.set(GLOBAL_SCALE)
                TREES_1[i].anchor.set(0, 0.5)
            }

            for (var i = 0; i < 2; i++) {
                TREES_2.push(game.add.sprite(game.width + 50, 110, trees))
                TREES_2[i].scale.set(GLOBAL_SCALE)
                TREES_2[i].anchor.set(1, 0.5)
            }
        },

        repositionTreesIdle: function () {
            var offsetX = 0


            if (config.isLandscape) offsetX = 230 * GLOBAL_SCALE


            for (var i = 0; i < TREES_1.length; i++) {
                TREES_1[i].x = -60 + i * offsetX
                TREES_1[i].y = FENCEDOTS_1[0].y * GLOBAL_SCALE + centerY / 2 - 300 * GLOBAL_SCALE
                TREES_1[i].scale.set(GLOBAL_SCALE)
            }

            for (var i = 0; i < TREES_1.length; i++) {
                TREES_2[i].x = game.width + 60 - i * offsetX
                TREES_2[i].y = FENCEDOTS_1[0].y * GLOBAL_SCALE + centerY / 2 - 300 * GLOBAL_SCALE
                TREES_2[i].scale.set(GLOBAL_SCALE)
            }
        },

        repositionTrees: function () {
            var offsetY = 0
            var interval = 240 * GLOBAL_SCALE
            var maxTrees = 21
            var maxLandTrees = 21


            if (VARIATION_MECHANIC == "C") {
                offsetY = 780 * GLOBAL_SCALE
                interval = 180 * GLOBAL_SCALE
                maxTrees = 15
            }

            var treeY = -GLOBAL_SCALE * 1300 + offsetY

            for (var i = 0; i < TREES_2.length; i++) {
                var randX = Math.floor(Math.random() * 110) * GLOBAL_SCALE

                TREES_2[i].x = randX + game.width + 165 * GLOBAL_SCALE
                TREES_1[i].y = treeY += interval
                TREES_2[i].anchor.setTo(1, 0)

                TREES_1[i].scale.set(GLOBAL_SCALE * 0.9)
                TREES_2[i].y = treeY
                TREES_2[i].scale.set(GLOBAL_SCALE * 0.9)

                if (i === maxTrees / 3 - 1 || i === maxTrees - maxTrees / 3 - 1) {
                    var treeY = -GLOBAL_SCALE * 1300 + offsetY
                }
            }

            var offsetX = 400 * GLOBAL_SCALE
            treeY = -1700 * GLOBAL_SCALE + offsetY

            for (var i = 0; i < maxTrees; i++) {
                var randX = Math.floor(Math.random() * 110) * GLOBAL_SCALE

                TREES_1_LAND[i].y = treeY += interval

                TREES_3_LAND[i].x = randX - 80 * GLOBAL_SCALE + offsetX
                TREES_3_LAND[i].y = treeY

                TREES_2_LAND[i].x = randX + game.width + 40
                TREES_2_LAND[i].y = treeY
                TREES_2_LAND[i].anchor.setTo(1, 0)

                TREES_4_LAND[i].x = randX + game.width - offsetX
                TREES_4_LAND[i].y = treeY
                TREES_4_LAND[i].anchor.setTo(1, 0)

                TREES_1_LAND[i].scale.set(GLOBAL_SCALE * 0.8)
                TREES_2_LAND[i].scale.set(GLOBAL_SCALE * 0.8)
                TREES_3_LAND[i].scale.set(GLOBAL_SCALE * 0.8)
                TREES_4_LAND[i].scale.set(GLOBAL_SCALE * 0.8)

                if (i === maxLandTrees / 3 - 1 || i === maxLandTrees - maxLandTrees / 3 - 1) {
                    if (VARIATION_MECHANIC == "C") offsetY = offsetY * GLOBAL_SCALE
                    treeY = -1700 * GLOBAL_SCALE + offsetY
                }
            }

            if (config.isLandscape) {
                for (var i = 0; i < TREES_1.length; i++) {
                    TREES_1[i].alpha = 0
                    TREES_2[i].alpha = 0
                }
                for (var i = 0; i < TREES_1_LAND.length; i++) {
                    TREES_1_LAND[i].alpha = 1
                    TREES_2_LAND[i].alpha = 1
                    TREES_3_LAND[i].alpha = 1
                    TREES_4_LAND[i].alpha = 1
                }
            } else {
                for (var i = 0; i < TREES_1_LAND.length; i++) {
                    TREES_1_LAND[i].alpha = 0
                    TREES_2_LAND[i].alpha = 0
                    TREES_3_LAND[i].alpha = 0
                    TREES_4_LAND[i].alpha = 0
                }
                for (var i = 0; i < TREES_1.length; i++) {
                    TREES_1[i].alpha = 1
                    TREES_2[i].alpha = 1
                }
            }

            var treeX = -200 * GLOBAL_SCALE

            for (var j = 0; j < 15; j++) {

                if (VARIATION_MECHANIC == "C") VARIATION_TEMP = "A"
                var randX = Math.floor(Math.random() * 50)
                TREES_3[j].x = -randX * GLOBAL_SCALE + treeX

                if (config.isLandscape) {
                    TREES_3[j].y = game.world.height * 0.82
                    TREES_3[j].scale.set(GLOBAL_SCALE * 0.7)
                    treeX += GLOBAL_SCALE * 400
                }
                else {
                    TREES_3[j].y = game.world.height * 0.84
                    TREES_3[j].scale.set(GLOBAL_SCALE)
                    treeX += GLOBAL_SCALE * 500
                }
            }
        },

        resizeAnimals: function () {
            for (var i = 0; i < ANIMALS.length; i++) {
                ANIMALS[i].body.setCircle(GLOBAL_SCALE * 40)
                ANIMALS[i].scale.set(GLOBAL_SCALE * 2)
            }
        },

        onResize: function () {

            centerX = game.width / 2
            centerY = game.height / 2

            this.setAnimalSpawnPlace()

            for (var i = 0; i < BACKGROUNDS.length; i += 2) {

                if (config.isLandscape) {
                    BACKGROUNDS[i + 1].alpha = 1
                    BACKGROUNDS[i].alpha = 0

                    BACKGROUNDS[i + 1].scale.y = (GLOBAL_SCALE * 4.25)
                    BACKGROUNDS[i + 1].anchor.set(0.5)
                    BACKGROUNDS[i + 1].width = game.width
                    BACKGROUNDS[i + 1].x = game.world.width / 2
                    BACKGROUNDS[i + 1].y = game.world.height / 2

                } else {
                    BACKGROUNDS[i + 1].alpha = 0
                    BACKGROUNDS[i].alpha = 1

                    BACKGROUNDS[i].scale.set(GLOBAL_SCALE * 1.88)
                    BACKGROUNDS[i].anchor.set(0.5)
                    BACKGROUNDS[i].width = game.width
                    BACKGROUNDS[i].x = game.world.width / 2
                    BACKGROUNDS[i].y = game.world.height / 2
                }
            }

            this.setBounds()
            this.createInsideBounds()
            if (currentLevel == 2) this.createObstacleBounds()

            for (var i = 0; i < 3; i++) {
                if (config.isLandscape) {
                    FARMS[i].x = game.width / 2
                    FARMS[i].y = FENCEDOTS_1[0].y + centerY / 3 - 230
                    FARMS[i].y = FENCEDOTS_1[0].y * GLOBAL_SCALE + centerY / 3 - 300 * GLOBAL_SCALE
                    FARMS[i].scale.set(GLOBAL_SCALE * 0.85)
                } else {
                    FARMS[i].x = game.width / 2
                    FARMS[i].y = FENCEDOTS_1[0].y * GLOBAL_SCALE + centerY / 2 - 350 * GLOBAL_SCALE
                    FARMS[i].scale.set(GLOBAL_SCALE)
                }
            }

            for (var i = 0; i < RIVERS.length / 2; i += 2) {
                if (config.isLandscape) {
                    RIVERS[i].x = game.width / 2 - 80
                    RIVERS[i].y = FENCEDOTS_1[0].y + centerY / 3 - 270
                    RIVERS[i + 1].x = game.width / 2 + 120
                    RIVERS[i + 1].y = FENCEDOTS_1[0].y + centerY / 3 - 270

                } else {
                    RIVERS[i].x = game.width / 2 - 80
                    RIVERS[i].y = FENCEDOTS_1[0].y + centerY / 3 - 200
                    RIVERS[i + 1].x = game.width / 2 + 80
                    RIVERS[i + 1].y = FENCEDOTS_1[0].y + centerY / 3 - 200
                }
            }

            if (this.puddle) this.puddle.destroy()
            this.puddle = game.add.sprite(game.width / 2, game.height / 2, 'puddle')
            this.puddle.x = game.width / 2
            config.isLandscape ? this.puddle.y = FENCEDOTS_1[1].y * GLOBAL_SCALE + centerY / 3 - 150 * GLOBAL_SCALE : this.puddle.y = FENCEDOTS_1[2].y * GLOBAL_SCALE + centerY / 3

            this.puddle.anchor.set(0.5)
            this.puddle.scale.set(GLOBAL_SCALE * 3)

            game.levelGroup3.add(this.puddle)

            if (currentLevel == 3) {
                game.physics.p2.enable(game.worldManager.puddle)
                game.worldManager.puddle.body.kinematic = true
            }

            if (VARIATION_WORLD != "B") {
                if (VARIATION_MECHANIC != "B") {
                    this.repositionTrees()
                } else if (VARIATION_MECHANIC == "B") {
                    this.repositionTreesIdle()
                }
            }

            if (VARIATION_MECHANIC == "A" || VARIATION_MECHANIC == "C") {

                this.createUpperBounds()
                this.createLowerBounds()

            } else if (VARIATION_MECHANIC == "B") {

                if (!config.isLandscape) {
                    var x = (FENCEDOTS_1[4].x + FENCEDOTS_1[5].x) / 2 * GLOBAL_SCALE + centerX
                    var y = FENCEDOTS_1[4].y * GLOBAL_SCALE + centerY / 2
                } else {
                    var x = (FENCEDOTS_1_LAND[4].x + FENCEDOTS_1_LAND[5].x) / 2 * GLOBAL_SCALE + centerX
                    var y = FENCEDOTS_1_LAND[4].y * GLOBAL_SCALE + centerY / 2 - 350 * GLOBAL_SCALE
                }

                this.bottomFarm.x = x
                this.bottomFarm.y = y
                this.bottomFarm.scale.set(GLOBAL_SCALE * 2.5)

                this.road.x = game.world.centerX
                this.road.y = FENCEDOTS_1[0].y * GLOBAL_SCALE + centerY / 2 - 500 * GLOBAL_SCALE
                this.road.width = game.width
                this.road.scale.set(GLOBAL_SCALE * 2.3)

                this.runTruck()

                this.truck.y = FENCEDOTS_1[0].y * GLOBAL_SCALE + centerY / 2 - 600 * GLOBAL_SCALE
                this.truck.scale.set(GLOBAL_SCALE * 3)
            }

            var mult = config.isLandscape ? -70 : 200
            this.farmX = (FENCEDOTS_1[0].x + FENCEDOTS_1[FENCEDOTS_1.length - 1].x) / 2 * GLOBAL_SCALE + centerX
            this.farmY = (FENCEDOTS_1[0].y + FENCEDOTS_1[FENCEDOTS_1.length - 1].y) / 2 * GLOBAL_SCALE + centerY / 3 + mult * GLOBAL_SCALE

            for (var i = 0; i < GROUNDS.length; i += 2) {
                GROUNDS[i].scale.set(GLOBAL_SCALE)
                GROUNDS[i + 1].scale.set(GLOBAL_SCALE)

                GROUNDS[i].x = FARMS[i / 2].x - 950 * GLOBAL_SCALE
                GROUNDS[i].y = FARMS[i / 2].y - 50 * GLOBAL_SCALE

                GROUNDS[i + 1].x = FARMS[i / 2].x
                GROUNDS[i + 1].y = FARMS[i / 2].y + 2200 * GLOBAL_SCALE
            }

            if (!config.isLandscape) {
                catchPoint = FENCEDOTS_1[0].y * GLOBAL_SCALE + centerY / 2
            } else {
                catchPoint = FENCEDOTS_1[0].y * GLOBAL_SCALE + centerY / 2 - 110 * GLOBAL_SCALE
            }

            this.resizeAnimals()
        },
    }

    manager.init();
    return manager;
})


var LevelManager = (function () {
    "use strict";

    function getRoundedSprite(bound, color) {
        var grph_background = game.add.graphics(0, 0);
        grph_background.beginFill(color);
        grph_background.drawRoundedRect(0, 0, bound.width, bound.height, bound.radius);
        var sprite = game.add.sprite(bound.x, bound.y, grph_background.generateTexture());
        grph_background.destroy()
        return sprite
    }

    var manager = {
        init: function () {

            game.backgroundGroup1.add(BACKGROUNDS[0])
            game.backgroundGroup2.add(BACKGROUNDS[2])
            game.backgroundGroup3.add(BACKGROUNDS[4])
            game.backgroundGroup1L.add(BACKGROUNDS[1])
            game.backgroundGroup2L.add(BACKGROUNDS[3])
            game.backgroundGroup3L.add(BACKGROUNDS[5])

            game.levelGroup1.add(FARMS[0])
            game.levelGroup2.add(FARMS[1])
            game.levelGroup3.add(FARMS[2])

            if (GROUNDS.length != 0) {
                game.backgroundGroup1.bringToTop(GROUNDS[0])
                game.backgroundGroup1.bringToTop(GROUNDS[1])
                if (VARIATION_MECHANIC != "C") {
                    game.backgroundGroup2.bringToTop(GROUNDS[2])
                    game.backgroundGroup2.bringToTop(GROUNDS[3])
                    game.backgroundGroup3.bringToTop(GROUNDS[4])
                    game.backgroundGroup3.bringToTop(GROUNDS[5])
                }
            }

            this.showLevelBanner()
            this.onResize()
        },

        createLevelBanner() {

            if (this.greenLevelBanner) this.greenLevelBanner.destroy();

            var height
            config.isLandscape ? height = game.height / 3.5 : height = game.height / 8

            //----start level banner
            this.greenLevelBanner = getRoundedSprite({
                x: -game.width,
                y: game.height / 2,
                width: game.width,
                height: height,
                radius: 1
            }, 0x00E676)
            this.greenLevelBanner.anchor.set(0.5)

            this.greenBannerText = game.add.text(0, 0, 'Level ' + currentLevel + '\n' + currentLevel + '/3', { align: 'center' })
            this.greenBannerText.anchor.set(0.5)
            this.greenBannerText.font = 'Arial'
            this.greenBannerText.fontSize = height / 3.5
            this.greenBannerText.fill = '#ffffff'
            this.greenBannerText.setText('Level ' + currentLevel + '\n' + currentLevel + '/3')
            this.greenLevelBanner.addChild(this.greenBannerText)
        },

        bannerShows: 0,
        bannerIsShowing: false,

        showLevelBanner: function () {
            this.createLevelBanner()
            this.bannerShows++

            if (!this.bannerIsShowing) {
                this.bannerIsShowing = true

                this.bannerTween = game.add.tween(this.greenLevelBanner).to({
                    x: game.width / 2
                }, 500, "Linear", true, 600).onComplete.add(() => {
                    this.bannerTween = game.add.tween(this.greenLevelBanner).to({
                        x: game.width + this.greenLevelBanner.width / 2
                    }, 500, "Linear", true, 1200).onComplete.add(() => {
                        this.greenLevelBanner.destroy()
                        this.bannerIsShowing = false
                    })
                }, this)
            } else {
                this.greenLevelBanner.x = game.width / 2
                this.greenLevelBanner.y = game.height / 2

                this.bannerTween = game.add.tween(this.greenLevelBanner).to({
                    x: game.width + this.greenLevelBanner.width / 2
                }, 500, "Linear", true, 1200).onComplete.add(() => {
                    this.greenLevelBanner.destroy()
                    this.bannerIsShowing = false
                })
            }
        },

        kostil: 0,

        onResize: function () {



            if (currentLevel > this.bannerShows) {
                this.greenLevelBanner.destroy()
                this.showLevelBanner()
            }

            if (this.bannerIsShowing && this.kostil > 1) {
                this.greenLevelBanner.destroy()
                this.showLevelBanner()
            }

            this.kostil++

            var mult = GLOBAL_SCALE * 2.7
            var mult2 = GLOBAL_SCALE * 5.4

            if (currentLevel == 1) {

                game.levelGroup1.y = 0
                game.levelGroup2.y = -1600 * mult
                game.levelGroup3.y = -1600 * mult2

                game.backgroundGroup1.y = 0
                game.backgroundGroup2.y = -1600 * mult
                game.backgroundGroup3.y = -1600 * mult2

                game.backgroundGroup1L.y = 0
                game.backgroundGroup2L.y = -1600 * mult
                game.backgroundGroup3L.y = -1600 * mult2

            } else if (currentLevel == 2) {

                game.levelGroup1.y = 1600 * mult
                game.levelGroup2.y = 0
                game.levelGroup3.y = -1600 * mult

                game.backgroundGroup1.y = 1600 * mult
                game.backgroundGroup2.y = 0
                game.backgroundGroup3.y = -1600 * mult

                game.backgroundGroup1L.y = 1600 * mult
                game.backgroundGroup2L.y = 0
                game.backgroundGroup3L.y = -1600 * mult

            } else if (currentLevel == 3) {

                game.levelGroup1.y = 1600 * mult2
                game.levelGroup2.y = 1600 * mult
                game.levelGroup3.y = 0

                game.backgroundGroup1.y = 1600 * mult2
                game.backgroundGroup2.y = 1600 * mult
                game.backgroundGroup3.y = 0

                game.backgroundGroup1L.y = 1600 * mult2
                game.backgroundGroup2L.y = 1600 * mult
                game.backgroundGroup3L.y = 0
            }

            mediumCursorSize = 400 * GLOBAL_SCALE
            smallCursorSize = 30 * GLOBAL_SCALE

            distance = 350
            speed = 50 * GLOBAL_SCALE
            fastSpeed = 200 * GLOBAL_SCALE
            config.isLandscape ? farmDistance = 280 * GLOBAL_SCALE : farmDistance = 800 * GLOBAL_SCALE
            cursorDistance = 800 * GLOBAL_SCALE
            transparancyDistance = 200 * GLOBAL_SCALE
            animalAcceleration = 16000 * GLOBAL_SCALE
            //animalAccelerationLand = 16000 * GLOBAL_SCALE

        }
    }
    manager.init()
    return manager
})


var Boot = (function () {
    "use strict";
    var state = function () {

    };
    state.prototype = {
        init: function () {
            this.isInited = false
            this.stage.backgroundColor = "#322c35";
            game.utils = utils;
            window.utils = utils;
            window.PL = utils.PL;
            this.scale.pageAlignVertically = true;
            this.scale.pageAlignHorizontally = true;
            game.c = config;
            game.utils.findIndexPolyfill();
            config = utils.mixin(config, GPP_OPTION);
            game.mainGroup = this.game.add.group();
            game.resizeManager = ResizeManager();
            ExchangeManager.initializeNetworkRules()
            utils.log(ADD_VERSION)

            console.log("World variation - " + VARIATION_WORLD)
            console.log("Animal variation - " + VARIATION_ANIMAL)
            console.log("Mechanic variation - " + VARIATION_MECHANIC)

            var widthScreen = window.screen.availWidth
            var heightScreen = window.screen.availHeight

            if (config.isLandscape) {
                widthScreen = window.screen.availHeight
                heightScreen = window.screen.availWidth
            }

        },
        preload: function () {
            // body...
        },
        render: function () {
            this.state.start("Preloader")
        }
    }
    return state
})();


var cursor
var cursors
var mediumCursorSize = 0
var smallCursorSize = 0

var fenceBounds
var allInHouse = false
var canCatch = true
var level2BodyDestroyed = false
var worldInterval
var currentLevel = 1

var distance = 350
var distancePointer = 0
var speed = 0
var fastSpeed = 0
var farmDistance = 0
var cursorDistance = 0
var transparancyDistance = 0
var animalAcceleration = 0
var animalAccelerationLand = 0

var levelY = 0

var money = 0
var maxMoney = 5000

var upgradeCostArray = [50, 100, 200, 300, 500, 800, 1300, 2100, 3400, 5000]
var spawnRateCostIndex = 0
var woolValueCostIndex = 0
var woolQuantityCostIndex = 0
var bigSheepCostIndex = 0
var trucksSpeedCostIndex = 0

var spawnRateNumber = 50
var woolValueNumber = 10
var woolQuantityNumber = 25
var bigSheepNumber = 0.7
var trucksSpeedNumber = 5000
var woolUnits = 0
var woolOnTruck = 0

var canCollectMoney = true
var canCollectWool = true

var stop = false
var radius = 0
var angleDeg = 0
var canCollide = true
var xRing = 0
var yRing = 0
var xCenter = 0
var yCenter = 0
var angleRad = 0

var stepCounter = 0


var Game = (function () {
    "use strict";
    var state = function () {

    };
    state.prototype = {
        init: function () {
            this.isInited = false;
            (config.mainState = this).stage.backgroundColor = "#1F1F1F";
            game.input.maxPointers = 1;
        },
        preload: function () {
            // body...
        },

        create: function () {
            centerX = game.width / 2
            centerY = game.height / 2

            if (config.isLandscape) {
                absoluteHeight = game.width
                absoluteWidth = game.height
            } else {
                absoluteHeight = game.height
                absoluteWidth = game.width
            }

            game.physics.startSystem(Phaser.Physics.P2JS);

            game.mainGroup = game.add.group()
            game.worldManager = WorldManager()
            game.uiManager = UiManager()
            game.levelManager = LevelManager()
            game.isInputAllowed = false
            config.isDebug && (game.time.advancedTiming = true)
            game.isInited = true
            ExchangeManager.initializeNetworkRulesOnCreate()
            game.resizeManager.forceResize()
        },


        update: function () {
            this.moveCursor()
            this.catchAnimals()

            if (allInHouse) {

                if (VARIATION_MECHANIC != "B") {
                    game.uiManager.setZeroProgress()
                    game.worldManager.destroyBounds()
                    this.animalRush()

                    game.time.events.add(2000, () => {
                        this.moveToNextLevel()
                        game.worldManager.createAnimals()
                    }, this);

                } else if (VARIATION_MECHANIC == "B") {
                    canCatch = true
                    game.worldManager.createAnimals()
                    bigSheepCostIndex = 0
                    bigSheepNumber = GLOBAL_SCALE * 2
                }
                allInHouse = false
            }

            if (VARIATION_MECHANIC == "B") this.checkTruckPosition()


            //----goes to the next level----

            if (!canCatch && VARIATION_MECHANIC != "B") {

                if (currentLevel == 1) {
                    //distance = 300
                    levelY = game.levelGroup2.y
                    game.worldManager.createObstacleBounds()
                    cursor.body.setCircle(mediumCursorSize)

                } else if (currentLevel == 2) {
                    //distance = 250
                    levelY = game.levelGroup3.y

                    game.physics.p2.enable(game.worldManager.puddle)
                    game.worldManager.puddle.body.kinematic = true

                    game.worldManager.destroyObstacleBounds()
                    game.physics.p2.enable(game.worldManager.puddle)
                    game.worldManager.puddle.body.kinematic = true
                    //cursor.body.setCircle(smallCursorSize)
                }

                if (levelY > -1 && !canCatch) {
                    if (currentLevel < 3) currentLevel++
                    else return

                    game.worldManager.destroyStupidAnimals()
                    canCatch = true

                    game.time.events.remove(worldInterval)

                    game.worldManager.setBounds()
                    game.worldManager.setDynamicAnimals()
                    game.levelManager.showLevelBanner()
                }

                for (var i = 0; i < STUPID_ANIMALS.length; i++) {
                    if (STUPID_ANIMALS[i].y < 0) {
                        STUPID_ANIMALS[i].destroy()
                        STUPID_ANIMALS.splice(i, 1)
                    }
                }
            }
        },

        moveCursor: function () {
            if (game.input.activePointer.leftButton.isDown || game.input.pointer1.isDown) {
                cursor.body.x = game.input.x
                cursor.body.y = game.input.y
            } else {
                cursor.body.x = -100
                cursor.body.y = -100
            }
        },

        catchAnimals: function () {
            for (var i = 0; i < ANIMALS.length; i++) {
                var animal = ANIMALS[i]

                //this.checkAnimalStuck(animal)

                if (canCatch) {

                    // changing animal speed and direction when they are near farm
                    if (currentLevel > 1) speed = fastSpeed
                    animal.body.moveForward(speed)

                    var endAngle = Math.round(Math.atan2(animal.body.y - game.worldManager.farmY, animal.body.x - game.worldManager.farmX) * 180 / Math.PI - 90)
                    var animalAngle = animal.body.angle

                    distance = Math.sqrt(Math.pow(game.worldManager.farmX - animal.body.x, 2) + Math.pow(game.worldManager.farmY - animal.body.y, 2))

                    if (distance < farmDistance) {
                        if (config.isLandscape) animal.body.moveForward(animalAcceleration / distance)
                        else animal.body.moveForward(animalAcceleration / distance)
                    }

                    if (animalAngle > endAngle) animal.body.rotateLeft(50)
                    else animal.body.rotateRight(50)

                    // changing animal speed and direction when they are near cursor
                    if (game.input.activePointer.leftButton.isDown || game.input.pointer1.isDown) this.changeAnimalDirection(animal)

                    // making animals transparent when the move closer to the farm
                    if (distance < transparancyDistance) animal.alpha = distance / transparancyDistance
                    else animal.alpha = 1

                    // destroying animals when they are in farm
                    // distance < farmDistance is usefull only in landscape mode to prevent animals catching when user pushes them to the top left or right corners
                    if (animal.y < catchPoint && distance < farmDistance) {
                        ANIMALS[i].destroy()
                        ANIMALS.splice(i, 1)

                        game.uiManager.animateFarm()

                        if (VARIATION_MECHANIC != "B") catchCasual()
                        else if (VARIATION_MECHANIC == "B") catchIdle()
                    }

                    if (ANIMALS.length === 0) {
                        allInHouse = true
                        canCatch = false
                    }
                }
            }

            function catchCasual() {
                game.uiManager.increaseProgress()
            }

            function catchIdle() {
                woolUnits += woolQuantityNumber
                game.worldManager.woolUnitsText.setText(woolUnits)
            }
        },

        // If animal stuck in some barrier it turns in other direction.
        // !!! Not used in current logic configuration because all animals are always turned towards the farm
        checkAnimalStuck: function (animal) {

            var startX = Math.round(animal.x)
            var startY = Math.round(animal.y)
            var endX
            var endY
            var currentAngle = Math.round(animal.body.angle)

            setTimeout(function () {

                endX = Math.round(animal.x)
                endY = Math.round(animal.y)

                if (startX === endX && startY === endY)
                    if (currentAngle > 0) {
                        try {
                            animal.body.rotateRight(120)
                        } catch (Exception) { }
                    } else {
                        try {
                            animal.body.rotateLeft(120)
                        } catch (Exception) { }
                    }
            }, 600)
        },

        changeAnimalDirection: function (animal) {
            distancePointer = Math.sqrt(Math.pow(animal.body.x - cursor.x, 2) + Math.pow(animal.body.y - cursor.y, 2))

            if (distancePointer < cursorDistance) {
                var currentAngle = Math.round(animal.body.angle)
                var endAngle = Math.round(Math.atan2(cursor.y - animal.body.y, cursor.x - animal.body.x) * 180 / Math.PI - 90)

                if (Math.abs(currentAngle - endAngle) % 360 > 30) {
                    if (!animal.choosedDirection) {
                        animal.toRight = (endAngle - currentAngle < 180)
                        animal.choosedDirection = true
                    }
                    if (animal.toRight) {
                        animal.body.rotateRight(200)
                    }
                    else {
                        animal.body.rotateLeft(200)
                    }
                } else {
                    animal.body.setZeroRotation()
                    animal.body.moveForward(animalAcceleration / distancePointer)
                }
            }
        },

        animalRush: function () {
            if (currentLevel == 3 && !game.uiManager.playableFinished) {
                game.uiManager.showLastScreen()
                game.uiManager.playableFinished = true
            }
            else game.worldManager.createStupidAnimals()
        },

        moveToNextLevel: function () {
            if (currentLevel == 3) return

            worldInterval = game.time.events.loop(15, () => {

                game.backgroundGroup1.y += TRANSITION_SPEED
                game.backgroundGroup2.y += TRANSITION_SPEED
                game.backgroundGroup3.y += TRANSITION_SPEED

                game.backgroundGroup1L.y += TRANSITION_SPEED
                game.backgroundGroup2L.y += TRANSITION_SPEED
                game.backgroundGroup3L.y += TRANSITION_SPEED

                game.levelGroup1.y += TRANSITION_SPEED
                game.levelGroup2.y += TRANSITION_SPEED
                game.levelGroup3.y += TRANSITION_SPEED

                for (var i = 0; i < ANIMALS.length; i++) {
                    ANIMALS[i].body.y += TRANSITION_SPEED
                }
            })
        },

        // Is used only in VARIATION_MECHANIC "B"
        checkTruckPosition: function () {
            if ((game.worldManager.truck.x > game.world.centerX && game.worldManager.truck.x < game.width - 400 * GLOBAL_SCALE) && canCollectWool) {
                game.worldManager.woolUnitsText.setText("0")
                woolOnTruck = woolUnits
                woolUnits = 0

                canCollectWool = false
                canCollectMoney = true
            }

            if (game.worldManager.truck.x > game.width - 400 * GLOBAL_SCALE && canCollectMoney) {
                canCollectWool = true
                canCollectMoney = false

                money += woolOnTruck / 5 * woolValueNumber
                if (money > 5000) money = 5000

                if (woolOnTruck != 0) {
                    this.truckMoneyText = game.add.text(game.worldManager.truck.x, game.worldManager.truck.y, '0', { align: 'center' })
                    this.truckMoneyText.anchor.set(0.5)
                    this.truckMoneyText.font = 'Arial'
                    this.truckMoneyText.fontSize = 60
                    this.truckMoneyText.scale.set(1 * GLOBAL_SCALE)
                    this.truckMoneyText.fill = '#ffffff'

                    this.truckMoneyText.setText("+" + woolOnTruck / 5 * woolValueNumber + "$")

                    game.add.tween(this.truckMoneyText).to({
                        y: -100 * GLOBAL_SCALE
                    }, 800, "Linear", true)

                    game.add.tween(this.truckMoneyText.scale).to({
                        x: 2 * GLOBAL_SCALE,
                        y: 2 * GLOBAL_SCALE
                    }, 200, "Linear", true)
                }

                woolOnTruck = 0
                game.uiManager.increaseProgressIdle()
            }
        }
    }
    return state
})();

var Preloader = (function () {
    "use strict";
    var state = function() {};

    state.prototype = {
        init: function() {
            
        },
        onFileComplete: function(progress, cacheKey, success, totalLoaded, totalFiles) {
            this.loaderText.text = 'loading ' + progress + '%'
        },
        preload: function() {
            this.add.existing(game.mainGroup);
            this.loaderText = this.make.text(0, 0, "loading 0%");
            this.loaderText.fill = "#ffffff"
            game.utils.setPositionToGameCenter([this.loaderText]);
            game.utils.centerGameObjects([this.loaderText]);
            game.mainGroup.add(this.loaderText);

            this.load.onFileComplete.add(this.onFileComplete, this);
            game.load.image('plus',  window.gameResources.plus_img);


            //--------------------UI---------------------
            game.load.image("pouce", window.gameResources.pouce)
            game.load.image("continueButtonYellow", window.gameResources.continueButtonYellow)

            game.load.image("buttonTall", window.gameResources.buttonTall)

            game.load.image("spawnRate", window.gameResources.spawnRate)
            game.load.image("woolValue", window.gameResources.woolValue)
            game.load.image("woolQuantity", window.gameResources.woolQuantity)
            game.load.image("bigSheep", window.gameResources.bigSheep)
            game.load.image("trucksSpeed", window.gameResources.trucksSpeed)


            //-------------------World---------------------
            game.load.image("greenGround1", window.gameResources.greenGround1)
            game.load.image("greenGround2", window.gameResources.greenGround2)

            game.load.image("greenBackground", window.gameResources.greenBackground)
            game.load.image("greenBackgroundLand", window.gameResources.greenBackgroundLand)
            game.load.image("whiteBackground", window.gameResources.whiteBackground)
            game.load.image("whiteBackgroundLand", window.gameResources.whiteBackgroundLand)
            game.load.image("yellowBackground", window.gameResources.yellowBackground)
            game.load.image("yellowBackgroundLand", window.gameResources.yellowBackgroundLand)
            game.load.image("field", window.gameResources.field)

            game.load.image("trees", window.gameResources.trees)
            game.load.image("whiteTrees", window.gameResources.whiteTrees)
            game.load.image("yellowTrees", window.gameResources.yellowTrees)
            game.load.image("treeSingle", window.gameResources.treeSingle)

            game.load.image("orangeFence", window.gameResources.orangeFence)
            game.load.image("orangeFenceBottom", window.gameResources.orangeFenceBottom)
            game.load.image("whiteFence", window.gameResources.whiteFence)
            game.load.image("whiteFenceBottom", window.gameResources.whiteFenceBottom)
            game.load.image("yellowFence", window.gameResources.yellowFence)
            game.load.image("yellowFenceBottom", window.gameResources.yellowFenceBottom)

            game.load.image("orangeFenceOpenLeft", window.gameResources.orangeFenceOpenLeft)
            game.load.image("orangeFenceOpenRight", window.gameResources.orangeFenceOpenRight)

            game.load.image("whiteDoorClose", window.gameResources.whiteDoorClose)
            game.load.image("whiteDoor", window.gameResources.whiteDoor)
            game.load.image("yellowDoor", window.gameResources.yellowDoor)

            game.load.image("whiteRiverLeft", window.gameResources.whiteRiverLeft)
            game.load.image("whiteRiverRight", window.gameResources.whiteRiverRight)


            game.load.image("redHouse", window.gameResources.redHouse)
            game.load.image("whiteHouse", window.gameResources.whiteHouse)
            game.load.image("yellowHouse", window.gameResources.yellowHouse)

            game.load.image("redHouseBottom", window.gameResources.redHouseBottom)
            game.load.image("whiteHouseBottom", window.gameResources.whiteHouseBottom)
            game.load.image("yellowHouseBottom", window.gameResources.yellowHouseBottom)


            game.load.image("puddle", window.gameResources.puddle)
            game.load.image("obstacleRect", window.gameResources.obstacleRect)
            game.load.image("obstacleCube", window.gameResources.obstacleCube)

            game.load.image("leftBound", window.gameResources.leftBound)
            game.load.image("rightBound", window.gameResources.rightBound)


            //-------------------Play-------------------------
            game.load.image("animalShadow", window.gameResources.animalShadow)
            game.load.image("sheep", window.gameResources.sheep)
            game.load.image("mammoth", window.gameResources.mammoth)
            game.load.image("rabbit", window.gameResources.rabbit)
            game.load.image("lama", window.gameResources.lama)

            game.load.image("woolUnitsPanel", window.gameResources.woolUnitsPanel)

            game.load.image("truck", window.gameResources.truck)
            game.load.image("road", window.gameResources.road)

            game.load.spritesheet("sheepSheet", window.gameResources.finishSheepSheet, 256, 256, 19)
            game.load.image("cursor", window.gameResources.cursor)
        },
        create: function() {
            this.state.start("Game")
        },
        shutdown: function() {
            this.loaderText.destroy()
            // destroy bar
        }
    }
    return state
})();

var GameIndex = (function() {
    "use strict";
    var index = {
        init: function() {
            function createGame() {
                window.game = new Phaser.Game(config.MIN_GAME_WIDTH, config.MIN_GAME_HEIGHT, Phaser.CANVAS, '');
                game.mainState = game.state.add("Game", Game, false)
                game.state.add("Boot", Boot, false)
                game.state.add("Preloader", Preloader, false)
                game.state.start("Boot");
            }
            createGame()
        }
    }
    return index
})();


ExchangeManager.initializeNetworkRules()