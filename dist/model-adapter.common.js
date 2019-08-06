'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var dotProp = _interopDefault(require('dot-prop'));

function _typeof(obj) {
  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    _typeof = function (obj) {
      return typeof obj;
    };
  } else {
    _typeof = function (obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
  }

  return _typeof(obj);
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

/**
 * 适配数据
 * 
 * @param {object} target 
 * @param {object} source 
 * @param {object} adapters
 * @return {object}
 */

function adapt(target, source, adapters) {
  for (var key in adapters) {
    var adapter = normalizeAdapter(adapters[key], key); // 通过 path 获取对象上的属性值

    var value = dotProp.get(source, adapter.path, adapter.defaultValue);

    if (typeof source !== 'undefined') {
      validate(value, adapter);
    } // 转换器转换数据


    if (adapter.transformer) {
      value = adapter.transformer(value, source);
    }

    target[key] = value;
  }

  return target;
}
/**
 * 还原数据
 * 
 * @param {object} source 
 * @param {object} adapters 
 * @return {object}
 */

function restore(source, adapters) {
  var target = {};

  for (var key in adapters) {
    var adapter = normalizeAdapter(adapters[key], key);
    var value = source[key];

    if (adapter.restorer) {
      value = adapter.restorer(value, source);
    }

    validate(value, adapter);
    dotProp.set(target, adapter.path, value);
  }

  return target;
}
/**
 * 规范化适配器
 * 
 * @param {object | string | function} adapter 
 * @param {string} key 
 * @return {object}
 */

function normalizeAdapter(adapter, key) {
  var path;
  var defaultValue;
  var validator;
  var transformer;
  var restorer;

  if (typeof adapter === 'string' || typeof adapter === 'function') {
    path = adapter;
  } else if (adapter && _typeof(adapter) === 'object') {
    path = adapter.path;
    defaultValue = adapter.defaultValue;
    validator = adapter.validator;
    transformer = adapter.transformer;
    restorer = adapter.restorer;
  }

  if (!path) {
    // 默认的 path 为属性名
    path = key;
  } else if (typeof path === 'function') {
    // TODO 传入 source, key?
    path = path();
  }

  if (typeof defaultValue === 'function') {
    defaultValue = defaultValue();
  }

  return {
    path: path,
    defaultValue: defaultValue,
    validator: validator,
    transformer: transformer,
    restorer: restorer
  };
}
/**
 * 验证数据(仅提示)
 * 
 * @param {*} value 
 * @param {object} adapter 
 */


function validate(value, adapter) {
  if (adapter.validator) {
    var valid = false;

    if (typeof adapter.validator === 'string') {
      // 数据类型
      valid = _typeof(value) === adapter.validator;
    } else if (adapter.validator instanceof RegExp) {
      // 正则检测
      valid = adapter.validator.test(value);
    } else if (typeof adapter.validator === 'function') {
      // 校验器
      try {
        valid = adapter.validator(value);
      } catch (error) {
        console.error('校验器执行异常', error);
      }
    }

    if (!valid) {
      console.warn('验证数据不通过', adapter.path, value, adapter.validator, adapter);
    }
  }
}

/**
 * 模型适配器
 */

var ModelAdapter = function ModelAdapter(adapters, source) {
  _classCallCheck(this, ModelAdapter);

  adapt(this, source, adapters);
  /**
   * 
   */

  this.$adapt = function (source) {
    adapt(this, source, adapters);
  };
  /**
   * 
   */


  this.$restore = function () {
    return restore(this, adapters);
  };
};

module.exports = ModelAdapter;
