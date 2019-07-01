"use strict";

exports.__esModule = true;
exports.buildIndexToValueList = buildIndexToValueList;
exports.getIndexListByCondition = getIndexListByCondition;

var _array = require("../helpers/array");

/**
 * Get built list of values.
 *
 * @param {Number} listLength Length of list.
 * @param {Function} mappingFn Mapping function for every element of created list.
 * @returns {Array}
 */
function buildIndexToValueList(listLength, mappingFn) {
  return (0, _array.arrayMap)(new Array(listLength), function (value, physicalIndex) {
    return mappingFn(value, physicalIndex);
  });
}
/**
 * Get indexes list by given condition.
 *
 * @param {Array} valueList List of values.
 * @param {Function} condition Condition for values to meet.
 * @returns {Array}
 */


function getIndexListByCondition(valueList, condition) {
  return (0, _array.arrayReduce)(valueList, function (indexList, value, physicalIndex) {
    if (condition(value, physicalIndex)) {
      return indexList.concat(physicalIndex);
    }

    return indexList;
  }, []);
}