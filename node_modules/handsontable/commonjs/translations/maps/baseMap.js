"use strict";

exports.__esModule = true;
exports.default = void 0;

var _array = require("../../helpers/array");

var _function = require("../../helpers/function");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
 * Map from index to value.
 */
var BaseMap =
/*#__PURE__*/
function () {
  function BaseMap() {
    var initValueOrFn = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function (index) {
      return index;
    };

    _classCallCheck(this, BaseMap);

    this.list = [];
    this.initValueOrFn = initValueOrFn;
  }
  /**
   * Initialize list with default values for particular indexes.
   *
   * @param {Number} length New length of list.
   */


  _createClass(BaseMap, [{
    key: "init",
    value: function init(length) {
      var _this = this;

      this.list = (0, _array.arrayMap)(new Array(length), function (_, indexOfArray) {
        if ((0, _function.isFunction)(_this.initValueOrFn)) {
          return _this.initValueOrFn(indexOfArray);
        }

        return _this.initValueOrFn;
      });
      return this;
    }
    /**
     * Get full list of values for particular indexes.
     *
     * @returns {Array}
     */

  }, {
    key: "getValues",
    value: function getValues() {
      return this.list.slice();
    }
    /**
     * Set new values for particular indexes.
     *
     * @param {Array} values List of set values.
     */

  }, {
    key: "setValues",
    value: function setValues(values) {
      this.list = values.slice();
    }
    /**
     * Get value for particular index.
     *
     * @param {Number} index
     * @returns {*}
     */

  }, {
    key: "getValueAtIndex",
    value: function getValueAtIndex(index) {
      return this.getValues()[index];
    }
    /**
     * Clear all values.
     */

  }, {
    key: "clear",
    value: function clear() {
      this.init(this.list.length);
    }
    /**
     * Get length of index map.
     *
     * @returns {Number}
     */

  }, {
    key: "getLength",
    value: function getLength() {
      return this.getValues().length;
    }
    /**
     * Add values to list and reorganize.
     *
     * @private
     * @param {Number} insertionIndex Position inside actual list.
     * @param {Array} insertedIndexes List of inserted indexes.
     */
    // eslint-disable-next-line no-unused-vars

  }, {
    key: "addValueAndReorganize",
    value: function addValueAndReorganize(insertionIndex, insertedIndexes) {
      throw Error('Map addValueAndReorganize() method unimplemented');
    }
    /**
     * Remove values from the list and reorganize.
     *
     * @private
     * @param {Array} removedIndexes List of removed indexes.
     */
    // eslint-disable-next-line no-unused-vars

  }, {
    key: "removeValuesAndReorganize",
    value: function removeValuesAndReorganize(removedIndexes) {
      throw Error('Map removeValuesAndReorganize() method unimplemented');
    }
  }]);

  return BaseMap;
}();

var _default = BaseMap;
exports.default = _default;