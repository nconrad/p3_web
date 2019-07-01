"use strict";

exports.__esModule = true;
exports.default = void 0;

var _array = require("../../helpers/array");

var _baseMap = _interopRequireDefault(require("./baseMap"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

/**
 * Map from visual index to physical index.
 */
var IndexMap =
/*#__PURE__*/
function (_BaseMap) {
  _inherits(IndexMap, _BaseMap);

  function IndexMap() {
    var _this;

    var initValueOrFn = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function (index) {
      return index;
    };

    _classCallCheck(this, IndexMap);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(IndexMap).call(this, initValueOrFn));
    _this.list = [];
    _this.initValueOrFn = initValueOrFn;
    return _this;
  }
  /**
   * Add values to list and reorganize.
   *
   * @private
   * @param {Number} insertionIndex Position inside actual list.
   * @param {Array} insertedIndexes List of inserted indexes.
   */


  _createClass(IndexMap, [{
    key: "addValueAndReorganize",
    value: function addValueAndReorganize(insertionIndex, insertedIndexes) {
      this.increaseIndexes(insertionIndex, insertedIndexes);
      this.insertIndexes(insertionIndex, insertedIndexes);
    }
    /**
     * Remove values from the list and reorganize.
     *
     * @private
     * @param {Array} removedIndexes List of removed indexes.
     */

  }, {
    key: "removeValuesAndReorganize",
    value: function removeValuesAndReorganize(removedIndexes) {
      this.filterIndexes(removedIndexes);
      this.decreaseIndexes(removedIndexes);
    }
    /**
     * Transform list of values after insertion.
     *
     * @private
     * @param {Number} insertionIndex Position inside actual list.
     * @param {Array} insertedIndexes List of inserted indexes.
     */

  }, {
    key: "increaseIndexes",
    value: function increaseIndexes(insertionIndex, insertedIndexes) {
      var firstInsertedIndex = insertedIndexes[0];
      var amountOfIndexes = insertedIndexes.length;
      this.list = (0, _array.arrayMap)(this.list, function (index) {
        if (index >= firstInsertedIndex) {
          return index + amountOfIndexes;
        }

        return index;
      });
    }
    /**
     * Insert new indexes to the list.
     *
     * @private
     * @param {Number} insertionIndex Position inside actual list.
     * @param {Array} insertedIndexes List of inserted indexes.
     */

  }, {
    key: "insertIndexes",
    value: function insertIndexes(insertionIndex, insertedIndexes) {
      this.list = [].concat(_toConsumableArray(this.list.slice(0, insertionIndex)), _toConsumableArray(insertedIndexes), _toConsumableArray(this.list.slice(insertionIndex)));
    }
    /**
     * Filter indexes from the list.
     *
     * @private
     * @param {Array} removedIndexes List of removed indexes.
     */

  }, {
    key: "filterIndexes",
    value: function filterIndexes(removedIndexes) {
      this.list = (0, _array.arrayFilter)(this.list, function (index) {
        return removedIndexes.includes(index) === false;
      });
    }
    /**
     * Transform list of indexes after removal.
     *
     * @private
     * @param {Array} removedIndexes List of removed indexes.
     */

  }, {
    key: "decreaseIndexes",
    value: function decreaseIndexes(removedIndexes) {
      this.list = (0, _array.arrayMap)(this.list, function (index) {
        return index - removedIndexes.filter(function (removedRow) {
          return removedRow < index;
        }).length;
      });
    }
  }]);

  return IndexMap;
}(_baseMap.default);

var _default = IndexMap;
exports.default = _default;