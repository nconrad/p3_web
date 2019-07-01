function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

import { isUndefined } from '../helpers/mixed';

var MapCollection =
/*#__PURE__*/
function () {
  function MapCollection(entries) {
    _classCallCheck(this, MapCollection);

    this.mappings = new Map(entries);
  }
  /**
   * Register custom indexes map.
   *
   * @param {String} name Unique name of the indexes list.
   * @param {BaseMap} map Map containing miscellaneous (i.e. meta data, indexes sequence), updated after remove and insert data actions.
   * @returns {BaseMap}
   */


  _createClass(MapCollection, [{
    key: "register",
    value: function register(name, map) {
      if (this.mappings.has(name) === false) {
        this.mappings.set(name, map);
      }

      return this.mappings.get(name);
    }
    /**
     * Get indexes list by it's name.
     *
     * @param {String} name Name of the indexes list.
     * @returns {IndexMap}
     */

  }, {
    key: "get",
    value: function get(name) {
      if (isUndefined(name)) {
        return this.mappings.values();
      }

      return this.mappings.get(name);
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
      this.mappings.forEach(function (list) {
        list.removeValuesAndReorganize(removedIndexes);
      });
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
    value: function updateIndexesAfterInsertion(insertionIndex, insertedIndexes) {
      this.mappings.forEach(function (list) {
        list.addValueAndReorganize(insertionIndex, insertedIndexes);
      });
    }
    /**
     * Reset current index map and create new one.
     *
     * @param {Number} length Custom generated map length.
     */

  }, {
    key: "initToLength",
    value: function initToLength(length) {
      this.mappings.forEach(function (list) {
        list.init(length);
      });
    }
  }]);

  return MapCollection;
}();

export default MapCollection;