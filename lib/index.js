System.register(['./attribute', './component', './service'], function (_export) {
  return {
    setters: [function (_attribute) {
      for (var _key in _attribute) {
        _export(_key, _attribute[_key]);
      }
    }, function (_component) {
      for (var _key2 in _component) {
        _export(_key2, _component[_key2]);
      }
    }, function (_service) {
      for (var _key3 in _service) {
        _export(_key3, _service[_key3]);
      }
    }],
    execute: function () {
      'use strict';
    }
  };
});