import "core-js/modules/es.symbol";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.regexp.to-string";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
import "core-js/modules/web.timers";

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

import { getScrollableElement, getScrollbarWidth } from './../../../helpers/dom/element';
import { arrayEach } from './../../../helpers/array';
import { isKey } from './../../../helpers/unicode';
import { isChrome } from './../../../helpers/browser';
import EventManager from './../../../eventManager';
import Overlay from './overlay/_base';
/**
 * @class Overlays
 */

var Overlays =
/*#__PURE__*/
function () {
  /**
   * @param {Walkontable} wotInstance
   */
  function Overlays(wotInstance) {
    _classCallCheck(this, Overlays);

    /**
     * Walkontable instance's reference.
     *
     * @private
     * @type {Walkontable}
     */
    this.wot = wotInstance;
    var _this$wot = this.wot,
        rootDocument = _this$wot.rootDocument,
        rootWindow = _this$wot.rootWindow,
        wtTable = _this$wot.wtTable;
    /**
     * Sometimes `line-height` might be set to 'normal'. In that case, a default `font-size` should be multiplied by roughly 1.2.
     * https://developer.mozilla.org/pl/docs/Web/CSS/line-height#Values
     */

    var BODY_LINE_HEIGHT = parseInt(rootWindow.getComputedStyle(rootDocument.body).lineHeight, 10);
    var FALLBACK_BODY_LINE_HEIGHT = parseInt(rootWindow.getComputedStyle(rootDocument.body).fontSize, 10) * 1.2; // legacy support

    this.instance = this.wot;
    this.eventManager = new EventManager(this.wot);
    this.scrollbarSize = getScrollbarWidth(rootDocument);
    this.wot.update('scrollbarWidth', this.scrollbarSize);
    this.wot.update('scrollbarHeight', this.scrollbarSize);

    if (rootWindow.getComputedStyle(wtTable.wtRootElement.parentNode).getPropertyValue('overflow') === 'hidden') {
      this.scrollableElement = wtTable.holder;
    } else {
      this.scrollableElement = getScrollableElement(wtTable.TABLE);
    }

    this.prepareOverlays();
    this.hasScrollbarBottom = false;
    this.hasScrollbarRight = false;
    this.destroyed = false;
    this.keyPressed = false;
    this.spreaderLastSize = {
      width: null,
      height: null
    };
    this.overlayScrollPositions = {
      master: {
        top: 0,
        left: 0
      },
      top: {
        top: null,
        left: 0
      },
      bottom: {
        top: null,
        left: 0
      },
      left: {
        top: 0,
        left: null
      }
    };
    this.pendingScrollCallbacks = {
      master: {
        top: 0,
        left: 0
      },
      top: {
        left: 0
      },
      bottom: {
        left: 0
      },
      left: {
        top: 0
      }
    };
    this.verticalScrolling = false;
    this.horizontalScrolling = false;
    this.delegatedScrollCallback = false;
    this.registeredListeners = [];
    this.browserLineHeight = BODY_LINE_HEIGHT || FALLBACK_BODY_LINE_HEIGHT;
    this.registerListeners();
    this.lastScrollX = rootWindow.scrollX;
    this.lastScrollY = rootWindow.scrollY;
  }
  /**
   * Prepare overlays based on user settings.
   *
   * @returns {Boolean} Returns `true` if changes applied to overlay needs scroll synchronization.
   */


  _createClass(Overlays, [{
    key: "prepareOverlays",
    value: function prepareOverlays() {
      var syncScroll = false;

      if (this.topOverlay) {
        syncScroll = this.topOverlay.updateStateOfRendering() || syncScroll;
      } else {
        this.topOverlay = Overlay.createOverlay(Overlay.CLONE_TOP, this.wot);
      }

      if (!Overlay.hasOverlay(Overlay.CLONE_BOTTOM)) {
        this.bottomOverlay = {
          needFullRender: false,
          updateStateOfRendering: function updateStateOfRendering() {
            return false;
          }
        };
      }

      if (!Overlay.hasOverlay(Overlay.CLONE_BOTTOM_LEFT_CORNER)) {
        this.bottomLeftCornerOverlay = {
          needFullRender: false,
          updateStateOfRendering: function updateStateOfRendering() {
            return false;
          }
        };
      }

      if (this.bottomOverlay) {
        syncScroll = this.bottomOverlay.updateStateOfRendering() || syncScroll;
      } else {
        this.bottomOverlay = Overlay.createOverlay(Overlay.CLONE_BOTTOM, this.wot);
      }

      if (this.leftOverlay) {
        syncScroll = this.leftOverlay.updateStateOfRendering() || syncScroll;
      } else {
        this.leftOverlay = Overlay.createOverlay(Overlay.CLONE_LEFT, this.wot);
      }

      if (this.topOverlay.needFullRender && this.leftOverlay.needFullRender) {
        if (this.topLeftCornerOverlay) {
          syncScroll = this.topLeftCornerOverlay.updateStateOfRendering() || syncScroll;
        } else {
          this.topLeftCornerOverlay = Overlay.createOverlay(Overlay.CLONE_TOP_LEFT_CORNER, this.wot);
        }
      }

      if (this.bottomOverlay.needFullRender && this.leftOverlay.needFullRender) {
        if (this.bottomLeftCornerOverlay) {
          syncScroll = this.bottomLeftCornerOverlay.updateStateOfRendering() || syncScroll;
        } else {
          this.bottomLeftCornerOverlay = Overlay.createOverlay(Overlay.CLONE_BOTTOM_LEFT_CORNER, this.wot);
        }
      }

      if (this.wot.getSetting('debug') && !this.debug) {
        this.debug = Overlay.createOverlay(Overlay.CLONE_DEBUG, this.wot);
      }

      return syncScroll;
    }
    /**
     * Refresh and redraw table
     */

  }, {
    key: "refreshAll",
    value: function refreshAll() {
      if (!this.wot.drawn) {
        return;
      }

      if (!this.wot.wtTable.holder.parentNode) {
        // Walkontable was detached from DOM, but this handler was not removed
        this.destroy();
        return;
      }

      this.wot.draw(true);

      if (this.verticalScrolling) {
        this.leftOverlay.onScroll();
      }

      if (this.horizontalScrolling) {
        this.topOverlay.onScroll();
      }

      this.verticalScrolling = false;
      this.horizontalScrolling = false;
    }
    /**
     * Register all necessary event listeners.
     */

  }, {
    key: "registerListeners",
    value: function registerListeners() {
      var _this = this;

      var _this$wot2 = this.wot,
          rootDocument = _this$wot2.rootDocument,
          rootWindow = _this$wot2.rootWindow;
      var topOverlayScrollableElement = this.topOverlay.mainTableScrollableElement;
      var leftOverlayScrollableElement = this.leftOverlay.mainTableScrollableElement;
      var listenersToRegister = [];
      listenersToRegister.push([rootDocument.documentElement, 'keydown', function (event) {
        return _this.onKeyDown(event);
      }]);
      listenersToRegister.push([rootDocument.documentElement, 'keyup', function () {
        return _this.onKeyUp();
      }]);
      listenersToRegister.push([rootDocument, 'visibilitychange', function () {
        return _this.onKeyUp();
      }]);
      listenersToRegister.push([topOverlayScrollableElement, 'scroll', function (event) {
        return _this.onTableScroll(event);
      }, {
        passive: true
      }]);

      if (topOverlayScrollableElement !== leftOverlayScrollableElement) {
        listenersToRegister.push([leftOverlayScrollableElement, 'scroll', function (event) {
          return _this.onTableScroll(event);
        }, {
          passive: true
        }]);
      }

      var isHighPixelRatio = rootWindow.devicePixelRatio && rootWindow.devicePixelRatio > 1;
      var isScrollOnWindow = this.scrollableElement === rootWindow;

      if (isHighPixelRatio || !isChrome()) {
        listenersToRegister.push([this.wot.wtTable.wtRootElement.parentNode, 'wheel', function (event) {
          return _this.onCloneWheel(event);
        }, {
          passive: isScrollOnWindow
        }]);
      } else {
        if (this.topOverlay.needFullRender) {
          listenersToRegister.push([this.topOverlay.clone.wtTable.holder, 'wheel', function (event) {
            return _this.onCloneWheel(event);
          }, {
            passive: isScrollOnWindow
          }]);
        }

        if (this.bottomOverlay.needFullRender) {
          listenersToRegister.push([this.bottomOverlay.clone.wtTable.holder, 'wheel', function (event) {
            return _this.onCloneWheel(event);
          }, {
            passive: isScrollOnWindow
          }]);
        }

        if (this.leftOverlay.needFullRender) {
          listenersToRegister.push([this.leftOverlay.clone.wtTable.holder, 'wheel', function (event) {
            return _this.onCloneWheel(event);
          }, {
            passive: isScrollOnWindow
          }]);
        }

        if (this.topLeftCornerOverlay && this.topLeftCornerOverlay.needFullRender) {
          listenersToRegister.push([this.topLeftCornerOverlay.clone.wtTable.holder, 'wheel', function (event) {
            return _this.onCloneWheel(event);
          }, {
            passive: isScrollOnWindow
          }]);
        }

        if (this.bottomLeftCornerOverlay && this.bottomLeftCornerOverlay.needFullRender) {
          listenersToRegister.push([this.bottomLeftCornerOverlay.clone.wtTable.holder, 'wheel', function (event) {
            return _this.onCloneWheel(event);
          }, {
            passive: isScrollOnWindow
          }]);
        }
      }

      var resizeTimeout;
      listenersToRegister.push([rootWindow, 'resize', function () {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(function () {
          _this.wot.getSetting('onWindowResize');
        }, 200);
      }]);

      while (listenersToRegister.length) {
        var _this$eventManager;

        var listener = listenersToRegister.pop();

        (_this$eventManager = this.eventManager).addEventListener.apply(_this$eventManager, _toConsumableArray(listener));

        this.registeredListeners.push(listener);
      }
    }
    /**
     * Deregister all previously registered listeners.
     */

  }, {
    key: "deregisterListeners",
    value: function deregisterListeners() {
      while (this.registeredListeners.length) {
        var listener = this.registeredListeners.pop();
        this.eventManager.removeEventListener(listener[0], listener[1], listener[2]);
      }
    }
    /**
     * Scroll listener
     *
     * @param {Event} event
     */

  }, {
    key: "onTableScroll",
    value: function onTableScroll(event) {
      // There was if statement which controlled flow of this function. It avoided the execution of the next lines
      // on mobile devices. It was changed. Broader description of this case is included within issue #4856.
      var rootWindow = this.wot.rootWindow;
      var masterHorizontal = this.leftOverlay.mainTableScrollableElement;
      var masterVertical = this.topOverlay.mainTableScrollableElement;
      var target = event.target; // For key press, sync only master -> overlay position because while pressing Walkontable.render is triggered
      // by hot.refreshBorder

      if (this.keyPressed) {
        if (masterVertical !== rootWindow && target !== rootWindow && !event.target.contains(masterVertical) || masterHorizontal !== rootWindow && target !== rootWindow && !event.target.contains(masterHorizontal)) {
          return;
        }
      }

      this.syncScrollPositions(event);
    }
    /**
     * Wheel listener for cloned overlays.
     *
     * @param {Event} event
     */

  }, {
    key: "onCloneWheel",
    value: function onCloneWheel(event) {
      var rootWindow = this.wot.rootWindow;

      if (this.scrollableElement !== rootWindow) {
        event.preventDefault();
      } // There was if statement which controlled flow of this function. It avoided the execution of the next lines
      // on mobile devices. It was changed. Broader description of this case is included within issue #4856.


      var masterHorizontal = this.leftOverlay.mainTableScrollableElement;
      var masterVertical = this.topOverlay.mainTableScrollableElement;
      var target = event.target; // For key press, sync only master -> overlay position because while pressing Walkontable.render is triggered
      // by hot.refreshBorder

      var shouldNotWheelVertically = masterVertical !== rootWindow && target !== rootWindow && !target.contains(masterVertical);
      var shouldNotWheelHorizontally = masterHorizontal !== rootWindow && target !== rootWindow && !target.contains(masterHorizontal);

      if (this.keyPressed && (shouldNotWheelVertically || shouldNotWheelHorizontally)) {
        return;
      }

      this.translateMouseWheelToScroll(event);
    }
    /**
     * Key down listener
     */

  }, {
    key: "onKeyDown",
    value: function onKeyDown(event) {
      this.keyPressed = isKey(event.keyCode, 'ARROW_UP|ARROW_RIGHT|ARROW_DOWN|ARROW_LEFT');
    }
    /**
     * Key up listener
     */

  }, {
    key: "onKeyUp",
    value: function onKeyUp() {
      this.keyPressed = false;
    }
    /**
     * Translate wheel event into scroll event and sync scroll overlays position
     *
     * @private
     * @param {Event} event
     */

  }, {
    key: "translateMouseWheelToScroll",
    value: function translateMouseWheelToScroll(event) {
      var browserLineHeight = this.browserLineHeight;
      var deltaY = isNaN(event.deltaY) ? -1 * event.wheelDeltaY : event.deltaY;
      var deltaX = isNaN(event.deltaX) ? -1 * event.wheelDeltaX : event.deltaX;

      if (event.deltaMode === 1) {
        deltaX += deltaX * browserLineHeight;
        deltaY += deltaY * browserLineHeight;
      }

      this.scrollVertically(deltaY);
      this.scrollHorizontally(deltaX);
    }
    /**
     * Scrolls main scrollable element horizontally.
     *
     * @param {Number} delta Relative value to scroll.
     */

  }, {
    key: "scrollVertically",
    value: function scrollVertically(delta) {
      this.scrollableElement.scrollTop += delta;
    }
    /**
     * Scrolls main scrollable element horizontally.
     *
     * @param {Number} delta Relative value to scroll.
     */

  }, {
    key: "scrollHorizontally",
    value: function scrollHorizontally(delta) {
      this.scrollableElement.scrollLeft += delta;
    }
    /**
     * Synchronize scroll position between master table and overlay table.
     *
     * @private
     */

  }, {
    key: "syncScrollPositions",
    value: function syncScrollPositions() {
      if (this.destroyed) {
        return;
      }

      var rootWindow = this.wot.rootWindow;
      var topHolder = this.topOverlay.clone.wtTable.holder;
      var leftHolder = this.leftOverlay.clone.wtTable.holder;
      var _ref = [this.scrollableElement.scrollLeft, this.scrollableElement.scrollTop],
          scrollLeft = _ref[0],
          scrollTop = _ref[1];
      this.horizontalScrolling = topHolder.scrollLeft !== scrollLeft || this.lastScrollX !== rootWindow.scrollX;
      this.verticalScrolling = leftHolder.scrollTop !== scrollTop || this.lastScrollY !== rootWindow.scrollY;
      this.lastScrollX = rootWindow.scrollX;
      this.lastScrollY = rootWindow.scrollY;

      if (this.horizontalScrolling) {
        topHolder.scrollLeft = scrollLeft;
        var bottomHolder = this.bottomOverlay.needFullRender ? this.bottomOverlay.clone.wtTable.holder : null;

        if (bottomHolder) {
          bottomHolder.scrollLeft = scrollLeft;
        }
      }

      if (this.verticalScrolling) {
        leftHolder.scrollTop = scrollTop;
      }

      this.refreshAll();
    }
    /**
     * Synchronize overlay scrollbars with the master scrollbar
     */

  }, {
    key: "syncScrollWithMaster",
    value: function syncScrollWithMaster() {
      var master = this.topOverlay.mainTableScrollableElement;
      var scrollLeft = master.scrollLeft,
          scrollTop = master.scrollTop;

      if (this.topOverlay.needFullRender) {
        this.topOverlay.clone.wtTable.holder.scrollLeft = scrollLeft;
      }

      if (this.bottomOverlay.needFullRender) {
        this.bottomOverlay.clone.wtTable.holder.scrollLeft = scrollLeft;
      }

      if (this.leftOverlay.needFullRender) {
        this.leftOverlay.clone.wtTable.holder.scrollTop = scrollTop;
      }
    }
    /**
     * Update the main scrollable elements for all the overlays.
     */

  }, {
    key: "updateMainScrollableElements",
    value: function updateMainScrollableElements() {
      this.deregisterListeners();
      this.leftOverlay.updateMainScrollableElement();
      this.topOverlay.updateMainScrollableElement();

      if (this.bottomOverlay.needFullRender) {
        this.bottomOverlay.updateMainScrollableElement();
      }

      var _this$wot3 = this.wot,
          rootWindow = _this$wot3.rootWindow,
          wtTable = _this$wot3.wtTable;

      if (rootWindow.getComputedStyle(wtTable.wtRootElement.parentNode).getPropertyValue('overflow') === 'hidden') {
        this.scrollableElement = wtTable.holder;
      } else {
        this.scrollableElement = getScrollableElement(wtTable.TABLE);
      }

      this.registerListeners();
    }
    /**
     *
     */

  }, {
    key: "destroy",
    value: function destroy() {
      this.eventManager.destroy();
      this.topOverlay.destroy();

      if (this.bottomOverlay.clone) {
        this.bottomOverlay.destroy();
      }

      this.leftOverlay.destroy();

      if (this.topLeftCornerOverlay) {
        this.topLeftCornerOverlay.destroy();
      }

      if (this.bottomLeftCornerOverlay && this.bottomLeftCornerOverlay.clone) {
        this.bottomLeftCornerOverlay.destroy();
      }

      if (this.debug) {
        this.debug.destroy();
      }

      this.destroyed = true;
    }
    /**
     * @param {Boolean} [fastDraw=false]
     */

  }, {
    key: "refresh",
    value: function refresh() {
      var fastDraw = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

      if (this.topOverlay.areElementSizesAdjusted && this.leftOverlay.areElementSizesAdjusted) {
        var container = this.wot.wtTable.wtRootElement.parentNode || this.wot.wtTable.wtRootElement;
        var width = container.clientWidth;
        var height = container.clientHeight;

        if (width !== this.spreaderLastSize.width || height !== this.spreaderLastSize.height) {
          this.spreaderLastSize.width = width;
          this.spreaderLastSize.height = height;
          this.adjustElementsSize();
        }
      }

      if (this.bottomOverlay.clone) {
        this.bottomOverlay.refresh(fastDraw);
      }

      this.leftOverlay.refresh(fastDraw);
      this.topOverlay.refresh(fastDraw);

      if (this.topLeftCornerOverlay) {
        this.topLeftCornerOverlay.refresh(fastDraw);
      }

      if (this.bottomLeftCornerOverlay && this.bottomLeftCornerOverlay.clone) {
        this.bottomLeftCornerOverlay.refresh(fastDraw);
      }

      if (this.debug) {
        this.debug.refresh(fastDraw);
      }
    }
    /**
     * Adjust overlays elements size and master table size
     *
     * @param {Boolean} [force=false]
     */

  }, {
    key: "adjustElementsSize",
    value: function adjustElementsSize() {
      var force = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
      var _this$wot4 = this.wot,
          wtViewport = _this$wot4.wtViewport,
          wtTable = _this$wot4.wtTable;
      var totalColumns = this.wot.getSetting('totalColumns');
      var totalRows = this.wot.getSetting('totalRows');
      var headerRowSize = wtViewport.getRowHeaderWidth();
      var headerColumnSize = wtViewport.getColumnHeaderHeight();
      var hiderStyle = wtTable.hider.style;
      hiderStyle.width = "".concat(headerRowSize + this.leftOverlay.sumCellSizes(0, totalColumns), "px");
      hiderStyle.height = "".concat(headerColumnSize + this.topOverlay.sumCellSizes(0, totalRows) + 1, "px");

      if (this.scrollbarSize > 0) {
        var _wtTable$wtRootElemen = wtTable.wtRootElement,
            rootElemScrollHeight = _wtTable$wtRootElemen.scrollHeight,
            rootElemScrollWidth = _wtTable$wtRootElemen.scrollWidth;
        var _wtTable$holder = wtTable.holder,
            holderScrollHeight = _wtTable$holder.scrollHeight,
            holderScrollWidth = _wtTable$holder.scrollWidth;
        this.hasScrollbarRight = rootElemScrollHeight < holderScrollHeight;
        this.hasScrollbarBottom = rootElemScrollWidth < holderScrollWidth;

        if (this.hasScrollbarRight && wtTable.hider.scrollWidth + this.scrollbarSize > rootElemScrollWidth) {
          this.hasScrollbarBottom = true;
        } else if (this.hasScrollbarBottom && wtTable.hider.scrollHeight + this.scrollbarSize > rootElemScrollHeight) {
          this.hasScrollbarRight = true;
        }
      }

      this.topOverlay.adjustElementsSize(force);
      this.leftOverlay.adjustElementsSize(force);
      this.bottomOverlay.adjustElementsSize(force);
    }
    /**
     *
     */

  }, {
    key: "applyToDOM",
    value: function applyToDOM() {
      if (!this.topOverlay.areElementSizesAdjusted || !this.leftOverlay.areElementSizesAdjusted) {
        this.adjustElementsSize();
      }

      this.topOverlay.applyToDOM();

      if (this.bottomOverlay.clone) {
        this.bottomOverlay.applyToDOM();
      }

      this.leftOverlay.applyToDOM();
    }
    /**
     * Get the parent overlay of the provided element.
     *
     * @param {HTMLElement} element
     * @returns {Object|null}
     */

  }, {
    key: "getParentOverlay",
    value: function getParentOverlay(element) {
      if (!element) {
        return null;
      }

      var overlays = [this.topOverlay, this.leftOverlay, this.bottomOverlay, this.topLeftCornerOverlay, this.bottomLeftCornerOverlay];
      var result = null;
      arrayEach(overlays, function (elem) {
        if (!elem) {
          return;
        }

        if (elem.clone && elem.clone.wtTable.TABLE.contains(element)) {
          result = elem.clone;
        }
      });
      return result;
    }
  }]);

  return Overlays;
}();

export default Overlays;