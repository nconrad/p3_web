"use strict";

exports.__esModule = true;
exports.default = void 0;

var _array = require("./../helpers/array");

var _indexMap = _interopRequireDefault(require("./maps/indexMap"));

var _mapCollection = _interopRequireDefault(require("./mapCollection"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var INDEXES_SEQUENCE_KEY = 'sequence';

var IndexMapper =
/*#__PURE__*/
function () {
  function IndexMapper() {
    _classCallCheck(this, IndexMapper);

    this.indexToIndexCollection = new _mapCollection.default([[INDEXES_SEQUENCE_KEY, new _indexMap.default()]]);
    this.skipCollection = new _mapCollection.default();
  }
  /**
   * Get physical index by its visual index.
   *
   * @param {Number} visualIndex Visual index.
   * @return {Number|null} Returns translated index mapped by passed visual index.
   */


  _createClass(IndexMapper, [{
    key: "getPhysicalIndex",
    value: function getPhysicalIndex(visualIndex) {
      var visibleIndexes = this.getNotSkippedIndexes();
      var numberOfVisibleIndexes = visibleIndexes.length;
      var physicalIndex = null;

      if (visualIndex < numberOfVisibleIndexes) {
        physicalIndex = visibleIndexes[visualIndex];
      }

      return physicalIndex;
    }
    /**
     * Get visual index by its physical index.
     *
     * @param {Number} physicalIndex Physical index to search.
     * @returns {Number|null} Returns a visual index of the index mapper.
     */

  }, {
    key: "getVisualIndex",
    value: function getVisualIndex(physicalIndex) {
      var visibleIndexes = this.getNotSkippedIndexes();
      var visualIndex = null;

      if (!this.isSkipped(physicalIndex) && this.getIndexesSequence().includes(physicalIndex)) {
        visualIndex = visibleIndexes.indexOf(physicalIndex);
      }

      return visualIndex;
    }
    /**
     * Reset current index map and create new one.
     *
     * @param {Number} [length] Custom generated map length.
     */

  }, {
    key: "initToLength",
    value: function initToLength() {
      var length = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.getNumberOfIndexes();
      this.indexToIndexCollection.initToLength(length);
      this.skipCollection.initToLength(length);
    }
    /**
     * Get all indexes sequence.
     *
     * @returns {Array}
     */

  }, {
    key: "getIndexesSequence",
    value: function getIndexesSequence() {
      return this.indexToIndexCollection.get(INDEXES_SEQUENCE_KEY).getValues();
    }
    /**
     * Set completely new indexes sequence.
     *
     * @param {Array} indexes Physical row indexes.
     */

  }, {
    key: "setIndexesSequence",
    value: function setIndexesSequence(indexes) {
      return this.indexToIndexCollection.get(INDEXES_SEQUENCE_KEY).setValues(indexes);
    }
    /**
     * Get all indexes skipped in the process of rendering.
     *
     * @returns {Array}
     */

  }, {
    key: "getSkippedIndexes",
    value: function getSkippedIndexes() {
      var particularSkipsLists = (0, _array.arrayMap)(this.skipCollection.get(), function (skipList) {
        return skipList.getValues();
      });
      var skipBooleansForIndex = (0, _array.pivot)(particularSkipsLists);
      return (0, _array.arrayReduce)(skipBooleansForIndex, function (skippedIndexesResult, skipIndexesAtIndex, physicalIndex) {
        if (skipIndexesAtIndex.some(function (isSkipped) {
          return isSkipped === true;
        })) {
          return skippedIndexesResult.concat(physicalIndex);
        }

        return skippedIndexesResult;
      }, []);
    }
    /**
     * Get whether index is skipped in the process of rendering.
     *
     * @param {Number} physicalIndex Physical index.
     * @returns {Boolean}
     */

  }, {
    key: "isSkipped",
    value: function isSkipped(physicalIndex) {
      return this.getSkippedIndexes().includes(physicalIndex);
    }
    /**
     * Get all indexes NOT skipped in the process of rendering.
     *
     * @returns {Array}
     */

  }, {
    key: "getNotSkippedIndexes",
    value: function getNotSkippedIndexes() {
      var _this = this;

      return (0, _array.arrayFilter)(this.getIndexesSequence(), function (index) {
        return _this.isSkipped(index) === false;
      });
    }
    /**
     * Get length of all indexes NOT skipped in the process of rendering.
     *
     * @returns {Array}
     */

  }, {
    key: "getNotSkippedIndexesLength",
    value: function getNotSkippedIndexesLength() {
      return this.getNotSkippedIndexes().length;
    }
    /**
     * Get number of all indexes.
     *
     * @returns {Number}
     */

  }, {
    key: "getNumberOfIndexes",
    value: function getNumberOfIndexes() {
      return this.getIndexesSequence().length;
    }
    /**
     * Move indexes in the index mapper.
     *
     * @param {Number|Array} movedIndexes Visual index(es) to move.
     * @param {Number} finalIndex Visual row index being a start index for the moved rows.
     */

  }, {
    key: "moveIndexes",
    value: function moveIndexes(movedIndexes, finalIndex) {
      var _this2 = this;

      if (typeof movedIndexes === 'number') {
        movedIndexes = [movedIndexes];
      }

      var physicalMovedIndexes = (0, _array.arrayMap)(movedIndexes, function (row) {
        return _this2.getPhysicalIndex(row);
      });
      var sequenceOfIndexes = this.indexToIndexCollection.get(INDEXES_SEQUENCE_KEY);
      sequenceOfIndexes.filterIndexes(physicalMovedIndexes); // When item(s) are moved after the last item we assign new index.

      var indexNumber = this.getNumberOfIndexes(); // Otherwise, we find proper index for inserted item(s).

      if (finalIndex < this.getNotSkippedIndexesLength()) {
        var physicalIndex = this.getPhysicalIndex(finalIndex);
        indexNumber = this.getIndexesSequence().indexOf(physicalIndex);
      } // We count number of skipped rows from the start to the position of inserted item(s).


      var skippedRowsToTargetIndex = (0, _array.arrayReduce)(this.getIndexesSequence().slice(0, indexNumber), function (skippedRowsSum, currentValue) {
        if (_this2.isSkipped(currentValue)) {
          return skippedRowsSum + 1;
        }

        return skippedRowsSum;
      }, 0);
      sequenceOfIndexes.insertIndexes(finalIndex + skippedRowsToTargetIndex, physicalMovedIndexes);
    }
    /**
     * Update indexes after inserting new indexes.
     *
     * @private
     * @param {Number} firstInsertedVisualIndex First inserted visual index.
     * @param {Number} firstInsertedPhysicalIndex First inserted physical index.
     * @param {Number} amountOfIndexes Amount of inserted indexes.
     */

  }, {
    key: "updateIndexesAfterInsertion",
    value: function updateIndexesAfterInsertion(firstInsertedVisualIndex, firstInsertedPhysicalIndex, amountOfIndexes) {
      var nthVisibleIndex = this.getNotSkippedIndexes()[firstInsertedVisualIndex];
      var insertionIndex = this.getIndexesSequence().includes(nthVisibleIndex) ? this.getIndexesSequence().indexOf(nthVisibleIndex) : this.getNumberOfIndexes();
      var insertedIndexes = (0, _array.arrayMap)(new Array(amountOfIndexes).fill(firstInsertedPhysicalIndex), function (nextIndex, stepsFromStart) {
        return nextIndex + stepsFromStart;
      });
      this.indexToIndexCollection.updateIndexesAfterInsertion(insertionIndex, insertedIndexes);
      this.skipCollection.updateIndexesAfterInsertion(insertionIndex, insertedIndexes);
    }
    /**
     * Update indexes after removing some indexes.
     *
     * @private
     * @param {Array} removedIndexes List of removed indexes.
     */

  }, {
    key: "updateIndexesAfterRemoval",
    value: function updateIndexesAfterRemoval(removedIndexes) {
      this.indexToIndexCollection.updateIndexesAfterRemoval(removedIndexes);
      this.skipCollection.updateIndexesAfterRemoval(removedIndexes);
    }
  }]);

  return IndexMapper;
}();

var _default = IndexMapper;
exports.default = _default;