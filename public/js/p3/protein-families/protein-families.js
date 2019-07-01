var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }());

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === 'object' || typeof call === 'function') ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, {
  constructor: {
    value: subClass, enumerable: false, writable: true, configurable: true
  }
}); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var HotTable = Handsontable.react.HotTable;
licenseKey = 'non-commercial-and-evaluation';

'use strict';

var PFContainer = (function (_React$Component) {
  _inherits(PFContainer, _React$Component);

  function PFContainer(props) {
    _classCallCheck(this, PFContainer);

    var _this = _possibleConstructorReturn(this, (PFContainer.__proto__ || Object.getPrototypeOf(PFContainer)).call(this, props));

    _this.data = [['', 'Ford', 'Volvo', 'Toyota', 'Honda'], ['2016', 10, 11, 12, 13], ['2017', 20, 11, 14, 13], ['2018', 30, 15, 12, 13]];
    return _this;
  }

  _createClass(PFContainer, [{
    key: 'render',
    value: function render() {

      return React.createElement(HotTable, {
        data: this.data,
        colHeaders: true,
        rowHeaders: true,
        width: '600',
        height: '300',
        licenseKey: licenseKey
      });
    }
  }]);

  return PFContainer;
}(React.Component));

